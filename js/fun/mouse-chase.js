(function () {
  var app = window.ICTApp;
  var h = app.helpers;

  var mazeLevels = [
    level("Level 1", "Easy", [{ x: 12, y: 50 }, { x: 86, y: 50 }], []),
    level("Level 2", "Easy", [{ x: 12, y: 66 }, { x: 38, y: 66 }, { x: 38, y: 40 }, { x: 86, y: 40 }], []),
    level("Level 3", "Easy", [{ x: 12, y: 76 }, { x: 28, y: 76 }, { x: 28, y: 56 }, { x: 52, y: 56 }, { x: 52, y: 30 }, { x: 86, y: 30 }], []),
    level("Level 4", "Medium", [{ x: 12, y: 82 }, { x: 24, y: 82 }, { x: 24, y: 62 }, { x: 46, y: 62 }, { x: 46, y: 42 }, { x: 70, y: 42 }, { x: 70, y: 22 }, { x: 86, y: 22 }], []),
    level("Level 5", "Medium", [{ x: 12, y: 80 }, { x: 22, y: 80 }, { x: 22, y: 56 }, { x: 58, y: 56 }, { x: 58, y: 72 }, { x: 76, y: 72 }, { x: 76, y: 24 }, { x: 86, y: 24 }], []),
    level("Level 6", "Medium", [{ x: 12, y: 84 }, { x: 28, y: 84 }, { x: 28, y: 64 }, { x: 44, y: 64 }, { x: 44, y: 30 }, { x: 60, y: 30 }, { x: 60, y: 52 }, { x: 84, y: 52 }, { x: 84, y: 16 }], [laser(4, 0.9, 1.9)]),
    level("Level 7", "Tricky", [{ x: 12, y: 84 }, { x: 22, y: 84 }, { x: 22, y: 44 }, { x: 42, y: 44 }, { x: 42, y: 70 }, { x: 62, y: 70 }, { x: 62, y: 26 }, { x: 86, y: 26 }], [laser(2, 0.8, 2.2)]),
    level("Level 8", "Tricky", [{ x: 12, y: 84 }, { x: 30, y: 84 }, { x: 30, y: 60 }, { x: 54, y: 60 }, { x: 54, y: 38 }, { x: 36, y: 38 }, { x: 36, y: 18 }, { x: 84, y: 18 }], [laser(4, 0.75, 2)]),
    level("Level 9", "Hard", [{ x: 12, y: 88 }, { x: 22, y: 88 }, { x: 22, y: 56 }, { x: 42, y: 56 }, { x: 42, y: 78 }, { x: 62, y: 78 }, { x: 62, y: 34 }, { x: 78, y: 34 }, { x: 78, y: 18 }, { x: 88, y: 18 }], [laser(2, 0.8, 2.3), laser(6, 0.7, 2.1)]),
    level("Level 10", "Hard", [{ x: 12, y: 88 }, { x: 22, y: 88 }, { x: 22, y: 64 }, { x: 40, y: 64 }, { x: 40, y: 84 }, { x: 62, y: 84 }, { x: 62, y: 46 }, { x: 48, y: 46 }, { x: 48, y: 22 }, { x: 74, y: 22 }, { x: 74, y: 58 }, { x: 88, y: 58 }, { x: 88, y: 14 }], [laser(2, 0.7, 2.4), laser(6, 0.75, 2.1), laser(9, 0.7, 2.6)])
  ];

  function level(name, tag, points, lasers) {
    return { name: name, tag: tag, points: points, lasers: lasers || [] };
  }

  function laser(segmentIndex, onSeconds, cycleSeconds) {
    return { segmentIndex: segmentIndex, onSeconds: onSeconds, cycleSeconds: cycleSeconds };
  }

  function start() {
    h.clearFunTimers();
    app.state.fun = Object.assign({}, app.state.fun, {
      mode: "mouse",
      timers: [],
      mazeLevel: 0,
      mazeHighest: 0,
      mazeDragging: false,
      mazeAlong: 0,
      mazePointerId: null,
      mazePoint: { x: 0, y: 0 },
      mazeProgress: 0,
      mazeComplete: false,
      mazeMessage: "Drag slowly on the path.",
      mazeStartStamp: Date.now()
    });
    resetLevel(false);
    startLaserClock();
    render();
  }

  function render() {
    var levelData = getLevel();
    var progress = Math.round(app.state.fun.mazeProgress * 100);
    var activeLasers = getActiveLaserIndexes();
    var checkpoints = levelData.points.map(function(point, index) {
      var active = index / (levelData.points.length - 1) <= app.state.fun.mazeProgress ? "maze-checkpoint-on" : "";
      return '<circle class="maze-checkpoint ' + active + '" cx="' + point.x + '" cy="' + point.y + '" r="' + (index === 0 || index === levelData.points.length - 1 ? 4.8 : 3.5) + '" />';
    }).join("");
    var laserHtml = levelData.lasers.map(function(item, index) {
      var segment = getSegment(levelData.points, item.segmentIndex);
      var isOn = activeLasers.indexOf(index) !== -1;
      var x = (segment.a.x + segment.b.x) / 2;
      var y = (segment.a.y + segment.b.y) / 2;
      var angle = Math.atan2(segment.b.y - segment.a.y, segment.b.x - segment.a.x) * 180 / Math.PI;
      var length = distance(segment.a, segment.b) * 0.84;
      return '<div class="maze-laser-wrap" style="left:' + x + '%;top:' + y + '%;transform: translate(-50%, -50%) rotate(' + angle + 'deg);"><div class="maze-laser ' + (isOn ? "maze-laser-on" : "maze-laser-off") + '" style="width:' + length + '%;"></div></div>';
    }).join("");
    var levelDots = mazeLevels.map(function(item, index) {
      var cls = index === app.state.fun.mazeLevel ? "maze-level-dot-on " : "";
      if (index <= app.state.fun.mazeHighest) cls += "maze-level-dot-open";
      return '<button class="maze-level-dot ' + cls + '" type="button" data-maze-level="' + index + '">' + (index + 1) + '</button>';
    }).join("");
    var entrance = levelData.points[0];
    var computer = levelData.points[levelData.points.length - 1];

    app.dom.gameArea.innerHTML = '<div class="game-card">' +
      h.getCardHeader('<span class="pill">' + levelData.name + '</span><span class="pill">' + levelData.tag + '</span><span class="pill">Maze ' + progress + '%</span>', "backToFun", "⬅ Fun Zone") +
      h.getMissionStrip("Mouse Maze Escape", "Start at the door. Follow the path to the computer. Higher levels add sleepy lasers.", [{ label: "Reach the computer", done: app.state.fun.mazeComplete }, { label: "Level " + (app.state.fun.mazeLevel + 1) + " / " + mazeLevels.length, done: false }]) +
      '<div class="arcade-board maze-board">' +
        '<div class="maze-topbar"><div class="maze-levels">' + levelDots + '</div><div class="maze-helper">' + app.state.fun.mazeMessage + '</div></div>' +
        '<div class="maze-stage" id="mazeStage">' +
          '<svg class="maze-svg" viewBox="0 0 100 100" aria-hidden="true">' +
            '<path class="maze-track" d="' + pathData(levelData.points) + '" />' +
            '<path class="maze-dash" d="' + pathData(levelData.points) + '" />' +
            checkpoints +
          '</svg>' +
          '<div class="maze-entrance" style="left:' + (entrance.x - 4) + '%;top:' + (entrance.y + 7) + '%;">🚪<span>Start</span></div>' +
          '<div class="maze-computer-goal" style="left:' + computer.x + '%;top:' + computer.y + '%;">' + computerGoalSvg() + '<span>Computer</span></div>' +
          laserHtml +
          '<button class="maze-mouse" type="button" id="mazeMouse" style="left:' + app.state.fun.mazePoint.x + '%;top:' + app.state.fun.mazePoint.y + '%;">' +
            mouseSvg() +
          '</button>' +
        '</div>' +
        '<div class="choice-row maze-actions"><button class="fun-button" type="button" id="mazeResetBtn">Restart Level</button><button class="big-choice output-choice calm-button" type="button" id="mazeNextBtn"' + (app.state.fun.mazeComplete ? "" : " disabled") + '>' + (app.state.fun.mazeLevel === mazeLevels.length - 1 ? "Play Again" : "Next Level") + '</button></div>' +
      '</div>' +
    '</div>';

    bindCommonButtons();
    bindMaze();
  }

  function bindCommonButtons() {
    var backBtn = document.getElementById("backToFun");
    if (backBtn) backBtn.addEventListener("click", function() { app.funGames.hub.start(); });
    var resetBtn = document.getElementById("mazeResetBtn");
    if (resetBtn) resetBtn.addEventListener("click", function() { resetLevel(true); render(); });
    var nextBtn = document.getElementById("mazeNextBtn");
    if (nextBtn) nextBtn.addEventListener("click", function() {
      if (!app.state.fun.mazeComplete) return;
      app.state.fun.mazeLevel = app.state.fun.mazeLevel === mazeLevels.length - 1 ? 0 : Math.min(app.state.fun.mazeLevel + 1, mazeLevels.length - 1);
      app.state.fun.mazeHighest = Math.max(app.state.fun.mazeHighest, app.state.fun.mazeLevel);
      resetLevel(false);
      render();
    });
    var levelBtns = app.dom.gameArea.querySelectorAll("[data-maze-level]");
    var i;
    for (i = 0; i < levelBtns.length; i++) {
      (function(btn) {
        btn.addEventListener("click", function() {
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

    mouse.addEventListener("pointerdown", function(event) {
      app.state.fun.mazeDragging = true;
      app.state.fun.mazePointerId = event.pointerId;
      stage.setPointerCapture(event.pointerId);
      moveMouseFromEvent(event, stage, true);
    });
    stage.addEventListener("pointermove", function(event) {
      if (!app.state.fun.mazeDragging) return;
      moveMouseFromEvent(event, stage, false);
    });
    stage.addEventListener("pointerup", stopMazeDrag);
    stage.addEventListener("pointercancel", stopMazeDrag);
    stage.addEventListener("pointerleave", function() {
      if (!app.state.fun.mazeComplete) app.state.fun.mazeMessage = "Keep your mouse on the path.";
    });
  }

  function stopMazeDrag(event) {
    var stage = document.getElementById("mazeStage");
    app.state.fun.mazeDragging = false;
    app.state.fun.mazePointerId = null;
    if (stage && event && stage.hasPointerCapture && stage.hasPointerCapture(event.pointerId)) stage.releasePointerCapture(event.pointerId);
  }

  function moveMouseFromEvent(event, stage, forceStart) {
    var rect = stage.getBoundingClientRect();
    var x = ((event.clientX - rect.left) / rect.width) * 100;
    var y = ((event.clientY - rect.top) / rect.height) * 100;
    moveMouse(x, y, forceStart);
  }

  function moveMouse(x, y, forceStart) {
    var levelData = getLevel();
    var projection = projectOntoPath(levelData.points, x, y);
    var maxJump = levelData.tag === "Easy" ? 0.16 : levelData.tag === "Medium" ? 0.12 : 0.09;
    var lastAlong = app.state.fun.mazeAlong;
    var nextAlong = Math.max(lastAlong, projection.along);
    if (forceStart) nextAlong = Math.min(nextAlong, 0.04);
    if (nextAlong - lastAlong > maxJump) nextAlong = lastAlong + maxJump;
    var snapped = pointAtAlong(levelData.points, nextAlong);

    if (projection.distance > 13) {
      app.state.fun.mazeMessage = "Move closer to the path.";
      updateMouseNode();
      return;
    }

    if (hitLaser(nextAlong)) {
      app.state.fun.mazeMessage = "Laser on. Wait... now go!";
      h.showFeedback("Wait for the laser to turn off.", "info");
      updateMouseNode();
      return;
    }

    app.state.fun.mazeAlong = nextAlong;
    app.state.fun.mazeProgress = nextAlong;
    app.state.fun.mazePoint = snapped;
    app.state.fun.mazeMessage = nextAlong > 0.96 ? "The computer is right there!" : "Nice and easy.";
    updateMouseNode();

    if (nextAlong >= 0.995 && !app.state.fun.mazeComplete) {
      completeLevel();
    }
  }

  function updateMouseNode() {
    var node = document.getElementById("mazeMouse");
    if (node) {
      node.style.left = app.state.fun.mazePoint.x + "%";
      node.style.top = app.state.fun.mazePoint.y + "%";
    }
    var helper = document.querySelector(".maze-helper");
    if (helper) helper.textContent = app.state.fun.mazeMessage;
  }

  function completeLevel() {
    app.state.fun.mazeComplete = true;
    app.state.fun.mazeProgress = 1;
    app.state.fun.mazeAlong = 1;
    app.state.fun.mazeMessage = "You reached the computer!";
    app.state.fun.mazeHighest = Math.min(mazeLevels.length - 1, Math.max(app.state.fun.mazeHighest, app.state.fun.mazeLevel + 1));
    app.processAction('BUMP_STARS', { amount: 5 });
    h.spawnConfetti(34, false);
    h.showFeedback(app.state.fun.mazeLevel === mazeLevels.length - 1 ? "You beat all 10 levels!" : "Maze clear! +5 stars!", "success");
    render();
  }

  function resetLevel(showMessage) {
    var levelData = getLevel();
    app.state.fun.mazeAlong = 0;
    app.state.fun.mazeProgress = 0;
    app.state.fun.mazeComplete = false;
    app.state.fun.mazeDragging = false;
    app.state.fun.mazePointerId = null;
    app.state.fun.mazePoint = { x: levelData.points[0].x, y: levelData.points[0].y };
    app.state.fun.mazeStartStamp = Date.now();
    app.state.fun.mazeMessage = showMessage ? "Level restarted. Start at the door." : "Drag from the door to the computer.";
  }

  function startLaserClock() {
    h.addFunTimer(setInterval(function() {
      if (app.state.fun.mode !== "mouse") return;
      renderLasersOnly();
    }, 250), "interval");
  }

  function renderLasersOnly() {
    var wraps = app.dom.gameArea.querySelectorAll(".maze-laser");
    if (!wraps.length) return;
    var active = getActiveLaserIndexes();
    var i;
    for (i = 0; i < wraps.length; i++) {
      wraps[i].classList.toggle("maze-laser-on", active.indexOf(i) !== -1);
      wraps[i].classList.toggle("maze-laser-off", active.indexOf(i) === -1);
    }
  }

  function getActiveLaserIndexes() {
    var levelData = getLevel();
    var elapsed = (Date.now() - app.state.fun.mazeStartStamp) / 1000;
    var active = [];
    var i;
    for (i = 0; i < levelData.lasers.length; i++) {
      if ((elapsed % levelData.lasers[i].cycleSeconds) < levelData.lasers[i].onSeconds) active.push(i);
    }
    return active;
  }

  function hitLaser(along) {
    var levelData = getLevel();
    var active = getActiveLaserIndexes();
    var i;
    for (i = 0; i < active.length; i++) {
      var item = levelData.lasers[active[i]];
      var mark = segmentStartRatio(levelData.points, item.segmentIndex) + segmentRatio(levelData.points, item.segmentIndex) / 2;
      if (Math.abs(along - mark) < 0.04) return true;
    }
    return false;
  }

  function getLevel() {
    return mazeLevels[app.state.fun.mazeLevel || 0];
  }

  function pathData(points) {
    var i;
    var text = "M " + points[0].x + " " + points[0].y;
    for (i = 1; i < points.length; i++) text += " L " + points[i].x + " " + points[i].y;
    return text;
  }

  function getSegment(points, index) {
    return { a: points[index], b: points[index + 1] };
  }

  function projectOntoPath(points, x, y) {
    var total = totalLength(points);
    var best = { distance: Infinity, along: 0 };
    var walked = 0;
    var i;
    for (i = 0; i < points.length - 1; i++) {
      var segment = getSegment(points, i);
      var dx = segment.b.x - segment.a.x;
      var dy = segment.b.y - segment.a.y;
      var lengthSq = dx * dx + dy * dy;
      var t = lengthSq ? clamp(((x - segment.a.x) * dx + (y - segment.a.y) * dy) / lengthSq, 0, 1) : 0;
      var px = segment.a.x + dx * t;
      var py = segment.a.y + dy * t;
      var dist = distance({ x: x, y: y }, { x: px, y: py });
      if (dist < best.distance) {
        best.distance = dist;
        best.along = (walked + Math.sqrt(lengthSq) * t) / total;
      }
      walked += Math.sqrt(lengthSq);
    }
    return best;
  }

  function pointAtAlong(points, along) {
    var total = totalLength(points);
    var target = total * along;
    var walked = 0;
    var i;
    for (i = 0; i < points.length - 1; i++) {
      var segment = getSegment(points, i);
      var segLength = distance(segment.a, segment.b);
      if (walked + segLength >= target) {
        var t = segLength ? (target - walked) / segLength : 0;
        return { x: segment.a.x + (segment.b.x - segment.a.x) * t, y: segment.a.y + (segment.b.y - segment.a.y) * t };
      }
      walked += segLength;
    }
    return { x: points[points.length - 1].x, y: points[points.length - 1].y };
  }

  function segmentStartRatio(points, index) {
    var walked = 0;
    var total = totalLength(points);
    var i;
    for (i = 0; i < index; i++) walked += distance(points[i], points[i + 1]);
    return walked / total;
  }

  function segmentRatio(points, index) {
    return distance(points[index], points[index + 1]) / totalLength(points);
  }

  function totalLength(points) {
    var total = 0;
    var i;
    for (i = 0; i < points.length - 1; i++) total += distance(points[i], points[i + 1]);
    return total;
  }

  function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
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
