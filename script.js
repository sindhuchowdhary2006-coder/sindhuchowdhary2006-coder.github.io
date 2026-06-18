/* ============================================================
   SINDHU CHIRUMAMILLA — PORTFOLIO SCRIPT
============================================================ */

// ── Theme Toggle ──────────────────────────────────────────
const html      = document.documentElement;
const themeBtn  = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

const savedTheme = localStorage.getItem('sc-theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeBtn.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('sc-theme', next);
  updateThemeIcon(next);
});

function updateThemeIcon(theme) {
  themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

// ── Hamburger Menu ────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('nav-links');

hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => navLinks.classList.remove('open'))
);

// ── Navbar scroll + progress bar ─────────────────────────
const navbar    = document.getElementById('navbar');
const scrollBar = document.getElementById('scroll-progress');

window.addEventListener('scroll', () => {
  const scrollTop  = window.scrollY;
  const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
  scrollBar.style.width = `${(scrollTop / docHeight) * 100}%`;
  navbar.classList.toggle('scrolled', scrollTop > 30);
  highlightNav();
});

function highlightNav() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav-links a');
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 110) current = sec.id;
  });
  links.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
}

// ── Typed Effect ──────────────────────────────────────────
const typedEl = document.getElementById('typed-text');
const phrases = [
  'B.Tech Student',
  'Cloud Enthusiast',
  'Campus Ambassador',
  'Community Builder',
  'AWS Explorer',
  'Content Creator',
];
let pIdx = 0, cIdx = 0, deleting = false;

function typeLoop() {
  const phrase = phrases[pIdx];
  typedEl.textContent = phrase.substring(0, cIdx);

  if (!deleting) {
    cIdx++;
    if (cIdx > phrase.length) { deleting = true; setTimeout(typeLoop, 1600); return; }
  } else {
    cIdx--;
    if (cIdx < 0) { deleting = false; pIdx = (pIdx + 1) % phrases.length; }
  }
  setTimeout(typeLoop, deleting ? 55 : 95);
}
typeLoop();

// ── Smooth scroll for all anchor links ───────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  if (a.id === 'resume-btn') return;
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// ── Scroll Reveal ─────────────────────────────────────────
const revealSelectors = [
  '.section-header',
  '.about-card', '.about-content-col',
  '.skills-col',
  '.cert-card',
  '.exp-card',
  '.stat-card',
  '.project-card',
  '.gallery-item',
  '.timeline-item',
  '.testimonial-card',
  '.contact-info', '.contact-form-wrap',
  '.highlight-item',
];

const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 75);
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

revealSelectors.forEach(sel =>
  document.querySelectorAll(sel).forEach(el => {
    el.classList.add('reveal');
    revealObs.observe(el);
  })
);

// ── Skill Bar Animation ───────────────────────────────────
const skillObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const fill = entry.target.querySelector('.skill-fill');
      const pct  = entry.target.dataset.percent;
      setTimeout(() => { fill.style.width = `${pct}%`; }, 250);
      skillObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.skill-bar-item').forEach(bar => skillObs.observe(bar));

// ── Counter Animation ─────────────────────────────────────
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const step   = target / (1800 / 16);
      let current  = 0;

      const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = Math.floor(current);
      }, 16);

      counterObs.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(el => counterObs.observe(el));

// ── 3D Background (Three.js) ──────────────────────────────
(function init3D() {
  if (typeof THREE === 'undefined') return;

  const canvas3d = document.getElementById('bg-3d');
  const renderer = new THREE.WebGLRenderer({ canvas: canvas3d, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 0, 28);

  // ── Galaxy of floating dots ──────────────────────────────
  const starCount = 1800;
  const starGeo   = new THREE.BufferGeometry();
  const starPos   = new Float32Array(starCount * 3);
  const starCol   = new Float32Array(starCount * 3);
  const colors3   = [
    new THREE.Color(0x10B981),
    new THREE.Color(0x34D399),
    new THREE.Color(0xF59E0B),
    new THREE.Color(0x3B82F6),
    new THREE.Color(0xFBBF24),
    new THREE.Color(0xffffff),
  ];
  for (let i = 0; i < starCount; i++) {
    const r     = 8 + Math.random() * 35;
    const theta = Math.random() * Math.PI * 2;
    const phi   = Math.acos(2 * Math.random() - 1);
    starPos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    starPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    starPos[i*3+2] = r * Math.cos(phi);
    const c = colors3[Math.floor(Math.random() * colors3.length)];
    starCol[i*3]   = c.r;
    starCol[i*3+1] = c.g;
    starCol[i*3+2] = c.b;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('color',    new THREE.BufferAttribute(starCol, 3));
  const starMat  = new THREE.PointsMaterial({ size: 0.12, vertexColors: true, transparent: true, opacity: 0.75, sizeAttenuation: true });
  const starField = new THREE.Points(starGeo, starMat);
  scene.add(starField);

  // ── Glowing rings ───────────────────────────────────────
  const ringData = [
    { r: 6,  tube: 0.012, color: 0x10B981, tilt: 0.4  },
    { r: 10, tube: 0.008, color: 0xF59E0B, tilt: -0.6 },
    { r: 14, tube: 0.006, color: 0x3B82F6, tilt: 0.9  },
    { r: 18, tube: 0.005, color: 0x34D399, tilt: -0.3 },
  ];
  const rings = [];
  ringData.forEach(d => {
    const geo  = new THREE.TorusGeometry(d.r, d.tube, 16, 200);
    const mat  = new THREE.MeshBasicMaterial({ color: d.color, transparent: true, opacity: 0.35 });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.rotation.x = d.tilt;
    mesh.rotation.y = Math.random() * Math.PI;
    rings.push(mesh);
    scene.add(mesh);
  });

  // ── Floating tetrahedrons (tech nodes) ──────────────────
  const nodeCount = 22;
  const nodes = [];
  const nodeCols = [0x10B981, 0xF59E0B, 0x3B82F6, 0x34D399, 0xFBBF24];
  for (let i = 0; i < nodeCount; i++) {
    const geo  = new THREE.TetrahedronGeometry(0.18 + Math.random() * 0.22, 0);
    const mat  = new THREE.MeshBasicMaterial({
      color: nodeCols[i % nodeCols.length],
      transparent: true,
      opacity: 0.55,
      wireframe: Math.random() > 0.5,
    });
    const mesh = new THREE.Mesh(geo, mat);
    const r    = 5 + Math.random() * 16;
    const th   = Math.random() * Math.PI * 2;
    const ph   = Math.acos(2 * Math.random() - 1);
    mesh.position.set(r * Math.sin(ph) * Math.cos(th), r * Math.sin(ph) * Math.sin(th), r * Math.cos(ph));
    mesh.userData = { speedX: (Math.random()-0.5)*0.004, speedY: (Math.random()-0.5)*0.004, floatAmp: Math.random()*0.3, floatSpeed: 0.5+Math.random(), t: Math.random()*100 };
    nodes.push(mesh);
    scene.add(mesh);
  }

  // ── DNA helix strands ────────────────────────────────────
  const helixGroup = new THREE.Group();
  const helixPoints1 = [], helixPoints2 = [];
  const helixSteps = 120;
  for (let i = 0; i < helixSteps; i++) {
    const t = (i / helixSteps) * Math.PI * 8;
    const y = (i / helixSteps) * 30 - 15;
    helixPoints1.push(new THREE.Vector3(Math.cos(t) * 2.5, y, Math.sin(t) * 2.5));
    helixPoints2.push(new THREE.Vector3(Math.cos(t + Math.PI) * 2.5, y, Math.sin(t + Math.PI) * 2.5));
  }
  const curve1 = new THREE.CatmullRomCurve3(helixPoints1);
  const curve2 = new THREE.CatmullRomCurve3(helixPoints2);
  [curve1, curve2].forEach((curve, ci) => {
    const geo = new THREE.TubeGeometry(curve, 200, 0.04, 6, false);
    const mat = new THREE.MeshBasicMaterial({ color: ci === 0 ? 0x10B981 : 0xF59E0B, transparent: true, opacity: 0.28 });
    helixGroup.add(new THREE.Mesh(geo, mat));
  });
  helixGroup.position.set(12, 0, -8);
  scene.add(helixGroup);

  // ── Icosahedron wireframe (center glow) ─────────────────
  const icoGeo = new THREE.IcosahedronGeometry(3.5, 1);
  const icoMat = new THREE.MeshBasicMaterial({ color: 0x10B981, wireframe: true, transparent: true, opacity: 0.08 });
  const ico    = new THREE.Mesh(icoGeo, icoMat);
  scene.add(ico);

  // ── Mouse parallax ──────────────────────────────────────
  let mouseX = 0, mouseY = 0;
  document.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ── Scroll zoom ─────────────────────────────────────────
  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; });

  // ── Animation loop ───────────────────────────────────────
  let frame = 0;
  function animate() {
    requestAnimationFrame(animate);
    frame += 0.005;

    // Star field slow drift
    starField.rotation.y += 0.0003;
    starField.rotation.x += 0.0001;

    // Rings rotate
    rings.forEach((ring, i) => {
      ring.rotation.z += (i % 2 === 0 ? 0.0008 : -0.0006);
      ring.rotation.y += 0.0003;
    });

    // Helix spin
    helixGroup.rotation.y += 0.004;

    // Icosahedron pulse
    const pulse = 1 + Math.sin(frame * 2) * 0.04;
    ico.scale.set(pulse, pulse, pulse);
    ico.rotation.y += 0.002;
    ico.rotation.x += 0.001;

    // Nodes float
    nodes.forEach(n => {
      n.userData.t += 0.01;
      n.rotation.x += n.userData.speedX;
      n.rotation.y += n.userData.speedY;
      n.position.y += Math.sin(n.userData.t * n.userData.floatSpeed) * 0.003;
    });

    // Camera parallax with mouse
    camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.03;
    camera.position.y += (-mouseY * 1.5 - camera.position.y) * 0.03;
    camera.position.z  = 28 + scrollY * 0.005;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }
  animate();

  // ── Resize ──────────────────────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();

// ── Contact Form Validation ───────────────────────────────
const form = document.getElementById('contact-form');

const fields = [
  { id: 'fname',    errId: 'fname-error',    msg: 'Name is required.' },
  { id: 'femail',   errId: 'femail-error',   msg: 'Email is required.' },
  { id: 'fsubject', errId: 'fsubject-error', msg: 'Subject is required.' },
  { id: 'fmessage', errId: 'fmessage-error', msg: 'Message is required.' },
];

fields.forEach(({ id }) => {
  document.getElementById(id).addEventListener('input', () => {
    document.getElementById(id).classList.remove('error');
    const errId = fields.find(f => f.id === id).errId;
    document.getElementById(errId).textContent = '';
  });
});

function validateField({ id, errId, msg }) {
  const el  = document.getElementById(id);
  const err = document.getElementById(errId);
  const val = el.value.trim();

  if (!val) {
    err.textContent = msg;
    el.classList.add('error');
    return false;
  }
  if (id === 'femail' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
    err.textContent = 'Please enter a valid email address.';
    el.classList.add('error');
    return false;
  }
  err.textContent = '';
  el.classList.remove('error');
  return true;
}

form.addEventListener('submit', e => {
  e.preventDefault();
  const allValid = fields.every(validateField);

  if (allValid) {
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled     = true;
    btn.innerHTML    = '<i class="fas fa-spinner fa-spin"></i> Sending...';

    // Simulate network request — replace with EmailJS / Formspree
    setTimeout(() => {
      form.reset();
      btn.disabled  = false;
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';

      const success = document.getElementById('form-success');
      success.classList.remove('hidden');
      setTimeout(() => success.classList.add('hidden'), 4500);
    }, 1600);
  }
});

// ── Resume button placeholder ─────────────────────────────
document.getElementById('resume-btn').addEventListener('click', e => {
  e.preventDefault();
  alert(
    'Resume not linked yet!\n\n' +
    'To fix: upload your PDF to Google Drive / Dropbox,\n' +
    'then replace href="#" on the Resume button with your direct download link.'
  );
});

// ── Certificate Modal ─────────────────────────────────────
function openCert(id) {
  document.querySelectorAll('.cert-modal-content').forEach(el => el.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
  document.getElementById('cert-modal-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCert() {
  document.getElementById('cert-modal-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeCert();
});
