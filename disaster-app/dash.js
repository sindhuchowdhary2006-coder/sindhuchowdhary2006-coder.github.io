/* Disaster Prep — Dashboard */
const user = JSON.parse(sessionStorage.getItem('dp_user') || 'null');
if (!user) window.location.href = 'index.html';

// State
const state = {
  score: 0,
  completedModules: 0,
  moduleProgress: { earthquake:0, flood:0, fire:0, cyclone:0 },
  completedChapters: { earthquake:[], flood:[], fire:[], cyclone:[] },
  quizScores: {},
  achievements: [],
  alerts: [
    { id:1, type:'critical', icon:'fa-fire',                title:'Wildfire Alert — Zone C',       desc:'Wildfire spreading toward Zone C. Immediate evacuation required.',   time:'2 min ago',  zone:'Zone C' },
    { id:2, type:'warning',  icon:'fa-cloud-showers-heavy', title:'Flash Flood Warning — Zone A',  desc:'Heavy rainfall expected. Low-lying areas should prepare.',            time:'15 min ago', zone:'Zone A' },
    { id:3, type:'info',     icon:'fa-wind',                title:'Strong Wind Advisory — Zone B', desc:'Wind speeds up to 80 km/h. Secure all outdoor objects.',             time:'1 hr ago',   zone:'Zone B' },
    { id:4, type:'safe',     icon:'fa-shield-halved',       title:'All-Clear — Zone E',            desc:'Zone E situation stabilized. Normal operations resumed.',            time:'3 hr ago',   zone:'Zone E' },
  ],
  incidents: [],
  teachers: [
    { email:'ravi.k@school.edu', school:'Siddhartha Academy', dept:'Science', status:'active' },
    { email:'suma.r@school.edu', school:'Siddhartha Academy', dept:'Maths',   status:'active' },
    { email:'john.d@school.edu', school:'Siddhartha Academy', dept:'English', status:'pending'},
  ],
  students: [
    { name:'Arjun Sharma',  roll:'21CS001', cls:'10-A', zone:'Zone A', status:'safe'    },
    { name:'Priya Reddy',   roll:'21CS002', cls:'10-A', zone:'Zone C', status:'danger'  },
    { name:'Rahul Mehta',   roll:'21CS003', cls:'10-B', zone:'Zone B', status:'caution' },
    { name:'Sneha Patel',   roll:'21CS004', cls:'10-B', zone:'Zone E', status:'safe'    },
    { name:'Kiran Kumar',   roll:'21CS005', cls:'10-C', zone:'Zone D', status:'caution' },
  ],
};

const MODULES = {
  earthquake: {
    title:'Earthquake Safety', icon:'🛡️', color:'#e3f2fd', iconColor:'#1565c0',
    desc:'Learn how to prepare for and respond to earthquakes.',
    chapters:[
      { title:'What is an Earthquake?',      sub:'Causes and types of earthquakes',
        content:`<h3>What is an Earthquake?</h3><p>An earthquake is the shaking of the Earth's surface caused by sudden energy release in the crust. This creates seismic waves.</p><p>Earthquakes are measured using the Richter scale. A magnitude of 6.0 or above is considered strong.</p><div class="chap-tip">💡 Tip: Most earthquakes last less than 1 minute, but aftershocks can continue for days.</div><ul><li>Tectonic earthquakes — caused by plate movement</li><li>Volcanic earthquakes — near volcanoes</li><li>Collapse earthquakes — in underground caverns</li></ul>` },
      { title:'Before an Earthquake',         sub:'Preparation and safety measures',
        content:`<h3>Before an Earthquake</h3><p>Preparation is the key to surviving an earthquake with minimal harm.</p><div class="chap-tip">💡 Always keep an emergency kit ready at home and school.</div><ul><li>Secure heavy furniture to walls</li><li>Know your school's evacuation plan</li><li>Keep an emergency kit: water, food, flashlight, first aid</li><li>Identify safe spots: under sturdy tables, away from windows</li><li>Practice "Drop, Cover, Hold On" drills regularly</li></ul>` },
      { title:'During an Earthquake',         sub:'What to do when shaking starts',
        content:`<h3>During an Earthquake</h3><p>If you feel shaking, act immediately using DROP, COVER, and HOLD ON.</p><div class="chap-tip">💡 Do NOT run outside during shaking — most injuries happen from falling debris near exits.</div><ul><li><strong>DROP</strong> to your hands and knees</li><li><strong>COVER</strong> under a sturdy table or against an interior wall</li><li><strong>HOLD ON</strong> until shaking stops</li><li>Stay away from windows and heavy objects</li><li>If outdoors, move away from buildings and power lines</li></ul>` },
      { title:'After an Earthquake',          sub:'Recovery and checking for hazards',
        content:`<h3>After an Earthquake</h3><p>After shaking stops, hazards may still exist. Be cautious and follow instructions.</p><div class="chap-tip">💡 Check for gas leaks — if you smell gas, leave immediately and call emergency services.</div><ul><li>Check yourself and others for injuries</li><li>Expect aftershocks — they can be strong</li><li>Do not use elevators</li><li>Check for fires, gas leaks, and structural damage</li><li>Listen to emergency broadcasts</li></ul>` },
    ]
  },
  flood: {
    title:'Flood Management', icon:'🌊', color:'#e0f7fa', iconColor:'#0277bd',
    desc:'Understand flood risks and how to stay safe during flooding.',
    chapters:[
      { title:'Understanding Floods',         sub:'Types and causes of flooding',
        content:`<h3>Understanding Floods</h3><p>Floods are the most common and widespread natural disaster. They occur when water overflows onto normally dry land.</p><div class="chap-tip">💡 Flash floods can develop in just minutes — always heed weather warnings.</div><ul><li>River floods — rivers overflow their banks</li><li>Flash floods — sudden, intense rainfall</li><li>Coastal floods — storm surges from cyclones</li><li>Urban floods — poor drainage in cities</li></ul>` },
      { title:'Before a Flood',               sub:'Flood preparedness steps',
        content:`<h3>Before a Flood</h3><p>Knowing what to do before a flood can save lives and reduce damage.</p><div class="chap-tip">💡 Know your area's flood risk — check if your school is in a flood zone.</div><ul><li>Know evacuation routes and high ground locations</li><li>Prepare an emergency bag: documents, water, food, medicine</li><li>Keep drains and gutters clear</li><li>Keep emergency numbers saved</li></ul>` },
      { title:'During a Flood',               sub:'Actions to take when flood occurs',
        content:`<h3>During a Flood</h3><p>If a flood warning is issued, act quickly and follow official guidance.</p><div class="chap-tip">💡 Never walk or drive through floodwater — just 15 cm of fast-moving water can knock you down.</div><ul><li>Move to higher ground immediately</li><li>Avoid walking in floodwater</li><li>Don't touch electrical equipment if wet</li><li>Follow evacuation orders without delay</li></ul>` },
      { title:'After a Flood',                sub:'Recovery and health precautions',
        content:`<h3>After a Flood</h3><p>Floodwater can carry diseases and structural damage may be hidden. Be careful.</p><div class="chap-tip">💡 Boil drinking water until authorities confirm the supply is safe.</div><ul><li>Return home only when authorities say it's safe</li><li>Clean and disinfect everything touched by floodwater</li><li>Watch for signs of disease: diarrhea, fever</li><li>Document damage for insurance and aid</li></ul>` },
    ]
  },
  fire: {
    title:'Fire Safety', icon:'🔥', color:'#fff3e0', iconColor:'#e65100',
    desc:'Learn fire prevention, evacuation procedures and first aid.',
    chapters:[
      { title:'Fire Prevention',              sub:'How to prevent fires at school and home',
        content:`<h3>Fire Prevention</h3><p>Most fires are preventable. Understanding common causes helps you avoid them.</p><div class="chap-tip">💡 Never leave candles, stoves or electrical appliances unattended.</div><ul><li>Check electrical wiring regularly</li><li>Don't overload power sockets</li><li>Store flammable materials safely</li><li>Install smoke detectors in buildings</li><li>Never play with fire or fireworks indoors</li></ul>` },
      { title:'Fire Evacuation Procedures',   sub:'How to safely exit during a fire',
        content:`<h3>Fire Evacuation Procedures</h3><p>Knowing your evacuation plan before a fire starts is critical.</p><div class="chap-tip">💡 In a fire, most deaths are caused by smoke inhalation — stay low where air is cleaner.</div><ul><li>Learn all exit routes in your school/building</li><li>When alarm sounds, leave immediately</li><li>Stay low if there is smoke</li><li>Feel doors before opening — if hot, use another exit</li><li>Meet at the designated assembly point</li><li>Never use elevators during a fire</li></ul>` },
      { title:'Using a Fire Extinguisher',    sub:'PASS technique and types',
        content:`<h3>Using a Fire Extinguisher</h3><p>Use the PASS technique to operate a fire extinguisher effectively.</p><div class="chap-tip">💡 Only attempt to fight a small, contained fire. If in doubt, evacuate immediately.</div><ul><li><strong>P</strong>ull the pin</li><li><strong>A</strong>im at the base of the fire</li><li><strong>S</strong>queeze the handle</li><li><strong>S</strong>weep side to side</li></ul><p>Types: Water (Class A), CO₂ (Class B/C), Dry Chemical (multipurpose)</p>` },
      { title:'Burns and First Aid',          sub:'Treating fire-related injuries',
        content:`<h3>Burns and First Aid</h3><p>Quick, correct first aid for burns can prevent further injury.</p><div class="chap-tip">💡 Never apply toothpaste, butter, or ice to a burn — they can worsen injury.</div><ul><li><strong>Cool</strong> burn under cool running water for 10–20 minutes</li><li><strong>Cover</strong> loosely with a sterile bandage</li><li>Do NOT break blisters</li><li>Seek medical help for large or deep burns</li><li>For chemical burns, remove clothing and rinse thoroughly</li></ul>` },
    ]
  },
  cyclone: {
    title:'Cyclone Preparedness', icon:'🌀', color:'#f3e5f5', iconColor:'#6a1b9a',
    desc:'Understand cyclones and how to protect yourself and your community.',
    chapters:[
      { title:'What is a Cyclone?',           sub:'Formation and characteristics',
        content:`<h3>What is a Cyclone?</h3><p>A cyclone is a large, rotating storm system with low pressure at its center, bringing strong winds, heavy rain and storm surges.</p><div class="chap-tip">💡 Cyclones are known as Hurricanes in the Atlantic and Typhoons in the Pacific.</div><ul><li>Form over warm ocean waters (above 26°C)</li><li>Categorized 1–5 based on wind speed</li><li>Eye of cyclone — calm center surrounded by intense winds</li><li>Storm surge is the deadliest component</li></ul>` },
      { title:'Cyclone Warning Systems',      sub:'Understanding alerts and warnings',
        content:`<h3>Cyclone Warning Systems</h3><p>India Meteorological Department (IMD) issues cyclone warnings well in advance.</p><div class="chap-tip">💡 Follow official weather bulletins — don't rely on rumors during cyclone season.</div><ul><li>Pre-cyclone watch (72 hrs before)</li><li>Cyclone alert (48 hrs before)</li><li>Cyclone warning (24 hrs before)</li><li>Post-landfall outlook</li></ul>` },
      { title:'Before a Cyclone',             sub:'Preparation and securing your home',
        content:`<h3>Before a Cyclone</h3><p>Advance preparation can significantly reduce the impact of a cyclone.</p><div class="chap-tip">💡 Know your nearest cyclone shelter and the route to reach it.</div><ul><li>Stock emergency supplies for 72 hours</li><li>Secure or bring in outdoor furniture and objects</li><li>Reinforce windows and doors</li><li>Fill water containers in case supply is disrupted</li><li>Charge all devices; keep a battery radio</li></ul>` },
      { title:'During and After a Cyclone',   sub:'Safety actions and recovery',
        content:`<h3>During and After a Cyclone</h3><p>During a cyclone, your main goal is to stay protected from wind, rain and flying debris.</p><div class="chap-tip">💡 The calm "eye" of the cyclone can be misleading — the other side of the eye wall is just as dangerous.</div><ul><li>Stay indoors in the strongest part of the building</li><li>Keep away from windows</li><li>Do not go out during the eye — storm will resume</li><li>After: watch for flooding, downed power lines, structural damage</li><li>Report damage to local authorities</li></ul>` },
    ]
  }
};

const QUIZ_BANK = {
  earthquake:[
    { q:'What should you do FIRST when an earthquake starts?', opts:['Run outside','Drop, Cover, Hold On','Call emergency services','Turn off the gas'], ans:1, exp:'DROP to your knees, take COVER under sturdy furniture, and HOLD ON until shaking stops.' },
    { q:'Which scale measures earthquake magnitude?', opts:['Beaufort Scale','Richter Scale','Fujita Scale','Saffir-Simpson Scale'], ans:1, exp:'The Richter Scale (also Modified Mercalli) measures earthquake magnitude.' },
    { q:'Where is the safest place during an earthquake indoors?', opts:['Near a window','In a doorway','Under a sturdy table','In the center of the room'], ans:2, exp:'Under a sturdy table protects you from falling debris.' },
    { q:'What is an aftershock?', opts:['A warning before earthquake','Shaking after the main earthquake','A type of flood','An underground explosion'], ans:1, exp:'Aftershocks are smaller earthquakes that follow the main event.' },
  ],
  flood:[
    { q:'What is the most dangerous thing to do during a flood?', opts:['Moving to high ground','Walking through floodwater','Calling emergency services','Staying indoors'], ans:1, exp:'Just 15 cm of fast-moving floodwater can knock you off your feet.' },
    { q:'What should you do with drinking water after a flood?', opts:['Drink it directly','Boil it first','Add sugar to it','Freeze it'], ans:1, exp:'Boil water until authorities confirm the supply is safe — floodwater can contaminate supplies.' },
    { q:'Which type of flood develops most quickly?', opts:['River flood','Coastal flood','Flash flood','Groundwater flood'], ans:2, exp:'Flash floods can develop in minutes from intense rainfall.' },
    { q:'What should be in a flood emergency bag?', opts:['Toys and games','Documents, water, food, medicine','Cooking equipment','Heavy tools'], ans:1, exp:'An emergency bag should contain essential documents, water, non-perishable food and medicine.' },
  ],
  fire:[
    { q:'What does the P in PASS stand for?', opts:['Press','Pull','Push','Protect'], ans:1, exp:'P = Pull the pin on the fire extinguisher.' },
    { q:'If caught in a smoke-filled room, you should:', opts:['Stand upright and run','Crawl low under the smoke','Open all windows','Wait for firefighters'], ans:1, exp:'Stay low — clean air is near the floor when smoke fills a room.' },
    { q:'How long should you cool a burn under running water?', opts:['1–2 minutes','10–20 minutes','5 minutes','30 minutes'], ans:1, exp:'Cool a burn under cool running water for 10–20 minutes.' },
    { q:'What should you NEVER put on a burn?', opts:['Sterile bandage','Cool water','Toothpaste or butter','Loose dressing'], ans:2, exp:'Toothpaste, butter or ice can worsen a burn injury.' },
  ],
  cyclone:[
    { q:'Cyclones form over ocean water at what minimum temperature?', opts:['16°C','20°C','26°C','30°C'], ans:2, exp:'Cyclones need warm ocean water of at least 26°C to form and intensify.' },
    { q:'How far in advance does IMD issue a cyclone pre-cyclone watch?', opts:['12 hours','24 hours','48 hours','72 hours'], ans:3, exp:'IMD issues a pre-cyclone watch 72 hours before expected landfall.' },
    { q:'What is the eye of a cyclone?', opts:['The most dangerous part','A calm area in the center','Where rainfall is heaviest','The outer rain bands'], ans:1, exp:'The eye is a calm, clear area at the cyclone\'s center, surrounded by the violent eye wall.' },
    { q:'What is a storm surge?', opts:['Heavy rainfall during cyclone','Rise of sea level due to cyclone winds','Strong winds near shore','Underground water movement'], ans:1, exp:'Storm surge is an abnormal rise in sea level caused by a cyclone\'s winds and low pressure.' },
  ],
};

// ── NAV CONFIG ────────────────────────────────────────────
const NAV = {
  student:['home','learning','practice','games','send-alert','view-alerts','report-incident','profile'],
  teacher:['home','learning','practice','games','send-alert','view-alerts','report-incident','students','profile'],
  admin:  ['home','view-alerts','send-alert','report-incident','students','teachers','profile'],
};
const NAV_META = {
  'home':            { icon:'fa-house',           label:'Home' },
  'learning':        { icon:'fa-book-open',        label:'Learning Modules' },
  'practice':        { icon:'fa-circle-question',  label:'Practice Questions' },
  'games':           { icon:'fa-gamepad',          label:'Educational Games' },
  'send-alert':      { icon:'fa-paper-plane',      label:'Send Alert' },
  'view-alerts':     { icon:'fa-eye',              label:'View Alerts' },
  'report-incident': { icon:'fa-file-lines',       label:'Report Incident' },
  'profile':         { icon:'fa-gear',             label:'Profile Settings' },
  'students':        { icon:'fa-users',            label:'Student Records' },
  'teachers':        { icon:'fa-chalkboard-teacher',label:'Teacher Records' },
};

function buildNav() {
  const nav = document.getElementById('sb-nav');
  nav.innerHTML = '';
  (NAV[user.role] || NAV.student).forEach(id => {
    const m = NAV_META[id];
    const btn = document.createElement('button');
    btn.className = 'nav-item';
    btn.dataset.tab = id;
    btn.innerHTML = `<i class="fas ${m.icon}"></i>${m.label}`;
    btn.onclick = () => goTab(id);
    nav.appendChild(btn);
  });
}

function goTab(id) {
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.tab === id));
  document.getElementById('tb-title').textContent = NAV_META[id]?.label || 'Home';
  document.getElementById('sidebar').classList.remove('open');
  const fn = { home:renderHome, learning:renderLearning, practice:renderPractice,
    games:renderGames, 'send-alert':renderSendAlert, 'view-alerts':renderViewAlerts,
    'report-incident':renderReportIncident, profile:renderProfile,
    students:renderStudents, teachers:renderTeachers }[id];
  document.getElementById('main-content').innerHTML = '';
  if (fn) fn();
  setTimeout(animateFills, 150);
}

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); }
function logout() { sessionStorage.clear(); window.location.href = 'index.html'; }

// ── HOME TAB ──────────────────────────────────────────────
function renderHome() {
  const c = document.getElementById('main-content');
  const modKeys = Object.keys(MODULES);
  const totalChaps = modKeys.reduce((a,k) => a + state.completedChapters[k].length, 0);
  const totalPossible = modKeys.length * 4;
  const pct = Math.round(totalChaps / totalPossible * 100);
  c.innerHTML = `
  <div class="top-cards">
    <div class="top-card">
      <div class="tc-label">Profile <i class="fas fa-envelope"></i></div>
      <div class="tc-name">${user.name}</div>
      <div class="tc-sub">${user.email || ''}</div>
      <div class="tc-badges">
        <span class="tc-badge badge-${user.role}">${user.role.charAt(0).toUpperCase()+user.role.slice(1)}</span>
        ${user.roll ? `<span class="tc-badge badge-roll">Roll: ${user.roll}</span>` : ''}
      </div>
    </div>
    <div class="top-card">
      <div class="tc-label">Total Score <i class="fas fa-trophy"></i></div>
      <div class="tc-big">${state.score}</div>
      <div class="tc-rank">Rank: ${state.score===0?'#Unranked':'#'+Math.max(1,100-Math.floor(state.score/5))}</div>
    </div>
    <div class="top-card">
      <div class="tc-label">Completed Modules <i class="fas fa-book-open"></i></div>
      <div class="tc-big">${state.completedModules}/4</div>
      <div class="tc-progress-wrap">
        <div style="font-size:.72rem;color:#a0aec0;margin-bottom:.25rem">${pct}% complete</div>
        <div class="tc-progress-bar"><div class="tc-progress-fill" data-w="${pct}" style="width:0%"></div></div>
      </div>
    </div>
  </div>

  <div class="sec-card">
    <div class="sec-hd">Recent Achievements</div>
    <div class="sec-sub">Your latest disaster preparedness milestones</div>
    ${state.achievements.length === 0
      ? `<div class="ach-empty">No achievements yet. Complete your first module to get started!</div>`
      : state.achievements.map(a => `<div style="display:flex;align-items:center;gap:.6rem;padding:.5rem 0;border-bottom:1px solid #f0f4f8;font-size:.85rem"><span style="font-size:1.2rem">${a.icon}</span><div><strong>${a.title}</strong><div style="font-size:.75rem;color:#a0aec0">${a.time}</div></div></div>`).join('')}
  </div>

  <div class="sec-card">
    <div class="sec-hd">Learning Progress</div>
    <div class="sec-sub">Your progress across all disaster management modules</div>
    <div class="lp-grid">
      ${modKeys.map(k => {
        const m = MODULES[k];
        const done = state.completedChapters[k].length;
        const p = Math.round(done/4*100);
        return `<div class="lp-item">
          <div class="lp-icon" style="background:${m.color};color:${m.iconColor}">${m.icon}</div>
          <div class="lp-body">
            <div class="lp-name">${m.title}<span class="lp-pct">${p}%</span></div>
            <div class="lp-sub">Chapters: ${done}/4</div>
            <div class="lp-track"><div class="lp-fill" data-w="${p}" style="width:0%;background:${m.iconColor}"></div></div>
          </div>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

// ── LEARNING MODULES TAB ──────────────────────────────────
function renderLearning(selected) {
  const c = document.getElementById('main-content');
  if (selected) {
    const m = MODULES[selected];
    const done = state.completedChapters[selected];
    c.innerHTML = `
    <div style="margin-bottom:1rem">
      <button class="btn-s" onclick="renderLearning()"><i class="fas fa-arrow-left"></i> Back to Modules</button>
    </div>
    <div class="sec-card">
      <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:.5rem">
        <span style="font-size:2rem">${m.icon}</span>
        <div><div class="sec-hd">${m.title}</div><div class="sec-sub">${m.desc}</div></div>
      </div>
      <div class="chap-list">
        ${m.chapters.map((ch,i) => {
          const isDone = done.includes(i);
          return `<div class="chap-item${isDone?' done':''}" onclick="openChapter('${selected}',${i})">
            <div class="chap-num">${isDone?'<i class="fas fa-check"></i>':(i+1)}</div>
            <div class="chap-info">
              <div class="chap-title">${ch.title}</div>
              <div class="chap-sub">${ch.sub}</div>
            </div>
            <i class="fas fa-chevron-right chap-arrow"></i>
          </div>`;
        }).join('')}
      </div>
      <div style="margin-top:1rem" class="btn-row">
        <button class="btn-p" onclick="goTab('practice')"><i class="fas fa-circle-question"></i> Take Practice Quiz</button>
      </div>
    </div>`;
    return;
  }
  c.innerHTML = `
  <div class="sec-card" style="margin-bottom:1.25rem">
    <div class="sec-hd">Learning Modules</div>
    <div class="sec-sub">Select a module to start learning about disaster preparedness</div>
  </div>
  <div class="modules-grid">
    ${Object.keys(MODULES).map(k => {
      const m = MODULES[k]; const done = state.completedChapters[k].length;
      const p = Math.round(done/4*100);
      return `<div class="mod-card" onclick="renderLearning('${k}')">
        <div class="mod-banner" style="background:${m.color}">${m.icon}</div>
        <div class="mod-body">
          <div class="mod-title">${m.title}</div>
          <div class="mod-desc">${m.desc}</div>
          <div style="margin-bottom:.5rem">
            <div style="display:flex;justify-content:space-between;font-size:.72rem;color:#a0aec0;margin-bottom:.2rem">
              <span>Chapters: ${done}/4</span><span>${p}%</span>
            </div>
            <div class="lp-track"><div class="lp-fill" data-w="${p}" style="width:0%;background:${m.iconColor}"></div></div>
          </div>
          <div class="mod-footer">
            <span class="mod-chapters">4 chapters</span>
            <button class="mod-btn">${done===4?'Review':'Start →'}</button>
          </div>
        </div>
      </div>`;
    }).join('')}
  </div>`;
}

function openChapter(modKey, chapIdx) {
  const m = MODULES[modKey]; const ch = m.chapters[chapIdx];
  showModal(`
    <div class="modal-hd">
      <h3>${m.icon} ${ch.title}</h3>
      <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
    </div>
    <div class="chap-content">${ch.content}</div>
    <div class="btn-row" style="margin-top:1rem">
      <button class="btn-p" onclick="markChapterDone('${modKey}',${chapIdx})">
        <i class="fas fa-check"></i> Mark as Complete
      </button>
      <button class="btn-s" onclick="closeModal()">Close</button>
    </div>`);
}

function markChapterDone(modKey, chapIdx) {
  if (!state.completedChapters[modKey].includes(chapIdx)) {
    state.completedChapters[modKey].push(chapIdx);
    state.score += 10;
    const done = state.completedChapters[modKey].length;
    if (done === 4) {
      state.completedModules++;
      state.achievements.push({ icon:'🏆', title:`Completed: ${MODULES[modKey].title}`, time:'Just now' });
      showToast('🏆 Module completed! +40 points', 'success');
    } else {
      showToast('✓ Chapter complete! +10 points', 'success');
    }
  }
  closeModal();
  renderLearning(modKey);
}

// ── PRACTICE QUESTIONS TAB ────────────────────────────────
let quizState = { mod:null, idx:0, answered:[], score:0 };

function renderPractice(mod) {
  const c = document.getElementById('main-content');
  if (!mod) {
    c.innerHTML = `
    <div class="sec-card" style="margin-bottom:1.25rem">
      <div class="sec-hd">Practice Questions</div>
      <div class="sec-sub">Test your knowledge with quizzes for each disaster module</div>
    </div>
    <div class="modules-grid">
      ${Object.keys(MODULES).map(k => {
        const m = MODULES[k]; const best = state.quizScores[k] || 0;
        return `<div class="mod-card" onclick="startQuiz('${k}')">
          <div class="mod-banner" style="background:${m.color}">${m.icon}</div>
          <div class="mod-body">
            <div class="mod-title">${m.title} Quiz</div>
            <div class="mod-desc">4 questions testing your knowledge of ${m.title.toLowerCase()}.</div>
            <div class="mod-footer">
              <span class="mod-chapters">Best: ${best}/4</span>
              <button class="mod-btn">Start Quiz</button>
            </div>
          </div>
        </div>`;
      }).join('')}
    </div>`;
    return;
  }
  const qs = QUIZ_BANK[mod];
  if (quizState.idx >= qs.length) { renderQuizResult(mod); return; }
  const q = qs[quizState.idx];
  const answered = quizState.answered[quizState.idx];
  c.innerHTML = `
  <div style="margin-bottom:1rem;display:flex;align-items:center;gap:.75rem">
    <button class="btn-s" onclick="renderPractice()"><i class="fas fa-arrow-left"></i> Back</button>
    <span style="font-size:.85rem;color:#718096">Question ${quizState.idx+1} of ${qs.length} — ${MODULES[mod].title}</span>
    <span style="margin-left:auto;font-size:.85rem;font-weight:700;color:#1565c0">Score: ${quizState.score}/${qs.length}</span>
  </div>
  <div class="quiz-wrap">
    <div class="quiz-q">
      <div class="quiz-num">Question ${quizState.idx+1}</div>
      <div class="quiz-text">${q.q}</div>
      <div class="quiz-opts">
        ${q.opts.map((opt,i) => {
          let cls = 'quiz-opt';
          if (answered !== undefined) {
            if (i === q.ans) cls += ' correct';
            else if (i === answered && i !== q.ans) cls += ' wrong';
          }
          return `<div class="${cls}" onclick="${answered===undefined?`answerQ('${mod}',${i})`:''}">
            <span style="width:20px;height:20px;border-radius:50%;background:#e2e8f0;display:flex;align-items:center;justify-content:center;font-size:.72rem;font-weight:700;flex-shrink:0">${String.fromCharCode(65+i)}</span>
            ${opt}
          </div>`;
        }).join('')}
      </div>
      ${answered !== undefined ? `<div class="quiz-result ${answered===q.ans?'right':'wrong'}">
        ${answered===q.ans?'✓ Correct!':'✗ Incorrect.'} ${q.exp}
      </div>` : ''}
    </div>
    ${answered !== undefined ? `<button class="btn-p" onclick="nextQ('${mod}')">
      ${quizState.idx+1 < qs.length ? 'Next Question <i class="fas fa-arrow-right"></i>' : 'See Results <i class="fas fa-flag-checkered"></i>'}
    </button>` : ''}
  </div>`;
}

function startQuiz(mod) {
  quizState = { mod, idx:0, answered:[], score:0 };
  renderPractice(mod);
}

function answerQ(mod, chosen) {
  const q = QUIZ_BANK[mod][quizState.idx];
  quizState.answered[quizState.idx] = chosen;
  if (chosen === q.ans) { quizState.score++; state.score += 5; }
  renderPractice(mod);
}

function nextQ(mod) {
  quizState.idx++;
  renderPractice(mod);
}

function renderQuizResult(mod) {
  const c = document.getElementById('main-content');
  const s = quizState.score; const total = QUIZ_BANK[mod].length;
  const prev = state.quizScores[mod] || 0;
  if (s > prev) { state.quizScores[mod] = s; }
  if (s === total && !state.achievements.find(a => a.title.includes('Perfect') && a.title.includes(MODULES[mod].title))) {
    state.achievements.push({ icon:'⭐', title:`Perfect Score: ${MODULES[mod].title}`, time:'Just now' });
  }
  c.innerHTML = `
  <div style="margin-bottom:1rem">
    <button class="btn-s" onclick="renderPractice()"><i class="fas fa-arrow-left"></i> Back to Quizzes</button>
  </div>
  <div class="quiz-wrap">
    <div class="quiz-score">
      <div style="font-size:2.5rem;margin-bottom:.5rem">${s===total?'🏆':s>=total/2?'👍':'📚'}</div>
      <div class="quiz-score-num">${s}/${total}</div>
      <div class="quiz-score-label">${s===total?'Perfect Score! Outstanding!':s>=total/2?'Good job! Keep learning!':'Keep practicing — you\'ll get there!'}</div>
      <div style="font-size:.82rem;color:#718096;margin-bottom:1.25rem">Points earned: +${s*5}</div>
      <div class="btn-row" style="justify-content:center">
        <button class="btn-p" onclick="startQuiz('${mod}')"><i class="fas fa-rotate-right"></i> Retry Quiz</button>
        <button class="btn-s" onclick="renderPractice()">All Quizzes</button>
        <button class="btn-s" onclick="renderLearning('${mod}')"><i class="fas fa-book-open"></i> Review Module</button>
      </div>
    </div>
  </div>`;
}

// ── EDUCATIONAL GAMES TAB ─────────────────────────────────
function renderGames() {
  const c = document.getElementById('main-content');
  c.innerHTML = `
  <div class="sec-card" style="margin-bottom:1.25rem">
    <div class="sec-hd">Educational Games</div>
    <div class="sec-sub">Learn disaster preparedness through interactive games</div>
  </div>
  <div class="games-grid">
    <div class="game-card">
      <div class="game-icon">🎯</div>
      <div class="game-title">Disaster Match</div>
      <div class="game-desc">Match each disaster type with the correct safety action. Test your knowledge in a fun way!</div>
      <button class="game-btn" onclick="playMatchGame()">Play Now</button>
    </div>
    <div class="game-card">
      <div class="game-icon">⏱️</div>
      <div class="game-title">Safety Speed Quiz</div>
      <div class="game-desc">Answer disaster safety questions as fast as you can. Every second counts in an emergency!</div>
      <button class="game-btn" onclick="playSpeedQuiz()">Play Now</button>
    </div>
    <div class="game-card">
      <div class="game-icon">🧩</div>
      <div class="game-title">Emergency Kit Builder</div>
      <div class="game-desc">Drag and drop items to build the perfect emergency kit for different disaster scenarios.</div>
      <button class="game-btn" onclick="playKitBuilder()">Play Now</button>
    </div>
    <div class="game-card">
      <div class="game-icon">🗺️</div>
      <div class="game-title">Evacuation Route Planner</div>
      <div class="game-desc">Find the safest evacuation route through different disaster scenarios on a map.</div>
      <button class="game-btn" onclick="playEvacGame()">Play Now</button>
    </div>
  </div>`;
}

function playMatchGame() {
  const pairs = [
    { disaster:'Earthquake 🛡️', action:'Drop, Cover, Hold On' },
    { disaster:'Flood 🌊',       action:'Move to high ground' },
    { disaster:'Fire 🔥',        action:'Crawl low under smoke' },
    { disaster:'Cyclone 🌀',     action:'Stay indoors away from windows' },
  ];
  let shuffledActions = [...pairs.map(p=>p.action)].sort(()=>Math.random()-.5);
  let selected = null, matched = [], score = 0;

  function render() {
    showModal(`
      <div class="modal-hd">
        <h3>🎯 Disaster Match Game</h3>
        <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
      </div>
      <p style="font-size:.82rem;color:#718096;margin-bottom:1rem">Click a disaster, then click its matching safety action. Score: ${score}/${pairs.length}</p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.6rem" id="match-grid">
        ${pairs.map((p,i) => `<div class="quiz-opt${matched.includes(i)?' correct':''}" 
          style="cursor:${matched.includes(i)?'default':'pointer'}" 
          onclick="${matched.includes(i)?'':'selectDisaster('+i+')'}" id="dis-${i}">
          ${p.disaster}
        </div>`).join('')}
        ${shuffledActions.map((a,i) => {
          const matchIdx = matched.find(m => pairs[m].action===a);
          const isMatched = matched.some(m => pairs[m].action===a);
          return `<div class="quiz-opt${isMatched?' correct':''}"
            style="cursor:${isMatched?'default':'pointer'}"
            onclick="${isMatched?'':'selectAction(\''+a+'\')'}" id="act-${i}">
            ${a}
          </div>`;
        }).join('')}
      </div>
      ${score===pairs.length?`<div class="quiz-result right" style="margin-top:1rem">🏆 Perfect! You matched all correctly! +${score*5} points</div>
        <div class="btn-row" style="margin-top:.75rem"><button class="btn-p" onclick="closeModal();state.score+=${score*5};showToast('🎯 +${score*5} points earned!','success')">Claim Points</button></div>`:''}
    `);
  }

  window.selectDisaster = function(i) {
    selected = {type:'disaster', idx:i};
    document.querySelectorAll('.quiz-opt').forEach(el=>el.classList.remove('selected'));
    document.getElementById('dis-'+i)?.classList.add('selected');
  };
  window.selectAction = function(a) {
    if (!selected || selected.type!=='disaster') { selected={type:'action',val:a}; return; }
    const i = selected.idx;
    if (pairs[i].action===a) { matched.push(i); score++; }
    selected = null;
    render();
  };
  render();
}

function playSpeedQuiz() {
  const allQ = Object.values(QUIZ_BANK).flat().sort(()=>Math.random()-.5).slice(0,6);
  let idx=0, sc=0, timer=15, interval=null;

  function render() {
    if (idx>=allQ.length) {
      clearInterval(interval);
      showModal(`<div class="modal-hd"><h3>⏱️ Speed Quiz Results</h3>
        <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div>
        <div class="quiz-score"><div class="quiz-score-num">${sc}/${allQ.length}</div>
        <div class="quiz-score-label">Speed Quiz Complete! +${sc*8} points</div>
        <div class="btn-row" style="justify-content:center;margin-top:.75rem">
          <button class="btn-p" onclick="closeModal();state.score+=${sc*8};showToast('⏱️ +${sc*8} points!','success')">Claim Points</button>
        </div></div>`);
      return;
    }
    const q = allQ[idx];
    showModal(`<div class="modal-hd"><h3>⏱️ Speed Quiz — Q${idx+1}/${allQ.length}</h3>
      <button class="modal-close" onclick="clearInterval(window._sqInterval);closeModal()"><i class="fas fa-times"></i></button></div>
      <div style="text-align:right;font-size:.85rem;color:${timer<=5?'#dc2626':'#718096'};font-weight:700;margin-bottom:.5rem">⏰ ${timer}s</div>
      <div class="quiz-text" style="margin-bottom:.85rem">${q.q}</div>
      <div class="quiz-opts">${q.opts.map((o,i)=>`<div class="quiz-opt" onclick="window._sqAns(${i})">${o}</div>`).join('')}</div>`);
    clearInterval(interval);
    window._sqInterval = setInterval(()=>{ timer--; if(timer<=0){clearInterval(window._sqInterval);idx++;timer=15;render();} else render(); },1000);
    window._sqAns = function(chosen) {
      clearInterval(window._sqInterval);
      if(chosen===q.ans) sc++;
      idx++; timer=15; render();
    };
  }
  render();
}

function playKitBuilder() {
  const items = ['💧 Water','🍞 Food','🔦 Flashlight','🩹 First Aid Kit','📻 Radio','📄 Documents','💊 Medicine','🔋 Batteries','🧥 Warm Clothes','📞 Phone Charger'];
  const required = ['💧 Water','🍞 Food','🔦 Flashlight','🩹 First Aid Kit','📻 Radio'];
  let picked = [];
  function render() {
    showModal(`<div class="modal-hd"><h3>🧩 Emergency Kit Builder</h3>
      <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div>
      <p style="font-size:.82rem;color:#718096;margin-bottom:.75rem">Select the 5 essential items for an emergency kit:</p>
      <div style="display:flex;flex-wrap:wrap;gap:.45rem;margin-bottom:1rem">
        ${items.map(item=>`<div class="quiz-opt${picked.includes(item)?' selected':''}" 
          style="padding:.4rem .75rem;cursor:pointer;font-size:.8rem" 
          onclick="window._toggleItem('${item}')">${item}</div>`).join('')}
      </div>
      <div style="font-size:.8rem;color:#718096;margin-bottom:.75rem">Selected: ${picked.length}/5</div>
      ${picked.length===5?`<button class="btn-p" onclick="window._checkKit()"><i class="fas fa-check"></i> Check My Kit</button>`:''}
    `);
  }
  window._toggleItem = function(item) {
    if (picked.includes(item)) picked=picked.filter(i=>i!==item);
    else if (picked.length<5) picked.push(item);
    render();
  };
  window._checkKit = function() {
    const correct = required.filter(r=>picked.includes(r)).length;
    const pts = correct*10;
    showModal(`<div class="modal-hd"><h3>🧩 Kit Results</h3>
      <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div>
      <div class="quiz-score">
        <div class="quiz-score-num">${correct}/5</div>
        <div class="quiz-score-label">Essential items correctly selected</div>
        <div style="font-size:.82rem;color:#718096;margin:.5rem 0 1rem">Essential items: ${required.join(', ')}</div>
        <button class="btn-p" onclick="closeModal();state.score+=${pts};showToast('🧩 +${pts} points!','success')">Claim ${pts} Points</button>
      </div>`);
  };
  render();
}

function playEvacGame() {
  const scenarios = [
    { q:'There is a fire in the school building. Which route do you take?', opts:['Use the elevator','Take the nearest staircase exit','Wait for instructions in the classroom','Go to the roof'], ans:1, exp:'Always use stairs during a fire — elevators can trap you.' },
    { q:'A flood warning is issued near your home. Where do you go?', opts:['Stay at home','Move to the basement','Head to the nearest high ground or shelter','Wait and watch the water level'], ans:2, exp:'Always move to high ground during a flood warning.' },
    { q:'An earthquake strikes while you are in the library. What is your first action?', opts:['Run to the exit','Drop under the desk and hold on','Call your parents','Open the windows'], ans:1, exp:'Drop, Cover, and Hold On under sturdy furniture.' },
  ];
  let idx=0, sc=0;
  function render() {
    if(idx>=scenarios.length){
      showModal(`<div class="modal-hd"><h3>🗺️ Evacuation Results</h3>
        <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div>
        <div class="quiz-score"><div class="quiz-score-num">${sc}/${scenarios.length}</div>
        <div class="quiz-score-label">Evacuation scenarios completed! +${sc*10} points</div>
        <button class="btn-p" style="margin-top:.75rem" onclick="closeModal();state.score+=${sc*10};showToast('🗺️ +${sc*10} points!','success')">Claim Points</button></div>`);
      return;
    }
    const s=scenarios[idx];
    showModal(`<div class="modal-hd"><h3>🗺️ Scenario ${idx+1}/${scenarios.length}</h3>
      <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div>
      <div class="quiz-text" style="margin-bottom:.85rem">${s.q}</div>
      <div class="quiz-opts">${s.opts.map((o,i)=>`<div class="quiz-opt" onclick="window._evacAns(${i})">${o}</div>`).join('')}</div>`);
    window._evacAns=function(chosen){
      if(chosen===s.ans)sc++;
      showModal(`<div class="modal-hd"><h3>🗺️ Scenario ${idx+1}/${scenarios.length}</h3>
        <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div>
        <div class="quiz-text" style="margin-bottom:.85rem">${s.q}</div>
        <div class="quiz-opts">${s.opts.map((o,i)=>`<div class="quiz-opt ${i===s.ans?'correct':i===chosen&&chosen!==s.ans?'wrong':''}">${o}</div>`).join('')}</div>
        <div class="quiz-result ${chosen===s.ans?'right':'wrong'}" style="margin-top:.5rem">${chosen===s.ans?'✓ Correct!':'✗ Incorrect.'} ${s.exp}</div>
        <button class="btn-p" style="margin-top:.75rem" onclick="window._evacNext()">Next <i class="fas fa-arrow-right"></i></button>`);
    };
    window._evacNext=function(){idx++;render();};
  }
  render();
}

// ── SEND ALERT TAB ────────────────────────────────────────
function renderSendAlert() {
  const c = document.getElementById('main-content');
  c.innerHTML = `
  <div class="form-card">
    <div class="sec-hd" style="margin-bottom:.25rem">Send Alert</div>
    <div class="sec-sub">Broadcast an emergency alert to all users</div>
    <div class="form-row">
      <div class="fg"><label>Alert Type</label>
        <select id="al-type">
          <option value="critical">🔴 Critical Emergency</option>
          <option value="warning">🟡 Warning</option>
          <option value="info">🔵 Information</option>
          <option value="safe">🟢 All-Clear</option>
        </select></div>
      <div class="fg"><label>Affected Zone</label>
        <select id="al-zone">
          <option>Zone A</option><option>Zone B</option><option>Zone C</option>
          <option>Zone D</option><option>Zone E</option><option>All Zones</option>
        </select></div>
    </div>
    <div class="fg"><label>Alert Title</label>
      <input type="text" id="al-title" placeholder="e.g. Flash Flood Warning — Zone A"/></div>
    <div class="fg"><label>Description</label>
      <textarea id="al-desc" rows="4" placeholder="Describe the situation clearly. Include what people should do immediately..."></textarea></div>
    <div class="btn-row">
      <button class="btn-p" onclick="sendAlert()"><i class="fas fa-paper-plane"></i> Send Alert</button>
      <button class="btn-s" onclick="document.getElementById('al-title').value='';document.getElementById('al-desc').value=''">
        <i class="fas fa-rotate-left"></i> Clear</button>
    </div>
  </div>`;
}

function sendAlert() {
  const title = document.getElementById('al-title').value.trim();
  const desc  = document.getElementById('al-desc').value.trim();
  if (!title) { showToast('Please enter an alert title.', 'error'); return; }
  if (!desc)  { showToast('Please enter a description.', 'error'); return; }
  const type = document.getElementById('al-type').value;
  const zone = document.getElementById('al-zone').value;
  const icons = { critical:'fa-triangle-exclamation', warning:'fa-circle-exclamation', info:'fa-circle-info', safe:'fa-shield-halved' };
  state.alerts.unshift({ id:Date.now(), type, icon:icons[type], title, desc, time:'Just now', zone });
  showToast('✓ Alert sent to all users!', 'success');
  document.getElementById('al-title').value = '';
  document.getElementById('al-desc').value  = '';
}

// ── VIEW ALERTS TAB ───────────────────────────────────────
function renderViewAlerts() {
  const c = document.getElementById('main-content');
  c.innerHTML = `
  <div class="sec-card" style="margin-bottom:1.25rem">
    <div class="sec-hd">Active Alerts & Warnings</div>
    <div class="sec-sub">${state.alerts.length} alert(s) — stay informed and follow instructions</div>
  </div>
  ${state.alerts.map(a => `
    <div class="alert-item ${a.type}">
      <i class="fas ${a.icon} ai-icon"></i>
      <div style="flex:1">
        <div class="ai-title">${a.title}
          <span class="badge ${a.type==='critical'?'bc':a.type==='warning'?'bw':a.type==='safe'?'bs':'bi'}">${a.type.toUpperCase()}</span>
        </div>
        <div class="ai-desc">${a.desc}</div>
        <div class="ai-time"><i class="fas fa-clock"></i>${a.time}&nbsp;·&nbsp;<i class="fas fa-location-dot"></i>${a.zone}</div>
      </div>
    </div>`).join('')}`;
}

// ── REPORT INCIDENT TAB ───────────────────────────────────
function renderReportIncident() {
  const c = document.getElementById('main-content');
  if (user.role === 'admin') {
    c.innerHTML = `
    <div class="sec-card" style="margin-bottom:1.25rem">
      <div class="sec-hd">Incident Reports</div>
      <div class="sec-sub">${state.incidents.length} incident(s) reported</div>
    </div>
    ${state.incidents.length === 0
      ? `<div class="sec-card"><div class="ach-empty" style="padding:2rem;text-align:center"><i class="fas fa-file-lines" style="font-size:2rem;color:#e2e8f0;display:block;margin-bottom:.5rem"></i>No incidents reported yet.</div></div>`
      : state.incidents.map((inc,i) => `
        <div class="alert-item ${inc.severity}" style="background:#fff;border:1px solid #e2e8f0">
          <i class="fas fa-file-lines ai-icon" style="color:#718096"></i>
          <div>
            <div class="ai-title">${inc.type} — ${inc.location}</div>
            <div class="ai-desc">${inc.desc}</div>
            <div class="ai-time"><i class="fas fa-user"></i>${inc.by}&nbsp;·&nbsp;<i class="fas fa-clock"></i>${inc.time}</div>
          </div>
        </div>`).join('')}`;
    return;
  }
  c.innerHTML = `
  <div class="form-card">
    <div class="sec-hd" style="margin-bottom:.25rem">Report an Incident</div>
    <div class="sec-sub">Submit a report about a disaster or emergency situation</div>
    <div class="form-row">
      <div class="fg"><label>Incident Type</label>
        <select id="rp-type">
          <option>Flood</option><option>Fire</option><option>Earthquake</option>
          <option>Cyclone</option><option>Wind Damage</option>
          <option>Power Outage</option><option>Medical Emergency</option><option>Other</option>
        </select></div>
      <div class="fg"><label>Location / Zone</label>
        <input type="text" id="rp-loc" placeholder="e.g. Zone B, Near School Gate"/></div>
    </div>
    <div class="fg"><label>Description</label>
      <textarea id="rp-desc" rows="4" placeholder="Describe what you observed — include time, number of people affected, and immediate needs..."></textarea></div>
    <div class="form-row">
      <div class="fg"><label>Severity</label>
        <select id="rp-sev">
          <option value="info">Low — Informational</option>
          <option value="warning">Medium — Caution needed</option>
          <option value="critical">High — Immediate action required</option>
        </select></div>
      <div class="fg"><label>Your Contact Number</label>
        <input type="text" id="rp-phone" placeholder="For follow-up contact"/></div>
    </div>
    <div class="btn-row">
      <button class="btn-p" onclick="submitIncident()"><i class="fas fa-paper-plane"></i> Submit Report</button>
      <button class="btn-s" onclick="clearRpForm()"><i class="fas fa-rotate-left"></i> Clear</button>
    </div>
  </div>`;
}

function submitIncident() {
  const desc = document.getElementById('rp-desc').value.trim();
  const loc  = document.getElementById('rp-loc').value.trim();
  if (!desc || !loc) { showToast('Please fill location and description.', 'error'); return; }
  state.incidents.unshift({
    type: document.getElementById('rp-type').value,
    location: loc, desc,
    severity: document.getElementById('rp-sev').value,
    by: user.name, time: 'Just now'
  });
  showToast('✓ Incident report submitted!', 'success');
  clearRpForm();
}
function clearRpForm() {
  ['rp-desc','rp-loc','rp-phone'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
}

// ── PROFILE SETTINGS TAB ─────────────────────────────────
function renderProfile() {
  const c = document.getElementById('main-content');
  c.innerHTML = `
  <div class="profile-grid">
    <div>
      <div class="profile-card">
        <div class="profile-avatar-big">${user.name[0].toUpperCase()}</div>
        <div class="profile-name">${user.name}</div>
        <div class="profile-role-badge">${user.role.charAt(0).toUpperCase()+user.role.slice(1)}</div>
        <div class="profile-info-row"><i class="fas fa-envelope"></i>${user.email||'—'}</div>
        ${user.roll ? `<div class="profile-info-row"><i class="fas fa-id-card"></i>Roll: ${user.roll}</div>` : ''}
        <div class="profile-info-row"><i class="fas fa-school"></i>${user.school||'—'}</div>
        <div class="profile-info-row"><i class="fas fa-trophy"></i>Score: ${state.score} pts</div>
        <div class="profile-info-row"><i class="fas fa-book-open"></i>${state.completedModules}/4 modules done</div>
      </div>
    </div>
    <div>
      <div class="form-card">
        <div class="sec-hd" style="margin-bottom:.25rem">Edit Profile</div>
        <div class="sec-sub">Update your personal information</div>
        <div class="fg"><label>Full Name</label><input type="text" id="pf-name" value="${user.name}"/></div>
        <div class="fg"><label>Email</label><input type="email" id="pf-email" value="${user.email||''}"/></div>
        ${user.roll ? `<div class="fg"><label>Roll Number</label><input type="text" id="pf-roll" value="${user.roll}" readonly style="background:#f0f4f8;color:#a0aec0"/></div>` : ''}
        <div class="fg"><label>School</label><input type="text" id="pf-school" value="${user.school||''}"/></div>
        <div class="btn-row">
          <button class="btn-p" onclick="saveProfile()"><i class="fas fa-floppy-disk"></i> Save Changes</button>
        </div>
      </div>
      <div class="form-card">
        <div class="sec-hd" style="margin-bottom:.25rem">Change Password</div>
        <div class="fg"><label>Current Password</label><input type="password" id="pf-curr" placeholder="Current password"/></div>
        <div class="fg"><label>New Password</label><input type="password" id="pf-new" placeholder="New password"/></div>
        <div class="fg"><label>Confirm Password</label><input type="password" id="pf-conf" placeholder="Confirm new password"/></div>
        <button class="btn-p" onclick="changePassword()"><i class="fas fa-lock"></i> Update Password</button>
      </div>
    </div>
  </div>`;
}

function saveProfile() {
  user.name   = document.getElementById('pf-name').value.trim()  || user.name;
  user.email  = document.getElementById('pf-email').value.trim() || user.email;
  user.school = document.getElementById('pf-school').value.trim()|| user.school;
  sessionStorage.setItem('dp_user', JSON.stringify(user));
  document.getElementById('tb-avatar').textContent = user.name[0].toUpperCase();
  showToast('✓ Profile updated!', 'success');
  renderProfile();
}

function changePassword() {
  const curr = document.getElementById('pf-curr').value.trim();
  const nw   = document.getElementById('pf-new').value.trim();
  const conf = document.getElementById('pf-conf').value.trim();
  if (!curr || !nw) { showToast('Please fill all password fields.', 'error'); return; }
  if (nw !== conf)  { showToast('New passwords do not match.', 'error'); return; }
  if (nw.length < 6){ showToast('Password must be at least 6 characters.', 'error'); return; }
  showToast('✓ Password updated successfully!', 'success');
  ['pf-curr','pf-new','pf-conf'].forEach(id => document.getElementById(id).value='');
}

// ── STUDENTS TAB ─────────────────────────────────────────
function renderStudents() {
  const c = document.getElementById('main-content');
  c.innerHTML = `
  ${user.role==='admin'?`<div class="form-card">
    <div class="sec-hd" style="margin-bottom:.25rem">Add Student Record</div>
    <div class="form-row">
      <div class="fg"><label>Full Name</label><input type="text" id="st-name" placeholder="Student name"/></div>
      <div class="fg"><label>Roll Number</label><input type="text" id="st-roll" placeholder="e.g. 21CS009"/></div>
    </div>
    <div class="form-row">
      <div class="fg"><label>Class</label><input type="text" id="st-cls" placeholder="e.g. 10-A"/></div>
      <div class="fg"><label>Zone</label>
        <select id="st-zone"><option>Zone A</option><option>Zone B</option><option>Zone C</option><option>Zone D</option><option>Zone E</option></select></div>
    </div>
    <button class="btn-p" onclick="addStudent()"><i class="fas fa-plus"></i> Add Student</button>
  </div>`:''}
  <div class="sec-card">
    <div class="sec-hd" style="margin-bottom:.25rem">Student Records</div>
    <div class="sec-sub">${state.students.length} students</div>
    <div class="tbl-wrap"><table>
      <thead><tr><th>Name</th><th>Roll No.</th><th>Class</th><th>Zone</th><th>Status</th></tr></thead>
      <tbody>${state.students.map(s=>`<tr>
        <td><strong>${s.name}</strong></td><td style="color:#718096">${s.roll}</td>
        <td>${s.cls}</td><td>${s.zone}</td>
        <td><span class="badge ${s.status==='safe'?'bs':s.status==='danger'?'bc':'bw'}">${s.status.toUpperCase()}</span></td>
      </tr>`).join('')}</tbody>
    </table></div>
  </div>`;
}

function addStudent() {
  const name=document.getElementById('st-name').value.trim();
  const roll=document.getElementById('st-roll').value.trim();
  if (!name||!roll){showToast('Please fill name and roll number.','error');return;}
  state.students.push({name,roll,cls:document.getElementById('st-cls').value||'—',zone:document.getElementById('st-zone').value,status:'safe'});
  showToast('✓ Student added!','success'); renderStudents();
}

// ── TEACHERS TAB (admin only) ─────────────────────────────
function renderTeachers() {
  const c = document.getElementById('main-content');
  c.innerHTML = `
  <div class="form-card">
    <div class="sec-hd" style="margin-bottom:.25rem">Add Teacher Credentials</div>
    <div class="sec-sub">Admin sets credentials; teachers use these to create their accounts</div>
    <div class="form-row">
      <div class="fg"><label>Teacher Email</label><input type="email" id="tc-email" placeholder="teacher@school.edu"/></div>
      <div class="fg"><label>Assign Password</label><input type="password" id="tc-pass" placeholder="Set a password"/></div>
    </div>
    <div class="form-row">
      <div class="fg"><label>School Name</label><input type="text" id="tc-school" placeholder="School name"/></div>
      <div class="fg"><label>Department</label><input type="text" id="tc-dept" placeholder="e.g. Science"/></div>
    </div>
    <button class="btn-p" onclick="addTeacher()"><i class="fas fa-user-plus"></i> Add Teacher</button>
  </div>
  <div class="sec-card">
    <div class="sec-hd" style="margin-bottom:.25rem">Registered Teachers</div>
    <div class="sec-sub">${state.teachers.length} teachers</div>
    <div class="tbl-wrap"><table>
      <thead><tr><th>Email</th><th>School</th><th>Department</th><th>Status</th><th>Action</th></tr></thead>
      <tbody id="tc-tbody">${state.teachers.map((t,i)=>`<tr>
        <td>${t.email}</td><td>${t.school}</td><td>${t.dept}</td>
        <td><span class="badge ${t.status==='active'?'bs':'bw'}">${t.status.toUpperCase()}</span></td>
        <td><button class="btn-d" onclick="removeTeacher(${i})"><i class="fas fa-trash"></i></button></td>
      </tr>`).join('')}</tbody>
    </table></div>
  </div>`;
}

function addTeacher() {
  const email=document.getElementById('tc-email').value.trim();
  const pass=document.getElementById('tc-pass').value.trim();
  const school=document.getElementById('tc-school').value.trim();
  if(!email||!pass||!school){showToast('Please fill email, password and school.','error');return;}
  state.teachers.push({email,school,dept:document.getElementById('tc-dept').value||'General',status:'pending'});
  showToast('✓ Teacher credential added!','success'); renderTeachers();
}

function removeTeacher(i) {
  state.teachers.splice(i,1);
  showToast('Teacher removed.','success'); renderTeachers();
}

// ── UTILITIES ─────────────────────────────────────────────
function animateFills() {
  document.querySelectorAll('[data-w]').forEach(el => { el.style.width = el.dataset.w + '%'; });
}

function showToast(msg, type='success') {
  const t = document.getElementById('toast');
  t.textContent = msg; t.className = `toast ${type}`;
  t.classList.remove('dn');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.add('dn'), 3000);
}

function showModal(html) {
  document.getElementById('modal-box').innerHTML = html;
  document.getElementById('modal-overlay').classList.remove('dn');
}
function closeModal() {
  document.getElementById('modal-overlay').classList.add('dn');
}

// ── INIT ─────────────────────────────────────────────────
document.getElementById('tb-avatar').textContent = user.name[0].toUpperCase();
buildNav();
goTab('home');
