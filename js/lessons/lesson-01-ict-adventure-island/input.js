(function () {
  var app = window.ICTApp;
  var sortDeck = app.data.sortDeck;
  var inputScenarios = app.data.inputScenarios;
  var h = app.helpers;

  function start() {
    app.state.input = {
      mission: 1,
      remaining: h.shuffleArray(sortDeck.slice()),
      buckets: { input: [], output: [] },
      scenarioIndex: 0,
      rushQueue: h.shuffleArray(sortDeck.slice(0, 8)).map(function(item) { return Object.assign({}, item); }),
      rushIndex: 0,
      rushScore: 0
    };
    render();
  }

  function render() {
    var input = app.state.input;
    var missions = [{ label: "1. Sort 10 parts", done: input.mission > 1 }, { label: "2. Input or Output?", done: input.mission > 2 }, { label: "3. Rush challenge", done: input.mission > 3 }];
    var body = "";

    if (input.mission === 1) {
      var trayHtml = input.remaining.map(function(item) {
        return '<div class="draggable-item" data-kind="sort" data-id="' + item.id + '">' + h.renderIcon(item, "draggable-item-emoji") + '<div><strong>' + item.label + '</strong><div>Move to a bin.</div></div></div>';
      }).join("");
      body = '<div class="sort-layout"><div class="computer-board"><div class="drop-zone-grid"><div class="drop-zone" data-sort-zone="input">📥 Input<p>' + input.buckets.input.length + ' sorted</p></div><div class="drop-zone" data-sort-zone="output">📤 Output<p>' + input.buckets.output.length + ' sorted</p></div></div></div><div class="tray"><div class="pill">Mission 1 of 3</div><div class="draggable-list">' + trayHtml + '</div><p class="hint">Sorting objects...</p></div></div>';
    } else if (input.mission === 2) {
      var scenario = inputScenarios[input.scenarioIndex];
      body = '<div class="scenario-card"><div class="welcome-stack"><h3>' + scenario.text + '</h3><div class="emoji-grid"><button class="big-choice input-choice" type="button" data-input-choice="input">📥 Input</button><button class="big-choice output-choice" type="button" data-input-choice="output">📤 Output</button></div><div class="lesson-plan"><div class="lesson-chip">Quest ' + (input.scenarioIndex + 1) + ' / ' + inputScenarios.length + '</div></div></div></div>';
    } else if (input.mission === 3) {
      var rushItem = input.rushQueue[input.rushIndex];
      body = '<div class="rush-card"><div class="welcome-stack"><div class="rush-item-icon">' + h.renderIcon(rushItem) + '</div><h3>' + rushItem.label + '</h3><p>Fast! Input or Output?</p><div class="emoji-grid"><button class="big-choice input-choice" type="button" data-rush-choice="input">📥</button><button class="big-choice output-choice" type="button" data-rush-choice="output">📤</button></div><div class="lesson-plan"><div class="lesson-chip">Points: ' + input.rushScore + '</div><div class="lesson-chip">' + (input.rushIndex + 1) + ' / ' + input.rushQueue.length + '</div></div></div></div>';
    } else {
      body = '<div class="win-panel"><h3>Input Island complete!</h3><p>You sorted everything perfectly.</p></div>';
    }

    app.dom.gameArea.innerHTML = '<div class="game-card">' + h.getCardHeader('<span class="pill">Estimated 8-10 min</span><span class="pill">Stars: ' + app.state.stars + '</span>') + h.getMissionStrip("Island Missions", "Sort, choose, and go fast.", missions) + body + '</div>';
    
    h.bindBackToMap();
    h.bindDragSystem();

    var choiceBtns = app.dom.gameArea.querySelectorAll("[data-input-choice]");
    var i;
    for (i = 0; i < choiceBtns.length; i++) {
       (function(btn) {
         btn.addEventListener("click", function() { handleScenario(btn.dataset.inputChoice); });
       })(choiceBtns[i]);
    }

    var rushBtns = app.dom.gameArea.querySelectorAll("[data-rush-choice]");
    var j;
    for (j = 0; j < rushBtns.length; j++) {
       (function(btn) {
         btn.addEventListener("click", function() { handleRush(btn.dataset.rushChoice); });
       })(rushBtns[j]);
    }
  }

  function handleDrop(kind, id, target) {
    if (kind !== "sort") return;
    var item = sortDeck.filter(function(e) { return e.id === id; })[0];
    var dropZone = target ? target.dataset.sortZone : null;
    if (dropZone !== item.type) {
      h.showFeedback("Nope. Try again!", "error");
      return;
    }
    app.state.input.remaining = app.state.input.remaining.filter(function(e) { return e.id !== id; });
    app.state.input.buckets[dropZone].push(id);
    app.processAction('BUMP_STARS', { amount: 1 });
    if (app.state.input.remaining.length === 0) {
      app.state.input.mission = 2;
      h.showFeedback("Mission 1 clear! Now answer the questions.", "success");
    } else {
      h.showFeedback("Nice sorting!", "success");
    }
    render();
  }

  function handleScenario(choice) {
    var scenario = inputScenarios[app.state.input.scenarioIndex];
    if (choice !== scenario.answer) {
      h.showFeedback("Wrong bin. Try again!", "error");
      return;
    }
    app.processAction('BUMP_STARS', { amount: 2 });
    app.state.input.scenarioIndex += 1;
    if (app.state.input.scenarioIndex >= inputScenarios.length) {
      app.state.input.mission = 3;
      h.showFeedback("Mission 2 clear! Get ready for the RUSH!", "success");
    } else {
      h.showFeedback("Smart choice!", "success");
    }
    render();
  }

  function handleRush(choice) {
    var rushItem = app.state.input.rushQueue[app.state.input.rushIndex];
    if (choice !== rushItem.type) {
      h.showFeedback("Missed it!", "error");
    } else {
      app.state.input.rushScore += 5;
      app.processAction('BUMP_STARS', { amount: 1 });
      h.showFeedback("FAST!", "success");
    }
    app.state.input.rushIndex += 1;
    if (app.state.input.rushIndex >= app.state.input.rushQueue.length) {
      app.state.input.mission = 4;
      app.processAction('COMPLETE_GAME', { id: "input" });
    }
    render();
  }

  app.lessons.input = { start: start, render: render, handleDrop: handleDrop };
})();
