/* ───────── phone: info under the wheel, stepper, index and card sheets, the rest of the chart in its own sheet ───────── */
const mi = $('#minfo'),
  idxEl = $('#idx'),
  idxBody = $('#idxBody'),
  scrim = $('#scrim'),
  restEl = $('#rest'),
  restBar = $('#restBar');
const CHEV =
  '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 4.5l3 3 3-3"/></svg>';
const ARROW = (d) =>
  `<svg viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
const SIGNATURES = (
  Object.values(CONTENT.callouts)
    .flat()
    .find((t) => /Chart signatures/.test(t)) || ''
).replace(/<strong>.*?<\/strong>\s*/, '');
// with nothing picked: Sun, Moon and Rising as three sign tiles, then each chart signature as a chip with its own symbol
const ELICON = (el) =>
  `<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round" aria-hidden="true"><path d="${el === 'fire' || el === 'air' ? 'M6 1.6L10.8 10H1.2Z' : 'M1.2 2H10.8L6 10.4Z'}"/>${el === 'air' ? '<path d="M2.8 7.2h6.4"/>' : el === 'earth' ? '<path d="M2.8 4.8h6.4"/>' : ''}</svg>`;
const fAttr = (f) => ` data-f='${JSON.stringify(f)}'`;
const BIG3 = [
  ['☉', 'Sun', PLANETS[0], { kind: 'planet', i: 0 }],
  ['☽', 'Moon', PLANETS[1], { kind: 'planet', i: 1 }],
  ['', 'Rising', ANGLES[0], { kind: 'angle', i: 0 }],
]
  .map(([g, l, p, f]) => {
    const sg = SIGNS[p.sign];
    return `<button class="b3" type="button"${fAttr(f)} aria-label="${l} in ${sg.n}"><span class="b3-k">${g ? `<span class="sym">${T(g)}</span>` : '<span class="ax-sym">ASC</span>'}${l}</span><span class="b3-s"><b>${sg.n}</b><span class="sym" style="color:${ELHEX[sg.el]}">${T(sg.g)}</span></span></button>`;
  })
  .join('');
const ASP_WORD = { conjunction: 'conj', sextile: 'sex', square: 'sq', trine: 'tri', opposition: 'opp' };
const SIGCHIPS = SIGNATURES.split(/\s*·\s*/)
  .filter(Boolean)
  .map((t) => {
    const hm = t.match(/(\d+)(?:st|nd|rd|th) house/i),
      am = t.match(/\b(conjunction|sextile|square|trine|opposition)s?\b/i),
      em = t.match(/\b(water|fire|earth|air)\b/i);
    const pl = PLANETS.find((p) => new RegExp(`\\b${p.n}\\b`).test(t));
    let ic,
      f,
      c = 'var(--ink-2)';
    if (hm) {
      ic = `<b>${hm[1]}</b>`;
      f = { kind: 'house', i: hm[1] - 1 };
    } else if (am) {
      const a = ATYPE[ASP_WORD[am[1].toLowerCase()]];
      ic = `<span class="sym">${T(a.g)}</span>`;
      c = a.hex;
    } else if (pl) {
      ic = `<span class="sym">${T(pl.g)}</span>`;
      c = em ? ELHEX[em[1].toLowerCase()] : 'var(--ink-2)';
    } else if (em) {
      ic = ELICON(em[1].toLowerCase());
      c = ELHEX[em[1].toLowerCase()];
    }
    if (!f && pl) f = { kind: 'planet', i: pl.i };
    // names in ink, planets with their glyph, elements with their triangle, the rest quiet
    let tx = t.replace(/(\d+(?:st|nd|rd|th) house|\d+%)/g, '<b>$1</b>');
    if (pl)
      tx = tx.replace(
        new RegExp(`\\b${pl.n}\\b`),
        `<b>${hm || am ? `<span class="sym">${T(pl.g)}</span>` : ''}${pl.n}</b>`,
      );
    if (em && !(!hm && !am && !pl))
      tx = tx.replace(
        em[0],
        `<b class="sig-el" style="color:${ELHEX[em[1].toLowerCase()]}">${ELICON(em[1].toLowerCase())}</b>${em[0]}`,
      );
    else if (em) tx = tx.replace(em[0], `<b>${em[0]}</b>`);
    return `<button class="sig" type="button"${f ? fAttr(f) : ' data-go="balance"'}><span class="sig-ic" style="--c:${c}">${ic}</span><span class="sig-tx">${tx}</span></button>`;
  })
  .join('');
// the tag and "in your chart" text each kind of focus already has for its card
const cardOf = (f) => {
  if (f.kind === 'planet') {
    const p = PLANETS[f.i];
    return { tag: p.note, text: CONTENT.cards.planets[p.n]?.chart };
  }
  if (f.kind === 'angle') {
    const a = ANGLES[f.i];
    return { tag: a.note, text: CONTENT.cards.planets[a.n]?.chart };
  }
  if (f.kind === 'sign') {
    const c = CONTENT.cards.signs[SIGNS[f.i].n];
    return { tag: c?.tag, text: c?.chart };
  }
  if (f.kind === 'house') {
    const c = CONTENT.cards.houses[f.i];
    return { tag: c?.tag, text: c?.chart };
  }
  const x = ASPECTS[f.i],
    A = CONTENT.cards.aspects,
    pr = A.pairs[PLANETS[x.a].n + '|' + PLANETS[x.b].n] || A.pairs[PLANETS[x.b].n + '|' + PLANETS[x.a].n];
  return { tag: pr?.tag, text: pr?.chart };
};
function infoRender() {
  const f = S.pin,
    d = describe(f),
    c = d ? cardOf(f) : null;
  mi.classList.toggle('pinned', !!d);
  mi.innerHTML = `<div class="mi-in">
      <div class="mi-top"><button class="mi-name" type="button" aria-label="${d ? d.name + ': ' : ''}see everything in your chart">${d?.glyph ? `<span class="sym">${T(d.glyph)}</span>` : ''}<b>${d ? d.name : 'Your chart'}</b>${d ? '' : '<span class="mi-see">See all</span>'}${CHEV}</button>
        <button class="zb" data-z="-1" aria-label="Previous">${ARROW('M8.5 3.5L5 7l3.5 3.5')}</button><button class="zb" data-z="1" aria-label="Next">${ARROW('M5.5 3.5L9 7l-3.5 3.5')}</button></div>
      ${d ? `<div class="mi-pos">${[d.l1, d.l2s || d.l2].filter(Boolean).join(' · ')}</div>` : `<div class="mi-rest"><div class="mi-b3">${BIG3}</div>${SIGCHIPS ? `<div class="mi-sigs">${SIGCHIPS}</div>` : ''}</div>`}
      <div class="mi-body" role="button" tabindex="0"${d ? ' aria-label="Read the full card"' : ''}><span class="mi-tag">${d ? c.tag || '' : ''}</span><span class="mi-text">${d ? c.text || '' : ''}</span></div>
      <button class="mi-more" type="button" tabindex="-1">More</button>
    </div>`;
}
mi.addEventListener('keydown', (e) => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('mi-body')) {
    e.preventDefault();
    e.target.click();
  }
});
mi.addEventListener('click', (e) => {
  const b = e.target.closest('button, .mi-body');
  if (!b) return;
  e.stopPropagation(); // stepping re-renders this area, so the page-wide handler would see a detached target and let go
  if (b.dataset.z) return stepBy(+b.dataset.z);
  if (b.dataset.f) return pin(JSON.parse(b.dataset.f));
  if (b.dataset.go) return jump(b.dataset.go);
  if (b.classList.contains('mi-name')) return openIndex(S.pin);
  if (S.pin) histStart({ sheet: 'card', f: S.pin });
  else stepBy(1);
});
