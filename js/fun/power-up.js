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
      return '<button class="draggable-item cable-card" type="button" data-kind="cable" data-id="' + cable.id + '" style="--cable:' + cable.color + ';">' +
        '<span class="cable-card-icon">' + cable.icon + '</span>' +
        '<span class="cable-card-name">' + cable.label + '</span>' +
        '<span class="cable-line"></span>' +
      '</button>';
    }).join("");

    var portHtml = cables.map(function(cable, index) {
      var isPlaced = app.state.fun.plugPlaced[cable.id];
      var cls = isPlaced ? "plug-port-on" : "";
      var fillHtml = isPlaced ? '<span class="plug-port-fill" style="background:' + cable.color + ';">' + cable.icon + '</span>' : "";
      return '<div class="plug-port-row" style="top:' + (20 + index * 14) + '%;">' +
        '<div class="plug-port-label">' + cable.label + '</div>' +
        '<div class="drop-zone plug-port ' + cls + '" data-zone="' + cable.target + '">' +
          fillHtml +
        '</div>' +
      '</div>';
    }).join("");

    app.dom.gameArea.innerHTML = '<div class="game-card">' + h.getCardHeader('<span class="pill">Plugged ' + placedCount + ' / ' + cables.length + '</span><span class="pill">Drag and match</span>', "backToFun", "⬅ Fun Zone") + h.getMissionStrip("Plug It In!", "Drag each cable to the matching port.", [{ label: "Match all 5 cables", done: placedCount === cables.length }]) +
      '<div class="arcade-board plug-board">' +
        '<div class="plug-layout">' +
          '<div class="plug-cable-column">' + cableHtml + '</div>' +
          '<div class="plug-computer-shell">' +
            '<div class="plug-monitor-glow"></div>' +
            '<svg viewBox="0 0 340 240" class="fun-svg plug-computer-svg" aria-hidden="true">' +
              '<rect x="42" y="18" width="190" height="126" rx="24" fill="#325ca8"/>' +
              '<rect x="56" y="32" width="162" height="94" rx="18" fill="#91ebff"/>' +
              '<circle cx="108" cy="78" r="12" fill="#fff3b0"/>' +
              '<circle cx="150" cy="78" r="12" fill="#fff3b0"/>' +
              '<path d="M97 105q32 24 64 0" fill="none" stroke="#fff" stroke-linecap="round" stroke-width="10"/>' +
              '<rect x="110" y="144" width="56" height="20" rx="9" fill="#ffcd70"/>' +
              '<rect x="90" y="166" width="96" height="12" rx="6" fill="#7f9aca"/>' +
              '<rect x="234" y="54" width="56" height="112" rx="16" fill="#556e9f"/>' +
              '<circle cx="262" cy="148" r="5" fill="#9fe77f"/>' +
              '<rect x="248" y="78" width="26" height="10" rx="4" fill="#2b3553"/>' +
              '<rect x="248" y="98" width="26" height="10" rx="4" fill="#2b3553"/>' +
              '<rect x="248" y="118" width="26" height="10" rx="4" fill="#2b3553"/>' +
            '</svg>' +
            '<div class="plug-ports">' + portHtml + '</div>' +
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
        h.addFunTimer(setTimeout(function() { app.funGames.hub.start(); }, 800), "timeout");
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
