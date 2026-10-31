/* ───────── reveal (fade up when scrolled into view; bars and donuts fill) ───────── */
const donutPrep = () =>
  $$('.donut .arc').forEach((a) => {
    const len = parseFloat(a.getAttribute('stroke-dasharray'));
    a.dataset.len = len;
    a.style.strokeDashoffset = +a.dataset.off + len;
  });
donutPrep();
const io = new IntersectionObserver(
  (es) =>
    es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      // once settled, drop the reveal classes so hover lift and other transitions own the element again
      e.target.addEventListener('transitionend', function done(ev) {
        if (ev.target !== e.target || ev.propertyName !== 'transform') return;
        e.target.classList.remove('reveal', 'in');
        e.target.removeEventListener('transitionend', done);
      });
      $$('.donut .arc', e.target).forEach((a) => {
        a.style.strokeDashoffset = a.dataset.off;
      });
      io.unobserve(e.target);
    }),
  { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
);
$$('.reveal').forEach((el) => io.observe(el));

/* ───────── in-page links: smooth jump + flash ───────── */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute('href').slice(1),
    t = document.getElementById(id);
  if (!t) return;
  e.preventDefault();
  jump(id);
  const target = t.classList.contains('card') ? t : $('.card', t) || t;
  target.classList.remove('flash');
  void target.offsetWidth;
  target.classList.add('flash');
});
