/* Walking Abhishek. Two copies of one illustrated character:
   - the hero actor, who walks into the orange office and gives the intro;
   - the dock actor, who walks along the bottom of the screen on every page and changes outfit
     with the page (or the home-page section) in view.
   Click either one: he laughs, then hurries away. Hover him in teacher or board outfit: an email board drops down.
   Dialogue is shown as text in speech bubbles; there is no sound. */
(function () {
  'use strict';
  var EMAIL = 'abhishek.jha@spjimr.org';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;

  var INTRO = [
    ['intro1', "Hi, I'm Abhishek. Welcome to my office."],
    ['intro2', 'I teach and research AI at SPJIMR, in Mumbai.'],
    ['intro3', 'I help managers and researchers make better decisions with AI.'],
    ['intro4', 'Walk around with me: research, programmes, or just say hello.'],
    ['intro5', 'And yes, you can click on me.']
  ];
  var VIEW = {
    home: { costume: 'casual' },
    about: { costume: 'casual', line: ['about', 'A little about me. AI, teaching and research.'], wave: true },
    research: { costume: 'scientist', line: ['research', 'Lab coat on! Click any paper title to read it.'] },
    programmes: { costume: 'teacher', line: ['programmes', 'Class is in session. Pick a programme, and hover over me for my email.'] },
    contact: { costume: 'board', line: ['contact', "Here's my board. Copy my email, and let's talk."] }
  };
  var SECTION = {
    casual: [null, 'Click one of my three areas to jump the reel.'],
    scientist: ['research', 'Lab coat on! Click any paper title to read it.'],
    teacher: ['programmes', 'Class is in session. Pick a programme, and hover over me for my email.'],
    board: ['contact', "Here's my board. Copy my email, and let's talk."]
  };
  if (coarse) {
    VIEW.programmes.line[1] = 'Class is in session. Pick a programme, or tap me for my email.';
    SECTION.teacher[1] = VIEW.programmes.line[1];
  }

  var SVG =
    '<svg class="av-svg" viewBox="0 0 200 360" aria-hidden="true">' +
    '<ellipse cx="100" cy="352" rx="48" ry="7" fill="rgba(40,20,10,.22)"/>' +
    '<g class="bob">' +
      '<g class="leg leg-l"><rect x="74" y="244" width="22" height="94" rx="10" fill="#2a2e3a"/><path d="M70 334h28v12H62v-4a8 8 0 0 1 8-8z" fill="#141414"/></g>' +
      '<g class="leg leg-r"><rect x="104" y="244" width="22" height="94" rx="10" fill="#2a2e3a"/><path d="M102 334h28a8 8 0 0 1 8 8v4h-36z" fill="#141414"/></g>' +
      '<g class="arm arm-l"><path class="sleeve" d="M62 166c-9 6-13 18-14 34l-4 44" stroke-width="20" stroke-linecap="round" fill="none"/><circle class="skin" cx="44" cy="248" r="10"/>' +
        '<g class="c-book"><rect x="22" y="232" width="30" height="38" rx="3" fill="#3446d8"/><rect x="26" y="236" width="22" height="4" rx="1" fill="#f0b24a"/></g></g>' +
      '<path d="M60 158c10-8 24-12 40-12s30 4 40 12c6 6 6 20 4 40l-4 66H60l-4-66c-2-20-2-34 4-40z" fill="#1d1f26"/>' +
      '<path d="M86 149l14 19 14-19-5-4-9 9-9-9z" fill="#30333d"/>' +
      '<circle cx="100" cy="186" r="2.2" fill="#454956"/><circle cx="100" cy="206" r="2.2" fill="#454956"/><circle cx="100" cy="226" r="2.2" fill="#454956"/><circle cx="100" cy="246" r="2.2" fill="#454956"/>' +
      '<g class="c-coat"><path d="M86 150c-14 2-26 6-30 14-6 12-4 40-4 60l-2 70h46V166z" fill="#f6f7f9" stroke="#d6dbe3" stroke-width="2"/>' +
        '<path d="M114 150c14 2 26 6 30 14 6 12 4 40 4 60l2 70h-46V166z" fill="#f6f7f9" stroke="#d6dbe3" stroke-width="2"/>' +
        '<path d="M86 150l8 30-8 6" fill="none" stroke="#d6dbe3" stroke-width="2"/><path d="M114 150l-8 30 8 6" fill="none" stroke="#d6dbe3" stroke-width="2"/>' +
        '<rect x="116" y="212" width="22" height="16" rx="2" fill="none" stroke="#d6dbe3" stroke-width="2"/><rect x="120" y="204" width="3" height="14" fill="#3446d8"/><rect x="126" y="206" width="3" height="12" fill="#d33"/></g>' +
      '<g class="c-blazer"><path d="M86 150c-14 2-26 6-30 14-6 12-4 40-4 60l2 46h44V166z" fill="#7a5536" stroke="#5f4128" stroke-width="2"/>' +
        '<path d="M114 150c14 2 26 6 30 14 6 12 4 40 4 60l-2 46h-44V166z" fill="#7a5536" stroke="#5f4128" stroke-width="2"/>' +
        '<path d="M86 150l10 34-10 8" fill="#6a4a2e"/><path d="M114 150l-10 34 10 8" fill="#6a4a2e"/>' +
        '<path d="M118 190l14-4 2 8z" fill="#f0b24a"/></g>' +
      '<g class="arm arm-r"><path class="sleeve" d="M138 166c9 6 13 18 14 34l4 44" stroke-width="20" stroke-linecap="round" fill="none"/><circle class="skin" cx="156" cy="248" r="10"/>' +
        '<g class="c-flask"><path d="M150 214h14v16l13 26a7 7 0 0 1-6 10h-29a7 7 0 0 1-6-10l14-26z" fill="#e9f7ff" stroke="#7aa3b8" stroke-width="2.5"/><path d="M141 250h32l4 8a5 5 0 0 1-4 6h-32a5 5 0 0 1-4-6z" fill="#3ccf8e"/><circle cx="152" cy="244" r="3" fill="#3ccf8e"/></g>' +
        '<g class="c-pointer"><path d="M158 246l34-96" stroke="#6b3d1f" stroke-width="4" stroke-linecap="round"/><circle cx="192" cy="150" r="4" fill="#f0b24a"/></g></g>' +
      '<g class="head">' +
        '<rect class="skin-d" x="90" y="132" width="20" height="22"/>' +
        '<circle class="skin" cx="52" cy="100" r="10"/><circle class="skin" cx="148" cy="100" r="10"/>' +
        '<ellipse class="skin" cx="100" cy="96" rx="48" ry="54"/>' +
        '<path d="M52 102c0 30 18 50 48 50s48-20 48-50c-2 14-10 26-20 30-8-8-18-6-28-4-10-2-20-4-28 4-10-4-18-16-20-30z" fill="#2b1d16" opacity=".5"/>' +
        '<path d="M86 116q14-7 28 0" stroke="#2b1d16" stroke-width="4.5" stroke-linecap="round" fill="none" opacity=".6"/>' +
        '<path d="M50 100c-6-36 12-64 46-68 12-8 36-6 46 8 12 12 14 34 8 60-4-14-10-26-18-32-8 6-22 4-32-4-12 8-28 10-38 6-6 8-10 18-12 30z" fill="#1b1714"/>' +
        '<path d="M74 42c10-16 30-20 44-14-10 4-22 8-30 18z" fill="#3a302a"/>' +
        '<path d="M72 84q10-6 20-2M108 82q10-4 20 2" stroke="#1b1410" stroke-width="5" stroke-linecap="round" fill="none"/>' +
        '<g class="eyes"><ellipse cx="82" cy="97" rx="5.5" ry="6.5" fill="#1a120e"/><ellipse cx="118" cy="97" rx="5.5" ry="6.5" fill="#1a120e"/><circle cx="84" cy="95" r="1.7" fill="#fff"/><circle cx="120" cy="95" r="1.7" fill="#fff"/></g>' +
        '<path class="eyes-laugh" d="M76 98q6-8 12 0M112 98q6-8 12 0" stroke="#1a120e" stroke-width="3.2" stroke-linecap="round" fill="none"/>' +
        '<path d="M100 101q-4 9-1 11 4 1 6-2" stroke="#a96e47" stroke-width="2.5" stroke-linecap="round" fill="none"/>' +
        '<path class="m-smile" d="M89 125q11 8 22 0" stroke="#5a2b20" stroke-width="3.2" stroke-linecap="round" fill="none"/>' +
        '<ellipse class="m-open" cx="100" cy="127" rx="7.5" ry="5.5" fill="#5a2320"/>' +
        '<path class="m-laugh" d="M87 122q13 20 26 0z" fill="#5a2320"/>' +
        '<g class="c-goggles"><rect x="50" y="56" width="100" height="8" rx="4" fill="#3b4a5a"/><circle cx="83" cy="60" r="12" fill="#bfe6ff" stroke="#3b4a5a" stroke-width="4"/><circle cx="117" cy="60" r="12" fill="#bfe6ff" stroke="#3b4a5a" stroke-width="4"/></g>' +
        '<g class="c-glasses" fill="rgba(255,255,255,.18)" stroke="#1d1530" stroke-width="3"><rect x="69" y="87" width="27" height="20" rx="7"/><rect x="104" y="87" width="27" height="20" rx="7"/><path d="M96 95h8" fill="none"/></g>' +
      '</g>' +
    '</g></svg>';

  /* Dialogue is text only: each line stays up long enough to read. */
  function readFor(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function readMs(text) { return Math.max(2300, text.length * 58); }
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  /* ---------- the character ---------- */
  function Actor(parent, opts) {
    var el = document.createElement('div');
    el.className = 'av' + (opts.side ? ' side' : '');
    el.setAttribute('data-costume', 'casual');
    el.setAttribute('role', 'button');
    el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', 'Animated Abhishek. Click him and he laughs.');
    el.innerHTML = '<div class="av-flip">' + SVG + '</div><div class="av-poof"></div>';
    parent.appendChild(el);
    this.el = el;
    this.flip = el.querySelector('.av-flip');
    this.x = 0;
    this.walkToken = 0;
    this.sayToken = 0;
    this.bubble = null;
    this.board = null;
    this.mode = opts.mode;
  }
  Actor.prototype.width = function () { return this.el.offsetWidth || 90; };
  Actor.prototype.setX = function (x) { this.x = x; this.el.style.left = Math.round(x) + 'px'; this.placeBubble(); };
  Actor.prototype.face = function (dir) { this.flip.style.transform = dir < 0 ? 'scaleX(-1)' : 'none'; };
  Actor.prototype.stopWalking = function () { this.walkToken++; this.el.classList.remove('walking', 'running'); };
  Actor.prototype.walkTo = function (target, speed, run) {
    var self = this, token = ++this.walkToken;
    if (reduce) { self.setX(target); return Promise.resolve(true); }
    self.face(target < self.x ? -1 : 1);
    self.el.classList.add('walking');
    self.el.classList.toggle('running', !!run);
    return new Promise(function (resolve) {
      var last = performance.now();
      function step(now) {
        if (token !== self.walkToken) { resolve(false); return; }
        var dt = Math.min(0.05, (now - last) / 1000); last = now;
        var d = target - self.x, move = speed * dt;
        if (Math.abs(d) <= move) {
          self.setX(target);
          self.el.classList.remove('walking', 'running');
          self.face(1);
          resolve(true); return;
        }
        self.setX(self.x + Math.sign(d) * move);
        requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  };
  Actor.prototype.say = function (text, key, opts) {
    var self = this, token = ++this.sayToken;
    opts = opts || {};
    this.showBubble(text);
    this.el.classList.add('talking');
    var ms = readMs(text);
    return readFor(ms).then(function () {
      if (token !== self.sayToken) return false;
      self.el.classList.remove('talking');
      return sleep(opts.hold == null ? 900 : opts.hold).then(function () {
        if (token === self.sayToken && !opts.keep) self.hideBubble();
        return true;
      });
    });
  };
  Actor.prototype.hush = function () { this.sayToken++; this.el.classList.remove('talking'); this.hideBubble(); };
  Actor.prototype.showBubble = function (text) {
    if (!this.bubble) {
      this.bubble = document.createElement('div');
      this.bubble.className = 'av-bubble';
      this.bubble.setAttribute('role', 'status');
      this.el.appendChild(this.bubble);
    }
    this.bubble.textContent = text;
    this.bubble.style.animation = 'none'; void this.bubble.offsetWidth; this.bubble.style.animation = '';
    this.placeBubble();
  };
  Actor.prototype.hideBubble = function () { if (this.bubble) { this.bubble.remove(); this.bubble = null; } };
  Actor.prototype.placeBubble = function () {
    if (!this.bubble || this.mode !== 'dock') return;
    this.bubble.style.setProperty('--bx', '0px');
    var r = this.bubble.getBoundingClientRect(), vw = document.documentElement.clientWidth, shift = 0;
    if (r.left < 8) shift = 8 - r.left;
    else if (r.right > vw - 8) shift = vw - 8 - r.right;
    if (shift) this.bubble.style.setProperty('--bx', shift + 'px');
  };
  Actor.prototype.setCostume = function (c, puff) {
    var el = this.el;
    if (el.getAttribute('data-costume') === c) return false;
    el.setAttribute('data-costume', c);
    if (c === 'board') this.showBoard(true); else this.hideBoard();
    if (puff && !reduce) { el.classList.remove('poof'); void el.offsetWidth; el.classList.add('poof'); setTimeout(function () { el.classList.remove('poof'); }, 520); }
    return true;
  };
  Actor.prototype.showBoard = function (sticky) {
    if (!this.board) {
      var b = document.createElement('div');
      b.className = 'av-board';
      b.setAttribute('role', 'button');
      b.setAttribute('tabindex', '0');
      b.innerHTML = '<i></i><i></i><b>Let’s talk</b><span class="e">' + EMAIL + '</span><small>Click to copy</small>';
      var small = b.querySelector('small');
      function copy(ev) {
        ev.stopPropagation();
        var ok = function () { small.textContent = 'Copied!'; setTimeout(function () { small.textContent = 'Click to copy'; }, 1600); };
        try { navigator.clipboard.writeText(EMAIL).then(ok, function () { small.textContent = EMAIL; }); } catch (e) { small.textContent = EMAIL; }
      }
      b.addEventListener('click', copy);
      b.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); copy(ev); } });
      this.el.appendChild(b);
      this.board = b;
    }
    this.board.sticky = !!sticky || this.board.sticky;
  };
  Actor.prototype.hideBoard = function (onlyIfLoose) {
    if (!this.board) return;
    if (onlyIfLoose && this.board.sticky) return;
    this.board.remove(); this.board = null;
  };
  Actor.prototype.hasBoardOutfit = function () {
    var c = this.el.getAttribute('data-costume');
    return c === 'teacher' || c === 'board';
  };

  /* Click: laugh, then hurry off to the far side. Hover (teacher/board): email board. */
  function makeInteractive(actor, range, after) {
    var el = actor.el, busy = false, leaveTimer;
    function react() {
      if (busy) return;
      if (coarse && actor.hasBoardOutfit() && !actor.board) { actor.showBoard(false); return; }
      busy = true;
      if (actor === hero) { introToken++; setPlayLabel(false); }
      actor.stopWalking();
      el.classList.add('laughing');
      actor.say('Ha ha ha! That tickles!', 'laugh', { hold: 0 }).then(function () {
        el.classList.remove('laughing');
        var r = range(), mid = (r[0] + r[1]) / 2;
        var target = actor.x > mid ? r[0] : r[1];
        actor.showBubble('Okay, okay, I’m going!');
        return actor.walkTo(target, 300, true);
      }).then(function () {
        return sleep(700);
      }).then(function () {
        actor.hideBubble();
        busy = false;
        if (after) after();
      });
    }
    el.addEventListener('click', function (ev) { if (ev.target.closest('.av-board')) return; react(); });
    el.addEventListener('keydown', function (ev) { if ((ev.key === 'Enter' || ev.key === ' ') && !ev.target.closest('.av-board')) { ev.preventDefault(); react(); } });
    el.addEventListener('mouseenter', function () {
      clearTimeout(leaveTimer);
      if (actor.hasBoardOutfit()) actor.showBoard(false);
    });
    el.addEventListener('mouseleave', function () {
      leaveTimer = setTimeout(function () { actor.hideBoard(true); }, 1200);
    });
    return { busy: function () { return busy; } };
  }

  /* ---------- hero actor: the intro in the orange office ---------- */
  var stage = document.getElementById('stage');
  var hero = null, heroCtl = null, introToken = 0, introDone = false;
  function heroRange() {
    var w = stage.clientWidth, aw = hero.width();
    return [Math.max(0, w * 0.06), Math.max(0, w * 0.62 - aw / 2)];
  }
  function heroHome() { var w = stage.clientWidth; return Math.max(0, w * 0.40 - hero.width() / 2); }
  function runIntro(withSound) {
    var token = ++introToken;
    hero.hush();
    var chain = Promise.resolve();
    if (!withSound) {
      hero.setX(stage.clientWidth + 20);
      chain = chain.then(function () { return hero.walkTo(heroHome(), 110); });
    } else {
      chain = chain.then(function () { return hero.walkTo(heroHome(), 160); });
    }
    var lines = (withSound || !introDone) ? INTRO : [[null, 'Welcome back to my office.']];
    introDone = true;
    lines.forEach(function (l) {
      chain = chain.then(function () {
        if (token !== introToken) return;
        return hero.say(l[1], l[0], { hold: 250, keep: true });
      });
    });
    chain.then(function () {
      if (token !== introToken) return;
      setPlayLabel(false);
      setTimeout(function () { if (token === introToken) hero.hideBubble(); }, 2500);
    });
  }
  function setPlayLabel() {}
  if (stage) {
    hero = new Actor(stage, { mode: 'hero' });
    heroCtl = makeInteractive(hero, heroRange, function () { hero.walkTo(heroHome(), 110); });
    hero.setX(stage.clientWidth + 20);
    window.addEventListener('resize', function () {
      if (!heroCtl.busy() && !hero.el.classList.contains('walking')) hero.setX(Math.min(hero.x, heroHome()));
    });
  }

  /* ---------- dock actor: walks along the bottom of every page ---------- */
  var dock = document.createElement('div');
  dock.className = 'av-dock';
  document.body.appendChild(dock);
  var walker = new Actor(dock, { mode: 'dock' });
  function dockRange() {
    // keep room for the email board (about 230px wide, centred on him) on both sides
    var vw = document.documentElement.clientWidth, w = walker.width(), half = vw < 640 ? 104 : 122;
    var lo = Math.max(Math.min(150, vw * 0.3), half - w / 2 + 8);
    return [lo, Math.max(lo, vw - w / 2 - half - 8)];
  }
  walker.setX(dockRange()[1]);
  var dockCtl = makeInteractive(walker, dockRange, null);
  var view = 'home', heroVisible = true, hidden = false, lastSection = null;

  function dockAway() { return hidden || (view === 'home' && heroVisible); }
  function updateDock() { dock.classList.toggle('away', dockAway()); }

  // Wander: pick a spot, walk there, pause, repeat. Pauses while talking, busy or away.
  (function wander() {
    var pause = 2200 + Math.random() * 3200;
    if (!reduce && !dockAway() && !dockCtl.busy() && !walker.el.classList.contains('talking') && !walker.el.matches(':hover')) {
      var r = dockRange(), target = r[0] + Math.random() * (r[1] - r[0]);
      walker.walkTo(target, 70).then(function () { setTimeout(wander, pause); });
    } else setTimeout(wander, 1200);
  })();

  function onView(v) {
    view = v;
    var cfg = VIEW[v] || VIEW.home;
    walker.hush();
    if (v !== 'home') {
      introToken++;
      if (hero) { hero.hush(); setPlayLabel(false); }
    }
    lastSection = null;
    updateDock();
    if (v === 'home') {
      walker.setCostume('casual', false);
      if (hero && heroVisible) runIntro(false);
      return;
    }
    // Fly in from the nav: enter from the right edge in the new outfit, then speak.
    walker.stopWalking();
    var r = dockRange();
    walker.setX(r[1]);
    walker.setCostume(cfg.costume, true);
    if (cfg.wave && !reduce) { walker.el.classList.add('waving'); setTimeout(function () { walker.el.classList.remove('waving'); }, 1600); }
    if (cfg.line) setTimeout(function () { walker.say(cfg.line[1], cfg.line[0], { hold: 1800 }); }, 450);
  }
  document.addEventListener('viewchange', function (e) { onView(e.detail); });

  // Home page: hide the dock actor while the hero is on screen; change outfit per section.
  var heroEl = document.querySelector('.hero.office');
  if (heroEl && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      heroVisible = entries[0].isIntersecting;
      updateDock();
      if (!heroVisible) { introToken++; if (hero) { hero.hush(); setPlayLabel(false); } }
    }, { threshold: 0.25 }).observe(heroEl);
    var sections = document.querySelectorAll('#v-home [data-costume]');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting || view !== 'home' || heroVisible) return;
        var c = en.target.getAttribute('data-costume');
        if (c === lastSection) return;
        lastSection = c;
        walker.setCostume(c, true);
        var line = SECTION[c];
        if (line) walker.say(line[1], line[0], { hold: 1500 });
      });
    }, { rootMargin: '-45% 0px -45% 0px' });
    sections.forEach(function (s) { if (!s.classList.contains('office')) io.observe(s); });
  }

  /* ---------- controls: sound and hide ---------- */
  var ctrl = document.createElement('div');
  ctrl.className = 'av-ctrl';
  ctrl.innerHTML = '<button type="button" data-a="hide" aria-pressed="false">Hide Abhishek</button>';
  document.body.appendChild(ctrl);
  var hideBtn = ctrl.querySelector('[data-a="hide"]');
  hideBtn.addEventListener('click', function () {
    hidden = !hidden;
    hideBtn.textContent = hidden ? 'Bring Abhishek back' : 'Hide Abhishek';
    hideBtn.setAttribute('aria-pressed', String(hidden));
    dock.classList.toggle('off', hidden);
    if (stage) stage.classList.toggle('no-actor', hidden);
    if (hero) hero.el.style.display = hidden ? 'none' : '';
    if (hidden) { walker.hush(); if (hero) hero.hush(); }
    updateDock();
  });
  window.addEventListener('resize', function () {
    var r = dockRange();
    if (walker.x > r[1]) walker.setX(r[1]);
  });

  // Start on whatever page the visitor landed on.
  onView((location.hash || '#home').slice(1) in VIEW ? (location.hash || '#home').slice(1) : 'home');
})();
