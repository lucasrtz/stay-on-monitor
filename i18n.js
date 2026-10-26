// UI strings. English is the default; the user can switch with the flags in the popup.
const STRINGS = {
  en: {
    badgeTitleOn: 'Stay on Monitor: ON, locked to monitor {n}',
    badgeTitleOff: 'Stay on Monitor: off',
    disconnected: 'Stay on Monitor: ON (chosen monitor is disconnected)',
    statusPrefix: 'Monitor lock is',
    statusOnWord: 'enabled',
    statusOffWord: 'disabled',
    monitorLabel: 'Monitor',
    primary: 'main',
    shortcutHint: 'Shortcut: Alt+Shift+F',
    supportTitle: '❤ Help keep Stay on Monitor alive',
    supportText: 'Free and ad-free. If this helped you, consider leaving a tip!',
    star: 'Star on GitHub',
    kofi: 'Ko-fi',
    paypal: 'PayPal',
    sponsors: 'Sponsor',
    pix: 'Pix',
    pixCopied: 'Key copied!',
  },
  pt: {
    badgeTitleOn: 'Stay on Monitor: LIGADO, fixo no monitor {n}',
    badgeTitleOff: 'Stay on Monitor: desligado',
    disconnected: 'Stay on Monitor: LIGADO (o monitor escolhido está desconectado)',
    statusPrefix: 'Monitor fixo está',
    statusOnWord: 'ligado',
    statusOffWord: 'desligado',
    monitorLabel: 'Monitor',
    primary: 'principal',
    shortcutHint: 'Atalho: Alt+Shift+F',
    supportTitle: '❤ Ajude o Stay on Monitor a continuar no ar',
    supportText: 'Gratuito e sem anúncios. Se isso te ajudou, considere deixar um trocado!',
    star: 'Estrela no GitHub',
    kofi: 'Ko-fi',
    paypal: 'PayPal',
    sponsors: 'Patrocinar',
    pix: 'Pix',
    pixCopied: 'Chave copiada!',
  },
};

async function getLang() {
  const { lang } = await chrome.storage.local.get('lang');
  return STRINGS[lang] ? lang : 'en';
}

function translate(lang, key, vars = {}) {
  const s = STRINGS[lang][key] ?? STRINGS.en[key] ?? key;
  return s.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? '');
}
