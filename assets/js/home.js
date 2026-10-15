/* Home: depth planes in the hero, and the pinned split stage.
   Scroll position is the single source of truth. The divider is a visual marker only. */
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.classList.add("js");

  var stage = document.getElementById("stage");
  if (!stage) return;
  if (reduce) {
    stage.classList.add("is-static");
    var sb = stage.querySelector(".hm-slot-b");
    sb.removeAttribute("aria-hidden");
    sb.querySelectorAll("a").forEach(function (a) {
      a.removeAttribute("tabindex");
    });
    return;
  }

  var frame = stage.querySelector(".hm-frame");
  var rows = Array.prototype.slice.call(stage.querySelectorAll(".hm-row"));
  var count = stage.querySelector("[data-count]");
  var slotB = stage.querySelector(".hm-slot-b");
  var slotLinks = slotB.querySelectorAll("a");
  var planes = Array.prototype.slice.call(document.querySelectorAll(".hm-plane"));
  var ptr = { x: 0, y: 0 };
  var queued = false;
  var lastDone = -1;

  function clamp(v) {
    return Math.min(1, Math.max(0, v));
  }

  function stageProgress() {
    var r = stage.getBoundingClientRect();
    var span = r.height - window.innerHeight;
    return span > 0 ? clamp(-r.top / span) : 0;
  }

  function update() {
    queued = false;
    var y = window.scrollY;

    if (y < window.innerHeight * 1.3) {
      for (var k = 0; k < planes.length; k++) {
        var d = parseFloat(planes[k].dataset.depth);
        planes[k].style.transform =
          "translate3d(" + (ptr.x * d * 10).toFixed(1) + "px," + (-y * 0.07 * d + ptr.y * d * 8).toFixed(1) + "px,0)";
      }
    }

    var p = stageProgress();
    var done = 0;
    for (var i = 0; i < rows.length; i++) {
      var r = clamp((p - (0.03 + i * 0.125)) / 0.1);
      rows[i].style.setProperty("--r", r.toFixed(3));
      var isDone = r >= 0.5;
      rows[i].classList.toggle("is-done", isDone);
      if (isDone) done++;
    }
    var c = clamp((p - 0.72) / 0.17);
    var cta = clamp((p - 0.88) / 0.07);
    frame.style.setProperty("--c", c.toFixed(3));
    frame.style.setProperty("--cta", cta.toFixed(3));
    var ctaOn = cta > 0.5;
    frame.classList.toggle("is-cta", ctaOn);
    slotB.setAttribute("aria-hidden", ctaOn ? "false" : "true");
    for (var j = 0; j < slotLinks.length; j++) slotLinks[j].tabIndex = ctaOn ? 0 : -1;

    if (done !== lastDone) {
      lastDone = done;
      var label = done + " of 5 steps automated";
      count.textContent = label;
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
