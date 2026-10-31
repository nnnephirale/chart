  /* ───────── phone zoom ───────── */
  const FULL = [-14, -14, 628, 628];
  const Z = { ready: false, vb: FULL.slice(), raf: 0, key: '', on: false, card: null, nav: null };
  const setVB = (v) => { Z.vb = v; svg.setAttribute('viewBox', v.map(f2).join(' ')); svg.classList.toggle('zoomed', v[2] < 600); };
  // the square of the wheel worth seeing for a focus, kept inside the chart's own bounds
  function frameOf(f) {
    const ps = [], add = (lon, r) => ps.push(pt(lon, r));
    if (f.kind === 'planet') { const p = PLANETS[f.i]; add(disp[p.i], R.zOut + 6); add(p.lon, R.zOut + 6); add(disp[p.i], R.deg - 12); }
    else if (f.kind === 'angle') { const a = ANGLES[f.i]; add(a.lon, R.zOut + 16); add(a.lon, R.hIn); }
    else if (f.kind === 'sign' || f.kind === 'house') {
      const a = f.kind === 'sign' ? f.i * 30 : CUSPS[f.i], b0 = f.kind === 'sign' ? a + 30 : CUSPS[(f.i + 1) % 12], b = b0 < a ? b0 + 360 : b0;
      for (let k = 0; k <= 6; k++) { const l = a + (b - a) * k / 6; add(l, R.zOut + 4); add(l, R.hIn - 8); }
    } else if (f.kind === 'aspect') { const x = ASPECTS[f.i]; [x.a, x.b].forEach((i) => { add(PLANETS[i].lon, R.asp); add(disp[i], R.glyph + 18); }); }
    if (!ps.length) return FULL;
    const xs = ps.map((p) => p[0]), ys = ps.map((p) => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const s = Math.min(628, Math.max(250, Math.max(x1 - x0, y1 - y0) + 36));
    const fit = (c) => Math.min(Math.max(c - s / 2, -14), 614 - s);
    return [fit((x0 + x1) / 2), fit((y0 + y1) / 2), s, s];
  }
  const easeExpo = (t) => t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
  function zoomTo(v) {
    cancelAnimationFrame(Z.raf);
    if (RM) return setVB(v);
    const from = Z.vb.slice(), t0 = performance.now();
    const step = (now) => { const k = Math.min(1, (now - t0) / 700), e = easeExpo(k); setVB(from.map((a, i) => a + (v[i] - a) * e)); if (k < 1) Z.raf = requestAnimationFrame(step); };
    Z.raf = requestAnimationFrame(step);
  }
  // the step bar follows the current list's rows, in their order
  const stops = () => { const l = $('.list.on', lists); return l ? [...new Set($$('.row[data-focus]', l).filter((r) => r.offsetParent).map((r) => r.dataset.focus))] : []; };
  const stepBy = (n) => { const st = stops(); if (!st.length) return; const i = S.pin ? st.indexOf(key(S.pin)) : -1; pin(parse(st[i < 0 ? (n > 0 ? 0 : st.length - 1) : (i + n + st.length) % st.length])); };
  function zoomSync() {
    if (!Z.ready) return;
    const w = svg.getBoundingClientRect().width; if (!w) return; // hidden behind the rest sheet: keep the frame
    const on = !DESK.matches && w < 520, k = key(S.pin);
    if (k === Z.key && on === Z.on) return;
    const moved = k !== Z.key; Z.key = k; Z.on = on;
    zoomTo(on && S.pin ? frameOf(S.pin) : FULL);
    if (moved) infoRender();
  }

