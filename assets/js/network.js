/* Background: a small neural network. Layers of nodes, weighted connections, and signals
   that travel from input to output and light up the nodes they pass. It reacts to scroll
   (layers drift, more signals while you scroll) and to the pointer (nearby nodes light up).
   Static frame for reduced motion, paused when the tab is hidden. */
(function () {
  var canvas = document.getElementById("network-canvas");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  var ACC = "130,222,255";
  var WARM = "255,194,102";

  var W = 0;
  var H = 0;
  var layers = [];
  var pulses = [];
  var last = 0;
  var sy = 0;
  var sv = 0;
  var mouse = { x: -9999, y: -9999 };

  function rnd(a, b) {
    return a + Math.random() * (b - a);
  }

  function build() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    var cols = Math.max(4, Math.min(9, Math.round(W / 190)));
    var tall = H > 700 ? 6 : 4;
    layers = [];
    for (var c = 0; c < cols; c++) {
      var u = c / (cols - 1);
      var shape = Math.sin(Math.PI * (0.12 + 0.76 * u));
      var count = Math.round(4 + shape * tall);
      var layer = [];
      for (var i = 0; i < count; i++) {
        var by = (H * (i + 0.5 + rnd(-0.28, 0.28))) / count;
        var bx = W * (0.03 + 0.94 * u) + rnd(-18, 18);
        layer.push({ bx: bx, by: by, x: bx, y: by, ph: rnd(0, 6.28), a: 0, r: rnd(2, 3.3), l: c, out: [] });
      }
      layers.push(layer);
    }
    for (var l = 0; l < cols - 1; l++) {
      for (var n = 0; n < layers[l].length; n++) {
        var node = layers[l][n];
        var next = layers[l + 1].slice().sort(function (p, q) {
          return Math.abs(p.by - node.by) - Math.abs(q.by - node.by);
        });
        var k = 2 + (Math.random() < 0.45 ? 1 : 0);
        for (var j = 0; j < k && j < next.length; j++) {
          node.out.push({ to: next[j], w: rnd(0.35, 1) });
        }
      }
    }
    pulses = [];
    if (reduce) draw(0);
  }

  function spawn() {
    var first = layers[0];
    var node = first[(Math.random() * first.length) | 0];
    var edge = node.out[(Math.random() * node.out.length) | 0];
    if (!edge) return;
    pulses.push({ from: node, edge: edge, p: 0, speed: rnd(0.35, 0.6), warm: Math.random() < 0.14 });
  }

  function place(t) {
    var off = sy / 900;
    for (var c = 0; c < layers.length; c++) {
      var dy = Math.sin(off + c * 0.9) * 22;
      for (var i = 0; i < layers[c].length; i++) {
        var n = layers[c][i];
        n.x = n.bx + Math.sin(t * 0.0004 + n.ph) * 6;
        n.y = n.by + Math.cos(t * 0.00035 + n.ph) * 7 + dy;
      }
    }
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);
    place(t);
    var c;
    var i;
    var e;
    var n;

    // connections
    ctx.lineWidth = 0.9;
    for (c = 0; c < layers.length - 1; c++) {
      for (i = 0; i < layers[c].length; i++) {
        n = layers[c][i];
        for (e = 0; e < n.out.length; e++) {
          var m = n.out[e].to;
          var al = 0.03 + 0.07 * n.out[e].w + 0.32 * Math.max(n.a, m.a) * n.out[e].w;
          ctx.strokeStyle = "rgba(" + ACC + "," + al.toFixed(3) + ")";
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(m.x, m.y);
          ctx.stroke();
        }
      }
    }

    // signals
    for (var p = 0; p < pulses.length; p++) {
      var s = pulses[p];
      var a = s.from;
      var b = s.edge.to;
      var x = a.x + (b.x - a.x) * s.p;
      var y = a.y + (b.y - a.y) * s.p;
      var tp = Math.max(0, s.p - 0.22);
      var tx = a.x + (b.x - a.x) * tp;
      var ty = a.y + (b.y - a.y) * tp;
      var col = s.warm ? WARM : ACC;
      var g = ctx.createLinearGradient(tx, ty, x, y);
      g.addColorStop(0, "rgba(" + col + ",0)");
      g.addColorStop(1, "rgba(" + col + ",0.9)");
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(x, y);
      ctx.stroke();
      var rg = ctx.createRadialGradient(x, y, 0, x, y, 8);
      rg.addColorStop(0, "rgba(" + col + ",0.7)");
      rg.addColorStop(1, "rgba(" + col + ",0)");
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(x, y, 8, 0, 6.2832);
      ctx.fill();
    }

    // nodes
    for (c = 0; c < layers.length; c++) {
      for (i = 0; i < layers[c].length; i++) {
        n = layers[c][i];
        var dx = n.x - mouse.x;
        var dy2 = n.y - mouse.y;
        var d = Math.sqrt(dx * dx + dy2 * dy2);
        if (d < 150) n.a = Math.max(n.a, (1 - d / 150) * 0.7);
        var rr = n.r + n.a * 1.8;
        var halo = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, rr * 5);
        halo.addColorStop(0, "rgba(" + ACC + "," + (0.12 + n.a * 0.4).toFixed(3) + ")");
        halo.addColorStop(1, "rgba(" + ACC + ",0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(n.x, n.y, rr * 5, 0, 6.2832);
        ctx.fill();
        ctx.fillStyle = "rgba(225,246,255," + (0.5 + n.a * 0.5).toFixed(3) + ")";
        ctx.beginPath();
        ctx.arc(n.x, n.y, rr, 0, 6.2832);
        ctx.fill();
      }
    }
  }

  function step(t) {
    var dt = Math.min(0.05, (t - last) / 1000 || 0.016);
    last = t;
    sv *= 0.92;
    var boost = 1 + Math.min(1.6, sv * 0.04);
    var target = 9 + Math.min(14, sv * 0.5);

    for (var p = pulses.length - 1; p >= 0; p--) {
      var s = pulses[p];
      s.p += s.speed * boost * dt;
      if (s.p >= 1) {
        var to = s.edge.to;
        to.a = 1;
        var nxt = to.out[(Math.random() * to.out.length) | 0];
        if (nxt) {
          s.from = to;
          s.edge = nxt;
          s.p = 0;
        } else {
          pulses.splice(p, 1);
        }
      }
    }
    while (pulses.length < target && Math.random() < 0.35) spawn();

    for (var c = 0; c < layers.length; c++) {
      for (var i = 0; i < layers[c].length; i++) layers[c][i].a *= 0.95;
    }
    draw(t);
  }

  function loop(t) {
    if (!document.hidden) step(t);
    window.requestAnimationFrame(loop);
  }

  window.addEventListener("resize", build);
  window.addEventListener(
    "scroll",
    function () {
      var y = window.scrollY;
      sv += Math.abs(y - sy);
      sy = y;
    },
    { passive: true }
  );
  window.addEventListener(
    "pointermove",
    function (e) {
      if (e.pointerType === "touch") return;
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    },
    { passive: true }
  );

  build();
  if (!reduce) window.requestAnimationFrame(loop);
})();
