import fs from 'node:fs';
import assert from 'node:assert/strict';

const index = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const app = fs.readFileSync(new URL('../app.js', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../experience.css', import.meta.url), 'utf8');
const manifest = JSON.parse(fs.readFileSync(new URL('../manifest.json', import.meta.url), 'utf8'));

assert.match(index, /<canvas id="capabilityField"/);
assert.doesNotMatch(index, /transformer-svg|class="coil"|class="pulse"/);
assert.match(index, /fieldDescription/);
assert.match(index, /illustrative measurement categories/);
assert.match(app, /getContext\('webgl2'/);
assert.match(app, /if \(t < 1\) this\.raf = requestAnimationFrame/);
assert.match(app, /prefersReducedMotion\.matches \? 1 : 0/);
assert.match(app, /mobileRendererQuery/);
assert.match(app, /applyScenario\(key/);
assert.match(app, /setAttribute\('aria-pressed'/);
assert.match(css, /\.transformer-stage\.is-fallback/);
assert.match(css, /@media\(max-width:360px\)/);
assert.match(css, /@media\(prefers-reduced-motion:reduce\)/);
assert.ok(manifest.files.includes('experience.css'));

console.log('Capability Transformer contract passed.');
