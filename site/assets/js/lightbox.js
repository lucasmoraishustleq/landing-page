/*
 * Full-screen viewer for images and videos that hold readable detail.
 * HQLightbox.attach(container, items, index): adds an "Expand" button to container and makes it open the viewer.
 * items: [{ type: 'img'|'video', src, srcset?, poster?, alt }]. Several items = prev/next, arrow keys and swipe.
 * Closes with the close button, Escape or a backdrop click; focus is trapped and returned; page scroll is locked and restored.
 */
(function () {
  var box, stage, cap, count, prevB, nextB, closeB, items = [], i = 0, opener = null, scrollY = 0;

  function build() {
    box = document.createElement('div');
    box.className = 'lb'; box.hidden = true;
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Expanded view');
    box.innerHTML =
      '<div class="lb-top"><span class="lb-count mono" aria-live="polite"></span><button type="button" class="lb-close">Close <span aria-hidden="true">×</span></button></div>' +
      '<div class="lb-stage"></div>' +
      '<p class="lb-cap"></p>' +
      '<button type="button" class="lb-nav lb-prev" aria-label="Previous">←</button><button type="button" class="lb-nav lb-next" aria-label="Next">→</button>';
    document.body.appendChild(box);
    stage = box.querySelector('.lb-stage'); cap = box.querySelector('.lb-cap'); count = box.querySelector('.lb-count');
    prevB = box.querySelector('.lb-prev'); nextB = box.querySelector('.lb-next'); closeB = box.querySelector('.lb-close');
    closeB.addEventListener('click', close);
    prevB.addEventListener('click', function () { go(-1); });
    nextB.addEventListener('click', function () { go(1); });
    box.addEventListener('click', function (e) { if (e.target === box || e.target === stage) close(); });
    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      else if (e.key === 'ArrowLeft' && items.length > 1) { e.preventDefault(); go(-1); }
      else if (e.key === 'ArrowRight' && items.length > 1) { e.preventDefault(); go(1); }
      else if (e.key === 'Tab') {
        var f = Array.prototype.filter.call(box.querySelectorAll('button, video[controls]'), function (el) { return el.offsetParent !== null; });
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    var x0 = null;
    stage.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (x0 === null || items.length < 2) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
    });
  }

  function render() {
    var it = items[i];
    var old = stage.querySelector('video'); if (old) old.pause();
    if (it.type === 'video') {
      stage.innerHTML = '<video controls playsinline preload="metadata"' + (it.poster ? ' poster="' + it.poster + '"' : '') + ' aria-label="' + esc(it.alt) + '"><source src="' + it.src + '" type="video/mp4"></video>';
    } else {
      stage.innerHTML = '<img src="' + it.src + '"' + (it.srcset ? ' srcset="' + it.srcset + '" sizes="100vw"' : '') + ' alt="' + esc(it.alt) + '">';
    }
    cap.textContent = it.alt || '';
    count.textContent = items.length > 1 ? (i + 1) + ' / ' + items.length : '';
    prevB.hidden = nextB.hidden = items.length < 2;
  }
  function esc(s) { return String(s || '').replace(/[&<>"']/g, function (m) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]; }); }
  function go(d) { i = (i + d + items.length) % items.length; render(); }

  function open(list, index, from) {
    if (!box) build();
    items = list; i = index || 0; opener = from || document.activeElement;
    scrollY = window.scrollY;
    document.documentElement.classList.add('lb-open'); // overflow hidden: the page stays where it is
    // pause any inline video that was playing behind the viewer
    document.querySelectorAll('video').forEach(function (v) { if (!box.contains(v) && !v.paused) v.pause(); });
    box.hidden = false; render();
    setTimeout(function () { closeB.focus(); }, 20);
  }
  function close() {
    var v = stage.querySelector('video'); if (v) v.pause();
    stage.innerHTML = '';
    box.hidden = true;
    document.documentElement.classList.remove('lb-open');
    if (Math.abs(window.scrollY - scrollY) > 1) window.scrollTo({ top: scrollY, left: 0, behavior: 'instant' });
    if (opener && opener.focus && document.contains(opener)) opener.focus({ preventScroll: true });
  }

  function attach(container, list, index) {
    if (!container || !list || !list.length) return;
    container.classList.add('lb-host');
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'lb-btn';
    b.innerHTML = '<span aria-hidden="true">⤢</span><span class="t"> Expand</span>';
    b.setAttribute('aria-label', 'Expand: ' + (list[index || 0].alt || 'media'));
    b.addEventListener('click', function (e) { e.stopPropagation(); open(list, index || 0, b); });
    container.appendChild(b);
    // the image itself also opens the viewer (videos keep their own play button)
    if (container.querySelector('video')) return;
    var imgs = container.querySelectorAll('img');
    Array.prototype.forEach.call(imgs, function (im, k) {
      var at = imgs.length === list.length ? k : (index || 0);
      im.addEventListener('click', function () { open(list, at, b); });
    });
  }

  window.HQLightbox = { open: open, attach: attach };
})();
