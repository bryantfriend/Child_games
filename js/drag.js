(function () {
  const app = window.ICTApp;

  function bindDragSystem() {
    app.dom.gameArea.querySelectorAll(".draggable-item").forEach((item) => {
      item.addEventListener("pointerdown", startDrag);
    });
  }

  function startDrag(event) {
    const source = event.currentTarget;
    if (source.classList.contains("placed")) return;
    const ghost = source.cloneNode(true);
    ghost.classList.add("drag-ghost");
    document.body.appendChild(ghost);
    app.state.drag = { id: source.dataset.id, kind: source.dataset.kind, source, ghost };
    source.setPointerCapture(event.pointerId);
    source.addEventListener("pointermove", onDragMove);
    source.addEventListener("pointerup", endDrag);
    source.addEventListener("pointercancel", cancelDrag);
    moveGhost(event.clientX, event.clientY);
  }

  function onDragMove(event) {
    if (!app.state.drag) return;
    moveGhost(event.clientX, event.clientY);
    clearHighlights();
    document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-zone], [data-sort-zone], [data-function-target]")?.classList.add("active");
  }

  function endDrag(event) {
    if (!app.state.drag) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-zone], [data-sort-zone], [data-function-target]");
    clearHighlights();
    const lesson = app.lessons[app.state.currentGame];
    if (lesson?.handleDrop) lesson.handleDrop(app.state.drag.kind, app.state.drag.id, target);
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
    app.state.drag?.ghost.remove();
    app.state.drag = null;
  }

  function moveGhost(x, y) {
    app.state.drag.ghost.style.left = `${x}px`;
    app.state.drag.ghost.style.top = `${y}px`;
  }

  function clearHighlights() {
    app.dom.gameArea.querySelectorAll(".active").forEach((node) => node.classList.remove("active"));
  }

  app.helpers.bindDragSystem = bindDragSystem;
})();
