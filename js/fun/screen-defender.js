(function () {
  const app = window.ICTApp;
  const h = app.helpers;

  function makeBug(index) {
    return { id: `bug-${index}`, x: 6 + (index % 4) * 22, y: 8 + Math.floor(index / 4) * 24, vx: index % 2 === 0 ? 1.2 : -1, vy: index % 3 === 0 ? 0.9 : -1.1 };
  }

  function start() {
    h.clearFunTimers();
    app.state.fun = { ...app.state.fun, mode: "screen", timers: [], bugs: Array.from({ length: 8 }, (_, index) => makeBug(index)), screenTime: 15 };
    h.addFunTimer(setInterval(tick, 90), "interval");
    h.addFunTimer(setInterval(() => {
      app.state.fun.screenTime -= 1;
      if (app.state.fun.screenTime <= 0 && app.state.fun.bugs.length > 0) return finish(false);
      syncPositions();
    }, 1000), "interval");
    render();
  }

  function tick() {
    app.state.fun.bugs.forEach((bug) => {
      bug.x += bug.vx;
      bug.y += bug.vy;
      if (bug.x < 4 || bug.x > 88) bug.vx *= -1;
      if (bug.y < 4 || bug.y > 76) bug.vy *= -1;
    });
    syncPositions();
  }

  function syncPositions() {
    app.state.fun.bugs.forEach((bug) => {
      const node = document.querySelector(`[data-bug-id="${bug.id}"]`);
      if (node) {
        node.style.left = `${bug.x}%`;
        node.style.top = `${bug.y}%`;
      }
    });
    const time = document.getElementById("screenTimeChip");
    if (time) time.textContent = `Time ${app.state.fun.screenTime}`;
  }

  function finish(win) {
    h.clearFunTimers();
    h.showFeedback(win ? "Clean screen!" : "Bugs win!", win ? "success" : "error");
    if (win) h.spawnConfetti(28, false);
    app.funGames.hub.start();
  }

  function render() {
    app.dom.gameArea.innerHTML = `<div class="game-card">${h.getCardHeader('<span class="pill" id="screenTimeChip">Time ' + app.state.fun.screenTime + '</span><span class="pill">Bugs ' + app.state.fun.bugs.length + '</span>', "backToFun", "⬅ Fun Zone")}${h.getMissionStrip("Screen Defender", "Bugs crawl around. Clean the screen in time.", [{ label: "Clear them all in 15 seconds", done: false }])}<div class="arcade-board"><div class="arcade-stage">${app.state.fun.bugs.map((bug) => `<button class="bug-target" type="button" data-bug-id="${bug.id}" style="left:${bug.x}%;top:${bug.y}%;">🦠</button>`).join("")}</div></div></div>`;
    document.getElementById("backToFun")?.addEventListener("click", () => app.funGames.hub.start());
    app.dom.gameArea.querySelectorAll("[data-bug-id]").forEach((button) => button.addEventListener("click", () => {
      app.state.fun.bugs = app.state.fun.bugs.filter((bug) => bug.id !== button.dataset.bugId);
      h.bumpStars(1);
      if (app.state.fun.bugs.length === 0) return finish(true);
      h.showFeedback("Bug gone!", "success");
      render();
    }));
  }

  app.funGames.screen = { start, render };
})();
