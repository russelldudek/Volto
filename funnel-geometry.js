FunnelScene.prototype.buildSurface = function () {
    const gl = this.gl;
    const radialSegments = 128;
    const profileSegments = 72;
    const vertices = [];
    const indices = [];
    const addSurface = (kind) => {
      const offset = vertices.length / 3;
      for (let row = 0; row <= profileSegments; row += 1) {
        const t = row / profileSegments;
        for (let column = 0; column <= radialSegments; column += 1) {
          vertices.push((column / radialSegments) * Math.PI * 2, t, kind);
        }
      }
      for (let row = 0; row < profileSegments; row += 1) {
        for (let column = 0; column < radialSegments; column += 1) {
          const a = offset + row * (radialSegments + 1) + column;
          const b = a + 1;
          const c = offset + (row + 1) * (radialSegments + 1) + column;
          const d = c + 1;
          indices.push(a, c, b, b, c, d);
        }
      }
    };
    addSurface(0);
    addSurface(1);
    addSurface(2);
    addSurface(3);
    this.surfaceBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.surfaceBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);
    this.indexCount = indices.length;
};

FunnelScene.prototype.buildLines = function () {
    const gl = this.gl;
    const data = [];
    const draws = [];
    const add = (points, width = 1, alpha = 0.24, color = 2) => {
      const start = data.length / 3;
      data.push(...points);
      draws.push({ start, count: points.length / 3, width, alpha, color });
    };
    const profileRadius = (t) => 0.42 + 1.83 * Math.pow(Math.max(0, 1 - t), 1.35);
    const profileY = (t) => 1.30 - 2.55 * t;
    const circle = (radius, y, segments = 180) => {
      const points = [];
      for (let index = 0; index <= segments; index += 1) {
        const theta = (index / segments) * Math.PI * 2;
        points.push(radius * Math.cos(theta), y, radius * Math.sin(theta));
      }
      return points;
    };
    add(circle(2.30, 1.30), 2, 0.82, 2);
    add(circle(2.21, 1.315), 1, 0.56, 1);
    add(circle(2.12, 1.30), 1, 0.34, 0);
    for (const t of [0.14, 0.30, 0.48, 0.66, 0.82, 1]) add(circle(profileRadius(t), profileY(t)), 1, t > 0.80 ? 0.32 : 0.17, t > 0.62 ? 2 : 1);
    for (let index = 0; index < 14; index += 1) {
      const theta = (index / 14) * Math.PI * 2;
      const points = [];
      for (let row = 0; row <= 72; row += 1) {
        const t = row / 72;
        const radius = profileRadius(t);
        points.push(radius * Math.cos(theta), profileY(t), radius * Math.sin(theta));
      }
      points.push(0.42 * Math.cos(theta), -1.78, 0.42 * Math.sin(theta));
      add(points, 1, 0.13, index % 3 === 0 ? 2 : 1);
    }
    add(circle(0.42, -1.25), 1, 0.42, 2);
    add(circle(0.42, -1.78), 1, 0.48, 2);
    add(circle(0.78, -1.94), 1, 0.40, 2);
    add(circle(1.16, -1.94), 1, 0.28, 1);
    add(circle(1.52, -1.94), 1, 0.18, 0);
    this.lineBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.lineBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    this.lineDraws = draws;
};

FunnelScene.prototype.buildParticles = function () {
    const gl = this.gl;
    const count = 1050;
    const data = new Float32Array(count * 4);
    for (let index = 0; index < count; index += 1) {
      const lane = (index % 3) - 1;
      const seed = (index + seeded(index) * 0.82) / count;
      const kind = index % 10 === 0 ? 1 : 0;
      data.set([seed, lane, kind, 6 + seeded(index + 17) * 10], index * 4);
    }
    this.particleBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.particleBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    this.particleCount = count;
};

