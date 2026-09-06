import React, { useState } from 'react';
import { Play, Sparkles, AlertTriangle, CheckCircle, RotateCcw, ChevronRight, X } from 'lucide-react';
import { Patient, LanguageCode } from '../types';

interface SihDemoControllerProps {
  onTriggerScenario: (scenarioKey: 'mr-sunita' | 'hi-aarav' | 'en-emergency') => void;
  onReset: () => void;
  currentStepDescription?: string;
}

export const SihDemoController: React.FC<SihDemoControllerProps> = ({
  onTriggerScenario,
  onReset,
  currentStepDescription,
}) => {
  const [minimized, setMinimized] = useState(false);

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 90,
          background: '#0f172a',
          color: '#ffffff',
          padding: '10px 18px',
          borderRadius: '9999px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
          border: '1px solid #334155',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 700,
          fontSize: '0.8125rem',
          cursor: 'pointer',
        }}
      >
        <Sparkles size={16} color="#38bdf8" />
        SIH 2026 Demo Bar
      </button>
    );
  }

  return (
    <div className="sih-demo-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{ padding: '4px 8px', borderRadius: '4px', background: '#0284c7', color: '#ffffff', fontSize: '0.6875rem', fontWeight: 800 }}>
          SIH 2026
        </div>
        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc' }}>
          Interactive Demo Flow:
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => onTriggerScenario('mr-sunita')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '9999px',
            background: '#1e293b',
            color: '#38bdf8',
            border: '1px solid #0284c7',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
          title="Run 2-min Marathi Case: Sunita Patil (Fever & Fatigue)"
        >
          <Play size={12} fill="#38bdf8" />
          1. Run Marathi Scenario (Sunita Patil)
        </button>

        <button
          onClick={() => onTriggerScenario('hi-aarav')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '9999px',
            background: '#1e293b',
            color: '#fbbf24',
            border: '1px solid #d97706',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
          title="Run 2-min Hindi Case: Aarav Sharma (Fever & Vomiting)"
        >
          <Play size={12} fill="#fbbf24" />
          2. Run Hindi Scenario (Aarav Sharma)
        </button>

        <button
          onClick={() => onTriggerScenario('en-emergency')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 12px',
            borderRadius: '9999px',
            background: '#1e293b',
            color: '#f87171',
            border: '1px solid #e11d48',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
          title="Test Clinical Red Flag: Acute Chest Pain Safety Banner"
        >
          <AlertTriangle size={12} />
          3. Red Flag Safety Test
        </button>

        <button
          onClick={onReset}
          style={{
            padding: '6px 10px',
            borderRadius: '9999px',
            background: 'transparent',
            color: '#94a3b8',
            border: '1px solid #475569',
            fontSize: '0.75rem',
            cursor: 'pointer',
          }}
          title="Reset Current Consultation"
        >
          <RotateCcw size={12} />
        </button>

        <button
          onClick={() => setMinimized(true)}
          style={{
            padding: '4px',
            borderRadius: '50%',
            background: 'transparent',
            color: '#94a3b8',
            cursor: 'pointer',
          }}
          title="Minimize bar"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
