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
  sillyTaps: 0,
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
};

const buildParts = [
  { id: "monitor", label: "Monitor", emoji: "🖥️", hint: "Shows pictures", zone: "monitor" },
  { id: "keyboard", label: "Keyboard", emoji: "⌨️", hint: "Helps you type", zone: "keyboard" },
  { id: "mouse", label: "Mouse", emoji: "🖱️", hint: "Moves and clicks", zone: "mouse" },
  { id: "system", label: "System Unit", emoji: "🧰", hint: "Runs the computer", zone: "system" },
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
  { clue: "Tap the part that is the computer's BRAIN.", answer: "system" },
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
  panelSubtitle.textContent = "Tap an island. Play. Learn.";
  gameArea.innerHTML = `
    <div class="welcome-card">
      <div class="welcome-stack">
        <strong>🌴</strong>
        <h3>Adventure Map Ready</h3>
        <p class="hero-text">Big buttons. Easy words. Lots of play.</p>
        <div class="lesson-plan">
          <div class="lesson-chip">Build</div>
          <div class="lesson-chip">Sort</div>
          <div class="lesson-chip">Choose</div>
          <div class="lesson-chip">Teacher Says</div>
        </div>
      </div>
    </div>
  `;
}

function openGame(type) {
  state.currentGame = type;
  panelTitle.textContent = games[type].title;
  panelSubtitle.textContent = `${games[type].subtitle} Estimated time: ${games[type].duration}.`;

  if (type === "build") startBuildGame();
  if (type === "input") startInputGame();
  if (type === "output") startOutputGame();
  if (type === "challenge") startChallengeGame();

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
    renderWelcome();
    updateRenderHooks();
  });
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
    updateScoreboard();
    showFeedback("Island complete!", "success");
    spawnConfetti(42, true);
  }
}

function updateScoreboard() {
  starCount.textContent = String(state.stars);
  completedCount.textContent = `${state.completed.size} / 4`;
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
    sillyTaps: state.sillyTaps,
    note: "DOM app with origin at top-left of the viewport. State records active island mission progress, drag-drop collections, quiz steps, and Teacher Says lives.",
  };
}

function updateRenderHooks() {
  window.render_game_to_text = () => JSON.stringify(buildRenderState());
  window.advanceTime = (ms) => ms;
}
