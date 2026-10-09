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
  const phrases = ["Building Smart Systems", "Training ML Models", "Deep Learning with PyTorch", "Building Smart Systems"];
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
          del = true; return setTimeout(step, 2600);
        }
        return setTimeout(step, 110 + Math.random() * 80);
      }
      typed.textContent = word.slice(0, --i);
      if (i === 0) { del = false; p++; return setTimeout(step, 500); }
      setTimeout(step, 56);
    };
    setTimeout(step, 900);
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
    const to = +el.dataset.to, pad = +(el.dataset.pad || 0), dur = 3600, t0 = performance.now();
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
    dresscode: { status: ["live", "Live"], title: "FUTASU Judicial Council Dress Code", desc: "A responsive web guide to the approved dress code for the FUTA Students' Union Judicial Council swearing-in ceremony, 2026/27 Parliamentary Session. Built for elected officials to check what to wear from their phones.", list: ["Men's and women's tabs: English dress, native dress and footwear", "Photo examples for every accepted style", "A clear not-permitted list", "FAQ accordion and a WhatsApp contact"], tags: ["HTML", "CSS", "JavaScript", "GitHub Pages"], cta: ["View it live", "https://joshuaxcel.github.io/dresscode-app/"] },
    portfolio: { status: ["live", "Live"], title: "Personal Portfolio", desc: "This site: a responsive single-page portfolio with the typing hero, the Excel's AI chat assistant and locked paid courses wired to WhatsApp, deployed on GitHub Pages.", list: ["Responsive single page, light and dark themes", "Typing hero and scroll animations", "Excel's AI: an on-page assistant that answers questions about Joshua", "Locked paid courses that open WhatsApp to enrol"], tags: ["HTML", "CSS", "JavaScript", "GitHub Pages"], cta: ["View it live", "https://joshuaxcel.github.io/joshuamudana-portfolio/"] },
    course_ml: { status: ["paid", "🔒 Paid course"], title: "AI & Machine Learning Course", desc: "🔒 This is a paid course. Chat with Excel on WhatsApp to enrol and make payment.", list: ["Python and NumPy for machine learning", "Supervised learning with scikit-learn", "Neural networks with PyTorch and TensorFlow", "Deploy your model as a FastAPI app"], tags: ["AI", "Machine Learning", "PyTorch", "TensorFlow"], cta: ["Chat on WhatsApp to enrol", "https://wa.me/2349064519858?text=Hi%20Excel%2C%20I%27m%20interested%20in%20your%20AI%20%26%20Machine%20Learning%20course.%20How%20do%20I%20enrol%20and%20pay%3F"] },
    course_ds: { status: ["paid", "🔒 Paid course"], title: "Data Science Course", desc: "🔒 This is a paid course. Chat with Excel on WhatsApp to enrol and make payment.", list: ["Python, pandas and data cleaning", "Statistics for data science", "Visualisation and telling stories with data", "SQL with MySQL and PostgreSQL, plus a final project"], tags: ["Data Science", "pandas", "Statistics", "SQL"], cta: ["Chat on WhatsApp to enrol", "https://wa.me/2349064519858?text=Hi%20Excel%2C%20I%27m%20interested%20in%20your%20Data%20Science%20course.%20How%20do%20I%20enrol%20and%20pay%3F"] },
    helpa: { status: ["dev", "In development"], title: "Helpa", desc: "A WhatsApp-based emergency contact discovery system designed to help people find verified emergency service contacts using their location. You send a message and Helpa replies with the nearest verified ambulance, police, fire service or hospital contact, ready to call.", list: ["One message, no app to install: it lives on WhatsApp", "Finds verified emergency contacts by location", "Covers ambulance, police, fire and hospital contacts", "Designed first for FUTA and Akure"], tags: ["Python", "WhatsApp API", "Geolocation", "Bots"] },
    // TODO: Render URL. When TSAS is live, add to this entry: cta: ["Open the live app", "https://YOUR-APP.onrender.com"]
    tsas: { status: ["soon", "Deploying"], title: "Tech Skill Assessment System", desc: "A skill assessment platform that combines automated scoring, performance analytics, personalized learning pathways, progress tracking and AI-powered recommendations. Built on FastAPI.", list: ["Automated scoring", "Performance analytics and progress tracking", "Personalized learning pathways", "AI-powered recommendations", "FastAPI backend with REST endpoints, deploying now"], tags: ["FastAPI", "Python", "Machine Learning", "Recommenders"] },
    tutor: { status: ["live", "Ongoing"], title: "AI/ML Tutoring", desc: "Hands-on machine learning tutoring for learners and beginners. We go from Python basics to cleaning data, training models and shipping them as small apps. 12 learners taught at Growth Hub so far (past & current).", list: ["12 learners taught at Growth Hub (past & current)", "Project-first lessons with real datasets", "Statistics explained simply", "scikit-learn, pandas and FastAPI", "One-on-one or small groups"], tags: ["Teaching", "Python", "scikit-learn", "Statistics"], cta: ["Book a session on WhatsApp", "https://wa.me/2349064519858?text=Hi%20Joshua%2C%20I%27d%20like%20to%20book%20an%20ML%20tutoring%20session"] }
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
    p.addEventListener("click", (e) => { if (e.target.closest("a")) return; openModal(p.dataset.project); });
    p.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openModal(p.dataset.project); } });
  });
  $$(".course").forEach(c => {
    c.addEventListener("click", () => openModal(c.dataset.course));
    c.addEventListener("keydown", (e) => { if (e.target === c && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openModal(c.dataset.course); } });
  });
  $$("[data-close]", modal).forEach(b => b.addEventListener("click", closeModal));
  $("#mCta").addEventListener("click", () => closeModal());
  addEventListener("keydown", (e) => { if (e.key === "Escape") { if (!modal.hidden) closeModal(); if (!aiPanel.hidden) toggleAI(false); setMenu(false); } });

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
    setTimeout(() => { location.href = `mailto:mudanajoshua@gmail.com?subject=${subject}&body=${body}`; }, 700);
  });

  /* Ask my AI: quick answers about Joshua */
  const aiPanel = $("#aiPanel"), aiLaunch = $("#aiLaunch"), aiLog = $("#aiLog"), aiForm = $("#aiForm"), aiText = $("#aiText");
  // Each topic: [patterns, answer]. The topic whose patterns match most often wins; ties go to the earlier topic.
  const KB = [
    [[/helpa/, /emergenc/, /ambulance|police|fire service|hospital/, /whatsapp[- ](based|bot|assistant)|contact (finder|discovery)/], "Helpa is Joshua's WhatsApp-based emergency contact discovery system, in development and not live yet. It's designed to help people find verified emergency service contacts (ambulance, police, fire service, hospital) using their location, with no app to install."],
    [[/assess|tsas/, /scoring|analytics|learning path|pathway|progress track|recommend/, /render|deploy/], "The Tech Skill Assessment System is a skill assessment platform with automated scoring, performance analytics, personalized learning pathways, progress tracking and AI-powered recommendations. It's built on FastAPI and Joshua is deploying it now."],
    [[/this (site|portfolio|website|page)|personal portfolio|your portfolio|his portfolio/, /how (was|is) (this|it) (made|built)|who (made|built) this/], "This site is Joshua's Personal Portfolio, a live web project: a responsive single-page site with the typing hero, this Excel's AI chat assistant and locked paid courses wired to WhatsApp, built with HTML, CSS and JavaScript and deployed on GitHub Pages. Code: github.com/JoshuaXcel/joshuamudana-portfolio."],
    [[/dress/, /judicial|futasu|swearing/, /website|web (app|project|site)|live (site|project|link)/, /\bweb\b.*\bproject|project.*\bweb\b/], "A live web project: the FUTASU Judicial Council swearing-in dress-code guide (2026/27 session), with men's and women's tabs, photo examples, a not-permitted list and FAQs. See it at joshuaxcel.github.io/dresscode-app."],
    [[/secur/, /cyber|threat|attack|adversarial|protect|hack/], "Joshua is particularly interested in AI for security and security for AI: using AI to tackle security challenges, and understanding how intelligent systems can be protected against emerging threats."],
    [[/course|enrol|enroll/, /fee|paid|pay|price|cost|how much/, /class/], "Joshua runs two paid courses: an AI & Machine Learning Course (Python, scikit-learn, PyTorch and TensorFlow, deploying with FastAPI) and a Data Science Course (pandas, statistics, visualisation, SQL). To enrol and pay, chat with Excel on WhatsApp at +234 906 451 9858."],
    [[/teach|taught|tutor|mentor/, /learners?\b|students?|pupils?/, /growth hub/, /how many/], "Joshua teaches and mentors learners in AI and Machine Learning: 12 learners taught at Growth Hub so far (past & current). He tutors one-on-one or in small groups, from Python basics to training and shipping real models. Tap the WhatsApp button to book a session."],
    [[/lead|manag/, /team|people/, /intern|excelerate/, /experience|career|work history|job|judicial|council/], "People & Management: at Excelerate (2024 – 2026, remote) Joshua helped manage 3,000+ interns across global programmes, supporting their onboarding, engagement and progress. He also serves on the FUTA Students' Union Judicial Council (resource and publicity teams)."],
    [[/learning (now|next)|currently learning|is he learning|he('s| is) (learning|studying now)|improv|strengthen|working on (himself|his skills)/, /architecture|system design/, /version control|\bgit(hub)?\b|backend engineering/], "Joshua is strengthening his backend engineering, system architecture and version control (Git), so the AI systems he builds are reliable, maintainable and effective."],
    [[/database|\bdb\b/, /\bsql\b|postgres|mysql/], "Joshua works primarily with Python and SQL. For databases he uses PostgreSQL and MySQL, connected to his FastAPI backends."],
    [[/stack|skills?\b|tools?\b|tech\b|technolog|languages?|frameworks?|librar/, /python|numpy|pandas|scikit|sklearn|pytorch|torch|tensorflow|streamlit|fastapi/, /what does he use|know/], "Joshua's stack: Python and SQL, with NumPy, Pandas, Scikit-learn, PyTorch, TensorFlow and Streamlit for data and ML. FastAPI for backend services and REST APIs, PostgreSQL and MySQL for databases, plus WhatsApp bots. People & Management: team leadership (3,000+ interns managed at Excelerate), teaching and mentoring."],
    [[/journey|story|start(ed)?\b|began|begin|(got|get|getting) into|path into|how did he become/, /statistic/, /background/], "Joshua's journey started with Statistics (ND Statistics, Federal College of Forestry, Jos, 2021), which shaped how he thinks about data, patterns and problem-solving. That led him to AI and Machine Learning, where he now builds practical AI-powered systems."],
    [[/service|offer|provide/, /what can (he|you) do|help (me|us) with|freelance|rates?\b|web dev|development/], "Joshua offers four services: 1) AI & Machine Learning, his main focus (models with PyTorch, TensorFlow and scikit-learn, served through FastAPI), 2) Data Science, 3) Web Development (FastAPI with MySQL or PostgreSQL), and 4) AI/ML tutoring and paid courses."],
    [[/projects?|portfolio|products?/, /build|built|making|working on|create|made/], "Joshua builds practical AI-powered systems. Current projects: the Tech Skill Assessment System (automated scoring, analytics, personalized learning pathways, AI recommendations; deploying now), a WhatsApp-based emergency contact discovery system called Helpa (in development), and two live web projects: the FUTASU Judicial Council dress-code site and this personal portfolio."],
    [[/\bai\b|artificial intelligence|machine learning|\bml\b|deep learning|neural|models?\b/, /data science|data analy|visuali/], "AI and Machine Learning are Joshua's main focus: he processes data, develops models with Scikit-learn, PyTorch and TensorFlow, and connects them to real systems through FastAPI. Data science (cleaning, analysis and clear visuals) sits right beside it."],
    [[/hire|contact|reach|e-?mail|phone|number|call him|book|collab|work with|available|availability/, /cv\b|resume|résumé/], "Joshua is open to AI/ML projects, data science and web work, collaborations and tutoring. Email mudanajoshua@gmail.com or WhatsApp +234 906 451 9858. His CV is under \"Download CV\" at the top of the page."],
    [[/where|location|based|from\b|live[sd]?\b|nigeria|akure|jos\b|plateau|time ?zone|remote/, /futa|universit|school|stud(y|ies|ying)|degree|education|graduat|class of|b\.?tech/], "Joshua is from Jos, Plateau State, and based in Akure, Nigeria (WAT, UTC+1), where he studies Computer Science at the Federal University of Technology, Akure (FUTA), B.Tech class of 2028. He works with clients remotely."],
    [[/\bwho\b|about (him|joshua|excel|you)|introduce|yourself|\bname\b|nickname|called excel|why excel|\bexcel\b/], "Joshua Mudana, known as Excel: an AI and Machine Learning Engineer and ML tutor from Jos, studying Computer Science at FUTA in Akure. He started with Statistics, now builds practical AI-powered systems with Python, SQL, PyTorch, TensorFlow and FastAPI, teaches ML, and is especially interested in AI for security and security for AI."],
    [[/^\s*(hi|hello|hey|yo|good (morning|afternoon|evening))\b/], "Hey 👋 I'm Excel's AI assistant. Ask me about Joshua's projects, stack, teaching, courses or how to hire him."],
    [[/thank|thanks|cool|nice|great|awesome/], "Anytime! If you'd like to work with Joshua, WhatsApp +234 906 451 9858 or email mudanajoshua@gmail.com."]
  ];
  const FALLBACK = "I'm not sure about that one. Try asking: “What does Joshua build?”, “What's his tech stack?”, “How many learners has he taught?” or “How do I hire him?”";
  const answer = (q) => {
    const s = q.toLowerCase(); let best = null, top = 0;
    for (const [pats, a] of KB) { const n = pats.reduce((c, re) => c + (re.test(s) ? 1 : 0), 0); if (n > top) { top = n; best = a; } }
    return best || FALLBACK;
  };
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

  /* expose for testing */
  window.__portfolio = { openModal, closeModal, toggleAI, ask, toast };
})();
