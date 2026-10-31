  /* ───────── section rail: scroll-spy + gliding dot ───────── */
  const ICON = {
    chart: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.5"/><path d="M3.5 12h17M12 3.5v17"/>',
    planets: '<path d="M9.5 7h10M9.5 12h10M9.5 17h10"/><circle cx="5.5" cy="7" r="1.1"/><circle cx="5.5" cy="12" r="1.1"/><circle cx="5.5" cy="17" r="1.1"/>',
    cusps: '<path d="M4 10.5 12 4l8 6.5V20H4z"/><path d="M10 20v-5h4v5"/>',
    power: '<path d="M5 20v-7M10 20V6M15 20v-9M20 20v-6"/>',
    balance: '<circle cx="12" cy="12" r="8"/><path d="M12 4v8l6 5"/>',
    signs: '<path d="M12 3.5v4M12 16.5v4M3.5 12h4M16.5 12h4M6.3 6.3l2.6 2.6M15.1 15.1l2.6 2.6M17.7 6.3l-2.6 2.6M8.9 15.1l-2.6 2.6"/>',
    aspects: '<path d="M12 4.5 20 18.5H4z"/>',
    stelliums: '<circle cx="7" cy="8" r="2.4"/><circle cx="17" cy="8" r="2.4"/><circle cx="12" cy="17" r="2.4"/><path d="M9.4 8h5.2M8.2 10.1l2.6 4.8M15.8 10.1l-2.6 4.8"/>',
    stories: '<path d="M4 5.5c2.6-1 5.4-1 8 .6 2.6-1.6 5.4-1.6 8-.6V19c-2.6-1-5.4-1-8 .6-2.6-1.6-5.4-1.6-8-.6z"/><path d="M12 6.1v13.5"/>',
    notable: '<path d="m12 4 2.4 5 5.4.6-4 3.7 1.1 5.3L12 16l-4.9 2.6 1.1-5.3-4-3.7 5.4-.6z"/>',
    codes: '<circle cx="8" cy="15.5" r="3.8"/><path d="M10.8 12.7 19 4.5M16 7.5l2 2M13.8 9.7l2 2"/>',
    discussion: '<path d="M5 5.5h14v10h-8.5L6 19.5v-4H5z"/>',
  };
  const DESK = matchMedia('(min-width: 961px)');
  const SECS = $$('section[data-nav]');
  const rail = $('#rail'), dot = $('.dot', rail);
  rail.insertAdjacentHTML('beforeend', SECS.map((s) => `<li><a href="#${s.id}" data-id="${s.id}"><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[s.id] || ''}</svg><span class="lb">${s.dataset.nav}</span></a></li>`).join(''));
  const links = $$('a', rail);
  let active = -1, dotAnim = null, jumpTo = null, jumpUntil = 0;
  const dotY = (i) => links[i].parentElement.offsetTop + links[i].offsetHeight / 2;
  const setActive = (i) => {
    if (i === active || i < 0) return;
    const prev = active; active = i;
    links.forEach((l, k) => l.setAttribute('aria-current', k === i));
    const to = dotY(i);
    if (prev < 0 || RM) { dot.style.transform = `translateY(${to}px)`; return; }
    const from = getComputedStyle(dot).transform;
    dotAnim?.cancel(); dot.style.transform = `translateY(${to}px)`;
    dotAnim = dot.animate([{ transform: from === 'none' ? `translateY(${dotY(prev)}px)` : from }, { transform: `translateY(${to}px)` }], { duration: 380, easing: 'cubic-bezier(.16,1,.3,1)' });
  };
  let spyQueued = false;
  const spy = () => {
    spyQueued = false;
    const read = scrollY + innerHeight * .3;
    let want = -1;
    SECS.forEach((s, i) => { if (s.offsetTop <= read) want = Math.max(want, i); });
    if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) want = SECS.length - 1;
    if (want < 0) want = 0;
    if (jumpTo !== null) { if (SECS[want].id === jumpTo || performance.now() > jumpUntil) { jumpTo = null; setActive(want); } }
    else setActive(want);
  };
  addEventListener('scroll', () => { if (!spyQueued) { spyQueued = true; requestAnimationFrame(spy); } }, { passive: true });
  addEventListener('wheel', () => { jumpTo = null; }, { passive: true });
  addEventListener('touchstart', () => { jumpTo = null; }, { passive: true });
  function jump(id) {
    if (PHONE.matches) { if (id === 'chart') { closeRest(); return; } openRest(); }
    const t = document.getElementById(id); if (!t) return;
    const i = SECS.findIndex((s) => s.id === id);
    if (i >= 0) { jumpTo = id; jumpUntil = performance.now() + 1600; setActive(i); }
    // on phones, measure against the rest sheet itself: it may still be sliding up from 100vh
    const top = PHONE.matches ? t.getBoundingClientRect().top - restEl.getBoundingClientRect().top + restEl.offsetTop : t.getBoundingClientRect().top + scrollY;
    const y = id === 'chart' ? 0 : Math.max(0, top - (DESK.matches ? 40 : PHONE.matches ? 72 : 24));
    scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' });
  }
  $('.rail').addEventListener('click', (e) => { const a = e.target.closest('a'); if (!a) return; e.preventDefault(); e.stopPropagation(); jump(a.dataset.id || 'chart'); }, true);
  const replaceDot = () => { if (active >= 0) { dotAnim?.cancel(); dot.style.transform = `translateY(${dotY(active)}px)`; } };
  requestAnimationFrame(spy); spy(); document.fonts?.ready.then(replaceDot); addEventListener('resize', replaceDot); $('.rail').addEventListener('transitionend', (e) => { if (e.target === e.currentTarget && e.propertyName === 'width') replaceDot(); });

