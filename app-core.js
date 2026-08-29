(function () {
  "use strict";
  const storageKey = "locked-in-v3-state";
  const viewMap = new Map();
  const actionMap = new Map();
  let store = makeState();
  let toastTimer = null;
  window.LIViews = window.LIViews || {};

  function makeState() {
    return { profile: { name: "Operator", age: "", dob: "", height: "", weight: "", bodyType: "", diet: "", equipment: "", goals: "" }, onboardingComplete: false, route: "dashboard", xp: 0, streak: 0, water: 0, logs: new Array(), meals: new Array(), exercises: new Array(), study: new Array(), habits: new Object(), quests: dailyQuests(), creatine: new Array(), feed: new Array() };
  }

  function dailyQuests() {
    const list = new Array();
    list.push({ id: "quest-workout", name: "Log a workout", type: "workout", done: false, date: today() });
    list.push({ id: "quest-meal", name: "Log a meal", type: "meal", done: false, date: today() });
    list.push({ id: "quest-focus", name: "Complete a focus block", type: "study", done: false, date: today() });
    return list;
  }

  function numberValue(value, fallback) {
    const result = Number(value);
    return Number.isFinite(result) ? result : fallback;
  }

  function copyList(value) {
    return Array.isArray(value) ? value.slice() : new Array();
  }

  function normalize(value) {
    const source = value && typeof value === "object" ? value : new Object();
    const result = makeState();
    const profile = source.profile && typeof source.profile === "object" ? source.profile : new Object();
    result.profile = Object.assign(result.profile, profile);
    result.onboardingComplete = Boolean(source.onboardingComplete);
    result.route = typeof source.route === "string" ? source.route : "dashboard";
    result.xp = numberValue(source.xp, 0);
    result.streak = numberValue(source.streak, 0);
    result.water = numberValue(source.water, 0);
    result.logs = copyList(source.logs);
    result.meals = copyList(source.meals);
    result.exercises = copyList(source.exercises);
    result.study = copyList(source.study);
    result.habits = source.habits && typeof source.habits === "object" ? Object.assign(new Object(), source.habits) : new Object();
    result.creatine = copyList(source.creatine);
    result.feed = copyList(source.feed);
    result.quests = freshQuests(source.quests) ? source.quests : dailyQuests();
    return result;
  }

  function freshQuests(value) {
    return Array.isArray(value) && value.length === 3 && value.every(function (item) { return item && item.date === today(); });
  }

  function loadState() {
    try {
      const raw = window.localStorage.getItem(storageKey);
      return normalize(raw ? JSON.parse(raw) : new Object());
    } catch (error) {
      return makeState();
    }
  }

  function setSaveStatus(text) {
    const node = document.getElementById("save-status");
    if (node) node.textContent = text;
  }

  function saveState() {
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(store));
      setSaveStatus("Saved locally");
    } catch (error) {
      setSaveStatus("Local save unavailable");
    }
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function uniqueId(prefix) {
    return (prefix || "id") + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
  }

  function escapeHtml(value) {
    return String(value === null || value === undefined ? "" : value).split("&").join("&amp;").split("<").join("&lt;").split(">").join("&gt;").split('"').join("&quot;").split("'").join("&#39;");
  }

  function toast(message) {
    const node = document.getElementById("toast");
    if (!node) return;
    node.textContent = message;
    node.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { node.hidden = true; }, 2400);
  }

  function addFeed(label, detail) {
    store.feed.unshift({ id: uniqueId("feed"), label: label, detail: detail || "", date: today() });
    store.feed = store.feed.slice(0, 30);
  }

  function awardXp(amount, reason) {
    const points = numberValue(amount, 0);
    store.xp = Math.max(0, numberValue(store.xp, 0) + points);
    if (points > 0) addFeed("+" + points + " XP", reason || "Progress recorded");
  }

  function completeQuest(type) {
    const quest = store.quests.find(function (item) { return item.type === type && !item.done; });
    if (!quest) return;
    quest.done = true;
    addFeed("Quest complete", quest.name);
    awardXp(15, quest.name);
  }

  function recordEvent(type, details) {
    const entry = Object.assign({ id: uniqueId(type), type: type, date: today(), timestamp: new Date().toISOString() }, details || new Object());
    store.logs.unshift(entry);
    store.logs = store.logs.slice(0, 100);
    return entry;
  }

  function record(type, details) {
    const entry = recordEvent(type, details);
    awardXp(10, entry.label || type + " logged");
    completeQuest(type);
    saveState();
    render();
    return entry;
  }

  function addCreatine(dose, timing) {
    const entry = { id: uniqueId("creatine"), name: "Creatine monohydrate", dose: dose || "5g", timing: timing || "daily", date: today() };
    store.creatine.unshift(entry);
    recordEvent("supplement", { label: "Creatine logged", detail: entry.dose });
    awardXp(2, "Creatine logged");
    saveState();
    render();
    toast("Creatine logged");
    return entry;
  }

  function metric(label, value, note) {
    return "<article class='stat'><span>" + escapeHtml(label) + "</span><strong>" + escapeHtml(value) + "</strong><small>" + escapeHtml(note) + "</small></article>";
  }

  function card(title, body) {
    return "<article class='card'><h2>" + escapeHtml(title) + "</h2>" + body + "</article>";
  }

  function hero(kicker, title, text) {
    return "<section class='hero'><p class='eyebrow'>" + escapeHtml(kicker) + "</p><h1>" + escapeHtml(title) + "</h1><p class='muted'>" + escapeHtml(text) + "</p></section>";
  }

  function listMarkup(items) {
    if (!items.length) return "<p class='empty'>Nothing logged yet. Choose one small action.</p>";
    return "<div class='activity-list'>" + items.slice(0, 8).map(function (item) { return "<div class='activity-row'><div><strong>" + escapeHtml(item.label || item.name || item.type || "Entry") + "</strong><small>" + escapeHtml(item.detail || item.date || "") + "</small></div><span class='muted'>" + escapeHtml(item.type || "log") + "</span></div>"; }).join("") + "</div>";
  }

  function questMarkup() {
    return "<div class='check-list'>" + store.quests.map(function (quest) { return "<div class='check-row " + (quest.done ? "done" : "") + "'><span>" + (quest.done ? "Done" : "Open") + "</span><strong>" + escapeHtml(quest.name) + "</strong><small>" + escapeHtml(quest.type) + "</small></div>"; }).join("") + "</div>";
  }

  function habitMarkup() {
    const names = new Array();
    names.push("Train or walk");
    names.push("2L water");
    names.push("Read 20 minutes");
    names.push("Morning skincare");
    names.push("No phone in bed");
    return "<div class='check-list'>" + names.map(function (name) { const key = name.toLowerCase(); const done = Boolean(store.habits[key]); return "<button class='check-row " + (done ? "done" : "") + "' data-action='habit' data-habit='" + escapeHtml(key) + "'><span>" + (done ? "Done" : "Open") + "</span><strong>" + escapeHtml(name) + "</strong><small>" + (done ? "complete today" : "mark complete") + "</small></button>"; }).join("") + "</div>";
  }

  function quickMarkup() {
    return "<div class='action-grid'><button class='btn primary' data-action='water'>Log water</button><button class='btn' data-action='workout'>Log workout</button><button class='btn' data-action='meal'>Log meal</button><button class='btn' data-action='study'>Log study</button><button class='btn' data-action='habit'>Complete habit</button><button class='btn' data-action='creatine'>Log creatine</button><button class='btn' data-action='export'>Export state</button><button class='btn' data-action='import'>Import state</button><button class='btn danger' data-action='reset'>Reset</button></div><input id='import-file' type='file' accept='application/json' hidden>";
  }

  function dashboard() {
    const name = store.profile.name || "Operator";
    const feed = store.feed.length ? store.feed : store.logs;
    return hero("TODAY'S OPERATING SYSTEM", "Stay locked in, " + name + ".", "Small actions compound. Every form writes real data to this device.") + "<section class='stats-grid'>" + metric("XP", store.xp, "local progress") + metric("STREAK", store.streak, "days") + metric("WATER", store.water + "/8", "glasses") + metric("LOGS", store.logs.length, "total") + "</section><section class='grid-two'>" + card("Quick actions", quickMarkup()) + card("Today Stack", "<p class='muted'>Three daily quests keep the next move obvious.</p>" + questMarkup()) + card("Recent activity", listMarkup(feed)) + card("Checklist", habitMarkup()) + "</section>";
  }

  function fallback(route, title, text) {
    return hero(route.toUpperCase(), title, text) + card("Module ready", "<p class='muted'>This route is available. Its feature script can register a richer view without changing the core contract.</p><button class='btn' data-route='dashboard'>Back to dashboard</button>");
  }

  function registerView(name, view) {
    if (typeof view !== "function") return;
    viewMap.set(name, view);
    Object.defineProperty(window.LIViews, name, { value: view, writable: true, configurable: true, enumerable: true });
  }

  function registerAction(name, handler) {
    if (typeof handler === "function") actionMap.set(name, handler);
  }

  function routeTo(route) {
    window.location.hash = route || "dashboard";
  }

  function render() {
    const root = document.getElementById("app");
    if (!root) return;
    const requested = (window.location.hash || "#dashboard").slice(1) || "dashboard";
    const view = viewMap.get(requested) || viewMap.get("dashboard");
    const route = viewMap.has(requested) ? requested : "dashboard";
    store.route = route;
    root.innerHTML = view(store);
    document.querySelectorAll("[data-route]").forEach(function (node) { node.classList.toggle("active", node.getAttribute("data-route") === route); });
    showOnboarding();
  }

  function showOnboarding() {
    const node = document.getElementById("onboarding");
    if (node) node.hidden = Boolean(store.onboardingComplete);
  }

  function logWater() {
    store.water = Math.min(8, numberValue(store.water, 0) + 1);
    recordEvent("water", { label: "Water glass", detail: store.water + "/8 glasses" });
    awardXp(5, "Hydration logged");
    saveState();
    render();
    toast("Hydration logged");
  }

  function logQuick(type, label, detail) {
    record(type, { label: label, detail: detail });
    addCreatine("5g", "with daily log");
    toast(label + " logged");
  }

  function toggleHabit(node) {
    const key = node ? node.getAttribute("data-habit") : "habit";
    if (!key) return;
    store.habits[key] = !store.habits[key];
    record("habit", { label: key, detail: store.habits[key] ? "complete today" : "unchecked" });
    toast(store.habits[key] ? "Habit locked in" : "Habit unchecked");
  }

  function exportState() {
    const blob = new Blob(new Array(JSON.stringify(store, null, 2)), { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "locked-in-v3-backup-" + today() + ".json";
    link.click();
    URL.revokeObjectURL(link.href);
    toast("Export ready");
  }

  function importState() {
    const input = document.getElementById("import-file");
    if (input) input.click();
  }

  function applyImport(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () { try { store = normalize(JSON.parse(String(reader.result))); saveState(); render(); toast("State imported"); } catch (error) { toast("Import failed"); } };
    reader.readAsText(file);
  }

  function resetState() {
    if (!window.confirm("Reset all local progress?")) return;
    try { window.localStorage.removeItem(storageKey); } catch (error) { return; }
    store = makeState();
    saveState();
    render();
    toast("Local progress reset");
  }

  function handleAction(node) {
    const handler = actionMap.get(node.getAttribute("data-action"));
    if (handler) handler(node);
  }

  function submitOnboarding(form) {
    const data = new FormData(form);
    const profile = store.profile;
    profile.name = String(data.get("name") || "Operator").trim() || "Operator";
    profile.age = String(data.get("age") || "");
    profile.dob = String(data.get("dob") || "");
    profile.height = String(data.get("height") || "");
    profile.weight = String(data.get("weight") || "");
    profile.bodyType = String(data.get("bodyType") || "");
    profile.diet = String(data.get("diet") || "");
    profile.equipment = String(data.get("equipment") || "");
    profile.goals = String(data.get("goals") || "");
    store.onboardingComplete = true;
    saveState();
    render();
    toast("Setup complete");
  }

  function bindEvents() {
    document.addEventListener("click", function (event) {
      const routeNode = event.target.closest ? event.target.closest("[data-route]") : null;
      if (routeNode) { event.preventDefault(); routeTo(routeNode.getAttribute("data-route")); return; }
      const actionNode = event.target.closest ? event.target.closest("[data-action]") : null;
      if (actionNode) { event.preventDefault(); handleAction(actionNode); }
    });
    document.addEventListener("submit", function (event) {
      const form = event.target;
      if (!form || form.id !== "onboarding-form") return;
      event.preventDefault();
      submitOnboarding(form);
    });
    document.addEventListener("change", function (event) {
      if (event.target && event.target.id === "import-file") applyImport(event.target.files && event.target.files.item(0));
    });
    window.addEventListener("hashchange", render);
  }

  registerView("dashboard", dashboard);
  registerView("train", function () { return fallback("train", "Train", "Performance is built from repeatable sessions."); });
  registerView("nutrition", function () { return fallback("nutrition", "Nutrition", "Record the next meal, not a perfect plan."); });
  registerView("mind", function () { return fallback("mind", "Mind", "Protect attention before you ask it to perform."); });
  registerView("life", function () { return fallback("life", "Life", "Build the baseline that makes every other goal easier."); });
  registerView("squad", function () { return fallback("squad", "Squad", "Accountability is a force multiplier."); });
  registerView("advanced", function () { return fallback("advanced", "Control room", "Your state is local-first and exportable."); });
  registerAction("water", logWater);
  registerAction("workout", function () { logQuick("workout", "Workout", "Quick session logged"); });
  registerAction("meal", function () { logQuick("meal", "Meal", "Quick meal logged"); });
  registerAction("study", function () { logQuick("study", "Study", "Focus block logged"); });
  registerAction("habit", toggleHabit);
  registerAction("creatine", function () { addCreatine("5g", "daily"); });
  registerAction("export", exportState);
  registerAction("import", importState);
  registerAction("reset", resetState);

  const api = { state: function () { return store; }, load: loadState, save: saveState, toast: toast, escape: escapeHtml, esc: escapeHtml, num: numberValue, record: record, render: render, registerView: registerView, registerAction: registerAction, awardXp: awardXp, addCreatine: addCreatine, route: routeTo, actions: actionMap, views: viewMap, source: window.LOCKED_DATA || new Object() };
  window.app = api;
  window.LockedIn = api;
  window.esc = escapeHtml;
  window.num = numberValue;
  window.save = saveState;
  window.toast = toast;
  window.awardXp = awardXp;
  window.addCreatine = addCreatine;
  window.state = function () { return store; };

  function start() {
    store = loadState();
    bindEvents();
    saveState();
    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
}());
