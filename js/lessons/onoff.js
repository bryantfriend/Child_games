(function () {
  var app = window.ICTApp;
  var onoffSteps = app.data.onoffSteps;
  var onoffScenarios = app.data.onoffScenarios;
  var routineRounds = app.data.onoffRoutineRounds;
  var routineChoices = app.data.onoffRoutineChoices;
  var h = app.helpers;
  var moduleOrder = ["wake", "steps", "power", "safe"];
  var funGames = [
    { id: "fix", emoji: "🖥️", title: "Boot-Up Sequence", text: "Tap at the right time to get the computer ready." },
    { id: "power", emoji: "🔌", title: "Plug It In!", text: "Match cables and ports like a tech helper." },
    { id: "screen", emoji: "🎨", title: "Screen Paint Splash!", text: "Take a calm color break on the screen." },
    { id: "road", emoji: "🛣️", title: "Techy Road", text: "Cross past tech obstacles with your hero." }
  ];

  function start() {
    app.state.onoff = {
      view: "map",
      module: null,
      moduleDone: { wake: false, steps: false, power: false, safe: false },
      lessonDone: false,
      returnTo: null,
      mission: 0,
      wakeHits: [],
      plugConnected: false,
      wakeStage: "plug",
      wakeProgress: 0,
      wakeTimer: null,
      wakeBootTimer: null,
      stepOrder: [],
      holdPhase: "turn_on",
      holdValue: 0,
      holdTimer: null,
      safeStage: "scenario",
      scenarioIndex: 0,
      routineIndex: 0,
      routineLives: 3,
      routineStreak: 0
    };
    render();
  }

  function render() {
    var state = app.state.onoff;
    if (state.view === "map") {
      renderMap();
      return;
    }
    if (state.view === "fun") {
      renderFunMap();
      return;
    }

    var missions = [
      { label: "1. Wake It Up", done: state.moduleDone.wake },
      { label: "2. Boot Steps", done: state.moduleDone.steps },
      { label: "3. Power Practice", done: state.moduleDone.power },
      { label: "4. Safe Choices", done: state.moduleDone.safe }
    ];
    var body = "";
    if (state.module === "wake") body = renderWakeMission();
    else if (state.module === "steps") body = renderStepsMission();
    else if (state.module === "power") body = renderHoldMission();
    else body = renderSafeMission();

    app.dom.gameArea.innerHTML = '<div class="game-card">' + h.getCardHeader('<span class="pill">Lesson 2</span><span class="pill">4 modules</span>', "backToMenu", "⬅ Menu") + h.getMissionStrip("Turning a Computer On / Off", "Finish the 4 lesson jobs. Then unlock the lesson Fun Zone.", missions) + body + '</div>';
    bindMenuBack();
    bindMissionEvents();
  }

  function renderMap() {
    var state = app.state.onoff;
    var modules = [
      { id: "wake", title: "1. Wake It Up", text: "Plug in and press power.", emoji: "🔌", done: state.moduleDone.wake },
      { id: "steps", title: "2. Boot Steps", text: "Put the startup steps in order.", emoji: "🪜", done: state.moduleDone.steps },
      { id: "power", title: "3. Power Practice", text: "Hold to turn on and off.", emoji: "⏻", done: state.moduleDone.power },
      { id: "safe", title: "4. Safe Choices", text: "Pick the safe computer action.", emoji: "✅", done: state.moduleDone.safe }
    ];
    var unlocked = allModulesDone();
    var cards = modules.map(function(module) {
      return '<button class="lesson-menu-card onoff-map-card ' + (module.done ? "onoff-map-card-done" : "") + '" type="button" data-onoff-open="' + module.id + '">' +
        '<span class="lesson-menu-emoji onoff-map-emoji">' + module.emoji + '</span><strong>' + module.title + '</strong><span>' + module.text + '</span><span class="onoff-map-badge">' + (module.done ? "Done +25" : "Play") + '</span></button>';
    }).join("");
    var funCard = '<button class="lesson-menu-card onoff-map-card onoff-map-card-fun ' + (unlocked ? "" : "locked-island") + '" type="button" data-onoff-open="fun"' + (unlocked ? "" : " disabled") + '><span class="lesson-menu-emoji onoff-map-emoji">🎉</span><strong>Fun Zone</strong><span>Unlocked after the 4 lesson modules.</span><span class="onoff-map-badge">' + (unlocked ? "Unlocked!" : "Locked") + '</span></button>';
    app.dom.gameArea.innerHTML = '<div class="game-card">' + h.getCardHeader('<span class="pill">Lesson 2 map</span><span class="pill">4 modules + Fun Zone</span>', "backToMenu", "⬅ Menu") + '<div class="mission-strip"><div><h3>Power Lesson Map</h3><p>Tap each lesson card. Earn 25 stars for each finished module.</p></div><div class="lesson-plan"><div class="lesson-chip">Done ' + countDone() + ' / 4</div><div class="lesson-chip">' + (unlocked ? "Fun Zone open" : "Finish 4 to unlock") + '</div></div></div><div class="welcome-card menu-card-screen onoff-map-screen"><div class="onoff-map-decor onoff-map-decor-left" aria-hidden="true">⚡</div><div class="onoff-map-decor onoff-map-decor-right" aria-hidden="true">💡</div><div class="onoff-map-river" aria-hidden="true"></div><div class="welcome-stack onoff-map-stack"><strong>💻</strong><h3>Lesson 2 Adventure</h3><p class="hero-text">Finish the four power islands, then unlock the bonus Fun Zone games.</p><div class="lesson-menu-grid onoff-map-grid">' + cards + funCard + '</div></div></div></div>';
    bindMenuBack();
    bindMapEvents();
  }

  function renderFunMap() {
    var cards = funGames.map(function(game) {
      return '<button class="fun-button fun-card-button" type="button" data-onoff-fun="' + game.id + '"><span class="fun-card-emoji">' + game.emoji + '</span><span class="fun-card-title">' + game.title + '</span><span class="fun-card-text">' + game.text + '</span></button>';
    }).join("");
    app.dom.gameArea.innerHTML = '<div class="game-card">' + h.getCardHeader('<span class="pill">Lesson 2 Fun Zone</span><span class="pill">Bonus play</span>', "backToMenu", "⬅ Menu") + '<div class="mission-strip"><div><h3>Power Fun Zone</h3><p>Play bonus games after finishing Lesson 2.</p></div><div class="lesson-plan"><div class="lesson-chip chip-done">4 lessons done</div><div class="lesson-chip chip-done">Fun Zone unlocked</div></div></div><div class="fun-hub">' + cards + '</div><div class="choice-row"><button class="big-choice output-choice calm-button" type="button" id="onoffMapBtn">Back To Lesson 2 Map</button></div></div>';
    bindMenuBack();
    var mapBtn = document.getElementById("onoffMapBtn");
    if (mapBtn) mapBtn.addEventListener("click", showMap);
    bindMany("[data-onoff-fun]", function(btn) {
      btn.addEventListener("click", function() {
        launchFunGame(btn.dataset.onoffFun);
      });
    });
  }

  function renderWakeMission() {
    var plugged = app.state.onoff.plugConnected;
    var booting = app.state.onoff.wakeStage === "booting";
    var progress = Math.min(app.state.onoff.wakeProgress, 100);
    return '<div class="build-layout">' +
      '<div class="computer-board"><div class="onoff-hero-card onoff-power-scene">' + powerScene(plugged, booting, progress) +
      '<div class="onoff-speech">' + (plugged ? (booting ? "The computer is starting up..." : "Now press the power button.") : "Drag the plug into the wall first.") + '</div></div></div>' +
      '<div class="tray"><div class="pill">Module 1 of 4</div><div class="draggable-list">' +
      '<div class="draggable-item ' + (plugged ? "placed" : "") + '" data-kind="onoff-plug" data-id="plug"><span class="draggable-item-emoji">🔌</span><div><strong>Power Plug</strong><div>Drag into the wall socket.</div></div></div>' +
      '</div><button class="big-choice onoff-power-button ' + (plugged ? "power-button-ready" : "power-button-off") + ' ' + (booting ? "power-button-booting" : "") + '" type="button" id="wakePowerBtn"' + (plugged ? "" : " disabled") + '>⏻</button>' +
      '<div class="lesson-plan"><div class="lesson-chip">Plug ' + (plugged ? "done" : "first") + '</div><div class="lesson-chip">Power ' + (booting ? "starting" : (plugged ? "ready" : "wait")) + '</div></div>' +
      '<p class="hint">1. Drag the plug into the wall. 2. Press the power button.</p><div class="choice-row"><button class="fun-button" type="button" id="backToLessonMapBtn">Back To Lesson 2 Map</button></div></div>' +
      '</div>';
  }

  function renderStepsMission() {
    var slots = onoffSteps.map(function(step, index) {
      var placed = app.state.onoff.stepOrder[index];
      return '<div class="drop-zone onoff-step-slot ' + (placed ? "filled" : "") + '" data-zone="' + String(index) + '">' +
        '<strong>' + (index + 1) + '</strong><p>' + (placed ? placed.label : "Drop here") + '</p></div>';
    }).join("");
    var cards = h.shuffleArray(onoffSteps.slice()).map(function(step) {
      var used = app.state.onoff.stepOrder.filter(function(card) { return card.id === step.id; }).length > 0;
      return '<div class="draggable-item ' + (used ? "placed" : "") + '" data-kind="onoff-step" data-id="' + step.id + '">' +
        '<span class="draggable-item-emoji">' + step.emoji + '</span><div><strong>' + step.label + '</strong><div>Put in order.</div></div></div>';
    }).join("");

    return '<div class="build-layout">' +
      '<div class="computer-board"><div class="drop-zone-grid onoff-step-grid">' + slots + '</div><div class="onoff-step-art">' + bootScene(app.state.onoff.stepOrder.length) + '</div></div>' +
      '<div class="tray"><div class="pill">Module 2 of 4</div><div class="draggable-list">' + cards + '</div><p class="hint">Drag the steps into the correct order.</p><div class="choice-row"><button class="fun-button" type="button" id="backToLessonMapBtn">Back To Lesson 2 Map</button></div></div>' +
      '</div>';
  }

  function renderHoldMission() {
    var phase = app.state.onoff.holdPhase;
    var meter = Math.min(app.state.onoff.holdValue, 100);
    return '<div class="onoff-layout">' +
      '<div class="onoff-hero-card hold-card">' + holdScene(phase === "turn_off", meter) +
        '<div class="power-ring"><div class="power-ring-fill" style="height:' + meter + '%;"></div><button class="power-hold-button" type="button" id="holdPowerBtn">⏻</button></div>' +
        '<div class="onoff-speech">' + (phase === "turn_on" ? "Press and hold to turn ON." : "Press and hold to turn OFF.") + '</div>' +
      '</div>' +
      '<div class="lesson-plan"><div class="lesson-chip">Phase: ' + (phase === "turn_on" ? "Turn On" : "Turn Off") + '</div><div class="lesson-chip">Hold: ' + meter + '%</div></div><div class="choice-row"><button class="fun-button" type="button" id="backToLessonMapBtn">Back To Lesson 2 Map</button></div>' +
      '</div>';
  }

  function renderScenarioMission() {
    var round = onoffScenarios[app.state.onoff.scenarioIndex];
    var choices = h.shuffleArray(round.options.slice()).map(function(option) {
      return '<button class="big-choice onoff-choice-button" type="button" data-onoff-scenario="' + option.id + '">' +
        '<span class="emoji-face">' + option.emoji + '</span><span>' + option.label + '</span></button>';
    }).join("");
    return '<div class="scenario-card onoff-scenario-card">' +
      '<div class="onoff-hero-card mini-hero">' + classroomScene(app.state.onoff.scenarioIndex) + '</div>' +
      '<div class="welcome-stack"><h3>' + round.text + '</h3><p class="hero-text">Pick the best safe choice.</p><div class="choice-pair onoff-button-pair">' + choices + '</div>' +
      '<div class="lesson-plan"><div class="lesson-chip">Card ' + (app.state.onoff.scenarioIndex + 1) + ' / ' + onoffScenarios.length + '</div></div></div></div>';
  }

  function renderRoutineMission() {
    var round = routineRounds[app.state.onoff.routineIndex];
    if (!round) {
      app.processAction('COMPLETE_GAME', { id: "onoff" });
      app.state.onoff.mission = 6;
      return render();
    }
    var choices = h.shuffleArray(routineChoices.slice()).map(function(choice) {
      return '<button class="teacher-target onoff-routine-button" type="button" data-onoff-routine="' + choice.id + '">' +
        '<span class="sort-icon">' + choice.emoji + '</span><span>' + choice.label + '</span></button>';
    }).join("");
    return '<div class="teacher-layout">' +
      '<div class="teacher-stage onoff-final-stage"><div class="teacher-icon">💻</div><h3 class="teacher-command">' + round.text + '</h3><p class="teacher-subtext">Tap the next best step.</p>' +
      '<div class="lesson-plan"><div class="lesson-chip">Round ' + (app.state.onoff.routineIndex + 1) + ' / ' + routineRounds.length + '</div><div class="lesson-chip">Lives ' + repeatIcon("💛", app.state.onoff.routineLives) + '</div><div class="lesson-chip">Streak ' + app.state.onoff.routineStreak + '</div></div></div>' +
      '<div class="teacher-targets challenge-grid">' + choices + '</div></div>';
  }

  function renderSafeMission() {
    var top = '<div class="choice-row onoff-map-actions"><button class="fun-button" type="button" id="backToLessonMapBtn">Back To Lesson 2 Map</button></div>';
    if (app.state.onoff.safeStage === "scenario") return renderScenarioMission() + top;
    return renderRoutineMission() + top;
  }

  function bindMissionEvents() {
    h.bindDragSystem();

    bindMany("[data-onoff-scenario]", function(btn) {
      btn.addEventListener("click", function() { handleScenario(btn.dataset.onoffScenario); });
    });
    bindMany("[data-onoff-routine]", function(btn) {
      btn.addEventListener("click", function() { handleRoutine(btn.dataset.onoffRoutine, btn); });
    });

    var holdBtn = document.getElementById("holdPowerBtn");
    if (holdBtn) {
      holdBtn.addEventListener("pointerdown", startHold);
      holdBtn.addEventListener("pointerup", stopHold);
      holdBtn.addEventListener("pointercancel", stopHold);
      holdBtn.addEventListener("pointerleave", stopHold);
    }

    var wakePowerBtn = document.getElementById("wakePowerBtn");
    if (wakePowerBtn) wakePowerBtn.addEventListener("click", startWakeBoot);

    var mapBtn = document.getElementById("backToLessonMapBtn");
    if (mapBtn) mapBtn.addEventListener("click", showMap);
  }

  function bindMany(selector, binder) {
    var nodes = app.dom.gameArea.querySelectorAll(selector);
    var i;
    for (i = 0; i < nodes.length; i++) binder(nodes[i]);
  }

  function handleDrop(kind, id, target) {
    if (kind === "onoff-plug") {
      if (!target || target.dataset.zone !== "wall-plug") {
        h.showFeedback("Drag the plug into the wall socket.", "error");
        return;
      }
      app.state.onoff.plugConnected = true;
      app.processAction('BUMP_STARS', { amount: 2 });
      h.showFeedback("Plug connected!", "success");
      render();
      return;
    }
    if (kind !== "onoff-step") return;
    var nextIndex = app.state.onoff.stepOrder.length;
    var expected = onoffSteps[nextIndex];
    if (!target || target.dataset.zone !== String(nextIndex) || expected.id !== id) {
      h.showFeedback("Try the next step.", "error");
      return;
    }
    app.state.onoff.stepOrder.push(expected);
    app.processAction('BUMP_STARS', { amount: 2 });
    if (app.state.onoff.stepOrder.length >= onoffSteps.length) {
      completeModule("steps", "Boot steps complete!");
    } else {
      h.showFeedback("Good order!", "success");
    }
    render();
  }

  function startHold(event) {
    clearInterval(app.state.onoff.holdTimer);
    event.currentTarget.setPointerCapture(event.pointerId);
    app.state.onoff.holdTimer = setInterval(function() {
      app.state.onoff.holdValue += 5;
      if (app.state.onoff.holdValue >= 100) completeHoldPhase();
      else updateHoldMeter();
    }, 60);
  }

  function stopHold(event) {
    clearInterval(app.state.onoff.holdTimer);
    app.state.onoff.holdTimer = null;
    if (event && event.currentTarget && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function updateHoldMeter() {
    var fill = document.querySelector(".power-ring-fill");
    if (fill) fill.style.height = Math.min(app.state.onoff.holdValue, 100) + "%";
  }

  function completeHoldPhase() {
    clearInterval(app.state.onoff.holdTimer);
    app.state.onoff.holdTimer = null;
    app.processAction('BUMP_STARS', { amount: 4 });
    if (app.state.onoff.holdPhase === "turn_on") {
      app.state.onoff.holdPhase = "turn_off";
      app.state.onoff.holdValue = 0;
      h.showFeedback("Now turn it off.", "success");
      render();
      return;
    }
    app.state.onoff.holdValue = 100;
    completeModule("power", "Power practice done!");
  }

  function startWakeBoot() {
    if (!app.state.onoff.plugConnected || app.state.onoff.wakeStage === "booting") return;
    app.state.onoff.wakeStage = "booting";
    app.state.onoff.wakeProgress = 0;
    clearInterval(app.state.onoff.wakeTimer);
    clearTimeout(app.state.onoff.wakeBootTimer);
    h.showFeedback("Power on...", "info");
    app.state.onoff.wakeTimer = setInterval(function() {
      app.state.onoff.wakeProgress += 2;
      if (app.state.onoff.wakeProgress >= 100) {
        clearInterval(app.state.onoff.wakeTimer);
        app.state.onoff.wakeTimer = null;
        app.processAction('BUMP_STARS', { amount: 3 });
        h.showFeedback("Computer starting!", "success");
        app.state.onoff.wakeBootTimer = setTimeout(function() {
          app.state.onoff.wakeHits = ["plug", "button", "screen"];
          completeModule("wake", "Wake-up lesson complete!");
        }, 900);
      }
      render();
    }, 100);
    render();
  }

  function handleScenario(id) {
    var round = onoffScenarios[app.state.onoff.scenarioIndex];
    if (id !== round.answer) {
      h.showFeedback("Try the safer choice.", "error");
      return;
    }
    app.processAction('BUMP_STARS', { amount: 3 });
    app.state.onoff.scenarioIndex += 1;
    if (app.state.onoff.scenarioIndex >= onoffScenarios.length) {
      app.state.onoff.safeStage = "routine";
      h.showFeedback("Safe choices mastered! Final round next.", "success");
    } else {
      h.showFeedback("Yes! Safe step.", "success");
    }
    render();
  }

  function handleRoutine(id, button) {
    var round = routineRounds[app.state.onoff.routineIndex];
    if (id === round.answer) {
      app.state.onoff.routineIndex += 1;
      app.state.onoff.routineStreak += 1;
      app.processAction('BUMP_STARS', { amount: 2 });
      h.showFeedback("Correct!", "success");
      if (app.state.onoff.routineIndex >= routineRounds.length) {
        completeModule("safe", "Safe computer choices complete!");
      }
    } else {
      app.state.onoff.routineLives -= 1;
      app.state.onoff.routineStreak = 0;
      h.showFeedback("Oops. Try again!", "error");
      if (button) {
        button.classList.add("shake");
        setTimeout(function() { button.classList.remove("shake"); }, 450);
      }
      if (app.state.onoff.routineLives <= 0) {
        app.state.onoff.routineLives = 3;
        app.state.onoff.routineIndex = 0;
      }
    }
    render();
  }

  function bindMenuBack() {
    var button = document.getElementById("backToMenu");
    if (button) button.addEventListener("click", function() { app.renderMainMenu(); });
  }

  function bindMapEvents() {
    bindMany("[data-onoff-open]", function(btn) {
      btn.addEventListener("click", function() {
        if (btn.dataset.onoffOpen === "fun") {
          if (allModulesDone()) {
            app.state.onoff.view = "fun";
            render();
          }
          return;
        }
        openModule(btn.dataset.onoffOpen);
      });
    });
  }

  function openModule(moduleId) {
    var state = app.state.onoff;
    state.view = "module";
    state.module = moduleId;
    state.returnTo = null;
    if (moduleId === "wake") {
      state.mission = 1;
      state.plugConnected = false;
      state.wakeStage = "plug";
      state.wakeProgress = 0;
      state.wakeHits = [];
    } else if (moduleId === "steps") {
      state.mission = 2;
      state.stepOrder = [];
    } else if (moduleId === "power") {
      state.mission = 3;
      state.holdPhase = "turn_on";
      state.holdValue = 0;
    } else if (moduleId === "safe") {
      state.mission = 4;
      state.safeStage = "scenario";
      state.scenarioIndex = 0;
      state.routineIndex = 0;
      state.routineLives = 3;
      state.routineStreak = 0;
    }
    render();
  }

  function showMap() {
    app.processAction('SET_GAME', { id: "onoff" });
    app.state.onoff.view = "map";
    app.state.onoff.module = null;
    app.state.onoff.returnTo = null;
    if (app.dom.panelTitle) app.dom.panelTitle.textContent = app.data.games.onoff.title;
    if (app.dom.panelSubtitle) app.dom.panelSubtitle.textContent = app.data.games.onoff.subtitle + " Estimated time: " + app.data.games.onoff.duration + ".";
    document.getElementById("game-overlay").style.display = "flex";
    render();
  }

  function countDone() {
    var count = 0;
    var i;
    for (i = 0; i < moduleOrder.length; i++) if (app.state.onoff.moduleDone[moduleOrder[i]]) count += 1;
    return count;
  }

  function allModulesDone() {
    return countDone() === moduleOrder.length;
  }

  function completeModule(moduleId, message) {
    var state = app.state.onoff;
    if (!state.moduleDone[moduleId]) {
      state.moduleDone[moduleId] = true;
      app.processAction('BUMP_STARS', { amount: 25 });
    }
    if (allModulesDone() && !state.lessonDone) {
      state.lessonDone = true;
      app.processAction('MARK_COMPLETE', { id: "onoff" });
      h.spawnConfetti(54, true);
      h.showFeedback("Lesson 2 Fun Zone unlocked!", "success");
    } else {
      h.spawnConfetti(28, false);
      h.showFeedback(message + " +25 stars!", "success");
    }
    state.view = "map";
    state.module = null;
    render();
  }

  function launchFunGame(id) {
    app.state.onoff.returnTo = "onoffMap";
    if (id === "fix") app.funGames.fix.start();
    else if (id === "power") app.funGames.power.start();
    else if (id === "screen") app.funGames.screen.start();
    else if (id === "road") app.funGames.road.start();
  }

  function repeatIcon(icon, count) {
    var text = "";
    var i;
    for (i = 0; i < count; i++) text += icon;
    return text;
  }

  function computerScene(screenOn, glow) {
    return '<svg viewBox="0 0 520 280" class="onoff-scene-svg" aria-hidden="true">' +
      '<rect x="70" y="35" width="260" height="160" rx="28" fill="#355da6"/>' +
      '<rect x="92" y="56" width="216" height="116" rx="20" fill="' + (screenOn ? '#9af0ff' : '#24324f') + '"/>' +
      '<circle cx="360" cy="132" r="62" fill="' + (glow ? 'rgba(255,216,79,0.35)' : 'rgba(126,142,184,0.22)') + '"/>' +
      '<circle cx="360" cy="132" r="42" fill="#fff"/>' +
      '<path d="M360 106v28M346 120h28" stroke="#ff7e5f" stroke-linecap="round" stroke-width="10"/>' +
      '<rect x="175" y="196" width="52" height="18" rx="8" fill="#ffcf77"/><rect x="150" y="214" width="104" height="12" rx="6" fill="#7f9aca"/>' +
      '<path d="M377 185q48 8 80 34" fill="none" stroke="#ffd84f" stroke-linecap="round" stroke-width="10"/>' +
      '<circle cx="456" cy="224" r="18" fill="#ffd84f"/></svg>';
  }

  function bootScene(count) {
    return '<svg viewBox="0 0 520 220" class="onoff-scene-svg" aria-hidden="true">' +
      '<rect x="42" y="58" width="180" height="116" rx="22" fill="#2f5aa8"/>' +
      '<rect x="58" y="74" width="148" height="84" rx="16" fill="#91ebff"/>' +
      '<rect x="276" y="48" width="182" height="18" rx="9" fill="#e4f7ff"/>' +
      '<rect x="276" y="48" width="' + (count * 36) + '" height="18" rx="9" fill="#2ec27e"/>' +
      '<circle cx="102" cy="115" r="12" fill="#fff3b0"/><circle cx="142" cy="115" r="12" fill="#fff3b0"/>' +
      '<path d="M92 142q30 22 62 0" fill="none" stroke="#fff" stroke-linecap="round" stroke-width="8"/></svg>';
  }

  function holdScene(isOff, meter) {
    return '<svg viewBox="0 0 420 260" class="onoff-scene-svg" aria-hidden="true">' +
      '<circle cx="120" cy="122" r="72" fill="' + (isOff ? '#dce7f7' : '#a8f6ff') + '"/>' +
      '<circle cx="120" cy="122" r="42" fill="' + (isOff ? '#7182a6' : '#ffd84f') + '"/>' +
      '<path d="M120 100v46" stroke="#fff" stroke-linecap="round" stroke-width="12"/>' +
      '<path d="M210 72h140v26H210z" fill="#e6f6ff"/><path d="M210 72h' + (meter * 1.4) + 'v26H210z" fill="#2ec27e"/>' +
      '<rect x="210" y="112" width="128" height="86" rx="18" fill="' + (isOff ? '#2a3456' : '#7fe7ff') + '"/>' +
      '<circle cx="252" cy="152" r="10" fill="' + (isOff ? '#4a587a' : '#fff3b0') + '"/><circle cx="292" cy="152" r="10" fill="' + (isOff ? '#4a587a' : '#fff3b0') + '"/>' +
      '<path d="M242 178q24 18 60 0" fill="none" stroke="' + (isOff ? '#7483a5' : '#fff') + '" stroke-linecap="round" stroke-width="8"/></svg>';
  }

  function classroomScene(seed) {
    var colors = ["#9af0ff", "#ffdd7f", "#ff9dbc", "#9be7a5"];
    return '<svg viewBox="0 0 520 220" class="onoff-scene-svg" aria-hidden="true">' +
      '<rect x="28" y="28" width="462" height="164" rx="30" fill="#dff7ff"/>' +
      '<rect x="58" y="48" width="148" height="92" rx="20" fill="' + colors[seed % colors.length] + '"/>' +
      '<rect x="240" y="58" width="58" height="92" rx="16" fill="#4f669a"/>' +
      '<rect x="324" y="74" width="110" height="22" rx="11" fill="#fff"/>' +
      '<rect x="324" y="112" width="138" height="22" rx="11" fill="#fff"/>' +
      '<rect x="324" y="150" width="120" height="22" rx="11" fill="#fff"/>' +
      '<circle cx="134" cy="166" r="20" fill="#ffd84f"/><circle cx="188" cy="166" r="20" fill="#2ec27e"/></svg>';
  }

  function powerScene(plugged, booting, progress) {
    var barWidth = Math.max(8, progress * 1.4);
    return '<div class="onoff-power-layout">' +
      '<svg viewBox="0 0 560 280" class="onoff-scene-svg" aria-hidden="true">' +
      '<rect x="34" y="32" width="208" height="168" rx="28" fill="#355da6"/>' +
      '<rect x="54" y="52" width="168" height="128" rx="20" fill="' + (booting ? '#091a33' : (plugged ? '#24324f' : '#13284a')) + '"/>' +
      (booting ? '<rect x="78" y="76" width="120" height="12" rx="6" fill="#18355f"/><rect x="78" y="76" width="' + barWidth + '" height="12" rx="6" fill="url(#bootGrad)"/><circle cx="112" cy="126" r="24" fill="none" stroke="#7edcff" stroke-width="8" stroke-dasharray="18 10" class="boot-loader"/><text x="80" y="162" fill="#dff7ff" font-size="18" font-weight="700">Starting...</text>' : '<circle cx="112" cy="112" r="12" fill="' + (plugged ? '#ff6b6b' : '#5f6f92') + '"/><text x="82" y="156" fill="#dff7ff" font-size="18" font-weight="700">' + (plugged ? 'Ready' : 'No power') + '</text>') +
      '<rect x="112" y="204" width="54" height="18" rx="8" fill="#ffcf77"/><rect x="88" y="222" width="102" height="12" rx="6" fill="#7f9aca"/>' +
      '<rect x="346" y="92" width="62" height="88" rx="16" fill="#f8fbff"/><circle cx="376" cy="120" r="9" fill="' + (plugged ? '#5be37f' : '#f3a9b6') + '"/><rect x="360" y="142" width="12" height="24" rx="5" fill="#cfd9ea"/><rect x="382" y="142" width="12" height="24" rx="5" fill="#cfd9ea"/>' +
      '<path d="M408 136 C 462 136, 462 196, 516 196" fill="none" stroke="' + (plugged ? '#ffd84f' : '#8798bd') + '" stroke-width="10" stroke-linecap="round"/>' +
      '<path d="M516 196v20" fill="none" stroke="' + (plugged ? '#ffd84f' : '#8798bd') + '" stroke-width="10" stroke-linecap="round"/>' +
      '<path d="M498 196v20" fill="none" stroke="' + (plugged ? '#ffd84f' : '#8798bd') + '" stroke-width="10" stroke-linecap="round"/>' +
      '<defs><linearGradient id="bootGrad" x1="0" x2="1"><stop offset="0%" stop-color="#ff6b6b"/><stop offset="100%" stop-color="#58e46f"/></linearGradient></defs>' +
      '</svg>' +
      '<div class="drop-zone onoff-wall-socket ' + (plugged ? "filled" : "") + '" data-zone="wall-plug"><strong>Wall Plug</strong><p>' + (plugged ? "Connected!" : "Drop plug here") + '</p></div>' +
      '</div>';
  }

  app.lessons.onoff = { start: start, render: render, handleDrop: handleDrop, showMap: showMap };
})();
