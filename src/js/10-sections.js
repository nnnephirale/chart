/* ───────── sections below ───────── */
const showBtn = (f) =>
  `<button class="show" data-show="${f}" aria-label="Show on chart">Show on chart</button>`;
// Placements, Costar-style: one block per house (1st to 12th); inside it each sign leads, then the planets in that sign, with the house on the right
$('#plTable').innerHTML = HOUSES.map((hn, hi) => {
  const items = [
    ...houseOf(hi).map((p) => ({ ...p, kind: 'planet' })),
    ...ANGLES.filter((x) => x.house === hi + 1).map((x) => ({ ...x, kind: 'angle' })),
  ];
  if (!items.length) return '';
  const start = CUSPS[hi],
    rel = (x) => (((x.lon - start) % 360) + 360) % 360;
  items.sort((x, y) => rel(x) - rel(y));
  const groups = [];
  items.forEach((x) => {
    const g = groups.find((q) => q.sign === x.sign);
    g ? g.items.push(x) : groups.push({ sign: x.sign, items: [x] });
  });
  const row = (x) =>
    `<div class="pr"><span class="sym"${x.kind === 'angle' ? ' style="font-family:var(--mono);font-size:11px"' : ''}>${x.kind === 'angle' ? x.a : T(x.g)}</span><span class="nm">${x.n}</span><span class="nt">${x.note}</span><span class="dg">${x.deg}${x.rx ? '<span class="rx">℞</span>' : ''}</span>${showBtn((x.kind === 'angle' ? 'angle:' : 'planet:') + x.i)}</div>`;
  return (
    `<div class="ph" style="--rows:${groups.length}">` +
    groups
      .map((g) => {
        const sg = SIGNS[g.sign];
        return `<div class="ph-s"><span class="dot" style="background:${EL[sg.el]}"></span>${sg.n}</div><div class="ph-p">${g.items.map(row).join('')}</div>`;
      })
      .join('') +
    `<div class="ph-n"><b>${hi + 1}</b><span>${hn}</span></div></div>`
  );
}).join('');

$('#houseCards').innerHTML = HOUSES.map((h, i) => {
  const ps = houseOf(i),
    s = houseSign(i);
  return `<div class="card hcard lift reveal" style="--d:${(i % 4) * 0.04}s"><div class="n">${ORD(i + 1)}${AXIS[i] ? ' · ' + AXIS[i] : ''}</div><div class="th">${h}</div><div class="cs"><span class="sym" style="color:${EL[s.el]}">${T(s.g)}</span>${CUSP_TXT[i]}</div><div class="pls">${ps.map((p) => `<span class="sym" title="${p.n}">${T(p.g)}</span>`).join('') || '<span class="empty-mu" style="font:300 12px var(--mono)">empty</span>'}</div>${showBtn('house:' + i)}</div>`;
}).join('');

const bars = (rows) =>
  rows
    .map(
      ([g, n, v, w, c]) =>
        `<div class="bar-r"><span class="sym">${g ? T(g) : ''}</span><span class="nm">${n}</span><div class="track"><div class="fill" style="--w:${w / 100};${c ? `background:${c}` : ''}"></div></div><span class="v">${v}</span></div>`,
    )
    .join('');
$('#powerPlanets .bars').innerHTML = bars([
  ['♇', 'Pluto', '13.17%', 100],
  ['♆', 'Neptune', '10.66%', 80.9],
  ['♃', 'Jupiter', '10.11%', 76.8],
  ['♄', 'Saturn', '9.98%', 75.8],
  ['♂', 'Mars', '9.82%', 74.6],
  ['♀', 'Venus', '9.31%', 70.7],
]);
$('#powerHouses .bars').innerHTML = bars([
  ['', '2nd · Value', '36.95%', 100],
  ['', '10th · Calling', '28.00%', 75.8],
  ['', '12th · Hidden', '16.28%', 44.1],
  ['', '1st · Self', '10.19%', 27.6],
]);
$('#signBars .bars').innerHTML = bars([
  ['♏', 'Scorpio', '23.58%', 100, EL.water],
  ['♓', 'Pisces', '23.31%', 98.9, EL.water],
  ['♑', 'Capricorn', '13.96%', 59.2, EL.earth],
  ['♒', 'Aquarius', '11.96%', 50.8, EL.air],
]);

const donut = (title, rows) => {
  const r = 46,
    c = 2 * Math.PI * r;
  let acc = 0;
  const arcs = rows
    .map(([, v, col]) => {
      const len = (v / 100) * c,
        s = `<circle class="arc" cx="60" cy="60" r="${r}" fill="none" stroke="${col}" stroke-width="14" stroke-dasharray="${len} ${c}" stroke-dashoffset="${-acc}" data-off="${-acc}" transform="rotate(-90 60 60)"/>`;
      acc += len;
      return s;
    })
    .join('');
  return `<div class="t-label">${title}</div><div class="donut-wrap"><svg class="donut" width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="${r}" fill="none" stroke="rgba(0,0,0,.04)" stroke-width="14"/>${arcs}</svg><div class="lg">${rows.map(([n, v, col]) => `<div><span class="dot" style="background:${col};width:8px;height:8px"></span><span>${n}</span><span>${v.toFixed(2)}%</span></div>`).join('')}</div></div>`;
};
$('#donutEl').innerHTML = donut('Elements', [
  ['Water', 49.12, EL.water],
  ['Earth', 18.81, EL.earth],
  ['Air', 16.8, EL.air],
  ['Fire', 15.27, EL.fire],
]);
$('#donutMo').innerHTML = donut('Modes', [
  ['Fixed', 40.57, '#5E6470'],
  ['Mutable', 30.1, '#9AA0A8'],
  ['Cardinal', 29.33, '#C9CDD2'],
]);

// aspect grid (aspectarian): lower triangle, planets × planets
const AMAP = {};
ASPECTS.forEach((x) => {
  AMAP[Math.min(x.a, x.b) + '-' + Math.max(x.a, x.b)] = x;
});
let g =
  '<table role="grid" aria-label="Aspect grid"><tr><th></th>' +
  PLANETS.slice(0, -2)
    .map((p) => `<th data-col="${p.i}" title="${p.n}">${T(p.g)}</th>`)
    .join('') +
  '</tr>';
for (let i = 1; i < PLANETS.length - 1; i++) {
  g += `<tr><th data-row="${i}" title="${PLANETS[i].n}">${T(PLANETS[i].g)}</th>`;
  for (let j = 0; j < PLANETS.length - 2; j++) {
    if (j >= i) {
      g += '<td></td>';
      continue;
    }
    const x = AMAP[j + '-' + i];
    g += x
      ? `<td class="c"><div class="acell" data-focus="aspect:${x.k}" data-t="${x.t}" data-r="${i}" data-c="${j}" style="color:${ATYPE[x.t].c}" tabindex="0" aria-label="${PLANETS[x.a].n} ${ATYPE[x.t].n} ${PLANETS[x.b].n}, orb ${x.orb}">${T(ATYPE[x.t].g)}</div></td>`
      : '<td class="c"></td>';
  }
  g += '</tr>';
}
$('#agrid').innerHTML =
  `<div class="t-label" style="margin-bottom:12px">Aspect grid</div>${g}</table><div class="cap" id="acap">Hover a cell.</div>`;
function agridHeads(f) {
  $$('#agrid th').forEach((t) => t.classList.remove('hi'));
  const cap = $('#acap');
  if (!cap) return;
  if (f?.kind === 'aspect') {
    const x = ASPECTS[f.i];
    [x.a, x.b].forEach((i) =>
      $$(`#agrid th[data-row="${i}"], #agrid th[data-col="${i}"]`).forEach((t) => t.classList.add('hi')),
    );
    cap.innerHTML = `<b>${PLANETS[x.a].n} ${ATYPE[x.t].n.toLowerCase()} ${PLANETS[x.b].n}</b> · ${x.orb} · ${x.s}`;
  } else if (f?.kind === 'planet') {
    $$(`#agrid th[data-row="${f.i}"], #agrid th[data-col="${f.i}"]`).forEach((t) => t.classList.add('hi'));
    cap.innerHTML = `<b>${PLANETS[f.i].n}</b> · ${aspectsOf(f.i).length} aspects`;
  } else cap.textContent = 'Hover a cell.';
}
$('#agrid').addEventListener('click', (e) => {
  const c = e.target.closest('.acell');
  if (c) showOnChart(parse(c.dataset.focus));
});
$('#agrid').addEventListener('keydown', (e) => {
  const c = e.target.closest('.acell');
  if (c && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    showOnChart(parse(c.dataset.focus));
  }
});

$('#alist').innerHTML =
  `<div class="alist-head"><span class="t-label">Ranked</span><div class="seg utabs" id="segFilterOut" role="tablist" aria-label="Aspect type" data-ease="cubic-bezier(.16,1,.3,1)"></div></div>` +
  ASPECTS.map(
    (x, n) =>
      `<div class="ar" data-focus="aspect:${x.k}" data-t="${x.t}"><span class="k">${x.t === 'opp' ? '·' : n + 1}</span><div><div class="pr"><span class="sym">${T(PLANETS[x.a].g)}</span> ${PLANETS[x.a].n} – <span class="sym">${T(PLANETS[x.b].g)}</span> ${PLANETS[x.b].n}</div><div class="track"><div class="fill" style="--w:${x.w / 100};background:${ATYPE[x.t].c}"></div></div></div><span class="ty"><span class="sym" style="color:${ATYPE[x.t].c}">${T(ATYPE[x.t].g)}</span>${ATYPE[x.t].n}</span><span class="ob">${x.orb}</span><span class="st${/Tight|Exact/.test(x.s) ? ' tight' : ''}">${x.s}</span>${showBtn('aspect:' + x.k).replace('class="show"', 'class="show" style="right:12px"')}</div>`,
  ).join('');
filterOut = segmented($('#segFilterOut'), FILTERS, 'all', applyFilter);
filterOutRow = scrollRow($('#segFilterOut'));
$('#alist').addEventListener('click', (e) => {
  const r = e.target.closest('.ar');
  if (r && !e.target.closest('.show')) showOnChart(parse(r.dataset.focus));
});
$$('.ar').forEach((r) =>
  r.addEventListener('pointerenter', () => {
    if (TOUCH) return;
    r.querySelector('.show').style.opacity = 1;
    r.querySelector('.st').style.opacity = 0;
    r.querySelector('.ob').style.opacity = 0;
  }),
);
$$('.ar').forEach((r) =>
  r.addEventListener('pointerleave', () => {
    r.querySelector('.show').style.opacity = '';
    r.querySelector('.st').style.opacity = '';
    r.querySelector('.ob').style.opacity = '';
  }),
);

const ref = (r) => `<a class="ref" href="${r.href}">${r.label}</a>`;
$('#configs').innerHTML = CONTENT.configs
  .map(
    (c, i) =>
      `<div class="card cfg lift reveal" id="${c.id}" style="--d:${(i % 2) * 0.06}s"><h3 class="t-sub">${c.title}</h3><div class="chips">${c.chips.map((ch) => `<span class="chip">${ch.replace(/([☉☽☿♀♂♃♄♅♆♇☊⚷])/g, '<span class="sym">$1︎</span>')}</span>`).join('')}</div><div class="prose">${c.note}</div></div>`,
  )
  .join('');
const SG = { water: EL.water, air: EL.air, conj: 'var(--conj)', tri: 'var(--tri)', sq: 'var(--sq)' };
$('#storyList').innerHTML = CONTENT.stories
  .map((s) => {
    const cls = s.el.split(/\s+/).filter(Boolean);
    const tone = cls.find((c) => SG[c]);
    return `<article class="story collapsible"><span class="sg${cls.includes('multi') ? ' multi' : ''}" style="${tone ? `color:${SG[tone]}` : ''}">${s.glyph.replace(/(.)/gu, '$1︎')}</span><div><div class="t-label">${s.num.replace('STORY', 'Story')}</div><h3 class="t-sub">${s.title}</h3><div class="prose">${s.body}</div><button class="more">Read more</button><div class="refs">${s.refs.map(ref).join('')}</div></div></article>`;
  })
  .join('');
$('#featList').innerHTML = CONTENT.features
  .map((f, i) => `<div class="feat"><span>${String(i + 1).padStart(2, '0')}</span><div>${f}</div></div>`)
  .join('');
$('#codeList').innerHTML = CONTENT.codes
  .map(
    (c, i) =>
      `<article class="card code lift reveal collapsible" style="--d:${(i % 2) * 0.06}s"><div class="n">${c.n}</div><h3 class="t-sub">${c.title}</h3><div class="prose">${c.body}</div><button class="more">Read more</button><div class="refs">${c.refs.map(ref).join('')}</div></article>`,
  )
  .join('');
$('#promptList').innerHTML = CONTENT.prompts
  .map(
    (p, i) =>
      `<div class="prompt"><span>${String(i + 1).padStart(2, '0')}</span><div class="prose">${p}</div></div>`,
  )
  .join('');
for (const s of ['cusps', 'power', 'balance', 'signs', 'aspects', 'stelliums', 'discussion']) {
  const el = $('#' + s + 'Callout');
  if (el) el.innerHTML = CONTENT.callouts[s][0] || '';
}
$('#powerNote').innerHTML = CONTENT.notes.power[0] || '';
$('#storiesIntro').innerHTML = (CONTENT.intros.stories[0] || '').replace(/Symbol tiles.*$/, '');
$('#codesIntro').innerHTML = (CONTENT.intros.codes[0] || '').replace(/ Chips link to the evidence\.?/, '');
$('#discIntro').innerHTML = CONTENT.intros.discussion[0] || '';
document.addEventListener('click', (e) => {
  const m = e.target.closest('.more');
  if (!m) return;
  const c = m.closest('.collapsible');
  c.classList.toggle('open');
  m.textContent = c.classList.contains('open') ? 'Show less' : 'Read more';
});
