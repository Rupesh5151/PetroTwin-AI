import React, { useState } from 'react';
import { X, Send, Sparkles, Terminal, Wrench, ShieldCheck, HelpCircle } from 'lucide-react';
import { api } from '../services/api';

interface CopilotProps {
  isOpen: boolean;
  onClose: () => void;
  selectedWell: string;
}

export const AICopilotDrawer: React.FC<CopilotProps> = ({ isOpen, onClose, selectedWell }) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; tools?: string[] }>>([
    {
      role: 'assistant',
      text: `Hello! I am the **PetroTwin Agentic AI Copilot**. I am connected directly to the **Baghewala Jodhpur Sandstone Digital Twin**, physics solvers, and deterministic tool supervisor for well **${selectedWell}**.\n\nHow can I assist your operational decisions today?`,
      tools: ['get_well_state']
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const quickPrompts = [
    "Why did failure risk increase?",
    "Recommend next CSS cycle settings",
    "What happens if we increase soak time?",
    "Forecast production for next 30 days"
  ];

  const handleSend = async (queryText?: string) => {
    const q = queryText || input;
    if (!q.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', text: q }]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.queryCopilot(q, selectedWell);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        text: res.answer,
        tools: res.tools_used
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        text: 'An error occurred querying the agent service. Operating in offline fallback mode.',
        tools: []
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: '460px',
      maxWidth: '90vw',
      background: '#ffffff',
      borderLeft: '1px solid var(--border)',
      boxShadow: '-6px 0 24px rgba(0,0,0,0.08)',
      zIndex: 100,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#ffffff'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '30px',
            height: '30px',
            background: 'var(--text-main)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '2px 2px 0px var(--shadow-color)'
          }}>
            <Sparkles size={16} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-main)' }}>PETRO-TWIN COPILOT</div>
            <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)' }}>Grounded Petroleum Supervisor Agent</div>
          </div>
        </div>
        <button onClick={onClose} style={{ background: '#f4f5f7', border: '1px solid var(--border)', padding: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={18} color="var(--text-main)" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', background: '#fafafa' }}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '92%',
              background: m.role === 'user' ? 'var(--text-main)' : '#ffffff',
              border: '1px solid var(--border)',
              boxShadow: '2px 2px 0px var(--shadow-color)',
              padding: '12px 14px',
              fontSize: '0.82rem',
              color: m.role === 'user' ? '#ffffff' : 'var(--text-main)',
              lineHeight: '1.5'
            }}
          >
            {/* Tool Executions Badge */}
            {m.tools && m.tools.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '8px' }}>
                {m.tools.map((t, i) => (
                  <span key={i} className="tech-badge badge-cyan" style={{ fontSize: '0.62rem', padding: '2px 6px' }}>
                    <Wrench size={10} />
                    <span>{t}()</span>
                  </span>
                ))}
              </div>
            )}
            <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
          </div>
        ))}
        {isLoading && (
          <div style={{ alignSelf: 'flex-start', color: 'var(--primary)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
            <Sparkles size={14} />
            <span>Agent planning & calling physical calculators...</span>
          </div>
        )}
      </div>

      {/* Quick Prompts Chips */}
      <div style={{ padding: '10px 16px', display: 'flex', flexWrap: 'wrap', gap: '6px', borderTop: '1px solid var(--border)', background: '#ffffff' }}>
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p)}
            style={{
              background: '#f8f9fa',
              border: '1px solid var(--border)',
              padding: '4px 10px',
              fontSize: '0.70rem',
              color: 'var(--text-main)',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '1px 1px 0px var(--shadow-color)',
              transition: 'all 0.15s ease'
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px', background: '#ffffff' }}>
        <input
          type="text"
          placeholder="Ask engineering question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
          style={{
            flex: 1,
            background: '#ffffff',
            border: '1px solid var(--border)',
            padding: '8px 12px',
            color: 'var(--text-main)',
            fontSize: '0.82rem',
            outline: 'none',
            fontFamily: 'var(--font-main)'
          }}
        />
        <button
          onClick={() => handleSend()}
          style={{
            background: 'var(--primary)',
            color: '#ffffff',
            border: '1px solid var(--border)',
            boxShadow: '2px 2px 0px var(--shadow-color)',
            padding: '0 16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};
