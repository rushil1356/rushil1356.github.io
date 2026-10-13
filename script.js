const root = document.documentElement;
const themeButton = document.getElementById('themeButton');
const projectDialog = document.getElementById('projectDialog');
const dialogContent = document.getElementById('dialogContent');
const commandDialog = document.getElementById('commandDialog');
const commandInput = document.getElementById('commandInput');
const commandButton = document.getElementById('commandButton');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const EMAIL = 'rushiltpandya@gmail.com';

// Theme (storage can be unavailable in private windows)
try {
  const storedTheme = localStorage.getItem('rp-theme');
  if (storedTheme) root.dataset.theme = storedTheme;
} catch (e) {}

themeButton.addEventListener('click', toggleTheme);
function toggleTheme() {
  root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
  try { localStorage.setItem('rp-theme', root.dataset.theme); } catch (e) {}
  restartSignal();
}

// Toast
const toastEl = document.getElementById('toast');
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
}

// Copy email
async function copyEmail() {
  try {
    await navigator.clipboard.writeText(EMAIL);
    toast('Email copied');
  } catch (e) {
    const t = document.getElementById('emailText');
    const range = document.createRange();
    range.selectNodeContents(t);
    const sel = window.getSelection();
    sel.removeAllRanges(); sel.addRange(range);
    t.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    toast('Email selected. Press Ctrl+C to copy');
  }
}
document.querySelectorAll('[data-copy-email]').forEach(b => b.addEventListener('click', copyEmail));

// Scroll reveal (content is visible at rest; this only adds a lift)
if ('IntersectionObserver' in window && !reduceMotion) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
}

// Scroll progress
const progress = document.querySelector('.scroll-progress span');
window.addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0}%`;
}, { passive: true });

// Cursor glow + magnetic microinteraction
const glow = document.querySelector('.cursor-glow');
window.addEventListener('pointermove', (e) => {
  glow.style.left = `${e.clientX}px`;
  glow.style.top = `${e.clientY}px`;
}, { passive: true });

document.querySelectorAll('.magnetic').forEach((el) => {
  el.addEventListener('pointermove', (e) => {
    if (reduceMotion || window.matchMedia('(pointer: coarse)').matches) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * 0.12;
    const y = (e.clientY - r.top - r.height / 2) * 0.12;
    el.style.transform = `translate(${x}px, ${y}px)`;
  });
  el.addEventListener('pointerleave', () => { el.style.transform = ''; });
});

// Project filtering
const filterButtons = [...document.querySelectorAll('.filter')];
const projectCards = [...document.querySelectorAll('.project-card')];
filterButtons.forEach(btn => btn.addEventListener('click', () => {
  const value = btn.dataset.filter;
  filterButtons.forEach(b => b.classList.toggle('active', b === btn));
  projectCards.forEach(card => {
    const categories = card.dataset.category.split(' ');
    card.classList.toggle('is-hidden', value !== 'all' && !categories.includes(value));
  });
}));

// Case studies
const caseStudies = {
  steady: {
    kicker: 'HackRU Fall 2026 · Team lead',
    title: 'Steady',
    intro: 'Older adults on several medications often miss doses or take them wrongly. Constant reminders get annoying and build dependence, and caregivers have no easy way to know when something is off between visits. Steady builds the habit instead of nagging forever, and keeps the caregiver informed without alarming the patient.',
    challenge: 'Make a medication companion that older adults can use by voice, that knows when to step back, and that notices when something sounds wrong, all in about 24 hours with a team of three.',
    approach: 'I owned the AI, voice and SMS layers and the end-to-end integration. Gemini vision turns medicine-bottle photos into a schedule the caregiver approves. Gemini audio analyzes the check-in recording itself, not only the transcript, for symptoms, tone and urgency. ElevenLabs handles speech in both directions, and Twilio sends the caregiver a silent SMS. Retries, a fallback model and a mock mode with a pytest suite kept it reliable.',
    takeaway: 'A weekend prototype: one patient and one caregiver per install, no user study yet, and observations are not diagnoses. It supports English and Hindi. The code is public at github.com/rushil1356/Steady.',
    stack: 'Python · FastAPI · React 19 · TypeScript · Tailwind · Gemini · ElevenLabs · Twilio · pytest'
  },
  billbuddy: {
    kicker: 'IBM Datathon · 3rd Place',
    title: 'BillBuddy',
    intro: 'Medical bills are dense, inconsistent and hard to audit. BillBuddy reads a bill and turns it into structured information a patient can actually check for overbilling.',
    challenge: 'Get from a messy bill image to a trustworthy answer in a single request, with five components built from zero in 24 hours.',
    approach: 'Tesseract OCR for extraction, a Pandas transformation pipeline, a PyTorch regression model trained and evaluated to about 12% mean absolute error, a FastAPI inference layer and a React client. Endpoints handle extraction, inference and comparison in one request cycle. The environment is containerised with Docker.',
    takeaway: 'I presented the system design and the model to IBM executive judges, including where it fails and what the output means for a non-technical user. We placed 3rd.',
    stack: 'Python · PyTorch · FastAPI · Pandas · Tesseract OCR · React · Docker'
  },
  fambud: {
    kicker: 'Full-stack product',
    title: 'Fambud',
    intro: 'A full-stack application designed and shipped across four phased releases, built to hold up under real use rather than a demo.',
    challenge: 'Keep a multi-table app correct as features land in phases, and catch the bugs that only show up when real people use it.',
    approach: 'FastAPI backend with SQLModel over a multi-table relational schema, and a React frontend rebuilt from vanilla JS with a mobile-first UI. Features include invite codes that expire, computed threshold alerts and per-user reporting. Every phase was gated by unit tests and live HTTP integration tests.',
    takeaway: 'Rolling it out to real users before launch exposed state-consistency bugs that isolated tests had missed. I traced them down and fixed them under real conditions.',
    stack: 'Python · FastAPI · SQLModel · SQLite · React · Docker · Git'
  }
};

function openCase(key) {
  const item = caseStudies[key];
  if (!item) return;
  dialogContent.innerHTML = `
    <div class="dialog-body">
      <div class="dialog-kicker">${item.kicker}</div>
      <h3>${item.title}</h3>
      <p>${item.intro}</p>
      <div class="dialog-grid">
        <div><span>Challenge</span><p>${item.challenge}</p></div>
        <div><span>Approach</span><p>${item.approach}</p></div>
        <div><span>Result</span><p>${item.takeaway}</p></div>
        <div><span>Stack</span><p>${item.stack}</p></div>
      </div>
    </div>`;
  projectDialog.showModal();
}
document.querySelectorAll('.project-open').forEach(btn => {
  btn.addEventListener('click', () => openCase(btn.dataset.project));
});
document.querySelector('.dialog-close').addEventListener('click', () => projectDialog.close());
projectDialog.addEventListener('click', (e) => { if (e.target === projectDialog) projectDialog.close(); });

// Command palette
function openCommand() {
  if (projectDialog.open) projectDialog.close();
  commandDialog.showModal();
  commandInput.value = '';
  filterCommands('');
  setTimeout(() => commandInput.focus(), 20);
}
commandButton.addEventListener('click', openCommand);
window.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    commandDialog.open ? commandDialog.close() : openCommand();
  }
  if (!commandDialog.open && e.key === '/') {
    if (!['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      e.preventDefault(); openCommand();
    }
  }
});

const commandButtons = [...document.querySelectorAll('.command-list button')];
function filterCommands(query) {
  const q = query.toLowerCase();
  commandButtons.forEach(btn => { btn.hidden = !btn.textContent.toLowerCase().includes(q); });
}
function runCommand(btn) {
  commandDialog.close();
  if (btn.dataset.action === 'theme') toggleTheme();
  if (btn.dataset.action === 'email') copyEmail();
  if (btn.dataset.project) openCase(btn.dataset.project);
  if (btn.dataset.target) document.querySelector(btn.dataset.target)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
}
commandInput.addEventListener('input', () => filterCommands(commandInput.value));
commandInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    const first = commandButtons.find(b => !b.hidden);
    if (first) runCommand(first);
  }
});
commandButtons.forEach(btn => btn.addEventListener('click', () => runCommand(btn)));

// Interactive hero signal canvas
const canvas = document.getElementById('signalCanvas');
let ctx, nodes = [], raf, pointer = { x: -9999, y: -9999 };
function getColors() {
  const css = getComputedStyle(root);
  return { text: css.getPropertyValue('--text').trim(), accent: css.getPropertyValue('--accent').trim() };
}
function hexToRgb(hex) {
  const h = hex.replace('#', '').trim();
  if (h.length !== 6) return [220, 220, 220];
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(rect.width * dpr);
  canvas.height = Math.floor(rect.height * dpr);
  ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  nodes = Array.from({ length: Math.max(34, Math.floor(rect.width * rect.height / 12500)) }, () => ({
    x: Math.random() * rect.width,
    y: Math.random() * rect.height,
    vx: (Math.random() - .5) * .22,
    vy: (Math.random() - .5) * .22,
    r: Math.random() * 1.6 + .8
  }));
}
function drawSignal(move) {
  const rect = canvas.getBoundingClientRect();
  const colors = getColors();
  const [tr, tg, tb] = hexToRgb(colors.text);
  const [ar, ag, ab] = hexToRgb(colors.accent);
  ctx.clearRect(0, 0, rect.width, rect.height);
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i];
    if (move) {
      a.x += a.vx; a.y += a.vy;
      if (a.x < 0 || a.x > rect.width) a.vx *= -1;
      if (a.y < 0 || a.y > rect.height) a.vy *= -1;
    }
    const pd = Math.hypot(a.x - pointer.x, a.y - pointer.y);
    if (move && pd < 150) {
      const force = (150 - pd) / 150;
      a.x += (a.x - pointer.x) * .0035 * force;
      a.y += (a.y - pointer.y) * .0035 * force;
    }
    for (let j = i + 1; j < nodes.length; j++) {
      const b = nodes[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 120) {
        const alpha = (1 - d / 120) * .13;
        ctx.strokeStyle = `rgba(${tr},${tg},${tb},${alpha})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
    const near = pd < 140;
    ctx.fillStyle = near ? `rgba(${ar},${ag},${ab},.92)` : `rgba(${tr},${tg},${tb},.46)`;
    ctx.beginPath(); ctx.arc(a.x, a.y, near ? a.r * 1.6 : a.r, 0, Math.PI * 2); ctx.fill();
  }
}
function animateSignal() {
  drawSignal(true);
  raf = requestAnimationFrame(animateSignal);
}
function restartSignal() {
  cancelAnimationFrame(raf);
  resizeCanvas();
  if (reduceMotion) drawSignal(false); else animateSignal();
}
canvas.addEventListener('pointermove', e => {
  const r = canvas.getBoundingClientRect();
  pointer = { x: e.clientX - r.left, y: e.clientY - r.top };
});
canvas.addEventListener('pointerleave', () => { pointer = { x: -9999, y: -9999 }; });
window.addEventListener('resize', restartSignal);
restartSignal();

document.getElementById('year').textContent = new Date().getFullYear();
