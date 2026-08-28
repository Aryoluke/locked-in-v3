(() => {
  const L = window.LI;
  const V = window.LIViews = window.LIViews || {};
  if (!L) return;
  const esc = L.esc || (v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])));
  const toast = message => { const el = document.querySelector('#toast'); if (!el) return; el.textContent = message; el.classList.add('show'); setTimeout(() => el.classList.remove('show'), 1800); };
  const qstate = () => {
    const s = L.state;
    if (!s.squad) s.squad = {};
    const q = s.squad;
    ['quests','duels','combos','raids','reactions','revenge','sessions','leaderboard','records','shop','trophies','photos'].forEach(k => { if (!Array.isArray(q[k])) q[k] = []; });
    if (!q.league) q.league = 'Bronze';
    if (!Number.isFinite(q.points)) q.points = 0;
    if (!Number.isFinite(q.wraps)) q.wraps = 0;
    return q;
  };
  const latest = (items, empty) => items.length ? items.slice(-4).reverse().map(x => `<div class="list-row"><span>${esc(x.name || x.text || x.result || x)}</span><span class="muted small">${esc(x.at ? new Date(x.at).toLocaleDateString() : 'local')}</span></div>`).join('') : `<div class="empty">${empty}</div>`;
  const button = (action, label, extra = '') => `<button class="btn btn-ghost small" data-action="${action}" ${extra}>${label}</button>`;

  V.squad = () => {
    const q = qstate();
    const s = L.state;
    const quests = ['Complete today’s plan', 'Post a proof-of-work note', 'Give one squad reaction'];
    const done = q.quests.map(x => x.name);
    const questList = quests.map((name, i) => `<div class="list-row"><span>${done.includes(name) ? '✓ ' : '○ '}${esc(name)}</span>${button('squad-quest', done.includes(name) ? 'Done' : '+30 XP', `data-name="${esc(name)}" data-index="${i}"`)}</div>`).join('');
    const leaders = (q.leaderboard.length ? q.leaderboard : [{name: s.profile.name || 'You', points: q.points}]).slice().sort((a,b) => (b.points || 0) - (a.points || 0)).slice(0,5);
    const leaderList = leaders.map((x,i) => `<div class="list-row"><span><b>${i + 1}.</b> ${esc(x.name)}</span><strong class="gold">${x.points || 0}</strong></div>`).join('');
    return `<div class="hero"><div><div class="eyebrow">ACCOUNTABILITY / PLAY / PROGRESS</div><h1>Squad <span class="accent">mode.</span></h1><p class="muted">Compete with your people without giving your private data away. Everything here is local until you choose to export it.</p></div><div class="hero-actions">${button('squad-session', '+ Local session')}${button('squad-photo', 'Photo check-in')}</div></div>
      <div class="grid grid-4"><div class="card"><div class="stat">${q.points}</div><div class="stat-label">squad XP</div></div><div class="card"><div class="stat">${q.league}</div><div class="stat-label">current league</div></div><div class="card"><div class="stat">${q.combos.length}</div><div class="stat-label">combo chains</div></div><div class="card"><div class="stat">${q.wraps}</div><div class="stat-label">weekly wraps</div></div></div>
      <div class="grid grid-2 section"><div class="card"><div class="section-head"><h3>Quests & daily XP</h3><span class="tag">offline</span></div><div class="list">${questList}</div><div class="chips"><span class="chip on">streak shield</span><span class="chip">bonus objective</span></div></div>
      <div class="card"><div class="section-head"><h3>Duels & combos</h3><span class="tag">friendly fire</span></div><p class="muted small">Log a win, loss, or shared combo. No account or server required.</p><div class="grid grid-2">${button('squad-duel','Log duel win', 'data-result="win"')}${button('squad-duel','Log duel loss', 'data-result="loss"')}${button('squad-combo','Build combo')}${button('squad-revenge','Revenge round')}</div><div class="list" style="margin-top:12px">${latest(q.duels, 'No duels yet — start a friendly round.')}</div></div></div>
      <div class="grid grid-3 section"><div class="card"><div class="section-head"><h3>League & badges</h3><span class="tag">${q.league}</span></div><p class="muted small">Bronze → Silver → Gold → Diamond. Earn points through honest logs.</p><div class="chips"><span class="chip on">First lock-in</span><span class="chip on">${q.combos.length ? 'Combo starter' : 'Next: combo starter'}</span></div>${button('squad-promote','Promote league')}</div>
      <div class="card"><div class="section-head"><h3>Raids & reactions</h3><span class="tag">social lift</span></div><div class="grid grid-2">${button('squad-raid','Start raid')}${button('squad-reaction','Send reaction')}</div><div class="list" style="margin-top:12px">${latest(q.raids, 'No raids queued.')}</div></div>
      <div class="card"><div class="section-head"><h3>Shop & trophies</h3><span class="tag">${q.points} XP</span></div><div class="list"><div class="list-row"><span>Streak freeze</span>${button('squad-buy','Buy', 'data-item="Streak freeze" data-cost="60"')}</div><div class="list-row"><span>Golden nameplate</span>${button('squad-buy','Buy', 'data-item="Golden nameplate" data-cost="120"')}</div></div></div></div>
      <div class="grid grid-2 section"><div class="card"><div class="section-head"><h3>Leaderboard & records</h3><span class="tag">local roster</span></div><div class="list">${leaderList}</div><div class="list" style="margin-top:12px">${latest(q.records, 'Personal records appear after your first log.')}</div>${button('squad-record','Record a PR')}</div>
      <div class="card"><div class="section-head"><h3>Accountability vault</h3><span class="tag">device only</span></div><p class="muted small">Photo check-ins store a filename or note, never upload a file. Local sessions make a shareable proof trail without exposing your journal.</p><div class="list">${latest(q.photos, 'No photo check-ins yet.')}</div><div class="list">${latest(q.sessions, 'No local sessions yet.')}</div>${button('squad-wrap','Close weekly wrap')}</div></div>
      <div class="section card"><div class="section-head"><h3>More systems</h3><span class="tag">v3 controls</span></div><p class="muted">Competitions, goals/calendar, glow-up tracks, reminders, visibility, import/export and reset live in the advanced control room.</p>${button('open-advanced','Open advanced control room')}</div>`;
  };

  function act(name, el) {
    const q = qstate();
    const now = new Date().toISOString();
    if (name === 'squad-quest') { const quest = el.dataset.name || 'Daily quest'; if (!q.quests.some(x => x.name === quest)) { q.quests.push({name: quest, at: now}); q.points += 30; toast('Quest complete +30 XP'); } }
    if (name === 'squad-duel') { const result = el.dataset.result || 'win'; q.duels.push({result, name: `Duel ${result}`, at: now}); q.points += result === 'win' ? 45 : 10; toast(`Duel ${result} logged`); }
    if (name === 'squad-combo') { q.combos.push({name: `Combo ${q.combos.length + 1}`, at: now}); q.points += 25; toast('Combo chain extended'); }
    if (name === 'squad-reaction') { q.reactions.push({name: '🔥 reaction sent', at: now}); q.points += 5; toast('Reaction saved locally'); }
    if (name === 'squad-revenge') { q.revenge.push({name: 'Revenge round queued', at: now}); toast('Revenge round queued'); }
    if (name === 'squad-raid') { q.raids.push({name: 'Weekend raid', at: now}); q.points += 15; toast('Raid created'); }
    if (name === 'squad-record') { q.records.push({name: 'New consistency PR', at: now}); q.points += 20; toast('Record saved'); }
    if (name === 'squad-promote') { const leagues = ['Bronze','Silver','Gold','Diamond']; q.league = leagues[Math.min(leagues.indexOf(q.league) + 1, leagues.length - 1)]; toast(`League: ${q.league}`); }
    if (name === 'squad-buy') { const cost = Number(el.dataset.cost || 0); if (q.points >= cost) { q.points -= cost; q.shop.push({name: el.dataset.item || 'Reward', at: now}); q.trophies.push({name: el.dataset.item || 'Reward', at: now}); toast('Reward claimed'); } else toast(`Need ${cost - q.points} more XP`); }
    if (name === 'squad-session') { const title = prompt('Local session name', 'Saturday lock-in'); if (title) { q.sessions.push({name: title, at: now}); q.points += 10; toast('Local session saved'); } }
    if (name === 'squad-photo') { const note = prompt('Photo filename or accountability note (stored locally)'); if (note) { q.photos.push({name: note, at: now}); q.points += 10; toast('Photo check-in saved locally'); } }
    if (name === 'squad-wrap') { q.wraps += 1; q.points += 25; toast('Weekly wrap closed +25 XP'); }
    if (name === 'open-advanced') { location.hash = 'advanced'; return; }
    L.save();
    if (L.route === 'squad') L.render();
  }
  document.addEventListener('click', e => { const el = e.target.closest('[data-action]'); if (el && el.dataset.action.startsWith('squad-') || el && el.dataset.action === 'open-advanced') act(el.dataset.action, el); });
})();
