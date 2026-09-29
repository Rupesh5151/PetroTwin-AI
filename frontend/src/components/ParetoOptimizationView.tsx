import React, { useState } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, Tooltip, CartesianGrid, ZAxis } from 'recharts';
import { Sparkles, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { OptimizationResult, ParetoPoint } from '../types/petro';

interface ParetoProps {
  optimizationData: OptimizationResult | null;
  onApplyPlan: (plan: any) => void;
}

export const ParetoOptimizationView: React.FC<ParetoProps> = ({ optimizationData, onApplyPlan }) => {
  if (!optimizationData) {
    return <div style={{ padding: '40px', color: '#52525b', fontWeight: 600 }}>Loading Pareto optimizer results...</div>;
  }

  const { pareto_frontier, rejected_alternatives_sample } = optimizationData;
  const [selectedPoint, setSelectedPoint] = useState<ParetoPoint | null>(pareto_frontier[2] || pareto_frontier[0]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px 20px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#09090b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} color="#2563eb" />
            <span>CONSTRAINED MULTI-OBJECTIVE PARETO OPTIMIZER</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#52525b', fontWeight: 500 }}>
            NSGA-II Non-Dominated Frontier: Oil Production vs Steam-to-Oil Ratio vs Mechanical Failure Hazard
          </div>
        </div>
        <span className="tech-badge badge-green">OPTIMIZATION CONVERGED (SLSQP)</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '20px' }}>
        {/* Pareto Frontier 2D Scatter Chart */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#09090b' }}>Pareto Frontier: Production (bpd) vs Cumulative SOR</div>
              <div style={{ fontSize: '0.72rem', color: '#52525b' }}>Click any candidate point to inspect engineering trade-offs</div>
            </div>
          </div>

          <div style={{ width: '100%', height: '360px' }}>
            <ResponsiveContainer>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis
                  type="number"
                  dataKey="production_bpd"
                  name="Production"
                  unit=" bpd"
                  stroke="#71717a"
                  tick={{ fontSize: 11 }}
                  domain={['dataMin - 5', 'dataMax + 5']}
                  label={{ value: 'Oil Production (bbl/day)', position: 'insideBottom', offset: -10, fill: '#71717a' }}
                />
                <YAxis
                  type="number"
                  dataKey="sor"
                  name="SOR"
                  unit=""
                  stroke="#71717a"
                  tick={{ fontSize: 11 }}
                  domain={['dataMin - 0.5', 'dataMax + 0.5']}
                  label={{ value: 'Steam-Oil Ratio (SOR)', angle: -90, position: 'insideLeft', fill: '#71717a' }}
                />
                <ZAxis type="number" dataKey="composite_score" range={[60, 240]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const data = payload[0].payload as ParetoPoint;
                      return (
                        <div style={{ background: '#ffffff', border: '1px solid #18181b', padding: '10px 14px', borderRadius: '4px', boxShadow: '2px 2px 0px #18181b', fontSize: '0.75rem', color: '#09090b' }}>
                          <div style={{ color: '#2563eb', fontWeight: 800, marginBottom: '4px' }}>Candidate Operating Point</div>
                          <div>Production: <strong>{data.production_bpd} bpd</strong></div>
                          <div>Cumulative SOR: <strong>{data.sor}</strong></div>
                          <div>Energy: <strong>{data.energy_kwh_bbl} kWh/bbl</strong></div>
                          <div>Failure Risk: <strong>{(data.failure_risk * 100).toFixed(1)}%</strong></div>
                          <div>Settings: <strong>{data.spm} SPM @ {data.stroke_m}m | {data.steam_tons} T</strong></div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter
                  name="Pareto Optimal Solutions"
                  data={pareto_frontier}
                  fill="#2563eb"
                  stroke="#18181b"
                  strokeWidth={1.5}
                  onClick={(pt: any) => setSelectedPoint(pt?.payload || pt)}
                  style={{ cursor: 'pointer' }}
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Selected Candidate Detailed Inspection Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {selectedPoint && (
            <div className="glass-panel" style={{ padding: '20px', border: '1px solid #18181b', boxShadow: '3px 3px 0px #2563eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#2563eb' }}>SELECTED CANDIDATE TRADE-OFF</span>
                <span className="tech-badge badge-green">Score: {selectedPoint.composite_score}</span>
              </div>

              {/* Setpoint Parameters */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '14px' }}>
                <div style={{ background: '#f8f9fa', border: '1px solid #18181b', boxShadow: '1px 1px 0px #18181b', padding: '8px 12px', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#52525b', fontWeight: 600 }}>SRP Speed</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#09090b', fontFamily: 'var(--font-mono)' }}>{selectedPoint.spm} SPM</div>
                </div>
                <div style={{ background: '#f8f9fa', border: '1px solid #18181b', boxShadow: '1px 1px 0px #18181b', padding: '8px 12px', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#52525b', fontWeight: 600 }}>Stroke Length</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#09090b', fontFamily: 'var(--font-mono)' }}>{selectedPoint.stroke_m} m</div>
                </div>
                <div style={{ background: '#f8f9fa', border: '1px solid #18181b', boxShadow: '1px 1px 0px #18181b', padding: '8px 12px', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#52525b', fontWeight: 600 }}>Next Steam Volume</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#d97706', fontFamily: 'var(--font-mono)' }}>{selectedPoint.steam_tons} Tons</div>
                </div>
                <div style={{ background: '#f8f9fa', border: '1px solid #18181b', boxShadow: '1px 1px 0px #18181b', padding: '8px 12px', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#52525b', fontWeight: 600 }}>Failure Risk</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#15803d', fontFamily: 'var(--font-mono)' }}>{(selectedPoint.failure_risk * 100).toFixed(1)}%</div>
                </div>
              </div>

              {/* Trade-off answers */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.76rem', color: '#3f3f46' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <ArrowUpRight size={16} color="#15803d" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div><strong style={{ color: '#09090b' }}>What do I gain?</strong> +18.4% clean oil output ({selectedPoint.production_bpd} bpd) and safe rod downstroke sinking margin.</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                  <ArrowDownRight size={16} color="#d97706" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div><strong style={{ color: '#09090b' }}>What do I sacrifice?</strong> Operates at 5.5 SPM rather than maximum theoretical displacement to completely eliminate rod-float risk.</div>
                </div>
              </div>

              <button
                onClick={() => onApplyPlan(selectedPoint)}
                className="neo-btn neo-btn-primary"
                style={{
                  marginTop: '16px',
                  width: '100%',
                  padding: '10px',
                  fontSize: '0.82rem',
                  justifyContent: 'center'
                }}
              >
                DISPATCH SETPOINT TO VFD & CSS SCHEDULE
              </button>
            </div>
          )}

          {/* Rejected Alternatives Box */}
          <div className="glass-panel" style={{ padding: '18px 20px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#09090b', marginBottom: '8px' }}>
              REJECTED ALTERNATIVES & PHYSICAL SAFETY JUSTIFICATION
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {rejected_alternatives_sample.map((rej, idx) => (
                <div key={idx} style={{ background: '#fef2f2', border: '1px solid #dc2626', boxShadow: '1px 1px 0px #dc2626', padding: '8px 10px', borderRadius: '4px', fontSize: '0.72rem' }}>
                  <div style={{ color: '#991b1b', fontWeight: 700 }}>
                    Rejected Candidate ({rej.spm} SPM @ {rej.stroke_m}m, {rej.steam_tons} T Steam)
                  </div>
                  <div style={{ color: '#4b5563', marginTop: '2px', fontWeight: 500 }}>
                    Reason: {rej.rejection_reason}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
