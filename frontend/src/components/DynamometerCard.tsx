import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';
import { Activity, AlertTriangle, ShieldCheck, HelpCircle } from 'lucide-react';
import { DynoCardData } from '../types/petro';

interface DynoCardProps {
  dynoData: DynoCardData | null;
  onRefresh: () => void;
}

export const DynamometerCard: React.FC<DynoCardProps> = ({ dynoData }) => {
  if (!dynoData) {
    return <div style={{ padding: '40px', color: '#52525b', fontWeight: 600 }}>Loading dynamometer card...</div>;
  }

  const { card_points, stroke_length_m, spm, viscosity_cp, rod_floating_detected } = dynoData;
  const strokeIn = Math.round(stroke_length_m * 39.3701);

  // Compute maximum and minimum loads from points
  const maxLoad = Math.max(...card_points.map((p) => p.surface_load_lbs));
  const minLoad = Math.min(...card_points.map((p) => p.surface_load_lbs));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px 20px' }}>
      {/* Header Bar */}
      <div className="glass-panel" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#09090b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="#2563eb" />
            <span>REAL-TIME SUCKER ROD DYNAMOMETER CARD ANALYZER</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#52525b', fontWeight: 500 }}>
            Surface Polished Rod Load & Downhole Pump Barrel Load vs Polished Rod Position (API RP 11L)
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className={`tech-badge ${rod_floating_detected ? 'badge-red' : 'badge-green'}`} style={{ padding: '6px 12px' }}>
            {rod_floating_detected ? <AlertTriangle size={14} /> : <ShieldCheck size={14} />}
            <span>{rod_floating_detected ? 'ROD FLOATING / SLACK BRIDLE DETECTED' : 'CARD SIGNATURE NORMAL'}</span>
          </div>
        </div>
      </div>

      {/* Main Dynamometer Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '20px' }}>
        {/* Left: Load vs Position Dyno Card Chart */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#09090b' }}>Load vs Position Closed Cycle (1 Full Stroke)</span>
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.74rem', fontWeight: 700 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#09090b' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#18181b', border: '1px solid #18181b' }}></span> Surface Card (PPRL/MPRL)
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#2563eb' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb', border: '1px solid #18181b' }}></span> Downhole Plunger Card
              </span>
            </div>
          </div>

          <div style={{ width: '100%', height: '380px' }}>
            <ResponsiveContainer>
              <LineChart data={card_points}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis
                  dataKey="position_in"
                  stroke="#71717a"
                  type="number"
                  domain={[0, strokeIn]}
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Polished Rod Position (inches)', position: 'insideBottom', offset: -4, fill: '#71717a' }}
                />
                <YAxis
                  stroke="#71717a"
                  tick={{ fontSize: 11 }}
                  domain={[0, 24000]}
                  label={{ value: 'Load (lbf)', angle: -90, position: 'insideLeft', fill: '#71717a' }}
                />
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #18181b', borderRadius: '4px', boxShadow: '2px 2px 0px #18181b', fontSize: '0.78rem', color: '#09090b', fontWeight: 600 }} />
                
                {/* Structural limit lines */}
                <ReferenceLine y={22000} stroke="#dc2626" strokeDasharray="4 4" label={{ value: 'API Beam Limit (22k lbs)', fill: '#dc2626', fontSize: 10, position: 'top' }} />
                <ReferenceLine y={1200} stroke="#d97706" strokeDasharray="4 4" label={{ value: 'Rod Float Minimum Limit (1.2k lbs)', fill: '#d97706', fontSize: 10, position: 'bottom' }} />

                <Line
                  type="monotone"
                  dataKey="surface_load_lbs"
                  stroke="#18181b"
                  strokeWidth={2.2}
                  dot={{ r: 2, fill: '#18181b' }}
                  name="Surface Load (lbs)"
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="downhole_load_lbs"
                  stroke="#2563eb"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  name="Downhole Load (lbs)"
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Kinematics & Card Interpretation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Kinematics Card */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#09090b', marginBottom: '12px' }}>
              KINEMATIC & LOADING METRICS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ background: '#f8f9fa', border: '1px solid #18181b', boxShadow: '1px 1px 0px #18181b', padding: '10px 12px', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.7rem', color: '#52525b', fontWeight: 600 }}>Peak Surface Load</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#09090b', fontFamily: 'var(--font-mono)' }}>
                  {maxLoad} lbs
                </div>
              </div>
              <div style={{ background: '#f8f9fa', border: '1px solid #18181b', boxShadow: '1px 1px 0px #18181b', padding: '10px 12px', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.7rem', color: '#52525b', fontWeight: 600 }}>Minimum Surface Load</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: minLoad < 1200 ? '#dc2626' : '#d97706', fontFamily: 'var(--font-mono)' }}>
                  {minLoad} lbs
                </div>
              </div>
              <div style={{ background: '#f8f9fa', border: '1px solid #18181b', boxShadow: '1px 1px 0px #18181b', padding: '10px 12px', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.7rem', color: '#52525b', fontWeight: 600 }}>Stroke Length & SPM</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#09090b', fontFamily: 'var(--font-mono)' }}>
                  {stroke_length_m}m @ {spm} SPM
                </div>
              </div>
              <div style={{ background: '#f8f9fa', border: '1px solid #18181b', boxShadow: '1px 1px 0px #18181b', padding: '10px 12px', borderRadius: '4px' }}>
                <div style={{ fontSize: '0.7rem', color: '#52525b', fontWeight: 600 }}>Fluid Viscosity</div>
                <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#d97706', fontFamily: 'var(--font-mono)' }}>
                  {viscosity_cp} cP
                </div>
              </div>
            </div>
          </div>

          {/* Diagnostic Interpretation */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <HelpCircle size={16} color="#2563eb" />
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#09090b' }}>PHYSICAL CARD DIAGNOSTICS</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#3f3f46', lineHeight: '1.5', fontWeight: 500 }}>
              {rod_floating_detected ? (
                <div>
                  <p style={{ color: '#dc2626', fontWeight: 700, marginBottom: '6px' }}>
                    Warning: Rod Floating & Impact Pounding Signature Detected
                  </p>
                  <p>
                    The downstroke load has collapsed towards zero because upward Couette viscous shear force exceeds the downward rod weight. 
                    Slack bridle cables will violently re-engage at the turnaround, propagating destructive tensile shock waves down the steel string.
                  </p>
                </div>
              ) : (
                <div>
                  <p style={{ color: '#15803d', fontWeight: 700, marginBottom: '6px' }}>
                    Normal Harmonic Operation
                  </p>
                  <p>
                    Smooth load build-up on upstroke (traveling valve closure) and regular load release on downstroke. 
                    Net downstroke accelerating force is well above the minimum rod float threshold.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
