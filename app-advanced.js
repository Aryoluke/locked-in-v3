(() => {
  const L = window.LI;
  const V = window.LIViews = window.LIViews || {};
  if (!L) return;
  const esc = L.esc || (v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
  const toast = message => { const el = document.querySelector('#toast'); if (!el) return; el.textContent = message; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 1800); };
  const state = () => {
    const s = L.state;
    if (!s.advanced) s.advanced = {};
    const a = s.advanced;
    ['competitions','rankings','runs','arcs','goals','calendar','glowups','reminders','controls'].forEach(k => { if (!Array.isArray(a[k])) a[k] = []; });
    if (!Number.isFinite(a.levels)) a.levels = 1;
    if (!a.visibility) a.visibility = s.settings && s.settings.privacy || 'private';
    if (typeof a.admin !== 'boolean') a.admin = false;
    return a;
  };
  const button = (action, label, extra = '') => `<button class="btn btn-ghost small" data-action="${action}" ${extra}>${label}</button>`;
  const list = (items, empty) => items.length ? items.slice(-4).reverse().map(x => `<div class="list-row"><span>${esc(x.name || x.text || x.title || x)}</span><span class="muted small">${esc(x.at ? new Date(x.at).toLocaleDateString() : 'local')}</span></div>`).join('') : `<div class="empty">${empty}</div>`;
  const addPrompt = (label, fallback) => prompt(label, fallback);

  V.advanced = () => {
    const a = state();
    const s = L.state;
    const privacy = s.settings && s.settings.privacy || a.visibility;
    return `<div class="hero"><div><div class="eyebrow">CONTROL ROOM / LONG GAME</div><h1>Advanced <span class="accent">systems.</span></h1><p class="muted">Turn consistency into seasons, arcs and visible proof. Offline-first, exportable, and under your control.</p></div><div class="hero-actions">${button('advanced-export','Export backup')}${button('advanced-import','Import backup')}<input id="advanced-file" type="file" accept="application/json" hidden></div></div>
      <div class="grid grid-4"><div class="card"><div class="stat">${a.levels}</div><div class="stat-label">lock-in level</div></div><div class="card"><div class="stat">${a.competitions.length}</div><div class="stat-label">competitions</div></div><div class="card"><div class="stat">${a.goals.length}</div><div class="stat-label">active goals</div></div><div class="card"><div class="stat">${a.reminders.length}</div><div class="stat-label">reminders</div></div></div>
      <div class="grid grid-2 section"><div class="card"><div class="section-head"><h3>Competitions & rankings</h3><span class="tag">seasonal</span></div><p class="muted small">Private challenges can be scored locally; add names for a season or rank your own milestones.</p><div class="grid grid-2">${button('advanced-competition','New competition')}${button('advanced-ranking','Add ranking')}</div><div class="list" style="margin-top:12px">${list(a.competitions, 'No competitions yet.')}${list(a.rankings, 'No rankings yet.')}</div></div>
      <div class="card"><div class="section-head"><h3>Runs & arcs</h3><span class="tag">momentum</span></div><p class="muted small">Track a run as a streak window or build an arc from intention to evidence.</p><div class="grid grid-2">${button('advanced-run','Start a run')}${button('advanced-arc','Create an arc')}</div><div class="list" style="margin-top:12px">${list(a.runs, 'No runs logged.')}${list(a.arcs, 'No arcs in motion.')}</div></div></div>
      <div class="grid grid-2 section"><div class="card"><div class="section-head"><h3>Goals & calendar</h3><span class="tag">adaptive plan</span></div><p class="muted small">Goals stay local and can be attached to a date or a weekly review.</p>${button('advanced-goal','Add goal')}${button('advanced-calendar','Add calendar marker')}<div class="list" style="margin-top:12px">${list(a.goals, 'No goals added.')}${list(a.calendar, 'No calendar markers.')}</div></div>
      <div class="card"><div class="section-head"><h3>Glow-up tracks</h3><span class="tag">whole life</span></div><p class="muted small">Create tracks for style, skin, social confidence, study, home, or any visible upgrade.</p>${button('advanced-glowup','Add glow-up track')}<div class="chips" style="margin-top:12px"><span class="chip on">training</span><span class="chip">style</span><span class="chip">social</span><span class="chip">home</span></div><div class="list" style="margin-top:12px">${list(a.glowups, 'No glow-up tracks yet.')}</div></div></div>
      <div class="grid grid-3 section"><div class="card"><div class="section-head"><h3>Levels</h3><span class="tag">XP ladder</span></div><p class="muted small">Every honest action compounds. Current level is a local progression marker.</p><div class="stat gold">${a.levels}</div>${button('advanced-level','Level up')}</div>
      <div class="card"><div class="section-head"><h3>Reminders</h3><span class="tag">local only</span></div><p class="muted small">Store reminder text and review it inside the app. Native notifications remain an APK/EXE phase.</p>${button('advanced-reminder','Add reminder')}<div class="list" style="margin-top:12px">${list(a.reminders, 'No reminders set.')}</div></div>
      <div class="card"><div class="section-head"><h3>Admin & visibility</h3><span class="tag">${a.admin ? 'admin on' : 'personal'}</span></div><label class="check-row"><input type="checkbox" data-action="advanced-admin" ${a.admin ? 'checked' : ''}> Admin controls</label><label>Sharing visibility<select data-action="advanced-visibility"><option ${privacy === 'private' ? 'selected' : ''}>private</option><option ${privacy === 'friends' ? 'selected' : ''}>friends</option><option ${privacy === 'public' ? 'selected' : ''}>public</option></select></label><p class="muted small">Visibility is a preference only; no data leaves this device unless you export it.</p></div></div>
      <div class="grid grid-2 section"><div class="card"><div class="section-head"><h3>Import / export</h3><span class="tag">portable JSON</span></div><p class="muted small">Back up the complete local state, move it between builds, or restore after clearing browser storage.</p>${button('advanced-export','Download JSON backup')}${button('advanced-import','Choose JSON backup')}</div><div class="card"><div class="section-head"><h3>Reset</h3><span class="tag">irreversible</span></div><p class="muted small">Reset removes this device’s LOCKED IN V3 state and reloads the clean seed.</p>${button('advanced-reset','Reset local data')}</div></div>
      <div class="section card">${button('back-dashboard','Back to today')}</div>`;
  };

  const record = (key, name) => { const a = state(); a[key].push({name, at: new Date().toISOString()}); L.save(); toast(`${name} saved locally`); L.render(); };
  const download = () => { const blob = new Blob([JSON.stringify(L.state, null, 2)], {type: 'application/json'}); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = 'locked-in-v3-backup.json'; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 500); toast('Backup exported'); };
  function act(name, el) {
    const a = state();
    if (name === 'advanced-competition') { const x = addPrompt('Competition name', '30-day consistency'); if (x) record('competitions', x); }
    if (name === 'advanced-ranking') { const x = addPrompt('Ranking or milestone', 'Best week'); if (x) record('rankings', x); }
    if (name === 'advanced-run') { const x = addPrompt('Run name', 'Morning run'); if (x) record('runs', x); }
    if (name === 'advanced-arc') { const x = addPrompt('Arc name', 'Build confidence'); if (x) record('arcs', x); }
    if (name === 'advanced-goal') { const x = addPrompt('Goal', L.state.profile.goals || 'Build consistency'); if (x) record('goals', x); }
    if (name === 'advanced-calendar') { const x = addPrompt('Calendar marker', 'Weekly review'); if (x) record('calendar', x); }
    if (name === 'advanced-glowup') { const x = addPrompt('Glow-up track', 'Style upgrade'); if (x) record('glowups', x); }
    if (name === 'advanced-level') { a.levels += 1; L.save(); toast(`Lock-in level ${a.levels}`); L.render(); }
    if (name === 'advanced-reminder') { const x = addPrompt('Reminder', 'Review today’s plan'); if (x) record('reminders', x); }
    if (name === 'advanced-admin') { a.admin = Boolean(el.checked); L.save(); toast(a.admin ? 'Admin controls on' : 'Admin controls off'); L.render(); }
    if (name === 'advanced-visibility') { a.visibility = el.value; if (!L.state.settings) L.state.settings = {}; L.state.settings.privacy = el.value; L.save(); toast(`Visibility: ${el.value}`); }
    if (name === 'advanced-export') download();
    if (name === 'advanced-import') { const file = document.querySelector('#advanced-file'); if (file) file.click(); }
    if (name === 'advanced-reset' && confirm('Delete all local LOCKED IN V3 data?')) { L.reset(); }
    if (name === 'back-dashboard') { location.hash = 'dashboard'; }
  }
  document.addEventListener('click', e => { const el = e.target.closest('[data-action]'); if (el && el.dataset.action.startsWith('advanced-') || el && el.dataset.action === 'back-dashboard') act(el.dataset.action, el); });
  document.addEventListener('change', e => {
    const el = e.target;
    if (el.id === 'advanced-file' && el.files && el.files[0]) {
      const reader = new FileReader();
      reader.onload = () => { try { const imported = JSON.parse(reader.result); if (!imported || typeof imported !== 'object' || !imported.profile) throw new Error('invalid'); L.state = imported; L.save(); toast('Backup imported'); L.render(); } catch (_) { toast('Import failed: choose a LOCKED IN V3 JSON backup'); } };
      reader.readAsText(el.files[0]);
    }
  });
})();
