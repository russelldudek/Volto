class FunnelScene {
  constructor(target) {
    this.canvas = target;
    this.gl = target.getContext('webgl2', {
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
      premultipliedAlpha: false
    });
    if (!this.gl) throw new Error('WebGL2 unavailable');
    this.palette = scenarios.ops.colors.map(hexToRgb);
    this.projection = new Float32Array(16);
    this.view = new Float32Array(16);
    lookAt(this.view, [0, 0.72, 7.2], [0, -0.15, 0], [0, 1, 0]);
    this.introStart = performance.now();
    this.intro = 0;
    this.duration = 3200;
    this.running = false;
    this.visible = true;
    this.raf = 0;
    this.init();
    this.resizeObserver = new ResizeObserver(() => this.resize());
    this.resizeObserver.observe(target.parentElement);
    document.addEventListener('visibilitychange', () => {
      this.visible = document.visibilityState === 'visible';
      if (this.visible && !this.running && !reduced.matches) this.startLoop();
    });
  }

  init() {
    const gl = this.gl;
    const profile = `
      float funnelRadius(float t){
        return 0.42 + 1.83 * pow(max(0.0, 1.0 - t), 1.35);
      }
      float funnelSlope(float t){
        return -2.4705 * pow(max(0.0001, 1.0 - t), 0.35);
      }
      vec3 funnelPoint(float theta, float t){
        float r = funnelRadius(t);
        float y = mix(1.30, -1.25, t);
        return vec3(r * cos(theta), y, r * sin(theta));
      }
    `;

    this.surfaceProgram = makeProgram(gl, `#version 300 es
      precision highp float;
      layout(location=0) in vec3 aData;
      uniform mat4 uP, uV;
      uniform float uIntro;
      out vec3 vNormal;
      out vec3 vView;
      out float vT;
      out float vTheta;
      out float vKind;
      ${profile}
      void main(){
        float theta = aData.x;
        float t = aData.y;
        float kind = aData.z;
        vec3 position;
        vec3 normal;
        if(kind < 0.5){
          position = funnelPoint(theta, t);
          float r = funnelRadius(t);
          float dr = funnelSlope(t);
          vec3 tangentTheta = vec3(-r * sin(theta), 0.0, r * cos(theta));
          vec3 tangentT = vec3(dr * cos(theta), -2.55, dr * sin(theta));
          normal = normalize(cross(tangentT, tangentTheta));
        }else if(kind < 1.5){
          float r = 0.42;
          position = vec3(r * cos(theta), mix(-1.25, -1.78, t), r * sin(theta));
          normal = normalize(vec3(cos(theta), 0.0, sin(theta)));
        }else if(kind < 2.5){
          float r = mix(2.12, 2.30, t);
          position = vec3(r * cos(theta), 1.30 + 0.025 * sin(t * 3.14159), r * sin(theta));
          normal = vec3(0.0, 1.0, 0.0);
        }else{
          float r = mix(0.64, 1.52, t);
          position = vec3(r * cos(theta), -1.94, r * sin(theta));
          normal = vec3(0.0, 1.0, 0.0);
        }
        float reveal = mix(0.965, 1.0, smoothstep(0.0, 0.8, uIntro));
        position.xz *= reveal;
        vec4 viewPosition = uV * vec4(position, 1.0);
        gl_Position = uP * viewPosition;
        vNormal = mat3(uV) * normal;
        vView = viewPosition.xyz;
        vT = t;
        vTheta = theta;
        vKind = kind;
      }
    `, `#version 300 es
      precision highp float;
      in vec3 vNormal;
      in vec3 vView;
      in float vT;
      in float vTheta;
      in float vKind;
      uniform vec3 uA, uB, uC;
      uniform float uTime, uAlpha;
      out vec4 outColor;
      void main(){
        vec3 normal = normalize(vNormal);
        vec3 eye = normalize(-vView);
        float fresnel = pow(1.0 - max(0.0, dot(normal, eye)), 2.6);
        float side = cos(vTheta) * 0.5 + 0.5;
        vec3 base = side < 0.5 ? mix(uA, uB, side * 2.0) : mix(uB, uC, (side - 0.5) * 2.0);
        float rimLight = smoothstep(0.0, 0.14, 1.0 - vT);
        float throatLight = smoothstep(0.72, 1.0, vT);
        float sweep = 0.5 + 0.5 * sin(vTheta * 1.6 + vT * 7.0 - uTime * 0.28);
        float brightness = 0.54 + fresnel * 1.05 + rimLight * 0.22 + throatLight * 0.17 + sweep * 0.045;
        float alpha = (0.075 + fresnel * 0.23 + rimLight * 0.07 + throatLight * 0.055) * uAlpha;
        if(vKind > 1.5 && vKind < 2.5){brightness += 0.28; alpha = (0.18 + fresnel * 0.20) * uAlpha;}
        if(vKind > 2.5){brightness *= 0.86; alpha = (0.075 + fresnel * 0.10) * uAlpha;}
        outColor = vec4(base * brightness, alpha);
      }
    `);

    this.lineProgram = makeProgram(gl, `#version 300 es
      precision highp float;
      layout(location=0) in vec3 aPosition;
      uniform mat4 uP, uV;
      void main(){gl_Position = uP * uV * vec4(aPosition,1.0);}
    `, `#version 300 es
      precision highp float;
      uniform vec3 uColor;
      uniform float uAlpha;
      out vec4 outColor;
      void main(){outColor = vec4(uColor, uAlpha);}
    `);

    this.particleProgram = makeProgram(gl, `#version 300 es
      precision highp float;
      layout(location=0) in vec4 aData;
      uniform mat4 uP, uV;
      uniform float uTime, uIntro;
      uniform vec3 uA, uB, uC;
      out vec3 vColor;
      out float vAlpha;
      float hash(float n){return fract(sin(n) * 43758.5453123);}
      float funnelRadius(float t){return 0.42 + 1.83 * pow(max(0.0,1.0-t),1.35);}
      vec3 forwardPath(float p, float lane, float seed){
        if(p < 0.20){
          float q = p / 0.20;
          return vec3(mix(-3.35, -1.82, q), mix(-0.55 - lane * 0.55, 1.14 + lane * 0.10, q), mix((hash(seed*41.0)-0.5)*0.38, lane*0.10, q));
        }
        if(p < 0.80){
          float q = (p - 0.20) / 0.60;
          float r = funnelRadius(q) * 0.63;
          float theta = 3.14159 + lane * 0.38 + q * 5.30 + (seed - 0.5) * 0.18;
          return vec3(r*cos(theta), mix(1.22,-1.22,q), r*sin(theta));
        }
        float q = (p - 0.80) / 0.20;
        return vec3(mix(0.16, 3.35, q), mix(-1.48, -0.55 - lane * 0.55, q), mix(0.0,(hash(seed*127.0)-0.5)*0.24,q));
      }
      vec3 returnPath(float p, float lane, float seed){
        float angle = 3.14159 * p;
        return vec3(mix(3.15,-3.15,p), -1.96 - 0.18*sin(angle) + lane*0.03, 0.38*cos(angle));
      }
      void main(){
        float seed = aData.x;
        float lane = aData.y;
        bool returning = aData.z > 0.5;
        float speed = returning ? 0.021 : 0.036;
        float p = fract(seed + uTime * speed);
        vec3 position = returning ? returnPath(p,lane,seed) : forwardPath(p,lane,seed);
        vec4 viewPosition = uV * vec4(position,1.0);
        gl_Position = uP * viewPosition;
        gl_PointSize = aData.w * (5.8 / max(1.0,-viewPosition.z));
        float progressColor = returning ? 1.0 : smoothstep(0.18,0.92,p);
        vec3 source = mix(uA,uB,lane*0.5+0.5);
        vColor = mix(source,uC,progressColor);
        float reveal = smoothstep(0.0,0.24,uIntro);
        vAlpha = (0.20 + 0.46*hash(seed*213.0))*reveal*(returning?0.36:0.78);
      }
    `, `#version 300 es
      precision highp float;
      in vec3 vColor;
      in float vAlpha;
      out vec4 outColor;
      void main(){
        vec2 uv = gl_PointCoord - 0.5;
        float distanceFromCenter = length(uv);
        if(distanceFromCenter > 0.5) discard;
        float glow = pow(smoothstep(0.5,0.0,distanceFromCenter),2.0);
        outColor = vec4(vColor*(1.15+glow*0.8),vAlpha*glow);
      }
    `);

    this.buildSurface();
    this.buildLines();
    this.buildParticles();
    gl.enable(gl.BLEND);
    gl.enable(gl.DEPTH_TEST);
    this.resize();
  }
}
