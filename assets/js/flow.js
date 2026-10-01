/*
  Player Flow — hero visual.
  Players (lime light) stream left to right through six checkpoints.
  At each checkpoint some of them leak out (ember sparks falling away).
  At the last checkpoint, payers turn gold and the rest quietly fade.
  Purely illustrative: pass rates below are made up and labelled as a simulation on the page.
*/
(function () {
  "use strict";

  var root = document.querySelector("[data-flow]");
  if (!root) return;
  var canvas = root.querySelector("canvas");
  var ctx = canvas.getContext("2d");
  if (!ctx) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var GATES = 6;
  var PASS = [0.6, 0.55, 0.7, 0.5, 0.62, 0.32];
  var LIME = "198,255,61", EMBER = "255,106,61", GOLD = "255,208,102", DIM = "150,165,180";

  var W = 0, H = 0, dpr = 1, cy = 0, amp = 0, sigma = 0, spriteBase = 15;
  var gateX = [];
  var gatePulse = [0, 0, 0, 0, 0, 0];
  var gateLeak = [0, 0, 0, 0, 0, 0];
  var hot = -1;
  var particles = [];
  var spawnAcc = 0;
  var running = false, visible = true, rafId = 0, last = 0, clock = 0;
  var sprites = {};

  function sprite(rgb) {
    var r = 16, c = document.createElement("canvas");
    c.width = c.height = r * 2;
    var g = c.getContext("2d");
    var grd = g.createRadialGradient(r, r, 0, r, r, r);
    grd.addColorStop(0, "rgba(" + rgb + ",1)");
    grd.addColorStop(0.18, "rgba(" + rgb + ",0.9)");
    grd.addColorStop(0.42, "rgba(" + rgb + ",0.22)");
    grd.addColorStop(1, "rgba(" + rgb + ",0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, r * 2, r * 2);
    return c;
  }
  sprites.lime = sprite(LIME);
  sprites.ember = sprite(EMBER);
  sprites.gold = sprite(GOLD);
  sprites.dim = sprite(DIM);

  function resize() {
    var rect = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.max(1, rect.width);
    H = Math.max(1, rect.height);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var top = 10, bottom = H - 84;
    cy = (top + bottom) / 2;
    amp = Math.max(30, (bottom - top) / 2);
    sigma = (W / GATES) * 0.13;
    spriteBase = Math.max(10, Math.min(15, (W / 1366) * 15));
    gateX = [];
    for (var i = 0; i < GATES; i++) gateX.push((W * (i + 0.5)) / GATES);
    if (reduceMotion) staticFrame();
  }

  function rand(a, b) { return a + Math.random() * (b - a); }

  function spawn(x) {
    var fate = GATES;
    for (var i = 0; i < GATES; i++) { if (Math.random() > PASS[i]) { fate = i; break; } }
    var lane = (Math.random() + Math.random() + Math.random()) / 1.5 - 1;
    particles.push({
      x: x, y: cy, lane: lane, phase: rand(0, 6.283),
      v: (W / rand(8, 12)), fate: fate, gate: 0,
      state: 0, vx: 0, vy: 0, life: 1, size: rand(0.6, 1.2), kind: "lime"
    });
  }

  function pinch(x) {
    var m = 0;
    for (var i = 0; i < GATES; i++) {
      var d = x - gateX[i];
      m = Math.max(m, Math.exp(-(d * d) / (2 * sigma * sigma)));
    }
    return 1 - 0.62 * m;
  }

  function step(dt) {
    clock += dt;
    var rate = Math.min(1, Math.max(0.5, W / 1400)) * 92;
    spawnAcc += dt * rate;
    while (spawnAcc >= 1) { spawn(rand(-30, -4)); spawnAcc -= 1; }

    for (var g = 0; g < GATES; g++) {
      gatePulse[g] *= Math.pow(0.04, dt);
      gateLeak[g] *= Math.pow(0.05, dt);
    }

    for (var i = particles.length - 1; i >= 0; i--) {
      var p = particles[i];
      if (p.state === 0) {
        p.x += p.v * dt;
        var wob = Math.sin(clock * 1.4 + p.phase + p.x * 0.011) * 3.2;
        p.y = cy + p.lane * amp * pinch(p.x) + wob;
        // crossing a gate
        while (p.gate < GATES && p.x >= gateX[p.gate]) {
          if (p.gate === p.fate) {
            if (p.gate === GATES - 1) {
              p.state = 2; // didn't buy: drifts on and fades
              p.kind = "dim";
            } else {
              p.state = 1; // leaked
              p.kind = "ember";
              p.vx = p.v * rand(0.15, 0.35);
              p.vy = rand(-55, -15);
              gateLeak[p.gate] = Math.min(1, gateLeak[p.gate] + 0.35);
            }
            break;
          }
          gatePulse[p.gate] = Math.min(1, gatePulse[p.gate] + 0.12);
          if (p.gate === GATES - 1) p.kind = "gold";
          p.gate++;
        }
        if (p.x > W + 30) particles.splice(i, 1);
      } else if (p.state === 1) {
        p.vy += 260 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt * 0.8;
        if (p.life <= 0 || p.y > H + 20) particles.splice(i, 1);
      } else {
        p.x += p.v * 0.55 * dt;
        p.y += (cy - p.y) * 0.4 * dt;
        p.life -= dt * 0.9;
        if (p.life <= 0) particles.splice(i, 1);
      }
    }
  }

  function drawGates() {
    var reveal = reduceMotion ? 1 : Math.min(1, clock / 1.2);
    for (var i = 0; i < GATES; i++) {
      var x = gateX[i];
      var on = Math.max(0, Math.min(1, (reveal * GATES * 1.4) - i * 1.1));
      if (on <= 0) continue;
      var isHot = hot === i, dimmed = hot !== -1 && !isHot;
      var a = (0.16 + gatePulse[i] * 0.3 + (isHot ? 0.45 : 0)) * on * (dimmed ? 0.55 : 1);
      var ry = amp * 0.5;

      // ring (an obby checkpoint, seen edge-on)
      ctx.lineWidth = isHot ? 1.6 : 1.1;
      ctx.strokeStyle = "rgba(" + LIME + "," + a + ")";
      ctx.beginPath();
      ctx.ellipse(x, cy, Math.max(4, ry * 0.16), ry, 0, 0, Math.PI * 2);
      ctx.stroke();

      // vertical beam
      var grd = ctx.createLinearGradient(0, cy - amp * 1.25, 0, H - 64);
      grd.addColorStop(0, "rgba(" + LIME + ",0)");
      grd.addColorStop(0.45, "rgba(" + LIME + "," + a * 0.9 + ")");
      grd.addColorStop(1, "rgba(" + LIME + ",0)");
      ctx.strokeStyle = grd;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 0.5, cy - amp * 1.25);
      ctx.lineTo(x + 0.5, H - 64);
      ctx.stroke();

      // leak glow below the gate
      var lk = gateLeak[i] * on * (dimmed ? 0.5 : 1) + (isHot ? 0.25 : 0);
      if (lk > 0.01 && i < GATES - 1) {
        var lg = ctx.createRadialGradient(x, cy + ry * 0.9, 0, x, cy + ry * 0.9, ry);
        lg.addColorStop(0, "rgba(" + EMBER + "," + Math.min(0.18, lk * 0.2) + ")");
        lg.addColorStop(1, "rgba(" + EMBER + ",0)");
        ctx.fillStyle = lg;
        ctx.fillRect(x - ry, cy, ry * 2, ry * 2);
      }
    }
  }

  function drawParticles() {
    ctx.globalCompositeOperation = "lighter";
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      var s = spriteBase * p.size;
      var img = sprites[p.kind];
      var alpha = p.state === 0 ? 0.95 : Math.max(0, p.life);
      if (p.state === 1 && hot !== -1) alpha *= p.fate === hot ? 1.4 : 0.45;
      if (p.state === 0 && hot !== -1) alpha *= 0.8;
      ctx.globalAlpha = Math.min(1, alpha);
      ctx.drawImage(img, p.x - s / 2, p.y - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
  }

  function frame(now) {
    if (!running) return;
    var dt = Math.min(0.05, (now - last) / 1000 || 0.016);
    last = now;
    step(dt);

    // fade previous frame for light trails
    ctx.globalCompositeOperation = "destination-out";
    ctx.fillStyle = "rgba(0,0,0," + (1 - Math.pow(0.62, dt * 60)) + ")";
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "source-over";

    drawGates();
    drawParticles();
    rafId = requestAnimationFrame(frame);
  }

  function staticFrame() {
    particles = [];
    clock = 0;
    for (var t = 0; t < 9; t += 1 / 30) step(1 / 30);
    ctx.clearRect(0, 0, W, H);
    drawGates();
    drawParticles();
  }

  function start() {
    if (running || reduceMotion || !visible || document.hidden) return;
    running = true;
    last = performance.now();
    rafId = requestAnimationFrame(frame);
  }
  function stop() {
    running = false;
    cancelAnimationFrame(rafId);
  }

  // hover / focus highlight on the checkpoint labels
  var buttons = root.querySelectorAll("[data-goto-stage]");
  Array.prototype.forEach.call(buttons, function (b, i) {
    function on() { hot = i; b.classList.add("is-hot"); if (reduceMotion) staticFrame(); }
    function off() { if (hot === i) hot = -1; b.classList.remove("is-hot"); if (reduceMotion) staticFrame(); }
    b.addEventListener("pointerenter", on);
    b.addEventListener("pointerleave", off);
    b.addEventListener("focus", on);
    b.addEventListener("blur", off);
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      visible ? start() : stop();
    }, { rootMargin: "60px" }).observe(root);
  }
  document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });

  var rt;
  window.addEventListener("resize", function () {
    clearTimeout(rt);
    rt = setTimeout(resize, 120);
  });

  resize();
  if (!reduceMotion) {
    // pre-warm so the stream is already flowing on first paint
    for (var t = 0; t < 11; t += 1 / 30) step(1 / 30);
    clock = 0;
    start();
  }
})();
