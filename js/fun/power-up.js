(function () {
  var app = window.ICTApp;
  var h = app.helpers;

  var cables = [
    { id: "power", label: "Power", color: "#ffd84f", target: "power", icon: "⚡" },
    { id: "usb", label: "USB", color: "#4cc9f0", target: "usb", icon: "🖱️" },
    { id: "hdmi", label: "HDMI", color: "#a78bfa", target: "hdmi", icon: "📺" },
    { id: "headphones", label: "Headphones", color: "#ff8e3c", target: "headphones", icon: "🎧" },
    { id: "printer", label: "Printer", color: "#2ec27e", target: "printer", icon: "🖨️" },
  ];

  function start() {
    h.clearFunTimers();
    app.state.fun = Object.assign({}, app.state.fun, {
      mode: "power",
      timers: [],
      plugPlaced: {},
    });
    render();
  }

  function render() {
    var placedCount = Object.keys(app.state.fun.plugPlaced).length;
    
    var cableHtml = cables.map(function(cable) {
      if (app.state.fun.plugPlaced[cable.id]) return "";
      return '<button class="draggable-item cable-card plug-cable-card" type="button" data-kind="cable" data-id="' + cable.id + '" style="--cable:' + cable.color + ';">' +
        '<span class="cable-card-icon">' + cable.icon + '</span>' +
        '<span class="cable-card-name">' + cable.label + '</span>' +
        '<span class="cable-card-tip">Drag to the matching port</span>' +
        '<span class="cable-line"></span>' +
      '</button>';
    }).join("");

    var portHtml = cables.map(function(cable) {
      var isPlaced = app.state.fun.plugPlaced[cable.id];
      var cls = isPlaced ? "plug-port-on" : "";
      var fillHtml = isPlaced ? '<span class="plug-port-fill" style="background:' + cable.color + ';">' + cable.icon + '</span><span class="plug-port-spark"></span>' : '<span class="plug-port-hole"></span>';
      return '<div class="plug-port-card ' + cls + '">' +
        '<div class="plug-port-copy"><strong>' + cable.label + '</strong><span>' + cable.icon + ' ' + cable.label + ' port</span></div>' +
        '<div class="drop-zone plug-port ' + cls + '" data-zone="' + cable.target + '">' + fillHtml + '</div>' +
      '</div>';
    }).join("");

    app.dom.gameArea.innerHTML = '<div class="game-card">' + h.getCardHeader('<span class="pill">Plugged ' + placedCount + ' / ' + cables.length + '</span><span class="pill">Drag and match</span>', "backToFun", "⬅ Fun Zone") + h.getMissionStrip("Plug It In!", "Drag each cable to the matching port.", [{ label: "Match all 5 cables", done: placedCount === cables.length }]) +
      '<div class="arcade-board plug-board">' +
        '<div class="plug-layout">' +
          '<div class="plug-cable-column"><div class="plug-panel-title">Cables</div>' + cableHtml + '</div>' +
          '<div class="plug-computer-shell">' +
            '<div class="plug-panel-title plug-panel-title-right">Happy Computer</div>' +
            '<div class="plug-monitor-glow"></div>' +
            '<svg viewBox="0 0 620 360" class="fun-svg plug-computer-svg" aria-hidden="true">' +
              '<defs><linearGradient id="plugScreen" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#b8f7ff"/><stop offset="100%" stop-color="#59d5ff"/></linearGradient><linearGradient id="plugTower" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#718ff4"/><stop offset="100%" stop-color="#415fc2"/></linearGradient></defs>' +
              '<ellipse cx="206" cy="296" rx="154" ry="22" fill="rgba(93, 200, 255, 0.2)"/>' +
              '<rect x="76" y="48" width="266" height="172" rx="30" fill="#355da6"/>' +
              '<rect x="98" y="70" width="222" height="128" rx="22" fill="url(#plugScreen)"/>' +
              '<path d="M132 92c34-18 120-16 154 14-42 8-116 10-154-14z" fill="#fff" opacity=".24"/>' +
              '<circle cx="172" cy="132" r="11" fill="#28507a"/>' +
              '<circle cx="236" cy="132" r="11" fill="#28507a"/>' +
              '<path d="M158 162q40 26 92 0" fill="none" stroke="#28507a" stroke-linecap="round" stroke-width="10"/>' +
              '<rect x="188" y="222" width="42" height="42" rx="16" fill="#355da6"/>' +
              '<rect x="142" y="260" width="136" height="18" rx="9" fill="#284f84"/>' +
              '<g class="plug-tower-bob">' +
                '<rect x="394" y="54" width="126" height="236" rx="28" fill="url(#plugTower)"/>' +
                '<rect x="416" y="76" width="82" height="184" rx="22" fill="#edf6ff"/>' +
                '<rect x="430" y="96" width="54" height="32" rx="14" fill="#95e9ff"/>' +
                '<circle cx="442" cy="158" r="8" fill="#31507a"/>' +
                '<circle cx="472" cy="158" r="8" fill="#31507a"/>' +
                '<path d="M438 180q18 14 38 0" fill="none" stroke="#31507a" stroke-linecap="round" stroke-width="6"/>' +
                '<circle cx="444" cy="218" r="10" fill="#ffd84f"/>' +
                '<circle cx="472" cy="218" r="10" fill="#ff8fb5"/>' +
              '</g>' +
              '<g class="plug-spark plug-spark-one"><path d="M356 78l12 16-14 2 10 14" fill="none" stroke="#ffd84f" stroke-linecap="round" stroke-linejoin="round" stroke-width="8"/></g>' +
              '<g class="plug-spark plug-spark-two"><circle cx="344" cy="226" r="8" fill="#8df09c"/><circle cx="330" cy="246" r="5" fill="#fff3b0"/></g>' +
            '</svg>' +
            '<div class="plug-port-grid">' + portHtml + '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>';
    
    var backBtn = document.getElementById("backToFun");
    if (backBtn) backBtn.addEventListener("click", function() { app.funGames.hub.start(); });
    
    h.bindDragSystem();
  }

  function handleDrop(kind, id, target) {
    if (kind !== "cable") return;
    var cable = cables.filter(function(item) { return item.id === id; })[0];
    if (!cable || !target) {
      bounceCable(id);
      return;
    }
    if (target.dataset.zone === cable.target) {
      app.state.fun.plugPlaced[id] = true;
      app.processAction('BUMP_STARS', { amount: 2 });
      h.showFeedback(cable.label + "!", "success");
      if (Object.keys(app.state.fun.plugPlaced).length === cables.length) {
        render();
        h.spawnConfetti(28, false);
        h.showFeedback("All plugged in!", "success");
        h.addFunTimer(setTimeout(function() { app.funGames.hub.start(); }, 1000), "timeout");
        return;
      }
      render();
      return;
    }
    bounceCable(id);
  }

  function bounceCable(id) {
    var card = document.querySelector('.cable-card[data-id="' + id + '"]');
    if (card) {
      card.classList.remove("cable-card-bounce");
      void card.offsetWidth;
      card.classList.add("cable-card-bounce");
    }
    h.showFeedback("Try another port!", "error");
  }

  app.funGames.power = { start: start, render: render, handleDrop: handleDrop };
})();
