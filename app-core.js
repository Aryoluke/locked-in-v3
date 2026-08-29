(function () {
  "use strict";

  const STORAGE_KEY = "locked-in-v3-state";
  const source = window.LOCKED_DATA || {};

  const DEFAULTS = {
    profile: {
      name: "Operator",
      goal: "strength, confidence, consistency",
      sex: "male",
      age: 25,
      height: 175,
      weight: 75,
      activity: 1.55
    },
    onboardingComplete: false,
    route: "dashboard",
    xp: 0,
    streak: 0,
    water: 0,
    logs: [],
    meals: [],
    exercises: [],
    templates: [],
    measurements: [],
    bodyScans: [],
    goals: [],
    habits: {},
    recipes: [],
    plans: [],
    groceries: [],
    supplements: [],
    focus: [],
    study: [],
    moods: [],
    journal: [],
    screenTime: [],
    lifeSkills: [],
    skincare: [],
    scars: [],
    schedule: [],
    quests: [],
    competitions: [],
    rankings: [],
    runs: [],
    arcs: [],
    glowup: [],
    reminders: [],
    notifications: [],
    privacy: { analytics: false, lock: false },
    settings: { compact: false },
    squad: {
      quests: [],
      freezes: 0,
      shop: [],
      friends: [],
      duels: [],
      reactions: [],
      badges: [],
      trophies: [],
      photos: [],
      sessions: [],
      leagues: [],
      raids: [],
      combos: 0
    }
  };

  let store = readState();
  const actions = {};
  const domains = {};
  const timer = { focus: 0, rest: 0, fast: null, focusId: null, restId: null };
  window.LIViews = window.LIViews || {};

  function copy(value) {
    if (Array.isArray(value)) return value.slice();
    if (value && typeof value === "object") return merge({}, value);
    return value;
  }

  function merge(base, extra) {
    const result = Array.isArray(base) ? base.slice() : Object.assign({}, base || {});
    Object.keys(extra || {}).forEach(function (key) {
      const value = extra[key];
      if (Array.isArray(value)) {
        result[key] = value.slice();
      } else if (value && typeof value === "object") {
        result[key] = merge(result[key] && typeof result[key] === "object" ? result[key] : {}, value);
      } else if (value !== undefined) {
        result[key] = value;
      }
    });
    return result;
  }

  function normalize(value) {
    const next = merge(DEFAULTS, value || {});
    const arrays = [
      "logs", "meals", "exercises", "templates", "measurements", "bodyScans",
      "goals", "recipes", "plans", "groceries", "supplements", "focus", "study",
      "moods", "journal", "screenTime", "lifeSkills", "skincare", "scars", "schedule",
      "quests", "competitions", "rankings", "runs", "arcs", "glowup", "reminders", "notifications"
    ];
    arrays.forEach(function (key) {
      if (!Array.isArray(next[key])) next[key] = [];
    });
    if (!next.habits || typeof next.habits !== "object" || Array.isArray(next.habits)) next.habits = {};
    if (!next.squad || typeof next.squad !== "object") next.squad = copy(DEFAULTS.squad);
    if (!Array.isArray(next.squad.quests)) next.squad.quests = [];
    if (!Array.isArray(next.quests) || next.quests.length === 0) next.quests = next.squad.quests;
    next.squad.quests = next.quests;
    return next;
  }

  function readState() {
    try {
      return normalize(JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"));
    } catch (error) {
      return normalize({});
    }
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
      const status = document.getElementById("save-status");
      if (status) status.textContent = "Saved locally " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (error) {
      const status = document.getElementById("save-status");
      if (status) status.textContent = "Local save unavailable";
    }
  }

  function escapeHtml(value) {
    return String(value === null || value === undefined ? "" : value).replace(/[&<>"']/g, function (character) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[character];
    });
  }

  function number(value, fallback) {
    const result = Number(value);
    return Number.isFinite(result) ? result : (fallback || 0);
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function uid(prefix) {
    return (prefix || "id") + "-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 8);
  }

  function state() {
    return store;
  }

  function toast(message) {
    const node = document.getElementById("toast");
    if (!node) return;
    node.textContent = message;
    node.hidden = false;
    clearTimeout(node._hideTimer);
    node._hideTimer = setTimeout(function () {
      node.hidden = true;
    }, 2400);
  }

  function awardXP(amount) {
    store.xp = Math.max(0, number(store.xp) + number(amount));
  }

  function record(type, details) {
    store.logs.push(Object.assign({
      id: uid(type),
      type: type,
      date: today(),
      timestamp: new Date().toISOString()
    }, details || {}));
    awardXP(10);
    save();
    render();
  }

  function addCreatine(dose, timing) {
    store.supplements.push({
      id: uid("supplement"),
      name: "Creatine monohydrate",
      dose: dose || "5g",
      timing: timing || "daily",
      date: today()
    });
    record("supplement", { label: "Creatine logged" });
    toast("Creatine logged");
  }

  function metric(label, value, note) {
    return `<article class="stat"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><small>${escapeHtml(note || "")}</small></article>`;
  }

  function card(title, body) {
    return `<article class="card"><h2>${escapeHtml(title)}</h2>${body}</article>`;
  }

  function heading(eyebrow, title, description) {
    return `<section class="hero"><div><p class="eyebrow">${escapeHtml(eyebrow)}</p><h1>${escapeHtml(title)}</h1><p class="muted">${escapeHtml(description)}</p></div></section>`;
  }

  function logRows(items) {
    if (!items.length) return `<p class="empty">Nothing logged yet. Choose one small action.</p>`;
    return `<div class="stack-list">${items.slice().reverse().slice(0, 10).map(function (item) {
      return `<div class="stack-row"><div><strong>${escapeHtml(item.label || item.type || "Entry")}</strong><small>${escapeHtml(item.date || item.created || "")}</small></div><span class="muted">${escapeHtml(item.type || "log")}</span></div>`;
    }).join("")}</div>`;
  }

  function habitsMarkup() {
    const habits = Array.isArray(source.habits) && source.habits.length ? source.habits : ["Train or walk", "2L water", "Read 20 minutes", "Morning skincare", "No phone in bed"];
    return `<div class="stack-list">${habits.map(function (habit) {
      const key = String(habit).toLowerCase();
      const done = Boolean(store.habits[key]);
      return `<button class="stack-row ${done ? "done" : ""}" data-action="habit" data-habit="${escapeHtml(key)}"><span class="check">${done ? "✓" : "○"}</span><strong>${escapeHtml(habit)}</strong><small>${done ? "complete today" : "mark complete"}</small></button>`;
    }).join("")}</div>`;
  }

  function dashboard() {
    const profile = store.profile || DEFAULTS.profile;
    return heading("TODAY'S OPERATING SYSTEM", "Stay locked in, " + (profile.name || "Operator") + ".", "Small actions compound. Every form writes real data to this device.") +
      `<section class="stats-grid">${metric("XP", store.xp, "local progress")}${metric("STREAK", store.streak, "days")}${metric("WATER", store.water + "/8", "glasses")}${metric("LOGS", store.logs.length, "total")}</section>` +
      `<section class="grid-two">${card("Quick actions", `<div class="action-grid"><button class="btn primary" data-action="water">Log water</button><button class="btn" data-route="train">Log workout</button><button class="btn" data-action="focus-start">Start focus</button><button class="btn" data-route="nutrition">Log meal</button><button class="btn" data-action="creatine">Log creatine</button></div>`)}${card("Recent activity", logRows(store.logs))}</section>` +
      `<section class="grid-two">${card("Today's checklist", habitsMarkup())}${card("Quest board", store.quests.length ? logRows(store.quests.map(function (quest) { return { label: quest.name, type: quest.done ? "complete" : "open", date: quest.due }; })) : `<p class="empty">No quests yet. Open Squad to create an accountability target.</p>`)}</section>`;
  }

  function fallback(route, title, copyText) {
    return heading(route.toUpperCase(), title, copyText) + card("Module ready", `<p class="muted">This route is available. Its feature script can register a richer view without changing the core contract.</p><button class="btn" data-route="dashboard">Back to dashboard</button>`);
  }

  function registerView(name, view) {
    if (typeof view !== "function") return;
    window.LIViews[name] = view;
    views[name] = view;
  }

  const views = window.LIViews;
  registerView("dashboard", dashboard);
  registerView("train", function () { return fallback("train", "Train", "Performance is built from repeatable sessions."); });
  registerView("nutrition", function () { return fallback("nutrition", "Nutrition", "Record the next meal, not a perfect plan."); });
  registerView("mind", function () { return fallback("mind", "Mind", "Protect attention before you ask it to perform."); });
  registerView("life", function () { return fallback("life", "Life", "Build the baseline that makes every other goal easier."); });
  registerView("squad", function () { return fallback("squad", "Squad", "Accountability is a force multiplier."); });
  registerView("advanced", function () { return fallback("advanced", "Control room", "Your state is local-first and exportable."); });

  function registerAction(name, handler) {
    if (typeof handler === "function") actions[name] = handler;
  }

  function collectionAt(path) {
    return path.split(".").reduce(function (value, key) {
      return value && value[key];
    }, store);
  }

  function deleteEntry(node) {
    const collection = collectionAt(node.getAttribute("data-collection") || "logs");
    const id = node.getAttribute("data-id");
    if (!Array.isArray(collection)) return;
    const index = collection.findIndex(function (item) { return item && item.id === id; });
    if (index >= 0) collection.splice(index, 1);
    save();
    toast("Entry deleted");
  }

  function exportState() {
    const blob = new Blob([JSON.stringify(store, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "locked-in-v3-backup-" + today() + ".json";
    link.click();
    URL.revokeObjectURL(link.href);
    toast("Export ready");
  }

  function resetState() {
    if (!window.confirm("Reset all local progress?")) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch (error) {}
    store = normalize({});
    save();
    render();
    toast("Local progress reset");
  }

  registerAction("water", function () {
    store.water = Math.min(8, number(store.water) + 1);
    record("water", { label: "Water glass" });
    toast("Hydration logged");
  });

  registerAction("habit", function (node) {
    const key = node.getAttribute("data-habit");
    store.habits[key] = !store.habits[key];
    record("habit", { label: key, completed: store.habits[key] });
    toast(store.habits[key] ? "Habit locked in" : "Habit unchecked");
  });

  registerAction("delete", deleteEntry);

  registerAction("focus-start", function () {
    timer.focus = timer.focus || 1500;
    clearInterval(timer.focusId);
    timer.focusId = setInterval(function () {
      if (timer.focus > 0) timer.focus -= 1;
      if (timer.focus <= 0) clearInterval(timer.focusId);
      render();
    }, 1000);
    toast("Focus block started");
  });

  registerAction("focus-add", function () {
    timer.focus += 300;
    toast("Five minutes added");
  });

  registerAction("focus-stop", function () {
    clearInterval(timer.focusId);
    if (timer.focus > 0) {
      store.focus.push({ id: uid("focus"), task: "Focus block", minutes: Math.round((1500 - timer.focus) / 60), date: today() });
      record("focus", { label: "Focus block" });
    }
    timer.focus = 0;
    toast("Focus block saved");
  });

  registerAction("rest-start", function () {
    timer.rest = 90;
    clearInterval(timer.restId);
    timer.restId = setInterval(function () {
      if (timer.rest > 0) timer.rest -= 1;
      if (timer.rest <= 0) clearInterval(timer.restId);
      render();
    }, 1000);
  });

  registerAction("rest-add", function () { timer.rest += 30; });
  registerAction("rest-stop", function () { clearInterval(timer.restId); timer.rest = 0; render(); });
  registerAction("fast-start", function () { timer.fast = Date.now(); toast("Fast started"); });
  registerAction("fast-stop", function () { timer.fast = null; toast("Fast stopped"); });
  registerAction("creatine", function () { addCreatine(); });

  registerAction("freeze", function () {
    if (store.xp < 100) return toast("Need 100 XP");
    store.xp -= 100;
    store.squad.freezes += 1;
    save();
    toast("Streak freeze purchased");
  });

  registerAction("badge", function () {
    if (store.xp < 250 || store.squad.badges.indexOf("consistency") >= 0) return toast("Need 250 XP or badge already claimed");
    store.xp -= 250;
    store.squad.badges.push("consistency");
    save();
    toast("Consistency badge unlocked");
  });

  registerAction("export", exportState);
  registerAction("reset", resetState);

  function render() {
    const root = document.getElementById("app");
    if (!root) return;
    const requested = (window.location.hash || "#dashboard").slice(1) || "dashboard";
    const route = views[requested] ? requested : "dashboard";
    store.route = route;
    root.innerHTML = views[route](store);
    document.querySelectorAll("[data-route]").forEach(function (node) {
      node.classList.toggle("active", node.getAttribute("data-route") === route);
    });
    const onboarding = document.getElementById("onboarding");
    if (onboarding) onboarding.hidden = Boolean(store.onboardingComplete);
    const focusNode = document.querySelector("[data-focus]");
    if (focusNode) focusNode.textContent = formatTime(timer.focus);
    const restNode = document.querySelector("[data-rest]");
    if (restNode) restNode.textContent = formatTime(timer.rest);
    const fastNode = document.querySelector("[data-fast]");
    if (fastNode) fastNode.textContent = timer.fast ? "Fasting " + Math.floor((Date.now() - timer.fast) / 3600000) + "h" : "Not fasting";
  }

  function formatTime(seconds) {
    const value = Math.max(0, number(seconds));
    return String(Math.floor(value / 60)).padStart(2, "0") + ":" + String(value % 60).padStart(2, "0");
  }

  function routeTo(route) {
    window.location.hash = route || "dashboard";
  }

  function handleAction(node) {
    const name = node.getAttribute("data-action");
    const handler = actions[name];
    if (!handler) return;
    handler(node);
    save();
    render();
  }

  document.addEventListener("click", function (event) {
    const routeNode = event.target.closest("[data-route]");
    if (routeNode) {
      event.preventDefault();
      routeTo(routeNode.getAttribute("data-route"));
      return;
    }
    const actionNode = event.target.closest("[data-action]");
    if (actionNode) {
      event.preventDefault();
      handleAction(actionNode);
    }
  });

  document.addEventListener("submit", function (event) {
    const form = event.target;
    if (!form || form.id !== "onboarding-form") return;
    event.preventDefault();
    const data = new FormData(form);
    store.profile.name = String(data.get("name") || "Operator").trim() || "Operator";
    store.profile.goal = String(data.get("goal") || store.profile.goal);
    store.onboardingComplete = true;
    save();
    render();
    toast("Setup complete");
  });

  document.addEventListener("click", function (event) {
    const skip = event.target.closest("[data-onboarding-skip]");
    if (!skip) return;
    store.onboardingComplete = true;
    save();
    render();
  });

  window.addEventListener("hashchange", render);

  const api = {
    state: state,
    save: save,
    toast: toast,
    escape: escapeHtml,
    esc: escapeHtml,
    num: number,
    record: record,
    render: render,
    registerView: registerView,
    registerAction: registerAction,
    registerDomain: function (name, values) { domains[name] = (domains[name] || []).concat(values || []); },
    awardXP: awardXP,
    addCreatine: addCreatine,
    route: routeTo,
    actions: actions,
    views: views,
    source: source
  };

  window.app = api;
  window.LockedIn = api;
  window.esc = escapeHtml;
  window.num = number;
  window.save = save;
  window.toast = toast;
  window.awardXP = awardXP;
  window.addCreatine = addCreatine;
  window.state = state;

  function start() {
    save();
    render();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
