import React from 'react';
import { Activity, Cpu, Sparkles, Play, Database } from 'lucide-react';
import { WellId } from '../types/petro';

interface NavbarProps {
  selectedWell: WellId;
  onSelectWell: (id: WellId) => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenJuryDemo: () => void;
  onOpenCopilot: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedWell,
  onSelectWell,
  activeTab,
  onSelectTab,
  onOpenJuryDemo,
  onOpenCopilot
}) => {
  const tabs = [
    { id: 'dashboard', label: 'Overview' },
    { id: 'digital-twin', label: 'Digital Twin' },
    { id: 'live-ops', label: 'Live Operations' },
    { id: 'css-optimizer', label: 'CSS Optimizer' },
    { id: 'srp-optimizer', label: 'SRP Optimizer' },
    { id: 'failures', label: 'Failure Intelligence' },
    { id: 'scenario-lab', label: 'Scenario Lab' },
    { id: 'pareto', label: 'Pareto Optimization' }
  ];

  return (
    <header style={{
      background: '#ffffff',
      borderBottom: '1px solid #18181b',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0 20px',
      boxShadow: '0 2px 0px rgba(0,0,0,0.04)'
    }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '62px',
        borderBottom: '1px solid #e4e4e7'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '6px',
            background: '#18181b',
            border: '1px solid #18181b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '2px 2px 0px #2563eb'
          }}>
            <Cpu size={20} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.01em', color: '#09090b' }}>
                PETRO-TWIN <span style={{ color: '#2563eb' }}>AI</span>
              </span>
              <span className="tech-badge badge-cyan" style={{ fontSize: '0.65rem' }}>OIL INDIA LTD</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#52525b', fontWeight: 500 }}>
              Oil India Limited • Baghewala Field Jodhpur Sandstone Digital Twin
            </div>
          </div>
        </div>

        {/* Data Honesty Watermark Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="tech-badge badge-sim" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>
            <Database size={12} />
            <span>DATA MODE: SIMULATION</span>
          </div>

          {/* Live Status */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ffffff',
            padding: '5px 12px',
            borderRadius: '6px',
            border: '1px solid #18181b',
            boxShadow: '1px 1px 0px #18181b'
          }}>
            <span className="live-indicator"></span>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: '#15803d', fontWeight: 700 }}>LIVE STREAM</span>
          </div>

          {/* Well Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.75rem', color: '#52525b', fontWeight: 700 }}>ACTIVE WELL:</span>
            <select
              value={selectedWell}
              onChange={(e) => onSelectWell(e.target.value as WellId)}
              style={{
                background: '#ffffff',
                color: '#09090b',
                border: '1px solid #18181b',
                boxShadow: '2px 2px 0px #18181b',
                padding: '6px 12px',
                borderRadius: '6px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.8rem',
                fontWeight: 700,
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="BW-DEMO-001">BW-DEMO-001 (Late Cycle Cooling)</option>
              <option value="BW-DEMO-002">BW-DEMO-002 (Peak Thermal Flush)</option>
              <option value="BW-DEMO-003">BW-DEMO-003 (Critical Rod Float Alert)</option>
            </select>
          </div>

          {/* System Walkthrough Action */}
          <button
            onClick={onOpenJuryDemo}
            className="neo-btn neo-btn-primary"
            style={{ fontSize: '0.78rem' }}
          >
            <Play size={14} fill="#ffffff" />
            <span>5-MIN SYSTEM TOUR</span>
          </button>

          {/* AI Copilot Drawer Trigger */}
          <button
            onClick={onOpenCopilot}
            className="neo-btn"
            style={{
              fontSize: '0.78rem',
              color: '#2563eb',
              borderColor: '#18181b'
            }}
          >
            <Sparkles size={14} color="#2563eb" />
            <span>AI COPILOT</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Bar */}
      <nav style={{ display: 'flex', gap: '6px', overflowX: 'auto', padding: '8px 0' }}>
        {tabs.map((t) => {
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onSelectTab(t.id)}
              style={{
                background: isActive ? '#18181b' : '#ffffff',
                color: isActive ? '#ffffff' : '#52525b',
                border: '1px solid #18181b',
                boxShadow: isActive ? '2px 2px 0px #2563eb' : '1px 1px 0px #18181b',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '0.82rem',
                fontWeight: isActive ? 700 : 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.1s ease'
              }}
            >
              {t.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
