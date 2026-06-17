/* StudyFlow — Study Motivation Companion */

// ── STATE ─────────────────────────────────────────────────
const S = JSON.parse(localStorage.getItem('sf_state') || 'null') || {
  xp: 0, level: 1, streak: 3, totalMins: 247, sessionsToday: 2,
  tasks: [
    { id:1, title:'Complete AWS Cloud Practitioner module', subject:'Cloud', priority:'high',  done:false },
    { id:2, title:'Practice Java OOP concepts',            subject:'Java',  priority:'medium', done:true  },
    { id:3, title:'Read Chapter 4 — Data Structures',      subject:'DSA',   priority:'high',  done:false },
    { id:4, title:'Review MongoDB Atlas Search notes',      subject:'DB',    priority:'low',   done:false },
  ],
  sessionLog: [],
  timerMins:  { focus:25, short:5, long:15 },
  weekData:   [45,62,30,78,55,90,40],
  subjectTime:{ Cloud:120, Java:85, DSA:60, Other:42 },
};

function save() { localStorage.setItem('sf_state', JSON.stringify(S)); }

// ── NAV ───────────────────────────────────────────────────
let currentTab = 'home';
function goTab(id) {
  currentTab = id;
  document.querySelectorAll('.ntab').forEach(b => b.classList.toggle('active', b.dataset.tab === id));
  document.getElementById('nav-tabs').classList.remove('open');
  const fns = { home:renderHome, timer:renderTimer, tasks:renderTasks,
    stats:renderStats, music:renderMusic, quotes:renderQuotes };
  document.getElementById('page-wrap').innerHTML = '';
  fns[id]?.();
}
function toggleMobileNav() { document.getElementById('nav-tabs').classList.toggle('open'); }

// ── TOAST ─────────────────────────────────────────────────
function toast(msg) {
  const t = document.getElementById('toast');
  t.innerHTML = msg; t.classList.remove('hidden');
  clearTimeout(t._t); t._t = setTimeout(() => t.classList.add('hidden'), 2800);
}

// ── XP HELPER ────────────────────────────────────────────
function addXP(pts, label) {
  S.xp += pts;
  if (S.xp >= S.level * 100) { S.level++; toast(`🎉 Level Up! You're now Level ${S.level}!`); }
  else toast(`✨ +${pts} XP — ${label}`);
  save();
}

// ══════════════════════════════════════════ HOME
function renderHome() {
  const p = document.getElementById('page-wrap');
  const xpNeeded = S.level * 100;
  const xpPct = Math.min(100, Math.round(S.xp / xpNeeded * 100));
  p.innerHTML = `
  <div class="home-hero">
    <div class="home-hero-bg"></div>
    <div class="home-hero-content">
      <div class="hero-pill"><i class="fas fa-bolt"></i> Your Study Companion</div>
      <h1>Stay Focused.<br/><span class="grad-text">Stay Motivated.</span></h1>
      <p>Track your study sessions, manage tasks, maintain streaks and discover your peak productivity with StudyFlow.</p>
      <div class="hero-stats">
        <div class="hs-item"><div class="hs-num">${S.streak}</div><div class="hs-label">🔥 Day Streak</div></div>
        <div class="hs-item"><div class="hs-num">${S.totalMins}</div><div class="hs-label">⏱ Total Mins</div></div>
        <div class="hs-item"><div class="hs-num">Lv.${S.level}</div><div class="hs-label">⭐ Level</div></div>
        <div class="hs-item"><div class="hs-num">${S.tasks.filter(t=>t.done).length}</div><div class="hs-label">✅ Tasks Done</div></div>
      </div>
      <!-- XP Bar -->
      <div style="max-width:400px;margin:0 auto 2rem">
        <div style="display:flex;justify-content:space-between;font-size:.75rem;color:var(--muted);margin-bottom:.35rem">
          <span>Level ${S.level}</span><span>${S.xp % xpNeeded}/${xpNeeded} XP</span>
        </div>
        <div style="height:8px;background:rgba(255,255,255,.07);border-radius:50px;overflow:hidden">
          <div style="height:100%;width:${xpPct}%;background:linear-gradient(90deg,var(--p),var(--acc));border-radius:50px;transition:width 1s ease"></div>
        </div>
      </div>
      <div class="btn-row" style="justify-content:center">
        <button class="btn btn-primary" onclick="goTab('timer')"><i class="fas fa-play"></i> Start Focus Session</button>
        <button class="btn btn-ghost" onclick="goTab('tasks')"><i class="fas fa-list-check"></i> View Tasks</button>
      </div>
    </div>
  </div>
  <div class="features-grid">
    ${[
      { icon:'fa-clock',        color:'rgba(124,58,237,.15)', c:'#A855F7', tab:'timer',  title:'Pomodoro Timer',     desc:'Customizable focus & break sessions with session tracking.' },
      { icon:'fa-list-check',   color:'rgba(236,72,153,.15)', c:'#F472B6', tab:'tasks',  title:'Task Tracker',       desc:'Add, prioritize and complete study tasks with XP rewards.' },
      { icon:'fa-chart-line',   color:'rgba(6,182,212,.15)',  c:'#22D3EE', tab:'stats',  title:'Progress Analytics', desc:'Weekly study charts, streaks and subject breakdowns.' },
      { icon:'fa-music',        color:'rgba(34,197,94,.15)',  c:'#4ADE80', tab:'music',  title:'Focus Music',        desc:'Lo-fi, nature sounds and ambient music for deep focus.' },
      { icon:'fa-quote-left',   color:'rgba(245,158,11,.15)', c:'#FCD34D', tab:'quotes', title:'Daily Quotes',       desc:'Curated motivational quotes to keep you inspired.' },
      { icon:'fa-fire',         color:'rgba(239,68,68,.15)',  c:'#FCA5A5', tab:'stats',  title:'Streak System',      desc:'Build daily streaks, earn XP and level up your study game.' },
    ].map(f=>`<div class="feat-card" onclick="goTab('${f.tab}')">
      <div class="feat-icon" style="background:${f.color};color:${f.c}"><i class="fas ${f.icon}"></i></div>
      <h4>${f.title}</h4><p>${f.desc}</p>
    </div>`).join('')}
  </div>`;
}

// ══════════════════════════════════════════ TIMER
let timerInterval = null, timerRunning = false, timerMode = 'focus';
let timerTotal = 0, timerLeft = 0;

function renderTimer() {
  const p = document.getElementById('page-wrap');
  p.innerHTML = `
  <div class="timer-page">
    <div class="timer-mode-row">
      <button class="tmode-btn${timerMode==='focus'?' active':''}" onclick="setMode('focus')"><i class="fas fa-brain"></i> Focus</button>
      <button class="tmode-btn${timerMode==='short'?' active':''}" onclick="setMode('short')"><i class="fas fa-coffee"></i> Short Break</button>
      <button class="tmode-btn${timerMode==='long'?' active':''}" onclick="setMode('long')"><i class="fas fa-couch"></i> Long Break</button>
    </div>
    <div class="timer-circle-wrap">
      <div class="timer-circle-inner">
        <svg class="timer-svg" viewBox="0 0 260 260">
          <circle class="timer-track" cx="130" cy="130" r="115"/>
          <circle class="timer-prog" id="timer-prog" cx="130" cy="130" r="115"
            stroke="${timerMode==='focus'?'#7C3AED':timerMode==='short'?'#06B6D4':'#22c55e'}"
            stroke-dasharray="722.6" stroke-dashoffset="0"/>
        </svg>
        <div class="timer-display" id="timer-display">${formatTime(S.timerMins[timerMode]*60)}</div>
        <div class="timer-label" id="timer-label">${timerMode==='focus'?'Focus Time':timerMode==='short'?'Short Break':'Long Break'}</div>
      </div>
    </div>
    <div class="timer-controls">
      <button class="btn btn-ghost" onclick="resetTimer()"><i class="fas fa-rotate-left"></i> Reset</button>
      <button class="btn btn-primary" id="start-btn" onclick="toggleTimer()">
        <i class="fas ${timerRunning?'fa-pause':'fa-play'}"></i> ${timerRunning?'Pause':'Start'}
      </button>
      <button class="btn btn-ghost" onclick="skipTimer()"><i class="fas fa-forward-step"></i> Skip</button>
    </div>
    <div class="card" style="margin-bottom:1.25rem">
      <div style="font-size:.8rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:1rem">Timer Settings</div>
      <div class="timer-settings">
        ${['focus','short','long'].map(m=>`
        <div class="ts-item">
          <div class="ts-label">${m==='focus'?'Focus':m==='short'?'Short Break':'Long Break'}</div>
          <div class="ts-num" id="ts-num-${m}">${S.timerMins[m]}m</div>
          <div class="ts-btns">
            <button class="ts-btn" onclick="adjustTimer('${m}',-5)">−</button>
            <button class="ts-btn" onclick="adjustTimer('${m}',5)">+</button>
          </div>
        </div>`).join('')}
      </div>
    </div>
    <div class="card">
      <div style="font-size:.8rem;font-weight:700;color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin-bottom:.75rem">
        Today's Sessions (${S.sessionLog.filter(s=>s.date===today()).length})
      </div>
      <div id="session-log">
        ${S.sessionLog.filter(s=>s.date===today()).slice(-8).reverse().map(s=>`
        <div class="sl-item">
          <div class="sl-dot" style="background:${s.type==='focus'?'#7C3AED':s.type==='short'?'#06B6D4':'#22c55e'}"></div>
          ${s.type==='focus'?'🧠 Focus':'☕ Break'} — ${s.mins} min &nbsp;·&nbsp; <span style="color:var(--dim)">${s.time}</span>
        </div>`).join('') || '<div style="color:var(--dim);font-size:.8rem">No sessions today yet. Start your first focus session!</div>'}
      </div>
    </div>
  </div>`;
  timerLeft = timerLeft || S.timerMins[timerMode] * 60;
  timerTotal = S.timerMins[timerMode] * 60;
  updateTimerDisplay();
}

function today() { return new Date().toLocaleDateString(); }
function formatTime(s) { return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; }

function setMode(mode) {
  if (timerRunning) { clearInterval(timerInterval); timerRunning = false; }
  timerMode = mode; timerLeft = 0;
  renderTimer();
}

function toggleTimer() {
  if (!timerLeft) { timerLeft = S.timerMins[timerMode] * 60; timerTotal = timerLeft; }
  timerRunning = !timerRunning;
  const btn = document.getElementById('start-btn');
  if (btn) btn.innerHTML = `<i class="fas ${timerRunning?'fa-pause':'fa-play'}"></i> ${timerRunning?'Pause':'Start'}`;
  if (timerRunning) {
    timerInterval = setInterval(() => {
      timerLeft--;
      updateTimerDisplay();
      if (timerLeft <= 0) { clearInterval(timerInterval); timerRunning = false; completeSession(); }
    }, 1000);
  } else { clearInterval(timerInterval); }
}

function resetTimer() {
  clearInterval(timerInterval); timerRunning = false;
  timerLeft = S.timerMins[timerMode] * 60; timerTotal = timerLeft;
  updateTimerDisplay();
  const btn = document.getElementById('start-btn');
  if (btn) btn.innerHTML = `<i class="fas fa-play"></i> Start`;
}

function skipTimer() { clearInterval(timerInterval); timerRunning = false; timerLeft = 0; completeSession(); }

function adjustTimer(mode, delta) {
  S.timerMins[mode] = Math.max(5, Math.min(90, S.timerMins[mode] + delta));
  save();
  const el = document.getElementById(`ts-num-${mode}`);
  if (el) el.textContent = S.timerMins[mode] + 'm';
  if (mode === timerMode) { timerLeft = S.timerMins[mode]*60; timerTotal = timerLeft; updateTimerDisplay(); }
}

function updateTimerDisplay() {
  const el = document.getElementById('timer-display');
  const prog = document.getElementById('timer-prog');
  if (el) el.textContent = formatTime(timerLeft);
  if (prog && timerTotal > 0) {
    const pct = timerLeft / timerTotal;
    prog.style.strokeDashoffset = 722.6 * (1 - pct);
  }
}

function completeSession() {
  const mins = S.timerMins[timerMode];
  S.sessionLog.push({ type:timerMode, mins, date:today(), time:new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) });
  if (timerMode === 'focus') {
    S.totalMins += mins; S.sessionsToday++;
    addXP(mins * 2, `${mins}min focus session`);
  }
  save();
  toast(timerMode==='focus' ? `🎉 Focus session complete! +${mins*2} XP` : `☕ Break done! Ready to focus?`);
  timerLeft = 0;
  renderTimer();
}

// ══════════════════════════════════════════ TASKS
let taskFilter = 'all';
let nextId = S.tasks.length + 10;

function renderTasks() {
  const p = document.getElementById('page-wrap');
  const done = S.tasks.filter(t=>t.done).length;
  const pct = S.tasks.length ? Math.round(done/S.tasks.length*100) : 0;
  const filtered = S.tasks.filter(t => {
    if (taskFilter==='all') return true;
    if (taskFilter==='active') return !t.done;
    if (taskFilter==='done') return t.done;
    return t.subject === taskFilter;
  });
  const subjects = [...new Set(S.tasks.map(t=>t.subject))];
  p.innerHTML = `
  <div class="tasks-page">
    <div class="tasks-header">
      <h2>📋 Task Tracker</h2>
      <span class="badge b-p">${S.tasks.length} tasks</span>
      <span class="badge b-g">${done} done</span>
    </div>
    <div class="progress-wrap">
      <span style="font-size:.82rem;font-weight:600">Progress</span>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
      <span class="progress-text">${pct}% complete (${done}/${S.tasks.length})</span>
    </div>
    <div class="add-task-form">
      <div style="font-size:.82rem;font-weight:700;color:var(--muted);margin-bottom:.75rem">Add New Task</div>
      <div class="task-input-row">
        <input class="task-input" id="task-title" placeholder="What do you need to study?" style="flex:2"/>
        <select class="task-select" id="task-subj">
          <option value="Cloud">☁️ Cloud</option><option value="Java">☕ Java</option>
          <option value="DSA">🌲 DSA</option><option value="DB">🍃 Database</option>
          <option value="AI">🤖 AI/ML</option><option value="Math">📐 Math</option>
          <option value="Other">📚 Other</option>
        </select>
        <select class="task-select" id="task-pri">
          <option value="high">🔴 High</option>
          <option value="medium" selected>🟡 Medium</option>
          <option value="low">🟢 Low</option>
        </select>
        <button class="btn btn-primary" onclick="addTask()"><i class="fas fa-plus"></i> Add</button>
      </div>
    </div>
    <div class="filter-row">
      ${['all','active','done',...subjects].map(f=>`
        <button class="filter-btn${taskFilter===f?' active':''}" onclick="setFilter('${f}')">
          ${f==='all'?'All':f==='active'?'Active':f==='done'?'Completed':f}
        </button>`).join('')}
    </div>
    <div id="task-list">
      ${filtered.length === 0
        ? `<div class="task-empty"><i class="fas fa-check-circle"></i>${taskFilter==='done'?'No completed tasks yet.':'No tasks here. Add one above!'}</div>`
        : filtered.sort((a,b)=>{const po={high:0,medium:1,low:2};return po[a.priority]-po[b.priority];})
          .map(t => taskHTML(t)).join('')}
    </div>
  </div>`;
}

function taskHTML(t) {
  const priColor = { high:'#ef4444', medium:'#f59e0b', low:'#22c55e' };
  const subjColor= { Cloud:'#0EA5E9', Java:'#F97316', DSA:'#8B5CF6', DB:'#22c55e', AI:'#EC4899', Math:'#06B6D4', Other:'#64748B' };
  return `<div class="task-item${t.done?' done':''}" id="task-${t.id}">
    <div class="task-cb${t.done?' checked':''}" onclick="toggleTask(${t.id})"></div>
    <div class="task-info">
      <div class="task-title">${t.title}</div>
      <div class="task-meta">
        <span class="badge" style="background:${subjColor[t.subject]||'#64748B'}22;color:${subjColor[t.subject]||'#64748B'}">${t.subject}</span>
        <span style="display:flex;align-items:center;gap:.25rem;font-size:.72rem;color:${priColor[t.priority]}">
          <i class="fas fa-circle" style="font-size:.45rem"></i>${t.priority}
        </span>
      </div>
    </div>
    <button class="task-del" onclick="deleteTask(${t.id})" title="Delete"><i class="fas fa-trash"></i></button>
  </div>`;
}

function addTask() {
  const title = document.getElementById('task-title').value.trim();
  if (!title) { document.getElementById('task-title').focus(); return; }
  S.tasks.push({ id:++nextId, title, subject:document.getElementById('task-subj').value,
    priority:document.getElementById('task-pri').value, done:false });
  save(); addXP(5,'task added'); renderTasks();
}

function toggleTask(id) {
  const t = S.tasks.find(t=>t.id===id);
  if (!t) return;
  t.done = !t.done;
  if (t.done) {
    const xpMap = { high:30, medium:20, low:10 };
    addXP(xpMap[t.priority]||10, `"${t.title.slice(0,25)}..." completed`);
  }
  save(); renderTasks();
}

function deleteTask(id) {
  S.tasks = S.tasks.filter(t=>t.id!==id);
  save(); renderTasks();
}

function setFilter(f) { taskFilter = f; renderTasks(); }

// ══════════════════════════════════════════ STATS
function renderStats() {
  const p = document.getElementById('page-wrap');
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const today = new Date().getDay();
  const maxBar = Math.max(...S.weekData, 1);
  const subjects = Object.entries(S.subjectTime);
  const totalSubj = subjects.reduce((a,[,v])=>a+v,0);
  const subjColors = ['#7C3AED','#06B6D4','#EC4899','#22c55e','#F97316','#F59E0B'];
  p.innerHTML = `
  <div class="stats-page">
    <h2 style="font-size:1.2rem;font-weight:800;margin-bottom:1.25rem">📊 Your Study Stats</h2>
    <div class="stats-grid-top">
      <div class="stat-card">
        <div class="stat-icon streak-fire">🔥</div>
        <div class="stat-big" style="color:#F97316">${S.streak}</div>
        <div class="stat-sub">Day Streak</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⏱️</div>
        <div class="stat-big" style="color:#7C3AED">${S.totalMins}</div>
        <div class="stat-sub">Total Minutes</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⭐</div>
        <div class="stat-big" style="color:#EC4899">Lv.${S.level}</div>
        <div class="stat-sub">${S.xp} XP total</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-big" style="color:#22c55e">${S.tasks.filter(t=>t.done).length}</div>
        <div class="stat-sub">Tasks Completed</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🧠</div>
        <div class="stat-big" style="color:#06B6D4">${S.sessionLog.filter(s=>s.type==='focus').length}</div>
        <div class="stat-sub">Focus Sessions</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📅</div>
        <div class="stat-big" style="color:#F59E0B">${S.sessionsToday}</div>
        <div class="stat-sub">Sessions Today</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem;margin-bottom:1.25rem">
      <div class="card">
        <div style="font-size:.85rem;font-weight:700;margin-bottom:1rem">📅 This Week</div>
        <div class="week-grid">
          ${days.map((d,i)=>`<div class="day-cell${i===today?' today':S.weekData[i]>0?' active':''}">
            <span>${d}</span><span>${S.weekData[i]}m</span>
          </div>`).join('')}
        </div>
        <div class="bar-chart">
          ${S.weekData.map((v,i)=>`<div class="bar-wrap">
            <div class="bar-val">${v}</div>
            <div class="bar" style="height:${Math.round(v/maxBar*100)}px;${i===today?'background:linear-gradient(180deg,#EC4899,#F472B6)':''}"></div>
            <div class="bar-label">${days[i]}</div>
          </div>`).join('')}
        </div>
      </div>

      <div class="card">
        <div style="font-size:.85rem;font-weight:700;margin-bottom:1rem">📚 By Subject</div>
        <div class="subject-list">
          ${subjects.map(([subj,mins],i)=>`<div class="subject-item">
            <div class="subj-dot" style="background:${subjColors[i%subjColors.length]}"></div>
            <span class="subj-name">${subj}</span>
            <div class="subj-bar-wrap"><div class="subj-bar" style="width:${Math.round(mins/totalSubj*100)}%;background:${subjColors[i%subjColors.length]}"></div></div>
            <span class="subj-time">${mins}m</span>
          </div>`).join('')}
        </div>
        <div style="margin-top:1.25rem">
          <div style="font-size:.85rem;font-weight:700;margin-bottom:.75rem">🏆 Achievements</div>
          ${[
            { icon:'🔥', label:'3-Day Streak',       earned:S.streak>=3 },
            { icon:'⏱️', label:'First 60 Minutes',   earned:S.totalMins>=60 },
            { icon:'✅', label:'5 Tasks Done',        earned:S.tasks.filter(t=>t.done).length>=5 },
            { icon:'🧠', label:'10 Focus Sessions',  earned:S.sessionLog.filter(s=>s.type==='focus').length>=10 },
            { icon:'⭐', label:'Reach Level 2',       earned:S.level>=2 },
          ].map(a=>`<div style="display:flex;align-items:center;gap:.5rem;padding:.35rem 0;
            opacity:${a.earned?1:.35};font-size:.8rem;border-bottom:1px solid var(--bdr)">
            <span>${a.icon}</span>
            <span style="flex:1">${a.label}</span>
            ${a.earned?'<span style="color:#22c55e;font-size:.7rem;font-weight:700">EARNED</span>':'<span style="color:var(--dim);font-size:.7rem">LOCKED</span>'}
          </div>`).join('')}
        </div>
      </div>
    </div>

    <div class="card">
      <div style="font-size:.85rem;font-weight:700;margin-bottom:1rem">📈 Study Tips Based on Your Data</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.75rem">
        ${[
          { icon:'⏰', tip:'Your peak focus time is typically in the morning. Try scheduling hard topics before noon.' },
          { icon:'🎯', tip:`You have ${S.tasks.filter(t=>!t.done&&t.priority==='high').length} high-priority tasks remaining. Tackle them first!` },
          { icon:'💡', tip:'Taking regular 5-minute breaks every 25 minutes boosts retention by up to 25%.' },
          { icon:'🔥', tip:`Keep your ${S.streak}-day streak alive! Study for at least 15 minutes today.` },
        ].map(tip=>`<div style="display:flex;gap:.65rem;padding:.75rem;background:var(--sur);border-radius:10px;border:1px solid var(--bdr)">
          <span style="font-size:1.1rem">${tip.icon}</span>
          <span style="font-size:.78rem;color:var(--muted);line-height:1.6">${tip.tip}</span>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

// ══════════════════════════════════════════ MUSIC
const TRACKS = [
  { id:1, name:'Lofi Study Beats',        type:'Lo-Fi Hip Hop',      emoji:'🎵', dur:'∞', bpm:70  },
  { id:2, name:'Rain & Thunder',          type:'Nature Sounds',      emoji:'🌧️', dur:'∞', bpm:0   },
  { id:3, name:'Coffee Shop Ambience',    type:'Ambient',            emoji:'☕', dur:'∞', bpm:0   },
  { id:4, name:'Deep Focus Binaural',     type:'Binaural Beats',     emoji:'🧠', dur:'∞', bpm:40  },
  { id:5, name:'Forest Morning Sounds',   type:'Nature Sounds',      emoji:'🌲', dur:'∞', bpm:0   },
  { id:6, name:'Jazz Cafe',               type:'Smooth Jazz',        emoji:'🎷', dur:'∞', bpm:80  },
  { id:7, name:'Chillwave Instrumentals', type:'Chillwave',          emoji:'🌊', dur:'∞', bpm:75  },
  { id:8, name:'Classical Focus',         type:'Classical',          emoji:'🎻', dur:'∞', bpm:60  },
];
let mPlaying = false, mTrack = 0, mProgress = 0, mVolume = 70, mInterval = null, mShuffle = false, mRepeat = false;

function renderMusic() {
  const p = document.getElementById('page-wrap');
  const t = TRACKS[mTrack];
  p.innerHTML = `
  <div class="music-page">
    <h2 style="font-size:1.2rem;font-weight:800;margin-bottom:1.25rem">🎵 Focus Music</h2>
    <div class="music-player">
      <div class="now-playing-icon">${t.emoji}</div>
      <div class="now-playing-title">${t.name}</div>
      <div class="now-playing-type">${t.type}${t.bpm?' · '+t.bpm+' BPM':''}</div>
      <div class="music-progress" onclick="seekMusic(event)">
        <div class="music-prog-fill" id="mpf" style="width:${mProgress}%"></div>
      </div>
      <div class="music-time-row">
        <span id="m-cur">${secToTime(Math.round(mProgress*3.6))}</span>
        <span>∞ loop</span>
      </div>
      <div class="music-controls">
        <button class="mc-btn${mShuffle?' active':''}" onclick="toggleShuffle()" title="Shuffle"><i class="fas fa-shuffle"></i></button>
        <button class="mc-btn" onclick="prevTrack()"><i class="fas fa-backward-step"></i></button>
        <button class="mc-btn play" id="play-btn" onclick="togglePlay()">
          <i class="fas ${mPlaying?'fa-pause':'fa-play'}"></i>
        </button>
        <button class="mc-btn" onclick="nextTrack()"><i class="fas fa-forward-step"></i></button>
        <button class="mc-btn${mRepeat?' active':''}" onclick="toggleRepeat()" title="Repeat"><i class="fas fa-repeat"></i></button>
      </div>
      <div class="volume-row">
        <i class="fas fa-volume-low"></i>
        <input type="range" class="vol-slider" id="vol-slider" min="0" max="100" value="${mVolume}" oninput="setVolume(this.value)"/>
        <i class="fas fa-volume-high"></i>
      </div>
    </div>
    <div style="font-size:.85rem;font-weight:700;margin-bottom:.75rem;color:var(--muted)">ALL TRACKS</div>
    <div class="music-tracks-grid">
      ${TRACKS.map((tr,i)=>`<div class="track-card${i===mTrack?' playing':''}" onclick="selectTrack(${i})">
        <div class="track-emoji">${tr.emoji}</div>
        <div class="track-info">
          <div class="track-name">${tr.name}</div>
          <div class="track-type">${tr.type}</div>
        </div>
        ${i===mTrack&&mPlaying?'<i class="fas fa-volume-high" style="color:var(--p2);font-size:.85rem"></i>':''}
      </div>`).join('')}
    </div>
    <div class="card" style="margin-top:1.25rem">
      <div style="font-size:.85rem;font-weight:700;margin-bottom:.75rem">🎧 Why Focus Music Works</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:.75rem">
        ${[
          { icon:'🧠', t:'Binaural Beats', d:'40Hz gamma waves linked to improved focus and memory consolidation.' },
          { icon:'🌧️', t:'Nature Sounds', d:'Mask distracting noise with natural white noise patterns.' },
          { icon:'🎵', t:'Lo-Fi Music', d:'Steady, repetitive beats help maintain flow state without distraction.' },
          { icon:'☕', t:'Ambient Sounds', d:'Background activity sounds improve creative focus for many learners.' },
        ].map(w=>`<div style="padding:.75rem;background:var(--sur);border-radius:10px;border:1px solid var(--bdr)">
          <div style="font-size:1.1rem;margin-bottom:.4rem">${w.icon}</div>
          <div style="font-size:.82rem;font-weight:700;margin-bottom:.2rem">${w.t}</div>
          <div style="font-size:.75rem;color:var(--muted);line-height:1.5">${w.d}</div>
        </div>`).join('')}
      </div>
    </div>
  </div>`;
}

function secToTime(s) { return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; }
function togglePlay() {
  mPlaying = !mPlaying;
  if (mPlaying) {
    mInterval = setInterval(() => {
      mProgress = Math.min(100, mProgress + 0.028);
      if (mProgress >= 100) { mProgress = mRepeat ? 0 : 0; if (!mRepeat) nextTrack(); }
      const pf = document.getElementById('mpf');
      const mc = document.getElementById('m-cur');
      if (pf) pf.style.width = mProgress + '%';
      if (mc) mc.textContent = secToTime(Math.round(mProgress*3.6));
    }, 1000);
  } else { clearInterval(mInterval); }
  const btn = document.getElementById('play-btn');
  if (btn) btn.innerHTML = `<i class="fas ${mPlaying?'fa-pause':'fa-play'}"></i>`;
}
function nextTrack() { mProgress=0; mTrack = mShuffle ? Math.floor(Math.random()*TRACKS.length) : (mTrack+1)%TRACKS.length; renderMusic(); if(mPlaying){mPlaying=false;togglePlay();} }
function prevTrack() { mProgress=0; mTrack=(mTrack-1+TRACKS.length)%TRACKS.length; renderMusic(); if(mPlaying){mPlaying=false;togglePlay();} }
function selectTrack(i) { mProgress=0; mTrack=i; renderMusic(); if(mPlaying){mPlaying=false;togglePlay();} }
function toggleShuffle() { mShuffle=!mShuffle; renderMusic(); }
function toggleRepeat()  { mRepeat=!mRepeat; renderMusic(); }
function setVolume(v)    { mVolume=v; }
function seekMusic(e)    { const r=e.currentTarget.getBoundingClientRect(); mProgress=Math.round((e.clientX-r.left)/r.width*100); const pf=document.getElementById('mpf'); if(pf) pf.style.width=mProgress+'%'; }

// ══════════════════════════════════════════ QUOTES
const QUOTES = [
  { text:"The secret of getting ahead is getting started.", author:"Mark Twain", cat:"motivation" },
  { text:"It always seems impossible until it is done.", author:"Nelson Mandela", cat:"motivation" },
  { text:"Education is the most powerful weapon you can use to change the world.", author:"Nelson Mandela", cat:"education" },
  { text:"Success is the sum of small efforts repeated day in and day out.", author:"Robert Collier", cat:"success" },
  { text:"Don't watch the clock; do what it does. Keep going.", author:"Sam Levenson", cat:"focus" },
  { text:"The expert in anything was once a beginner.", author:"Helen Hayes", cat:"learning" },
  { text:"Study hard what interests you the most in the most undisciplined, irreverent and original manner possible.", author:"Richard Feynman", cat:"learning" },
  { text:"An investment in knowledge pays the best interest.", author:"Benjamin Franklin", cat:"education" },
  { text:"The more that you read, the more things you will know.", author:"Dr. Seuss", cat:"learning" },
  { text:"Push yourself, because no one else is going to do it for you.", author:"Unknown", cat:"motivation" },
  { text:"Great things never come from comfort zones.", author:"Unknown", cat:"motivation" },
  { text:"Dream it. Wish it. Do it.", author:"Unknown", cat:"success" },
  { text:"Success doesn't just find you. You have to go out and get it.", author:"Unknown", cat:"success" },
  { text:"The harder you work for something, the greater you will feel when you achieve it.", author:"Unknown", cat:"success" },
  { text:"Focus on your goal. Don't look in any direction but ahead.", author:"Unknown", cat:"focus" },
  { text:"Discipline is choosing between what you want now and what you want most.", author:"Abraham Lincoln", cat:"focus" },
  { text:"Learning is not attained by chance; it must be sought for with ardor and diligence.", author:"Abigail Adams", cat:"education" },
  { text:"Believe you can and you're halfway there.", author:"Theodore Roosevelt", cat:"motivation" },
  { text:"Start where you are. Use what you have. Do what you can.", author:"Arthur Ashe", cat:"motivation" },
  { text:"You don't have to be great to start, but you have to start to be great.", author:"Zig Ziglar", cat:"motivation" },
];

let quoteCat = 'all', dailyIdx = new Date().getDate() % QUOTES.length;
let savedQuotes = JSON.parse(localStorage.getItem('sf_saved_quotes') || '[]');

function renderQuotes() {
  const p = document.getElementById('page-wrap');
  const dq = QUOTES[dailyIdx];
  const cats = ['all','motivation','focus','learning','education','success'];
  const filtered = quoteCat==='all' ? QUOTES : QUOTES.filter(q=>q.cat===quoteCat);
  p.innerHTML = `
  <div class="quotes-page">
    <h2 style="font-size:1.2rem;font-weight:800;margin-bottom:1.25rem">💬 Motivation Quotes</h2>
    <div class="quote-hero">
      <div class="quote-icon-big">💬</div>
      <div class="quote-text" id="q-text">"${dq.text}"</div>
      <div class="quote-author" id="q-auth">— ${dq.author}</div>
      <div class="quote-actions">
        <button class="btn btn-primary" onclick="randomQuote()"><i class="fas fa-shuffle"></i> New Quote</button>
        <button class="btn btn-ghost" onclick="saveQuote()"><i class="fas fa-bookmark"></i> Save</button>
        <button class="btn btn-ghost" onclick="copyQuote()"><i class="fas fa-copy"></i> Copy</button>
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:.75rem;flex-wrap:wrap;margin-bottom:1rem">
      <div class="quote-cats">
        ${cats.map(c=>`<button class="qcat-btn${quoteCat===c?' active':''}" onclick="setQCat('${c}')">
          ${c==='all'?'All':c.charAt(0).toUpperCase()+c.slice(1)}</button>`).join('')}
      </div>
      ${savedQuotes.length ? `<button class="btn btn-ghost" style="font-size:.78rem;padding:.35rem .75rem" onclick="showSaved()">
        <i class="fas fa-bookmark"></i> Saved (${savedQuotes.length})</button>` : ''}
    </div>
    <div class="quotes-list" id="q-list">
      ${filtered.map((q,i)=>`<div class="quote-card">
        <div class="qc-text">"${q.text}"</div>
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div class="qc-author">— ${q.author}</div>
          <span class="badge b-p qc-cat">${q.cat}</span>
        </div>
      </div>`).join('')}
    </div>
  </div>`;
}

function randomQuote() {
  dailyIdx = Math.floor(Math.random() * QUOTES.length);
  const q = QUOTES[dailyIdx];
  const qt = document.getElementById('q-text');
  const qa = document.getElementById('q-auth');
  if (qt) { qt.style.opacity='0'; setTimeout(()=>{ qt.textContent=`"${q.text}"`; qt.style.opacity='1'; qt.style.transition='opacity .4s'; },300); }
  if (qa) { qa.style.opacity='0'; setTimeout(()=>{ qa.textContent=`— ${q.author}`; qa.style.opacity='1'; },300); }
}

function saveQuote() {
  const q = QUOTES[dailyIdx];
  if (!savedQuotes.find(s=>s.text===q.text)) {
    savedQuotes.push(q);
    localStorage.setItem('sf_saved_quotes', JSON.stringify(savedQuotes));
    toast('📌 Quote saved!');
    renderQuotes();
  } else { toast('Already saved!'); }
}

function copyQuote() {
  const q = QUOTES[dailyIdx];
  navigator.clipboard?.writeText(`"${q.text}" — ${q.author}`).then(()=>toast('📋 Copied to clipboard!'));
}

function setQCat(c) { quoteCat=c; renderQuotes(); }

function showSaved() {
  const area = document.getElementById('q-list');
  if (!area) return;
  area.innerHTML = savedQuotes.length===0
    ? '<p style="color:var(--muted);font-size:.85rem">No saved quotes yet.</p>'
    : savedQuotes.map(q=>`<div class="quote-card">
        <div class="qc-text">"${q.text}"</div>
        <div class="qc-author">— ${q.author}</div>
      </div>`).join('');
}

// ══════════════════════════════════════════ INIT
goTab('home');
