(function () {
  var app = window.ICTApp;
  var h = app.helpers;

  var rows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

  function makeTarget() {
    var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return {
      letter: letters[Math.floor(Math.random() * letters.length)],
      x: 10 + Math.random() * 70,
      y: -6,
    };
  }

  function start() {
    h.clearFunTimers();
    detachPhysicalKeyboard();
    app.state.fun = Object.assign({}, app.state.fun, {
      mode: "keyboard",
      timers: [],
      typingMode: null,
      typingSecondsLeft: 0,
      typingScore: 0,
      typingTarget: makeTarget(),
      typingLives: 5,
      typingSpeed: 0.7,
      typingLastKey: "",
      typingFinished: false,
      typingWpm: 0,
    });
    render();
  }

  function tick() {
    if (app.state.fun.mode !== "keyboard" || !app.state.fun.typingTarget || !app.state.fun.typingMode || app.state.fun.typingFinished) return;
    app.state.fun.typingTarget.y += app.state.fun.typingSpeed;
    var token = document.getElementById("typingDrop");
    if (token) token.style.top = app.state.fun.typingTarget.y + "%";
    if (app.state.fun.typingTarget.y >= 70) {
      h.showFeedback("Too slow!", "error");
      nextRound(false);
    }
  }

  function render() {
    if (!app.state.fun.typingMode) {
      renderModePicker();
      return;
    }
    if (app.state.fun.typingFinished) {
      renderFinishScreen();
      return;
    }
    var target = app.state.fun.typingTarget;
    var hearts = "";
    var i;
    for (i = 0; i < app.state.fun.typingLives; i++) hearts += "💖";
    var statusText = app.state.fun.typingMode === "unlimited"
      ? '<span class="pill">Hearts ' + hearts + '</span>'
      : '<span class="pill">Time ' + formatSeconds(app.state.fun.typingSecondsLeft) + '</span>';
    
    var keyboardHtml = rows.map(function(row) {
      var rowHtml = row.split("").map(function(letter) {
        var cls = letter === target.letter ? "typing-key-glow" : "";
        return '<button class="typing-key ' + cls + '" type="button" data-key="' + letter + '">' + letter + '</button>';
      }).join("");
      return '<div class="typing-row">' + rowHtml + '</div>';
    }).join("");

    app.dom.gameArea.innerHTML = '<div class="game-card">' + h.getCardHeader('<span class="pill">Hits ' + app.state.fun.typingScore + '</span>' + statusText, "backToFun", "⬅ Fun Zone") + h.getMissionStrip("Typing Race!", app.state.fun.typingMode === "unlimited" ? "Tap or type the letter. Wrong letters cost a heart." : "Tap or type the letter before time runs out.", [{ label: app.state.fun.typingMode === "unlimited" ? "Keep your hearts" : "Type fast for a WPM score", done: false }]) +
      '<div class="arcade-board typing-board">' +
        '<div class="typing-stage">' +
          '<div class="typing-cloud">Tap or type this letter!</div>' +
          '<div class="typing-drop" id="typingDrop" style="left:' + target.x + '%;top:' + target.y + '%;">' + target.letter + '</div>' +
          '<div class="typing-helper-pill">Keyboard key: ' + target.letter + '</div>' +
          '<div class="typing-last-key">Last key: ' + (app.state.fun.typingLastKey || "None yet") + '</div>' +
          '<svg class="fun-svg typing-kid" viewBox="0 0 220 160" aria-hidden="true">' +
            '<circle cx="60" cy="68" r="28" fill="#ffd6ad"/>' +
            '<path d="M34 58q24-34 54-8v16H34z" fill="#7a4a24"/>' +
            '<circle cx="51" cy="70" r="4" fill="#2c2c45"/>' +
            '<circle cx="71" cy="70" r="4" fill="#2c2c45"/>' +
            '<path d="M50 85q11 9 22 0" fill="none" stroke="#ff7aa5" stroke-linecap="round" stroke-width="4"/>' +
            '<rect x="86" y="78" width="100" height="54" rx="18" fill="#6fd3ff"/>' +
            '<rect x="94" y="88" width="84" height="32" rx="12" fill="#fff"/>' +
            '<circle cx="156" cy="104" r="8" fill="#ffd84f"/>' +
            '<path d="M103 140q18-30 36 0M151 140q18-30 36 0" fill="none" stroke="#4c6fa8" stroke-linecap="round" stroke-width="10"/>' +
          '</svg>' +
        '</div>' +
        '<div class="typing-keyboard">' + keyboardHtml + '</div>' +
      '</div>' +
    '</div>';
    
    var backBtn = document.getElementById("backToFun");
    if (backBtn) backBtn.addEventListener("click", function() {
      detachPhysicalKeyboard();
      h.clearFunTimers();
      app.funGames.hub.start();
    });
    
    var keys = app.dom.gameArea.querySelectorAll("[data-key]");
    for (i = 0; i < keys.length; i++) {
       (function(btn) {
         btn.addEventListener("click", function() { pressKey(btn.dataset.key); });
       })(keys[i]);
    }
  }

  function pressKey(letter) {
    if (app.state.fun.mode !== "keyboard" || !app.state.fun.typingMode || app.state.fun.typingFinished) return;
    app.state.fun.typingLastKey = letter;
    if (letter === app.state.fun.typingTarget.letter) {
      app.state.fun.typingScore += 1;
      app.processAction('BUMP_STARS', { amount: 1 });
      h.showFeedback("Yes! " + letter, "success");
      nextRound(true);
      render();
      return;
    }
    var drop = document.getElementById("typingDrop");
    if (drop) {
      drop.classList.remove("typing-bounce");
      void drop.offsetWidth;
      drop.classList.add("typing-bounce");
    }
    if (app.state.fun.typingMode === "unlimited") {
      app.state.fun.typingLives -= 1;
      if (app.state.fun.typingLives <= 0) {
        finish(false);
        return;
      }
      render();
    }
    h.showFeedback("Wrong key!", "error");
  }

  function nextRound(success) {
    app.state.fun.typingSpeed = Math.min(1.5, app.state.fun.typingSpeed + (success ? 0.08 : 0.03));
    app.state.fun.typingTarget = makeTarget();
    render();
  }

  function finish(win) {
    h.clearFunTimers();
    detachPhysicalKeyboard();
    app.state.fun.typingFinished = true;
    if (app.state.fun.typingMode !== "unlimited") {
      app.state.fun.typingWpm = genericWpm();
    }
    h.showFeedback(win ? "Typing winner!" : "Race over!", win ? "success" : "info");
    if (win) h.spawnConfetti(26, false);
    render();
  }

  function attachPhysicalKeyboard() {
    if (app.state.fun.typingKeyHandler) return;
    app.state.fun.typingKeyHandler = function(event) {
      var key = String(event.key || "").toUpperCase();
      if (!/^[A-Z]$/.test(key)) return;
      event.preventDefault();
      pressKey(key);
    };
    window.addEventListener("keydown", app.state.fun.typingKeyHandler);
  }

  function detachPhysicalKeyboard() {
    if (!app.state.fun || !app.state.fun.typingKeyHandler) return;
    window.removeEventListener("keydown", app.state.fun.typingKeyHandler);
    app.state.fun.typingKeyHandler = null;
  }

  function renderModePicker() {
    app.dom.gameArea.innerHTML = '<div class="game-card"><div class="welcome-card typing-mode-screen"><div class="welcome-stack"><strong>⌨️</strong><h3>Choose your time</h3><p class="hero-text">Pick 1 minute, 3 minutes, or unlimited hearts mode.</p><div class="lesson-menu-grid typing-mode-grid"><button class="lesson-menu-card typing-mode-card" type="button" data-typing-mode="60"><span class="lesson-menu-emoji">⏱️</span><strong>1 Minute</strong><span>Quick race with a WPM score at the end.</span></button><button class="lesson-menu-card typing-mode-card" type="button" data-typing-mode="180"><span class="lesson-menu-emoji">🏁</span><strong>3 Minutes</strong><span>Longer typing race with a WPM score.</span></button><button class="lesson-menu-card typing-mode-card" type="button" data-typing-mode="unlimited"><span class="lesson-menu-emoji">💖</span><strong>Unlimited</strong><span>Start with 5 hearts. Wrong letters lose hearts.</span></button></div><div class="choice-row"><button class="big-choice output-choice calm-button" type="button" id="typingModeBackBtn">Back To Fun Zone</button></div></div></div></div>';
    var modeBtns = app.dom.gameArea.querySelectorAll("[data-typing-mode]");
    var i;
    for (i = 0; i < modeBtns.length; i++) {
      (function(btn) {
        btn.addEventListener("click", function() {
          beginMode(btn.dataset.typingMode);
        });
      })(modeBtns[i]);
    }
    var backBtn = document.getElementById("typingModeBackBtn");
    if (backBtn) backBtn.addEventListener("click", function() { app.funGames.hub.start(); });
  }

  function beginMode(mode) {
    app.state.fun.typingMode = mode;
    app.state.fun.typingScore = 0;
    app.state.fun.typingLastKey = "";
    app.state.fun.typingFinished = false;
    app.state.fun.typingTarget = makeTarget();
    app.state.fun.typingSpeed = 0.7;
    app.state.fun.typingLives = 5;
    app.state.fun.typingSecondsLeft = mode === "unlimited" ? 0 : Number(mode);
    h.clearFunTimers();
    h.addFunTimer(setInterval(tick, 90), "interval");
    if (mode !== "unlimited") {
      h.addFunTimer(setInterval(tickClock, 1000), "interval");
    }
    attachPhysicalKeyboard();
    render();
  }

  function tickClock() {
    if (app.state.fun.mode !== "keyboard" || app.state.fun.typingFinished || app.state.fun.typingMode === "unlimited") return;
    app.state.fun.typingSecondsLeft -= 1;
    if (app.state.fun.typingSecondsLeft <= 0) {
      app.state.fun.typingSecondsLeft = 0;
      finish(true);
      return;
    }
    render();
  }

  function renderFinishScreen() {
    var body = app.state.fun.typingMode === "unlimited"
      ? '<p class="hero-text">You typed <strong>' + app.state.fun.typingScore + '</strong> correct letters.</p><p class="hero-text">Hearts left: <strong>' + repeatHearts(app.state.fun.typingLives) + '</strong></p>'
      : '<p class="hero-text">You typed <strong>' + app.state.fun.typingScore + '</strong> correct letters.</p><p class="hero-text">Generic WPM score: <strong>' + app.state.fun.typingWpm + ' WPM</strong></p>';
    app.dom.gameArea.innerHTML = '<div class="game-card"><div class="welcome-card typing-mode-screen"><div class="welcome-stack"><strong>🎉</strong><h3>Typing Race done!</h3>' + body + '<div class="choice-row"><button class="big-choice input-choice" type="button" id="typingPlayAgainBtn">Play Again</button><button class="big-choice output-choice calm-button" type="button" id="typingFinishBackBtn">Back To Fun Zone</button></div></div></div></div>';
    var againBtn = document.getElementById("typingPlayAgainBtn");
    if (againBtn) againBtn.addEventListener("click", function() {
      app.state.fun.typingMode = null;
      app.state.fun.typingFinished = false;
      render();
    });
    var backBtn = document.getElementById("typingFinishBackBtn");
    if (backBtn) backBtn.addEventListener("click", function() { app.funGames.hub.start(); });
  }

  function genericWpm() {
    var minutes = Number(app.state.fun.typingMode) / 60;
    return Math.max(1, Math.round((app.state.fun.typingScore / 5) / minutes));
  }

  function formatSeconds(seconds) {
    var mins = Math.floor(seconds / 60);
    var secs = seconds % 60;
    return mins + ":" + (secs < 10 ? "0" : "") + secs;
  }

  function repeatHearts(count) {
    var text = "";
    var i;
    for (i = 0; i < count; i++) text += "💖";
    return text || "0";
  }

  app.funGames.keyboard = { start: start, render: render };
})();
