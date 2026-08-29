(function () {
  'use strict';
  var app = window.LockedIn;
  if (!app) return;
  app.registerView('advanced', function () { return '<section class="hero"><p class="eyebrow">CONTROL ROOM</p><h1>Advanced</h1><p class="muted">Your state is local-first. Export a backup or clear this device.</p></section><section class="card action-grid"><button class="btn primary" data-action="export">Export JSON</button><button class="btn danger" data-action="reset">Reset local progress</button></section>'; });
}());
