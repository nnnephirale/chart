/* ───────── data: the chart's own (CHART, from people/<name>/chart.json) and the fixed tables ───────── */
const SIGNS = [
  ['Aries', '♈', 'fire', 'Cardinal'],
  ['Taurus', '♉', 'earth', 'Fixed'],
  ['Gemini', '♊', 'air', 'Mutable'],
  ['Cancer', '♋', 'water', 'Cardinal'],
  ['Leo', '♌', 'fire', 'Fixed'],
  ['Virgo', '♍', 'earth', 'Mutable'],
  ['Libra', '♎', 'air', 'Cardinal'],
  ['Scorpio', '♏', 'water', 'Fixed'],
  ['Sagittarius', '♐', 'fire', 'Mutable'],
  ['Capricorn', '♑', 'earth', 'Cardinal'],
  ['Aquarius', '♒', 'air', 'Fixed'],
  ['Pisces', '♓', 'water', 'Mutable'],
].map(([n, g, el, mo], i) => ({ i, n, g, el, mo }));
const EL = { water: 'var(--water)', fire: 'var(--fire)', earth: 'var(--earth)', air: 'var(--air)' };
const ELHEX = { water: '#1E98AE', fire: '#E2733A', earth: '#A08A3C', air: '#5C8BE0' };
const HOUSES = [
  'Self',
  'Value',
  'Mind',
  'Roots',
  'Joy',
  'Craft',
  'Partners',
  'Depth',
  'Meaning',
  'Calling',
  'Circle',
  'Hidden',
];
const ORD = (n) => n + (n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th');
// the bodies every chart lists, in this order; Lilith stays last (the aspect grid skips it)
const BODIES = [
  { n: 'Sun', a: 'SUN', g: '☉' },
  { n: 'Moon', a: 'MOON', g: '☽' },
  { n: 'Mercury', a: 'MERC', g: '☿' },
  { n: 'Venus', a: 'VEN', g: '♀' },
  { n: 'Mars', a: 'MARS', g: '♂' },
  { n: 'Jupiter', a: 'JUP', g: '♃' },
  { n: 'Saturn', a: 'SAT', g: '♄' },
  { n: 'Uranus', a: 'URA', g: '♅' },
  { n: 'Neptune', a: 'NEP', g: '♆' },
  { n: 'Pluto', a: 'PLU', g: '♇' },
  { n: 'North Node', a: 'NODE', g: '☊', key: 'N. Node' },
  { n: 'Chiron', a: 'CHI', g: '⚷' },
  { n: 'Lilith', a: 'LIL', g: '⚸', full: 'Black Moon Lilith' }, // mean Lilith; astro.com scores no aspects for it
];
// a position as astro.com prints it, e.g. 20Pis01'27": sign, degree within it, absolute ecliptic longitude
const POS = (s) => {
  const [, d, sg, m, sec = 0] = s.match(/^(\d+)([A-Z][a-z]{2})(\d+)'(?:(\d+)")?$/);
  const sign = SIGNS.findIndex((x) => x.n.startsWith(sg));
  const lon = Math.round((sign * 30 + +d + m / 60 + sec / 3600) * 1e4) / 1e4;
  return { lon, sign, d: +d, m: m.padStart(2, '0'), abbr: sg };
};
const CUSPS_AT = CHART.cusps.map(POS);
const CUSPS = CUSPS_AT.map((c) => c.lon);
const CUSP_TXT = CUSPS_AT.map((c) => `${c.d}° ${c.abbr} ${c.m}'`);
const ASC = CUSPS[0],
  MC = CUSPS[9];
const PLANETS = BODIES.map((b) => {
  const p = CHART.planets[b.n],
    at = POS(p.pos);
  return { ...b, lon: at.lon, deg: `${at.d}°${at.m}'`, house: p.house, rx: !!p.rx };
});
// the two angles that open the 1st and 10th houses; listed with the planets, never drawn as glyphs
const ANGLES = [
  { n: 'Ascendant', a: 'ASC', lon: ASC, deg: `${CUSPS_AT[0].d}°${CUSPS_AT[0].m}'`, house: 1 },
  { n: 'Midheaven', a: 'MC', lon: MC, deg: `${CUSPS_AT[9].d}°${CUSPS_AT[9].m}'`, house: 10 },
].map((x, i) => ({ ...x, i, sign: Math.floor(x.lon / 30), note: CONTENT.pnotes[x.a] || '' }));
PLANETS.forEach((p, i) => {
  p.i = i;
  p.sign = Math.floor(p.lon / 30);
  p.note = CONTENT.pnotes[p.key || p.n] || '';
});
const ATYPE = {
  conj: { n: 'Conjunction', g: '☌', c: 'var(--conj)', hex: '#B48F2E' },
  sex: { n: 'Sextile', g: '⚹', c: 'var(--sex)', hex: '#5677B5' },
  sq: { n: 'Square', g: '□', c: 'var(--sq)', hex: '#B65A52' },
  tri: { n: 'Trine', g: '△', c: 'var(--tri)', hex: '#4F9468' },
  opp: { n: 'Opposition', g: '☍', c: 'var(--opp)', hex: '#8A6BB0' },
};
// [a, b, type, orb, strength %, label, 'calc' when worked out from the positions rather than taken from astro.com]
const BODY = Object.fromEntries(PLANETS.map((p) => [p.n, p.i]));
const ASPECTS = CHART.aspects.map(([a, b, t, orb, w, s, src], k) => ({
  k,
  a: BODY[a],
  b: BODY[b],
  t,
  orb,
  w,
  s,
  src,
}));
const houseOf = (h) => PLANETS.filter((p) => p.house === h + 1);
const signOf = (s) => PLANETS.filter((p) => p.sign === s);
const aspectsOf = (i) => ASPECTS.filter((x) => x.a === i || x.b === i);
const other = (x, i) => PLANETS[x.a === i ? x.b : x.a];
const signTxt = (p) => `${p.deg} ${SIGNS[p.sign].n}`;
const houseSign = (h) => SIGNS[Math.floor(CUSPS[h] / 30)];
