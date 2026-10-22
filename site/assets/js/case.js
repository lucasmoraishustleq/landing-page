/*
 * Case-study renderer. A case page is a thin shell:
 *   <main id="main" data-case="<slug>" data-root="../../"></main>
 * Content comes from window.HQ_WORK (assets/js/work-data.js).
 */
(function () {
  var main = document.getElementById('main');
  if (!main || !window.HQ_WORK) return;
  var C = window.HQ_CONFIG || {};
  var root = main.getAttribute('data-root') || '';
  var slug = main.getAttribute('data-case');
  var idx = window.HQ_WORK.findIndex(function (p) { return p.slug === slug; });
  var project = window.HQ_WORK[idx];
  if (!project || !project.case) { main.innerHTML = '<p class="wrap" style="padding:96px 0">This case is not available. <a href="' + root + 'work/">See all work</a>.</p>'; return; }
  var showPH = !!C.SHOW_DEV_BAR;

  function esc(s) { return String(s).replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); }
  function img(b, opts) {
    opts = opts || {};
    var base = root + 'assets/img/' + b.img;
    var lazy = opts.eager ? 'fetchpriority="high"' : 'loading="lazy" decoding="async"';
    return '<img src="' + base + '-800.jpg" srcset="' + base + '-800.jpg 800w, ' + base + '-1400.jpg 1400w" sizes="' + (opts.sizes || '100vw') + '" alt="' + esc(b.alt) + '" ' + lazy +
      (b.position ? ' style="object-position:' + esc(b.position) + '"' : '') + '>';
  }
  function fig(b, sizes) {
    return '<figure class="cs-fig"><div class="cs-frame" style="aspect-ratio:' + esc(b.ratio || '4/5') + '">' + img(b, { sizes: sizes }) + '</div>' +
      (b.caption ? '<figcaption>' + esc(b.caption) + '</figcaption>' : '') + '</figure>';
  }

  var html = [];
  var c = project.case;
  html.push('<div class="wrap crumb"><a href="' + root + '">HustleQ</a><span aria-hidden="true">/</span><a href="' + root + 'work/">The Work</a><span aria-hidden="true">/</span><span aria-current="page">' + esc(project.name) + '</span></div>');

  c.blocks.forEach(function (b) {
    switch (b.type) {
      case 'hero':
        html.push('<header class="cs-head wrap"><h1 class="case-title">' + esc(c.title) + '</h1><p class="cs-lede">' + esc(c.lede) + '</p></header>');
        html.push('<div class="cs-hero">' + img(b, { eager: true }) + '</div>');
        break;
      case 'meta':
        html.push('<dl class="cs-meta wrap">' + b.items.map(function (r) { return '<div><dt>' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('') + '</dl>');
        break;
      case 'text':
        html.push('<section class="cs-text wrap"><span class="cs-label">' + esc(b.label) + '</span><div><h2>' + esc(b.heading) + '</h2><p>' + esc(b.body) + '</p></div></section>');
        break;
      case 'full':
        html.push('<figure class="cs-full"><div class="cs-frame" style="aspect-ratio:' + esc(b.ratio || '16/9') + '">' + img(b) + '</div>' + (b.caption ? '<figcaption class="wrap">' + esc(b.caption) + '</figcaption>' : '') + '</figure>');
        break;
      case 'pair':
        html.push('<div class="cs-pair wrap' + (b.offset ? ' offset' : '') + '">' + b.items.map(function (it) { return fig(it, '(max-width:900px) 100vw, 50vw'); }).join('') + '</div>');
        break;
      case 'mark':
        html.push('<figure class="cs-mark wrap"><div class="cs-mark-box"><img src="' + root + esc(b.img) + '" alt="' + esc(b.alt) + '" loading="lazy" width="900" height="872"></div><figcaption>' + esc(b.caption) + '</figcaption></figure>');
        break;
      case 'placeholder':
        if (!showPH) break;
        html.push('<section class="cs-text wrap"><span class="cs-label">' + esc(b.label) + '</span><div><span class="todo">' + esc(b.id) + ' · ' + esc(b.note) + '</span></div></section>');
        break;
      case 'posts':
        if (!showPH) break;
        html.push('<section class="cs-text wrap"><span class="cs-label">' + esc(b.label) + '</span><div class="cs-posts">' + b.ids.map(function (id) { return '<div class="ph" style="aspect-ratio:4/5">' + esc(id) + '</div>'; }).join('') + '</div></section>');
        break;
      case 'closing':
        html.push('<figure class="cs-full cs-closing"><div class="cs-frame" style="aspect-ratio:16/9">' + img(b) + '</div></figure>');
        var next = window.HQ_WORK.length > 1 ? window.HQ_WORK[(idx + 1) % window.HQ_WORK.length] : null;
        html.push('<section class="cs-end wrap"><p>' + esc(b.text) + '</p><nav class="cs-nav" aria-label="Case navigation">' +
          '<a class="btn" href="' + root + 'work/">All work</a>' +
          (next ? '<a class="btn" href="' + root + 'work/' + next.slug + '/">Next: ' + esc(next.name) + ' <span aria-hidden="true">→</span></a>' : '') +
          '<a class="btn" href="' + root + '">Back to HustleQ</a>' +
          '<a class="btn primary" href="' + root + '#form">Join the waitlist <span aria-hidden="true">→</span></a></nav></section>');
        break;
    }
  });
  main.innerHTML = html.join('\n');
})();
