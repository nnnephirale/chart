/* ───────── describe a focus (shared by centre label, inspector, captions) ───────── */
function describe(f) {
  if (!f) return null;
  if (f.kind === 'planet') {
    const p = PLANETS[f.i],
      s = SIGNS[p.sign];
    return {
      kind: 'Planet',
      glyph: p.g,
      name: p.n,
      l1: `${p.deg} ${s.n}${p.rx ? ' ℞' : ''}`,
      l2: `${ORD(p.house)} house · ${HOUSES[p.house - 1]}`,
    };
  }
  if (f.kind === 'angle') {
    const a = ANGLES[f.i],
      s = SIGNS[a.sign];
    return {
      kind: 'Angle',
      glyph: '',
      name: a.n,
      l1: `${a.deg} ${s.n}`,
      l2: `${ORD(a.house)} house · ${HOUSES[a.house - 1]}`,
    };
  }
  if (f.kind === 'sign') {
    const s = SIGNS[f.i],
      ps = signOf(f.i);
    return {
      kind: 'Sign',
      glyph: s.g,
      name: s.n,
      l1: `${s.el[0].toUpperCase() + s.el.slice(1)} · ${s.mo}`,
      l2: ps.length ? ps.map((p) => p.n).join(' · ') : 'No planets',
      l2s: ps.length > 2 ? `${ps.length} planets` : null,
    };
  }
  if (f.kind === 'house') {
    const ps = houseOf(f.i);
    return {
      kind: 'House',
      glyph: '',
      name: `${ORD(f.i + 1)} house`,
      l1: `${HOUSES[f.i]} · cusp ${CUSP_TXT[f.i]}`,
      l2: ps.length ? ps.map((p) => p.n).join(' · ') : 'Empty',
      l2s: ps.length > 2 ? `${ps.length} planets` : null,
    };
  }
  const x = ASPECTS[f.i],
    A = PLANETS[x.a],
    B = PLANETS[x.b],
    t = ATYPE[x.t];
  return { kind: 'Aspect', glyph: t.g, name: `${A.n} ${t.n} ${B.n}`, l1: `orb ${x.orb}`, l2: x.s };
}
