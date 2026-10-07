/* Teaching resources page: tool switching, OS tabs, copy buttons, progress ticks and the request builder.
   Everything here only affects #v-resources. */
(function () {
  'use strict';
  var root = document.getElementById('v-resources');
  if (!root) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var kit = document.getElementById('tool-app-dev');

  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } }

  /* ---------- which tool is open: #resources/<tool> ---------- */
  var TOOLS = ['app-dev', 'multi-agent', 'cases'];
  var tabs = root.querySelectorAll('.tr-tool');
  var panels = root.querySelectorAll('[data-tool-panel]');
  var asides = root.querySelectorAll('[data-tool-aside]');
  function currentTool() {
    var h = (location.hash || '').slice(1).split('/');
    return h[0] === 'resources' && TOOLS.indexOf(h[1]) >= 0 ? h[1] : TOOLS[0];
  }
  function applyTool() {
    var t = currentTool();
    panels.forEach(function (p) { p.hidden = p.getAttribute('data-tool-panel') !== t; });
    asides.forEach(function (a) { a.hidden = a.getAttribute('data-tool-aside') !== t; });
    tabs.forEach(function (b) { b.setAttribute('aria-current', b.getAttribute('data-tool') === t ? 'true' : 'false'); });
  }
  tabs.forEach(function (b) {
    b.addEventListener('click', function () { location.hash = '#resources/' + b.getAttribute('data-tool'); });
  });
  window.addEventListener('hashchange', applyTool);
  applyTool();

  /* ---------- operating system tabs ---------- */
  var osBtns = kit.querySelectorAll('[data-os-pick]');
  function setOs(os) {
    kit.setAttribute('data-os', os);
    osBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-os-pick') === os)); });
    set('kit-os', os);
  }
  var saved = get('kit-os');
  var guess = /Win/i.test(navigator.platform || navigator.userAgent || '') ? 'win' : 'mac';
  setOs(saved === 'mac' || saved === 'win' ? saved : guess);
  osBtns.forEach(function (b) { b.addEventListener('click', function () { setOs(b.getAttribute('data-os-pick')); }); });

  /* ---------- copy buttons ---------- */
  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:fixed;top:-9999px';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy') ? resolve() : reject(); } catch (e) { reject(e); }
      ta.remove();
    });
  }
  kit.addEventListener('click', function (e) {
    var btn = e.target.closest('.copy-btn');
    if (!btn) return;
    var text;
    if (btn.getAttribute('data-target')) {
      text = document.getElementById(btn.getAttribute('data-target')).value;
    } else {
      var pre = btn.parentNode.querySelector('pre');
      text = pre ? pre.innerText || pre.textContent : '';
      if (btn.parentNode.classList.contains('term')) text = text.replace(/^\s*(\$|PS>)\s?/gm, '');
    }
    copyText(text.trim()).then(function () {
      btn.textContent = 'Copied';
      setTimeout(function () { btn.textContent = 'Copy'; }, 1300);
    }, function () {
      btn.textContent = 'Press Ctrl+C';
      var pre2 = btn.parentNode.querySelector('pre, textarea');
      if (pre2) { var r = document.createRange(); r.selectNodeContents(pre2); var s = window.getSelection(); s.removeAllRanges(); s.addRange(r); }
      setTimeout(function () { btn.textContent = 'Copy'; }, 2200);
    });
  });

  /* ---------- progress ticks ---------- */
  var steps = Array.prototype.slice.call(kit.querySelectorAll('.kit-step'));
  var countEl = document.getElementById('kit-count');
  var barEl = document.getElementById('kit-bar');
  var done = {};
  try { done = JSON.parse(get('kit-steps') || '{}') || {}; } catch (e) { done = {}; }
  function paintProgress() {
    var n = 0;
    steps.forEach(function (st) {
      var id = st.getAttribute('data-step'), on = !!done[id];
      st.classList.toggle('done', on);
      st.querySelector('input[type="checkbox"]').checked = on;
      if (on) n++;
    });
    countEl.textContent = n + ' of ' + steps.length;
    barEl.style.width = (steps.length ? (n / steps.length) * 100 : 0) + '%';
  }
  steps.forEach(function (st) {
    st.querySelector('input[type="checkbox"]').addEventListener('change', function (e) {
      done[st.getAttribute('data-step')] = e.target.checked;
      set('kit-steps', JSON.stringify(done));
      paintProgress();
    });
  });
  document.getElementById('kit-reset').addEventListener('click', function () {
    done = {}; set('kit-steps', '{}'); paintProgress();
  });
  paintProgress();

  /* ---------- phase jump links ---------- */
  document.querySelectorAll('[data-jump]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      var t = document.getElementById(a.getAttribute('data-jump'));
      if (t) t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
  });
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var a = root.querySelector('.kit-jump a[data-jump="' + en.target.id + '"]');
        if (!a) return;
        a.parentNode.querySelectorAll('a').forEach(function (l) { l.classList.toggle('on', l === a); });
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    root.querySelectorAll('h3.ph[id]').forEach(function (h) { if (root.querySelector('.kit-jump a[data-jump="' + h.id + '"]')) io.observe(h); });
  }

  /* ---------- click-to-play intro videos (YouTube loads only when asked) ---------- */
  root.addEventListener('click', function (e) {
    var btn = e.target.closest('.yt .play');
    if (!btn) return;
    var box = btn.parentNode, id = box.getAttribute('data-yt');
    var f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
    f.title = (box.getAttribute('data-title') || 'Simulation') + ' introduction video';
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    f.allowFullscreen = true;
    box.textContent = '';
    box.appendChild(f);
  });

  /* ---------- request builder (Phase 3) ---------- */
  var TYPES = {
    design: { label: 'Design of the page', ex: 'Redesign the app as a centred, single-column page with a white background, one orange accent colour for the button and headings, generous spacing, and a professional look for MBA students.' },
    prompt: { label: 'Wording of the system prompt', ex: 'Make the system prompt more specific: the app acts as a careful teaching assistant for an operations course, asks one clarifying question when a request is vague, and never invents data.' },
    input: { label: 'A new input field', ex: 'Add a dropdown called "Audience" with the options Executive, MBA student and Beginner, and send the chosen value to the model so the explanation fits that audience.' },
    format: { label: 'Format of the answer', ex: 'Show every answer as three short bullet points followed by a one-sentence recommendation in bold.' },
    saved: { label: 'Something that remembers (saved answers)', ex: "Below the answer, keep a list of this session's questions and answers, with a Clear saved answers button. Keep the data only in the browser for this session." }
  };
  var elType = document.getElementById('pb-type'), elWhat = document.getElementById('pb-what'),
      elKeep = document.getElementById('pb-keep'), elTest = document.getElementById('pb-test'), elOut = document.getElementById('pb-out');
  function build() {
    var t = TYPES[elType.value];
    elWhat.placeholder = t.ex;
    elOut.value =
      'Make one change to this app.\n\n' +
      'Type of change: ' + t.label + '\n' +
      'What to change: ' + (elWhat.value.trim() || '(describe it in the box above)') + '\n\n' +
      'Keep exactly as it is: ' + (elKeep.value.trim() || 'everything else') + '.\n' +
      'Do not add new features, accounts, databases or logins.\n\n' +
      'When you finish, list the files you changed and tell me how to test it: ' + (elTest.value.trim() || 'run it locally') + '.';
  }
  [elType, elWhat, elKeep, elTest].forEach(function (el) { el.addEventListener('input', build); el.addEventListener('change', build); });
  document.getElementById('pb-example').addEventListener('click', function () { elWhat.value = TYPES[elType.value].ex; build(); });
  build();

  /* ---------- AI case studies: theme filter and a combined request ---------- */
  var csCards = Array.prototype.slice.call(root.querySelectorAll('.cs-card'));
  if (csCards.length) {
    var filters = root.querySelectorAll('.cs-filter');
    var none = document.getElementById('cs-none');
    filters.forEach(function (f) {
      f.addEventListener('click', function () {
        var t = f.getAttribute('data-theme'), shown = 0;
        filters.forEach(function (x) { x.setAttribute('aria-pressed', String(x === f)); });
        csCards.forEach(function (c) {
          var ok = t === 'all' || (' ' + c.getAttribute('data-themes') + ' ').indexOf(' ' + t + ' ') >= 0;
          c.hidden = !ok;
          if (ok) shown++;
        });
        none.hidden = shown > 0;
      });
    });
    var bar = document.getElementById('cs-bar'), count = document.getElementById('cs-count'), send = document.getElementById('cs-send');
    var boxes = csCards.map(function (c) { return c.querySelector('.cs-pick input'); });
    function paintRequest() {
      var p = boxes.filter(function (i) { return i.checked; });
      csCards.forEach(function (c) { c.classList.toggle('picked', c.querySelector('.cs-pick input').checked); });
      bar.hidden = p.length === 0;
      count.textContent = p.length + (p.length === 1 ? ' case selected' : ' cases selected');
      var list = p.map(function (i) { return '- ' + i.getAttribute('data-case'); }).join('\n');
      var body = 'Hello Abhishek,\n\nI would like to request the following case(s) and teaching note(s):\n' + list + '\n\nCourse and audience:\nTerm and dates:\nInstitution:\n';
      send.href = 'mailto:abhishek.jha@spjimr.org?subject=' + encodeURIComponent('Case request: ' + p.length + (p.length === 1 ? ' case' : ' cases')) + '&body=' + encodeURIComponent(body);
    }
    boxes.forEach(function (b) { b.addEventListener('change', paintRequest); });
    document.getElementById('cs-clear').addEventListener('click', function () {
      boxes.forEach(function (b) { b.checked = false; });
      paintRequest();
    });
    paintRequest();
  }
})();
