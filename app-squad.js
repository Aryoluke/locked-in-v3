(function () {
  'use strict';
  var app = window.LockedIn;
  if (!app) return;
  var quests = ['Send one useful message', 'Ask for accountability', 'Celebrate someone else'];
  app.registerView('squad', function () { var state = app.state(); var html = quests.map(function (quest, index) { var key = 'quest-' + index; var done = !!state.quests[key]; return '<button class="row ' + (done ? 'done' : '') + '" data-action="quest" data-quest="' + key + '"><span class="check">' + (done ? '✓' : '○') + '</span><strong>' + app.escape(quest) + '</strong><small>' + (done ? 'complete' : 'open quest') + '</small></button>'; }).join(''); return '<section class="hero"><p class="eyebrow">COMPETE WITH YOURSELF</p><h1>Squad</h1><p class="muted">Accountability is a force multiplier.</p></section><section class="card"><p class="eyebrow">DAILY QUESTS</p><div class="stack-list">' + html + '</div></section>'; });
  app.registerAction('quest', function (node) { var key = node.getAttribute('data-quest'); var state = app.state(); state.quests[key] = !state.quests[key]; app.record('quest', { label: key, completed: state.quests[key] }); app.toast(state.quests[key] ? 'Quest complete. +10 XP' : 'Quest reopened.'); });
}());
