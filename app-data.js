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
    colors: ['#8b69ff', '#49a8ff', '#20dfc9']
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
    colors: ['#697dff', '#52b9ff', '#32ddd5']
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
    colors: ['#3d9cff', '#53d0dc', '#42dfb3']
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
    colors: ['#9a70ff', '#57a5ff', '#36d9c6']
  }
};

const fields = {
  label: 'scenarioLabel',
  title: 'scenarioTitle',
  narrative: 'scenarioNarrative',
  ai: 'aiRole',
  authority: 'authority',
  governance: 'governance',
  measure: 'measure',
  motion: 'motion',
  verdict: 'verdict'
};

const stage = document.getElementById('transformer');
const canvas = document.getElementById('capabilityField');
const announcement = document.getElementById('scenarioAnnouncement');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
const mobile = window.matchMedia('(max-width: 980px), (pointer: coarse) and (max-width: 1100px)');
let scene = null;
let selected = 'ops';
let token = 0;

function hexToRgb(hex) {
  const value = Number.parseInt(hex.slice(1), 16);
  return [(value >> 16) / 255, ((value >> 8) & 255) / 255, (value & 255) / 255];
}

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader) || 'Shader compile failed');
  }
  return shader;
}

function makeProgram(gl, vertexSource, fragmentSource) {
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertexSource));
  gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragmentSource));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(gl.getProgramInfoLog(program) || 'Program link failed');
  }
  return program;
}

function perspective(out, fovy, aspect, near, far) {
  const f = 1 / Math.tan(fovy / 2);
  out.fill(0);
  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) / (near - far);
  out[11] = -1;
  out[14] = (2 * far * near) / (near - far);
}

function lookAt(out, eye, center, up) {
  let zx = eye[0] - center[0];
  let zy = eye[1] - center[1];
  let zz = eye[2] - center[2];
  let length = Math.hypot(zx, zy, zz) || 1;
  zx /= length;
  zy /= length;
  zz /= length;
  let xx = up[1] * zz - up[2] * zy;
  let xy = up[2] * zx - up[0] * zz;
  let xz = up[0] * zy - up[1] * zx;
  length = Math.hypot(xx, xy, xz) || 1;
  xx /= length;
  xy /= length;
  xz /= length;
  const yx = zy * xz - zz * xy;
  const yy = zz * xx - zx * xz;
  const yz = zx * xy - zy * xx;
  out[0] = xx;
  out[1] = yx;
  out[2] = zx;
  out[3] = 0;
  out[4] = xy;
  out[5] = yy;
  out[6] = zy;
  out[7] = 0;
  out[8] = xz;
  out[9] = yz;
  out[10] = zz;
  out[11] = 0;
  out[12] = -(xx * eye[0] + xy * eye[1] + xz * eye[2]);
  out[13] = -(yx * eye[0] + yy * eye[1] + yz * eye[2]);
  out[14] = -(zx * eye[0] + zy * eye[1] + zz * eye[2]);
  out[15] = 1;
}

function seeded(index) {
  const value = Math.sin(index * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

