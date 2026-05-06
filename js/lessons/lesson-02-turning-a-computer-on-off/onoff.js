(function () {
  var app = window.ICTApp;
  var h = app.helpers;

  function start() {
    // Initial state for Lesson 2
    app.processAction('UPDATE_ONOFF', {
      view: "menu", // menu, level
      level: 0,
      round: 0,
      totalRounds: 0,
      subStep: 0,
      score: 0,
      lives: 3,
      waiting: false,
      bootProgress: 0,
      bootTimer: null,
      device: null,
      operation: null,
      login: null,
      shutdownSteps: [],
      returnTo: null
    });
    render();
  }

  function render() {
    var state = app.state.onoff;
    if (!state) return;
    
    if (state.view === "menu") {
      renderMenu();
    } else {
      renderLevel();
    }
    
    h.updateRenderHooks();
  }

  function renderMenu() {
    var container = app.dom.gameArea;
    var completed = app.state.completed;
    
    var levels = [
      { id: 1, title: "Level 1: Find Power", emoji: "🔍", desc: "Find the button!", color: "#FF7E5F" },
      { id: 2, title: "Level 2: Turn It On", emoji: "🔘", desc: "Tap vs Hold", color: "#FEB47B" },
      { id: 3, title: "Level 3: Boot + Wait", emoji: "⏳", desc: "Be patient!", color: "#43C6AC" },
      { id: 4, title: "Level 4: Login", emoji: "👤", desc: "Pick your user", color: "#3498db" },
      { id: 5, title: "Level 5: Shutdown", emoji: "⏻", desc: "Safe off", color: "#9b59b6" },
      { id: 6, title: "Level 6: Final Boss", emoji: "🏆", desc: "The big test!", color: "#f1c40f" }
    ];

    var html = '<div class="game-card lesson-splash-screen">' +
      h.getCardHeader('<span class="pill">Lesson 2: O / O</span>', "exitLesson", "⬅ Map") +
      '<div class="lesson-splash-center">' +
        '<div class="lesson-splash-copy-wrap">' +
          '<strong class="lesson-splash-emoji">🔘</strong>' +
          '<h3>Turn On & Off</h3>' +
          '<p class="hero-text">Learn how to wake, wait, and shut down safely.</p>' +
        '</div>' +
        '<div class="lesson-splash-grid islands-container">';

    for (var i = 0; i < levels.length; i++) {
      var lv = levels[i];
      var isUnlocked = i === 0 || completed.indexOf("onoff_lv" + i) !== -1;
      var lockClass = isUnlocked ? "" : "locked-island";
      
      html += '<button class="island-card lesson-splash-card ' + lockClass + '" data-level="' + lv.id + '" ' + (isUnlocked ? "" : "disabled") + '>' +
        '<div class="lesson-splash-view">' +
          '<span class="lesson-splash-emoji">' + lv.emoji + '</span>' +
          (!isUnlocked ? '<span class="lock-icon">🔒</span>' : "") +
        '</div>' +
        '<span class="label">' + lv.title + '</span>' +
        '<span class="lesson-splash-copy">' + lv.desc + '</span>' +
      '</button>';
    }

    html += '</div></div></div>';
    container.innerHTML = html;

    h.bindMany(".lesson-splash-card", function(el) {
      el.addEventListener("click", function() {
        startLevel(parseInt(el.dataset.level));
      });
    });

    var exitBtn = document.getElementById("exitLesson");
    if (exitBtn) exitBtn.addEventListener("click", function() { app.renderMainMenu(); });
  }

  function startLevel(lv) {
    var total = 10;
    if (lv === 1) total = 15;
    if (lv === 6) total = 3;

    app.processAction('UPDATE_ONOFF', {
      view: "level",
      level: lv,
      round: 1,
      totalRounds: total,
      subStep: 0,
      score: 0,
      lives: 3,
      waiting: false,
      bootProgress: 0,
      shutdownSteps: []
    });
    
    setupRound();
  }

  function setupRound() {
    var state = app.state.onoff;
    var data = app.data;
    var update = { subStep: 0, waiting: false, bootProgress: 0 };

    if (state.level === 1) {
      update.device = h.pickRandom(data.level1Devices);
    } else if (state.level === 2) {
      update.operation = h.pickRandom(data.level2Operations);
    } else if (state.level === 3) {
      update.device = h.pickRandom(data.level3BootTimers);
    } else if (state.level === 4) {
      update.login = h.pickRandom(data.level4Logins);
    } else if (state.level === 5) {
      update.shutdown = h.pickRandom(data.level5Shutdowns);
      update.shutdownSteps = [];
    } else if (state.level === 6) {
      update.boss = data.level6Boss[state.round - 1];
      update.subStep = 0; // 0: find, 1: turn, 2: wait, 3: login, 4: shutdown
    }

    app.processAction('UPDATE_ONOFF', update);
    render();
  }

  function renderLevel() {
    var state = app.state.onoff;
    var container = app.dom.gameArea;
    var body = "";

    switch (state.level) {
      case 1: body = renderLevel1(); break;
      case 2: body = renderLevel2(); break;
      case 3: body = renderLevel3(); break;
      case 4: body = renderLevel4(); break;
      case 5: body = renderLevel5(); break;
      case 6: body = renderLevel6(); break;
    }

    container.innerHTML = '<div class="game-card level-mode">' +
      h.getCardHeader('<span class="pill">Round ' + state.round + ' / ' + state.totalRounds + '</span>', "backToMenu", "⬅ Levels") +
      '<div class="level-container">' + body + '</div>' + 
      '</div>';

    var backBtn = document.getElementById("backToMenu");
    if (backBtn) backBtn.addEventListener("click", function() { 
      if (app.state.onoff.bootTimer) clearInterval(app.state.onoff.bootTimer);
      app.processAction('UPDATE_ONOFF', { view: "menu", bootTimer: null }); 
      render(); 
    });

    bindLevelEvents();
  }

  function renderLevel1() {
    var device = app.state.onoff.device;
    return '<div class="find-power-stage">' +
      '<h3>Find the Power Button on the ' + device.label + '!</h3>' +
      '<div class="device-interface">' +
        '<div class="device-art">🖥️</div>' +
        '<div class="hotspot correct" id="powerBtn" style="left:'+device.hotspot.x+'; top:'+device.hotspot.y+';"></div>' +
        device.fakeSpots.map(function(s, i) {
          return '<div class="hotspot fake" data-index="'+i+'" style="left:'+s.x+'; top:'+s.y+';"></div>';
        }).join("") +
      '</div></div>';
  }

  function renderLevel2() {
    var op = app.state.onoff.operation;
    return '<div class="op-stage">' +
      '<h3>' + op.text + '</h3>' +
      '<div class="op-button-container">' +
        '<button class="power-button-large ' + op.action + '" id="actionBtn">🔘</button>' +
        (op.action === "hold" ? '<div class="hold-timer-rail"><div class="hold-timer-fill" id="holdFill"></div></div>' : "") +
      '</div></div>';
  }

  function renderLevel3() {
    var state = app.state.onoff;
    var device = state.device;
    return '<div class="wait-stage">' +
      '<h3>' + device.label + ' is starting...</h3>' +
      '<p class="hint">DO NOT TOUCH! Wait for the bar.</p>' +
      '<div class="boot-visual">' +
        '<div class="boot-icon">⏳</div>' +
        '<div class="loading-bar-wrapper"><div class="loading-fill" style="width:' + state.bootProgress + '%;"></div></div>' +
        '<p class="boot-hint">' + device.hint + '</p>' +
      '</div>' +
      (state.waiting ? '<div class="punish-overlay">😡 WAIT! NO TOUCH!</div>' : "") +
    '</div>';
  }

  function renderLevel4() {
    var login = app.state.onoff.login;
    var all = [login.target].concat(login.fakes);
    h.shuffleArray(all);

    return '<div class="login-stage">' +
      '<h3>Login as: <strong>' + login.target + '</strong></h3>' +
      '<div class="avatar-grid">' +
        all.map(function(name) {
          var isTarget = name === login.target;
          return '<div class="avatar-card ' + (isTarget ? "correct" : "fake") + '" data-name="' + name + '">' +
            '<div class="avatar-icon">👤</div>' +
            '<span>' + name + '</span>' +
          '</div>';
        }).join("") +
      '</div></div>';
  }

  function renderLevel5() {
    var shutdown = app.state.onoff.shutdown;
    var steps = app.state.onoff.shutdownSteps;
    
    return '<div class="shutdown-stage">' +
      '<h3>' + shutdown.text + '</h3>' +
      '<div class="screen-mock">' +
        '<div class="taskbar">' +
          '<button class="start-btn ' + (steps.length === 0 ? "glow" : "") + '" id="startBtn">🪟</button>' +
        '</div>' +
        (steps.indexOf("start") !== -1 ? 
          '<div class="start-menu">' +
            '<button class="menu-item power ' + (steps.length === 1 ? "glow" : "") + '" id="powerMenuBtn">⏻ Power</button>' +
            (steps.indexOf("power") !== -1 ? 
              '<div class="power-flyout">' +
                '<button class="menu-item shutdown ' + (steps.length === 2 ? "glow" : "") + '" id="shutdownBtn">🌑 Shutdown</button>' +
              '</div>' : "") +
          '</div>' : "") +
      '</div></div>';
  }

  function renderLevel6() {
    var state = app.state.onoff;
    var boss = state.boss;
    var sub = state.subStep;

    var html = '<div class="boss-stage">' +
      '<h3>Boss ' + state.round + ': ' + boss.label + '</h3>';

    if (sub === 0) {
      html += '<p>Find the button!</p>' +
        '<div class="device-interface" style="height:200px"><button class="power-button-large" id="bossPower" style="margin-top:20px">🔘</button></div>';
    } else if (sub === 1) {
      html += '<p>Hold to start!</p>' +
        '<div class="op-button-container"><button class="power-button-large hold" id="bossHold">🔘</button></div>';
    } else if (sub === 2) {
      html += '<p>Waiting...</p><div class="loading-bar-wrapper"><div class="loading-fill" style="width:'+state.bootProgress+'%"></div></div>';
    } else if (sub === 3) {
      html += '<p>Login!</p><div class="avatar-card" id="bossLogin">👤 Login</div>';
    } else if (sub === 4) {
      html += '<p>Shutdown properly!</p><button class="safe-btn" id="bossOff">⏻ Off</button>';
    }

    html += '</div>';
    return html;
  }

  function bindLevelEvents() {
    var state = app.state.onoff;
    
    if (state.level === 1) {
      var correct = document.getElementById("powerBtn");
      if (correct) correct.addEventListener("click", nextRound);
      h.bindMany(".hotspot.fake", function(el) {
        el.addEventListener("click", function() { h.showFeedback("Not there! Look closer.", "info"); el.classList.add("shake"); });
      });
    } else if (state.level === 2) {
      var btn = document.getElementById("actionBtn");
      if (!btn) return;
      var op = state.operation;
      if (op.action === "tap") {
        btn.addEventListener("click", nextRound);
      } else {
        var startHold = 0;
        var holdTimer = null;
        btn.addEventListener("pointerdown", function() {
          startHold = Date.now();
          var fill = document.getElementById("holdFill");
          holdTimer = setInterval(function() {
            var diff = Date.now() - startHold;
            var pct = Math.min(100, (diff / 3000) * 100);
            if (fill) fill.style.width = pct + "%";
            if (diff >= 3000) {
              clearInterval(holdTimer);
              nextRound();
            }
          }, 50);
        });
        btn.addEventListener("pointerup", function() {
          clearInterval(holdTimer);
          var fill = document.getElementById("holdFill");
          if (fill) fill.style.width = "0%";
          if (startHold && Date.now() - startHold < 3000) {
            h.showFeedback("Hold it longer!", "info");
          }
        });
      }
    } else if (state.level === 3) {
      startLevel3Sequence();
    } else if (state.level === 4) {
      h.bindMany(".avatar-card", function(el) {
        el.addEventListener("click", function() {
          if (el.classList.contains("correct")) {
            nextRound();
          } else {
            h.showFeedback("That's not you!", "error");
            el.classList.add("shake");
          }
        });
      });
    } else if (state.level === 5) {
      var startBtn = document.getElementById("startBtn");
      if (startBtn) startBtn.addEventListener("click", function() {
        app.processAction('UPDATE_ONOFF', { shutdownSteps: ["start"] }); render();
      });
      var pwrBtn = document.getElementById("powerMenuBtn");
      if (pwrBtn) pwrBtn.addEventListener("click", function() {
        var newSteps = state.shutdownSteps.slice();
        if (newSteps.indexOf("power") === -1) newSteps.push("power");
        app.processAction('UPDATE_ONOFF', { shutdownSteps: newSteps }); render();
      });
      var shutBtn = document.getElementById("shutdownBtn");
      if (shutBtn) shutBtn.addEventListener("click", nextRound);
    } else if (state.level === 6) {
      bindLevel6Events();
    }
  }

  function startLevel3Sequence() {
    var state = app.state.onoff;
    if (state.bootTimer || state.waiting) return;

    var device = state.device;
    var duration = device.waitTime || 5000;
    var startTime = Date.now();
    
    var timer = setInterval(function() {
      var diff = Date.now() - startTime;
      var prog = Math.min(100, (diff / duration) * 100);
      
      if (prog >= 100) {
        clearInterval(timer);
        app.processAction('UPDATE_ONOFF', { bootTimer: null, bootProgress: 100 });
        nextRound();
      } else {
        app.processAction('UPDATE_ONOFF', { bootProgress: prog });
        var bar = document.querySelector(".loading-fill");
        if (bar) bar.style.width = prog + "%";
      }
    }, 100);

    app.processAction('UPDATE_ONOFF', { bootTimer: timer });

    var container = document.querySelector(".level-container");
    if (container) {
      container.addEventListener("click", function() {
        var currState = app.state.onoff;
        if (!currState.bootTimer) return;
        clearInterval(currState.bootTimer);
        h.showFeedback("NO TOUCHING!", "error");
        app.processAction('UPDATE_ONOFF', { waiting: true, bootTimer: null, bootProgress: 0 });
        render();
        setTimeout(function() {
          app.processAction('UPDATE_ONOFF', { waiting: false });
          startLevel3Sequence();
          render();
        }, 2000);
      }, { once: true });
    }
  }

  function bindLevel6Events() {
    var state = app.state.onoff;
    var sub = state.subStep;

    if (sub === 0) {
      var p = document.getElementById("bossPower");
      if (p) p.addEventListener("click", function() { app.processAction('UPDATE_ONOFF', { subStep: 1 }); render(); });
    } else if (sub === 1) {
      var b = document.getElementById("bossHold");
      if (!b) return;
      var startT = 0;
      b.addEventListener("pointerdown", function() {
        startT = Date.now();
        setTimeout(function() {
          var curr = app.state.onoff;
          if (startT && Date.now() - startT >= 2000) {
            app.processAction('UPDATE_ONOFF', { subStep: 2 });
            render();
            startBossBoot();
          }
        }, 2000);
      });
      b.addEventListener("pointerup", function() { startT = 0; });
    } else if (sub === 3) {
      var l = document.getElementById("bossLogin");
      if (l) l.addEventListener("click", function() { app.processAction('UPDATE_ONOFF', { subStep: 4 }); render(); });
    } else if (sub === 4) {
      var o = document.getElementById("bossOff");
      if (o) o.addEventListener("click", nextRound);
    }
  }

  function startBossBoot() {
    var duration = 3000;
    var startT = Date.now();
    var timer = setInterval(function() {
      var diff = Date.now() - startT;
      var prog = Math.min(100, (diff / duration) * 100);
      if (prog >= 100) {
        clearInterval(timer);
        app.processAction('UPDATE_ONOFF', { subStep: 3, bootProgress: 100 });
        render();
      } else {
        var bar = document.querySelector(".loading-fill");
        if (bar) bar.style.width = prog + "%";
      }
    }, 100);
  }

  function nextRound() {
    var state = app.state.onoff;
    h.showFeedback("Great job!", "success");
    h.spawnConfetti(20);

    setTimeout(function() {
      var curr = app.state.onoff;
      if (curr.round < curr.totalRounds) {
        app.processAction('UPDATE_ONOFF', { round: curr.round + 1 });
        setupRound();
      } else {
        completeLevel();
      }
    }, 1000);
  }

  function completeLevel() {
    var state = app.state.onoff;
    h.showFeedback("LEVEL " + state.level + " COMPLETE!", "success");
    h.spawnConfetti(50, true);
    app.processAction('MARK_COMPLETE', { id: "onoff_lv" + state.level });
    
    if (state.level === 6) {
       app.processAction('MARK_COMPLETE', { id: "onoff" });
    }

    setTimeout(function() {
      app.processAction('UPDATE_ONOFF', { view: "menu" });
      render();
    }, 2000);
  }

  app.lessons.onoff = { start: start };

})();
