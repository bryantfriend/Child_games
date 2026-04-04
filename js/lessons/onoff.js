(function () {
  var app = window.ICTApp;
  var wakeTargets = app.data.onoffWakeTargets;
  var onoffSteps = app.data.onoffSteps;
  var onoffScenarios = app.data.onoffScenarios;
  var routineRounds = app.data.onoffRoutineRounds;
  var routineChoices = app.data.onoffRoutineChoices;
  var h = app.helpers;

  function start() {
    app.state.onoff = {
      mission: 1,
      wakeHits: [],
      stepOrder: [],
      holdPhase: "turn_on",
      holdValue: 0,
      holdTimer: null,
      scenarioIndex: 0,
      routineIndex: 0,
      routineLives: 3,
      routineStreak: 0
    };
    render();
  }

  function render() {
    var state = app.state.onoff;
    var missions = [
      { label: "1. Wake the computer", done: state.mission > 1 },
      { label: "2. Put steps in order", done: state.mission > 2 },
      { label: "3. Hold power on and off", done: state.mission > 3 },
      { label: "4. Make safe choices", done: state.mission > 4 },
      { label: "5. Class routine challenge", done: state.mission > 5 }
    ];
    var body = "";

    if (state.mission === 1) body = renderWakeMission();
    else if (state.mission === 2) body = renderStepsMission();
    else if (state.mission === 3) body = renderHoldMission();
    else if (state.mission === 4) body = renderScenarioMission();
    else if (state.mission === 5) body = renderRoutineMission();
    else body = '<div class="win-panel onoff-win"><h3>Lesson 2 complete!</h3><p>You can turn a computer on and off the safe way.</p><button class="big-choice output-choice calm-button" type="button" id="backToMenuBtn">Back to Menu</button></div>';

    app.dom.gameArea.innerHTML = '<div class="game-card">' + h.getCardHeader('<span class="pill">Lesson 2</span><span class="pill">35 to 40 min</span>', "backToMenu", "⬅ Menu") + h.getMissionStrip("Turning a Computer On / Off", "Tap, drag, hold, and choose the safe next step.", missions) + body + '</div>';
    bindMenuBack();
    bindMissionEvents();
  }

  function renderWakeMission() {
    var slots = wakeTargets.map(function(target) {
      var done = app.state.onoff.wakeHits.indexOf(target.id) !== -1;
      return '<div class="drop-zone onoff-wake-slot ' + (done ? "filled" : "") + '" data-zone="' + target.id + '">' +
        '<strong>' + target.label + '</strong><p>' + (done ? "Ready!" : target.hint) + '</p></div>';
    }).join("");
    var cards = h.shuffleArray(wakeTargets.slice()).map(function(target) {
      var used = app.state.onoff.wakeHits.indexOf(target.id) !== -1;
      return '<div class="draggable-item ' + (used ? "placed" : "") + '" data-kind="onoff-wake" data-id="' + target.id + '">' +
        '<span class="draggable-item-emoji">' + target.emoji + '</span><div><strong>' + target.label + '</strong><div>' + target.hint + '</div></div></div>';
    }).join("");

    return '<div class="build-layout">' +
      '<div class="computer-board"><div class="onoff-hero-card">' + computerScene(app.state.onoff.wakeHits.indexOf("button") !== -1, app.state.onoff.wakeHits.indexOf("screen") !== -1) +
      '<div class="onoff-speech">Drag the 3 power steps to wake the computer.</div></div><div class="drop-zone-grid onoff-wake-grid">' + slots + '</div></div>' +
      '<div class="tray"><div class="pill">Mission 1 of 5</div><div class="draggable-list">' + cards + '</div><p class="hint">Drag each card to its matching power spot.</p></div>' +
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
      '<div class="tray"><div class="pill">Mission 2 of 5</div><div class="draggable-list">' + cards + '</div><p class="hint">Drag the steps into the correct order.</p></div>' +
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
      '<div class="lesson-plan"><div class="lesson-chip">Phase: ' + (phase === "turn_on" ? "Turn On" : "Turn Off") + '</div><div class="lesson-chip">Hold: ' + meter + '%</div></div>' +
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

    var menuBtn = document.getElementById("backToMenuBtn");
    if (menuBtn) menuBtn.addEventListener("click", function() { app.renderMainMenu(); });
  }

  function bindMany(selector, binder) {
    var nodes = app.dom.gameArea.querySelectorAll(selector);
    var i;
    for (i = 0; i < nodes.length; i++) binder(nodes[i]);
  }

  function handleDrop(kind, id, target) {
    if (kind === "onoff-wake") {
      if (!target || target.dataset.zone !== id) {
        h.showFeedback("Try the matching power spot.", "error");
        return;
      }
      if (app.state.onoff.wakeHits.indexOf(id) === -1) {
        app.state.onoff.wakeHits.push(id);
      }
      app.processAction('BUMP_STARS', { amount: 2 });
      if (app.state.onoff.wakeHits.length >= wakeTargets.length) {
        app.state.onoff.mission = 2;
        h.showFeedback("The computer is waking up!", "success");
      } else {
        h.showFeedback("Great match!", "success");
      }
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
      app.state.onoff.mission = 3;
      h.showFeedback("Boot steps complete!", "success");
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
    app.state.onoff.mission = 4;
    app.state.onoff.holdValue = 100;
    h.showFeedback("Power practice done!", "success");
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
      app.state.onoff.mission = 5;
      h.showFeedback("Safe choices mastered!", "success");
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
        app.processAction('COMPLETE_GAME', { id: "onoff" });
        app.state.onoff.mission = 6;
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

  app.lessons.onoff = { start: start, render: render, handleDrop: handleDrop };
})();
