(function () {
  var app = window.ICTApp;
  var buildParts = app.data.buildParts;
  var buildFunctions = app.data.buildFunctions;
  var buildPrompts = app.data.buildPrompts;
  var h = app.helpers;
  var traceOrder = ["system", "mouse", "keyboard", "monitor"];
  var traceTemplates = {
    system: { title: "Computer", color: "#4d7de0", text: "Trace the computer from 1 to 8.", points: [{ x: 284, y: 46 }, { x: 420, y: 46 }, { x: 420, y: 204 }, { x: 284, y: 204 }, { x: 326, y: 68 }, { x: 376, y: 68 }, { x: 376, y: 176 }, { x: 326, y: 176 }] },
    mouse: { title: "Mouse", color: "#ff9f43", text: "Trace the mouse from 1 to 8.", points: [{ x: 486, y: 162 }, { x: 504, y: 96 }, { x: 560, y: 62 }, { x: 622, y: 88 }, { x: 642, y: 146 }, { x: 620, y: 208 }, { x: 554, y: 226 }, { x: 500, y: 204 }] },
    keyboard: { title: "Keyboard", color: "#2ec27e", text: "Trace the keyboard from 1 to 8.", points: [{ x: 194, y: 120 }, { x: 396, y: 120 }, { x: 420, y: 180 }, { x: 228, y: 180 }, { x: 214, y: 140 }, { x: 374, y: 140 }, { x: 388, y: 162 }, { x: 242, y: 162 }] },
    monitor: { title: "Monitor", color: "#ff5d8f", text: "Trace the monitor from 1 to 8.", points: [{ x: 244, y: 50 }, { x: 442, y: 50 }, { x: 442, y: 170 }, { x: 244, y: 170 }, { x: 322, y: 170 }, { x: 364, y: 170 }, { x: 352, y: 222 }, { x: 290, y: 222 }] }
  };
  var paintColors = ["#4d7de0", "#ff5d8f", "#ffb347", "#2ec27e", "#8a6cff", "#23405e"];

  function renderDraggable(item, kind, placed) {
    return '<div class="draggable-item ' + (placed ? "placed" : "") + '" data-kind="' + kind + '" data-id="' + item.id + '">' + h.renderIcon(item, "draggable-item-emoji") + '<div><strong>' + item.label + '</strong><div>' + (kind === "function" ? item.label : item.hint) + '</div></div></div>';
  }

  function start() {
    app.state.build = {
      mission: 1,
      placed: {},
      matched: [],
      promptIndex: 0,
      celebrated: false,
      traceTemplate: "system",
      traceProgress: { system: 0, mouse: 0, keyboard: 0, monitor: 0 },
      traceComplete: { system: false, mouse: false, keyboard: false, monitor: false },
      traceMode: { system: "trace", mouse: "trace", keyboard: "trace", monitor: "trace" },
      paintColor: "#4d7de0",
      paintStrokes: { system: [], mouse: [], keyboard: [], monitor: [] }
    };
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
      body = renderFinishPanel();
    }

    app.dom.gameArea.innerHTML = '<div class="game-card">' + h.getCardHeader('<span class="pill">Estimated 8-10 min</span><span class="pill">Stars: ' + app.state.stars + '</span>') + h.getMissionStrip("Island Missions", "3 easy jobs: build, match, tap.", missions) + body + '</div>';

    h.bindBackToMap();
    h.bindDragSystem();
    bindPromptButtons();
    bindFinishPanel();
  }

  function renderFinishPanel() {
    var build = app.state.build;
    var template = traceTemplates[build.traceTemplate];
    var isColorMode = build.traceMode[build.traceTemplate] === "color";
    var buttons = traceOrder.map(function(id) {
      var part = getPart(id);
      var done = build.traceComplete[id];
      return '<button class="trace-choice ' + (build.traceTemplate === id ? "trace-choice-on " : "") + (done ? "trace-choice-done" : "") + '" type="button" data-trace-template="' + id + '">' + h.renderIcon(part, "trace-choice-icon") + '<span>' + traceTemplates[id].title + '</span></button>';
    }).join("");
    var palette = paintColors.map(function(color) {
      return '<button class="paint-color ' + (build.paintColor === color ? "paint-color-on" : "") + '" type="button" data-trace-color="' + color + '" style="background:' + color + '"></button>';
    }).join("");
    return '<div class="win-panel build-finish-panel"><h3>Computer Island complete!</h3><p>' + (isColorMode ? "Color the picture any way you like." : "Connect the dots to draw the ICT parts. Start at 1, then 2, then 3.") + '</p><div class="build-finish-draw"><div class="trace-toolbar"><div class="trace-choice-row">' + buttons + '</div><div class="lesson-plan"><div class="lesson-chip">Picture ' + (traceOrder.indexOf(build.traceTemplate) + 1) + ' / ' + traceOrder.length + '</div><div class="lesson-chip">Finished ' + countCompletedTraces() + ' / ' + traceOrder.length + '</div><div class="lesson-chip">' + (isColorMode ? "Color time" : "Dot time") + '</div></div>' + (isColorMode ? '<div class="paint-palette trace-palette">' + palette + '</div>' : '') + '</div><div class="trace-stage"><div class="trace-card"><div class="trace-card-top"><strong>' + template.title + '</strong><span>' + (isColorMode ? "Trace done. Now color it in!" : template.text) + '</span></div><canvas id="buildTraceCanvas" class="paint-canvas build-finish-canvas trace-canvas" width="820" height="280"></canvas></div></div></div><div class="choice-row"><button class="fun-button" type="button" id="buildClearBtn">' + (isColorMode ? "Clear Colors" : "Restart Picture") + '</button><button class="fun-button" type="button" id="buildNextTraceBtn">Next Picture</button><button class="big-choice output-choice calm-button" type="button" id="buildMapBtn">Back To Map</button></div></div>';
  }

  function bindPromptButtons() {
    var promptBtns = app.dom.gameArea.querySelectorAll("[data-build-answer]");
    var i;
    for (i = 0; i < promptBtns.length; i++) {
      (function(btn) {
        btn.addEventListener("click", function() { handlePrompt(btn.dataset.buildAnswer); });
      })(promptBtns[i]);
    }
  }

  function bindFinishPanel() {
    var build = app.state.build;
    if (build.mission !== 4) return;
    if (!build.celebrated) {
      build.celebrated = true;
      h.spawnConfetti(44, true);
      h.showFeedback("Computer Island complete!", "success");
    }
    bindTraceTemplateButtons();
    bindColorButtons();
    bindTraceCanvas();
    var clearBtn = document.getElementById("buildClearBtn");
    if (clearBtn) clearBtn.addEventListener("click", function() {
      if (build.traceMode[build.traceTemplate] === "color") {
        build.paintStrokes[build.traceTemplate] = [];
      } else {
        build.traceProgress[build.traceTemplate] = 0;
        build.traceComplete[build.traceTemplate] = false;
        build.traceMode[build.traceTemplate] = "trace";
        build.paintStrokes[build.traceTemplate] = [];
      }
      render();
    });
    var nextBtn = document.getElementById("buildNextTraceBtn");
    if (nextBtn) nextBtn.addEventListener("click", function() {
      build.traceTemplate = nextTraceTemplate();
      render();
    });
    var mapBtn = document.getElementById("buildMapBtn");
    if (mapBtn) mapBtn.addEventListener("click", function() {
      if (app.showLessonMap) app.showLessonMap();
      else if (app.checkin && app.checkin.renderWelcome) app.checkin.renderWelcome();
    });
  }

  function bindTraceTemplateButtons() {
    var buttons = app.dom.gameArea.querySelectorAll("[data-trace-template]");
    var i;
    for (i = 0; i < buttons.length; i++) {
      (function(btn) {
        btn.addEventListener("click", function() {
          app.state.build.traceTemplate = btn.dataset.traceTemplate;
          render();
        });
      })(buttons[i]);
    }
  }

  function bindColorButtons() {
    var buttons = app.dom.gameArea.querySelectorAll("[data-trace-color]");
    var i;
    for (i = 0; i < buttons.length; i++) {
      (function(btn) {
        btn.addEventListener("click", function() {
          app.state.build.paintColor = btn.dataset.traceColor;
          render();
        });
      })(buttons[i]);
    }
  }

  function bindTraceCanvas() {
    var canvas = document.getElementById("buildTraceCanvas");
    if (!canvas) return;
    var context = canvas.getContext("2d");
    var templateId = app.state.build.traceTemplate;
    var template = traceTemplates[templateId];
    var mode = app.state.build.traceMode[templateId];
    var drawing = false;
    var scratch = null;
    var activeStroke = null;

    function drawScene() {
      var progress = app.state.build.traceProgress[templateId] || 0;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = "#f7fbff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      drawTraceDecor(context, canvas.width, canvas.height, template.color);
      drawTemplateGuide(context, templateId, template.color);
      drawPaintStrokes(context, templateId);
      if (mode === "trace") {
        drawGuideLines(context, template, progress);
        drawCompletedSegments(context, template, progress);
        if (scratch) drawScratch(context, template.points[progress], scratch, template.color);
        drawPoints(context, template, progress);
        drawTraceMessage(context, progress, template);
      } else {
        drawColoredOutline(context, template, template.color);
        drawTraceMessage(context, progress, template, true);
      }
    }

    function startPointer(event) {
      if (app.state.build.traceMode[templateId] === "color") {
        drawing = true;
        activeStroke = { color: app.state.build.paintColor, points: [getCanvasPoint(canvas, event)] };
        app.state.build.paintStrokes[templateId].push(activeStroke);
        canvas.setPointerCapture(event.pointerId);
        drawScene();
        return;
      }
      var progress = app.state.build.traceProgress[templateId] || 0;
      if (progress >= template.points.length - 1) return;
      var point = getCanvasPoint(canvas, event);
      if (distance(point, template.points[progress]) > 42) return;
      drawing = true;
      scratch = point;
      canvas.setPointerCapture(event.pointerId);
      drawScene();
    }

    function movePointer(event) {
      if (!drawing) return;
      if (app.state.build.traceMode[templateId] === "color") {
        activeStroke.points.push(getCanvasPoint(canvas, event));
        drawScene();
        return;
      }
      scratch = getCanvasPoint(canvas, event);
      drawScene();
    }

    function stopPointer(event) {
      if (!drawing) return;
      if (app.state.build.traceMode[templateId] === "color") {
        drawing = false;
        activeStroke = null;
        if (canvas.hasPointerCapture && canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
        drawScene();
        return;
      }
      var progress = app.state.build.traceProgress[templateId] || 0;
      var nextPoint = template.points[progress + 1];
      var point = getCanvasPoint(canvas, event);
      drawing = false;
      scratch = null;
      if (canvas.hasPointerCapture && canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      if (distance(point, nextPoint) <= 56) {
        app.state.build.traceProgress[templateId] = progress + 1;
        if (app.state.build.traceProgress[templateId] >= template.points.length - 1) {
          app.state.build.traceComplete[templateId] = true;
          app.state.build.traceMode[templateId] = "color";
          h.spawnConfetti(18, false);
          h.showFeedback(template.title + " traced! Now color it!", "success");
          render();
          return;
        }
      }
      drawScene();
    }

    drawScene();
    canvas.addEventListener("pointerdown", startPointer);
    canvas.addEventListener("pointermove", movePointer);
    canvas.addEventListener("pointerup", stopPointer);
    canvas.addEventListener("pointercancel", stopPointer);
  }

  function drawTraceDecor(context, width, height, color) {
    context.save();
    context.fillStyle = "rgba(77, 125, 224, 0.06)";
    context.beginPath();
    context.arc(120, 92, 48, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "rgba(255, 159, 67, 0.08)";
    context.beginPath();
    context.arc(width - 88, 84, 56, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = color;
    context.globalAlpha = 0.14;
    context.fillRect(42, height - 68, width - 84, 22);
    context.restore();
  }

  function drawTemplateGuide(context, templateId, color) {
    context.save();
    context.globalAlpha = 0.18;
    context.fillStyle = color;
    context.strokeStyle = color;
    context.lineWidth = 8;
    if (templateId === "system") {
      roundRect(context, 284, 46, 136, 158, 24);
      context.fill();
      context.clearRect(326, 68, 50, 108);
      context.strokeRect(326, 68, 50, 108);
      context.fillRect(338, 182, 26, 8);
    } else if (templateId === "mouse") {
      context.beginPath();
      context.ellipse(564, 146, 78, 70, -0.2, 0, Math.PI * 2);
      context.fill();
      context.beginPath();
      context.moveTo(618, 90);
      context.quadraticCurveTo(642, 52, 674, 58);
      context.stroke();
    } else if (templateId === "keyboard") {
      context.beginPath();
      context.moveTo(202, 120);
      context.lineTo(396, 120);
      context.lineTo(420, 180);
      context.lineTo(228, 180);
      context.closePath();
      context.fill();
      context.clearRect(242, 138, 144, 26);
      context.strokeRect(242, 138, 144, 26);
    } else if (templateId === "monitor") {
      roundRect(context, 244, 50, 198, 120, 20);
      context.fill();
      context.fillRect(324, 170, 38, 24);
      context.fillRect(294, 194, 98, 18);
    }
    context.restore();
  }

  function drawGuideLines(context, template, progress) {
    context.save();
    context.strokeStyle = "rgba(92, 122, 158, 0.25)";
    context.lineWidth = 6;
    context.setLineDash([8, 10]);
    context.lineCap = "round";
    context.beginPath();
    var i;
    for (i = progress; i < template.points.length; i++) {
      if (i === progress) context.moveTo(template.points[i].x, template.points[i].y);
      else context.lineTo(template.points[i].x, template.points[i].y);
    }
    context.stroke();
    context.restore();
  }

  function drawCompletedSegments(context, template, progress) {
    if (!progress) return;
    context.save();
    context.strokeStyle = template.color;
    context.lineWidth = 12;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(template.points[0].x, template.points[0].y);
    var i;
    for (i = 1; i <= progress; i++) context.lineTo(template.points[i].x, template.points[i].y);
    context.stroke();
    context.restore();
  }

  function drawColoredOutline(context, template, color) {
    context.save();
    context.strokeStyle = color;
    context.lineWidth = 10;
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(template.points[0].x, template.points[0].y);
    var i;
    for (i = 1; i < template.points.length; i++) context.lineTo(template.points[i].x, template.points[i].y);
    if (template.title !== "Mouse") context.closePath();
    context.stroke();
    context.restore();
  }

  function drawPaintStrokes(context, templateId) {
    var strokes = app.state.build.paintStrokes[templateId] || [];
    var i;
    for (i = 0; i < strokes.length; i++) {
      var stroke = strokes[i];
      if (!stroke.points.length) continue;
      context.save();
      context.strokeStyle = stroke.color;
      context.lineWidth = 16;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.beginPath();
      context.moveTo(stroke.points[0].x, stroke.points[0].y);
      var j;
      for (j = 1; j < stroke.points.length; j++) context.lineTo(stroke.points[j].x, stroke.points[j].y);
      context.stroke();
      context.restore();
    }
  }

  function drawScratch(context, from, to, color) {
    context.save();
    context.strokeStyle = color;
    context.lineWidth = 10;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
    context.restore();
  }

  function drawPoints(context, template, progress) {
    var i;
    for (i = 0; i < template.points.length; i++) {
      context.save();
      context.fillStyle = i < progress ? template.color : "#ffffff";
      context.strokeStyle = i < progress ? template.color : "#aac7f6";
      context.lineWidth = 5;
      context.beginPath();
      context.arc(template.points[i].x, template.points[i].y, 18, 0, Math.PI * 2);
      context.fill();
      context.stroke();
      context.fillStyle = i < progress ? "#ffffff" : "#355da6";
      context.font = "bold 16px Quicksand, sans-serif";
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText(String(i + 1), template.points[i].x, template.points[i].y + 1);
      context.restore();
    }
  }

  function drawTraceMessage(context, progress, template, colorMode) {
    context.save();
    context.fillStyle = "#23405e";
    context.font = "700 20px Quicksand, sans-serif";
    context.textAlign = "left";
    context.fillText(colorMode ? "Pick a color and paint!" : "Start at number " + (progress + 1) + ".", 40, 40);
    context.restore();
  }

  function roundRect(context, x, y, width, height, radius) {
    context.beginPath();
    context.moveTo(x + radius, y);
    context.lineTo(x + width - radius, y);
    context.quadraticCurveTo(x + width, y, x + width, y + radius);
    context.lineTo(x + width, y + height - radius);
    context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    context.lineTo(x + radius, y + height);
    context.quadraticCurveTo(x, y + height, x, y + height - radius);
    context.lineTo(x, y + radius);
    context.quadraticCurveTo(x, y, x + radius, y);
    context.closePath();
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
      if (app.state.build.matched.indexOf(card.target) === -1) app.state.build.matched.push(card.target);
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

  function getCanvasPoint(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return { x: ((event.clientX - rect.left) / rect.width) * canvas.width, y: ((event.clientY - rect.top) / rect.height) * canvas.height };
  }

  function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function getPart(id) {
    var i;
    for (i = 0; i < buildParts.length; i++) if (buildParts[i].id === id) return buildParts[i];
    return buildParts[0];
  }

  function countCompletedTraces() {
    var count = 0;
    var i;
    for (i = 0; i < traceOrder.length; i++) if (app.state.build.traceComplete[traceOrder[i]]) count += 1;
    return count;
  }

  function nextTraceTemplate() {
    var currentIndex = traceOrder.indexOf(app.state.build.traceTemplate);
    var i;
    for (i = 1; i <= traceOrder.length; i++) {
      var nextId = traceOrder[(currentIndex + i) % traceOrder.length];
      if (!app.state.build.traceComplete[nextId]) return nextId;
    }
    return traceOrder[(currentIndex + 1) % traceOrder.length];
  }

  app.lessons.build = { start: start, render: render, handleDrop: handleDrop };
})();
