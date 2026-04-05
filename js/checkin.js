(function () {
  var app = window.ICTApp = window.ICTApp || {};
  var moodChoices = app.data.moodChoices;
  var emojiGameRounds = app.data.emojiGameRounds;
  var calmSteps = app.data.calmSteps;
  var h = app.helpers;
  var introDelay = null;

  function renderCalmVisual(step, stepIndex) {
    if (step.id === "flower") {
      return '<div class="calm-scene calm-scene-flower"><svg viewBox="0 0 420 280" class="calm-guide-svg" aria-hidden="true"><rect x="20" y="18" width="380" height="244" rx="34" fill="#eef9ff"/><circle cx="96" cy="78" r="24" fill="#ffd86b"/><g class="calm-cloud"><circle cx="323" cy="72" r="20" fill="#ffffff"/><circle cx="346" cy="66" r="25" fill="#ffffff"/><circle cx="370" cy="74" r="18" fill="#ffffff"/></g><g class="calm-kid-head"><circle cx="208" cy="110" r="34" fill="#ffd7b1"/><path d="M178 108c8-24 54-31 74 0" fill="#6d4c41"/><circle cx="194" cy="114" r="4" fill="#31445f"/><circle cx="222" cy="114" r="4" fill="#31445f"/><path d="M198 127q10 8 20 0" fill="none" stroke="#31445f" stroke-width="4" stroke-linecap="round"/></g><path d="M183 145h50v54h-50z" fill="#74d7ff" rx="18"/><path d="M183 162l-22 36" fill="none" stroke="#ffd7b1" stroke-width="14" stroke-linecap="round"/><path d="M233 162l25 38" fill="none" stroke="#ffd7b1" stroke-width="14" stroke-linecap="round"/><g class="calm-flower-bob"><circle cx="130" cy="180" r="18" fill="#ffda57"/><circle cx="130" cy="153" r="16" fill="#ff7eb6"/><circle cx="156" cy="180" r="16" fill="#ff7eb6"/><circle cx="130" cy="207" r="16" fill="#ff7eb6"/><circle cx="104" cy="180" r="16" fill="#ff7eb6"/><circle cx="149" cy="199" r="16" fill="#ff9dc8"/><circle cx="111" cy="199" r="16" fill="#ff9dc8"/><path d="M130 198v36" stroke="#47b56a" stroke-width="8" stroke-linecap="round"/><path d="M130 217c18-6 22-20 32-16" fill="none" stroke="#47b56a" stroke-width="8" stroke-linecap="round"/></g><g class="calm-arrow-flow"><path d="M150 168c18-18 32-24 48-22" fill="none" stroke="#57c6ff" stroke-width="8" stroke-linecap="round" stroke-dasharray="12 12"/><path d="M193 132l15 5-10 12" fill="none" stroke="#57c6ff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></g></svg><div class="calm-caption-badge">Smell in</div></div>';
    }

    if (step.id === "candle") {
      return '<div class="calm-scene calm-scene-candle"><svg viewBox="0 0 420 280" class="calm-guide-svg" aria-hidden="true"><rect x="20" y="18" width="380" height="244" rx="34" fill="#fff8eb"/><circle cx="334" cy="78" r="23" fill="#ffd86b"/><g class="calm-kid-head"><circle cx="152" cy="116" r="34" fill="#ffd7b1"/><path d="M122 109c8-20 58-30 76 4" fill="#6d4c41"/><circle cx="140" cy="117" r="4" fill="#31445f"/><circle cx="166" cy="117" r="4" fill="#31445f"/><circle cx="184" cy="126" r="6" fill="#31445f"/></g><path d="M128 146h52v56h-52z" fill="#8cd9ff" rx="18"/><path d="M178 163l34 16" fill="none" stroke="#ffd7b1" stroke-width="14" stroke-linecap="round"/><g class="calm-candle"><rect x="277" y="136" width="36" height="82" rx="10" fill="#8cd9ff"/><rect x="286" y="126" width="8" height="18" rx="4" fill="#31445f"/><path class="calm-flame" d="M290 96c-12 12-16 26 0 38 16-12 12-26 0-38z" fill="#ff9f43"/><path class="calm-flame-inner" d="M290 107c-6 6-8 14 0 22 8-8 6-16 0-22z" fill="#fff3a6"/></g><g class="calm-arrow-flow calm-arrow-out"><path d="M202 129c22 0 38 2 56 12" fill="none" stroke="#57c6ff" stroke-width="8" stroke-linecap="round" stroke-dasharray="12 12"/><path d="M248 130l16 8-13 8" fill="none" stroke="#57c6ff" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></g></svg><div class="calm-caption-badge">Blow out</div></div>';
    }

    if (step.id === "stretch") {
      return '<div class="calm-scene calm-scene-stretch"><svg viewBox="0 0 420 280" class="calm-guide-svg" aria-hidden="true"><rect x="20" y="18" width="380" height="244" rx="34" fill="#eefcf2"/><circle cx="92" cy="74" r="22" fill="#ffd86b"/><path d="M88 44l8 14M66 66l15 4M108 66l-15 4" stroke="#ffd86b" stroke-width="6" stroke-linecap="round"/><circle cx="210" cy="96" r="34" fill="#ffd7b1"/><path d="M180 92c12-22 60-26 72 6" fill="#6d4c41"/><circle cx="198" cy="100" r="4" fill="#31445f"/><circle cx="222" cy="100" r="4" fill="#31445f"/><path d="M199 114q11 7 22 0" fill="none" stroke="#31445f" stroke-width="4" stroke-linecap="round"/><path d="M184 131h52v74h-52z" fill="#7ee0b0" rx="20"/><path class="calm-stretch-arm-left" d="M184 143l-38-54" fill="none" stroke="#ffd7b1" stroke-width="14" stroke-linecap="round"/><path class="calm-stretch-arm-right" d="M236 143l38-54" fill="none" stroke="#ffd7b1" stroke-width="14" stroke-linecap="round"/><path d="M197 205l-18 42" fill="none" stroke="#4d7de0" stroke-width="14" stroke-linecap="round"/><path d="M223 205l18 42" fill="none" stroke="#4d7de0" stroke-width="14" stroke-linecap="round"/><g class="calm-sparkle"><path d="M126 118l0 18M117 127l18 0" stroke="#57c6ff" stroke-width="6" stroke-linecap="round"/></g><g class="calm-sparkle calm-sparkle-two"><path d="M302 120l0 18M293 129l18 0" stroke="#57c6ff" stroke-width="6" stroke-linecap="round"/></g></svg><div class="calm-caption-badge">Reach up</div></div>';
    }

    return '<div class="calm-scene calm-scene-shake"><svg viewBox="0 0 420 280" class="calm-guide-svg" aria-hidden="true"><rect x="20" y="18" width="380" height="244" rx="34" fill="#fff4fb"/><circle cx="210" cy="100" r="34" fill="#ffd7b1"/><path d="M180 96c10-20 58-28 74 4" fill="#6d4c41"/><circle cx="196" cy="104" r="4" fill="#31445f"/><circle cx="220" cy="104" r="4" fill="#31445f"/><path d="M198 118q12 9 24 0" fill="none" stroke="#31445f" stroke-width="4" stroke-linecap="round"/><path d="M184 134h52v72h-52z" fill="#ffb2cc" rx="20"/><path class="calm-shake-arm-left" d="M184 148l-36 28" fill="none" stroke="#ffd7b1" stroke-width="14" stroke-linecap="round"/><path class="calm-shake-arm-right" d="M236 148l36 28" fill="none" stroke="#ffd7b1" stroke-width="14" stroke-linecap="round"/><path d="M198 205l-18 42" fill="none" stroke="#7d8cff" stroke-width="14" stroke-linecap="round"/><path d="M222 205l18 42" fill="none" stroke="#7d8cff" stroke-width="14" stroke-linecap="round"/><g class="calm-wiggle-lines"><path d="M120 138q12 10 0 20" fill="none" stroke="#57c6ff" stroke-width="7" stroke-linecap="round"/><path d="M304 138q12 10 0 20" fill="none" stroke="#57c6ff" stroke-width="7" stroke-linecap="round"/><path d="M154 82q10 10 0 20" fill="none" stroke="#ff8fb5" stroke-width="7" stroke-linecap="round"/><path d="M266 82q10 10 0 20" fill="none" stroke="#ff8fb5" stroke-width="7" stroke-linecap="round"/></g></svg><div class="calm-caption-badge">Shake small</div></div>';
  }

  function renderCalmPrompts(step, stepIndex) {
    var prompts = {
      flower: ["1. Put your hand on your tummy.", "2. Smell the flower.", "3. Breathe in slow."],
      candle: ["1. Keep shoulders soft.", "2. Blow the candle.", "3. Breathe out slow."],
      stretch: ["1. Stand or sit tall.", "2. Reach both hands up.", "3. Hold for one slow breath."],
      shake: ["1. Wiggle fingers.", "2. Shake shoulders softly.", "3. Let bad feelings go."],
    };
    var list = prompts[step.id] || [];
    return list.map(function(item) {
      return '<div class="calm-prompt">' + item + '</div>';
    }).join("");
  }

  function renderWelcome() {
    app.processAction('SET_GAME', { id: null });
    if (app.dom.panelTitle) app.dom.panelTitle.textContent = "Welcome, explorer!";
    
    var subtext = "";
    if (app.state.checkIn.path === "start") subtext = "Press start to begin.";
    else if (app.state.checkIn.path === "video") subtext = "Watch the welcome video.";
    else if (app.state.checkIn.path === "pick") subtext = "First, choose a face.";
    else if (app.state.checkIn.path === "emoji") subtext = "Face game time.";
    else if (app.state.checkIn.path === "mindful") subtext = "Calm body. Calm mind.";
    else subtext = "You are ready to start.";
    if (app.dom.panelSubtitle) app.dom.panelSubtitle.textContent = subtext;

    document.getElementById("game-overlay").style.display = "flex";
    h.setIslandAccess();
    if (introDelay) {
      clearTimeout(introDelay);
      introDelay = null;
    }

    if (app.state.checkIn.path === "start") {
       app.dom.gameArea.innerHTML = '<div class="welcome-card intro-screen"><div class="intro-panel intro-panel-start"><div class="intro-floating intro-floating-left" aria-hidden="true">🌴</div><div class="intro-floating intro-floating-right" aria-hidden="true">⭐</div><div class="intro-rainbow" aria-hidden="true"></div><div class="welcome-stack intro-stack"><div class="intro-badge">Welcome to ICT Adventure Island</div><strong class="intro-emoji">🚀</strong><h3>Ready to start?</h3><p class="hero-text">Tap start to watch the welcome video.</p><button class="big-choice ready-button intro-start-button" type="button" id="introStartBtn">Start</button></div></div></div>';
       var introBtn = document.getElementById("introStartBtn");
       if (introBtn) {
         introBtn.addEventListener("click", function() {
           app.processAction('UPDATE_CHECKIN', { path: "video" });
           renderWelcome();
         });
       }
       return;
    }

    if (app.state.checkIn.path === "video") {
       app.dom.gameArea.innerHTML = '<div class="welcome-card intro-screen"><div class="intro-panel intro-video-panel"><div class="welcome-stack intro-stack"><div class="intro-badge">Oxford ICT Adventure</div><h3>Watch and get ready</h3><p class="hero-text">The game will start after the video.</p><div class="intro-video-shell"><video id="introVideo" class="intro-video" playsinline preload="auto"><source src="assets/ICT_Video_Revision_for_nd_Graders.mp4" type="video/mp4"></video></div></div></div></div>';
       bindIntroVideo();
       return;
    }

    if (app.state.checkIn.path === "pick") {
       var moodHtml = moodChoices.map(function(mood) {
         return '<button class="emoji-choice" type="button" data-mood="' + mood.id + '"><span class="emoji-face">' + mood.emoji + '</span><span>' + mood.label + '</span></button>';
       }).join("");
       app.dom.gameArea.innerHTML = '<div class="welcome-card intro-screen"><div class="intro-panel"><div class="intro-floating intro-floating-left" aria-hidden="true">🌴</div><div class="intro-floating intro-floating-right" aria-hidden="true">⭐</div><div class="intro-rainbow" aria-hidden="true"></div><div class="welcome-stack intro-stack"><div class="intro-badge">Welcome to ICT Adventure Island</div><strong class="intro-emoji">😊</strong><h3>Hello, explorer!</h3><p class="hero-text">How are you today? Tap the face that feels right.</p><div class="emoji-grid">' + moodHtml + '</div><div class="lesson-plan ready-chip-row"><div class="lesson-chip">Tap a face</div><div class="lesson-chip">Play a little game</div><div class="lesson-chip">Start learning</div></div></div></div></div>';
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
       app.dom.gameArea.innerHTML = '<div class="welcome-card calm-screen"><div class="welcome-stack calm-stack"><strong>' + step.emoji + '</strong><h3>Calm Time</h3><p class="hero-text">' + step.helper + '</p><div class="calm-guide-card">' + renderCalmVisual(step, app.state.checkIn.calmStep) + '<div class="calm-prompt-grid">' + renderCalmPrompts(step, app.state.checkIn.calmStep) + '</div></div><p class="question-text calm-text">' + step.text + '</p><button class="big-choice input-choice calm-button" type="button" id="calmNextBtn">' + (app.state.checkIn.calmStep === calmSteps.length - 1 ? 'Ready' : 'Next') + '</button><div class="lesson-plan"><div class="lesson-chip">Step ' + (app.state.checkIn.calmStep + 1) + ' / ' + calmSteps.length + '</div><div class="lesson-chip">' + step.title + '</div></div></div></div>';
       var nextBtn = document.getElementById("calmNextBtn");
       if (nextBtn) nextBtn.addEventListener("click", handleCalmStep);
       return;
    }

    app.dom.gameArea.innerHTML = '<div class="welcome-card ready-screen"><div class="ready-panel"><div class="ready-sparkles" aria-hidden="true"><span>✨</span><span>🌈</span><span>⭐</span></div><strong>🌴</strong><h3>You are ready!</h3><p class="hero-text">Pick your next adventure.</p><div class="lesson-plan ready-chip-row"><div class="lesson-chip">Lesson 1</div><div class="lesson-chip">Lesson 2</div><div class="lesson-chip">Games</div></div><button class="big-choice ready-button" type="button" id="startLessonBtn">Choose Lesson</button></div></div>';
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

  function bindIntroVideo() {
    var video = document.getElementById("introVideo");
    if (!video) return;
    var goNext = function() {
      if (introDelay) clearTimeout(introDelay);
      introDelay = setTimeout(function() {
        app.processAction('UPDATE_CHECKIN', { path: "pick" });
        renderWelcome();
      }, 2000);
    };
    video.addEventListener("ended", goNext, { once: true });
    var playPromise = video.play();
    if (playPromise && playPromise.catch) {
      playPromise.catch(function() {
        h.showFeedback("Tap the video to play.", "info");
        video.controls = true;
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
