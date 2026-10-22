/*
 * Lead submission and optional priority access.
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

  function priorityEnabled() { return !!(C.PRIORITY_CHECKOUT_URL && C.PRIORITY_STATUS_URL); }

  function startCheckout(signupId) {
    if (!priorityEnabled()) return Promise.reject(err('not_configured'));
    return request(C.PRIORITY_CHECKOUT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ signup_id: signupId, return_url: location.origin + location.pathname + '?priority=return#form' })
    }).then(function (d) {
      var u = d && d.checkout_url;
      if (typeof u !== 'string' || !/^https:\/\//.test(u)) throw err('bad_response');
      return u;
    });
  }

  function getStatus(signupId) {
    if (!priorityEnabled()) return Promise.reject(err('not_configured'));
    var sep = C.PRIORITY_STATUS_URL.indexOf('?') > -1 ? '&' : '?';
    return request(C.PRIORITY_STATUS_URL + sep + 'signup_id=' + encodeURIComponent(signupId), { method: 'GET' })
      .then(function (d) {
        var s = d && d.status;
        if (STATUSES.indexOf(s) === -1) throw err('bad_response');
        return s;
      });
  }

  function remember(v) { try { sessionStorage.setItem('hq_signup', JSON.stringify(v)); } catch { /* storage unavailable */ } }
  function recall() { try { return JSON.parse(sessionStorage.getItem('hq_signup') || 'null'); } catch { return null; } }

  window.HQLeads = { submit: submit, priorityEnabled: priorityEnabled, startCheckout: startCheckout, getStatus: getStatus, recall: recall };
})();
