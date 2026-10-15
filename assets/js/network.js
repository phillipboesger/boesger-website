(function () {
    var canvas = document.getElementById('network-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var NODE_COUNT = 90;
    var MAX_DIST = 140;
    var nodes = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function mkNode() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.28,
            vy: (Math.random() - 0.5) * 0.28,
            r: Math.random() * 1.6 + 0.8
        };
    }

    function init() {
        resize();
        nodes = [];
        for (var i = 0; i < NODE_COUNT; i++) nodes.push(mkNode());
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        var len = nodes.length;
        for (var i = 0; i < len; i++) {
            for (var j = i + 1; j < len; j++) {
                var dx = nodes[i].x - nodes[j].x;
                var dy = nodes[i].y - nodes[j].y;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MAX_DIST) {
                    var alpha = (1 - dist / MAX_DIST) * 0.28;
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(200,236,255,' + alpha + ')';
                    ctx.lineWidth = 0.7;
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }

        for (var k = 0; k < len; k++) {
            var n = nodes[k];

            /* glow halo */
            var grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 4);
            grad.addColorStop(0, 'rgba(200,236,255,0.22)');
            grad.addColorStop(1, 'rgba(200,236,255,0)');
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r * 4, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();

            /* node dot */
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(220,244,255,0.7)';
            ctx.fill();

            /* update */
            n.x += n.vx;
            n.y += n.vy;
            if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
            if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
        }

        requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    init();
    draw();
})();
