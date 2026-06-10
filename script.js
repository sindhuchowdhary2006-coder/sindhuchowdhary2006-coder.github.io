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

// ── Particle Canvas ───────────────────────────────────────
const canvas = document.getElementById('particle-canvas');
const ctx    = canvas.getContext('2d');
let   particles = [];

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });

function initParticles() {
  particles = [];
  const count = Math.min(Math.floor(window.innerWidth / 10), 100);
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.4,
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.35,
      a: Math.random() * 0.5 + 0.1,
    });
  }
}
initParticles();

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const rgb = '124,58,237';

  particles.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rgb},${p.a})`;
    ctx.fill();

    p.x += p.dx;
    p.y += p.dy;
    if (p.x < 0 || p.x > canvas.width)  p.dx *= -1;
    if (p.y < 0 || p.y > canvas.height) p.dy *= -1;
  });

  // connecting lines
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i], b = particles[j];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist < 120) {
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(${rgb},${0.07 * (1 - dist / 120)})`;
        ctx.lineWidth   = 0.5;
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(drawParticles);
}
drawParticles();

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
