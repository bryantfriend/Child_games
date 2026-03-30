(function () {
  const app = window.ICTApp;
  const { outputQuestions, outputScenarios } = app.data;
  const h = app.helpers;

  function start() {
    app.state.output = { mission: 1, questionIndex: 0, scenarioIndex: 0, badges: 0 };
    render();
  }

  function render() {
    const output = app.state.output;
    const missions = [{ label: "1. What does it do?", done: output.mission > 1 }, { label: "2. Pick the best ICT tool", done: output.mission > 2 }];
    let body = "";
    if (output.mission === 1) {
      const question = outputQuestions[output.questionIndex];
      body = `<div class="qa-layout"><div class="object-display"><div class="object-icon">${question.emoji}</div><h3>${question.item}</h3><p class="question-text">${question.prompt}</p></div><div class="answers-grid">${h.shuffleArray([...question.options]).map((option) => `<button class="answer-button" type="button" data-output-answer="${option}">${option}</button>`).join("")}</div><div class="lesson-plan"><div class="lesson-chip">Question ${output.questionIndex + 1} / ${outputQuestions.length}</div><div class="lesson-chip">Badges ${output.badges}</div></div></div>`;
    } else if (output.mission === 2) {
      const scenario = outputScenarios[output.scenarioIndex];
      body = `<div class="scenario-card"><div class="object-display"><div class="object-icon">🏝️</div><h3>Pick one</h3><p class="question-text">${scenario.text}</p></div><div class="answers-grid">${h.shuffleArray([...scenario.options]).map((option) => `<button class="answer-button" type="button" data-output-tool="${option}">${option}</button>`).join("")}</div><p class="hint">Look. Think. Tap.</p></div>`;
    } else {
      body = `<div class="win-panel"><h3>Output Island complete!</h3><p>You named the parts and picked the best tool.</p></div>`;
    }

    app.dom.gameArea.innerHTML = `<div class="game-card">${h.getCardHeader(`<span class="pill">Estimated 8 to 10 minutes</span><span class="pill">Badges ${output.badges}</span>`)}${h.getMissionStrip("Island Missions", "2 easy jobs: answer and choose.", missions)}${body}</div>`;
    h.bindBackToMap();
    app.dom.gameArea.querySelectorAll("[data-output-answer]").forEach((button) => button.addEventListener("click", () => handleAnswer(button.dataset.outputAnswer)));
    app.dom.gameArea.querySelectorAll("[data-output-tool]").forEach((button) => button.addEventListener("click", () => handleTool(button.dataset.outputTool)));
  }

  function handleAnswer(answer) {
    const question = outputQuestions[app.state.output.questionIndex];
    if (answer !== question.correct) return h.showFeedback("Try again!", "error");
    app.state.output.badges += 1;
    h.bumpStars(2);
    app.state.output.questionIndex += 1;
    if (app.state.output.questionIndex >= outputQuestions.length) {
      app.state.output.mission = 2;
      h.showFeedback("Round 1 complete! Scenario round unlocked.", "success");
    } else h.showFeedback("Correct answer!", "success");
    render();
  }

  function handleTool(choice) {
    const scenario = outputScenarios[app.state.output.scenarioIndex];
    if (choice !== scenario.correct) return h.showFeedback("Think about what the class needs.", "error");
    app.state.output.badges += 1;
    h.bumpStars(2);
    app.state.output.scenarioIndex += 1;
    if (app.state.output.scenarioIndex >= outputScenarios.length) {
      app.state.output.mission = 3;
      h.completeGame("output");
    } else h.showFeedback("Perfect tool!", "success");
    render();
  }

  app.lessons.output = { start, render };
})();
