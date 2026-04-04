(function () {
  var app = window.ICTApp = window.ICTApp || {};
  var h = app.helpers;

  function openGame(type, options) {
    var opts = options || {};
    if (!app.state.checkIn.ready) {
      if (app.checkin && app.checkin.renderWelcome) app.checkin.renderWelcome();
      h.showFeedback("Pick a face first.", "info");
      return;
    }
    if (type === "fun" && app.state.stars < 100 && !app.state.freePlay && !opts.forceGames) {
      h.showFeedback("Get 100 stars for Fun Zone!", "info");
      return;
    }
    
    app.processAction('SET_GAME', { id: type });
    
    var meta = app.data.games[type];
    if (app.dom.panelTitle) app.dom.panelTitle.textContent = meta.title;
    if (app.dom.panelSubtitle) app.dom.panelSubtitle.textContent = meta.subtitle + " Estimated time: " + meta.duration + ".";
    
    document.getElementById("game-overlay").style.display = "flex";

    if (app.lessons[type]) {
      app.lessons[type].start();
    } else if (type === "fun") {
      if (app.funGames && app.funGames.hub) app.funGames.hub.start();
    }
    
    h.showFeedback("New island mission!", "info");
    h.updateRenderHooks();
  }

  function renderMainMenu() {
    if (!app.state.checkIn.ready) {
      if (app.checkin && app.checkin.renderWelcome) app.checkin.renderWelcome();
      return;
    }
    app.processAction('SET_GAME', { id: null });
    document.getElementById("game-overlay").style.display = "flex";
    if (app.dom.panelTitle) app.dom.panelTitle.textContent = "Pick Your Adventure";
    if (app.dom.panelSubtitle) app.dom.panelSubtitle.textContent = "Choose Lesson 1, Lesson 2, or jump into the games.";
    var cards = app.data.lessonMenu.map(function(item) {
      return '<button class="lesson-menu-card" type="button" data-menu-choice="' + item.id + '">' +
        '<span class="lesson-menu-emoji">' + item.emoji + '</span>' +
        '<strong>' + item.title + '</strong>' +
        '<span>' + item.subtitle + '</span>' +
        '</button>';
    }).join("");
    app.dom.gameArea.innerHTML = '<div class="welcome-card menu-card-screen"><div class="welcome-stack"><strong>🚀</strong><h3>Choose a lesson</h3><p class="hero-text">Lesson 1 is the island lesson. Lesson 2 is turning a computer on and off. Games are for free play.</p><div class="lesson-menu-grid">' + cards + '</div></div></div>';
    bindMenuChoices();
  }

  function bindMenuChoices() {
    var buttons = app.dom.gameArea.querySelectorAll("[data-menu-choice]");
    var i;
    for (i = 0; i < buttons.length; i++) {
      (function(btn) {
        btn.addEventListener("click", function() {
          var choice = btn.dataset.menuChoice;
          if (choice === "lesson1") showLessonMap();
          else if (choice === "lesson2") openGame("onoff");
          else if (choice === "games") {
            app.processAction('SET_FREE_PLAY', { value: true });
            openGame("fun", { forceGames: true });
          }
        });
      })(buttons[i]);
    }
  }

  function showLessonMap() {
    app.processAction('SET_GAME', { id: null });
    document.getElementById("game-overlay").style.display = "none";
    h.showFeedback("Pick an island for Lesson 1!", "success");
  }

  function triggerSilly(button) {
    app.processAction('SILLY_TAP', {});
    button.classList.remove("silly-pop");
    void button.offsetWidth;
    button.classList.add("silly-pop");
    h.showFeedback(h.pickRandom(app.data.sillyMessages), "info");
    h.spawnConfetti(10, false);
  }

  var buttons = document.querySelectorAll(".island-card");
  var i;
  for (i = 0; i < buttons.length; i++) {
    (function(btn) {
      btn.addEventListener("click", function() { openGame(btn.dataset.game); });
    })(buttons[i]);
  }

  var sillyStar = document.getElementById("sillyStar");
  if (sillyStar) {
    sillyStar.addEventListener("click", function(event) { triggerSilly(event.currentTarget); });
  }

  var sillyFish = document.getElementById("sillyFish");
  if (sillyFish) {
    sillyFish.addEventListener("click", function(event) { triggerSilly(event.currentTarget); });
  }

  app.openGame = openGame;
  app.renderMainMenu = renderMainMenu;
  app.showLessonMap = showLessonMap;

  var menuHomeBtn = document.getElementById("menuHomeBtn");
  if (menuHomeBtn) menuHomeBtn.addEventListener("click", renderMainMenu);

  if (app.checkin && app.checkin.renderWelcome) app.checkin.renderWelcome();
  h.updateScoreboard();
  h.updateRenderHooks();
})();
