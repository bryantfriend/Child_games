(function () {
  var app = window.ICTApp;
  var challengeRounds = app.data.challengeRounds;
  var challengeTargets = app.data.challengeTargets;
  var h = app.helpers;
  var speakTimer = null;

  function start() {
    app.state.challenge = { round: 0, lives: 3, streak: 0, best: 0, mission: 1, lastSpokenRound: -1 };
    stopSpeech();
    render();
  }

  function render() {
    var challenge = app.state.challenge;
    var round = challengeRounds[challenge.round];
    
    if (challenge.lives <= 0) {
      stopSpeech();
      app.dom.gameArea.innerHTML = '<div class="win-panel"><h3>Try again!</h3><p>You ran out of lives. Let\'s go back to the map.</p><button class="back-button" type="button" id="backToMap">⬅ Map</button></div>';
      h.bindBackToMap();
      return;
    }

    if (challenge.round >= challengeRounds.length) {
      stopSpeech();
      app.dom.gameArea.innerHTML = '<div class="win-panel"><h3>Challenge Island complete!</h3><p>You are a teacher\'s says pro!</p></div>';
      h.bindBackToMap();
      return;
    }

    var targetsHtml = h.shuffleArray(challengeTargets.slice()).map(function(target) {
      return '<button class="teacher-target" type="button" data-challenge-choice="' + target.id + '">' + h.renderIcon(target, "sort-icon") + '<span>' + target.label + '</span></button>';
    }).join("");

    app.dom.gameArea.innerHTML = '<div class="game-card">' + h.getCardHeader('<span class="pill">Estimated 10-12 min</span><span class="pill">Round ' + (challenge.round + 1) + ' / ' + challengeRounds.length + '</span>') + h.getMissionStrip("Island Missions", "Tap when teacher says. Wait on trick rounds.", [{ label: "Watch carefully", done: false }, { label: "Build a streak", done: false }, { label: "Protect your 3 lives", done: false }]) + '<div class="teacher-layout"><div class="teacher-stage"><div class="teacher-icon">' + (round.says ? "🧑‍🏫" : "🤫") + '</div><h3 class="teacher-command">' + round.prompt + '</h3><p class="teacher-subtext">' + (round.says ? "Teacher says it. Tap." : "No teacher says. Wait.") + '</p><div class="lesson-plan"><div class="lesson-chip">Lives ' + "❤️".repeat(challenge.lives) + '</div><div class="lesson-chip">Streak ' + challenge.streak + '</div><div class="lesson-chip">Best ' + challenge.best + '</div></div></div><div class="teacher-targets challenge-grid">' + targetsHtml + '</div></div></div>';
    
    h.bindBackToMap();
    
    var choiceBtns = app.dom.gameArea.querySelectorAll("[data-challenge-choice]");
    var i;
    for (i = 0; i < choiceBtns.length; i++) {
       (function(btn) {
         btn.addEventListener("click", function() { handleChoice(btn.dataset.challengeChoice, btn); });
       })(choiceBtns[i]);
    }

    speakRound(round);
  }

  function handleChoice(id, button) {
    var round = challengeRounds[app.state.challenge.round];
    var isCorrect = false;

    if (round.says) {
      if (id === round.answer) isCorrect = true;
    } else {
      if (id === "wait") isCorrect = true;
    }

    if (isCorrect) {
      app.state.challenge.streak += 1;
      if (app.state.challenge.streak > app.state.challenge.best) app.state.challenge.best = app.state.challenge.streak;
      app.processAction('BUMP_STARS', { amount: 2 });
      h.showFeedback("YES!", "success");
      h.spawnConfetti(5, false);
      app.state.challenge.round += 1;
      app.state.challenge.lastSpokenRound = -1;
      if (app.state.challenge.round >= challengeRounds.length) {
         app.processAction('COMPLETE_GAME', { id: "challenge" });
      }
    } else {
      app.state.challenge.lives -= 1;
      app.state.challenge.streak = 0;
      h.showFeedback("Wrong! Wait or look closer.", "error");
      speakText(getCorrectionLine(round));
      if (button) {
        button.classList.add("shake");
        setTimeout(function() { button.classList.remove("shake"); }, 500);
      }
    }
    render();
  }

  function speakRound(round) {
    if (!round) return;
    if (app.state.challenge.lastSpokenRound === app.state.challenge.round) return;
    app.state.challenge.lastSpokenRound = app.state.challenge.round;
    speakText(round.prompt);
  }

  function getCorrectionLine(round) {
    if (!round) return "Try again.";
    if (round.says) {
      return "Close. Teacher says, " + cleanPrompt(round.prompt);
    }
    return "Oops, teacher did not say. Remember to tap wait if the teacher did not say.";
  }

  function cleanPrompt(text) {
    return String(text || "").replace(/^Teacher says\s*/i, "").replace(/\!+$/, "").trim() + ".";
  }

  function pickVoice() {
    var synth = window.speechSynthesis;
    if (!synth || !synth.getVoices) return null;
    var voices = synth.getVoices();
    if (!voices || !voices.length) return null;
    var best = null;
    var i;
    for (i = 0; i < voices.length; i++) {
      if (/en/i.test(voices[i].lang) && /female|samantha|zira|aria|google us english/i.test((voices[i].name || "").toLowerCase())) {
        best = voices[i];
        break;
      }
    }
    if (!best) {
      for (i = 0; i < voices.length; i++) {
        if (/en/i.test(voices[i].lang)) {
          best = voices[i];
          break;
        }
      }
    }
    return best || voices[0];
  }

  function stopSpeech() {
    if (speakTimer) {
      clearTimeout(speakTimer);
      speakTimer = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  function speakText(text) {
    stopSpeech();
    if (!("speechSynthesis" in window) || !window.SpeechSynthesisUtterance) return;
    speakTimer = setTimeout(function() {
      var utterance = new window.SpeechSynthesisUtterance(text);
      var voice = pickVoice();
      utterance.voice = voice;
      utterance.rate = 0.92;
      utterance.pitch = 1.18;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
      speakTimer = null;
    }, 150);
  }

  app.lessons.challenge = { start: start, render: render };
})();
