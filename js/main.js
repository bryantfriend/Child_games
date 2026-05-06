(function () {
  var app = window.ICTApp = window.ICTApp || {};
  var h = app.helpers;
  var bootStarted = false;

  function hasUnlockedGamesMenu() {
    var done = app.state.completed || [];
    var lesson1Done = ["build", "input", "output", "challenge"].every(function(id) {
      return done.indexOf(id) !== -1;
    });
    var lesson2Done = done.indexOf("onoff") !== -1;
    return lesson1Done || lesson2Done;
  }

  function openGame(type, options) {
    var opts = options || {};
    if (!app.state.checkIn.ready) {
      if (app.checkin && app.checkin.renderWelcome) app.checkin.renderWelcome();
      h.showFeedback("Pick a face first.", "info");
      return;
    }
    if (type === "fun" && !hasUnlockedGamesMenu()) {
      h.showFeedback("Finish a lesson first to open Games.", "info");
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
      var gamesUnlocked = hasUnlockedGamesMenu();
      var gamesCard = app.data.lessonMenu.filter(function(item) {
        return item.id === "games";
      }).map(function(item) {
        if (gamesUnlocked) {
          return '<button class="lesson-menu-card lesson-menu-card-games" type="button" data-menu-choice="' + item.id + '">' +
            '<span class="lesson-menu-emoji">' + item.emoji + '</span>' +
            '<strong>' + item.title + '</strong>' +
            '<span>' + item.subtitle + '</span>' +
            '</button>';
        }
        return '<button class="lesson-menu-card lesson-menu-card-games lesson-menu-card-locked" type="button" disabled aria-disabled="true">' +
          '<span class="lesson-menu-emoji">🔒</span>' +
          '<strong>' + item.title + '</strong>' +
          '<span>Finish one lesson first</span>' +
          '</button>';
      }).join("");
      var units = app.data.unitMenu.map(function(unit) {
        var lessons = unit.lessons.map(function(lesson) {
          if (lesson.active) {
            return '<button class="course-lesson-card" type="button" data-menu-choice="' + lesson.id + '">' +
              '<span class="course-lesson-badge">Lesson ' + lesson.number + '</span>' +
              '<span class="course-lesson-icon">' + lesson.emoji + '</span>' +
              '<strong>' + lesson.title + '</strong>' +
              '<span>' + lesson.subtitle + '</span>' +
              '</button>';
          }
          return '<div class="course-lesson-card is-locked" aria-disabled="true">' +
            '<span class="course-lesson-badge">Lesson ' + lesson.number + '</span>' +
            '<span class="course-lesson-icon course-lesson-silhouette">★</span>' +
            '<strong>' + lesson.title + '</strong>' +
            '<span>Coming Soon</span>' +
            '</div>';
        }).join("");
        return '<section class="course-unit-card unit-' + unit.color + '">' +
          '<div class="course-unit-header">' +
          '<div class="course-unit-title-wrap">' +
          '<span class="course-unit-icon">' + unit.emoji + '</span>' +
          '<div><h4>' + unit.title + '</h4><p>' + unit.range + '</p></div>' +
          '</div>' +
          '<span class="course-unit-pill">' + unit.lessons.length + ' lessons</span>' +
          '</div>' +
          '<div class="course-lesson-grid">' + lessons + '</div>' +
          '</section>';
      }).join("");
      app.dom.gameArea.innerHTML = '<div class="welcome-card menu-card-screen"><div class="menu-card-decor menu-card-decor-left" aria-hidden="true">🌴</div><div class="menu-card-decor menu-card-decor-right" aria-hidden="true">⭐</div><div class="menu-card-decor menu-card-decor-bottom" aria-hidden="true">🐬</div><div class="menu-card-wave" aria-hidden="true"></div><div class="welcome-stack menu-card-stack course-menu-stack"><strong>🚀</strong><h3>Choose a lesson</h3><p class="hero-text">Pick a unit, open a lesson, or jump into the games. More lessons are coming soon.</p><div class="lesson-menu-grid lesson-menu-grid-single">' + gamesCard + '</div><div class="course-unit-list">' + units + '</div></div></div>';
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
            if (!hasUnlockedGamesMenu()) {
              h.showFeedback("Finish a lesson first to open Games.", "info");
              return;
            }
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

  function setLoadingMessage(text) {
    var label = document.getElementById("appLoadingText");
    if (label) label.textContent = text;
  }

  function preloadImage(src) {
    return new Promise(function(resolve) {
      var img = new Image();
      var done = function() { resolve(); };
      img.onload = done;
      img.onerror = done;
      img.src = src;
    });
  }

  function preloadVideo(src) {
    return new Promise(function(resolve) {
      var video = document.createElement("video");
      var finished = false;
      var done = function() {
        if (finished) return;
        finished = true;
        resolve();
      };
      video.preload = "metadata";
      video.muted = true;
      video.addEventListener("loadedmetadata", done, { once: true });
      video.addEventListener("canplay", done, { once: true });
      video.addEventListener("error", done, { once: true });
      setTimeout(done, 5000);
      video.src = src;
    });
  }

  function finishBoot() {
    document.body.classList.remove("app-loading");
    if (app.checkin && app.checkin.renderWelcome) app.checkin.renderWelcome();
    h.updateScoreboard();
    h.updateRenderHooks();
  }

  function startBoot() {
    if (bootStarted) return;
    bootStarted = true;
    setLoadingMessage("Loading the map and welcome video...");
    Promise.all([
      preloadImage("map-bg.png"),
      preloadImage("assets/logo.png"),
      preloadImage("assets/computer.svg"),
      preloadImage("assets/monitor.svg"),
      preloadImage("assets/keyboard.svg"),
      preloadImage("assets/mouse.svg"),
      preloadVideo("assets/ICT_Video_Revision_for_nd_Graders.mp4")
    ]).then(function() {
      setLoadingMessage("Ready to start!");
      setTimeout(finishBoot, 250);
    });
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

  startBoot();
})();
