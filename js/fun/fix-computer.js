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
    });
    h.addFunTimer(setInterval(tick, 36), "interval");
    render();
  }

  function tick() {
    if (app.state.fun.mode !== "fix") return;
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
        render();
        h.spawnConfetti(30, false);
        h.addFunTimer(setTimeout(function() {
          h.showFeedback("Computer ready!", "success");
          app.funGames.hub.start();
        }, 800), "timeout");
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
