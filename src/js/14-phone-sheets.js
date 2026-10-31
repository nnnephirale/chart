// sheets: one at a time, over a dimmed chart; moving between the index and a card swaps them in place
let sheetEl = null;
function openSheet(el) {
  if (sheetEl === el) return;
  if (sheetEl) {
    [sheetEl, el].forEach((x) => {
      x.style.transition = 'none';
    });
    sheetEl.classList.remove('open');
    el.classList.add('open');
    el.offsetWidth;
    [sheetEl, el].forEach((x) => {
      x.style.transition = '';
    });
    if (!RM)
      el.firstElementChild.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, easing: 'ease-out' });
  } else el.classList.add('open');
  sheetEl = el;
  scrim.classList.add('on');
}
function closeSheet() {
  hist.list = [];
  hist.at = -1;
  if (!sheetEl) return;
  sheetEl.classList.remove('open');
  scrim.classList.remove('on');
  sheetEl = null;
}

// history: every screen opened in the sheet (the index or any card); back past the first returns to the chart
const hist = { list: [], at: -1 };
const cardScroller = () => $(':scope > div:last-child', focusEl);
function histSave() {
  const h = hist.list[hist.at];
  if (h)
    h.scroll =
      h.sheet === 'idx'
        ? { page: idxAt(), top: idxPages[idxAt()].scrollTop }
        : cardScroller()?.scrollTop || 0;
}
function histShow(h) {
  if (h.sheet === 'idx') showIndex(h.f, h.scroll);
  else {
    pin(h.f);
    openSheet(inspEl);
    const sc = cardScroller();
    if (sc) sc.scrollTop = h.scroll || 0;
  }
  const on = hist.at < hist.list.length - 1;
  $$('[data-hist="fwd"]').forEach((b) => {
    if (on && b.hidden) {
      b.hidden = false;
      b.classList.remove('in');
      b.offsetWidth;
      b.classList.add('in');
    } else if (!on) b.hidden = true;
  });
}
function histStart(h) {
  hist.list = [h];
  hist.at = 0;
  histShow(h);
}
function histGo(h) {
  histSave();
  hist.list = hist.list.slice(0, hist.at + 1);
  hist.list.push(h);
  hist.at++;
  histShow(h);
}
function histStep(d) {
  histSave();
  const n = hist.at + d;
  if (n < 0) return closeSheet();
  if (n >= hist.list.length) return;
  hist.at = n;
  histShow(hist.list[n]);
}
// a link inside the card: on a phone it's a new screen in the sheet's history
const inspGo = (f) => (PHONE.matches && sheetEl === inspEl ? histGo({ sheet: 'card', f }) : pin(f));

// four pages, one per section; the tabs name them, so the pages carry no headings
idxBody.innerHTML = [
  placeRows(),
  SIGNS_BY_COUNT.map(sgRow).join(''),
  HOUSES.map((h, i) => hsRow(i)).join(''),
  ASPECTS.map(asRow).join(''),
]
  .map((rows) => `<div class="idx-page">${rows}</div>`)
  .join('');
const idxPages = $$('.idx-page', idxBody),
  PAGE_OF = { planet: 0, angle: 0, sign: 1, house: 2, aspect: 3 };
const idxStride = () => idxPages[1].offsetLeft - idxPages[0].offsetLeft || 1;
const idxLeft = (i) => idxPages[i].offsetLeft - (idxBody.clientWidth - idxPages[i].offsetWidth) / 2;
const idxAt = () => Math.max(0, Math.min(idxPages.length - 1, Math.round(idxBody.scrollLeft / idxStride())));
const idxTabs = segmented(
  $('#idxTabs'),
  ['Placements', 'Signs', 'Houses', 'Aspects'].map((n, i) => ({ v: String(i), html: n })),
  '0',
  (v) => idxBody.scrollTo({ left: idxLeft(+v), behavior: RM ? 'auto' : 'smooth' }),
);
// the swipe drives everything: the underline slides between tabs, and each card steps back (scale and fade) as it leaves the centre
const idxLoz = $('#idxTabs .loz'),
  idxBtns = $$('#idxTabs button');
let idxSettle = 0,
  idxRaf = 0;
function idxFrame() {
  idxRaf = 0;
  const p = Math.max(0, Math.min(idxBtns.length - 1, idxBody.scrollLeft / idxStride())),
    i = Math.floor(p),
    t = p - i,
    A = idxBtns[i],
    B = idxBtns[Math.min(i + 1, idxBtns.length - 1)];
  idxLoz.getAnimations().forEach((x) => x.cancel());
  idxLoz.style.left = A.offsetLeft + (B.offsetLeft - A.offsetLeft) * t + 'px';
  idxLoz.style.width = A.offsetWidth + (B.offsetWidth - A.offsetWidth) * t + 'px';
  if (!RM)
    idxPages.forEach((pg, k) => {
      const d = Math.min(1, Math.abs(k - p));
      pg.style.transform = `scale(${1 - 0.06 * d})`;
      pg.style.opacity = 1 - 0.45 * d;
    });
}
idxBody.addEventListener(
  'scroll',
  () => {
    if (!idxRaf) idxRaf = requestAnimationFrame(idxFrame);
    clearTimeout(idxSettle);
    idxSettle = setTimeout(() => idxTabs.set(String(idxAt())), 90);
  },
  { passive: true },
);
function showIndex(f, scroll) {
  $$('.row.hit', idxBody).forEach((r) => r.classList.remove('hit'));
  openSheet(idxEl);
  if (scroll) {
    idxBody.scrollLeft = idxLeft(scroll.page);
    idxPages[scroll.page].scrollTop = scroll.top;
  } else {
    const k = f ? PAGE_OF[f.kind] : 0,
      pg = idxPages[k],
      row = f && $(`.row[data-focus="${key(f)}"]`, pg);
    idxBody.scrollLeft = idxLeft(k);
    pg.scrollTop = row ? Math.max(0, row.offsetTop - pg.clientHeight / 2 + row.offsetHeight / 2) : 0;
    row?.classList.add('hit');
  }
  idxTabs.set(String(idxAt()));
  idxTabs.place();
  idxFrame();
}
const openIndex = (f) => histStart({ sheet: 'idx', f });

// long-press anything on the wheel: the index opens on it
const lp = { t: 0, at: null, fired: false };
svg.addEventListener('pointerdown', (e) => {
  if (!PHONE.matches) return;
  lp.fired = false;
  lp.at = [e.clientX, e.clientY];
  clearTimeout(lp.t);
  const ev = { clientX: e.clientX, clientY: e.clientY, target: e.target };
  lp.t = setTimeout(() => {
    lp.fired = true;
    navigator.vibrate?.(8);
    openIndex(wheelHit(ev) || S.pin);
  }, 480);
});
svg.addEventListener('pointermove', (e) => {
  if (lp.at && Math.hypot(e.clientX - lp.at[0], e.clientY - lp.at[1]) > 8) clearTimeout(lp.t);
});
['pointerup', 'pointercancel', 'pointerleave'].forEach((t) =>
  svg.addEventListener(t, () => {
    clearTimeout(lp.t);
    lp.at = null;
  }),
);
svg.addEventListener('contextmenu', (e) => {
  if (PHONE.matches) e.preventDefault();
});
