(function () {
  const app = window.ICTApp;
  const { moodChoices, emojiGameRounds, calmSteps } = app.data;
  const { showFeedback, bumpStars, spawnConfetti, setIslandAccess, updateRenderHooks } = app.helpers;

  function renderWelcome() {
    app.state.currentGame = null;
    app.dom.panelTitle.textContent = "Welcome, explorer!";
    app.dom.panelSubtitle.textContent =
      app.state.checkIn.path === "pick" ? "First, choose a face." :
      app.state.checkIn.path === "emoji" ? "Face game time." :
      app.state.checkIn.path === "mindful" ? "Calm body. Calm mind." :
      "You are ready to start.";
    setIslandAccess();

    if (app.state.checkIn.path === "pick") {
      app.dom.gameArea.innerHTML = `<div class="welcome-card"><div class="welcome-stack"><strong>😊</strong><h3>How are you?</h3><p class="hero-text">Tap the face that feels right.</p><div class="emoji-grid">${moodChoices.map((mood) => `<button class="emoji-choice" type="button" data-mood="${mood.id}"><span class="emoji-face">${mood.emoji}</span><span>${mood.label}</span></button>`).join("")}</div></div></div>`;
      app.dom.gameArea.querySelectorAll("[data-mood]").forEach((button) => button.addEventListener("click", () => handleMoodChoice(button.dataset.mood)));
      return;
    }

    if (app.state.checkIn.path === "emoji") {
      const round = emojiGameRounds[app.state.checkIn.emojiRound];
      const mood = moodChoices.find((entry) => entry.id === app.state.checkIn.mood);
      app.dom.gameArea.innerHTML = `<div class="welcome-card"><div class="welcome-stack"><strong>${mood?.emoji || "😄"}</strong><h3>Emoji Game</h3><p class="hero-text">Tap this face: <span class="target-emoji">${round.target}</span></p><div class="emoji-grid mini-game-grid">${app.helpers.shuffleArray([...round.options]).map((emoji) => `<button class="emoji-choice emoji-target" type="button" data-emoji-game="${emoji}"><span class="emoji-face">${emoji}</span></button>`).join("")}</div><div class="lesson-plan"><div class="lesson-chip">Round ${app.state.checkIn.emojiRound + 1} / ${emojiGameRounds.length}</div></div></div></div>`;
      app.dom.gameArea.querySelectorAll("[data-emoji-game]").forEach((button) => button.addEventListener("click", () => handleEmojiGame(button.dataset.emojiGame)));
      return;
    }

    if (app.state.checkIn.path === "mindful") {
      const step = calmSteps[app.state.checkIn.calmStep];
      app.dom.gameArea.innerHTML = `<div class="welcome-card"><div class="welcome-stack"><strong>${step.emoji}</strong><h3>Calm Time</h3><p class="hero-text">${step.title}</p><div class="mindful-bubble"><div class="bubble-ring"></div><div class="bubble-core">${step.emoji}</div></div><p class="question-text">${step.text}</p><button class="big-choice input-choice calm-button" type="button" id="calmNextBtn">Done</button><div class="lesson-plan"><div class="lesson-chip">Step ${app.state.checkIn.calmStep + 1} / ${calmSteps.length}</div></div></div></div>`;
      document.getElementById("calmNextBtn")?.addEventListener("click", handleCalmStep);
      return;
    }

    app.dom.gameArea.innerHTML = `<div class="welcome-card"><div class="welcome-stack"><strong>🌴</strong><h3>Adventure Map Ready</h3><p class="hero-text">Nice job. Now pick an island.</p><div class="lesson-plan"><div class="lesson-chip">Build</div><div class="lesson-chip">Sort</div><div class="lesson-chip">Choose</div><div class="lesson-chip">Teacher Says</div><div class="lesson-chip">Fun Zone</div></div><button class="big-choice output-choice calm-button" type="button" id="startLessonBtn">Start Lesson</button></div></div>`;
    document.getElementById("startLessonBtn")?.addEventListener("click", () => showFeedback("Pick an island to play!", "success"));
  }

  function handleMoodChoice(moodId) {
    const mood = moodChoices.find((entry) => entry.id === moodId);
    app.state.checkIn.mood = mood.id;
    app.state.checkIn.emojiRound = 0;
    app.state.checkIn.calmStep = 0;
    app.state.checkIn.path = mood.path;
    showFeedback(mood.path === "emoji" ? "Let’s play a face game!" : "Let’s get calm first.", "info");
    renderWelcome();
    updateRenderHooks();
  }

  function handleEmojiGame(choice) {
    const round = emojiGameRounds[app.state.checkIn.emojiRound];
    if (choice !== round.target) {
      showFeedback("Try again!", "error");
      return;
    }
    bumpStars(1);
    showFeedback("Yes! Nice face!", "success");
    app.state.checkIn.emojiRound += 1;
    if (app.state.checkIn.emojiRound >= emojiGameRounds.length) {
      app.state.checkIn.path = "done";
      app.state.checkIn.ready = true;
      spawnConfetti(28, false);
      showFeedback("You are ready to learn!", "success");
    }
    renderWelcome();
    updateRenderHooks();
  }

  function handleCalmStep() {
    bumpStars(1);
    showFeedback("Good calm job.", "success");
    app.state.checkIn.calmStep += 1;
    if (app.state.checkIn.calmStep >= calmSteps.length) {
      app.state.checkIn.path = "done";
      app.state.checkIn.ready = true;
      spawnConfetti(20, false);
      showFeedback("Now you are ready.", "success");
    }
    renderWelcome();
    updateRenderHooks();
  }

  app.checkin.renderWelcome = renderWelcome;
})();
