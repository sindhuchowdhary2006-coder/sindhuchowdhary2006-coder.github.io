let role = 'student', tab = 'si';

function switchTab(t) {
  tab = t;
  ['si','ca'].forEach(x => {
    document.getElementById('tab-'+x).classList.toggle('active', x===t);
    document.getElementById('form-'+x).classList.toggle('dn', x!==t);
  });
  clearErr();
}

function setRole(r) {
  role = r;
  document.querySelectorAll('.rbtn').forEach(b => b.classList.toggle('active', b.dataset.r===r));
  ['s','t','a'].forEach(x => {
    document.getElementById('si-'+x).classList.toggle('dn', x !== r[0]);
    document.getElementById('ca-'+x).classList.toggle('dn', x !== r[0]);
  });
  clearErr();
}

function clearErr() {
  ['si-err','ca-err'].forEach(id => { const e=document.getElementById(id); e.textContent=''; e.classList.add('dn'); });
}
function showErr(id, msg) { const e=document.getElementById(id); e.textContent=msg; e.classList.remove('dn'); }

function doSignIn(e) {
  e.preventDefault(); clearErr();
  let user = {};
  if (role==='student') {
    const roll=document.getElementById('si-roll').value.trim();
    const pw=document.getElementById('si-pw-s').value.trim();
    if (!roll) { showErr('si-err','Please enter your roll number.'); return; }
    if (!pw)   { showErr('si-err','Please enter your password.'); return; }
    user = { name:'Chirumamilla Sindhu', email:'sindhuchowdhary2006@gmail.com', roll, role:'student', school:'Siddhartha Academy' };
  } else if (role==='teacher') {
    const email=document.getElementById('si-email-t').value.trim();
    const school=document.getElementById('si-school-t').value.trim();
    const pw=document.getElementById('si-pw-t').value.trim();
    if (!email||!school||!pw) { showErr('si-err','Please fill all fields.'); return; }
    user = { name: email.split('@')[0], email, role:'teacher', school };
  } else {
    const email=document.getElementById('si-email-a').value.trim();
    const pw=document.getElementById('si-pw-a').value.trim();
    if (!email||!pw) { showErr('si-err','Please fill all fields.'); return; }
    user = { name:'Admin', email, role:'admin', school:'District HQ' };
  }
  sessionStorage.setItem('dp_user', JSON.stringify(user));
  window.location.href = 'dashboard.html';
}

function doCreate(e) {
  e.preventDefault(); clearErr();
  let user = {};
  if (role==='student') {
    const name=document.getElementById('ca-name').value.trim();
    const email=document.getElementById('ca-email-s').value.trim();
    const roll=document.getElementById('ca-roll').value.trim();
    const school=document.getElementById('ca-school-s').value.trim();
    const pw=document.getElementById('ca-pw-s').value.trim();
    if (!name||!email||!roll||!school||!pw) { showErr('ca-err','Please fill all fields.'); return; }
    user = { name, email, roll, role:'student', school };
  } else if (role==='teacher') {
    const name=document.getElementById('ca-name-t').value.trim();
    const email=document.getElementById('ca-email-t').value.trim();
    const school=document.getElementById('ca-school-t').value.trim();
    const pw=document.getElementById('ca-pw-t').value.trim();
    if (!name||!email||!school||!pw) { showErr('ca-err','Please fill all fields.'); return; }
    user = { name, email, role:'teacher', school };
  } else {
    const name=document.getElementById('ca-name-a').value.trim();
    const email=document.getElementById('ca-email-a').value.trim();
    const pw=document.getElementById('ca-pw-a').value.trim();
    if (!name||!email||!pw) { showErr('ca-err','Please fill all fields.'); return; }
    user = { name, email, role:'admin', school:'District HQ' };
  }
  sessionStorage.setItem('dp_user', JSON.stringify(user));
  window.location.href = 'dashboard.html';
}
