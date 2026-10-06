/* Abhi-bot: a small animated companion that floats on top of the page.
   It follows you as you scroll, flies to each new page, looks at your cursor, puts on a costume when you point at a
   course, and tilts the hero portrait with the mouse. It only adds an overlay: it never edits the page's content. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var KEY = 'abhibot-hidden';
  var VIEWS = ['home', 'about', 'research', 'programmes', 'contact'];
  var SIDE = { home: 'r', about: 'l', research: 'r', programmes: 'r', contact: 'r' };

  var SAY = {
    home: ["Hi, I'm Abhi-bot, Abhishek's sidekick. Point at a course and I'll dress for it.", 'Try moving your mouse over his portrait.'],
    about: ['Engineering in Bengaluru, a PhD at IIM Indore, a lectureship at Deakin, and now SPJIMR.', 'He studies how people and organisations work with AI.'],
    research: ['Three areas, one thread: how people and organisations work with AI.', 'Influencers, platforms, language models and experiments.'],
    programmes: ['Hover over a course. I will show you what it feels like.', 'Business, hands-on, and research seminars.'],
    contact: ["Tell Abhishek your audience, date and goals. He'll propose a format.", 'He is also open to research collaborations and doctoral supervision.'],
  };

  var COURSE = {
    genai: { track: 'business', title: 'GenAI for Leaders', say: 'Case-led. Where LLMs create value in each function, and how to measure the return.' },
    ml: { track: 'business', title: 'AI & ML for Managers', say: 'How predictive models work, and when to trust them. Built around your own use cases.' },
    strategy: { track: 'business', title: 'AI Strategy', say: 'Data to ML to GenAI, and what it does to strategy and competition. Recent cases.' },
    cert: { track: 'business', title: 'GenAI Certification', say: 'Online, with Great Learning. Generative AI for professionals at work.' },
    agentic: { track: 'build', title: 'Agentic AI', say: 'Agents plan, use tools and check their work. Where must a person stay in control?' },
    maker: { track: 'build', title: 'Maker Lab', say: 'Teams build real prototypes with AI tools and present them at a demo day.' },
    influencer: { track: 'build', title: 'Influencer Analytics', say: 'Network analysis and language models on real creator data.' },
    theory: { track: 'res', title: 'Theory & Theorizing', say: 'Building theory from a puzzling phenomenon, even where AI outruns existing theory.' },
    methods: { track: 'res', title: 'AI Research Methods', say: 'LLMs as instruments, stimuli and subjects of study, with rigour.' },
  };

  function courseKey(title) {
    if (/Business Leaders/i.test(title)) return 'genai';
    if (/Machine Learning for Managers/i.test(title)) return 'ml';
    if (/AI Strategy/i.test(title)) return 'strategy';
    if (/Certification/i.test(title)) return 'cert';
    if (/Agentic/i.test(title)) return 'agentic';
    if (/Maker Lab/i.test(title)) return 'maker';
    if (/Influencer/i.test(title)) return 'influencer';
    if (/Theory/i.test(title)) return 'theory';
    if (/Research Methods/i.test(title)) return 'methods';
    return null;
  }

  /* ---------------------------------------------------------------- the robot */
  var INK = ' class="ink" ';
  var SVG =
    '<svg viewBox="0 0 120 150" role="presentation" focusable="false">' +
    '<ellipse class="shadow" cx="60" cy="146" rx="24" ry="4"/>' +
    '<g class="flame"><path d="M50 120h20l-10 22z" fill="#ffb347"/><path d="M54 120h12l-6 13z" fill="#fff1c7"/></g>' +
    // arms
    '<path d="M36 88Q20 92 21 108" fill="none" stroke="#151b33" stroke-width="10" stroke-linecap="round"/><path d="M36 88Q20 92 21 108" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/>' +
    '<g class="arm-r"><path d="M84 88Q100 92 99 108" fill="none" stroke="#151b33" stroke-width="10" stroke-linecap="round"/><path d="M84 88Q100 92 99 108" fill="none" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/></g>' +
    // body
    '<rect class="shell ink" x="36" y="72" width="48" height="48" rx="18"/>' +
    '<circle class="tint ink" cx="60" cy="97" r="7" stroke-width="2.5"/>' +
    // head
    '<g class="b-head">' +
    '<g class="antenna"><path' + INK + 'd="M60 21V10" fill="none"/><circle class="tint ink antenna-dot" cx="60" cy="7" r="5" stroke-width="2.5"/></g>' +
    '<rect class="shell ink" x="17" y="40" width="9" height="20" rx="4"/><rect class="shell ink" x="94" y="40" width="9" height="20" rx="4"/>' +
    '<rect class="shell ink" x="24" y="20" width="72" height="56" rx="24"/>' +
    '<rect class="visor" x="32" y="30" width="56" height="36" rx="15"/>' +
    '<g class="blink"><g class="b-eyes"><circle class="eyeg" cx="48" cy="47" r="6.5"/><circle class="eyeg" cx="72" cy="47" r="6.5"/>' +
    '<circle cx="50" cy="45" r="1.8" fill="#fff"/><circle cx="74" cy="45" r="1.8" fill="#fff"/></g></g>' +
    '<path d="M52 58Q60 63 68 58" fill="none" stroke="#fff" stroke-opacity=".75" stroke-width="2.4" stroke-linecap="round"/>' +
    '</g>' +
    // accessories
    '<g class="acc" data-k="genai"><g class="a-bob"><rect x="86" y="104" width="30" height="22" rx="4" fill="#c47f12"' + INK + 'stroke-width="2.5"/><path d="M94 104v-5h14v5" fill="none"' + INK + 'stroke-width="2.5"/><rect x="99" y="112" width="4" height="5" fill="#fff"/>' +
    '<path d="M92 -4h28a6 6 0 0 1 6 6v12a6 6 0 0 1-6 6h-14l-8 8v-8h-6a6 6 0 0 1-6-6V2a6 6 0 0 1 6-6z" fill="#fff"' + INK + 'stroke-width="2.5"/><circle cx="99" cy="8" r="2" fill="#151b33"/><circle cx="106" cy="8" r="2" fill="#151b33"/><circle cx="113" cy="8" r="2" fill="#151b33"/></g></g>' +
    '<g class="acc" data-k="ml"><g class="a-bob"><rect x="88" y="62" width="32" height="34" rx="5" fill="#fff"' + INK + 'stroke-width="2.5"/><g><rect class="a-bar" x="93" y="78" width="6" height="14" fill="#3446d8"/><rect class="a-bar" x="102" y="72" width="6" height="20" fill="#c47f12"/><rect class="a-bar" x="111" y="68" width="6" height="24" fill="#0d7a6a"/></g></g></g>' +
    '<g class="acc" data-k="strategy"><g class="a-bob"><circle cx="102" cy="104" r="15" fill="#fff"' + INK + 'stroke-width="2.5"/><polygon class="a-needle" points="102,92 106,104 102,116 98,104" fill="#e5484d"/><circle cx="102" cy="104" r="2" fill="#151b33"/></g></g>' +
    '<g class="acc" data-k="cert"><path d="M60 3L103 18L60 33L17 18Z" fill="#151b33"' + INK + 'stroke-width="2.5"/><path d="M38 25v9c0 7 44 7 44 0v-9" fill="#2a3358"' + INK + 'stroke-width="2.5"/><g class="a-tassel"><path d="M100 19L104 40" stroke="#f5b82e" stroke-width="3" stroke-linecap="round"/><circle cx="104" cy="42" r="4" fill="#f5b82e"/></g></g>' +
    '<g class="acc" data-k="agentic"><g class="a-gear"><circle cx="14" cy="110" r="11" fill="none" stroke="#151b33" stroke-width="5" stroke-dasharray="5 4"/><circle cx="14" cy="110" r="8" fill="#fff"' + INK + 'stroke-width="2.5"/><circle cx="14" cy="110" r="3" fill="#151b33"/></g>' +
    '<g class="a-orbit"><rect class="tint ink" x="55" y="-12" width="10" height="10" rx="3" stroke-width="2"/><rect class="tint ink" x="103" y="72" width="10" height="10" rx="3" stroke-width="2"/><rect class="tint ink" x="7" y="72" width="10" height="10" rx="3" stroke-width="2"/></g></g>' +
    '<g class="acc" data-k="maker"><path d="M22 32a38 30 0 0 1 76 0z" fill="#f5a524"' + INK + 'stroke-width="2.5"/><rect x="16" y="30" width="88" height="7" rx="3.5" fill="#f5a524"' + INK + 'stroke-width="2.5"/><rect x="54" y="4" width="12" height="26" rx="3" fill="#ffc658"' + INK + 'stroke-width="2.5"/>' +
    '<g class="a-tap"><rect x="94" y="88" width="8" height="34" rx="4" fill="#9aa3b5"' + INK + 'stroke-width="2.5"/><circle cx="98" cy="86" r="8" fill="#9aa3b5"' + INK + 'stroke-width="2.5"/><rect x="95.5" y="74" width="5" height="10" fill="#fff"/></g></g>' +
    '<g class="acc" data-k="influencer"><g class="a-bob"><path d="M88 96L110 84V116L88 106Z" fill="#e5484d"' + INK + 'stroke-width="2.5"/><rect x="81" y="96" width="9" height="11" rx="2" fill="#151b33"/>' +
    '<path class="a-arc" d="M116 92q6 8 0 16" fill="none" stroke="#e5484d" stroke-width="3" stroke-linecap="round"/><path class="a-arc" d="M122 87q10 13 0 26" fill="none" stroke="#e5484d" stroke-width="3" stroke-linecap="round"/><path class="a-arc" d="M128 82q14 18 0 36" fill="none" stroke="#e5484d" stroke-width="3" stroke-linecap="round"/></g></g>' +
    '<g class="acc" data-k="theory"><g class="a-flick"><circle cx="100" cy="12" r="10" fill="#ffe066"' + INK + 'stroke-width="2.5"/><rect x="95" y="22" width="10" height="6" rx="2" fill="#9aa3b5"' + INK + 'stroke-width="2"/>' +
    '<path d="M100-4v-5M113 0l4-4M87 0l-4-4" stroke="#f5b82e" stroke-width="3" stroke-linecap="round"/></g>' +
    '<g class="a-bob"><rect x="2" y="100" width="26" height="18" rx="3" fill="#0d7a6a"' + INK + 'stroke-width="2.5"/><path d="M15 100v18" stroke="#fff" stroke-width="2"/></g></g>' +
    '<g class="acc" data-k="methods"><g class="a-scan"><circle cx="100" cy="92" r="12" fill="rgba(255,255,255,.55)"' + INK + 'stroke-width="3"/><path d="M109 101l9 13" fill="none"' + INK + 'stroke-width="5"/></g></g>' +
    '</svg>';

  /* ---------------------------------------------------------------- build the overlay */
  var root = document.createElement('div');
  root.id = 'buddy';
  root.setAttribute('aria-hidden', 'true');
  root.innerHTML = '<div class="b-bubble r"></div><div class="b-body"><div class="b-float">' + SVG + '</div></div>';
  document.body.appendChild(root);
  var bubble = root.querySelector('.b-bubble');
  var body = root.querySelector('.b-body');
  var svg = root.querySelector('svg');
  var head = root.querySelector('.b-head');
  var eyes = root.querySelector('.b-eyes');
  svg.style.transformOrigin = '50% 90%';

  var toggle = document.createElement('button');
  toggle.id = 'buddy-toggle';
  toggle.type = 'button';
  document.body.appendChild(toggle);

  var hidden = false;
  try { hidden = localStorage.getItem(KEY) === '1'; } catch (e) { /* storage unavailable */ }
  function paintToggle() {
    toggle.textContent = hidden ? 'Show Abhi-bot' : 'Hide Abhi-bot';
    toggle.setAttribute('aria-pressed', hidden ? 'true' : 'false');
    root.hidden = hidden;
  }
  toggle.addEventListener('click', function () {
    hidden = !hidden;
    try { localStorage.setItem(KEY, hidden ? '1' : '0'); } catch (e) { /* ignore */ }
    paintToggle();
    if (!hidden) { place(true); arrive(); say(null, line(), false); }
  });
  paintToggle();

  /* ---------------------------------------------------------------- speech */
  var bt = 0;
  function hideBubble() { bubble.classList.remove('on'); body.classList.remove('talk'); }
  function say(title, text, sticky) {
    bubble.textContent = '';
    if (title) { var b = document.createElement('b'); b.textContent = title; bubble.appendChild(b); }
    bubble.appendChild(document.createTextNode(text));
    bubble.className = 'b-bubble on ' + (S.side === 'l' ? 'l' : 'r');
    body.classList.add('talk');
    clearTimeout(bt);
    if (!sticky) bt = setTimeout(hideBubble, 5600);
  }

  /* ---------------------------------------------------------------- state and motion */
  var S = { x: -200, y: -200, vx: 0, vy: 0, tx: 0, ty: 0, view: 'home', side: 'r', shyUntil: 0, tip: 0 };
  var P = { x: innerWidth * 0.7, y: innerHeight * 0.4, moved: 0 };   // pointer
  var look = { ex: 0, ey: 0, rot: 0 };
  var tilt = { x: 0, y: 0 };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  function currentView() {
    var v = (location.hash || '#home').slice(1);
    return VIEWS.indexOf(v) < 0 ? 'home' : v;
  }
  function line() { var a = SAY[S.view]; return a[S.tip % a.length]; }

  function computeTarget() {
    var w = innerWidth, h = innerHeight, s = root.offsetWidth || 104, bh = s * 1.25;
    var max = Math.max(1, document.documentElement.scrollHeight - h);
    var p = clamp(scrollY / max, 0, 1);
    var shy = performance.now() < S.shyUntil;
    S.tx = S.side === 'l' ? (shy ? -s * 0.72 : 16) : (shy ? w - s * 0.28 : w - s - 16);
    S.ty = clamp(h * (0.2 + 0.5 * p), w < 720 ? 150 : 76, Math.max(160, h - bh - 56));
  }
  function place(snap) {
    computeTarget();
    if (snap) { S.x = S.tx; S.y = S.ty; S.vx = S.vy = 0; }
  }
  function arrive() {
    body.classList.remove('b-arrive');
    void body.offsetWidth;
    if (!reduce) body.classList.add('b-arrive');
  }
  function launchFromNav(view) {
    // fly in from the menu item that was just clicked
    var a = document.querySelector(view === 'home' ? '.brand' : '.nav a[data-v="' + view + '"]');
    if (!a || reduce) return place(true);
    var r = a.getBoundingClientRect(), s = root.offsetWidth || 104;
    S.x = r.left + r.width / 2 - s / 2;
    S.y = r.top + r.height / 2 - s / 2;
    S.vx = S.vy = 0;
  }

  var last = performance.now();
  var hero = document.querySelector('.hero');
  var heroImg = document.querySelector('.hero-bg');

  function frame(now) {
    var dt = Math.min(0.033, (now - last) / 1000 || 0.016);
    last = now;
    computeTarget();

    if (!hidden) {
      if (reduce) { S.x = S.tx; S.y = S.ty; S.vx = S.vy = 0; }
      else {
        var k = 130, c = 2 * Math.sqrt(k) * 0.8;
        S.vx += ((S.tx - S.x) * k - S.vx * c) * dt;
        S.vy += ((S.ty - S.y) * k - S.vy * c) * dt;
        S.x += S.vx * dt;
        S.y += S.vy * dt;
      }
      if (!reduce && P.moved && now - P.moved < 400 && P.x > S.x - 6 && P.x < S.x + (root.offsetWidth || 104) + 6 && P.y > S.y - 6 && P.y < S.y + (root.offsetWidth || 104) * 1.25 + 6 && !S.justClicked) S.shyUntil = now + 2600;
      root.style.transform = 'translate3d(' + S.x.toFixed(1) + 'px,' + S.y.toFixed(1) + 'px,0)';

      // eyes and head follow the cursor; they wander gently when the cursor has been still for a while
      var s = root.offsetWidth || 104;
      var cx = S.x + s / 2, cy = S.y + s * 0.4;
      var idle = now - P.moved > 4500;
      var tx = idle ? cx + Math.sin(now / 1700) * 160 : P.x;
      var ty = idle ? cy + Math.cos(now / 2300) * 60 : P.y;
      var dx = tx - cx, dy = ty - cy;
      var tex = clamp(dx / 70, -1, 1) * 4.4, tey = clamp(dy / 70, -1, 1) * 3.2, trot = clamp(dx / 320, -1, 1) * 8;
      var f = reduce ? 1 : 0.18;
      look.ex += (tex - look.ex) * f; look.ey += (tey - look.ey) * f; look.rot += (trot - look.rot) * f;
      eyes.style.transform = 'translate(' + look.ex.toFixed(2) + 'px,' + look.ey.toFixed(2) + 'px)';
      head.style.transform = 'rotate(' + look.rot.toFixed(2) + 'deg)';
      svg.style.transform = 'rotate(' + clamp(S.vx * 0.012, -10, 10).toFixed(2) + 'deg)';
    }

    // the portrait on the home page leans toward the cursor
    if (heroImg && !reduce && S.view === 'home' && hero) {
      var r = hero.getBoundingClientRect();
      var inView = r.bottom > 0 && r.top < innerHeight;
      var nx = inView ? clamp((P.x - (r.left + r.width * 0.72)) / (r.width * 0.5), -1, 1) : 0;
      var ny = inView ? clamp((P.y - (r.top + r.height * 0.4)) / (r.height * 0.6), -1, 1) : 0;
      tilt.x += (nx - tilt.x) * 0.1; tilt.y += (ny - tilt.y) * 0.1;
      if (Math.abs(tilt.x) + Math.abs(tilt.y) > 0.002 || heroImg.style.transform) {
        heroImg.style.transform = 'perspective(1000px) rotateY(' + (tilt.x * 7).toFixed(2) + 'deg) rotateX(' + (-tilt.y * 5).toFixed(2) + 'deg) translate3d(' + (tilt.x * 10).toFixed(1) + 'px,' + (tilt.y * 7).toFixed(1) + 'px,0) scale(1.05)';
      }
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener('pointermove', function (e) { P.x = e.clientX; P.y = e.clientY; P.moved = performance.now(); }, { passive: true });
  window.addEventListener('pointerleave', function () { P.moved = 0; });
  body.addEventListener('click', function () {
    S.tip++;
    S.shyUntil = 0;
    S.justClicked = true;
    setTimeout(function () { S.justClicked = false; }, 1600);
    body.classList.remove('b-jump'); void body.offsetWidth;
    if (!reduce) body.classList.add('b-jump');
    if (curKey) say(COURSE[curKey].title, COURSE[curKey].say, false);
    else say(null, line(), false);
  });
  body.addEventListener('animationend', function (e) {
    if (e.target === body) body.classList.remove('b-arrive', 'b-jump');
  });

  /* ---------------------------------------------------------------- pages */
  function onView(first) {
    S.view = currentView();
    S.side = SIDE[S.view];
    S.tip = 0;
    clearAcc();
    if (first) place(true);
    else { launchFromNav(S.view); arrive(); }
    if (!hidden) setTimeout(function () { say(null, line(), false); }, first ? 1100 : 450);
    observeCards();
  }
  window.addEventListener('hashchange', function () { onView(false); });

  /* ---------------------------------------------------------------- courses */
  var hoverKey = null, scrollKey = null, curKey = null, io = null;
  function applyAcc() {
    var k = hoverKey || scrollKey || null;
    if (k === curKey) return;
    curKey = k;
    if (k) {
      body.setAttribute('data-acc', k);
      root.setAttribute('data-track', COURSE[k].track);
      if (!hidden) say(COURSE[k].title, COURSE[k].say, !!hoverKey);
    } else {
      body.removeAttribute('data-acc');
      root.removeAttribute('data-track');
      clearTimeout(bt);
      bt = setTimeout(hideBubble, 1400);
    }
  }
  function clearAcc() { hoverKey = scrollKey = null; applyAcc(); }

  var cards = [];
  function keyOf(card) { var h = card.querySelector('h3'); return h ? courseKey(h.textContent) : null; }
  function observeCards() {
    if (!io) return;
    cards.forEach(function (c) { io.observe(c); });
  }
  cards = Array.prototype.slice.call(document.querySelectorAll('.prog'));
  cards.forEach(function (c) {
    var k = keyOf(c);
    if (!k) return;
    c.addEventListener('mouseenter', function () { hoverKey = k; applyAcc(); });
    c.addEventListener('mouseleave', function () { if (hoverKey === k) { hoverKey = null; applyAcc(); } });
    c.addEventListener('focusin', function () { hoverKey = k; applyAcc(); });
    c.addEventListener('focusout', function () { if (hoverKey === k) { hoverKey = null; applyAcc(); } });
    c.setAttribute('data-bot', k);
  });
  if ('IntersectionObserver' in window) {
    // on touch screens there is no hover, so the card in the middle of the screen gets the costume
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var k = en.target.getAttribute('data-bot');
        if (en.isIntersecting) { scrollKey = k; }
        else if (scrollKey === k) { scrollKey = null; }
      });
      applyAcc();
    }, { rootMargin: '-42% 0px -42% 0px', threshold: 0 });
  }

  /* ---------------------------------------------------------------- go */
  onView(true);
  requestAnimationFrame(frame);
})();
