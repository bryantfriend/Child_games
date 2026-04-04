(function () {
  var app = window.ICTApp;
  var h = app.helpers;

  var games = [
    { id: "mouse", emoji: "🖱️", title: "Mouse Maze Escape", text: "Drag the little mouse through the maze." },
    { id: "keyboard", emoji: "⌨️", title: "Typing Race!", text: "See the falling letter. Tap the same key." },
    { id: "fix", emoji: "🖥️", title: "Boot-Up Sequence", text: "Tap at the right time to start the computer." },
    { id: "screen", emoji: "📺", title: "Screen Paint Splash!", text: "Draw with bright colors on the happy screen." },
    { id: "power", emoji: "🔌", title: "Plug It In!", text: "Drag each cable to the right computer port." },
  ];

  function start() {
    h.clearFunTimers();
    app.state.fun = { mode: "hub", timers: [] };
    render();
  }

  function render() {
    var hubHtml = games.map(function(game) {
      return '<button class="fun-button fun-card-button" type="button" data-fun-game="' + game.id + '"><span class="fun-card-emoji">' + game.emoji + '</span><span class="fun-card-title">' + game.title + '</span><span class="fun-card-text">' + game.text + '</span></button>';
    }).join("");

    var missions = games.map(function(game) { return { label: game.title, done: false }; });

    app.dom.gameArea.innerHTML = '<div class="game-card">' + h.getCardHeader('<span class="pill">Unlocked at 100 stars</span><span class="pill">Bonus play</span>') + h.getMissionStrip("Fun Zone", "Pick a fun game. Move, tap, draw, and play.", missions) + '<div class="fun-hub">' + hubHtml + '</div></div>';
    
    h.bindBackToMap();
    
    var btns = app.dom.gameArea.querySelectorAll("[data-fun-game]");
    var i;
    for (i = 0; i < btns.length; i++) {
       (function(btn) {
         btn.addEventListener("click", function() {
           var id = btn.dataset.funGame;
           if (id === "mouse") app.funGames.mouse.start();
           else if (id === "keyboard") app.funGames.keyboard.start();
           else if (id === "fix") app.funGames.fix.start();
           else if (id === "screen") app.funGames.screen.start();
           else if (id === "power") app.funGames.power.start();
         });
       })(btns[i]);
    }
  }

  app.funGames.hub = { start: start, render: render };
})();
