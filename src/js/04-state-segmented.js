  /* ───────── state ───────── */
  const S = { hover: null, hsrc: null, pin: null, mode: 'glyph', tab: 'all', filter: 'all', lines: true };
  const same = (a, b) => a && b && a.kind === b.kind && a.i === b.i;
  const parse = (s) => { if (!s) return null; const [kind, i] = s.split(':'); return { kind, i: +i }; };
  const key = (f) => f ? f.kind + ':' + f.i : '';

  /* ───────── segmented control (Resurf lozenge: spring .45s / bounce .18) ───────── */
  const SPRING_LOZ = getComputedStyle(document.documentElement).getPropertyValue('--spring-loz').trim();
  function segmented(el, opts, value, onChange) {
    el.innerHTML = '<span class="loz" aria-hidden="true"></span>' + opts.map((o) => `<button role="tab" data-v="${o.v}" aria-selected="${o.v === value}" tabindex="${o.v === value ? 0 : -1}">${o.html}</button>`).join('');
    const loz = el.querySelector('.loz'), btns = $$('button', el);
    let anim = null, cur = value;
    const box = (b) => ({ left: b.offsetLeft + 'px', width: b.offsetWidth + 'px' });
    const place = () => { const b = btns.find((x) => x.dataset.v === cur); if (b) Object.assign(loz.style, box(b)); };
    const set = (v, fire = true) => {
      if (v === cur) return;
      const b = btns.find((x) => x.dataset.v === v); if (!b) return;
      const cs = getComputedStyle(loz), from = { left: cs.left, width: cs.width }, to = box(b);
      anim?.cancel(); cur = v; Object.assign(loz.style, to);
      if (!RM && from.width !== '0px') anim = loz.animate([from, to], { duration: el.dataset.ease ? 350 : 450, easing: el.dataset.ease || SPRING_LOZ || 'ease-out' });
      btns.forEach((x) => { const on = x === b; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1; });
      if (fire) onChange(v);
    };
    btns.forEach((b) => b.addEventListener('click', () => set(b.dataset.v)));
    el.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const k = btns.findIndex((b) => b.dataset.v === cur), n = btns[(k + (e.key === 'ArrowRight' ? 1 : -1) + btns.length) % btns.length];
      set(n.dataset.v); n.focus(); e.preventDefault();
    });
    requestAnimationFrame(place); document.fonts?.ready.then(place); addEventListener('resize', place);
    return { set: (v) => set(v, false), place };
  }

