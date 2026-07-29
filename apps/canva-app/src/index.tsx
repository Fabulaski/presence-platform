import React, { useState } from "react";
import { createRoot } from "react-dom/client";

// ── Presence Canva App Component ──
function PresenceCanvaApp() {
  const [lang, setLang] = useState<"es" | "en">("es");
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [loading, setLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState("creative_block");
  const [experience, setExperience] = useState<any>(null);

  const t = {
    es: {
      title: "Presence Platform",
      subtitle: "Escritura & Inspiración en Canva",
      modeLabel: "Modo de Diseño Activo",
      btnAction: "✨ Obtener Inspiración Divina",
      btnLoading: "Discerniendo con Gloo AI...",
      btnInsert: "📌 Insertar Cita en el Lienzo",
      modes: [
        { id: "creative_block", icon: "🎬", name: "Reel / Video", desc: "Bloqueo Creativo" },
        { id: "anxiety", icon: "🖼️", name: "Póster / Story", desc: "Ansiedad & Estrés" },
        { id: "wisdom", icon: "🎵", name: "Adoración / Arte", desc: "Búsqueda Sabiduría" },
        { id: "hope", icon: "📊", name: "Presentación", desc: "Esperanza & Fe" },
      ],
      openYV: "📖 Abrir Plan Devocional YouVersion →",
      footer: "Scripture in New Frontiers",
      insertOk: "¡Cita lista para el lienzo!",
    },
    en: {
      title: "Presence Platform",
      subtitle: "Scripture & Inspiration in Canva",
      modeLabel: "Active Design Mode",
      btnAction: "✨ Seek Divine Inspiration",
      btnLoading: "Discerning with Gloo AI...",
      btnInsert: "📌 Insert Quote onto Canvas",
      modes: [
        { id: "creative_block", icon: "🎬", name: "Reel / Video", desc: "Creative Block" },
        { id: "anxiety", icon: "🖼️", name: "Poster / Story", desc: "Anxiety & Stress" },
        { id: "wisdom", icon: "🎵", name: "Worship / Art", desc: "Seeking Wisdom" },
        { id: "hope", icon: "📊", name: "Presentation", desc: "Hope & Faith" },
      ],
      openYV: "📖 Open YouVersion Devotional →",
      footer: "Scripture in New Frontiers",
      insertOk: "Quote ready for canvas!",
    },
  };

  const txt = t[lang];
  const isDark = theme === "dark";

  const bgMain = isDark ? "#0e1318" : "#f8f9fa";
  const bgCard = isDark ? "#181e24" : "#ffffff";
  const bgCardHover = isDark ? "#1f2830" : "#f0f0f0";
  const borderColor = isDark ? "#2c353e" : "#dde1e6";
  const textPrimary = isDark ? "#ffffff" : "#1a1a2e";
  const textSecondary = isDark ? "#94a3b8" : "#64748b";
  const accentPurple = "#7d2ae8";
  const accentTeal = "#00c4cc";

  async function handleInspiration() {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3005/api/inspiration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: selectedMode,
          activity: "canva_design",
          language: lang,
        }),
      });
      const data = await res.json();
      if (data.success && data.experience) {
        setExperience(data.experience);
      }
    } catch (err) {
      console.error("Presence API error:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleInsert() {
    if (!experience) return;
    // For native Canva SDK integration, this would call:
    // addNativeElement({ type: "TEXT", children: [experience.scripture.text] });
    // For now, we use postMessage to communicate with parent Canva frame
    try {
      window.parent.postMessage(
        {
          type: "presence_insert_text",
          text: `"${experience.scripture?.text}" — ${experience.scripture?.reference}`,
        },
        "*"
      );
    } catch (e) {
      console.log("Insert event dispatched");
    }
    alert(txt.insertOk);
  }

  return (
    <div
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        background: bgMain,
        color: textPrimary,
        minHeight: "100vh",
        padding: "16px",
        boxSizing: "border-box",
        transition: "all 0.3s ease",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: "12px",
          borderBottom: `1px solid ${borderColor}`,
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: `linear-gradient(135deg, ${accentPurple}, ${accentTeal})`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "18px",
              boxShadow: "0 4px 12px rgba(125,42,232,0.3)",
            }}
          >
            🕊️
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
              {txt.title}
              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  background: `${accentPurple}30`,
                  color: "#c4b5fd",
                  border: `1px solid ${accentPurple}50`,
                }}
              >
                Canva
              </span>
            </div>
            <div style={{ fontSize: "11px", color: textSecondary }}>{txt.subtitle}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          <button
            onClick={() => setLang(lang === "es" ? "en" : "es")}
            style={{
              padding: "4px 8px",
              fontSize: "11px",
              fontWeight: 600,
              borderRadius: "6px",
              background: isDark ? "#1e293b" : "#e2e8f0",
              color: textPrimary,
              border: `1px solid ${borderColor}`,
              cursor: "pointer",
            }}
          >
            {lang === "es" ? "ES 🇪🇸" : "EN 🇬🇧"}
          </button>
          <button
            onClick={() => setTheme(isDark ? "light" : "dark")}
            style={{
              padding: "4px 8px",
              fontSize: "11px",
              fontWeight: 600,
              borderRadius: "6px",
              background: isDark ? "#1e293b" : "#e2e8f0",
              color: textPrimary,
              border: `1px solid ${borderColor}`,
              cursor: "pointer",
            }}
          >
            {isDark ? "🌙" : "☀️"}
          </button>
        </div>
      </div>

      {/* Mode Selector */}
      <div style={{ marginBottom: "14px" }}>
        <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", color: textSecondary, marginBottom: "8px" }}>
          {txt.modeLabel}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
          {txt.modes.map((mode) => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              style={{
                padding: "10px",
                borderRadius: "10px",
                background: selectedMode === mode.id ? `${accentPurple}25` : bgCard,
                border: `2px solid ${selectedMode === mode.id ? accentPurple : borderColor}`,
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.2s",
                color: textPrimary,
              }}
            >
              <div style={{ fontSize: "16px", marginBottom: "4px" }}>{mode.icon}</div>
              <div style={{ fontWeight: 700, fontSize: "11px" }}>{mode.name}</div>
              <div style={{ fontSize: "9px", color: textSecondary }}>{mode.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={handleInspiration}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: "10px",
          background: loading ? "#475569" : `linear-gradient(90deg, ${accentPurple}, ${accentTeal})`,
          color: "#fff",
          fontWeight: 700,
          fontSize: "13px",
          border: "none",
          cursor: loading ? "wait" : "pointer",
          marginBottom: "14px",
          boxShadow: "0 4px 16px rgba(125,42,232,0.25)",
          transition: "all 0.2s",
        }}
      >
        {loading ? txt.btnLoading : txt.btnAction}
      </button>

      {/* Experience Card */}
      {experience && (
        <div
          style={{
            background: bgCard,
            border: `1px solid ${accentPurple}50`,
            borderRadius: "14px",
            padding: "14px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span
              style={{
                padding: "2px 8px",
                fontSize: "9px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                borderRadius: "10px",
                background: `${accentPurple}20`,
                color: "#c4b5fd",
                border: `1px solid ${accentPurple}40`,
              }}
            >
              {experience.need || "Hope"}
            </span>
            <span style={{ fontSize: "9px", color: textSecondary, fontFamily: "monospace" }}>Gloo AI</span>
          </div>

          <h3 style={{ fontWeight: 700, fontSize: "13px", marginBottom: "10px", color: textPrimary }}>
            {experience.title}
          </h3>

          <blockquote
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: "italic",
              fontSize: "12px",
              color: "#c4b5fd",
              borderLeft: `2px solid ${accentTeal}`,
              paddingLeft: "10px",
              margin: "0 0 6px 0",
              background: `${accentTeal}10`,
              borderRadius: "0 8px 8px 0",
              padding: "8px 10px",
            }}
          >
            "{experience.scripture?.text}"
          </blockquote>

          <p style={{ fontSize: "11px", fontWeight: 700, color: accentTeal, textAlign: "right", margin: "0 0 10px 0" }}>
            {experience.scripture?.reference}
          </p>

          <p style={{ fontSize: "11px", color: textSecondary, lineHeight: 1.5, borderTop: `1px solid ${borderColor}`, paddingTop: "8px", margin: "0 0 10px 0" }}>
            {experience.reflection}
          </p>

          {/* Insert Button */}
          <button
            onClick={handleInsert}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "10px",
              background: `${accentTeal}15`,
              border: `1px solid ${accentTeal}50`,
              color: isDark ? "#5eead4" : "#0d9488",
              fontWeight: 700,
              fontSize: "11px",
              cursor: "pointer",
              marginBottom: "8px",
            }}
          >
            {txt.btnInsert}
          </button>

          {experience.youversionUrl && (
            <a
              href={experience.youversionUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "block",
                textAlign: "center",
                fontSize: "10px",
                color: "#a78bfa",
                textDecoration: "underline",
              }}
            >
              {txt.openYV}
            </a>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: "center", marginTop: "16px", paddingTop: "12px", borderTop: `1px solid ${borderColor}` }}>
        <p style={{ fontSize: "10px", color: textSecondary }}>Presence Platform • Canva Extension v1.0</p>
        <p style={{ fontSize: "9px", color: textSecondary, letterSpacing: "1px", textTransform: "uppercase" }}>{txt.footer}</p>
      </div>
    </div>
  );
}

// ── Mount ──
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<PresenceCanvaApp />);
}
