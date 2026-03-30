(function () {
  const app = window.ICTApp;
  const { buildParts, buildFunctions, buildPrompts } = app.data;
  const h = app.helpers;

  function renderDraggable(item, kind, placed) {
    return `<div class="draggable-item ${placed ? "placed" : ""}" data-kind="${kind}" data-id="${item.id}">${h.renderIcon(item, "draggable-item-emoji")}<div><strong>${item.label}</strong><div>${kind === "function" ? item.label : item.hint}</div></div></div>`;
  }

  function start() {
    app.state.build = { mission: 1, placed: {}, matched: [], promptIndex: 0 };
    render();
  }

  function render() {
    const build = app.state.build;
    const missions = [{ label: "1. Build the computer", done: build.mission > 1 }, { label: "2. Match each job", done: build.mission > 2 }, { label: "3. Quick tap challenge", done: build.mission > 3 }];
    let body = "";
    if (build.mission === 1) {
      body = `<div class="build-layout"><div class="computer-board"><div class="drop-zone-grid">${buildParts.map((part) => `<div class="drop-zone ${build.placed[part.id] ? "filled" : ""}" data-zone="${part.zone}"><div>${h.renderIcon(part, "drop-zone-icon")}<strong>${part.label}</strong><p>${build.placed[part.id] ? "Placed!" : part.hint}</p></div></div>`).join("")}</div></div><div class="tray"><div class="pill">Mission 1 of 3</div><div class="draggable-list">${h.shuffleArray([...buildParts]).map((part) => renderDraggable(part, "build", Boolean(build.placed[part.id]))).join("")}</div><p class="hint">Drag the part to the same picture.</p></div></div>`;
    } else if (build.mission === 2) {
      body = `<div class="build-layout"><div class="computer-board"><div class="drop-zone-grid function-grid">${buildParts.map((part) => `<div class="drop-zone function-target ${build.matched.includes(part.id) ? "filled" : ""}" data-function-target="${part.id}"><div>${h.renderIcon(part, "drop-zone-icon")}<strong>${part.label}</strong><p>${build.matched.includes(part.id) ? "Job matched!" : "Drop the correct job card here."}</p></div></div>`).join("")}</div></div><div class="tray"><div class="pill">Mission 2 of 3</div><div class="draggable-list">${h.shuffleArray([...buildFunctions]).map((card) => renderDraggable(card, "function", build.matched.includes(card.target))).join("")}</div><p class="hint">Match the job card.</p></div></div>`;
    } else if (build.mission === 3) {
      const prompt = buildPrompts[build.promptIndex];
      body = `<div class="teacher-layout"><div class="teacher-stage"><div class="teacher-icon">⚡</div><h3 class="teacher-command">${prompt.clue}</h3><p class="teacher-subtext">Tap the right part. ${build.promptIndex + 1} / ${buildPrompts.length}</p></div><div class="teacher-targets">${h.shuffleArray([...buildParts]).map((part) => `<button class="teacher-target" type="button" data-build-answer="${part.id}">${h.renderIcon(part, "sort-icon")}<span>${part.label}</span></button>`).join("")}</div></div>`;
    } else {
      body = `<div class="win-panel"><h3>Computer Island complete!</h3><p>You built it, matched it, and tapped fast.</p></div>`;
    }

    app.dom.gameArea.innerHTML = `<div class="game-card">${h.getCardHeader('<span class="pill">Estimated 8 to 10 minutes</span><span class="pill">Stars: ' + app.state.stars + '</span>')}${h.getMissionStrip("Island Missions", "3 easy jobs: build, match, tap.", missions)}${body}</div>`;
    h.bindBackToMap();
    h.bindDragSystem();
    app.dom.gameArea.querySelectorAll("[data-build-answer]").forEach((button) => button.addEventListener("click", () => handlePrompt(button.dataset.buildAnswer)));
  }

  function handleDrop(kind, id, target) {
    if (kind === "build") {
      const part = buildParts.find((entry) => entry.id === id);
      if (target?.dataset.zone !== part.zone) return h.showFeedback("Try again!", "error");
      app.state.build.placed[id] = true;
      h.bumpStars(1);
      if (Object.keys(app.state.build.placed).length === buildParts.length) {
        app.state.build.mission = 2;
        h.showFeedback("Mission 1 complete! Now match the jobs.", "success");
      } else h.showFeedback("Part placed!", "success");
      return render();
    }
    if (kind === "function") {
      const card = buildFunctions.find((entry) => entry.id === id);
      if (target?.dataset.functionTarget !== card.target) return h.showFeedback("Wrong job card!", "error");
      if (!app.state.build.matched.includes(card.target)) app.state.build.matched.push(card.target);
      h.bumpStars(1);
      if (app.state.build.matched.length === buildFunctions.length) {
        app.state.build.mission = 3;
        h.showFeedback("Mission 2 complete! Quick tap challenge next.", "success");
      } else h.showFeedback("Great match!", "success");
      render();
    }
  }

  function handlePrompt(answer) {
    const prompt = buildPrompts[app.state.build.promptIndex];
    if (answer !== prompt.answer) return h.showFeedback("Not that one. Look again!", "error");
    h.bumpStars(2);
    app.state.build.promptIndex += 1;
    if (app.state.build.promptIndex >= buildPrompts.length) {
      app.state.build.mission = 4;
      h.completeGame("build");
    } else h.showFeedback("Fast thinking!", "success");
    render();
  }

  app.lessons.build = { start, render, handleDrop };
})();
