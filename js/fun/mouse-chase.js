(function () {
  var app = window.ICTApp;
  var h = app.helpers;

  var checkpoints = [
    { x: 12, y: 84 },
    { x: 28, y: 84 },
    { x: 28, y: 62 },
    { x: 54, y: 62 },
    { x: 54, y: 34 },
    { x: 82, y: 34 },
    { x: 82, y: 14 },
  ];

  var cheeseSpots = [
    { x: 26, y: 72, hit: false },
    { x: 56, y: 48, hit: false },
    { x: 74, y: 22, hit: false },
  ];

  function start() {
    h.clearFunTimers();
    app.state.fun = Object.assign({}, app.state.fun, {
      mode: "mouse",
      timers: [],
      mazePoint: { x: checkpoints[0].x, y: checkpoints[0].y },
      mazeCheckpoint: 0,
      mazeDragging: false,
      mazeCheese: cheeseSpots.map(function(spot, index) { 
        return Object.assign({}, spot, { id: index }); 
      }),
    });
    render();
  }

  function render() {
    var progress = Math.round((app.state.fun.mazeCheckpoint / (checkpoints.length - 1)) * 100);
    var cheeseHitCount = app.state.fun.mazeCheese.filter(function(s) { return s.hit; }).length;
    
    var checkpointCircles = checkpoints.map(function(point, index) {
      var cls = index <= app.state.fun.mazeCheckpoint ? "maze-checkpoint-on" : "";
      var r = index === checkpoints.length - 1 ? 5 : 3.6;
      return '<circle class="maze-checkpoint ' + cls + '" cx="' + point.x + '" cy="' + point.y + '" r="' + r + '" />';
    }).join("");

    var cheeseHtml = app.state.fun.mazeCheese.map(function(spot) {
      var cls = spot.hit ? "maze-cheese-hit" : "";
      return '<div class="maze-cheese ' + cls + '" style="left:' + spot.x + '%;top:' + spot.y + '%;">🧀</div>';
    }).join("");

    app.dom.gameArea.innerHTML = '<div class="game-card">' + h.getCardHeader('<span class="pill">Maze ' + progress + '%</span><span class="pill">Cheese ' + cheeseHitCount + ' / ' + app.state.fun.mazeCheese.length + '</span>', "backToFun", "⬅ Fun Zone") + h.getMissionStrip("Mouse Maze Escape", "Drag the mouse on the path. Stay slow and steady.", [{ label: "Reach the cheese house", done: progress >= 100 }]) +
      '<div class="arcade-board maze-board">' +
        '<div class="maze-stage" id="mazeStage">' +
          '<svg class="maze-svg" viewBox="0 0 100 100" aria-hidden="true">' +
            '<path class="maze-track" d="M 12 84 H 28 V 62 H 54 V 34 H 82 V 14" />' +
            '<path class="maze-dash" d="M 12 84 H 28 V 62 H 54 V 34 H 82 V 14" />' +
            checkpointCircles +
          '</svg>' +
          '<div class="maze-finish-house">' +
            '<svg viewBox="0 0 120 120" class="fun-svg maze-house-art" aria-hidden="true">' +
              '<path d="M15 58 60 20l45 38v45H15z" fill="#ffcd70"/>' +
              '<path d="M36 104V70h22v34z" fill="#9f5c2e"/>' +
              '<path d="M71 69h18v18H71z" fill="#8be6ff"/>' +
              '<path d="M10 58 60 10l50 48" fill="none" stroke="#8a3f11" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/>' +
              '<circle cx="92" cy="25" r="10" fill="#ffd84f"/>' +
              '<circle cx="29" cy="36" r="6" fill="#fff0b0"/>' +
            '</svg>' +
          '</div>' +
          cheeseHtml +
          '<button class="maze-mouse" type="button" id="mazeMouse" style="left:' + app.state.fun.mazePoint.x + '%;top:' + app.state.fun.mazePoint.y + '%;">' +
            '<svg viewBox="0 0 120 120" class="fun-svg" aria-label="Mouse">' +
              '<ellipse cx="64" cy="66" rx="28" ry="22" fill="#c9d2df"/>' +
              '<ellipse cx="40" cy="44" rx="15" ry="16" fill="#dbe4f3"/>' +
              '<ellipse cx="75" cy="40" rx="14" ry="15" fill="#dbe4f3"/>' +
              '<ellipse cx="40" cy="46" rx="7" ry="7" fill="#ff98b5"/>' +
              '<ellipse cx="75" cy="42" rx="6" ry="6" fill="#ff98b5"/>' +
              '<circle cx="83" cy="66" r="13" fill="#eef4ff"/>' +
              '<circle cx="86" cy="63" r="3.6" fill="#25324a"/>' +
              '<circle cx="79" cy="71" r="2.8" fill="#ff7aa5"/>' +
              '<path d="M34 68q-25 10-16 26" fill="none" stroke="#f4b2c8" stroke-linecap="round" stroke-width="5"/>' +
            '</svg>' +
          '</button>' +
        '</div>' +
      '</div>' +
    '</div>';
    
    var backBtn = document.getElementById("backToFun");
    if (backBtn) backBtn.addEventListener("click", function() { app.funGames.hub.start(); });
    
    bindMaze();
  }

  function bindMaze() {
    var mouse = document.getElementById("mazeMouse");
    var stage = document.getElementById("mazeStage");
    if (!mouse || !stage) return;
    
    mouse.addEventListener("pointerdown", function(event) {
      app.state.fun.mazeDragging = true;
      mouse.setPointerCapture(event.pointerId);
    });
    
    mouse.addEventListener("pointermove", function(event) {
      if (!app.state.fun.mazeDragging) return;
      var rect = stage.getBoundingClientRect();
      var x = ((event.clientX - rect.left) / rect.width) * 100;
      var y = ((event.clientY - rect.top) / rect.height) * 100;
      moveMouse(x, y);
    });
    
    mouse.addEventListener("pointerup", function(event) { stopMazeDrag(mouse, event.pointerId); });
    mouse.addEventListener("pointercancel", function(event) { stopMazeDrag(mouse, event.pointerId); });
  }

  function stopMazeDrag(mouse, pointerId) {
    app.state.fun.mazeDragging = false;
    if (mouse.hasPointerCapture(pointerId)) mouse.releasePointerCapture(pointerId);
  }

  function distanceToPoint(x, y, point) {
    var dx = x - point.x;
    var dy = y - point.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function moveMouse(x, y) {
    var checkpointIndex = app.state.fun.mazeCheckpoint;
    var nextCheckpoint = checkpoints[Math.min(checkpointIndex + 1, checkpoints.length - 1)];
    var lastCheckpoint = checkpoints[checkpointIndex];
    var distanceFromTrack = Math.min(distanceToPoint(x, y, lastCheckpoint), distanceToPoint(x, y, nextCheckpoint));
    
    if (distanceFromTrack > 14) {
      h.showFeedback("Oops! Back to start.", "error");
      app.state.fun.mazePoint = { x: checkpoints[0].x, y: checkpoints[0].y };
      app.state.fun.mazeCheckpoint = 0;
      app.state.fun.mazeCheese.forEach(function(s) { s.hit = false; });
      return render();
    }
    
    app.state.fun.mazePoint = { x: x, y: y };
    var node = document.getElementById("mazeMouse");
    if (node) {
      node.style.left = x + "%";
      node.style.top = y + "%";
    }
    
    collectCheese(x, y);
    
    if (distanceToPoint(x, y, nextCheckpoint) < 7 && checkpointIndex < checkpoints.length - 1) {
      app.state.fun.mazeCheckpoint += 1;
      app.processAction('BUMP_STARS', { amount: 1 });
      h.showFeedback(app.state.fun.mazeCheckpoint === checkpoints.length - 1 ? "Maze escape!" : "Nice and steady!", "success");
      if (app.state.fun.mazeCheckpoint === checkpoints.length - 1) {
        h.spawnConfetti(28, false);
        h.addFunTimer(setTimeout(function() { app.funGames.hub.start(); }, 700), "timeout");
        return;
      }
      render();
    }
  }

  function collectCheese(x, y) {
    var changed = false;
    app.state.fun.mazeCheese.forEach(function(spot) {
      if (!spot.hit && distanceToPoint(x, y, spot) < 7) {
        spot.hit = true;
        changed = true;
        app.processAction('BUMP_STARS', { amount: 2 });
        h.showFeedback("Cheese bonus!", "success");
      }
    });
    if (changed) render();
  }

  app.funGames.mouse = { start: start, render: render };
})();
