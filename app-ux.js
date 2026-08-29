(function () {
  'use strict';

  var LI = window.LockedIn;
  if (!LI) return;

  var TIMER_KEY = 'locked-in-v3-pomodoro';
  var DEFAULT_SECONDS = 25 * 60;
  var timer = {
    total: DEFAULT_SECONDS,
    remaining: DEFAULT_SECONDS,
    running: false,
    endAt: 0,
    interval: null,
    subject: ''
  };

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function state() {
    return typeof LI.state === 'function' ? (LI.state() || {}) : {};
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function esc(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function format(seconds) {
    seconds = Math.max(0, Math.floor(Number(seconds) || 0));
    return String(Math.floor(seconds / 60)).padStart(2, '0') + ':' + String(seconds % 60).padStart(2, '0');
  }

  function route() {
    return window.location.hash.slice(1) || 'dashboard';
  }

  function saveTimer() {
    try {
      localStorage.setItem(TIMER_KEY, JSON.stringify({
        total: timer.total,
        remaining: timer.remaining,
        running: timer.running,
        endAt: timer.endAt,
        subject: timer.subject
      }));
    } catch (_) {}
  }

  function loadTimer() {
    try {
      var saved = JSON.parse(localStorage.getItem(TIMER_KEY) || 'null');
      if (!saved) return;
      timer.total = Number(saved.total) > 0 ? Number(saved.total) : DEFAULT_SECONDS;
      timer.remaining = Number.isFinite(Number(saved.remaining)) ? Math.max(0, Number(saved.remaining)) : timer.total;
      timer.running = saved.running === true && Number(saved.endAt) > Date.now();
      timer.endAt = timer.running ? Number(saved.endAt) : 0;
      timer.subject = String(saved.subject || '');
      if (saved.running && !timer.running) timer.remaining = 0;
    } catch (_) {}
  }

  function paintTimer() {
    document.querySelectorAll('[data-pomo-time]').forEach(function (node) {
      node.textContent = format(timer.remaining);
    });
    document.querySelectorAll('[data-pomo-start]').forEach(function (node) {
      node.textContent = timer.running ? 'Pause' : (timer.remaining < timer.total ? 'Resume' : 'Start focus');
    });
    document.querySelectorAll('[data-pomo-progress]').forEach(function (node) {
      var progress = timer.total ? (1 - timer.remaining / timer.total) * 100 : 0;
      node.style.width = Math.max(0, Math.min(100, progress)) + '%';
    });
    var input = $('[data-pomo-subject]');
    if (input && document.activeElement !== input) input.value = timer.subject;
  }

  function stopInterval() {
    if (timer.interval) window.clearInterval(timer.interval);
    timer.interval = null;
  }

  function tick() {
    if (!timer.running) return;
    timer.remaining = Math.max(0, Math.ceil((timer.endAt - Date.now()) / 1000));
    paintTimer();
    if (timer.remaining <= 0) finishTimer();
  }

  function startTimer() {
    if (timer.running) {
      pauseTimer();
      return;
    }
    if (timer.remaining <= 0) timer.remaining = timer.total;
    timer.running = true;
    timer.endAt = Date.now() + timer.remaining * 1000;
    saveTimer();
    paintTimer();
    stopInterval();
    timer.interval = window.setInterval(tick, 250);
  }

  function pauseTimer() {
    tick();
    if (!timer.running) return;
    timer.running = false;
    timer.endAt = 0;
    stopInterval();
    saveTimer();
    paintTimer();
  }

  function cancelTimer() {
    timer.running = false;
    timer.endAt = 0;
    timer.remaining = timer.total;
    timer.subject = '';
    stopInterval();
    saveTimer();
    paintTimer();
    enhance();
  }

  function finishTimer() {
    var minutes = Math.max(1, Math.round(timer.total / 60));
    var subject = timer.subject.trim() || 'Focus';
    timer.running = false;
    timer.endAt = 0;
    timer.remaining = timer.total;
    stopInterval();
    saveTimer();

    if (typeof LI.completePomodoro === 'function') {
      LI.completePomodoro(minutes, subject);
    } else {
      var s = state();
      s.study = Array.isArray(s.study) ? s.study : [];
      s.study.push({ type: 'pomodoro', action: 'pomodoro', minutes: minutes, subject: subject, date: today(), timestamp: new Date().toISOString() });
      if (typeof LI.awardXP === 'function') LI.awardXP(20, 'pomodoro');
      if (typeof LI.save === 'function') LI.save();
    }
    if (typeof LI.getDailyQuests === 'function') LI.getDailyQuests();
    if (typeof LI.render === 'function') LI.render();
    window.setTimeout(enhance, 0);
  }

  function addStyles() {
    if ($('#ux-styles')) return;
    var style = document.createElement('style');
    style.id = 'ux-styles';
    style.textContent = '.ux-stack{margin:16px 0}.ux-stack h3{margin:0 0 12px}.ux-stack-list{display:grid;gap:8px}.ux-stack-item{display:flex;align-items:center;gap:10px;padding:12px;border:1px solid var(--line);border-radius:12px;background:rgba(20,20,22,.55)}.ux-stack-item.done{opacity:.58}.ux-stack-item span{flex:1}.ux-stack-item small{display:block;color:var(--muted);margin-top:3px}.ux-stack-item button{padding:7px 10px}.ux-empty{padding:18px;border:1px dashed var(--line);border-radius:12px;color:var(--muted);text-align:center}.ux-timer{text-align:center;margin-top:14px;padding:16px;border:1px solid var(--line);border-radius:14px;background:rgba(16,16,18,.5)}.ux-timer-time{font-size:42px;font-weight:800;color:var(--lime);letter-spacing:.04em}.ux-timer-progress{height:6px;background:#303035;border-radius:9px;overflow:hidden;margin:10px 0 14px}.ux-timer-progress i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--line),var(--neon));transition:width .25s linear}.ux-timer input{width:100%;margin-bottom:10px}.ux-timer-actions{display:flex;justify-content:center;gap:8px}';
    document.head.appendChild(style);
  }

  function item(id, title, detail, action, done, extra) {
    var result = { id: id, title: title, detail: detail, action: action || '', done: !!done };
    if (extra) Object.assign(result, extra);
    return result;
  }

  function todayRecord(record) {
    if (!record) return false;
    var date = record.date || record.day || record.scheduledFor || record.at;
    return !date || String(date).slice(0, 10) === today();
  }

  function scheduledWorkout(s) {
    var candidates = [s.todayWorkout, s.scheduledWorkout, s.workoutForToday, s.todayTemplate, s.workoutTemplate];
    var schedule = s.workoutSchedule || s.schedule;
    if (schedule && typeof schedule === 'object') candidates.push(schedule[today()], schedule[new Date().getDay()], schedule[new Date().toLocaleDateString('en-US', { weekday: 'long' })]);
    for (var i = 0; i < candidates.length; i += 1) {
      var candidate = candidates[i];
      if (!candidate || (typeof candidate === 'object' && !todayRecord(candidate))) continue;
      if (typeof candidate === 'string') return { name: candidate, detail: 'Scheduled workout for today' };
      return { name: candidate.name || candidate.title || candidate.template || 'Today\'s workout', detail: candidate.detail || candidate.description || (Array.isArray(candidate.items) ? candidate.items.join(', ') : 'Scheduled workout for today') };
    }
    return null;
  }

  function habitItems(s, items) {
    var habits = s.habits && typeof s.habits === 'object' && !Array.isArray(s.habits) ? s.habits : {};
    var meta = s.habitMeta && typeof s.habitMeta === 'object' ? s.habitMeta : {};
    var names = Array.isArray(items) ? items : Object.keys(habits);
    return names.map(function (name) {
      var checked = habits[name] === true || (meta[name] && meta[name].lastCheckDate === today());
      return { name: name, checked: checked };
    });
  }

  function checkInItems(s) {
    var result = [];
    var advanced = s.advanced || {};
    var collections = [
      ['test', s.tests || s.testCheckIns || advanced.tests || advanced.checkIns],
      ['arc', s.arcCheckIns || s.arcs || advanced.arcCheckIns || advanced.arcs]
    ];
    collections.forEach(function (entry) {
      var list = entry[1];
      if (!Array.isArray(list)) return;
      list.filter(todayRecord).slice(0, 2).forEach(function (record) {
        var title = record.title || record.name || (entry[0] === 'test' ? 'Test check-in' : 'Arc check-in');
        result.push(item(entry[0] + '-' + title, title, record.detail || record.description || record.at || 'Upcoming check-in', 'advanced', false));
      });
    });
    return result;
  }

  function stackItems() {
    var s = state();
    var items = [];
    var workout = scheduledWorkout(s);
    var logs = Array.isArray(s.logs) ? s.logs : [];
    var meals = Array.isArray(s.meals) ? s.meals : [];
    var todayLogs = logs.filter(function (record) { return String(record.date || '').slice(0, 10) === today(); });
    var todayMeals = meals.filter(function (record) { return String(record.date || '').slice(0, 10) === today(); });
    var water = Math.max(0, Number(s.water) || 0);
    var fasting = s.fasting || {};
    var quests = typeof LI.getDailyQuests === 'function' ? (LI.getDailyQuests() || {}) : (s.quests || {});
    var habits = habitItems(s, window.LOCKED_DATA && window.LOCKED_DATA.habits);

    if (workout) items.push(item('workout', workout.name, workout.detail, 'train', todayLogs.some(function (record) { return record.type === 'workout' || record.area === 'train'; }), { kind: 'workout' }));
    else items.push(item('workout', 'No workout scheduled', 'Choose a template or open Train to plan today.', 'train', false));
    items.push(item('water', 'Water progress', water + ' / 8 glasses logged today', 'water-up', water >= 8, { amount: 1 }));
    if (fasting.active) {
      items.push(item('fasting', 'Fasting window active', 'Started ' + (fasting.startedAt ? new Date(fasting.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'today'), 'life', true));
    } else {
      items.push(item('fasting', 'Fasting window', 'No active fast. Log a completed window in Life when ready.', 'life', false));
    }
    Object.keys(quests || {}).forEach(function (key) {
      var quest = quests[key];
      if (quest && !quest.completed) items.push(item('quest-' + key, quest.title || 'Daily quest', (quest.progress || 0) + ' / ' + (quest.target || 1) + ' complete', 'squad', false, { quest: key }));
    });
    habits.filter(function (habit) { return !habit.checked; }).slice(0, 4).forEach(function (habit) {
      items.push(item('habit-' + habit.name, habit.name, 'Habit due today', 'life', false, { habit: habit.name }));
    });
    checkInItems(s).forEach(function (checkIn) { items.push(checkIn); });
    items.push(item('streak', 'Streak status', (Number(s.streak) || 0) + ' day' + ((Number(s.streak) || 0) === 1 ? '' : 's') + ' locked in', '', Number(s.streak) > 0));
    if (!items.length) items.push(item('empty', 'Your stack is clear', 'Create a workout, log a meal, or start a focus block to build today\'s signal.', 'dashboard', false));
    return items;
  }

  function renderStack() {
    if (route() !== 'dashboard') return;
    var page = $('.page');
    if (!page) return;
    var columns = $('.cols', page);
    var old = $('#todays-stack');
    if (old) old.remove();
    var items = stackItems();
    var html = `<section id="todays-stack" class="card ux-stack" aria-labelledby="todays-stack-title"><h3 id="todays-stack-title">TODAY'S STACK</h3><div class="ux-stack-list">`;
    items.forEach(function (entry) {
      html += `<div class="ux-stack-item${entry.done ? ' done' : ''}" data-stack-id="${esc(entry.id)}"><span><strong>${entry.done ? '✓ ' : ''}${esc(entry.title)}</strong><small>${esc(entry.detail)}</small></span>`;
      if (entry.action) {
        html += `<button class="btn" type="button" data-stack-action="${esc(entry.action)}"${entry.amount ? ` data-amount="${esc(entry.amount)}"` : ''}${entry.habit ? ` data-habit="${esc(entry.habit)}"` : ''}>Open</button>`;
      }
      html += '</div>';
    });
    html += '</div></section>';
    if (columns) columns.insertAdjacentHTML('afterbegin', html);
    else page.insertAdjacentHTML('afterbegin', html);
  }

  function renderPomodoro() {
    if (route() !== 'mind') return;
    var page = $('.page');
    if (!page) return;
    var cards = page.querySelectorAll('.card');
    var host = null;
    cards.forEach(function (card) {
      if (/focus cockpit/i.test(card.textContent) || $('.ux-timer', card)) host = card;
    });
    if (!host) return;
    var existing = $('.ux-timer', host);
    if (!existing) {
      host.insertAdjacentHTML('beforeend', `<div class="ux-timer" aria-label="Pomodoro timer"><div class="eyebrow">POMODORO</div><div class="ux-timer-time" data-pomo-time>${format(timer.remaining)}</div><div class="ux-timer-progress"><i data-pomo-progress></i></div><input data-pomo-subject placeholder="What are you focusing on?" value="${esc(timer.subject)}"><div class="ux-timer-actions"><button class="btn primary" type="button" data-pomo-start>${timer.running ? 'Pause' : (timer.remaining < timer.total ? 'Resume' : 'Start focus')}</button><button class="btn" type="button" data-pomo-cancel>Cancel</button></div></div>`);
    }
    paintTimer();
  }

  function emptyStates() {
    var page = $('.page');
    if (!page || route() === 'dashboard') return;
    var list = $('.list', page);
    if (list && !list.children.length) list.innerHTML = '<div class="ux-empty">Nothing logged here yet. Use the action above to create your first record.</div>';
  }

  function enhance() {
    addStyles();
    renderStack();
    renderPomodoro();
    emptyStates();
    paintTimer();
  }

  function openStackAction(button) {
    var action = button.getAttribute('data-stack-action');
    if (action === 'water-up') {
      if (typeof LI.waterIncrement === 'function') LI.waterIncrement(Number(button.dataset.amount) || 1);
      else if (typeof LI.act === 'function') LI.act('water-up', { dataset: { amount: button.dataset.amount || '1' } });
      window.setTimeout(enhance, 0);
      return;
    }
    if (action === 'life' && button.dataset.habit && typeof LI.toggleHabit === 'function') {
      LI.toggleHabit(button.dataset.habit);
      window.setTimeout(enhance, 0);
      return;
    }
    if (action === 'train' || action === 'squad' || action === 'advanced' || action === 'life') window.location.hash = action;
    else if (action === 'dashboard') window.location.hash = 'dashboard';
  }

  document.addEventListener('click', function (event) {
    var stackButton = event.target.closest && event.target.closest('[data-stack-action]');
    if (stackButton) {
      event.preventDefault();
      openStackAction(stackButton);
      return;
    }
    var start = event.target.closest && event.target.closest('[data-pomo-start]');
    if (start) {
      event.preventDefault();
      if (timer.running) pauseTimer(); else startTimer();
      return;
    }
    var cancel = event.target.closest && event.target.closest('[data-pomo-cancel], [data-pomo-reset]');
    if (cancel) {
      event.preventDefault();
      cancelTimer();
    }
  });

  document.addEventListener('input', function (event) {
    if (event.target.matches && event.target.matches('[data-pomo-subject]')) {
      timer.subject = event.target.value;
      saveTimer();
    }
  });

  window.addEventListener('hashchange', function () { window.setTimeout(enhance, 0); });
  document.addEventListener('DOMContentLoaded', function () { loadTimer(); enhance(); });
  loadTimer();
  if (document.readyState !== 'loading') window.setTimeout(enhance, 0);
  window.LockedInUX = { enhance: enhance, startTimer: startTimer, pauseTimer: pauseTimer, cancelTimer: cancelTimer };
}());
