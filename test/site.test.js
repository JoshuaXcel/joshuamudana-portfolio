const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const site = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(site, "index.html"), "utf8");
const js = fs.readFileSync(path.join(site, "script.js"), "utf8");
const css = fs.readFileSync(path.join(site, "styles.css"), "utf8");

test("title, viewport and core identity", () => {
  assert.match(html, /<title>[^<]*Joshua Mudana[^<]*<\/title>/);
  assert.match(html, /<meta name="viewport" content="width=device-width, initial-scale=1/);
  assert.ok(html.includes("Building Smart Systems"));
  assert.ok(html.includes("AI <i>|</i> Machine Learning <i>|</i> Smart Systems"));
  assert.ok(html.includes("Most people use AI."));
  assert.ok(!/joshua mudana/.test(html), "name must be capitalised");
});
test("all sections and features exist", () => {
  for (const id of ["top", "about", "services", "skills", "projects", "experience", "teaching", "contact"])
    assert.ok(html.includes(`id="${id}"`), id);
  for (const id of ["loader", "themeToggle", "contactForm", "aiPanel", "aiLaunch", "toTop", "modal", "neural", "cvBtn"])
    assert.ok(html.includes(`id="${id}"`), id);
  for (const f of ["all", "ai", "web", "bots"]) assert.ok(html.includes(`data-filter="${f}"`));
  assert.ok(html.includes("Helpa") && html.includes("Tech Skill Assessment System"));
  assert.ok(html.includes("Excelerate") && !/tech hub/i.test(html));
  assert.ok(html.includes("mudanajoshua@gmail.com") && html.includes("wa.me/2349064519858"));
});
test("local assets exist and no inline scripts or remote assets", () => {
  const refs = [...html.matchAll(/(?:src|href)="([^"#:]+)"/g)].map(m => m[1]);
  for (const r of refs) assert.ok(fs.existsSync(path.join(site, r)), "missing " + r);
  assert.ok(!/<script>(?!<\/script>)/.test(html), "no inline script");
  assert.ok(!/(src|href)="https?:\/\/(?!wa\.me|github\.com\/JoshuaXcel|joshuaxcel\.github\.io\/(dresscode-app|joshuamudana-portfolio))/.test(html), "no remote assets");
  assert.ok(!/TODO|lorem ipsum|\{\{|undefined/i.test(html.replace(/<!--[\s\S]*?-->/g, "")), "no visible TODOs");
});
test("script wires the features", () => {
  for (const k of ["IntersectionObserver", "openModal", "toggleAI", "mailto:mudanajoshua@gmail.com", "localStorage"]) assert.ok(js.includes(k), k);
});
test("role, stack, services and no demo content", () => {
  assert.ok(html.includes("AI &amp; Machine Learning Engineer"));
  // the only internship mention is his Growth Hub start (one removable sub-line)
  assert.equal((html.match(/\bintern\b|internship/gi) || []).length, 1, "single intern mention");
  assert.ok(html.includes('<p class="t-sub">Joined Feb 2026 as ML intern</p>'));
  for (const k of ["TensorFlow", "PyTorch", "MySQL", "PostgreSQL"]) assert.ok(html.includes(k), k);
  const svc = html.slice(html.indexOf('id="services"'), html.indexOf('id="skills"'));
  const order = ["AI &amp; Machine Learning", "Data Science", "Web Development", "Tutoring"].map(s => svc.indexOf(s));
  assert.ok(order.every(i => i > 0) && order.every((v, k) => !k || v > order[k - 1]), "four services, AI/ML first");
  assert.ok(!/demo|placeholder quote|\(add link\)/i.test(html + js), "no demo wording");
});
test("typing tagline runs at half speed", () => {
  assert.ok(js.includes("setTimeout(step, 2600)") && js.includes("110 + Math.random() * 80") && js.includes("setTimeout(step, 56)"));
});
test("paid courses open an enrol prompt to WhatsApp", () => {
  assert.ok(html.includes('data-course="course_ml"') && html.includes('data-course="course_ds"'));
  assert.ok(js.includes("This is a paid course. Chat with Excel on WhatsApp to enrol and make payment."));
  assert.ok(js.includes("wa.me/2349064519858?text=Hi%20Excel"));
});
test("about text, teaching count and projects", () => {
  for (const k of ["My journey started with <strong>Statistics</strong>", "AI and Machine Learning Engineer", "security for AI", "automated scoring, performance analytics, personalized learning pathways", "verified emergency service contacts"])
    assert.ok(html.includes(k), k);
  assert.ok(html.includes('data-to="12"') && html.includes("learners taught, Growth Hub"), "hero teaching stat is 12");
  assert.ok(html.includes("<strong>12 learners</strong> taught at Growth Hub"));
  assert.ok(js.includes("12 learners taught at Growth Hub"));
  const cv = fs.readFileSync(path.join(site, "cv.html"), "utf8");
  assert.ok(cv.includes("12 learners taught"));
  for (const t of [html, js, cv]) {
    assert.ok(!/xxiv/i.test(t), "no XXIV");
    assert.ok(!/(\d[\d,]*\+?)\s+(students|learners)\s+taught/i.test(t.replace(/12 learners taught/g, "")), "only teaching count is 12");
  }
  assert.ok(html.includes('data-to="3000"') && html.includes("interns managed"), "3,000+ interns managed stays");
  assert.ok(js.includes("/secur/") && js.includes("cyber") && js.includes("Streamlit"));
  assert.ok(html.includes("<h3>People &amp; Management</h3>") && !html.includes("<h3>People</h3>"), "People & Management card");
  const pm = html.slice(html.indexOf("<h3>People &amp; Management</h3>"), html.indexOf("</article>", html.indexOf("<h3>People &amp; Management</h3>")));
  assert.ok(pm.includes("Team leadership") && pm.includes("3,000+ interns managed"));
  assert.ok(cv.includes("People &amp; Management:") && js.includes("People & Management"));
});
test("Ask-my-AI covers the topics and the portfolio card exists", () => {
  for (const k of ["Streamlit", "12 learners taught at Growth Hub", "3,000+ interns", "security for AI", "system architecture", "FUTA", "mudanajoshua@gmail.com", "Try asking:"]) assert.ok(js.includes(k), k);
  assert.ok(html.includes('data-project="portfolio"') && html.includes("<h3>Personal Portfolio</h3>"));
  assert.ok(html.includes('href="https://github.com/JoshuaXcel/joshuamudana-portfolio"') && html.includes("assets/projects/portfolio.webp"));
});

test("real photos exist, are small WebP with srcset and have alt text", () => {
  const photos = {
    "excel-contact": "Joshua Mudana (Excel) at his laptop",
  };
  for (const [name, alt] of Object.entries(photos)) {
    const tag = [...html.matchAll(/<img\b[^>]*>/g)].map(m => m[0]).find(t => t.includes(`assets/photos/${name}-`) && /alt="[^"]+"/.test(t));
    assert.ok(tag, name + " img with alt");
    assert.ok(tag.includes(`alt="${alt}`), name + " alt text");
    assert.ok(/srcset="[^"]+ 480w/.test(tag), name + " srcset");
    for (const [, file] of tag.matchAll(/(assets\/photos\/[\w-]+\.webp)/g)) {
      const p = path.join(site, file);
      assert.ok(fs.existsSync(p), "missing " + file);
      assert.ok(fs.statSync(p).size < 92 * 1024, file + " under ~90 KB");
    }
  }
  // Teaching photo is a faint decorative background behind the intro text, with no credit line
  const bg = html.match(/<div class="teach-bg" aria-hidden="true"><img\b[^>]*>/);
  assert.ok(bg && bg[0].includes('alt=""') && bg[0].includes("excel-teaching-960.webp") && /srcset="[^"]+ 480w/.test(bg[0]), "teaching background");
  assert.ok(!html.includes("Background photo") && !html.includes("teach-credit"), "no credit line");
  assert.ok(!html.includes('class="teach-photo'), "old wide teaching photo removed");
  assert.match(css, /\.teach-bg img\{[^}]*opacity:\.[1-4]/);
  assert.match(css, /mask-image:linear-gradient[^;]+;mask-composite:intersect/);
});

test("About: original logo orb restored, photos as a faint slow background behind the text", () => {
  const about = html.slice(html.indexOf('id="about"'), html.indexOf("</section>", html.indexOf('id="about"')));
  // orb exactly as in d22e1d8
  const { execSync } = require("node:child_process");
  let orig = null; try { orig = execSync("git show d22e1d8:index.html", { cwd: site, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }); } catch {}
  const orbOf = s => s.slice(s.indexOf('<div class="avatar reveal" aria-hidden="true">'), s.indexOf('<svg class="avatar-logo"')) + s.match(/<svg class="avatar-logo"[\s\S]*?<\/svg>/)[0];
  assert.ok(about.includes('<div class="avatar reveal" aria-hidden="true">'), "orb markup");
  if (orig) assert.strictEqual(orbOf(about), orbOf(orig), "orb identical to d22e1d8");
  assert.ok(!about.includes("data-slideshow") && !about.includes("about-frame") && !about.includes("slide-orb"), "in-frame slideshow removed");
  assert.ok(!css.includes(".about-frame") && !css.includes(".about-photo"), "frame CSS removed");
  // background slides behind the About text, decorative, same treatment as Teaching
  const m = about.match(/<div class="about-copy" data-about-bg>\s*<div class="teach-bg about-bg" aria-hidden="true"><div class="bg-stage">([\s\S]*?)<\/div><\/div>/);
  assert.ok(m, "about background inside the text block");
  const imgs = [...m[1].matchAll(/<img\b[^>]*>/g)].map(x => x[0]);
  assert.ok(imgs.length >= 6 && imgs.length <= 8, "6-8 photos");
  ["peace", "typing", "grow", "chin"].forEach((n, i) => assert.ok(imgs[i].includes(`excel-bg-${n}-720.webp`), "order " + n));
  const files = imgs.map(tag => tag.match(/assets\/photos\/[\w-]+\.webp/)[0]);
  assert.strictEqual(new Set(files).size, files.length, "no duplicates");
  for (const f of files) assert.ok(fs.statSync(path.join(site, f)).size < 40 * 1024, f + " small");
  assert.ok(imgs[0].includes('class="bg-slide lead on"') && /\ssrc="/.test(imgs[0]));
  for (const tag of imgs) assert.ok(tag.includes('alt=""'), "decorative");
  for (const tag of imgs.slice(1)) {
    const f = tag.match(/data-src="(assets\/photos\/[\w-]+\.webp)"/);
    assert.ok(f && !/\ssrc="/.test(tag), "slides 2+ lazy via JS");
    assert.ok(fs.statSync(path.join(site, f[1])).size < 48 * 1024);
  }
  assert.match(css, /\.about-bg \.bg-imgs\{[^}]*opacity:\.4;filter:saturate\(\.6\) blur\(1px\)/, "same treatment as Teaching");
  assert.match(css, /#about \.about-bg \.bg-slide\{[^}]*transition:opacity (2\.[5-9]|3)s/);
  assert.match(css, /#about \.about-bg \.bg-slide:not\(\.lead\)\{display:none\}/, "reduced motion: first photo only");
  assert.match(js, /HOLD = 7[0-9]{3}, FADE = (2[5-9]|30)00/);
  assert.ok(js.includes("data-about-bg") && js.includes("prefers-reduced-motion: reduce") && js.includes("visibilitychange") && js.includes("IntersectionObserver"));
  assert.ok((about.match(/class="seq"/g) || []).length >= 8, "text staggered");
});

test("About background: original colour photos (no B&W) and the strong first-photo intro", () => {
  const about = html.slice(html.indexOf('id="about"'));
  // no black-and-white anywhere in the About background
  assert.ok(!/grayscale|saturate\(0\)/.test(css), "no grayscale filter in CSS");
  assert.ok(!/excel-bg-[\w-]*(bw|mono|gray)/i.test(html), "no B&W file names");
  const { spawnSync } = require("node:child_process");
  const py = `import sys
from PIL import Image, ImageStat
for f in sys.argv[1:]:
    s = ImageStat.Stat(Image.open(f).convert("HSV")).mean[1]
    print(f, round(s, 1))
    assert s > 25, f + " looks black-and-white"`;
  const files = ["grow", "grow2"].map(n => path.join(site, `assets/photos/excel-bg-${n}-720.webp`));
  const r = spawnSync("python3", ["-c", py, ...files], { encoding: "utf8" });
  if (r.error || /No module named/.test(r.stderr || "")) console.log("skip colour check: python3/PIL unavailable");
  else assert.strictEqual(r.status, 0, r.stderr);
  // intro: strong, clear first photo that fades down once, on first appearance only
  assert.match(css, /#about \.about-bg\.intro \.bg-imgs\{opacity:\.(8[5-9]|9);filter:none\}/, "intro starts at ~0.85-0.9, no blur/desaturation");
  assert.match(css, /#about \.about-bg\.intro \.bg-stage::after\{opacity:\.[0-2]\d?\}/, "overlay mostly off during intro");
  assert.match(css, /\.about-bg \.bg-imgs,\.about-bg \.bg-stage::after\{transition:opacity 3\.[0-9]s/, "slow 3-4 s fade down");
  assert.match(js, /INTRO_FADE = 3[0-9]{3}/);
  assert.ok(js.includes('bg.classList.add("intro")') && js.includes('bg.classList.remove("intro")'), "intro added once, removed once");
  assert.strictEqual((js.match(/classList\.add\("intro"\)/g) || []).length, 1, "only the first appearance");
  // the intro class is added after the reduced-motion early return, so reduced motion only ever sees the faint state
  const block = js.slice(js.indexOf("data-about-bg"));
  assert.ok(block.indexOf("if (reduce ||") < block.indexOf('bg.classList.add("intro")'), "reduced motion: faint state only");
  assert.ok(!about.includes('about-bg intro'), "no intro class in HTML (no-JS stays faint)");
});
