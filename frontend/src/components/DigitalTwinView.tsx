import React, { useState } from 'react';
import { Play, RotateCcw, Clock, Thermometer, Gauge, Layers } from 'lucide-react';
import { TelemetryFrame } from '../types/petro';
import { api } from '../services/api';

interface DigitalTwinProps {
  currentTelemetry: TelemetryFrame | null;
  selectedWell: string;
}

export const DigitalTwinView: React.FC<DigitalTwinProps> = ({ currentTelemetry, selectedWell }) => {
  const [scrubDay, setScrubDay] = useState<number>(currentTelemetry?.cycle_info.days_in_production || 68);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Derive dynamic state for the current scrubbed day
  const twinState = api.getTimeMachineState(selectedWell, scrubDay);

  const { thermal_state, fluid_state, srp_operating_state, wellbore_profile_summary } = twinState;

  // Thermal plume radius (scales with temperature: 47C is 0%, 200C is 100%)
  const plumeScale = Math.min(1.0, Math.max(0.15, (thermal_state.reservoir_temperature_c - 47.0) / 150.0));
  const isFloating = srp_operating_state.rod_floating_detected;

  // Handle play/pause time machine animation
  React.useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setScrubDay((prev) => {
          if (prev >= 150) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 2;
        });
      }, 150);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px 20px' }}>
      {/* Time Machine Control Bar */}
      <div className="glass-panel" style={{ padding: '18px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '4px',
              background: '#eff6ff',
              border: '1px solid #18181b',
              boxShadow: '1px 1px 0px #18181b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Clock size={18} color="#2563eb" />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#09090b' }}>DIGITAL TWIN TIME MACHINE</div>
              <div style={{ fontSize: '0.74rem', color: '#52525b', fontWeight: 500 }}>
                Scrub through the 180-day production lifecycle to simulate continuous reservoir thermal decay and mechanical stress
              </div>
            </div>
          </div>

          {/* Quick preset buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="neo-btn"
              style={{
                background: isPlaying ? '#dc2626' : '#18181b',
                color: '#ffffff',
                border: '1px solid #18181b',
                boxShadow: isPlaying ? '2px 2px 0px #18181b' : '2px 2px 0px #2563eb',
                fontSize: '0.78rem'
              }}
            >
              <Play size={12} fill="#ffffff" />
              <span>{isPlaying ? 'PAUSE ANIMATION' : 'PLAY LIFECYCLE'}</span>
            </button>
            <button
              onClick={() => { setScrubDay(5); setIsPlaying(false); }}
              className="neo-btn"
              style={{ padding: '6px 10px', fontSize: '0.75rem' }}
              title="Reset to Day 5"
            >
              <RotateCcw size={12} />
            </button>
            {[
              { label: 'Day 5 (Hot Flush)', day: 5 },
              { label: 'Day 30 (Stable)', day: 30 },
              { label: 'Day 68 (Current)', day: 68 },
              { label: 'Day 95 (Cooling)', day: 95 },
              { label: 'Day 120 (Cut-Off)', day: 120 }
            ].map((p) => {
              const isSelected = scrubDay === p.day;
              return (
                <button
                  key={p.day}
                  onClick={() => { setScrubDay(p.day); setIsPlaying(false); }}
                  style={{
                    background: isSelected ? '#18181b' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#3f3f46',
                    border: '1px solid #18181b',
                    boxShadow: isSelected ? '2px 2px 0px #2563eb' : '1px 1px 0px #18181b',
                    borderRadius: '4px',
                    padding: '5px 10px',
                    fontSize: '0.74rem',
                    fontWeight: isSelected ? 800 : 600,
                    cursor: 'pointer',
                    transition: 'all 0.1s ease'
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: '#71717a', fontWeight: 600 }}>Day 0</span>
          <input
            type="range"
            min={1}
            max={150}
            value={scrubDay}
            onChange={(e) => { setScrubDay(parseInt(e.target.value)); setIsPlaying(false); }}
          />
          <div style={{
            background: '#18181b',
            border: '1px solid #18181b',
            boxShadow: '2px 2px 0px #2563eb',
            padding: '5px 14px',
            borderRadius: '4px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.88rem',
            fontWeight: 800,
            color: '#ffffff',
            minWidth: '95px',
            textAlign: 'center'
          }}>
            DAY {scrubDay}
          </div>
        </div>
      </div>

      {/* Main Twin Schematic & State Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '20px' }}>
        {/* Left: Discretized 2D Cyber-Physical Well Schematic */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.92rem', fontWeight: 800, color: '#09090b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={16} color="#2563eb" />
              <span>DISCRETIZED WELLBORE & RESERVOIR HYDRAULICS (950m TVD)</span>
            </span>
            <span className={`tech-badge ${isFloating ? 'badge-red' : 'badge-green'}`}>
              {isFloating ? 'ROD FLOATING DETECTED' : 'MECHANICAL HARMONIC OK'}
            </span>
          </div>

          {/* Schematic Canvas */}
          <div style={{
            background: '#f8f9fa',
            borderRadius: '6px',
            border: '1px solid #18181b',
            boxShadow: 'inset 1px 1px 3px rgba(0,0,0,0.05)',
            padding: '20px',
            position: 'relative',
            height: '480px',
            display: 'flex',
            overflow: 'hidden'
          }}>
            {/* Depth Scale */}
            <div style={{ width: '68px', borderRight: '1px dashed #d4d4d8', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: '#52525b', fontWeight: 600 }}>
              <span>0m (Surf)</span>
              <span>200m</span>
              <span>400m</span>
              <span>600m</span>
              <span>800m</span>
              <span style={{ color: '#2563eb', fontWeight: 700 }}>900m (Pump)</span>
              <span style={{ color: '#d97706', fontWeight: 700 }}>950m (Res)</span>
            </div>

            {/* Well Diagram */}
            <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {/* Surface Beam Unit Icon */}
              <div style={{
                position: 'absolute',
                top: 0,
                width: '180px',
                height: '45px',
                border: '1px solid #18181b',
                background: '#ffffff',
                boxShadow: '1px 1px 0px #18181b',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#09090b',
                fontSize: '0.72rem',
                fontWeight: 700,
                fontFamily: 'var(--font-mono)'
              }}>
                [BEAM UNIT: {srp_operating_state.spm} SPM]
              </div>

              {/* Vertical Well Casing & Tubing */}
              <div style={{
                position: 'absolute',
                top: '50px',
                bottom: '80px',
                width: '32px',
                borderLeft: '2px solid #18181b',
                borderRight: '2px solid #18181b',
                background: '#e4e4e7',
                display: 'flex',
                justifyContent: 'center'
              }}>
                {/* Sucker Rod String inside tubing */}
                <div style={{
                  width: '5px',
                  height: '100%',
                  background: isFloating ? '#dc2626' : '#2563eb',
                  boxShadow: isFloating ? '0 0 6px rgba(220,38,38,0.5)' : 'none',
                  transition: 'background 0.2s ease'
                }}></div>
              </div>

              {/* Subsurface SRP Pump Plunger (at 900m depth) */}
              <div style={{
                position: 'absolute',
                bottom: '80px',
                width: '46px',
                height: '26px',
                background: '#18181b',
                border: '1px solid #18181b',
                boxShadow: '1px 1px 0px #2563eb',
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.62rem',
                fontWeight: 800,
                color: '#ffffff',
                fontFamily: 'var(--font-mono)'
              }}>
                PUMP
              </div>

              {/* Bottom Reservoir Thermal Plume Graphic */}
              <div style={{
                position: 'absolute',
                bottom: '10px',
                width: `${160 * plumeScale}px`,
                height: '60px',
                borderRadius: '50%',
                background: `radial-gradient(ellipse at center, rgba(217, 119, 6, ${0.7 * plumeScale}) 0%, rgba(220, 38, 38, ${0.4 * plumeScale}) 60%, rgba(0,0,0,0) 100%)`,
                border: '1px dashed #d97706',
                transition: 'all 0.3s ease'
              }}></div>

              {/* Reservoir Label */}
              <div style={{
                position: 'absolute',
                bottom: '15px',
                textAlign: 'center',
                color: '#09090b',
                background: '#ffffff',
                border: '1px solid #18181b',
                boxShadow: '1px 1px 0px #18181b',
                padding: '2px 8px',
                borderRadius: '3px',
                fontSize: '0.72rem',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700
              }}>
                JODHPUR SANDSTONE RESERVOIR ({thermal_state.reservoir_temperature_c}°C)
              </div>
            </div>

            {/* Depth Segments Data Overlay */}
            <div style={{ width: '160px', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', fontSize: '0.7rem', color: '#52525b' }}>
              {wellbore_profile_summary.map((seg, idx) => (
                <div key={idx} style={{ background: '#ffffff', padding: '4px 8px', borderRadius: '4px', border: '1px solid #18181b', boxShadow: '1px 1px 0px #18181b' }}>
                  <div style={{ color: '#09090b', fontWeight: 700 }}>Depth {seg.depth_m}m</div>
                  <div style={{ color: '#d97706', fontWeight: 600 }}>{seg.temperature_c}°C | {seg.viscosity_cp} cP</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Dynamic Physical State Indicators */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Dynamic Thermal Dissipation Card */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Thermometer size={18} color="#d97706" />
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#09090b' }}>THERMAL DECAY & VISCOSITY RESPONSE</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: '#f8f9fa', border: '1px solid #18181b', boxShadow: '1px 1px 0px #18181b', padding: '12px', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.72rem', color: '#52525b', fontWeight: 600 }}>Reservoir Temperature</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#d97706', fontFamily: 'var(--font-mono)' }}>
                  {thermal_state.reservoir_temperature_c} °C
                </div>
                <div style={{ fontSize: '0.68rem', color: '#71717a', marginTop: '2px', fontWeight: 500 }}>Native: 47.0°C | Peak: 192.0°C</div>
              </div>
              <div style={{ background: '#f8f9fa', border: '1px solid #18181b', boxShadow: '1px 1px 0px #18181b', padding: '12px', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.72rem', color: '#52525b', fontWeight: 600 }}>Fluid Viscosity (μ)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: fluid_state.estimated_viscosity_cp > 2200 ? '#dc2626' : '#d97706', fontFamily: 'var(--font-mono)' }}>
                  {fluid_state.estimated_viscosity_cp} cP
                </div>
                <div style={{ fontSize: '0.68rem', color: '#71717a', marginTop: '2px', fontWeight: 500 }}>Mobility: {fluid_state.darcy_mobility_md_cp} mD/cP</div>
              </div>
            </div>
          </div>

          {/* Dynamic SRP Kinematics & Rod Float Risk */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <Gauge size={18} color="#2563eb" />
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#09090b' }}>SRP DYNAMICS & COUETTE DRAG</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: '#f8f9fa', border: '1px solid #18181b', boxShadow: '1px 1px 0px #18181b', padding: '12px', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.72rem', color: '#52525b', fontWeight: 600 }}>Peak Rod Load (PPRL)</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#09090b', fontFamily: 'var(--font-mono)' }}>
                  {srp_operating_state.pprl_lbs} lbs
                </div>
                <div style={{ fontSize: '0.68rem', color: '#71717a', marginTop: '2px', fontWeight: 500 }}>MPRL: {srp_operating_state.mprl_lbs} lbs</div>
              </div>
              <div style={{ background: '#f8f9fa', border: '1px solid #18181b', boxShadow: '1px 1px 0px #18181b', padding: '12px', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.72rem', color: '#52525b', fontWeight: 600 }}>Rod Floating Probability</div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: isFloating ? '#dc2626' : '#15803d', fontFamily: 'var(--font-mono)' }}>
                  {Math.round(srp_operating_state.rod_floating_risk * 100)} %
                </div>
                <div style={{ fontSize: '0.68rem', color: isFloating ? '#dc2626' : '#15803d', marginTop: '2px', fontWeight: 600 }}>
                  {isFloating ? 'CRITICAL SHOCK RISK' : 'POSITIVE SINKING MARGIN'}
                </div>
              </div>
            </div>

            {/* Explanatory text */}
            <div style={{ marginTop: '14px', fontSize: '0.76rem', color: '#3f3f46', lineHeight: '1.45', background: '#f8f9fa', border: '1px solid #18181b', padding: '10px 12px', borderRadius: '4px', fontWeight: 500 }}>
              <strong style={{ color: '#09090b' }}>Digital Twin Physics Insight:</strong> At Day {scrubDay}, the formation thermal dissipation has dropped bottomhole temperature to {thermal_state.reservoir_temperature_c}°C. 
              {isFloating 
                ? ' Viscous drag has exceeded rod gravitational sinking capability. The rod clamp is lifting off the carrier bar on downstroke, causing destructive impact pounding.'
                : ' Sinker bars maintain adequate gravitational downstroke sinking velocity. Operating in safe fatigue envelope.'}
            </div>
          </div>

          {/* Quick Action */}
          <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#09090b' }}>Optimization Recommendation</div>
              <div style={{ fontSize: '0.72rem', color: '#52525b', fontWeight: 500 }}>Joint CSS steam volume + SRP VFD setpoints</div>
            </div>
            <button
              className="neo-btn neo-btn-accent"
              style={{ fontSize: '0.78rem' }}
            >
              RUN JOINT OPTIMIZER
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
