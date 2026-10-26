const $toggle = document.getElementById('toggle');
const $status = document.getElementById('status');
const $monitor = document.getElementById('monitor');

let state = null;
let lang = 'en';

const t = (key, vars) => translate(lang, key, vars);

function applyLang() {
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('.flag').forEach((f) => {
    f.classList.toggle('active', f.dataset.lang === lang);
  });
  if (state) render();
}

function monitorName(d, i) {
  const name = `${i + 1} — ${d.width}x${d.height}`;
  return d.isPrimary ? `${name} (${t('primary')})` : name;
}

function render() {
  $toggle.setAttribute('aria-checked', String(state.locked));

  $status.innerHTML = '';
  const b = document.createElement('b');
  b.className = state.locked ? 'on' : 'off';
  b.textContent = state.locked ? t('statusOnWord') : t('statusOffWord');
  $status.append(t('statusPrefix') + ' ', b);

  $monitor.innerHTML = '';
  state.displays.forEach((d, i) => {
    const opt = new Option(monitorName(d, i), d.id);
    opt.selected = d.id === state.displayId;
    $monitor.add(opt);
  });
}

async function refresh() {
  state = await chrome.runtime.sendMessage({ type: 'getState' });
  render();
}

$toggle.addEventListener('click', async () => {
  await chrome.runtime.sendMessage({
    type: 'setLocked',
    locked: !state.locked,
    displayId: $monitor.value,
  });
  refresh();
});

// Changing the monitor while locked moves the lock right away
$monitor.addEventListener('change', async () => {
  state.displayId = $monitor.value;
  if (state.locked) {
    await chrome.runtime.sendMessage({ type: 'setLocked', locked: true, displayId: $monitor.value });
  }
});

document.querySelectorAll('.flag').forEach((f) => {
  f.addEventListener('click', async () => {
    lang = f.dataset.lang;
    await chrome.storage.local.set({ lang });
    applyLang();
  });
});

// Support buttons: only shown when a link is set in config.js
function setupSupport() {
  document.getElementById('star').href = SUPPORT.repo;
  const links = { kofi: SUPPORT.kofi, paypal: SUPPORT.paypal, sponsors: SUPPORT.githubSponsors };
  for (const [id, url] of Object.entries(links)) {
    if (!url) continue;
    const el = document.getElementById(id);
    el.href = url;
    el.hidden = false;
  }
  if (SUPPORT.pixUrl) {
    const pix = document.getElementById('pix');
    pix.hidden = false;
    pix.addEventListener('click', () => chrome.tabs.create({ url: SUPPORT.pixUrl }));
  } else if (SUPPORT.pixKey) {
    const pix = document.getElementById('pix');
    pix.hidden = false;
    pix.addEventListener('click', async () => {
      await navigator.clipboard.writeText(SUPPORT.pixKey);
      pix.querySelector('span').textContent = t('pixCopied');
      setTimeout(() => { pix.querySelector('span').textContent = t('pix'); }, 2000);
    });
  }
}

(async () => {
  lang = await getLang();
  applyLang();
  setupSupport();
  refresh();
})();
