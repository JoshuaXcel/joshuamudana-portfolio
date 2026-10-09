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
  for (const id of ["top", "about", "skills", "projects", "experience", "teaching", "testimonials", "insights", "contact"])
    assert.ok(html.includes(`id="${id}"`), id);
  for (const id of ["loader", "themeToggle", "contactForm", "aiPanel", "aiLaunch", "toTop", "modal", "carousel", "neural", "cvBtn"])
    assert.ok(html.includes(`id="${id}"`), id);
  for (const f of ["all", "ai", "web", "bots"]) assert.ok(html.includes(`data-filter="${f}"`));
  assert.ok(html.includes("Helpa") && html.includes("Tech Skill Assessment System") && html.includes("Coming soon"));
  assert.ok(html.includes("Growth Hub") && html.includes("Excelerate") && html.includes("XXIV Tech Hub"));
  assert.ok(html.includes("mudanajoshua@gmail.com") && html.includes("wa.me/2349064519858"));
});
test("local assets exist and no inline scripts or remote assets", () => {
  const refs = [...html.matchAll(/(?:src|href)="([^"#:]+)"/g)].map(m => m[1]);
  for (const r of refs) assert.ok(fs.existsSync(path.join(site, r)), "missing " + r);
  assert.ok(!/<script>(?!<\/script>)/.test(html), "no inline script");
  assert.ok(!/(src|href)="https?:\/\/(?!wa\.me)/.test(html), "no remote assets");
  assert.ok(!/TODO|lorem ipsum|\{\{|undefined/i.test(html));
});
test("script wires the features", () => {
  for (const k of ["IntersectionObserver", "openModal", "toggleAI", "mailto:mudanajoshua@gmail.com", "localStorage"]) assert.ok(js.includes(k), k);
});
