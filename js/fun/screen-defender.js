(function () {
  var app = window.ICTApp;
  var h = app.helpers;

  var prompts = ["Draw a smiley.", "Draw a computer.", "Draw a rainbow.", "Draw your happy face."];
  var colors = ["#ff5d8f", "#ffd84f", "#45d0ff", "#2ec27e", "#9c6bff", "#ff8e3c"];
  var sizes = [6, 12, 18];

  function start() {
    h.clearFunTimers();
    app.state.fun = Object.assign({}, app.state.fun, {
      mode: "screen",
      timers: [],
      paintPrompt: prompts[Math.floor(Math.random() * prompts.length)],
      paintColor: colors[0],
      paintSize: sizes[1],
      paintStrokes: 0,
    });
    render();
    bindCanvas(true); // Initial clear
  }

  function render() {
    var paletteHtml = colors.map(function(color) {
      var cls = app.state.fun.paintColor === color ? "paint-color-on" : "";
      return '<button class="paint-color ' + cls + '" type="button" data-paint-color="' + color + '" style="background:' + color + ';"></button>';
    }).join("");

    var brushHtml = sizes.map(function(size) {
      var cls = app.state.fun.paintSize === size ? "paint-size-on" : "";
      return '<button class="paint-size ' + cls + '" type="button" data-paint-size="' + size + '"><span style="width:' + (size + 6) + 'px;height:' + (size + 6) + 'px;"></span></button>';
    }).join("");

    app.dom.gameArea.innerHTML = '<div class="game-card">' + h.getCardHeader('<span class="pill">Colors!</span><span class="pill">Free draw</span>', "backToFun", "⬅ Fun Zone") + h.getMissionStrip("Screen Paint Splash!", app.state.fun.paintPrompt, [{ label: "Draw with your finger", done: app.state.fun.paintStrokes > 0 }, { label: "Make a picture", done: false }]) +
      '<div class="arcade-board paint-board">' +
        '<div class="paint-top">' +
          '<div class="paint-screen-shell">' +
            '<div class="paint-face">😊</div>' +
            '<canvas id="paintCanvas" class="paint-canvas" width="900" height="520"></canvas>' +
          '</div>' +
          '<div class="paint-tools">' +
            '<div class="paint-tool-title">Pick a color</div>' +
            '<div class="paint-palette">' + paletteHtml + '</div>' +
            '<div class="paint-tool-title">Brush</div>' +
            '<div class="paint-brushes">' + brushHtml + '</div>' +
            '<button class="fun-button" type="button" id="paintClearBtn">Clear</button>' +
            '<button class="big-choice calm-button" type="button" id="paintDoneBtn">My Picture Is Done</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
    
    var backBtn = document.getElementById("backToFun");
    if (backBtn) backBtn.addEventListener("click", function() { app.funGames.hub.start(); });
    
    var colorBtns = document.querySelectorAll("[data-paint-color]");
    var i;
    for (i = 0; i < colorBtns.length; i++) {
      (function(btn) {
        btn.addEventListener("click", function() {
          app.state.fun.paintColor = btn.dataset.paintColor;
          updateActiveTool();
        });
      })(colorBtns[i]);
    }
    
    var sizeBtns = document.querySelectorAll("[data-paint-size]");
    var j;
    for (j = 0; j < sizeBtns.length; j++) {
      (function(btn) {
        btn.addEventListener("click", function() {
          app.state.fun.paintSize = Number(btn.dataset.paintSize);
          updateActiveTool();
        });
      })(sizeBtns[j]);
    }
    
    var clearBtn = document.getElementById("paintClearBtn");
    if (clearBtn) clearBtn.addEventListener("click", function() {
      clearCanvas();
      h.showFeedback("Clean screen!", "info");
    });
    
    var doneBtn = document.getElementById("paintDoneBtn");
    if (doneBtn) doneBtn.addEventListener("click", function() {
      app.processAction('BUMP_STARS', { amount: (app.state.fun.paintStrokes > 40 ? 3 : 1) });
      h.showFeedback("Lovely picture!", "success");
      h.spawnConfetti(24, false);
      h.addFunTimer(setTimeout(function() { app.funGames.hub.start(); }, 700), "timeout");
    });

    bindCanvas(false);
  }

  function updateActiveTool() {
    var cbtns = document.querySelectorAll("[data-paint-color]");
    var i;
    for (i = 0; i < cbtns.length; i++) {
       if (cbtns[i].dataset.paintColor === app.state.fun.paintColor) cbtns[i].classList.add("paint-color-on");
       else cbtns[i].classList.remove("paint-color-on");
    }
    var sbtns = document.querySelectorAll("[data-paint-size]");
    for (i = 0; i < sbtns.length; i++) {
       if (Number(sbtns[i].dataset.paintSize) === app.state.fun.paintSize) sbtns[i].classList.add("paint-size-on");
       else sbtns[i].classList.remove("paint-size-on");
    }
  }

  function clearCanvas() {
    var canvas = document.getElementById("paintCanvas");
    if (!canvas) return;
    var context = canvas.getContext("2d");
    context.fillStyle = "#f7fbff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    app.state.fun.paintStrokes = 0;
  }

  function bindCanvas(isFirst) {
    var canvas = document.getElementById("paintCanvas");
    if (!canvas) return;
    var context = canvas.getContext("2d");
    if (isFirst) {
      context.fillStyle = "#f7fbff";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.lineCap = "round";
    context.lineJoin = "round";
    var drawing = false;

    canvas.addEventListener("pointerdown", function(event) {
      drawing = true;
      canvas.setPointerCapture(event.pointerId);
      var rect = canvas.getBoundingClientRect();
      var x = ((event.clientX - rect.left) / rect.width) * canvas.width;
      var y = ((event.clientY - rect.top) / rect.height) * canvas.height;
      context.beginPath();
      context.moveTo(x, y);
    });

    canvas.addEventListener("pointermove", function(event) {
      if (!drawing) return;
      var rect = canvas.getBoundingClientRect();
      var x = ((event.clientX - rect.left) / rect.width) * canvas.width;
      var y = ((event.clientY - rect.top) / rect.height) * canvas.height;
      context.strokeStyle = app.state.fun.paintColor;
      context.lineWidth = app.state.fun.paintSize;
      context.lineTo(x, y);
      context.stroke();
      app.state.fun.paintStrokes += 1;
    });

    function stop(event) {
      drawing = false;
      if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
    }
    canvas.addEventListener("pointerup", stop);
    canvas.addEventListener("pointercancel", stop);
  }

  app.funGames.screen = { start: start, render: render };
})();
