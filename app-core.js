(function () {
  'use strict';

  var STORAGE_KEY = 'locked-in-v3-state';
  var source = window.LOCKED_DATA || {};
  var defaults = {
    profile: { name: 'Operator', goal: 'strength, confidence, consistency' },
    onboardingComplete: false,
    route: 'dashboard',
    xp: 0,
    streak: 0,
    water: 0,
    logs: [],
    habits: {},
    meals: [],
    quests: {}
  };
  var state = readState();
  var views = {};
  var actions = {};

  function readState() {
    var saved = null;
    try { saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null'); } catch (error) { saved = null; }
    return merge(defaults, saved || {});
  }

  function merge(base, extra) {
    var result = {};
    Object.keys(base).forEach(function (key) {
      var value = base[key];
      result[key] = value && typeof value === 'object' && !Array.isArray(value) ? merge(value, {}) : value;
    });
    Object.keys(extra || {}).forEach(function (key) {
      result[key] = extra[key];
    });
    return result;
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function today() { return new Date().toISOString().slice(0, 10); }
  function save() {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (error) { /* offline storage may be unavailable */ }
    var status = document.getElementById('save-status');
    if (status) status.textContent = 'Saved locally';
  }
  function toast(message) {
    var node = document.getElementById('toast');
    if (!node) return;
    node.textContent = message;
    node.hidden = false;
    window.clearTimeout(node._timer);
    node._timer = window.setTimeout(function () { node.hidden = true; }, 2400);
  }
  function registerView(name, renderView) { views[name] = renderView; }
  function registerAction(name, handler) { actions[name] = handler; }
  function record(type, payload) {
    state.logs.push(Object.assign({ type: type, date: today(), timestamp: new Date().toISOString() }, payload || {}));
    state.xp += 10;
    save();
    render();
  }

  function dashboard() {
    var recent = state.logs.slice(-5).reverse();
    var logHtml = recent.length ? recent.map(function (item) {
      return '<li><strong>' + escapeHtml(item.type) + '</strong><span>' + escapeHtml(item.label || item.detail || item.date) + '</span></li>';
    }).join('') : '<li class="muted">No activity yet. Choose one action and start.</li>';
    return '<section class="hero"><p class="eyebrow">TODAY\'S OPERATING SYSTEM</p><h1>Stay locked in, ' + escapeHtml(state.profile.name || 'Operator') + '.</h1><p class="muted">Small actions compound. Everything here works offline and saves to this device.</p></section>' +
      '<section class="stats-grid"><article class="stat"><span>XP</span><strong>' + state.xp + '</strong></article><article class="stat"><span>STREAK</span><strong>' + state.streak + '</strong><small>days</small></article><article class="stat"><span>WATER</span><strong>' + state.water + '/8</strong><small>glasses</small></article><article class="stat"><span>LOGS</span><strong>' + state.logs.length + '</strong><small>total</small></article></section>' +
      '<section class="grid-two"><article class="card"><p class="eyebrow">QUICK ACTIONS</p><h2>Move the needle</h2><div class="action-grid"><button class="btn primary" data-action="water">Log water</button><button class="btn" data-action="workout">Log workout</button><button class="btn" data-action="focus">Start focus</button><button class="btn" data-route="nutrition">Log a meal</button></div></article><article class="card"><p class="eyebrow">RECENT</p><h2>Activity feed</h2><ul class="activity-list">' + logHtml + '</ul></article></section>';
  }

  function render() {
    var route = (window.location.hash || '#dashboard').slice(1) || 'dashboard';
    if (!views[route]) route = 'dashboard';
    state.route = route;
    document.querySelectorAll('[data-route]').forEach(function (node) { node.classList.toggle('active', node.getAttribute('data-route') === route); });
    var app = document.getElementById('app');
    if (app) { app.innerHTML = views[route](); app.focus({ preventScroll: true }); }
    var onboarding = document.getElementById('onboarding');
    if (onboarding) onboarding.hidden = !!state.onboardingComplete;
    if (window.LockedInUX && typeof window.LockedInUX.enhance === 'function') window.LockedInUX.enhance();
  }

  function finishOnboarding(profile) {
    state.profile = Object.assign({}, state.profile, profile || {});
    state.onboardingComplete = true;
    state.route = 'dashboard';
    save();
    window.location.hash = 'dashboard';
    render();
    toast('Setup complete. Dashboard unlocked.');
  }

  function reset() {
    state = merge(defaults, {});
    save();
    finishOnboarding({ name: 'Operator', goal: 'strength, confidence, consistency' });
    toast('Local progress reset.');
  }

  views.dashboard = dashboard;
  views.advanced = function () { return '<section class="hero"><p class="eyebrow">CONTROL ROOM</p><h1>Advanced</h1><p class="muted">Export or reset the state stored on this device.</p></section><section class="card action-grid"><button class="btn primary" data-action="export">Export JSON</button><button class="btn danger" data-action="reset">Reset local progress</button></section>'; };
  window.LockedIn = {
    state: function () { return state; },
    escape: escapeHtml,
    save: save,
    toast: toast,
    record: record,
    render: render,
    registerView: registerView,
    registerAction: registerAction,
    reset: reset,
    source: source
  };
  registerAction('water', function () { state.water = Math.min(8, Number(state.water || 0) + 1); record('water', { label: 'Water logged' }); toast('Hydration logged.'); });
  registerAction('workout', function () { state.streak += 1; record('workout', { label: 'Workout logged' }); toast('Workout logged. +10 XP'); });
  registerAction('focus', function () { record('focus', { label: 'Focus block started' }); toast('Focus block logged.'); });
  document.addEventListener('click', function (event) {
    var routeNode = event.target.closest && event.target.closest('[data-route]');
    if (routeNode) { event.preventDefault(); window.location.hash = routeNode.getAttribute('data-route'); return; }
    var actionNode = event.target.closest && event.target.closest('[data-action]');
    if (actionNode) { event.preventDefault(); var action = actions[actionNode.getAttribute('data-action')]; if (action) action(actionNode); }
  });
  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('onboarding-form');
    var skip = document.querySelector('[data-onboarding-skip]');
    if (form) form.addEventListener('submit', function (event) { event.preventDefault(); var data = new FormData(form); finishOnboarding({ name: String(data.get('name') || 'Operator').trim(), goal: String(data.get('goal') || defaults.profile.goal).trim() }); });
    if (skip) skip.addEventListener('click', function () { finishOnboarding({}); });
    views.dashboard = dashboard;
    render();
  });
  window.addEventListener('hashchange', render);
  registerAction('export', function () {
    var blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    var link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'locked-in-v3.json'; link.click(); URL.revokeObjectURL(link.href);
    toast('Export ready.');
  });
  registerAction('reset', function () { if (window.confirm('Reset all local progress?')) reset(); });
}());
