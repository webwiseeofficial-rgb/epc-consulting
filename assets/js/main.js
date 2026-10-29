(function () {

  // Header: shadow once the page is scrolled
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // Scroll reveal (staggered), skipped for reduced-motion or old browsers
  var targets = document.querySelectorAll('.hero-copy > *, .hx-copy > *, .hx-media, .fs-grid > div, .svc, .step, .sec-head, .why-img, .partners > *, .cta2 .box, .strip .wrap > div, .split-head, .row, .chips li, .band h2, .why > *, .points li, .zone > *, .cta .wrap > *, .page-head .wrap > *, .service, .tile, .about > *, .values div, .contact > *, .trust img, .ticks li');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!('IntersectionObserver' in window) || reduce) {
    targets.forEach(function (el) { el.classList.add('reveal', 'in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    targets.forEach(function (el) {
      var sibs = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty('--d', Math.min(sibs, 6) * 0.07 + 's');
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
      if (o.text.toLowerCase() === wanted.toLowerCase()) { sel.value = o.value; }
    });
  }
  if (form) {
    var PHONE = '213661248502';
    var MAIL = 'contact@epc-consulting.com';

    var compose = function () {
      var d = new FormData(form);
      var lines = [
        'Bonjour EPC-Consulting,',
        '',
        'Nom : ' + (d.get('name') || ''),
        'Société : ' + (d.get('company') || '-'),
        'Téléphone : ' + (d.get('phone') || '-'),
        'Besoin : ' + (d.get('service') || '-'),
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
        var subject = 'Demande de devis - ' + (new FormData(form).get('name') || '');
        window.location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(compose());
      });
    }
  }
})();
