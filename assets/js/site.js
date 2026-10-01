/*
  Site interactions. No dependencies, no build step.
  Review mode · config links · header & menu · reveals · my games · live showcase ·
  the story · services · leak finder · accordions · send form · mobile dock
*/
(function () {
  "use strict";

  var CFG = window.SITE_CONFIG || {};
  var root = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var desktop = window.matchMedia("(min-width: 1000px)");

  var PROBLEM = {
    click: "Nobody clicks it", hook: "Players quit in the first minute", loop: "They get bored fast",
    d1: "They don't come back tomorrow", d7: "They're gone within a week", spend: "They play, but nobody buys",
    new: "It's not out yet", unsure: "Not sure"
  };

  function store(key, val) {
    try {
      if (val === undefined) return JSON.parse(localStorage.getItem(key) || "null");
      if (val === null) localStorage.removeItem(key); else localStorage.setItem(key, JSON.stringify(val));
    } catch (e) { return null; }
  }
  function scrollToEl(el, block) {
    el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: block || "start" });
  }

  /* ------------------------------------------------ review mode
     Only visible while reviewMode is on in config.js. The page looks exactly like the
     live site until you press "Show", which marks proposed values and empty proof slots. */
  function initReview() {
    if (root.dataset.review !== "on") return;
    var proposed = $$("[data-proposed]").length, needs = $$("[data-needs]").length;
    var pill = document.createElement("div");
    pill.className = "review-pill";
    pill.innerHTML = "<span>Review mode · " + proposed + " proposed · " + needs + " to fill</span><button type=\"button\">Show</button>";
    document.body.appendChild(pill);
    var btn = $("button", pill);
    btn.addEventListener("click", function () {
      var on = !root.hasAttribute("data-review-show");
      if (on) root.setAttribute("data-review-show", ""); else root.removeAttribute("data-review-show");
      btn.textContent = on ? "Hide" : "Show";
    });
  }

  /* ------------------------------------------------ config links */
  function wireConfig() {
    var links = { "[data-tiktok]": CFG.tiktokUrl, "[data-discord]": CFG.discordUrl, "[data-email]": CFG.contactEmail ? "mailto:" + CFG.contactEmail : "" };
    Object.keys(links).forEach(function (sel) {
      if (!links[sel]) return;
      $$(sel).forEach(function (a) {
        a.href = links[sel];
        a.hidden = false;
        if (/^https?:/.test(links[sel])) { a.target = "_blank"; a.rel = "noopener"; }
      });
    });
    $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });
    if (CFG.gamesWorkedOn) $$("[data-worked]").forEach(function (el) { el.textContent = CFG.gamesWorkedOn + "+"; });

    // the "DM me on Discord" card next to the form
    $$("[data-discord-card]").forEach(function (a) { if (CFG.discordUrl) a.href = CFG.discordUrl; });
    var user = String(CFG.discordUsername || "").replace(/^@/, "").trim();
    if (user) {
      $$("[data-discord-user]").forEach(function (el) { el.textContent = "@" + user; el.hidden = false; });
      $$("[data-copy-discord]").forEach(function (b) {
        b.hidden = false;
        b.addEventListener("click", function () {
          var label = $("span", b);
          (navigator.clipboard ? navigator.clipboard.writeText(user) : Promise.reject()).then(
            function () { label.textContent = "Copied @" + user; },
            function () { label.textContent = "@" + user; });
          setTimeout(function () { label.textContent = "Copy username"; }, 2200);
        });
      });
    }
    var rows = $("[data-contact-rows]");
    if (rows && (CFG.contactEmail || CFG.tiktokUrl)) {
      rows.hidden = false;
      if (CFG.contactEmail) { $("[data-row-email]", rows).hidden = false; $("[data-email-text]", rows).textContent = CFG.contactEmail; }
      if (CFG.tiktokUrl) $("[data-row-tiktok]", rows).hidden = false;
    }
  }

  /* ------------------------------------------------ run animations only while they're on screen */
  function whenVisible(el, start, stop) {
    var vis = false, on = false;
    function sync() {
      var want = vis && !document.hidden;
      if (want === on) return;
      on = want;
      el.classList.toggle("is-live", on);
      if (on) { if (start) start(); } else if (stop) stop();
    }
    if (!("IntersectionObserver" in window)) { vis = true; sync(); return; }
    new IntersectionObserver(function (en) { vis = en[0].isIntersecting; sync(); }, { rootMargin: "80px 0px" }).observe(el);
    document.addEventListener("visibilitychange", sync);
  }
  function ticker(el, ms, fn) {
    var t = 0;
    whenVisible(el, function () { fn(); t = setInterval(fn, ms); }, function () { clearInterval(t); t = 0; });
  }

  /* ------------------------------------------------ header & menu */
  function initHeader() {
    var header = $("[data-header]"), btn = $("[data-menu-btn]"), menu = $("[data-menu]");
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    function setMenu(open) {
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
    desktop.addEventListener("change", function () { if (desktop.matches) setMenu(false); });

    if (!("IntersectionObserver" in window)) return;
    var links = $$(".nav a"), map = {};
    links.forEach(function (a) { map[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.classList.toggle("is-current", a === map[en.target.id]); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main > section[id]").forEach(function (s) { io.observe(s); });
  }

  /* ------------------------------------------------ reveals */
  function initReveals() {
    var els = $$(".rv");
    var count = new Map();
    els.forEach(function (el) {
      var p = el.parentElement, n = count.get(p) || 0;
      el.style.setProperty("--d", String(Math.min(n, 4)));
      count.set(p, n + 1);
    });
    if (!("IntersectionObserver" in window) || reduceMotion) { els.forEach(function (el) { el.classList.add("is-in"); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    els.forEach(function (el) { io.observe(el); });
  }

  // Roblox's thumbs-up and player icons, used in every game list on the page
  var THUMB = '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" fill="currentColor"><path d="M2 7h2.5v7H2zM6 14V7.2L9 2c1 0 1.7.8 1.5 1.8L10 6h3.4c.9 0 1.6.9 1.4 1.8l-1.2 5A1.5 1.5 0 0 1 12.1 14z"/></svg>';
  var PERSON = '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" fill="currentColor"><circle cx="8" cy="5" r="3"/><path d="M2.5 14c.6-3 2.8-4.5 5.5-4.5s4.9 1.5 5.5 4.5z"/></svg>';

  /* ------------------------------------------------ my games: profile, stats and leaderboard
     Data comes from assets/data/roblox.js, which the GitHub workflow refreshes from Roblox.
     While it still holds the example games, the stats and leaderboard only show in review mode. */
  function compact(n) {
    if (n == null) return "—";
    if (n >= 1e9) return (n / 1e9).toFixed(n >= 1e10 ? 0 : 1).replace(/\.0$/, "") + "B";
    if (n >= 1e6) return (n / 1e6).toFixed(n >= 1e7 ? 0 : 1).replace(/\.0$/, "") + "M";
    if (n >= 1e4) return (n / 1e3).toFixed(n >= 1e5 ? 0 : 1).replace(/\.0$/, "") + "K";
    return Math.round(n).toLocaleString("en-US");
  }
  function ago(iso) {
    if (!iso) return "";
    var h = Math.round((Date.now() - new Date(iso).getTime()) / 36e5);
    return h < 1 ? "updated just now" : h < 48 ? "updated " + h + "h ago" : "updated " + Math.round(h / 24) + " days ago";
  }
  function countUp(el, to, format) {
    if (to == null) { el.textContent = "—"; return; }
    if (reduceMotion) { el.textContent = format(to); return; }
    var t0 = performance.now(), dur = 1600;
    (function step(now) {
      var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = format(to * e);
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  }

  function initGames() {
    var section = $("[data-games]");
    var data = window.ROBLOX_DATA || { example: true, games: [] };
    var reviewOn = root.dataset.review === "on";
    var real = !data.example && data.games && data.games.length;
    var showData = real || reviewOn;

    // avatar: your real Roblox headshot once robloxUserId is set; the placeholder only in review mode
    var headshot = real && data.headshot ? data.headshot : null;
    $$("[data-headshot]").forEach(function (img) {
      if (!headshot) return;
      img.src = headshot;
      img.hidden = false;
    });
    if (!section) return;
    if (!showData) { section.classList.add("is-intro-only"); return; }

    var games = (data.games || []).slice().sort(function (a, b) { return (b.visits || 0) - (a.visits || 0); });
    var sum = function (key) { return games.reduce(function (s, g) { return s + (g[key] || 0); }, 0); };
    var total = sum("visits"), playing = sum("playing"), favorites = sum("favorites");
    var peaks = games.map(function (g) { return g.peakCCU; }).filter(function (v) { return v != null; });
    var peak = peaks.length ? Math.max.apply(null, peaks) : null;
    var maxVisits = games.length ? games[0].visits || 1 : 1;
    var hasPeak = peak != null;
    // the board shows the biggest games; config.js holds how many you've worked on in total
    var worked = real ? +CFG.gamesWorkedOn || 0 : 0;

    // Roblox doesn't publish peak CCU. Until you add it in data/roblox.config.json, that tile
    // shows total favorites and the leaderboard's second column shows players online now.
    if (!hasPeak) {
      $("[data-peak-label]").textContent = "Favorites";
      $("[data-peak-sub]").textContent = "players who saved these games";
      $("[data-col2]").textContent = "Playing";
    }

    var board = $("[data-board]"), rows = $("[data-board-rows]");
    if (!real) {
      board.classList.add("is-example");
      $("[data-board-example]").hidden = false;
      $("[data-board-foot]").textContent = "Example data. Your real games appear here with live numbers from Roblox.";
      $("[data-stat-updated]").textContent = "example data";
    } else {
      $("[data-board-foot]").textContent = (worked > games.length ? "My " + games.length + " biggest of " + worked + "+. " : "") +
        "Visits and live players come straight from Roblox, " + ago(data.updatedAt) + ".";
      $("[data-stat-updated]").textContent = "live from Roblox";
      if (worked > games.length) $("[data-count-sub]").textContent = "the " + games.length + " biggest are on the board";
    }

    rows.innerHTML = "";
    games.forEach(function (g, i) {
      var li = document.createElement("li");
      li.className = "row";
      li.style.setProperty("--i", i);
      li.style.setProperty("--share", ((g.visits || 0) / maxVisits).toFixed(3));
      var link = document.createElement(real && g.url ? "a" : "div");
      link.className = "row__link";
      if (link.tagName === "A") { link.href = g.url; link.target = "_blank"; link.rel = "noopener"; }
      var meta = [];
      if (g.creator) meta.push('<span class="row__studio"></span>');
      if (hasPeak && g.playing != null) meta.push('<span><i class="live"></i>' + compact(g.playing) + " playing</span>");
      if (g.likeRatio != null) meta.push("<span>" + THUMB + g.likeRatio + "%</span>");
      var col2 = hasPeak ? compact(g.peakCCU) : '<i class="live"></i>' + compact(g.playing);
      link.innerHTML =
        '<span class="row__rank">' + (i + 1) + "</span>" +
        '<img class="row__icon" alt="" loading="lazy" decoding="async">' +
        '<span class="row__name"><b></b><small>' + meta.join("") + "</small></span>" +
        '<span class="row__stats"><span>' + compact(g.visits) + '</span><span class="' + (hasPeak ? "is-peak" : "is-live") + '">' + col2 + "</span></span>";
      $("img", link).src = g.icon;
      $("b", link).textContent = g.name;
      if (g.creator) $(".row__studio", link).textContent = "by " + g.creator;
      li.appendChild(link);
      rows.appendChild(li);
    });

    // Discover-style tiles with each game's official thumbnail
    var tiles = $("[data-tiles]"), withThumbs = games.filter(function (g) { return g.thumb; });
    if (real && tiles && withThumbs.length) {
      tiles.innerHTML = "";
      withThumbs.forEach(function (g) {
        var li = document.createElement("li");
        li.className = "tile";
        li.innerHTML =
          '<a class="tile__link" target="_blank" rel="noopener">' +
          '<span class="tile__img"><img alt="" loading="lazy" decoding="async" width="768" height="432"></span>' +
          '<b class="tile__name"></b>' +
          '<span class="tile__meta"><span>' + THUMB + (g.likeRatio != null ? g.likeRatio + "%" : "—") + "</span>" +
          "<span>" + PERSON + compact(g.playing) + "</span></span></a>";
        $("a", li).href = g.url;
        $("a", li).setAttribute("aria-label", g.name + " on Roblox");
        $("img", li).src = g.thumb;
        $(".tile__name", li).textContent = g.name;
        tiles.appendChild(li);
      });
      $("[data-tiles-wrap]").hidden = false;
    }

    // hovering a stat lights up the game it comes from
    function hot(index) { $$(".row", rows).forEach(function (r, i) { r.classList.toggle("is-hot", i === index); }); }
    function indexOfMax(key) {
      var best = -1, v = -Infinity;
      games.forEach(function (g, i) { if (g[key] != null && g[key] > v) { v = g[key]; best = i; } });
      return best;
    }
    var owner = { visits: 0, peak: indexOfMax(hasPeak ? "peakCCU" : "favorites"), playing: indexOfMax("playing"), count: -1 };
    $$("[data-stat-for]").forEach(function (el) {
      var key = el.getAttribute("data-stat-for");
      el.addEventListener("mouseenter", function () { hot(owner[key]); });
      el.addEventListener("mouseleave", function () { hot(-1); });
    });

    var started = false;
    function start() {
      if (started) return;
      started = true;
      board.classList.add("is-in");
      var whole = function (n) { return Math.round(n).toLocaleString("en-US"); };
      countUp($('[data-stat="visits"]'), total, compact);
      countUp($('[data-stat="peak"]'), hasPeak ? peak : favorites, hasPeak ? whole : compact);
      countUp($('[data-stat="playing"]'), playing, whole);
      var many = worked > games.length;
      countUp($('[data-stat="count"]'), many ? worked : games.length, function (n) { return Math.round(n) + (many ? "+" : ""); });
    }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { start(); io.disconnect(); } }, { threshold: 0.2 });
      io.observe(section);
    } else start();
  }

  /* ------------------------------------------------ hero: live showcase of the real games
     A carousel of the official Roblox thumbnails, sorted by who's playing right now.
     Every number comes from assets/data/roblox.js, refreshed from Roblox every 6 hours. */
  function realGames() {
    var data = window.ROBLOX_DATA || {};
    if (data.example || !data.games) return [];
    return data.games.filter(function (g) { return g.thumb; });
  }

  function initLive() {
    var box = $("[data-live]");
    if (!box) return;
    var data = window.ROBLOX_DATA || {};
    var games = realGames().sort(function (a, b) { return (b.playing || 0) - (a.playing || 0); });
    if (!games.length) { box.hidden = true; return; }

    var stage = $("[data-live-stage]"), strip = $("[data-live-strip]");
    var updated = ago(data.updatedAt);
    $("[data-live-updated]").textContent = updated ? updated.charAt(0).toUpperCase() + updated.slice(1) : "";
    var playing = games.reduce(function (s, g) { return s + (g.playing || 0); }, 0);

    var slides = [], dots = [];
    games.forEach(function (g, i) {
      var a = document.createElement("a");
      a.className = "slide";
      a.href = g.url; a.target = "_blank"; a.rel = "noopener";
      a.innerHTML =
        '<img class="slide__img" alt="" width="768" height="432"' + (i > 0 ? ' loading="lazy"' : "") + ">" +
        '<span class="slide__info"><img class="slide__icon" alt="" width="44" height="44"><span class="slide__name"><b></b><small></small></span>' +
        '<span class="slide__stat"><i class="live"></i>' + compact(g.playing) + " playing</span></span>";
      $(".slide__img", a).src = g.thumb;
      $(".slide__icon", a).src = g.icon;
      $("b", a).textContent = g.name;
      $("small", a).textContent = "by " + g.creator + (g.likeRatio != null ? " · " + g.likeRatio + "% liked" : "");
      a.setAttribute("aria-label", g.name + " by " + g.creator + ", " + compact(g.playing) + " playing now. Opens on Roblox.");
      stage.appendChild(a);
      slides.push(a);

      var li = document.createElement("li");
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Show " + g.name);
      b.innerHTML = '<img alt="" width="64" height="64" loading="lazy">';
      $("img", b).src = g.icon;
      b.addEventListener("click", function () { show(i, true); });
      li.appendChild(b);
      strip.appendChild(li);
      dots.push(b);
    });
    strip.style.gridTemplateColumns = "repeat(" + games.length + ", minmax(0, 1fr))";

    var current = -1, timer = 0, DUR = 5000, visible = true, hovered = false;
    box.style.setProperty("--dur", DUR / 1000 + "s");
    function show(i, user) {
      if (i === current) return;
      current = i;
      slides.forEach(function (s, k) { s.classList.toggle("is-on", k === i); });
      dots.forEach(function (d, k) {
        d.classList.toggle("is-on", k === i);
        d.setAttribute("aria-current", k === i ? "true" : "false");
      });
      if (user) restart();
    }
    function next() { show((current + 1) % games.length); }
    function stop() { clearInterval(timer); timer = 0; }
    function restart() {
      stop();
      if (reduceMotion || hovered || !visible || document.hidden) return;
      timer = setInterval(next, DUR);
    }
    box.addEventListener("pointerenter", function () { hovered = true; box.classList.add("is-paused"); stop(); });
    box.addEventListener("pointerleave", function () { hovered = false; box.classList.remove("is-paused"); restart(); });
    box.addEventListener("focusin", function () { hovered = true; stop(); });
    box.addEventListener("focusout", function () { hovered = false; restart(); });
    document.addEventListener("visibilitychange", restart);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; restart(); }).observe(box);
    }
    show(0);
    restart();
    countUp($("[data-live-total]"), playing, function (n) { return Math.round(n).toLocaleString("en-US"); });
  }

  /* ------------------------------------------------ closing: moving wall of the real thumbnails */
  function initWall() {
    var wall = $("[data-wall]");
    if (!wall) return;
    var games = realGames();
    if (!games.length) { wall.hidden = true; return; }
    var rows = $$("[data-wall-row]", wall);
    rows.forEach(function (row, r) {
      var list = r ? games.slice().reverse() : games;
      // two copies side by side so the scroll loops seamlessly
      list.concat(list, list.length < 5 ? list.concat(list) : []).forEach(function (g) {
        var img = document.createElement("img");
        img.alt = "";
        img.loading = "lazy";
        img.decoding = "async";
        img.width = 768; img.height = 432;
        img.src = g.thumb;
        row.appendChild(img);
      });
    });
  }

  /* ------------------------------------------------ the story: words light up as you scroll */
  function initCreed() {
    var sec = $("[data-creed]"), text = $("[data-creed-text]");
    if (!sec || !text) return;
    var words = [];
    (function wrap(node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 1) { wrap(n); return; }
        if (n.nodeType !== 3) return;
        var frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(function (part) {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
          var w = document.createElement("span");
          w.className = "w";
          w.textContent = part;
          frag.appendChild(w);
          words.push(w);
        });
        node.replaceChild(frag, n);
      });
    })(text);
    if (reduceMotion || !("IntersectionObserver" in window)) { words.forEach(function (w) { w.classList.add("is-lit"); }); return; }

    var lit = -1, raf = 0;
    function update() {
      raf = 0;
      // starts when the text's top reaches 85% down the screen, done when its bottom passes 45%
      var r = text.getBoundingClientRect(), vh = window.innerHeight;
      var p = Math.max(0, Math.min(1, (vh * 0.85 - r.top) / (vh * 0.4 + r.height)));
      var n = Math.round(p * words.length);
      if (n === lit) return;
      lit = n;
      words.forEach(function (w, i) { w.classList.toggle("is-lit", i < n); });
    }
    function onScroll() { if (!raf) raf = requestAnimationFrame(update); }
    whenVisible(sec, function () { window.addEventListener("scroll", onScroll, { passive: true }); update(); },
      function () { window.removeEventListener("scroll", onScroll); });
  }

  /* ------------------------------------------------ services: one live illustration per service
     Nothing in them is made up. They're built from assets/data/roblox.js: the games' real
     thumbnails, live player counts, game passes and prices, badges and update dates. */
  function warm(src) { if (src) { var i = new Image(); i.decoding = "async"; i.src = src; } }
  function pulse(el, cls, ms) { el.classList.add(cls); setTimeout(function () { el.classList.remove(cls); }, ms); }

  // 01 build: a real game's thumbnail drops in brick by brick, then goes live
  function initMosaic(vis, games) {
    var tiles = $("[data-mosaic]", vis), cap = $("[data-mosaic-cap]", vis);
    var list = games.filter(function (g) { return g.thumb; });
    if (!tiles || !list.length) return;
    var COLS = 12, ROWS = 7;
    tiles.style.setProperty("--cols", COLS);
    tiles.style.setProperty("--rows", ROWS);
    for (var r = 0; r < ROWS; r++) {
      for (var c = 0; c < COLS; c++) {
        var t = document.createElement("i");
        t.style.backgroundPosition = (c / (COLS - 1) * 100).toFixed(2) + "% " + (r / (ROWS - 1) * 100).toFixed(2) + "%";
        // from the ground up, with a little jitter so it doesn't look mechanical
        t.style.setProperty("--k", (ROWS - 1 - r) * COLS + c + Math.floor(Math.random() * 6));
        tiles.appendChild(t);
      }
    }
    function show(g) {
      tiles.style.setProperty("--img", 'url("' + g.thumb + '")');
      $("img", cap).src = g.icon;
      $("b", cap).textContent = g.name;
      $("small", cap).textContent = compact(g.visits) + " visits · by " + g.creator;
    }
    if (reduceMotion) { show(list[0]); vis.classList.add("is-built", "is-done"); return; }
    var n = 0;
    show(list[0]);
    ticker(vis, 7600, function () {
      var g = list[n++ % list.length], first = n === 1;
      warm(list[n % list.length].thumb);
      vis.classList.remove("is-built", "is-done");
      setTimeout(function () { show(g); vis.classList.add("is-built"); }, first ? 60 : 450);
      setTimeout(function () { vis.classList.add("is-done"); }, first ? 2960 : 3350);
    });
  }

  // 02 grow: the games sort themselves by who's playing right now, #1 climbing from the bottom
  function initRank(vis, games) {
    var list = $("[data-rank]", vis);
    var top = games.filter(function (g) { return g.playing != null; })
      .sort(function (a, b) { return b.playing - a.playing; }).slice(0, 5);
    if (!list || top.length < 2) return;
    var rows = top.map(function (g) {
      var li = document.createElement("li");
      li.innerHTML = '<b></b><img alt="" width="64" height="64"><span class="v-rank__name"><strong></strong><small></small></span>' +
        '<span class="v-rank__n">' + PERSON + "<em></em></span>";
      $("img", li).src = g.icon;
      $("strong", li).textContent = g.name;
      $("small", li).innerHTML = THUMB + (g.likeRatio != null ? g.likeRatio + "%" : "—");
      $("em", li).textContent = compact(g.playing);
      list.appendChild(li);
      return li;
    });
    var N = rows.length, slot = [];
    list.style.setProperty("--n", N);
    function place(i, s) { slot[i] = s; rows[i].style.setProperty("--p", s); $("b", rows[i]).textContent = s + 1; }
    function scramble() { rows.forEach(function (li, i) { place(i, N - 1 - i); li.classList.remove("is-up", "is-top"); }); }
    // one step: the best game that isn't in its spot yet climbs one row
    function climb() {
      for (var s = 0; s < N; s++) {
        if (slot[s] === s) continue;
        var cur = slot[s], other = slot.indexOf(slot[s] - 1);
        place(s, cur - 1);
        place(other, cur);
        rows.forEach(function (li, i) { li.classList.toggle("is-up", i === s); });
        return true;
      }
      rows.forEach(function (li) { li.classList.remove("is-up"); });
      rows[0].classList.add("is-top");
      return false;
    }
    scramble();
    if (reduceMotion) { while (climb()) {} return; }
    var hold = 0;
    ticker(vis, 760, function () {
      if (climb()) return;
      if (++hold < 4) return;
      hold = 0;
      list.classList.add("is-fading");
      setTimeout(function () {
        list.classList.add("is-reset");
        scramble();
        void list.offsetWidth;
        list.classList.remove("is-reset", "is-fading");
      }, 320);
    });
  }

  // 03 creative: two real thumbnails of the same game, side by side
  function initAB(vis, games) {
    var pair = $("[data-ab]", vis), cap = $("[data-ab-cap]", vis);
    var list = games.filter(function (g) { return g.thumbs && g.thumbs.length > 1; });
    if (!pair || !list.length) return;
    var imgs = $$(".v-thumb img", pair);
    function show(g) {
      imgs[0].src = g.thumbs[1];
      imgs[1].src = g.thumbs[0];
      $("img", cap).src = g.icon;
      $("span", cap).textContent = g.name;
    }
    if (reduceMotion) { show(list[0]); pair.classList.add("is-in", "is-done"); return; }
    var n = 0;
    show(list[0]);
    ticker(vis, 5400, function () {
      var g = list[n++ % list.length], first = n === 1;
      warm(list[n % list.length].thumbs[0]);
      warm(list[n % list.length].thumbs[1]);
      pair.classList.remove("is-in", "is-done");
      setTimeout(function () { show(g); pair.classList.add("is-in"); }, first ? 0 : 380);
      setTimeout(function () { pair.classList.add("is-done"); }, first ? 1900 : 2300);
    });
  }

  // 04 earn: the game's real store. Three passes from across its price ladder, and the purchase prompt
  function initStore(vis, games) {
    var grid = $("[data-store]", vis), prompt = $("[data-prompt]", vis), cursor = $("[data-cursor]", vis);
    var list = games.filter(function (g) { return g.passes && g.passes.length >= 3; });
    if (!grid || !list.length) return;
    var items = [], gi = 0, step = 0;
    function load(g) {
      $("[data-store-icon]", vis).src = g.icon;
      $("[data-store-name]", vis).textContent = g.name;
      $("[data-store-count]", vis).textContent = g.passCount + " passes";
      var p = g.passes, pick = [p[0], p[Math.floor((p.length - 1) / 2)], p[p.length - 1]];
      grid.innerHTML = "";
      items = pick.map(function (pass) {
        var d = document.createElement("div");
        d.className = "v-pass";
        d.innerHTML = '<span class="v-pass__art"><img alt="" width="150" height="150"></span><b></b>' +
          '<span class="v-rbx"><svg viewBox="0 0 16 16"><use href="#robux"/></svg><span></span></span>';
        $("img", d).src = pass.icon;
        $("b", d).textContent = pass.name;
        $(".v-rbx span", d).textContent = pass.price.toLocaleString("en-US");
        grid.appendChild(d);
        return { el: d, pass: pass };
      });
      step = 0;
    }
    function point(el, x, y) {
      var a = vis.getBoundingClientRect(), r = el.getBoundingClientRect();
      cursor.style.transform = "translate(" + Math.round(r.left - a.left + r.width * x) + "px," + Math.round(r.top - a.top + r.height * y) + "px)";
    }
    function buy(item) {
      vis.classList.remove("is-prompt", "is-bought");
      items.forEach(function (it) { it.el.classList.toggle("is-hover", it === item); });
      cursor.classList.add("is-on");
      point(item.el, 0.6, 0.55);
      setTimeout(function () {
        pulse(cursor, "is-click", 200);
        $("img", prompt).src = item.pass.icon;
        $("b", prompt).textContent = item.pass.name;
        $(".v-rbx span", prompt).textContent = item.pass.price.toLocaleString("en-US");
        vis.classList.add("is-prompt");
      }, 750);
      setTimeout(function () { point($(".v-prompt__btn", prompt), 0.55, 0.6); }, 1250);
      setTimeout(function () { pulse(cursor, "is-click", 200); vis.classList.add("is-bought"); }, 1950);
      setTimeout(function () { vis.classList.remove("is-prompt"); items.forEach(function (it) { it.el.classList.remove("is-hover"); }); }, 2900);
    }
    load(list[0]);
    if (reduceMotion) return;
    ticker(vis, 3400, function () {
      if (step < items.length) { buy(items[step++]); return; }
      // next game's store
      cursor.classList.remove("is-on");
      vis.classList.add("is-switch");
      setTimeout(function () { load(list[++gi % list.length]); vis.classList.remove("is-switch"); }, 350);
    });
  }

  // 05 code: a script types itself out in Studio, then a real badge from one of the games pops
  function initCode(vis, games) {
    var src = $("[data-code]", vis), toast = $("[data-badge]", vis);
    if (!src) return;
    var lines = $$(".ln", src);
    lines.forEach(function (ln) { ln.style.setProperty("--n", Math.max(1, ln.textContent.length)); });
    var badges = [];
    games.forEach(function (g) { (g.badges || []).forEach(function (b) { badges.push({ b: b, g: g }); }); });
    badges.sort(function (x, y) { return y.b.awarded - x.b.awarded; });
    var bi = 0;
    function award() {
      if (!badges.length || !toast) return;
      var x = badges[bi++ % badges.length];
      $("img", toast).src = x.b.icon;
      $("b", toast).textContent = x.b.name;
      $("em", toast).textContent = x.b.awarded.toLocaleString("en-US") + " players have it · " + x.g.name;
      vis.classList.add("is-done");
    }
    if (reduceMotion) { lines.forEach(function (l) { l.classList.add("is-on"); }); award(); return; }
    var i = 0, hold = 0;
    ticker(vis, 640, function () {
      if (i < lines.length) {
        lines.forEach(function (l) { l.classList.remove("is-cur"); });
        lines[i].classList.add("is-on", "is-cur");
        if (++i === lines.length) setTimeout(award, 500);
        return;
      }
      if (++hold < 6) return;
      hold = 0; i = 0;
      vis.classList.remove("is-done");
      lines.forEach(function (l) { l.classList.remove("is-on", "is-cur"); });
    });
  }

  // 06 partner: which games were updated in the last 7 days, straight from Roblox
  function initUpdates(vis, games) {
    var days = $("[data-upd]", vis), foot = $("[data-upd-foot]", vis), count = $("[data-upd-count]", vis);
    if (!days) return;
    var DAY = 864e5, today = new Date(); today.setHours(0, 0, 0, 0);
    var cols = [];
    for (var d = 6; d >= 0; d--) {
      var date = new Date(today.getTime() - d * DAY);
      var col = document.createElement("div");
      col.className = "v-upd__col";
      col.innerHTML = '<span class="v-upd__icons"></span><span class="v-upd__day"></span>';
      $(".v-upd__day", col).textContent = d === 0 ? "Today" : date.toLocaleDateString("en-US", { weekday: "short" });
      days.appendChild(col);
      cols.push({ el: col, games: [] });
    }
    var recent = games.filter(function (g) {
      if (!g.updated) return false;
      var u = new Date(g.updated); u.setHours(0, 0, 0, 0);
      var ago = Math.round((today - u) / DAY);
      if (ago < 0 || ago > 6) return false;
      cols[6 - ago].games.push(g);
      return true;
    });
    cols.forEach(function (c) {
      c.games.forEach(function (g) {
        var img = document.createElement("img");
        img.alt = ""; img.width = 64; img.height = 64; img.src = g.icon;
        $(".v-upd__icons", c.el).appendChild(img);
      });
    });
    count.innerHTML = '<i class="live"></i>' + recent.length + " of " + games.length;
    var fImg = $("img", foot), fText = $("span", foot);
    function say(g, label) {
      fImg.hidden = !g;
      if (g) fImg.src = g.icon;
      fText.textContent = label;
    }
    var summary = recent.length + " of " + games.length + " games updated this week";
    function finish() {
      cols.forEach(function (c) { c.el.classList.add("is-on"); c.el.classList.remove("is-now"); });
      say(null, summary);
    }
    if (reduceMotion || !recent.length) { finish(); return; }
    var s = -1, hold = 0;
    ticker(vis, 820, function () {
      if (s < 6) {
        s++;
        cols.forEach(function (c, k) { c.el.classList.toggle("is-on", k <= s); c.el.classList.toggle("is-now", k === s); });
        var hit = cols[s].games;
        if (hit.length) {
          var when = s === 6 ? "Today" : $(".v-upd__day", cols[s].el).textContent;
          say(hit[0], when + " · " + hit[0].name + (hit.length > 1 ? " & " + (hit.length - 1) + " more" : ""));
        }
        if (s === 6) setTimeout(finish, 600);
        return;
      }
      if (++hold < 5) return;
      hold = 0; s = -1;
      cols.forEach(function (c) { c.el.classList.remove("is-on", "is-now"); });
      say(null, "Checking this week's updates…");
    });
  }

  // "Message me anyway": a Discord inbox with the kind of requests Roblox devs actually send
  var DMS = [
    ["zoomzoom.kart", "yo can u cut a trailer for my update this friday?"],
    ["pixelpanda08", "ccu went from 800 to 200 after the update 😭 can u look"],
    ["captain.cube", "need a pet + egg hatching system, how much?"],
    ["minty.mango", "how do i get my game on the home page"],
    ["speedybacon", "can you make my icon actually pop lol"],
    ["lunar.owlet", "wanna run an admin abuse event saturday, can u help"],
    ["blockboss3000", "game lags on mobile, need it fixed asap"],
    ["lil.tycoon", "what should my gamepasses cost?"],
    ["starry.mia", "got a game idea, can you build it from scratch?"],
    ["frosty.flakes", "need someone to run our tiktok fr"]
  ];
  var DISCORD_COLORS = ["#5865F2", "#757E8A", "#3BA55C", "#FAA61A", "#ED4245", "#EB459F"];
  function initAsks() {
    var list = $("[data-asks]"), count = $("[data-asks-count]");
    if (!list) return;
    var i = 0;
    function clock(minsAgo) {
      return "Today at " + new Date(Date.now() - minsAgo * 6e4).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
    }
    function push(minsAgo) {
      var dm = DMS[i % DMS.length];
      var li = document.createElement("li");
      li.innerHTML = '<span class="dcw__av"><svg viewBox="0 0 24 24"><use href="#discord"/></svg></span>' +
        '<span class="dcw__msg"><span class="dcw__line"><b></b><time></time></span><span class="dcw__txt"></span></span>';
      $(".dcw__av", li).style.background = DISCORD_COLORS[i % DISCORD_COLORS.length];
      $("b", li).textContent = dm[0];
      $("time", li).textContent = clock(minsAgo);
      $(".dcw__txt", li).textContent = dm[1];
      list.insertBefore(li, list.firstChild);
      while (list.children.length > 4) list.removeChild(list.lastChild);
      i++;
      if (count) count.textContent = Math.min(i, 9) + (i > 9 ? "+" : "");
    }
    push(9); push(4); push(1);
    $$("li", list).forEach(function (li) { li.style.animation = "none"; });
    if (reduceMotion) return;
    ticker(list, 3000, function () { push(0); });
  }

  // tilt and glare on the cards you can touch
  function tilt(card, max) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--mx", Math.round(x * r.width) + "px");
      card.style.setProperty("--my", Math.round(y * r.height) + "px");
      if (max) {
        card.style.setProperty("--ry", ((x - 0.5) * max).toFixed(2) + "deg");
        card.style.setProperty("--rx", ((0.5 - y) * max).toFixed(2) + "deg");
      }
    });
    if (max) card.addEventListener("pointerleave", function () { card.style.setProperty("--rx", "0deg"); card.style.setProperty("--ry", "0deg"); });
  }

  function initServices() {
    var games = realGames();
    var MAKE = { mosaic: initMosaic, rank: initRank, ab: initAB, shop: initStore, code: initCode, updates: initUpdates };
    $$("[data-vis]").forEach(function (vis) {
      var make = MAKE[vis.getAttribute("data-vis")];
      if (make && games.length) make(vis, games);
    });
    initAsks();

    // "…and a lot more": two copies of each row so the scroll loops seamlessly
    $$("[data-more-row]").forEach(function (row) {
      $$("li", row).forEach(function (li) {
        var c = li.cloneNode(true);
        c.setAttribute("aria-hidden", "true");
        row.appendChild(c);
      });
      whenVisible(row);
    });

    if (!window.matchMedia("(hover: hover)").matches || reduceMotion) return;
    $$(".svc, .audit-card").forEach(function (card) { tilt(card, 0); });
    $$("[data-discord-card]").forEach(function (card) { tilt(card, 10); });
  }

  /* ------------------------------------------------ find your leak
     Six bars, one per moment players leave. Tap a bar (or use the arrow keys) to see it. */
  function initLeaks() {
    var wrap = $("[data-funnel]");
    if (!wrap) return;
    var tabs = $$("[data-leak]", wrap), panels = $$("[data-panel]", wrap), unsure = $("[data-leak-unsure]", wrap);
    function open(key, focus) {
      tabs.forEach(function (t) {
        var on = t.getAttribute("data-leak") === key;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on || (key === "unsure" && t === tabs[0]) ? 0 : -1;
        if (on && focus) t.focus();
      });
      if (unsure) { unsure.classList.toggle("is-on", key === "unsure"); unsure.setAttribute("aria-expanded", String(key === "unsure")); }
      panels.forEach(function (p) { p.hidden = p.getAttribute("data-panel") !== key; });
    }
    tabs.forEach(function (t, i) {
      t.addEventListener("click", function () { open(t.getAttribute("data-leak")); });
      t.addEventListener("keydown", function (e) {
        var step = /Right|Down/.test(e.key) ? 1 : /Left|Up/.test(e.key) ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        open(tabs[(i + step + tabs.length) % tabs.length].getAttribute("data-leak"), true);
      });
    });
    if (unsure) unsure.addEventListener("click", function () { open("unsure"); });
    open(tabs[0].getAttribute("data-leak"));
  }

  /* ------------------------------------------------ FAQ accordions */
  function initAccordions() {
    $$(".qa button").forEach(function (b) {
      var qa = b.closest(".qa");
      b.addEventListener("click", function () {
        var open = b.getAttribute("aria-expanded") !== "true";
        b.setAttribute("aria-expanded", String(open));
        if (qa) qa.classList.toggle("is-open", open);
      });
    });
  }

  /* ------------------------------------------------ send form */
  var form = $("[data-form]");
  var steps = $$("[data-fstep]");
  var step = 1;
  var DRAFT = "khaiel-form-v4";

  function setStep(n, focus) {
    step = n;
    steps.forEach(function (f) { f.classList.toggle("is-on", +f.getAttribute("data-fstep") === n); });
    $$(".form__steps li").forEach(function (li, i) {
      li.classList.toggle("is-on", i === n - 1);
      li.classList.toggle("is-done", i < n - 1);
    });
    $("[data-prev]", form).hidden = n === 1;
    $("[data-next]", form).hidden = n === 3;
    $("[data-submit]", form).hidden = n !== 3;
    setError("");
    if (focus) {
      var first = $('[data-fstep="' + n + '"] input:not([type=radio]), [data-fstep="' + n + '"] .chip input', form);
      var top = form.getBoundingClientRect().top;
      if (top < 0 || top > window.innerHeight * 0.4) scrollToEl(form, "start");
      if (first && desktop.matches) first.focus({ preventScroll: true });
    }
  }

  function setError(msg, field) {
    $("[data-form-error]").textContent = msg;
    $$(".is-invalid", form).forEach(function (el) { el.classList.remove("is-invalid"); el.removeAttribute("aria-invalid"); });
    if (field) { field.classList.add("is-invalid"); field.setAttribute("aria-invalid", "true"); field.focus(); }
  }

  function normLink(v) {
    v = (v || "").trim();
    if (v && !/^https?:\/\//i.test(v)) v = "https://" + v;
    return v;
  }
  function noGame() { var c = $("[data-no-game]"); return !!(c && c.checked); }
  function checkLink() {
    var input = $("#f-link"), hint = $("[data-link-hint]"), v = normLink(input.value);
    hint.classList.remove("is-ok", "is-warn");
    if (!input.value.trim()) {
      hint.textContent = noGame() ? "No problem. Tell me about the idea below." : "Copy it from the address bar or the Share button.";
      return false;
    }
    if (!/^https?:\/\/([a-z0-9-]+\.)*(roblox\.com|ro\.blox\.com)(\/|$)/i.test(v)) {
      hint.textContent = "That doesn't look like a Roblox link yet.";
      hint.classList.add("is-warn");
      return false;
    }
    hint.textContent = "Looks good ✓";
    hint.classList.add("is-ok");
    return true;
  }

  function validate(n) {
    if (n === 1) {
      var link = $("#f-link");
      if (!link.value.trim()) {
        if (!noGame()) { setError("Paste your game's Roblox link, or tick “No game yet”.", link); return false; }
      } else {
        if (!checkLink()) { setError("That should be a roblox.com game link.", link); return false; }
        link.value = normLink(link.value);
      }
    }
    if (n === 3) {
      // an email or a Discord username, either is enough to reply
      var email = $("#f-email"), discord = $("#f-discord"), e = email.value.trim();
      if (!e && !discord.value.trim()) { setError("Add an email or your Discord so I can reply.", email); return false; }
      if (e && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) { setError("That email doesn't look right.", email); return false; }
    }
    return true;
  }

  // a problem replaces the previous pick; a service is added to the ones already ticked
  function prefill(o) {
    if (!form) return;
    ["problem", "service"].forEach(function (k) {
      if (!o[k]) return;
      var r = form.querySelector('input[name="' + k + '"][value="' + o[k] + '"]');
      if (r) r.checked = true;
    });
    saveDraft();
  }

  function collect() {
    var data = {};
    new FormData(form).forEach(function (v, k) {
      v = String(v).trim();
      if (v) data[k] = data[k] ? data[k] + ", " + v : v;
    });
    return data;
  }
  var saveT;
  function saveDraft() { clearTimeout(saveT); saveT = setTimeout(function () { store(DRAFT, collect()); }, 300); }
  function restoreDraft() {
    var d = store(DRAFT);
    if (!d) return;
    Object.keys(d).forEach(function (k) {
      $$('[name="' + k + '"]', form).forEach(function (el) {
        if (el.type === "hidden") return;
        if (el.type === "radio") el.checked = el.value === d[k];
        else if (el.type === "checkbox") el.checked = String(d[k]).split(", ").indexOf(el.value) !== -1;
        else el.value = d[k];
      });
    });
    checkLink();
  }

  function captureSource() {
    var params = new URLSearchParams(location.search), src = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "ref"].forEach(function (k) { if (params.get(k)) src[k] = params.get(k); });
    if (document.referrer && document.referrer.indexOf(location.host) === -1) src.referrer = document.referrer;
    try {
      if (Object.keys(src).length) sessionStorage.setItem("khaiel-src", JSON.stringify(src));
      else src = JSON.parse(sessionStorage.getItem("khaiel-src") || "{}");
    } catch (e) {}
    if (/musical_ly|BytedanceWebview|TikTok/i.test(navigator.userAgent || "")) src.in_app = "tiktok";
    $("[data-h-source]").value = Object.keys(src).map(function (k) { return k + "=" + src[k]; }).join("; ");
  }

  var LABELS = {
    game_link: "Game", no_game: "No game yet", service: "Needs", notes: "Notes", problem: "Holding it back", budget: "Budget",
    m_dau: "Daily players", m_session_min: "Avg session (min)", m_d1: "D1 %", m_d7: "D7 %", m_payer: "Payer conversion %",
    email: "Email", discord: "Discord", name: "Name", source: "Source"
  };
  function summary(d) {
    return Object.keys(LABELS).filter(function (k) { return d[k]; }).map(function (k) {
      var v = k === "problem" ? d[k].split(", ").map(function (p) { return PROBLEM[p] || p; }).join(", ") : d[k];
      return LABELS[k] + ": " + v;
    }).join("\n");
  }

  function finish(data, fallback) {
    form.hidden = true;
    var done = $("[data-done]");
    done.hidden = false;
    $("[data-done-email]").textContent = data.email || (data.discord ? data.discord + " on Discord" : "you");
    if (fallback) {
      $("[data-done-title]").textContent = "Almost there. One more tap.";
      $("[data-done-text]").hidden = true;
      $("[data-fallback]").hidden = false;
      $("[data-mailto]").href = "mailto:" + (CFG.contactEmail || "") + "?subject=" + encodeURIComponent("New project: " + (data.game_link || "starting from an idea")) + "&body=" + encodeURIComponent(summary(data));
      $("[data-copy]").addEventListener("click", function (e) {
        var b = e.currentTarget;
        (navigator.clipboard ? navigator.clipboard.writeText(summary(data)) : Promise.reject()).then(
          function () { b.textContent = "Copied"; },
          function () { b.textContent = "Couldn't copy"; });
      });
    } else {
      store(DRAFT, null);
    }
    done.focus({ preventScroll: true });
    scrollToEl(done, "center");
  }

  function initForm() {
    if (!form) return;
    captureSource();
    restoreDraft();
    setStep(1);

    $("[data-next]", form).addEventListener("click", function () { if (validate(step)) setStep(step + 1, true); });
    $("[data-prev]", form).addEventListener("click", function () { setStep(step - 1, true); });
    form.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && e.target.tagName === "INPUT" && step < 3) {
        e.preventDefault();
        if (validate(step)) setStep(step + 1, true);
      }
    });
    form.addEventListener("input", function (e) {
      if (e.target.id === "f-link" || e.target.hasAttribute("data-no-game")) checkLink();
      e.target.classList.remove("is-invalid");
      saveDraft();
    });
    form.addEventListener("change", saveDraft);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (step < 3) { if (validate(step)) setStep(step + 1, true); return; }
      if (!validate(1)) { setStep(1, true); validate(1); return; }
      if (!validate(3)) return;
      var data = collect();
      data.submitted_at = new Date().toISOString();
      if (!CFG.formEndpoint) { finish(data, true); return; }
      var btn = $("[data-submit]", form);
      btn.classList.add("is-loading");
      btn.firstChild.textContent = "Sending… ";
      fetch(CFG.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.assign({ _subject: "New project: " + (data.game_link || "starting from an idea") }, data))
      }).then(function (res) {
        if (!res.ok) throw new Error(res.status);
        finish(data, false);
      }).catch(function () {
        btn.classList.remove("is-loading");
        btn.firstChild.textContent = "Send my game ";
        setError("That didn't send. Check your connection and try again. Your answers are saved.");
      });
    });

    // every "Fix this" / service / audit button carries its choice into the form
    $$("[data-pick-problem], [data-pick-service]").forEach(function (a) {
      a.addEventListener("click", function () {
        prefill({ problem: a.getAttribute("data-pick-problem"), service: a.getAttribute("data-pick-service") });
      });
    });
  }

  /* ------------------------------------------------ mobile dock */
  function initDock() {
    var dock = $("[data-dock]");
    if (!dock || !("IntersectionObserver" in window)) return;
    var heroSeen = true, covered = false, atEnd = false;
    function update() {
      var on = !heroSeen && !covered && !atEnd;
      dock.classList.toggle("is-on", on);
      dock.setAttribute("aria-hidden", String(!on));
      $("a", dock).tabIndex = on ? 0 : -1;
    }
    new IntersectionObserver(function (en) { heroSeen = en[0].isIntersecting; update(); }).observe($(".hero__actions"));
    // hide it wherever the page already shows its own buttons: the services, the leak finder, the form
    var seen = new Map();
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { seen.set(x.target, x.isIntersecting); });
      covered = Array.from(seen.values()).some(Boolean);
      update();
    }, { rootMargin: "-25% 0px -25% 0px" });
    [$("[data-funnel]"), $("[data-svc-grid]"), $(".svc-extra")].forEach(function (el) { if (el) io.observe(el); });
    // and from the moment the form comes into view
    new IntersectionObserver(function (en) { atEnd = en[0].isIntersecting || en[0].boundingClientRect.top < 0; update(); }).observe($("#send"));
  }

  initReview();
  wireConfig();
  initHeader();
  initGames();
  initLive();
  initWall();
  initCreed();
  initServices();
  initLeaks();
  initAccordions();
  initForm();
  initDock();
  initReveals();
})();
