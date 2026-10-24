/*
 * Duke First Access offer, shared by the landing form and the /meet-duke/ demo.
 * Shown only after the server has saved the Free Waitlist registration.
 * Every exit (stay, close, Escape, backdrop) keeps the registration.
 * Payment status comes only from the server; the checkout redirect is never proof of payment.
 */
(function () {
  var C = window.HQ_CONFIG;
  var L = window.HQLeads;
  var params = new URLSearchParams(location.search);
  var PREVIEW = !!C.SHOW_DEV_BAR && params.get('preview') === 'first-access';
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch { /* storage unavailable */ } }
  };
  var STAR = '<svg class="star" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0C12.8 6.5 17.5 11.2 24 12C17.5 12.8 12.8 17.5 12 24C11.2 17.5 6.5 12.8 0 12C6.5 11.2 11.2 6.5 12 0Z" fill="var(--signal)"/></svg>';

  var modal = document.getElementById('fa-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'fa-backdrop'; modal.id = 'fa-modal'; modal.hidden = true;
    modal.innerHTML =
      '<div class="fa-dialog" role="dialog" aria-modal="true" aria-labelledby="fa-title" aria-describedby="fa-desc">' +
        '<button type="button" class="fa-close" id="fa-close" aria-label="Close and stay on the Free Waitlist">×</button>' +
        '<div id="fa-offer">' +
          '<span class="eyebrow">' + STAR + 'Registration saved</span>' +
          '<h2 id="fa-title">You’re on the list!</h2>' +
          '<p id="fa-desc">Your Duke waitlist registration is confirmed.</p>' +
          '<div class="fa-box">' +
            '<h3>Want to get ahead of the line?</h3>' +
            '<p>Get <b>Duke First Access</b> for a one-time, refundable $20 payment and receive priority in the launch queue.</p>' +
            '<button class="btn primary" type="button" id="fa-pay"><span id="fa-pay-label">Get First Access · $20</span><span class="arr" aria-hidden="true">→</span></button>' +
            '<button class="btn" type="button" id="fa-stay"><span>I’ll stay on the free waitlist</span></button>' +
            '<p class="fa-note" id="fa-note">One-time payment, refundable<span id="fa-refund"></span>. First Access gives you a place ahead of Free Waitlist members in the launch queue. It does not guarantee immediate access or an access date.</p>' +
          '</div>' +
        '</div>' +
        '<div class="fa-state" id="fa-state" role="status" hidden></div>' +
        '<div id="fa-state-actions" class="fa-state-actions" hidden>' +
          '<button class="btn primary" type="button" id="fa-retry"><span>Try again</span></button>' +
          '<button class="btn" type="button" id="fa-done"><span>Close</span></button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);
  }
  var $ = function (id) { return document.getElementById(id); };
  var dialog = modal.querySelector('.fa-dialog');
  var offerBox = $('fa-offer'), faState = $('fa-state'), faStateActions = $('fa-state-actions'), payBtn = $('fa-pay');
  if (C.REFUND_POLICY_URL) $('fa-refund').innerHTML = ' (<a href="' + encodeURI(C.REFUND_POLICY_URL) + '">refund policy</a>)';

  var ctx = null, polling = null, lastFocus = null, paid = false;

  function enabled() { return L.firstAccessEnabled(); }
  function canOffer(signupId) { return !!signupId && (enabled() || PREVIEW) && store.get('hq_fa_declined') !== '1'; }

  function openModal() {
    lastFocus = document.activeElement;
    modal.hidden = false; document.body.classList.add('modal-open');
    setTimeout(function () { (offerBox.hidden ? $('fa-close') : (payBtn.disabled ? $('fa-stay') : payBtn)).focus(); }, 30);
  }
  function closeModal() {
    modal.hidden = true; document.body.classList.remove('modal-open'); clearTimeout(polling);
    if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus();
  }
  function showState(msg, bad, actions) {
    offerBox.hidden = true; faState.hidden = false; faState.textContent = msg; faState.classList.toggle('bad', !!bad);
    faStateActions.hidden = !actions;
  }
  function stayFree() {
    var wasOffer = !offerBox.hidden;
    if (!paid && wasOffer) store.set('hq_fa_declined', '1'); // do not prompt again
    closeModal();
    if (ctx && ctx.onFree && !paid) ctx.onFree();
  }

  // opts: { signupId, email, onFree }
  function offer(opts) {
    ctx = opts || {};
    offerBox.hidden = false; faState.hidden = true; faStateActions.hidden = true;
    var live = enabled();
    payBtn.disabled = !live;
    $('fa-pay-label').textContent = live ? 'Get First Access · $20' : 'Get First Access · $20 (checkout link pending)';
    openModal();
  }

  function checkout() {
    if (!ctx || !ctx.signupId) return;
    payBtn.disabled = true; $('fa-pay-label').textContent = 'Opening secure checkout…';
    L.startCheckout(ctx.signupId, ctx.email).then(function (url) {
      location.assign(url);
    }).catch(function () {
      payBtn.disabled = false; $('fa-pay-label').textContent = 'Get First Access · $20';
      showState('We could not open checkout. Your Free Waitlist registration is saved. You can try again.', true, true);
    });
  }

  function poll(n) {
    L.getStatus(ctx.signupId).then(function (s) {
      if (s === 'confirmed') { paid = true; return showState('Duke First Access confirmed. You have priority in the launch queue. We’ll email you when Duke is ready for you.'); }
      if (s === 'failed') return showState('The payment did not go through. You are still on the Free Waitlist.', true, true);
      if (s === 'abandoned') return showState('Checkout was closed before paying. You are still on the Free Waitlist.', true, true);
      if (n >= C.PRIORITY_POLL_MAX) return showState('Your payment is still being confirmed. You stay on the Free Waitlist in the meantime. If anything looks wrong, write to contact@hustleqai.com.');
      showState('Checking your payment with our payment provider…');
      polling = setTimeout(function () { poll(n + 1); }, C.PRIORITY_POLL_MS);
    }).catch(function () {
      if (n >= 3) return showState('We could not check your payment right now. Your Free Waitlist registration is saved. Write to contact@hustleqai.com if you need help.', true);
      polling = setTimeout(function () { poll(n + 1); }, C.PRIORITY_POLL_MS);
    });
  }

  $('fa-stay').addEventListener('click', stayFree);
  $('fa-close').addEventListener('click', stayFree);
  $('fa-done').addEventListener('click', stayFree);
  modal.addEventListener('click', function (e) { if (e.target === modal) stayFree(); });
  payBtn.addEventListener('click', checkout);
  $('fa-retry').addEventListener('click', function () { offerBox.hidden = false; faState.hidden = true; faStateActions.hidden = true; checkout(); });
  document.addEventListener('keydown', function (e) {
    if (modal.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); stayFree(); return; }
    if (e.key === 'Tab') { // keep focus inside the dialog
      var f = Array.prototype.filter.call(dialog.querySelectorAll('button,a[href]'), function (el) { return !el.disabled && el.offsetParent !== null; });
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  // Back from checkout: ask the server, never trust the URL.
  var returned = params.get('first_access') === 'return' || params.get('priority') === 'return';
  if (returned && enabled()) {
    var saved = L.recall();
    ctx = { signupId: saved && saved.id };
    openModal();
    if (ctx.signupId) { $('fa-retry').hidden = false; showState('Checking your payment with our payment provider…'); poll(0); }
    else { $('fa-retry').hidden = true; showState('We could not find your registration in this browser. If you paid, write to contact@hustleqai.com and we will check it.', true, true); }
  }

  window.HQFirstAccess = { canOffer: canOffer, offer: offer, preview: PREVIEW && !returned };
})();
