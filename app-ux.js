(function () {
  'use strict';

  var KEY = 'locked-in-v3-pomodoro';
  var timer = { total: 25 * 60, remaining: 25 * 60, running: false, interval: null, subject: '' };

  function $(selector, root) { return (root || document).querySelector(selector); }
  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>\"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' })[c];
    });
  }
  function state() { return window.LockedIn && window.LockedIn.state ? window.LockedIn.state() : {}; }
  function today() { return new Date().toISOString().slice(0, 10); }
  function route() { return location.hash.slice(1) || 'dashboard'; }
  function saveTimer() {
    try { localStorage.setItem(KEY, JSON.stringify({ total: timer.total, remaining: timer.remaining, running: timer.running, subject: timer.subject })); } catch (e) {}
  }
  function loadTimer() {
    try {
      var saved = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (saved) {
        timer.total = Number(saved.total) || 1500;
        timer.remaining = Number(saved.remaining);
        if (!isFinite(timer.remaining) || timer.remaining < 0) timer.remaining = timer.total;
        timer.subject = saved.subject || '';
      }
    } catch (e) {}
  }
  function format(seconds) {
    seconds = Math.max(0, Math.floor(seconds));
    return String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0');
  }
  function paintTimer() {
    var nodes = document.querySelectorAll('[data-pomo-time]');
    Array.prototype.forEach.call(nodes, function (node) { node.textContent = format(timer.remaining); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-pomo-start]'), function (node) {
      node.textContent = timer.running ? 'Pause' : (timer.remaining < timer.total ? 'Resume' : 'Start focus');
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-pomo-progress]'), function (node) {
      node.style.width = Math.max(0, Math.min(100, (1 - timer.remaining / timer.total) * 100)) + '%';
    });
  }
  function stopTimer() {
    if (timer.interval) window.clearInterval(timer.interval);
    timer.interval = null;
    timer.running = false;
    saveTimer();
    paintTimer();
  }
  function completeTimer() {
    var minutes = Math.max(1, Math.round(timer.total / 60));
    stopTimer();
    if (window.LockedIn && window.LockedIn.completePomodoro) window.LockedIn.completePomodoro(minutes, timer.subject || 'Focus');
    timer.remaining = timer.total;
    saveTimer();
    paintTimer();
    if (window.LockedIn && window.LockedIn.render) window.LockedIn.render();
    window.setTimeout(enhance, 0);
  }
  function startTimer() {
    if (timer.running) { stopTimer(); return; }
    if (timer.remaining <= 0) timer.remaining = timer.total;
    timer.running = true;
    saveTimer();
    paintTimer();
    timer.interval = window.setInterval(function () {
      timer.remaining -= 1;
      if (timer.remaining <= 0) { timer.remaining = 0; completeTimer(); return; }
      paintTimer();
      saveTimer();
    }, 1000);
  }
  function resetTimer() {
    stopTimer();
    timer.remaining = timer.total;
    saveTimer();
    paintTimer();
  }
  function addStyles() {
    if ($('#ux-styles')) return;
    var style = document.createElement('style');
    style.id = 'ux-styles';
    style.textContent = '.ux-stack{margin:16px 0}.ux-stack h3{margin:0 0 12px}.ux-stack-list{display:grid;gap:8px}.ux-stack-item{display:flex;align-items:center;gap:10px;padding:12px;border:1px solid var(--line);border-radius:12px;background:rgba(20,20,22,.55)}.ux-stack-item.done{opacity:.55}.ux-stack-item span{flex:1}.ux-stack-item small{display:block;color:var(--muted);margin-top:3px}.ux-stack-item button{padding:7px 10px}.ux-empty{padding:18px;border:1px dashed var(--line);border-radius:12px;color:var(--muted);text-align:center}.ux-timer{text-align:center;margin-top:14px;padding:16px;border:1px solid var(--line);border-radius:14px;background:rgba(16,16,18,.5)}.ux-timer-time{font-size:42px;font-weight:800;color:var(--lime);letter-spacing:.04em}.ux-timer-progress{height:6px;background:#303035;border-radius:9px;overflow:hidden;margin:10px 0 14px}.ux-timer-progress i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--lime),var(--neon));transition:width .3s linear}.ux-timer input{width:100%;margin-bottom:10px}.ux-timer-actions{display:flex;justify-content:center;gap:8px}.ux-route-state{margin-top:12px}' ;
    document.head.appendChild(style);
  }
  function stackItems() {
    var s = state(), d = today(), items = [], quests = s.quests || {}, logs = s.logs || [], habits = s.habits || {};
    var todayLogs = logs.filter(function (x) { return x.date === d; });
    var workout = todayLogs.filter(function (x) { return x.type === 'workout'; }).length;
    var study = todayLogs.filter(function (x) { return x.type === 'study' || x.type === 'pomodoro'; }).length;
    var meals = (s.meals || []).filter(function (x) { return x.date === d; }).length;
    var habitNames = Object.keys(habits);
    items.push({ id: 'train', title: workout ? 'Training logged' : 'Log today\'s training', detail: workout ? workout + ' session' : 'Keep the body moving', action: workout ? null : 'train', done: !!workout });
    items.push({ id: 'fuel', title: meals ? 'Fuel recorded' : 'Record your first meal', detail: meals ? meals + ' meal' + (meals === 1 ? '' : 's') + ' today' : 'Build the nutrition signal', action: meals ? null : 'fuel', done: !!meals });
    items.push({ id: 'focus', title: study ? 'Focus logged' : 'Complete a focus block', detail: study ? study + ' study session' + (study === 1 ? '' : 's') : 'A Pomodoro counts toward Mind', action: study ? null : 'pomo', done: !!study });
    if (habitNames.length) {
      var checked = habitNames.filter(function (h) { return s.habitMeta && s.habitMeta[h] && s.habitMeta[h].lastCheckDate === d; }).length;
      items.push({ id: 'habits', title: checked === habitNames.length ? 'Daily habits checked' : 'Check daily habits', detail: checked + '/' + habitNames.length + ' complete', action: checked === habitNames.length ? null : 'life', done: checked === habitNames.length });
    }
    Object.keys(quests).some(function (key) {
      var q = quests[key];
      if (q && !q.completed) { items.push({ id: 'quest-' + key, title: q.title || 'Daily quest', detail: (q.progress || 0) + '/' + (q.target || 1) + ' complete', action: 'squad', done: false }); return true; }
      return false;
    });
    return items;
  }
  function renderStack() {
    if (route() !== 'dashboard') return;
    var page = $('.page');
    if (!page || $('.ux-stack', page)) return;
    var items = stackItems();
    var html = '<section class="card ux-stack" aria-labelledby="todays-stack-title"><h3 id="todays-stack-title">TODAY\'S STACK</h3><div class="ux-stack-list">';
    items.forEach(function (item) {
      html += '<div class="ux-stack-item ' + (item.done ? 'done' : '') + '"><span><strong>' + (item.done ? '✓ ' : '') + esc(item.title) + '</strong><small>' + esc(item.detail) + '</small></span>';
      if (item.action) html += '<button class="btn" data-stack-action="' + esc(item.action) + '">Open</button>';
      html += '</div>';
    });
    html += '</div></section>';
    var cols = $('.cols', page);
    if (cols) cols.insertAdjacentHTML('afterbegin', html); else page.insertAdjacentHTML('beforeend', html);
  }
  function renderEmptyStates() {
    var page = $('.page');
    if (!page || route() === 'dashboard') return;
    var list = $('.list', page);
    if (list && !list.children.length) list.innerHTML = '<div class="ux-empty">Nothing logged here yet. Use the action above to create your first record.</div>';
    var routeState = document.createElement('div');
    routeState.className = 'ux-route-state';
    var existing = page.querySelector('.ux-route-state');
    if (existing) existing.remove();
    var s = state(), hasReal = route() === 'train' ? (s.logs || []).some(function (x) { return x.type === 'workout'; }) : route() === 'nutrition' ? (s.meals || []).length > 0 : route() === 'mind' ? (s.study || []).length > 0 : true;
    if (!hasReal && (route() === 'train' || route() === 'nutrition' || route() === 'mind')) {
      routeState.innerHTML = '<div class="ux-empty">No records yet — this space is ready for your first win.</div>';
      page.appendChild(routeState);
    }
  }
  function renderPomodoro() {
    if (route() !== 'mind') return;
    var page = $('.page'), cards = page ? page.querySelectorAll('.card') : [];
    var host = null;
    Array.prototype.forEach.call(cards, function (card) { if (/focus cockpit/i.test(card.textContent)) host = card; });
    if (!host || $('.ux-timer', host)) return;
    host.insertAdjacentHTML('beforeend', '<div class="ux-timer" aria-label="Pomodoro timer"><div class="eyebrow">POMODORO</div><div class="ux-timer-time" data-pomo-time>' + format(timer.remaining) + '</div><div class="ux-timer-progress"><i data-pomo-progress></i></div><input data-pomo-subject placeholder="What are you focusing on?" value="' + esc(timer.subject) + '"><div class="ux-timer-actions"><button class="btn primary" data-pomo-start>' + (timer.running ? 'Pause' : 'Start focus') + '</button><button class="btn" data-pomo-reset>Reset</button></div></div>');
    paintTimer();
  }
  function enhance() { addStyles(); renderStack(); renderEmptyStates(); renderPomodoro(); paintTimer(); }
  document.addEventListener('click', function (event) {
    var stack = event.target.closest && event.target.closest('[data-stack-action]');
    if (stack) { location.hash = stack.getAttribute('data-stack-action') === 'fuel' ? 'nutrition' : stack.getAttribute('data-stack-action') === 'pomo' ? 'mind' : stack.getAttribute('data-stack-action'); return; }
    if (event.target.closest && event.target.closest('[data-pomo-start]')) { startTimer(); return; }
    if (event.target.closest && event.target.closest('[data-pomo-reset]')) { resetTimer(); return; }
  });
  document.addEventListener('input', function (event) {
    if (event.target.matches && event.target.matches('[data-pomo-subject]')) { timer.subject = event.target.value; saveTimer(); }
  });
  window.addEventListener('hashchange', function () { window.setTimeout(enhance, 0); });
  document.addEventListener('DOMContentLoaded', function () { loadTimer(); window.setTimeout(enhance, 0); });
  loadTimer();
  if (document.readyState !== 'loading') window.setTimeout(enhance, 0);
}());
