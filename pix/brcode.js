// Builds a static Pix "BR Code" (EMV QR payload), the same text used by
// "Pix Copia e Cola". Spec: Banco Central do Brasil, Manual do BR Code.

function tlv(id, value) {
  return id + String(value.length).padStart(2, '0') + value;
}

// CRC16-CCITT (poly 0x1021, init 0xFFFF)
function crc16(str) {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

// Merchant name/city must be plain ASCII, no accents
function cleanText(s, max) {
  return (s || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9 ]/g, '')
    .toUpperCase()
    .trim()
    .slice(0, max);
}

function pixPayload({ key, name, city, amount }) {
  let p =
    tlv('00', '01') +
    tlv('26', tlv('00', 'br.gov.bcb.pix') + tlv('01', key)) +
    tlv('52', '0000') +
    tlv('53', '986');
  if (amount > 0) p += tlv('54', amount.toFixed(2));
  p +=
    tlv('58', 'BR') +
    tlv('59', cleanText(name, 25) || 'DONATION') +
    tlv('60', cleanText(city, 15) || 'BRASIL') +
    tlv('62', tlv('05', '***')) +
    '6304';
  return p + crc16(p);
}

if (typeof module !== 'undefined') module.exports = { pixPayload, crc16 };
