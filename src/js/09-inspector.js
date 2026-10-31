/* ───────── inspector ───────── */
const inspEl = $('.insp'),
  focusEl = $('#focus');
// Every named thing in a row is its own link (the innermost data-focus wins), so a planet row's sign
// and house, a house row's planet glyphs and an aspect's planets all jump straight to that item.
const L = (f, html, cls = '') => `<span class="lnk${cls ? ' ' + cls : ''}" data-focus="${f}">${html}</span>`;
const plRow = (p) => {
  const s = SIGNS[p.sign];
  return `<div class="row r-pl" tabindex="0" data-focus="planet:${p.i}"><span class="sym">${T(p.g)}</span><span class="nm">${p.n}</span>${L('sign:' + s.i, `<span class="dot" style="background:${EL[s.el]};margin-right:6px"></span>${s.n}`, 'mu')}${L('house:' + (p.house - 1), ORD(p.house), 'mu')}<span class="rt">${p.deg}${p.rx ? '<button class="rx" data-modal="rx" aria-label="What retrograde means">℞</button>' : ''}</span></div>`;
};
const agRow = (a) => {
  const s = SIGNS[a.sign];
  return `<div class="row r-pl" tabindex="0" data-focus="angle:${a.i}"><span class="ax-sym">${a.a}</span><span class="nm">${a.n}</span>${L('sign:' + s.i, `<span class="dot" style="background:${EL[s.el]};margin-right:6px"></span>${s.n}`, 'mu')}${L('house:' + (a.house - 1), ORD(a.house), 'mu')}<span class="rt">${a.deg}</span></div>`;
};
const placeRows = () => PLANETS.map(plRow).join('') + ANGLES.map(agRow).join('');
// side-panel descriptors: a general line, then what it means in this chart
const desc = (c) => (c ? `<div class="f-desc"><p class="f-what">${c.what}</p><p>${c.chart}</p></div>` : '');
const glyphs = (ps) =>
  `<span class="pls pls-n">${ps.length ? ps.map((p) => L('planet:' + p.i, `<span class="sym">${T(p.g)}</span>${p.key || p.n}`, 'pt')).join('') : '<span class="empty-mu">—</span>'}</span>`;
const sgRow = (s) =>
  `<div class="row r-sg" tabindex="0" data-focus="sign:${s.i}"><span class="sym" style="color:${EL[s.el]}">${T(s.g)}</span><span class="nm">${s.n}</span>${glyphs(signOf(s.i))}</div>`;
const hsRow = (i) =>
  `<div class="row r-hs" tabindex="0" data-focus="house:${i}"><span class="mu">${i + 1}</span><span class="nm">${HOUSES[i]}</span>${glyphs(houseOf(i))}</div>`;
const track = (x) => `<div class="strk"><i style="width:${x.w}%;background:${ATYPE[x.t].c}"></i></div>`;
// an aspect seen from one of its planets: the other planet, then the type
const faRow = (x, i) => {
  const o = other(x, i),
    t = ATYPE[x.t];
  return `<div class="row r-fa" tabindex="0" data-focus="aspect:${x.k}"><span class="sym">${T(o.g)}</span><div><div class="nm">${L('planet:' + o.i, o.n)}</div>${track(x)}</div><span class="ty"><span class="sym" style="color:${t.c}">${T(t.g)}</span>${t.n}</span><span class="rt">${x.orb}</span></div>`;
};
// an aspect seen from outside: both planets
const asRow = (x) => {
  const A = PLANETS[x.a],
    B = PLANETS[x.b],
    t = ATYPE[x.t];
  return `<div class="row r-fa" tabindex="0" data-focus="aspect:${x.k}"><span class="sym" style="color:${t.c}">${T(t.g)}</span><div><div class="nm">${L('planet:' + A.i, A.n)} <span class="mu">–</span> ${L('planet:' + B.i, B.n)}</div>${track(x)}</div><span class="ty">${t.n}</span><span class="rt">${x.orb}</span></div>`;
};
const aspectsAmong = (ps) => {
  const ids = new Set(ps.map((p) => p.i));
  return ASPECTS.filter((x) => ids.has(x.a) || ids.has(x.b));
};
const sec = (label, rows, none) =>
  `<div class="f-sec">${label}</div>${rows || `<div class="f-none">${none}</div>`}`;

let focusKey = '#';
function renderFocus(f) {
  const pinned = same(f, S.pin),
    k = key(f) + (pinned ? '+' : '');
  if (k === focusKey) return;
  const d = describe(f);
  // locking (or releasing) the card already on screen only relabels it, no crossfade
  if (focusKey.replace('+', '') === key(f)) {
    focusKey = k;
    const fk = $(':scope > div:last-child .f-kind', focusEl);
    if (fk) fk.textContent = d.kind + (pinned && !PHONE.matches ? ' · Locked' : '');
    return;
  }
  focusKey = k;
  let pos = `${d.l1}${d.l2 ? ` <em>·</em> ${d.l2}` : ''}`,
    body = '';
  if (f.kind === 'planet') {
    const p = PLANETS[f.i],
      as = aspectsOf(f.i);
    pos = `<span class="dot" style="background:${EL[SIGNS[p.sign].el]};margin-right:6px"></span>${p.deg} ${L('sign:' + p.sign, SIGNS[p.sign].n)}${p.rx ? '<button class="rx" data-modal="rx" aria-label="What retrograde means">℞</button>' : ''} <em>·</em> ${L('house:' + (p.house - 1), ORD(p.house) + ' house')} <em>·</em> ${HOUSES[p.house - 1]}`;
    body =
      (p.note ? `<div class="f-note">${p.note}</div>` : '') +
      desc(CONTENT.cards.planets[p.n]) +
      '</div>' +
      sec('Placement', sgRow(SIGNS[p.sign]) + hsRow(p.house - 1)) +
      sec(`Aspects · ${as.length}`, as.map((x) => faRow(x, f.i)).join(''), 'No major aspects');
  } else if (f.kind === 'sign') {
    const ps = signOf(f.i),
      cusps = CUSPS.map((c, h) => h).filter((h) => Math.floor(CUSPS[h] / 30) === f.i);
    pos = `<span class="dot" style="background:${EL[SIGNS[f.i].el]};margin-right:6px"></span>${d.l1}`;
    const as = aspectsAmong(ps);
    const c = CONTENT.cards.signs[SIGNS[f.i].n];
    body =
      (c?.tag ? `<div class="f-note">${c.tag}</div>` : '') +
      desc(c) +
      '</div>' +
      sec(`Planets · ${ps.length}`, ps.map(plRow).join(''), 'No planets here') +
      sec('House cusps', cusps.map(hsRow).join(''), 'No house begins here') +
      (ps.length ? sec(`Aspects · ${as.length}`, as.map(asRow).join(''), 'No major aspects') : '');
  } else if (f.kind === 'house') {
    const ps = houseOf(f.i),
      hs = houseSign(f.i);
    const as = aspectsAmong(ps);
    pos = `${HOUSES[f.i]} <em>·</em> cusp ${L('sign:' + hs.i, `<span class="sym">${T(hs.g)}</span> ${CUSP_TXT[f.i]}`)}`;
    const hc = CONTENT.cards.houses[f.i];
    body =
      (hc?.tag ? `<div class="f-note">${hc.tag}</div>` : '') +
      desc(hc) +
      '</div>' +
      sec(`Planets · ${ps.length}`, ps.map(plRow).join(''), 'Empty house') +
      sec('Cusp sign', sgRow(hs)) +
      (ps.length ? sec(`Aspects · ${as.length}`, as.map(asRow).join(''), 'No major aspects') : '');
  } else if (f.kind === 'angle') {
    const a = ANGLES[f.i],
      s = SIGNS[a.sign];
    pos = `<span class="dot" style="background:${EL[s.el]};margin-right:6px"></span>${a.deg} ${L('sign:' + s.i, s.n)} <em>·</em> ${L('house:' + (a.house - 1), ORD(a.house) + ' house')} <em>·</em> ${HOUSES[a.house - 1]}`;
    body =
      (a.note ? `<div class="f-note">${a.note}</div>` : '') +
      desc(CONTENT.cards.planets[a.n]) +
      '</div>' +
      sec('Placement', sgRow(s) + hsRow(a.house - 1));
  } else {
    const x = ASPECTS[f.i],
      t = ATYPE[x.t];
    pos = `<span class="dot" style="background:${t.c};margin-right:6px"></span>${pos}`;
    const A = CONTENT.cards.aspects,
      pr = A.pairs[PLANETS[x.a].n + '|' + PLANETS[x.b].n] || A.pairs[PLANETS[x.b].n + '|' + PLANETS[x.a].n];
    body =
      `<div class="f-str"><span class="track"><i style="width:${x.w}%;background:${t.c}"></i></span>${x.w}% strength</div>` +
      (pr?.tag ? `<div class="f-note">${pr.tag}</div>` : '') +
      (pr ? desc({ what: A.types[x.t], chart: pr.chart }) : '') +
      '</div>' +
      sec('Between', plRow(PLANETS[x.a]) + plRow(PLANETS[x.b]));
  }
  const html = `<div class="fd-head"><div class="f-kind">${d.kind}${pinned && !PHONE.matches ? ' · Locked' : ''}</div><div class="f-name">${d.glyph ? `<span class="sym">${T(d.glyph)}</span>` : ''}<b>${d.name}</b></div><div class="f-pos">${pos}</div>${body}`;
  // swap: the old card goes at once and the new one fades in (no overlap, so nothing ghosts)
  $$(':scope > div', focusEl).forEach((o) => o.remove());
  const n = document.createElement('div');
  n.innerHTML = html;
  n.classList.add('out');
  focusEl.appendChild(n);
  requestAnimationFrame(() => requestAnimationFrame(() => n.classList.remove('out')));
}

const lists = $('#lists');
// sign lists run from most planets to fewest. Ties go clockwise round the wheel (backwards through the zodiac),
// starting from the sign listed just before them; a tie at the very top starts from Aries.
const SIGNS_BY_COUNT = (() => {
  const groups = new Map();
  SIGNS.forEach((s) => {
    const n = signOf(s.i).length;
    groups.set(n, [...(groups.get(n) || []), s]);
  });
  let ref = null;
  const out = [];
  [...groups.keys()]
    .sort((a, b) => b - a)
    .forEach((n) => {
      const g = groups.get(n),
        from = ref === null ? 0 : ref,
        d = (s) => (from - s.i + 12) % 12;
      g.sort((a, b) => d(a) - d(b));
      out.push(...g);
      ref = g[g.length - 1].i;
    });
  return out;
})();
const HINT = (where) =>
  `<p class="hint">${TOUCH ? 'Tap' : 'Hover'} ${where} to read it here.${TOUCH ? ' Tap outside the wheel to let go.' : ' Click to lock it.'}</p>`;
const TABS = [
  { v: 'all', html: 'All' },
  { v: 'planets', html: 'Placements' },
  { v: 'signs', html: 'Signs' },
  { v: 'houses', html: 'Houses' },
  { v: 'aspects', html: 'Aspects' },
];
const FILTERS = [
  { v: 'all', html: 'All' },
  ...Object.entries(ATYPE).map(([t, a]) => ({
    v: t,
    html: `<span class="sym" style="color:${a.c}">${T(a.g)}</span> ${a.n} <span class="ct">${ASPECTS.filter((x) => x.t === t).length}</span>`,
  })),
];
lists.innerHTML = `
    <div class="list on" data-tab="all">${HINT('anything on the wheel')}<div class="f-sec">Placements</div>${placeRows()}<div class="f-sec">Signs</div>${SIGNS_BY_COUNT.map(sgRow).join('')}<div class="f-sec">Houses</div>${HOUSES.map((h, i) => hsRow(i)).join('')}</div>
    <div class="list" data-tab="planets">${HINT('near a planet on the wheel')}${placeRows()}</div>
    <div class="list" data-tab="signs">${HINT('anywhere in a sign’s slice')}${SIGNS_BY_COUNT.map(sgRow).join('')}</div>
    <div class="list" data-tab="houses">${HINT('anywhere in a house’s slice')}${HOUSES.map((h, i) => hsRow(i)).join('')}</div>
    <div class="list" data-tab="aspects">${HINT('near a line inside the wheel')}<div class="filter-row"><div class="seg utabs" id="segFilterIn" role="tablist" aria-label="Aspect type" data-ease="cubic-bezier(.16,1,.3,1)"></div></div>${ASPECTS.map((x) => `<div class="row r-as" tabindex="0" data-focus="aspect:${x.k}" data-t="${x.t}"><span class="nm">${L('planet:' + x.a, `<span class="sym">${T(PLANETS[x.a].g)}</span> ${PLANETS[x.a].n}`)} <span class="sym" style="color:${ATYPE[x.t].c}">${T(ATYPE[x.t].g)}</span> ${L('planet:' + x.b, `<span class="sym">${T(PLANETS[x.b].g)}</span> ${PLANETS[x.b].n}`)}</span><span></span><span class="rt">${x.orb}</span></div>`).join('')}</div>`;
// the tab is the wheel's mode: switching it lets go of whatever was in focus
const MODE_OF = { planet: 'planets', angle: 'planets', sign: 'signs', house: 'houses', aspect: 'aspects' };
const chooseMode = (v) => {
  setMode(v);
  S.pin = null;
  S.hover = null;
  S.hsrc = null;
  paint();
  tabs.set(v);
  mtabs.set(v);
  mtRow.centre();
  $$('.list', lists).forEach((l) => l.classList.toggle('on', l.dataset.tab === v));
  if (v === 'aspects') {
    filterIn.place();
    filterInRow.fade();
  }
  segCentre();
};
const tabs = segmented($('#segTabs'), TABS, S.tab, chooseMode),
  mtabs = segmented($('#mtabs'), TABS, S.tab, chooseMode);

// underline rows that overflow scroll sideways: fade the ends that hide more options, keep the chosen one in view
const scrollRow = (el) => {
  const fade = () => {
    const max = el.scrollWidth - el.clientWidth,
      x = el.scrollLeft;
    el.style.setProperty('--fl', x > 2 ? '28px' : '0px');
    el.style.setProperty('--fr', x < max - 2 ? '28px' : '0px');
  };
  const centre = () => {
    const b = $('[aria-selected="true"]', el);
    if (b && el.scrollWidth > el.clientWidth)
      el.scrollTo({
        left: b.offsetLeft - (el.clientWidth - b.offsetWidth) / 2,
        behavior: RM ? 'auto' : 'smooth',
      });
  };
  el.addEventListener('scroll', fade, { passive: true });
  addEventListener('resize', fade);
  document.fonts?.ready.then(fade);
  fade();
  return { fade, centre };
};
const segRow = scrollRow($('#segTabs')),
  segCentre = segRow.centre,
  mtRow = scrollRow($('#mtabs'));
const revealInList = (f) => {
  // the mode belongs to the lozenges: a lock only scrolls the current list to its row, if it has one
  const list = $('.list.on', lists),
    row = list && $(`[data-focus="${key(f)}"]`, list);
  if (row) {
    const top = row.offsetTop - list.clientHeight / 2 + row.offsetHeight / 2;
    list.scrollTo({ top: Math.max(0, top), behavior: RM ? 'auto' : 'smooth' });
  }
};

const applyFilter = (v) => {
  S.filter = v;
  filterIn.set(v);
  filterOut?.set(v);
  filterInRow.centre();
  filterOutRow?.centre();
  $$('.r-as', lists).forEach((r) => (r.style.display = v === 'all' || r.dataset.t === v ? '' : 'none'));
  $$('.ar').forEach((r) => r.classList.toggle('gone', v !== 'all' && r.dataset.t !== v));
  $$('.acell').forEach((c) => (c.style.opacity = v === 'all' || c.dataset.t === v ? '' : '.15'));
  paint();
};
const filterIn = segmented($('#segFilterIn'), FILTERS, 'all', applyFilter),
  filterInRow = scrollRow($('#segFilterIn'));
let filterOut = null,
  filterOutRow = null;

segmented(
  $('#segLabels'),
  [
    { v: 'glyph', html: 'Glyphs' },
    { v: 'name', html: 'Names' },
  ],
  'glyph',
  (v) => {
    S.mode = v;
    svg.classList.toggle('mode-glyph', v === 'glyph');
    svg.classList.toggle('mode-name', v === 'name');
  },
);
$('#chkAsp').addEventListener('change', (e) => {
  S.lines = e.target.checked;
  paint();
});

$('#legend').innerHTML =
  Object.values(ATYPE)
    .map((a) => `<span><i style="background:${a.c}"></i>${a.n}</span>`)
    .join('') +
  '<span class="sep"></span>' +
  Object.keys(EL)
    .map(
      (e) => `<span class="el"><i style="background:${EL[e]}"></i>${e[0].toUpperCase() + e.slice(1)}</span>`,
    )
    .join('');
$('#wheelNote').innerHTML = CONTENT.notes.wheel[0] || '';

function showOnChart(f) {
  S.pin = f;
  S.hover = null;
  paint();
  revealInList(f);
  jump('chart');
  if (PHONE.matches) return;
  const wc = $('.wheel-card .glass-in');
  wc.classList.remove('flash');
  void wc.offsetWidth;
  wc.classList.add('flash');
}
