import * as vscode from 'vscode';
import { Presence } from '@presence/sdk';

let statusBarItem: vscode.StatusBarItem;
let presence: Presence;
let codingStartTime: number = Date.now();

const UI_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    title: 'Contextual Spiritual Presence',
    subtitle: 'Contextual Spiritual Presence',
    scripture: '📖 SCRIPTURE',
    reflection: '💡 REFLECTION',
    prayer: '🙏 PRAYER',
    action: '🎯 MICRO-ACTION (60 SECONDS)',
    planLabel: '📲 RECOMMENDED DEVOTIONAL PLAN ON YOUVERSION',
    openPlan: '📖 Open Plan on YouVersion →',
    openDashboard: '📊 Open Personal Dashboard →',
    confidence: 'Presence Platform • Confidence:',
    progressTitle: 'Presence Engine',
    progressMsg: 'Analyzing developer context via Gloo AI & YouVersion...',
    discernedMsg: 'Presence: Context Engine discerned you are in steady flow. Keep going!',
    breakMsg: '$(clock) Presence: Recommended Break',
    activeMsg: '$(heart) Presence: Active',
    tooltipMsg: 'Click for a spiritual pause and reflection'
  },
  es: {
    title: 'Presence Platform • Presencia Contextual',
    subtitle: 'PLATAFORMA DE BIENESTAR ESPIRITUAL PARA DESARROLLADORES',
    scripture: '📖 ESCRITURA BÍBLICA ENCONTRADA EN YOUVERSION',
    reflection: '🕊️ REFLEXIÓN Y DISCERNIMIENTO PASTORAL',
    prayer: '🙏 ORACIÓN Y PAUSA DE RECARGA',
    action: '⚡ MICRO-ACCIÓN BÍBLICA RECOMENDADA (60 SEG)',
    planLabel: '📲 PLAN DEVOCIONAL RECOMENDADO EN YOUVERSION',
    openPlan: '📖 Abrir Plan en YouVersion →',
    openDashboard: '📊 Abrir Dashboard Personal →',
    confidence: 'Presence Platform • Confianza:',
    progressTitle: 'Motor Presence',
    progressMsg: 'Analizando contexto de desarrollo con Gloo AI y YouVersion...',
    discernedMsg: 'Presence: El Context Engine discernió que estás en ritmo constante. ¡Sigue adelante!',
    breakMsg: '$(clock) Presence: Pausa Recomendada',
    activeMsg: '$(heart) Presence: Activo',
    tooltipMsg: 'Haz clic para una pausa y reflexión espiritual'
  },
  pt: {
    title: 'Presence Platform • Presença Contextual',
    subtitle: 'PLATAFORMA DE BEM-ESTAR ESPIRITUAL PARA DESENVOLVEDORES',
    scripture: '📖 ESCRITURA BÍBLICA ENCONTRADA NO YOUVERSION',
    reflection: '🕊️ REFLEXÃO E DISCERNIMENTO PASTORAL',
    prayer: '🙏 ORAÇÃO E PAUSA DE RECARGA',
    action: '⚡ MICRO-AÇÃO BÍBLICA RECOMENDADA (60 SEG)',
    planLabel: '📲 PLANO DEVOCIONAL RECOMENDADO NO YOUVERSION',
    openPlan: '📖 Abrir Plano no YouVersion →',
    openDashboard: '📊 Abrir Painel Pessoal →',
    confidence: 'Presence Platform • Confiança:',
    progressTitle: 'Motor Presence',
    progressMsg: 'Analisando contexto de desenvolvimento via Gloo AI e YouVersion...',
    discernedMsg: 'Presence: O Context Engine discerniu que você está em ritmo constante. Continue!',
    breakMsg: '$(clock) Presence: Pausa Recomendada',
    activeMsg: '$(heart) Presence: Activo',
    tooltipMsg: 'Clique para uma pausa e reflexão espiritual'
  }
};

export function activate(context: vscode.ExtensionContext) {
  console.log('[Presence VS Code Extension] Extension Activated!');

  const systemLang = vscode.env.language ? vscode.env.language.split('-')[0] : 'en';
  const t = UI_TRANSLATIONS[systemLang] || UI_TRANSLATIONS['en'];

  // Initialize Presence SDK for VS Code Extension
  presence = Presence.initialize({
    apiKey: 'pk_live_vscode_official_extension',
    platform: 'dev',
    debug: true
  });

  // Create Status Bar Item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'presence.captureContext';
  statusBarItem.text = t.activeMsg;
  statusBarItem.tooltip = t.tooltipMsg;
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  /**
   * Send the COMPLETE generated experience to the Web Dashboard.
   * This ensures the exact same verse/reflection shown in VS Code
   * is what appears on the dashboard — no re-generation.
   */
  const syncExperienceToDashboard = async (experience: any, activity: string) => {
    const devId = vscode.env.machineId;
    const ports = [3000, 3005, 3001];
    for (const port of ports) {
      try {
        await fetch(`http://localhost:${port}/api/v1/experience`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            experience,
            activity,
            userId: devId,
            appId: 'VS Code Extension'
          })
        });
      } catch (err) {
        // quiet fallback — dashboard may not be running
      }
    }
  };

  // Command 1: Capture Context Manually or via Status Bar click
  const captureCommand = vscode.commands.registerCommand('presence.captureContext', async () => {
    const editor = vscode.window.activeTextEditor;
    const fileName = editor ? editor.document.fileName.split(/[\\/]/).pop() : 'Code Workspace';
    const languageId = editor ? editor.document.languageId : 'typescript';
    const durationSeconds = Math.floor((Date.now() - codingStartTime) / 1000);
    const devId = vscode.env.machineId;

    // Re-detect language dynamically
    const currentLang = vscode.env.language ? vscode.env.language.split('-')[0] : 'en';
    const langStrings = UI_TRANSLATIONS[currentLang] || UI_TRANSLATIONS['en'];

    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: langStrings.progressTitle,
        cancellable: false
      },
      async (progress) => {
        progress.report({ message: langStrings.progressMsg });

        const activity = `coding_in_${languageId}`;
        const topic = `file_${fileName}_duration_${durationSeconds}s`;

        const exp = await presence.capture({
          userId: devId,
          activity,
          topic,
          durationSeconds,
          language: currentLang,
          force: true,
          metadata: { fileName, languageId }
        });

        if (exp) {
          // Send this EXACT experience to the dashboard (same verse, same reflection)
          syncExperienceToDashboard(exp, activity);

          // Show a rich Webview Panel instead of QuickPick for full-text display
          const panel = vscode.window.createWebviewPanel(
            'presenceReflection',
            `🕊️ ${exp.title}`,
            vscode.ViewColumn.Beside,
            { enableScripts: true }
          );

          panel.webview.onDidReceiveMessage(
            (message) => {
              if (message.command === 'openDashboard') {
                vscode.env.openExternal(vscode.Uri.parse(`http://localhost:3000/?devId=${encodeURIComponent(devId)}`));
              }
            },
            undefined,
            context.subscriptions
          );

          panel.webview.html = getReflectionWebviewHtml(exp, currentLang);
        } else {
          vscode.window.showInformationMessage(langStrings.discernedMsg);
        }
      }
    );
  });

  // Command 2: Open Mission Control Dashboard in Browser
  const dashboardCommand = vscode.commands.registerCommand('presence.openDashboard', () => {
    const devId = vscode.env.machineId;
    vscode.env.openExternal(vscode.Uri.parse(`http://localhost:3000/?devId=${encodeURIComponent(devId)}`));
  });

  context.subscriptions.push(captureCommand, dashboardCommand);

  // Background listener: Track text editor changes
  vscode.workspace.onDidChangeTextDocument((event) => {
    const elapsedMinutes = (Date.now() - codingStartTime) / (1000 * 60);
    if (elapsedMinutes >= 45) {
      const currentLang = vscode.env.language ? vscode.env.language.split('-')[0] : 'en';
      const langStrings = UI_TRANSLATIONS[currentLang] || UI_TRANSLATIONS['en'];
      statusBarItem.text = langStrings.breakMsg;
    }
  });
}

/**
 * Build a beautiful, full-width HTML page for the Webview Panel
 * that shows the complete reflection without truncation, translated to the current language.
 */
function getReflectionWebviewHtml(exp: any, lang: string = 'en'): string {
  const t = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS['en'];

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
      color: #e2e8f0;
      padding: 32px;
      min-height: 100vh;
      line-height: 1.7;
    }
    .container {
      max-width: 560px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      margin-bottom: 28px;
    }
    .header .icon {
      font-size: 40px;
      margin-bottom: 8px;
    }
    .header h1 {
      font-size: 22px;
      font-weight: 700;
      background: linear-gradient(135deg, #38bdf8, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 4px;
    }
    .header .subtitle {
      font-size: 12px;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 1.5px;
    }
    .card {
      background: rgba(30, 41, 59, 0.8);
      border: 1px solid rgba(71, 85, 105, 0.4);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 16px;
      backdrop-filter: blur(8px);
    }
    .card-label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #94a3b8;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .scripture-block {
      border-left: 4px solid #38bdf8;
      padding: 16px 20px;
      background: rgba(56, 189, 248, 0.06);
      border-radius: 0 12px 12px 0;
    }
    .scripture-text {
      font-size: 16px;
      font-style: italic;
      color: #f1f5f9;
      line-height: 1.8;
      margin-bottom: 10px;
    }
    .scripture-ref {
      font-size: 13px;
      font-weight: 700;
      color: #38bdf8;
      font-style: normal;
    }
    .reflection-text {
      font-size: 15px;
      color: #cbd5e1;
      line-height: 1.8;
    }
    .prayer-text {
      font-size: 14px;
      color: #c4b5fd;
      font-style: italic;
      line-height: 1.7;
    }
    .action-box {
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.2);
      border-radius: 12px;
      padding: 16px 20px;
    }
    .action-text {
      font-size: 14px;
      color: #6ee7b7;
      font-weight: 500;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 24px;
      font-size: 11px;
      color: #475569;
    }
    .btn-dash {
      padding: 8px 16px;
      background: linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(99, 102, 241, 0.2));
      color: #38bdf8;
      border: 1px solid rgba(56, 189, 248, 0.35);
      font-weight: 700;
      font-size: 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-dash:hover {
      background: linear-gradient(135deg, rgba(56, 189, 248, 0.25), rgba(99, 102, 241, 0.35));
      border-color: rgba(56, 189, 248, 0.6);
      color: #ffffff;
      transform: translateY(-1px);
    }
    .need-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      background: rgba(129, 140, 248, 0.15);
      color: #a5b4fc;
      border: 1px solid rgba(129, 140, 248, 0.25);
    }
  </style>
</head>
<body>
  <div class="container">

    <div class="header">
      <div class="icon">🕊️</div>
      <h1>${escapeHtml(exp.title)}</h1>
      <div class="subtitle">${t.subtitle}</div>
    </div>

    <!-- Scripture -->
    <div class="card">
      <div class="card-label">${t.scripture}</div>
      <div class="scripture-block">
        <div class="scripture-text">"${escapeHtml(exp.scripture.text)}"</div>
        <div class="scripture-ref">${escapeHtml(exp.scripture.reference)} (${escapeHtml(exp.scripture.translation)})</div>
      </div>
    </div>

    <!-- Reflection -->
    <div class="card">
      <div class="card-label">${t.reflection} <span class="need-badge">${escapeHtml(exp.need.toUpperCase())}</span></div>
      <div class="reflection-text">${escapeHtml(exp.reflection)}</div>
    </div>

    <!-- Prayer -->
    <div class="card">
      <div class="card-label">${t.prayer}</div>
      <div class="prayer-text">${escapeHtml(exp.prayer)}</div>
    </div>

    <!-- Action -->
    <div class="card action-box">
      <div class="card-label" style="color: #6ee7b7;">${t.action}</div>
      <div class="action-text">${escapeHtml(exp.action)}</div>
    </div>

    <!-- YouVersion Devotional Plan -->
    ${exp.youVersionPlan ? `
    <div class="card" style="border-color: rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.05);">
      <div class="card-label" style="color: #fbbf24;">${t.planLabel}</div>
      <div style="font-size: 15px; font-weight: 700; color: #fef3c7; margin-bottom: 6px;">${escapeHtml(exp.youVersionPlan.title)}</div>
      ${exp.youVersionPlan.description ? `<div style="font-size: 13px; color: #cbd5e1; margin-bottom: 12px; line-height: 1.6;">${escapeHtml(exp.youVersionPlan.description)}</div>` : ''}
      <a href="${escapeHtml(exp.youVersionPlan.url)}" target="_blank" style="display: inline-block; padding: 8px 16px; background: #f59e0b; color: #0f172a; font-weight: 700; font-size: 12px; border-radius: 8px; text-decoration: none;">
        ${t.openPlan}
      </a>
    </div>
    ` : ''}

    <div class="footer">
      <span>${t.confidence} ${Math.round((exp.confidence || 0.9) * 100)}%</span>
      <button class="btn-dash" onclick="openDashboard()" style="padding: 5px 12px; font-size: 11px;">
        ${t.openDashboard}
      </button>
    </div>

  </div>

  <script>
    const vscode = acquireVsCodeApi();
    function openDashboard() {
      vscode.postMessage({ command: 'openDashboard' });
    }
  </script>
</body>
</html>`;
}

/** Escape HTML special characters to prevent injection */
function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function deactivate() {
  console.log('[Presence VS Code Extension] Deactivated.');
}
