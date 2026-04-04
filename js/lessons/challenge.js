(function () {
  var app = window.ICTApp;
  var challengeRounds = app.data.challengeRounds;
  var challengeTargets = app.data.challengeTargets;
  var h = app.helpers;

  function start() {
    app.state.challenge = { round: 0, lives: 3, streak: 0, best: 0, mission: 1 };
    render();
  }

  function render() {
    var challenge = app.state.challenge;
    var round = challengeRounds[challenge.round];
    
    if (challenge.lives <= 0) {
      app.dom.gameArea.innerHTML = '<div class="win-panel"><h3>Try again!</h3><p>You ran out of lives. Let\'s go back to the map.</p><button class="back-button" type="button" id="backToMap">⬅ Map</button></div>';
      h.bindBackToMap();
      return;
    }

    if (challenge.round >= challengeRounds.length) {
      app.dom.gameArea.innerHTML = '<div class="win-panel"><h3>Challenge Island complete!</h3><p>You are a teacher\'s says pro!</p></div>';
      h.bindBackToMap();
      return;
    }

    var targetsHtml = h.shuffleArray(challengeTargets.slice()).map(function(target) {
      return '<button class="teacher-target" type="button" data-challenge-choice="' + target.id + '"><span class="sort-icon">' + target.emoji + '</span><span>' + target.label + '</span></button>';
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
      if (app.state.challenge.round >= challengeRounds.length) {
         app.processAction('COMPLETE_GAME', { id: "challenge" });
      }
    } else {
      app.state.challenge.lives -= 1;
      app.state.challenge.streak = 0;
      h.showFeedback("Wrong! Wait or look closer.", "error");
      if (button) {
        button.classList.add("shake");
        setTimeout(function() { button.classList.remove("shake"); }, 500);
      }
    }
    render();
  }

  app.lessons.challenge = { start: start, render: render };
})();
