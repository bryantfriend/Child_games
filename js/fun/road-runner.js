(function () {
  var app = window.ICTApp;
  var h = app.helpers;
  var lanes = [
    { y: 0, speed: 0 },
    { y: 1, speed: 0.8, obstacles: ["keyboard", "keyboard", "mouse"] },
    { y: 2, speed: -1, obstacles: ["monitor", "usb"] },
    { y: 3, speed: 1.3, obstacles: ["printer", "keyboard"] },
    { y: 4, speed: -1.1, obstacles: ["virus", "mouse", "usb"] },
    { y: 5, speed: 1.5, obstacles: ["monitor", "printer"] },
    { y: 6, speed: 0 }
  ];
  var characters = [
    { id: "bot", name: "Blue Bot", color: "#4d7de0", accent: "#91ebff", face: "smile" },
    { id: "cat", name: "Cat Coder", color: "#ff9f43", accent: "#ffe08a", face: "happy" },
    { id: "rocket", name: "Rocket Kid", color: "#ff5d8f", accent: "#ffd2e3", face: "wow" },
    { id: "leaf", name: "Leaf Pal", color: "#2ec27e", accent: "#b9f8c9", face: "smile" },
    { id: "star", name: "Star Byte", color: "#8a6cff", accent: "#dfd2ff", face: "happy" }
  ];
  var obstacleArt = {
    keyboard: { label: "Keyboard", color: "#6f96f7" },
    mouse: { label: "Mouse", color: "#ffb347" },
    monitor: { label: "Monitor", color: "#4cc9f0" },
    printer: { label: "Printer", color: "#ff7eb6" },
    usb: { label: "USB", color: "#2ec27e" },
    virus: { label: "Bug", color: "#ff6b6b" }
  };

  function start() {
    h.clearFunTimers();
    app.state.fun = {
      mode: "road",
      timers: [],
      road: createState()
    };
    render();
  }

  function createState() {
    return {
      phase: "pick",
      selected: null,
      row: 6,
      col: 2,
      coins: 0,
      lives: 3,
      win: false,
      tick: 0,
      obstacles: buildObstacles(),
      busy: false
    };
  }

  function buildObstacles() {
    var items = [];
    var laneIndex;
    for (laneIndex = 1; laneIndex <= 5; laneIndex++) {
      var lane = lanes[laneIndex];
      var j;
      for (j = 0; j < lane.obstacles.length; j++) {
        items.push({
          lane: laneIndex,
          type: lane.obstacles[j],
          x: (j * 1.75) + (lane.speed > 0 ? -0.4 : 0.9),
          speed: lane.speed
        });
      }
    }
    return items;
  }

  function render() {
    var state = app.state.fun.road;
    var top = h.getCardHeader('<span class="pill">Fun Zone bonus</span><span class="pill">Cross the tech road</span>');
    var mission = h.getMissionStrip("Techy Road", "Pick a hero, tap arrows, and dodge computer traffic.", [
      { label: "Choose a hero", done: Boolean(state.selected) },
      { label: "Reach the top", done: state.win },
      { label: "Keep your 3 hearts", done: state.lives === 3 && state.phase !== "pick" }
    ]);
    app.dom.gameArea.innerHTML = '<div class="game-card">' + top + mission + renderBody(state) + '</div>';
    h.bindBackToMap();
    bindEvents();
  }

  function renderBody(state) {
    if (state.phase === "pick") return renderPicker();
    if (state.phase === "win") return renderWin();
    return renderGame();
  }

  function renderPicker() {
    var cards = characters.map(function(character) {
      return '<button class="road-character-card" type="button" data-road-character="' + character.id + '">' +
        renderCharacterAvatar(character, "road-character-avatar") +
        '<strong>' + character.name + '</strong><span>Tap to play</span></button>';
    }).join("");
    return '<div class="road-picker"><div class="welcome-stack"><h3>Pick a fun character</h3><p class="hero-text">Cross the tech road and dodge keyboards, printers, screens, and bugs.</p><div class="road-character-grid">' + cards + '</div></div></div>';
  }

  function renderGame() {
    var state = app.state.fun.road;
    var selected = getCharacter(state.selected);
    return '<div class="road-layout">' +
      '<div class="road-board-shell">' +
      '<div class="road-status-row"><div class="lesson-chip">Hearts ' + repeat("💛", state.lives) + '</div><div class="lesson-chip">Stars ' + state.coins + '</div><div class="lesson-chip">Goal: top row</div></div>' +
      '<div class="road-board">' + renderRoadGrid(selected, state) + '</div>' +
      '</div>' +
      '<div class="road-control-panel"><div class="road-picked-card">' + renderCharacterAvatar(selected, "road-picked-avatar") + '<strong>' + selected.name + '</strong><span>Move with the big arrows.</span></div>' +
      '<div class="road-controls">' +
      '<button class="road-arrow road-arrow-up" type="button" data-road-move="up">⬆</button>' +
      '<div class="road-arrow-row"><button class="road-arrow" type="button" data-road-move="left">⬅</button><button class="road-arrow" type="button" data-road-move="down">⬇</button><button class="road-arrow" type="button" data-road-move="right">➡</button></div>' +
      '</div><p class="hint">Avoid keyboards, mice, monitors, printers, USB plugs, and silly bugs.</p></div></div>';
  }

  function renderRoadGrid(selected, state) {
    var html = '';
    var row;
    for (row = 0; row < 7; row++) {
      html += '<div class="road-lane ' + (row === 0 ? "road-goal" : row === 6 ? "road-start" : "road-traffic") + '">';
      html += '<div class="road-lane-label">' + (row === 0 ? "GO!" : row === 6 ? "START" : "TECH ROAD") + '</div>';
      html += renderLaneObstacles(row, state.obstacles);
      if (state.row === row) html += renderPlayer(selected, state.col);
      html += '</div>';
    }
    return html;
  }

  function renderLaneObstacles(row, obstacles) {
    var laneItems = obstacles.filter(function(obstacle) { return obstacle.lane === row; });
    return laneItems.map(function(obstacle) {
      return '<div class="road-obstacle road-obstacle-' + obstacle.type + '" style="left:' + (obstacle.x * 20) + '%">' + renderObstacle(obstacle.type) + '</div>';
    }).join("");
  }

  function renderPlayer(character, col) {
    return '<div class="road-player" style="left:calc(' + (col * 25) + '% + 18px)">' + renderCharacterAvatar(character, "road-player-avatar") + '</div>';
  }

  function renderWin() {
    var state = app.state.fun.road;
    var selected = getCharacter(state.selected);
    return '<div class="win-panel road-win-panel"><h3>You crossed the tech road!</h3><div class="road-win-avatar">' + renderCharacterAvatar(selected, "road-player-avatar") + '</div><p>You dodged the computer traffic and reached the top.</p><div class="choice-row"><button class="fun-button" type="button" id="roadPlayAgainBtn">Play Again</button><button class="big-choice output-choice calm-button" type="button" id="roadHubBtn">Back To Fun Zone</button></div></div>';
  }

  function renderCharacterAvatar(character, className) {
    var face = character.face === "wow" ? '<circle cx="51" cy="47" r="4" fill="#23405e"/><circle cx="69" cy="47" r="4" fill="#23405e"/><circle cx="60" cy="61" r="6" fill="#23405e"/>' :
      '<circle cx="51" cy="47" r="4" fill="#23405e"/><circle cx="69" cy="47" r="4" fill="#23405e"/><path d="M50 60q10 10 20 0" fill="none" stroke="#23405e" stroke-linecap="round" stroke-width="5"/>';
    return '<svg viewBox="0 0 120 120" class="' + className + '" aria-hidden="true"><circle cx="60" cy="60" r="52" fill="' + character.accent + '"/><circle cx="60" cy="44" r="23" fill="#ffd7b1"/><path d="M36 95c8-20 23-30 24-30 2 0 17 10 24 30" fill="' + character.color + '"/><circle cx="43" cy="30" r="8" fill="' + character.color + '"/><circle cx="77" cy="30" r="8" fill="' + character.color + '"/>' + face + '</svg>';
  }

  function renderObstacle(type) {
    if (type === "keyboard") return '<svg viewBox="0 0 150 72" class="road-obstacle-svg" aria-hidden="true"><rect x="10" y="10" width="130" height="48" rx="16" fill="#f8fbff"/><g fill="#6f96f7"><rect x="24" y="22" width="14" height="9" rx="3"/><rect x="42" y="22" width="14" height="9" rx="3"/><rect x="60" y="22" width="14" height="9" rx="3"/><rect x="78" y="22" width="14" height="9" rx="3"/><rect x="96" y="22" width="14" height="9" rx="3"/><rect x="114" y="22" width="14" height="9" rx="3"/><rect x="30" y="36" width="62" height="10" rx="4"/></g></svg>';
    if (type === "mouse") return '<svg viewBox="0 0 94 72" class="road-obstacle-svg" aria-hidden="true"><path d="M48 10c16 0 28 14 28 32S64 66 48 66 20 54 20 42 32 10 48 10z" fill="#f8fbff"/><path d="M48 10v22" stroke="#6f96f7" stroke-width="5" stroke-linecap="round"/><path d="M66 12c8-12 18-14 26-6" fill="none" stroke="#ffb347" stroke-width="6" stroke-linecap="round"/></svg>';
    if (type === "monitor") return '<svg viewBox="0 0 126 84" class="road-obstacle-svg" aria-hidden="true"><rect x="10" y="8" width="90" height="56" rx="16" fill="#355da6"/><rect x="20" y="18" width="70" height="36" rx="10" fill="#91ebff"/><rect x="48" y="64" width="14" height="10" rx="4" fill="#355da6"/><rect x="32" y="72" width="46" height="8" rx="4" fill="#244667"/></svg>';
    if (type === "printer") return '<svg viewBox="0 0 120 86" class="road-obstacle-svg" aria-hidden="true"><rect x="18" y="24" width="84" height="42" rx="14" fill="#ff7eb6"/><rect x="30" y="10" width="60" height="22" rx="8" fill="#fff"/><rect x="32" y="50" width="56" height="16" rx="6" fill="#fff"/><circle cx="86" cy="44" r="4" fill="#23405e"/></svg>';
    if (type === "usb") return '<svg viewBox="0 0 96 86" class="road-obstacle-svg" aria-hidden="true"><path d="M42 18h12v22H42z" fill="#23405e"/><rect x="36" y="38" width="24" height="22" rx="8" fill="#2ec27e"/><path d="M48 60v16" stroke="#2ec27e" stroke-width="8" stroke-linecap="round"/><path d="M48 14v-8M48 6l-8 8M48 6l8 8" fill="none" stroke="#23405e" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    return '<svg viewBox="0 0 96 84" class="road-obstacle-svg" aria-hidden="true"><circle cx="48" cy="42" r="24" fill="#ff6b6b"/><circle cx="48" cy="18" r="8" fill="#ff6b6b"/><circle cx="48" cy="66" r="8" fill="#ff6b6b"/><circle cx="24" cy="42" r="8" fill="#ff6b6b"/><circle cx="72" cy="42" r="8" fill="#ff6b6b"/><circle cx="34" cy="28" r="6" fill="#ff6b6b"/><circle cx="62" cy="28" r="6" fill="#ff6b6b"/><circle cx="34" cy="56" r="6" fill="#ff6b6b"/><circle cx="62" cy="56" r="6" fill="#ff6b6b"/></svg>';
  }

  function bindEvents() {
    bindMany("[data-road-character]", function (button) {
      button.addEventListener("click", function () {
        chooseCharacter(button.dataset.roadCharacter);
      });
    });
    bindMany("[data-road-move]", function (button) {
      button.addEventListener("click", function () {
        movePlayer(button.dataset.roadMove);
      });
    });
    var again = document.getElementById("roadPlayAgainBtn");
    if (again) again.addEventListener("click", start);
    var hub = document.getElementById("roadHubBtn");
    if (hub) hub.addEventListener("click", function () { app.funGames.hub.start(); });
    document.onkeydown = function (event) {
      if (app.state.fun.mode !== "road" || app.state.fun.road.phase !== "play") return;
      var keyMap = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
      if (keyMap[event.key]) {
        event.preventDefault();
        movePlayer(keyMap[event.key]);
      }
    };
  }

  function bindMany(selector, binder) {
    var nodes = app.dom.gameArea.querySelectorAll(selector);
    var i;
    for (i = 0; i < nodes.length; i++) binder(nodes[i]);
  }

  function chooseCharacter(id) {
    app.state.fun.road.selected = id;
    app.state.fun.road.phase = "play";
    app.state.fun.road.row = 6;
    app.state.fun.road.col = 2;
    h.showFeedback("Go go go!", "success");
    startLoop();
    render();
  }

  function startLoop() {
    h.clearFunTimers();
    h.addFunTimer(setInterval(stepGame, 140), "interval");
  }

  function stepGame() {
    var state = app.state.fun.road;
    if (!state || state.phase !== "play") return;
    state.tick += 1;
    var i;
    for (i = 0; i < state.obstacles.length; i++) {
      var obstacle = state.obstacles[i];
      obstacle.x += obstacle.speed * 0.08;
      if (obstacle.speed > 0 && obstacle.x > 5.3) obstacle.x = -0.9;
      if (obstacle.speed < 0 && obstacle.x < -1.3) obstacle.x = 5.2;
    }
    if (checkHit()) {
      state.lives -= 1;
      h.showFeedback("Oops! Try again!", "error");
      state.row = 6;
      state.col = 2;
      if (state.lives <= 0) {
        state.phase = "pick";
        state.lives = 3;
        state.obstacles = buildObstacles();
        h.clearFunTimers();
      }
    }
    render();
  }

  function movePlayer(direction) {
    var state = app.state.fun.road;
    if (!state || state.phase !== "play" || state.busy) return;
    if (direction === "up") state.row = Math.max(0, state.row - 1);
    if (direction === "down") state.row = Math.min(6, state.row + 1);
    if (direction === "left") state.col = Math.max(0, state.col - 1);
    if (direction === "right") state.col = Math.min(3, state.col + 1);
    if (state.row === 0) {
      state.phase = "win";
      state.win = true;
      state.coins += 5;
      h.clearFunTimers();
      h.spawnConfetti(36, true);
      h.showFeedback("You made it!", "success");
    } else if (checkHit()) {
      stepGame();
      return;
    }
    render();
  }

  function checkHit() {
    var state = app.state.fun.road;
    var playerX = 0.1 + (state.col * 0.25);
    var playerLane = state.row;
    var i;
    for (i = 0; i < state.obstacles.length; i++) {
      var obstacle = state.obstacles[i];
      if (obstacle.lane !== playerLane) continue;
      var dx = Math.abs((obstacle.x / 5) - playerX);
      if (dx < 0.12) return true;
    }
    return false;
  }

  function getCharacter(id) {
    var i;
    for (i = 0; i < characters.length; i++) if (characters[i].id === id) return characters[i];
    return characters[0];
  }

  function repeat(icon, count) {
    var text = "";
    var i;
    for (i = 0; i < count; i++) text += icon;
    return text;
  }

  app.funGames.road = { start: start };
})();
