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
    app.state.fun = Object.assign({}, app.state.fun, {
      mode: "keyboard",
      timers: [],
      typingScore: 0,
      typingTarget: makeTarget(),
      typingLives: 3,
      typingSpeed: 0.7,
    });
    h.addFunTimer(setInterval(tick, 90), "interval");
    render();
  }

  function tick() {
    if (app.state.fun.mode !== "keyboard" || !app.state.fun.typingTarget) return;
    app.state.fun.typingTarget.y += app.state.fun.typingSpeed;
    var token = document.getElementById("typingDrop");
    if (token) token.style.top = app.state.fun.typingTarget.y + "%";
    if (app.state.fun.typingTarget.y >= 70) {
      app.state.fun.typingLives -= 1;
      h.showFeedback("Too slow!", "error");
      if (app.state.fun.typingLives <= 0) {
        finish(false);
        return;
      }
      nextRound(false);
    }
  }

  function render() {
    var target = app.state.fun.typingTarget;
    var hearts = "";
    var i;
    for (i = 0; i < app.state.fun.typingLives; i++) hearts += "💖";
    
    var keyboardHtml = rows.map(function(row) {
      var rowHtml = row.split("").map(function(letter) {
        var cls = letter === target.letter ? "typing-key-glow" : "";
        return '<button class="typing-key ' + cls + '" type="button" data-key="' + letter + '">' + letter + '</button>';
      }).join("");
      return '<div class="typing-row">' + rowHtml + '</div>';
    }).join("");

    app.dom.gameArea.innerHTML = '<div class="game-card">' + h.getCardHeader('<span class="pill">Hit ' + app.state.fun.typingScore + ' / 8</span><span class="pill">Hearts ' + hearts + '</span>', "backToFun", "⬅ Fun Zone") + h.getMissionStrip("Typing Race!", "Watch the falling letter. Tap the same big key.", [{ label: "Match 8 letters", done: app.state.fun.typingScore >= 8 }]) +
      '<div class="arcade-board typing-board">' +
        '<div class="typing-stage">' +
          '<div class="typing-cloud">Tap this letter!</div>' +
          '<div class="typing-drop" id="typingDrop" style="left:' + target.x + '%;top:' + target.y + '%;">' + target.letter + '</div>' +
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
    if (backBtn) backBtn.addEventListener("click", function() { app.funGames.hub.start(); });
    
    var keys = app.dom.gameArea.querySelectorAll("[data-key]");
    for (i = 0; i < keys.length; i++) {
       (function(btn) {
         btn.addEventListener("click", function() { pressKey(btn.dataset.key); });
       })(keys[i]);
    }
  }

  function pressKey(letter) {
    if (app.state.fun.mode !== "keyboard") return;
    if (letter === app.state.fun.typingTarget.letter) {
      app.state.fun.typingScore += 1;
      app.processAction('BUMP_STARS', { amount: 1 });
      h.showFeedback("Yes! " + letter, "success");
      if (app.state.fun.typingScore >= 8) {
        finish(true);
        return;
      }
      nextRound(true);
      return;
    }
    var drop = document.getElementById("typingDrop");
    if (drop) {
      drop.classList.remove("typing-bounce");
      void drop.offsetWidth;
      drop.classList.add("typing-bounce");
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
    h.showFeedback(win ? "Typing winner!" : "Race over!", win ? "success" : "info");
    if (win) h.spawnConfetti(26, false);
    h.addFunTimer(setTimeout(function() { app.funGames.hub.start(); }, 700), "timeout");
  }

  app.funGames.keyboard = { start: start, render: render };
})();
