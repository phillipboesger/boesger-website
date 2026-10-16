/* Visual explainer for this project site: shape and flow only, drawn on canvas.
   Each canvas runs only while visible and shows one calm frame for reduced motion. */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var C = { cyan: "#62d6ff", blue: "#6aa9ff", warm: "#ffc266", mint: "#7be0b0", coral: "#ff8fa3", ice: "#bdeeff" };
  var TAU = Math.PI * 2;
  function rgba(hex, a) {
    var n = parseInt(hex.slice(1), 16);
    return "rgba(" + (n >> 16) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a.toFixed(3) + ")";
  }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function ease(t) { return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  var MONO = "600 11px 'Geist Mono', ui-monospace, Menlo, monospace";
  function stage(canvas, init, draw) {
    var ctx = canvas.getContext("2d");
    var w = 0, h = 0, visible = false, raf = 0, last = 0, t0 = 0, state = null;
    function size() {
      var r = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      state = init(w, h, state);
      if (reduce || !visible) frame(performance.now(), true);
    }
    function frame(now, still) {
      if (!t0) t0 = now;
      var t = reduce ? 40 : (now - t0) / 1000;
      var dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016);
      last = now;
      ctx.clearRect(0, 0, w, h);
      draw(ctx, w, h, t, dt, state, reduce || still);
      if (!reduce && visible && !still) raf = requestAnimationFrame(function (n) { frame(n, false); });
    }
    if ("ResizeObserver" in window) new ResizeObserver(size).observe(canvas);
    else window.addEventListener("resize", size);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        cancelAnimationFrame(raf);
        last = 0;
        if (visible && !reduce) raf = requestAnimationFrame(function (n) { frame(n, false); });
      }).observe(canvas);
    } else {
      visible = true;
      if (!reduce) raf = requestAnimationFrame(function (n) { frame(n, false); });
    }
    size();
  }
  function bez(p0, p1, p2, p3, u) {
    var m = 1 - u;
    return m * m * m * p0 + 3 * m * m * u * p1 + 3 * m * u * u * p2 + u * u * u * p3;
  }
  var q = function (id) { return document.getElementById(id); };
  /* Hero: four sources flow into one timeline on the phone. Everything stays inside the dashed boundary. */
  function heroBoard(canvas) {
    var src = [["Reminders", C.warm], ["Calendar", C.cyan], ["Journal", C.mint], ["Notes", C.coral]];
    var SLOTS = 6;
    var slotSrc = [0, 1, 0, 2, 1, 3];
    var packets = [], filled = [], spawn = 0, hold = 0;
    return stage(canvas, function () { return {}; }, function (ctx, w, h, t, dt, s, still) {
      var pad = 14;
      var pw = Math.min(w * 0.36, 190), ph = h * 0.72, px = w - pw - w * 0.1, py = h * 0.17;
      var pillW = Math.min(w * 0.3, 118), pillX = w * 0.07;
      function sy(i) { return h * (0.24 + i * 0.17); }
      function slotY(k) { return py + 52 + k * ((ph - 76) / SLOTS); }
      if (still) { filled = []; for (var f = 0; f < SLOTS; f++) filled.push(f); }
      else if (filled.length >= SLOTS) { hold += dt; if (hold > 2.6) { filled = []; hold = 0; } }
      else {
        spawn -= dt;
        if (spawn <= 0) {
          spawn = 0.75;
          var free = [];
          for (var k = 0; k < SLOTS; k++) if (filled.indexOf(k) < 0 && !packets.some(function (p) { return p.k === k; })) free.push(k);
          if (free.length) { var kk = free[Math.floor(Math.random() * free.length)]; packets.push({ k: kk, i: slotSrc[kk], u: 0 }); }
        }
      }
      // on-device boundary
      ctx.setLineDash([6, 6]); ctx.strokeStyle = rgba(C.ice, 0.45); ctx.lineWidth = 1.4;
      roundRect(ctx, pad, pad, w - pad * 2, h - pad * 2, 24); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = MONO; ctx.textAlign = "left"; ctx.fillStyle = rgba(C.ice, 0.85);
      ctx.fillText("STAYS ON YOUR IPHONE", pad + 16, pad + 22);
      // blocked cloud
      var cx0 = w - 64, cy0 = h - 42;
      ctx.strokeStyle = "rgba(255,255,255,0.28)"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.arc(cx0 - 10, cy0, 9, Math.PI * 0.5, Math.PI * 1.5); ctx.arc(cx0 + 2, cy0 - 7, 11, Math.PI, 0); ctx.arc(cx0 + 14, cy0, 8, Math.PI * 1.5, Math.PI * 0.5); ctx.closePath(); ctx.stroke();
      ctx.strokeStyle = rgba(C.coral, 0.9); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx0 - 20, cy0 + 14); ctx.lineTo(cx0 + 24, cy0 - 18); ctx.stroke();
      // phone
      ctx.fillStyle = "rgba(11,42,76,0.85)"; roundRect(ctx, px, py, pw, ph, 22); ctx.fill();
      ctx.strokeStyle = rgba(C.ice, 0.7); ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.14)"; roundRect(ctx, px + pw / 2 - 20, py + 10, 40, 6, 3); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.textAlign = "left"; ctx.font = "700 13px 'Geist', system-ui, sans-serif";
      ctx.fillText("Today", px + 16, py + 40);
      ctx.strokeStyle = rgba(C.ice, 0.22); ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.moveTo(px + 22, slotY(0) - 6); ctx.lineTo(px + 22, slotY(SLOTS - 1) + 26); ctx.stroke();
      for (var a = 0; a < SLOTS; a++) {
        var col = src[slotSrc[a]][1], on = filled.indexOf(a) >= 0;
        var yy = slotY(a);
        ctx.fillStyle = on ? col : "rgba(255,255,255,0.18)";
        ctx.beginPath(); ctx.arc(px + 22, yy + 10, on ? 4.5 : 3, 0, TAU); ctx.fill();
        ctx.fillStyle = on ? rgba(col, 0.22) : "rgba(255,255,255,0.05)";
        roundRect(ctx, px + 36, yy, pw - 52, 22, 7); ctx.fill();
        if (on) { ctx.strokeStyle = rgba(col, 0.85); ctx.lineWidth = 1.2; ctx.stroke(); ctx.fillStyle = rgba(col, 0.55); ctx.fillRect(px + 46, yy + 8, (pw - 52) * (0.35 + (a % 3) * 0.14), 5); }
      }
      // sources
      ctx.font = MONO;
      for (var i = 0; i < 4; i++) {
        ctx.fillStyle = "rgba(11,42,76,0.9)"; roundRect(ctx, pillX, sy(i) - 14, pillW, 28, 14); ctx.fill();
        ctx.strokeStyle = rgba(src[i][1], 0.9); ctx.lineWidth = 1.3; ctx.stroke();
        ctx.fillStyle = "#fff"; ctx.textAlign = "center";
        ctx.fillText(src[i][0].toUpperCase(), pillX + pillW / 2, sy(i) + 4);
      }
      // packets
      for (var q2 = packets.length - 1; q2 >= 0; q2--) {
        var pk = packets[q2]; pk.u += dt * 0.7;
        if (pk.u >= 1) { filled.push(pk.k); packets.splice(q2, 1); continue; }
        var x0 = pillX + pillW, y0 = sy(pk.i), x1 = px + 36, y1 = slotY(pk.k) + 11, u = ease(pk.u);
        var x = bez(x0, x0 + (x1 - x0) * 0.55, x1 - (x1 - x0) * 0.4, x1, u);
        var y = bez(y0, y0, y1, y1, u);
        var c2 = src[pk.i][1];
        ctx.strokeStyle = rgba(c2, 0.18); ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.bezierCurveTo(x0 + (x1 - x0) * 0.55, y0, x1 - (x1 - x0) * 0.4, y1, x1, y1); ctx.stroke();
        ctx.fillStyle = c2; ctx.shadowColor = c2; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(x, y, 3.8, 0, TAU); ctx.fill(); ctx.shadowBlur = 0;
      }
    });
  }

  /* "dentist tomorrow 10am" becomes a real reminder. */
  function typeReminder(root) {
    var text = "dentist tomorrow 10am", field = root.querySelector("[data-field]");
    function show(n) { field.firstChild.nodeValue = text.slice(0, n); }
    if (reduce) { show(text.length); root.classList.add("is-done"); return; }
    var n = 0, phase = 0, timer = null, visible = false;
    function tick() {
      if (!visible) { timer = null; return; }
      if (phase === 0) { n++; show(n); if (n >= text.length) { phase = 1; timer = setTimeout(tick, 500); return; } timer = setTimeout(tick, 70 + Math.random() * 60); }
      else if (phase === 1) { root.classList.add("is-done"); phase = 2; timer = setTimeout(tick, 3200); }
      else { root.classList.remove("is-done"); n = 0; show(0); phase = 0; timer = setTimeout(tick, 700); }
    }
    show(0);
    if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible && !timer) timer = setTimeout(tick, 400); }).observe(root);
  }
  if (q("db-hero")) heroBoard(q("db-hero"));
  var td = document.querySelector("[data-typing]");
  if (td) typeReminder(td);
})();
