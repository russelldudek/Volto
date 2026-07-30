function applyPalette(colors) {
  stage.style.setProperty('--a', colors[0]);
  stage.style.setProperty('--b', colors[1]);
  stage.style.setProperty('--c', colors[2]);
}

function ensureRenderer() {
  if (mobile.matches) {
    scene?.destroy();
    scene = null;
    canvas.style.display = 'none';
    stage.classList.add('settled');
    return;
  }
  canvas.style.display = 'block';
  if (scene) return;
  try {
    scene = new FunnelScene(canvas);
    scene.setPalette(scenarios[selected].colors);
    scene.replay();
  } catch (error) {
    console.warn('WebGL2 renderer unavailable; using semantic composition.', error);
    scene = null;
    canvas.style.display = 'none';
    stage.classList.add('settled');
  }
}

function applyScenario(key, { announce = true, replay = true } = {}) {
  const scenario = scenarios[key];
  if (!scenario) return;
  selected = key;
  token += 1;
  for (const [property, id] of Object.entries(fields)) {
    const element = document.getElementById(id);
    if (element) element.textContent = scenario[property];
  }
  document.getElementById('heroVerdict').textContent = scenario.heroVerdict;
  document.getElementById('heroScenario').textContent = scenario.heroScenario;
  document.getElementById('heroMeasure').textContent = scenario.measure;
  document.querySelectorAll('[data-scenario]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.scenario === key));
  });
  applyPalette(scenario.colors);
  if (scene) {
    scene.setPalette(scenario.colors);
    if (replay) scene.replay();
    else scene.render(performance.now());
  } else {
    stage.classList.add('settled');
  }
  if (announce) announcement.textContent = `${scenario.label}: ${scenario.title}. Decision: ${scenario.verdict}.`;
}

document.querySelectorAll('[data-scenario]').forEach((button) => {
  button.addEventListener('click', () => applyScenario(button.dataset.scenario));
});

mobile.addEventListener?.('change', () => {
  ensureRenderer();
  applyScenario(selected, { announce: false, replay: Boolean(scene) });
});

reduced.addEventListener?.('change', () => {
  if (reduced.matches) {
    scene?.stopLoop();
    if (scene) {
      scene.intro = 1;
      scene.render(performance.now());
    }
    stage.classList.add('settled');
  } else {
    ensureRenderer();
    scene?.replay();
  }
});

ensureRenderer();
applyScenario('ops', { announce: false, replay: false });
