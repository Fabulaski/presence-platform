import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';

interface Experience {
  title: string;
  reflection: string;
  prayer: string;
  action: string;
  scripture: {
    reference: string;
    text: string;
    translation: string;
  };
  youVersionPlan?: {
    title: string;
    url: string;
  };
}

export function PopupApp() {
  const [experience, setExperience] = useState<Experience | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [lang, setLang] = useState<'es' | 'en'>('es');

  useEffect(() => {
    // Load latest experience from extension storage
    chrome.storage.local.get(['latestExperience'], (res) => {
      if (res.latestExperience) {
        setExperience(res.latestExperience);
      }
    });
  }, []);

  const triggerDiscernment = async (need: string) => {
    setLoading(true);
    chrome.runtime.sendMessage({ type: 'TRIGGER_NOW' }, () => {
      setTimeout(() => {
        chrome.storage.local.get(['latestExperience'], (res) => {
          if (res.latestExperience) {
            setExperience(res.latestExperience);
          }
          setLoading(false);
        });
      }, 1200);
    });
  };

  const isEs = lang === 'es';

  return (
    <div style={{
      width: '360px',
      padding: '16px',
      fontFamily: 'Inter, system-ui, sans-serif',
      backgroundColor: '#0F172A',
      color: '#F8FAFC',
      borderRadius: '12px'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🕊️</span>
          <div>
            <h1 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#F8FAFC' }}>Presence Platform</h1>
            <span style={{ fontSize: '11px', color: '#94A3B8' }}>{isEs ? 'Sanidad & Escritura en Chrome' : 'Wellness & Scripture in Chrome'}</span>
          </div>
        </div>
        <button
          onClick={() => setLang(isEs ? 'en' : 'es')}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: '#93C5FD',
            fontSize: '11px',
            padding: '3px 8px',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          {isEs ? 'ES 🇪🇸' : 'EN 🇬🇧'}
        </button>
      </div>

      {/* Main Experience Card */}
      {experience ? (
        <div style={{
          background: 'linear-gradient(135deg, rgba(30,41,59,0.8) 0%, rgba(15,23,42,0.9) 100%)',
          border: '1px solid rgba(148,163,184,0.15)',
          borderRadius: '10px',
          padding: '14px',
          marginBottom: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#60A5FA', fontWeight: 600 }}>
              {isEs ? '⚡ Reflexión de Gloo AI' : '⚡ Gloo AI Reflection'}
            </span>
            <span style={{ fontSize: '11px', color: '#CBD5E1', fontWeight: 600 }}>{experience.scripture?.reference}</span>
          </div>

          <h2 style={{ fontSize: '15px', margin: '0 0 8px 0', color: '#F1F5F9', fontWeight: 700 }}>
            {experience.title}
          </h2>

          <p style={{ fontSize: '12px', color: '#94A3B8', margin: '0 0 10px 0', lineHeight: '1.5' }}>
            {experience.reflection}
          </p>

          <div style={{
            background: 'rgba(59,130,246,0.1)',
            borderLeft: '3px solid #3B82F6',
            padding: '8px 10px',
            borderRadius: '4px',
            marginBottom: '10px'
          }}>
            <p style={{ margin: 0, fontSize: '12px', fontStyle: 'italic', color: '#E2E8F0', lineHeight: '1.4' }}>
              "{experience.scripture?.text}"
            </p>
          </div>

          {experience.action && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#34D399', background: 'rgba(16,185,129,0.1)', padding: '6px 8px', borderRadius: '6px' }}>
              <span>⏱️</span>
              <span><strong>{isEs ? 'Pausa 60s:' : '60s Pause:'}</strong> {experience.action}</span>
            </div>
          )}

          {experience.youVersionPlan && (
            <a
              href={experience.youVersionPlan.url}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'block',
                marginTop: '10px',
                textAlign: 'center',
                fontSize: '11px',
                color: '#60A5FA',
                textDecoration: 'none',
                fontWeight: 600
              }}
            >
              📲 {isEs ? 'Abrir Plan en YouVersion →' : 'Open YouVersion Plan →'}
            </a>
          )}
        </div>
      ) : (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          background: 'rgba(30,41,59,0.5)',
          borderRadius: '10px',
          marginBottom: '16px'
        }}>
          <p style={{ margin: 0, fontSize: '12px', color: '#94A3B8' }}>
            {isEs ? 'Presiona un botón abajo para recibir inspiración proactiva de Gloo AI.' : 'Click a button below to receive proactive Gloo AI inspiration.'}
          </p>
        </div>
      )}

      {/* Discernment Action Grid */}
      <div style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {isEs ? '⚡ DISCERNIMIENTO PROACTIVO (GLOO AI):' : '⚡ PROACTIVE AI DISCERNMENT:'}
      </div>
      <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '10px' }}>
        {isEs ? 'Gloo AI analiza tu actividad y necesidad en tiempo real:' : 'Gloo AI analyzes your activity and state in real time:'}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => triggerDiscernment('peace')}
          disabled={loading}
          style={{
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.3)',
            color: '#A5B4FC',
            padding: '8px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          🕊️ {isEs ? 'Paz en Estrés' : 'Peace in Stress'}
        </button>

        <button
          onClick={() => triggerDiscernment('wisdom')}
          disabled={loading}
          style={{
            background: 'rgba(234,179,8,0.15)',
            border: '1px solid rgba(234,179,8,0.3)',
            color: '#FDE047',
            padding: '8px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          💡 {isEs ? 'Sabiduría en Retos' : 'Wisdom in Decisions'}
        </button>

        <button
          onClick={() => triggerDiscernment('rest')}
          disabled={loading}
          style={{
            background: 'rgba(16,185,129,0.15)',
            border: '1px solid rgba(16,185,129,0.3)',
            color: '#6EE7B7',
            padding: '8px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          🌿 {isEs ? 'Pausa & Descanso' : 'Pause & Rest'}
        </button>

        <button
          onClick={() => triggerDiscernment('hope')}
          disabled={loading}
          style={{
            background: 'rgba(236,72,153,0.15)',
            border: '1px solid rgba(236,72,153,0.3)',
            color: '#F9A8D4',
            padding: '8px',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
            textAlign: 'left'
          }}
        >
          🔥 {isEs ? 'Esperanza & Fe' : 'Hope & Faith'}
        </button>
      </div>

      {/* Footer link to Dashboard */}
      <div style={{ textAlign: 'center', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noreferrer"
          style={{ fontSize: '11px', color: '#64748B', textDecoration: 'none' }}
        >
          📊 {isEs ? 'Abrir Mission Control Dashboard' : 'Open Mission Control Dashboard'}
        </a>
      </div>
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<PopupApp />);
}
