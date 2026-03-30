(function () {
  const app = window.ICTApp;
  const h = app.helpers;

  function start() {
    h.clearFunTimers();
    app.state.fun = { ...app.state.fun, mode: "power", timers: [], power: 20, boostVisible: false };
    h.addFunTimer(setInterval(() => {
      app.state.fun.power = Math.max(0, app.state.fun.power - 4);
      if (Math.random() > 0.72) app.state.fun.boostVisible = !app.state.fun.boostVisible;
      if (app.state.fun.power >= 100) return finish();
      render();
    }, 260), "interval");
    render();
  }

  function finish() {
    h.clearFunTimers();
    h.showFeedback("POWER FULL!", "success");
    h.spawnConfetti(30, false);
    app.funGames.hub.start();
  }

  function render() {
    app.dom.gameArea.innerHTML = `<div class="game-card">${h.getCardHeader('<span class="pill">Power ' + app.state.fun.power + '%</span>', "backToFun", "⬅ Fun Zone")}${h.getMissionStrip("Power Up", "Tap fast while the battery drains.", [{ label: "Fill the bar to 100", done: false }])}<div class="arcade-board"><div class="power-shell"><div class="object-icon">🔋</div><div class="power-bar"><div class="power-fill" style="width:${Math.min(app.state.fun.power, 100)}%;"></div></div><button class="big-choice input-choice calm-button" type="button" id="powerTapBtn">TAP FAST ⚡</button>${app.state.fun.boostVisible ? '<button class="fun-button" type="button" id="boostBtn">⚡ BONUS BOOST ⚡</button>' : ""}</div></div></div>`;
    document.getElementById("backToFun")?.addEventListener("click", () => app.funGames.hub.start());
    document.getElementById("powerTapBtn")?.addEventListener("click", () => {
      app.state.fun.power = Math.min(100, app.state.fun.power + 10);
      h.bumpStars(1);
      if (app.state.fun.power >= 100) return finish();
      h.showFeedback("Charge!", "success");
      render();
    });
    document.getElementById("boostBtn")?.addEventListener("click", () => {
      app.state.fun.power = Math.min(100, app.state.fun.power + 18);
      app.state.fun.boostVisible = false;
      h.bumpStars(2);
      if (app.state.fun.power >= 100) return finish();
      h.showFeedback("Boost!", "success");
      render();
    });
  }

  app.funGames.power = { start, render };
})();
