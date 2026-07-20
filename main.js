/* ============================================================
   $>SolarCoders<$ — interactions
   The ONLY motion here is driven by the user's scroll position.
   Nothing animates on its own.
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- year ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- sticky header state ---------- */
  var masthead = document.getElementById('masthead');

  /* ---------- mobile menu ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var mobileNav = document.getElementById('mobileNav');
  if (menuBtn && mobileNav) {
    var setOpen = function (open) {
      mobileNav.hidden = !open;
      menuBtn.setAttribute('aria-expanded', String(open));
    };
    menuBtn.addEventListener('click', function () {
      setOpen(mobileNav.hidden);
    });
    mobileNav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setOpen(false); });
    });
  }

  var starfield = document.getElementById('starfield');

  /* ---------- pin the header on scroll ---------- */
  var pinTicking = false;
  function pinHeader() {
    pinTicking = false;
    if (masthead) masthead.classList.toggle('pinned', (window.scrollY || 0) > 8);
  }
  window.addEventListener('scroll', function () {
    if (!pinTicking) { pinTicking = true; requestAnimationFrame(pinHeader); }
  }, { passive: true });
  pinHeader();

  /* ============================================================
     3D SOLAR SYSTEM
     A tilted orbital plane rendered with a pseudo-3D projection:
     each planet orbits in (x, z), the plane is inclined by PHI, and
     depth drives scale, brightness, stacking order, and cursor
     parallax — so planets pass in front of and behind the star.
     Logos ride the planets as billboards so they stay readable.
     ============================================================ */
  (function solar() {
    var stage = document.getElementById('solar');
    if (!stage) return;
    var planetEls = Array.prototype.slice.call(stage.querySelectorAll('.planet'));
    if (!planetEls.length) return;

    var PHI = 61 * Math.PI / 180;              // orbital-plane inclination
    var COSP = Math.cos(PHI);
    var FRAC = [0.30, 0.44, 0.58, 0.72, 0.86, 1.0];

    // one orbit ring per planet, dropped behind everything
    var rings = planetEls.map(function () {
      var r = document.createElement('div');
      r.className = 'ring';
      stage.insertBefore(r, stage.firstChild);
      return r;
    });
    var star = stage.querySelector('.solar-star');

    var maxR = 120, mx = 0, my = 0, raf;

    function layout() {
      var w = stage.clientWidth, h = stage.clientHeight;
      maxR = Math.min(w * 0.46, (h / 2) / COSP * 0.92);
      var size = Math.max(30, Math.min(48, w * 0.082));
      planetEls.forEach(function (p, i) {
        p._r = maxR * FRAC[i];
        p.style.width = p.style.height = size + 'px';
        var d = 2 * maxR * FRAC[i];
        rings[i].style.width = d + 'px';
        rings[i].style.height = (d * COSP) + 'px';
      });
      if (star) { var ss = size * 1.5; star.style.width = star.style.height = ss + 'px'; }
    }

    var t0 = performance.now();
    function project(now) {
      var t = (now - t0) / 1000;
      planetEls.forEach(function (p) {
        var speed = parseFloat(p.dataset.speed) || 0.15;
        var phase = parseFloat(p.dataset.phase) || 0;
        var dir = p.dataset.dir === '-1' ? -1 : 1;
        var ang = phase + dir * t * speed;
        var sinA = Math.sin(ang);
        var sx = Math.cos(ang) * p._r;
        var sy = sinA * p._r * COSP;
        var dz = sinA;                          // -1 (far) .. 1 (near)
        sx += mx * dz * 16;                      // depth parallax
        sy += my * dz * 12;
        var scale = 1 + dz * 0.28;
        p.style.transform = 'translate(-50%,-50%) translate(' +
          sx.toFixed(1) + 'px,' + sy.toFixed(1) + 'px) scale(' + scale.toFixed(3) + ')';
        p.style.zIndex = 100 + Math.round(dz * 60);
        var lit = (dz + 1) / 2;
        p.style.filter = 'brightness(' + (0.72 + 0.28 * lit).toFixed(2) + ')';
        p.style.opacity = (0.75 + 0.25 * lit).toFixed(2);
      });
      if (!reduce) raf = requestAnimationFrame(project);
    }

    layout();
    if (reduce) project(performance.now());
    else raf = requestAnimationFrame(project);

    if (!reduce && window.matchMedia('(pointer: fine)').matches) {
      stage.addEventListener('mousemove', function (e) {
        var r = stage.getBoundingClientRect();
        mx = (e.clientX - (r.left + r.width / 2)) / r.width;
        my = (e.clientY - (r.top + r.height / 2)) / r.height;
      });
      stage.addEventListener('mouseleave', function () { mx = 0; my = 0; });
    }

    var lrt;
    window.addEventListener('resize', function () {
      clearTimeout(lrt);
      lrt = setTimeout(layout, 150);
    });
  })();

  /* ============================================================
     STATIC STARFIELD — rendered once, never animated
     ============================================================ */
  if (starfield) {
    var ctx = starfield.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function paintStars() {
      var w = window.innerWidth;
      var h = window.innerHeight * 1.3; // extra height for parallax drift
      starfield.width = w * dpr;
      starfield.height = h * dpr;
      starfield.style.width = w + 'px';
      starfield.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      var count = Math.floor((w * h) / 9000);
      var palette = ['#ffffff', '#cdd6ea', '#f2e2bf', '#bfe0e6'];
      for (var i = 0; i < count; i++) {
        var depth = Math.random();
        var r = depth * 1.3 + 0.25;
        ctx.globalAlpha = 0.18 + depth * 0.5;
        ctx.beginPath();
        ctx.arc(Math.random() * w, Math.random() * h, r, 0, Math.PI * 2);
        ctx.fillStyle = palette[(Math.random() * palette.length) | 0];
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    paintStars();
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(paintStars, 200);
    });
  }

  /* ============================================================
     SCROLL REVEAL — swift, one-shot entrance as elements arrive
     ============================================================ */
  var revealSelectors = [
    '.section-head', '.mission-list li', '.program', '.feature',
    '.voice', '.cta > *', '.strip-row', '.aside-card', '.method',
    '.faq', '.panel', '.page-title', '.page-lede', '.breadcrumb'
  ];

  // stagger children within these groups
  ['.programs', '.features', '.voices', '.methods', '.mission-list'].forEach(function (csel) {
    document.querySelectorAll(csel).forEach(function (container) {
      Array.prototype.forEach.call(container.children, function (child, i) {
        child.style.setProperty('--reveal-delay', (Math.min(i, 6) * 70) + 'ms');
      });
    });
  });

  var revealEls = [];
  document.querySelectorAll('.reveal').forEach(function (e) { revealEls.push(e); });
  revealSelectors.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (e) {
      if (!e.classList.contains('reveal')) { e.classList.add('reveal'); revealEls.push(e); }
    });
  });

  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (e) { e.classList.add('in'); });
  } else {
    var revIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); revIO.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (e) { revIO.observe(e); });
  }

  /* ============================================================
     MAGNETIC BUTTONS — important CTAs drift toward the cursor
     ============================================================ */
  if (!reduce && window.matchMedia('(pointer: fine)').matches) {
    var STRENGTH = 0.32, MAX = 14;
    document.querySelectorAll('[data-magnetic]').forEach(function (btn) {
      btn.addEventListener('mouseenter', function () {
        btn.style.transition = 'transform 0.12s ease-out';
      });
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * STRENGTH;
        var dy = (e.clientY - (r.top + r.height / 2)) * STRENGTH;
        dx = Math.max(-MAX, Math.min(MAX, dx));
        dy = Math.max(-MAX, Math.min(MAX, dy));
        btn.style.transform = 'translate(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px)';
      });
      btn.addEventListener('mouseleave', function () {
        btn.style.transition = 'transform 0.45s cubic-bezier(0.16,1,0.3,1)';
        btn.style.transform = '';
      });
    });
  }

  /* ============================================================
     FORMS — validate, compose a pre-filled email, confirm
     No data is sent anywhere by this script; submitting opens the
     visitor's own mail app. Swap in a form backend to collect
     responses directly (see README).
     ============================================================ */
  function fieldOf(el) { return el.closest('.field'); }

  function isValid(el) {
    if (el.type === 'checkbox') return el.checked;
    if (el.type === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim());
    return el.value.trim() !== '';
  }

  function validateForm(form) {
    var ok = true, firstBad = null;
    form.querySelectorAll('[required]').forEach(function (el) {
      var good = isValid(el);
      var f = fieldOf(el);
      if (f) f.classList.toggle('invalid', !good);
      if (!good && !firstBad) firstBad = el;
      if (!good) ok = false;
    });
    if (firstBad) firstBad.focus();
    return ok;
  }

  function wireForm(formId, successId, subjectFn, bodyFn, to) {
    var form = document.getElementById(formId);
    if (!form) return;
    var success = document.getElementById(successId);
    var v = function (id) { var el = form.querySelector('#' + id); return el ? el.value.trim() : ''; };

    form.querySelectorAll('input, select, textarea').forEach(function (inp) {
      var clear = function () { var f = fieldOf(inp); if (f) f.classList.remove('invalid'); };
      inp.addEventListener('input', clear);
      inp.addEventListener('change', clear);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateForm(form)) return;
      var mailto = 'mailto:' + to +
        '?subject=' + encodeURIComponent(subjectFn(v)) +
        '&body=' + encodeURIComponent(bodyFn(v));
      window.location.href = mailto;
      form.style.display = 'none';
      if (success) {
        success.classList.add('show');
        success.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
      }
    });
  }

  wireForm('enrollForm', 'enrollSuccess',
    function (v) { return 'Enrollment — ' + (v('student') || 'new coder'); },
    function (v) {
      return 'PROGRAM: ' + v('program') +
        '\nSTUDENT: ' + v('student') + ' (age ' + v('age') + ')' +
        '\nPARENT/GUARDIAN: ' + v('parent') +
        '\nEMAIL: ' + v('email') +
        '\nLOCATION: ' + v('timezone') +
        '\nHEARD VIA: ' + v('referral') +
        '\n\nNOTES:\n' + v('notes');
    },
    'hello@$>SolarCoders<$.org');

  wireForm('contactForm', 'contactSuccess',
    function (v) { return 'Contact — ' + (v('reason') || 'General'); },
    function (v) {
      return 'FROM: ' + v('cname') +
        '\nEMAIL: ' + v('cemail') +
        '\nTOPIC: ' + v('reason') +
        '\n\nMESSAGE:\n' + v('message');
    },
    'hello@$>SolarCoders<$.org');

})();
