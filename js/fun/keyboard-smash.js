(function () {
  const app = window.ICTApp;
  const h = app.helpers;
  const vowels = new Set(["A", "E", "I", "O", "U"]);

  function start() {
    h.clearFunTimers();
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").slice(0, 12).map((letter, index) => ({
      id: `letter-${index}`,
      letter,
      x: 10 + (index % 4) * 20,
      y: 8 + Math.floor(index / 4) * 24,
      vx: index % 2 === 0 ? 1.4 : -1.2,
      vy: index % 3 === 0 ? 1.1 : -1.3,
    }));
    app.state.fun = { ...app.state.fun, mode: "keyboard", timers: [], letters, vowelMode: Math.random() > 0.5, smashScore: 0 };
    h.addFunTimer(setInterval(tick, 90), "interval");
    render();
  }

  function tick() {
    app.state.fun.letters.forEach((token) => {
      token.x += token.vx;
      token.y += token.vy;
      if (token.x < 4 || token.x > 86) token.vx *= -1;
      if (token.y < 4 || token.y > 72) token.vy *= -1;
    });
    syncPositions();
  }

  function syncPositions() {
    app.state.fun.letters.forEach((token) => {
      const node = document.querySelector(`[data-letter-id="${token.id}"]`);
      if (node) {
        node.style.left = `${token.x}%`;
        node.style.top = `${token.y}%`;
      }
    });
  }

  function render() {
    app.dom.gameArea.innerHTML = `<div class="game-card">${h.getCardHeader('<span class="pill">Score ' + app.state.fun.smashScore + '</span><span class="pill">' + (app.state.fun.vowelMode ? 'Tap ONLY vowels' : 'Tap them all') + '</span>', "backToFun", "⬅ Fun Zone")}${h.getMissionStrip("Keyboard Smash", "Letters bounce everywhere. Pop them fast.", [{ label: "Clear the board", done: false }])}<div class="arcade-board"><div class="arcade-stage">${app.state.fun.letters.map((token) => `<button class="arcade-token keyboard-token" type="button" data-letter-id="${token.id}" data-letter="${token.letter}" style="left:${token.x}%;top:${token.y}%;">${token.letter}</button>`).join("")}</div></div></div>`;
    document.getElementById("backToFun")?.addEventListener("click", () => app.funGames.hub.start());
    app.dom.gameArea.querySelectorAll("[data-letter-id]").forEach((button) => button.addEventListener("click", () => hitLetter(button.dataset.letterId, button.dataset.letter)));
  }

  function hitLetter(id, letter) {
    const good = !app.state.fun.vowelMode || vowels.has(letter);
    app.state.fun.letters = app.state.fun.letters.filter((token) => token.id !== id);
    if (good) {
      app.state.fun.smashScore += 1;
      h.bumpStars(1);
      h.showFeedback("Smash!", "success");
    } else {
      h.showFeedback("Not a vowel!", "error");
    }
    if (app.state.fun.letters.length === 0) {
      h.clearFunTimers();
      h.spawnConfetti(24, false);
      app.funGames.hub.start();
    } else render();
  }

  app.funGames.keyboard = { start, render };
})();
