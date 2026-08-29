(function () {
  'use strict';
  var app = window.LockedIn;
  if (!app) return;
  var habits = ['Morning movement', '2L water', 'Read 20 minutes', 'No phone in bed'];
  app.registerView('life', function () {
    var state = app.state();
    var rows = habits.map(function (habit) { var key = habit.toLowerCase(); var done = !!state.habits[key]; return '<button class="row ' + (done ? 'done' : '') + '" data-action="habit" data-habit="' + app.escape(key) + '"><span class="check">' + (done ? '✓' : '○') + '</span><strong>' + app.escape(habit) + '</strong><small>' + (done ? 'complete today' : 'mark complete') + '</small></button>'; }).join('');
    return '<section class="hero"><p class="eyebrow">IDENTITY & ENVIRONMENT</p><h1>Life</h1><p class="muted">Build the baseline that makes every other goal easier.</p></section><section class="card"><p class="eyebrow">DAILY HABITS</p><div class="stack-list">' + rows + '</div></section>';
  });
  app.registerAction('habit', function (node) { var key = node.getAttribute('data-habit'); var state = app.state(); state.habits[key] = !state.habits[key]; app.record('habit', { label: key, completed: state.habits[key] }); app.toast(state.habits[key] ? 'Habit locked in.' : 'Habit unchecked.'); });
}());
