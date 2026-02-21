/* ============================================
   SIRI PORTFOLIO — SCRIPT.JS
   Phase 7: Advanced Add-Ons
============================================ */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  initTheme();            // Phase 7: Dark/Light mode
  initLoader();
  initCursor();
  initNavbar();           // includes scroll-progress update
  initTypingEffect();
  initScrollAnimations();
  initSkillBars();
  initSkillTabs();
  initProjectFilters();
  initCounterAnimation();
  initContactForm();
  initBackToTop();
  initRipple();           // click ripple on .btn elements
  initParticles();        // Phase 7: animated background particles
  initProjectModal();     // Phase 7: project modal popups
  initResumeFab();        // Phase 7: floating resume download button
});

/* ============================================
   PHASE 7 FEATURES
============================================ */

/* ── 1. DARK / LIGHT MODE TOGGLE ─────────────────────────── */
function initTheme() {
  const toggle = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  if (!toggle) return;

  // Load saved preference (default: dark)
  const saved = localStorage.getItem('portfolioTheme') || 'dark';
  applyTheme(saved);

  toggle.addEventListener('click', () => {
    const current = document.body.classList.contains('light-mode') ? 'light' : 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    localStorage.setItem('portfolioTheme', next);
    showToast(next === 'light' ? '☀️ Switched to Light Mode' : '🌙 Switched to Dark Mode', 'success');
  });

  function applyTheme(mode) {
    if (mode === 'light') {
      document.body.classList.add('light-mode');
      icon.className = 'fas fa-sun';
      toggle.setAttribute('title', 'Switch to Dark Mode');
    } else {
      document.body.classList.remove('light-mode');
      icon.className = 'fas fa-moon';
      toggle.setAttribute('title', 'Switch to Light Mode');
    }
  }
}

/* ── 2. ANIMATED PARTICLE CANVAS ─────────────────────────── */
function initParticles() {
  const canvas = document.getElementById('particlesCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles = [], mouse = { x: -999, y: -999 };

  const COUNT = 55;
  const MAX_DIST = 130;
  const COLORS = ['#818CF8', '#22D3EE', '#EC4899', '#6366F1'];

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  function randomColor() {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
  }

  function createParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.55,
      vy: (Math.random() - 0.5) * 0.55,
      r: Math.random() * 2.2 + 0.8,
      color: randomColor(),
      alpha: Math.random() * 0.5 + 0.25,
    };
  }

  function init() {
    particles = Array.from({ length: COUNT }, createParticle);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach(p => {
      // Subtle mouse attraction
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 180) {
        p.vx += dx * 0.00012;
        p.vy += dy * 0.00012;
      }

      // Speed cap
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > 1.2) { p.vx *= 0.98; p.vy *= 0.98; }

      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;

      // Draw dot
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    // Connect nearby particles with lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i], b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < MAX_DIST) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = a.color;
          ctx.globalAlpha = (1 - d / MAX_DIST) * 0.18;
          ctx.lineWidth = 0.8;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }

    requestAnimationFrame(draw);
  }

  // Mouse tracking relative to canvas
  const hero = canvas.closest('.hero') || document.body;
  hero.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  hero.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

  resize();
  init();
  draw();
  window.addEventListener('resize', () => { resize(); init(); });
}

/* ── 3. PROJECT MODAL ─────────────────────────────────────── */
function initProjectModal() {
  const overlay = document.getElementById('projectModal');
  const closeBtn = document.getElementById('modalClose');
  const banner = document.getElementById('modalBanner');
  const bannerIcon = document.getElementById('modalBannerIcon');
  const tagsEl = document.getElementById('modalTags');
  const titleEl = document.getElementById('modalTitle');
  const descEl = document.getElementById('modalDesc');
  const metaEl = document.getElementById('modalMeta');
  const actionsEl = document.getElementById('modalActions');

  if (!overlay) return;

  function openModal(card) {
    const title = card.dataset.title || 'Project';
    const desc = card.dataset.desc || '';
    const tags = (card.dataset.tags || '').split(',').filter(Boolean);
    const github = card.dataset.github || '';
    const demo = card.dataset.demo || '';
    const date = card.dataset.date || '';
    const color = card.dataset.color || 'linear-gradient(135deg,#6366F1,#06B6D4)';
    const icon = card.dataset.icon || 'fa-code';

    banner.style.background = color;
    bannerIcon.className = `fas ${icon} modal-banner-icon`;
    tagsEl.innerHTML = tags.map(t => `<span class="modal-tag">${t.trim()}</span>`).join('');
    titleEl.textContent = title;
    descEl.textContent = desc;

    metaEl.innerHTML = `
      ${date ? `<span><i class="fas fa-calendar"></i> ${date}</span>` : ''}
      ${github ? `<span><i class="fab fa-github"></i> GitHub Available</span>` : ''}
      ${demo ? `<span><i class="fas fa-globe"></i> Live Demo Available</span>` : ''}
    `;

    let actions = '';
    if (github) {
      actions += `<a href="${github}" target="_blank" rel="noopener" class="btn btn-primary"><i class="fab fa-github"></i> View on GitHub</a>`;
    }
    if (demo) {
      actions += `<a href="${demo}" target="_blank" rel="noopener" class="btn btn-secondary"><i class="fas fa-external-link-alt"></i> Live Demo</a>`;
    }
    actionsEl.innerHTML = actions;

    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Delegate clicks on trigger buttons inside any .project-card
  document.addEventListener('click', e => {
    const triggerBtn = e.target.closest('.modal-trigger-btn, .btn-view-modal');
    if (triggerBtn) {
      const card = triggerBtn.closest('.project-card');
      if (card) { e.preventDefault(); openModal(card); }
    }
  });

  closeBtn?.addEventListener('click', closeModal);
  overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

/* ── 4. FLOATING RESUME FAB ───────────────────────────────── */
function initResumeFab() {
  const fab = document.getElementById('resumeFab');
  if (!fab) return;

  // Show FAB after loading screen finishes (~2.5s)
  setTimeout(() => fab.classList.add('visible'), 2600);

  fab.addEventListener('click', () => {
    showToast('📄 Resume download started!', 'success');
  });

  const navResume = document.getElementById('resumeNavBtn');
  navResume?.addEventListener('click', () => {
    showToast('📄 Resume download started!', 'success');
  });
}

/* ── 5. TOAST NOTIFICATION (global utility) ──────────────── */
let toastTimer = null;

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  const toastIcon = toast?.querySelector('.toast-icon');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = msg;
  toast.className = `toast toast-${type} show`;
  if (toastIcon) {
    toastIcon.className = type === 'error'
      ? 'fas fa-times-circle toast-icon'
      : 'fas fa-check-circle toast-icon';
  }

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.classList.remove('show'); }, 3200);
}

/* ============================================
   EXISTING FEATURES (enhanced)
============================================ */

/* ===== LOADING SCREEN ===== */
function initLoader() {
  const loader = document.getElementById('loader');
  if (!loader) return;
  document.body.style.overflow = 'hidden';
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.style.overflow = '';
  }, 2200);
}

/* ===== CUSTOM CURSOR ===== */
function initCursor() {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursorFollower');
  if (!cursor || !follower) return;

  if (!window.matchMedia('(hover: hover)').matches) {
    cursor.style.display = follower.style.display = 'none';
    return;
  }

  let mx = 0, my = 0, fx = 0, fy = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
  });

  (function animateFollower() {
    fx += (mx - fx) * 0.12;
    fy += (my - fy) * 0.12;
    follower.style.left = fx + 'px';
    follower.style.top = fy + 'px';
    requestAnimationFrame(animateFollower);
  })();

  const hoverEls = document.querySelectorAll('a, button, .skill-tab, .filter-btn, .project-card, .cert-card');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(2.2)';
      cursor.style.background = 'rgba(99,102,241,0.6)';
      follower.style.width = '56px';
      follower.style.height = '56px';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%,-50%) scale(1)';
      cursor.style.background = 'var(--color-primary)';
      follower.style.width = '34px';
      follower.style.height = '34px';
    });
  });
}

/* ===== NAVBAR ===== */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const linkItems = document.querySelectorAll('.nav-link');

  if (!navbar) return;

  const progressFill = document.getElementById('scrollProgressFill');

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
    if (progressFill) {
      const scrolled = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (scrolled / docHeight) * 100 : 0;
      progressFill.style.width = Math.min(pct, 100) + '%';
    }
    updateActiveLink();
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks?.classList.toggle('open');
  });

  linkItems.forEach(link => link.addEventListener('click', () => {
    hamburger?.classList.remove('active');
    navLinks?.classList.remove('open');
  }));

  function updateActiveLink() {
    const scrollPos = window.scrollY + 120;
    document.querySelectorAll('section[id]').forEach(sec => {
      const link = document.querySelector(`.nav-link[href="#${sec.id}"]`);
      if (!link) return;
      const inView = scrollPos >= sec.offsetTop && scrollPos < sec.offsetTop + sec.offsetHeight;
      link.classList.toggle('active', inView);
    });
  }
}

/* ===== TYPING EFFECT ===== */
function initTypingEffect() {
  const el = document.getElementById('typedText');
  if (!el) return;

  const texts = [
    'Java Full Stack Developer',
    'Web Application Builder',
    'Problem Solver',
    'Clean Code Advocate',
    'Backend Enthusiast'
  ];

  let ti = 0, ci = 0, deleting = false, delay = 120;

  function type() {
    const cur = texts[ti];
    el.textContent = deleting
      ? cur.substring(0, ci - 1)
      : cur.substring(0, ci + 1);

    deleting ? ci-- : ci++;

    if (!deleting && ci === cur.length) { delay = 2000; deleting = true; }
    else if (deleting && ci === 0) { deleting = false; ti = (ti + 1) % texts.length; delay = 380; }
    else { delay = deleting ? 55 : 120; }

    setTimeout(type, delay);
  }

  setTimeout(type, 2600);
}

/* ===== SCROLL ANIMATIONS ===== */
function initScrollAnimations() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('[data-aos]').forEach(el => obs.observe(el));
}

/* ===== SKILL BARS (staggered) ===== */
function initSkillBars() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.skill-fill').forEach((fill, i) => {
          const w = fill.getAttribute('data-width');
          if (w) setTimeout(() => { fill.style.width = w + '%'; }, 200 + i * 80);
        });
      }
    });
  }, { threshold: 0.2 });

  const sec = document.getElementById('skills');
  if (sec) obs.observe(sec);
}

/* ===== SKILL TABS ===== */
function initSkillTabs() {
  const tabs = document.querySelectorAll('.skill-tab');
  const panels = document.querySelectorAll('.skills-panel');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.getAttribute('data-tab');
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      panels.forEach(p => {
        p.classList.remove('active');
        if (p.id === `panel-${target}`) {
          p.classList.add('active');
          p.querySelectorAll('.skill-fill').forEach((fill, i) => {
            const w = fill.getAttribute('data-width');
            if (w) {
              fill.style.width = '0';
              setTimeout(() => { fill.style.width = w + '%'; }, 100 + i * 60);
            }
          });
        }
      });
    });
  });
}

/* ===== PROJECT FILTERS ===== */
function initProjectFilters() {
  const btns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        card.classList.toggle('hidden', filter !== 'all' && cat !== filter);
      });
    });
  });
}

/* ===== COUNTER ANIMATION ===== */
function initCounterAnimation() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.getAttribute('data-count'));
      let current = 0;
      const step = target / 50;
      const timer = setInterval(() => {
        current += step;
        if (current >= target) { el.textContent = target; clearInterval(timer); }
        else { el.textContent = Math.floor(current); }
      }, 40);
      obs.unobserve(el);
    });
  }, { threshold: 0.5 });

  counters.forEach(el => obs.observe(el));
}

/* ===== CONTACT FORM WITH VALIDATION ===== */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const statusEl = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitContactBtn');

  if (!form) return;

  const fields = [
    { id: 'contactName', errId: 'nameError', validate: v => v.trim().length >= 2 ? '' : 'Please enter your name (min 2 characters).' },
    { id: 'contactEmail', errId: 'emailError', validate: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Please enter a valid email address.' },
    { id: 'contactMessage', errId: 'messageError', validate: v => v.trim().length >= 10 ? '' : 'Message must be at least 10 characters.' },
  ];

  fields.forEach(({ id, errId, validate }) => {
    const input = document.getElementById(id);
    const errEl = document.getElementById(errId);
    if (!input || !errEl) return;

    input.addEventListener('blur', () => {
      const msg = validate(input.value);
      errEl.textContent = msg;
      input.parentElement.classList.toggle('has-error', !!msg);
    });
    input.addEventListener('input', () => {
      if (errEl.textContent) {
        const msg = validate(input.value);
        errEl.textContent = msg;
        input.parentElement.classList.toggle('has-error', !!msg);
      }
    });
  });

  form.addEventListener('submit', async e => {
    e.preventDefault();

    let valid = true;
    fields.forEach(({ id, errId, validate }) => {
      const input = document.getElementById(id);
      const errEl = document.getElementById(errId);
      if (!input || !errEl) return;
      const msg = validate(input.value);
      errEl.textContent = msg;
      input.parentElement.classList.toggle('has-error', !!msg);
      if (msg) valid = false;
    });

    if (!valid) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending\u2026';

    await new Promise(r => setTimeout(r, 1500));

    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';

    showStatus('success', '\u2705 Message sent! I\'ll get back to you soon.');
    showToast('\u2705 Message sent successfully!', 'success');
    form.reset();
    fields.forEach(({ errId }) => {
      const errEl = document.getElementById(errId);
      if (errEl) errEl.textContent = '';
    });
  });

  function showStatus(type, msg) {
    if (!statusEl) return;
    statusEl.className = `form-status ${type}`;
    statusEl.textContent = msg;
    setTimeout(() => { statusEl.className = 'form-status'; }, 5000);
  }
}

/* ===== BACK TO TOP ===== */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 500), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ===== RIPPLE ON CLICK ===== */
function initRipple() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
      this.querySelectorAll('.ripple-circle').forEach(r => r.remove());

      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      const ripple = document.createElement('span');
      ripple.className = 'ripple-circle';
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;

      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });
}
