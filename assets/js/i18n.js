/*
 * EPC-Consulting - language engine (FR / EN / AR)
 *
 * The HTML stays in French (source of truth, good fallback). translations.js holds rows of
 * [french, english, arabic]. The French text found in the page is the lookup key, so a text that
 * has no translation simply stays in French.
 *
 * Choice order: ?lang=xx in the URL > saved choice (localStorage) > French.
 * Arabic switches the page to right-to-left (<html dir="rtl">).
 */
(function () {
  var LANGS = ['fr', 'en', 'ar'];
  var STORE = 'epc-lang';
  var root = document.documentElement;
  var SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, svg: 1, SVG: 1 };
  var LOCALE = { fr: 'fr_FR', en: 'en_US', ar: 'ar_AR' };

  // ---- dictionary: french -> { en, ar } ----
  var map = { en: {}, ar: {} };
  (window.EPC_T || []).forEach(function (row) {
    map.en[row[0]] = row[1];
    map.ar[row[0]] = row[2];
  });

  function norm(s) { return s.replace(/\s+/g, ' ').trim(); }

  // ---- register everything translatable, remembering the original French ----
  var entries = [];

  function scan(el) {
    if (SKIP[el.nodeName] || (el.classList && el.classList.contains('lang'))) return;
    var hasText = false, hasChild = false, i, n;
    for (i = 0; i < el.childNodes.length; i++) {
      n = el.childNodes[i];
      if (n.nodeType === 3 && norm(n.nodeValue)) hasText = true;
      else if (n.nodeType === 1 && !SKIP[n.nodeName]) hasChild = true;
    }
    if (hasText && hasChild) {            // mixed content (text + inline tags): translate as a whole
      entries.push({ t: 'html', n: el, key: norm(el.innerHTML), orig: el.innerHTML });
      return;
    }
    for (i = 0; i < el.childNodes.length; i++) {
      n = el.childNodes[i];
      if (n.nodeType === 3) {
        var k = norm(n.nodeValue);
        if (k) entries.push({ t: 'text', n: n, key: k, orig: n.nodeValue });
      } else if (n.nodeType === 1) scan(n);
    }
  }

  function register() {
    // <option> elements without a value would change value when translated: pin them to the French text
    Array.prototype.forEach.call(document.querySelectorAll('option:not([value])'), function (o) {
      o.setAttribute('value', norm(o.textContent));
    });
    scan(document.body);

    Array.prototype.forEach.call(document.body.querySelectorAll('[alt],[aria-label],[placeholder],[title]'), function (el) {
      ['alt', 'aria-label', 'placeholder', 'title'].forEach(function (a) {
        if (el.hasAttribute(a) && !el.hasAttribute('data-lang')) {
          entries.push({ t: 'attr', n: el, a: a, key: norm(el.getAttribute(a)), orig: el.getAttribute(a) });
        }
      });
    });

    Array.prototype.forEach.call(document.querySelectorAll(
      'meta[name="description"],meta[property="og:title"],meta[property="og:description"]'), function (m) {
      entries.push({ t: 'attr', n: m, a: 'content', key: norm(m.getAttribute('content')), orig: m.getAttribute('content') });
    });
    entries.push({ t: 'title', n: document, key: norm(document.title), orig: document.title });
  }

  function tr(lang, key) {
    return lang === 'fr' ? undefined : map[lang][key];
  }

  function apply(lang) {
    entries.forEach(function (e) {
      var v = tr(lang, e.key);
      switch (e.t) {
        case 'html':
          e.n.innerHTML = v !== undefined ? v : e.orig; break;
        case 'text':
          if (v !== undefined) {
            e.n.nodeValue = e.orig.match(/^\s*/)[0] + v + e.orig.match(/\s*$/)[0];
          } else e.n.nodeValue = e.orig;
          break;
        case 'attr':
          e.n.setAttribute(e.a, v !== undefined ? v : e.orig); break;
        case 'title':
          document.title = v !== undefined ? v : e.orig; break;
      }
    });
  }

  // FAQ structured data follows the visible FAQ so every language is described correctly
  function refreshJsonLd() {
    var s = document.querySelector('script[type="application/ld+json"]');
    var items = document.querySelectorAll('.faq details');
    if (!s || !items.length) return;
    try {
      var data = JSON.parse(s.textContent);
      if (data['@type'] !== 'FAQPage' || data.mainEntity.length !== items.length) return;
      data.mainEntity.forEach(function (q, i) {
        q.name = items[i].querySelector('summary').textContent.trim();
        q.acceptedAnswer.text = items[i].querySelector('p').textContent.replace(/\s+/g, ' ').trim();
      });
      s.textContent = JSON.stringify(data);
    } catch (err) { /* keep the original block */ }
  }

  // ---- public ----
  var current = root.lang && LANGS.indexOf(root.lang) > -1 ? root.lang : 'fr';

  function set(lang, save) {
    if (LANGS.indexOf(lang) < 0) lang = 'fr';
    current = lang;
    root.lang = lang;
    root.dir = lang === 'ar' ? 'rtl' : 'ltr';
    apply(lang);
    var loc = document.querySelector('meta[property="og:locale"]');
    if (loc) loc.setAttribute('content', LOCALE[lang]);
    Array.prototype.forEach.call(document.querySelectorAll('.lang [data-lang]'), function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-lang') === lang ? 'true' : 'false');
    });
    refreshJsonLd();
    if (save) { try { localStorage.setItem(STORE, lang); } catch (e) {} }
    document.dispatchEvent(new CustomEvent('epc:lang', { detail: lang }));
  }

  // t('French text') -> text in the current language (used by the contact form message)
  function t(fr) {
    var v = tr(current, norm(fr));
    return v !== undefined ? v : fr;
  }

  register();
  set(current, false);
  root.classList.remove('i18n-pending');

  Array.prototype.forEach.call(document.querySelectorAll('.lang [data-lang]'), function (b) {
    b.addEventListener('click', function () { set(b.getAttribute('data-lang'), true); });
  });

  window.EPC_I18N = {
    lang: function () { return current; },
    set: function (l) { set(l, true); },
    t: t,
    keys: function () { return entries.map(function (e) { return e.key; }); }
  };
})();
