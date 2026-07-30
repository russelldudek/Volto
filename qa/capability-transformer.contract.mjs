import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const index = read('index.html');
const resume = read('resume.html');
const cover = read('cover-letter.html');
const brief = read('interview-brief.html');
const app = ['app-data.js','funnel-core.js','funnel-geometry.js','funnel-runtime.js','app.js'].map(read).join('\n');
const css = ['experience-core.css','experience-responsive.css'].map(read).join('\n');
const manifest = JSON.parse(read('manifest.json'));
const candidateFacing = [index,resume,cover,brief].join('\n');

for (const token of ['capability-hero','hero-copy','input-stack','center-stage','capabilityField','semantic-funnel','authority-orb','output-stack','summary-bar']) {
  assert.match(index, new RegExp(token));
}
assert.match(index, /<div class="center-stage"[\s\S]*?<canvas id="capabilityField"/);
assert.match(index, /Russell brings the combination this role needs/);
assert.match(index, /Role operating brief/);
assert.doesNotMatch(index, /transformer-svg|class="coil"|class="pulse"/);
assert.doesNotMatch(candidateFacing, /Replay transformation|Reset baseline|simulation-actions|id="replay"|id="resetScenario"/);
assert.doesNotMatch(candidateFacing, /Bounded working-session offer|THE REASONABLE QUESTION|Will a director and founder|without overstating|compensation range|strongest plausible objection|hardest hiring objection/i);
assert.doesNotMatch(candidateFacing, /412[.]287[.]8640|4122878640|tel:[+]14122878640/);

assert.match(app, /getContext\('webgl2'/);
assert.match(app, /class FunnelScene/);
assert.match(app, /float funnelRadius\(float t\)/);
assert.match(app, /float funnelSlope\(float t\)/);
assert.match(app, /vec3 funnelPoint\(float theta, float t\)/);
assert.match(app, /r \* cos\(theta\), y, r \* sin\(theta\)/);
assert.doesNotMatch(app, /[.]58\s*\*\s*r\s*\*\s*sin/);
assert.match(app, /addSurface\(0\);[\s\S]*addSurface\(1\);[\s\S]*addSurface\(2\);[\s\S]*addSurface\(3\);/);
assert.match(app, /mix\(-1[.]25, -1[.]78, t\)/);
assert.match(app, /mix\(2[.]12, 2[.]30, t\)/);
assert.match(app, /mix\(0[.]64, 1[.]52, t\)/);
assert.match(app, /gl[.]cullFace\(gl[.]FRONT\)/);
assert.match(app, /gl[.]cullFace\(gl[.]BACK\)/);
assert.match(app, /float r = funnelRadius\(q\) \* 0[.]63/);
assert.match(app, /if \(this[.]visible\) this[.]raf = requestAnimationFrame\(tick\)/);
assert.match(app, /document[.]addEventListener\('visibilitychange'/);
assert.match(app, /reduced[.]matches/);
assert.match(app, /function applyScenario\(key/);
assert.match(app, /setAttribute\('aria-pressed'/);
assert.doesNotMatch(app, /getElementById\('replay'\)|getElementById\('resetScenario'\)|Replaying .* transformation/);

const radius = (t) => 0.42 + 1.83 * Math.pow(Math.max(0, 1 - t), 1.35);
assert.equal(radius(0), 2.25);
assert.equal(radius(1), 0.42);
for (let step = 1; step <= 100; step += 1) assert.ok(radius(step/100) <= radius((step-1)/100), 'funnel radius must taper monotonically');

assert.match(css, /[.]center-stage\s*\{[\s\S]*left:\s*35%[\s\S]*right:\s*24[.]5%/);
assert.match(css, /#capabilityField\s*\{[\s\S]*inset:\s*0/);
assert.match(css, /[.]semantic-funnel\s*\{\s*display:\s*none/);
assert.doesNotMatch(css, /[.]center-stage::?(before|after)/);
assert.match(css, /@media \(max-width: 1320px\)/);
assert.match(css, /@media \(max-width: 980px\)/);
assert.match(css, /@media \(max-width: 680px\)/);
assert.match(css, /@media \(max-width: 360px\)/);
assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(css, /[.]experience-home #plan\s*\{[\s\S]*background:\s*#fff/);
assert.doesNotMatch(css, /simulation-actions|#replay|#resetScenario/);

for (const path of ['index.html','resume.html','cover-letter.html','interview-brief.html','experience-core.css','experience-responsive.css','app-data.js','funnel-core.js','funnel-geometry.js','funnel-runtime.js','app.js','qa/capability-transformer.contract.mjs','qa/campaign-audit.md']) {
  assert.ok(manifest.files.includes(path), `manifest missing ${path}`);
}
assert.doesNotMatch([index,app,css,resume,cover,brief].join('\n'), /role[\s_-]*forge/i);
console.log('Capability Transformer geometry and positive-positioning contract passed.');
