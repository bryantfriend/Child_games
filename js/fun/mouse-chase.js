(function () {
  const app = window.ICTApp;
  const h = app.helpers;

  function randomPos() {
    return { x: 8 + Math.random() * 78, y: 10 + Math.random() * 68 };
  }

  function start() {
    h.clearFunTimers();
    app.state.fun = { ...app.state.fun, mode: "mouse", timers: [], mouseScore: 0, mouseTime: 20, mousePos: randomPos(), cheesePos: randomPos(), cheeseVisible: false };
    h.addFunTimer(setInterval(() => {
      app.state.fun.mouseTime -= 1;
      app.state.fun.mousePos = randomPos();
      if (Math.random() > 0.6) {
        app.state.fun.cheeseVisible = true;
        app.state.fun.cheesePos = randomPos();
      }
      if (app.state.fun.mouseTime <= 0) return finish(false);
      render();
    }, 700), "interval");
    render();
  }

  function finish(win) {
    h.clearFunTimers();
    h.showFeedback(win ? "Mouse caught!" : "Mouse got away!", win ? "success" : "error");
    if (win) h.spawnConfetti(26, false);
    app.funGames.hub.start();
  }

  function render() {
    app.dom.gameArea.innerHTML = `<div class="game-card">${h.getCardHeader('<span class="pill">Time ' + app.state.fun.mouseTime + '</span><span class="pill">Catches ' + app.state.fun.mouseScore + ' / 8</span>', "backToFun", "⬅ Fun Zone")}${h.getMissionStrip("Mouse Chase", "Catch the fast mouse. Cheese is bonus.", [{ label: "Catch 8 mice", done: false }])}<div class="arcade-board"><div class="arcade-stage"><button class="arcade-target mouse-runner" type="button" id="mouseTarget" style="left:${app.state.fun.mousePos.x}%;top:${app.state.fun.mousePos.y}%;">🐭</button>${app.state.fun.cheeseVisible ? `<button class="arcade-target" type="button" id="cheeseTarget" style="left:${app.state.fun.cheesePos.x}%;top:${app.state.fun.cheesePos.y}%;">🧀</button>` : ""}</div></div></div>`;
    document.getElementById("backToFun")?.addEventListener("click", () => app.funGames.hub.start());
    document.getElementById("mouseTarget")?.addEventListener("click", () => {
      app.state.fun.mouseScore += 1;
      h.bumpStars(1);
      app.state.fun.mousePos = randomPos();
      if (app.state.fun.mouseScore >= 8) return finish(true);
      h.showFeedback("Got it!", "success");
      render();
    });
    document.getElementById("cheeseTarget")?.addEventListener("click", () => {
      app.state.fun.cheeseVisible = false;
      h.bumpStars(2);
      h.showFeedback("Cheese bonus!", "success");
      render();
    });
  }

  app.funGames.mouse = { start, render };
})();
