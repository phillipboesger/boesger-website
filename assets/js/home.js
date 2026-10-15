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

/* Home: scroll-driven sections (pinned "What I change", lateral "Recent client work",
   marquee) and the contact light. Pinning is desktop-only and off for reduced motion;
   everywhere else the sections stay a normal static layout. */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var desktop = window.matchMedia("(min-width: 821px)");
  var change = document.querySelector('[data-pin="change"]');
  var work = document.querySelector('[data-pin="work"]');
  var marquees = Array.prototype.slice.call(document.querySelectorAll("[data-marquee]"));
  var spot = document.querySelector("[data-spot]");
  var queued = false;

  function clamp(v) {
    return Math.min(1, Math.max(0, v));
  }
  function progress(el) {
    var r = el.getBoundingClientRect();
    var span = r.height - window.innerHeight;
    return span > 0 ? clamp(-r.top / span) : 0;
  }

  var steps = change ? Array.prototype.slice.call(change.querySelectorAll("[data-step]")) : [];
  var track = work ? work.querySelector(".hm-work-track") : null;
  var viewport = work ? work.querySelector(".hm-work-viewport") : null;
  var pinned = false;
  var overflow = 0;
  var activeStep = -1;

  function layout() {
    var on = !reduce && desktop.matches;
    if (on === pinned && !on) return;
    pinned = on;
    [change, work].forEach(function (el) {
      if (el) el.classList.toggle("is-pinned", on);
    });
    if (work) {
      work.style.height = "";
      if (on) {
        var padL = parseFloat(window.getComputedStyle(viewport).paddingLeft) || 0;
        overflow = Math.max(0, track.scrollWidth + padL + 24 - viewport.clientWidth);
        work.style.height = window.innerHeight + overflow * 1.1 + "px";
      } else {
        track.style.transform = "";
      }
    }
  }

  function update() {
    queued = false;
    if (pinned && change) {
      var p = progress(change);
      change.style.setProperty("--p", p.toFixed(3));
      var idx = Math.min(steps.length / 2 - 1, Math.floor(p * (steps.length / 2)));
      if (idx !== activeStep) {
        activeStep = idx;
        steps.forEach(function (el) {
          el.classList.toggle("is-active", Number(el.dataset.step) === idx);
        });
      }
    }
    if (pinned && work) {
      var q = progress(work);
      work.style.setProperty("--p", q.toFixed(3));
      track.style.transform = "translate3d(" + (-q * overflow).toFixed(1) + "px,0,0)";
    }
    if (!reduce) {
      for (var i = 0; i < marquees.length; i++) {
        var host = marquees[i].parentElement.getBoundingClientRect();
        var dir = Number(marquees[i].dataset.marquee);
        var x = (host.top - window.innerHeight * 0.5) * 0.55 * dir - 600;
        marquees[i].style.setProperty("--mx", x.toFixed(1) + "px");
      }
    }
  }
  function schedule() {
    if (!queued) {
      queued = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", function () {
    layout();
    schedule();
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { layout(); schedule(); });
  if (spot && !reduce) {
    spot.addEventListener("pointermove", function (e) {
      var r = spot.getBoundingClientRect();
      spot.style.setProperty("--mx", (e.clientX - r.left).toFixed(0) + "px");
      spot.style.setProperty("--my", (e.clientY - r.top).toFixed(0) + "px");
    });
  }
  layout();
  update();
})();
