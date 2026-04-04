(function () {
  var app = window.ICTApp;
  var buildParts = app.data.buildParts;
  var buildFunctions = app.data.buildFunctions;
  var buildPrompts = app.data.buildPrompts;
  var h = app.helpers;

  function renderDraggable(item, kind, placed) {
    return '<div class="draggable-item ' + (placed ? "placed" : "") + '" data-kind="' + kind + '" data-id="' + item.id + '">' + h.renderIcon(item, "draggable-item-emoji") + '<div><strong>' + item.label + '</strong><div>' + (kind === "function" ? item.label : item.hint) + '</div></div></div>';
  }

  function start() {
    app.state.build = { mission: 1, placed: {}, matched: [], promptIndex: 0, celebrated: false, drawStrokes: 0 };
    render();
  }

  function render() {
    var build = app.state.build;
    var missions = [{ label: "1. Build the computer", done: build.mission > 1 }, { label: "2. Match each job", done: build.mission > 2 }, { label: "3. Quick tap challenge", done: build.mission > 3 }];
    var body = "";
    
    if (build.mission === 1) {
      var gridHtml = buildParts.map(function(part) {
        return '<div class="drop-zone ' + (build.placed[part.id] ? "filled" : "") + '" data-zone="' + part.zone + '"><div>' + h.renderIcon(part, "drop-zone-icon") + '<strong>' + part.label + '</strong><p>' + (build.placed[part.id] ? "Placed!" : part.hint) + '</p></div></div>';
      }).join("");
      var listHtml = h.shuffleArray(buildParts.slice()).map(function(part) {
        return renderDraggable(part, "build", Boolean(build.placed[part.id]));
      }).join("");
      body = '<div class="build-layout"><div class="computer-board"><div class="drop-zone-grid">' + gridHtml + '</div></div><div class="tray"><div class="pill">Mission 1 of 3</div><div class="draggable-list">' + listHtml + '</div><p class="hint">Drag the part to the same picture.</p></div></div>';
    } else if (build.mission === 2) {
      var funcGridHtml = buildParts.map(function(part) {
        return '<div class="drop-zone function-target ' + (build.matched.indexOf(part.id) !== -1 ? "filled" : "") + '" data-function-target="' + part.id + '"><div>' + h.renderIcon(part, "drop-zone-icon") + '<strong>' + part.label + '</strong><p>' + (build.matched.indexOf(part.id) !== -1 ? "Job matched!" : "Drop the correct job card here.") + '</p></div></div>';
      }).join("");
      var funcListHtml = h.shuffleArray(buildFunctions.slice()).map(function(card) {
        return renderDraggable(card, "function", build.matched.indexOf(card.target) !== -1);
      }).join("");
      body = '<div class="build-layout"><div class="computer-board"><div class="drop-zone-grid function-grid">' + funcGridHtml + '</div></div><div class="tray"><div class="pill">Mission 2 of 3</div><div class="draggable-list">' + funcListHtml + '</div><p class="hint">Match the job card.</p></div></div>';
    } else if (build.mission === 3) {
      var prompt = buildPrompts[build.promptIndex];
      var targetHtml = h.shuffleArray(buildParts.slice()).map(function(part) {
        return '<button class="teacher-target" type="button" data-build-answer="' + part.id + '">' + h.renderIcon(part, "sort-icon") + '<span>' + part.label + '</span></button>';
      }).join("");
      body = '<div class="teacher-layout"><div class="teacher-stage"><div class="teacher-icon">⚡</div><h3 class="teacher-command">' + prompt.clue + '</h3><p class="teacher-subtext">Tap the right part. ' + (build.promptIndex + 1) + ' / ' + buildPrompts.length + '</p></div><div class="teacher-targets">' + targetHtml + '</div></div>';
    } else {
      body = '<div class="win-panel build-finish-panel"><h3>Computer Island complete!</h3><p>You built it, matched it, and tapped fast. Draw a happy computer picture, then go back to the map.</p><div class="build-finish-draw"><canvas id="buildFinishCanvas" class="paint-canvas build-finish-canvas" width="820" height="320"></canvas></div><div class="choice-row"><button class="fun-button" type="button" id="buildClearBtn">Clear Drawing</button><button class="big-choice output-choice calm-button" type="button" id="buildMapBtn">Back To Map</button></div></div>';
    }

    app.dom.gameArea.innerHTML = '<div class="game-card">' + h.getCardHeader('<span class="pill">Estimated 8-10 min</span><span class="pill">Stars: ' + app.state.stars + '</span>') + h.getMissionStrip("Island Missions", "3 easy jobs: build, match, tap.", missions) + body + '</div>';
    
    h.bindBackToMap();
    h.bindDragSystem();
    
    var promptBtns = app.dom.gameArea.querySelectorAll("[data-build-answer]");
    var i;
    for (i = 0; i < promptBtns.length; i++) {
       (function(btn) {
         btn.addEventListener("click", function() { handlePrompt(btn.dataset.buildAnswer); });
       })(promptBtns[i]);
    }

    if (build.mission === 4) {
      if (!build.celebrated) {
        build.celebrated = true;
        h.spawnConfetti(44, true);
        h.showFeedback("Computer Island complete!", "success");
      }
      bindFinishCanvas();
      var clearBtn = document.getElementById("buildClearBtn");
      if (clearBtn) clearBtn.addEventListener("click", function() {
        build.drawStrokes = 0;
        bindFinishCanvas();
      });
      var mapBtn = document.getElementById("buildMapBtn");
      if (mapBtn) mapBtn.addEventListener("click", function() {
        if (app.showLessonMap) app.showLessonMap();
        else if (app.checkin && app.checkin.renderWelcome) app.checkin.renderWelcome();
      });
    }
  }

  function handleDrop(kind, id, target) {
    if (kind === "build") {
      var part = buildParts.filter(function(p) { return p.id === id; })[0];
      if (!target || target.dataset.zone !== part.zone) {
        h.showFeedback("Try again!", "error");
        return;
      }
      app.state.build.placed[id] = true;
      app.processAction('BUMP_STARS', { amount: 1 });
      if (Object.keys(app.state.build.placed).length === buildParts.length) {
        app.state.build.mission = 2;
        h.showFeedback("Mission 1 complete! Now match the jobs.", "success");
      } else {
        h.showFeedback("Part placed!", "success");
      }
      render();
    } else if (kind === "function") {
      var card = buildFunctions.filter(function(c) { return c.id === id; })[0];
      if (!target || target.dataset.functionTarget !== card.target) {
        h.showFeedback("Wrong job card!", "error");
        return;
      }
      if (app.state.build.matched.indexOf(card.target) === -1) {
        app.state.build.matched.push(card.target);
      }
      app.processAction('BUMP_STARS', { amount: 1 });
      if (app.state.build.matched.length === buildFunctions.length) {
        app.state.build.mission = 3;
        h.showFeedback("Mission 2 complete! Quick tap challenge next.", "success");
      } else {
        h.showFeedback("Great match!", "success");
      }
      render();
    }
  }

  function handlePrompt(answer) {
    var prompt = buildPrompts[app.state.build.promptIndex];
    if (answer !== prompt.answer) {
      h.showFeedback("Not that one. Look again!", "error");
      return;
    }
    app.processAction('BUMP_STARS', { amount: 2 });
    app.state.build.promptIndex += 1;
    if (app.state.build.promptIndex >= buildPrompts.length) {
      app.state.build.mission = 4;
      app.processAction('COMPLETE_GAME', { id: "build" });
    } else {
      h.showFeedback("Fast thinking!", "success");
    }
    render();
  }

  function bindFinishCanvas() {
    var canvas = document.getElementById("buildFinishCanvas");
    if (!canvas) return;
    var context = canvas.getContext("2d");
    context.fillStyle = "#f7fbff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.lineCap = "round";
    context.lineJoin = "round";

    var drawing = false;

    canvas.addEventListener("pointerdown", function(event) {
      drawing = true;
      canvas.setPointerCapture(event.pointerId);
      var point = getCanvasPoint(canvas, event);
      context.beginPath();
      context.moveTo(point.x, point.y);
    });

    canvas.addEventListener("pointermove", function(event) {
      if (!drawing) return;
      var point = getCanvasPoint(canvas, event);
      context.strokeStyle = "#46b6f8";
      context.lineWidth = 12;
      context.lineTo(point.x, point.y);
      context.stroke();
      app.state.build.drawStrokes += 1;
    });

    var stop = function(event) {
      drawing = false;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    };
    canvas.addEventListener("pointerup", stop);
    canvas.addEventListener("pointercancel", stop);
  }

  function getCanvasPoint(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height
    };
  }

  app.lessons.build = { start: start, render: render, handleDrop: handleDrop };
})();
