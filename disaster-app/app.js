/* DisasterShield — Auth Logic */

let currentRole = 'student';
let currentTab  = 'signin';

// ── Tab switch (Sign In / Create Account) ─────────────────
function switchAuthTab(tab) {
  currentTab = tab;
  document.getElementById('tab-signin').classList.toggle('active', tab === 'signin');
  document.getElementById('tab-create').classList.toggle('active', tab === 'create');
  document.getElementById('form-signin').classList.toggle('hidden', tab !== 'signin');
  document.getElementById('form-create').classList.toggle('hidden', tab !== 'create');
  clearErrors();
}

// ── Role selector ─────────────────────────────────────────
function setRole(role) {
  currentRole = role;
  document.querySelectorAll('.role-btn').forEach(b => b.classList.toggle('active', b.dataset.role === role));
  // sign-in fields
  document.getElementById('si-student').classList.toggle('hidden', role !== 'student');
  document.getElementById('si-teacher').classList.toggle('hidden', role !== 'teacher');
  document.getElementById('si-admin').classList.toggle('hidden',   role !== 'admin');
  // create-account fields
  document.getElementById('ca-student').classList.toggle('hidden', role !== 'student');
  document.getElementById('ca-teacher').classList.toggle('hidden', role !== 'teacher');
  document.getElementById('ca-admin').classList.toggle('hidden',   role !== 'admin');
  clearErrors();
}

function clearErrors() {
  ['signin-error','create-error'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = ''; el.classList.add('hidden'); }
  });
}

function showError(id, msg) {
  const el = document.getElementById(id);
  el.innerHTML = `<i class="fas fa-circle-exclamation"></i> ${msg}`;
  el.classList.remove('hidden');
}

// ── Sign In ───────────────────────────────────────────────
function handleSignIn(e) {
  e.preventDefault();
  clearErrors();
  let user = {};

  if (currentRole === 'student') {
    const roll = document.getElementById('si-roll').value.trim();
    const pass = document.getElementById('si-pass-s').value.trim();
    if (!roll) { showError('signin-error', 'Please enter your roll number.'); return; }
    if (!pass) { showError('signin-error', 'Please enter your password.'); return; }
    user = { name: roll, role: 'student', display: 'Student', school: 'Siddhartha Academy', avatar: roll[0].toUpperCase() };

  } else if (currentRole === 'teacher') {
    const email  = document.getElementById('si-email-t').value.trim();
    const school = document.getElementById('si-school-t').value.trim();
    const pass   = document.getElementById('si-pass-t').value.trim();
    if (!email)  { showError('signin-error', 'Please enter your email.'); return; }
    if (!school) { showError('signin-error', 'Please enter your school name.'); return; }
    if (!pass)   { showError('signin-error', 'Please enter your password.'); return; }
    user = { name: email.split('@')[0], role: 'teacher', display: 'Teacher', school, avatar: email[0].toUpperCase() };

  } else {
    const email = document.getElementById('si-email-a').value.trim();
    const pass  = document.getElementById('si-pass-a').value.trim();
    if (!email) { showError('signin-error', 'Please enter admin email.'); return; }
    if (!pass)  { showError('signin-error', 'Please enter password.'); return; }
    user = { name: 'Admin', role: 'admin', display: 'Admin', school: 'District HQ', avatar: 'A' };
  }

  sessionStorage.setItem('ds_user', JSON.stringify(user));
  window.location.href = 'dashboard.html';
}

// ── Create Account ────────────────────────────────────────
function handleCreate(e) {
  e.preventDefault();
  clearErrors();
  let user = {};

  if (currentRole === 'student') {
    const name   = document.getElementById('ca-name-s').value.trim();
    const roll   = document.getElementById('ca-roll').value.trim();
    const school = document.getElementById('ca-school-s').value.trim();
    const pass   = document.getElementById('ca-pass-s').value.trim();
    if (!name)   { showError('create-error', 'Please enter your full name.'); return; }
    if (!roll)   { showError('create-error', 'Please enter your roll number.'); return; }
    if (!school) { showError('create-error', 'Please enter your school name.'); return; }
    if (!pass)   { showError('create-error', 'Please create a password.'); return; }
    user = { name, role: 'student', display: 'Student', school, avatar: name[0].toUpperCase() };

  } else if (currentRole === 'teacher') {
    const email  = document.getElementById('ca-email-t').value.trim();
    const school = document.getElementById('ca-school-t').value.trim();
    const pass   = document.getElementById('ca-pass-t').value.trim();
    if (!email)  { showError('create-error', 'Please enter your email.'); return; }
    if (!school) { showError('create-error', 'Please enter your school name.'); return; }
    if (!pass)   { showError('create-error', 'Please enter the password assigned by admin.'); return; }
    user = { name: email.split('@')[0], role: 'teacher', display: 'Teacher', school, avatar: email[0].toUpperCase() };

  } else {
    const email = document.getElementById('ca-email-a').value.trim();
    const pass  = document.getElementById('ca-pass-a').value.trim();
    if (!email) { showError('create-error', 'Please enter admin email.'); return; }
    if (!pass)  { showError('create-error', 'Please create a password.'); return; }
    user = { name: 'Admin', role: 'admin', display: 'Admin', school: 'District HQ', avatar: 'A' };
  }

  sessionStorage.setItem('ds_user', JSON.stringify(user));
  window.location.href = 'dashboard.html';
}
