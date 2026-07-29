import fs from 'node:fs';
import assert from 'node:assert/strict';

const index = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../experience.css', import.meta.url), 'utf8');
const manifest = JSON.parse(fs.readFileSync(new URL('../manifest.json', import.meta.url), 'utf8'));

assert.match(index, /class="capability-hero"/);
assert.match(index, /class="hero-copy"/);
assert.match(index, /class="input-stack/);
assert.match(index, /class="output-stack/);
assert.match(index, /class="funnel-rim"/);
assert.match(index, /class="authority-orb"/);
assert.match(index, /class="platform"/);
assert.match(index, /class="summary-bar"/);
assert.match(index, /<canvas id="capabilityField"/);
assert.doesNotMatch(index, /transformer-svg|class="coil"|class="pulse"/);

assert.match(app, /getContext\('webgl2'/);
assert.match(app, /class FunnelScene/);
assert.match(app, /this\.surface=program/);
assert.match(app, /this\.mesh=program/);
assert.match(app, /this\.worldLines=program/);
assert.match(app, /this\.particles=program/);
assert.match(app, /this\.duration=4200/);
assert.match(app, /if\(t<1\)this\.raf=requestAnimationFrame/);
assert.match(app, /function applyScenario\(key/);
assert.match(app, /setAttribute\('aria-pressed'/);
assert.match(app, /resetScenario/);
assert.match(app, /prefers-reduced-motion/);
assert.match(app, /max-width: 980px/);
assert.doesNotMatch(app, /fetch\(['"]app-/);

assert.match(css, /conic-gradient/);
assert.match(css, /backdrop-filter/);
assert.match(css, /\.funnel-rim/);
assert.match(css, /\.platform-ring/);
assert.match(css, /@media\(max-width:980px\)/);
assert.match(css, /@media\(max-width:680px\)/);
assert.match(css, /@media\(max-width:360px\)/);
assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);

for (const path of ['index.html','experience.css','app.js','qa/capability-transformer.contract.mjs']) {
  assert.ok(manifest.files.includes(path), `manifest missing ${path}`);
}
for (const stale of ['experience-core.css','experience-layout.css','experience-responsive.css','experience-polish.css','app-prelude.js','app-funnel.js','app-controller.js']) {
  assert.ok(!manifest.files.includes(stale), `manifest should not declare unused ${stale}`);
}

const publicText = [index, app, css, fs.readFileSync(new URL('../README.md', import.meta.url), 'utf8')].join('\n');
assert.doesNotMatch(publicText, /role[\s_-]*forge/i);
console.log('Capability Transformer volumetric composition contract passed.');
