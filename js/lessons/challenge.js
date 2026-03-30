(function () {
  const app = window.ICTApp;
  const { challengeRounds, challengeTargets } = app.data;
  const h = app.helpers;

  function start() {
    app.state.challenge = { round: 0, lives: 3, streak: 0, best: 0 };
    render();
  }

  function render() {
    const challenge = app.state.challenge;
    const round = challengeRounds[challenge.round];
    if (challenge.round >= challengeRounds.length || challenge.lives <= 0) {
      const win = challenge.round >= challengeRounds.length;
      app.dom.gameArea.innerHTML = `<div class="game-card">${h.getCardHeader(`<span class="pill">Teacher Says Finale</span><span class="pill">Best streak ${challenge.best}</span>`)}<div class="win-panel"><h3>${win ? "Challenge Island complete!" : "Challenge over!"}</h3><p>${win ? "You finished all 10 rounds." : "No more lives. Try again."}</p><div class="lesson-plan"><div class="lesson-chip">Rounds cleared ${challenge.round}</div><div class="lesson-chip">Best streak ${challenge.best}</div></div></div></div>`;
      h.bindBackToMap();
      if (win) h.completeGame("challenge");
      return;
    }

    app.dom.gameArea.innerHTML = `<div class="game-card">${h.getCardHeader(`<span class="pill">Estimated 10 to 12 minutes</span><span class="pill">Round ${challenge.round + 1} / ${challengeRounds.length}</span>`)}${h.getMissionStrip("Island Missions", "Tap when teacher says. Wait on trick rounds.", [{ label: "Watch carefully", done: false }, { label: "Build a streak", done: false }, { label: "Protect your 3 lives", done: false }])}<div class="teacher-layout"><div class="teacher-stage"><div class="teacher-icon">${round.says ? "🧑‍🏫" : "🤫"}</div><h3 class="teacher-command">${round.prompt}</h3><p class="teacher-subtext">${round.says ? "Teacher says it. Tap." : "No teacher says. Wait."}</p><div class="lesson-plan"><div class="lesson-chip">Lives ${"❤️".repeat(challenge.lives)}</div><div class="lesson-chip">Streak ${challenge.streak}</div><div class="lesson-chip">Best ${challenge.best}</div></div></div><div class="teacher-targets challenge-grid">${h.shuffleArray([...challengeTargets]).map((target) => `<button class="teacher-target" type="button" data-challenge-choice="${target.id}"><span class="sort-icon">${target.emoji}</span><span>${target.label}</span></button>`).join("")}</div></div></div>`;
    h.bindBackToMap();
    app.dom.gameArea.querySelectorAll("[data-challenge-choice]").forEach((button) => button.addEventListener("click", () => handleChoice(button.dataset.challengeChoice, button)));
  }

  function handleChoice(choice, button) {
    const round = challengeRounds[app.state.challenge.round];
    if (choice === round.answer) {
      app.state.challenge.streak += 1;
      app.state.challenge.best = Math.max(app.state.challenge.best, app.state.challenge.streak);
      app.state.challenge.round += 1;
      h.bumpStars(2);
      button.classList.add("good");
      h.showFeedback(round.says ? "Teacher really said it!" : "Great waiting!", "success");
    } else {
      app.state.challenge.lives -= 1;
      app.state.challenge.streak = 0;
      button.classList.add("bad");
      if (app.state.challenge.lives > 0) app.state.challenge.round += 1;
      h.showFeedback("Careful! That was a trick.", "error");
    }
    app.state.challenge.best = Math.max(app.state.challenge.best, app.state.challenge.streak);
    setTimeout(render, 350);
  }

  app.lessons.challenge = { start, render };
})();
