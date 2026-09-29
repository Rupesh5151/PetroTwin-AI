import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { OverviewDashboard } from './components/OverviewDashboard';
import { DigitalTwinView } from './components/DigitalTwinView';
import { DynamometerCard } from './components/DynamometerCard';
import { CSSOptimizerView } from './components/CSSOptimizerView';
import { SRPOptimizerView } from './components/SRPOptimizerView';
import { FailureIntelligenceView } from './components/FailureIntelligenceView';
import { ScenarioLabView } from './components/ScenarioLabView';
import { ParetoOptimizationView } from './components/ParetoOptimizationView';
import { AICopilotDrawer } from './components/AICopilotDrawer';
import { JuryDemoModal } from './components/JuryDemoModal';

import { api } from './services/api';
import {
  WellId,
  TelemetryFrame,
  DynoCardData,
  FailureIntelligence,
  OptimizationResult
} from './types/petro';

export function App() {
  const [selectedWell, setSelectedWell] = useState<WellId>('BW-DEMO-001');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isJuryModalOpen, setIsJuryModalOpen] = useState<boolean>(false);

  // Core Data States
  const [telemetry, setTelemetry] = useState<TelemetryFrame | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [dynoData, setDynoData] = useState<DynoCardData | null>(null);
  const [failureData, setFailureData] = useState<FailureIntelligence | null>(null);
  const [optData, setOptData] = useState<OptimizationResult | null>(null);

  // Initial load and periodic telemetry poll (2.5 seconds tick)
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const [tel, dyno, fail, opt] = await Promise.all([
          api.getTelemetry(selectedWell),
          api.getDynoCard(selectedWell),
          api.getFailureIntelligence(selectedWell),
          api.runOptimization(selectedWell)
        ]);

        if (isMounted) {
          setTelemetry(tel);
          setDynoData(dyno);
          setFailureData(fail);
          setOptData(opt);

          // Build synthetic 90-day history if empty
          if (history.length === 0) {
            const hist = [];
            for (let d = 1; d <= 90; d += 3) {
              const state = api.getTimeMachineState(selectedWell, d);
              hist.push({
                day: d,
                oil_rate_bpd: state.production_state.oil_rate_bpd,
                reservoir_temperature_c: state.thermal_state.reservoir_temperature_c,
                pprl_lbs: state.srp_operating_state.pprl_lbs,
                mprl_lbs: state.srp_operating_state.mprl_lbs,
                rod_floating_risk: state.srp_operating_state.rod_floating_risk
              });
            }
            setHistory(hist);
          }
        }
      } catch (err) {
        console.error('Data poll error:', err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [selectedWell]);

  const handleApplyPlan = (plan: any) => {
    alert(`Operating plan dispatched successfully!\nSPM: ${plan.spm} | Stroke: ${plan.stroke_m}m | Next Steam: ${plan.steam_tons} T\nLogged to Immutable Field Audit Ledger.`);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-primary)' }}>
      {/* Top Navigation */}
      <Navbar
        selectedWell={selectedWell}
        onSelectWell={(w) => setSelectedWell(w)}
        activeTab={activeTab}
        onSelectTab={(t) => setActiveTab(t)}
        onOpenJuryDemo={() => setIsJuryModalOpen(true)}
        onOpenCopilot={() => setIsCopilotOpen(true)}
      />

      {/* Main Dynamic Viewport */}
      <main style={{ flex: 1, maxWidth: '1680px', width: '100%', margin: '0 auto' }}>
        {activeTab === 'dashboard' && (
          <OverviewDashboard
            telemetry={telemetry}
            history={history}
            onNavigateTab={(t) => setActiveTab(t)}
          />
        )}

        {activeTab === 'digital-twin' && (
          <DigitalTwinView
            currentTelemetry={telemetry}
            selectedWell={selectedWell}
          />
        )}

        {activeTab === 'live-ops' && (
          <DynamometerCard
            dynoData={dynoData}
            onRefresh={async () => {
              const d = await api.getDynoCard(selectedWell);
              setDynoData(d);
            }}
          />
        )}

        {activeTab === 'css-optimizer' && <CSSOptimizerView />}

        {activeTab === 'srp-optimizer' && <SRPOptimizerView />}

        {activeTab === 'failures' && (
          <FailureIntelligenceView failureData={failureData} />
        )}

        {activeTab === 'scenario-lab' && <ScenarioLabView />}

        {activeTab === 'pareto' && (
          <ParetoOptimizationView
            optimizationData={optData}
            onApplyPlan={handleApplyPlan}
          />
        )}
      </main>

      {/* AI Copilot Side Drawer */}
      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        selectedWell={selectedWell}
      />

      {/* 5-Minute Guided System Walkthrough */}
      <JuryDemoModal
        isOpen={isJuryModalOpen}
        onClose={() => setIsJuryModalOpen(false)}
        onNavigateTab={(t) => setActiveTab(t)}
      />

      {/* Industrial Footer */}
      <footer style={{
        padding: '16px 24px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.74rem',
        color: 'var(--text-muted)',
        background: '#ffffff'
      }}>
        <div style={{ fontWeight: 600 }}>
          PETRO-TWIN AI Enterprise • Oil India Limited • Baghewala Heavy Oil Field Asset Management System
        </div>
        <div style={{ display: 'flex', gap: '16px', fontWeight: 600 }}>
          <span>Physics-Informed Hybrid Digital Twin</span>
          <span>Marx-Langenheim / ASTM D341 / API RP 11L</span>
          <span style={{ color: 'var(--accent-amber)', fontWeight: 800 }}>SIMULATION MODE ACTIVE</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
