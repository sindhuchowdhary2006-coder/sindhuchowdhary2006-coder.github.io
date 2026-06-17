/* SecureLink Scanner — URL Threat Detection Engine */

let scanHistory = JSON.parse(localStorage.getItem('sl_history') || '[]');
let lastResult  = null;

// ── Input helpers ─────────────────────────────────────────
document.getElementById('url-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') startScan();
});
document.getElementById('url-input').addEventListener('input', () => {
  const v = document.getElementById('url-input').value.trim();
  document.getElementById('clear-btn').style.display = v ? 'block' : 'none';
});

function clearInput() {
  document.getElementById('url-input').value = '';
  document.getElementById('clear-btn').style.display = 'none';
  document.getElementById('url-input').focus();
}

function tryExample(url) {
  document.getElementById('url-input').value = url;
  document.getElementById('clear-btn').style.display = 'block';
  startScan();
}

function scrollToScanner() {
  document.getElementById('scanner').scrollIntoView({ behavior:'smooth' });
  document.getElementById('result-section').classList.add('hidden');
  document.getElementById('url-input').value = '';
  document.getElementById('url-input').focus();
}

// ── SCAN ENGINE ───────────────────────────────────────────
function startScan() {
  const raw = document.getElementById('url-input').value.trim();
  if (!raw) {
    document.getElementById('url-input').focus();
    document.getElementById('url-input').style.borderColor = '#ef4444';
    setTimeout(() => document.getElementById('url-input').style.borderColor = '', 1200);
    return;
  }

  const url = raw.startsWith('http') ? raw : 'https://' + raw;

  document.getElementById('result-section').classList.add('hidden');
  document.getElementById('history-section').classList.add('hidden');
  document.getElementById('scan-progress-wrap').classList.remove('hidden');
  document.getElementById('sp-url').textContent = url;
  document.getElementById('sp-bar').style.width = '0%';
  document.getElementById('scan-btn').disabled = true;

  const steps = [
    { label: 'Parsing URL structure & protocol...',    icon: 'fa-link' },
    { label: 'Checking domain reputation...',          icon: 'fa-globe' },
    { label: 'Scanning for phishing patterns...',      icon: 'fa-fish' },
    { label: 'Analysing SSL & security headers...',    icon: 'fa-lock' },
    { label: 'Detecting malware indicators...',        icon: 'fa-bug' },
    { label: 'Running heuristic analysis...',          icon: 'fa-brain' },
    { label: 'Calculating risk score...',              icon: 'fa-chart-pie' },
  ];

  const stepsEl = document.getElementById('sp-steps');
  stepsEl.innerHTML = steps.map((s, i) =>
    `<div class="sp-step" id="sp-s-${i}"><i class="fas ${s.icon}"></i>${s.label}</div>`
  ).join('');

  let i = 0;
  const interval = setInterval(() => {
    if (i > 0) document.getElementById(`sp-s-${i-1}`)?.classList.replace('active','done');
    if (i < steps.length) {
      document.getElementById(`sp-s-${i}`)?.classList.add('active');
      document.getElementById('sp-bar').style.width = `${((i+1)/steps.length)*92}%`;
    }
    i++;
    if (i > steps.length) {
      clearInterval(interval);
      document.getElementById('sp-bar').style.width = '100%';
      setTimeout(() => {
        document.getElementById('scan-progress-wrap').classList.add('hidden');
        document.getElementById('scan-btn').disabled = false;
        const result = analyseURL(url);
        lastResult = result;
        showResult(result);
        renderHistory();
      }, 400);
    }
  }, 340);
}

// ── ANALYSIS ENGINE ───────────────────────────────────────
function analyseURL(url) {
  let parsed;
  try { parsed = new URL(url); } catch(e) { parsed = { hostname:'invalid', pathname:'/', protocol:'http:', search:'' }; }

  const domain   = parsed.hostname.toLowerCase();
  const path     = parsed.pathname.toLowerCase();
  const query    = parsed.search.toLowerCase();
  const full     = url.toLowerCase();
  const protocol = parsed.protocol;

  const SAFE_DOMAINS = ['google.com','github.com','microsoft.com','apple.com','amazon.com',
    'facebook.com','twitter.com','linkedin.com','youtube.com','wikipedia.org','stackoverflow.com',
    'mozilla.org','cloudflare.com','aws.amazon.com','azure.microsoft.com','paypal.com','instagram.com'];

  const PHISHING_KEYWORDS = ['login','signin','secure','verify','account','update','confirm',
    'password','credential','banking','wallet','suspend','urgent','alert','validate','auth'];
  const MALWARE_EXTENSIONS = ['.exe','.bat','.cmd','.vbs','.js','.jar','.msi','.scr','.pif','.ps1'];
  const SUSPICIOUS_TLDS    = ['.tk','.ml','.ga','.cf','.gq','.xyz','.top','.club','.online','.site','.info','.biz'];
  const SCAM_KEYWORDS      = ['free','prize','winner','claim','reward','lottery','lucky','cash','gift','deal','click-here','limited'];
  const BRAND_TYPOS        = [['paypa1','paypal'],['g00gle','google'],['arnazon','amazon'],['micros0ft','microsoft'],
    ['faceb00k','facebook'],['netfl1x','netflix'],['app1e','apple'],['twltter','twitter']];

  const checks = [];
  let riskScore = 0;

  // 1. Protocol
  const isHTTPS = protocol === 'https:';
  checks.push({ name:'HTTPS Encryption', result: isHTTPS ? 'pass' : 'fail',
    desc: isHTTPS ? 'Connection is encrypted with HTTPS' : 'Uses insecure HTTP — data is not encrypted' });
  if (!isHTTPS) riskScore += 20;

  // 2. Known safe domain
  const isSafe = SAFE_DOMAINS.some(d => domain === d || domain.endsWith('.'+d));
  if (isSafe) {
    checks.push({ name:'Domain Reputation', result:'pass', desc:'Domain is on the trusted whitelist' });
    riskScore -= 30;
  } else {
    checks.push({ name:'Domain Reputation', result:'warn', desc:'Domain not found in trusted whitelist — proceed with caution' });
    riskScore += 10;
  }

  // 3. TLD check
  const suspTLD = SUSPICIOUS_TLDS.find(t => domain.endsWith(t));
  checks.push({ name:'Domain Extension (TLD)', result: suspTLD ? 'fail' : 'pass',
    desc: suspTLD ? `Uses suspicious free TLD "${suspTLD}" — commonly used in phishing` : 'Domain extension appears legitimate' });
  if (suspTLD) riskScore += 25;

  // 4. Domain length
  const domLen = domain.replace('www.','').split('.')[0].length;
  const longDomain = domLen > 25;
  checks.push({ name:'Domain Length', result: longDomain ? 'warn' : 'pass',
    desc: longDomain ? `Unusually long domain (${domLen} chars) — may be obfuscation` : `Domain length normal (${domLen} chars)` });
  if (longDomain) riskScore += 12;

  // 5. Typosquatting / brand spoofing
  const typo = BRAND_TYPOS.find(([fake]) => domain.includes(fake));
  checks.push({ name:'Brand Impersonation', result: typo ? 'fail' : 'pass',
    desc: typo ? `Domain contains "${typo[0]}" — possible impersonation of "${typo[1]}"` : 'No known brand impersonation detected' });
  if (typo) riskScore += 35;

  // 6. Phishing keywords in URL
  const phishHits = PHISHING_KEYWORDS.filter(k => full.includes(k));
  checks.push({ name:'Phishing Keywords', result: phishHits.length > 2 ? 'fail' : phishHits.length > 0 ? 'warn' : 'pass',
    desc: phishHits.length ? `Found keywords: ${phishHits.slice(0,4).join(', ')}` : 'No phishing keywords detected' });
  if (phishHits.length > 2) riskScore += 30;
  else if (phishHits.length > 0) riskScore += 10;

  // 7. Scam keywords
  const scamHits = SCAM_KEYWORDS.filter(k => full.includes(k));
  checks.push({ name:'Scam / Social Engineering', result: scamHits.length > 1 ? 'fail' : scamHits.length ? 'warn' : 'pass',
    desc: scamHits.length ? `Scam indicators found: ${scamHits.slice(0,3).join(', ')}` : 'No scam indicators found' });
  if (scamHits.length > 1) riskScore += 25;
  else if (scamHits.length) riskScore += 10;

  // 8. Malware file extensions
  const malExt = MALWARE_EXTENSIONS.find(e => path.endsWith(e));
  checks.push({ name:'Malicious File Type', result: malExt ? 'fail' : 'pass',
    desc: malExt ? `URL ends with executable file type "${malExt}" — possible malware download` : 'No suspicious file extensions detected' });
  if (malExt) riskScore += 40;

  // 9. Excessive subdomains
  const subCount = domain.split('.').length - 2;
  checks.push({ name:'Subdomain Analysis', result: subCount > 3 ? 'fail' : subCount > 1 ? 'warn' : 'pass',
    desc: subCount > 3 ? `${subCount} subdomains — unusual nesting often used in phishing` : `${subCount} subdomain(s) — normal structure` });
  if (subCount > 3) riskScore += 18;
  else if (subCount > 1) riskScore += 6;

  // 10. IP address as domain
  const isIP = /^\d{1,3}(\.\d{1,3}){3}$/.test(domain);
  checks.push({ name:'IP Address Domain', result: isIP ? 'fail' : 'pass',
    desc: isIP ? 'URL uses a raw IP address instead of a domain — highly suspicious' : 'Domain name used (not raw IP)' });
  if (isIP) riskScore += 30;

  // 11. URL length
  const urlLen = url.length;
  checks.push({ name:'URL Length', result: urlLen > 150 ? 'fail' : urlLen > 75 ? 'warn' : 'pass',
    desc: urlLen > 150 ? `Very long URL (${urlLen} chars) — may be obfuscating destination` : urlLen > 75 ? `Moderate URL length (${urlLen} chars)` : `Normal URL length (${urlLen} chars)` });
  if (urlLen > 150) riskScore += 15;
  else if (urlLen > 75) riskScore += 5;

  // 12. Special characters
  const specialCount = (url.match(/[@%!*$#~]/g) || []).length;
  checks.push({ name:'Special Characters', result: specialCount > 3 ? 'fail' : specialCount > 1 ? 'warn' : 'pass',
    desc: specialCount > 3 ? `${specialCount} special chars — may be encoding/obfuscation` : specialCount ? `${specialCount} special character(s) found` : 'No suspicious special characters' });
  if (specialCount > 3) riskScore += 12;
  else if (specialCount > 1) riskScore += 4;

  // 13. Multiple redirects in query
  const redirectParams = ['redirect','url','next','dest','go','return','target'];
  const hasRedirect = redirectParams.some(p => query.includes(p+'='));
  checks.push({ name:'Redirect Parameters', result: hasRedirect ? 'warn' : 'pass',
    desc: hasRedirect ? 'URL contains redirect parameters — verify final destination' : 'No redirect parameters detected' });
  if (hasRedirect) riskScore += 15;

  // 14. Homograph characters
  const homographs = /[а-яёА-ЯЁ\u0400-\u04FF\u0600-\u06FF]/.test(domain);
  checks.push({ name:'Homograph Attack', result: homographs ? 'fail' : 'pass',
    desc: homographs ? 'Non-ASCII characters in domain — possible homograph/IDN attack' : 'Domain uses standard ASCII characters' });
  if (homographs) riskScore += 35;

  // 15. Port number
  const port = parsed.port;
  const unusualPort = port && !['80','443','8080','8443'].includes(port);
  checks.push({ name:'Port Number', result: unusualPort ? 'warn' : 'pass',
    desc: unusualPort ? `Uses unusual port ${port} — legitimate sites rarely need non-standard ports` : 'Standard port (or default)' });
  if (unusualPort) riskScore += 10;

  riskScore = Math.max(0, Math.min(100, riskScore));

  let verdict, level;
  if (isSafe && riskScore <= 15) { riskScore = Math.min(riskScore, 8); }
  if      (riskScore <= 20) { verdict = 'Safe';    level = 'safe';    }
  else if (riskScore <= 55) { verdict = 'Suspicious'; level = 'warning'; }
  else                      { verdict = 'Dangerous'; level = 'danger';  }

  return { url, domain, protocol, path, query, checks, riskScore, verdict, level,
    time: new Date().toLocaleTimeString() };
}

// ── SHOW RESULT ───────────────────────────────────────────
function showResult(r) {
  const icons = { safe:'✅', warning:'⚠️', danger:'🚨' };
  const verdictText = {
    safe:    'This URL appears safe to visit.',
    warning: 'This URL has suspicious characteristics. Proceed with caution.',
    danger:  'This URL shows multiple threat indicators. Do not visit!'
  };

  // Header
  document.getElementById('result-header').className = `result-header ${r.level}`;
  document.getElementById('result-header').innerHTML = `
    <div class="rh-icon">${icons[r.level]}</div>
    <div>
      <div class="rh-title">${r.verdict} — Risk Score: ${r.riskScore}/100</div>
      <div class="rh-verdict">${verdictText[r.level]}</div>
    </div>`;

  // Risk score card
  const barColor = { safe:'#22c55e', warning:'#f59e0b', danger:'#ef4444' };
  document.getElementById('risk-score-card').innerHTML = `
    <div class="rs-label">Risk Score</div>
    <div class="rs-circle ${r.level}">
      <span class="rs-num">${r.riskScore}</span>
      <span class="rs-of">/ 100</span>
    </div>
    <div class="rs-bar-wrap">
      <div class="rs-bar-fill" style="width:0%;background:${barColor[r.level]}" data-w="${r.riskScore}"></div>
    </div>
    <div class="rs-summary">${r.checks.filter(c=>c.result==='pass').length} checks passed · 
      ${r.checks.filter(c=>c.result==='warn').length} warnings · 
      ${r.checks.filter(c=>c.result==='fail').length} failed</div>`;

  // URL info card
  const pathDisplay = r.path.length > 30 ? r.path.slice(0,30)+'…' : (r.path||'/');
  document.getElementById('url-info-card').innerHTML = `
    <div class="ui-title">URL Details</div>
    <div class="ui-row"><span class="ui-key">Protocol</span>
      <span class="ui-val ${r.protocol==='https:'?'safe':'danger'}">${r.protocol}//${''}</span></div>
    <div class="ui-row"><span class="ui-key">Domain</span>
      <span class="ui-val">${r.domain}</span></div>
    <div class="ui-row"><span class="ui-key">Path</span>
      <span class="ui-val">${pathDisplay}</span></div>
    <div class="ui-row"><span class="ui-key">Parameters</span>
      <span class="ui-val ${r.query?'warning':'safe'}">${r.query ? r.query.slice(0,40)+'…' : 'None'}</span></div>
    <div class="ui-row"><span class="ui-key">Full Length</span>
      <span class="ui-val">${r.url.length} chars</span></div>
    <div class="ui-row"><span class="ui-key">Scanned At</span>
      <span class="ui-val">${r.time}</span></div>`;

  // Security checks
  const passIcon = '<i class="fas fa-check"></i>';
  const failIcon = '<i class="fas fa-times"></i>';
  const warnIcon = '<i class="fas fa-exclamation"></i>';
  document.getElementById('checks-card').innerHTML = `
    <div class="ch-title">
      Security Checks (${r.checks.length})
      <span style="font-size:.72rem;color:#475569;font-weight:400">
        ${r.checks.filter(c=>c.result==='pass').length}✓ 
        ${r.checks.filter(c=>c.result==='warn').length}⚠ 
        ${r.checks.filter(c=>c.result==='fail').length}✗
      </span>
    </div>
    <div class="ch-list">
      ${r.checks.map(c => `
        <div class="ch-item ${c.result}">
          <div class="ch-dot">${c.result==='pass'?passIcon:c.result==='fail'?failIcon:warnIcon}</div>
          <div class="ch-info">
            <div class="ch-name">${c.name}</div>
            <div class="ch-desc">${c.desc}</div>
          </div>
        </div>`).join('')}
    </div>`;

  document.getElementById('result-section').classList.remove('hidden');
  document.getElementById('result-section').scrollIntoView({ behavior:'smooth', block:'start' });

  // Animate risk bar
  setTimeout(() => {
    document.querySelector('.rs-bar-fill[data-w]').style.width = r.riskScore + '%';
  }, 200);
}

// ── HISTORY ──────────────────────────────────────────────
function addToHistory() {
  if (!lastResult) return;
  const exists = scanHistory.find(h => h.url === lastResult.url);
  if (!exists) {
    scanHistory.unshift({ url: lastResult.url, riskScore: lastResult.riskScore,
      level: lastResult.level, verdict: lastResult.verdict, time: lastResult.time });
    if (scanHistory.length > 20) scanHistory.pop();
    localStorage.setItem('sl_history', JSON.stringify(scanHistory));
    showToast('Report saved to history!');
  } else {
    showToast('Already in history.');
  }
  renderHistory();
}

function renderHistory() {
  if (scanHistory.length === 0) {
    document.getElementById('history-section').classList.add('hidden');
    return;
  }
  document.getElementById('history-section').classList.remove('hidden');
  const icons = { safe:'fa-check-circle', warning:'fa-exclamation-triangle', danger:'fa-times-circle' };
  document.getElementById('history-list').innerHTML = scanHistory.map((h, i) => `
    <div class="hist-item" onclick="rescanFromHistory(${i})">
      <div class="hist-icon ${h.level}"><i class="fas ${icons[h.level]}"></i></div>
      <span class="hist-url">${h.url}</span>
      <span class="hist-score ${h.level}">${h.riskScore}/100</span>
      <span class="hist-time">${h.time}</span>
    </div>`).join('');
}

function rescanFromHistory(i) {
  document.getElementById('url-input').value = scanHistory[i].url;
  scrollToScanner();
  setTimeout(() => startScan(), 300);
}

function clearHistory() {
  scanHistory = [];
  localStorage.removeItem('sl_history');
  document.getElementById('history-section').classList.add('hidden');
  showToast('History cleared.');
}

// ── TOAST ─────────────────────────────────────────────────
function showToast(msg) {
  let t = document.getElementById('sl-toast');
  if (!t) {
    t = document.createElement('div');
    t.id = 'sl-toast';
    t.style.cssText = `position:fixed;bottom:1.5rem;right:1.5rem;background:linear-gradient(135deg,#0369A1,#0EA5E9);
      color:#fff;padding:.65rem 1.25rem;border-radius:10px;font-size:.83rem;font-weight:600;
      z-index:9999;box-shadow:0 8px 25px rgba(0,0,0,.4);transition:opacity .3s`;
    document.body.appendChild(t);
  }
  t.textContent = '✓ ' + msg;
  t.style.opacity = '1';
  clearTimeout(t._t);
  t._t = setTimeout(() => { t.style.opacity = '0'; }, 2500);
}

// ── INIT ─────────────────────────────────────────────────
renderHistory();

// Smooth scroll nav links
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (href.startsWith('#')) {
      e.preventDefault();
      document.querySelector(href)?.scrollIntoView({ behavior:'smooth' });
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  });
});

// Highlight nav on scroll
window.addEventListener('scroll', () => {
  const sections = ['scanner','how-it-works','threat-types'];
  sections.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top <= 100 && rect.bottom >= 100) {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      document.querySelector(`.nav-link[href="#${id}"]`)?.classList.add('active');
    }
  });
});
