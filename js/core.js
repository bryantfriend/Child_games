(function () {
  var app = window.ICTApp = window.ICTApp || {};

  app.state = {
    stars: 0,
    completed: [], // No Set to avoid spread issues in old JS
    currentGame: null,
    feedbackTimeout: null,
    drag: null,
    build: {},
    input: {},
    output: {},
    challenge: {},
    onoff: {},
    fun: { timers: [], mode: "hub" },
    sillyTaps: 0,
    checkIn: { mood: null, path: "start", emojiRound: 0, calmStep: 0, ready: false },
    freePlay: false,
  };

  app.lessons = {};
  app.funGames = {};
  app.checkin = {};

  app.dom = {
    gameArea: document.getElementById("gameArea"),
    panelTitle: document.getElementById("panelTitle"),
    panelSubtitle: document.getElementById("panelSubtitle"),
    starCount: document.getElementById("starCount"),
    completedCount: document.getElementById("completedCount"),
    feedbackBanner: document.getElementById("feedbackBanner"),
    confettiLayer: document.getElementById("confettiLayer"),
  };

  function shuffleArray(items) {
    var index, swapIndex, temp;
    for (index = items.length - 1; index > 0; index -= 1) {
      swapIndex = Math.floor(Math.random() * (index + 1));
      temp = items[index];
      items[index] = items[swapIndex];
      items[swapIndex] = temp;
    }
    return items;
  }

  function pickRandom(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function renderIcon(item, className) {
    var cls = className || "";
    if (item.asset) {
      return '<img src="' + item.asset + '" alt="' + item.label + '" class="svg-icon ' + cls + '">';
    }
    return '<span class="' + cls + '">' + item.emoji + '</span>';
  }

  function playTone(tone) {
    var AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!playTone.context) playTone.context = new AudioContextClass();
    var context = playTone.context;
    if (context.state === "suspended") context.resume();
    var oscillator = context.createOscillator();
    var gain = context.createGain();
    oscillator.connect(gain);
    gain.connect(context.destination);
    var now = context.currentTime;
    var notes = { success: [660, 880], error: [220, 180], info: [520, 620] };
    var freqList = notes[tone] || notes.info;
    var i;
    for (i = 0; i < freqList.length; i++) {
       oscillator.frequency.setValueAtTime(freqList[i], now + i * 0.08);
    }
    oscillator.type = tone === "error" ? "square" : "triangle";
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    oscillator.start(now);
    oscillator.stop(now + 0.3);
  }

  function spawnConfetti(count, bigBurst) {
    var layer = app.dom.confettiLayer;
    if (!layer) return;
    var index, piece;
    for (index = 0; index < count; index += 1) {
      piece = document.createElement("div");
      piece.className = "confetti-piece";
      piece.style.left = (Math.random() * 100) + "%";
      piece.style.background = app.data.confettiColors[index % app.data.confettiColors.length];
      piece.style.animationDuration = (bigBurst ? 2.6 + Math.random() * 1.2 : 1.4 + Math.random() * 0.9) + "s";
      piece.style.animationDelay = (Math.random() * 0.25) + "s";
      piece.style.transform = "rotate(" + (Math.random() * 360) + "deg) scale(" + (0.7 + Math.random() * 0.8) + ")";
      layer.appendChild(piece);
      (function(p) {
        setTimeout(function() { if (p.parentNode) p.parentNode.removeChild(p); }, 4200);
      })(piece);
    }
  }

  function showFeedback(message, tone) {
    var banner = app.dom.feedbackBanner;
    if (!banner) return;
    banner.textContent = message;
    banner.className = "feedback-banner show feedback-" + tone + (tone === "success" ? " party" : "");
    playTone(tone);
    clearTimeout(app.state.feedbackTimeout);
    app.state.feedbackTimeout = setTimeout(function () { banner.className = "feedback-banner"; }, 1500);
  }

  function clearFunTimers() {
    var timers = app.state.fun.timers || [];
    var i;
    for (i = 0; i < timers.length; i++) {
      if (timers[i].kind === "timeout") clearTimeout(timers[i].id);
      else clearInterval(timers[i].id);
    }
    app.state.fun.timers = [];
  }

  function addFunTimer(id, kind) {
    app.state.fun.timers.push({ id: id, kind: kind });
    return id;
  }

  function setIslandAccess() {
    var buttons = document.querySelectorAll(".island-card");
    var i, button, needsCheckIn, needsStars, locked;
    for (i = 0; i < buttons.length; i++) {
      button = buttons[i];
      needsCheckIn = !app.state.checkIn.ready;
      needsStars = button.dataset.game === "fun" && app.state.stars < 100 && !app.state.freePlay;
      locked = (needsCheckIn || needsStars);
      button.disabled = locked;
      if (locked) button.classList.add("locked-island");
      else button.classList.remove("locked-island");
    }
  }

  function updateScoreboard() {
    if (app.dom.starCount) app.dom.starCount.textContent = String(app.state.stars);
    if (app.dom.completedCount) app.dom.completedCount.textContent = app.state.completed.length + " / 5";
    setIslandAccess();
    if (app.state.stars >= 100 && !app.state.freePlay) {
      showFeedback("Fun Zone unlocked!", "success");
      spawnConfetti(60, true);
      app.state.freePlay = true;
    }
  }

  function updateRenderHooks() {
    window.render_game_to_text = function() {
      return JSON.stringify({
        mode: app.state.currentGame || "menu",
        stars: app.state.stars,
        completed: app.state.completed.slice(),
        freePlay: app.state.freePlay,
        checkIn: app.state.checkIn,
        onoff: {
          mission: app.state.onoff.mission || 0,
          wakeHits: (app.state.onoff.wakeHits || []).slice(),
          stepOrder: (app.state.onoff.stepOrder || []).slice(),
          holdPhase: app.state.onoff.holdPhase || null,
          holdValue: app.state.onoff.holdValue || 0,
          scenarioIndex: app.state.onoff.scenarioIndex || 0,
          routineIndex: app.state.onoff.routineIndex || 0,
          routineLives: app.state.onoff.routineLives || 0
        }
      });
    };
    window.advanceTime = function(ms) { return ms; };
  }

  // 7-Stage Pipeline for State Management
  app.processAction = function(type, payload) {
    // 1. Validate
    if (!type) return;

    // 2. Normalize
    var rawAction = { type: type, payload: payload || {} };

    // 3. Add Context
    rawAction.timestamp = Date.now();
    
    // 4. Authorize
    if (rawAction.type === 'START_FUN' && app.state.stars < 100) {
      showFeedback("Get 100 stars first!", "error");
      return;
    }

    // 5. Process (Transactions - Must return NEW state)
    // We update app.state directly but with manual cloning to ensure parity with rules
    var newState = Object.assign({}, app.state);
    
    // Helper to clone sub-objects
    var clone = function(obj) { return JSON.parse(JSON.stringify(obj)); };

    switch(rawAction.type) {
      case 'BUMP_STARS':
        newState.stars += rawAction.payload.amount;
        break;
      case 'COMPLETE_GAME':
        var gameId = rawAction.payload.id;
        if (newState.completed.indexOf(gameId) === -1) {
          newState.completed.push(gameId);
          newState.stars += 25;
        }
        break;
      case 'SILLY_TAP':
        newState.sillyTaps += 1;
        newState.stars += 1;
        break;
      case 'UPDATE_CHECKIN':
        newState.checkIn = Object.assign({}, newState.checkIn, rawAction.payload);
        break;
      case 'SET_GAME':
        newState.currentGame = rawAction.payload.id;
        break;
      case 'SET_FREE_PLAY':
        newState.freePlay = Boolean(rawAction.payload.value);
        break;
    }

    // 6. Finalize
    app.state = newState;
    updateScoreboard();
    updateRenderHooks();

    // 7. Emit Result
    console.log("Action Emit:", rawAction.type);
    return app.state;
  };

  app.helpers = {
    shuffleArray: shuffleArray,
    pickRandom: pickRandom,
    renderIcon: renderIcon,
    showFeedback: showFeedback,
    updateScoreboard: updateScoreboard,
    spawnConfetti: spawnConfetti,
    playTone: playTone,
    setIslandAccess: setIslandAccess,
    clearFunTimers: clearFunTimers,
    addFunTimer: addFunTimer,
    updateRenderHooks: updateRenderHooks,
    getCardHeader: function(extra, backId, label) {
       var bid = backId || "backToMap";
       var blbl = label || "⬅ Map";
       return '<div class="card-header"><button class="back-button" type="button" id="' + bid + '">' + blbl + '</button><div class="progress-row">' + (extra || "") + '</div></div>';
    },
    getMissionStrip: function(title, text, missions) {
       var mList = missions.map(function(m) {
         return '<div class="lesson-chip ' + (m.done ? "chip-done" : "") + '">' + m.label + '</div>';
       }).join("");
       return '<div class="mission-strip"><div><h3>' + title + '</h3><p>' + text + '</p></div><div class="lesson-plan">' + mList + '</div></div>';
    },
    bindBackToMap: function() {
      var btn = document.getElementById("backToMap");
      if (btn) btn.addEventListener("click", function() {
        clearFunTimers();
        if (app.showLessonMap) app.showLessonMap();
        else app.checkin.renderWelcome();
      });
    }
  };

})();
