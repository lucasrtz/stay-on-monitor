// Stay on Monitor: when locked, any Chrome window that leaves the chosen
// monitor is moved back to it (e.g. after alt+tab from a fullscreen game).

importScripts('i18n.js');

const getState = () => chrome.storage.local.get(['locked', 'displayId']);

const inside = (b, x, y) =>
  x >= b.left && x < b.left + b.width && y >= b.top && y < b.top + b.height;

const center = (w) => [w.left + w.width / 2, w.top + w.height / 2];

// Displays sorted left-to-right so "Monitor 1, 2..." matches the physical layout
async function getDisplays() {
  const displays = await chrome.system.display.getInfo();
  return displays.sort((a, b) => a.bounds.left - b.bounds.left || a.bounds.top - b.bounds.top);
}

async function displayOfWindow(win) {
  const displays = await getDisplays();
  const [cx, cy] = center(win);
  return displays.find((d) => inside(d.bounds, cx, cy)) || displays.find((d) => d.isPrimary);
}

async function updateBadge() {
  const { locked, displayId } = await getState();
  const lang = await getLang();
  let title = translate(lang, 'badgeTitleOff');
  if (locked) {
    const displays = await getDisplays();
    const i = displays.findIndex((d) => d.id === displayId);
    title = i >= 0 ? translate(lang, 'badgeTitleOn', { n: i + 1 }) : translate(lang, 'disconnected');
  }
  await chrome.action.setBadgeBackgroundColor({ color: '#22c55e' });
  await chrome.action.setBadgeText({ text: locked ? 'ON' : '' });
  await chrome.action.setTitle({ title });
}

async function setLocked(locked, displayId) {
  if (locked && displayId === undefined) {
    const win = await chrome.windows.getLastFocused();
    displayId = (await displayOfWindow(win)).id;
  }
  await chrome.storage.local.set(locked ? { locked: true, displayId } : { locked: false });
  await updateBadge();
  if (locked) await enforceAll(0);
}

async function toggle() {
  const { locked } = await getState();
  await setLocked(!locked);
}

async function enforce(win) {
  const { locked, displayId } = await getState();
  if (!locked || !win || win.type !== 'normal' || win.state === 'minimized') return;

  const displays = await getDisplays();
  const target = displays.find((d) => d.id === displayId);
  if (!target) return; // monitor disconnected: do nothing

  const [cx, cy] = center(win);
  if (inside(target.bounds, cx, cy)) return;

  const wa = target.workArea;
  const wasMax = win.state === 'maximized' || win.state === 'fullscreen';
  await chrome.windows.update(win.id, { state: 'normal' });
  await chrome.windows.update(win.id, {
    left: wa.left,
    top: wa.top,
    width: Math.min(win.width, wa.width),
    height: Math.min(win.height, wa.height),
  });
  if (wasMax) await chrome.windows.update(win.id, { state: 'maximized' });
}

// Wait for the window to stop moving before correcting (don't fight a drag)
const timers = new Map();
function scheduleEnforce(windowId, delay = 400) {
  clearTimeout(timers.get(windowId));
  timers.set(windowId, setTimeout(async () => {
    timers.delete(windowId);
    try { await enforce(await chrome.windows.get(windowId)); } catch (e) { /* window closed */ }
  }, delay));
}

async function enforceAll(delay = 800) {
  const wins = await chrome.windows.getAll();
  wins.forEach((w) => scheduleEnforce(w.id, delay));
}

// Messages from the popup
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    if (msg.type === 'getState') {
      const { locked, displayId } = await getState();
      const displays = await getDisplays();
      const current = await displayOfWindow(await chrome.windows.getLastFocused());
      sendResponse({
        locked: !!locked,
        displayId: locked ? displayId : current.id,
        displays: displays.map((d) => ({
          id: d.id,
          width: d.bounds.width,
          height: d.bounds.height,
          isPrimary: d.isPrimary,
        })),
      });
    } else if (msg.type === 'setLocked') {
      await setLocked(msg.locked, msg.displayId);
      sendResponse({ ok: true });
    }
  })();
  return true; // async response
});

chrome.commands.onCommand.addListener((cmd) => { if (cmd === 'toggle-lock') toggle(); });

chrome.windows.onBoundsChanged.addListener((w) => scheduleEnforce(w.id));
chrome.windows.onCreated.addListener((w) => scheduleEnforce(w.id));
chrome.windows.onFocusChanged.addListener((id) => {
  if (id !== chrome.windows.WINDOW_ID_NONE) scheduleEnforce(id, 200);
});
chrome.system.display.onDisplayChanged.addListener(() => { enforceAll(); updateBadge(); });

chrome.storage.onChanged.addListener((changes) => { if (changes.lang) updateBadge(); });

chrome.runtime.onStartup.addListener(() => { updateBadge(); enforceAll(); });
chrome.runtime.onInstalled.addListener(updateBadge);
