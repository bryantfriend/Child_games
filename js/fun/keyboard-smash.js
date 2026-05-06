(function () {
  var app = window.ICTApp;
  var h = app.helpers;
  var rows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
  var letterPool = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  function start() {
    h.clearFunTimers();
    detachKeyboard();
    app.state.fun = Object.assign({}, app.state.fun, {
      mode: "keyboard",
      timers: [],
      typingMode: null,
      typingFinished: false,
      typingScore: 0,
      typingSecondsLeft: 0,
      typingLastKey: "",
      typingWpm: 0,
      typingProgress: "",
      typingPrompt: "",
      typingLevel: 1,
      typingTargetHits: 0,
      typingHitsThisLevel: 0,
      typingInput: "",
      typingSentenceIndex: 0,
      typingCharsTyped: 0
    });
    render();
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
    if (app.state.fun.typingMode === "levels") {
      renderLevelMode();
      return;
    }
    renderSentenceMode();
  }

  function renderModePicker() {
    app.dom.gameArea.innerHTML = '<div class="game-card"><div class="welcome-card typing-mode-screen"><div class="welcome-stack"><strong>⌨️</strong><h3>Choose your typing game</h3><p class="hero-text">Play 30-second levels or try sentence typing for a WPM score.</p><div class="lesson-menu-grid typing-mode-grid"><button class="lesson-menu-card typing-mode-card" type="button" data-typing-mode="levels"><span class="lesson-menu-emoji">🎮</span><strong>Levels</strong><span>Level 1 has 1 letter, level 2 has 2 letters, and so on.</span></button><button class="lesson-menu-card typing-mode-card" type="button" data-typing-mode="60"><span class="lesson-menu-emoji">⏱️</span><strong>1 Minute</strong><span>Type short random sentences for a WPM score.</span></button><button class="lesson-menu-card typing-mode-card" type="button" data-typing-mode="180"><span class="lesson-menu-emoji">🏁</span><strong>3 Minutes</strong><span>Longer sentence race for a steadier WPM score.</span></button></div><div class="choice-row"><button class="big-choice output-choice calm-button" type="button" id="typingModeBackBtn">Back To Fun Zone</button></div></div></div></div>';
    bindButtons("[data-typing-mode]", function (btn) {
      btn.addEventListener("click", function () { beginMode(btn.dataset.typingMode); });
    });
    var backBtn = document.getElementById("typingModeBackBtn");
    if (backBtn) backBtn.addEventListener("click", function () { app.funGames.hub.start(); });
  }

  function beginMode(mode) {
    h.clearFunTimers();
    detachKeyboard();
    app.state.fun.typingMode = mode;
    app.state.fun.typingFinished = false;
    app.state.fun.typingScore = 0;
    app.state.fun.typingLastKey = "";
    app.state.fun.typingWpm = 0;
    app.state.fun.typingCharsTyped = 0;
    if (mode === "levels") {
      app.state.fun.typingLevel = 1;
      app.state.fun.typingTargetHits = 0;
      app.state.fun.typingHitsThisLevel = 0;
      app.state.fun.typingSecondsLeft = 30;
      setLevelPrompt();
      h.addFunTimer(setInterval(tickLevels, 1000), "interval");
    } else {
      app.state.fun.typingSecondsLeft = Number(mode);
      app.state.fun.typingSentenceIndex = 0;
      app.state.fun.typingInput = "";
      setSentencePrompt();
      h.addFunTimer(setInterval(tickTimedSentence, 1000), "interval");
    }
    attachKeyboard();
    render();
  }

  function renderLevelMode() {
    var prompt = app.state.fun.typingPrompt;
    var progress = app.state.fun.typingProgress;
    var tiles = prompt.split("").map(function (letter, index) {
      var done = index < progress.length ? "typing-seq-done" : "";
      var current = index === progress.length ? "typing-seq-current" : "";
      return '<div class="typing-seq-tile ' + done + ' ' + current + '">' + letter + '</div>';
    }).join("");
    app.dom.gameArea.innerHTML = '<div class="game-card">' +
      h.getCardHeader('<span class="pill">Level ' + app.state.fun.typingLevel + '</span><span class="pill">Time ' + formatSeconds(app.state.fun.typingSecondsLeft) + '</span><span class="pill">Clears ' + app.state.fun.typingHitsThisLevel + '</span>', "backToFun", "⬅ Fun Zone") +
      h.getMissionStrip("Typing Race Levels", "Type the letters in order. Each level lasts 30 seconds.", [{ label: "Match the pattern", done: false }, { label: "Level " + app.state.fun.typingLevel, done: false }]) +
      '<div class="arcade-board typing-board">' +
        '<div class="typing-stage typing-stage-levels">' +
          '<div class="typing-cloud">Tap or type the pattern!</div>' +
          '<div class="typing-helper-pill">Current pattern</div>' +
          '<div class="typing-last-key">Last key: ' + (app.state.fun.typingLastKey || "None yet") + '</div>' +
          '<div class="typing-seq-board">' + tiles + '</div>' +
          '<div class="typing-seq-progress">' + (progress || "Start typing") + '</div>' +
          levelKidSvg() +
        '</div>' +
        renderKeyboard(prompt.charAt(progress.length)) +
      '</div></div>';
    bindGameplayButtons();
  }

  function renderSentenceMode() {
    var prompt = app.state.fun.typingPrompt;
    var input = app.state.fun.typingInput;
    var display = prompt.split("").map(function (char, index) {
      var typed = input.charAt(index);
      var cls = "";
      if (!typed) cls = "typing-char-upcoming";
      else if (typed === char) cls = "typing-char-correct";
      else cls = "typing-char-wrong";
      return '<span class="typing-char ' + cls + '">' + escapeHtml(char === " " ? "·" : char) + '</span>';
    }).join("");

    app.dom.gameArea.innerHTML = '<div class="game-card">' +
      h.getCardHeader('<span class="pill">Sentences</span><span class="pill">Time ' + formatSeconds(app.state.fun.typingSecondsLeft) + '</span><span class="pill">Score ' + app.state.fun.typingScore + '</span>', "backToFun", "⬅ Fun Zone") +
      h.getMissionStrip("Sentence Typing", "Type the sentence exactly. Use the keyboard or tap the on-screen keys.", [{ label: "Keep typing", done: false }, { label: "WPM at the end", done: false }]) +
      '<div class="arcade-board typing-board">' +
        '<div class="typing-stage typing-stage-sentence">' +
          '<div class="typing-cloud">Type this sentence</div>' +
          '<div class="typing-last-key">Last key: ' + (app.state.fun.typingLastKey || "None yet") + '</div>' +
          '<div class="typing-sentence-card"><div class="typing-sentence-line">' + display + '</div></div>' +
          '<div class="typing-input-line">' + escapeHtml(input || "Start typing...") + '</div>' +
          sentenceKidSvg() +
        '</div>' +
        renderKeyboard(null, true) +
      '</div></div>';
    bindGameplayButtons();
  }

  function bindGameplayButtons() {
    var backBtn = document.getElementById("backToFun");
    if (backBtn) backBtn.addEventListener("click", function () {
      detachKeyboard();
      h.clearFunTimers();
      app.funGames.hub.start();
    });
    bindButtons("[data-key]", function (btn) {
      btn.addEventListener("click", function () {
        pressKey(btn.dataset.key);
      });
    });
  }

  function tickLevels() {
    if (app.state.fun.mode !== "keyboard" || app.state.fun.typingMode !== "levels" || app.state.fun.typingFinished) return;
    app.state.fun.typingSecondsLeft -= 1;
    if (app.state.fun.typingSecondsLeft <= 0) {
      if (app.state.fun.typingLevel >= 6) finishLevels();
      else advanceLevel();
      return;
    }
    render();
  }

  function tickTimedSentence() {
    if (app.state.fun.mode !== "keyboard" || app.state.fun.typingMode === "levels" || app.state.fun.typingFinished) return;
    app.state.fun.typingSecondsLeft -= 1;
    if (app.state.fun.typingSecondsLeft <= 0) {
      finishTimedMode();
      return;
    }
    render();
  }

  function pressKey(key) {
    if (app.state.fun.mode !== "keyboard" || app.state.fun.typingFinished) return;
    app.state.fun.typingLastKey = key;
    if (app.state.fun.typingMode === "levels") handleLevelKey(key);
    else handleSentenceKey(key);
  }

  function handleLevelKey(key) {
    var expected = app.state.fun.typingPrompt.charAt(app.state.fun.typingProgress.length);
    if (key === expected) {
      app.state.fun.typingProgress += key;
      app.state.fun.typingScore += 1;
      app.processAction('BUMP_STARS', { amount: 1 });
      h.showFeedback("Nice! " + key, "success");
      if (app.state.fun.typingProgress === app.state.fun.typingPrompt) {
        app.state.fun.typingHitsThisLevel += 1;
        app.state.fun.typingTargetHits += 1;
        setLevelPrompt();
      }
      render();
      return;
    }
    h.showFeedback("Wrong letter!", "error");
    app.state.fun.typingProgress = "";
    render();
  }

  function handleSentenceKey(key) {
    if (key === "BACKSPACE") {
      app.state.fun.typingInput = app.state.fun.typingInput.slice(0, -1);
      render();
      return;
    }
    if (key === "SPACE") key = " ";
    var nextIndex = app.state.fun.typingInput.length;
    var expected = app.state.fun.typingPrompt.charAt(nextIndex);
    app.state.fun.typingInput += key;
    app.state.fun.typingCharsTyped += 1;
    if (key === expected) {
      app.state.fun.typingScore += 1;
      app.processAction('BUMP_STARS', { amount: 1 });
      h.showFeedback("Good typing!", "success");
      if (app.state.fun.typingInput === app.state.fun.typingPrompt) {
        setSentencePrompt();
      }
    } else {
      h.showFeedback("Oops, try the next letter carefully.", "error");
    }
    render();
  }

  function setLevelPrompt() {
    app.state.fun.typingPrompt = makePattern(app.state.fun.typingLevel);
    app.state.fun.typingProgress = "";
  }

  function setSentencePrompt() {
    var source = app.data.typingSentences || defaultSentences();
    app.state.fun.typingPrompt = source[Math.floor(Math.random() * source.length)].toUpperCase();
    app.state.fun.typingInput = "";
  }

  function advanceLevel() {
    h.showFeedback("Level " + app.state.fun.typingLevel + " done!", "success");
    app.state.fun.typingLevel += 1;
    app.state.fun.typingHitsThisLevel = 0;
    app.state.fun.typingSecondsLeft = 30;
    setLevelPrompt();
    render();
  }

  function finishLevels() {
    h.clearFunTimers();
    detachKeyboard();
    app.state.fun.typingFinished = true;
    app.state.fun.typingWpm = 0;
    h.spawnConfetti(28, false);
    h.showFeedback("Typing levels complete!", "success");
    render();
  }

  function finishTimedMode() {
    h.clearFunTimers();
    detachKeyboard();
    app.state.fun.typingFinished = true;
    app.state.fun.typingWpm = calculateWpm(Number(app.state.fun.typingMode));
    h.showFeedback("Time is up!", "success");
    render();
  }

  function renderFinishScreen() {
    var body = app.state.fun.typingMode === "levels"
      ? '<p class="hero-text">You reached <strong>Level ' + app.state.fun.typingLevel + '</strong>.</p><p class="hero-text">Correct keys: <strong>' + app.state.fun.typingScore + '</strong></p>'
      : '<p class="hero-text">Correct keys: <strong>' + app.state.fun.typingScore + '</strong></p><p class="hero-text">Estimated WPM: <strong>' + app.state.fun.typingWpm + ' WPM</strong></p>';
    app.dom.gameArea.innerHTML = '<div class="game-card"><div class="welcome-card typing-mode-screen"><div class="welcome-stack"><strong>🎉</strong><h3>Typing Race done!</h3>' + body + '<div class="choice-row"><button class="big-choice input-choice" type="button" id="typingPlayAgainBtn">Play Again</button><button class="big-choice output-choice calm-button" type="button" id="typingFinishBackBtn">Back To Fun Zone</button></div></div></div></div>';
    var againBtn = document.getElementById("typingPlayAgainBtn");
    if (againBtn) againBtn.addEventListener("click", function () {
      app.state.fun.typingMode = null;
      app.state.fun.typingFinished = false;
      render();
    });
    var backBtn = document.getElementById("typingFinishBackBtn");
    if (backBtn) backBtn.addEventListener("click", function () { app.funGames.hub.start(); });
  }

  function renderKeyboard(glowLetter, includeUtility) {
    var keyboardHtml = rows.map(function (row) {
      return '<div class="typing-row">' + row.split("").map(function (letter) {
        var cls = letter === glowLetter ? "typing-key-glow" : "";
        return '<button class="typing-key ' + cls + '" type="button" data-key="' + letter + '">' + letter + '</button>';
      }).join("") + '</div>';
    }).join("");
    if (includeUtility) {
      keyboardHtml += '<div class="typing-row typing-row-wide"><button class="typing-key typing-key-wide" type="button" data-key="SPACE">SPACE</button><button class="typing-key typing-key-wide typing-key-back" type="button" data-key="BACKSPACE">⌫</button></div>';
    }
    return '<div class="typing-keyboard">' + keyboardHtml + '</div>';
  }

  function attachKeyboard() {
    if (app.state.fun.typingKeyHandler) return;
    app.state.fun.typingKeyHandler = function (event) {
      var key = String(event.key || "");
      if (key === "Backspace") {
        event.preventDefault();
        pressKey("BACKSPACE");
        return;
      }
      if (key === " ") {
        event.preventDefault();
        pressKey("SPACE");
        return;
      }
      key = key.toUpperCase();
      if (!/^[A-Z]$/.test(key)) return;
      event.preventDefault();
      pressKey(key);
    };
    window.addEventListener("keydown", app.state.fun.typingKeyHandler);
  }

  function detachKeyboard() {
    if (!app.state.fun || !app.state.fun.typingKeyHandler) return;
    window.removeEventListener("keydown", app.state.fun.typingKeyHandler);
    app.state.fun.typingKeyHandler = null;
  }

  function makePattern(size) {
    var text = "";
    var i;
    for (i = 0; i < size; i++) {
      text += letterPool.charAt(Math.floor(Math.random() * letterPool.length));
    }
    return text;
  }

  function calculateWpm(totalSeconds) {
    var minutes = totalSeconds / 60;
    return Math.max(1, Math.round((app.state.fun.typingScore / 5) / minutes));
  }

  function formatSeconds(seconds) {
    var mins = Math.floor(seconds / 60);
    var secs = seconds % 60;
    return mins + ":" + (secs < 10 ? "0" : "") + secs;
  }

  function bindButtons(selector, fn) {
    var nodes = app.dom.gameArea.querySelectorAll(selector);
    var i;
    for (i = 0; i < nodes.length; i++) fn(nodes[i]);
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function levelKidSvg() {
    return '<svg class="fun-svg typing-kid" viewBox="0 0 220 160" aria-hidden="true">' +
      '<circle cx="60" cy="68" r="28" fill="#ffd6ad"/>' +
      '<path d="M34 58q24-34 54-8v16H34z" fill="#7a4a24"/>' +
      '<circle cx="51" cy="70" r="4" fill="#2c2c45"/><circle cx="71" cy="70" r="4" fill="#2c2c45"/>' +
      '<path d="M50 85q11 9 22 0" fill="none" stroke="#ff7aa5" stroke-linecap="round" stroke-width="4"/>' +
      '<rect x="86" y="78" width="100" height="54" rx="18" fill="#6fd3ff"/><rect x="98" y="90" width="76" height="28" rx="10" fill="#fff4b7"/>' +
      '<path d="M104 138q18-26 36 0M150 138q18-26 36 0" fill="none" stroke="#4c6fa8" stroke-linecap="round" stroke-width="10"/>' +
    '</svg>';
  }

  function sentenceKidSvg() {
    return '<svg class="fun-svg typing-kid" viewBox="0 0 220 160" aria-hidden="true">' +
      '<circle cx="66" cy="70" r="30" fill="#ffd6ad"/><path d="M36 60q26-34 60-8v16H36z" fill="#6d4c41"/>' +
      '<circle cx="56" cy="72" r="4" fill="#2c2c45"/><circle cx="76" cy="72" r="4" fill="#2c2c45"/>' +
      '<path d="M54 88q12 10 24 0" fill="none" stroke="#ff7aa5" stroke-linecap="round" stroke-width="4"/>' +
      '<rect x="98" y="76" width="90" height="60" rx="18" fill="#8de77c"/><rect x="108" y="88" width="70" height="20" rx="8" fill="#ffffff"/>' +
      '<rect x="112" y="114" width="62" height="10" rx="5" fill="#ffd84f"/>' +
    '</svg>';
  }

  function defaultSentences() {
    return [
      "I CAN TYPE MY NAME",
      "THE MOUSE CAN CLICK",
      "THE SCREEN IS BRIGHT",
      "I LIKE COMPUTER CLASS",
      "WE LEARN ICT TODAY",
      "THE KEYBOARD HELPS ME",
      "I CAN OPEN A FILE",
      "THE PRINTER MAKES PAPER"
    ];
  }

  app.funGames.keyboard = { start: start, render: render };
})();
