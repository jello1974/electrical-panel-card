/*
 * Electrical Panel Card — electrical panel card for Home Assistant (Lovelace)
 * Realistic SVG breaker panel: RCDs, breakers, meters, blanks — with a visual editor.
 * Languages: English (default) and Română. Set `language: auto` to follow the Home Assistant language.
 * No external dependencies. License: MIT.
 */
const VERSION = '1.0.0';
const SW = 108;   // latimea unui slot (unitati SVG)
const MH = 200;   // inaltimea unui modul
const SQ3 = Math.sqrt(3);

const MODELS = {
  mcb1:  { type: 'breaker', poles: 1, slots: 1, v: 230 },
  mcb2:  { type: 'breaker', poles: 2, slots: 2, v: 230 },
  mcb3:  { type: 'breaker', poles: 3, slots: 3, v: 400 },
  mcb4:  { type: 'breaker', poles: 4, slots: 4, v: 400 },
  rcbo:  { type: 'rcbo',    poles: 2, slots: 2, v: 230 },
  rcd2:  { type: 'rcd',     poles: 2, slots: 2, v: 230 },
  rcd4:  { type: 'rcd',     poles: 4, slots: 4, v: 400 },
  main:  { type: 'main',    poles: 2, slots: 2, v: 230 },
  meter: { type: 'meter',   poles: 2, slots: 2, v: 230 },
  blank: { type: 'blank',   poles: 1, slots: 1, v: 230 },
};

const THEMES = {
  dark: {
    encA: '#3a3f48', encB: '#23262c', encStroke: '#5a606b', backA: '#1c1f24', backB: '#14161a',
    plate: '#0e1013', plateStroke: '#5a606b', plateText: '#e9f9ff', label: '#8fa0b3',
    ductA: '#4a505a', ductB: '#2f343b', rib: '#101215', screw: '#6b717c',
  },
  light: {
    encA: '#e6e9ee', encB: '#c7ccd4', encStroke: '#9aa1ac', backA: '#f2f4f7', backB: '#dfe3e9',
    plate: '#ffffff', plateStroke: '#9aa1ac', plateText: '#1d2025', label: '#4b5563',
    ductA: '#b4bbc6', ductB: '#8f97a3', rib: '#5d646e', screw: '#8a919c',
  },
};
const COL = { on: '#35e07a', off: '#ff4d4d', na: '#777777', warn: '#ffc53d', bad: '#ff4d4d' };

/* ---------- translations (add a new language by copying the "en" block) ---------- */
const I18N = {
  en: {
    'lang.name': 'English',
    title: 'ELECTRICAL PANEL',
    'err.rows': 'The configuration must contain "rows" (a list of rows, each with "modules").',
    'dlg.off.title': 'Turn off this breaker?', 'dlg.on.title': 'Turn on this breaker?',
    'dlg.current': 'Current consumption: {v}',
    'dlg.warn': 'Turning this off cuts power to the circuits it protects.',
    'dlg.off': 'Turn off', 'dlg.on': 'Turn on', 'dlg.cancel': 'Cancel',
    'stub.row': 'Row 1', 'stub.rcd': 'RCD', 'stub.sockets': 'Sockets', 'stub.lights': 'Lights',
    'model.mcb1': 'Circuit breaker 1P', 'model.mcb2': 'Circuit breaker 2P (1P+N)', 'model.mcb3': 'Circuit breaker 3P',
    'model.mcb4': 'Circuit breaker 4P (3P+N)', 'model.rcbo': 'RCBO (1P+N)', 'model.rcd2': 'RCD 2P', 'model.rcd4': 'RCD 4P',
    'model.main': 'Main switch', 'model.meter': 'Meter / consumption display', 'model.blank': 'Blank cover',
    blank_chip: 'blank',
    'name.breaker': 'Breaker', 'name.rcd': 'RCD', 'name.main': 'Main', 'name.meter': 'Meter',
    'ed.general': 'General settings', 'ed.title': 'Title', 'ed.language': 'Language', 'ed.lang.auto': 'Automatic (follow Home Assistant language)',
    'ed.theme': 'Theme', 'ed.theme.dark': 'Dark', 'ed.theme.light': 'Light',
    'ed.columns': 'Modules per rail (empty = auto)', 'ed.auto': 'auto', 'ed.eg': 'e.g.',
    'ed.max': 'Default max consumption (W)', 'ed.display': 'LCD display',
    'ed.display.power': 'Power (W / kW)', 'ed.display.current': 'Current (A)',
    'ed.show_title': 'Show title', 'ed.show_ducts': 'Cable ducts', 'ed.show_lcd': 'LCD with consumption',
    'ed.show_ratings': 'Show breaker rating', 'ed.fill_blanks': 'Fill rails with blank covers',
    'ed.readonly': 'Read-only (no switching)', 'ed.confirm': 'Ask before turning on/off (all breakers)',
    'ed.row_label': 'Row {n} – label', 'ed.row_up': 'Move row up', 'ed.row_down': 'Move row down',
    'ed.row_del': 'Delete row', 'ed.row_del_confirm': 'Delete the whole row and its modules?',
    'ed.row_empty': 'Empty row – add a module below.', 'ed.add_module': '+ Add module', 'ed.add_row': '+ Add row',
    'ed.module': 'Module {n}', 'ed.left': 'Move left', 'ed.right': 'Move right', 'ed.dup': 'Duplicate', 'ed.del': 'Delete',
    'ed.model': 'Model', 'ed.name': 'Name (on the label; \\n = new line)', 'ed.curve': 'Trip curve',
    'ed.amps': 'Max current (A)', 'ed.voltage': 'Voltage (V)', 'ed.sens': 'Sensitivity (mA)', 'ed.poles': 'Poles',
    'ed.slots': 'Slots used', 'ed.rating': 'Module text (override)',
    'ed.ent.switch': 'Switch entity (switch/light)', 'ed.ent.power': 'Consumption sensor (W)', 'ed.ent.power_total': 'Total power sensor',
    'ed.ent.energy': 'Energy sensor (kWh) – optional', 'ed.ent.voltage': 'Voltage sensor (V) – optional',
    'ed.ent.current': 'Current sensor (A) – optional', 'ed.ent.temp': 'Temperature sensor – optional',
    'ed.sensors_hint': 'Voltage, current and temperature show on the LCD only when set. Without a consumption sensor, power is computed as voltage × current (1P/2P only).',
    'ed.hint.rated': 'Rated power: {kw} kW ({k}{v} V × {a} A) · yellow from {y} W · red from {r} W',
    'ed.hint.manual': 'Max power: {m} W (set the current rating to compute it automatically) · yellow from {y} W · red from {r} W',
    'ed.max_over': 'Max consumption (W) – override', 'ed.yellow': 'Yellow threshold (W)', 'ed.red': 'Red threshold (W)',
    'ed.t_yellow': 'Temperature – yellow threshold (°C)', 'ed.t_red': 'Temperature – red threshold (°C)',
    'ed.mod_display': 'LCD display (module)', 'ed.same_general': 'Same as general settings',
    'ed.tap': 'On tap', 'ed.tap.toggle': 'Toggle', 'ed.tap.more': 'Open details', 'ed.tap.none': 'Nothing',
    'ed.handle': 'Handle color', 'ed.confirm_mod': 'Confirm on toggle', 'ed.confirm.yes': 'Ask (turn on and off)',
    'ed.confirm.no': 'Don\u2019t ask', 'ed.confirm_off': 'Ask only when turning off',
  },
  ro: {
    'lang.name': 'Română',
    title: 'TABLOU ELECTRIC',
    'err.rows': 'Configurația trebuie să conțină „rows” (o listă de rânduri, fiecare cu „modules”).',
    'dlg.off.title': 'Oprești siguranța?', 'dlg.on.title': 'Pornești siguranța?',
    'dlg.current': 'Consum curent: {v}',
    'dlg.warn': 'Oprirea întrerupe alimentarea circuitelor protejate de acest modul.',
    'dlg.off': 'Oprește', 'dlg.on': 'Pornește', 'dlg.cancel': 'Anulează',
    'stub.row': 'Rândul 1', 'stub.rcd': 'Diferențial', 'stub.sockets': 'Prize', 'stub.lights': 'Lumini',
    'model.mcb1': 'Siguranță automată 1P', 'model.mcb2': 'Siguranță automată 2P (1P+N)', 'model.mcb3': 'Siguranță automată 3P',
    'model.mcb4': 'Siguranță automată 4P (3P+N)', 'model.rcbo': 'Siguranță diferențială RCBO (1P+N)', 'model.rcd2': 'Diferențial 2P', 'model.rcd4': 'Diferențial 4P',
    'model.main': 'Întrerupător general', 'model.meter': 'Contor / afișaj consum', 'model.blank': 'Capac gol',
    blank_chip: 'gol',
    'name.breaker': 'Siguranță', 'name.rcd': 'Diferențial', 'name.main': 'General', 'name.meter': 'Contor',
    'ed.general': 'Setări generale', 'ed.title': 'Titlu', 'ed.language': 'Limbă', 'ed.lang.auto': 'Automată (limba din Home Assistant)',
    'ed.theme': 'Temă', 'ed.theme.dark': 'Întunecată', 'ed.theme.light': 'Luminoasă',
    'ed.columns': 'Module pe șină (gol = auto)', 'ed.auto': 'auto', 'ed.eg': 'ex:',
    'ed.max': 'Consum maxim implicit (W)', 'ed.display': 'Afișaj în LCD',
    'ed.display.power': 'Putere (W / kW)', 'ed.display.current': 'Curent (A)',
    'ed.show_title': 'Afișează titlul', 'ed.show_ducts': 'Canale de cabluri', 'ed.show_lcd': 'Fereastra LCD cu consum',
    'ed.show_ratings': 'Amperaj pe siguranță', 'ed.fill_blanks': 'Completează cu capace goale',
    'ed.readonly': 'Doar citire (fără comutare)', 'ed.confirm': 'Întreabă înainte de pornire/oprire (toate siguranțele)',
    'ed.row_label': 'Rândul {n} – etichetă', 'ed.row_up': 'Mută rândul mai sus', 'ed.row_down': 'Mută rândul mai jos',
    'ed.row_del': 'Șterge rândul', 'ed.row_del_confirm': 'Ștergi tot rândul și modulele lui?',
    'ed.row_empty': 'Rând gol – adaugă un modul mai jos.', 'ed.add_module': '+ Adaugă modul', 'ed.add_row': '+ Adaugă rând',
    'ed.module': 'Modulul {n}', 'ed.left': 'Mută la stânga', 'ed.right': 'Mută la dreapta', 'ed.dup': 'Duplică', 'ed.del': 'Șterge',
    'ed.model': 'Model', 'ed.name': 'Nume (pe plăcuță; \\n = rând nou)', 'ed.curve': 'Curbă de declanșare',
    'ed.amps': 'Amperaj maxim (A)', 'ed.voltage': 'Tensiune (V)', 'ed.sens': 'Sensibilitate (mA)', 'ed.poles': 'Poli',
    'ed.slots': 'Sloturi ocupate', 'ed.rating': 'Text pe modul (suprascrie)',
    'ed.ent.switch': 'Entitate comutare (switch/light)', 'ed.ent.power': 'Senzor consum (W)', 'ed.ent.power_total': 'Senzor putere totală',
    'ed.ent.energy': 'Senzor energie (kWh) – opțional', 'ed.ent.voltage': 'Senzor tensiune (V) – opțional',
    'ed.ent.current': 'Senzor curent (A) – opțional', 'ed.ent.temp': 'Senzor temperatură – opțional',
    'ed.sensors_hint': 'Tensiunea, curentul și temperatura apar în LCD doar dacă sunt setate. Fără senzor de consum, puterea se calculează din tensiune × curent (doar la 1P/2P).',
    'ed.hint.rated': 'Putere nominală: {kw} kW ({k}{v} V × {a} A) · galben de la {y} W · roșu de la {r} W',
    'ed.hint.manual': 'Putere maximă: {m} W (setează amperajul ca să se calculeze automat) · galben de la {y} W · roșu de la {r} W',
    'ed.max_over': 'Consum maxim (W) – suprascrie', 'ed.yellow': 'Prag galben (W)', 'ed.red': 'Prag roșu (W)',
    'ed.t_yellow': 'Temperatură – prag galben (°C)', 'ed.t_red': 'Temperatură – prag roșu (°C)',
    'ed.mod_display': 'Afișaj LCD (modul)', 'ed.same_general': 'Ca în setările generale',
    'ed.tap': 'La atingere', 'ed.tap.toggle': 'Comută', 'ed.tap.more': 'Deschide detalii', 'ed.tap.none': 'Nimic',
    'ed.handle': 'Culoare mâner', 'ed.confirm_mod': 'Confirmare la comutare', 'ed.confirm.yes': 'Întreabă (pornire și oprire)',
    'ed.confirm.no': 'Nu întreba', 'ed.confirm_off': 'Întreabă doar la oprire',
  },
};

/** Translate a key; falls back to English, then to the key itself. {vars} are substituted. */
function tr(lang, key, vars) {
  const d = I18N[lang] || I18N.en;
  let t = d[key] !== undefined ? d[key] : (I18N.en[key] !== undefined ? I18N.en[key] : key);
  if (vars) Object.keys(vars).forEach((k) => { t = t.split(`{${k}}`).join(vars[k]); });
  return t;
}

/** Language selection. Default is English. `language: auto` follows the Home Assistant language; `en` / `ro` force one. */
function pickLang(cfg, hass) {
  const c = cfg && cfg.language;
  if (c && c !== 'auto' && I18N[c]) return c;
  if (c === 'auto') {
    const l = String((hass && hass.language) || (typeof navigator !== 'undefined' && navigator.language) || 'en').slice(0, 2).toLowerCase();
    return I18N[l] ? l : 'en';
  }
  return 'en';
}


const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function wrapName(text, maxChars) {
  text = String(text || '').replace(/\\n/g, '\n');
  if (text.includes('\n')) return text.split('\n').slice(0, 3);
  const lines = []; let cur = '';
  for (const w of text.split(/\s+/).filter(Boolean)) {
    const t = (cur ? cur + ' ' : '') + w;
    if (t.length <= maxChars) cur = t; else { if (cur) lines.push(cur); cur = w; }
  }
  if (cur) lines.push(cur);
  return lines.slice(0, 3);
}

/** Completeaza un modul din config cu valorile derivate (model, sloturi, putere maxima, praguri, text rating). */
function resolveModule(m, cfgMax) {
  cfgMax = parseFloat(cfgMax) || 6000;
  const legacy = {
    breaker: 'mcb' + Math.min(4, Math.max(1, parseInt(m.poles, 10) || 1)),
    rcd: parseInt(m.poles, 10) === 4 ? 'rcd4' : 'rcd2',
    rcbo: 'rcbo', main: 'main', meter: 'meter', blank: 'blank',
  };
  const id = (m.model && MODELS[m.model]) ? m.model : (legacy[m.type || 'breaker'] || 'mcb1');
  const b = MODELS[id];
  const r = Object.assign({}, m);
  r.model = id;
  r.type = m.type || b.type;
  r.poles = parseInt(m.poles, 10) || b.poles;
  r.slots = Math.max(1, parseInt(m.slots, 10) || b.slots);
  const amps = parseFloat(m.amps) || 0;
  const V = parseFloat(m.voltage) || b.v || 230;
  const k = r.poles >= 3 ? SQ3 : 1;
  r._V = V; r._amps = amps; r._k = k; r._showSpec = !!m.voltage && r.type !== 'meter';
  r._hasVA = !!(m.voltage_sensor || m.current_sensor);
  r._hasT = !!m.temp_sensor;
  r._lines = (r._hasVA ? 1 : 0) + (r._hasT ? 1 : 0);
  const max = parseFloat(m.max) || (amps ? Math.round(V * amps * k) : cfgMax);
  r._max = max;
  r._yel = parseFloat(m.yellow) || 0.6 * max;
  r._red = parseFloat(m.red) || 0.8 * max;
  let rating = m.rating;
  if (rating === undefined || rating === null || rating === '') {
    if (r.type === 'breaker') rating = amps ? `${m.curve || ''}${amps}` : '';
    else if (r.type === 'rcbo') rating = amps ? `${m.curve || ''}${amps}` + (m.sensitivity ? ` ${m.sensitivity}mA` : '') : 'RCBO';
    else if (r.type === 'rcd') rating = ['RCD', amps ? `${amps}A` : '', m.sensitivity ? `${m.sensitivity}mA` : ''].filter(Boolean).join(' ');
    else if (r.type === 'main') rating = amps ? `${amps}A` : '';
    else rating = '';
  }
  r._rating = String(rating);
  return r;
}

/** Normalizeaza configuratia si calculeaza pozitiile. */
function layout(config, lang) {
  const cfg = Object.assign({
    show_title: true, theme: 'dark', show_ducts: true,
    show_lcd: true, show_ratings: true, fill_blanks: true, readonly: false,
    max: 6000, display: 'power',
  }, config);
  if (cfg.title === undefined) cfg.title = tr(lang || 'en', 'title');
  const rows = (cfg.rows || []).map((r) => {
    const row = Array.isArray(r) ? { modules: r } : r;
    return { label: row.label || '', mods: (row.modules || []).map((m) => resolveModule(m, cfg.max)) };
  });
  const sum = (r) => r.mods.reduce((a, m) => a + m.slots, 0);
  const columns = Math.max(parseInt(cfg.columns || 0, 10) || 0, 3, ...rows.map(sum));
  if (cfg.fill_blanks) {
    rows.forEach((r) => {
      let used = sum(r);
      while (used < columns) { r.mods.push(resolveModule({ type: 'blank', model: 'blank' }, cfg.max)); used++; }
    });
  }
  const X0 = 30;
  const W = X0 * 2 + columns * SW;
  let y = cfg.show_title ? 75 : 32;
  const list = [];
  const rowInfo = rows.map((r) => {
    const labelH = r.label ? 22 : 0;
    const y0 = y + labelH;
    const nl = Math.max(0, ...r.mods.filter((m) => m.type !== 'meter' && m.type !== 'blank').map((m) => m._lines));
    const extra = nl === 0 ? 0 : 16 + (nl - 1) * 12;
    const mh = MH + extra;
    let slot = 0;
    r.mods.forEach((m) => {
      m.mh = mh; m.extra = extra;
      m.x = X0 + slot * SW + 2; m.w = m.slots * SW - 4; m.cx = m.x + m.w / 2; m.y0 = y0;
      m.idx = list.length; list.push(m);
      slot += m.slots;
    });
    const info = { label: r.label, y0, labelY: y0 - 7, mh };
    y = y0 + mh + (cfg.show_ducts ? 45 : 22);
    return info;
  });
  return { cfg, W, H: y + 5, X0, columns, rows: rowInfo, mods: list };
}

function buildSvg(L, uid) {
  const { cfg, W, H, X0 } = L;
  const T = THEMES[cfg.theme] || THEMES.dark;
  const F = 'font-family="Roboto,Helvetica,Arial,sans-serif"';
  const o = [];
  const a = (s) => o.push(s);
  const id = (n) => `${n}${uid}`;
  a(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent">`);
  a(`<defs>
<linearGradient id="${id('enc')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${T.encA}"/><stop offset="1" stop-color="${T.encB}"/></linearGradient>
<linearGradient id="${id('back')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${T.backA}"/><stop offset="1" stop-color="${T.backB}"/></linearGradient>
<linearGradient id="${id('mod')}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#c9ccd2"/><stop offset=".3" stop-color="#f4f5f7"/><stop offset=".7" stop-color="#e6e7ea"/><stop offset="1" stop-color="#b9bcc3"/></linearGradient>
<linearGradient id="${id('blank')}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2b2f36"/><stop offset=".4" stop-color="#3b4049"/><stop offset="1" stop-color="#262a30"/></linearGradient>
<linearGradient id="${id('rail')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d7dbe2"/><stop offset=".5" stop-color="#8e95a0"/><stop offset="1" stop-color="#5d636c"/></linearGradient>
<linearGradient id="${id('duct')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${T.ductA}"/><stop offset="1" stop-color="${T.ductB}"/></linearGradient>
<linearGradient id="${id('term')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8b919b"/><stop offset="1" stop-color="#5a5f68"/></linearGradient>
<linearGradient id="${id('lcd')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0d0f"/><stop offset="1" stop-color="#1a2024"/></linearGradient>
<linearGradient id="${id('knob')}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7b818c"/><stop offset="1" stop-color="#2a2d33"/></linearGradient>
</defs>`);
  a(`<rect x="4" y="4" width="${W - 8}" height="${H - 8}" rx="16" fill="url(#${id('enc')})" stroke="${T.encStroke}" stroke-width="2"/>`);
  a(`<rect x="14" y="14" width="${W - 28}" height="${H - 28}" rx="10" fill="url(#${id('back')})" stroke="#000" stroke-opacity=".6" stroke-width="2"/>`);
  [[22, 22], [W - 22, 22], [22, H - 22], [W - 22, H - 22]].forEach(([sx, sy]) => {
    a(`<circle cx="${sx}" cy="${sy}" r="5" fill="${T.screw}"/><path d="M${sx - 3.5} ${sy}H${sx + 3.5}" stroke="#222" stroke-width="1.6"/>`);
  });
  if (cfg.show_title) {
    const tw = Math.max(200, String(cfg.title).length * 15 + 50);
    a(`<rect x="${W / 2 - tw / 2}" y="22" width="${tw}" height="30" rx="4" fill="${T.plate}" stroke="${T.plateStroke}"/>`);
    a(`<text x="${W / 2}" y="43" text-anchor="middle" ${F} font-size="15" font-weight="700" letter-spacing="4" fill="${T.plateText}">${esc(cfg.title)}</text>`);
    [60, W - 60].forEach((tx) => {
      a(`<path d="M${tx} 26 L${tx + 18} 56 L${tx - 18} 56 Z" fill="#ffc53d" stroke="#222" stroke-width="2" stroke-linejoin="round"/><path d="M${tx + 2} 33 L${tx - 4} 45 H${tx + 2} L${tx - 1} 53 L${tx + 8} 41 H${tx + 2} Z" fill="#222"/>`);
    });
  }
  const term = (x, y, w) => {
    a(`<rect x="${x + 10}" y="${y}" width="${w - 20}" height="11" rx="2" fill="url(#${id('term')})" stroke="#333" stroke-width=".8"/>`);
    a(`<circle cx="${x + w / 2}" cy="${y + 5.5}" r="3.6" fill="#2a2d33"/><path d="M${x + w / 2 - 2.6} ${y + 5.5}H${x + w / 2 + 2.6}" stroke="#9aa0aa" stroke-width="1.2"/>`);
  };

  L.rows.forEach((ri) => {
    const y0 = ri.y0;
    if (ri.label) a(`<text x="${X0 + 4}" y="${ri.labelY}" ${F} font-size="11" font-weight="700" letter-spacing="3" fill="${T.label}">${esc(String(ri.label).toUpperCase())}</text>`);
    const ry = y0 + ri.mh / 2 - 9;
    a(`<rect x="${X0 - 6}" y="${ry}" width="${W - 2 * X0 + 12}" height="18" fill="url(#${id('rail')})" stroke="#333" stroke-width=".8"/>`);
    for (let sx = X0 + 10; sx < W - X0 - 10; sx += 24) a(`<rect x="${sx}" y="${ry + 6}" width="10" height="6" rx="3" fill="#15171b"/>`);
    if (cfg.show_ducts) {
      const dy = y0 + ri.mh + 10;
      a(`<rect x="${X0 - 6}" y="${dy}" width="${W - 2 * X0 + 12}" height="24" rx="3" fill="url(#${id('duct')})" stroke="#111"/>`);
      for (let sx = X0; sx < W - X0 - 4; sx += 9) a(`<rect x="${sx}" y="${dy + 4}" width="4" height="16" rx="1.5" fill="${T.rib}"/>`);
    }
  });

  L.mods.forEach((m) => {
    const { x, w, cx, y0 } = m;
    if (m.type === 'blank') {
      a(`<rect x="${x}" y="${y0}" width="${w}" height="${m.mh}" rx="5" fill="url(#${id('blank')})" stroke="#111" stroke-width="1.2"/>`);
      a(`<rect x="${x + 6}" y="${y0 + 6}" width="${w - 12}" height="${m.mh - 12}" rx="3" fill="none" stroke="#fff" stroke-opacity=".07"/>`);
      return;
    }
    const pw = w - 16;
    a(`<g data-i="${m.idx}">`);
    a(`<rect x="${x}" y="${y0}" width="${w}" height="${m.mh}" rx="5" fill="url(#${id('mod')})" stroke="#6b6f78" stroke-width="1.2"/>`);
    term(x, y0 + 5, w); term(x, y0 + m.mh - 16, w);
    if (m._showSpec) {
      const spec = [`${m._V}V`, (m.type !== 'meter' ? `${m.poles}P` : '')].filter(Boolean).join(' · ');
      a(`<text x="${cx}" y="${y0 + 24}" text-anchor="middle" ${F} font-size="8" font-weight="600" fill="#666">${esc(spec)}</text>`);
    }
    if (cfg.show_ratings !== false && m._rating) {
      a(`<text x="${cx}" y="${y0 + 36}" text-anchor="middle" ${F} font-size="16" font-weight="800" fill="#1d2025">${esc(m._rating)}</text>`);
    }
    a(`<line x1="${x + 10}" y1="${y0 + 42}" x2="${x + w - 10}" y2="${y0 + 42}" stroke="#000" stroke-opacity=".2"/>`);

    if (m.type === 'meter') {
      const ly = y0 + 48, lh = 66;
      a(`<rect x="${x + 8}" y="${ly}" width="${pw}" height="${lh}" rx="3" fill="url(#${id('lcd')})" stroke="#000" stroke-width="1"/>`);
      a(`<text class="lcdt" x="${cx}" y="${ly + 21}" text-anchor="middle" font-family="monospace" font-size="${w > 150 ? 20 : 15}" font-weight="700" fill="${COL.on}">--</text>`);
      a(`<text class="lcde" x="${cx}" y="${ly + 33}" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#9aa7a0"></text>`);
      a(`<text class="lcds" x="${cx}" y="${ly + 45}" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700"><tspan class="lv"></tspan><tspan class="lc"></tspan></text>`);
      a(`<text class="lt" x="${cx}" y="${ly + 57}" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#ffb27f"></text>`);
      a(`<rect x="${x + 14}" y="${ly + lh - 5}" width="${pw - 12}" height="3" rx="1.5" fill="#fff" fill-opacity=".12"/>`);
      a(`<rect class="lcdb" x="${x + 14}" y="${ly + lh - 5}" width="0" height="3" rx="1.5" fill="${COL.on}" data-maxw="${pw - 12}"/>`);
    } else {
      const rcdStyle = (m.type === 'rcd' || m.type === 'rcbo') && w >= 150;
      const n = m.type === 'breaker' ? Math.max(1, Math.min(m.poles, Math.floor(w / 44))) : 1;
      const pitch = w / n;
      const sy = y0 + 44;
      const kf = m.handle_color ? esc(m.handle_color) : (m.type === 'main' ? '#e8a33d' : `url(#${id('knob')})`);
      let shift = 0;
      if (rcdStyle) {
        a(`<rect x="${cx + 34}" y="${y0 + 62}" width="34" height="22" rx="5" fill="#e8a33d" stroke="#8a5a10"/>`);
        a(`<text x="${cx + 51}" y="${y0 + 77}" text-anchor="middle" ${F} font-size="10" font-weight="800" fill="#222">TEST</text>`);
        a(`<text x="${cx - 64}" y="${y0 + 72}" ${F} font-size="9" font-weight="700" fill="#555">I = ON</text>`);
        a(`<text x="${cx - 64}" y="${y0 + 84}" ${F} font-size="9" font-weight="700" fill="#555">O = OFF</text>`);
        shift = -8;
      }
      for (let k = 0; k < n; k++) {
        const lx = (n === 1 ? cx : x + pitch * (k + 0.5)) + shift;
        a(`<rect x="${lx - 18}" y="${sy}" width="36" height="66" rx="6" fill="#0f1114" stroke="#000" stroke-width="1.5"/>`);
        a(`<rect x="${lx - 16}" y="${sy + 2}" width="32" height="62" rx="5" fill="none" stroke="#fff" stroke-opacity=".08"/>`);
        a(`<g class="knob" style="transform:translateY(14px);transition:transform .25s ease">`);
        if (k < n - 1) a(`<rect x="${lx + 14}" y="${sy + 14}" width="${pitch - 28}" height="8" fill="#2a2d33" stroke="#000" stroke-width=".8"/>`);
        a(`<rect x="${lx - 14}" y="${sy + 4}" width="28" height="30" rx="4" fill="${kf}" stroke="#000" stroke-width="1"/>`);
        a(`<line x1="${lx - 10}" y1="${sy + 11}" x2="${lx + 10}" y2="${sy + 11}" stroke="#fff" stroke-opacity=".25" stroke-width="2"/>`);
        a(`<circle class="ledg" cx="${lx}" cy="${sy + 23}" r="9" fill="${COL.na}" fill-opacity=".25"/><circle class="led" cx="${lx}" cy="${sy + 23}" r="5" fill="${COL.na}"/>`);
        a(`</g>`);
      }
      if (cfg.show_lcd !== false) {
        const ly = y0 + 159, lh = 22 + m.extra;
        // continutul (putere + bara + senzori) se centreaza vertical in LCD, in functie de cate randuri are modulul
        const own = m._lines === 0 ? 0 : 16 + (m._lines - 1) * 12;
        const dy = (m.extra - own) / 2;
        a(`<rect x="${x + 8}" y="${ly}" width="${pw}" height="${lh}" rx="3" fill="url(#${id('lcd')})" stroke="#000" stroke-width="1"/>`);
        a(`<text class="lcdt" x="${cx}" y="${ly + 14 + dy}" text-anchor="middle" font-family="monospace" font-size="${w > 150 ? 15 : 13}" font-weight="700" fill="${COL.on}">--</text>`);
        a(`<rect x="${x + 14}" y="${ly + 17.5 + dy}" width="${pw - 12}" height="2.5" rx="1" fill="#fff" fill-opacity=".12"/>`);
        a(`<rect class="lcdb" x="${x + 14}" y="${ly + 17.5 + dy}" width="0" height="2.5" rx="1" fill="${COL.on}" data-maxw="${pw - 12}"/>`);
        if (m._hasVA) a(`<text class="lcds" x="${cx}" y="${ly + 32 + dy}" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700"><tspan class="lv"></tspan><tspan class="lc"></tspan></text>`);
        if (m._hasT) a(`<text class="lt" x="${cx}" y="${ly + (m._hasVA ? 44 : 32) + dy}" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#ffb27f"></text>`);
      }
    }
    const mc = Math.floor(pw / (12 * 0.58));
    const lines = wrapName(m.name, mc);
    const fs = lines.length >= 3 ? 10 : (lines.length === 2 ? 12 : 13);
    a(`<rect x="${x + 8}" y="${y0 + 118}" width="${pw}" height="36" rx="2" fill="#fff" stroke="#999" stroke-width=".8"/>`);
    const th = lines.length * fs * 1.15, c = y0 + 136;
    lines.forEach((ln, k) => {
      a(`<text x="${cx}" y="${c - th / 2 + fs * 0.85 + k * fs * 1.15}" text-anchor="middle" ${F} font-size="${fs}" font-weight="${k === 0 ? 700 : 600}" fill="#16181c">${esc(ln)}</text>`);
    });
    a(`<rect class="hit" x="${x}" y="${y0 + 44}" width="${w}" height="112" fill="#000" fill-opacity="0" style="cursor:${m.entity ? 'pointer' : 'default'};touch-action:manipulation"/>`);
    a(`</g>`);
  });
  a('</svg>');
  return o.join('\n');
}

/* ---------- fereastra de confirmare ---------- */
function confirmDialog(o) {
  return new Promise((resolve) => {
    const host = document.createElement('div');
    const root = host.attachShadow({ mode: 'open' });
    const col = o.turnOn ? COL.on : COL.off;
    const ky = 7 + (o.turnOn ? 4 : 32);
    root.innerHTML = `
<style>
*{box-sizing:border-box}
.ov{position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.55);-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px);animation:f .15s ease}
.dlg{width:min(340px,calc(100vw - 32px));background:var(--card-background-color,#1c1c1c);color:var(--primary-text-color,#fff);border-radius:var(--ha-card-border-radius,16px);box-shadow:0 12px 40px rgba(0,0,0,.5);padding:22px 20px 16px;text-align:center;font-family:var(--paper-font-body1_-_font-family,Roboto,Arial,sans-serif);animation:p .18s ease}
svg{display:block;margin:0 auto 10px}
h2{margin:0 0 8px;font-size:18px;font-weight:600}
.nm{font-size:15px;font-weight:600;word-break:break-word}
.sub{font-size:13px;color:var(--secondary-text-color,#aaa);margin-top:4px}
.warn{margin-top:12px;font-size:12.5px;line-height:1.35;color:#ffb74d;background:rgba(255,183,77,.12);border-radius:8px;padding:8px 10px}
.btns{display:flex;gap:10px;margin-top:18px}
button{flex:1;padding:11px 8px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;border:1px solid var(--divider-color,#555);background:transparent;color:var(--primary-text-color,#fff);font-family:inherit}
button:hover{filter:brightness(1.15)}
button.ok{background:${col};border-color:${col};color:${o.turnOn ? '#06210f' : '#fff'}}
button:focus-visible{outline:2px solid var(--primary-color,#03a9f4);outline-offset:2px}
@keyframes f{from{opacity:0}}
@keyframes p{from{opacity:0;transform:scale(.92) translateY(8px)}}
</style>
<div class="ov"><div class="dlg" role="dialog" aria-modal="true">
<svg width="56" height="80" viewBox="0 0 56 80">
<rect x="0.5" y="0.5" width="55" height="79" rx="7" fill="#e9eaee" stroke="#9aa0aa"/>
<rect x="10" y="7" width="36" height="66" rx="6" fill="#0f1114"/>
<rect x="14" y="${ky}" width="28" height="30" rx="4" fill="#5b616c" stroke="#000"/>
<circle cx="28" cy="${ky + 19}" r="9" fill="${col}" fill-opacity=".25"/><circle cx="28" cy="${ky + 19}" r="5" fill="${col}"/>
</svg>
<h2>${esc(o.title)}</h2>
<div class="nm">${esc(o.name)}</div>
${o.info ? `<div class="sub">${esc(o.info)}</div>` : ''}
${o.warn ? `<div class="warn">${esc(o.warn)}</div>` : ''}
<div class="btns"><button class="cancel">${esc(o.cancelText)}</button><button class="ok">${esc(o.okText)}</button></div>
</div></div>`;
    const done = (v) => { document.removeEventListener('keydown', onKey, true); host.remove(); resolve(v); };
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); done(false); } };
    root.querySelector('.cancel').addEventListener('click', () => done(false));
    root.querySelector('.ok').addEventListener('click', () => done(true));
    root.querySelector('.ov').addEventListener('click', (e) => { if (e.target === e.currentTarget) done(false); });
    document.addEventListener('keydown', onKey, true);
    document.body.appendChild(host);
    setTimeout(() => { const b = root.querySelector('.cancel'); if (b) b.focus(); }, 30);
  });
}

/* ===================================================================== */
/*  CARDUL                                                                */
/* ===================================================================== */
class ElectricalPanelCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._uid = Math.random().toString(36).slice(2, 7);
  }

  setConfig(config) {
    if (!config || !Array.isArray(config.rows)) {
      throw new Error(tr(pickLang(null, null), 'err.rows'));
    }
    this._config = config;
    this._lang = pickLang(config, this._hass);
    this._L = layout(config, this._lang);
    this._build();
  }

  set hass(hass) {
    this._hass = hass;
    const l = pickLang(this._config, hass);
    if (l !== this._lang) {
      this._lang = l;
      if (this._config && this._config.title === undefined) { this._L = layout(this._config, l); this._build(); }
    }
    this._update();
  }
  getCardSize() { return Math.max(4, Math.round(this._L.H / 50)); }

  static getConfigElement() { return document.createElement('electrical-panel-card-editor'); }
  static getStubConfig() {
    const l = pickLang(null, null);
    return {
      rows: [{
        label: tr(l, 'stub.row'),
        modules: [
          { model: 'rcd2', name: tr(l, 'stub.rcd'), amps: 40, sensitivity: 30, voltage: 230 },
          { model: 'mcb1', name: tr(l, 'stub.sockets'), curve: 'C', amps: 16, voltage: 230 },
          { model: 'mcb1', name: tr(l, 'stub.lights'), curve: 'B', amps: 10, voltage: 230 },
        ],
      }],
    };
  }

  _build() {
    const L = this._L;
    this.shadowRoot.innerHTML = `<ha-card><div>${buildSvg(L, this._uid)}</div></ha-card>`;
    this._refs = {};
    L.mods.forEach((m) => {
      if (m.type === 'blank') return;
      const g = this.shadowRoot.querySelector(`[data-i="${m.idx}"]`);
      if (!g) return;
      this._refs[m.idx] = {
        m, knobs: [...g.querySelectorAll('.knob')], leds: [...g.querySelectorAll('.led')], ledgs: [...g.querySelectorAll('.ledg')],
        lcdt: g.querySelector('.lcdt'), lcde: g.querySelector('.lcde'), lcdb: g.querySelector('.lcdb'),
        lv: g.querySelector('.lv'), lc: g.querySelector('.lc'), lt: g.querySelector('.lt'), sig: null,
      };
      const hit = g.querySelector('.hit');
      let timer = null, fired = false;
      const clear = () => { if (timer) { clearTimeout(timer); timer = null; } };
      hit.addEventListener('pointerdown', () => { fired = false; clear(); timer = setTimeout(() => { fired = true; this._act(m, true); }, 500); });
      hit.addEventListener('pointerup', () => { clear(); if (!fired) this._act(m, false); });
      hit.addEventListener('pointerleave', clear);
      hit.addEventListener('pointercancel', clear);
      hit.addEventListener('contextmenu', (e) => e.preventDefault());
    });
    if (this._hass) this._update();
  }

  async _act(m, hold) {
    if (!m.entity || !this._hass) return;
    if (hold || this._config.readonly || m.tap_action === 'more-info') {
      const ev = new Event('hass-more-info', { bubbles: true, composed: true });
      ev.detail = { entityId: m.entity };
      this.dispatchEvent(ev);
      return;
    }
    if (m.tap_action === 'none') return;
    const st = this._hass.states[m.entity];
    const isOn = !!st && st.state === 'on';
    const ask = (m.confirm !== undefined && m.confirm !== '' && m.confirm !== null) ? !!m.confirm : !!this._config.confirm;
    if (ask || (isOn && m.confirm_off)) {
      if (this._dlg) return;
      const w = m.power ? this._num(m.power) : null;
      this._dlg = true;
      const ok = await confirmDialog({
        title: tr(this._lang, isOn ? 'dlg.off.title' : 'dlg.on.title'),
        name: m.name || m.entity,
        info: isOn && w !== null ? tr(this._lang, 'dlg.current', { v: w >= 1000 ? (w / 1000).toFixed(2) + ' kW' : Math.round(w) + ' W' }) : '',
        warn: isOn && ['rcd', 'rcbo', 'main'].includes(m.type) ? tr(this._lang, 'dlg.warn') : '',
        turnOn: !isOn,
        okText: tr(this._lang, isOn ? 'dlg.off' : 'dlg.on'),
        cancelText: tr(this._lang, 'dlg.cancel'),
      });
      this._dlg = false;
      if (!ok) return;
    }
    this._hass.callService('homeassistant', 'toggle', { entity_id: m.entity });
  }

  _scaled(entityId, base) {
    const s = entityId && this._hass.states[entityId];
    if (!s) return null;
    let v = parseFloat(s.state);
    if (isNaN(v)) return null;
    const u = s.attributes.unit_of_measurement;
    if (u === 'm' + base) v /= 1000; else if (u === 'k' + base) v *= 1000;
    return v;
  }

  _num(entityId) {
    const s = entityId && this._hass.states[entityId];
    if (!s) return null;
    let v = parseFloat(s.state);
    if (isNaN(v)) return null;
    const u = s.attributes.unit_of_measurement;
    if (u === 'kW') v *= 1000; else if (u === 'mW') v /= 1000;
    return v;
  }

  _update() {
    if (!this._hass || !this._refs) return;
    const H = this._hass, cfg = this._L.cfg;
    Object.values(this._refs).forEach((r) => {
      const m = r.m;
      const es = m.entity ? H.states[m.entity] : null;
      const ps = m.power ? H.states[m.power] : null;
      const xs = m.energy ? H.states[m.energy] : null;
      const vss = m.voltage_sensor ? H.states[m.voltage_sensor] : null;
      const css = m.current_sensor ? H.states[m.current_sensor] : null;
      const tss = m.temp_sensor ? H.states[m.temp_sensor] : null;
      const sig = `${es ? es.state : '-'}|${ps ? ps.state : '-'}|${xs ? xs.state : '-'}|${vss ? vss.state : '-'}|${css ? css.state : '-'}|${tss ? tss.state : '-'}`;
      if (sig === r.sig) return;
      r.sig = sig;
      const state = !m.entity ? 'on' : (!es || es.state === 'unavailable' || es.state === 'unknown') ? 'na' : es.state === 'on' ? 'on' : 'off';
      const c0 = COL[state];
      r.knobs.forEach((k) => { k.style.transform = `translateY(${state === 'on' ? 0 : state === 'off' ? 28 : 14}px)`; });
      r.leds.forEach((l) => l.setAttribute('fill', c0));
      r.ledgs.forEach((l) => l.setAttribute('fill', c0));
      if (r.lcdt) {
        const isMeter = m.type === 'meter';
        const offLike = state === 'off' && !isMeter;
        let txt, col = COL.on, pct = 0;
        const vVal = this._scaled(m.voltage_sensor, 'V'), iVal = this._scaled(m.current_sensor, 'A');
        const derived = !m.power && vVal !== null && iVal !== null && m.poles < 3;
        const w = derived ? vVal * iVal : (m.power ? this._num(m.power) : null);
        const hasP = !!m.power || derived;
        if (state === 'na' && !isMeter) { txt = 'N/A'; col = COL.na; }
        else if (hasP) {
          if (w === null) { txt = 'N/A'; col = COL.na; }
          else {
            const mode = m.display || cfg.display || 'power';
            if (offLike) txt = 'OFF';
            else if (mode === 'current') { const i = iVal !== null ? iVal : w / (m._V * m._k); txt = `${i.toFixed(i < 10 ? 1 : 0)} A`; }
            else txt = w >= 1000 ? `${(w / 1000).toFixed(2)} kW` : `${Math.round(w)} W`;
            col = offLike ? COL.off : (w >= m._red ? COL.bad : w >= m._yel ? COL.warn : COL.on);
            pct = offLike ? 0 : Math.max(0, Math.min(1, w / m._max));
          }
        } else { txt = state === 'on' ? 'ON' : state === 'off' ? 'OFF' : 'N/A'; col = COL[state]; }
        r.lcdt.textContent = txt; r.lcdt.setAttribute('fill', col);
        if (r.lcdb) { r.lcdb.setAttribute('width', (pct * parseFloat(r.lcdb.dataset.maxw)).toFixed(1)); r.lcdb.setAttribute('fill', col); }
      }
      if (r.lv && r.lc) {
        const vVal = this._scaled(m.voltage_sensor, 'V'), iVal = this._scaled(m.current_sensor, 'A');
        let vc = '#7fd4ff';
        if (vVal !== null) { const d = Math.abs(vVal - m._V) / m._V; vc = d > 0.15 ? COL.bad : d > 0.10 ? COL.warn : vc; }
        let ic = '#8dffaa';
        if (iVal !== null && m._amps) ic = iVal >= m._amps ? COL.bad : iVal >= 0.8 * m._amps ? COL.warn : ic;
        r.lv.textContent = vVal !== null ? `${vVal.toFixed(vVal >= 100 ? 0 : 1)}V` : '';
        r.lv.setAttribute('fill', vc);
        r.lc.textContent = iVal !== null ? `${iVal.toFixed(iVal >= 100 ? 0 : 1)}A` : '';
        r.lc.setAttribute('fill', ic);
        r.lc.setAttribute('dx', vVal !== null && iVal !== null ? 8 : 0);
      }
      if (r.lt) {
        const tv = tss ? parseFloat(tss.state) : NaN;
        if (isNaN(tv)) r.lt.textContent = '';
        else {
          const u = tss.attributes.unit_of_measurement || '°C';
          const tc = u === '°F' ? (tv - 32) / 1.8 : u === 'K' ? tv - 273.15 : tv;
          const ty = parseFloat(m.temp_yellow) || 60, tr = parseFloat(m.temp_red) || 80;
          r.lt.textContent = `${tv.toFixed(1)}${u}`;
          r.lt.setAttribute('fill', tc >= tr ? COL.bad : tc >= ty ? COL.warn : '#ffb27f');
        }
      }
      if (r.lcde) {
        r.lcde.textContent = xs && !isNaN(parseFloat(xs.state)) ? `${parseFloat(xs.state).toFixed(1)} ${xs.attributes.unit_of_measurement || 'kWh'}` : '';
      }
    });
  }
}

/* ===================================================================== */
/*  EDITORUL VIZUAL                                                       */
/* ===================================================================== */
function el(tag, o, ...kids) {
  o = o || {};
  const n = document.createElement(tag);
  if (o.class) n.className = o.class;
  if (o.text !== undefined) n.textContent = o.text;
  if (o.style) n.setAttribute('style', o.style);
  Object.entries(o.attrs || {}).forEach(([k, v]) => n.setAttribute(k, v));
  Object.entries(o.props || {}).forEach(([k, v]) => { n[k] = v; });
  Object.entries(o.on || {}).forEach(([k, f]) => n.addEventListener(k, f));
  kids.flat().forEach((c) => { if (c !== null && c !== undefined) n.append(c); });
  return n;
}

const EDITOR_CSS = `
:host{display:block;color:var(--primary-text-color)}
*{box-sizing:border-box}
.sec{border:1px solid var(--divider-color);border-radius:10px;margin:0 0 12px;overflow:hidden}
.sec>h3{margin:0;padding:12px 14px;font-size:14px;font-weight:600;cursor:pointer;display:flex;justify-content:space-between;background:var(--secondary-background-color)}
.sec .body{padding:12px 14px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:10px;margin-bottom:10px}
label.f{display:flex;flex-direction:column;gap:3px;font-size:12px;color:var(--secondary-text-color)}
label.c{display:flex;align-items:center;gap:6px;font-size:13px;color:var(--primary-text-color)}
input[type=text],input[type=number],select{padding:8px;border:1px solid var(--divider-color);border-radius:6px;background:var(--card-background-color);color:var(--primary-text-color);font-size:14px;width:100%}
input[type=color]{width:100%;height:36px;border:1px solid var(--divider-color);border-radius:6px;background:var(--card-background-color);padding:2px}
button{padding:7px 11px;border:1px solid var(--divider-color);border-radius:6px;background:var(--card-background-color);color:var(--primary-text-color);cursor:pointer;font-size:13px}
button:hover{border-color:var(--primary-color)}
button.p{background:var(--primary-color);color:var(--text-primary-color,#fff);border-color:var(--primary-color)}
button.d{color:var(--error-color,#db4437)}
.bar{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin:8px 0}
.bar .sp{flex:1}
.strip{display:grid;gap:4px;margin:10px 0;padding:8px;background:#23262c;border-radius:8px}
.chip{min-width:0;height:54px;padding:4px;border:2px solid transparent;border-radius:5px;background:#e3e5e9;color:#1d2025;font-size:11px;line-height:1.1;overflow:hidden;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center}
.chip small{font-size:10px;opacity:.7}
.chip.t-rcd,.chip.t-rcbo{background:#cfd6e4}.chip.t-main{background:#f0cf94}.chip.t-meter{background:#bfe3c9}.chip.t-blank{background:#3a3f48;color:#aaa}
.chip.sel{border-color:var(--primary-color);box-shadow:0 0 0 2px var(--primary-color)}
.mf{border:1px dashed var(--divider-color);border-radius:8px;padding:12px;margin-top:8px}
.hint{font-size:12px;color:var(--secondary-text-color);margin:2px 0 10px}
.rowbox{border:1px solid var(--divider-color);border-radius:10px;padding:12px;margin-bottom:12px}
.ent{min-width:0}
.ent input{margin-top:3px}
`;

class ElectricalPanelCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._sel = { r: 0, m: 0 };
    this._genOpen = true;
    this._addModel = 'mcb1';
    this._chips = {};
    this._lang = 'en';
  }

  _t(k, v) { return tr(this._lang, k, v); }

  setConfig(cfg) {
    const s = JSON.stringify(cfg || {});
    if (s === this._json) return;
    this._json = s;
    this._config = JSON.parse(s);
    this._lang = pickLang(this._config, this._hass);
    this._normalize();
    this._render();
  }

  set hass(h) {
    const first = !this._hass;
    this._hass = h;
    const l = pickLang(this._config, h);
    if (this._config && l !== this._lang) { this._lang = l; this._render(); }
    this.shadowRoot.querySelectorAll('ha-entity-picker').forEach((p) => { p.hass = h; });
    if (first) this._ensurePickers();
  }

  async _ensurePickers() {
    try {
      if (customElements.get('ha-entity-picker')) return;
      const helpers = await window.loadCardHelpers();
      const c = await helpers.createCardElement({ type: 'entities', entities: [] });
      if (c && c.constructor && c.constructor.getConfigElement) await c.constructor.getConfigElement();
      await customElements.whenDefined('ha-entity-picker');
      this._render();
    } catch (e) { /* ramane campul simplu cu lista de sugestii */ }
  }

  _normalize() {
    const c = this._config;
    c.rows = (c.rows || []).map((r) => (Array.isArray(r) ? { modules: r } : r));
    c.rows.forEach((r) => { r.modules = r.modules || []; });
    if (!c.rows.length) c.rows.push({ label: '', modules: [] });
    if (this._sel.r >= c.rows.length) this._sel = { r: 0, m: 0 };
  }

  _clean() {
    const c = JSON.parse(JSON.stringify(this._config));
    c.type = c.type || 'custom:electrical-panel-card';
    ['columns', 'max'].forEach((k) => { if (c[k] === '' || c[k] === null || Number.isNaN(c[k])) delete c[k]; });
    c.rows = c.rows.map((r) => {
      const row = { modules: r.modules.map((m) => {
        const x = {};
        Object.entries(m).forEach(([k, v]) => { if (v !== '' && v !== null && v !== undefined && !(typeof v === 'number' && Number.isNaN(v))) x[k] = v; });
        return x;
      }) };
      if (r.label) row.label = r.label;
      return row;
    });
    return c;
  }

  _emit() {
    const cfg = this._clean();
    this._json = JSON.stringify(cfg);
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: cfg }, bubbles: true, composed: true }));
  }

  /* ---------- campuri ---------- */
  _text(label, value, cb, o = {}) {
    const inp = el('input', { attrs: { type: o.number ? 'number' : 'text', placeholder: o.placeholder || '', ...(o.list ? { list: o.list } : {}), ...(o.step ? { step: o.step } : {}), ...(o.min !== undefined ? { min: o.min } : {}) } });
    inp.value = value === undefined || value === null ? '' : value;
    inp.addEventListener('input', () => {
      if (o.number) cb(inp.value === '' ? '' : parseFloat(inp.value)); else cb(inp.value);
      this._emit();
    });
    const f = el('label', { class: 'f' }, el('span', { text: label }), inp);
    f._input = inp;
    return f;
  }

  _select(label, opts, value, cb) {
    const s = el('select', {}, opts.map((o) => el('option', { text: o.t, attrs: { value: o.v } })));
    s.value = value === undefined || value === null ? '' : String(value);
    s.addEventListener('change', () => cb(s.value));
    return el('label', { class: 'f' }, el('span', { text: label }), s);
  }

  _check(label, value, cb) {
    const i = el('input', { attrs: { type: 'checkbox' } });
    i.checked = !!value;
    i.addEventListener('change', () => { cb(i.checked); this._emit(); });
    return el('label', { class: 'c' }, i, el('span', { text: label }));
  }

  _entity(label, value, domains, cb) {
    const wrap = el('div', { class: 'ent' });
    if (customElements.get('ha-entity-picker')) {
      const p = document.createElement('ha-entity-picker');
      p.hass = this._hass; p.label = label; p.value = value || ''; p.allowCustomEntity = true;
      if (domains) p.includeDomains = domains;
      p.addEventListener('value-changed', (e) => { e.stopPropagation(); cb(e.detail.value || ''); this._emit(); });
      wrap.append(p);
    } else {
      const id = 'dl' + Math.random().toString(36).slice(2, 7);
      const inp = el('input', { attrs: { type: 'text', placeholder: this._t('ed.eg') + ' ' + (domains ? domains[0] : 'sensor') + '.name', list: id } });
      inp.value = value || '';
      const dl = el('datalist', { attrs: { id } });
      if (this._hass) Object.keys(this._hass.states).filter((k) => !domains || domains.includes(k.split('.')[0])).slice(0, 4000).forEach((k) => dl.append(el('option', { attrs: { value: k } })));
      inp.addEventListener('change', () => { cb(inp.value.trim()); this._emit(); });
      wrap.append(el('label', { class: 'f' }, el('span', { text: label }), inp), dl);
    }
    return wrap;
  }

  /* ---------- randare ---------- */
  _render() {
    const root = this.shadowRoot;
    root.innerHTML = '';
    this._chips = {};
    root.append(el('style', { text: EDITOR_CSS }));
    root.append(this._general());
    this._config.rows.forEach((row, ri) => root.append(this._rowBox(row, ri)));
    root.append(el('div', { class: 'bar' },
      el('button', { class: 'p', text: this._t('ed.add_row'), on: { click: () => {
        this._config.rows.push({ label: '', modules: [] });
        this._sel = { r: this._config.rows.length - 1, m: 0 };
        this._emit(); this._render();
      } } })));
  }

  _general() {
    const c = this._config;
    const sec = el('div', { class: 'sec' });
    const h = el('h3', { on: { click: () => { this._genOpen = !this._genOpen; this._render(); } } }, el('span', { text: this._t('ed.general') }), el('span', { text: this._genOpen ? '▾' : '▸' }));
    sec.append(h);
    if (!this._genOpen) return sec;
    const body = el('div', { class: 'body' });
    const g = el('div', { class: 'grid' });
    g.append(
      this._text(this._t('ed.title'), c.title === undefined ? tr(this._lang, 'title') : c.title, (v) => { c.title = v; }),
      this._select(this._t('ed.language'), Object.keys(I18N).map((k) => ({ v: k, t: I18N[k]['lang.name'] || k })).concat([{ v: 'auto', t: this._t('ed.lang.auto') }]), c.language || 'en', (v) => {
        if (v === 'en') delete c.language; else c.language = v;
        this._lang = pickLang(c, this._hass); this._emit(); this._render();
      }),
      this._select(this._t('ed.theme'), [{ v: 'dark', t: this._t('ed.theme.dark') }, { v: 'light', t: this._t('ed.theme.light') }], c.theme || 'dark', (v) => { c.theme = v; this._emit(); }),
      this._text(this._t('ed.columns'), c.columns, (v) => { c.columns = v; }, { number: true, min: 3, placeholder: this._t('ed.auto') }),
      this._text(this._t('ed.max'), c.max, (v) => { c.max = v; }, { number: true, placeholder: '6000' }),
      this._select(this._t('ed.display'), [{ v: 'power', t: this._t('ed.display.power') }, { v: 'current', t: this._t('ed.display.current') }], c.display || 'power', (v) => { c.display = v; this._emit(); }),
    );
    body.append(g);
    const ck = el('div', { class: 'grid' });
    const flag = (k, label, def) => this._check(label, c[k] === undefined ? def : c[k], (v) => { c[k] = v; });
    ck.append(
      flag('show_title', this._t('ed.show_title'), true), flag('show_ducts', this._t('ed.show_ducts'), true),
      flag('show_lcd', this._t('ed.show_lcd'), true), flag('show_ratings', this._t('ed.show_ratings'), true),
      flag('fill_blanks', this._t('ed.fill_blanks'), true), flag('readonly', this._t('ed.readonly'), false),
      flag('confirm', this._t('ed.confirm'), false),
    );
    body.append(ck);
    sec.append(body);
    return sec;
  }

  _rowBox(row, ri) {
    const c = this._config;
    const box = el('div', { class: 'rowbox' });
    const head = el('div', { class: 'bar' });
    const lbl = this._text(this._t('ed.row_label', { n: ri + 1 }), row.label || '', (v) => { row.label = v; });
    lbl.style.flex = '1';
    head.append(lbl,
      el('button', { text: '↑', attrs: { title: this._t('ed.row_up') }, on: { click: () => this._moveRow(ri, -1) } }),
      el('button', { text: '↓', attrs: { title: this._t('ed.row_down') }, on: { click: () => this._moveRow(ri, 1) } }),
      el('button', { class: 'd', text: this._t('ed.row_del'), on: { click: () => {
        if (!window.confirm(this._t('ed.row_del_confirm'))) return;
        c.rows.splice(ri, 1); this._normalize(); this._emit(); this._render();
      } } }));
    box.append(head);

    const sum = Math.max(...c.rows.map((r) => r.modules.reduce((a, m) => a + resolveModule(m, c.max).slots, 0)), 0);
    const cols = Math.max(parseInt(c.columns, 10) || 0, sum, 3);
    const strip = el('div', { class: 'strip', style: `grid-template-columns:repeat(${cols},1fr)` });
    row.modules.forEach((m, mi) => {
      const chip = el('button', { class: 'chip', on: { click: () => { this._sel = { r: ri, m: mi }; this._render(); } } });
      this._chips[`${ri}-${mi}`] = chip;
      this._fillChip(chip, m);
      if (this._sel.r === ri && this._sel.m === mi) chip.classList.add('sel');
      strip.append(chip);
    });
    box.append(strip);
    if (!row.modules.length) box.append(el('div', { class: 'hint', text: this._t('ed.row_empty') }));

    const add = el('div', { class: 'bar' });
    const sel = el('select', {}, Object.entries(MODELS).map(([k]) => el('option', { text: this._t('model.' + k), attrs: { value: k } })));
    sel.value = this._addModel;
    sel.addEventListener('change', () => { this._addModel = sel.value; });
    add.append(sel, el('button', { class: 'p', text: this._t('ed.add_module'), on: { click: () => {
      row.modules.push(this._newModule(this._addModel));
      this._sel = { r: ri, m: row.modules.length - 1 };
      this._emit(); this._render();
    } } }));
    box.append(add);

    if (this._sel.r === ri && row.modules[this._sel.m]) box.append(this._moduleForm(row, ri, this._sel.m));
    return box;
  }

  _fillChip(chip, m) {
    const r = resolveModule(m, this._config.max);
    chip.className = `chip t-${r.type}` + (chip.classList.contains('sel') ? ' sel' : '');
    chip.style.gridColumn = `span ${r.slots}`;
    chip.textContent = '';
    if (r.type === 'blank') { chip.append(el('span', { text: this._t('blank_chip') })); return; }
    chip.append(el('span', { text: m.name || this._t('model.' + r.model) }), el('small', { text: r._rating }));
  }

  _newModule(model) {
    const b = MODELS[model];
    const m = { model };
    if (model === 'blank') return m;
    m.name = this._t(model === 'meter' ? 'name.meter' : (b.type === 'rcd' ? 'name.rcd' : b.type === 'main' ? 'name.main' : 'name.breaker'));
    if (b.type !== 'meter') m.voltage = b.v;
    if (b.type === 'breaker' || b.type === 'rcbo') { m.curve = 'C'; m.amps = 16; }
    if (b.type === 'rcd') { m.amps = 40; m.sensitivity = 30; }
    if (b.type === 'rcbo') m.sensitivity = 30;
    if (b.type === 'main') m.amps = 63;
    return m;
  }

  _moveRow(ri, d) {
    const rows = this._config.rows, j = ri + d;
    if (j < 0 || j >= rows.length) return;
    [rows[ri], rows[j]] = [rows[j], rows[ri]];
    this._sel = { r: j, m: 0 };
    this._emit(); this._render();
  }

  _moduleForm(row, ri, mi) {
    const m = row.modules[mi];
    const r0 = resolveModule(m, this._config.max);
    const t = r0.type;
    const box = el('div', { class: 'mf' });
    const refresh = () => {
      const r = resolveModule(m, this._config.max);
      const kw = (r._max / 1000).toFixed(2);
      hint.textContent = r._amps
        ? this._t('ed.hint.rated', { kw, k: r._k > 1 ? '√3 × ' : '', v: r._V, a: r._amps, y: Math.round(r._yel), r: Math.round(r._red) })
        : this._t('ed.hint.manual', { m: Math.round(r._max), y: Math.round(r._yel), r: Math.round(r._red) });
      if (ymax) { ymax._input.placeholder = String(Math.round(r._max)); yyel._input.placeholder = String(Math.round(r._yel)); yred._input.placeholder = String(Math.round(r._red)); }
      const chip = this._chips[`${ri}-${mi}`]; if (chip) { chip.classList.add('sel'); this._fillChip(chip, m); }
    };
    const hint = el('div', { class: 'hint' });
    let ymax, yyel, yred;

    // bara de actiuni
    box.append(el('div', { class: 'bar' },
      el('strong', { text: this._t('ed.module', { n: mi + 1 }) }), el('span', { class: 'sp' }),
      el('button', { text: '◀', attrs: { title: this._t('ed.left') }, on: { click: () => this._moveMod(row, ri, mi, -1) } }),
      el('button', { text: '▶', attrs: { title: this._t('ed.right') }, on: { click: () => this._moveMod(row, ri, mi, 1) } }),
      el('button', { text: this._t('ed.dup'), on: { click: () => { row.modules.splice(mi + 1, 0, JSON.parse(JSON.stringify(m))); this._sel = { r: ri, m: mi + 1 }; this._emit(); this._render(); } } }),
      el('button', { class: 'd', text: this._t('ed.del'), on: { click: () => { row.modules.splice(mi, 1); this._sel = { r: ri, m: Math.max(0, mi - 1) }; this._emit(); this._render(); } } })));

    // model
    const g1 = el('div', { class: 'grid' });
    g1.append(this._select(this._t('ed.model'), Object.entries(MODELS).map(([k]) => ({ v: k, t: this._t('model.' + k) })), r0.model, (v) => {
      const b = MODELS[v];
      m.model = v; delete m.type; delete m.poles; delete m.slots;
      if (b.type !== 'blank' && b.type !== 'meter') m.voltage = b.v;
      if ((b.type === 'breaker' || b.type === 'rcbo') && !m.curve) m.curve = 'C';
      this._emit(); this._render();
    }));
    box.append(g1);
    if (t === 'blank') return box;

    const g = el('div', { class: 'grid' });
    g.append(this._text(this._t('ed.name'), m.name, (v) => { m.name = v; refresh(); }));
    if (t === 'breaker' || t === 'rcbo') {
      g.append(this._select(this._t('ed.curve'), [{ v: '', t: '—' }, { v: 'B', t: 'B' }, { v: 'C', t: 'C' }, { v: 'D', t: 'D' }], m.curve || '', (v) => { m.curve = v; this._emit(); refresh(); }));
    }
    if (t !== 'meter') {
      g.append(this._text(this._t('ed.amps'), m.amps, (v) => { m.amps = v; refresh(); }, { number: true, min: 0, placeholder: this._t('ed.eg') + ' 16' }));
      g.append(this._text(this._t('ed.voltage'), m.voltage, (v) => { m.voltage = v; refresh(); }, { number: true, min: 0, placeholder: String(r0._V), list: 'volt' }));
      g.append(el('datalist', { attrs: { id: 'volt' } }, ['12', '24', '48', '110', '230', '400'].map((v) => el('option', { attrs: { value: v } }))));
    }
    if (t === 'rcd' || t === 'rcbo') g.append(this._text(this._t('ed.sens'), m.sensitivity, (v) => { m.sensitivity = v; refresh(); }, { number: true, placeholder: '30' }));
    if (t === 'breaker') {
      g.append(this._select(this._t('ed.poles'), [1, 2, 3, 4].map((n) => ({ v: n, t: `${n}P` })), m.poles || r0.poles, (v) => { m.poles = parseInt(v, 10); this._emit(); this._render(); }));
    }
    g.append(this._text(this._t('ed.slots'), m.slots, (v) => { m.slots = v; refresh(); }, { number: true, min: 1, placeholder: String(r0.slots) }));
    g.append(this._text(this._t('ed.rating'), m.rating, (v) => { m.rating = v; refresh(); }, { placeholder: r0._rating || this._t('ed.auto') }));
    box.append(g);

    // entitati
    const ge = el('div', { class: 'grid' });
    if (t !== 'meter') ge.append(this._entity(this._t('ed.ent.switch'), m.entity, ['switch', 'light', 'input_boolean', 'fan'], (v) => { m.entity = v; }));
    ge.append(this._entity(this._t(t === 'meter' ? 'ed.ent.power_total' : 'ed.ent.power'), m.power, ['sensor'], (v) => { m.power = v; }));
    if (t === 'meter') ge.append(this._entity(this._t('ed.ent.energy'), m.energy, ['sensor'], (v) => { m.energy = v; }));
    ge.append(this._entity(this._t('ed.ent.voltage'), m.voltage_sensor, ['sensor'], (v) => { m.voltage_sensor = v; }));
    ge.append(this._entity(this._t('ed.ent.current'), m.current_sensor, ['sensor'], (v) => { m.current_sensor = v; }));
    ge.append(this._entity(this._t('ed.ent.temp'), m.temp_sensor, ['sensor'], (v) => { m.temp_sensor = v; }));
    box.append(ge);
    box.append(el('div', { class: 'hint', text: this._t('ed.sensors_hint') }));

    // consum
    box.append(hint);
    const gc = el('div', { class: 'grid' });
    ymax = this._text(this._t('ed.max_over'), m.max, (v) => { m.max = v; refresh(); }, { number: true, min: 0 });
    yyel = this._text(this._t('ed.yellow'), m.yellow, (v) => { m.yellow = v; refresh(); }, { number: true, min: 0 });
    yred = this._text(this._t('ed.red'), m.red, (v) => { m.red = v; refresh(); }, { number: true, min: 0 });
    gc.append(ymax, yyel, yred);
    gc.append(this._text(this._t('ed.t_yellow'), m.temp_yellow, (v) => { m.temp_yellow = v; }, { number: true, placeholder: '60' }));
    gc.append(this._text(this._t('ed.t_red'), m.temp_red, (v) => { m.temp_red = v; }, { number: true, placeholder: '80' }));
    gc.append(this._select(this._t('ed.mod_display'), [{ v: '', t: this._t('ed.same_general') }, { v: 'power', t: this._t('ed.display.power') }, { v: 'current', t: this._t('ed.display.current') }], m.display || '', (v) => { m.display = v; this._emit(); }));
    box.append(gc);

    // comportament
    if (t !== 'meter') {
      const go = el('div', { class: 'grid' });
      go.append(this._select(this._t('ed.tap'), [{ v: '', t: this._t('ed.tap.toggle') }, { v: 'more-info', t: this._t('ed.tap.more') }, { v: 'none', t: this._t('ed.tap.none') }], m.tap_action || '', (v) => { m.tap_action = v; this._emit(); }));
      if (t === 'breaker' || t === 'main') {
        const col = el('input', { attrs: { type: 'color' } });
        col.value = m.handle_color || (t === 'main' ? '#e8a33d' : '#4a4f59');
        col.addEventListener('input', () => { m.handle_color = col.value; this._emit(); });
        go.append(el('label', { class: 'f' }, el('span', { text: this._t('ed.handle') }), col));
      }
      go.append(this._select(this._t('ed.confirm_mod'), [{ v: '', t: this._t('ed.same_general') }, { v: 'true', t: this._t('ed.confirm.yes') }, { v: 'false', t: this._t('ed.confirm.no') }],
        m.confirm === undefined || m.confirm === '' ? '' : String(m.confirm),
        (v) => { if (v === '') delete m.confirm; else m.confirm = (v === 'true'); this._emit(); }));
      go.append(this._check(this._t('ed.confirm_off'), m.confirm_off, (v) => { m.confirm_off = v; }));
      box.append(go);
    }
    refresh();
    return box;
  }

  _moveMod(row, ri, mi, d) {
    const j = mi + d;
    if (j < 0 || j >= row.modules.length) return;
    [row.modules[mi], row.modules[j]] = [row.modules[j], row.modules[mi]];
    this._sel = { r: ri, m: j };
    this._emit(); this._render();
  }
}

if (typeof customElements !== 'undefined') {
  if (typeof console !== 'undefined') console.info(`%c ELECTRICAL-PANEL-CARD %c v${VERSION} `, 'background:#e8a33d;color:#000;font-weight:700', 'background:#333;color:#fff');
  if (!customElements.get('electrical-panel-card')) customElements.define('electrical-panel-card', ElectricalPanelCard);
  if (!customElements.get('tablou-electric-card')) customElements.define('tablou-electric-card', class extends ElectricalPanelCard {}); // deprecated alias of the previous name
  if (!customElements.get('electrical-panel-card-editor')) customElements.define('electrical-panel-card-editor', ElectricalPanelCardEditor);
  window.customCards = window.customCards || [];
  if (!window.customCards.some((c) => c.type === 'electrical-panel-card')) {
    window.customCards.push({
      type: 'electrical-panel-card', name: 'Electrical Panel Card',
      description: 'Realistic electrical panel (SVG): breakers, RCDs, meter, visual editor. EN / RO. · Tablou electric realist: siguranțe, diferențiale, contor, editor vizual.',
      documentationURL: 'https://github.com/YOUR_GITHUB_USER/electrical-panel-card',
    });
  }
}
if (typeof module !== 'undefined') module.exports = { layout, buildSvg, resolveModule, MODELS, tr, pickLang, I18N, VERSION };
