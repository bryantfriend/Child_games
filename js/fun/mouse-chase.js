(function () {
  var app = window.ICTApp;
  var h = app.helpers;
  var CELL = 8;
  var CORRIDOR = 8.8;
  var MOUSE_RADIUS = 2.1;

  var mazeLevels = [
    mazeLevel("Level 1", "Easy", [[1, 6], [3, 6], [5, 6], [7, 6], [9, 6]], []),
    mazeLevel("Level 2", "Easy", [[1, 8], [3, 8], [5, 8], [5, 6], [5, 4], [7, 4], [9, 4]], []),
    mazeLevel("Level 3", "Easy", [[1, 9], [3, 9], [3, 7], [3, 5], [5, 5], [7, 5], [7, 3], [9, 3]], []),
    mazeLevel("Level 4", "Medium", [[1, 10], [3, 10], [5, 10], [5, 8], [5, 6], [7, 6], [9, 6], [9, 4], [9, 2]], []),
    mazeLevel("Level 5", "Medium", [[1, 10], [1, 8], [1, 6], [3, 6], [5, 6], [5, 8], [7, 8], [9, 8], [9, 6], [9, 4], [9, 2]], []),
    mazeLevel("Level 6", "Medium", [[1, 10], [3, 10], [3, 8], [3, 6], [5, 6], [7, 6], [7, 4], [7, 2], [9, 2]], [{ segment: 5, from: 0.18, to: 0.82, on: 1.2, cycle: 2.2 }]),
    mazeLevel("Level 7", "Tricky", [[1, 10], [1, 8], [1, 6], [3, 6], [5, 6], [5, 8], [5, 10], [7, 10], [7, 8], [7, 6], [9, 6], [9, 4], [9, 2]], [{ segment: 8, from: 0.15, to: 0.85, on: 1.1, cycle: 2.3 }]),
    mazeLevel("Level 8", "Tricky", [[1, 10], [3, 10], [5, 10], [5, 8], [5, 6], [3, 6], [3, 4], [3, 2], [5, 2], [7, 2], [9, 2]], [{ segment: 3, from: 0.2, to: 0.8, on: 1.25, cycle: 2.4 }]),
    mazeLevel("Level 9", "Hard", [[1, 10], [1, 8], [3, 8], [5, 8], [5, 10], [7, 10], [7, 8], [7, 6], [5, 6], [3, 6], [3, 4], [5, 4], [7, 4], [9, 4], [9, 2]], [{ segment: 2, from: 0.22, to: 0.78, on: 1.1, cycle: 2.1 }, { segment: 11, from: 0.2, to: 0.82, on: 1, cycle: 2.35 }]),
    mazeLevel("Level 10", "Hard", [[1, 10], [3, 10], [3, 8], [3, 6], [5, 6], [7, 6], [7, 8], [7, 10], [9, 10], [9, 8], [9, 6], [9, 4], [7, 4], [5, 4], [5, 2], [7, 2], [9, 2]], [{ segment: 3, from: 0.18, to: 0.82, on: 1.05, cycle: 2.25 }, { segment: 8, from: 0.18, to: 0.82, on: 1.15, cycle: 2.4 }, { segment: 13, from: 0.18, to: 0.82, on: 1.05, cycle: 2.2 }])
  ];

  function mazeLevel(name, tag, cells, lasers) {
    return { name: name, tag: tag, cells: cells, lasers: lasers || [] };
  }

  function start() {
    h.clearFunTimers();
    app.state.fun = Object.assign({}, app.state.fun, {
      mode: "mouse",
      timers: [],
      mazeLevel: 0,
      mazeHighest: 0,
      mazeDragging: false,
      mazePointerId: null,
      mazeProgress: 0,
      mazePoint: null,
      mazeComplete: false,
      mazeMessage: "Drag the mouse through the maze.",
      mazeClockStart: Date.now(),
      mazeLastSafe: null
    });
    resetLevel(false);
    h.addFunTimer(setInterval(updateLasers, 160), "interval");
    render();
  }

  function render() {
    var levelData = currentLevel();
    var pathPoints = buildPathPoints(levelData.cells);
    var activeLasers = getActiveLasers();
    var levelDots = mazeLevels.map(function (_, index) {
      var cls = [];
      if (index <= app.state.fun.mazeHighest) cls.push("maze-level-dot-open");
      if (index === app.state.fun.mazeLevel) cls.push("maze-level-dot-on");
      return '<button class="maze-level-dot ' + cls.join(" ") + '" type="button" data-maze-level="' + index + '">' + (index + 1) + '</button>';
    }).join("");

    var corridorPath = svgPath(pathPoints);
    var laserHtml = levelData.lasers.map(function (laser, index) {
      var rect = laserRect(levelData, laser);
      var isOn = activeLasers.indexOf(index) !== -1;
      return '<div class="maze-laser-wrap maze-laser-wrap-block" style="left:' + rect.x + '%;top:' + rect.y + '%;width:' + rect.width + '%;height:' + rect.height + '%;">' +
        '<div class="maze-laser-block ' + (isOn ? "maze-laser-block-on" : "maze-laser-block-off") + '">' +
          '<span class="maze-laser-glow"></span><span class="maze-laser-glow maze-laser-glow-two"></span>' +
        '</div></div>';
    }).join("");

    var startPoint = pathPoints[0];
    var endPoint = pathPoints[pathPoints.length - 1];
    var point = app.state.fun.mazePoint;
    var progress = Math.round(app.state.fun.mazeProgress * 100);

    app.dom.gameArea.innerHTML = '<div class="game-card">' +
      h.getCardHeader('<span class="pill">' + levelData.name + '</span><span class="pill">' + levelData.tag + '</span><span class="pill">' + progress + '%</span>', "backToFun", "⬅ Fun Zone") +
      h.getMissionStrip("Mouse Maze Escape", "Stay inside the maze path. Wait for red laser blocks to switch off.", [{ label: "Reach the computer", done: app.state.fun.mazeComplete }, { label: "Level " + (app.state.fun.mazeLevel + 1) + " / " + mazeLevels.length, done: false }]) +
      '<div class="arcade-board maze-board">' +
        '<div class="maze-topbar"><div class="maze-levels">' + levelDots + '</div><div class="maze-helper" id="mazeHelper">' + app.state.fun.mazeMessage + '</div></div>' +
        '<div class="maze-stage maze-stage-real" id="mazeStage">' +
          '<svg class="maze-svg" viewBox="0 0 100 100" aria-hidden="true">' +
            '<rect x="0" y="0" width="100" height="100" rx="8" fill="#1f3861"/>' +
            '<path class="maze-wall-track" d="' + corridorPath + '" />' +
            '<path class="maze-floor-track" d="' + corridorPath + '" />' +
            renderDots(pathPoints) +
          '</svg>' +
          '<div class="maze-entrance maze-entrance-real" style="left:' + startPoint.x + '%;top:' + startPoint.y + '%;">🚪<span>Start</span></div>' +
          '<div class="maze-computer-goal maze-computer-goal-real" style="left:' + endPoint.x + '%;top:' + endPoint.y + '%;">' + computerGoalSvg() + '<span>Computer</span></div>' +
          laserHtml +
          '<button class="maze-mouse maze-mouse-real" type="button" id="mazeMouse" style="left:' + point.x + '%;top:' + point.y + '%;">' + mouseSvg() + '</button>' +
        '</div>' +
        '<div class="choice-row maze-actions"><button class="fun-button" type="button" id="mazeResetBtn">Restart Level</button><button class="big-choice output-choice calm-button" type="button" id="mazeNextBtn"' + (app.state.fun.mazeComplete ? "" : " disabled") + '>' + (app.state.fun.mazeLevel === mazeLevels.length - 1 ? "Play Again" : "Next Level") + '</button></div>' +
      '</div>' +
    '</div>';

    bindCommonButtons();
    bindMaze();
  }

  function bindCommonButtons() {
    var backBtn = document.getElementById("backToFun");
    if (backBtn) backBtn.addEventListener("click", function () {
      h.clearFunTimers();
      app.funGames.hub.start();
    });
    var resetBtn = document.getElementById("mazeResetBtn");
    if (resetBtn) resetBtn.addEventListener("click", function () {
      resetLevel(true);
      render();
    });
    var nextBtn = document.getElementById("mazeNextBtn");
    if (nextBtn) nextBtn.addEventListener("click", function () {
      if (!app.state.fun.mazeComplete) return;
      app.state.fun.mazeLevel = app.state.fun.mazeLevel === mazeLevels.length - 1 ? 0 : Math.min(app.state.fun.mazeLevel + 1, mazeLevels.length - 1);
      app.state.fun.mazeHighest = Math.max(app.state.fun.mazeHighest, app.state.fun.mazeLevel);
      resetLevel(false);
      render();
    });
    var levelBtns = app.dom.gameArea.querySelectorAll("[data-maze-level]");
    var i;
    for (i = 0; i < levelBtns.length; i++) {
      (function (btn) {
        btn.addEventListener("click", function () {
          var nextLevel = Number(btn.dataset.mazeLevel);
          if (nextLevel > app.state.fun.mazeHighest) return;
          app.state.fun.mazeLevel = nextLevel;
          resetLevel(false);
          render();
        });
      })(levelBtns[i]);
    }
  }

  function bindMaze() {
    var mouse = document.getElementById("mazeMouse");
    var stage = document.getElementById("mazeStage");
    if (!mouse || !stage) return;

    mouse.addEventListener("pointerdown", function (event) {
      app.state.fun.mazeDragging = true;
      app.state.fun.mazePointerId = event.pointerId;
      stage.setPointerCapture(event.pointerId);
      moveFromEvent(event, stage);
    });

    stage.addEventListener("pointermove", function (event) {
      if (!app.state.fun.mazeDragging) return;
      moveFromEvent(event, stage);
    });

    stage.addEventListener("pointerup", stopDrag);
    stage.addEventListener("pointercancel", stopDrag);
  }

  function stopDrag(event) {
    var stage = document.getElementById("mazeStage");
    app.state.fun.mazeDragging = false;
    app.state.fun.mazePointerId = null;
    if (stage && event && stage.hasPointerCapture && stage.hasPointerCapture(event.pointerId)) {
      stage.releasePointerCapture(event.pointerId);
    }
  }

  function moveFromEvent(event, stage) {
    var rect = stage.getBoundingClientRect();
    var x = ((event.clientX - rect.left) / rect.width) * 100;
    var y = ((event.clientY - rect.top) / rect.height) * 100;
    moveMouseTo(x, y);
  }

  function moveMouseTo(x, y) {
    var levelData = currentLevel();
    var pathPoints = buildPathPoints(levelData.cells);
    var nearest = projectToSegments(pathPoints, x, y);
    var widthLimit = CORRIDOR / 2 - MOUSE_RADIUS;

    if (nearest.distance > widthLimit || !insideCorridor(pathPoints, x, y)) {
      app.state.fun.mazeMessage = "Stay inside the path.";
      updateMazeUi();
      return;
    }

    if (hitActiveLaser(x, y)) {
      app.state.fun.mazeMessage = "Laser is on. Wait a moment!";
      h.showFeedback("Red laser blocks are dangerous!", "error");
      updateMazeUi();
      return;
    }

    if (nearest.progress + 0.18 < app.state.fun.mazeProgress) {
      app.state.fun.mazeMessage = "Move forward through the maze.";
      updateMazeUi();
      return;
    }

    app.state.fun.mazePoint = { x: x, y: y };
    app.state.fun.mazeLastSafe = { x: x, y: y };
    app.state.fun.mazeProgress = Math.max(app.state.fun.mazeProgress, nearest.progress);
    app.state.fun.mazeMessage = app.state.fun.mazeProgress > 0.94 ? "So close to the computer!" : "Nice careful maze work.";
    updateMazeUi();

    if (distancePoints({ x: x, y: y }, pathPoints[pathPoints.length - 1]) < 5.8 && !app.state.fun.mazeComplete) {
      completeLevel();
    }
  }

  function updateMazeUi() {
    var mouse = document.getElementById("mazeMouse");
    var helper = document.getElementById("mazeHelper");
    if (mouse && app.state.fun.mazePoint) {
      mouse.style.left = app.state.fun.mazePoint.x + "%";
      mouse.style.top = app.state.fun.mazePoint.y + "%";
    }
    if (helper) helper.textContent = app.state.fun.mazeMessage;
  }

  function completeLevel() {
    app.state.fun.mazeComplete = true;
    app.state.fun.mazeProgress = 1;
    app.state.fun.mazeHighest = Math.min(mazeLevels.length - 1, Math.max(app.state.fun.mazeHighest, app.state.fun.mazeLevel + 1));
    app.processAction('BUMP_STARS', { amount: 5 });
    h.spawnConfetti(34, false);
    h.showFeedback(app.state.fun.mazeLevel === mazeLevels.length - 1 ? "You beat all 10 levels!" : "Maze clear! +5 stars!", "success");
    render();
  }

  function resetLevel(showMessage) {
    var points = buildPathPoints(currentLevel().cells);
    app.state.fun.mazeDragging = false;
    app.state.fun.mazePointerId = null;
    app.state.fun.mazeProgress = 0;
    app.state.fun.mazeComplete = false;
    app.state.fun.mazeClockStart = Date.now();
    app.state.fun.mazePoint = { x: points[0].x, y: points[0].y };
    app.state.fun.mazeLastSafe = { x: points[0].x, y: points[0].y };
    app.state.fun.mazeMessage = showMessage ? "Level restarted. Begin at the door." : "Drag the mouse through the maze path.";
  }

  function updateLasers() {
    if (app.state.fun.mode !== "mouse") return;
    var nodes = app.dom.gameArea.querySelectorAll(".maze-laser-block");
    if (!nodes.length) return;
    var active = getActiveLasers();
    var i;
    for (i = 0; i < nodes.length; i++) {
      nodes[i].classList.toggle("maze-laser-block-on", active.indexOf(i) !== -1);
      nodes[i].classList.toggle("maze-laser-block-off", active.indexOf(i) === -1);
    }
  }

  function getActiveLasers() {
    var lasers = currentLevel().lasers;
    var elapsed = (Date.now() - app.state.fun.mazeClockStart) / 1000;
    var active = [];
    var i;
    for (i = 0; i < lasers.length; i++) {
      if ((elapsed % lasers[i].cycle) < lasers[i].on) active.push(i);
    }
    return active;
  }

  function hitActiveLaser(x, y) {
    var active = getActiveLasers();
    var levelData = currentLevel();
    var i;
    for (i = 0; i < active.length; i++) {
      if (pointInsideRect({ x: x, y: y }, laserRect(levelData, levelData.lasers[active[i]]), 1.2)) return true;
    }
    return false;
  }

  function currentLevel() {
    return mazeLevels[app.state.fun.mazeLevel || 0];
  }

  function buildPathPoints(cells) {
    return cells.map(function (cell) {
      return {
        x: 10 + cell[0] * CELL,
        y: 10 + cell[1] * CELL
      };
    });
  }

  function svgPath(points) {
    var text = "M " + points[0].x + " " + points[0].y;
    var i;
    for (i = 1; i < points.length; i++) text += " L " + points[i].x + " " + points[i].y;
    return text;
  }

  function renderDots(points) {
    return points.map(function (point, index) {
      return '<circle class="maze-checkpoint ' + (app.state.fun.mazeProgress >= index / (points.length - 1) ? "maze-checkpoint-on" : "") + '" cx="' + point.x + '" cy="' + point.y + '" r="' + (index === 0 || index === points.length - 1 ? 3.9 : 2.5) + '" />';
    }).join("");
  }

  function insideCorridor(points, x, y) {
    var i;
    for (i = 0; i < points.length - 1; i++) {
      if (distanceToSegment({ x: x, y: y }, points[i], points[i + 1]).distance <= (CORRIDOR / 2 - MOUSE_RADIUS)) return true;
    }
    return distancePoints({ x: x, y: y }, points[0]) <= (CORRIDOR / 2) || distancePoints({ x: x, y: y }, points[points.length - 1]) <= (CORRIDOR / 2);
  }

  function projectToSegments(points, x, y) {
    var total = totalLength(points);
    var walked = 0;
    var best = { distance: Infinity, progress: 0 };
    var i;
    for (i = 0; i < points.length - 1; i++) {
      var info = distanceToSegment({ x: x, y: y }, points[i], points[i + 1]);
      var segmentLength = distancePoints(points[i], points[i + 1]);
      var progress = (walked + segmentLength * info.t) / total;
      if (info.distance < best.distance) {
        best = { distance: info.distance, progress: progress };
      }
      walked += segmentLength;
    }
    return best;
  }

  function totalLength(points) {
    var total = 0;
    var i;
    for (i = 0; i < points.length - 1; i++) total += distancePoints(points[i], points[i + 1]);
    return total;
  }

  function distanceToSegment(point, a, b) {
    var dx = b.x - a.x;
    var dy = b.y - a.y;
    var lenSq = dx * dx + dy * dy;
    var t = lenSq ? ((point.x - a.x) * dx + (point.y - a.y) * dy) / lenSq : 0;
    t = Math.max(0, Math.min(1, t));
    var px = a.x + dx * t;
    var py = a.y + dy * t;
    return { distance: distancePoints(point, { x: px, y: py }), t: t };
  }

  function distancePoints(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function laserRect(levelData, laser) {
    var points = buildPathPoints(levelData.cells);
    var a = points[laser.segment];
    var b = points[laser.segment + 1];
    var horizontal = Math.abs(a.y - b.y) < 0.01;
    var startX = a.x + (b.x - a.x) * laser.from;
    var endX = a.x + (b.x - a.x) * laser.to;
    var startY = a.y + (b.y - a.y) * laser.from;
    var endY = a.y + (b.y - a.y) * laser.to;
    return horizontal
      ? { x: Math.min(startX, endX), y: a.y - CORRIDOR / 2, width: Math.abs(endX - startX), height: CORRIDOR }
      : { x: a.x - CORRIDOR / 2, y: Math.min(startY, endY), width: CORRIDOR, height: Math.abs(endY - startY) };
  }

  function pointInsideRect(point, rect, inset) {
    var pad = inset || 0;
    return point.x >= rect.x + pad &&
      point.x <= rect.x + rect.width - pad &&
      point.y >= rect.y + pad &&
      point.y <= rect.y + rect.height - pad;
  }

  function mouseSvg() {
    return '<svg viewBox="0 0 120 120" class="fun-svg" aria-label="Mouse">' +
      '<ellipse cx="60" cy="66" rx="28" ry="34" fill="#f7fbff"/>' +
      '<ellipse cx="60" cy="66" rx="24" ry="30" fill="#dce8ff"/>' +
      '<path d="M60 34v34" stroke="#6e96f7" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M60 68c-16 0-22-9-22-25" fill="none" stroke="#b7cdf8" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M60 68c16 0 22-9 22-25" fill="none" stroke="#b7cdf8" stroke-width="5" stroke-linecap="round"/>' +
      '<rect x="50" y="74" width="20" height="12" rx="6" fill="#7aa4ef"/>' +
      '<path d="M76 38c16-20 30-22 38-14 8 8 8 20-2 30" fill="none" stroke="#ffb347" stroke-width="7" stroke-linecap="round"/>' +
      '<circle cx="114" cy="54" r="7" fill="#ffb347"/>' +
    '</svg>';
  }

  function computerGoalSvg() {
    return '<svg viewBox="0 0 92 92" class="fun-svg" aria-hidden="true">' +
      '<rect x="14" y="10" width="64" height="44" rx="12" fill="#325ca8"/>' +
      '<rect x="20" y="16" width="52" height="32" rx="10" fill="#8be6ff"/>' +
      '<circle cx="36" cy="31" r="4" fill="#244667"/>' +
      '<circle cx="54" cy="31" r="4" fill="#244667"/>' +
      '<path d="M32 40q14 10 28 0" fill="none" stroke="#244667" stroke-linecap="round" stroke-width="5"/>' +
      '<rect x="40" y="54" width="12" height="12" rx="5" fill="#355da6"/>' +
      '<rect x="28" y="66" width="36" height="8" rx="4" fill="#274a7d"/>' +
    '</svg>';
  }

  app.funGames.mouse = { start: start, render: render };
})();
