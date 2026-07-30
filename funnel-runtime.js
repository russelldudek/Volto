FunnelScene.prototype.setPalette = function (colors) {
    this.palette = colors.map(hexToRgb);
};

FunnelScene.prototype.resize = function () {
    const rect = this.canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 1.75);
    const width = Math.max(1, Math.round(rect.width * ratio));
    const height = Math.max(1, Math.round(rect.height * ratio));
    if (this.canvas.width !== width || this.canvas.height !== height) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.gl.viewport(0, 0, width, height);
      perspective(this.projection, Math.PI / 4.2, width / height, 0.1, 40);
    }
    this.render(performance.now());
};

FunnelScene.prototype.setCommonUniforms = function (program, time) {
    const gl = this.gl;
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'uP'), false, this.projection);
    gl.uniformMatrix4fv(gl.getUniformLocation(program, 'uV'), false, this.view);
    for (const [name, value] of [['uA', this.palette[0]], ['uB', this.palette[1]], ['uC', this.palette[2]]]) {
      const location = gl.getUniformLocation(program, name);
      if (location !== null) gl.uniform3fv(location, value);
    }
    for (const [name, value] of [['uTime', time], ['uIntro', this.intro]]) {
      const location = gl.getUniformLocation(program, name);
      if (location !== null) gl.uniform1f(location, value);
    }
};

FunnelScene.prototype.replay = function () {
    this.introStart = performance.now();
    this.intro = reduced.matches ? 1 : 0;
    stage.classList.remove('settled');
    if (reduced.matches) {
      this.stopLoop();
      this.render(this.introStart);
      stage.classList.add('settled');
    } else {
      this.startLoop();
    }
};

FunnelScene.prototype.startLoop = function () {
    if (this.running || reduced.matches || !this.visible) return;
    this.running = true;
    const tick = (now) => {
      if (!this.running) return;
      const progress = Math.min(1, (now - this.introStart) / this.duration);
      this.intro = 1 - Math.pow(1 - progress, 3);
      if (progress >= 1) stage.classList.add('settled');
      this.render(now);
      if (this.visible) this.raf = requestAnimationFrame(tick);
      else this.running = false;
    };
    this.raf = requestAnimationFrame(tick);
};

FunnelScene.prototype.stopLoop = function () {
    this.running = false;
    cancelAnimationFrame(this.raf);
};

FunnelScene.prototype.destroy = function () {
    this.stopLoop();
    this.resizeObserver?.disconnect();
};

FunnelScene.prototype.render = function (now) {
    const gl = this.gl;
    const time = now * 0.001;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.depthMask(false);

    gl.useProgram(this.surfaceProgram);
    this.setCommonUniforms(this.surfaceProgram, time);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.surfaceBuffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 12, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.FRONT);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.uniform1f(gl.getUniformLocation(this.surfaceProgram, 'uAlpha'), 0.48);
    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_INT, 0);
    gl.cullFace(gl.BACK);
    gl.uniform1f(gl.getUniformLocation(this.surfaceProgram, 'uAlpha'), 1.0);
    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_INT, 0);
    gl.disable(gl.CULL_FACE);

    gl.useProgram(this.lineProgram);
    gl.uniformMatrix4fv(gl.getUniformLocation(this.lineProgram, 'uP'), false, this.projection);
    gl.uniformMatrix4fv(gl.getUniformLocation(this.lineProgram, 'uV'), false, this.view);
    
    gl.bindBuffer(gl.ARRAY_BUFFER, this.lineBuffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 12, 0);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    for (const draw of this.lineDraws) {
      gl.uniform3fv(gl.getUniformLocation(this.lineProgram, 'uColor'), this.palette[draw.color]);
      gl.uniform1f(gl.getUniformLocation(this.lineProgram, 'uAlpha'), draw.alpha);
      gl.lineWidth(draw.width);
      gl.drawArrays(gl.LINE_STRIP, draw.start, draw.count);
    }

    gl.useProgram(this.particleProgram);
    this.setCommonUniforms(this.particleProgram, time);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.particleBuffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 4, gl.FLOAT, false, 16, 0);
    gl.drawArrays(gl.POINTS, 0, this.particleCount);

    gl.depthMask(true);
};

