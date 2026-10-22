(function () {
  var C = window.HQ_CONFIG;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };

  // ---- dev bar: tells reviewers which integrations are not live ----
  if (C.SHOW_DEV_BAR) {
    $('devbar').hidden = false;
    $('dev-script').innerHTML = 'Lead form: <b>' + (C.APPS_SCRIPT_URL ? 'set, not verified' : 'not connected') + '</b>';
    $('dev-priority').innerHTML = 'Priority access: <b>' + (window.HQLeads.priorityEnabled() ? 'set, not verified' : 'not connected') + '</b>';
    $('dev-api').innerHTML = 'Duke demo API: <b>' + (C.DUKE_API_BASE ? 'set, not verified' : 'not connected') + '</b>';
  }

  // ---- rotating phrase (no layout shift: all phrases share one grid cell) ----
  var rot = $('rotator');
  if (rot && !reduce) {
    var items = rot.children, i = 0;
    setInterval(function () {
      if (document.hidden) return;
      items[i].classList.remove('on'); i = (i + 1) % items.length; items[i].classList.add('on');
    }, 2800);
  }

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

  function setPath(path, source) {
    if (path !== 'duke' && path !== 'partner') path = 'duke';
    currentPath = path;
    F.path.value = path;
    if (source) F.source.value = source;
    document.querySelectorAll('[data-tab]').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.tab === path)); });
    $('submit-label').textContent = path === 'partner' ? 'Send application' : 'Join the waitlist';
    $('form-lead').textContent = path === 'partner'
      ? 'Founding Partner Program, starting at $750/month. Applications are reviewed one by one.'
      : 'Join the Duke waitlist for free. After you join, you can choose optional priority access.';
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
    e.preventDefault(); clearStatus(); hidePriority();
    if (!validate()) return;
    var path = currentPath;
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
      page_version: C.PAGE_VERSION
    };
    btn.disabled = true; $('submit-label').textContent = 'Sending…';
    window.HQLeads.submit(payload).then(function (res) {
      form.reset(); setPath(path, payload.source);
      $('st-ok-title').textContent = path === 'partner' ? 'Application received.' : 'You’re on the list.';
      var sub = '';
      if (res.email_sent === true) sub = 'We sent a confirmation to ' + payload.email + '.';
      if (res.email_sent === false) { sub = 'Your signup is saved, but we could not send the confirmation email. No need to sign up again.'; okBox.classList.add('warn'); }
      $('st-ok-sub').textContent = sub;
      okBox.classList.add('show'); okBox.focus();
      if (path === 'duke' && res.signup_id && window.HQLeads.priorityEnabled()) showPriority(res.signup_id);
    }).catch(function (err) {
      if (err.code === 'not_configured') fail('The form is not connected yet. Please write to contact@hustleqai.com.');
      else fail('Something went wrong and your signup was not saved. Your answers are still here. Try again, or write to contact@hustleqai.com.');
    }).finally(function () {
      btn.disabled = false; $('submit-label').textContent = currentPath === 'partner' ? 'Send application' : 'Join the waitlist';
    });
  });

  // ---- optional priority access ($20). Status comes only from the server. ----
  var pr = $('priority'), prState = $('pr-state'), prActions = $('pr-actions'), signupId = null, polling = null;
  if (C.REFUND_POLICY_URL) { $('pr-refund').innerHTML = 'Refundable · <a href="' + encodeURI(C.REFUND_POLICY_URL) + '">refund policy</a>'; }
  function hidePriority() { pr.hidden = true; prState.hidden = true; clearTimeout(polling); }
  function showPriority(id) { signupId = id; pr.hidden = false; prActions.hidden = false; prState.hidden = true; }
  function state(msg, bad, retry) {
    prState.hidden = false; prState.classList.toggle('bad', !!bad); prState.textContent = msg;
    prActions.hidden = !retry;
  }
  $('pr-skip').addEventListener('click', function () { hidePriority(); });
  $('pr-pay').addEventListener('click', function () {
    var b = $('pr-pay'); b.disabled = true; state('Opening secure checkout…');
    prActions.hidden = false;
    window.HQLeads.startCheckout(signupId).then(function (url) {
      location.assign(url);
    }).catch(function () {
      b.disabled = false; state('We could not open checkout. Your free signup is still saved. Try again in a moment.', true, true);
    });
  });

  function poll(n) {
    window.HQLeads.getStatus(signupId).then(function (s) {
      if (s === 'confirmed') return state('Priority access confirmed. Thank you. Your free signup stays saved too.');
      if (s === 'failed') return state('The payment did not go through. Your free signup is still saved. You can try again.', true, true);
      if (s === 'abandoned') return state('Checkout was closed before paying. Your free signup is still saved. You can try again.', true, true);
      // pending or none: the server has not confirmed yet
      if (n >= C.PRIORITY_POLL_MAX) return state('Your payment is still being confirmed. Your free signup is saved. If anything looks wrong, write to contact@hustleqai.com.');
      state('Checking your payment with our payment provider…');
      polling = setTimeout(function () { poll(n + 1); }, C.PRIORITY_POLL_MS);
    }).catch(function () {
      if (n >= 3) return state('We could not check your payment right now. Your free signup is saved. Write to contact@hustleqai.com if you need help.', true);
      polling = setTimeout(function () { poll(n + 1); }, C.PRIORITY_POLL_MS);
    });
  }
  // Returning from checkout: the URL is never proof of payment, so ask the server.
  if (new URLSearchParams(location.search).get('priority') === 'return' && window.HQLeads.priorityEnabled()) {
    var saved = window.HQLeads.recall();
    pr.hidden = false;
    if (saved && saved.id) { signupId = saved.id; prActions.hidden = true; state('Checking your payment with our payment provider…'); poll(0); }
    else { prActions.hidden = true; state('We could not find your signup in this browser. If you paid, write to contact@hustleqai.com and we will check it.', true); }
  }

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

  // ---- mobile menu ----
  var mb = document.querySelector('.menu-btn'), mm = $('mmenu');
  mb.addEventListener('click', function () { var o = mm.classList.toggle('open'); mb.setAttribute('aria-expanded', String(o)); });
  mm.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { mm.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mm.classList.contains('open')) { mm.classList.remove('open'); mb.setAttribute('aria-expanded', 'false'); mb.focus(); } });
})();
