(function () {
  "use strict";

  var SENT_KEY = "locked-in-v3-reminder-log";
  var CHECK_INTERVAL = 30 * 1000;
  var REMINDERS = [
    {
      id: "morning",
      hour: 9,
      minute: 0,
      title: "LOCKED IN — Morning check",
      body: "Start one small action: train, eat, or focus."
    },
    {
      id: "midday",
      hour: 13,
      minute: 0,
      title: "LOCKED IN — Midday check",
      body: "Keep the streak alive with the next useful action."
    },
    {
      id: "evening",
      hour: 20,
      minute: 0,
      title: "LOCKED IN — Evening check",
      body: "Close the loop and log what moved you forward today."
    }
  ];

  function canNotify() {
    return window.isSecureContext && "Notification" in window;
  }

  function requestPermission() {
    if (!canNotify()) return Promise.resolve("unsupported");
    if (Notification.permission !== "default") {
      return Promise.resolve(Notification.permission);
    }
    return Notification.requestPermission().catch(function () {
      return "denied";
    });
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("./sw.js").catch(function () {
      // The app remains fully usable when service-worker registration is unavailable.
    });
  }

  function readSent() {
    try {
      var raw = window.localStorage.getItem(SENT_KEY);
      var value = raw ? JSON.parse(raw) : {};
      return value && typeof value === "object" ? value : {};
    } catch (error) {
      return {};
    }
  }

  function writeSent(sent) {
    try {
      window.localStorage.setItem(SENT_KEY, JSON.stringify(sent));
    } catch (error) {
      // Reminder delivery must never interfere with the app's existing state store.
    }
  }

  function dateKey(date) {
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
  }

  function pendingQuestName() {
    try {
      var api = window.app;
      var state = api && typeof api.state === "function" ? api.state() : null;
      var quests = state && Array.isArray(state.quests) ? state.quests : [];
      var pending = quests.find(function (quest) { return quest && !quest.done; });
      return pending && pending.name ? pending.name : "your next daily quest";
    } catch (error) {
      return "your next daily quest";
    }
  }

  function sendReminder(reminder, key) {
    if (!canNotify() || Notification.permission !== "granted") return false;
    var body = reminder.body + " Try: " + pendingQuestName() + ".";
    try {
      new Notification(reminder.title, {
        body: body,
        tag: "locked-in-v3-" + key,
        renotify: false
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  function checkReminders() {
    if (!canNotify() || Notification.permission !== "granted") return;

    var now = new Date();
    var today = dateKey(now);
    var sent = readSent();
    var changed = false;

    REMINDERS.forEach(function (reminder) {
      var due = new Date(now);
      due.setHours(reminder.hour, reminder.minute, 0, 0);
      var key = today + ":" + reminder.id;
      var elapsed = now.getTime() - due.getTime();
      if (elapsed >= 0 && elapsed < CHECK_INTERVAL + 15000 && !sent[key] && sendReminder(reminder, key)) {
        sent[key] = now.toISOString();
        changed = true;
      }
    });

    Object.keys(sent).forEach(function (key) {
      if (key.slice(0, 10) < dateKey(new Date(now.getTime() - 7 * 86400000))) {
        delete sent[key];
        changed = true;
      }
    });
    if (changed) writeSent(sent);
  }

  function start() {
    registerServiceWorker();
    window.setInterval(checkReminders, CHECK_INTERVAL);
    window.addEventListener("focus", checkReminders);
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") checkReminders();
    });

    // Permission is requested from the first user gesture instead of on page load.
    document.addEventListener("click", function () {
      requestPermission().then(function (permission) {
        if (permission === "granted") checkReminders();
      });
    }, { once: true, passive: true });
  }

  window.LockedInReminders = {
    requestPermission: requestPermission,
    check: checkReminders
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
}());
