/*
  Site interactions. No dependencies, no build step.
  Sections: config wiring · header · reveals · Leak Map · charts · quiz · accordions · intake form · dock
*/
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isMobile = window.matchMedia("(max-width: 759px)");

  var STAGES = ["click", "hook", "loop", "d1", "d7", "spend"];
  var NAME = { click: "Click", hook: "Hook", loop: "Loop", d1: "D1", d7: "D7", spend: "Spend" };
  var LONG = { click: "Discovery & clicks", hook: "First session", loop: "Engagement", d1: "Day 1 retention", d7: "Day 7 retention", spend: "Monetization" };
  var SPRINT = { click: "Discovery & Launch Sprint", hook: "First Session Sprint", loop: "Engagement Sprint", d1: "Retention Sprint", d7: "Retention Sprint", spend: "Monetization Sprint" };

  var state = { stage: "click", mode: "map", symptoms: {}, quiz: null };
  STAGES.forEach(function (s) { state.symptoms[s] = []; });

  function store(key, val) {
    try {
      if (val === undefined) return JSON.parse(localStorage.getItem(key) || "null");
      if (val === null) localStorage.removeItem(key);
      else localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
  }

  /* ---------------------------------------------------------------- config */
  function wireConfig() {
    var links = { "[data-tiktok]": CFG.tiktokUrl, "[data-discord]": CFG.discordUrl, "[data-email]": CFG.contactEmail ? "mailto:" + CFG.contactEmail : "" };
    Object.keys(links).forEach(function (sel) {
      $$(sel).forEach(function (a) {
        if (links[sel]) {
          a.href = links[sel];
          a.hidden = false;
          if (/^https?:/.test(links[sel])) { a.target = "_blank"; a.rel = "noopener"; }
        }
      });
    });
    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
  }

  /* ---------------------------------------------------------------- header */
  function initHeader() {
    var header = $("[data-header]");
    var btn = $("[data-menu-btn]");
    var menu = $("[data-menu]");
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    function setMenu(open) {
      if (open) menu.style.top = Math.max(0, header.getBoundingClientRect().bottom) + "px";
      btn.setAttribute("aria-expanded", String(open));
      menu.hidden = !open;
      header.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
    }
    btn.addEventListener("click", function () { setMenu(btn.getAttribute("aria-expanded") !== "true"); });
    menu.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") { setMenu(false); btn.focus(); }
    });

    // current-section underline in the desktop nav
    if (!("IntersectionObserver" in window)) return;
    var navLinks = $$(".nav a");
    var map = {};
    navLinks.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && map[en.target.id]) {
          navLinks.forEach(function (a) { a.classList.remove("is-current"); });
          map[en.target.id].classList.add("is-current");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main > section[id]").forEach(function (s) { io.observe(s); });
  }

  /* ---------------------------------------------------------------- reveals */
  function initReveals() {
    // .scan headings are clipped to zero width until revealed, which an IntersectionObserver
    // reports as "not intersecting", so watch their parent and reveal the heading through it.
    var els = $$(".rv, .report-stage");
    $$(".scan").forEach(function (h) {
      var p = h.parentElement;
      if (els.indexOf(p) < 0) { p.setAttribute("data-scan-host", ""); els.push(p); }
    });
    // stagger siblings automatically unless a delay is set inline
    var groups = new Map();
    $$(".rv").forEach(function (el) {
      if (el.style.getPropertyValue("--d")) return;
      var p = el.parentElement;
      var n = groups.get(p) || 0;
      el.style.setProperty("--d", String(Math.min(n, 5)));
      groups.set(p, n + 1);
    });
    function reveal(el) {
      el.classList.add("is-in");
      if (el.hasAttribute("data-scan-host")) $$(":scope > .scan", el).forEach(function (h) { h.classList.add("is-in"); });
    }
    if (!("IntersectionObserver" in window) || reduceMotion) {
      els.forEach(reveal);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { reveal(en.target); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---------------------------------------------------------------- spotlight */
  function initSpotlight() {
    if (reduceMotion || !window.matchMedia("(pointer: fine)").matches) return;
    var el = document.createElement("div");
    el.className = "spotlight";
    el.setAttribute("aria-hidden", "true");
    document.body.appendChild(el);
    var x = 0, y = 0, raf = 0;
    window.addEventListener("pointermove", function (e) {
      x = e.clientX; y = e.clientY;
      if (!raf) raf = requestAnimationFrame(function () {
        el.style.setProperty("--mx", x + "px");
        el.style.setProperty("--my", y + "px");
        el.classList.add("is-on");
        raf = 0;
      });
    }, { passive: true });
    document.addEventListener("pointerleave", function () { el.classList.remove("is-on"); });
  }

  /* ---------------------------------------------------------------- Leak Map */
  var finder = $("#leak-map");
  var rail = $(".rail");
  var railTabs = $$(".rail [role=tab]");
  var modeTabs = $$(".modes [role=tab]");

  function setMode(mode, focus) {
    state.mode = mode;
    $(".modes").setAttribute("data-active", mode);
    modeTabs.forEach(function (t) {
      var on = t.getAttribute("data-mode") === mode;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focus) t.focus();
    });
    $$("[data-mode-panel]").forEach(function (p) { p.hidden = p.getAttribute("data-mode-panel") !== mode; });
    if (mode === "quiz" && !state.quizStarted) renderQuiz(0);
    if (mode === "map") drawChart(state.stage);
  }

  function setStage(id, opts) {
    opts = opts || {};
    var idx = STAGES.indexOf(id);
    if (idx < 0) return;
    state.stage = id;
    rail.style.setProperty("--sel", String(idx));
    railTabs.forEach(function (t, i) {
      var on = i === idx;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      t.classList.toggle("is-passed", i < idx);
      if (on && opts.focus) t.focus();
    });
    $$("[data-stage-panel]").forEach(function (p) {
      p.classList.toggle("is-active", p.getAttribute("data-stage-panel") === id);
    });
    drawChart(id);
    if (opts.keepInView) {
      var con = $(".console", finder);
      var top = con.getBoundingClientRect().top;
      var offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h"), 10) + (isMobile.matches ? 86 : 20);
      if (top < offset) window.scrollTo({ top: window.scrollY + top - offset, behavior: reduceMotion ? "auto" : "smooth" });
    }
  }

  function goToStage(id) {
    setMode("map");
    setStage(id);
    var t = $(".modes").getBoundingClientRect().top + window.scrollY;
    var hh = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--header-h"), 10);
    window.scrollTo({ top: t - hh - 12, behavior: reduceMotion ? "auto" : "smooth" });
  }

  function tabKeys(tabs, onPick) {
    tabs.forEach(function (t, i) {
      t.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowRight") n = (i + 1) % tabs.length;
        else if (e.key === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === "Home") n = 0;
        else if (e.key === "End") n = tabs.length - 1;
        if (n !== null) { e.preventDefault(); onPick(tabs[n]); }
      });
    });
  }

  function initFinder() {
    if (!finder) return;
    modeTabs.forEach(function (t) { t.addEventListener("click", function () { setMode(t.getAttribute("data-mode")); }); });
    tabKeys(modeTabs, function (t) { setMode(t.getAttribute("data-mode"), true); });

    railTabs.forEach(function (t) {
      t.addEventListener("click", function () { setStage(t.getAttribute("data-stage"), { keepInView: true }); });
    });
    tabKeys(railTabs, function (t) { setStage(t.getAttribute("data-stage"), { focus: true }); });

    $$("[data-goto-stage]").forEach(function (b) {
      b.addEventListener("click", function () { goToStage(b.getAttribute("data-goto-stage")); });
    });
    $$("[data-open-quiz]").forEach(function (a) {
      a.addEventListener("click", function () { setMode("quiz"); });
    });

    // symptoms
    $$("[data-stage-panel]").forEach(function (panel) {
      var id = panel.getAttribute("data-stage-panel");
      $$(".symptom", panel).forEach(function (b) {
        b.addEventListener("click", function () {
          var on = b.getAttribute("aria-pressed") !== "true";
          b.setAttribute("aria-pressed", String(on));
          var text = b.textContent.trim();
          var list = state.symptoms[id];
          var at = list.indexOf(text);
          if (on && at < 0) list.push(text);
          if (!on && at > -1) list.splice(at, 1);
          updateSymptomBadges(id);
        });
      });
    });

    // "Fix my X" buttons carry the checkpoint and symptoms into the form
    $$("[data-start-stage]").forEach(function (a) {
      a.addEventListener("click", function () {
        var id = a.getAttribute("data-start-stage");
        prefill({ stage: id, service: "Fix Sprint" });
      });
    });
    $$("[data-start-service]").forEach(function (a) {
      a.addEventListener("click", function () { prefill({ service: a.getAttribute("data-start-service") }); });
    });

    // on phones, collapse "What I investigate" so the deliverables and price stay close
    if (isMobile.matches) {
      $$(".stage").forEach(function (s) { var d = $(".work", s); if (d) d.open = false; });
    }

    setStage("click");
  }

  function updateSymptomBadges(id) {
    var n = state.symptoms[id].length;
    var tab = $("#tab-" + id);
    tab.classList.toggle("has-symptoms", n > 0);
    tab.setAttribute("data-count", String(n));
    var count = $("#stage-" + id + " .sym-count");
    if (count) { count.hidden = n === 0; count.textContent = String(n); }
    syncCarry();
  }

  /* ---------------------------------------------------------------- charts */
  var drawn = {};
  function fmt(n) { return n.toLocaleString("en-US"); }

  var CHARTS = {
    click: function (w, h) {
      var s = "", bh = Math.max(14, h * 0.13), rows = [
        { k: "Impressions", v: 40000, d: "40,000", c: "bar" },
        { k: "Plays", v: 480, d: "480", c: "bar bar--ember" }
      ];
      rows.forEach(function (r, i) {
        var y = h * (0.11 + i * 0.36);
        s += '<text x="0" y="' + y + '">' + r.k.toUpperCase() + "</text>";
        s += '<text class="t-strong' + (i ? " t-ember" : "") + '" x="' + w + '" y="' + y + '" text-anchor="end">' + r.d + "</text>";
        s += '<rect x="0" y="' + (y + 7) + '" width="' + w + '" height="' + bh + '" rx="5" fill="rgba(196,220,255,.05)"/>';
        s += '<rect class="' + r.c + '" x="0" y="' + (y + 7) + '" width="' + Math.max(5, (w * r.v) / 40000) + '" height="' + bh + '" rx="5" style="transition-delay:' + i * 0.3 + 's"/>';
      });
      s += '<g class="callout"><text x="0" y="' + (h - 6) + '"><tspan class="t-strong t-ember" style="font-size:' + Math.round(h * 0.16) + 'px;font-family:var(--f-display);font-stretch:125%">1.2%</tspan><tspan dx="10">play through rate</tspan></text></g>';
      return s;
    },

    hook: function (w, h) {
      var pts = [[0, 100], [10, 93], [20, 82], [30, 70], [45, 57], [60, 49], [90, 44], [120, 41], [180, 38], [300, 35], [420, 33], [600, 31]];
      var L = 34, R = w - 6, T = 8, B = h - 22;
      var X = function (t) { return L + Math.sqrt(t / 600) * (R - L); };
      var Y = function (v) { return T + (1 - v / 100) * (B - T); };
      var s = grid([100, 50, 0], Y, L, R, function (v) { return v ? v + "%" : "0"; });
      [[0, "0"], [60, "1 min"], [180, "3 min"], [600, "10 min"]].forEach(function (x, i, a) {
        s += '<text x="' + X(x[0]) + '" y="' + (h - 4) + '" text-anchor="' + (i === 0 ? "start" : i === a.length - 1 ? "end" : "middle") + '">' + x[1] + "</text>";
      });
      s += curve(pts, X, Y, B, "hook");
      var mx = X(60), my = Y(49);
      s += '<circle class="mark" cx="' + mx + '" cy="' + my + '" r="4.5"/>';
      s += '<g class="callout"><line class="callout-line" x1="' + mx + '" y1="' + (my - 8) + '" x2="' + mx + '" y2="' + (T + 8) + '"/>';
      s += '<text class="t-ember" x="' + (mx + 8) + '" y="' + (T + 14) + '">Half are gone by minute 1</text></g>';
      return s;
    },

    loop: function (w, h) {
      var X = function (m) { return (m / 40) * w; };
      var bh = Math.max(14, h * 0.13), s = "";
      var y1 = h * 0.11, y2 = h * 0.46;
      s += '<text x="0" y="' + y1 + '">TYPICAL SESSION</text>';
      s += '<rect x="0" y="' + (y1 + 7) + '" width="' + w + '" height="' + bh + '" rx="5" fill="rgba(196,220,255,.05)"/>';
      s += '<rect class="bar" x="0" y="' + (y1 + 7) + '" width="' + X(9) + '" height="' + bh + '" rx="5"/>';
      s += '<text class="t-strong" x="' + (X(9) + 8) + '" y="' + (y1 + 7 + bh * 0.72) + '">9 min</text>';
      s += '<text x="0" y="' + y2 + '">NEXT MAJOR GOAL</text>';
      s += '<rect x="0" y="' + (y2 + 7) + '" width="' + w + '" height="' + bh + '" rx="5" fill="rgba(196,220,255,.05)"/>';
      s += '<rect class="bar bar--dim" x="0" y="' + (y2 + 7) + '" width="' + X(34) + '" height="' + bh + '" rx="5" style="transition-delay:.3s"/>';
      s += '<rect class="mark" x="' + (X(34) - 3) + '" y="' + (y2 + 3) + '" width="3" height="' + (bh + 8) + '" rx="1.5"/>';
      s += '<text class="t-strong" x="' + (X(34) - 8) + '" y="' + (y2 + 7 + bh * 0.72) + '" text-anchor="end">34 min</text>';
      var gy = h * 0.8;
      s += '<g class="callout"><line class="callout-line" x1="' + X(9) + '" y1="' + gy + '" x2="' + X(34) + '" y2="' + gy + '"/>';
      s += '<line class="callout-line" x1="' + X(9) + '" y1="' + (gy - 5) + '" x2="' + X(9) + '" y2="' + (gy + 5) + '" style="stroke-dasharray:none"/>';
      s += '<line class="callout-line" x1="' + X(34) + '" y1="' + (gy - 5) + '" x2="' + X(34) + '" y2="' + (gy + 5) + '" style="stroke-dasharray:none"/>';
      s += '<text class="t-ember" x="' + X(21.5) + '" y="' + (gy + 18) + '" text-anchor="middle">25 minutes with no goal in reach</text></g>';
      return s;
    },

    d1: function (w, h) {
      var data = [100, 7, 4.6, 3.7, 3.1, 2.7, 2.4, 2.1];
      var L = 34, R = w - 6, T = 8, B = h - 22;
      var X = function (d) { return L + (d / 7) * (R - L); };
      var Y = function (v) { return T + (1 - v / 100) * (B - T); };
      var s = grid([100, 50, 0], Y, L, R, function (v) { return v ? v + "%" : "0"; });
      data.forEach(function (_, d) {
        s += '<text x="' + X(d) + '" y="' + (h - 4) + '" text-anchor="' + (d === 0 ? "start" : d === 7 ? "end" : "middle") + '">D' + d + "</text>";
      });
      s += curve(data.map(function (v, d) { return [d, v]; }), X, Y, B, "d1");
      var mx = X(1), my = Y(7);
      s += '<circle class="mark" cx="' + mx + '" cy="' + my + '" r="4.5"/>';
      s += '<g class="callout"><text class="t-ember" x="' + (mx + 12) + '" y="' + (my - 30) + '">7% come back on Day 1</text>';
      s += '<line class="callout-line" x1="' + (mx + 4) + '" y1="' + (my - 6) + '" x2="' + (mx + 10) + '" y2="' + (my - 26) + '"/></g>';
      return s;
    },

    d7: function (w, h) {
      var data = [7, 4.6, 3.7, 3.1, 2.7, 2.4, 2.1];
      var L = 34, R = w - 6, T = 8, B = h - 22;
      var X = function (d) { return L + ((d - 1) / 6) * (R - L); };
      var Y = function (v) { return T + (1 - v / 8) * (B - T); };
      var s = grid([8, 4, 0], Y, L, R, function (v) { return v ? v + "%" : "0"; });
      data.forEach(function (_, i) {
        var d = i + 1;
        s += '<text x="' + X(d) + '" y="' + (h - 4) + '" text-anchor="' + (d === 1 ? "start" : d === 7 ? "end" : "middle") + '">D' + d + "</text>";
      });
      s += curve(data.map(function (v, i) { return [i + 1, v]; }), X, Y, B, "d7");
      var mx = X(7), my = Y(2.1);
      s += '<circle class="mark" cx="' + mx + '" cy="' + my + '" r="4.5"/>';
      s += '<g class="callout"><text class="t-ember" x="' + (R - 2) + '" y="' + (Y(5.4)) + '" text-anchor="end">70% of Day 1 players</text>';
      s += '<text class="t-ember" x="' + (R - 2) + '" y="' + (Y(5.4) + 14) + '" text-anchor="end">are gone by Day 7</text></g>';
      return s;
    },

    spend: function (w, h) {
      var rows = [["Players", 10000], ["Opened the shop", 2400], ["Viewed an offer", 900], ["Bought", 110]];
      var s = "", bh = Math.max(9, h * 0.075);
      rows.forEach(function (r, i) {
        var y = h * (0.09 + i * 0.235), last = i === rows.length - 1;
        s += '<text x="0" y="' + y + '">' + r[0].toUpperCase() + "</text>";
        s += '<text class="t-strong' + (last ? " t-ember" : "") + '" x="' + w + '" y="' + y + '" text-anchor="end">' + fmt(r[1]) + (last ? "  ·  1.1%" : "") + "</text>";
        s += '<rect x="0" y="' + (y + 6) + '" width="' + w + '" height="' + bh + '" rx="4" fill="rgba(196,220,255,.05)"/>';
        s += '<rect class="bar' + (last ? " bar--ember" : "") + '" x="0" y="' + (y + 6) + '" width="' + Math.max(5, (w * r[1]) / 10000) + '" height="' + bh + '" rx="4" style="transition-delay:' + i * 0.18 + 's"/>';
      });
      return s;
    }
  };

  function grid(levels, Y, L, R, label) {
    return levels.map(function (v) {
      var y = Y(v);
      return '<line class="grid" x1="' + L + '" y1="' + y + '" x2="' + R + '" y2="' + y + '"/>' +
        '<text x="' + (L - 6) + '" y="' + (y + 3) + '" text-anchor="end">' + label(v) + "</text>";
    }).join("");
  }

  function curve(pts, X, Y, B, id) {
    var d = pts.map(function (p, i) { return (i ? "L" : "M") + X(p[0]).toFixed(1) + " " + Y(p[1]).toFixed(1); }).join(" ");
    var first = pts[0], lastP = pts[pts.length - 1];
    var area = d + " L" + X(lastP[0]).toFixed(1) + " " + B + " L" + X(first[0]).toFixed(1) + " " + B + " Z";
    return '<defs><linearGradient id="gf-' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgb(198,255,61)" stop-opacity=".28"/><stop offset="1" stop-color="rgb(198,255,61)" stop-opacity="0"/></linearGradient></defs>' +
      '<path class="area" d="' + area + '" fill="url(#gf-' + id + ')"/>' +
      '<path class="line" d="' + d + '"/>';
  }

  function drawChart(id, force) {
    var el = $('.chart[data-chart="' + id + '"]');
    if (!el || !CHARTS[id]) return;
    var w = Math.round(el.clientWidth), h = Math.round(el.clientHeight);
    if (!w || !h) return;
    if (drawn[id] === w && !force) return;
    var animate = !drawn[id] && !reduceMotion;
    drawn[id] = w;
    el.innerHTML = '<svg viewBox="0 0 ' + w + " " + h + '" width="' + w + '" height="' + h + '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' + CHARTS[id](w, h) + "</svg>";
    var line = $(".line", el);
    if (line && line.getTotalLength) el.style.setProperty("--len", String(Math.ceil(line.getTotalLength())));
    if (!animate) { el.classList.add("is-drawn"); return; }
    el.classList.remove("is-drawn");
    // wait until it's on screen so the draw-in is actually seen
    whenVisible(el, function () {
      requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add("is-drawn"); }); });
    });
  }

  function whenVisible(el, cb) {
    if (!("IntersectionObserver" in window)) return cb();
    var io = new IntersectionObserver(function (en) {
      if (en[0].isIntersecting) { io.disconnect(); cb(); }
    }, { threshold: 0.35 });
    io.observe(el);
  }

  var lastW = window.innerWidth;
  window.addEventListener("resize", function () {
    if (Math.abs(window.innerWidth - lastW) < 2) return;
    lastW = window.innerWidth;
    clearTimeout(drawChart.t);
    drawChart.t = setTimeout(function () { drawChart(state.stage, true); }, 150);
  });

  /* ---------------------------------------------------------------- quiz */
  var QUIZ = [
    { s: "click", q: "Is your game getting plays at all?", o: [["leak", "Barely. Almost nobody joins"], ["weak", "Some, but it's flat"], ["ok", "Yes, plenty of plays"], ["unknown", "Not sure"]] },
    { s: "hook", q: "When new players join, what usually happens?", o: [["leak", "Most leave within a minute or two"], ["weak", "Some stay, a lot leave early"], ["ok", "Most stick around a while"], ["unknown", "No idea"]] },
    { s: "loop", q: "Once they're into it, how long do players stay?", o: [["leak", "Not long. They run out of things to do"], ["weak", "A decent session, then they're done"], ["ok", "Long sessions"], ["unknown", "Not sure"]] },
    { s: "d1", q: "Do players come back the next day?", o: [["leak", "Rarely"], ["weak", "Some do"], ["ok", "Lots of them"], ["unknown", "Not sure"]] },
    { s: "d7", q: "Are they still around a week later?", o: [["leak", "No, they burn out fast"], ["weak", "A small core sticks around"], ["ok", "Yes, plenty"], ["unknown", "Not sure"]] },
    { s: "spend", q: "Do players buy gamepasses or developer products?", o: [["leak", "Almost never"], ["weak", "A few do"], ["ok", "Yes, it's healthy"], ["unknown", "Not sure"]] }
  ];
  var WHY = {
    hook: "Players are leaving before they find the fun. Fix this first: every player you win from a better thumbnail, an ad or a TikTok is currently being wasted.",
    click: "People aren't choosing your game. That's usually the thumbnail, the icon, or the promise they make. Make sure the first minute holds the players you do get, then go after more.",
    d1: "Players try it once and don't return. The fix usually lives at the end of the first session, not in a bigger daily reward.",
    loop: "Players run out of things to chase. That's pacing and goals, and it drags down every retention number after it.",
    d7: "You keep players for a day or two, then lose them. That's depth: long-term goals, and a reason to believe the game keeps changing.",
    spend: "Players stay but don't buy. That's usually what's for sale, when it's offered, and how it's priced."
  };
  var ORDER = ["hook", "click", "d1", "loop", "d7", "spend"];
  var quizEl = $("[data-quiz]");
  var answers = {};

  function segs(current) {
    return '<div class="quiz__segs">' + QUIZ.map(function (q, i) {
      var a = answers[q.s];
      var cls = i === current ? "is-current" : a ? "is-" + a : "";
      return '<i class="' + cls + '"></i>';
    }).join("") + "</div>";
  }

  function renderQuiz(i) {
    state.quizStarted = true;
    var q = QUIZ[i];
    quizEl.innerHTML =
      '<div class="quiz__top"><span class="quiz__count">' + (i + 1) + " / 6</span>" + segs(i) + "</div>" +
      '<div class="quiz__frame">' +
      '<p class="quiz__k">' + String(i + 1).padStart(2, "0") + " · " + NAME[q.s] + " · " + LONG[q.s] + "</p>" +
      '<h3 class="quiz__q" tabindex="-1">' + q.q + "</h3>" +
      '<div class="quiz__opts">' + q.o.map(function (o) {
        return '<button type="button" class="quiz__opt' + (answers[q.s] === o[0] ? " is-picked" : "") + '" data-v="' + o[0] + '">' + o[1] + "</button>";
      }).join("") + "</div>" +
      (i > 0 ? '<button type="button" class="quiz__back" data-back>← Back</button>' : "") +
      "</div>";
    $$(".quiz__opt", quizEl).forEach(function (b) {
      b.addEventListener("click", function () {
        answers[q.s] = b.getAttribute("data-v");
        b.classList.add("is-picked");
        setTimeout(function () { i < QUIZ.length - 1 ? renderQuiz(i + 1) : renderResult(); }, reduceMotion ? 0 : 220);
      });
    });
    var back = $("[data-back]", quizEl);
    if (back) back.addEventListener("click", function () { renderQuiz(i - 1); });
    if (i > 0) { var h = $(".quiz__q", quizEl); h.focus({ preventScroll: true }); }
  }

  function diagnose() {
    var unknown = STAGES.filter(function (s) { return answers[s] === "unknown"; }).length;
    var primary = ORDER.filter(function (s) { return answers[s] === "leak"; })[0] ||
      ORDER.filter(function (s) { return answers[s] === "weak"; })[0] || null;
    if (answers.click === "leak" && unknown >= 3) return { kind: "early", primary: "click" };
    if (unknown >= 3) return { kind: "blind", primary: primary };
    if (primary) return { kind: "leak", primary: primary };
    return { kind: "healthy", primary: null };
  }

  // prices are read from the page so index.html stays the single source of truth
  function price(key) {
    var el = $('[data-price="' + key + '"]');
    return el ? el.textContent.trim() : "";
  }
  function sprintPrice(stage) {
    var el = $("#stage-" + stage + " .buy__facts > span:last-child");
    return el ? el.textContent.trim() : "";
  }

  function renderResult() {
    var r = diagnose();
    var p = r.primary;
    state.quiz = { answers: answers, result: r };
    var map = '<div class="quiz-result__map">' + STAGES.map(function (s, i) {
      var a = answers[s];
      var label = { leak: "Leak", weak: "Weak", ok: "OK", unknown: "?" }[a];
      return '<span class="qm qm--' + a + (s === p && r.kind !== "blind" ? " is-primary" : "") + '" style="--i:' + i + '"><b>' + NAME[s] + "</b>" + label + "</span>";
    }).join("") + "</div>";

    var k, t, body, path, cta;
    if (r.kind === "early") {
      k = "Your self-reported Leak Map";
      t = "You need eyes on it before dashboards.";
      body = "With almost nobody joining, there isn't enough data to read yet. The fastest answer is a new-player teardown: I play it, record it, and show you what's stopping people from choosing it and staying.";
      path = [["Quick Read", "A recorded teardown, no data needed", price("quick")], [SPRINT.click, "If the problem is the click, fix that next", sprintPrice("click")]];
      cta = { label: "Get a Quick Read", service: "Quick Read", stage: "click" };
    } else if (r.kind === "blind") {
      k = "Your self-reported Leak Map";
      t = "You're flying blind. That's fixable.";
      body = "You can't fix a leak you can't see. A Full Game Audit reads your analytics for you, plays the game as a new player, and tells you which checkpoint to fix first." + (p ? " From your answers, I'd look at <b>" + NAME[p] + "</b> first." : "");
      path = [["Full Game Audit", "Your full Leak Map, from real data", price("audit")], [p ? SPRINT[p] : "The sprint it points to", "Fee credited if booked within 30 days", p ? sprintPrice(p) : ""]];
      cta = { label: "Get my game audit", service: "Full Game Audit", stage: p || "unsure" };
    } else if (r.kind === "leak") {
      k = "Your first leak is probably";
      t = "<em>" + NAME[p] + "</em>, " + LONG[p].toLowerCase() + ".";
      body = WHY[p] + " An audit confirms it with your data before you spend on a fix.";
      path = [["Full Game Audit", "Confirm the leak with your real numbers", price("audit")], [SPRINT[p], "Fix it. Audit fee credited within 30 days", sprintPrice(p)]];
      cta = { label: "Get my game audit", service: "Full Game Audit", stage: p };
    } else {
      k = "Your self-reported Leak Map";
      t = "No obvious leak. Time to scale.";
      body = "If every checkpoint looks healthy, growth comes from compounding small wins and a steady update rhythm. An audit finds the next lever. A Growth Partner keeps pulling it.";
      path = [["Full Game Audit", "Find the next lever", price("audit")], ["Growth Partner", "Monthly roadmap and build days", "from " + price("partner") + "/mo"]];
      cta = { label: "Get my game audit", service: "Full Game Audit", stage: "unsure" };
    }

    quizEl.innerHTML =
      '<div class="quiz__frame">' + map +
      '<p class="quiz-result__k">' + k + "</p>" +
      '<h3 class="quiz-result__t" tabindex="-1">' + t + "</h3>" +
      '<p class="quiz-result__p">' + body + "</p>" +
      '<ol class="path">' + path.map(function (x) {
        return "<li><div><b>" + x[0] + "</b><span>" + x[1] + "</span></div>" + (x[2] ? '<em data-proposed>' + x[2] + "</em>" : "<em></em>") + "</li>";
      }).join("") + "</ol>" +
      '<div class="quiz-result__actions">' +
      '<a class="btn btn--primary" href="#submit" data-quiz-cta>' + cta.label + ' <svg class="i" viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11m-4-4 4 4-4 4"/></svg></a>' +
      (p ? '<button type="button" class="btn btn--ghost" data-quiz-see>See the ' + NAME[p] + " checkpoint</button>" : "") +
      '<button type="button" class="btn btn--quiet" data-quiz-redo>Start over</button>' +
      "</div></div>";

    $("[data-quiz-cta]", quizEl).addEventListener("click", function () {
      prefill({ service: cta.service, stage: cta.stage });
    });
    var see = $("[data-quiz-see]", quizEl);
    if (see) see.addEventListener("click", function () { goToStage(p); });
    $("[data-quiz-redo]", quizEl).addEventListener("click", function () { answers = {}; state.quiz = null; renderQuiz(0); syncCarry(); });
    $(".quiz-result__t", quizEl).focus({ preventScroll: true });
    syncCarry();
  }

  /* ---------------------------------------------------------------- accordions */
  function initAccordions() {
    $$(".finding__btn, .qa button").forEach(function (b) {
      var qa = b.closest(".qa");
      b.addEventListener("click", function () {
        var open = b.getAttribute("aria-expanded") !== "true";
        b.setAttribute("aria-expanded", String(open));
        if (qa) qa.classList.toggle("is-open", open);
      });
    });
  }

  /* ---------------------------------------------------------------- intake form */
  var form = $("[data-form]");
  var stepEls = $$("[data-fstep]");
  var step = 1;
  var DRAFT_KEY = "khaiel-intake-draft";

  function showStep(n, focus) {
    step = n;
    stepEls.forEach(function (f) { f.classList.toggle("is-on", +f.getAttribute("data-fstep") === n); });
    $("[data-bar]").style.width = (n / 5) * 100 + "%";
    $("[data-step-num]").textContent = n;
    $$(".form__dots li").forEach(function (li, i) {
      li.classList.toggle("is-on", i === n - 1);
      li.classList.toggle("is-done", i < n - 1);
    });
    $("[data-prev]", form).hidden = n === 1;
    $("[data-next]", form).hidden = n === 5;
    $("[data-submit]", form).hidden = n !== 5;
    setError("");
    if (focus) {
      var t = $('[data-fstep="' + n + '"] .fstep__t', form);
      t.setAttribute("tabindex", "-1");
      t.focus({ preventScroll: true });
      var top = form.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.5) {
        form.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      }
    }
  }

  function setError(msg, field) {
    $("[data-form-error]").textContent = msg;
    $$(".is-invalid", form).forEach(function (el) { el.classList.remove("is-invalid"); el.removeAttribute("aria-invalid"); });
    if (field) { field.classList.add("is-invalid"); field.setAttribute("aria-invalid", "true"); field.focus(); }
  }

  function normalizeLink(v) {
    v = (v || "").trim();
    if (v && !/^https?:\/\//i.test(v)) v = "https://" + v;
    return v;
  }

  function checkLink() {
    var input = $("#f-link");
    var hint = $("[data-link-hint]");
    var v = normalizeLink(input.value);
    hint.classList.remove("is-ok", "is-warn");
    if (!input.value.trim()) { hint.textContent = "Paste it from the address bar or the share button."; return false; }
    var isRoblox = /^https?:\/\/([a-z0-9-]+\.)*(roblox\.com|ro\.blox\.com)(\/|$)/i.test(v);
    if (!isRoblox) { hint.textContent = "That doesn't look like a roblox.com link yet."; hint.classList.add("is-warn"); return false; }
    var id = v.match(/\/games\/(\d+)/);
    hint.textContent = id ? "Place ID " + id[1] + " ✓" : "Roblox link ✓";
    hint.classList.add("is-ok");
    return true;
  }

  function validate(n) {
    if (n === 1) {
      var link = $("#f-link");
      if (!link.value.trim()) { setError("Paste your game's Roblox link to continue.", link); return false; }
      if (!checkLink()) { setError("That link should be a roblox.com game link.", link); return false; }
      link.value = normalizeLink(link.value);
    }
    if (n === 5) {
      var email = $("#f-email");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) { setError("Add an email so I can reply.", email); return false; }
      if (!form.querySelector('input[name="age"]:checked')) { setError("Pick your age bracket. Under 18 is fine, it just changes who signs off on paid work."); return false; }
    }
    return true;
  }

  function prefill(o) {
    if (!form) return;
    if (o.stage) { var r = form.querySelector('input[name="stage"][value="' + o.stage + '"]'); if (r) r.checked = true; }
    if (o.service) { var s = form.querySelector('input[name="service"][value="' + o.service + '"]'); if (s) s.checked = true; }
    syncCarry();
    saveDraft();
  }

  function syncCarry() {
    if (!form) return;
    var items = [];
    STAGES.forEach(function (s) {
      state.symptoms[s].forEach(function (t) { items.push(NAME[s] + ": " + t); });
    });
    $("[data-h-symptoms]").value = items.join(" | ");
    var qa = state.quiz ? STAGES.map(function (s) { return NAME[s] + "=" + (state.quiz.answers[s] || "-"); }).join(", ") : "";
    $("[data-h-quiz]").value = qa;
    var carry = $("[data-carry]");
    var list = $("[data-carry-list]");
    var lines = items.slice();
    if (qa) lines.push("Quick diagnosis: " + qa);
    carry.hidden = lines.length === 0;
    list.innerHTML = lines.map(function (l) { var li = document.createElement("li"); li.textContent = l; return li.outerHTML; }).join("");
  }

  function captureSource() {
    var params = new URLSearchParams(location.search);
    var src = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "ref"].forEach(function (k) { if (params.get(k)) src[k] = params.get(k); });
    if (document.referrer && document.referrer.indexOf(location.host) === -1) src.referrer = document.referrer;
    try {
      if (Object.keys(src).length) sessionStorage.setItem("khaiel-src", JSON.stringify(src));
      else src = JSON.parse(sessionStorage.getItem("khaiel-src") || "{}");
    } catch (e) {}
    var ua = navigator.userAgent || "";
    if (/musical_ly|BytedanceWebview|TikTok/i.test(ua)) src.in_app = "tiktok";
    $("[data-h-source]").value = Object.keys(src).map(function (k) { return k + "=" + src[k]; }).join("; ");
  }

  function collect() {
    var data = {};
    new FormData(form).forEach(function (v, k) { if (String(v).trim()) data[k] = String(v).trim(); });
    return data;
  }

  var saveT;
  function saveDraft() {
    clearTimeout(saveT);
    saveT = setTimeout(function () { store(DRAFT_KEY, collect()); }, 300);
  }
  function restoreDraft() {
    var d = store(DRAFT_KEY);
    if (!d) return;
    Object.keys(d).forEach(function (k) {
      var els = form.querySelectorAll('[name="' + k + '"]');
      Array.prototype.forEach.call(els, function (el) {
        if (el.type === "hidden") return;
        if (el.type === "radio") el.checked = el.value === d[k];
        else el.value = d[k];
      });
    });
    if (d.game_link) checkLink();
  }

  var LABELS = {
    game_link: "Game", game_status: "Status", genre: "Genre", stage: "Leaking at", problem: "In their words",
    m_dau: "DAU", m_play_through_rate: "Play through rate %", m_avg_session_min: "Avg session (min)", m_d1: "D1 %", m_d7: "D7 %",
    m_payer_conversion: "Payer conversion %", m_robux_30d: "Robux (30d)", service: "Interested in", budget: "Budget", timing: "Timing",
    name: "Name", email: "Email", discord: "Discord", tiktok: "TikTok", age: "Age", symptoms: "Symptoms", quiz_map: "Quick diagnosis", source: "Source"
  };
  function summary(data) {
    return Object.keys(LABELS).filter(function (k) { return data[k]; }).map(function (k) {
      var v = k === "stage" ? (NAME[data[k]] ? NAME[data[k]] + " (" + LONG[data[k]] + ")" : "Not sure") : data[k];
      return LABELS[k] + ": " + v;
    }).join("\n");
  }

  function finish(data, fallback) {
    form.hidden = true;
    var done = $("[data-done]");
    done.hidden = false;
    $("[data-done-email]").textContent = data.email || "your email";
    var fb = $("[data-fallback]");
    if (fallback) {
      $("[data-done-title]").textContent = "Almost there. One more tap.";
      $("[data-done-text]").hidden = true;
      $(".done__next", done).hidden = true;
      fb.hidden = false;
      var subject = "Game submission: " + (data.game_link || "");
      var mail = "mailto:" + (CFG.contactEmail || "") + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(summary(data));
      $("[data-mailto]").href = mail;
      $("[data-copy]").addEventListener("click", function (e) {
        var text = summary(data);
        var btn = e.currentTarget;
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
          btn.textContent = "Copied";
        }, function () { btn.textContent = "Copy failed. Select the text manually"; });
      });
    } else {
      store(DRAFT_KEY, null);
    }
    done.focus({ preventScroll: true });
    done.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  }

  function initForm() {
    if (!form) return;
    captureSource();
    restoreDraft();
    syncCarry();
    showStep(1);

    $("[data-next]", form).addEventListener("click", function () {
      if (validate(step)) showStep(step + 1, true);
    });
    $("[data-prev]", form).addEventListener("click", function () { showStep(step - 1, true); });
    form.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && e.target.tagName === "INPUT" && step < 5) {
        e.preventDefault();
        if (validate(step)) showStep(step + 1, true);
      }
    });
    form.addEventListener("input", function (e) {
      if (e.target.id === "f-link") checkLink();
      if (e.target.classList.contains("is-invalid")) e.target.classList.remove("is-invalid");
      saveDraft();
    });
    form.addEventListener("change", saveDraft);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (step < 5) { if (validate(step)) showStep(step + 1, true); return; }
      for (var i = 1; i <= 5; i++) {
        if (!validate(i)) {
          if (i !== step) { showStep(i, true); validate(i); }
          return;
        }
      }
      var data = collect();
      data.submitted_at = new Date().toISOString();
      data.page = location.href.split("#")[0];
      if (!CFG.formEndpoint) { finish(data, true); return; }

      var btn = $("[data-submit]", form);
      btn.classList.add("is-loading");
      btn.firstChild.textContent = "Sending… ";
      fetch(CFG.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.assign({ _subject: "New game submission: " + (data.game_link || "") }, data))
      }).then(function (res) {
        if (!res.ok) throw new Error(res.status);
        finish(data, false);
      }).catch(function () {
        btn.classList.remove("is-loading");
        btn.firstChild.textContent = "Send my game ";
        setError("That didn't send. Check your connection and try again. Your answers are saved.");
      });
    });
  }

  /* ---------------------------------------------------------------- mobile dock */
  function initDock() {
    var dock = $("[data-dock]");
    if (!dock || !("IntersectionObserver" in window)) return;
    var heroCta = $(".hero__actions");
    var heroVisible = true, inForm = false, inFinder = false;
    function update() {
      var on = !heroVisible && !inForm && !inFinder;
      dock.classList.toggle("is-on", on);
      dock.setAttribute("aria-hidden", String(!on));
      $("a", dock).tabIndex = on ? 0 : -1;
    }
    new IntersectionObserver(function (en) { heroVisible = en[0].isIntersecting; update(); }).observe(heroCta);
    // the form and footer have their own buttons
    var seen = new Map();
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { seen.set(x.target, x.isIntersecting); });
      inForm = Array.from(seen.values()).some(Boolean);
      update();
    }, { rootMargin: "0px 0px -10% 0px" });
    [$("#submit"), $(".footer__cta")].forEach(function (b) { if (b) io.observe(b); });
    // inside the Leak Map each checkpoint has its own "Fix my…" button, and the room matters more
    new IntersectionObserver(function (en) { inFinder = en[0].isIntersecting; update(); }, { rootMargin: "-35% 0px -35% 0px" }).observe($("#panel-map").parentElement);
  }

  /* ---------------------------------------------------------------- boot */
  wireConfig();
  initHeader();
  initFinder();
  initAccordions();
  initForm();
  initDock();
  initReveals();
  initSpotlight();
})();
