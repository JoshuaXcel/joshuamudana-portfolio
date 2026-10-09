(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;

  /* theme */
  const saved = (() => { try { return localStorage.getItem("theme"); } catch (e) { return null; } })();
  if (saved) root.dataset.theme = saved;
  const themeBtn = $("#themeToggle");
  const syncThemeLabel = () => themeBtn.setAttribute("aria-label", root.dataset.theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
  syncThemeLabel();
  themeBtn.addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch (e) {}
    $$("svg", themeBtn).forEach(s => { s.style.animation = "none"; s.offsetWidth; s.style.animation = ""; });
    syncThemeLabel();
  });

  /* toast */
  const toastEl = $("#toast"); let tt;
  const toast = (m) => { toastEl.textContent = m; toastEl.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => toastEl.classList.remove("show"), 2600); };

  /* loader → start hero */
  const loader = $("#loader");
  let started = false;
  const start = () => { if (started) return; started = true; loader.classList.add("done"); typeTagline(); };
  window.addEventListener("load", () => setTimeout(start, reduce ? 0 : 1700));
  setTimeout(start, 3500);

  /* typing tagline */
  const typed = $("#typed");
  const phrases = ["Building Smart Systems", "Training ML Models", "Shipping FastAPI Apps", "Building Smart Systems"];
  function typeTagline() {
    if (reduce) return;
    let p = 0, i = 0, del = false;
    typed.textContent = "";
    const step = () => {
      const word = phrases[p];
      if (!del) {
        typed.textContent = word.slice(0, ++i);
        if (i === word.length) {
          if (p === phrases.length - 1) return; // rest on the main tagline
          del = true; return setTimeout(step, 1300);
        }
        return setTimeout(step, 55 + Math.random() * 40);
      }
      typed.textContent = word.slice(0, --i);
      if (i === 0) { del = false; p++; return setTimeout(step, 250); }
      setTimeout(step, 28);
    };
    setTimeout(step, 450);
  }

  /* nav: scrolled, progress, active, top button */
  const nav = $("#nav"), prog = $("#progress"), toTop = $("#toTop");
  const links = $$(".nav-links a");
  const sections = links.map(a => $(a.getAttribute("href"))).filter(Boolean);
  const onScroll = () => {
    const y = scrollY, h = document.documentElement.scrollHeight - innerHeight;
    nav.classList.toggle("scrolled", y > 20);
    prog.style.transform = `scaleX(${h > 0 ? y / h : 0})`;
    toTop.classList.toggle("show", y > innerHeight * 0.8);
    let cur = null;
    for (const s of sections) if (s.getBoundingClientRect().top < innerHeight * 0.4) cur = s.id;
    if (y + innerHeight >= document.documentElement.scrollHeight - 4) cur = "contact";
    links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + cur));
  };
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));

  /* mobile menu */
  const menuBtn = $("#menuBtn"), navLinks = $("#navLinks");
  const setMenu = (open) => { navLinks.classList.toggle("open", open); menuBtn.setAttribute("aria-expanded", open); menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu"); };
  menuBtn.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
  links.forEach(a => a.addEventListener("click", () => setMenu(false)));

  /* reveal + counters */
  const io = new IntersectionObserver((es) => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target;
    const sib = el.parentElement ? $$(":scope > .reveal", el.parentElement) : [];
    const idx = Math.max(0, sib.indexOf(el));
    el.style.transitionDelay = Math.min(idx * 70, 350) + "ms";
    el.classList.add("in"); io.unobserve(el);
    $$(".count", el).forEach(countUp);
  }), { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  $$(".reveal").forEach(el => io.observe(el));
  function countUp(el) {
    const to = +el.dataset.to, pad = +(el.dataset.pad || 0), dur = 1800, t0 = performance.now();
    const fmt = n => pad ? String(n).padStart(pad, "0") : n.toLocaleString("en-US");
    if (reduce) { el.textContent = fmt(to); return; }
    const tick = (t) => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(Math.round(to * e)); if (k < 1) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }

  /* tilt */
  if (!reduce && matchMedia("(hover: hover)").matches) {
    $$(".tilt").forEach(card => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        card.style.transform = `perspective(900px) rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg) translateY(-4px)`;
      });
      card.addEventListener("pointerleave", () => { card.style.transform = ""; });
    });
  }

  /* neural network canvas */
  const cv = $("#neural"), ctx = cv.getContext("2d");
  let W, H, nodes = [], mouse = { x: -999, y: -999 }, dpr = Math.min(devicePixelRatio || 1, 2);
  const resize = () => {
    W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(Math.min(90, Math.max(38, W * H / 14000)));
    nodes = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: Math.random() * 1.8 + .8, p: Math.random() * 6.28 }));
  };
  resize(); addEventListener("resize", resize);
  cv.parentElement.addEventListener("pointermove", (e) => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
  cv.parentElement.addEventListener("pointerleave", () => { mouse.x = mouse.y = -999; });
  const pulses = [];
  const draw = (t) => {
    ctx.clearRect(0, 0, W, H);
    const light = root.dataset.theme === "light";
    const lineC = light ? "27,63,216" : "91,160,255", dotC = light ? "27,63,216" : "140,200,255";
    const D = Math.min(150, W / 3.2);
    for (const a of nodes) {
      a.x += a.vx; a.y += a.vy;
      if (a.x < 0 || a.x > W) a.vx *= -1; if (a.y < 0 || a.y > H) a.vy *= -1;
      const dx = a.x - mouse.x, dy = a.y - mouse.y, dm = Math.hypot(dx, dy);
      if (dm < 120) { a.x += dx / dm * .8; a.y += dy / dm * .8; }
    }
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < D) {
        ctx.strokeStyle = `rgba(${lineC},${(1 - d / D) * (light ? .28 : .35)})`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        if (!reduce && Math.random() < .0009 && pulses.length < 14) pulses.push({ a, b, k: 0 });
      }
    }
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i]; p.k += .02;
      if (p.k >= 1) { pulses.splice(i, 1); continue; }
      const x = p.a.x + (p.b.x - p.a.x) * p.k, y = p.a.y + (p.b.y - p.a.y) * p.k;
      ctx.fillStyle = light ? "rgba(27,63,216,.9)" : "rgba(120,220,255,.95)";
      ctx.shadowColor = "#5BC0FF"; ctx.shadowBlur = 10; ctx.beginPath(); ctx.arc(x, y, 2.2, 0, 6.28); ctx.fill(); ctx.shadowBlur = 0;
    }
    for (const a of nodes) {
      const g = .55 + .45 * Math.sin(t / 900 + a.p);
      ctx.fillStyle = `rgba(${dotC},${g})`; ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.28); ctx.fill();
    }
    if (!reduce) requestAnimationFrame(draw);
  };
  requestAnimationFrame(draw);

  /* project filters */
  const filters = $$(".filter"), projects = $$(".project");
  filters.forEach(f => f.addEventListener("click", () => {
    filters.forEach(x => { x.classList.toggle("active", x === f); x.setAttribute("aria-selected", x === f); });
    const cat = f.dataset.filter;
    projects.forEach(p => {
      const show = cat === "all" || p.dataset.cats.split(" ").includes(cat);
      p.classList.toggle("hide", !show);
      if (show) { p.classList.add("in"); p.classList.remove("fade-in"); p.offsetWidth; p.classList.add("fade-in"); }
    });
  }));

  /* project modal */
  const DATA = {
    helpa: { status: ["dev", "In development"], title: "Helpa", desc: "A WhatsApp-based emergency contact discovery tool. In an emergency, you send one message and Helpa replies with the nearest ambulance, police, fire service or hospital contact, ready to call.", list: ["One message, no app to install: it lives on WhatsApp", "Finds the closest relevant emergency contact by location", "Covers ambulance, police, fire and hospital contacts", "Launching first at FUTA and across Akure"], tags: ["Python", "WhatsApp API", "Geolocation", "Bots"] },
    tsas: { status: ["soon", "Deploying soon"], title: "Tech Skill Assessment System", desc: "A FastAPI platform that assesses a learner's tech skills and uses AI to recommend a personal learning path, so they know exactly what to study next.", list: ["Skill assessments across tech tracks", "AI-powered learning recommendations", "FastAPI backend with clean REST endpoints", "Deploying soon"], tags: ["FastAPI", "Python", "Machine Learning", "Recommenders"] },
    tutor: { status: ["live", "Ongoing"], title: "AI/ML Tutoring", desc: "Hands-on machine learning tutoring for students and beginners. We go from Python basics to cleaning data, training models and shipping them as small apps.", list: ["Project-first lessons with real datasets", "Statistics explained simply", "scikit-learn, pandas and FastAPI", "One-on-one or small groups"], tags: ["Teaching", "Python", "scikit-learn", "Statistics"], cta: ["Book a session on WhatsApp", "https://wa.me/2349064519858?text=Hi%20Joshua%2C%20I%27d%20like%20to%20book%20an%20ML%20tutoring%20session"] },
    next1: { status: ["ghost", "Coming soon"], title: "Next build", desc: "This is a placeholder card. Swap in your next AI or web project when it's ready to show.", list: ["Project name and one-line pitch", "What it does and who it's for", "Stack and a link to try it"], tags: ["Placeholder"] },
    next2: { status: ["ghost", "Coming soon"], title: "Coming soon", desc: "A placeholder for a future bot or automation project.", list: ["Problem it solves", "How it works", "Results or users so far"], tags: ["Placeholder"] }
  };
  const modal = $("#modal"); let lastFocus;
  const openModal = (key) => {
    const d = DATA[key]; if (!d) return; lastFocus = document.activeElement;
    const st = $("#mStatus"); st.className = "status " + d.status[0]; st.textContent = d.status[1];
    $("#mTitle").textContent = d.title; $("#mDesc").textContent = d.desc;
    $("#mList").innerHTML = ""; d.list.forEach(t => { const li = document.createElement("li"); li.textContent = t; $("#mList").appendChild(li); });
    $("#mTags").innerHTML = ""; d.tags.forEach(t => { const s = document.createElement("span"); s.textContent = t; $("#mTags").appendChild(s); });
    const cta = $("#mCta");
    if (d.cta) { cta.textContent = d.cta[0]; cta.href = d.cta[1]; cta.target = "_blank"; cta.rel = "noopener"; }
    else { cta.textContent = "Ask about this project"; cta.href = "#contact"; cta.removeAttribute("target"); }
    modal.hidden = false; document.body.classList.add("locked"); $(".modal-x").focus();
  };
  const closeModal = () => { modal.hidden = true; document.body.classList.remove("locked"); lastFocus && lastFocus.focus({ preventScroll: true }); };
  projects.forEach(p => {
    p.addEventListener("click", () => openModal(p.dataset.project));
    p.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(p.dataset.project); } });
  });
  $$("[data-close]", modal).forEach(b => b.addEventListener("click", closeModal));
  $("#mCta").addEventListener("click", () => closeModal());
  addEventListener("keydown", (e) => { if (e.key === "Escape") { if (!modal.hidden) closeModal(); if (!aiPanel.hidden) toggleAI(false); setMenu(false); } });

  /* carousel */
  const slides = $("#slides"), dotsWrap = $("#dots"), n = slides.children.length; let cur = 0, auto;
  for (let i = 0; i < n; i++) { const b = document.createElement("button"); b.type = "button"; b.setAttribute("aria-label", "Testimonial " + (i + 1)); b.addEventListener("click", () => go(i, true)); dotsWrap.appendChild(b); }
  const go = (i, user) => { cur = (i + n) % n; slides.style.transform = `translateX(-${cur * 100}%)`; $$("button", dotsWrap).forEach((d, k) => d.classList.toggle("on", k === cur)); if (user) restart(); };
  const restart = () => { clearInterval(auto); if (!reduce) auto = setInterval(() => go(cur + 1), 4200); };
  $("#prevSlide").addEventListener("click", () => go(cur - 1, true));
  $("#nextSlide").addEventListener("click", () => go(cur + 1, true));
  let sx = null; slides.addEventListener("touchstart", e => sx = e.touches[0].clientX, { passive: true });
  slides.addEventListener("touchend", e => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) go(cur + (dx < 0 ? 1 : -1), true); sx = null; });
  go(0); restart();

  /* placeholders */
  $$(".ph-link").forEach(a => a.addEventListener("click", (e) => { e.preventDefault(); toast(a.dataset.ph + " link coming soon"); }));

  /* contact form → mailto */
  $("#contactForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = e.target, name = $("#fName"), email = $("#fEmail"), msg = $("#fMsg");
    let ok = true;
    [name, email, msg].forEach(el => { const bad = !el.value.trim() || (el.type === "email" && !/^\S+@\S+\.\S+$/.test(el.value)); el.classList.toggle("invalid", bad); if (bad) ok = false; });
    if (!ok) { toast("Please fill in all three fields"); return; }
    const subject = encodeURIComponent("Portfolio enquiry from " + name.value.trim());
    const body = encodeURIComponent(msg.value.trim() + "\n\n— " + name.value.trim() + " (" + email.value.trim() + ")");
    toast("✓ Opening your email app…");
    f.reset();
    if (!document.documentElement.dataset.demo) setTimeout(() => { location.href = `mailto:mudanajoshua@gmail.com?subject=${subject}&body=${body}`; }, 700);
  });

  /* Ask my AI (scripted demo) */
  const aiPanel = $("#aiPanel"), aiLaunch = $("#aiLaunch"), aiLog = $("#aiLog"), aiForm = $("#aiForm"), aiText = $("#aiText");
  const KB = [
    [/helpa|emergenc|ambulance/i, "Helpa is my WhatsApp emergency tool 🚑 Send one message and it finds the nearest ambulance, police, fire service or hospital contact. It's launching at FUTA and Akure."],
    [/skill|stack|tech|know|python/i, "Python, machine learning (scikit-learn, pandas, NumPy), FastAPI, statistics and WhatsApp bots. Statistics was my first love, ML came next."],
    [/tutor|teach|class|learn|lesson/i, "Yes! I tutor AI/ML, from Python basics to training and shipping real models. Tap the WhatsApp button to book a session."],
    [/hire|work|job|intern|collab|contact|email|reach/i, "I'm open to internships, collaborations and tutoring. Email mudanajoshua@gmail.com or WhatsApp +234 906 451 9858."],
    [/assess|fastapi|recommend/i, "The Tech Skill Assessment System is built on FastAPI. It assesses your tech skills and uses AI to recommend what to learn next. Deploying soon."],
    [/experience|growth|excelerate|intern/i, "I'm an ML Intern at Growth Hub (since Oct 2025), and at Excelerate I helped manage 3,000+ interns. I also lead XXIV Tech Hub."],
    [/futa|school|study|student|university/i, "I study Computer Science at FUTA (B.Tech, class of 2028), after an ND in Statistics from the Federal College of Forestry, Jos."],
    [/who|about|yourself|name|excel/i, "I'm Joshua Mudana, people call me Excel. An AI/ML engineer and ML tutor from Jos, based in Akure. Most people use AI. I build it."],
    [/hi|hello|hey/i, "Hey 👋 I'm Excel's AI assistant. Ask me about his projects, skills or tutoring."]
  ];
  const answer = (q) => { for (const [re, a] of KB) if (re.test(q)) return a; return "Good question! I'm a demo assistant, so I know the basics. Try asking about Helpa, skills, tutoring or how to hire Joshua."; };
  const addMsg = (who, text) => { const m = document.createElement("div"); m.className = "msg " + who; m.textContent = text; aiLog.appendChild(m); aiLog.scrollTop = aiLog.scrollHeight; return m; };
  let greeted = false, busy = false;
  const toggleAI = (open) => {
    aiPanel.hidden = !open; aiLaunch.setAttribute("aria-expanded", open); aiLaunch.style.visibility = open ? "hidden" : "";
    if (open && !greeted) { greeted = true; addMsg("bot", "Hi! I'm Excel's AI 🤖 Ask me anything about Joshua's work."); }
    if (open && matchMedia("(hover: hover)").matches) aiText.focus();
  };
  aiLaunch.addEventListener("click", () => toggleAI(true));
  $("#aiClose").addEventListener("click", () => toggleAI(false));
  const ask = (q) => {
    q = q.trim(); if (!q || busy) return; busy = true;
    addMsg("user", q); aiText.value = "";
    const t = document.createElement("div"); t.className = "msg bot typing"; t.innerHTML = "<i></i><i></i><i></i>"; aiLog.appendChild(t); aiLog.scrollTop = aiLog.scrollHeight;
    setTimeout(() => {
      t.remove(); const m = addMsg("bot", ""); const full = answer(q); let i = 0;
      const tick = () => { m.textContent = full.slice(0, i += 2); aiLog.scrollTop = aiLog.scrollHeight; if (i < full.length) setTimeout(tick, 14); else busy = false; };
      tick();
    }, 900);
  };
  aiForm.addEventListener("submit", (e) => { e.preventDefault(); ask(aiText.value); });
  $$("#aiChips button").forEach(b => b.addEventListener("click", () => ask(b.textContent)));

  /* expose for demo */
  window.__portfolio = { openModal, closeModal, toggleAI, ask, toast };
})();
