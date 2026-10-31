/* ───────── wheel ───────── */
const NS = 'http://www.w3.org/2000/svg',
  C = 300;
const R = {
  zOut: 288,
  zIn: 252,
  tick: 243,
  glyph: 223,
  name: 205,
  deg: 191,
  hOut: 172,
  hIn: 150,
  asp: 146,
  ctr: 66,
};
const svg = $('#wheel');
const ang = (lon) => ((180 + (lon - ASC)) * Math.PI) / 180;
const pt = (lon, r) => [C + r * Math.cos(ang(lon)), C - r * Math.sin(ang(lon))];
const f2 = (n) => n.toFixed(2);
const mk = (tag, attrs, parent = svg) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  parent.appendChild(e);
  return e;
};
const band = (a, b, r1, r2) => {
  // annular sector from lon a to b (counter-clockwise on screen)
  if (b < a) b += 360;
  const large = b - a > 180 ? 1 : 0,
    o1 = pt(a, r2),
    o2 = pt(b, r2),
    i2 = pt(b, r1),
    i1 = pt(a, r1);
  return `M${f2(o1[0])} ${f2(o1[1])} A${r2} ${r2} 0 ${large} 0 ${f2(o2[0])} ${f2(o2[1])} L${f2(i2[0])} ${f2(i2[1])} A${r1} ${r1} 0 ${large} 1 ${f2(i1[0])} ${f2(i1[1])}Z`;
};
const arc = (a, b, r) => {
  // path for text, always reading left→right
  if (b < a) b += 360;
  const mid = (a + b) / 2,
    m = pt(mid, r),
    top = m[1] < C;
  const p1 = pt(top ? b : a, r),
    p2 = pt(top ? a : b, r);
  return `M${f2(p1[0])} ${f2(p1[1])} A${r} ${r} 0 0 ${top ? 1 : 0} ${f2(p2[0])} ${f2(p2[1])}`;
};
let uid = 0;
const curved = (a, b, r, text, cls, attrs = {}) => {
  const id = 'arc' + uid++;
  mk('path', { id, d: arc(a, b, r), fill: 'none' }, defs);
  const t = mk('text', { class: cls, 'text-anchor': 'middle', ...attrs });
  const tp = mk('textPath', { href: '#' + id, startOffset: '50%' }, t);
  tp.textContent = text;
  const m = pt((a + (b < a ? b + 360 : b)) / 2, r);
  if (m[1] >= C) t.setAttribute('dy', '0.8em');
  else t.setAttribute('dy', '-0.1em');
  return t;
};
const defs = mk('defs', {});

// house sectors (shade on focus), then signs
const gH = mk('g', {}),
  gZ = mk('g', { class: 'g-signs' }),
  gTicks = mk('g', {}),
  gHL = mk('g', { class: 'g-houses' }),
  gCusp = mk('g', { class: 'g-houses' });
const hsec = CUSPS.map((c, h) =>
  mk('path', { d: band(c, CUSPS[(h + 1) % 12], 0, R.zIn), class: 'hsec' }, gH),
);
const ssec = SIGNS.map((s) =>
  mk('path', { d: band(s.i * 30, s.i * 30 + 30, 0, R.zIn), fill: ELHEX[s.el], class: 'ssec' }, gH),
);
const zseg = SIGNS.map((s) => {
  const p = mk(
    'path',
    {
      d: band(s.i * 30, s.i * 30 + 30, R.zIn, R.zOut),
      fill: ELHEX[s.el],
      class: 'z-seg',
      stroke: 'rgba(0,0,0,.06)',
      'stroke-width': 0.75,
      'data-focus': 'sign:' + s.i,
      style: 'cursor:pointer',
    },
    gZ,
  );
  const m = pt(s.i * 30 + 15, (R.zIn + R.zOut) / 2);
  const g = mk(
    'text',
    {
      x: f2(m[0]),
      y: f2(m[1]),
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      class: 'gsym z-lbl lbl-glyph',
      'font-size': 15,
      fill: ELHEX[s.el],
      'pointer-events': 'none',
    },
    gZ,
  );
  g.textContent = T(s.g);
  curved(s.i * 30 + 1, s.i * 30 + 29, (R.zIn + R.zOut) / 2 - 3.5, s.n.toUpperCase(), 'z-lbl lbl-name', {
    'font-size': 9.5,
    'letter-spacing': 1.4,
    fill: ELHEX[s.el],
    'pointer-events': 'none',
  });
  return p;
});
gZ.querySelectorAll('text').forEach((t) => gZ.appendChild(t)); // labels above segments
mk(
  'circle',
  { cx: C, cy: C, r: R.zOut, fill: 'none', stroke: 'rgba(0,0,0,.08)', 'stroke-width': 0.75 },
  gTicks,
);
mk(
  'circle',
  { cx: C, cy: C, r: R.zIn, fill: 'none', stroke: 'rgba(0,0,0,.1)', 'stroke-width': 0.75 },
  gTicks,
);
for (let d = 0; d < 360; d += 5) {
  const a = pt(d, R.zIn),
    b = pt(d, R.zIn - (d % 10 ? 3.5 : 6));
  mk(
    'line',
    {
      x1: f2(a[0]),
      y1: f2(a[1]),
      x2: f2(b[0]),
      y2: f2(b[1]),
      stroke: 'rgba(0,0,0,.16)',
      'stroke-width': 0.7,
    },
    gTicks,
  );
}
mk(
  'circle',
  { cx: C, cy: C, r: R.hOut, fill: 'none', stroke: 'rgba(0,0,0,.06)', 'stroke-width': 0.75 },
  gTicks,
);
mk(
  'circle',
  { cx: C, cy: C, r: R.hIn, fill: 'none', stroke: 'rgba(0,0,0,.1)', 'stroke-width': 0.75 },
  gTicks,
);

// cusps, house band hit areas + labels, axes
const AXIS = { 0: 'ASC', 3: 'IC', 6: 'DSC', 9: 'MC' };
const hLbl = [],
  cuspEl = [],
  axEl = [];
CUSPS.forEach((c, h) => {
  const axis = h % 3 === 0,
    a = pt(c, R.hIn),
    b = pt(c, axis ? R.zOut + 6 : R.zIn);
  cuspEl[h] = mk(
    'line',
    {
      class: 'cusp',
      x1: f2(a[0]),
      y1: f2(a[1]),
      x2: f2(b[0]),
      y2: f2(b[1]),
      stroke: axis ? 'rgba(0,0,0,.42)' : 'rgba(0,0,0,.1)',
      'stroke-width': axis ? 1.1 : 0.75,
    },
    gCusp,
  );
  if (axis) {
    const lp = pt(c, R.zOut + 17);
    const t = mk(
      'text',
      {
        x: f2(lp[0]),
        y: f2(lp[1]),
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        'font-size': 9,
        'letter-spacing': 1,
        fill: '#6b6b6b',
        'font-weight': 400,
        class: 'ax',
      },
      gCusp,
    );
    t.textContent = AXIS[h];
    axEl[h] = t;
    const ai = ANGLES.findIndex((x) => x.house - 1 === h);
    if (ai >= 0) {
      t.setAttribute('data-focus', 'angle:' + ai);
      t.style.cursor = 'pointer';
    }
  }
  const n = CUSPS[(h + 1) % 12];
  mk(
    'path',
    {
      d: band(c, n, R.hIn, R.hOut),
      fill: 'transparent',
      'data-focus': 'house:' + h,
      style: 'cursor:pointer',
    },
    gHL,
  );
  const mid = (c + (n < c ? n + 360 : n)) / 2,
    m = pt(mid, (R.hIn + R.hOut) / 2);
  const t = mk(
    'text',
    {
      x: f2(m[0]),
      y: f2(m[1]),
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      'font-size': 9.5,
      fill: '#9a9a9a',
      class: 'h-lbl lbl-glyph',
      'pointer-events': 'none',
    },
    gHL,
  );
  t.textContent = h + 1;
  hLbl[h] = [
    t,
    curved(c + 1, n - 1, (R.hIn + R.hOut) / 2 - 3, `${h + 1} ${HOUSES[h].toUpperCase()}`, 'h-lbl lbl-name', {
      'font-size': 8,
      'letter-spacing': 1,
      fill: '#8c8c8c',
      'pointer-events': 'none',
    }),
  ];
});

// fan crowded glyphs apart (each keeps a tick at its true degree)
const SEP = 9,
  order = PLANETS.map((p) => p.i).sort((a, b) => PLANETS[a].lon - PLANETS[b].lon);
let cl = order.map((i) => ({ list: [i], mean: PLANETS[i].lon }));
for (let merged = true; merged; ) {
  merged = false;
  for (let c = 0; c < cl.length - 1; c++) {
    const A = cl[c],
      B = cl[c + 1];
    if (B.mean - (SEP * (B.list.length - 1)) / 2 - (A.mean + (SEP * (A.list.length - 1)) / 2) < SEP) {
      const all = A.list.concat(B.list);
      cl.splice(c, 2, { list: all, mean: all.reduce((s, i) => s + PLANETS[i].lon, 0) / all.length });
      merged = true;
      break;
    }
  }
}
const disp = {};
cl.forEach((c) => {
  const s = c.mean - (SEP * (c.list.length - 1)) / 2;
  c.list.forEach((i, k) => {
    disp[i] = s + k * SEP;
  });
});
// aspect lines (under planets) with fat invisible hit strokes
const gA = mk('g', { id: 'asps' });
// Conjunctions are a few degrees apart, so a chord would be a stub: draw them as an arc on the ring.
const conjArc = (a, b, r) => {
  const d = ((b - a + 540) % 360) - 180,
    p1 = pt(a, r),
    p2 = pt(a + d, r);
  return `M${f2(p1[0])} ${f2(p1[1])} A${r} ${r} 0 0 ${d > 0 ? 0 : 1} ${f2(p2[0])} ${f2(p2[1])}`;
};
const shape = (x, attrs) => {
  if (x.t === 'conj')
    return mk('path', { d: conjArc(disp[x.a], disp[x.b], R.asp - 5), fill: 'none', ...attrs }, gA); // spans the fanned glyphs, so it visibly joins them
  const p1 = pt(PLANETS[x.a].lon, R.asp),
    p2 = pt(PLANETS[x.b].lon, R.asp);
  return mk('line', { x1: f2(p1[0]), y1: f2(p1[1]), x2: f2(p2[0]), y2: f2(p2[1]), ...attrs }, gA);
};
const aLines = ASPECTS.map((x) =>
  shape(x, {
    stroke: ATYPE[x.t].hex,
    'stroke-width': x.t === 'conj' ? 2.6 : 1.1,
    'stroke-linecap': 'round',
    class: 'asp' + (x.t === 'conj' ? ' cj' : ''),
  }),
);
const aHits = ASPECTS.map((x) => shape(x, { class: 'asp-hit', 'data-focus': 'aspect:' + x.k }));
mk('circle', { cx: C, cy: C, r: R.asp, fill: 'none', stroke: 'rgba(0,0,0,.05)', 'stroke-width': 0.75 }, gA);

const gP = mk('g', {});
const pEls = PLANETS.map((p) => {
  const g = mk('g', { class: 'pl', 'data-focus': 'planet:' + p.i }, gP);
  const t1 = pt(p.lon, R.zIn),
    t2 = pt(p.lon, R.tick);
  mk(
    'line',
    { x1: f2(t1[0]), y1: f2(t1[1]), x2: f2(t2[0]), y2: f2(t2[1]), stroke: '#1a1a1a', 'stroke-width': 1.1 },
    g,
  );
  const gp = pt(disp[p.i], R.glyph);
  if (Math.abs(disp[p.i] - p.lon) > 0.4) {
    const c1 = pt(p.lon, R.tick),
      c2 = pt(disp[p.i], R.glyph + 11);
    mk(
      'line',
      {
        x1: f2(c1[0]),
        y1: f2(c1[1]),
        x2: f2(c2[0]),
        y2: f2(c2[1]),
        stroke: 'rgba(0,0,0,.18)',
        'stroke-width': 0.6,
      },
      g,
    );
  }
  mk(
    'circle',
    {
      cx: f2(gp[0]),
      cy: f2(gp[1]),
      r: 14,
      fill: 'rgba(0,0,0,.035)',
      stroke: 'rgba(0,0,0,.14)',
      'stroke-width': 0.75,
      class: 'halo',
    },
    g,
  );
  const gl = mk(
    'text',
    {
      x: f2(gp[0]),
      y: f2(gp[1]),
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      'font-size': 17,
      fill: '#1a1a1a',
      class: 'gl gsym',
      'data-cx': gp[0],
      'data-cy': gp[1],
      style: `transform-box:view-box;transform-origin:${f2(gp[0])}px ${f2(gp[1])}px`,
    },
    g,
  );
  gl.textContent = T(p.g);
  const np = pt(disp[p.i], R.name),
    dp = pt(disp[p.i], R.deg);
  const nm = mk(
    'text',
    {
      x: f2(np[0]),
      y: f2(np[1]),
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      'font-size': 7.5,
      'letter-spacing': 0.6,
      fill: '#4d4d4d',
      class: 'lbl-name',
    },
    g,
  );
  nm.textContent = p.a;
  const dg = mk(
    'text',
    {
      x: f2(dp[0]),
      y: f2(dp[1]),
      'text-anchor': 'middle',
      'dominant-baseline': 'central',
      'font-size': 7.5,
      fill: p.rx ? '#B65A52' : '#9a9a9a',
    },
    g,
  );
  dg.textContent = p.deg.split('°')[0] + '°' + (p.rx ? ' ℞' : '');
  mk('circle', { cx: f2(gp[0]), cy: f2(gp[1]), r: 16, fill: 'transparent' }, g);
  return g;
});

// Symbol fonts sit their glyphs off the em box's centre, so 'central' leaves them lopsided in the halo.
// Measure each glyph's ink on a canvas and place its baseline so the ink, not the box, is centred.
const centreGlyphs = () => {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  $$('.gl', svg).forEach((t) => {
    const cs = getComputedStyle(t);
    ctx.font = `${cs.fontWeight} 17px ${cs.fontFamily}`;
    const m = ctx.measureText(t.textContent),
      cx = +t.dataset.cx,
      cy = +t.dataset.cy;
    t.setAttribute('dominant-baseline', 'alphabetic');
    t.setAttribute('x', f2(cx - (m.actualBoundingBoxRight - m.actualBoundingBoxLeft) / 2));
    t.setAttribute('y', f2(cy + (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2));
  });
};
document.fonts?.ready.then(centreGlyphs);

// centre label
const ctr = mk('g', { class: 'ctr' });
mk('circle', { cx: C, cy: C, r: R.ctr + 8, fill: 'rgba(255,255,255,.94)' }, ctr);
const cName = mk(
  'text',
  {
    x: C,
    y: C - 8,
    'text-anchor': 'middle',
    'font-size': 23,
    fill: '#1a1a1a',
    style: 'font-family:var(--serif)',
  },
  ctr,
);
const cL1 = mk('text', { x: C, y: C + 12, 'text-anchor': 'middle', 'font-size': 8.5, fill: '#4d4d4d' }, ctr);
const cL2 = mk('text', { x: C, y: C + 25, 'text-anchor': 'middle', 'font-size': 8.5, fill: '#8c8c8c' }, ctr);
svg.classList.add('mode-glyph', 'm-all');
const setMode = (tab) => {
  S.tab = tab;
  ['all', 'planets', 'signs', 'houses', 'aspects'].forEach((m) => svg.classList.toggle('m-' + m, m === tab));
};
