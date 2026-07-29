const scenarios = {
  ops: {
    label: 'OPERATIONS',
    title: 'Convert expert handoffs into reusable standard work.',
    narrative: 'Use structured context and human review to turn recurring operating knowledge into a dependable first draft, checklist, and escalation path.',
    ai: 'Draft, structure, compare',
    authority: 'Process owner approves',
    governance: 'Approved sources; no confidential leakage',
    measure: 'Cycle time, completeness, reuse',
    motion: 'Demo → practice → office hours',
    verdict: 'Standardize',
    heroVerdict: 'Ready to standardize',
    heroScenario: 'Operations knowledge handoff',
    colors: ['#766cff', '#4ca8ff', '#2ce0c6']
  },
  talent: {
    label: 'TALENT OPERATIONS',
    title: 'Turn role context into a consistent candidate assessment workflow.',
    narrative: 'Help recruiting teams move from generic prompting to structured role context, evidence-based comparison, human judgment, and traceable decisions.',
    ai: 'Synthesize, compare, prepare',
    authority: 'Recruiter and hiring manager decide',
    governance: 'No sensitive inference; evidence remains attributable',
    measure: 'Intake speed, consistency, rework',
    motion: 'Role clinic → template → calibration',
    verdict: 'Pilot with controls',
    heroVerdict: 'Pilot with controls',
    heroScenario: 'Role-context assessment workflow',
    colors: ['#518cff', '#62c5ff', '#4be1dd']
  },
  delivery: {
    label: 'SALES & DELIVERY',
    title: 'Convert discovery into an actionable client-work brief.',
    narrative: 'Use ChatGPT to organize notes, surface open assumptions, draft a structured response, and preserve explicit human ownership of commitments.',
    ai: 'Organize, challenge, draft',
    authority: 'Account and delivery owners commit',
    governance: 'Client data and claims remain bounded',
    measure: 'Handoff speed, clarity, revision load',
    motion: 'Live demo → paired use → review',
    verdict: 'Scale after proof',
    heroVerdict: 'Scale after proof',
    heroScenario: 'Discovery-to-delivery brief',
    colors: ['#38a7ff', '#52d5dd', '#44e0b2']
  },
  support: {
    label: 'SUPPORT',
    title: 'Turn recurring issues into earlier, clearer response guidance.',
    narrative: 'Synthesize approved knowledge, identify missing context, draft a response path, and escalate when confidence or consequence requires human judgment.',
    ai: 'Retrieve, summarize, route',
    authority: 'Support owner resolves or escalates',
    governance: 'Approved knowledge; no unsupported diagnosis',
    measure: 'Response time, recurrence, resolution quality',
    motion: 'Case replay → coaching → adoption',
    verdict: 'Standardize selectively',
    heroVerdict: 'Standardize selectively',
    heroScenario: 'Recurring-issue response guidance',
    colors: ['#9a73ff', '#5ba8ff', '#3bd8c4']
  }
};

const fieldIds = {
  label: 'scenarioLabel', title: 'scenarioTitle', narrative: 'scenarioNarrative',
  ai: 'aiRole', authority: 'authority', governance: 'governance',
  measure: 'measure', motion: 'motion', verdict: 'verdict'
};

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobileRendererQuery = window.matchMedia('(max-width: 700px), (pointer: coarse) and (max-width: 900px)');
const stage = document.getElementById('transformer');
const canvas = document.getElementById('capabilityField');
const announcement = document.getElementById('scenarioAnnouncement');
let visual = null;
let selectedScenario = 'ops';
let animationToken = 0;

function hexToRgb(hex) {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

function createProgram(gl, vertexSource, fragmentSource) {
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) || 'Shader compilation failed');
    }
    return shader;
  };
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || 'Program linking failed');
  }
  return program;
}

function perspective(out, fovy, aspect, near, far) {
  const f = 1 / Math.tan(fovy / 2);
  out.fill(0);
  out[0] = f / aspect; out[5] = f; out[10] = (far + near) / (near - far);
  out[11] = -1; out[14] = (2 * far * near) / (near - far);
  return out;
}

function lookAt(out, eye, center, up) {
  let x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
  z0 = eye[0] - center[0]; z1 = eye[1] - center[1]; z2 = eye[2] - center[2];
  len = Math.hypot(z0, z1, z2) || 1; z0 /= len; z1 /= len; z2 /= len;
  x0 = up[1] * z2 - up[2] * z1; x1 = up[2] * z0 - up[0] * z2; x2 = up[0] * z1 - up[1] * z0;
  len = Math.hypot(x0, x1, x2) || 1; x0 /= len; x1 /= len; x2 /= len;
  y0 = z1 * x2 - z2 * x1; y1 = z2 * x0 - z0 * x2; y2 = z0 * x1 - z1 * x0;
  out[0] = x0; out[1] = y0; out[2] = z0; out[3] = 0;
  out[4] = x1; out[5] = y1; out[6] = z1; out[7] = 0;
  out[8] = x2; out[9] = y2; out[10] = z2; out[11] = 0;
  out[12] = -(x0 * eye[0] + x1 * eye[1] + x2 * eye[2]);
  out[13] = -(y0 * eye[0] + y1 * eye[1] + y2 * eye[2]);
  out[14] = -(z0 * eye[0] + z1 * eye[1] + z2 * eye[2]); out[15] = 1;
  return out;
}

class CapabilityField {
  constructor(targetCanvas) {
    this.canvas = targetCanvas;
    this.gl = targetCanvas.getContext('webgl2', {
      alpha: true, antialias: true, powerPreference: 'high-performance', premultipliedAlpha: false
    });
    if (!this.gl) throw new Error('WebGL2 unavailable');
    this.progress = 1;
    this.targetProgress = 1;
    this.startTime = 0;
    this.duration = 3600;
    this.raf = 0;
    this.palette = scenarios.ops.colors.map(hexToRgb);
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(targetCanvas.parentElement);
    this.init();
  }

  init() {
    const gl = this.gl;
    this.particleProgram = createProgram(gl, `#version 300 es
      precision highp float;
      layout(location=0) in vec4 aData;
      uniform float uProgress;
      uniform float uTime;
      uniform mat4 uProjection;
      uniform mat4 uView;
      uniform vec3 uInputA;
      uniform vec3 uInputB;
      uniform vec3 uOutput;
      out vec3 vColor;
      out float vAlpha;
      float hash(float n){return fract(sin(n)*43758.5453123);}
      float ease(float x){return x*x*(3.0-2.0*x);}
      void main(){
        float seed=aData.x;
        float lane=aData.y;
        float local=clamp(uProgress,0.0,1.0);
        float p=ease(local);
        float xStart=mix(-3.65,-1.65,seed);
        float xTarget=mix(.35,3.20,seed);
        float x=mix(xStart,xTarget,p);
        float noiseA=sin(seed*117.0+uTime*1.25)+sin(seed*43.0-uTime*.82);
        float noiseB=cos(seed*79.0+uTime*.64)+sin(seed*151.0);
        float compression=.18+.82*smoothstep(.15,2.8,abs(x));
        float yIn=lane*.70+noiseA*.18+sin(seed*63.0)*.22;
        float zIn=(hash(seed*93.0)-.5)*1.35+noiseB*.10;
        float yOut=lane*.48+sin(x*2.75+lane*.65)*.026;
        float zOut=0.0;
        float outputBlend=smoothstep(.1,2.8,x);
        float center=1.0-smoothstep(.35,1.75,abs(x));
        float y=mix(yIn*compression,yOut,outputBlend)+sin(x*3.2+seed*6.283)*.12*center;
        float z=mix(zIn*compression,zOut,outputBlend)+cos(x*3.2+seed*6.283)*.12*center;
        vec4 viewPos=uView*vec4(x,y,z,1.0);
        gl_Position=uProjection*viewPos;
        gl_PointSize=aData.w*(4.6/max(1.0,-viewPos.z))*(.78+local*.35);
        float colorBlend=smoothstep(-.6,2.1,x);
        vec3 inputColor=mix(uInputA,uInputB,clamp(lane*.5+.5,0.0,1.0));
        vColor=mix(inputColor,uOutput,colorBlend);
        vAlpha=(.34+.46*hash(seed*211.0))*(.78+.22*smoothstep(0.0,.12,local));
      }`, `#version 300 es
      precision highp float;
      in vec3 vColor;
      in float vAlpha;
      out vec4 outColor;
      void main(){
        vec2 uv=gl_PointCoord-.5;
        float d=length(uv);
        if(d>.5) discard;
        float core=smoothstep(.5,0.0,d);
        float glow=pow(core,2.2);
        outColor=vec4(vColor*(1.15+glow*.55),vAlpha*glow);
      }`);

    this.ribbonProgram = createProgram(gl, `#version 300 es
      precision highp float;
      layout(location=0) in vec3 aPosition;
      layout(location=1) in float aIntensity;
      uniform mat4 uProjection;
      uniform mat4 uView;
      uniform vec3 uInputA;
      uniform vec3 uOutput;
      out vec3 vColor;
      out float vAlpha;
      void main(){
        gl_Position=uProjection*uView*vec4(aPosition,1.0);
        vColor=mix(uInputA,uOutput,aIntensity);
        vAlpha=.34+.56*(1.0-abs(aIntensity-.5)*1.25);
      }`, `#version 300 es
      precision highp float;
      in vec3 vColor;
      in float vAlpha;
      out vec4 outColor;
      void main(){outColor=vec4(vColor*1.48,vAlpha);}`);

    this.particles = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.particles);
    const count = 2100;
    const data = new Float32Array(count * 4);
    for (let i = 0; i < count; i += 1) {
      const lane = (i % 3) - 1;
      const seed = (i + Math.random() * .8) / count;
      data.set([seed, lane, Math.random(), 7 + Math.random() * 10], i * 4);
    }
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    this.particleCount = count;

    const ringData = [];
    const positions = [-1.45, -.73, 0, .73, 1.45];
    const radii = [1.34, 1.06, .82, 1.02, 1.30];
    const segments = 96;
    positions.forEach((x, gateIndex) => {
      const radius = radii[gateIndex];
      const width = gateIndex === 2 ? .060 : .030;
      for (let i = 0; i <= segments; i += 1) {
        const a = i / segments * Math.PI * 2;
        const c = Math.cos(a), s = Math.sin(a);
        const tilt = (gateIndex - 2) * .05;
        ringData.push(x + s * tilt, c * (radius - width), s * (radius - width), gateIndex / 4);
        ringData.push(x + s * tilt, c * (radius + width), s * (radius + width), gateIndex / 4);
      }
    });
    this.ribbons = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.ribbons);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ringData), gl.STATIC_DRAW);
    this.ribbonVertexCount = ringData.length / 4;
    this.ribbonOffsets = positions.map((_, index) => index * (segments + 1) * 2);
    this.ribbonCounts = positions.map(() => (segments + 1) * 2);

    this.projection = new Float32Array(16);
    this.view = new Float32Array(16);
    lookAt(this.view, [0, 1.0, 8.1], [0, 0, 0], [0, 1, 0]);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.disable(gl.DEPTH_TEST);
    this.resize();
  }

  setPalette(colors) { this.palette = colors.map(hexToRgb); }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width; this.canvas.height = height;
      this.gl.viewport(0, 0, width, height);
      perspective(this.projection, Math.PI / 4.1, width / height, .1, 40);
    }
    this.render(performance.now());
  }

  replay() {
    cancelAnimationFrame(this.raf);
    this.startTime = performance.now();
    this.progress = prefersReducedMotion.matches ? 1 : 0;
    this.targetProgress = 1;
    if (prefersReducedMotion.matches) {
      this.render(this.startTime + this.duration);
      return;
    }
    this.loop(this.startTime);
  }

  loop = (now) => {
    const elapsed = now - this.startTime;
    const t = Math.min(1, elapsed / this.duration);
    const eased = 1 - Math.pow(1 - t, 3);
    this.progress = eased;
    this.render(now);
    if (t < 1) this.raf = requestAnimationFrame(this.loop);
  };

  render(now) {
    const gl = this.gl;
    const time = now * .001;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(this.ribbonProgram);
    gl.uniformMatrix4fv(gl.getUniformLocation(this.ribbonProgram, 'uProjection'), false, this.projection);
    gl.uniformMatrix4fv(gl.getUniformLocation(this.ribbonProgram, 'uView'), false, this.view);
    gl.uniform3fv(gl.getUniformLocation(this.ribbonProgram, 'uInputA'), this.palette[0]);
    gl.uniform3fv(gl.getUniformLocation(this.ribbonProgram, 'uOutput'), this.palette[2]);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.ribbons);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 16, 12);
    for (let i = 0; i < this.ribbonOffsets.length; i += 1) {
      gl.drawArrays(gl.TRIANGLE_STRIP, this.ribbonOffsets[i], this.ribbonCounts[i]);
    }

    gl.useProgram(this.particleProgram);
    gl.uniform1f(gl.getUniformLocation(this.particleProgram, 'uProgress'), this.progress);
    gl.uniform1f(gl.getUniformLocation(this.particleProgram, 'uTime'), time);
    gl.uniformMatrix4fv(gl.getUniformLocation(this.particleProgram, 'uProjection'), false, this.projection);
    gl.uniformMatrix4fv(gl.getUniformLocation(this.particleProgram, 'uView'), false, this.view);
    gl.uniform3fv(gl.getUniformLocation(this.particleProgram, 'uInputA'), this.palette[0]);
    gl.uniform3fv(gl.getUniformLocation(this.particleProgram, 'uInputB'), this.palette[1]);
    gl.uniform3fv(gl.getUniformLocation(this.particleProgram, 'uOutput'), this.palette[2]);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.particles);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 16, 0);
    gl.drawArrays(gl.POINTS, 0, this.particleCount);
  }
}

function ensureRenderer() {
  if (mobileRendererQuery.matches) {
    stage.classList.add('is-fallback');
    visual = null;
    return;
  }
  stage.classList.remove('is-fallback');
  if (visual) return;
  try {
    visual = new CapabilityField(canvas);
    visual.setPalette(scenarios[selectedScenario].colors);
    visual.replay();
  } catch (error) {
    console.warn('WebGL2 renderer unavailable; using semantic fallback.', error);
    stage.classList.add('is-fallback');
  }
}

function applyScenario(key, { announce = true, replay = true } = {}) {
  const scenario = scenarios[key];
  if (!scenario) return;
  selectedScenario = key;
  animationToken += 1;
  Object.entries(fieldIds).forEach(([property, id]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = scenario[property];
  });
  document.getElementById('heroScenario').textContent = scenario.heroScenario;
  document.getElementById('heroMeasure').textContent = scenario.measure.replaceAll(', ', ' · ');
  document.getElementById('heroVerdict').textContent = scenario.heroVerdict;
  document.querySelectorAll('[data-scenario]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.scenario === key));
  });
  if (visual) {
    visual.setPalette(scenario.colors);
    if (replay) visual.replay(); else visual.render(performance.now());
  }
  if (announce) announcement.textContent = `${scenario.label}: ${scenario.title}. Decision: ${scenario.verdict}.`;
}

function handleRendererChange() {
  if (mobileRendererQuery.matches) {
    if (visual) cancelAnimationFrame(visual.raf);
    visual = null;
    stage.classList.add('is-fallback');
  } else {
    ensureRenderer();
    applyScenario(selectedScenario, { announce: false, replay: false });
  }
}

document.querySelectorAll('[data-scenario]').forEach((button) => {
  button.addEventListener('click', () => applyScenario(button.dataset.scenario));
});

document.getElementById('replay').addEventListener('click', () => {
  const token = ++animationToken;
  if (visual) visual.replay();
  announcement.textContent = `Replaying ${scenarios[selectedScenario].label.toLowerCase()} transformation.`;
  window.setTimeout(() => {
    if (token === animationToken) announcement.textContent = `${scenarios[selectedScenario].heroVerdict}.`;
  }, prefersReducedMotion.matches ? 0 : 3700);
});

mobileRendererQuery.addEventListener('change', handleRendererChange);
prefersReducedMotion.addEventListener('change', () => {
  if (visual) visual.replay();
});

ensureRenderer();
applyScenario('ops', { announce: false, replay: false });
