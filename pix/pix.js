const AMOUNTS = [5, 10, 20, 50, 100];
const OTHER = 'other';

let lang = 'en';
let selected = 10;
let payload = '';

const t = (key, vars) => translate(lang, key, vars);
const $amounts = document.getElementById('amounts');
const $customRow = document.getElementById('customRow');
const $custom = document.getElementById('custom');
const $qr = document.getElementById('qr');
const $value = document.getElementById('value');

const brl = (n) => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function currentAmount() {
  if (selected !== OTHER) return selected;
  const n = Math.round(parseFloat($custom.value.replace(',', '.')) * 100) / 100;
  return n > 0 ? n : 0;
}

function renderChips() {
  $amounts.innerHTML = '';
  [...AMOUNTS, OTHER].forEach((a) => {
    const b = document.createElement('button');
    b.className = 'chip';
    b.setAttribute('role', 'radio');
    b.setAttribute('aria-checked', String(a === selected));
    b.textContent = a === OTHER ? t('pixOther') : `R$ ${a}`;
    b.addEventListener('click', () => {
      selected = a;
      renderChips();
      $customRow.hidden = a !== OTHER;
      if (a === OTHER) $custom.focus();
      renderQr();
    });
    $amounts.append(b);
  });
}

function renderQr() {
  const amount = currentAmount();
  payload = pixPayload({
    key: SUPPORT.pixKey,
    name: SUPPORT.pixName,
    city: SUPPORT.pixCity,
    amount,
  });
  const qr = qrcode(0, 'M');
  qr.addData(payload);
  qr.make();
  $qr.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 0 });
  // No amount = payer types it in their bank app
  $value.textContent = amount > 0 ? brl(amount) : t('pixAnyAmount');
}

async function copy(btn, text, labelKey) {
  await navigator.clipboard.writeText(text);
  btn.textContent = t('pixCopied');
  setTimeout(() => { btn.textContent = t(labelKey); }, 2000);
}

document.getElementById('copyCode').addEventListener('click', (e) => copy(e.target, payload, 'pixCopyCode'));
document.getElementById('copyKey').addEventListener('click', (e) => copy(e.target, SUPPORT.pixKey, 'pixCopyKey'));
$custom.addEventListener('input', renderQr);

(async () => {
  lang = await getLang();
  document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en';
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  renderChips();
  renderQr();
})();
