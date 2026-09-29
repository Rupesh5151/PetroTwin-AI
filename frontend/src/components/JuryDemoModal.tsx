import React, { useState, useEffect } from 'react';
import { X, Play, Pause, ChevronRight, CheckCircle2, Award, Zap, ShieldAlert, Sparkles } from 'lucide-react';

interface JuryDemoProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: string) => void;
}

export const JuryDemoModal: React.FC<JuryDemoProps> = ({ isOpen, onClose, onNavigateTab }) => {
  const [currentMinute, setCurrentMinute] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  const stages = [
    {
      minute: 1,
      tab: 'dashboard',
      title: 'Minute 1: The Baghewala Heavy Oil Problem',
      summary: 'Cold reservoir (47°C) + thick crude (4,200 cP) = Zero natural flow. Oil India relies on Cyclic Steam Stimulation (CSS) and Sucker Rod Pumping (SRP). But treating them separately causes severe operational failures.',
      keyTakeaway: 'The platform establishes baseline thermodynamic and fluid properties for the Jodhpur Sandstone.'
    },
    {
      minute: 2,
      tab: 'live-ops',
      title: 'Minute 2: Live Telemetry & Dynamometer Card',
      summary: 'High-frequency telemetry stream correlates bottomhole temperature, pressure, polished rod load, and downstroke pump plunger displacement in real-time.',
      keyTakeaway: 'Surface and downhole dyno cards detect fluid friction hysteresis before structural fatigue sets in.'
    },
    {
      minute: 3,
      tab: 'digital-twin',
      title: 'Minute 3: Reservoir Cooling & Viscosity Surge',
      summary: 'Using the 180-Day Time Machine, observe the thermal dissipation plume cooling from 192°C peak down to 55°C. Viscosity exponentially rebounds from 18 cP back to 3,400 cP.',
      keyTakeaway: 'The Digital Twin predicts downstroke Couette drag quadrupling along the 900m wellbore.'
    },
    {
      minute: 4,
      tab: 'failures',
      title: 'Minute 4: Failure Hazard Elevation (Rod Floating)',
      summary: 'As viscosity rises at fixed SPM (6.8), the downward horsehead outruns the rod sinking terminal velocity. Carrier bar separates from clamp, inducing violent impact loading shock waves (5,000 m/s).',
      keyTakeaway: 'Multi-hazard engine flags 78% rod float threat with SHAP feature attribution.'
    },
    {
      minute: 5,
      tab: 'pareto',
      title: 'Minute 5: Joint CSS + SRP Pareto Optimization',
      summary: 'The constrained Pareto optimizer searches the multi-dimensional space, prescribing SPM reduction to 5.5 (eliminates rod float) while optimizing the next 2,400 T steam cycle.',
      keyTakeaway: 'Delivers +18.4% Net Oil, -22% SOR, Zero Rod-Float Risk, backed by full audit traceability.'
    }
  ];

  useEffect(() => {
    let timer: any;
    if (isPlaying && isOpen) {
      timer = setInterval(() => {
        setCurrentMinute((prev) => {
          if (prev >= 5) {
            setIsPlaying(false);
            return 5;
          }
          const next = prev + 1;
          onNavigateTab(stages[next - 1].tab);
          return next;
        });
      }, 10000); // 10 seconds per stage in demo fast-forward mode
    }
    return () => clearInterval(timer);
  }, [isPlaying, isOpen]);

  const activeStage = stages[currentMinute - 1];

  const handleSelectStage = (min: number) => {
    setCurrentMinute(min);
    onNavigateTab(stages[min - 1].tab);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      zIndex: 200,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        border: '1px solid var(--border)',
        width: '740px',
        maxWidth: '100%',
        boxShadow: '6px 6px 0px var(--shadow-color)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8f9fa'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Award size={20} color="var(--primary)" />
            <span style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '0.02em' }}>
              PETRO-TWIN ENTERPRISE 5-MINUTE SYSTEM WALKTHROUGH
            </span>
          </div>
          <button onClick={onClose} style={{ background: '#ffffff', border: '1px solid var(--border)', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} color="var(--text-main)" />
          </button>
        </div>

        {/* Step Progress Pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', padding: '16px 24px', gap: '8px', borderBottom: '1px solid var(--border)', background: '#ffffff' }}>
          {stages.map((s) => (
            <button
              key={s.minute}
              onClick={() => handleSelectStage(s.minute)}
              style={{
                background: currentMinute === s.minute ? 'var(--text-main)' : '#f4f5f7',
                border: '1px solid var(--border)',
                boxShadow: currentMinute === s.minute ? '2px 2px 0px var(--shadow-color)' : 'none',
                padding: '10px',
                color: currentMinute === s.minute ? '#ffffff' : 'var(--text-muted)',
                fontSize: '0.74rem',
                fontWeight: 800,
                cursor: 'pointer',
                textAlign: 'center',
                textTransform: 'uppercase'
              }}
            >
              Min {s.minute}
            </button>
          ))}
        </div>

        {/* Active Stage Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px', background: '#ffffff' }}>
          <div style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-main)' }}>
            {activeStage.title}
          </div>
          <div style={{ fontSize: '0.86rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            {activeStage.summary}
          </div>
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #16a34a',
            boxShadow: '2px 2px 0px var(--shadow-color)',
            padding: '12px 16px',
            fontSize: '0.80rem',
            color: '#15803d',
            lineHeight: '1.5'
          }}>
            <strong style={{ fontWeight: 800 }}>Key Technical Defense: </strong> {activeStage.keyTakeaway}
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: '#f8f9fa'
        }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              background: '#ffffff',
              color: 'var(--text-main)',
              border: '1px solid var(--border)',
              boxShadow: '2px 2px 0px var(--shadow-color)',
              padding: '8px 16px',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            <span>{isPlaying ? 'Pause Auto-Advance' : 'Resume Auto-Advance'}</span>
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                onNavigateTab(activeStage.tab);
                onClose();
              }}
              style={{
                background: 'var(--primary)',
                color: '#ffffff',
                border: '1px solid var(--border)',
                boxShadow: '2px 2px 0px var(--shadow-color)',
                padding: '8px 20px',
                fontSize: '0.82rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>INSPECT THIS SCREEN IN DEPTH</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
