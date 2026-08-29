(function () {
  'use strict';
  var app = window.LockedIn;
  if (!app) return;
  function enhance() {
    document.querySelectorAll('.card, .hero, .stat').forEach(function (node) { node.classList.add('is-ready'); });
  }
  window.LockedInUX = { enhance: enhance };
  document.addEventListener('keydown', function (event) { if (event.key === '/' && document.activeElement && !/input|textarea|select/i.test(document.activeElement.tagName)) { event.preventDefault(); var first = document.querySelector('main input'); if (first) first.focus(); } });
  enhance();
}());
