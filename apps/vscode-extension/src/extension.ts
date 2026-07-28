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

  // Helper to notify Web Dashboard servers in background
  const notifyWebServers = async (activity: string, topic: string) => {
    const ports = [3000, 3005, 3001];
    for (const port of ports) {
      try {
        await fetch(`http://localhost:${port}/api/v1/context`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            activity,
            topic,
            userId: 'vscode_dev_usr',
            appId: 'VS Code Extension'
          })
        });
      } catch (err) {
        // quiet fallback
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
        progress.report({ message: 'Analyzing developer context via Gloo AI & YouVersion...' });

        const activity = `coding_in_${languageId}`;
        const topic = `file_${fileName}_duration_${durationSeconds}s`;

        // Sync with live web servers
        notifyWebServers(activity, topic);

        const exp = await presence.capture({
          userId: 'vscode_dev_usr',
          activity,
          topic,
          durationSeconds,
          metadata: { fileName, languageId }
        });

        if (exp) {
          const actionText = '📖 Leer Reflexión y Oración';
          const shareText = '🔗 Compartir';
          const selection = await vscode.window.showInformationMessage(
            `✨ [Presence]: "${exp.scripture.text}" — ${exp.scripture.reference}`,
            actionText,
            shareText
          );

          if (selection === actionText) {
            vscode.window.showQuickPick(
              [
                `📌 Título: ${exp.title}`,
                `💡 Reflexión: ${exp.reflection}`,
                `🙏 Oración: ${exp.prayer}`,
                `🎯 Acción Recomendada: ${exp.action}`,
                `📖 Versículo completo: ${exp.scripture.reference} (${exp.scripture.translation})`
              ],
              { placeHolder: 'Experiencia Espiritual Contextual' }
            );
          } else if (selection === shareText) {
            vscode.env.clipboard.writeText(exp.shareText);
            vscode.window.showInformationMessage('Copiado al portapapeles: ' + exp.shareText);
          }
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

export function deactivate() {
  console.log('[Presence VS Code Extension] Deactivated.');
}
