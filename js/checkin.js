(function () {
  var app = window.ICTApp = window.ICTApp || {};
  var moodChoices = app.data.moodChoices;
  var emojiGameRounds = app.data.emojiGameRounds;
  var calmSteps = app.data.calmSteps;
  var h = app.helpers;

  function renderWelcome() {
    app.processAction('SET_GAME', { id: null });
    if (app.dom.panelTitle) app.dom.panelTitle.textContent = "Welcome, explorer!";
    
    var subtext = "";
    if (app.state.checkIn.path === "pick") subtext = "First, choose a face.";
    else if (app.state.checkIn.path === "emoji") subtext = "Face game time.";
    else if (app.state.checkIn.path === "mindful") subtext = "Calm body. Calm mind.";
    else subtext = "You are ready to start.";
    if (app.dom.panelSubtitle) app.dom.panelSubtitle.textContent = subtext;

    document.getElementById("game-overlay").style.display = "flex";
    h.setIslandAccess();

    if (app.state.checkIn.path === "pick") {
       var moodHtml = moodChoices.map(function(mood) {
         return '<button class="emoji-choice" type="button" data-mood="' + mood.id + '"><span class="emoji-face">' + mood.emoji + '</span><span>' + mood.label + '</span></button>';
       }).join("");
       app.dom.gameArea.innerHTML = '<div class="welcome-card"><div class="welcome-stack"><strong>😊</strong><h3>How are you?</h3><p class="hero-text">Tap the face that feels right.</p><div class="emoji-grid">' + moodHtml + '</div></div></div>';
       var moodBtns = app.dom.gameArea.querySelectorAll("[data-mood]");
       var i;
       for (i = 0; i < moodBtns.length; i++) {
         (function(btn) {
           btn.addEventListener("click", function() { handleMoodChoice(btn.dataset.mood); });
         })(moodBtns[i]);
       }
       return;
    }

    if (app.state.checkIn.path === "emoji") {
       var round = emojiGameRounds[app.state.checkIn.emojiRound];
       var mood = moodChoices.filter(function(m) { return m.id === app.state.checkIn.mood; })[0];
       var emojiHtml = h.shuffleArray(round.options.slice()).map(function(emoji) {
         return '<button class="emoji-choice emoji-target" type="button" data-emoji-game="' + emoji + '"><span class="emoji-face">' + emoji + '</span></button>';
       }).join("");
       app.dom.gameArea.innerHTML = '<div class="welcome-card"><div class="welcome-stack"><strong>' + (mood ? mood.emoji : "😄") + '</strong><h3>Emoji Game</h3><p class="hero-text">Tap this face: <span class="target-emoji">' + round.target + '</span></p><div class="emoji-grid mini-game-grid">' + emojiHtml + '</div><div class="lesson-plan"><div class="lesson-chip">Round ' + (app.state.checkIn.emojiRound + 1) + ' / ' + emojiGameRounds.length + '</div></div></div></div>';
       var emojiBtns = app.dom.gameArea.querySelectorAll("[data-emoji-game]");
       var j;
       for (j = 0; j < emojiBtns.length; j++) {
         (function(btn) {
           btn.addEventListener("click", function() { handleEmojiGame(btn.dataset.emojiGame); });
         })(emojiBtns[j]);
       }
       return;
    }

    if (app.state.checkIn.path === "mindful") {
       var step = calmSteps[app.state.checkIn.calmStep];
       app.dom.gameArea.innerHTML = '<div class="welcome-card calm-screen"><div class="welcome-stack"><strong>' + step.emoji + '</strong><h3>Calm Time</h3><p class="hero-text">' + step.title + '</p><div class="calm-guide-card"><svg viewBox="0 0 360 240" class="calm-guide-svg" aria-hidden="true"><defs><linearGradient id="calmSky" x1="0" x2="1"><stop offset="0%" stop-color="#d9f7ff"/><stop offset="100%" stop-color="#fff6d0"/></linearGradient></defs><rect x="20" y="20" width="320" height="200" rx="30" fill="url(#calmSky)"/><circle cx="94" cy="92" r="34" fill="#fff"/><circle cx="94" cy="92" r="18" fill="#ffd86b"/><path d="M176 72c18-24 48-24 66 0" fill="none" stroke="#4cc9f0" stroke-linecap="round" stroke-width="10"/><path d="M174 110c22 24 50 24 72 0" fill="none" stroke="#2ec27e" stroke-linecap="round" stroke-width="10"/><circle cx="184" cy="138" r="28" class="calm-orb calm-orb-one"/><circle cx="252" cy="138" r="28" class="calm-orb calm-orb-two"/><path d="M120 176q60 34 120 0" fill="none" stroke="#7cc27b" stroke-linecap="round" stroke-width="12"/></svg><div class="calm-steps"><div class="calm-step"><span class="calm-step-icon">👃</span><span>Smell flower</span></div><div class="calm-step"><span class="calm-step-icon">🫧</span><span>Slow breath</span></div><div class="calm-step"><span class="calm-step-icon">🕯️</span><span>Blow candle</span></div></div></div><p class="question-text calm-text">' + step.text + '</p><button class="big-choice input-choice calm-button" type="button" id="calmNextBtn">Done</button><div class="lesson-plan"><div class="lesson-chip">Step ' + (app.state.checkIn.calmStep + 1) + ' / ' + calmSteps.length + '</div></div></div></div>';
       var nextBtn = document.getElementById("calmNextBtn");
       if (nextBtn) nextBtn.addEventListener("click", handleCalmStep);
       return;
    }

    app.dom.gameArea.innerHTML = '<div class="welcome-card"><div class="welcome-stack"><strong>🌴</strong><h3>You are ready!</h3><p class="hero-text">Now choose Lesson 1, Lesson 2, or Games.</p><div class="lesson-plan"><div class="lesson-chip">Lesson 1</div><div class="lesson-chip">Lesson 2</div><div class="lesson-chip">Games</div></div><button class="big-choice output-choice calm-button" type="button" id="startLessonBtn">Choose Lesson</button></div></div>';
    var startBtn = document.getElementById("startLessonBtn");
    if (startBtn) {
      startBtn.addEventListener("click", function() {
        if (app.renderMainMenu) app.renderMainMenu();
        else {
          document.getElementById("game-overlay").style.display = "none";
          h.showFeedback("Pick a lesson to play!", "success");
        }
      });
    }
  }

  function handleMoodChoice(moodId) {
    var mood = moodChoices.filter(function(m) { return m.id === moodId; })[0];
    app.processAction('UPDATE_CHECKIN', { mood: mood.id, emojiRound: 0, calmStep: 0, path: mood.path });
    h.showFeedback(mood.path === "emoji" ? "Let’s play a face game!" : "Let’s get calm first.", "info");
    renderWelcome();
  }

  function handleEmojiGame(choice) {
    var round = emojiGameRounds[app.state.checkIn.emojiRound];
    if (choice !== round.target) {
      h.showFeedback("Try again!", "error");
      return;
    }
    app.processAction('BUMP_STARS', { amount: 1 });
    h.showFeedback("Yes! Nice face!", "success");
    var nextRound = app.state.checkIn.emojiRound + 1;
    if (nextRound >= emojiGameRounds.length) {
      app.processAction('UPDATE_CHECKIN', { path: "done", ready: true });
      h.spawnConfetti(28, false);
      h.showFeedback("You are ready to learn!", "success");
    } else {
      app.processAction('UPDATE_CHECKIN', { emojiRound: nextRound });
    }
    renderWelcome();
  }

  function handleCalmStep() {
    app.processAction('BUMP_STARS', { amount: 1 });
    h.showFeedback("Good calm job.", "success");
    var nextStep = app.state.checkIn.calmStep + 1;
    if (nextStep >= calmSteps.length) {
      app.processAction('UPDATE_CHECKIN', { path: "done", ready: true });
      h.spawnConfetti(20, false);
      h.showFeedback("Now you are ready.", "success");
    } else {
      app.processAction('UPDATE_CHECKIN', { calmStep: nextStep });
    }
    renderWelcome();
  }

  app.checkin.renderWelcome = renderWelcome;
})();
