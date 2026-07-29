import { Presence } from '@presence/sdk';

// Initialize Presence SDK for Chrome Extension
const presence = Presence.initialize({
  apiKey: 'pk_live_chrome_extension_app',
  platform: 'custom',
  debug: true
});

let activeDomain = 'google.com';
let startTime = Date.now();
let lastNotificationTime = 0;
const NOTIFICATION_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes of continuous active browsing

// Function to extract domain from URL
function getDomain(url?: string): string {
  if (!url) return 'new_tab';
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace('www.', '');
  } catch {
    return 'browser';
  }
}

// Map domain categories to activities
function getDomainActivity(domain: string): { activity: string; topic: string } {
  const d = domain.toLowerCase();
  if (d.includes('github') || d.includes('gitlab') || d.includes('bitbucket')) {
    return { activity: 'browsing_code_repository', topic: 'pull_request_review' };
  }
  if (d.includes('stackoverflow') || d.includes('stackexchange') || d.includes('dev.to')) {
    return { activity: 'researching_technical_solutions', topic: 'bug_resolution' };
  }
  if (d.includes('figma') || d.includes('canva') || d.includes('dribbble')) {
    return { activity: 'creative_design_work', topic: 'visual_creation' };
  }
  if (d.includes('jira') || d.includes('trello') || d.includes('notion') || d.includes('slack')) {
    return { activity: 'project_management_work', topic: 'task_coordination' };
  }
  if (d.includes('youtube') || d.includes('twitter') || d.includes('x.com') || d.includes('reddit')) {
    return { activity: 'social_content_consumption', topic: 'mental_pause' };
  }
  return { activity: 'web_research', topic: domain };
}

// Process context event and trigger notification
async function triggerProactiveWisdom(domain: string, durationSec: number, manual: boolean = false) {
  const { activity, topic } = getDomainActivity(domain);
  const lang = navigator.language.startsWith('es') ? 'es' : 'en';

  console.log(`[Presence Chrome] Evaluating context for domain: ${domain} (${durationSec}s active)`);

  try {
    const experience = await presence.capture({
      userId: 'chrome_user_session',
      activity: activity,
      topic: topic,
      durationSeconds: durationSec,
      language: lang
    });

    if (experience && experience.scripture) {
      const notifId = `presence_notif_${Date.now()}`;
      const title = experience.title || 'Palabra de Aliento — Presence';
      const message = `"${experience.scripture.text}" — ${experience.scripture.reference}`;

      // Create native Chrome desktop notification
      chrome.notifications.create(notifId, {
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: `🕊️ ${title}`,
        message: message,
        buttons: [
          { title: '📖 Abrir Devocional' },
          { title: '✨ Ver en Dashboard' }
        ],
        priority: 2
      });

      // Save latest experience in extension storage
      await chrome.storage.local.set({ latestExperience: experience, lastUpdated: Date.now() });

      // Synchronize in background with Mission Control Dashboard (port 3000)
      fetch('http://localhost:3000/api/v1/experience', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          experience,
          activity: activity,
          appId: 'Chrome Extension',
          userId: 'chrome_browser_session'
        })
      }).catch(() => {});

      lastNotificationTime = Date.now();
    }
  } catch (err: any) {
    console.warn('[Presence Chrome] Error triggering proactive wisdom:', err);
  }
}

// Track active tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    const domain = getDomain(tab.url);
    const now = Date.now();
    const durationSec = Math.round((now - startTime) / 1000);

    if (domain !== activeDomain) {
      if (durationSec > 300 && (now - lastNotificationTime > NOTIFICATION_INTERVAL_MS)) {
        await triggerProactiveWisdom(activeDomain, durationSec);
      }
      activeDomain = domain;
      startTime = now;
    }
  } catch (err) {}
});

// Track idle state (detect user taking breaks or away from keyboard)
chrome.idle.onStateChanged.addListener((newState) => {
  if (newState === 'active') {
    startTime = Date.now();
  } else if (newState === 'idle' || newState === 'locked') {
    console.log('[Presence Chrome] User is idle/away.');
  }
});

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener((notifId, buttonIndex) => {
  if (buttonIndex === 0) {
    // Open YouVersion plan or side panel
    chrome.storage.local.get(['latestExperience'], (result) => {
      const exp = result.latestExperience;
      if (exp && exp.youVersionPlan && exp.youVersionPlan.url) {
        chrome.tabs.create({ url: exp.youVersionPlan.url });
      } else {
        chrome.tabs.create({ url: 'http://localhost:3000' });
      }
    });
  } else if (buttonIndex === 1) {
    // Open Mission Control Dashboard
    chrome.tabs.create({ url: 'http://localhost:3000' });
  }
});

// Handle message from popup or sidepanel to force manual trigger
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'TRIGGER_NOW') {
    triggerProactiveWisdom(activeDomain, 600, true).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
});

console.log('[Presence Chrome] Background Service Worker initialized.');
