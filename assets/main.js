(function () {
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
