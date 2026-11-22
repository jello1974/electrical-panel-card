// Checks that every language has exactly the same translation keys as English,
// and that the card file loads. Run: node scripts/check-i18n.js
global.HTMLElement = class {};
global.customElements = { get: () => true };
global.window = {};
const { I18N, VERSION } = require('../dist/electrical-panel-card.js');
const keys = (o) => Object.keys(o).sort();
const en = keys(I18N.en);
let bad = 0;
for (const [lang, dict] of Object.entries(I18N)) {
  const k = keys(dict);
  const missing = en.filter((x) => !k.includes(x));
  const extra = k.filter((x) => !en.includes(x));
  if (missing.length || extra.length) {
    bad++;
    console.error(`[${lang}] missing: ${missing.join(', ') || '-'} | extra: ${extra.join(', ') || '-'}`);
  } else {
    console.log(`[${lang}] OK (${k.length} keys)`);
  }
}
console.log(`Card version: ${VERSION}`);
process.exit(bad ? 1 : 0);
