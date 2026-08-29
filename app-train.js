(function () {
  'use strict';
  var app = window.LockedIn;
  if (!app) return;
  var exercises = ['Back squat', 'Bench press', 'Pull up', 'Deadlift', 'Plank'];
  app.registerView('train', function () { var state = app.state(); var sessions = state.logs.filter(function (item) { return item.type === 'workout'; }).length; var options = exercises.map(function (name) { return '<option>' + app.escape(name) + '</option>'; }).join(''); return '<section class="hero"><p class="eyebrow">PERFORMANCE LAB</p><h1>Train</h1><p class="muted">Track the work. Let consistency become evidence.</p></section><section class="grid-two"><form class="card" data-workout-form><h2>Quick training log</h2><label>Exercise <select name="exercise">' + options + '</select></label><label>Weight <input name="weight" type="number" min="0" placeholder="kg"></label><label>Sets <input name="sets" type="number" min="1" value="3"></label><button class="btn primary" type="submit">Log session</button></form><article class="card"><h2>Sessions</h2><p class="big-number">' + sessions + '</p><p class="muted">logged workouts</p></article></section>'; });
  document.addEventListener('submit', function (event) { if (!event.target.matches('[data-workout-form]')) return; event.preventDefault(); var form = new FormData(event.target); var state = app.state(); state.streak += 1; app.record('workout', { label: String(form.get('exercise') || 'Workout'), weight: Number(form.get('weight') || 0), sets: Number(form.get('sets') || 0) }); app.toast('Training logged. +10 XP'); });
}());
