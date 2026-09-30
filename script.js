/* ═══════════════════════════════════════════════════════════════
   AARAV.PORTFOLIO — interactions
   Vanilla JS. No dependencies. Respects prefers-reduced-motion.
   ═══════════════════════════════════════════════════════════════ */

(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Preloader with real page-load progress ──────────────── */
  const preloader = $('#preloader');
  const preFill   = $('#preloaderFill');
  const preCount  = $('#preloaderCount');

  if (prefersReduced) {
    preloader?.classList.add('done');
  } else if (preloader) {
    let progress = 0;
    const tick = setInterval(() => {
      // ease toward 90% on a timer, then snap to 100 on load
      progress = Math.min(progress + Math.random() * 16 + 6, 92);
      render();
    }, 130);

    const render = () => {
      preFill.style.width = progress + '%';
      preCount.textContent = Math.round(progress) + '%';
    };
    render();

    const finish = () => {
      clearInterval(tick);
      progress = 100;
      render();
      setTimeout(() => {
        preloader.classList.add('done');
        // kick off hero stagger right after the curtain lifts
        $$('.hero .reveal').forEach((el, i) => {
          el.style.setProperty('--d', i * 0.12 + 's');
          el.classList.add('in');
        });
      }, 350);
    };
    if (document.readyState === 'complete') finish();
    else window.addEventListener('load', finish, { once: true });
    // safety net: never trap the user behind the preloader
    setTimeout(finish, 4000);
  }

  /* ── Custom cursor (dot follows instantly, ring lerps) ───── */
  const dot  = $('#cursorDot');
  const ring = $('#cursorRing');
  const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (fine && !prefersReduced) {
    let mx = -100, my = -100, rx = -100, ry = -100, raf;
    const move = (e) => { mx = e.clientX; my = e.clientY; };
    const loop = () => {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      dot.style.transform  = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('mousemove', move, { passive: true });
    loop();

    const hoverables = 'a, button, [data-tilt], .project-card, input, textarea';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverables)) ring.classList.add('hovering');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverables)) ring.classList.remove('hovering');
    });
  }

  /* ── Navbar: scrolled state + active section highlighting ── */
  const navbar  = $('#navbar');
  const navLinks = $$('.nav-link');

  const onScrollNav = () => {
    navbar?.classList.toggle('scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();

  const sections = $$('section[id]');
  const highlight = () => {
    const y = window.scrollY + 140;
    let current = 'home';
    for (const sec of sections) {
      if (sec.offsetTop <= y) current = sec.id;
    }
    navLinks.forEach(l =>
      l.classList.toggle('active', l.getAttribute('href') === `#${current}`)
    );
  };
  window.addEventListener('scroll', highlight, { passive: true });
  highlight();

  /* ── Mobile menu ─────────────────────────────────────────── */
  const hamburger = $('#hamburger');
  const navMenu   = $('#navLinks');
  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navMenu?.classList.toggle('open');
  });
  navMenu?.addEventListener('click', (e) => {
    if (e.target.closest('a')) {
      hamburger?.classList.remove('open');
      navMenu.classList.remove('open');
      navMenu.classList.remove('show');
    }
  });

  /* ── Theme toggle (remembers choice) ─────────────────────── */
  const themeToggle = $('#themeToggle');
  const setTheme = (light) => {
    document.body.classList.toggle('light', light);
    localStorage.setItem('theme', light ? 'light' : 'dark');
    if (themeToggle) {
      themeToggle.innerHTML = light
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
    }
  };
  setTheme(localStorage.getItem('theme') === 'light');
  themeToggle?.addEventListener('click', () =>
    setTheme(!document.body.classList.contains('light'))
  );

  /* ── Scroll progress bar ─────────────────────────────────── */
  const progress = $('#scrollProgress');
  const onProgress = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
  };
  window.addEventListener('scroll', onProgress, { passive: true });
  onProgress();

  /* ── Reveal on scroll ────────────────────────────────────── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en, i) => {
      if (en.isIntersecting) {
        const siblings = [...(en.target.parentElement?.children || [])];
        const idx = siblings.indexOf(en.target);
        en.target.style.setProperty('--d', Math.min(idx, 8) * 0.09 + 's');
        en.target.classList.add('in');
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach(el => io.observe(el));

  /* ── Animated counters ───────────────────────────────────── */
  const counters = $$('[data-count]');
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      const target = parseInt(el.dataset.count, 10);
      const dur = 1600;
      const start = performance.now();
      const step = (now) => {
        const t = Math.min((now - start) / dur, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
      cio.unobserve(el);
    });
  }, { threshold: 0.6 });
  counters.forEach(c => cio.observe(c));

  /* ── Skill bars fill when visible ────────────────────────── */
  const fills = $$('.skill-fill');
  const sio = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.style.width = en.target.dataset.width + '%';
        sio.unobserve(en.target);
      }
    });
  }, { threshold: 0.5 });
  fills.forEach(f => sio.observe(f));

  /* ── Typewriter in About section ─────────────────────────── */
  const typeEl = $('#typewriter');
  if (typeEl) {
    const phrases = [
      'building a design system at Nexlify ✦',
      'exploring WebGL shaders 🌌',
      'open for freelance work ✦',
      'drinking coffee nr. 4 ☕'
    ];
    let pi = 0, ci = 0, deleting = false;
    const type = () => {
      const phrase = phrases[pi];
      typeEl.textContent = phrase.slice(0, ci);
      if (!deleting) {
        if (ci < phrase.length) { ci++; setTimeout(type, 55); }
        else { deleting = true; setTimeout(type, 1900); }
      } else {
        if (ci > 0) { ci--; setTimeout(type, 26); }
        else { deleting = false; pi = (pi + 1) % phrases.length; setTimeout(type, 420); }
      }
    };
    type();
  }

  /* ── 3D tilt on cards (desktop only) ─────────────────────── */
  if (fine && !prefersReduced) {
    $$('[data-tilt]').forEach(card => {
      let raf = null;
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transform =
            `perspective(900px) rotateX(${-py * 7}deg) rotateY(${px * 9}deg) translateY(-4px)`;
        });
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateY(0)';
      });
    });
  }

  /* ── Magnetic hover for buttons / socials / logo ─────────── */
  if (fine && !prefersReduced) {
    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.28;
        const y = (e.clientY - r.top - r.height / 2) * 0.28;
        el.style.transform = `translate(${x}px, ${y}px)`;
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0, 0)';
        el.style.transition = 'transform .45s cubic-bezier(.34,1.56,.64,1)';
        setTimeout(() => (el.style.transition = ''), 460);
      });
    });
  }

  /* ── Project filtering ───────────────────────────────────── */
  const filterBtns = $$('.filter-btn');
  const cards = $$('.project-card');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const f = btn.dataset.filter;
      cards.forEach(card => {
        const show = f === 'all' || card.dataset.category === f;
        if (show) {
          card.classList.remove('hide', 'dimmed');
          card.style.animation = 'none';
          void card.offsetWidth; // reflow restart
          card.style.animation = 'cardIn .5s cubic-bezier(.16,1,.3,1) both';
        } else {
          card.classList.add('hide');
        }
      });
    });
  });
  // inject keyframe used above
  const style = document.createElement('style');
  style.textContent = '@keyframes cardIn{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:none}}';
  document.head.appendChild(style);

  /* ── Testimonial slider ──────────────────────────────────── */
  const track = $('#testimonialTrack');
  const dotsWrap = $('#sliderDots');
  if (track && dotsWrap) {
    const slides = $$('.testimonial', track);
    let index = 0;
    let timer;

    dotsWrap.innerHTML = slides
      .map((_, i) => `<button class="slider-dot${i === 0 ? ' active' : ''}" aria-label="Go to testimonial ${i + 1}"></button>`)
      .join('');
    const dots = $$('.slider-dot', dotsWrap);

    const go = (i) => {
      index = (i + slides.length) % slides.length;
      track.style.transform = `translateX(-${index * 100}%)`;
      dots.forEach((d, di) => d.classList.toggle('active', di === index));
    };
    const auto = () => {
      clearInterval(timer);
      timer = setInterval(() => go(index + 1), 5500);
    };
    $('#prevSlide')?.addEventListener('click', () => { go(index - 1); auto(); });
    $('#nextSlide')?.addEventListener('click', () => { go(index + 1); auto(); });
    dots.forEach((d, di) => d.addEventListener('click', () => { go(di); auto(); }));
    auto();
  }

  /* ── Contact form (front-end demo validation + status) ───── */
  const form = $('#contactForm');
  const status = $('#formStatus');
  const submitBtn = $('#submitBtn');
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = $('#name').value.trim();
    const email = $('#email').value.trim();
    const message = $('#message').value.trim();

    if (!name || !email || !message) {
      status.textContent = '⚠ please fill in all required fields';
      status.style.color = '#ff5470';
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      status.textContent = '⚠ that email doesn\'t look right';
      status.style.color = '#ff5470';
      return;
    }

    status.style.color = 'var(--accent)';
    status.textContent = 'sending…';
    submitBtn.disabled = true;

    // Simulated send — replace with fetch() to your backend/Formspree
    setTimeout(() => {
      status.textContent = '✓ message sent! I\'ll reply within 24h.';
      form.reset();
      submitBtn.disabled = false;
    }, 1200);
  });

  /* ── Footer year stays fresh ─────────────────────────────── */
  const yr = $('.footer-bottom p');
  if (yr) yr.textContent = yr.textContent.replace('2026', new Date().getFullYear());

})();
