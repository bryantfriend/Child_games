(function () {
  const app = window.ICTApp;
  const h = app.helpers;

  function openGame(type) {
    if (!app.state.checkIn.ready) {
      app.checkin.renderWelcome();
      h.showFeedback("Pick a face first.", "info");
      return;
    }
    if (type === "fun" && app.state.stars < 100) {
      h.showFeedback("Get 100 stars for Fun Zone!", "info");
      return;
    }
    app.state.currentGame = type;
    const meta = app.data.games[type];
    app.dom.panelTitle.textContent = meta.title;
    app.dom.panelSubtitle.textContent = `${meta.subtitle} Estimated time: ${meta.duration}.`;
    if (app.lessons[type]) app.lessons[type].start();
    else if (type === "fun") app.funGames.hub.start();
    h.showFeedback("New island mission!", "info");
    h.updateRenderHooks();
  }

  function triggerSilly(button) {
    app.state.sillyTaps += 1;
    button.classList.remove("silly-pop");
    void button.offsetWidth;
    button.classList.add("silly-pop");
    h.bumpStars(1);
    h.showFeedback(h.pickRandom(app.data.sillyMessages), "info");
    h.spawnConfetti(10, false);
  }

  document.querySelectorAll(".island-card").forEach((button) => button.addEventListener("click", () => openGame(button.dataset.game)));
  document.getElementById("sillyStar")?.addEventListener("click", (event) => triggerSilly(event.currentTarget));
  document.getElementById("sillyFish")?.addEventListener("click", (event) => triggerSilly(event.currentTarget));

  app.openGame = openGame;
  app.checkin.renderWelcome();
  h.updateScoreboard();
  h.updateRenderHooks();
})();
