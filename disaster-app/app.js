/* ============================================================
   DisasterShield — School Disaster Management App
   Built by Sindhu Chirumamilla
============================================================ */

let currentRole = 'student';
let currentUser = {};

// ── Role switching ────────────────────────────────────────
function setRole(role) {
  currentRole = role;
  document.querySelectorAll('.role-tab').forEach(t => t.classList.toggle('active', t.dataset.role === role));
  document.getElementById('student-fields').classList.toggle('hidden', role !== 'student');
  document.getElementById('teacher-fields').classList.toggle('hidden', role !== 'teacher');
  document.getElementById('admin-fields').classList.toggle('hidden',   role !== 'admin');
}

// ── Login ─────────────────────────────────────────────────
function handleLogin(e) {
  e.preventDefault();
  const errEl = document.getElementById('auth-error');
  errEl.classList.add('hidden');

  if (currentRole === 'student') {
    const roll   = document.getElementById('roll').value.trim();
    const school = document.getElementById('school-s').value.trim();
    const pass   = document.getElementById('pass-s').value.trim();
    if (!roll || !school || !pass) { showErr('Please fill all fields.'); return; }
    currentUser = { name: roll, role: 'Student', school, avatar: roll[0].toUpperCase() };
  } else if (currentRole === 'teacher') {
    const email  = document.getElementById('email-t').value.trim();
    const school = document.getElementById('school-t').value.trim();
    const pass   = document.getElementById('pass-t').value.trim();
    if (!email || !school || !pass) { showErr('Please fill all fields.'); return; }
    currentUser = { name: email.split('@')[0], role: 'Teacher', school, avatar: email[0].toUpperCase() };
  } else {
    const email = document.getElementById('email-a').value.trim();
    const pass  = document.getElementById('pass-a').value.trim();
    if (!email || !pass) { showErr('Please fill all fields.'); return; }
    currentUser = { name: 'Admin', role: 'Admin', school: 'District HQ', avatar: 'A' };
  }

  showDashboard();
}

function showErr(msg) {
  const el = document.getElementById('auth-error');
  el.textContent = msg; el.classList.remove('hidden');
}

// ── Dashboard ─────────────────────────────────────────────
function showDashboard() {
  document.getElementById('auth-screen').classList.remove('active');
  const dash = document.getElementById('dashboard-screen');
  dash.classList.add('active');

  document.getElementById('topbar-avatar').textContent = currentUser.avatar;
  document.getElementById('user-badge').innerHTML =
    `<strong>${currentUser.name}</strong>${currentUser.role} · ${currentUser.school}`;

  buildNav();
  showTab('home');
}

function logout() {
  document.getElementById('dashboard-screen').classList.remove('active');
  document.getElementById('auth-screen').classList.add('active');
  document.getElementById('auth-form').reset();
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ── Navigation ────────────────────────────────────────────
const NAV = {
  student: [
    { id:'home',      icon:'fa-house',           label:'Dashboard' },
    { id:'alerts',    icon:'fa-bell',             label:'Alerts' },
    { id:'map',       icon:'fa-map-location-dot', label:'Affected Areas' },
    { id:'resources', icon:'fa-box-open',         label:'Resources' },
    { id:'contacts',  icon:'fa-phone-volume',     label:'Emergency Contacts' },
  ],
  teacher: [
    { id:'home',      icon:'fa-house',            label:'Dashboard' },
    { id:'alerts',    icon:'fa-bell',             label:'Alerts' },
    { id:'students',  icon:'fa-users',            label:'Student Roll' },
    { id:'map',       icon:'fa-map-location-dot', label:'Affected Areas' },
    { id:'resources', icon:'fa-box-open',         label:'Resources' },
    { id:'contacts',  icon:'fa-phone-volume',     label:'Emergency Contacts' },
    { id:'report',    icon:'fa-file-alt',         label:'Submit Report' },
  ],
  admin: [
    { id:'home',      icon:'fa-house',            label:'Dashboard' },
    { id:'alerts',    icon:'fa-bell',             label:'Manage Alerts' },
    { id:'map',       icon:'fa-map-location-dot', label:'Affected Areas' },
    { id:'resources', icon:'fa-box-open',         label:'Resources' },
    { id:'teachers',  icon:'fa-chalkboard-teacher',label:'Teacher Records' },
    { id:'students',  icon:'fa-users',            label:'Student Records' },
    { id:'contacts',  icon:'fa-phone-volume',     label:'Emergency Contacts' },
    { id:'report',    icon:'fa-chart-bar',        label:'Reports' },
  ],
};

function buildNav() {
  const nav = document.getElementById('sidebar-nav');
  nav.innerHTML = '';
  (NAV[currentRole] || NAV.student).forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'nav-item';
    btn.dataset.tab = item.id;
    btn.innerHTML = `<i class="fas ${item.icon}"></i>${item.label}`;
    btn.onclick = () => showTab(item.id);
    nav.appendChild(btn);
  });
}

function showTab(id) {
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.tab === id));
  const titles = { home:'Dashboard', alerts:'Alerts & Warnings', map:'Affected Areas',
    resources:'Resource Management', contacts:'Emergency Contacts',
    students:'Student Records', teachers:'Teacher Records', report:'Reports' };
  document.getElementById('topbar-title').textContent = titles[id] || 'Dashboard';
  document.getElementById('sidebar').classList.remove('open');
  renderTab(id);
}

// ── Tab Renderers ─────────────────────────────────────────
function renderTab(id) {
  const c = document.getElementById('main-content');
  switch(id) {
    case 'home':      c.innerHTML = renderHome();      break;
    case 'alerts':    c.innerHTML = renderAlerts();    break;
    case 'map':       c.innerHTML = renderMap();       break;
    case 'resources': c.innerHTML = renderResources(); break;
    case 'contacts':  c.innerHTML = renderContacts();  break;
    case 'students':  c.innerHTML = renderStudents();  break;
    case 'teachers':  c.innerHTML = renderTeachers();  break;
    case 'report':    c.innerHTML = renderReport();    break;
    default:          c.innerHTML = renderHome();
  }
  animateBars();
}

// ── HOME ──────────────────────────────────────────────────
function renderHome() {
  const isAdmin = currentRole === 'admin';
  return `
  <div class="stats-row">
    <div class="stat-w">
      <div class="stat-w-top">
        <div class="stat-w-icon" style="background:rgba(220,38,38,.15)"><i class="fas fa-triangle-exclamation" style="color:#DC2626"></i></div>
      </div>
      <div class="stat-w-num" style="color:#DC2626">3</div>
      <div class="stat-w-label">Active Alerts</div>
    </div>
    <div class="stat-w">
      <div class="stat-w-top">
        <div class="stat-w-icon" style="background:rgba(245,158,11,.15)"><i class="fas fa-map-pin" style="color:#F59E0B"></i></div>
      </div>
      <div class="stat-w-num" style="color:#F59E0B">5</div>
      <div class="stat-w-label">Affected Zones</div>
    </div>
    <div class="stat-w">
      <div class="stat-w-top">
        <div class="stat-w-icon" style="background:rgba(6,182,212,.15)"><i class="fas fa-box-open" style="color:#06B6D4"></i></div>
      </div>
      <div class="stat-w-num" style="color:#06B6D4">142</div>
      <div class="stat-w-label">Resources Available</div>
    </div>
    ${isAdmin ? `<div class="stat-w">
      <div class="stat-w-top">
        <div class="stat-w-icon" style="background:rgba(34,197,94,.15)"><i class="fas fa-users" style="color:#22c55e"></i></div>
      </div>
      <div class="stat-w-num" style="color:#22c55e">1,240</div>
      <div class="stat-w-label">Students Registered</div>
    </div>` : ''}
  </div>

  <div class="card">
    <div class="section-title-dash"><i class="fas fa-bell" style="color:#DC2626;margin-right:.4rem"></i>Recent Alerts</div>
    ${alertsData().slice(0,3).map(a => alertHTML(a)).join('')}
  </div>

  <div class="card">
    <div class="section-title-dash"><i class="fas fa-box-open" style="color:#06B6D4;margin-right:.4rem"></i>Resource Status</div>
    ${resourcesData().map(r => `
      <div class="resource-bar">
        <div class="resource-bar-top"><span>${r.name}</span><span style="color:#8B949E">${r.qty} / ${r.total}</span></div>
        <div class="resource-track"><div class="resource-fill" data-pct="${Math.round(r.qty/r.total*100)}" style="width:0%;background:${r.color}"></div></div>
      </div>`).join('')}
  </div>`;
}

// ── DATA ─────────────────────────────────────────────────
function alertsData() {
  return [
    { type:'critical', icon:'fa-fire',            title:'Wildfire Alert — Zone C',         desc:'Wildfire spreading toward residential areas. Immediate evacuation required.',    time:'2 min ago' },
    { type:'warning',  icon:'fa-cloud-showers-heavy', title:'Flash Flood Warning — Zone A', desc:'Heavy rainfall expected. Low-lying areas should prepare for flooding.',          time:'15 min ago' },
    { type:'info',     icon:'fa-wind',             title:'Strong Wind Advisory — Zone B',  desc:'Wind speeds up to 80 km/h. Secure outdoor objects.',                             time:'1 hr ago' },
    { type:'critical', icon:'fa-bolt',             title:'Power Outage — Zone D',          desc:'Complete power failure reported. Backup generators deployed.',                   time:'2 hr ago' },
    { type:'info',     icon:'fa-shield-halved',    title:'All-Clear — Zone E',             desc:'Situation stabilized. Normal operations resumed.',                               time:'3 hr ago' },
  ];
}

function resourcesData() {
  return [
    { name:'Food Packets',    qty:320, total:500, color:'#22c55e' },
    { name:'Water Supplies',  qty:210, total:400, color:'#06B6D4' },
    { name:'Medical Kits',    qty:85,  total:150, color:'#F59E0B' },
    { name:'Blankets',        qty:180, total:300, color:'#7C3AED' },
    { name:'Rescue Vehicles', qty:12,  total:20,  color:'#DC2626' },
  ];
}

function alertHTML(a) {
  return `<div class="alert-item ${a.type}">
    <i class="fas ${a.icon} alert-icon"></i>
    <div>
      <div class="alert-title">${a.title} <span class="badge badge-${a.type==='critical'?'critical':a.type==='warning'?'warning':'safe'}">${a.type.toUpperCase()}</span></div>
      <div class="alert-desc">${a.desc}</div>
      <div class="alert-time"><i class="fas fa-clock"></i> ${a.time}</div>
    </div>
  </div>`;
}

// ── ALERTS TAB ────────────────────────────────────────────
function renderAlerts() {
  const canCreate = currentRole !== 'student';
  return `
  ${canCreate ? `<div class="card">
    <div class="section-title-dash">Broadcast New Alert</div>
    <div class="d-form-row">
      <div class="d-form-group"><label>Alert Type</label>
        <select><option>Critical</option><option>Warning</option><option>Info</option></select></div>
      <div class="d-form-group"><label>Zone</label>
        <select><option>Zone A</option><option>Zone B</option><option>Zone C</option><option>Zone D</option><option>All Zones</option></select></div>
    </div>
    <div class="d-form-group" style="margin-bottom:.75rem"><label>Alert Title</label><input type="text" placeholder="e.g. Flood Warning" /></div>
    <div class="d-form-group" style="margin-bottom:.75rem"><label>Description</label><textarea rows="3" placeholder="Describe the situation..."></textarea></div>
    <button class="btn-primary-d" onclick="showToast('Alert broadcasted to all users!')"><i class="fas fa-bullhorn"></i> Broadcast Alert</button>
  </div>` : ''}
  <div class="card">
    <div class="section-title-dash">All Active Alerts</div>
    ${alertsData().map(a => alertHTML(a)).join('')}
  </div>`;
}

// ── MAP TAB ───────────────────────────────────────────────
function renderMap() {
  return `<div class="card">
    <div class="section-title-dash"><i class="fas fa-map-location-dot" style="color:#06B6D4;margin-right:.4rem"></i>Affected Area Map</div>
    <div class="map-box">
      <i class="fas fa-location-dot map-pin"></i>
      <i class="fas fa-location-dot map-pin"></i>
      <i class="fas fa-location-dot map-pin"></i>
      <i class="fas fa-map" style="font-size:3rem;opacity:.15;position:absolute"></i>
      <div style="position:relative;text-align:center">
        <p style="font-weight:700;font-size:1rem">Live Disaster Map</p>
        <p style="font-size:.8rem;color:#8B949E;margin-top:.3rem">5 active zones being monitored</p>
      </div>
    </div>
    <table class="data-table">
      <thead><tr><th>Zone</th><th>Type</th><th>Status</th><th>Affected</th></tr></thead>
      <tbody>
        <tr><td>Zone A</td><td>Flood</td><td><span class="badge badge-critical">Danger</span></td><td>~2,400 people</td></tr>
        <tr><td>Zone B</td><td>Wind</td><td><span class="badge badge-warning">Caution</span></td><td>~1,100 people</td></tr>
        <tr><td>Zone C</td><td>Wildfire</td><td><span class="badge badge-critical">Danger</span></td><td>~860 people</td></tr>
        <tr><td>Zone D</td><td>Power Outage</td><td><span class="badge badge-warning">Caution</span></td><td>~3,200 people</td></tr>
        <tr><td>Zone E</td><td>—</td><td><span class="badge badge-safe">Safe</span></td><td>—</td></tr>
      </tbody>
    </table>
  </div>`;
}

// ── RESOURCES TAB ─────────────────────────────────────────
function renderResources() {
  const canEdit = currentRole !== 'student';
  return `
  ${canEdit ? `<div class="card">
    <div class="section-title-dash">Add / Update Resource</div>
    <div class="d-form-row">
      <div class="d-form-group"><label>Resource Name</label><input type="text" placeholder="e.g. Water Bottles" /></div>
      <div class="d-form-group"><label>Quantity</label><input type="number" placeholder="100" /></div>
    </div>
    <div class="d-form-row">
      <div class="d-form-group"><label>Location / Zone</label>
        <select><option>Zone A</option><option>Zone B</option><option>Zone C</option><option>Central Warehouse</option></select></div>
      <div class="d-form-group"><label>Status</label>
        <select><option>Available</option><option>Dispatched</option><option>Low Stock</option></select></div>
    </div>
    <button class="btn-primary-d" onclick="showToast('Resource updated successfully!')"><i class="fas fa-floppy-disk"></i> Save Resource</button>
  </div>` : ''}
  <div class="card">
    <div class="section-title-dash">Current Inventory</div>
    <table class="data-table">
      <thead><tr><th>Resource</th><th>Available</th><th>Total</th><th>Status</th></tr></thead>
      <tbody>
        <tr><td>Food Packets</td><td>320</td><td>500</td><td><span class="badge badge-safe">Good</span></td></tr>
        <tr><td>Water Supplies</td><td>210</td><td>400</td><td><span class="badge badge-warning">Moderate</span></td></tr>
        <tr><td>Medical Kits</td><td>85</td><td>150</td><td><span class="badge badge-warning">Moderate</span></td></tr>
        <tr><td>Blankets</td><td>180</td><td>300</td><td><span class="badge badge-safe">Good</span></td></tr>
        <tr><td>Rescue Vehicles</td><td>12</td><td>20</td><td><span class="badge badge-critical">Low</span></td></tr>
      </tbody>
    </table>
  </div>`;
}

// ── CONTACTS TAB ─────────────────────────────────────────
function renderContacts() {
  return `<div class="card">
    <div class="section-title-dash"><i class="fas fa-phone-volume" style="color:#22c55e;margin-right:.4rem"></i>Emergency Contacts</div>
    <table class="data-table">
      <thead><tr><th>Name</th><th>Role</th><th>Contact</th><th>Zone</th></tr></thead>
      <tbody>
        <tr><td><strong>District Collector</strong></td><td>Government</td><td>📞 1800-XXX-001</td><td>All</td></tr>
        <tr><td><strong>Fire Station</strong></td><td>Emergency</td><td>📞 101</td><td>Zone C</td></tr>
        <tr><td><strong>Ambulance</strong></td><td>Medical</td><td>📞 108</td><td>All</td></tr>
        <tr><td><strong>Police Control Room</strong></td><td>Law &amp; Order</td><td>📞 100</td><td>All</td></tr>
        <tr><td><strong>NDRF Team Lead</strong></td><td>Rescue</td><td>📞 1800-XXX-009</td><td>Zone A,C</td></tr>
        <tr><td><strong>School Principal</strong></td><td>School Admin</td><td>📞 9876XXXXXX</td><td>Campus</td></tr>
      </tbody>
    </table>
  </div>`;
}

// ── STUDENTS TAB ─────────────────────────────────────────
function renderStudents() {
  return `<div class="card">
    <div class="section-title-dash">Student Records</div>
    <table class="data-table">
      <thead><tr><th>Roll No.</th><th>Name</th><th>Class</th><th>Zone</th><th>Status</th></tr></thead>
      <tbody>
        <tr><td>21CS001</td><td>Arjun Sharma</td><td>10-A</td><td>Zone A</td><td><span class="badge badge-safe">Safe</span></td></tr>
        <tr><td>21CS002</td><td>Priya Reddy</td><td>10-A</td><td>Zone C</td><td><span class="badge badge-critical">Evacuated</span></td></tr>
        <tr><td>21CS003</td><td>Rahul Mehta</td><td>10-B</td><td>Zone B</td><td><span class="badge badge-warning">Caution</span></td></tr>
        <tr><td>21CS004</td><td>Sneha Patel</td><td>10-B</td><td>Zone E</td><td><span class="badge badge-safe">Safe</span></td></tr>
        <tr><td>21CS005</td><td>Kiran Kumar</td><td>10-C</td><td>Zone D</td><td><span class="badge badge-warning">Caution</span></td></tr>
      </tbody>
    </table>
  </div>`;
}

// ── TEACHERS TAB (Admin only) ─────────────────────────────
function renderTeachers() {
  return `
  <div class="card">
    <div class="section-title-dash">Add Teacher Credentials</div>
    <div class="d-form-row">
      <div class="d-form-group"><label>Teacher Email</label><input type="email" placeholder="teacher@school.edu" /></div>
      <div class="d-form-group"><label>Assign Password</label><input type="password" placeholder="Set password" /></div>
    </div>
    <div class="d-form-row">
      <div class="d-form-group"><label>School Name</label><input type="text" placeholder="School name" /></div>
      <div class="d-form-group"><label>Department</label><input type="text" placeholder="e.g. Science" /></div>
    </div>
    <button class="btn-primary-d" onclick="showToast('Teacher credential added!')"><i class="fas fa-user-plus"></i> Add Teacher</button>
  </div>
  <div class="card">
    <div class="section-title-dash">Registered Teachers</div>
    <table class="data-table">
      <thead><tr><th>Email</th><th>School</th><th>Department</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>
        <tr><td>ravi.k@school.edu</td><td>Siddhartha Academy</td><td>Science</td><td><span class="badge badge-safe">Active</span></td>
          <td><button class="btn-ghost" onclick="showToast('Credential removed!')">Remove</button></td></tr>
        <tr><td>suma.r@school.edu</td><td>Siddhartha Academy</td><td>Maths</td><td><span class="badge badge-safe">Active</span></td>
          <td><button class="btn-ghost" onclick="showToast('Credential removed!')">Remove</button></td></tr>
        <tr><td>john.d@school.edu</td><td>Siddhartha Academy</td><td>English</td><td><span class="badge badge-warning">Pending</span></td>
          <td><button class="btn-ghost" onclick="showToast('Credential removed!')">Remove</button></td></tr>
      </tbody>
    </table>
  </div>`;
}

// ── REPORT TAB ────────────────────────────────────────────
function renderReport() {
  if (currentRole === 'admin') {
    return `<div class="card">
      <div class="section-title-dash">Incident Summary Report</div>
      <div class="stats-row">
        <div class="stat-w"><div class="stat-w-num" style="color:#DC2626">3</div><div class="stat-w-label">Active Incidents</div></div>
        <div class="stat-w"><div class="stat-w-num" style="color:#22c55e">12</div><div class="stat-w-label">Resolved</div></div>
        <div class="stat-w"><div class="stat-w-num" style="color:#F59E0B">7</div><div class="stat-w-label">Under Monitoring</div></div>
        <div class="stat-w"><div class="stat-w-num" style="color:#06B6D4">1,240</div><div class="stat-w-label">People Assisted</div></div>
      </div>
    </div>`;
  }
  return `<div class="card">
    <div class="section-title-dash">Submit Incident Report</div>
    <div class="d-form-row">
      <div class="d-form-group"><label>Incident Type</label>
        <select><option>Flood</option><option>Fire</option><option>Wind Damage</option><option>Medical Emergency</option><option>Other</option></select></div>
      <div class="d-form-group"><label>Zone / Location</label><input type="text" placeholder="e.g. Zone B, Near School Gate" /></div>
    </div>
    <div class="d-form-group" style="margin-bottom:.75rem"><label>Description</label>
      <textarea rows="4" placeholder="Describe what you observed..."></textarea></div>
    <div class="d-form-group" style="margin-bottom:.75rem"><label>Severity</label>
      <select><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select></div>
    <button class="btn-primary-d" onclick="showToast('Report submitted successfully!')"><i class="fas fa-paper-plane"></i> Submit Report</button>
  </div>`;
}

// ── Helpers ───────────────────────────────────────────────
function animateBars() {
  setTimeout(() => {
    document.querySelectorAll('.resource-fill[data-pct]').forEach(el => {
      el.style.width = el.dataset.pct + '%';
    });
  }, 100);
}

function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'toast';
    t.style.cssText = `position:fixed;bottom:1.5rem;right:1.5rem;background:linear-gradient(135deg,#DC2626,#7C3AED);
      color:#fff;padding:10px 20px;border-radius:10px;font-size:.85rem;font-weight:600;
      z-index:9999;box-shadow:0 8px 25px rgba(0,0,0,.4);transition:opacity .3s`;
    document.body.appendChild(t);
  }
  t.textContent = '✓ ' + msg;
  t.style.opacity = '1';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.opacity = '0'; }, 2800);
}
