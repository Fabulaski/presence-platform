import { Presence } from '@presence/sdk';

export class PresenceWidget {
  private presence: Presence;

  constructor(apiKey: string) {
    this.presence = Presence.initialize({
      apiKey,
      platform: 'widget',
      debug: true
    });
  }

  public render(containerId: string, activity: string, topic?: string) {
    const container = document.getElementById(containerId);
    if (!container) return;

    this.presence.capture({ activity, topic }).then((exp) => {
      if (!exp) return;
      
      const cardHtml = `
        <div style="font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; border-radius: 12px; padding: 16px; border: 1px solid #334155; max-width: 360px; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
          <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #38bdf8; margin-bottom: 6px;">
            ✨ Presence • ${exp.need.toUpperCase()}
          </div>
          <h4 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${exp.title}</h4>
          <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; margin: 0 0 12px 0;">${exp.reflection}</p>
          <blockquote style="margin: 0 0 12px 0; padding-left: 10px; border-left: 3px solid #38bdf8; font-style: italic; font-size: 12px; color: #e2e8f0;">
            "${exp.scripture.text}" — <strong>${exp.scripture.reference}</strong>
          </blockquote>
          <button style="background: #0284c7; color: white; border: none; border-radius: 6px; padding: 8px 14px; font-size: 12px; font-weight: 600; cursor: pointer; width: 100%;">
            ${exp.action}
          </button>
        </div>
      `;
      container.innerHTML = cardHtml;
    });
  }
}

if (typeof window !== 'undefined') {
  (window as any).PresenceWidget = PresenceWidget;
}
