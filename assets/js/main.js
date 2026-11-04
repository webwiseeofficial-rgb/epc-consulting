(function () {

  // Header: shadow once the page is scrolled
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Scroll reveal (staggered). Classes are removed once the animation is done so hover effects keep working.
  var targets = document.querySelectorAll('.hero-copy > *, .hx-copy > *, .hx-aside, .fs-grid > div, .bt, .svc-cards > *, .sec-head, .step, .domains li, .why-img, .why > *, .points li, .faq-side, .faq details, .trust-wrap, .cta2 .box, .page-head .wrap > *, .service, .tile, .about > *, .values div, .contact > *, .ticks li, .zone > *, .cta .wrap > *, .split-head, .row, .chips li, .band h2');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var el = e.target;
          el.classList.add('in');
          io.unobserve(el);
          setTimeout(function () { el.classList.remove('reveal', 'in'); el.style.removeProperty('--d'); }, 1500);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (el) {
      var pos = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty('--d', Math.min(pos, 6) * 0.07 + 's');
      el.classList.add('reveal');
      io.observe(el);
    });
  }

  // Mobile navigation
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  // Projects: optional photos. Drop assets/img/projets/<slug>.jpg and it appears automatically.
  document.querySelectorAll('.tile[data-slug]').forEach(function (tile) {
    var url = 'assets/img/projets/' + tile.getAttribute('data-slug') + '.jpg';
    var img = new Image();
    img.onload = function () {
      tile.style.backgroundImage = 'url("' + url + '")';
      tile.classList.add('has-photo');
    };
    img.src = url;
  });

  // Projects: photo galleries. A tile with data-photos="N" opens a viewer with
  // assets/img/projets/<slug>/1.jpg ... N.jpg (small previews: 1-s.jpg ... N-s.jpg).
  (function () {
    var tiles = document.querySelectorAll('.tile[data-photos]');
    if (!tiles.length) return;
    var t = function (fr) { return window.EPC_I18N ? window.EPC_I18N.t(fr) : fr; };
    var ICON_X = '<svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
    var ICON_L = '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>';
    var ICON_R = '<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg>';
    var ICON_P = '<svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10.5" r="1.6"/><path d="M21 16l-5-5-8 8"/></svg>';

    var box, imgEl, titleEl, countEl, thumbsEl, btnX, btnP, btnN;
    var cur = { tile: null, slug: '', n: 0, i: 0, title: '' };
    var opener = null;

    function src(i, small) { return 'assets/img/projets/' + cur.slug + '/' + (i + 1) + (small ? '-s' : '') + '.jpg'; }

    function labels() {
      btnX.setAttribute('aria-label', t('Fermer'));
      btnP.setAttribute('aria-label', t('Photo précédente'));
      btnN.setAttribute('aria-label', t('Photo suivante'));
    }

    function build() {
      box = document.createElement('div');
      box.className = 'lb';
      box.setAttribute('dir', 'ltr');
      box.setAttribute('role', 'dialog');
      box.setAttribute('aria-modal', 'true');
      box.hidden = true;
      box.innerHTML =
        '<button type="button" class="lb-x">' + ICON_X + '</button>' +
        '<button type="button" class="lb-nav lb-prev">' + ICON_L + '</button>' +
        '<button type="button" class="lb-nav lb-next">' + ICON_R + '</button>' +
        '<figure class="lb-fig"><img alt=""><figcaption><span class="lb-title"></span><span class="lb-count"></span></figcaption></figure>' +
        '<div class="lb-thumbs"></div>';
      document.body.appendChild(box);
      imgEl = box.querySelector('.lb-fig img');
      titleEl = box.querySelector('.lb-title');
      countEl = box.querySelector('.lb-count');
      thumbsEl = box.querySelector('.lb-thumbs');
      btnX = box.querySelector('.lb-x'); btnP = box.querySelector('.lb-prev'); btnN = box.querySelector('.lb-next');
      btnX.addEventListener('click', close);
      btnP.addEventListener('click', function () { go(cur.i - 1); });
      btnN.addEventListener('click', function () { go(cur.i + 1); });
      box.addEventListener('click', function (e) { if (e.target === box || e.target.classList.contains('lb-fig')) close(); });
      document.addEventListener('keydown', function (e) {
        if (box.hidden) return;
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowLeft') go(cur.i - 1);
        else if (e.key === 'ArrowRight') go(cur.i + 1);
        else if (e.key === 'Tab') {            // keep the focus inside the viewer
          var f = box.querySelectorAll('button');
          var first = f[0], last = f[f.length - 1];
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
          else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      });
      var x0 = null;                           // swipe
      box.addEventListener('touchstart', function (e) { x0 = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
      box.addEventListener('touchend', function (e) {
        if (x0 === null) return;
        var dx = e.changedTouches[0].clientX - x0; x0 = null;
        if (Math.abs(dx) > 50) go(cur.i + (dx < 0 ? 1 : -1));
      });
    }

    function go(i) {
      cur.i = (i + cur.n) % cur.n;
      imgEl.classList.add('lb-loading');
      imgEl.onload = function () { imgEl.classList.remove('lb-loading'); };
      imgEl.src = src(cur.i);
      imgEl.alt = cur.title + ' - ' + (cur.i + 1) + '/' + cur.n;
      countEl.textContent = (cur.i + 1) + ' / ' + cur.n;
      Array.prototype.forEach.call(thumbsEl.children, function (b, k) {
        var on = k === cur.i;
        b.classList.toggle('on', on);
        b.setAttribute('aria-current', on ? 'true' : 'false');
        if (on && b.scrollIntoView) { try { b.scrollIntoView({ block: 'nearest', inline: 'center' }); } catch (e) { b.scrollIntoView(); } }
      });
      [cur.i + 1, cur.i - 1].forEach(function (k) { new Image().src = src((k + cur.n) % cur.n); });   // preload neighbours
    }

    function open(tile, start) {
      if (!box) build();
      cur.tile = tile; cur.slug = tile.getAttribute('data-slug');
      cur.n = parseInt(tile.getAttribute('data-photos'), 10) || 0;
      cur.title = (tile.querySelector('h3') || {}).textContent || '';
      if (!cur.n) return;
      titleEl.textContent = cur.title;
      box.setAttribute('aria-label', cur.title);
      labels();
      var h = '';
      for (var k = 0; k < cur.n; k++) h += '<button type="button" aria-label="' + (k + 1) + '"><img src="' + src(k, true) + '" alt="" loading="lazy"></button>';
      thumbsEl.innerHTML = h;
      Array.prototype.forEach.call(thumbsEl.children, function (b, k) { b.addEventListener('click', function () { go(k); }); });
      var multi = cur.n > 1;
      btnP.hidden = btnN.hidden = thumbsEl.hidden = !multi;
      opener = document.activeElement;
      box.hidden = false;
      document.documentElement.classList.add('lb-open');
      go(start || 0);
      btnX.focus();
    }

    function close() {
      box.hidden = true;
      document.documentElement.classList.remove('lb-open');
      imgEl.removeAttribute('src');
      if (opener && opener.focus) opener.focus();
    }

    function decorate(tile) {
      var n = tile.getAttribute('data-photos');
      var title = (tile.querySelector('h3') || {}).textContent || '';
      tile.setAttribute('role', 'button');
      tile.setAttribute('tabindex', '0');
      tile.setAttribute('aria-label', title + ', ' + n + ' ' + t('photos'));
      var badge = tile.querySelector('.tile-count');
      if (!badge) { badge = document.createElement('span'); badge.className = 'tile-count'; tile.appendChild(badge); }
      badge.innerHTML = ICON_P + '<b>' + n + '</b>';
    }

    tiles.forEach(function (tile) {
      decorate(tile);
      tile.addEventListener('click', function () { open(tile, 0); });
      tile.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(tile, 0); }
      });
    });
    document.addEventListener('epc:lang', function () {
      tiles.forEach(decorate);
      if (box && !box.hidden) labels();
    });
  })();

  // Projects: category filter
  var filters = document.querySelectorAll('.filters button');
  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cat = btn.getAttribute('data-cat');
      filters.forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      document.querySelectorAll('.tile').forEach(function (t) {
        t.hidden = !(cat === 'all' || t.getAttribute('data-cat') === cat);
      });
    });
  });

  // Contact form: opens WhatsApp or the mail client with the message pre-filled
  var form = document.getElementById('quote-form');
  var wanted = new URLSearchParams(window.location.search).get('service');
  var sel = document.getElementById('service');
  if (wanted && sel) {
    Array.prototype.forEach.call(sel.options, function (o) {
      if (o.value.toLowerCase() === wanted.toLowerCase()) { sel.value = o.value; }
    });
  }
  if (form) {
    var PHONE = '213661248502';
    var MAIL = 'contact@epc-consultingsolutions.com';

    // Text of the message follows the page language (EPC_I18N.t returns the French text if i18n is absent)
    var t = function (fr) { return window.EPC_I18N ? window.EPC_I18N.t(fr) : fr; };

    var compose = function () {
      var d = new FormData(form);
      var lines = [
        t('Bonjour EPC-Consulting,'),
        '',
        t('Nom :') + ' ' + (d.get('name') || ''),
        t('Société :') + ' ' + (d.get('company') || '-'),
        t('Téléphone :') + ' ' + (d.get('phone') || '-'),
        t('Besoin :') + ' ' + t(d.get('service') || '-'),
        '',
        d.get('message') || ''
      ];
      return lines.join('\n');
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      window.open('https://wa.me/' + PHONE + '?text=' + encodeURIComponent(compose()), '_blank', 'noopener');
    });

    var mailBtn = document.getElementById('send-mail');
    if (mailBtn) {
      mailBtn.addEventListener('click', function () {
        if (!form.reportValidity()) return;
        var subject = t('Demande de devis -') + ' ' + (new FormData(form).get('name') || '');
        window.location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(compose());
      });
    }
  }

})();
