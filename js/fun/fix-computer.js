(function () {
  const app = window.ICTApp;
  const h = app.helpers;

  const stages = [
    { prompt: "Tap the cracks first.", targets: ["🪟", "🪟", "⚡"] },
    { prompt: "Now stop the sparks.", targets: ["⚡", "⚡", "🔌"] },
    { prompt: "Last step. Wake the computer.", targets: ["🔘"] },
  ];

  function start() {
    h.clearFunTimers();
    app.state.fun = { ...app.state.fun, mode: "fix", timers: [], fixStage: 0, fixTargets: [...stages[0].targets] };
    render();
  }

  function render() {
    const stage = stages[app.state.fun.fixStage];
    app.dom.gameArea.innerHTML = `<div class="game-card">${h.getCardHeader('<span class="pill">Stage ' + (app.state.fun.fixStage + 1) + ' / ' + stages.length + '</span>', "backToFun", "⬅ Fun Zone")}${h.getMissionStrip("Fix Computer", stage.prompt, [{ label: "Fix all problems", done: false }])}<div class="arcade-board"><div class="arcade-stage"><div class="power-shell">${h.renderIcon({ asset: "assets/computer.svg", label: "Computer" }, "object-icon computer-svg-large")}${app.state.fun.fixTargets.map((item, index) => `<button class="repair-target repair-pulse" type="button" data-fix-index="${index}" style="left:${14 + index * 18}%;top:${18 + (index % 2) * 28}%;">${item}</button>`).join("")}</div></div></div></div>`;
    document.getElementById("backToFun")?.addEventListener("click", () => app.funGames.hub.start());
    app.dom.gameArea.querySelectorAll("[data-fix-index]").forEach((button) => button.addEventListener("click", () => handleFix(Number(button.dataset.fixIndex))));
  }

  function handleFix(index) {
    app.state.fun.fixTargets.splice(index, 1);
    h.bumpStars(1);
    if (app.state.fun.fixTargets.length === 0) {
      app.state.fun.fixStage += 1;
      if (app.state.fun.fixStage >= stages.length) {
        h.showFeedback("SYSTEM FIXED!", "success");
        h.spawnConfetti(30, false);
        return app.funGames.hub.start();
      }
      app.state.fun.fixTargets = [...stages[app.state.fun.fixStage].targets];
    } else h.showFeedback("Fix!", "success");
    render();
  }

  app.funGames.fix = { start, render };
})();
