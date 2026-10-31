  /* ───────── highlight engine ───────── */
  const gAel = $('#asps');
  function paint() {
    const f = S.pin || S.hover;
    let hiP = null, hiA = null;
    if (f?.kind === 'planet') { hiP = new Set([f.i]); hiA = new Set(aspectsOf(f.i).map((x) => x.k)); }
    else if (f?.kind === 'sign') hiP = new Set(signOf(f.i).map((p) => p.i));
    else if (f?.kind === 'house') hiP = new Set(houseOf(f.i).map((p) => p.i));
    else if (f?.kind === 'angle') hiP = new Set();
    else if (f?.kind === 'aspect') { const x = ASPECTS[f.i]; hiP = new Set([x.a, x.b]); hiA = new Set([x.k]); }
    pEls.forEach((g, i) => {
      g.classList.toggle('hi', !!hiP && hiP.has(i));
      g.classList.toggle('dim', !!hiP && !hiP.has(i) && !(f.kind === 'planet' && hiA && [...hiA].some((k) => ASPECTS[k].a === i || ASPECTS[k].b === i)));
      g.classList.toggle('sel', S.pin?.kind === 'planet' && S.pin.i === i);
    });
    gAel.classList.toggle('quiet', !!f);
    gAel.classList.toggle('hidden', !S.lines && !hiA);
    aLines.forEach((l, k) => {
      const on = !!hiA && hiA.has(k);
      const filtered = S.filter !== 'all' && ASPECTS[k].t !== S.filter && !on;
      l.classList.toggle('hi', on); l.classList.toggle('filtered', filtered); aHits[k].classList.toggle('filtered', filtered);
      if (!S.lines && !on) l.classList.add('filtered');
    });
    zseg.forEach((z, s) => z.classList.toggle('hi', f?.kind === 'sign' && f.i === s));
    hsec.forEach((z, h) => z.classList.toggle('on', f?.kind === 'house' && f.i === h));
    ssec.forEach((z, s) => z.classList.toggle('on', f?.kind === 'sign' && f.i === s));
    const fh = f?.kind === 'house' ? f.i : -1;
    hLbl.forEach((ls, h) => ls.forEach((t) => t.classList.toggle('on', h === fh)));
    cuspEl.forEach((l, h) => l.classList.toggle('on', fh >= 0 && (h === fh || h === (fh + 1) % 12)));
    const fa = f?.kind === 'angle' ? ANGLES[f.i].house - 1 : -1;
    cuspEl.forEach((l, h) => l.classList.toggle('ang', h === fa));
    axEl.forEach((t, h) => t && t.classList.toggle('on', h === fa));
    const d = describe(f);
    ctr.classList.toggle('on', !!d);
    if (d) {
      cName.textContent = d.name;
      // fit the name inside the centre disc: measure at full size, scale down to 128 units wide
      cName.setAttribute('font-size', 23);
      const w = cName.getBBox().width; if (w > 128) cName.setAttribute('font-size', Math.floor(23 * 128 / w * 10) / 10);
      cL1.textContent = d.l1; cL2.textContent = d.l2s || d.l2;
      const hs = f.kind === 'house'; cL1.setAttribute('fill', hs ? '#8c8c8c' : '#4d4d4d'); cL2.setAttribute('fill', hs ? '#4d4d4d' : '#8c8c8c');
    }
    const pf = S.pin || (S.hsrc === 'wheel' && S.hover);
    $('#legend').classList.toggle('show-el', S.tab === 'signs' || S.pin?.kind === 'sign');
    inspEl.classList.toggle('detail', !!pf);
    if (pf) renderFocus(pf);
    $$('[data-focus]').forEach((el) => { if (el.closest('svg')) return; el.classList.toggle('hov', !!S.hover && el.dataset.focus === key(S.hover)); el.classList.toggle('sel', !!S.pin && el.dataset.focus === key(S.pin)); });
    agridHeads(f);
    zoomSync();
  }

  /* hover. The wheel hit-tests by mode: the inspector tab decides what the whole wheel is sensitive to
     (Planets: anywhere near a planet; Signs and Houses: anywhere in that slice; Aspects: nearest line).
     Everything else hovers by element. A short grace period stops flicker between neighbours. */
  let clearT = 0;
  const cancelClear = () => { clearTimeout(clearT); clearT = 0; };
  const setHover = (f, src) => { cancelClear(); if (S.pin || (same(f, S.hover) && S.hsrc === src)) return; S.hover = f; S.hsrc = src; paint(); };
  const clearHover = () => { if (!S.hover || clearT) return; clearT = setTimeout(() => { clearT = 0; S.hover = null; S.hsrc = null; paint(); }, 70); };
  const angDiff = (a, b) => Math.abs(((a - b + 540) % 360) - 180);
  const houseAt = (lon) => CUSPS.findIndex((c, h) => (lon - c + 360) % 360 < (CUSPS[(h + 1) % 12] - c + 360) % 360);
  const segDist = (px, py, [ax, ay], [bx, by]) => { const dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy))); return Math.hypot(px - ax - t * dx, py - ay - t * dy); };
  const aspDist = (x, px, py, r, lon) => {
    if (x.t !== 'conj') return segDist(px, py, pt(PLANETS[x.a].lon, R.asp), pt(PLANETS[x.b].lon, R.asp));
    const d = ((disp[x.b] - disp[x.a] + 540) % 360) - 180, off = ((lon - disp[x.a] + 540) % 360) - 180;
    const inside = d > 0 ? off >= -2 && off <= d + 2 : off <= 2 && off >= d - 2;
    return inside ? Math.abs(r - (R.asp - 5)) : Infinity;
  };
  function wheelHit(e) {
    const m = svg.getScreenCTM(); if (!m) return null;
    const q = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    if (S.tab === 'all') { const el = e.target.closest?.('[data-focus]'); return el && svg.contains(el) ? parse(el.dataset.focus) : null; }
    const r = Math.hypot(q.x - C, q.y - C); if (r > R.zOut + 10) return null;
    const lon = ((Math.atan2(C - q.y, q.x - C) * 180 / Math.PI - 180 + ASC) % 360 + 720) % 360;
    if (S.tab === 'signs') return { kind: 'sign', i: Math.floor(lon / 30) % 12 };
    if (S.tab === 'houses') { const h = houseAt(lon); return h < 0 ? null : { kind: 'house', i: h }; }
    if (S.tab === 'planets') {
      if (r < R.asp - 10) return null;
      let best = null, bd = 12; // degrees: the glyph ring uses the fanned position, the tick ring the true degree
      PLANETS.forEach((p) => { const d = angDiff(lon, r >= R.tick ? p.lon : disp[p.i]); if (d < bd) { bd = d; best = { kind: 'planet', i: p.i }; } });
      ANGLES.forEach((a) => { const d = angDiff(lon, a.lon); if (d < bd) { bd = d; best = { kind: 'angle', i: a.i }; } });
      return best;
    }
    if (r > R.asp + 8) return null;
    let best = -1, bd = 10; // svg units from the nearest visible line
    ASPECTS.forEach((x) => { if (S.filter !== 'all' && x.t !== S.filter) return; const d = aspDist(x, q.x, q.y, r, lon); if (d < bd) { bd = d; best = x.k; } });
    return best < 0 ? null : { kind: 'aspect', i: best };
  }
  svg.addEventListener('pointermove', (e) => {
    if (e.pointerType === 'touch') return;
    const f = wheelHit(e); svg.classList.toggle('aim', !!f);
    if (f) setHover(f, 'wheel'); else clearHover();
  });
  svg.addEventListener('pointerleave', () => { svg.classList.remove('aim'); clearHover(); });
  document.addEventListener('pointerover', (e) => {
    if (e.pointerType === 'touch') return;
    const el = e.target.closest('[data-focus]'); if (!el || el.closest('#wheel')) return;
    setHover(parse(el.dataset.focus), 'ui');
  });
  document.addEventListener('pointerout', (e) => {
    if (e.pointerType === 'touch') return;
    const el = e.target.closest('[data-focus]'); if (!el || el.closest('#wheel')) return;
    const to = e.relatedTarget && e.relatedTarget.closest?.('[data-focus]');
    if (to && !to.closest('#wheel')) return;
    clearHover();
  });
  /* lock: a click on the wheel locks what it is showing and freezes hover. Clicking another part of the
     wheel moves the lock there; clicking anywhere outside the round chart (or Esc) lets go. */
  const pin = (f) => { cancelClear(); S.pin = f; S.hover = null; S.hsrc = null; paint(); revealInList(f); };
  const unpin = () => { if (!S.pin) return; S.pin = null; paint(); };
  /* retrograde explainer: a centred modal over a blurred page */
  const rxModal = $('#rxModal');
  $('#rxList').innerHTML = PLANETS.filter((p) => p.rx).map((p) => `<span class="chip"><span class="sym">${T(p.g)}</span>${p.n} · ${p.deg} ${SIGNS[p.sign].n}</span>`).join('');
  $('#rxNode').textContent = 'The North Node is almost always retrograde: it moves backwards through the zodiac as a matter of course, so its ℞ is routine rather than a signature.';
  const closeModal = () => { if (!rxModal.open || rxModal.classList.contains('closing')) return; rxModal.classList.add('closing'); setTimeout(() => { rxModal.classList.remove('closing'); rxModal.close(); }, RM ? 0 : 150); };
  rxModal.addEventListener('cancel', (e) => { e.preventDefault(); closeModal(); });
  rxModal.addEventListener('click', (e) => { if (e.target === rxModal || e.target.closest('[data-close]')) closeModal(); });

  document.addEventListener('click', (e) => {
    if (e.target.closest('dialog')) return; // the modal handles its own clicks and never touches the lock
    const m = e.target.closest('[data-modal]');
    if (m) { e.preventDefault(); rxModal.showModal(); return; }
    const show = e.target.closest('[data-show]');
    if (show) { e.preventDefault(); showOnChart(parse(show.dataset.show)); return; }
    if (PHONE.matches) {
      if (lp.fired) { lp.fired = false; return; } // the long-press already opened the index
      const hb = e.target.closest('[data-hist]');
      if (hb) { histStep(hb.dataset.hist === 'back' ? -1 : 1); return; }
      if (e.target.closest('#scrim, [data-sheet-close]')) { closeSheet(); return; }
      if (e.target.closest('#idx')) { const r = e.target.closest('[data-focus]'); if (r) { const f = parse(r.dataset.focus), m = MODE_OF[f.kind]; closeSheet(); if (m !== S.tab) chooseMode(m); pin(f); } return; } // the sheet slides away, the tabs switch to its kind and the wheel zooms to it
      if (e.target.closest('#minfo, .mtabs-wrap, .hero-head, #rest')) return; // they run their own taps and keep the lock
      if (e.target.closest('.insp') && !e.target.closest('[data-focus]')) return;
    }
    // on the wheel: lock what it is showing (taps and locked wheels have no hover, so they hit-test)
    if (e.target.closest('#wheel')) { const f = (S.hsrc === 'wheel' && S.hover) || wheelHit(e); if (f) pin(f); else unpin(); return; }
    const el = e.target.closest('[data-focus]');
    if (el) { if (el.closest('.insp')) inspGo(parse(el.dataset.focus)); return; } // rows elsewhere lock through their own handlers
    if (e.target.closest('#focus')) return; // reading or selecting text in the open card keeps it
    if (!e.target.closest('.toolbar')) unpin(); // the label and aspect-line toggles keep the lock
  });
  document.addEventListener('keydown', (e) => {
    if (rxModal.open) return; // Esc closes the modal first
    if (e.key === 'Escape') { if (sheetEl) closeSheet(); else if (document.body.classList.contains('rest-open')) closeRest(); else unpin(); }
    const row = (e.key === 'Enter' || e.key === ' ') && e.target.closest?.('.insp [data-focus]');
    if (row) { e.preventDefault(); inspGo(parse(row.dataset.focus)); }
  });

