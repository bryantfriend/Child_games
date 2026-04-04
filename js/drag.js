(function () {
  var app = window.ICTApp = window.ICTApp || {};

  function bindDragSystem() {
    var items = app.dom.gameArea.querySelectorAll(".draggable-item");
    var i;
    for (i = 0; i < items.length; i++) {
      items[i].addEventListener("pointerdown", startDrag);
    }
  }

  function startDrag(event) {
    var source = event.currentTarget;
    if (source.classList.contains("placed")) return;
    var ghost = source.cloneNode(true);
    ghost.classList.add("drag-ghost");
    document.body.appendChild(ghost);
    app.state.drag = { id: source.dataset.id, kind: source.dataset.kind, source: source, ghost: ghost };
    source.setPointerCapture(event.pointerId);
    source.addEventListener("pointermove", onDragMove);
    source.addEventListener("pointerup", endDrag);
    source.addEventListener("pointercancel", cancelDrag);
    moveGhost(event.clientX, event.clientY);
  }

  function moveGhost(x, y) {
    if (!app.state.drag) return;
    app.state.drag.ghost.style.left = x + "px";
    app.state.drag.ghost.style.top = y + "px";
  }

  function clearHighlights() {
    var nodes = app.dom.gameArea.querySelectorAll(".active");
    var i;
    for (i = 0; i < nodes.length; i++) {
      nodes[i].classList.remove("active");
    }
  }

  function onDragMove(event) {
    if (!app.state.drag) return;
    moveGhost(event.clientX, event.clientY);
    clearHighlights();
    var el = document.elementFromPoint(event.clientX, event.clientY);
    if (el) {
       var target = el.closest("[data-zone], [data-sort-zone], [data-function-target]");
       if (target) target.classList.add("active");
    }
  }

  function endDrag(event) {
    if (!app.state.drag) return;
    var el = document.elementFromPoint(event.clientX, event.clientY);
    var target = el ? el.closest("[data-zone], [data-sort-zone], [data-function-target]") : null;
    clearHighlights();
    
    var lesson = app.lessons[app.state.currentGame];
    var funGame = null;
    if (app.state.currentGame === "fun") {
      funGame = app.funGames[app.state.fun.mode];
    }

    if (lesson && lesson.handleDrop) {
      lesson.handleDrop(app.state.drag.kind, app.state.drag.id, target);
    } else if (funGame && funGame.handleDrop) {
      funGame.handleDrop(app.state.drag.kind, app.state.drag.id, target);
    }
    
    cleanupDrag(event.currentTarget, event.pointerId);
  }

  function cancelDrag(event) {
    clearHighlights();
    cleanupDrag(event.currentTarget, event.pointerId);
  }

  function cleanupDrag(source, pointerId) {
    source.releasePointerCapture(pointerId);
    source.removeEventListener("pointermove", onDragMove);
    source.removeEventListener("pointerup", endDrag);
    source.removeEventListener("pointercancel", cancelDrag);
    if (app.state.drag && app.state.drag.ghost) {
      if (app.state.drag.ghost.parentNode) {
        app.state.drag.ghost.parentNode.removeChild(app.state.drag.ghost);
      }
    }
    app.state.drag = null;
  }

  app.helpers.bindDragSystem = bindDragSystem;
})();
