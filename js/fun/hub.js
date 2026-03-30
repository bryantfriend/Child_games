(function () {
  const app = window.ICTApp;
  const h = app.helpers;

  function start() {
    h.clearFunTimers();
    app.state.fun = { mode: "hub", timers: [] };
    render();
  }

  function render() {
    app.dom.gameArea.innerHTML = `<div class="game-card">${h.getCardHeader('<span class="pill">Unlocked at 100 stars</span><span class="pill">Bonus play</span>')}${h.getMissionStrip("Fun Zone", "Pick any bonus game and play for fun.", [{ label: "Mouse Chase", done: false }, { label: "Keyboard Smash", done: false }, { label: "Fix Computer", done: false }, { label: "Screen Defender", done: false }, { label: "Power Up", done: false }])}<div class="fun-hub"><button class="fun-button" type="button" data-fun-game="mouse">🖱️ Mouse Chase</button><button class="fun-button" type="button" data-fun-game="keyboard">⌨️ Keyboard Smash</button><button class="fun-button" type="button" data-fun-game="fix">🛠️ Fix Computer</button><button class="fun-button" type="button" data-fun-game="screen">🦠 Screen Defender</button><button class="fun-button" type="button" data-fun-game="power">⚡ Power Up</button></div></div>`;
    h.bindBackToMap();
    app.dom.gameArea.querySelectorAll("[data-fun-game]").forEach((button) => button.addEventListener("click", () => app.funGames[button.dataset.funGame].start()));
  }

  app.funGames.hub = { start, render };
})();
