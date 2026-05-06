(function () {
  var app = window.ICTApp;
  var h = app.helpers;

  function start() {
    h.clearFunTimers();
    app.state.fun = Object.assign({}, app.state.fun, {
      mode: "shooter",
      timers: [],
      score: 0,
      lives: 3,
      ship: { x: 50, y: 50, angle: -90, vx: 0, vy: 0, invuln: 60 },
      bullets: [],
      viruses: [],
      keys: { up: false, left: false, right: false, fire: false, lastFire: 0 },
      over: false,
      celebrating: false
    });
    
    spawnViruses(3);
    renderLayout();
    h.addFunTimer(setInterval(tick, 30), "interval");
  }

  function renderLayout() {
    app.dom.gameArea.innerHTML = '<div class="game-card">' + 
      h.getCardHeader('<span class="pill" id="shooterScoreBox">Score: 0</span><span class="pill" id="shooterLivesBox">Lives: 3</span>', "backToFun", "⬅ Fun Zone") + 
      h.getMissionStrip("Virus Shooter", "Fly the Anti-Virus ship. Blast the bugs before they touch you!", [{ label: "Clear viruses", done: false }]) +
      '<div class="arcade-board shooter-board" style="position:relative; width:100%; height:320px; background:#0f1a2c; overflow:hidden; border-radius:12px; margin-top:10px;">' +
        '<div id="shooterStage" style="position:absolute; width:100%; height:100%; left:0; top:0;">' +
           '<div id="shooterShip" style="position:absolute; width:30px; height:30px; margin-left:-15px; margin-top:-15px;">' + shipSvg() + '</div>' +
        '</div>' +
        '<div class="shooter-controls" style="position:absolute; bottom:10px; width:100%; display:flex; justify-content:space-between; padding:0 20px; box-sizing:border-box;">' +
           '<div class="d-pad" style="display:flex; gap:5px;">' +
              '<button type="button" class="shooter-btn" id="sBtnLeft" style="width:50px; height:50px; background:rgba(255,255,255,0.2); border-radius:8px; border:2px solid #5cd6ff; color:#fff; font-size:24px;">⟲</button>' +
              '<button type="button" class="shooter-btn" id="sBtnUp" style="width:50px; height:50px; background:rgba(255,255,255,0.2); border-radius:8px; border:2px solid #5cd6ff; color:#fff; font-size:24px;">🚀</button>' +
              '<button type="button" class="shooter-btn" id="sBtnRight" style="width:50px; height:50px; background:rgba(255,255,255,0.2); border-radius:8px; border:2px solid #5cd6ff; color:#fff; font-size:24px;">⟳</button>' +
           '</div>' +
           '<button type="button" class="shooter-btn" id="sBtnFire" style="width:70px; height:50px; background:rgba(255,80,80,0.6); border-radius:8px; border:2px solid #ff8fb5; color:#fff; font-size:20px; font-weight:bold;">FIRE</button>' +
        '</div>' +
        '<div id="shooterGameOver" style="display:none; position:absolute; inset:0; background:rgba(0,0,0,0.8); flex-direction:column; align-items:center; justify-content:center; color:#fff;">' +
            '<h2 style="margin:0; font-size:32px; color:#ff8fb5;">SYSTEM CRASH</h2>' +
            '<p style="margin:10px 0;">The viruses got you!</p>' +
            '<button class="big-choice calm-button" type="button" id="shooterRestartBtn">Try Again</button>' +
        '</div>' +
        '<div id="shooterWin" style="display:none; position:absolute; inset:0; background:rgba(0,0,0,0.8); flex-direction:column; align-items:center; justify-content:center; color:#fff;">' +
            '<h2 style="margin:0; font-size:32px; color:#9af6ff;">SYSTEM CLEAN</h2>' +
            '<p style="margin:10px 0;">You blasted all viruses!</p>' +
            '<button class="big-choice calm-button" type="button" id="shooterWinBtn">Awesome!</button>' +
        '</div>' +
      '</div>' +
    '</div>';

    bindButtons();
    syncDOM();
  }

  function bindButtons() {
    var b = document.getElementById("backToFun");
    if (b) b.addEventListener("click", function() { app.funGames.hub.start(); });

    var restartBtn = document.getElementById("shooterRestartBtn");
    if (restartBtn) restartBtn.addEventListener("click", start);

    var winBtn = document.getElementById("shooterWinBtn");
    if (winBtn) winBtn.addEventListener("click", function() { app.funGames.hub.start(); });

    function makeTouch(id, key) {
      var node = document.getElementById(id);
      if (!node) return;
      node.addEventListener("pointerdown", function(e) { e.preventDefault(); app.state.fun.keys[key] = true; });
      node.addEventListener("pointerup", function(e) { e.preventDefault(); app.state.fun.keys[key] = false; });
      node.addEventListener("pointercancel", function(e) { e.preventDefault(); app.state.fun.keys[key] = false; });
      node.addEventListener("pointerleave", function(e) { e.preventDefault(); app.state.fun.keys[key] = false; });
    }

    makeTouch("sBtnLeft", "left");
    makeTouch("sBtnRight", "right");
    makeTouch("sBtnUp", "up");
    makeTouch("sBtnFire", "fire");
  }

  function spawnViruses(count) {
    for (var i = 0; i < count; i++) {
      app.state.fun.viruses.push({
        id: "v_" + Date.now() + "_" + i,
        x: Math.random() * 100,
        y: Math.random() < 0.5 ? 10 : 90,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: 20
      });
    }
  }

  function tick() {
    if (app.state.fun.mode !== "shooter" || app.state.fun.over || app.state.fun.celebrating) return;
    var state = app.state.fun;

    // Ship Logic
    if (state.keys.left) state.ship.angle -= 12;
    if (state.keys.right) state.ship.angle += 12;
    if (state.keys.up) {
      state.ship.vx += Math.cos(state.ship.angle * Math.PI / 180) * 0.25;
      state.ship.vy += Math.sin(state.ship.angle * Math.PI / 180) * 0.25;
    }
    
    // Friction
    state.ship.vx *= 0.95;
    state.ship.vy *= 0.95;

    state.ship.x += state.ship.vx;
    state.ship.y += state.ship.vy;
    state.ship.x = wrap(state.ship.x);
    state.ship.y = wrap(state.ship.y);

    if (state.ship.invuln > 0) state.ship.invuln -= 1;

    // Firing
    if (state.keys.fire && Date.now() - state.keys.lastFire > 150) {
      state.keys.lastFire = Date.now();
      state.bullets.push({
        id: "b_" + Date.now(),
        x: state.ship.x,
        y: state.ship.y,
        vx: Math.cos(state.ship.angle * Math.PI / 180) * 2.5,
        vy: Math.sin(state.ship.angle * Math.PI / 180) * 2.5,
        life: 50
      });
    }

    // Move Bullets
    for (var i = state.bullets.length - 1; i >= 0; i--) {
      var b = state.bullets[i];
      b.x = wrap(b.x + b.vx);
      b.y = wrap(b.y + b.vy);
      b.life -= 1;
      if (b.life <= 0) state.bullets.splice(i, 1);
    }

    // Move Viruses
    for (var j = 0; j < state.viruses.length; j++) {
      var v = state.viruses[j];
      v.x = wrap(v.x + v.vx);
      v.y = wrap(v.y + v.vy);
    }

    // Collisions
    checkCollisions();

    syncDOM();
    
    // Win Condition
    if (state.viruses.length === 0 && !state.celebrating) {
      state.celebrating = true;
      document.getElementById("shooterWin").style.display = "flex";
      app.processAction('BUMP_STARS', { amount: 15 });
      h.spawnConfetti(40, true);
    }
  }

  function checkCollisions() {
    var state = app.state.fun;
    
    // Bullet hits Virus
    for (var i = state.bullets.length - 1; i >= 0; i--) {
       for (var j = state.viruses.length - 1; j >= 0; j--) {
          if (!state.bullets[i] || !state.viruses[j]) continue;
          var bx = state.bullets[i].x;
          var by = state.bullets[i].y;
          var vx = state.viruses[j].x;
          var vy = state.viruses[j].y;
          var dist = Math.sqrt((bx-vx)*(bx-vx) + ((by-vy)*0.6)*((by-vy)*0.6)); // Account for screen ratio roughly 100x100 virtual
          if (dist < 5) {
             state.bullets.splice(i, 1);
             state.viruses.splice(j, 1);
             state.score += 100;
             break;
          }
       }
    }

    // Ship hits Virus
    if (state.ship.invuln <= 0) {
      for (var k = 0; k < state.viruses.length; k++) {
         var dist2 = Math.sqrt((state.ship.x - state.viruses[k].x)*(state.ship.x - state.viruses[k].x) + ((state.ship.y - state.viruses[k].y)*0.6)*((state.ship.y - state.viruses[k].y)*0.6));
         if (dist2 < 6) {
           crashShip();
           break;
         }
      }
    }
  }

  function crashShip() {
    var state = app.state.fun;
    state.lives -= 1;
    h.showFeedback("Ship hit!", "error");
    if (state.lives <= 0) {
      state.over = true;
      document.getElementById("shooterGameOver").style.display = "flex";
    } else {
      state.ship = { x: 50, y: 50, angle: -90, vx: 0, vy: 0, invuln: 60 };
    }
  }

  function wrap(val) {
    if (val < 0) return val + 100;
    if (val > 100) return val - 100;
    return val;
  }

  function syncDOM() {
    var state = app.state.fun;
    var stage = document.getElementById("shooterStage");
    if (!stage) return;

    var ship = document.getElementById("shooterShip");
    if (ship) {
      ship.style.left = state.ship.x + "%";
      ship.style.top = state.ship.y + "%";
      var rot = state.ship.angle + 90; // SVG drawn pointing up
      ship.style.transform = "rotate(" + rot + "deg)";
      ship.style.opacity = (state.ship.invuln > 0 && Math.floor(Date.now() / 100) % 2 === 0) ? "0.3" : "1";
    }

    // Bullets
    var bulletsHtml = "";
    for (var i = 0; i < state.bullets.length; i++) {
       bulletsHtml += '<div style="position:absolute; width:6px; height:6px; background:#9af6ff; border-radius:50%; margin-left:-3px; margin-top:-3px; left:' + state.bullets[i].x + '%; top:' + state.bullets[i].y + '%; box-shadow: 0 0 6px #5cd6ff;"></div>';
    }

    // Viruses
    var virusesHtml = "";
    for (var j = 0; j < state.viruses.length; j++) {
       virusesHtml += '<div style="position:absolute; width:24px; height:24px; margin-left:-12px; margin-top:-12px; left:' + state.viruses[j].x + '%; top:' + state.viruses[j].y + '%;">' + virusSvg() + '</div>';
    }

    // We can't overwrite the whole stage innerHTML because it destroys the ship.
    // Instead we put dynamic entities in a separate container.
    var entities = document.getElementById("shooterEntities");
    if (!entities) {
       entities = document.createElement("div");
       entities.id = "shooterEntities";
       stage.appendChild(entities);
    }
    entities.innerHTML = bulletsHtml + virusesHtml;

    document.getElementById("shooterScoreBox").textContent = "Score: " + state.score;
    document.getElementById("shooterLivesBox").textContent = "Lives: " + state.lives;
  }

  function shipSvg() {
    return '<svg viewBox="0 0 100 100" style="width:100%; height:100%; filter: drop-shadow(0 0 4px #5cd6ff);">' +
           '<polygon points="50,10 90,90 50,70 10,90" fill="#5cd6ff" />' +
           '<polygon points="50,10 50,70 10,90" fill="#2f5aa8" />' + 
           '</svg>';
  }

  function virusSvg() {
    return '<svg viewBox="0 0 100 100" style="width:100%; height:100%; filter: drop-shadow(0 0 4px #ff5050);">' +
           '<circle cx="50" cy="50" r="30" fill="#ff5050" />' +
           '<circle cx="35" cy="40" r="6" fill="#fff" />' +
           '<circle cx="65" cy="40" r="6" fill="#fff" />' +
           '<path d="M 40 70 Q 50 60 60 70" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" />' +
           '<line x1="20" y1="50" x2="5" y2="40" stroke="#ff5050" stroke-width="6" stroke-linecap="round" />' +
           '<line x1="80" y1="50" x2="95" y2="40" stroke="#ff5050" stroke-width="6" stroke-linecap="round" />' +
           '<line x1="15" y1="20" x2="30" y2="30" stroke="#ff5050" stroke-width="6" stroke-linecap="round" />' +
           '<line x1="85" y1="20" x2="70" y2="30" stroke="#ff5050" stroke-width="6" stroke-linecap="round" />' +
           '</svg>';
  }

  app.funGames.shooter = { start: start, render: renderLayout };
})();
