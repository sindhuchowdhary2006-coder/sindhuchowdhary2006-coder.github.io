/* DisasterShield — Dashboard Logic */

// ── Load user from session ────────────────────────────────
const user = JSON.parse(sessionStorage.getItem('ds_user') || 'null');
if (!user) { window.location.href = 'index.html'; }

document.getElementById('tb-avatar').textContent = user.avatar;
document.getElementById('sb-user').innerHTML = `
  <div class="sb-user-name">${user.name}</div>
  <div class="sb-user-meta">${user.school}</div>
  <span class="sb-user-badge badge-${user.role}">${user.display}</span>`;

// ── Navigation config per role ────────────────────────────
const NAV_STUDENT = [
  { section: 'OVERVIEW' },
  { id:'dashboard', icon:'fa-house',            label:'Dashboard' },
  { id:'alerts',    icon:'fa-bell',             label:'Alerts & Warnings', badge:3 },
  { section: 'INFORMATION' },
  { id:'map',       icon:'fa-map-location-dot', label:'Affected Areas' },
  { id:'resources', icon:'fa-boxes-stacked',    label:'Resources' },
  { id:'contacts',  icon:'fa-phone-volume',     label:'Emergency Contacts' },
];
const NAV_TEACHER = [
  { section: 'OVERVIEW' },
  { id:'dashboard', icon:'fa-house',            label:'Dashboard' },
  { id:'alerts',    icon:'fa-bell',             label:'Alerts & Warnings', badge:3 },
  { section: 'MANAGEMENT' },
  { id:'students',  icon:'fa-users',            label:'Student Roll' },
  { id:'map',       icon:'fa-map-location-dot', label:'Affected Areas' },
  { id:'resources', icon:'fa-boxes-stacked',    label:'Resources' },
  { id:'contacts',  icon:'fa-phone-volume',     label:'Emergency Contacts' },
  { section: 'ACTIONS' },
  { id:'report',    icon:'fa-file-pen',         label:'Submit Report' },
];
const NAV_ADMIN = [
  { section: 'OVERVIEW' },
  { id:'dashboard', icon:'fa-house',            label:'Dashboard' },
  { id:'alerts',    icon:'fa-bell',             label:'Manage Alerts', badge:3 },
  { section: 'OPERATIONS' },
  { id:'map',       icon:'fa-map-location-dot', label:'Affected Areas' },
  { id:'resources', icon:'fa-boxes-stacked',    label:'Resource Management' },
  { section: 'RECORDS' },
  { id:'teachers',  icon:'fa-chalkboard-teacher',label:'Teacher Records' },
  { id:'students',  icon:'fa-users',            label:'Student Records' },
  { id:'contacts',  icon:'fa-phone-volume',     label:'Emergency Contacts' },
  { section: 'REPORTS' },
  { id:'report',    icon:'fa-chart-bar',        label:'Reports & Analytics' },
];

const navMap = { student: NAV_STUDENT, teacher: NAV_TEACHER, admin: NAV_ADMIN };

function buildNav() {
  const nav = document.getElementById('sb-nav');
  nav.innerHTML = '';
  (navMap[user.role] || NAV_STUDENT).forEach(item => {
    if (item.section) {
      const s = document.createElement('div');
      s.className = 'sb-section'; s.textContent = item.section;
      nav.appendChild(s); return;
    }
    const btn = document.createElement('button');
    btn.className = 'nav-btn'; btn.dataset.tab = item.id;
    btn.innerHTML = `<i class="fas ${item.icon}"></i>${item.label}${item.badge ? `<span class="nb-badge">${item.badge}</span>` : ''}`;
    btn.onclick = () => goTab(item.id);
    nav.appendChild(btn);
  });
}

buildNav();

const TITLES = { dashboard:'Dashboard', alerts:'Alerts & Warnings', map:'Affected Areas',
  resources:'Resource Management', contacts:'Emergency Contacts',
  students:'Student Records', teachers:'Teacher Records', report: user.role==='admin'?'Reports & Analytics':'Submit Report' };

function goTab(id) {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === id));
  document.getElementById('page-title').textContent = TITLES[id] || 'Dashboard';
  document.getElementById('sidebar').classList.remove('open');
  const c = document.getElementById('content');
  c.innerHTML = '';
  const renderers = { dashboard:renderDashboard, alerts:renderAlerts, map:renderMap,
    resources:renderResources, contacts:renderContacts, students:renderStudents,
    teachers:renderTeachers, report:renderReport };
  (renderers[id] || renderDashboard)();
  setTimeout(animateBars, 120);
}

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); }
function logout() { sessionStorage.clear(); window.location.href = 'index.html'; }

// ── SHARED DATA ───────────────────────────────────────────
const ALERTS = [
  { id:1, type:'critical', icon:'fa-fire',               title:'Wildfire Alert — Zone C',       desc:'Wildfire spreading toward residential areas. Immediate evacuation required.', time:'2 min ago',  zone:'Zone C' },
  { id:2, type:'warning',  icon:'fa-cloud-showers-heavy', title:'Flash Flood Warning — Zone A',  desc:'Heavy rainfall expected. Low-lying areas should prepare for flooding.',       time:'15 min ago', zone:'Zone A' },
  { id:3, type:'warning',  icon:'fa-wind',                title:'Strong Wind Advisory — Zone B', desc:'Wind speeds up to 80 km/h. Secure all outdoor objects immediately.',          time:'1 hr ago',   zone:'Zone B' },
  { id:4, type:'critical', icon:'fa-bolt',                title:'Power Outage — Zone D',         desc:'Complete power failure reported. Backup generators deployed to hospitals.',   time:'2 hr ago',   zone:'Zone D' },
  { id:5, type:'info',     icon:'fa-shield-halved',       title:'All-Clear — Zone E',            desc:'Situation stabilized. Normal operations resumed. Citizens may return.',       time:'3 hr ago',   zone:'Zone E' },
];
const RESOURCES = [
  { name:'Food Packets',     qty:320, total:500, color:'#22C55E', icon:'fa-utensils',      loc:'Central Warehouse' },
  { name:'Water Supplies',   qty:210, total:400, color:'#06B6D4', icon:'fa-droplet',       loc:'Zone A Relief Camp' },
  { name:'Medical Kits',     qty:85,  total:150, color:'#F59E0B', icon:'fa-kit-medical',   loc:'District Hospital' },
  { name:'Blankets',         qty:180, total:300, color:'#7C3AED', icon:'fa-bed',           loc:'Zone C Shelter' },
  { name:'Rescue Vehicles',  qty:12,  total:20,  color:'#DC2626', icon:'fa-truck-medical', loc:'Fire Station' },
  { name:'Generators',       qty:8,   total:15,  color:'#F97316', icon:'fa-plug',          loc:'Zone D' },
];
const STUDENTS = [
  { roll:'21CS001', name:'Arjun Sharma',  cls:'10-A', zone:'Zone A', status:'safe',     phone:'98765XXXXX' },
  { roll:'21CS002', name:'Priya Reddy',   cls:'10-A', zone:'Zone C', status:'critical', phone:'87654XXXXX' },
  { roll:'21CS003', name:'Rahul Mehta',   cls:'10-B', zone:'Zone B', status:'warning',  phone:'76543XXXXX' },
  { roll:'21CS004', name:'Sneha Patel',   cls:'10-B', zone:'Zone E', status:'safe',     phone:'65432XXXXX' },
  { roll:'21CS005', name:'Kiran Kumar',   cls:'10-C', zone:'Zone D', status:'warning',  phone:'54321XXXXX' },
  { roll:'21CS006', name:'Divya Nair',    cls:'10-C', zone:'Zone A', status:'safe',     phone:'43210XXXXX' },
  { roll:'21CS007', name:'Sai Chandra',   cls:'11-A', zone:'Zone C', status:'critical', phone:'32109XXXXX' },
  { roll:'21CS008', name:'Meera Singh',   cls:'11-B', zone:'Zone E', status:'safe',     phone:'21098XXXXX' },
];
const TEACHERS = [
  { email:'ravi.k@school.edu',  school:'Siddhartha Academy', dept:'Science', status:'active'  },
  { email:'suma.r@school.edu',  school:'Siddhartha Academy', dept:'Maths',   status:'active'  },
  { email:'john.d@school.edu',  school:'Siddhartha Academy', dept:'English', status:'pending' },
];
const CONTACTS = [
  { name:'District Collector',   role:'Government',   number:'1800-XXX-001', zone:'All',       avail:'24/7' },
  { name:'Fire Station',         role:'Emergency',    number:'101',          zone:'Zone C',    avail:'24/7' },
  { name:'Ambulance Services',   role:'Medical',      number:'108',          zone:'All',       avail:'24/7' },
  { name:'Police Control Room',  role:'Law & Order',  number:'100',          zone:'All',       avail:'24/7' },
  { name:'NDRF Team Lead',       role:'Rescue',       number:'1800-XXX-009', zone:'Zone A, C', avail:'On-call' },
  { name:'School Principal',     role:'School Admin', number:'9876XXXXXX',   zone:'Campus',    avail:'8am–6pm' },
  { name:'Red Cross',            role:'Relief',       number:'1800-XXX-120', zone:'All',       avail:'24/7' },
];

function alertHTML(a) {
  return `<div class="alert-pill ${a.type}">
    <i class="fas ${a.icon} ap-icon"></i>
    <div class="ap-body">
      <div class="ap-title">${a.title}
        <span class="badge b-${a.type==='critical'?'critical':a.type==='warning'?'warning':a.type==='safe'?'safe':'info'}">${a.type.toUpperCase()}</span>
      </div>
      <div class="ap-desc">${a.desc}</div>
      <div class="ap-time"><i class="fas fa-clock"></i>${a.time} &nbsp;·&nbsp; <i class="fas fa-location-dot"></i>${a.zone}</div>
    </div>
  </div>`;
}

function resBarHTML(r) {
  const pct = Math.round(r.qty / r.total * 100);
  return `<div class="res-bar">
    <div class="res-bar-top">
      <span class="res-bar-name"><i class="fas ${r.icon}" style="color:${r.color};margin-right:.35rem"></i>${r.name}</span>
      <span class="res-bar-qty">${r.qty} / ${r.total}</span>
    </div>
    <div class="res-track"><div class="res-fill" data-pct="${pct}" style="width:0%;background:${r.color}"></div></div>
  </div>`;
}

function statusBadge(s) {
  const map = { safe:'b-safe', critical:'b-critical', warning:'b-warning', pending:'b-pending', active:'b-active' };
  return `<span class="badge ${map[s]||'b-info'}">${s.toUpperCase()}</span>`;
}

function animateBars() {
  document.querySelectorAll('.res-fill[data-pct]').forEach(el => { el.style.width = el.dataset.pct + '%'; });
}

// ── DASHBOARD TAB ─────────────────────────────────────────
function renderDashboard() {
  const c = document.getElementById('content');
  const isAdmin = user.role === 'admin';
  const isTeacher = user.role === 'teacher';

  c.innerHTML = `
  <div class="stat-grid">
    <div class="stat-card">
      <div class="sc-top">
        <div class="sc-icon" style="background:rgba(220,38,38,.15)"><i class="fas fa-triangle-exclamation" style="color:#DC2626"></i></div>
        <span class="sc-trend" style="background:rgba(220,38,38,.15);color:#FCA5A5">LIVE</span>
      </div>
      <div class="sc-num" style="color:#DC2626">3</div>
      <div class="sc-label">Active Alerts</div>
    </div>
    <div class="stat-card">
      <div class="sc-top">
        <div class="sc-icon" style="background:rgba(245,158,11,.15)"><i class="fas fa-map-pin" style="color:#F59E0B"></i></div>
        <span class="sc-trend" style="background:rgba(245,158,11,.15);color:#FCD34D">5 Zones</span>
      </div>
      <div class="sc-num" style="color:#F59E0B">5</div>
      <div class="sc-label">Affected Zones</div>
    </div>
    <div class="stat-card">
      <div class="sc-top">
        <div class="sc-icon" style="background:rgba(6,182,212,.15)"><i class="fas fa-boxes-stacked" style="color:#06B6D4"></i></div>
        <span class="sc-trend" style="background:rgba(6,182,212,.15);color:#67E8F9">+12%</span>
      </div>
      <div class="sc-num" style="color:#06B6D4">815</div>
      <div class="sc-label">Resources Available</div>
    </div>
    ${isAdmin || isTeacher ? `<div class="stat-card">
      <div class="sc-top">
        <div class="sc-icon" style="background:rgba(34,197,94,.15)"><i class="fas fa-users" style="color:#22C55E"></i></div>
        <span class="sc-trend" style="background:rgba(34,197,94,.15);color:#86EFAC">Safe</span>
      </div>
      <div class="sc-num" style="color:#22C55E">${isAdmin ? '1,240' : '48'}</div>
      <div class="sc-label">${isAdmin ? 'Students Registered' : 'Students in Your Class'}</div>
    </div>` : `<div class="stat-card">
      <div class="sc-top">
        <div class="sc-icon" style="background:rgba(124,58,237,.15)"><i class="fas fa-phone-volume" style="color:#A78BFA"></i></div>
      </div>
      <div class="sc-num" style="color:#A78BFA">7</div>
      <div class="sc-label">Emergency Contacts</div>
    </div>`}
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:1.25rem">
    <div>
      <div class="card">
        <div class="section-hd"><h2><i class="fas fa-bell" style="color:#DC2626;margin-right:.4rem"></i>Recent Alerts</h2>
          <button class="btn-ghost" onclick="goTab('alerts')">View all</button></div>
        ${ALERTS.slice(0,3).map(alertHTML).join('')}
      </div>
    </div>
    <div>
      <div class="card">
        <div class="section-hd"><h2><i class="fas fa-boxes-stacked" style="color:#06B6D4;margin-right:.4rem"></i>Resource Status</h2>
          <button class="btn-ghost" onclick="goTab('resources')">View all</button></div>
        ${RESOURCES.map(resBarHTML).join('')}
      </div>
    </div>
  </div>`;
}

// ── ALERTS TAB ────────────────────────────────────────────
function renderAlerts() {
  const c = document.getElementById('content');
  const canBroadcast = user.role !== 'student';
  c.innerHTML = `
  ${canBroadcast ? `<div class="card">
    <div class="section-hd"><h2><i class="fas fa-bullhorn" style="color:#F59E0B;margin-right:.4rem"></i>Broadcast New Alert</h2></div>
    <div class="form-row">
      <div class="form-group"><label>Alert Type</label>
        <select id="al-type"><option value="critical">🔴 Critical</option><option value="warning">🟡 Warning</option><option value="info">🔵 Info</option><option value="safe">🟢 All-Clear</option></select></div>
      <div class="form-group"><label>Affected Zone</label>
        <select id="al-zone"><option>Zone A</option><option>Zone B</option><option>Zone C</option><option>Zone D</option><option>Zone E</option><option>All Zones</option></select></div>
    </div>
    <div class="form-group"><label>Alert Title</label><input type="text" id="al-title" placeholder="e.g. Flash Flood Warning" /></div>
    <div class="form-group"><label>Description</label><textarea id="al-desc" rows="3" placeholder="Describe the situation in detail..."></textarea></div>
    <div class="btn-row">
      <button class="btn-primary" onclick="broadcastAlert()"><i class="fas fa-bullhorn"></i> Broadcast Alert</button>
      <button class="btn-secondary" onclick="clearAlertForm()"><i class="fas fa-rotate-left"></i> Clear</button>
    </div>
  </div>` : ''}
  <div class="card">
    <div class="section-hd">
      <h2><i class="fas fa-bell" style="color:#DC2626;margin-right:.4rem"></i>All Alerts</h2>
      <span id="alert-count">${ALERTS.length} alerts</span>
    </div>
    <div id="alerts-list">${ALERTS.map(alertHTML).join('')}</div>
  </div>`;
}

function broadcastAlert() {
  const title = document.getElementById('al-title').value.trim();
  const desc  = document.getElementById('al-desc').value.trim();
  if (!title) { showToast('Please enter an alert title.', 'error'); return; }
  if (!desc)  { showToast('Please enter a description.', 'error'); return; }
  const type = document.getElementById('al-type').value;
  const zone = document.getElementById('al-zone').value;
  const icons = { critical:'fa-triangle-exclamation', warning:'fa-circle-exclamation', info:'fa-circle-info', safe:'fa-shield-halved' };
  ALERTS.unshift({ id: Date.now(), type, icon: icons[type], title, desc, time:'Just now', zone });
  showToast('✓ Alert broadcasted to all users!', 'success');
  renderAlerts(); setTimeout(animateBars, 120);
}

function clearAlertForm() {
  ['al-title','al-desc'].forEach(id => document.getElementById(id).value = '');
}

// ── MAP TAB ───────────────────────────────────────────────
function renderMap() {
  const c = document.getElementById('content');
  c.innerHTML = `
  <div class="card">
    <div class="section-hd"><h2><i class="fas fa-map-location-dot" style="color:#06B6D4;margin-right:.4rem"></i>Live Affected Area Map</h2>
      <span>Last updated: just now</span></div>
    <div class="map-container">
      <div class="map-grid"></div>
      <div class="map-center-label"><i class="fas fa-map"></i><p>Siddhartha Academy District</p></div>
      <div class="map-pin" style="top:28%;left:22%;animation-delay:0s" title="Zone A — Flood">
        <span class="map-pin-label">Zone A 🌊</span>💧
      </div>
      <div class="map-pin" style="top:45%;left:55%;animation-delay:.5s" title="Zone B — Wind">
        <span class="map-pin-label">Zone B 🌬️</span>🌀
      </div>
      <div class="map-pin" style="top:20%;left:65%;animation-delay:1s" title="Zone C — Wildfire">
        <span class="map-pin-label">Zone C 🔥</span>🔥
      </div>
      <div class="map-pin" style="top:62%;left:35%;animation-delay:1.5s" title="Zone D — Power Outage">
        <span class="map-pin-label">Zone D ⚡</span>⚡
      </div>
      <div class="map-pin" style="top:70%;left:72%;animation-delay:2s" title="Zone E — Safe">
        <span class="map-pin-label">Zone E ✅</span>✅
      </div>
    </div>
    <div class="tbl-wrap">
      <table>
        <thead><tr><th>Zone</th><th>Disaster Type</th><th>Severity</th><th>Affected People</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td><strong>Zone A</strong></td><td><i class="fas fa-water" style="color:#06B6D4"></i> Flash Flood</td><td>${statusBadge('critical')}</td><td>~2,400</td><td>Evacuation in progress</td></tr>
          <tr><td><strong>Zone B</strong></td><td><i class="fas fa-wind" style="color:#A78BFA"></i> Strong Wind</td><td>${statusBadge('warning')}</td><td>~1,100</td><td>Advisory issued</td></tr>
          <tr><td><strong>Zone C</strong></td><td><i class="fas fa-fire" style="color:#DC2626"></i> Wildfire</td><td>${statusBadge('critical')}</td><td>~860</td><td>Firefighters deployed</td></tr>
          <tr><td><strong>Zone D</strong></td><td><i class="fas fa-bolt" style="color:#F59E0B"></i> Power Outage</td><td>${statusBadge('warning')}</td><td>~3,200</td><td>Generators deployed</td></tr>
          <tr><td><strong>Zone E</strong></td><td>—</td><td>${statusBadge('safe')}</td><td>—</td><td>Normal operations</td></tr>
        </tbody>
      </table>
    </div>
  </div>`;
}

// ── RESOURCES TAB ─────────────────────────────────────────
function renderResources() {
  const c = document.getElementById('content');
  const canEdit = user.role !== 'student';
  c.innerHTML = `
  ${canEdit ? `<div class="card">
    <div class="section-hd"><h2><i class="fas fa-plus" style="color:#22C55E;margin-right:.4rem"></i>Add / Update Resource</h2></div>
    <div class="form-row">
      <div class="form-group"><label>Resource Name</label><input type="text" id="r-name" placeholder="e.g. Water Bottles" /></div>
      <div class="form-group"><label>Quantity</label><input type="number" id="r-qty" placeholder="100" /></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Location / Zone</label>
        <select id="r-zone"><option>Zone A</option><option>Zone B</option><option>Zone C</option><option>Zone D</option><option>Central Warehouse</option></select></div>
      <div class="form-group"><label>Status</label>
        <select id="r-status"><option>Available</option><option>Dispatched</option><option>Low Stock</option><option>Out of Stock</option></select></div>
    </div>
    <div class="btn-row">
      <button class="btn-primary" onclick="saveResource()"><i class="fas fa-floppy-disk"></i> Save Resource</button>
      <button class="btn-secondary"><i class="fas fa-truck"></i> Dispatch</button>
    </div>
  </div>` : ''}
  <div class="card">
    <div class="section-hd"><h2><i class="fas fa-boxes-stacked" style="color:#06B6D4;margin-right:.4rem"></i>Current Inventory</h2></div>
    <div id="res-bars">${RESOURCES.map(resBarHTML).join('')}</div>
  </div>
  <div class="card">
    <div class="section-hd"><h2>Detailed Inventory</h2></div>
    <div class="tbl-wrap"><table>
      <thead><tr><th>Resource</th><th>Available</th><th>Total</th><th>Location</th><th>Status</th></tr></thead>
      <tbody>${RESOURCES.map(r => {
        const pct = r.qty/r.total;
        const s = pct > .6 ? 'safe' : pct > .3 ? 'warning' : 'critical';
        return `<tr><td><i class="fas ${r.icon}" style="color:${r.color};margin-right:.4rem"></i>${r.name}</td>
          <td>${r.qty}</td><td>${r.total}</td><td>${r.loc}</td><td>${statusBadge(s)}</td></tr>`;
      }).join('')}</tbody>
    </table></div>
  </div>`;
}

function saveResource() {
  const name = document.getElementById('r-name').value.trim();
  const qty  = document.getElementById('r-qty').value.trim();
  if (!name || !qty) { showToast('Please fill name and quantity.', 'error'); return; }
  showToast('✓ Resource saved successfully!', 'success');
  document.getElementById('r-name').value = '';
  document.getElementById('r-qty').value = '';
}

// ── CONTACTS TAB ─────────────────────────────────────────
function renderContacts() {
  const c = document.getElementById('content');
  const canEdit = user.role === 'admin';
  c.innerHTML = `
  ${canEdit ? `<div class="card">
    <div class="section-hd"><h2><i class="fas fa-plus" style="color:#22C55E;margin-right:.4rem"></i>Add Emergency Contact</h2></div>
    <div class="form-row">
      <div class="form-group"><label>Name</label><input type="text" id="ec-name" placeholder="e.g. Fire Station" /></div>
      <div class="form-group"><label>Phone Number</label><input type="text" id="ec-phone" placeholder="e.g. 101" /></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Role</label><input type="text" id="ec-role" placeholder="e.g. Emergency Services" /></div>
      <div class="form-group"><label>Zone</label>
        <select id="ec-zone"><option>All</option><option>Zone A</option><option>Zone B</option><option>Zone C</option><option>Zone D</option><option>Zone E</option><option>Campus</option></select></div>
    </div>
    <button class="btn-primary" onclick="saveContact()"><i class="fas fa-plus"></i> Add Contact</button>
  </div>` : ''}
  <div class="card">
    <div class="section-hd"><h2><i class="fas fa-phone-volume" style="color:#22C55E;margin-right:.4rem"></i>Emergency Contacts</h2></div>
    <div class="tbl-wrap"><table>
      <thead><tr><th>Name</th><th>Role</th><th>Contact Number</th><th>Zone</th><th>Availability</th>${canEdit?'<th>Action</th>':''}</tr></thead>
      <tbody>${CONTACTS.map((ct,i) => `<tr>
        <td><strong>${ct.name}</strong></td>
        <td><span class="badge b-info">${ct.role}</span></td>
        <td><a href="tel:${ct.number}" style="color:#22C55E;font-weight:600"><i class="fas fa-phone"></i> ${ct.number}</a></td>
        <td>${ct.zone}</td><td>${ct.avail}</td>
        ${canEdit ? `<td><button class="btn-danger" onclick="removeContact(${i})"><i class="fas fa-trash"></i></button></td>` : ''}
      </tr>`).join('')}</tbody>
    </table></div>
  </div>`;
}

function saveContact() {
  const name = document.getElementById('ec-name').value.trim();
  const phone = document.getElementById('ec-phone').value.trim();
  if (!name || !phone) { showToast('Please fill name and phone.', 'error'); return; }
  CONTACTS.push({ name, role: document.getElementById('ec-role').value || 'Emergency',
    number: phone, zone: document.getElementById('ec-zone').value, avail: '24/7' });
  showToast('✓ Contact added!', 'success');
  renderContacts();
}

function removeContact(i) {
  showConfirm('Remove Contact', `Remove "${CONTACTS[i].name}" from emergency contacts?`, () => {
    CONTACTS.splice(i, 1);
    showToast('Contact removed.', 'success');
    renderContacts();
  });
}

// ── STUDENTS TAB ─────────────────────────────────────────
function renderStudents() {
  const c = document.getElementById('content');
  const canEdit = user.role !== 'student';
  c.innerHTML = `
  ${canEdit ? `<div class="card">
    <div class="section-hd"><h2><i class="fas fa-user-plus" style="color:#22C55E;margin-right:.4rem"></i>Add Student Record</h2></div>
    <div class="form-row">
      <div class="form-group"><label>Full Name</label><input type="text" id="st-name" placeholder="Student full name" /></div>
      <div class="form-group"><label>Roll Number</label><input type="text" id="st-roll" placeholder="e.g. 21CS009" /></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Class</label><input type="text" id="st-cls" placeholder="e.g. 10-A" /></div>
      <div class="form-group"><label>Zone</label>
        <select id="st-zone"><option>Zone A</option><option>Zone B</option><option>Zone C</option><option>Zone D</option><option>Zone E</option></select></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>Phone</label><input type="text" id="st-phone" placeholder="Parent contact" /></div>
      <div class="form-group"><label>Status</label>
        <select id="st-status"><option value="safe">Safe</option><option value="warning">Caution</option><option value="critical">Evacuated</option></select></div>
    </div>
    <button class="btn-primary" onclick="addStudent()"><i class="fas fa-plus"></i> Add Student</button>
  </div>` : ''}
  <div class="card">
    <div class="section-hd"><h2><i class="fas fa-users" style="color:#A78BFA;margin-right:.4rem"></i>Student Roll</h2>
      <span>${STUDENTS.length} students</span></div>
    <div class="tbl-wrap"><table>
      <thead><tr><th>Roll No.</th><th>Name</th><th>Class</th><th>Zone</th><th>Phone</th><th>Status</th>${canEdit?'<th>Action</th>':''}</tr></thead>
      <tbody>${STUDENTS.map((s,i) => `<tr>
        <td><code style="color:#A78BFA">${s.roll}</code></td>
        <td><strong>${s.name}</strong></td>
        <td>${s.cls}</td><td>${s.zone}</td>
        <td style="color:#64748B">${s.phone}</td>
        <td>${statusBadge(s.status)}</td>
        ${canEdit ? `<td><button class="btn-ghost" onclick="updateStudentStatus(${i})" style="font-size:.72rem">Update</button></td>` : ''}
      </tr>`).join('')}</tbody>
    </table></div>
  </div>`;
}

function addStudent() {
  const name = document.getElementById('st-name').value.trim();
  const roll = document.getElementById('st-roll').value.trim();
  if (!name || !roll) { showToast('Please fill name and roll number.', 'error'); return; }
  STUDENTS.push({ name, roll, cls: document.getElementById('st-cls').value || '—',
    zone: document.getElementById('st-zone').value,
    phone: document.getElementById('st-phone').value || 'N/A',
    status: document.getElementById('st-status').value });
  showToast('✓ Student record added!', 'success');
  renderStudents();
}

function updateStudentStatus(i) {
  const statuses = ['safe','warning','critical'];
  const curr = statuses.indexOf(STUDENTS[i].status);
  STUDENTS[i].status = statuses[(curr + 1) % statuses.length];
  showToast(`✓ ${STUDENTS[i].name} status updated to ${STUDENTS[i].status.toUpperCase()}`, 'success');
  renderStudents();
}

// ── TEACHERS TAB (Admin only) ─────────────────────────────
function renderTeachers() {
  const c = document.getElementById('content');
  c.innerHTML = `
  <div class="card">
    <div class="section-hd"><h2><i class="fas fa-user-plus" style="color:#22C55E;margin-right:.4rem"></i>Add Teacher Credentials</h2></div>
    <div class="form-row">
      <div class="form-group"><label>Teacher Email</label><input type="email" id="tc-email" placeholder="teacher@school.edu" /></div>
      <div class="form-group"><label>Assign Password</label><input type="password" id="tc-pass" placeholder="Set a secure password" /></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label>School Name</label><input type="text" id="tc-school" placeholder="School name" /></div>
      <div class="form-group"><label>Department</label><input type="text" id="tc-dept" placeholder="e.g. Science" /></div>
    </div>
    <div class="btn-row">
      <button class="btn-primary" onclick="addTeacher()"><i class="fas fa-user-plus"></i> Add Teacher</button>
    </div>
  </div>
  <div class="card">
    <div class="section-hd"><h2><i class="fas fa-chalkboard-teacher" style="color:#F59E0B;margin-right:.4rem"></i>Registered Teachers</h2>
      <span>${TEACHERS.length} teachers</span></div>
    <div class="tbl-wrap"><table>
      <thead><tr><th>Email</th><th>School</th><th>Department</th><th>Status</th><th>Action</th></tr></thead>
      <tbody id="teachers-tbody">${TEACHERS.map((t,i) => teacherRow(t,i)).join('')}</tbody>
    </table></div>
  </div>`;
}

function teacherRow(t, i) {
  return `<tr>
    <td>${t.email}</td><td>${t.school}</td><td>${t.dept}</td>
    <td>${statusBadge(t.status)}</td>
    <td><button class="btn-danger" onclick="removeTeacher(${i})"><i class="fas fa-trash"></i> Remove</button></td>
  </tr>`;
}

function addTeacher() {
  const email = document.getElementById('tc-email').value.trim();
  const pass  = document.getElementById('tc-pass').value.trim();
  const school= document.getElementById('tc-school').value.trim();
  const dept  = document.getElementById('tc-dept').value.trim();
  if (!email || !pass || !school) { showToast('Please fill email, password and school.', 'error'); return; }
  TEACHERS.push({ email, school, dept: dept||'General', status:'pending' });
  showToast('✓ Teacher credential added!', 'success');
  renderTeachers();
}

function removeTeacher(i) {
  showConfirm('Remove Teacher', `Remove credentials for "${TEACHERS[i].email}"?`, () => {
    TEACHERS.splice(i, 1);
    showToast('Teacher credential removed.', 'success');
    renderTeachers();
  });
}

// ── REPORT TAB ────────────────────────────────────────────
function renderReport() {
  const c = document.getElementById('content');
  if (user.role === 'admin') {
    c.innerHTML = `
    <div class="stat-grid">
      <div class="stat-card"><div class="sc-top"><div class="sc-icon" style="background:rgba(220,38,38,.15)"><i class="fas fa-triangle-exclamation" style="color:#DC2626"></i></div></div>
        <div class="sc-num" style="color:#DC2626">3</div><div class="sc-label">Active Incidents</div></div>
      <div class="stat-card"><div class="sc-top"><div class="sc-icon" style="background:rgba(34,197,94,.15)"><i class="fas fa-circle-check" style="color:#22C55E"></i></div></div>
        <div class="sc-num" style="color:#22C55E">12</div><div class="sc-label">Resolved Incidents</div></div>
      <div class="stat-card"><div class="sc-top"><div class="sc-icon" style="background:rgba(245,158,11,.15)"><i class="fas fa-eye" style="color:#F59E0B"></i></div></div>
        <div class="sc-num" style="color:#F59E0B">7</div><div class="sc-label">Under Monitoring</div></div>
      <div class="stat-card"><div class="sc-top"><div class="sc-icon" style="background:rgba(6,182,212,.15)"><i class="fas fa-hands-helping" style="color:#06B6D4"></i></div></div>
        <div class="sc-num" style="color:#06B6D4">1,240</div><div class="sc-label">People Assisted</div></div>
    </div>
    <div class="card">
      <div class="section-hd"><h2>Incident Log</h2></div>
      <div class="tbl-wrap"><table>
        <thead><tr><th>#</th><th>Type</th><th>Zone</th><th>Reported By</th><th>Date</th><th>Status</th></tr></thead>
        <tbody>
          <tr><td>001</td><td>Wildfire</td><td>Zone C</td><td>Teacher</td><td>Today, 08:00</td><td>${statusBadge('critical')}</td></tr>
          <tr><td>002</td><td>Flash Flood</td><td>Zone A</td><td>Admin</td><td>Today, 07:45</td><td>${statusBadge('warning')}</td></tr>
          <tr><td>003</td><td>Power Outage</td><td>Zone D</td><td>Teacher</td><td>Today, 06:30</td><td>${statusBadge('warning')}</td></tr>
          <tr><td>004</td><td>Wind Damage</td><td>Zone B</td><td>Student</td><td>Yesterday</td><td>${statusBadge('safe')}</td></tr>
        </tbody>
      </table></div>
    </div>`;
    return;
  }
  c.innerHTML = `
  <div class="card">
    <div class="section-hd"><h2><i class="fas fa-file-pen" style="color:#A78BFA;margin-right:.4rem"></i>Submit Incident Report</h2></div>
    <div class="form-row">
      <div class="form-group"><label>Incident Type</label>
        <select id="rp-type"><option>Flood</option><option>Fire</option><option>Wind Damage</option><option>Power Outage</option><option>Medical Emergency</option><option>Structural Damage</option><option>Other</option></select></div>
      <div class="form-group"><label>Zone / Location</label><input type="text" id="rp-loc" placeholder="e.g. Zone B, Near School Gate" /></div>
    </div>
    <div class="form-group"><label>Description</label>
      <textarea id="rp-desc" rows="4" placeholder="Describe what you observed — include time, number of people affected, and any immediate needs..."></textarea></div>
    <div class="form-row">
      <div class="form-group"><label>Severity Level</label>
        <select id="rp-sev"><option value="info">Low — Informational</option><option value="warning">Medium — Caution needed</option><option value="critical">High — Immediate action required</option></select></div>
      <div class="form-group"><label>Your Contact Number</label><input type="text" id="rp-phone" placeholder="For follow-up" /></div>
    </div>
    <div class="btn-row">
      <button class="btn-primary" onclick="submitReport()"><i class="fas fa-paper-plane"></i> Submit Report</button>
      <button class="btn-secondary" onclick="clearReportForm()"><i class="fas fa-rotate-left"></i> Clear</button>
    </div>
  </div>`;
}

function submitReport() {
  const desc = document.getElementById('rp-desc').value.trim();
  const loc  = document.getElementById('rp-loc').value.trim();
  if (!desc || !loc) { showToast('Please fill location and description.', 'error'); return; }
  showToast('✓ Report submitted to admin!', 'success');
  clearReportForm();
}

function clearReportForm() {
  ['rp-desc','rp-loc','rp-phone'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
}

// ── TOAST & CONFIRM ───────────────────────────────────────
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast toast-${type}`;
  t.classList.remove('hidden');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.add('hidden'), 3000);
}

let _confirmCb = null;
function showConfirm(title, msg, cb) {
  _confirmCb = cb;
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-msg').textContent   = msg;
  document.getElementById('confirm-modal').classList.remove('hidden');
  document.getElementById('confirm-ok').onclick = () => { closeConfirm(); cb(); };
}
function closeConfirm() { document.getElementById('confirm-modal').classList.add('hidden'); }

// ── INIT ─────────────────────────────────────────────────
goTab('dashboard');
