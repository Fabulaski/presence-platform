import * as vscode from 'vscode';
import { Presence } from '@presence/sdk';

let statusBarItem: vscode.StatusBarItem;
let presence: Presence;
let codingStartTime: number = Date.now();

export function activate(context: vscode.ExtensionContext) {
  console.log('[Presence VS Code Extension] Extension Activated!');

  // Initialize Presence SDK for VS Code Extension
  presence = Presence.initialize({
    apiKey: 'pk_live_vscode_official_extension',
    platform: 'dev',
    debug: true
  });

  // Create Status Bar Item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBarItem.command = 'presence.captureContext';
  statusBarItem.text = '$(heart) Presence: Active';
  statusBarItem.tooltip = 'Click for a contextual scripture break & reflection';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  /**
   * Send the COMPLETE generated experience to the Web Dashboard.
   * This ensures the exact same verse/reflection shown in VS Code
   * is what appears on the dashboard — no re-generation.
   */
  const syncExperienceToDashboard = async (experience: any, activity: string) => {
    const ports = [3000, 3005, 3001];
    for (const port of ports) {
      try {
        await fetch(`http://localhost:${port}/api/v1/experience`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            experience,
            activity,
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

    vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: 'Presence Engine',
        cancellable: false
      },
      async (progress) => {
        progress.report({ message: 'Analyzing developer context via OpenAI GPT & YouVersion...' });

        const activity = `coding_in_${languageId}`;
        const topic = `file_${fileName}_duration_${durationSeconds}s`;

        const exp = await presence.capture({
          userId: 'vscode_dev_usr',
          activity,
          topic,
          durationSeconds,
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
            { enableScripts: false }
          );

          panel.webview.html = getReflectionWebviewHtml(exp);
        } else {
          vscode.window.showInformationMessage('Presence: El Context Engine discernió que estás en ritmo constante. ¡Sigue adelante!');
        }
      }
    );
  });

  // Command 2: Open Mission Control Dashboard in Browser
  const dashboardCommand = vscode.commands.registerCommand('presence.openDashboard', () => {
    vscode.env.openExternal(vscode.Uri.parse('http://localhost:3000'));
  });

  context.subscriptions.push(captureCommand, dashboardCommand);

  // Background listener: Track text editor changes
  vscode.workspace.onDidChangeTextDocument((event) => {
    const elapsedMinutes = (Date.now() - codingStartTime) / (1000 * 60);
    if (elapsedMinutes >= 45) {
      statusBarItem.text = '$(clock) Presence: Break Recommended';
    }
  });
}

/**
 * Build a beautiful, full-width HTML page for the Webview Panel
 * that shows the complete reflection without truncation.
 */
function getReflectionWebviewHtml(exp: any): string {
  return `<!DOCTYPE html>
<html lang="es">
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
      text-align: center;
      margin-top: 24px;
      font-size: 11px;
      color: #475569;
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
      <div class="subtitle">Presencia Espiritual Contextual</div>
    </div>

    <!-- Scripture -->
    <div class="card">
      <div class="card-label">📖 Versículo</div>
      <div class="scripture-block">
        <div class="scripture-text">"${escapeHtml(exp.scripture.text)}"</div>
        <div class="scripture-ref">${escapeHtml(exp.scripture.reference)} (${escapeHtml(exp.scripture.translation)})</div>
      </div>
    </div>

    <!-- Reflection -->
    <div class="card">
      <div class="card-label">💡 Reflexión <span class="need-badge">${escapeHtml(exp.need)}</span></div>
      <div class="reflection-text">${escapeHtml(exp.reflection)}</div>
    </div>

    <!-- Prayer -->
    <div class="card">
      <div class="card-label">🙏 Oración</div>
      <div class="prayer-text">${escapeHtml(exp.prayer)}</div>
    </div>

    <!-- Action -->
    <div class="card action-box">
      <div class="card-label" style="color: #6ee7b7;">🎯 Micro-Acción (60 segundos)</div>
      <div class="action-text">${escapeHtml(exp.action)}</div>
    </div>

    <div class="footer">
      Presence Platform • Confianza: ${Math.round((exp.confidence || 0.9) * 100)}%
    </div>

  </div>
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
