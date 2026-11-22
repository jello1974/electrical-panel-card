// Generates docs/preview.svg and docs/preview-light.svg from the real card renderer.
// Run: node scripts/generate-preview.js
const fs = require('fs');
const path = require('path');
global.HTMLElement = class {};
global.customElements = { get: () => true };
global.window = {};
const { layout, buildSvg } = require('../dist/electrical-panel-card.js');

const cfg = {
  title: 'ELECTRICAL PANEL', columns: 5,
  rows: [
    { label: 'Main · Kitchen', modules: [
      { model: 'rcd2', name: 'Main RCD', amps: 40, sensitivity: 30, voltage: 230, voltage_sensor: 's', current_sensor: 's', temp_sensor: 's' },
      { model: 'mcb1', name: 'Kitchen sockets', curve: 'C', amps: 16, voltage: 230, voltage_sensor: 's', current_sensor: 's' },
      { model: 'mcb1', name: 'Kitchen lights', curve: 'B', amps: 10, voltage: 230 },
      { model: 'mcb1', name: 'Oven', curve: 'C', amps: 20, voltage: 230, temp_sensor: 's' } ] },
    { label: 'Living room', modules: [
      { model: 'mcb1', name: 'Sockets', curve: 'C', amps: 16, voltage: 230 },
      { model: 'mcb1', name: 'Lights', curve: 'B', amps: 10, voltage: 230 },
      { model: 'mcb1', name: 'TV & media', curve: 'C', amps: 10, voltage: 230 },
      { model: 'mcb2', name: 'Heat pump', curve: 'C', amps: 25, voltage: 230, voltage_sensor: 's', current_sensor: 's' } ] },
    { label: 'EV · Services', modules: [
      { model: 'rcd2', name: 'EV charger', amps: 40, sensitivity: 30, voltage: 230 },
      { model: 'mcb1', name: 'Garage', curve: 'B', amps: 10, voltage: 230 },
      { model: 'mcb1', name: 'Gate', curve: 'B', amps: 10, voltage: 230 } ] },
  ],
};
// sample live values by module name: [state, watts, volts, amps, temp]
const SAMPLE = {
  'Main RCD': ['on', 1580, 231, 6.8, 38.5], 'Kitchen sockets': ['on', 1150, 230, 5.0],
  'Kitchen lights': ['on', 62], 'Oven': ['off', 0, null, null, 24.0],
  'Sockets': ['on', 240], 'Lights': ['off', 0], 'TV & media': ['on', 118], 'Heat pump': ['on', 3340, 229, 14.6],
  'EV charger': ['on', 7400], 'Garage': ['on', 14], 'Gate': ['off', 0],
};
const COL = { on: '#35e07a', off: '#ff4d4d', warn: '#ffc53d', bad: '#ff4d4d' };

function render(theme, file) {
  const L = layout(Object.assign({}, cfg, { theme }), 'en');
  let svg = buildSvg(L, 'p');
  const parts = svg.split('<g data-i="');
  const head = parts.shift();
  const out = parts.map((p) => {
    const idx = parseInt(p, 10);
    const m = L.mods[idx];
    const sm = SAMPLE[m.name] || ['on', 0];
    const [st, w, v, a, t] = sm;
    const c = st === 'on' ? COL.on : COL.off;
    p = p.replace('translateY(14px)', `translateY(${st === 'on' ? 0 : 28}px)`);
    p = p.split('fill="#777777"').join(`fill="${c}"`);
    const pct = Math.min(1, w / m._max);
    const col = st === 'off' ? COL.off : (w >= m._red ? COL.bad : w >= m._yel ? COL.warn : COL.on);
    const txt = st === 'off' ? 'OFF' : (w >= 1000 ? (w / 1000).toFixed(2) + ' kW' : w + ' W');
    p = p.replace(/(class="lcdt"[^>]*fill=")[^"]*(">)--/, `$1${col}$2${txt}`);
    p = p.replace(/(class="lcdb"[^>]*width=")0("[^>]*fill=")[^"]*("[^>]*data-maxw="([\d.]+)")/, (all, a1, a2, a3, mw) => `${a1}${(pct * parseFloat(mw)).toFixed(1)}${a2}${col}${a3}`);
    p = p.replace('<tspan class="lv"></tspan><tspan class="lc"></tspan>',
      `<tspan class="lv" fill="#7fd4ff">${v ? v + 'V' : ''}</tspan><tspan class="lc" fill="#8dffaa" dx="${v && a ? 8 : 0}">${a ? a + 'A' : ''}</tspan>`);
    p = p.replace(/(class="lt"[^>]*fill="#ffb27f">)<\/text>/, `$1${t !== undefined ? t.toFixed(1) + '°C' : ''}</text>`);
    return '<g data-i="' + p;
  });
  svg = head + out.join('');
  svg = svg.replace('style="width:100%;height:auto;display:block;user-select:none;-webkit-user-select:none;-webkit-tap-highlight-color:transparent"', '');
  fs.writeFileSync(path.join(__dirname, '..', 'docs', file), svg);
  console.log('wrote docs/' + file);
}
render('dark', 'preview.svg');
render('light', 'preview-light.svg');
