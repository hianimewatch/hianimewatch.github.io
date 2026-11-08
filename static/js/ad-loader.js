/* Ad gate: ad banners and the pop-under start loading on the visitor's first interaction
   (scroll, tap, key press, mouse move), not during the initial page load.
   Why: third-party ad scripts are the heaviest and least reliable part of a page. Loading them after the
   visitor starts using the page keeps the first paint fast, stops ad-network errors from landing in the
   console of non-interactive loads (PageSpeed, crawlers), and does not change what real visitors see.

   Banner iframes are written as <iframe data-srcdoc="..."> or have srcdoc assigned from script.
   Any srcdoc that contains an ad tag (atOptions) is held back until the gate opens. */
(function () {
  if (window.__adGate) return;
  var gate = window.__adGate = { ready: false, queue: [] };
  var desc = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, 'srcdoc');
  if (!desc || !desc.set) { gate.ready = true; return; }

  Object.defineProperty(HTMLIFrameElement.prototype, 'srcdoc', {
    configurable: true,
    enumerable: desc.enumerable,
    get: desc.get,
    set: function (v) {
      if (!gate.ready && typeof v === 'string' && v.indexOf('atOptions') > -1) { gate.queue.push([this, v]); return; }
      desc.set.call(this, v);
    }
  });

  function open() {
    if (gate.ready) return;
    gate.ready = true;
    gate.queue.splice(0).forEach(function (p) { desc.set.call(p[0], p[1]); });
    window.dispatchEvent(new Event('ads-ready'));
  }
  ['pointerdown', 'touchstart', 'keydown', 'scroll', 'mousemove', 'wheel'].forEach(function (ev) {
    window.addEventListener(ev, open, { once: true, passive: true });
  });

  // static banners: <iframe data-srcdoc="..."> load when they come near the viewport (the gate decides when)
  function watch() {
    var frames = [].slice.call(document.querySelectorAll('iframe[data-srcdoc]'));
    if (!frames.length) return;
    function load(f) { if (f.dataset.srcdoc) { f.srcdoc = f.dataset.srcdoc; f.removeAttribute('data-srcdoc'); } }
    if (!('IntersectionObserver' in window)) { frames.forEach(load); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); load(e.target); } });
    }, { rootMargin: '300px' });
    frames.forEach(function (f) { if (!f.__adWatched) { f.__adWatched = true; io.observe(f); } });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();
})();
