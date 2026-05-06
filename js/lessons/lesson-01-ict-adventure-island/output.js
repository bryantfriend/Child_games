(function () {
  var app = window.ICTApp;
  var outputQuestions = app.data.outputQuestions;
  var outputScenarios = app.data.outputScenarios;
  var h = app.helpers;

  function start() {
    app.state.output = { mission: 1, questionIndex: 0, scenarioIndex: 0, badges: 0 };
    render();
  }

  function render() {
    var output = app.state.output;
    var missions = [{ label: "1. Common parts", done: output.mission > 1 }, { label: "2. Real-world uses", done: output.mission > 2 }];
    var body = "";

    if (output.mission === 1) {
      var question = outputQuestions[output.questionIndex];
      var answersHtml = h.shuffleArray(question.options.slice()).map(function(option) {
        return '<button class="answer-button" type="button" data-output-answer="' + option + '">' + option + '</button>';
      }).join("");
      body = '<div class="qa-layout"><div class="object-display"><div class="object-icon">' + question.emoji + '</div><h3>' + question.item + '</h3><p class="question-text">' + question.prompt + '</p></div><div class="answers-grid">' + answersHtml + '</div><div class="lesson-plan"><div class="lesson-chip">Question ' + (output.questionIndex + 1) + ' / ' + outputQuestions.length + '</div><div class="lesson-chip">Badges ' + output.badges + '</div></div></div>';
    } else if (output.mission === 2) {
      var scenario = outputScenarios[output.scenarioIndex];
      var toolHtml = h.shuffleArray(scenario.options.slice()).map(function(option) {
        return '<button class="answer-button" type="button" data-output-tool="' + option + '">' + option + '</button>';
      }).join("");
      body = '<div class="scenario-card"><div class="object-display"><div class="object-icon">🏝️</div><h3>Pick one</h3><p class="question-text">' + scenario.text + '</p></div><div class="answers-grid">' + toolHtml + '</div><p class="hint">Look. Think. Tap.</p></div>';
    } else {
      body = '<div class="win-panel"><h3>Output Island complete!</h3><p>You know all the parts now.</p></div>';
    }

    app.dom.gameArea.innerHTML = '<div class="game-card">' + h.getCardHeader('<span class="pill">Estimated 8-10 min</span><span class="pill">Stars: ' + app.state.stars + '</span>') + h.getMissionStrip("Island Missions", "Find the tool. Match the use.", missions) + body + '</div>';
    
    h.bindBackToMap();
    
    var ansBtns = app.dom.gameArea.querySelectorAll("[data-output-answer]");
    var i;
    for (i = 0; i < ansBtns.length; i++) {
       (function(btn) {
         btn.addEventListener("click", function() { handleAnswer(btn.dataset.outputAnswer); });
       })(ansBtns[i]);
    }

    var toolBtns = app.dom.gameArea.querySelectorAll("[data-output-tool]");
    var j;
    for (j = 0; j < toolBtns.length; j++) {
       (function(btn) {
         btn.addEventListener("click", function() { handleTool(btn.dataset.outputTool); });
       })(toolBtns[j]);
    }
  }

  function handleAnswer(choice) {
    var question = outputQuestions[app.state.output.questionIndex];
    if (choice !== question.correct) {
      h.showFeedback("Not quite. Try again!", "error");
      return;
    }
    app.processAction('BUMP_STARS', { amount: 2 });
    app.state.output.badges += 1;
    app.state.output.questionIndex += 1;
    if (app.state.output.questionIndex >= outputQuestions.length) {
      app.state.output.mission = 2;
      h.showFeedback("Mission 1 clear! Real-world challenge next.", "success");
    } else {
      h.showFeedback("Great thinking!", "success");
    }
    render();
  }

  function handleTool(choice) {
    var scenario = outputScenarios[app.state.output.scenarioIndex];
    if (choice !== scenario.correct) {
      h.showFeedback("Wrong tool. Look closer!", "error");
      return;
    }
    app.processAction('BUMP_STARS', { amount: 3 });
    app.state.output.scenarioIndex += 1;
    if (app.state.output.scenarioIndex >= outputScenarios.length) {
      app.state.output.mission = 3;
      app.processAction('COMPLETE_GAME', { id: "output" });
    } else {
      h.showFeedback("Perfect match!", "success");
    }
    render();
  }

  app.lessons.output = { start: start, render: render };
})();
