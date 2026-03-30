(function () {
  const app = window.ICTApp = window.ICTApp || {};

  app.state = {
    stars: 0,
    completed: new Set(),
    currentGame: null,
    feedbackTimeout: null,
    drag: null,
    build: {},
    input: {},
    output: {},
    challenge: {},
    fun: { timers: [] },
    sillyTaps: 0,
    checkIn: { mood: null, path: "pick", emojiRound: 0, calmStep: 0, ready: false },
  };

  app.lessons = {};
  app.funGames = {};
  app.checkin = {};

  app.dom = {
    gameArea: document.getElementById("gameArea"),
    panelTitle: document.getElementById("panelTitle"),
    panelSubtitle: document.getElementById("panelSubtitle"),
    starCount: document.getElementById("starCount"),
    completedCount: document.getElementById("completedCount"),
    feedbackBanner: document.getElementById("feedbackBanner"),
    confettiLayer: document.getElementById("confettiLayer"),
  };

  function shuffleArray(items) {
    for (let index = items.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
    }
    return items;
  }

  function pickRandom(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function renderIcon(item, className = "") {
    if (item.asset) {
      return `<img src="${item.asset}" alt="${item.label}" class="svg-icon ${className}">`;
    }
    return `<span class="${className}">${item.emoji}</span>`;
  }

  function playTone(tone) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!playTone.context) playTone.context = new AudioContextClass();
    const context = playTone.context;
    if (context.state === "suspended") context.resume().catch(() => {});
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.connect(gain);
    gain.connect(context.destination);
    const now = context.currentTime;
    const notes = { success: [660, 880], error: [220, 180], info: [520, 620] };
    (notes[tone] || notes.info).forEach((frequency, index) => oscillator.frequency.setValueAtTime(frequency, now + index * 0.08));
    oscillator.type = tone === "error" ? "square" : "triangle";
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    oscillator.start(now);
    oscillator.stop(now + 0.3);
  }

  function spawnConfetti(count, bigBurst) {
    const layer = app.dom.confettiLayer;
    if (!layer) return;
    for (let index = 0; index < count; index += 1) {
      const piece = document.createElement("div");
      piece.className = "confetti-piece";
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = app.data.confettiColors[index % app.data.confettiColors.length];
      piece.style.animationDuration = `${bigBurst ? 2.6 + Math.random() * 1.2 : 1.4 + Math.random() * 0.9}s`;
      piece.style.animationDelay = `${Math.random() * 0.25}s`;
      piece.style.transform = `rotate(${Math.random() * 360}deg) scale(${0.7 + Math.random() * 0.8})`;
      layer.appendChild(piece);
      setTimeout(() => piece.remove(), 4200);
    }
  }

  function showFeedback(message, tone) {
    const banner = app.dom.feedbackBanner;
    banner.textContent = message;
    banner.className = `feedback-banner show feedback-${tone}${tone === "success" ? " party" : ""}`;
    playTone(tone);
    clearTimeout(app.state.feedbackTimeout);
    app.state.feedbackTimeout = setTimeout(() => { banner.className = "feedback-banner"; }, 1500);
  }

  function clearFunTimers() {
    (app.state.fun.timers || []).forEach((timer) => {
      if (timer.kind === "timeout") clearTimeout(timer.id);
      else clearInterval(timer.id);
    });
    app.state.fun.timers = [];
  }

  function addFunTimer(id, kind) {
    app.state.fun.timers.push({ id, kind });
    return id;
  }

  function setIslandAccess() {
    document.querySelectorAll(".island-card").forEach((button) => {
      const needsCheckIn = !app.state.checkIn.ready;
      const needsStars = button.dataset.game === "fun" && app.state.stars < 100;
      const locked = needsCheckIn || needsStars;
      button.disabled = locked;
      button.classList.toggle("locked-island", locked);
    });
  }

  function updateScoreboard() {
    app.dom.starCount.textContent = String(app.state.stars);
    app.dom.completedCount.textContent = `${app.state.completed.size} / 4`;
    setIslandAccess();
    if (app.state.stars === 100) {
      showFeedback("Fun Zone unlocked!", "success");
      spawnConfetti(60, true);
    }
  }

  function bumpStars(amount) {
    app.state.stars += amount;
    updateScoreboard();
  }

  function completeGame(id) {
    if (!app.state.completed.has(id)) {
      app.state.completed.add(id);
      app.state.stars += 25;
      updateScoreboard();
      showFeedback("Island complete! +25 stars!", "success");
      spawnConfetti(42, true);
    }
  }

  function getCardHeader(extra = "", backId = "backToMap", label = "⬅ Map") {
    return `<div class="card-header"><button class="back-button" type="button" id="${backId}">${label}</button><div class="progress-row">${extra}</div></div>`;
  }

  function getMissionStrip(title, text, missions) {
    return `<div class="mission-strip"><div><h3>${title}</h3><p>${text}</p></div><div class="lesson-plan">${missions.map((mission) => `<div class="lesson-chip ${mission.done ? "chip-done" : ""}">${mission.label}</div>`).join("")}</div></div>`;
  }

  function bindBackToMap() {
    document.getElementById("backToMap")?.addEventListener("click", () => {
      clearFunTimers();
      app.checkin.renderWelcome();
      updateRenderHooks();
    });
  }

  function buildRenderState() {
    return {
      mode: app.state.currentGame || "map",
      stars: app.state.stars,
      completed: Array.from(app.state.completed),
      build: { mission: app.state.build.mission || 0, placed: { ...(app.state.build.placed || {}) }, matched: [...(app.state.build.matched || [])], promptIndex: app.state.build.promptIndex || 0 },
      input: { mission: app.state.input.mission || 0, remaining: (app.state.input.remaining || []).map((item) => item.id), scenarioIndex: app.state.input.scenarioIndex || 0, rushIndex: app.state.input.rushIndex || 0, rushScore: app.state.input.rushScore || 0, rushCurrent: app.state.input.rushQueue?.[app.state.input.rushIndex]?.id || null },
      output: { mission: app.state.output.mission || 0, questionIndex: app.state.output.questionIndex || 0, scenarioIndex: app.state.output.scenarioIndex || 0, badges: app.state.output.badges || 0 },
      challenge: { round: app.state.challenge.round || 0, lives: app.state.challenge.lives || 0, streak: app.state.challenge.streak || 0, best: app.state.challenge.best || 0 },
      fun: { mode: app.state.fun.mode || "hub", unlocked: app.state.stars >= 100, mouseScore: app.state.fun.mouseScore || 0, keyboardLeft: app.state.fun.keyboardLeft?.length || 0, fixStage: app.state.fun.fixStage || 0, bugsLeft: app.state.fun.bugs?.length || 0, power: app.state.fun.power || 0 },
      checkIn: { mood: app.state.checkIn.mood, path: app.state.checkIn.path, emojiRound: app.state.checkIn.emojiRound, calmStep: app.state.checkIn.calmStep, ready: app.state.checkIn.ready },
      sillyTaps: app.state.sillyTaps,
      note: "DOM app with top-left origin. State records lesson progress, Fun Zone unlock state, moving arcade targets, and the opening check-in.",
    };
  }

  function updateRenderHooks() {
    window.render_game_to_text = () => JSON.stringify(buildRenderState());
    window.advanceTime = (ms) => ms;
  }

  app.helpers = {
    shuffleArray,
    pickRandom,
    renderIcon,
    showFeedback,
    bumpStars,
    completeGame,
    updateScoreboard,
    spawnConfetti,
    playTone,
    setIslandAccess,
    getCardHeader,
    getMissionStrip,
    bindBackToMap,
    clearFunTimers,
    addFunTimer,
    updateRenderHooks,
  };
})();
