/* StudyFlow — Complete Study Motivation Companion */

// ── STATE ────────────────────────────────────────────────
const DEF = {
  xp:0, level:1, streak:3, totalMins:247, sessionsToday:2,
  tasks:[
    {id:1,title:'Complete AWS Cloud Practitioner module',subject:'Cloud',priority:'high',done:false},
    {id:2,title:'Practice Java OOP concepts',subject:'Java',priority:'medium',done:true},
    {id:3,title:'Read Chapter 4 — Data Structures',subject:'DSA',priority:'high',done:false},
    {id:4,title:'Review MongoDB Atlas Search notes',subject:'DB',priority:'low',done:false},
  ],
  log:[], timerMins:{focus:25,short:5,long:15},
  weekData:[45,62,30,78,55,90,40],
  subjectTime:{Cloud:120,Java:85,DSA:60,Other:42},
};
const S = JSON.parse(localStorage.getItem('sf_state')||'null') || DEF;
function save(){ localStorage.setItem('sf_state', JSON.stringify(S)); }

// ── UTILS ────────────────────────────────────────────────
const $ = id => document.getElementById(id);
function todayStr(){ return new Date().toLocaleDateString(); }
function fmtTime(s){ return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; }
function toast(msg){
  const t = $('toast-el');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._t); t._t = setTimeout(()=>t.classList.remove('show'), 2800);
}
function addXP(pts, why){
  S.xp += pts;
  const need = S.level * 100;
  if(S.xp >= need){ S.level++; toast(`🎉 Level Up! Now Level ${S.level}!`); }
  else toast(`✨ +${pts} XP — ${why}`);
  save();
}

// ── NAVIGATION ───────────────────────────────────────────
let tab = 'home';
function goTab(id){
  tab = id;
  document.querySelectorAll('.nl').forEach(b=>b.classList.toggle('active', b.dataset.tab===id));
  $('nav-links').classList.remove('open');
  const R = { home:renderHome, timer:renderTimer, tasks:renderTasks,
    stats:renderStats, music:renderMusic, quotes:renderQuotes };
  $('root').innerHTML = '';
  R[id]?.();
}
function toggleNav(){ $('nav-links').classList.toggle('open'); }

// ══ HOME ═════════════════════════════════════════════════
function renderHome(){
  const need = S.level*100, pct = Math.min(100,Math.round((S.xp%need)/need*100));
  const doneTasks = S.tasks.filter(t=>t.done).length;
  $('root').innerHTML = `
  <div class="home-wrap">
    <div class="home-hero">
      <div>
        <div class="hero-pill"><i class="fas fa-bolt"></i> Your Study Companion</div>
        <h1>Stay Focused.<br/><span class="grad">Stay Motivated.</span></h1>
        <p>Track sessions, manage tasks, build streaks and hit your goals with StudyFlow.</p>
        <div class="hero-stats">
          <div class="hs"><div class="hs-n">${S.streak}</div><div class="hs-l">🔥 Day Streak</div></div>
          <div class="hs"><div class="hs-n">${S.totalMins}</div><div class="hs-l">⏱ Total Mins</div></div>
          <div class="hs"><div class="hs-n">Lv.${S.level}</div><div class="hs-l">⭐ Level</div></div>
          <div class="hs"><div class="hs-n">${doneTasks}</div><div class="hs-l">✅ Done</div></div>
        </div>
        <div class="xp-bar-wrap">
          <div class="xp-row"><span>Level ${S.level}</span><span>${S.xp%need} / ${need} XP</span></div>
          <div class="xp-track"><div class="xp-fill" style="width:${pct}%"></div></div>
        </div>
        <div class="btn-row" style="justify-content:center">
          <button class="btn btn-p" onclick="goTab('timer')"><i class="fas fa-play"></i> Start Focus Session</button>
          <button class="btn btn-g" onclick="goTab('tasks')"><i class="fas fa-list-check"></i> View Tasks</button>
        </div>
      </div>
    </div>
    <div class="feat-grid">
      ${[
        {ic:'fa-clock',  bg:'rgba(124,58,237,.15)',cl:'#A855F7',tab:'timer', t:'Pomodoro Timer',      d:'Customizable focus & break sessions with live ring timer.'},
        {ic:'fa-list-check',bg:'rgba(236,72,153,.15)',cl:'#F472B6',tab:'tasks',t:'Task Tracker',       d:'Add, prioritize and complete tasks with XP rewards per task.'},
        {ic:'fa-chart-line',bg:'rgba(6,182,212,.15)', cl:'#22D3EE',tab:'stats',t:'Progress Analytics', d:'Weekly bar chart, subject breakdown and achievement badges.'},
        {ic:'fa-music',  bg:'rgba(34,197,94,.15)', cl:'#4ADE80',tab:'music', t:'Focus Music',          d:'Lo-fi, nature sounds, binaural beats and ambient music.'},
        {ic:'fa-quote-left',bg:'rgba(245,158,11,.15)',cl:'#FCD34D',tab:'quotes',t:'Daily Quotes',      d:'Motivational quotes with categories, save and copy features.'},
        {ic:'fa-fire',   bg:'rgba(239,68,68,.15)', cl:'#FCA5A5',tab:'stats', t:'Streak & XP System',   d:'Build daily streaks, earn XP and unlock achievement badges.'},
      ].map(f=>`<div class="feat-card" onclick="goTab('${f.tab}')">
        <div class="feat-ic" style="background:${f.bg};color:${f.cl}"><i class="fas ${f.ic}"></i></div>
        <h4>${f.t}</h4><p>${f.d}</p>
      </div>`).join('')}
    </div>
  </div>`;
}

// ══ TIMER ════════════════════════════════════════════════
let tInterval=null, tRunning=false, tMode='focus', tLeft=0, tTotal=0;
const CIRC=722.566; // 2π×115

function renderTimer(){
  if(!tLeft) tLeft = S.timerMins[tMode]*60;
  tTotal = S.timerMins[tMode]*60;
  const colors={focus:'#7C3AED',short:'#06B6D4',long:'#22c55e'};
  const labels={focus:'Focus Time',short:'Short Break',long:'Long Break'};
  const pct = tLeft/tTotal;
  const offset = CIRC*(1-pct);
  $('root').innerHTML = `
  <div class="timer-wrap">
    <div class="mode-row">
      <button class="mBtn${tMode==='focus'?' active':''}" onclick="setMode('focus')"><i class="fas fa-brain"></i> Focus</button>
      <button class="mBtn${tMode==='short'?' active':''}" onclick="setMode('short')"><i class="fas fa-coffee"></i> Short Break</button>
      <button class="mBtn${tMode==='long'?' active':''}"  onclick="setMode('long')"><i class="fas fa-couch"></i> Long Break</button>
    </div>

    <div class="timer-ring-box">
      <svg width="240" height="240" viewBox="0 0 260 260">
        <circle cx="130" cy="130" r="115" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="10"/>
        <circle id="ring-arc" cx="130" cy="130" r="115" fill="none"
          stroke="${colors[tMode]}" stroke-width="10" stroke-linecap="round"
          stroke-dasharray="${CIRC}" stroke-dashoffset="${offset}"
          transform="rotate(-90 130 130)"/>
      </svg>
      <div class="ring-text">
        <div class="ring-time" id="ring-time">${fmtTime(tLeft)}</div>
        <div class="ring-mode">${labels[tMode]}</div>
      </div>
    </div>

    <div class="timer-btns">
      <button class="btn btn-g" onclick="resetTimer()"><i class="fas fa-rotate-left"></i> Reset</button>
      <button class="btn btn-p" id="t-play-btn" onclick="toggleTimer()">
        <i class="fas ${tRunning?'fa-pause':'fa-play'}"></i> ${tRunning?'Pause':'Start'}
      </button>
      <button class="btn btn-g" onclick="skipTimer()"><i class="fas fa-forward-step"></i> Skip</button>
    </div>

    <div class="card" style="margin-bottom:1.25rem">
      <div class="section-title" style="font-size:.78rem;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)">Timer Settings</div>
      <div class="t-settings">
        ${['focus','short','long'].map(m=>`
        <div class="ts-box">
          <div class="ts-lbl">${m==='focus'?'Focus':m==='short'?'Short Break':'Long Break'}</div>
          <div class="ts-val" id="tsv-${m}">${S.timerMins[m]}m</div>
          <div class="ts-adj">
            <button class="ts-btn" onclick="adjTimer('${m}',-5)">−</button>
            <button class="ts-btn" onclick="adjTimer('${m}',5)">+</button>
          </div>
        </div>`).join('')}
      </div>
    </div>

    <div class="card">
      <div class="section-title" style="font-size:.78rem;text-transform:uppercase;letter-spacing:.06em;color:var(--muted)">
        Today's Sessions (${S.log.filter(s=>s.date===todayStr()).length})
      </div>
      ${S.log.filter(s=>s.date===todayStr()).slice(-8).reverse().map(s=>`
        <div class="log-item">
          <div class="log-dot" style="background:${s.type==='focus'?'#7C3AED':s.type==='short'?'#06B6D4':'#22c55e'}"></div>
          ${s.type==='focus'?'🧠 Focus':'☕ Break'} — ${s.mins} min &nbsp;·&nbsp; <span style="color:var(--dim)">${s.time}</span>
        </div>`).join('')||`<div style="color:var(--dim);font-size:.8rem;padding:.25rem 0">No sessions yet — start your first focus session!</div>`}
    </div>
  </div>`;
}

function setMode(m){
  if(tRunning){clearInterval(tInterval);tRunning=false;}
  tMode=m; tLeft=0; renderTimer();
}
function toggleTimer(){
  if(!tLeft){tLeft=S.timerMins[tMode]*60; tTotal=tLeft;}
  tRunning=!tRunning;
  const btn=$('t-play-btn');
  if(btn) btn.innerHTML=`<i class="fas ${tRunning?'fa-pause':'fa-play'}"></i> ${tRunning?'Pause':'Start'}`;
  if(tRunning){
    tInterval=setInterval(()=>{ tLeft--; updateRing(); if(tLeft<=0){clearInterval(tInterval);tRunning=false;finishSession();} },1000);
  } else clearInterval(tInterval);
}
function resetTimer(){
  clearInterval(tInterval); tRunning=false;
  tLeft=S.timerMins[tMode]*60; tTotal=tLeft; updateRing();
  const btn=$('t-play-btn'); if(btn) btn.innerHTML=`<i class="fas fa-play"></i> Start`;
}
function skipTimer(){ clearInterval(tInterval); tRunning=false; tLeft=0; finishSession(); }
function adjTimer(m, d){
  S.timerMins[m]=Math.max(5,Math.min(90,S.timerMins[m]+d)); save();
  const el=$(`tsv-${m}`); if(el) el.textContent=S.timerMins[m]+'m';
  if(m===tMode){tLeft=S.timerMins[m]*60; tTotal=tLeft; updateRing();}
}
function updateRing(){
  const el=$('ring-time'); if(el) el.textContent=fmtTime(tLeft);
  const arc=$('ring-arc');
  if(arc&&tTotal>0) arc.style.strokeDashoffset=CIRC*(1-tLeft/tTotal);
}
function finishSession(){
  const mins=S.timerMins[tMode];
  S.log.push({type:tMode,mins,date:todayStr(),time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})});
  if(tMode==='focus'){S.totalMins+=mins; S.sessionsToday++; addXP(mins*2,`${mins}min focus session`);}
  save(); toast(tMode==='focus'?`🎉 Session complete! +${mins*2} XP`:`☕ Break over! Ready to focus?`);
  tLeft=0; renderTimer();
}

// ══ TASKS ════════════════════════════════════════════════
let filt='all', nid=S.tasks.length+10;
const SUBJ_COLOR={Cloud:'#0EA5E9',Java:'#F97316',DSA:'#8B5CF6',DB:'#22c55e',AI:'#EC4899',Math:'#06B6D4',Other:'#64748B'};
const PRI_COLOR={high:'#ef4444',medium:'#f59e0b',low:'#22c55e'};

function renderTasks(){
  const done=S.tasks.filter(t=>t.done).length;
  const pct=S.tasks.length?Math.round(done/S.tasks.length*100):0;
  const subjs=[...new Set(S.tasks.map(t=>t.subject))];
  const list=S.tasks.filter(t=>{
    if(filt==='all') return true;
    if(filt==='active') return !t.done;
    if(filt==='done') return t.done;
    return t.subject===filt;
  }).sort((a,b)=>({high:0,medium:1,low:2}[a.priority]-{high:0,medium:1,low:2}[b.priority]));

  $('root').innerHTML=`
  <div class="tasks-wrap">
    <div class="tasks-top">
      <h2>📋 Task Tracker</h2>
      <span class="badge bp">${S.tasks.length} tasks</span>
      <span class="badge bg">${done} done</span>
    </div>
    <div class="prog-bar-row">
      <span style="font-size:.82rem;font-weight:600">Progress</span>
      <div class="prog-track"><div class="prog-fill" style="width:${pct}%"></div></div>
      <span class="prog-txt">${pct}% (${done}/${S.tasks.length})</span>
    </div>
    <div class="add-form">
      <div class="add-form-lbl">➕ Add New Task</div>
      <div class="add-row">
        <input class="ti" id="t-input" placeholder="What do you need to study?" onkeydown="if(event.key==='Enter')addTask()"/>
        <select class="ts" id="t-subj">
          <option value="Cloud">☁️ Cloud</option><option value="Java">☕ Java</option>
          <option value="DSA">🌲 DSA</option><option value="DB">🍃 Database</option>
          <option value="AI">🤖 AI/ML</option><option value="Math">📐 Math</option>
          <option value="Other">📚 Other</option>
        </select>
        <select class="ts" id="t-pri">
          <option value="high">🔴 High</option>
          <option value="medium" selected>🟡 Medium</option>
          <option value="low">🟢 Low</option>
        </select>
        <button class="btn btn-p" onclick="addTask()"><i class="fas fa-plus"></i> Add</button>
      </div>
    </div>
    <div class="filter-row">
      ${['all','active','done',...subjs].map(f=>`
        <button class="f-btn${filt===f?' active':''}" onclick="setFilt('${f}')">
          ${f==='all'?'All':f==='active'?'Active':f==='done'?'Completed':f}
        </button>`).join('')}
    </div>
    <div id="task-list">
      ${list.length===0
        ?`<div class="empty"><i class="fas fa-check-circle"></i>${filt==='done'?'No completed tasks yet.':'Nothing here — add a task above!'}</div>`
        :list.map(t=>`
        <div class="task-item${t.done?' done':''}" id="ti-${t.id}">
          <div class="t-cb${t.done?' on':''}" onclick="toggleTask(${t.id})">${t.done?'✓':''}</div>
          <div class="t-body">
            <div class="t-title">${t.title}</div>
            <div class="t-meta">
              <span class="badge" style="background:${SUBJ_COLOR[t.subject]||'#64748B'}22;color:${SUBJ_COLOR[t.subject]||'#64748B'}">${t.subject}</span>
              <span style="font-size:.72rem;color:${PRI_COLOR[t.priority]};display:flex;align-items:center;gap:.25rem">
                <i class="fas fa-circle" style="font-size:.4rem"></i>${t.priority}
              </span>
            </div>
          </div>
          <button class="t-del" onclick="delTask(${t.id})"><i class="fas fa-trash"></i></button>
        </div>`).join('')}
    </div>
  </div>`;
}

function addTask(){
  const title=$('t-input')?.value.trim();
  if(!title){$('t-input')?.focus();return;}
  S.tasks.push({id:++nid,title,subject:$('t-subj').value,priority:$('t-pri').value,done:false});
  save(); addXP(5,'task added'); renderTasks();
}
function toggleTask(id){
  const t=S.tasks.find(t=>t.id===id); if(!t) return;
  t.done=!t.done;
  if(t.done){ const pts={high:30,medium:20,low:10}[t.priority]||10; addXP(pts,`task completed`); }
  save(); renderTasks();
}
function delTask(id){ S.tasks=S.tasks.filter(t=>t.id!==id); save(); renderTasks(); }
function setFilt(f){ filt=f; renderTasks(); }

// ══ STATS ════════════════════════════════════════════════
function renderStats(){
  const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const todayDay=new Date().getDay();
  const maxBar=Math.max(...S.weekData,1);
  const subjs=Object.entries(S.subjectTime);
  const totalSubj=subjs.reduce((a,[,v])=>a+v,0);
  const colors=['#7C3AED','#06B6D4','#EC4899','#22c55e','#F97316','#F59E0B'];
  const focusSessions=S.log.filter(s=>s.type==='focus').length;
  const done=S.tasks.filter(t=>t.done).length;

  $('root').innerHTML=`
  <div class="stats-wrap">
    <h2 class="section-title" style="font-size:1.2rem">📊 Your Study Stats</h2>
    <div class="stats-grid">
      <div class="st-card"><div class="st-icon" style="animation:pulse-em 1.5s infinite">🔥</div>
        <div class="st-num" style="color:#F97316">${S.streak}</div><div class="st-lbl">Day Streak</div></div>
      <div class="st-card"><div class="st-icon">⏱️</div>
        <div class="st-num" style="color:#7C3AED">${S.totalMins}</div><div class="st-lbl">Total Minutes</div></div>
      <div class="st-card"><div class="st-icon">⭐</div>
        <div class="st-num" style="color:#EC4899">Lv.${S.level}</div><div class="st-lbl">${S.xp} XP total</div></div>
      <div class="st-card"><div class="st-icon">✅</div>
        <div class="st-num" style="color:#22c55e">${done}</div><div class="st-lbl">Tasks Done</div></div>
      <div class="st-card"><div class="st-icon">🧠</div>
        <div class="st-num" style="color:#06B6D4">${focusSessions}</div><div class="st-lbl">Focus Sessions</div></div>
      <div class="st-card"><div class="st-icon">📅</div>
        <div class="st-num" style="color:#F59E0B">${S.sessionsToday}</div><div class="st-lbl">Sessions Today</div></div>
    </div>

    <div class="two-col">
      <div class="card">
        <div class="section-title">📅 This Week</div>
        <div class="week-cells">
          ${days.map((d,i)=>`<div class="day-cell${i===todayDay?' tod':S.weekData[i]>0?' has':''}">
            <div class="dc-name">${d}</div><div class="dc-val">${S.weekData[i]}m</div>
          </div>`).join('')}
        </div>
        <div class="bar-chart">
          ${S.weekData.map((v,i)=>`<div class="bc-wrap">
            <div class="bc-val">${v}</div>
            <div class="bc-bar${i===todayDay?' today':''}" style="height:${Math.round(v/maxBar*88)}px"></div>
            <div class="bc-lbl">${days[i].slice(0,2)}</div>
          </div>`).join('')}
        </div>
      </div>

      <div class="card">
        <div class="section-title">📚 Time by Subject</div>
        ${subjs.map(([s,m],i)=>`<div class="subj-row">
          <div class="subj-dot" style="background:${colors[i%colors.length]}"></div>
          <span class="subj-name">${s}</span>
          <div class="subj-track"><div class="subj-fill" style="width:${Math.round(m/totalSubj*100)}%;background:${colors[i%colors.length]}"></div></div>
          <span class="subj-mins">${m}m</span>
        </div>`).join('')}
        <div style="margin-top:1.25rem">
          <div class="section-title" style="font-size:.85rem">🏆 Achievements</div>
          ${[
            {i:'🔥',l:'3-Day Streak',e:S.streak>=3},
            {i:'⏱️',l:'First 60 Minutes',e:S.totalMins>=60},
            {i:'✅',l:'5 Tasks Done',e:done>=5},
            {i:'🧠',l:'10 Focus Sessions',e:focusSessions>=10},
            {i:'⭐',l:'Reach Level 2',e:S.level>=2},
            {i:'💫',l:'100 Total Minutes',e:S.totalMins>=100},
          ].map(a=>`<div class="ach-row" style="opacity:${a.e?1:.35}">
            <span>${a.i}</span><span style="flex:1">${a.l}</span>
            <span style="font-size:.7rem;font-weight:700;color:${a.e?'#22c55e':'var(--dim)'}">${a.e?'EARNED':'LOCKED'}</span>
          </div>`).join('')}
        </div>
      </div>
    </div>

    <div class="card">
      <div class="section-title">💡 Personalised Study Tips</div>
      <div class="tip-grid">
        ${[
          {i:'⏰',t:'Morning sessions tend to be most effective for difficult topics. Try tackling hard subjects before noon.'},
          {i:'🎯',t:`You have ${S.tasks.filter(t=>!t.done&&t.priority==='high').length} high-priority tasks pending. Tackle the hardest ones first!`},
          {i:'💡',t:'A 5-min break every 25 minutes boosts memory retention significantly. Use your short break mode.'},
          {i:'🔥',t:`Your ${S.streak}-day streak is going strong! Study at least 15 minutes today to keep it alive.`},
        ].map(x=>`<div class="tip-card"><div class="tip-icon">${x.i}</div><div class="tip-text">${x.t}</div></div>`).join('')}
      </div>
    </div>
  </div>`;
}

// ══ MUSIC ════════════════════════════════════════════════
const TRACKS=[
  {name:'Lofi Study Beats',       type:'Lo-Fi Hip Hop',   em:'🎵',bpm:70},
  {name:'Rain & Thunder',         type:'Nature Sounds',   em:'🌧️',bpm:0},
  {name:'Coffee Shop Ambience',   type:'Ambient',         em:'☕',bpm:0},
  {name:'Deep Focus Binaural',    type:'Binaural Beats',  em:'🧠',bpm:40},
  {name:'Forest Morning',         type:'Nature Sounds',   em:'🌲',bpm:0},
  {name:'Jazz Cafe',              type:'Smooth Jazz',     em:'🎷',bpm:80},
  {name:'Chillwave',              type:'Chillwave',       em:'🌊',bpm:75},
  {name:'Classical Focus',        type:'Classical',       em:'🎻',bpm:60},
];
let mp=false,mt=0,mprog=0,mvol=70,mInt=null,mshu=false,mrep=false;

function renderMusic(){
  const tr=TRACKS[mt];
  $('root').innerHTML=`
  <div class="music-wrap">
    <h2 class="section-title" style="font-size:1.2rem">🎵 Focus Music</h2>
    <div class="player-card">
      <span class="np-emoji">${tr.em}</span>
      <div class="np-title">${tr.name}</div>
      <div class="np-type">${tr.type}${tr.bpm?' · '+tr.bpm+' BPM':''}</div>
      <div class="m-prog-bar" onclick="mSeek(event)">
        <div class="m-prog-fill" id="mpf" style="width:${mprog}%"></div>
      </div>
      <div class="m-time-row">
        <span id="m-cur">${mS2T(Math.round(mprog*3.6))}</span>
        <span>∞ loop</span>
      </div>
      <div class="m-controls">
        <button class="mc${mshu?' on':''}" onclick="mTogShu()" title="Shuffle"><i class="fas fa-shuffle"></i></button>
        <button class="mc" onclick="mPrev()"><i class="fas fa-backward-step"></i></button>
        <button class="mc play-btn" id="m-play" onclick="mTogPlay()"><i class="fas ${mp?'fa-pause':'fa-play'}"></i></button>
        <button class="mc" onclick="mNext()"><i class="fas fa-forward-step"></i></button>
        <button class="mc${mrep?' on':''}" onclick="mTogRep()" title="Repeat"><i class="fas fa-repeat"></i></button>
      </div>
      <div class="vol-row">
        <i class="fas fa-volume-low"></i>
        <input type="range" class="vol-sl" min="0" max="100" value="${mvol}" oninput="mvol=this.value"/>
        <i class="fas fa-volume-high"></i>
      </div>
    </div>
    <div class="tracks-grid">
      ${TRACKS.map((t,i)=>`<div class="trk${i===mt?' on':''}" onclick="mSelect(${i})">
        <div class="trk-em">${t.em}</div>
        <div><div class="trk-name">${t.name}</div><div class="trk-type">${t.type}</div></div>
        ${i===mt&&mp?'<i class="fas fa-volume-high" style="color:var(--p2);font-size:.85rem;margin-left:auto"></i>':''}
      </div>`).join('')}
    </div>
    <div class="card" style="margin-top:1.25rem">
      <div class="section-title">🎧 Why Focus Music Works</div>
      <div class="why-grid">
        ${[
          {em:'🧠',t:'Binaural Beats',d:'40Hz gamma waves help improve focus and memory consolidation during study.'},
          {em:'🌧️',t:'Nature Sounds',d:'Natural white noise masks distractions and creates a calming study environment.'},
          {em:'🎵',t:'Lo-Fi Music',d:'Steady, repetitive beats help sustain flow state without distracting lyrics.'},
          {em:'☕',t:'Ambient Sounds',d:'Soft background sounds improve creative thinking and sustained attention.'},
        ].map(w=>`<div class="why-card"><div class="why-em">${w.em}</div>
          <div class="why-title">${w.t}</div><div class="why-desc">${w.d}</div></div>`).join('')}
      </div>
    </div>
  </div>`;
}

function mS2T(s){ return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; }
function mTogPlay(){
  mp=!mp;
  if(mp){
    mInt=setInterval(()=>{
      mprog=Math.min(100,mprog+0.028);
      if(mprog>=100){ mprog=0; if(!mrep) mNext(); }
      const pf=$('mpf'), mc=$('m-cur');
      if(pf) pf.style.width=mprog+'%';
      if(mc) mc.textContent=mS2T(Math.round(mprog*3.6));
    },1000);
  } else clearInterval(mInt);
  const btn=$('m-play'); if(btn) btn.innerHTML=`<i class="fas ${mp?'fa-pause':'fa-play'}"></i>`;
}
function mNext(){ mprog=0; mt=mshu?Math.floor(Math.random()*TRACKS.length):(mt+1)%TRACKS.length; renderMusic(); if(mp){mp=false;mTogPlay();} }
function mPrev(){ mprog=0; mt=(mt-1+TRACKS.length)%TRACKS.length; renderMusic(); if(mp){mp=false;mTogPlay();} }
function mSelect(i){ mprog=0; mt=i; renderMusic(); if(mp){mp=false;mTogPlay();} }
function mTogShu(){ mshu=!mshu; renderMusic(); }
function mTogRep(){ mrep=!mrep; renderMusic(); }
function mSeek(e){ const r=e.currentTarget.getBoundingClientRect(); mprog=Math.round((e.clientX-r.left)/r.width*100); const pf=$('mpf'); if(pf) pf.style.width=mprog+'%'; }

// ══ QUOTES ═══════════════════════════════════════════════
const QUOTES=[
  {text:"The secret of getting ahead is getting started.",author:"Mark Twain",cat:"motivation"},
  {text:"It always seems impossible until it is done.",author:"Nelson Mandela",cat:"motivation"},
  {text:"Education is the most powerful weapon you can use to change the world.",author:"Nelson Mandela",cat:"education"},
  {text:"Success is the sum of small efforts repeated day in and day out.",author:"Robert Collier",cat:"success"},
  {text:"Don't watch the clock; do what it does. Keep going.",author:"Sam Levenson",cat:"focus"},
  {text:"The expert in anything was once a beginner.",author:"Helen Hayes",cat:"learning"},
  {text:"An investment in knowledge pays the best interest.",author:"Benjamin Franklin",cat:"education"},
  {text:"The more that you read, the more things you will know.",author:"Dr. Seuss",cat:"learning"},
  {text:"Push yourself, because no one else is going to do it for you.",author:"Unknown",cat:"motivation"},
  {text:"Great things never come from comfort zones.",author:"Unknown",cat:"motivation"},
  {text:"Dream it. Wish it. Do it.",author:"Unknown",cat:"success"},
  {text:"The harder you work for something, the greater you'll feel when you achieve it.",author:"Unknown",cat:"success"},
  {text:"Focus on your goal. Don't look in any direction but ahead.",author:"Unknown",cat:"focus"},
  {text:"Discipline is choosing between what you want now and what you want most.",author:"Abraham Lincoln",cat:"focus"},
  {text:"Learning is not attained by chance; it must be sought with ardor and diligence.",author:"Abigail Adams",cat:"education"},
  {text:"Believe you can and you're halfway there.",author:"Theodore Roosevelt",cat:"motivation"},
  {text:"Start where you are. Use what you have. Do what you can.",author:"Arthur Ashe",cat:"motivation"},
  {text:"You don't have to be great to start, but you have to start to be great.",author:"Zig Ziglar",cat:"motivation"},
  {text:"Study while others are sleeping; work while others are loafing.",author:"William A. Ward",cat:"focus"},
  {text:"The beautiful thing about learning is that no one can take it away from you.",author:"B.B. King",cat:"learning"},
];

let qCat='all', qIdx=new Date().getDate()%QUOTES.length;
let saved=JSON.parse(localStorage.getItem('sf_sq')||'[]');

function renderQuotes(){
  const q=QUOTES[qIdx];
  const cats=['all','motivation','focus','learning','education','success'];
  const list=qCat==='all'?QUOTES:QUOTES.filter(x=>x.cat===qCat);
  $('root').innerHTML=`
  <div class="quotes-wrap">
    <h2 class="section-title" style="font-size:1.2rem">💬 Motivational Quotes</h2>
    <div class="q-hero">
      <span class="q-icon">💬</span>
      <div class="q-text" id="qt">"${q.text}"</div>
      <div class="q-author" id="qa">— ${q.author}</div>
      <div class="q-actions">
        <button class="btn btn-p" onclick="qRandom()"><i class="fas fa-shuffle"></i> New Quote</button>
        <button class="btn btn-g" onclick="qSave()"><i class="fas fa-bookmark"></i> Save</button>
        <button class="btn btn-g" onclick="qCopy()"><i class="fas fa-copy"></i> Copy</button>
        ${saved.length?`<button class="btn btn-a" onclick="qShowSaved()"><i class="fas fa-heart"></i> Saved (${saved.length})</button>`:''}
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:.75rem;flex-wrap:wrap;margin-bottom:1rem">
      <div class="q-cats">
        ${cats.map(c=>`<button class="qc-btn${qCat===c?' active':''}" onclick="qSetCat('${c}')">
          ${c==='all'?'All':c[0].toUpperCase()+c.slice(1)}</button>`).join('')}
      </div>
    </div>
    <div class="q-grid" id="q-grid">
      ${list.map(x=>`<div class="q-card">
        <div class="qc-text">"${x.text}"</div>
        <div class="qc-foot"><div class="qc-auth">— ${x.author}</div>
          <span class="badge bp">${x.cat}</span></div>
      </div>`).join('')}
    </div>
  </div>`;
}

function qRandom(){
  qIdx=Math.floor(Math.random()*QUOTES.length);
  const q=QUOTES[qIdx];
  const qt=$('qt'),qa=$('qa');
  if(qt){qt.style.opacity='0';setTimeout(()=>{qt.textContent=`"${q.text}"`;qt.style.opacity='1';qt.style.transition='opacity .35s';},300);}
  if(qa){qa.style.opacity='0';setTimeout(()=>{qa.textContent=`— ${q.author}`;qa.style.opacity='1';},300);}
}
function qSave(){
  const q=QUOTES[qIdx];
  if(!saved.find(s=>s.text===q.text)){
    saved.push(q); localStorage.setItem('sf_sq',JSON.stringify(saved));
    toast('📌 Quote saved!'); renderQuotes();
  } else toast('Already saved!');
}
function qCopy(){
  const q=QUOTES[qIdx];
  navigator.clipboard?.writeText(`"${q.text}" — ${q.author}`).then(()=>toast('📋 Copied!'));
}
function qSetCat(c){ qCat=c; renderQuotes(); }
function qShowSaved(){
  const g=$('q-grid'); if(!g) return;
  g.innerHTML=saved.length===0
    ?'<p style="color:var(--muted);font-size:.85rem">No saved quotes yet.</p>'
    :saved.map(q=>`<div class="q-card"><div class="qc-text">"${q.text}"</div>
      <div class="qc-foot"><div class="qc-auth">— ${q.author}</div>
      <span class="badge ba">${q.cat}</span></div></div>`).join('');
}

// ══ INIT ═════════════════════════════════════════════════
goTab('home');
