import fs from 'node:fs';
import assert from 'node:assert/strict';

const index = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const prelude = fs.readFileSync(new URL('../app-prelude.js', import.meta.url), 'utf8');
const funnel = fs.readFileSync(new URL('../app-funnel.js', import.meta.url), 'utf8');
const controller = fs.readFileSync(new URL('../app-controller.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../experience.css', import.meta.url), 'utf8');
const polish = fs.readFileSync(new URL('../experience-polish.css', import.meta.url), 'utf8');
const manifest = JSON.parse(fs.readFileSync(new URL('../manifest.json', import.meta.url), 'utf8'));

assert.match(index, /class="capability-hero"/);
assert.match(index, /class="input-stack"/);
assert.match(index, /class="output-stack"/);
assert.match(index, /class="authority-orb"/);
assert.match(index, /class="transformer-summary"/);
assert.match(index, /<canvas id="capabilityField"/);
assert.doesNotMatch(index, /transformer-svg|class="coil"|class="pulse"/);
assert.match(app, /app-prelude\.js/);
assert.match(prelude, /mobileRendererQuery/);
assert.match(funnel, /class CapabilityFunnel/);
assert.match(funnel, /getContext\('webgl2'/);
assert.match(funnel, /surfaceProgram/);
assert.match(funnel, /particleProgram/);
assert.match(funnel, /if\(t<1\)this\.raf=requestAnimationFrame/);
assert.match(controller, /applyScenario\(key/);
assert.match(controller, /setAttribute\('aria-pressed'/);
assert.match(controller, /resetScenario/);
assert.match(css, /experience-core\.css/);
assert.match(polish, /Final sculpted composition/);
assert.match(polish, /@media\(max-width:360px\)/);
assert.ok(manifest.files.includes('experience-polish.css'));
assert.ok(manifest.files.includes('app-funnel.js'));
assert.ok(manifest.files.includes('qa/capability-transformer.contract.mjs'));

console.log('Capability Transformer composition contract passed.');
