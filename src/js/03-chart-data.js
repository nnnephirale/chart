/* ───────── data (Astrolog 7.80; absolute ecliptic longitude) ───────── */
const ASC = 301.9,
  MC = 216.95;
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
const CUSPS = [301.9, 332.4833, 5.05, 36.95, 66.3167, 93.9, 121.9, 152.4833, 185.05, 216.95, 246.3167, 273.9];
const CUSP_TXT = [
  "1° Aqu 54'",
  "2° Pis 29'",
  "5° Ari 03'",
  "6° Tau 57'",
  "6° Gem 19'",
  "3° Can 54'",
  "1° Leo 54'",
  "2° Vir 29'",
  "5° Lib 03'",
  "6° Sco 57'",
  "6° Sag 19'",
  "3° Cap 54'",
];
const PLANETS = [
  { n: 'Sun', a: 'SUN', g: '☉', lon: 350.0167, deg: "20°01'", house: 2 },
  { n: 'Moon', a: 'MOON', g: '☽', lon: 333.6167, deg: "3°37'", house: 2 },
  { n: 'Mercury', a: 'MERC', g: '☿', lon: 324.1333, deg: "24°08'", house: 1 },
  { n: 'Venus', a: 'VEN', g: '♀', lon: 2.7833, deg: "2°47'", house: 2 },
  { n: 'Mars', a: 'MARS', g: '♂', lon: 332.65, deg: "2°39'", house: 2 },
  { n: 'Jupiter', a: 'JUP', g: '♃', lon: 224.4833, deg: "14°29'", house: 10, rx: true },
  { n: 'Saturn', a: 'SAT', g: '♄', lon: 334.9, deg: "4°54'", house: 2 },
  { n: 'Uranus', a: 'URA', g: '♅', lon: 295.2667, deg: "25°16'", house: 12 },
  { n: 'Neptune', a: 'NEP', g: '♆', lon: 292.7833, deg: "22°47'", house: 12 },
  { n: 'Pluto', a: 'PLU', g: '♇', lon: 238.0333, deg: "28°02'", house: 10, rx: true },
  { n: 'North Node', a: 'NODE', g: '☊', lon: 237.45, deg: "27°27'", house: 10, rx: true, key: 'N. Node' },
  { n: 'Chiron', a: 'CHI', g: '⚷', lon: 155.05, deg: "5°03'", house: 8, rx: true },
  { n: 'Lilith', a: 'LIL', g: '⚸', lon: 26.9869, deg: "26°59'", house: 3, full: 'Black Moon Lilith' }, // mean Lilith; astro.com scores no aspects for it (see source file); keep last (the aspect grid skips it)
];
// the two angles that open the 1st and 10th houses; listed with the planets, never drawn as glyphs
const ANGLES = [
  { n: 'Ascendant', a: 'ASC', lon: ASC, deg: "1°54'", house: 1 },
  { n: 'Midheaven', a: 'MC', lon: MC, deg: "6°57'", house: 10 },
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
// [a, b, type, orb, strength %, label] — ranked as in the reading; Saturn–Chiron listed last
const ASPECTS = [
  [9, 10, 'conj', "0°35'", 100, 'Tight'],
  [1, 4, 'conj', "0°58'", 100, 'Tight'],
  [1, 6, 'conj', "1°17'", 97, 'Tight'],
  [4, 6, 'conj', "2°15'", 88, 'Tight'],
  [7, 8, 'conj', "2°30'", 85, 'Tight'],
  [0, 8, 'sex', "2°46'", 80, 'Strong'],
  [7, 9, 'sex', "2°46'", 78, 'Strong'],
  [2, 9, 'sq', "3°54'", 72, 'Strong'],
  [3, 9, 'tri', "4°44'", 67, 'Strong'],
  [4, 9, 'sq', "4°37'", 62, 'Strong'],
  [1, 9, 'sq', "5°35'", 58, 'Strong'],
  [8, 9, 'sex', "5°16'", 55, 'Moderate'],
  [0, 5, 'tri', "5°32'", 52, 'Moderate'],
  [6, 9, 'sq', "6°52'", 44, 'Moderate'],
  [0, 7, 'sex', "5°15'", 40, 'Moderate'],
  [5, 6, 'tri', "9°35'", 30, 'Wide'],
  [1, 5, 'tri', "10°52'", 25, 'Wide'],
  [0, 9, 'tri', "8°01'", 22, 'Wide'],
  [2, 5, 'sq', "9°39'", 18, 'Wide'],
  [2, 4, 'conj', "8°31'", 14, 'Wide'],
  [1, 2, 'conj', "9°29'", 8, 'Wide'],
  [6, 11, 'opp', "0°09'", 100, 'Exact'],
  [1, 11, 'opp', "1°26'", 95, 'Tight'],
  [4, 11, 'opp', "2°24'", 86, 'Tight'],
].map(([a, b, t, orb, w, s], k) => ({ k, a, b, t, orb, w, s }));
const houseOf = (h) => PLANETS.filter((p) => p.house === h + 1);
const signOf = (s) => PLANETS.filter((p) => p.sign === s);
const aspectsOf = (i) => ASPECTS.filter((x) => x.a === i || x.b === i);
const other = (x, i) => PLANETS[x.a === i ? x.b : x.a];
const signTxt = (p) => `${p.deg} ${SIGNS[p.sign].n}`;
const houseSign = (h) => SIGNS[Math.floor(CUSPS[h] / 30)];
