(function () {
  const app = window.ICTApp;
  const { sortDeck, inputScenarios } = app.data;
  const h = app.helpers;

  function renderDraggable(item) {
    return `<div class="draggable-item" data-kind="sort" data-id="${item.id}"><span class="draggable-item-emoji">${item.emoji}</span><div><strong>${item.label}</strong><div>Drag to a side</div></div></div>`;
  }

  function start() {
    app.state.input = { mission: 1, remaining: h.shuffleArray([...sortDeck]), buckets: { input: [], output: [] }, scenarioIndex: 0, rushQueue: h.shuffleArray(sortDeck.slice(0, 8).map((item) => ({ ...item }))), rushIndex: 0, rushScore: 0 };
    render();
  }

  function render() {
    const input = app.state.input;
    const missions = [{ label: "1. Drag sort devices", done: input.mission > 1 }, { label: "2. Solve scenarios", done: input.mission > 2 }, { label: "3. Speed buttons", done: input.mission > 3 }];
    let body = "";
    if (input.mission === 1) {
      body = `<div class="sort-layout"><div class="sort-launcher"><h3>Incoming Devices</h3><div class="draggable-list" id="sortSource">${input.remaining.slice(0, 4).map(renderDraggable).join("")}</div><p class="hint">Drag to INPUT or OUTPUT.</p></div><div class="sort-zones"><div class="sort-zone input-zone" data-sort-zone="input"><h3>Input</h3><p>In to computer.</p><div class="captured-list">${input.buckets.input.map(renderChip).join("")}</div></div><div class="sort-zone output-zone" data-sort-zone="output"><h3>Output</h3><p>Out from computer.</p><div class="captured-list">${input.buckets.output.map(renderChip).join("")}</div></div></div></div>`;
    } else if (input.mission === 2) {
      const scenario = inputScenarios[input.scenarioIndex];
      body = `<div class="scenario-card"><div class="object-display"><div class="object-icon">🧠</div><h3>Choose</h3><p class="question-text">${scenario.text}</p></div><div class="choice-pair"><button class="big-choice input-choice" type="button" data-input-choice="input">INPUT</button><button class="big-choice output-choice" type="button" data-input-choice="output">OUTPUT</button></div><p class="hint">Point, say, then tap.</p></div>`;
    } else if (input.mission === 3) {
      const current = input.rushQueue[input.rushIndex];
      body = `<div class="scenario-card"><div class="object-display"><div class="object-icon">${current.emoji}</div><h3>${current.label}</h3><p class="question-text">Input or output?</p></div><div class="choice-pair"><button class="big-choice input-choice" type="button" data-rush-choice="input">INPUT</button><button class="big-choice output-choice" type="button" data-rush-choice="output">OUTPUT</button></div><div class="lesson-plan"><div class="lesson-chip">Round ${input.rushIndex + 1} / ${input.rushQueue.length}</div><div class="lesson-chip">Correct: ${input.rushScore}</div></div></div>`;
    } else {
      body = `<div class="win-panel"><h3>Input Island complete!</h3><p>You sorted, chose, and went fast.</p></div>`;
    }

    app.dom.gameArea.innerHTML = `<div class="game-card">${h.getCardHeader(`<span class="pill">Estimated 8 to 10 minutes</span><span class="pill">${input.mission <= 3 ? `Mission ${input.mission} of 3` : "All missions done"}</span>`)}${h.getMissionStrip("Island Missions", "3 easy jobs: sort, choose, go fast.", missions)}${body}</div>`;
    h.bindBackToMap();
    h.bindDragSystem();
    app.dom.gameArea.querySelectorAll("[data-input-choice]").forEach((button) => button.addEventListener("click", () => handleScenario(button.dataset.inputChoice)));
    app.dom.gameArea.querySelectorAll("[data-rush-choice]").forEach((button) => button.addEventListener("click", () => handleRush(button.dataset.rushChoice)));
  }

  function renderChip(item) {
    return `<div class="captured-chip"><span class="sort-icon">${item.emoji}</span><span>${item.label}</span></div>`;
  }

  function handleDrop(kind, id, target) {
    if (kind !== "sort" || !target) return h.showFeedback("Drop it in a box!", "error");
    const item = sortDeck.find((entry) => entry.id === id);
    if (target.dataset.sortZone !== item.type) return h.showFeedback("Oops! Try the other side.", "error");
    app.state.input.buckets[item.type].push(item);
    app.state.input.remaining = app.state.input.remaining.filter((entry) => entry.id !== id);
    h.bumpStars(1);
    if (app.state.input.remaining.length === 0) {
      app.state.input.mission = 2;
      h.showFeedback("Sorting done! Scenario round unlocked.", "success");
    } else h.showFeedback("Correct sort!", "success");
    render();
  }

  function handleScenario(choice) {
    const scenario = inputScenarios[app.state.input.scenarioIndex];
    if (choice !== scenario.answer) return h.showFeedback("Talk with your team and try again.", "error");
    h.bumpStars(2);
    app.state.input.scenarioIndex += 1;
    if (app.state.input.scenarioIndex >= inputScenarios.length) {
      app.state.input.mission = 3;
      h.showFeedback("Scenario round complete! Speed round time.", "success");
    } else h.showFeedback("Nice thinking!", "success");
    render();
  }

  function handleRush(choice) {
    const current = app.state.input.rushQueue[app.state.input.rushIndex];
    if (choice === current.type) {
      app.state.input.rushScore += 1;
      h.bumpStars(1);
      h.showFeedback("Quick correct!", "success");
    } else h.showFeedback("Almost! Next card.", "error");
    app.state.input.rushIndex += 1;
    if (app.state.input.rushIndex >= app.state.input.rushQueue.length) {
      app.state.input.mission = 4;
      h.completeGame("input");
    }
    render();
  }

  app.lessons.input = { start, render, handleDrop };
})();
