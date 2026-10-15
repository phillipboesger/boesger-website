/* Home: depth planes in the hero move at different rates with scroll and pointer. */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var planes = Array.prototype.slice.call(document.querySelectorAll(".hm-plane"));
  if (!planes.length) return;
  var ptr = { x: 0, y: 0 };
  var queued = false;

  function update() {
    queued = false;
    var y = window.scrollY;
    if (y > window.innerHeight * 1.3) return;
    for (var k = 0; k < planes.length; k++) {
      var d = parseFloat(planes[k].dataset.depth);
      planes[k].style.transform =
        "translate3d(" + (ptr.x * d * 10).toFixed(1) + "px," + (-y * 0.07 * d + ptr.y * d * 8).toFixed(1) + "px,0)";
    }
  }

  function schedule() {
    if (!queued) {
      queued = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  window.addEventListener(
    "pointermove",
    function (e) {
      if (e.pointerType === "touch") return;
      ptr.x = (e.clientX / window.innerWidth - 0.5) * 2;
      ptr.y = (e.clientY / window.innerHeight - 0.5) * 2;
      if (window.scrollY < window.innerHeight * 1.3) schedule();
    },
    { passive: true }
  );
  update();
})();
