// the rest of the chart: slides up over it, and back down to where you left the wheel
$('#restMeta').innerHTML = `<div class="hero-head">${$('.hero-head.off-plate').innerHTML}</div>`;
let restAnim = null;
function openRest() {
  if (!PHONE.matches || document.body.classList.contains('rest-open')) return;
  closeSheet();
  restAnim?.cancel();
  restBar.classList.remove('away');
  document.body.classList.add('rest-open');
  scrollTo(0, 0);
  restAnim = restEl.animate([{ transform: 'translateY(100vh)' }, { transform: 'none' }], {
    duration: RM ? 0 : 560,
    easing: 'cubic-bezier(.16,1,.3,1)',
  });
  restAnim.onfinish = () => document.body.classList.add('rest-settled');
}
function closeRest() {
  if (!document.body.classList.contains('rest-open')) return;
  restAnim?.cancel();
  document.body.classList.remove('rest-settled');
  zoomSync();
  restAnim = restEl.animate([{ transform: 'none' }, { transform: `translateY(${innerHeight}px)` }], {
    duration: RM ? 0 : 380,
    easing: 'cubic-bezier(.16,1,.3,1)',
    fill: 'forwards',
  });
  restAnim.onfinish = () => {
    document.body.classList.remove('rest-open');
    restAnim.cancel();
    restAnim = null;
    scrollTo(0, 0);
  };
}
// no theme colour on the chart screen, so Safari's bars stay see-through over the plate
const themeMeta = $('meta[name="theme-color"]');
const themeSync = () => {
  if (PHONE.matches && !document.body.classList.contains('rest-open')) themeMeta.remove();
  else if (!themeMeta.isConnected) document.head.appendChild(themeMeta);
};
new MutationObserver(themeSync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
themeSync();
$('#openRest').addEventListener('click', openRest);
$('#closeRest').addEventListener('click', closeRest);
let lastY = 0;
addEventListener(
  'scroll',
  () => {
    if (!document.body.classList.contains('rest-settled')) return;
    const y = scrollY,
      dy = y - lastY;
    if (Math.abs(dy) < 6) return;
    restBar.classList.toggle('away', dy > 0 && y > 80);
    lastY = y;
  },
  { passive: true },
);
PHONE.addEventListener('change', () => {
  closeSheet();
  document.body.classList.remove('rest-open', 'rest-settled');
  restAnim?.cancel();
  zoomSync();
  themeSync();
});
