/*
 * Lead submission and optional Duke First Access.
 * Never reports success without a confirmed server response.
 */
(function () {
  var C = window.HQ_CONFIG;
  var STATUSES = ['none', 'pending', 'confirmed', 'failed', 'abandoned'];

  function err(code, detail) { var e = new Error(code); e.code = code; e.detail = detail; return e; }

  function request(url, opts) {
    var ctrl = new AbortController();
    var t = setTimeout(function () { ctrl.abort(); }, C.TIMEOUT_MS);
    opts = Object.assign({ signal: ctrl.signal }, opts || {});
    return fetch(url, opts)
      .catch(function (e) { throw err(e && e.name === 'AbortError' ? 'timeout' : 'network'); })
      .then(function (r) {
        if (!r.ok) throw err('http', r.status);
        return r.json().catch(function () { throw err('bad_response'); });
      })
      .finally(function () { clearTimeout(t); });
  }

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }

  function submit(payload) {
    if (!C.APPS_SCRIPT_URL) return Promise.reject(err('not_configured'));
    return request(C.APPS_SCRIPT_URL, {
      method: 'POST',
      // text/plain avoids a CORS preflight, which Apps Script cannot answer
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).then(function (d) {
      if (!d || d.ok !== true) throw err('not_ok', d && d.error);
      var res = { signup_id: typeof d.signup_id === 'string' && d.signup_id ? d.signup_id : null, email_sent: d.email_sent === true ? true : d.email_sent === false ? false : null };
      if (res.signup_id) remember({ id: res.signup_id, path: payload.path });
      return res;
    });
  }

  // First Access is offered only when a checkout route and a server status route both exist.
  function firstAccessEnabled() { return !!((C.FIRST_ACCESS_CHECKOUT_URL || C.FIRST_ACCESS_SESSION_URL) && C.FIRST_ACCESS_STATUS_URL); }

  function returnUrl() { return location.origin + location.pathname + '?first_access=return#form'; }

  function startCheckout(signupId, email) {
    if (!firstAccessEnabled()) return Promise.reject(err('not_configured'));
    if (C.FIRST_ACCESS_CHECKOUT_URL) {
      // Stripe Payment Link: client_reference_id ties the payment to the saved registration.
      if (!/^https:\/\//.test(C.FIRST_ACCESS_CHECKOUT_URL)) return Promise.reject(err('bad_config'));
      var u = new URL(C.FIRST_ACCESS_CHECKOUT_URL);
      u.searchParams.set('client_reference_id', signupId);
      if (email) u.searchParams.set('prefilled_email', email);
      return Promise.resolve(u.toString());
    }
    return request(C.FIRST_ACCESS_SESSION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ signup_id: signupId, return_url: returnUrl() })
    }).then(function (d) {
      var url = d && d.checkout_url;
      if (typeof url !== 'string' || !/^https:\/\//.test(url)) throw err('bad_response');
      return url;
    });
  }

  function getStatus(signupId) {
    if (!firstAccessEnabled()) return Promise.reject(err('not_configured'));
    var sep = C.FIRST_ACCESS_STATUS_URL.indexOf('?') > -1 ? '&' : '?';
    return request(C.FIRST_ACCESS_STATUS_URL + sep + 'signup_id=' + encodeURIComponent(signupId), { method: 'GET' })
      .then(function (d) {
        var s = d && d.status;
        if (STATUSES.indexOf(s) === -1) throw err('bad_response');
        return s;
      });
  }

  function remember(v) { try { sessionStorage.setItem('hq_signup', JSON.stringify(v)); } catch { /* storage unavailable */ } }
  function recall() { try { return JSON.parse(sessionStorage.getItem('hq_signup') || 'null'); } catch { return null; } }

  window.HQLeads = { submit: submit, uuid: uuid, firstAccessEnabled: firstAccessEnabled, startCheckout: startCheckout, getStatus: getStatus, recall: recall };
})();
