const state = {
  stars: 0,
  completed: new Set(),
  currentGame: null,
  feedbackTimeout: null,
  drag: null,
  build: {},
  input: {},
  output: {},
  challenge: {},
  fun: {},
  sillyTaps: 0,
  checkIn: {
    mood: null,
    path: "pick",
    emojiRound: 0,
    calmStep: 0,
    ready: false,
  },
};

const games = {
  build: {
    title: "Computer Island",
    subtitle: "Build, match, and tap.",
    duration: "8 to 10 minutes",
  },
  input: {
    title: "Input Island",
    subtitle: "Sort, choose, and go fast.",
    duration: "8 to 10 minutes",
  },
  output: {
    title: "Output Island",
    subtitle: "Name it and choose it.",
    duration: "8 to 10 minutes",
  },
  challenge: {
    title: "Challenge Island",
    subtitle: "Listen, tap, or wait.",
    duration: "10 to 12 minutes",
  },
  fun: {
    title: "Fun Zone",
    subtitle: "Bonus games unlocked!",
    duration: "Free play",
  },
};

const buildParts = [
  { id: "monitor", label: "Monitor", emoji: "🖥️", hint: "Shows pictures", zone: "monitor" },
  { id: "keyboard", label: "Keyboard", emoji: "⌨️", hint: "Helps you type", zone: "keyboard" },
  { id: "mouse", label: "Mouse", emoji: "🖱️", hint: "Moves and clicks", zone: "mouse" },
  { id: "system", label: "Computer", emoji: "🧰", hint: "Runs the computer", zone: "system" },
];

const buildFunctions = [
  { id: "type", label: "Type", emoji: "✍️", target: "keyboard" },
  { id: "see", label: "See", emoji: "👀", target: "monitor" },
  { id: "click", label: "Click", emoji: "👉", target: "mouse" },
  { id: "think", label: "Brain", emoji: "⚙️", target: "system" },
];

const buildPrompts = [
  { clue: "Tap the part we use to TYPE.", answer: "keyboard" },
  { clue: "Tap the part that SHOWS the work.", answer: "monitor" },
  { clue: "Tap the part that MOVES the arrow.", answer: "mouse" },
  { clue: "Tap the COMPUTER.", answer: "system" },
  { clue: "Tap the part you usually look AT.", answer: "monitor" },
];

const sortDeck = [
  { id: "keyboard", label: "Keyboard", emoji: "⌨️", type: "input" },
  { id: "mouse", label: "Mouse", emoji: "🖱️", type: "input" },
  { id: "microphone", label: "Microphone", emoji: "🎤", type: "input" },
  { id: "webcam", label: "Webcam", emoji: "📷", type: "input" },
  { id: "touchscreen", label: "Touch Screen", emoji: "📱", type: "input" },
  { id: "speaker", label: "Speaker", emoji: "🔊", type: "output" },
  { id: "monitor", label: "Monitor", emoji: "🖥️", type: "output" },
  { id: "printer", label: "Printer", emoji: "🖨️", type: "output" },
  { id: "projector", label: "Projector", emoji: "📽️", type: "output" },
  { id: "headphones", label: "Headphones", emoji: "🎧", type: "output" },
];

const inputScenarios = [
  { text: "Voice in?", answer: "input" },
  { text: "Music out?", answer: "output" },
  { text: "Type name?", answer: "input" },
  { text: "See picture?", answer: "output" },
  { text: "Photo in?", answer: "input" },
  { text: "Print page?", answer: "output" },
];

const outputQuestions = [
  { item: "Keyboard", emoji: "⌨️", prompt: "What does it do?", correct: "Type", options: ["Type", "Hear", "Sleep"] },
  { item: "Mouse", emoji: "🖱️", prompt: "What does it do?", correct: "Move", options: ["Move", "Print", "Sing"] },
  { item: "Monitor", emoji: "🖥️", prompt: "What does it do?", correct: "See", options: ["See", "Eat", "Jump"] },
  { item: "Speaker", emoji: "🔊", prompt: "What does it do?", correct: "Hear", options: ["Hear", "Type", "Photo"] },
  { item: "Printer", emoji: "🖨️", prompt: "What does it do?", correct: "Print", options: ["Print", "Talk", "Record"] },
  { item: "Microphone", emoji: "🎤", prompt: "What does it do?", correct: "Talk", options: ["Talk", "See", "Dance"] },
  { item: "Webcam", emoji: "📷", prompt: "What does it do?", correct: "Photo", options: ["Photo", "Music", "Move"] },
  { item: "Headphones", emoji: "🎧", prompt: "What does it do?", correct: "Hear", options: ["Hear", "Print", "Food"] },
];

const outputScenarios = [
  { text: "Big wall video?", correct: "Projector", options: ["Projector", "Mouse", "Keyboard"] },
  { text: "Hear story?", correct: "Headphones", options: ["Headphones", "Printer", "Webcam"] },
  { text: "Paper page?", correct: "Printer", options: ["Printer", "Speaker", "Microphone"] },
  { text: "See game?", correct: "Monitor", options: ["Monitor", "Mouse", "Microphone"] },
  { text: "Play music?", correct: "Speaker", options: ["Speaker", "Keyboard", "Touch Screen"] },
  { text: "Take class photo?", correct: "Webcam", options: ["Webcam", "Printer", "Speaker"] },
];

const challengeRounds = [
  { says: true, prompt: "Teacher says touch the keyboard!", answer: "keyboard" },
  { says: true, prompt: "Teacher says touch something you can SEE!", answer: "monitor" },
  { says: false, prompt: "Touch the mouse!", answer: "wait" },
  { says: true, prompt: "Teacher says touch something that gives SOUND!", answer: "speaker" },
  { says: true, prompt: "Teacher says touch the microphone!", answer: "microphone" },
  { says: false, prompt: "Touch the monitor!", answer: "wait" },
  { says: true, prompt: "Teacher says touch something used to TYPE!", answer: "keyboard" },
  { says: true, prompt: "Teacher says touch the mouse!", answer: "mouse" },
  { says: false, prompt: "Touch something that prints!", answer: "wait" },
  { says: true, prompt: "Teacher says touch the printer!", answer: "printer" },
];

const challengeTargets = [
  { id: "keyboard", label: "Keyboard", emoji: "⌨️" },
  { id: "mouse", label: "Mouse", emoji: "🖱️" },
  { id: "monitor", label: "Monitor", emoji: "🖥️" },
  { id: "speaker", label: "Speaker", emoji: "🔊" },
  { id: "microphone", label: "Microphone", emoji: "🎤" },
  { id: "printer", label: "Printer", emoji: "🖨️" },
  { id: "wait", label: "Wait!", emoji: "✋" },
];

const moodChoices = [
  { id: "happy", emoji: "😄", label: "Happy", path: "emoji" },
  { id: "excited", emoji: "🤩", label: "Excited", path: "emoji" },
  { id: "okay", emoji: "🙂", label: "Okay", path: "emoji" },
  { id: "sleepy", emoji: "😴", label: "Sleepy", path: "mindful" },
  { id: "sad", emoji: "😢", label: "Sad", path: "mindful" },
  { id: "angry", emoji: "😠", label: "Angry", path: "mindful" },
];

const emojiGameRounds = [
  { target: "😄", options: ["😄", "😎", "😆", "🥳"] },
  { target: "🤩", options: ["🤩", "😴", "😊", "🥰"] },
  { target: "🥳", options: ["🥳", "😢", "😄", "😮"] },
];

const calmSteps = [
  { title: "Smell the flower", emoji: "🌸", text: "Breathe in slow." },
  { title: "Blow the candle", emoji: "🕯️", text: "Breathe out slow." },
  { title: "Stretch your arms", emoji: "👐", text: "Reach up high." },
  { title: "Shake it out", emoji: "✨", text: "Tiny wiggle shake." },
];

const sillyMessages = [
  "Boing! Silly tap!",
  "Splash! A funny fish!",
  "Twinkle! A happy star!",
  "Wiggle wiggle!",
  "Haha! Try the game too!",
];

const confettiColors = ["#ff5d8f", "#ffd84f", "#4cc9f0", "#2ec27e", "#ff8e3c", "#a78bfa"];

const gameArea = document.getElementById("gameArea");
const panelTitle = document.getElementById("panelTitle");
const panelSubtitle = document.getElementById("panelSubtitle");
const starCount = document.getElementById("starCount");
const completedCount = document.getElementById("completedCount");
const feedbackBanner = document.getElementById("feedbackBanner");
const confettiLayer = document.getElementById("confettiLayer");

document.querySelectorAll(".island-card").forEach((button) => {
  button.addEventListener("click", () => openGame(button.dataset.game));
});

bindSillyFriends();
renderWelcome();
updateScoreboard();
updateRenderHooks();

function renderWelcome() {
  state.currentGame = null;
  panelTitle.textContent = "Welcome, explorer!";
  panelSubtitle.textContent =
    state.checkIn.path === "pick" ? "First, choose a face." :
    state.checkIn.path === "emoji" ? "Face game time." :
    state.checkIn.path === "mindful" ? "Calm body. Calm mind." :
    "You are ready to start.";
  setIslandAccess();

  if (state.checkIn.path === "pick") {
    gameArea.innerHTML = `
      <div class="welcome-card">
        <div class="welcome-stack">
          <strong>😊</strong>
          <h3>How are you?</h3>
          <p class="hero-text">Tap the face that feels right.</p>
          <div class="emoji-grid">
            ${moodChoices.map((mood) => `
              <button class="emoji-choice" type="button" data-mood="${mood.id}">
                <span class="emoji-face">${mood.emoji}</span>
                <span>${mood.label}</span>
              </button>
            `).join("")}
          </div>
        </div>
      </div>
    `;
    bindMoodChoices();
    return;
  }

  if (state.checkIn.path === "emoji") {
    const round = emojiGameRounds[state.checkIn.emojiRound];
    gameArea.innerHTML = `
      <div class="welcome-card">
        <div class="welcome-stack">
          <strong>${state.checkIn.mood ? moodChoices.find((m) => m.id === state.checkIn.mood)?.emoji : "😄"}</strong>
          <h3>Emoji Game</h3>
          <p class="hero-text">Tap this face: <span class="target-emoji">${round.target}</span></p>
          <div class="emoji-grid mini-game-grid">
            ${shuffleArray([...round.options]).map((emoji) => `
              <button class="emoji-choice emoji-target" type="button" data-emoji-game="${emoji}">
                <span class="emoji-face">${emoji}</span>
              </button>
            `).join("")}
          </div>
          <div class="lesson-plan">
            <div class="lesson-chip">Round ${state.checkIn.emojiRound + 1} / ${emojiGameRounds.length}</div>
          </div>
        </div>
      </div>
    `;
    bindEmojiGame();
    return;
  }

  if (state.checkIn.path === "mindful") {
    const step = calmSteps[state.checkIn.calmStep];
    gameArea.innerHTML = `
      <div class="welcome-card">
        <div class="welcome-stack">
          <strong>${step.emoji}</strong>
          <h3>Calm Time</h3>
          <p class="hero-text">${step.title}</p>
          <div class="mindful-bubble">
            <div class="bubble-ring"></div>
            <div class="bubble-core">${step.emoji}</div>
          </div>
          <p class="question-text">${step.text}</p>
          <button class="big-choice input-choice calm-button" type="button" id="calmNextBtn">Done</button>
          <div class="lesson-plan">
            <div class="lesson-chip">Step ${state.checkIn.calmStep + 1} / ${calmSteps.length}</div>
          </div>
        </div>
      </div>
    `;
    document.getElementById("calmNextBtn")?.addEventListener("click", handleCalmStep);
    return;
  }

  gameArea.innerHTML = `
    <div class="welcome-card">
      <div class="welcome-stack">
        <strong>🌴</strong>
        <h3>Adventure Map Ready</h3>
        <p class="hero-text">Nice job. Now pick an island.</p>
        <div class="lesson-plan">
          <div class="lesson-chip">Build</div>
          <div class="lesson-chip">Sort</div>
          <div class="lesson-chip">Choose</div>
          <div class="lesson-chip">Teacher Says</div>
        </div>
        <button class="big-choice output-choice calm-button" type="button" id="startLessonBtn">Start Lesson</button>
      </div>
    </div>
  `;
  document.getElementById("startLessonBtn")?.addEventListener("click", () => showFeedback("Pick an island to play!", "success"));
}

function openGame(type) {
  if (!state.checkIn.ready) {
    renderWelcome();
    showFeedback("Pick a face first.", "info");
    return;
  }
  if (type === "fun" && state.stars < 100) {
    showFeedback("Get 100 stars for Fun Zone!", "info");
    return;
  }
  state.currentGame = type;
  panelTitle.textContent = games[type].title;
  panelSubtitle.textContent = `${games[type].subtitle} Estimated time: ${games[type].duration}.`;

  if (type === "build") startBuildGame();
  if (type === "input") startInputGame();
  if (type === "output") startOutputGame();
  if (type === "challenge") startChallengeGame();
  if (type === "fun") startFunZone();

  showFeedback("New island mission!", "info");
  updateRenderHooks();
}

function getCardHeader(extra = "") {
  return `
    <div class="card-header">
      <button class="back-button" type="button" id="backToMap">⬅ Map</button>
      <div class="progress-row">${extra}</div>
    </div>
  `;
}

function getMissionStrip(title, text, missions) {
  return `
    <div class="mission-strip">
      <div>
        <h3>${title}</h3>
        <p>${text}</p>
      </div>
      <div class="lesson-plan">
        ${missions.map((mission) => `<div class="lesson-chip ${mission.done ? "chip-done" : ""}">${mission.label}</div>`).join("")}
      </div>
    </div>
  `;
}

function clearFunTimers() {
  if (state.fun.timerId) {
    clearInterval(state.fun.timerId);
    state.fun.timerId = null;
  }
}

function startFunZone() {
  clearFunTimers();
  state.fun = {
    mode: "hub",
    timerId: null,
    mouseScore: 0,
    mouseSpeed: 0,
    cheeseVisible: false,
    keyboardLeft: [],
    fixLeft: [],
    bugsLeft: [],
    screenTime: 15,
    power: 0,
  };
  renderFunZone();
}

function renderFunZone() {
  const mode = state.fun.mode || "hub";

  if (mode === "hub") {
    gameArea.innerHTML = `
      <div class="game-card">
        ${getCardHeader(`<span class="pill">Unlocked at 100 stars</span><span class="pill">Bonus play</span>`)}
        ${getMissionStrip("Fun Zone", "Pick any bonus game and play for fun.", [
          { label: "Mouse Chase", done: false },
          { label: "Keyboard Smash", done: false },
          { label: "Fix Computer", done: false },
          { label: "Screen Defender", done: false },
          { label: "Power Up", done: false },
        ])}
        <div class="fun-hub">
          <button class="fun-button" type="button" data-fun-game="mouse">🖱️ Mouse Chase</button>
          <button class="fun-button" type="button" data-fun-game="keyboard">⌨️ Keyboard Smash</button>
          <button class="fun-button" type="button" data-fun-game="fix">🛠️ Fix Computer</button>
          <button class="fun-button" type="button" data-fun-game="screen">🦠 Screen Defender</button>
          <button class="fun-button" type="button" data-fun-game="power">⚡ Power Up</button>
        </div>
      </div>
    `;
    bindSharedButtons();
    gameArea.querySelectorAll("[data-fun-game]").forEach((button) => {
      button.addEventListener("click", () => startBonusGame(button.dataset.funGame));
    });
    return;
  }

  if (mode === "mouse") {
    renderMouseChase();
    return;
  }
  if (mode === "keyboard") {
    renderKeyboardSmash();
    return;
  }
  if (mode === "fix") {
    renderFixComputer();
    return;
  }
  if (mode === "screen") {
    renderScreenDefender();
    return;
  }
  if (mode === "power") {
    renderPowerUp();
  }
}

function startBonusGame(mode) {
  clearFunTimers();
  state.fun.mode = mode;

  if (mode === "mouse") {
    state.fun.mouseScore = 0;
    state.fun.cheeseVisible = false;
  }
  if (mode === "keyboard") {
    state.fun.keyboardLeft = shuffleArray(Array.from({ length: 12 }, (_, index) => String.fromCharCode(65 + index)));
  }
  if (mode === "fix") {
    state.fun.fixLeft = ["🪟", "⚡", "🔌", "🪛", "💥", "📎"];
  }
  if (mode === "screen") {
    state.fun.bugsLeft = Array.from({ length: 10 }, (_, index) => `bug-${index}`);
    state.fun.screenTime = 15;
    state.fun.timerId = setInterval(() => {
      state.fun.screenTime -= 1;
      if (state.fun.screenTime <= 0) {
        clearFunTimers();
      }
      renderFunZone();
    }, 1000);
  }
  if (mode === "power") {
    state.fun.power = 0;
  }

  renderFunZone();
}

function getFunHeader(title, extra = "") {
  return `
    <div class="card-header">
      <button class="back-button" type="button" id="backToFun">⬅ Fun Zone</button>
      <div class="progress-row">${extra}</div>
    </div>
    <div class="mission-strip">
      <div>
        <h3>${title}</h3>
        <p>Bonus arcade play.</p>
      </div>
      <div class="lesson-plan">
        <div class="lesson-chip">Fun Zone</div>
      </div>
    </div>
  `;
}

function bindBackToFun() {
  document.getElementById("backToFun")?.addEventListener("click", () => {
    clearFunTimers();
    state.fun.mode = "hub";
    renderFunZone();
  });
}

function renderMouseChase() {
  const targetLeft = 12 + ((state.fun.mouseScore * 53) % 72);
  const targetTop = 18 + ((state.fun.mouseScore * 37) % 62);
  const showCheese = state.fun.mouseScore > 0 && state.fun.mouseScore % 3 === 0;

  gameArea.innerHTML = `
    <div class="game-card">
      ${getFunHeader("Mouse Chase", `<span class="pill">Catches ${state.fun.mouseScore} / 8</span>`)}
      <div class="arcade-board">
        <div class="arcade-stage">
          <button class="arcade-target" type="button" id="mouseTarget" style="left:${targetLeft}%; top:${targetTop}%;">🐭</button>
          ${showCheese ? `<button class="arcade-target" type="button" id="cheeseTarget" style="left:${78 - targetLeft / 2}%; top:${72 - targetTop / 2}%;">🧀</button>` : ""}
        </div>
      </div>
    </div>
  `;
  bindBackToFun();
  document.getElementById("mouseTarget")?.addEventListener("click", () => {
    state.fun.mouseScore += 1;
    bumpStars(1);
    if (state.fun.mouseScore >= 8) {
      showFeedback("Mouse caught!", "success");
      spawnConfetti(28, false);
      state.fun.mode = "hub";
      renderFunZone();
      return;
    }
    showFeedback("Catch it!", "success");
    renderMouseChase();
  });
  document.getElementById("cheeseTarget")?.addEventListener("click", () => {
    bumpStars(2);
    showFeedback("Cheese bonus!", "success");
    renderMouseChase();
  });
}

function renderKeyboardSmash() {
  gameArea.innerHTML = `
    <div class="game-card">
      ${getFunHeader("Keyboard Smash", `<span class="pill">Letters left ${state.fun.keyboardLeft.length}</span>`)}
      <div class="arcade-board">
        <div class="arcade-stage">
          ${state.fun.keyboardLeft.map((letter, index) => `
            <button class="arcade-token" type="button" data-letter="${letter}" style="left:${6 + (index % 4) * 22}%; top:${8 + Math.floor(index / 4) * 24}%;">${letter}</button>
          `).join("")}
        </div>
      </div>
    </div>
  `;
  bindBackToFun();
  gameArea.querySelectorAll("[data-letter]").forEach((button) => {
    button.addEventListener("click", () => {
      state.fun.keyboardLeft = state.fun.keyboardLeft.filter((entry) => entry !== button.dataset.letter);
      bumpStars(1);
      showFeedback("Smash!", "success");
      if (state.fun.keyboardLeft.length === 0) {
        spawnConfetti(28, false);
        state.fun.mode = "hub";
        renderFunZone();
        return;
      }
      renderKeyboardSmash();
    });
  });
}

function renderFixComputer() {
  gameArea.innerHTML = `
    <div class="game-card">
      ${getFunHeader("Fix Computer", `<span class="pill">Fixes left ${state.fun.fixLeft.length}</span>`)}
      <div class="arcade-board">
        <div class="arcade-stage">
          <div class="power-shell">
            <div class="object-icon">💻</div>
            <div class="lesson-plan">
              ${state.fun.fixLeft.map((item, index) => `<button class="repair-target" type="button" data-fix="${item}" style="left:${10 + index * 13}%; top:${20 + (index % 2) * 28}%;">${item}</button>`).join("")}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  bindBackToFun();
  gameArea.querySelectorAll("[data-fix]").forEach((button) => {
    button.addEventListener("click", () => {
      state.fun.fixLeft = state.fun.fixLeft.filter((entry) => entry !== button.dataset.fix);
      bumpStars(1);
      showFeedback("Fix!", "success");
      if (state.fun.fixLeft.length === 0) {
        showFeedback("SYSTEM FIXED!", "success");
        spawnConfetti(30, false);
        state.fun.mode = "hub";
        renderFunZone();
        return;
      }
      renderFixComputer();
    });
  });
}

function renderScreenDefender() {
  if (state.fun.screenTime <= 0 && state.fun.bugsLeft.length > 0) {
    gameArea.innerHTML = `
      <div class="game-card">
        ${getFunHeader("Screen Defender", `<span class="pill">Time up!</span>`)}
        <div class="win-panel">
          <h3>Try again!</h3>
          <p>The bugs are still on the screen.</p>
          <button class="big-choice output-choice calm-button" type="button" id="retryScreenBtn">Play Again</button>
        </div>
      </div>
    `;
    bindBackToFun();
    document.getElementById("retryScreenBtn")?.addEventListener("click", () => startBonusGame("screen"));
    return;
  }

  gameArea.innerHTML = `
    <div class="game-card">
      ${getFunHeader("Screen Defender", `<span class="pill">Time ${state.fun.screenTime}</span><span class="pill">Bugs ${state.fun.bugsLeft.length}</span>`)}
      <div class="arcade-board">
        <div class="arcade-stage">
          ${state.fun.bugsLeft.map((bug, index) => `<button class="bug-target" type="button" data-bug="${bug}" style="left:${8 + (index % 5) * 17}%; top:${12 + Math.floor(index / 5) * 34}%;">🦠</button>`).join("")}
        </div>
      </div>
    </div>
  `;
  bindBackToFun();
  gameArea.querySelectorAll("[data-bug]").forEach((button) => {
    button.addEventListener("click", () => {
      state.fun.bugsLeft = state.fun.bugsLeft.filter((entry) => entry !== button.dataset.bug);
      bumpStars(1);
      if (state.fun.bugsLeft.length === 0) {
        clearFunTimers();
        showFeedback("Clean screen!", "success");
        spawnConfetti(30, false);
        state.fun.mode = "hub";
        renderFunZone();
        return;
      }
      renderScreenDefender();
    });
  });
}

function renderPowerUp() {
  gameArea.innerHTML = `
    <div class="game-card">
      ${getFunHeader("Power Up", `<span class="pill">Power ${state.fun.power}%</span>`)}
      <div class="arcade-board">
        <div class="power-shell">
          <div class="object-icon">🔋</div>
          <div class="power-bar"><div class="power-fill" style="width:${Math.min(state.fun.power, 100)}%;"></div></div>
          <button class="big-choice input-choice calm-button" type="button" id="powerTapBtn">TAP FAST ⚡</button>
        </div>
      </div>
    </div>
  `;
  bindBackToFun();
  document.getElementById("powerTapBtn")?.addEventListener("click", () => {
    state.fun.power += 10;
    bumpStars(1);
    if (state.fun.power >= 100) {
      showFeedback("POWER FULL!", "success");
      spawnConfetti(32, false);
      state.fun.mode = "hub";
      renderFunZone();
      return;
    }
    showFeedback("Charge!", "success");
    renderPowerUp();
  });
}

function startBuildGame() {
  state.build = {
    mission: 1,
    placed: {},
    matched: [],
    promptIndex: 0,
    promptDone: [],
  };
  renderBuildGame();
}

function renderBuildGame() {
  const build = state.build;
  const missions = [
    { label: "1. Build the computer", done: build.mission > 1 },
    { label: "2. Match each job", done: build.mission > 2 },
    { label: "3. Quick tap challenge", done: build.mission > 3 },
  ];

  let body = "";
  if (build.mission === 1) {
    body = `
      <div class="build-layout">
        <div class="computer-board">
          <div class="drop-zone-grid">
            ${buildParts.map((part) => `
              <div class="drop-zone ${build.placed[part.id] ? "filled" : ""}" data-zone="${part.zone}">
                <div>
                  <div class="drop-zone-icon">${part.emoji}</div>
                  <strong>${part.label}</strong>
                  <p>${build.placed[part.id] ? "Placed!" : part.hint}</p>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
        <div class="tray">
          <div class="pill">Mission 1 of 3</div>
          <div class="draggable-list">
            ${shuffleArray([...buildParts]).map((part) => renderDraggable(part, "build", Boolean(build.placed[part.id]))).join("")}
          </div>
          <p class="hint">Drag the part to the same picture.</p>
        </div>
      </div>
    `;
  }

  if (build.mission === 2) {
    body = `
      <div class="build-layout">
        <div class="computer-board">
          <div class="drop-zone-grid function-grid">
            ${buildParts.map((part) => `
              <div class="drop-zone function-target ${build.matched.includes(part.id) ? "filled" : ""}" data-function-target="${part.id}">
                <div>
                  <div class="drop-zone-icon">${part.emoji}</div>
                  <strong>${part.label}</strong>
                  <p>${build.matched.includes(part.id) ? "Job matched!" : "Drop the correct job card here."}</p>
                </div>
              </div>
            `).join("")}
          </div>
        </div>
        <div class="tray">
          <div class="pill">Mission 2 of 3</div>
          <div class="draggable-list">
            ${shuffleArray([...buildFunctions]).map((card) => renderDraggable(card, "function", build.matched.includes(card.target))).join("")}
          </div>
          <p class="hint">Match the job card.</p>
        </div>
      </div>
    `;
  }

  if (build.mission === 3) {
    const prompt = buildPrompts[build.promptIndex];
    body = `
      <div class="teacher-layout">
        <div class="teacher-stage">
          <div class="teacher-icon">⚡</div>
          <h3 class="teacher-command">${prompt.clue}</h3>
          <p class="teacher-subtext">Tap the right part. ${build.promptIndex + 1} / ${buildPrompts.length}</p>
        </div>
        <div class="teacher-targets">
          ${shuffleArray([...buildParts]).map((part) => `
            <button class="teacher-target" type="button" data-build-answer="${part.id}">
              <span class="sort-icon">${part.emoji}</span>
              <span>${part.label}</span>
            </button>
          `).join("")}
        </div>
      </div>
    `;
  }

  if (build.mission > 3) {
    body = `
      <div class="win-panel">
        <h3>Computer Island complete!</h3>
        <p>You built it, matched it, and tapped fast.</p>
      </div>
    `;
  }

  gameArea.innerHTML = `
    <div class="game-card">
      ${getCardHeader(`<span class="pill">Estimated 8 to 10 minutes</span><span class="pill">Stars: ${state.stars}</span>`)}
      ${getMissionStrip("Island Missions", "3 easy jobs: build, match, tap.", missions)}
      ${body}
    </div>
  `;

  bindSharedButtons();
  bindDragSystem();
  gameArea.querySelectorAll("[data-build-answer]").forEach((button) => {
    button.addEventListener("click", () => handleBuildPrompt(button.dataset.buildAnswer));
  });
}

function startInputGame() {
  state.input = {
    mission: 1,
    remaining: shuffleArray([...sortDeck]),
    buckets: { input: [], output: [] },
    scenarioIndex: 0,
    rushQueue: shuffleArray(sortDeck.slice(0, 8).map((item) => ({ ...item }))),
    rushIndex: 0,
    rushScore: 0,
  };
  renderInputGame();
}

function renderInputGame() {
  const input = state.input;
  const missions = [
    { label: "1. Drag sort devices", done: input.mission > 1 },
    { label: "2. Solve scenarios", done: input.mission > 2 },
    { label: "3. Speed buttons", done: input.mission > 3 },
  ];

  let body = "";
  if (input.mission === 1) {
    body = `
      <div class="sort-layout">
        <div class="sort-launcher">
          <h3>Incoming Devices</h3>
          <div class="draggable-list" id="sortSource"></div>
          <p class="hint">Drag to INPUT or OUTPUT.</p>
        </div>
        <div class="sort-zones">
          <div class="sort-zone input-zone" data-sort-zone="input">
            <h3>Input</h3>
            <p>In to computer.</p>
            <div class="captured-list" id="inputBucket">
              ${input.buckets.input.map((item) => `<div class="captured-chip"><span class="sort-icon">${item.emoji}</span><span>${item.label}</span></div>`).join("")}
            </div>
          </div>
          <div class="sort-zone output-zone" data-sort-zone="output">
            <h3>Output</h3>
            <p>Out from computer.</p>
            <div class="captured-list" id="outputBucket">
              ${input.buckets.output.map((item) => `<div class="captured-chip"><span class="sort-icon">${item.emoji}</span><span>${item.label}</span></div>`).join("")}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (input.mission === 2) {
    const scenario = inputScenarios[input.scenarioIndex];
    body = `
      <div class="scenario-card">
        <div class="object-display">
          <div class="object-icon">🧠</div>
          <h3>Choose</h3>
          <p class="question-text">${scenario.text}</p>
        </div>
        <div class="choice-pair">
          <button class="big-choice input-choice" type="button" data-input-choice="input">INPUT</button>
          <button class="big-choice output-choice" type="button" data-input-choice="output">OUTPUT</button>
        </div>
        <p class="hint">Point, say, then tap.</p>
      </div>
    `;
  }

  if (input.mission === 3) {
    const current = input.rushQueue[input.rushIndex];
    body = `
      <div class="scenario-card">
        <div class="object-display">
          <div class="object-icon">${current.emoji}</div>
          <h3>${current.label}</h3>
          <p class="question-text">Input or output?</p>
        </div>
        <div class="choice-pair">
          <button class="big-choice input-choice" type="button" data-rush-choice="input">INPUT</button>
          <button class="big-choice output-choice" type="button" data-rush-choice="output">OUTPUT</button>
        </div>
        <div class="lesson-plan">
          <div class="lesson-chip">Round ${input.rushIndex + 1} / ${input.rushQueue.length}</div>
          <div class="lesson-chip">Correct: ${input.rushScore}</div>
        </div>
      </div>
    `;
  }

  if (input.mission > 3) {
    body = `
      <div class="win-panel">
        <h3>Input Island complete!</h3>
        <p>You sorted, chose, and went fast.</p>
      </div>
    `;
  }

  gameArea.innerHTML = `
    <div class="game-card">
      ${getCardHeader(`<span class="pill">Estimated 8 to 10 minutes</span><span class="pill">${input.mission <= 3 ? `Mission ${input.mission} of 3` : "All missions done"}</span>`)}
      ${getMissionStrip("Island Missions", "3 easy jobs: sort, choose, go fast.", missions)}
      ${body}
    </div>
  `;

  bindSharedButtons();
  renderSortSource();
  bindDragSystem();
  gameArea.querySelectorAll("[data-input-choice]").forEach((button) => {
    button.addEventListener("click", () => handleInputScenario(button.dataset.inputChoice));
  });
  gameArea.querySelectorAll("[data-rush-choice]").forEach((button) => {
    button.addEventListener("click", () => handleRushChoice(button.dataset.rushChoice));
  });
}

function startOutputGame() {
  state.output = {
    mission: 1,
    questionIndex: 0,
    scenarioIndex: 0,
    badges: 0,
  };
  renderOutputGame();
}

function renderOutputGame() {
  const output = state.output;
  const missions = [
    { label: "1. What does it do?", done: output.mission > 1 },
    { label: "2. Pick the best ICT tool", done: output.mission > 2 },
  ];

  let body = "";
  if (output.mission === 1) {
    const question = outputQuestions[output.questionIndex];
    body = `
      <div class="qa-layout">
        <div class="object-display">
          <div class="object-icon">${question.emoji}</div>
          <h3>${question.item}</h3>
          <p class="question-text">${question.prompt}</p>
        </div>
        <div class="answers-grid">
          ${shuffleArray([...question.options]).map((option) => `
            <button class="answer-button" type="button" data-output-answer="${option}">${option}</button>
          `).join("")}
        </div>
        <div class="lesson-plan">
          <div class="lesson-chip">Question ${output.questionIndex + 1} / ${outputQuestions.length}</div>
          <div class="lesson-chip">Badges ${output.badges}</div>
        </div>
      </div>
    `;
  }

  if (output.mission === 2) {
    const scenario = outputScenarios[output.scenarioIndex];
    body = `
      <div class="scenario-card">
        <div class="object-display">
          <div class="object-icon">🏝️</div>
          <h3>Pick one</h3>
          <p class="question-text">${scenario.text}</p>
        </div>
        <div class="answers-grid">
          ${shuffleArray([...scenario.options]).map((option) => `
            <button class="answer-button" type="button" data-output-tool="${option}">${option}</button>
          `).join("")}
        </div>
        <p class="hint">Look. Think. Tap.</p>
      </div>
    `;
  }

  if (output.mission > 2) {
    body = `
      <div class="win-panel">
        <h3>Output Island complete!</h3>
        <p>You named the parts and picked the best tool.</p>
      </div>
    `;
  }

  gameArea.innerHTML = `
    <div class="game-card">
      ${getCardHeader(`<span class="pill">Estimated 8 to 10 minutes</span><span class="pill">Badges ${output.badges}</span>`)}
      ${getMissionStrip("Island Missions", "2 easy jobs: answer and choose.", missions)}
      ${body}
    </div>
  `;

  bindSharedButtons();
  gameArea.querySelectorAll("[data-output-answer]").forEach((button) => {
    button.addEventListener("click", () => handleOutputAnswer(button.dataset.outputAnswer));
  });
  gameArea.querySelectorAll("[data-output-tool]").forEach((button) => {
    button.addEventListener("click", () => handleOutputTool(button.dataset.outputTool));
  });
}

function startChallengeGame() {
  state.challenge = {
    round: 0,
    lives: 3,
    streak: 0,
    best: 0,
  };
  renderChallengeGame();
}

function renderChallengeGame() {
  const challenge = state.challenge;
  const round = challengeRounds[challenge.round];

  if (challenge.round >= challengeRounds.length || challenge.lives <= 0) {
    const win = challenge.round >= challengeRounds.length;
    gameArea.innerHTML = `
      <div class="game-card">
        ${getCardHeader(`<span class="pill">Teacher Says Finale</span><span class="pill">Best streak ${challenge.best}</span>`)}
        <div class="win-panel">
          <h3>${win ? "Challenge Island complete!" : "Challenge over!"}</h3>
          <p>${win ? "You finished all 10 rounds." : "No more lives. Try again."}</p>
          <div class="lesson-plan">
            <div class="lesson-chip">Rounds cleared ${challenge.round}</div>
            <div class="lesson-chip">Best streak ${challenge.best}</div>
          </div>
        </div>
      </div>
    `;
    bindSharedButtons();
    if (win) {
      completeGame("challenge");
    }
    return;
  }

  gameArea.innerHTML = `
    <div class="game-card">
      ${getCardHeader(`<span class="pill">Estimated 10 to 12 minutes</span><span class="pill">Round ${challenge.round + 1} / ${challengeRounds.length}</span>`)}
      ${getMissionStrip("Island Missions", "Tap when teacher says. Wait on trick rounds.", [
        { label: "Watch carefully", done: false },
        { label: "Build a streak", done: false },
        { label: "Protect your 3 lives", done: false },
      ])}
      <div class="teacher-layout">
        <div class="teacher-stage">
          <div class="teacher-icon">${round.says ? "🧑‍🏫" : "🤫"}</div>
          <h3 class="teacher-command">${round.prompt}</h3>
          <p class="teacher-subtext">${round.says ? "Teacher says it. Tap." : "No teacher says. Wait."}</p>
          <div class="lesson-plan">
            <div class="lesson-chip">Lives ${"❤️".repeat(challenge.lives)}</div>
            <div class="lesson-chip">Streak ${challenge.streak}</div>
            <div class="lesson-chip">Best ${challenge.best}</div>
          </div>
        </div>
        <div class="teacher-targets challenge-grid">
          ${shuffleArray([...challengeTargets]).map((target) => `
            <button class="teacher-target" type="button" data-challenge-choice="${target.id}">
              <span class="sort-icon">${target.emoji}</span>
              <span>${target.label}</span>
            </button>
          `).join("")}
        </div>
      </div>
    </div>
  `;

  bindSharedButtons();
  gameArea.querySelectorAll("[data-challenge-choice]").forEach((button) => {
    button.addEventListener("click", () => handleChallengeChoice(button.dataset.challengeChoice, button));
  });
}

function renderSortSource() {
  if (state.currentGame !== "input" || state.input.mission !== 1) {
    return;
  }

  const source = document.getElementById("sortSource");
  if (!source) {
    return;
  }

  const nextItems = state.input.remaining.slice(0, 4);
  source.innerHTML = nextItems.map((item) => renderDraggable(item, "sort", false)).join("");
}

function renderDraggable(item, kind, placed = false) {
  return `
    <div class="draggable-item ${placed ? "placed" : ""}" data-kind="${kind}" data-id="${item.id}">
      <span class="draggable-item-emoji">${item.emoji}</span>
      <div>
        <strong>${item.label}</strong>
        <div>${kind === "function" ? item.label : item.hint || "Drag to a category"}</div>
      </div>
    </div>
  `;
}

function bindSharedButtons() {
  document.getElementById("backToMap")?.addEventListener("click", () => {
    clearFunTimers();
    renderWelcome();
    updateRenderHooks();
  });
}

function setIslandAccess() {
  document.querySelectorAll(".island-card").forEach((button) => {
    const needsCheckIn = !state.checkIn.ready;
    const needsStars = button.dataset.game === "fun" && state.stars < 100;
    const locked = needsCheckIn || needsStars;
    button.disabled = locked;
    button.classList.toggle("locked-island", locked);
  });
}

function bindMoodChoices() {
  gameArea.querySelectorAll("[data-mood]").forEach((button) => {
    button.addEventListener("click", () => handleMoodChoice(button.dataset.mood));
  });
}

function handleMoodChoice(moodId) {
  const mood = moodChoices.find((entry) => entry.id === moodId);
  state.checkIn.mood = mood.id;
  state.checkIn.emojiRound = 0;
  state.checkIn.calmStep = 0;
  state.checkIn.path = mood.path;
  showFeedback(mood.path === "emoji" ? "Let’s play a face game!" : "Let’s get calm first.", "info");
  renderWelcome();
  updateRenderHooks();
}

function bindEmojiGame() {
  gameArea.querySelectorAll("[data-emoji-game]").forEach((button) => {
    button.addEventListener("click", () => handleEmojiGame(button.dataset.emojiGame));
  });
}

function handleEmojiGame(choice) {
  const round = emojiGameRounds[state.checkIn.emojiRound];
  if (choice === round.target) {
    bumpStars(1);
    showFeedback("Yes! Nice face!", "success");
    state.checkIn.emojiRound += 1;
    if (state.checkIn.emojiRound >= emojiGameRounds.length) {
      state.checkIn.path = "done";
      state.checkIn.ready = true;
      spawnConfetti(28, false);
      showFeedback("You are ready to learn!", "success");
    }
  } else {
    showFeedback("Try again!", "error");
  }
  renderWelcome();
  updateRenderHooks();
}

function handleCalmStep() {
  bumpStars(1);
  showFeedback("Good calm job.", "success");
  state.checkIn.calmStep += 1;
  if (state.checkIn.calmStep >= calmSteps.length) {
    state.checkIn.path = "done";
    state.checkIn.ready = true;
    spawnConfetti(20, false);
    showFeedback("Now you are ready.", "success");
  }
  renderWelcome();
  updateRenderHooks();
}

function bindSillyFriends() {
  document.getElementById("sillyStar")?.addEventListener("click", (event) => triggerSilly(event.currentTarget));
  document.getElementById("sillyFish")?.addEventListener("click", (event) => triggerSilly(event.currentTarget));
}

function triggerSilly(button) {
  state.sillyTaps += 1;
  button.classList.remove("silly-pop");
  void button.offsetWidth;
  button.classList.add("silly-pop");
  bumpStars(1);
  showFeedback(pickRandom(sillyMessages), "info");
  spawnConfetti(10, false);
}

function bindDragSystem() {
  gameArea.querySelectorAll(".draggable-item").forEach((item) => {
    item.addEventListener("pointerdown", startDrag);
  });
}

function startDrag(event) {
  const source = event.currentTarget;
  if (source.classList.contains("placed")) {
    return;
  }

  const rect = source.getBoundingClientRect();
  const ghost = source.cloneNode(true);
  ghost.classList.add("drag-ghost");
  document.body.appendChild(ghost);

  state.drag = { id: source.dataset.id, kind: source.dataset.kind, source, ghost, offsetX: event.clientX - rect.left, offsetY: event.clientY - rect.top };
  source.setPointerCapture(event.pointerId);
  source.addEventListener("pointermove", onDragMove);
  source.addEventListener("pointerup", endDrag);
  source.addEventListener("pointercancel", cancelDrag);
  moveGhost(event.clientX, event.clientY);
}

function onDragMove(event) {
  if (!state.drag) {
    return;
  }
  moveGhost(event.clientX, event.clientY);
  highlightDropTarget(event.clientX, event.clientY);
}

function endDrag(event) {
  if (!state.drag) {
    return;
  }

  const target = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-zone], [data-sort-zone], [data-function-target]");
  clearHighlights();

  if (state.drag.kind === "build") {
    handleBuildDrop(target);
  }
  if (state.drag.kind === "sort") {
    handleSortDrop(target);
  }
  if (state.drag.kind === "function") {
    handleFunctionDrop(target);
  }

  cleanupDrag(event.currentTarget, event.pointerId);
}

function cancelDrag(event) {
  clearHighlights();
  cleanupDrag(event.currentTarget, event.pointerId);
}

function cleanupDrag(source, pointerId) {
  source.releasePointerCapture(pointerId);
  source.removeEventListener("pointermove", onDragMove);
  source.removeEventListener("pointerup", endDrag);
  source.removeEventListener("pointercancel", cancelDrag);
  state.drag?.ghost.remove();
  state.drag = null;
}

function moveGhost(x, y) {
  if (!state.drag) {
    return;
  }
  state.drag.ghost.style.left = `${x}px`;
  state.drag.ghost.style.top = `${y}px`;
}

function highlightDropTarget(x, y) {
  clearHighlights();
  document.elementFromPoint(x, y)?.closest("[data-zone], [data-sort-zone], [data-function-target]")?.classList.add("active");
}

function clearHighlights() {
  gameArea.querySelectorAll(".active").forEach((node) => node.classList.remove("active"));
}

function handleBuildDrop(target) {
  const part = buildParts.find((entry) => entry.id === state.drag.id);
  if (target?.dataset.zone === part.zone) {
    state.build.placed[part.id] = true;
    state.drag.source.classList.add("placed");
    bumpStars(1);
    showFeedback("Part placed!", "success");
    if (Object.keys(state.build.placed).length === buildParts.length) {
      state.build.mission = 2;
      showFeedback("Mission 1 complete! Now match the jobs.", "success");
    }
    renderBuildGame();
  } else {
    shakeCurrentSource("Try again!");
  }
}

function handleFunctionDrop(target) {
  const card = buildFunctions.find((entry) => entry.id === state.drag.id);
  if (target?.dataset.functionTarget === card.target) {
    if (!state.build.matched.includes(card.target)) {
      state.build.matched.push(card.target);
      bumpStars(1);
    }
    showFeedback("Great match!", "success");
    if (state.build.matched.length === buildFunctions.length) {
      state.build.mission = 3;
      showFeedback("Mission 2 complete! Quick tap challenge next.", "success");
    }
    renderBuildGame();
  } else {
    shakeCurrentSource("Wrong job card!");
  }
}

function handleBuildPrompt(answer) {
  const prompt = buildPrompts[state.build.promptIndex];
  if (answer === prompt.answer) {
    bumpStars(2);
    state.build.promptDone.push(prompt.answer);
    state.build.promptIndex += 1;
    showFeedback("Fast thinking!", "success");
    if (state.build.promptIndex >= buildPrompts.length) {
      state.build.mission = 4;
      completeGame("build");
    }
    renderBuildGame();
  } else {
    showFeedback("Not that one. Look again!", "error");
  }
}

function handleSortDrop(target) {
  if (!target) {
    showFeedback("Drop it in a box!", "error");
    return;
  }

  const item = sortDeck.find((entry) => entry.id === state.drag.id);
  const bucket = target.dataset.sortZone;
  if (bucket === item.type) {
    state.input.buckets[bucket].push(item);
    state.input.remaining = state.input.remaining.filter((entry) => entry.id !== item.id);
    bumpStars(1);
    showFeedback("Correct sort!", "success");
    if (state.input.remaining.length === 0) {
      state.input.mission = 2;
      showFeedback("Sorting done! Scenario round unlocked.", "success");
    }
    renderInputGame();
  } else {
    shakeCurrentSource("Oops! Try the other side.");
  }
}

function handleInputScenario(choice) {
  const scenario = inputScenarios[state.input.scenarioIndex];
  if (choice === scenario.answer) {
    bumpStars(2);
    state.input.scenarioIndex += 1;
    showFeedback("Nice thinking!", "success");
    if (state.input.scenarioIndex >= inputScenarios.length) {
      state.input.mission = 3;
      showFeedback("Scenario round complete! Speed round time.", "success");
    }
    renderInputGame();
  } else {
    showFeedback("Talk with your team and try again.", "error");
  }
}

function handleRushChoice(choice) {
  const current = state.input.rushQueue[state.input.rushIndex];
  if (choice === current.type) {
    state.input.rushScore += 1;
    bumpStars(1);
    showFeedback("Quick correct!", "success");
  } else {
    showFeedback("Almost! Next card.", "error");
  }

  state.input.rushIndex += 1;
  if (state.input.rushIndex >= state.input.rushQueue.length) {
    state.input.mission = 4;
    completeGame("input");
  }
  renderInputGame();
}

function handleOutputAnswer(answer) {
  const question = outputQuestions[state.output.questionIndex];
  if (answer === question.correct) {
    state.output.badges += 1;
    bumpStars(2);
    state.output.questionIndex += 1;
    showFeedback("Correct answer!", "success");
    if (state.output.questionIndex >= outputQuestions.length) {
      state.output.mission = 2;
      showFeedback("Round 1 complete! Scenario round unlocked.", "success");
    }
    renderOutputGame();
  } else {
    showFeedback("Try again!", "error");
  }
}

function handleOutputTool(choice) {
  const scenario = outputScenarios[state.output.scenarioIndex];
  if (choice === scenario.correct) {
    state.output.badges += 1;
    bumpStars(2);
    state.output.scenarioIndex += 1;
    showFeedback("Perfect tool!", "success");
    if (state.output.scenarioIndex >= outputScenarios.length) {
      state.output.mission = 3;
      completeGame("output");
    }
    renderOutputGame();
  } else {
    showFeedback("Think about what the class needs.", "error");
  }
}

function handleChallengeChoice(choice, button) {
  const round = challengeRounds[state.challenge.round];
  if (choice === round.answer) {
    state.challenge.streak += 1;
    state.challenge.best = Math.max(state.challenge.best, state.challenge.streak);
    state.challenge.round += 1;
    bumpStars(2);
    button.classList.add("good");
    showFeedback(round.says ? "Teacher really said it!" : "Great waiting!", "success");
  } else {
    state.challenge.lives -= 1;
    state.challenge.streak = 0;
    button.classList.add("bad");
    showFeedback("Careful! That was a trick.", "error");
    if (state.challenge.lives > 0) {
      state.challenge.round += 1;
    }
  }

  state.challenge.best = Math.max(state.challenge.best, state.challenge.streak);
  setTimeout(renderChallengeGame, 350);
}

function shakeCurrentSource(message) {
  const source = state.drag.source;
  showFeedback(message, "error");
  source.classList.add("shake");
  setTimeout(() => source.classList.remove("shake"), 380);
}

function showFeedback(message, tone) {
  feedbackBanner.textContent = message;
  feedbackBanner.className = `feedback-banner show feedback-${tone}${tone === "success" ? " party" : ""}`;
  playTone(tone);
  clearTimeout(state.feedbackTimeout);
  state.feedbackTimeout = setTimeout(() => {
    feedbackBanner.className = "feedback-banner";
  }, 1500);
}

function bumpStars(amount) {
  state.stars += amount;
  updateScoreboard();
}

function completeGame(id) {
  if (!state.completed.has(id)) {
    state.completed.add(id);
    state.stars += 25;
    updateScoreboard();
    showFeedback("Island complete! +25 stars!", "success");
    spawnConfetti(42, true);
  }
}

function updateScoreboard() {
  starCount.textContent = String(state.stars);
  completedCount.textContent = `${state.completed.size} / 4`;
  setIslandAccess();
  if (state.stars === 100) {
    showFeedback("Fun Zone unlocked!", "success");
    spawnConfetti(60, true);
  }
}

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

function spawnConfetti(count, bigBurst) {
  if (!confettiLayer) {
    return;
  }

  for (let index = 0; index < count; index += 1) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = confettiColors[index % confettiColors.length];
    piece.style.animationDuration = `${bigBurst ? 2.6 + Math.random() * 1.2 : 1.4 + Math.random() * 0.9}s`;
    piece.style.animationDelay = `${Math.random() * 0.25}s`;
    piece.style.transform = `rotate(${Math.random() * 360}deg) scale(${0.7 + Math.random() * 0.8})`;
    confettiLayer.appendChild(piece);
    setTimeout(() => piece.remove(), 4200);
  }
}

function playTone(tone) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return;
  }
  if (!playTone.context) {
    playTone.context = new AudioContextClass();
  }
  const context = playTone.context;
  if (context.state === "suspended") {
    context.resume().catch(() => {});
  }

  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.connect(gain);
  gain.connect(context.destination);
  const now = context.currentTime;
  const notes = { success: [660, 880], error: [220, 180], info: [520, 620] };
  (notes[tone] || notes.info).forEach((frequency, index) => {
    oscillator.frequency.setValueAtTime(frequency, now + index * 0.08);
  });
  oscillator.type = tone === "error" ? "square" : "triangle";
  gain.gain.setValueAtTime(0.001, now);
  gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
  oscillator.start(now);
  oscillator.stop(now + 0.3);
}

function buildRenderState() {
  return {
    mode: state.currentGame || "map",
    stars: state.stars,
    completed: Array.from(state.completed),
    build: {
      mission: state.build.mission || 0,
      placed: { ...(state.build.placed || {}) },
      matched: [...(state.build.matched || [])],
      promptIndex: state.build.promptIndex || 0,
    },
    input: {
      mission: state.input.mission || 0,
      remaining: (state.input.remaining || []).map((item) => item.id),
      scenarioIndex: state.input.scenarioIndex || 0,
      rushIndex: state.input.rushIndex || 0,
      rushScore: state.input.rushScore || 0,
      rushCurrent: state.input.rushQueue?.[state.input.rushIndex]?.id || null,
    },
    output: {
      mission: state.output.mission || 0,
      questionIndex: state.output.questionIndex || 0,
      scenarioIndex: state.output.scenarioIndex || 0,
      badges: state.output.badges || 0,
    },
    challenge: {
      round: state.challenge.round || 0,
      lives: state.challenge.lives || 0,
      streak: state.challenge.streak || 0,
      best: state.challenge.best || 0,
    },
    fun: {
      mode: state.fun.mode || "hub",
      mouseScore: state.fun.mouseScore || 0,
      keyboardLeft: state.fun.keyboardLeft?.length || 0,
      fixLeft: state.fun.fixLeft?.length || 0,
      bugsLeft: state.fun.bugsLeft?.length || 0,
      screenTime: state.fun.screenTime || 0,
      power: state.fun.power || 0,
      unlocked: state.stars >= 100,
    },
    checkIn: {
      mood: state.checkIn.mood,
      path: state.checkIn.path,
      emojiRound: state.checkIn.emojiRound,
      calmStep: state.checkIn.calmStep,
      ready: state.checkIn.ready,
    },
    sillyTaps: state.sillyTaps,
    note: "DOM app with origin at top-left of the viewport. State records active island mission progress, drag-drop collections, quiz steps, and Teacher Says lives.",
  };
}

function updateRenderHooks() {
  window.render_game_to_text = () => JSON.stringify(buildRenderState());
  window.advanceTime = (ms) => ms;
}
