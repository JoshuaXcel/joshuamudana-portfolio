const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");
const site = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(site, "index.html"), "utf8");
const js = fs.readFileSync(path.join(site, "script.js"), "utf8");

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
  assert.ok(!/(src|href)="https?:\/\/(?!wa\.me|github\.com\/JoshuaXcel|joshuaxcel\.github\.io\/dresscode-app)/.test(html), "no remote assets");
  assert.ok(!/TODO|lorem ipsum|\{\{|undefined/i.test(html.replace(/<!--[\s\S]*?-->/g, "")), "no visible TODOs");
});
test("script wires the features", () => {
  for (const k of ["IntersectionObserver", "openModal", "toggleAI", "mailto:mudanajoshua@gmail.com", "localStorage"]) assert.ok(js.includes(k), k);
});
test("role, stack, services and no demo content", () => {
  assert.ok(html.includes("AI &amp; Machine Learning Engineer"));
  assert.ok(!/intern\b|internship|ML Intern/i.test(html), "no internship");
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
