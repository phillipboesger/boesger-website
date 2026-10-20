/* Second Brain: five small visualizations of the shape of the system.
   Shape only: no real content, names or counts. Each canvas runs only while visible,
   and renders one calm final frame when the visitor prefers reduced motion. */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var C = { cyan: "#62d6ff", blue: "#6aa9ff", warm: "#ffc266", mint: "#7be0b0", coral: "#ff8fa3", ice: "#bdeeff" };
  var TAU = Math.PI * 2;

  function rgba(hex, a) {
    var n = parseInt(hex.slice(1), 16);
    return "rgba(" + (n >> 16) + "," + ((n >> 8) & 255) + "," + (n & 255) + "," + a.toFixed(3) + ")";
  }
  function clamp(v, a, b) {
    return Math.min(b, Math.max(a, v));
  }
  function ease(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }
  // Seeded random so every visitor sees the same shape.
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
  function gauss(r) {
    return (r() + r() + r() + r() - 2) * 0.9;
  }

  // Sizes the canvas to its box, keeps a crisp DPR, and drives draw(ctx, w, h, t, dt).
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
    return { canvas: canvas, get state() { return state; } };
  }

  /* ── 1. The brain: a point cloud in sections, with links, questions, jobs and growth ── */
  function brain(canvas) {
    var names = [
      ["Notes", C.cyan],
      ["Documents", C.blue],
      ["Mail", C.warm],
      ["Calendar", C.mint],
      ["Web", C.coral],
      ["Code", C.ice]
    ];
    var R = rng(7);
    var centers = names.map(function (_, i) {
      var y = 1 - (i + 0.5) * (2 / names.length);
      var r = Math.sqrt(1 - y * y);
      var a = i * 2.399963;
      return [Math.cos(a) * r * 0.7, y * 0.7, Math.sin(a) * r * 0.7];
    });
    var nodes = [];
    var PER = 82;
    names.forEach(function (_, c) {
      for (var i = 0; i < PER; i++) {
        nodes.push({
          c: c,
          x: centers[c][0] + gauss(R) * 0.26,
          y: centers[c][1] + gauss(R) * 0.26,
          z: centers[c][2] + gauss(R) * 0.26,
          birth: i < 56 ? -1 : 1 + (i - 56) * 1.1 + c * 0.35,
          lit: 0,
          dist: -1
        });
      }
    });
    var edges = [];
    var adj = nodes.map(function () { return []; });
    function link(a, b) {
      edges.push([a, b]);
      adj[a].push(b);
      adj[b].push(a);
    }
    nodes.forEach(function (n, i) {
      var best = [];
      for (var j = 0; j < nodes.length; j++) {
        if (j === i) continue;
        var m = nodes[j];
        var d = (n.x - m.x) * (n.x - m.x) + (n.y - m.y) * (n.y - m.y) + (n.z - m.z) * (n.z - m.z);
        best.push([d, j]);
      }
      best.sort(function (p, q) { return p[0] - q[0]; });
      for (var k = 0; k < 2; k++) if (best[k][1] > i || k === 0) if (adj[i].indexOf(best[k][1]) < 0) link(i, best[k][1]);
    });
    // bridges: sections are linked to each other
    for (var c = 0; c < names.length; c++) {
      for (var o = c + 1; o < names.length; o++) {
        if ((c + o) % 2 === 1 || o === c + 1) {
          var bi = -1, bj = -1, bd = 9;
          for (var a = c * PER; a < c * PER + 56; a++)
            for (var b = o * PER; b < o * PER + 56; b++) {
              var d = Math.pow(nodes[a].x - nodes[b].x, 2) + Math.pow(nodes[a].y - nodes[b].y, 2) + Math.pow(nodes[a].z - nodes[b].z, 2);
              if (d < bd) { bd = d; bi = a; bj = b; }
            }
          if (bi >= 0) link(bi, bj);
        }
      }
    }
    var agents = [0, 1, 2].map(function (i) {
      return { at: i * 2 * PER + 3, to: -1, p: 0, speed: 0.9 + i * 0.25, trail: [] };
    });
    var wave = null;
    var ptr = { x: 0, y: 0, in: false, px: -999, py: -999 };
    var proj = [];
    var lastAuto = 0;

    function startWave(i, t) {
      var dist = nodes.map(function () { return -1; });
      var q = [i];
      dist[i] = 0;
      for (var h = 0; h < q.length; h++)
        adj[q[h]].forEach(function (nb) {
          if (dist[nb] < 0) { dist[nb] = dist[q[h]] + 1; q.push(nb); }
        });
      nodes.forEach(function (n, k) { n.dist = dist[k]; });
      wave = { t0: t, from: i };
    }

    canvas.addEventListener("pointermove", function (e) {
      var r = canvas.getBoundingClientRect();
      ptr.px = e.clientX - r.left;
      ptr.py = e.clientY - r.top;
      ptr.x = (ptr.px / r.width - 0.5) * 2;
      ptr.y = (ptr.py / r.height - 0.5) * 2;
      ptr.in = true;
    });
    canvas.addEventListener("pointerleave", function () { ptr.in = false; ptr.px = -999; });
    var clickT = null;
    canvas.addEventListener("pointerdown", function (e) {
      var r = canvas.getBoundingClientRect();
      clickT = { x: e.clientX - r.left, y: e.clientY - r.top };
    });

    return stage(canvas, function () { return {}; }, function (ctx, w, h, t, dt, s, still) {
      var yaw = still ? 0.6 : t * 0.1 + ptr.x * 0.5;
      var pitch = still ? -0.25 : -0.2 + ptr.y * 0.25;
      var cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
      var scale = Math.min(w * 0.5, h * 0.56);
      var ox = w * (w > 760 ? 0.62 : 0.5), oy = h * (w > 760 ? 0.5 : 0.36);

      if (clickT) {
        var bestI = 0, bestD = 1e9;
        proj.forEach(function (p, i) {
          if (!p) return;
          var d = (p.sx - clickT.x) * (p.sx - clickT.x) + (p.sy - clickT.y) * (p.sy - clickT.y);
          if (d < bestD) { bestD = d; bestI = i; }
        });
        startWave(bestI, t);
        lastAuto = t;
        clickT = null;
      }
      if (!still && (!wave || t - lastAuto > 7)) {
        startWave(Math.floor(Math.random() * nodes.length * 0.7), t);
        lastAuto = t;
      }
      if (still && !wave) {
        startWave(2 * PER + 10, 0);
        wave.t0 = -3;
      }

      // project
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var age = still ? 99 : t - n.birth;
        if (n.birth > 0 && age < 0) { proj[i] = null; continue; }
        var x1 = n.x * cy + n.z * sy, z1 = -n.x * sy + n.z * cy;
        var y1 = n.y * cp - z1 * sp, z2 = n.y * sp + z1 * cp;
        var f = 2.6 / (2.6 + z2);
        var grow = n.birth > 0 ? ease(clamp(age / 1.2, 0, 1)) : 1;
        proj[i] = { sx: ox + x1 * scale * f, sy: oy + y1 * scale * f, z: z2, f: f, grow: grow };
      }
      // wave
      var front = wave ? (t - wave.t0) * 9 : -1;
      nodes.forEach(function (n, k) {
        var target = 0;
        if (wave && n.dist >= 0 && n.dist <= front) target = clamp(1 - (front - n.dist) / 7, 0, 1);
        var hov = 0;
        if (proj[k] && ptr.in) {
          var dx = proj[k].sx - ptr.px, dy = proj[k].sy - ptr.py;
          hov = clamp(1 - Math.sqrt(dx * dx + dy * dy) / 90, 0, 1) * 0.7;
        }
        n.lit = Math.max(target, hov, n.lit - dt * 1.4);
      });
      // agents: hop between linked nodes, so they cross sections
      agents.forEach(function (a) {
        if (still) return;
        if (a.to < 0) {
          var opts = adj[a.at].filter(function (k) { return proj[k]; });
          if (!opts.length) return;
          a.to = opts[Math.floor(Math.random() * opts.length)];
          a.p = 0;
        }
        a.p += dt * a.speed * 1.4;
        if (a.p >= 1) {
          a.at = a.to;
          a.to = -1;
          nodes[a.at].lit = 1;
        }
        var A = proj[a.at], B = a.to >= 0 ? proj[a.to] : A;
        if (A && B) {
          a.x = A.sx + (B.sx - A.sx) * Math.min(a.p, 1);
          a.y = A.sy + (B.sy - A.sy) * Math.min(a.p, 1);
          a.trail.push([a.x, a.y]);
          if (a.trail.length > 22) a.trail.shift();
        }
      });

      // section halos give each section a body
      centers.forEach(function (c, i) {
        var x1 = c[0] * cy + c[2] * sy, z1 = -c[0] * sy + c[2] * cy;
        var y1 = c[1] * cp - z1 * sp, z2 = c[1] * sp + z1 * cp;
        var f = 2.6 / (2.6 + z2);
        var rad = 0.5 * scale * f;
        var g = ctx.createRadialGradient(ox + x1 * scale * f, oy + y1 * scale * f, 0, ox + x1 * scale * f, oy + y1 * scale * f, rad);
        g.addColorStop(0, rgba(names[i][1], 0.2 * clamp(1 - z2 * 0.4, 0.4, 1)));
        g.addColorStop(1, rgba(names[i][1], 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(ox + x1 * scale * f, oy + y1 * scale * f, rad, 0, TAU);
        ctx.fill();
      });
      // edges
      ctx.lineWidth = 1;
      for (var e = 0; e < edges.length; e++) {
        var p = proj[edges[e][0]], q = proj[edges[e][1]];
        if (!p || !q) continue;
        var lit = Math.min(nodes[edges[e][0]].lit, nodes[edges[e][1]].lit);
        var depth = clamp(1 - (p.z + q.z) * 0.25, 0.25, 1);
        var cc = names[nodes[edges[e][0]].c][1];
        ctx.strokeStyle = lit > 0.05 ? rgba(C.ice, 0.15 + lit * 0.7) : rgba(cc, 0.26 * depth * Math.min(p.grow, q.grow));
        ctx.lineWidth = lit > 0.05 ? 1 + lit : 1;
        ctx.beginPath();
        ctx.moveTo(p.sx, p.sy);
        ctx.lineTo(q.sx, q.sy);
        ctx.stroke();
      }
      // nodes, far to near
      var order = [];
      for (var k = 0; k < nodes.length; k++) if (proj[k]) order.push(k);
      order.sort(function (a, b) { return proj[b].z - proj[a].z; });
      order.forEach(function (k) {
        var p = proj[k], n = nodes[k];
        var depth = clamp(1 - p.z * 0.45, 0.3, 1);
        var col = names[n.c][1];
        var r = (2.2 + n.lit * 2.6) * p.f * p.grow;
        if (n.lit > 0.05) {
          ctx.fillStyle = rgba(col, 0.18 * n.lit);
          ctx.beginPath();
          ctx.arc(p.sx, p.sy, r * 4.2, 0, TAU);
          ctx.fill();
        }
        ctx.fillStyle = rgba(n.lit > 0.4 ? C.ice : col, (0.7 + n.lit * 0.3) * depth);
        ctx.beginPath();
        ctx.arc(p.sx, p.sy, Math.max(0.4, r), 0, TAU);
        ctx.fill();
      });
      // agents
      agents.forEach(function (a) {
        if (!a.trail.length) return;
        ctx.lineWidth = 2;
        for (var i2 = 1; i2 < a.trail.length; i2++) {
          ctx.strokeStyle = rgba(C.warm, (i2 / a.trail.length) * 0.7);
          ctx.beginPath();
          ctx.moveTo(a.trail[i2 - 1][0], a.trail[i2 - 1][1]);
          ctx.lineTo(a.trail[i2][0], a.trail[i2][1]);
          ctx.stroke();
        }
        ctx.save();
        ctx.translate(a.x, a.y);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = C.warm;
        ctx.shadowColor = C.warm;
        ctx.shadowBlur = 12;
        ctx.fillRect(-3.5, -3.5, 7, 7);
        ctx.restore();
      });
      // section labels (front side only)
      ctx.font = "600 " + (w < 440 ? 10 : 11) + "px 'Geist Mono', ui-monospace, Menlo, monospace";
      ctx.textAlign = "center";
      var labels = [];
      centers.forEach(function (c, i) {
        var x1 = c[0] * cy + c[2] * sy, z1 = -c[0] * sy + c[2] * cy;
        var y1 = c[1] * cp - z1 * sp, z2 = c[1] * sp + z1 * cp;
        var f = 2.6 / (2.6 + z2);
        var a = clamp(0.9 - z2 * 0.9, 0, 0.95);
        if (a < 0.08) return;
        var text = names[i][0].toUpperCase();
        labels.push({ i: i, a: a, text: text, hw: ctx.measureText(text).width / 2 + 3, x: ox + x1 * scale * f, y: oy + y1 * scale * f - 0.42 * scale * f });
      });
      // Push overlapping labels apart vertically so rotating clusters never stack their names.
      var lineH = w < 440 ? 13 : 14;
      labels.sort(function (p, q) { return p.y - q.y; });
      labels.forEach(function (l, k) {
        for (var j = 0; j < k; j++) {
          var o = labels[j];
          if (Math.abs(l.x - o.x) < l.hw + o.hw && l.y - o.y < lineH) l.y = o.y + lineH;
        }
        ctx.fillStyle = rgba(names[l.i][1], l.a);
        ctx.fillText(l.text, l.x, l.y);
      });
    });
  }

  /* ── 2. Everything becomes a vector ── */
  function vectors(canvas) {
    var cols = [C.cyan, C.blue, C.warm, C.mint];
    return stage(
      canvas,
      function (w, h, old) {
        return { items: old ? old.items : [], dots: old ? old.dots : [], spawn: 0, R: old ? old.R : rng(3) };
      },
      function (ctx, w, h, t, dt, s, still) {
        var gate = w * 0.4;
        if (still && !s.seeded) {
          s.seeded = true;
          for (var i = 0; i < 70; i++) addDot(s, w, h, cols, i % 4);
        }
        if (!still) {
          s.spawn -= dt;
          if (s.spawn <= 0) {
            s.spawn = 0.55;
            s.items.push({ x: -40, y: h * (0.2 + s.R() * 0.6), c: Math.floor(s.R() * 4), a: 0 });
          }
        }
        // gate
        var g = ctx.createLinearGradient(gate - 18, 0, gate + 18, 0);
        g.addColorStop(0, "rgba(98,214,255,0)");
        g.addColorStop(0.5, "rgba(98,214,255,0.35)");
        g.addColorStop(1, "rgba(98,214,255,0)");
        ctx.fillStyle = g;
        ctx.fillRect(gate - 18, h * 0.08, 36, h * 0.84);
        ctx.strokeStyle = rgba(C.ice, 0.8);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(gate, h * 0.08);
        ctx.lineTo(gate, h * 0.92);
        ctx.stroke();
        ctx.font = "600 11px 'Geist Mono', ui-monospace, monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = rgba(C.ice, 0.7);
        ctx.fillText("EMBED", gate, h * 0.06);
        ctx.fillStyle = "rgba(195,222,245,0.55)";
        ctx.fillText("THINGS", gate * 0.5, h * 0.96);
        ctx.fillText("VECTORS", gate + (w - gate) * 0.5, h * 0.96);
        // items
        for (var k = s.items.length - 1; k >= 0; k--) {
          var it = s.items[k];
          it.x += dt * Math.max(70, w * 0.12);
          if (it.x >= gate) {
            s.items.splice(k, 1);
            addDot(s, w, h, cols, it.c, gate, it.y);
            continue;
          }
          var ww = 54, hh = 36;
          ctx.fillStyle = "rgba(16,54,92,0.85)";
          ctx.strokeStyle = rgba(cols[it.c], 0.7);
          ctx.lineWidth = 1.2;
          roundRect(ctx, it.x - ww / 2, it.y - hh / 2, ww, hh, 7);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = rgba(cols[it.c], 0.55);
          for (var l = 0; l < 3; l++) ctx.fillRect(it.x - 18, it.y - 9 + l * 8, l === 2 ? 20 : 34, 3);
        }
        // dots
        s.dots.forEach(function (d) {
          d.x += (d.tx - d.x) * Math.min(1, dt * 3);
          d.y += (d.ty - d.y) * Math.min(1, dt * 3);
          d.age += dt;
        });
        ctx.lineWidth = 1;
        for (var a = 0; a < s.dots.length; a++) {
          for (var b = a + 1; b < s.dots.length; b++) {
            var A = s.dots[a], B = s.dots[b];
            if (A.c !== B.c) continue;
            var dd = Math.hypot(A.tx - B.tx, A.ty - B.ty);
            if (dd < 46) {
              ctx.strokeStyle = rgba(cols[A.c], 0.2);
              ctx.beginPath();
              ctx.moveTo(A.x, A.y);
              ctx.lineTo(B.x, B.y);
              ctx.stroke();
            }
          }
        }
        s.dots.forEach(function (d) {
          ctx.fillStyle = rgba(cols[d.c], 0.9);
          ctx.beginPath();
          ctx.arc(d.x, d.y, 3.2, 0, TAU);
          ctx.fill();
        });
        if (s.dots.length > 80) s.dots.shift();
      }
    );
    function addDot(s, w, h, cols, c, x, y) {
      var cx = [0.6, 0.84, 0.64, 0.86][c] * w;
      var cy = [0.32, 0.36, 0.68, 0.7][c] * h;
      s.dots.push({ c: c, x: x || cx, y: y || cy, tx: cx + gauss(s.R) * w * 0.07, ty: cy + gauss(s.R) * h * 0.1, age: 0 });
    }
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

  /* ── 3. Sections that talk to each other ── */
  function sections(canvas, chips) {
    var cols = [C.cyan, C.blue, C.warm, C.mint, C.coral, C.ice];
    var labels = ["Notes", "Documents", "Mail", "Calendar", "Web", "Code"];
    var hi = -1;
    var R = rng(11);
    var seeds = [];
    for (var i = 0; i < 6; i++) {
      seeds.push([]);
      for (var j = 0; j < 14; j++) seeds[i].push([gauss(R), gauss(R), R() * TAU]);
    }
    function setHi(i) {
      hi = i;
      chips.forEach(function (c, k) { c.classList.toggle("is-on", k === i); });
    }
    chips.forEach(function (c, k) {
      c.addEventListener("pointerenter", function () { setHi(k); });
      c.addEventListener("focus", function () { setHi(k); });
      c.addEventListener("pointerleave", function () { setHi(-1); });
      c.addEventListener("blur", function () { setHi(-1); });
    });
    var pos = [];
    stage(canvas, function () { return {}; }, function (ctx, w, h, t, dt, s, still) {
      var cx = w / 2, cy = h / 2, rad = Math.min(w, h) * 0.34, rr = Math.min(w, h) * 0.13;
      for (var i = 0; i < 6; i++) {
        var a = -Math.PI / 2 + (i * TAU) / 6 + (still ? 0 : Math.sin(t * 0.3 + i) * 0.03);
        pos[i] = [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad * 0.9];
      }
      // links
      var pairs = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 3], [1, 4], [2, 5]];
      pairs.forEach(function (pr, idx) {
        var A = pos[pr[0]], B = pos[pr[1]];
        var on = hi < 0 || hi === pr[0] || hi === pr[1];
        ctx.strokeStyle = rgba(C.ice, on ? 0.28 : 0.07);
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(A[0], A[1]);
        ctx.quadraticCurveTo(cx + (A[0] + B[0] - 2 * cx) * 0.18, cy + (A[1] + B[1] - 2 * cy) * 0.18, B[0], B[1]);
        ctx.stroke();
        // packet
        var u = still ? 0.5 : (t * 0.22 + idx * 0.37) % 1;
        var qx = (1 - u) * (1 - u) * A[0] + 2 * (1 - u) * u * (cx + (A[0] + B[0] - 2 * cx) * 0.18) + u * u * B[0];
        var qy = (1 - u) * (1 - u) * A[1] + 2 * (1 - u) * u * (cy + (A[1] + B[1] - 2 * cy) * 0.18) + u * u * B[1];
        ctx.fillStyle = rgba(C.warm, on ? 0.95 : 0.25);
        ctx.beginPath();
        ctx.arc(qx, qy, 2.6, 0, TAU);
        ctx.fill();
      });
      // core
      var pulse = still ? 1 : 1 + Math.sin(t * 1.6) * 0.08;
      ctx.fillStyle = rgba(C.cyan, 0.12);
      ctx.beginPath();
      ctx.arc(cx, cy, rr * 0.9 * pulse, 0, TAU);
      ctx.fill();
      ctx.fillStyle = rgba(C.ice, 0.95);
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, TAU);
      ctx.fill();
      pos.forEach(function (p) {
        ctx.strokeStyle = rgba(C.cyan, 0.12);
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(p[0], p[1]);
        ctx.stroke();
      });
      // regions
      ctx.font = "600 11px 'Geist Mono', ui-monospace, monospace";
      ctx.textAlign = "center";
      for (var k = 0; k < 6; k++) {
        var on2 = hi < 0 || hi === k;
        ctx.fillStyle = rgba(cols[k], on2 ? (hi === k ? 0.2 : 0.1) : 0.04);
        ctx.beginPath();
        ctx.arc(pos[k][0], pos[k][1], rr * (hi === k ? 1.12 : 1), 0, TAU);
        ctx.fill();
        seeds[k].forEach(function (d) {
          var wob = still ? 0 : Math.sin(t * 0.8 + d[2]) * 1.5;
          ctx.fillStyle = rgba(cols[k], on2 ? 0.9 : 0.25);
          ctx.beginPath();
          ctx.arc(pos[k][0] + d[0] * rr * 0.6 + wob, pos[k][1] + d[1] * rr * 0.6 - wob, 2.2, 0, TAU);
          ctx.fill();
        });
        ctx.fillStyle = rgba(cols[k], on2 ? 0.95 : 0.35);
        var dx = pos[k][0] - cx, dy = pos[k][1] - cy, dl = Math.hypot(dx, dy) || 1;
        ctx.fillText(labels[k].toUpperCase(), pos[k][0] + (dx / dl) * rr * 0.2, pos[k][1] + (dy / dl) * (rr * 1.3) + 4);
      }
    });
    canvas.addEventListener("pointermove", function (e) {
      var r = canvas.getBoundingClientRect();
      var x = e.clientX - r.left, y = e.clientY - r.top, best = -1, bd = 1e9;
      pos.forEach(function (p, i) {
        var d = Math.hypot(p[0] - x, p[1] - y);
        if (d < bd) { bd = d; best = i; }
      });
      setHi(bd < Math.min(r.width, r.height) * 0.16 ? best : -1);
    });
    canvas.addEventListener("pointerleave", function () { setHi(-1); });
  }

  /* ── 4. It takes jobs off my plate ── */
  function jobs(canvas) {
    var ins = ["Idea", "Ticket", "Message", "Schedule"];
    var outs = [["Code", C.cyan], ["Docs", C.blue], ["Tests", C.mint], ["Drafts", C.warm]];
    return stage(canvas, function (w, h, old) {
      return { packets: old ? old.packets : [], spawn: 0, glow: old ? old.glow : [0, 0, 0, 0], R: old ? old.R : rng(5) };
    }, function (ctx, w, h, t, dt, s, still) {
      var narrow = w < 520;
      var xi = w * 0.1, xc = w * (narrow ? 0.4 : 0.46), xr = w * (narrow ? 0.56 : 0.64), xo = w * (narrow ? 0.72 : 0.9);
      function yIn(i) { return h * (0.2 + i * 0.2); }
      function yOut(i) { return h * (0.18 + i * 0.213); }
      if (!still) {
        s.spawn -= dt;
        if (s.spawn <= 0) {
          s.spawn = 0.7;
          s.packets.push({ i: Math.floor(s.R() * 4), o: Math.floor(s.R() * 4), u: 0 });
        }
      }
      // paths
      ctx.lineWidth = 1.2;
      for (var i = 0; i < 4; i++) {
        ctx.strokeStyle = rgba(C.ice, 0.14);
        ctx.beginPath();
        ctx.moveTo(xi, yIn(i));
        ctx.bezierCurveTo(xi + (xc - xi) * 0.6, yIn(i), xc - (xc - xi) * 0.5, h * 0.5, xc, h * 0.5);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(xc, h * 0.5);
        ctx.bezierCurveTo(xc + (xo - xc) * 0.5, h * 0.5, xo - (xo - xc) * 0.6, yOut(i), xo, yOut(i));
        ctx.stroke();
      }
      // review gate
      ctx.strokeStyle = rgba(C.warm, 0.7);
      ctx.setLineDash([4, 5]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(xr, h * 0.08);
      ctx.lineTo(xr, h * 0.9);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = "600 11px 'Geist Mono', ui-monospace, monospace";
      ctx.textAlign = "center";
      ctx.fillStyle = rgba(C.warm, 0.95);
      ctx.fillText("ME: REVIEW", xr, h * 0.05);
      // inputs
      ctx.textAlign = "left";
      for (var a = 0; a < 4; a++) {
        ctx.fillStyle = "rgba(16,54,92,0.9)";
        ctx.strokeStyle = rgba(C.ice, 0.5);
        ctx.beginPath();
        ctx.arc(xi, yIn(a), 7, 0, TAU);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "rgba(195,222,245,0.8)";
        ctx.fillText(ins[a].toUpperCase(), xi - 8, yIn(a) - 16);
      }
      // core
      var pulse = still ? 1 : 1 + Math.sin(t * 2) * 0.1;
      ctx.fillStyle = rgba(C.cyan, 0.14);
      ctx.beginPath();
      ctx.arc(xc, h * 0.5, 34 * pulse, 0, TAU);
      ctx.fill();
      ctx.fillStyle = C.ice;
      ctx.beginPath();
      ctx.arc(xc, h * 0.5, 9, 0, TAU);
      ctx.fill();
      // packets
      function bez(p0, p1, p2, p3, u) {
        var m = 1 - u;
        return m * m * m * p0 + 3 * m * m * u * p1 + 3 * m * u * u * p2 + u * u * u * p3;
      }
      for (var k = s.packets.length - 1; k >= 0; k--) {
        var pk = s.packets[k];
        pk.u += dt * 0.28;
        if (pk.u >= 2) {
          s.glow[pk.o] = 1;
          s.packets.splice(k, 1);
          continue;
        }
        var x, y, col;
        if (pk.u < 1) {
          x = bez(xi, xi + (xc - xi) * 0.6, xc - (xc - xi) * 0.5, xc, pk.u);
          y = bez(yIn(pk.i), yIn(pk.i), h * 0.5, h * 0.5, pk.u);
          col = C.ice;
        } else {
          var u2 = pk.u - 1;
          x = bez(xc, xc + (xo - xc) * 0.5, xo - (xo - xc) * 0.6, xo, u2);
          y = bez(h * 0.5, h * 0.5, yOut(pk.o), yOut(pk.o), u2);
          col = outs[pk.o][1];
        }
        ctx.fillStyle = col;
        ctx.shadowColor = col;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(x, y, 3.6, 0, TAU);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      // outputs
      ctx.textAlign = "right";
      for (var o = 0; o < 4; o++) {
        s.glow[o] = Math.max(0, s.glow[o] - dt * 1.2);
        if (still) s.glow[o] = 0.4;
        ctx.fillStyle = rgba(outs[o][1], 0.15 + s.glow[o] * 0.5);
        roundRect(ctx, xo - 4, yOut(o) - 15, Math.min(70, w - xo - 10), 30, 8);
        ctx.fill();
        ctx.strokeStyle = rgba(outs[o][1], 0.8);
        ctx.stroke();
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText(outs[o][0].toUpperCase(), xo - 4 + Math.min(70, w - xo - 10) / 2, yOut(o) + 4);
      }
    });
  }

  /* ── 5. It grows with me and stays behind me ── */
  function ahead(canvas) {
    function sm(x, c, k) {
      return 1 / (1 + Math.exp(-(x - c) * k));
    }
    function me(x) {
      return 0.1 + 0.2 * sm(x, 0.16, 18) + 0.22 * sm(x, 0.4, 18) + 0.26 * sm(x, 0.62, 18) + 0.16 * sm(x, 0.84, 18) + x * 0.05;
    }
    function brainY(x) {
      return Math.max(0.06, me(x - 0.09) * 0.93 - 0.02);
    }
    stage(canvas, function () { return {}; }, function (ctx, w, h, t, dt, s, still) {
      var L = w * 0.06, Rr = w * 0.88, T = h * 0.1, B = h * 0.84;
      function X(x) { return L + x * (Rr - L); }
      function Y(v) { return B - v * (B - T) / 1.0; }
      var cycle = 11;
      var u = still ? 1 : (t % cycle) / 7;
      var p = ease(clamp(u, 0, 1));
      // axes
      ctx.strokeStyle = "rgba(195,222,245,0.3)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(L, T - 6);
      ctx.lineTo(L, B);
      ctx.lineTo(w * 0.95, B);
      ctx.stroke();
      ctx.font = "600 11px 'Geist Mono', ui-monospace, monospace";
      ctx.fillStyle = "rgba(195,222,245,0.6)";
      ctx.textAlign = "left";
      ctx.fillText("KNOW-HOW", L + 6, T - 4);
      ctx.textAlign = "right";
      ctx.fillText("TIME", w * 0.95, B + 18);
      // curves
      function curve(fn, col, width, upto) {
        ctx.strokeStyle = col;
        ctx.lineWidth = width;
        ctx.beginPath();
        for (var x = 0; x <= upto + 1e-6; x += 0.004) {
          var px = X(x), py = Y(fn(x));
          if (x === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      ctx.shadowColor = C.cyan;
      ctx.shadowBlur = 10;
      curve(brainY, C.cyan, 3, p);
      ctx.shadowBlur = 0;
      curve(me, C.warm, 3, p);
      // growth nodes along the brain curve
      for (var i = 0; i < 26; i++) {
        var x = i / 25;
        if (x > p) break;
        ctx.fillStyle = rgba(C.cyan, 0.75);
        ctx.beginPath();
        ctx.arc(X(x), Y(brainY(x)), 2 + (i % 3), 0, TAU);
        ctx.fill();
      }
      // head start bracket
      var xe = clamp(p, 0.02, 1);
      var ya = Y(me(xe)), yb = Y(brainY(xe));
      ctx.strokeStyle = rgba(C.ice, 0.8);
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.moveTo(X(xe) + 8, ya);
      ctx.lineTo(X(xe) + 8, yb);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.textAlign = "left";
      ctx.fillStyle = rgba(C.ice, 0.95);
      if (p > 0.15) ctx.fillText("HEAD START", Math.min(X(xe) + 16, w - 92), (ya + yb) / 2 + 4);
      // heads
      ctx.fillStyle = C.warm;
      ctx.beginPath();
      ctx.arc(X(xe), ya, 5.5, 0, TAU);
      ctx.fill();
      ctx.fillStyle = C.cyan;
      ctx.beginPath();
      ctx.arc(X(xe), yb, 5, 0, TAU);
      ctx.fill();
      ctx.textAlign = "left";
      ctx.fillStyle = C.warm;
      ctx.fillText("ME", X(0.02), Y(me(0.02)) - 16);
      ctx.fillStyle = C.cyan;
      ctx.fillText("SECOND BRAIN", X(0.02), Y(brainY(0.02)) + 22);
    });
  }

  var q = function (id) { return document.getElementById(id); };
  if (reduce) {
    var hint = document.querySelector(".sb-hint");
    if (hint) hint.hidden = true;
  }
  if (q("sb-brain")) brain(q("sb-brain"));
  if (q("sb-vec")) vectors(q("sb-vec"));
  if (q("sb-map")) sections(q("sb-map"), Array.prototype.slice.call(document.querySelectorAll("[data-sb-chip]")));
  if (q("sb-jobs")) jobs(q("sb-jobs"));
  if (q("sb-ahead")) ahead(q("sb-ahead"));
})();
