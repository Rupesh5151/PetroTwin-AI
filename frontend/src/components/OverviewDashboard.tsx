import React from 'react';
import {
  Thermometer, Droplets, Zap, AlertTriangle, Flame, ArrowUpRight, ArrowDownRight, Activity
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TelemetryFrame } from '../types/petro';

interface DashboardProps {
  telemetry: TelemetryFrame | null;
  history: any[];
  onNavigateTab: (tab: string) => void;
}

export const OverviewDashboard: React.FC<DashboardProps> = ({ telemetry, history, onNavigateTab }) => {
  if (!telemetry) {
    return <div style={{ padding: '40px', color: '#52525b', fontWeight: 600 }}>Loading telemetry stream...</div>;
  }

  const { thermal_state, fluid_state, production_state, srp_operating_state, cycle_info, pressure_state } = telemetry;
  const isRodFloating = srp_operating_state.rod_floating_detected;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px 20px' }}>
      {/* Top Banner Alert (If Rod Floating Threat Active) */}
      {isRodFloating && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #dc2626',
          borderRadius: '6px',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '2px 2px 0px #dc2626'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '4px',
              background: '#fee2e2',
              border: '1px solid #dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AlertTriangle color="#dc2626" size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#991b1b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>CRITICAL MECHANICAL THREAT: ROD FLOATING DETECTED</span>
                <span className="tech-badge badge-red">URGENT</span>
              </div>
              <div style={{ fontSize: '0.8rem', color: '#4b5563', fontWeight: 500 }}>
                Viscosity ({fluid_state.estimated_viscosity_cp} cP) Couette drag exceeds rod sinking capacity at {srp_operating_state.spm} SPM. Slack bridle cable is creating impact loading shock.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('srp-optimizer')}
            className="neo-btn"
            style={{
              background: '#dc2626',
              color: '#ffffff',
              border: '1px solid #18181b',
              boxShadow: '2px 2px 0px #18181b',
              fontSize: '0.8rem'
            }}
          >
            RESOLVE IN SRP OPTIMIZER
          </button>
        </div>
      )}

      {/* Main KPI Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        {/* KPI 1: Production */}
        <div className="glass-panel" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#52525b', textTransform: 'uppercase', fontWeight: 700 }}>Oil Production</span>
            <Droplets size={18} color="#2563eb" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span className="metric-number" style={{ fontSize: '1.9rem', color: '#09090b' }}>
              {production_state.oil_rate_bpd}
            </span>
            <span style={{ fontSize: '0.82rem', color: '#71717a', fontWeight: 600 }}>bbl/day</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.74rem', color: '#15803d', fontWeight: 600 }}>
            <ArrowUpRight size={14} />
            <span>Water: {production_state.water_rate_bpd} bpd | Cum: {production_state.cumulative_oil_bbl} bbl</span>
          </div>
        </div>

        {/* KPI 2: Reservoir Temperature */}
        <div className="glass-panel" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#52525b', textTransform: 'uppercase', fontWeight: 700 }}>Reservoir Temp (T_res)</span>
            <Thermometer size={18} color="#d97706" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span className="metric-number" style={{ fontSize: '1.9rem', color: '#d97706' }}>
              {thermal_state.reservoir_temperature_c}
            </span>
            <span style={{ fontSize: '0.82rem', color: '#71717a', fontWeight: 600 }}>°C</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px', fontSize: '0.74rem', color: '#71717a', fontWeight: 600 }}>
            <ArrowDownRight size={14} color="#dc2626" />
            <span>Cooling from {thermal_state.peak_cycle_temperature_c}°C peak (Day {cycle_info.days_in_production})</span>
          </div>
        </div>

        {/* KPI 3: Fluid Viscosity */}
        <div className="glass-panel" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#52525b', textTransform: 'uppercase', fontWeight: 700 }}>Estimated Viscosity</span>
            <Flame size={18} color={fluid_state.estimated_viscosity_cp > 2000 ? '#dc2626' : '#d97706'} />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span className="metric-number" style={{ fontSize: '1.9rem', color: fluid_state.estimated_viscosity_cp > 2000 ? '#dc2626' : '#09090b' }}>
              {fluid_state.estimated_viscosity_cp}
            </span>
            <span style={{ fontSize: '0.82rem', color: '#71717a', fontWeight: 600 }}>cP</span>
          </div>
          <div style={{ marginTop: '6px', fontSize: '0.74rem', color: '#52525b', fontWeight: 500 }}>
            Mobility: {fluid_state.darcy_mobility_md_cp} mD/cP (Target: &gt; 0.5)
          </div>
        </div>

        {/* KPI 4: Polished Rod Loads */}
        <div className="glass-panel" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#52525b', textTransform: 'uppercase', fontWeight: 700 }}>Peak Rod Load (PPRL)</span>
            <Activity size={18} color="#2563eb" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span className="metric-number" style={{ fontSize: '1.9rem', color: '#09090b' }}>
              {srp_operating_state.pprl_lbs}
            </span>
            <span style={{ fontSize: '0.82rem', color: '#71717a', fontWeight: 600 }}>lbs</span>
          </div>
          <div style={{ marginTop: '6px', fontSize: '0.74rem', color: '#52525b', fontWeight: 500 }}>
            MPRL: {srp_operating_state.mprl_lbs} lbs | Rating: 22,000 lbs
          </div>
        </div>

        {/* KPI 5: Cumulative SOR & Energy */}
        <div className="glass-panel" style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.78rem', color: '#52525b', textTransform: 'uppercase', fontWeight: 700 }}>Steam-Oil Ratio (SOR)</span>
            <Zap size={18} color="#d97706" />
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <span className="metric-number" style={{ fontSize: '1.9rem', color: '#d97706' }}>
              {cycle_info.sor_cumulative}
            </span>
            <span style={{ fontSize: '0.82rem', color: '#71717a', fontWeight: 600 }}>m³/m³</span>
          </div>
          <div style={{ marginTop: '6px', fontSize: '0.74rem', color: '#15803d', fontWeight: 600 }}>
            Power: {srp_operating_state.kwh_per_barrel} kWh/bbl ({srp_operating_state.motor_power_kw} kW)
          </div>
        </div>
      </div>

      {/* 5 Health Cards Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px'
      }}>
        {/* Reservoir Health */}
        <div className="glass-panel" style={{ padding: '14px 18px', borderLeft: '3px solid #2563eb' }}>
          <div style={{ fontSize: '0.74rem', color: '#52525b', fontWeight: 700 }}>RESERVOIR HEALTH</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#09090b' }}>Formation Stable</span>
            <span className="tech-badge badge-green">94%</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#71717a', marginTop: '4px', fontWeight: 500 }}>
            Pressure: {pressure_state.bottomhole_pressure_bar} bar (Native 55)
          </div>
        </div>

        {/* Pump Health */}
        <div className="glass-panel" style={{ padding: '14px 18px', borderLeft: '3px solid #16a34a' }}>
          <div style={{ fontSize: '0.74rem', color: '#52525b', fontWeight: 700 }}>PUMP HEALTH</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#09090b' }}>Volumetric Eff</span>
            <span className="tech-badge badge-cyan">{production_state.pump_volumetric_efficiency_pct}%</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#71717a', marginTop: '4px', fontWeight: 500 }}>
            Seated at 900m depth • Plunger 2.25"
          </div>
        </div>

        {/* Rod Health */}
        <div className="glass-panel" style={{ padding: '14px 18px', borderLeft: `3px solid ${isRodFloating ? '#dc2626' : '#d97706'}` }}>
          <div style={{ fontSize: '0.74rem', color: '#52525b', fontWeight: 700 }}>ROD STRING HEALTH</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: isRodFloating ? '#dc2626' : '#09090b' }}>
              {isRodFloating ? 'Floats / Shock' : 'Goodman Normal'}
            </span>
            <span className={`tech-badge ${isRodFloating ? 'badge-red' : 'badge-amber'}`}>
              Risk: {Math.round(srp_operating_state.rod_floating_risk * 100)}%
            </span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#71717a', marginTop: '4px', fontWeight: 500 }}>
            API Grade D Steel • Sinker Bar OK
          </div>
        </div>

        {/* Thermal State */}
        <div className="glass-panel" style={{ padding: '14px 18px', borderLeft: '3px solid #d97706' }}>
          <div style={{ fontSize: '0.74rem', color: '#52525b', fontWeight: 700 }}>THERMAL STATE</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#09090b' }}>Cooling Phase</span>
            <span className="tech-badge badge-sim">Cycle {cycle_info.cycle_number}</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#71717a', marginTop: '4px', fontWeight: 500 }}>
            Days in Cycle: {cycle_info.days_in_production} of ~120
          </div>
        </div>

        {/* Data Quality */}
        <div className="glass-panel" style={{ padding: '14px 18px', borderLeft: '3px solid #18181b' }}>
          <div style={{ fontSize: '0.74rem', color: '#52525b', fontWeight: 700 }}>DATA QUALITY</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 700, color: '#09090b' }}>Signal Integrity</span>
            <span className="tech-badge badge-green">GOOD (100%)</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#71717a', marginTop: '4px', fontWeight: 500 }}>
            Monotonic • Range Validated
          </div>
        </div>
      </div>

      {/* Real-Time Historical Telemetry Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '20px' }}>
        {/* Chart 1: Production & Thermal Decay Trend */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#09090b' }}>90-Day Production & Thermal Dissipation Trend</div>
              <div style={{ fontSize: '0.75rem', color: '#52525b' }}>Correlated CSS thermal cooling vs heavy oil inflow decay</div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#09090b', fontWeight: 700 }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#18181b', border: '1px solid #18181b' }}></span> Oil Rate (bpd)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#d97706', fontWeight: 700 }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#d97706', border: '1px solid #18181b' }}></span> Temp (°C)
              </span>
            </div>
          </div>
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer>
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorOilLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02}/>
                  </linearGradient>
                  <linearGradient id="colorTempLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0.02}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="day" stroke="#71717a" tick={{ fontSize: 11 }} label={{ value: 'Cycle Day', position: 'insideBottomRight', offset: -4, fill: '#71717a' }} />
                <YAxis yAxisId="left" stroke="#09090b" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" stroke="#d97706" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #18181b', borderRadius: '4px', boxShadow: '2px 2px 0px #18181b', fontSize: '0.78rem', color: '#09090b', fontWeight: 600 }} />
                <Area yAxisId="left" type="monotone" dataKey="oil_rate_bpd" stroke="#18181b" fillOpacity={1} fill="url(#colorOilLight)" strokeWidth={2} name="Oil (bpd)" />
                <Area yAxisId="right" type="monotone" dataKey="reservoir_temperature_c" stroke="#d97706" fillOpacity={1} fill="url(#colorTempLight)" strokeWidth={2} name="Temp (°C)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Polished Rod Load & Rod Floating Risk Build-Up */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#09090b' }}>Polished Rod Load vs Viscosity Drag</div>
              <div style={{ fontSize: '0.75rem', color: '#52525b' }}>Downstroke MPRL drops as fluid viscosity triggers rod floating</div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#2563eb', fontWeight: 700 }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#2563eb', border: '1px solid #18181b' }}></span> PPRL (lbs)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.75rem', color: '#dc2626', fontWeight: 700 }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#dc2626', border: '1px solid #18181b' }}></span> MPRL (lbs)
              </span>
            </div>
          </div>
          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer>
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorPPRLLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="day" stroke="#71717a" tick={{ fontSize: 11 }} />
                <YAxis stroke="#71717a" tick={{ fontSize: 11 }} domain={[0, 20000]} />
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #18181b', borderRadius: '4px', boxShadow: '2px 2px 0px #18181b', fontSize: '0.78rem', color: '#09090b', fontWeight: 600 }} />
                <Area type="monotone" dataKey="pprl_lbs" stroke="#2563eb" fill="url(#colorPPRLLight)" strokeWidth={2} name="PPRL (lbs)" />
                <Area type="monotone" dataKey="mprl_lbs" stroke="#dc2626" fill="none" strokeWidth={2} name="MPRL (lbs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
