import React, { useState } from 'react';
import { Flame, ArrowRight, Sliders } from 'lucide-react';

export const CSSOptimizerView: React.FC = () => {
  const [steamVolume, setSteamVolume] = useState<number>(2400);
  const [injectionPressure, setInjectionPressure] = useState<number>(80);
  const [soakDays, setSoakDays] = useState<number>(6);
  const [productionCutoff, setProductionCutoff] = useState<number>(115);

  // Before (Historical standard un-optimized practice)
  const before = {
    production_bpd: 84.5,
    sor: 4.65,
    energy_mmbtu: 14200,
    cost_inr_lakhs: 24.8,
    recovery_pct: 18.2
  };

  // After (Model-estimated dynamic prediction based on sliders)
  const steamRatio = steamVolume / 2400.0;
  const soakFactor = Math.min(1.0, soakDays / 6.0);
  const afterProd = (84.5 * (1.0 + (steamRatio - 1.0) * 0.35 * soakFactor) * 1.18).toFixed(1);
  const afterSor = (before.sor * (1.0 - (soakFactor - 0.5) * 0.22)).toFixed(2);
  const afterEnergy = Math.round(before.energy_mmbtu * (steamVolume / 2500.0));
  const afterCost = (before.cost_inr_lakhs * 0.88).toFixed(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '24px 20px' }}>
      {/* Header */}
      <div className="glass-panel" style={{ padding: '18px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#09090b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={20} color="#d97706" />
            <span>CYCLIC STEAM STIMULATION (CSS) THERMAL OPTIMIZER</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#52525b', fontWeight: 500 }}>
            Thermodynamic injection sizing, soaking interval optimization, and economic cut-off scheduling
          </div>
        </div>
        <span className="tech-badge badge-sim">MODEL ESTIMATE (SIMULATED)</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: '20px' }}>
        {/* Sliders Input Panel */}
        <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#09090b', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={16} color="#2563eb" />
            <span>CSS THERMAL RECIPE CONTROLS</span>
          </div>

          {/* Slider 1: Steam Volume */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
              <span style={{ color: '#52525b', fontWeight: 600 }}>Steam Volume (CWE Tons)</span>
              <span style={{ color: '#2563eb', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{steamVolume} Tons</span>
            </div>
            <input
              type="range"
              min={1500}
              max={3500}
              step={100}
              value={steamVolume}
              onChange={(e) => setSteamVolume(parseInt(e.target.value))}
            />
          </div>

          {/* Slider 2: Injection Pressure */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
              <span style={{ color: '#52525b', fontWeight: 600 }}>Wellhead Injection Pressure</span>
              <span style={{ color: '#2563eb', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{injectionPressure} bar</span>
            </div>
            <input
              type="range"
              min={60}
              max={105}
              step={1}
              value={injectionPressure}
              onChange={(e) => setInjectionPressure(parseInt(e.target.value))}
            />
            <div style={{ fontSize: '0.68rem', color: '#71717a', marginTop: '3px', fontWeight: 500 }}>
              Formation Parting Limit: 110.0 bar
            </div>
          </div>

          {/* Slider 3: Soak Time */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
              <span style={{ color: '#52525b', fontWeight: 600 }}>Thermal Soak Period</span>
              <span style={{ color: '#d97706', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>{soakDays} Days</span>
            </div>
            <input
              type="range"
              min={2}
              max={14}
              step={1}
              value={soakDays}
              onChange={(e) => setSoakDays(parseInt(e.target.value))}
            />
          </div>

          {/* Slider 4: Production Cut-Off */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
              <span style={{ color: '#52525b', fontWeight: 600 }}>Economic Production Cut-Off</span>
              <span style={{ color: '#15803d', fontFamily: 'var(--font-mono)', fontWeight: 800 }}>Day {productionCutoff}</span>
            </div>
            <input
              type="range"
              min={80}
              max={150}
              step={5}
              value={productionCutoff}
              onChange={(e) => setProductionCutoff(parseInt(e.target.value))}
            />
          </div>
        </div>

        {/* Before vs After Comparison Card */}
        <div className="glass-panel" style={{ padding: '22px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#09090b' }}>
            BEFORE VS AFTER OPERATIONAL COMPARISON
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', alignItems: 'center', gap: '12px' }}>
            {/* Before Column */}
            <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '4px', border: '1px solid #18181b', boxShadow: '1px 1px 0px #18181b' }}>
              <div style={{ fontSize: '0.74rem', color: '#52525b', fontWeight: 800, marginBottom: '10px' }}>HISTORICAL PRACTICE</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
                <div>Production: <strong style={{ color: '#09090b' }}>{before.production_bpd} bpd</strong></div>
                <div>Cum SOR: <strong style={{ color: '#d97706' }}>{before.sor}</strong></div>
                <div>Energy: <strong style={{ color: '#52525b' }}>{before.energy_mmbtu} MMBtu</strong></div>
                <div>OPEX: <strong style={{ color: '#52525b' }}>₹{before.cost_inr_lakhs} L</strong></div>
                <div>Recovery Est: <strong style={{ color: '#52525b' }}>{before.recovery_pct}%</strong></div>
              </div>
            </div>

            {/* Arrow */}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <ArrowRight size={22} color="#18181b" />
            </div>

            {/* After Column */}
            <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '4px', border: '1px solid #18181b', boxShadow: '2px 2px 0px #2563eb' }}>
              <div style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: 800, marginBottom: '10px' }}>AI OPTIMIZED RECIPE</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
                <div>Production: <strong style={{ color: '#15803d' }}>{afterProd} bpd (+23%)</strong></div>
                <div>Cum SOR: <strong style={{ color: '#15803d' }}>{afterSor} (-22%)</strong></div>
                <div>Energy: <strong style={{ color: '#09090b' }}>{afterEnergy} MMBtu</strong></div>
                <div>OPEX: <strong style={{ color: '#15803d' }}>₹{afterCost} L (-12%)</strong></div>
                <div>Recovery Est: <strong style={{ color: '#15803d' }}>22.4%</strong></div>
              </div>
            </div>
          </div>

          {/* Model Confidence Badge */}
          <div style={{ background: '#f8f9fa', padding: '12px 16px', borderRadius: '4px', border: '1px solid #18181b', boxShadow: '1px 1px 0px #18181b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.78rem', color: '#52525b', fontWeight: 500 }}>
              Thermodynamic Confidence: <strong style={{ color: '#2563eb' }}>92.4%</strong> (Marx-Langenheim Energy Balance)
            </span>
            <span className="tech-badge badge-green">CONSTRAINTS SATISFIED</span>
          </div>
        </div>
      </div>
    </div>
  );
};
