/* Home page extras: a dot indicator for the full-screen sections, a scroll cue in the hero,
   and a portrait that leans a little toward the cursor. None of this changes the page's content. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  var home = document.getElementById('v-home');
  if (!home) return;
  var sections = Array.prototype.slice.call(home.querySelectorAll(':scope > section'));
  var NAMES = ['Welcome', 'About', 'Featured research', 'AI programmes', 'Get in touch'];

  function goTo(i) {
    var t = sections[Math.max(0, Math.min(sections.length - 1, i))];
    if (t) t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
  }

  /* dots */
  var nav = document.createElement('nav');
  nav.className = 'dots-nav';
  nav.setAttribute('aria-label', 'Sections of the home page');
  sections.forEach(function (s, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('aria-label', NAMES[i] || 'Section ' + (i + 1));
    b.title = NAMES[i] || '';
    b.addEventListener('click', function () { goTo(i); });
    nav.appendChild(b);
  });
  document.body.appendChild(nav);
  var dots = nav.querySelectorAll('button');
  function onHome() { return !home.hidden; }
  function syncVisibility() { nav.hidden = !onHome(); }
  document.addEventListener('viewchange', syncVisibility);
  syncVisibility();
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var i = sections.indexOf(en.target);
        dots.forEach(function (d, k) { d.classList.toggle('on', k === i); });
      });
    }, { threshold: 0.55 });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* scroll cue in the hero */
  var hero = home.querySelector('.hero.office');
  if (hero) {
    var cue = document.createElement('button');
    cue.type = 'button';
    cue.className = 'scrollcue';
    cue.setAttribute('aria-label', 'Scroll to the next section');
    cue.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
    cue.addEventListener('click', function () { goTo(1); });
    hero.appendChild(cue);
  }

  /* portrait tilt */
  var fig = document.getElementById('portrait');
  var img = fig && fig.querySelector('img');
  if (img && fine && !reduce) {
    var raf = 0, tx = 0, ty = 0, cx = 0, cy = 0;
    function paint() {
      raf = 0;
      cx += (tx - cx) * 0.16; cy += (ty - cy) * 0.16;
      img.style.transform = 'rotateY(' + (cx * 7).toFixed(2) + 'deg) rotateX(' + (-cy * 5).toFixed(2) + 'deg) translate3d(' + (cx * 8).toFixed(1) + 'px,' + (cy * 6).toFixed(1) + 'px,0) scale(1.02)';
      if (Math.abs(tx - cx) + Math.abs(ty - cy) > 0.002) raf = requestAnimationFrame(paint);
    }
    window.addEventListener('pointermove', function (e) {
      if (!onHome()) return;
      var r = fig.getBoundingClientRect();
      if (r.bottom < 0 || r.top > innerHeight) return;
      tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (innerWidth * 0.5)));
      ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / (innerHeight * 0.5)));
      if (!raf) raf = requestAnimationFrame(paint);
    }, { passive: true });
  }
})();
