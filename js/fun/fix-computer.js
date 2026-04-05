(function () {
  var app = window.ICTApp;
  var h = app.helpers;

  var bootStages = [
    { label: "Wake up!", text: "Tap when the dot is in the green zone.", zoneStart: 62, zoneEnd: 80 },
    { label: "Loading drivers...", text: "Wait... now tap in the green.", zoneStart: 18, zoneEnd: 35 },
    { label: "Starting system...", text: "One more good tap.", zoneStart: 56, zoneEnd: 72 },
    { label: "Opening desktop...", text: "Final tap for GO!", zoneStart: 28, zoneEnd: 46 },
  ];

  function start() {
    h.clearFunTimers();
    app.state.fun = Object.assign({}, app.state.fun, {
      mode: "fix",
      timers: [],
      bootStage: 0,
      bootCursor: 0,
      bootDirection: 1,
      bootErrors: 0,
      bootWinFlash: false,
      bootCelebration: false,
    });
    h.addFunTimer(setInterval(tick, 36), "interval");
    render();
  }

  function tick() {
    if (app.state.fun.mode !== "fix" || app.state.fun.bootCelebration) return;
    app.state.fun.bootCursor += app.state.fun.bootDirection * 2.3;
    if (app.state.fun.bootCursor >= 100 || app.state.fun.bootCursor <= 0) {
      app.state.fun.bootDirection *= -1;
      if (app.state.fun.bootCursor > 100) app.state.fun.bootCursor = 100;
      if (app.state.fun.bootCursor < 0) app.state.fun.bootCursor = 0;
    }
    var dot = document.getElementById("bootDot");
    if (dot) dot.style.left = app.state.fun.bootCursor + "%";
  }

  function render() {
    var completed = app.state.fun.bootStage >= bootStages.length;
    var stage = bootStages[Math.min(app.state.fun.bootStage, bootStages.length - 1)];
    var progress = Math.round((Math.min(app.state.fun.bootStage, bootStages.length) / bootStages.length) * 100);

    if (app.state.fun.bootCelebration) {
      app.dom.gameArea.innerHTML = '<div class="game-card">' + h.getCardHeader('<span class="pill">Boot complete</span><span class="pill">Computer ready</span>', "backToFun", "⬅ Fun Zone") + h.getMissionStrip("Boot-Up Sequence", "You started the computer!", [{ label: "Boot complete", done: true }]) +
        '<div class="arcade-board boot-board">' +
          '<div class="boot-screen boot-celebration-screen">' +
            '<div class="boot-celebration-art">' +
              '<svg viewBox="0 0 420 260" class="fun-svg" aria-hidden="true">' +
                '<defs><linearGradient id="bootGlow" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#9af6ff"/><stop offset="100%" stop-color="#5cd6ff"/></linearGradient></defs>' +
                '<circle cx="210" cy="128" r="92" fill="rgba(255,255,255,0.14)"/>' +
                '<circle cx="210" cy="128" r="66" fill="rgba(255,216,79,0.18)" class="boot-celebration-pulse"/>' +
                '<rect x="88" y="42" width="196" height="126" rx="26" fill="#2f5aa8"/>' +
                '<rect x="104" y="58" width="164" height="94" rx="18" fill="url(#bootGlow)"/>' +
                '<path d="M126 78c26-16 84-14 118 12-32 6-82 9-118-12z" fill="#ffffff" opacity=".24"/>' +
                '<circle cx="166" cy="106" r="8" fill="#244667"/>' +
                '<circle cx="206" cy="106" r="8" fill="#244667"/>' +
                '<path d="M154 126q28 20 60 0" fill="none" stroke="#244667" stroke-linecap="round" stroke-width="8"/>' +
                '<rect x="176" y="170" width="22" height="28" rx="10" fill="#355da6"/>' +
                '<rect x="144" y="194" width="86" height="14" rx="7" fill="#243d66"/>' +
                '<g class="boot-celebration-loader"><circle cx="314" cy="86" r="18" fill="none" stroke="#fff3b0" stroke-width="8" stroke-dasharray="24 14"/></g>' +
                '<g class="boot-celebration-stars"><circle cx="118" cy="36" r="8" fill="#ffd84f"/><circle cx="304" cy="34" r="7" fill="#ff8fb5"/><circle cx="328" cy="162" r="6" fill="#9dff93"/><circle cx="92" cy="168" r="6" fill="#9af6ff"/></g>' +
              '</svg>' +
            '</div>' +
            '<div class="boot-copy">' +
              '<div class="boot-title">Computer ready!</div>' +
              '<div class="boot-subtitle">Great job. The boot-up is finished and the screen is glowing.</div>' +
            '</div>' +
            '<div class="boot-error-box boot-celebration-box">Beep beep! Click the button when you want to go back.</div>' +
            '<button class="big-choice calm-button boot-button" type="button" id="bootCelebrateBtn">Back To Fun Zone</button>' +
          '</div>' +
        '</div>' +
      '</div>';
      bindCelebrationButtons();
      return;
    }
    
    app.dom.gameArea.innerHTML = '<div class="game-card">' + h.getCardHeader('<span class="pill">Stage ' + Math.min(app.state.fun.bootStage + 1, bootStages.length) + ' / ' + bootStages.length + '</span><span class="pill">Oops ' + app.state.fun.bootErrors + '</span>', "backToFun", "⬅ Fun Zone") + h.getMissionStrip("Boot-Up Sequence", completed ? "The computer is ready!" : stage.text, [{ label: "Tap in the green zone", done: completed }, { label: "Start the computer", done: progress >= 100 }]) +
      '<div class="arcade-board boot-board">' +
        '<div class="boot-screen ' + (app.state.fun.bootWinFlash ? "boot-screen-win" : "") + '">' +
          '<div class="boot-screen-top">' +
            '<div class="boot-computer-art">' +
              '<svg viewBox="0 0 220 180" class="fun-svg" aria-hidden="true">' +
                '<rect x="36" y="18" width="148" height="102" rx="20" fill="#2f5aa8"/>' +
                '<rect x="48" y="30" width="124" height="78" rx="14" fill="#8be6ff"/>' +
                '<circle cx="84" cy="68" r="10" fill="#fff3b0"/>' +
                '<circle cx="112" cy="68" r="10" fill="#fff3b0"/>' +
                '<path d="M77 88q35 24 70 0" fill="none" stroke="#fff" stroke-linecap="round" stroke-width="8"/>' +
                '<rect x="92" y="122" width="36" height="18" rx="8" fill="#ffcd70"/>' +
                '<rect x="72" y="140" width="76" height="12" rx="6" fill="#8aa6d6"/>' +
              '</svg>' +
            '</div>' +
            '<div class="boot-copy">' +
              '<div class="boot-title">' + (completed ? "Computer ready!" : stage.label) + '</div>' +
              '<div class="boot-subtitle">' + (completed ? "Happy beeps! The screen is awake." : "Tap the big button when the light is green.") + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="boot-meter">' +
            '<div class="boot-zone" style="left:' + stage.zoneStart + '%;width:' + (stage.zoneEnd - stage.zoneStart) + '%;"></div>' +
            '<div class="boot-dot" id="bootDot" style="left:' + app.state.fun.bootCursor + '%;"></div>' +
          '</div>' +
          '<div class="boot-progress">' +
            '<div class="boot-progress-fill" style="width:' + progress + '%;"></div>' +
          '</div>' +
          '<button class="big-choice calm-button boot-button" type="button" id="bootTapBtn">TAP TO BOOT</button>' +
          '<div class="boot-error-box" id="bootErrorBox">' + (app.state.fun.bootLastError || "Ready to start!") + '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
    
    var backBtn = document.getElementById("backToFun");
    if (backBtn) backBtn.addEventListener("click", function() { app.funGames.hub.start(); });
    
    var tapBtn = document.getElementById("bootTapBtn");
    if (tapBtn) tapBtn.addEventListener("click", pressBoot);
  }

  function bindCelebrationButtons() {
    var backBtn = document.getElementById("backToFun");
    if (backBtn) backBtn.addEventListener("click", function() { app.funGames.hub.start(); });
    var celebrateBtn = document.getElementById("bootCelebrateBtn");
    if (celebrateBtn) celebrateBtn.addEventListener("click", function() { app.funGames.hub.start(); });
  }

  function pressBoot() {
    var stage = bootStages[Math.min(app.state.fun.bootStage, bootStages.length - 1)];
    var hit = app.state.fun.bootCursor >= stage.zoneStart && app.state.fun.bootCursor <= stage.zoneEnd;
    if (hit) {
      app.state.fun.bootStage += 1;
      app.state.fun.bootCursor = 0;
      app.state.fun.bootDirection = 1;
      app.state.fun.bootLastError = "Nice timing!";
      app.processAction('BUMP_STARS', { amount: 2 });
      h.showFeedback("Boot step clear!", "success");
      if (app.state.fun.bootStage >= bootStages.length) {
        app.state.fun.bootWinFlash = true;
        app.state.fun.bootCelebration = true;
        render();
        h.spawnConfetti(30, false);
        h.showFeedback("Computer ready!", "success");
        return;
      }
      render();
      return;
    }
    app.state.fun.bootErrors += 1;
    var errorMessages = ["Oops! Blue screen of giggles!", "Beep boop... try again!", "Funny error! Tap in the green."];
    app.state.fun.bootLastError = errorMessages[app.state.fun.bootErrors % 3];
    h.showFeedback("Funny error!", "error");
    var box = document.getElementById("bootErrorBox");
    if (box) {
      box.classList.remove("boot-error-shake");
      void box.offsetWidth;
      box.classList.add("boot-error-shake");
      box.textContent = app.state.fun.bootLastError;
    }
  }

  app.funGames.fix = { start: start, render: render };
})();
