(function () {
  var C = window.HQ_CONFIG;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };

  // ---- dev bar: tells reviewers which integrations are not live ----
  if (C.SHOW_DEV_BAR) {
    $('devbar').hidden = false;
    $('dev-script').innerHTML = 'Lead form: <b>' + (C.APPS_SCRIPT_URL ? 'set, not verified' : 'not connected') + '</b>';
    $('dev-priority').innerHTML = 'Duke First Access: <b>' + (window.HQLeads.firstAccessEnabled() ? 'set, not verified' : 'pending Stripe link') + '</b>';
    $('dev-api').innerHTML = 'Duke demo API: <b>' + (C.DUKE_API_BASE ? 'set, not verified' : 'not connected') + '</b>';
    $('dev-fa-preview').innerHTML = '<a href="?preview=first-access#form" style="color:inherit">Preview the First Access modal</a>';
  }

  // ---- scroll reveals (progressive disclosure, never blocks content) ----
  var reveals = document.querySelectorAll('.rv, .wipe');
  document.querySelectorAll('.rv.stagger').forEach(function (g) {
    Array.prototype.forEach.call(g.children, function (c, i) { c.style.setProperty('--i', i); });
  });
  if (reduce || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); rio.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { rio.observe(el); });
    // Anything jumped to by anchor or already in view is shown right away
    window.addEventListener('hashchange', function () { reveals.forEach(function (el) { if (el.getBoundingClientRect().top < innerHeight) el.classList.add('in'); }); });
  }

  // ---- rotating phrase (no layout shift: all phrases share one grid cell) ----
  var rot = $('rotator');
  if (rot && !reduce) {
    var items = rot.children, ri = 0;
    setInterval(function () {
      if (document.hidden) return;
      items[ri].classList.remove('on'); ri = (ri + 1) % items.length; items[ri].classList.add('on');
    }, 2800);
  }

  // ---- weekly plan carousel: user-controlled, no autoplay ----
  var track = $('plan-track');
  if (track) {
    var slides = track.querySelectorAll('.slide');
    var prev = document.querySelector('.car-btn[data-dir="-1"]'), next = document.querySelector('.car-btn[data-dir="1"]');
    var pos = $('plan-pos');
    var step = function () { return slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth; };
    var current = function () { return Math.round(track.scrollLeft / step()); };
    var update = function () {
      var max = track.scrollWidth - track.clientWidth - 2;
      prev.disabled = track.scrollLeft <= 2;
      next.disabled = track.scrollLeft >= max;
      pos.textContent = Math.min(current() + 1, slides.length) + ' / ' + slides.length;
    };
    var go = function (dir) { track.scrollBy({ left: dir * step(), behavior: reduce ? 'auto' : 'smooth' }); };
    prev.addEventListener('click', function () { go(-1); });
    next.addEventListener('click', function () { go(1); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });
    var t; track.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(update, 60); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  // ---- content item anatomy: tabs with arrow-key support ----
  var anTabs = document.querySelectorAll('[data-an]'), anPanel = $('an-p');
  function selectPart(btn, focus) {
    anTabs.forEach(function (b) { var on = b === btn; b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
    var tpl = document.querySelector('template[data-an-tpl="' + btn.dataset.an + '"]');
    anPanel.innerHTML = ''; anPanel.appendChild(tpl.content.cloneNode(true));
    anPanel.setAttribute('aria-labelledby', btn.id);
    if (!reduce) { anPanel.classList.remove('swap'); void anPanel.offsetWidth; anPanel.classList.add('swap'); }
    if (focus) btn.focus();
    if (btn.scrollIntoView) btn.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  anTabs.forEach(function (b, i) {
    b.addEventListener('click', function () { selectPart(b); });
    b.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return; e.preventDefault();
      selectPart(anTabs[(i + d + anTabs.length) % anTabs.length], true);
    });
  });

  // ---- portfolio from data ----
  var grid = $('work-grid');
  if (grid && window.HQ_WORK) {
    grid.innerHTML = '';
    window.HQ_WORK.forEach(function (p) {
      var a = document.createElement('a');
      a.className = 'tile'; a.href = 'work/' + p.slug + '/';
      a.innerHTML = '<div class="img"><img loading="lazy" sizes="(max-width:900px) 100vw, 60vw"></div>' +
        '<div class="row1"><span class="name"></span><span class="go">View case →</span></div><span class="meta"></span>';
      var img = a.querySelector('img');
      img.src = p.image.src; img.srcset = p.image.srcset; img.alt = p.image.alt;
      if (p.image.position) img.style.objectPosition = p.image.position;
      a.querySelector('.name').textContent = p.name;
      a.querySelector('.meta').textContent = p.meta || '';
      a.setAttribute('aria-label', p.name + ', view case');
      grid.appendChild(a);
    });
    grid.classList.toggle('single', window.HQ_WORK.length === 1);
  }

  // ---- form paths ----
  var form = $('lead-form'), F = form.elements;
  var okBox = $('st-ok'), badBox = $('st-bad'), btn = $('submit-btn');
  var REQ = ['name', 'email', 'business_name'];
  var currentPath = 'duke';
  var requestId = null; // reused across retries so a repeated submit does not create a second row

  function submitLabel() { return currentPath === 'partner' ? 'Send application' : 'Join the Free Waitlist'; }
  function setPath(path, source) {
    if (path !== 'duke' && path !== 'partner') path = 'duke';
    if (path !== currentPath) requestId = null;
    currentPath = path;
    F.path.value = path;
    if (source) F.source.value = source;
    document.querySelectorAll('[data-tab]').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.tab === path)); });
    $('submit-label').textContent = submitLabel();
    $('form-lead').textContent = path === 'partner'
      ? 'Founding Partner Program, starting at $750/month. Applications are reviewed one by one.'
      : 'The Free Waitlist costs nothing. After you join, you can choose Duke First Access for priority in the launch queue.';
    clearStatus();
  }
  document.querySelectorAll('[data-tab]').forEach(function (b) {
    b.addEventListener('click', function () { setPath(b.dataset.tab, F.source.value || 'direct'); });
    b.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { var o = document.querySelector('[data-tab="' + (b.dataset.tab === 'duke' ? 'partner' : 'duke') + '"]'); o.focus(); o.click(); }
    });
  });
  document.querySelectorAll('a[data-path]').forEach(function (a) { a.addEventListener('click', function () { setPath(a.dataset.path, a.dataset.source); }); });
  function fromHash() {
    if (location.hash === '#waitlist') setPath('duke', 'link-waitlist');
    if (location.hash === '#fpp') setPath('partner', 'link-fpp');
  }
  window.addEventListener('hashchange', fromHash);
  setPath('duke'); fromHash();

  function clearStatus() { okBox.classList.remove('show', 'warn'); badBox.classList.remove('show'); }
  function fail(msg) { badBox.classList.add('show'); $('st-bad-msg').textContent = msg; }
  function confirmInline(title, sub, warn) {
    $('st-ok-title').textContent = title; $('st-ok-sub').textContent = sub || '';
    okBox.classList.toggle('warn', !!warn); okBox.classList.add('show'); okBox.focus();
  }

  var IG = /^@?[A-Za-z0-9._]{1,30}$|^(https?:\/\/)?(www\.)?instagram\.com\/[A-Za-z0-9._]{1,30}\/?(\?.*)?$/i;
  var WEB = /^(https?:\/\/)?[^\s/.]+(\.[^\s/.]+)+(\/\S*)?$/i;

  function validate() {
    var valid = true;
    form.querySelectorAll('.f').forEach(function (f) { f.classList.remove('invalid'); f.querySelector('input,textarea,select').removeAttribute('aria-invalid'); });
    function mark(name) { var f = form.querySelector('[data-field="' + name + '"]'); f.classList.add('invalid'); f.querySelector('input').setAttribute('aria-invalid', 'true'); valid = false; }
    REQ.forEach(function (n) {
      var v = (F[n].value || '').trim();
      if (!v || (n === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v))) mark(n);
    });
    var ig = F.instagram.value.trim(), web = F.website.value.trim();
    if (ig && !IG.test(ig)) mark('instagram');
    if (web && !WEB.test(web)) mark('website');
    if (!valid) { var first = form.querySelector('.f.invalid input'); if (first) first.focus(); }
    return valid;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault(); clearStatus();
    if (btn.disabled || !validate()) return;
    var path = currentPath;
    requestId = requestId || window.HQLeads.uuid();
    var payload = {
      path: path,
      name: F.name.value.trim(),
      email: F.email.value.trim(),
      business_name: F.business_name.value.trim(),
      business: F.business.value.trim(),
      marketing: F.marketing.value,
      hardest: F.hardest.value.trim(),
      instagram: F.instagram.value.trim(),
      website: F.website.value.trim(),
      source: F.source.value,
      page_version: C.PAGE_VERSION,
      request_id: requestId
    };
    btn.disabled = true; $('submit-label').textContent = 'Sending…';
    window.HQLeads.submit(payload).then(function (res) {
      requestId = null;
      form.reset(); setPath(path, payload.source);
      var emailLine = res.email_sent === true ? 'We sent a confirmation to ' + payload.email + '.'
        : res.email_sent === false ? 'Your registration is saved, but we could not send the confirmation email. No need to sign up again.' : '';
      if (path === 'partner') return confirmInline('Application received.', emailLine, res.email_sent === false);
      var done = function () { confirmInline('You’re on the list!', ('We’ll email you when Duke is ready for you. ' + emailLine).trim(), res.email_sent === false); };
      if (window.HQFirstAccess.canOffer(res.signup_id)) window.HQFirstAccess.offer({ signupId: res.signup_id, email: payload.email, onFree: done });
      else done();
    }).catch(function (err) {
      if (err.code === 'not_configured') fail('The form is not connected yet. Please write to contact@hustleqai.com.');
      else fail('Something went wrong and your registration was not saved. Your answers are still here. Try again, or write to contact@hustleqai.com.');
    }).finally(function () {
      btn.disabled = false; $('submit-label').textContent = submitLabel();
    });
  });

  // ---- Duke First Access (shared module): design preview without a real signup ----
  if (window.HQFirstAccess.preview) window.HQFirstAccess.offer({ signupId: 'preview', onFree: function () { confirmInline('You’re on the list!', 'We’ll email you when Duke is ready for you.'); } });

  // ---- header: compact on scroll + section indicator ----
  var header = $('top-header');
  function onScroll() { header.classList.toggle('compact', window.scrollY > 640); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  var links = document.querySelectorAll('nav.main a[data-sec]');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      var id = en.target.id;
      links.forEach(function (l) { l.classList.toggle('active', l.dataset.sec === id); });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['hero', 'product', 'work', 'ways-in'].forEach(function (id) { io.observe($(id)); });

  // ---- a link to a FAQ answer (for example /#faq-refund) opens it ----
  var openFromHash = function () { var d = /^#[A-Za-z][\w-]*$/.test(location.hash) && document.querySelector('details' + location.hash); if (d) d.open = true; };
  openFromHash(); window.addEventListener('hashchange', openFromHash);

  // ---- weekly plan videos: muted, play while visible, always pausable; never autoplay with reduced motion ----
  document.querySelectorAll('.vid').forEach(function (box) {
    var v = box.querySelector('video'), b = box.querySelector('.vid-btn'), userPaused = reduce;
    var label = function () { var p = !v.paused; b.textContent = p ? 'Pause' : 'Play'; b.setAttribute('aria-label', (p ? 'Pause' : 'Play') + ' video'); };
    var play = function () { var pr = v.play(); if (pr && pr.catch) pr.catch(function () { /* blocked or unavailable: the poster stays */ }); };
    v.addEventListener('play', label); v.addEventListener('pause', label);
    b.addEventListener('click', function () { if (v.paused) { userPaused = false; play(); } else { userPaused = true; v.pause(); } });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (en) { if (en.intersectionRatio > 0.6) { if (!userPaused) play(); } else if (!v.paused) v.pause(); });
      }, { threshold: [0, 0.6] }).observe(v);
    }
  });

  // ---- mobile menu ----
  var mb = document.querySelector('.menu-btn'), mm = $('mmenu');
  mb.addEventListener('click', function () { var o = mm.classList.toggle('open'); mb.setAttribute('aria-expanded', String(o)); });
  mm.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { mm.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mm.classList.contains('open')) { mm.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); mb.focus(); } });
})();
