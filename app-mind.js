(function () {
  'use strict';
  var app = window.LockedIn;
  if (!app) return;
  app.registerView('mind', function () { var state = app.state(); var focus = state.logs.filter(function (item) { return item.type === 'focus'; }).length; return '<section class="hero"><p class="eyebrow">COGNITIVE ENGINE</p><h1>Mind</h1><p class="muted">Protect attention before you ask it to perform.</p></section><section class="stats-grid"><article class="stat"><span>FOCUS BLOCKS</span><strong>' + focus + '</strong></article><article class="stat"><span>GOAL</span><strong class="stat-text">' + app.escape(state.profile.goal) + '</strong></article></section><section class="card"><h2>Focus cockpit</h2><p class="muted">Start one distraction-free block. The win is showing up.</p><button class="btn primary" data-action="focus">Log focus block</button></section>'; });
}());
