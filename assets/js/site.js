/*
  Site interactions. No dependencies, no build step.
  Review mode · config links · header & menu · reveals · server chat · my games · leak finder ·
  accordions · send form · mobile dock
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
    d1: "They don't come back tomorrow", d7: "They're gone within a week", spend: "They play, but nobody buys", unsure: "Not sure"
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

  /* ------------------------------------------------ hero: simulated server chat
     Players keep "leaving the game" in the hero's game window, and the player count ticks down.
     Names are made up. The window is labelled as a simulation. */
  var NAMES = ["Guest_4821", "blox_kid22", "noobmaster_2012", "xX_Dragon_Xx", "pizza_lover91", "sk8r_bloxx", "builder_bean",
    "Lunar_Owlet", "TacoTuesday77", "cool_dude_ru", "MintyMango", "obby_queen", "PixelPanda08", "RobloxianRay", "zoomzoom_kart",
    "Captain_Cube", "frosty_flakes", "NoobSlayer_99", "lil_tycoon", "SpeedyBacon", "starry_mia", "BlockBoss3000"];
  var NAME_COLORS = ["#FD2943", "#01A2FF", "#02B857", "#A36FD4", "#DA8541", "#F5CD30", "#E8BAC8", "#D7C59A"];
  function initChat() {
    var log = $("[data-chat-log]"), countEl = $("[data-chat-count]");
    if (!log || !countEl) return;
    var players = 1284, last = "";
    function say(kind) {
      var name;
      do { name = NAMES[Math.floor(Math.random() * NAMES.length)]; } while (name === last);
      last = name;
      var li = document.createElement("li");
      li.className = kind === "join" ? "is-join" : "is-left";
      var b = document.createElement("b");
      b.textContent = name;
      b.style.color = NAME_COLORS[Math.floor(Math.random() * NAME_COLORS.length)];
      var em = document.createElement("em");
      em.textContent = kind === "join" ? " joined the game." : " left the game.";
      li.appendChild(b); li.appendChild(em);
      log.appendChild(li);
      while (log.children.length > 4) log.removeChild(log.firstChild);
      players += kind === "join" ? 1 : -(1 + Math.floor(Math.random() * 3));
      if (players < 990) players = 1284;
      countEl.textContent = players.toLocaleString("en-US");
      if (kind !== "join") {
        var pill = countEl.parentElement;
        pill.classList.add("is-drop");
        setTimeout(function () { pill.classList.remove("is-drop"); }, 450);
      }
    }
    for (var i = 0; i < 4; i++) say(i === 2 ? "join" : "left");
    if (reduceMotion) return;
    var timer = 0, visible = true;
    function tick() { say(Math.random() < 0.22 ? "join" : "left"); }
    function run() { if (!timer && visible && !document.hidden) timer = setInterval(tick, 1400); }
    function halt() { clearInterval(timer); timer = 0; }
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (en) { visible = en[0].isIntersecting; visible ? run() : halt(); }).observe(log);
    }
    document.addEventListener("visibilitychange", function () { document.hidden ? halt() : run(); });
    run();
  }

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
    var headshot = data.headshot && (real || reviewOn) ? data.headshot : null;
    $$("[data-headshot]").forEach(function (img) {
      if (!headshot) return;
      img.src = headshot;
      img.hidden = false;
    });
    if (!section) return;
    if (!showData) { section.classList.add("is-intro-only"); return; }

    var games = (data.games || []).slice().sort(function (a, b) { return (b.visits || 0) - (a.visits || 0); });
    var total = games.reduce(function (s, g) { return s + (g.visits || 0); }, 0);
    var playing = games.reduce(function (s, g) { return s + (g.playing || 0); }, 0);
    var peaks = games.map(function (g) { return g.peakCCU; }).filter(function (v) { return v != null; });
    var peak = peaks.length ? Math.max.apply(null, peaks) : null;
    var maxVisits = games.length ? games[0].visits || 1 : 1;

    var board = $("[data-board]"), rows = $("[data-board-rows]");
    if (!real) {
      board.classList.add("is-example");
      $("[data-board-example]").hidden = false;
      $("[data-board-foot]").textContent = "Example data. Your real games appear here with live numbers from Roblox.";
      $("[data-stat-updated]").textContent = "example data";
    } else {
      $("[data-board-foot]").textContent = "Visits and live players come straight from Roblox, " + ago(data.updatedAt) + ".";
      $("[data-stat-updated]").textContent = "live from Roblox";
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
      if (g.playing != null) meta.push('<span><i class="live"></i>' + compact(g.playing) + " playing</span>");
      if (g.likeRatio != null) meta.push('<span><svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true" fill="currentColor"><path d="M2 7h2.5v7H2zM6 14V7.2L9 2c1 0 1.7.8 1.5 1.8L10 6h3.4c.9 0 1.6.9 1.4 1.8l-1.2 5A1.5 1.5 0 0 1 12.1 14z"/></svg>' + g.likeRatio + "%</span>");
      link.innerHTML =
        '<span class="row__rank">' + (i + 1) + "</span>" +
        '<img class="row__icon" alt="" loading="lazy" decoding="async">' +
        '<span class="row__name"><b></b><small>' + meta.join("") + "</small></span>" +
        '<span class="row__stats"><span>' + compact(g.visits) + "</span><span>" + compact(g.peakCCU) + "</span></span>";
      $("img", link).src = g.icon;
      $("b", link).textContent = g.name;
      li.appendChild(link);
      rows.appendChild(li);
    });

    // hovering a stat lights up the game it comes from
    function hot(index) { $$(".row", rows).forEach(function (r, i) { r.classList.toggle("is-hot", i === index); }); }
    function indexOfMax(key) {
      var best = -1, v = -Infinity;
      games.forEach(function (g, i) { if (g[key] != null && g[key] > v) { v = g[key]; best = i; } });
      return best;
    }
    var owner = { visits: 0, peak: indexOfMax("peakCCU"), playing: indexOfMax("playing"), count: -1 };
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
      countUp($('[data-stat="visits"]'), total, compact);
      countUp($('[data-stat="peak"]'), peak, function (n) { return Math.round(n).toLocaleString("en-US"); });
      countUp($('[data-stat="playing"]'), playing, function (n) { return Math.round(n).toLocaleString("en-US"); });
      countUp($('[data-stat="count"]'), games.length, function (n) { return String(Math.round(n)); });
    }
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { start(); io.disconnect(); } }, { threshold: 0.25 });
      io.observe(section);
    } else start();
  }

  /* ------------------------------------------------ leak finder
     Phones: an accordion, everything closed until tapped.
     Desktop: the list on the left, one answer always open on the right. */
  function initLeaks() {
    var wrap = $("[data-leaks]");
    if (!wrap) return;
    var btns = $$(".leak__btn", wrap);

    function open(btn, focusScroll) {
      btns.forEach(function (b) {
        var on = b === btn;
        b.setAttribute("aria-expanded", String(on));
        $("#" + b.getAttribute("aria-controls")).hidden = !on;
      });
      if (focusScroll && !desktop.matches) {
        var top = btn.getBoundingClientRect().top;
        if (top < 70 || top > window.innerHeight * 0.5) {
          window.scrollTo({ top: window.scrollY + top - 84, behavior: reduceMotion ? "auto" : "smooth" });
        }
      }
    }
    function closeAll() { open(null); }

    btns.forEach(function (b, i) {
      b.addEventListener("click", function () {
        var isOpen = b.getAttribute("aria-expanded") === "true";
        if (isOpen && !desktop.matches) closeAll();
        else open(b, true);
      });
      b.addEventListener("keydown", function (e) {
        var n = null;
        if (e.key === "ArrowDown") n = btns[(i + 1) % btns.length];
        if (e.key === "ArrowUp") n = btns[(i - 1 + btns.length) % btns.length];
        if (n) { e.preventDefault(); n.focus(); if (desktop.matches) open(n); }
      });
    });

    function sync() {
      var any = btns.some(function (b) { return b.getAttribute("aria-expanded") === "true"; });
      if (desktop.matches && !any) open(btns[0]);
    }
    sync();
    desktop.addEventListener("change", sync);
  }

  /* ------------------------------------------------ accordions */
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

  /* ------------------------------------------------ send form */
  var form = $("[data-form]");
  var steps = $$("[data-fstep]");
  var step = 1;
  var DRAFT = "khaiel-form-v2";

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
  function checkLink() {
    var input = $("#f-link"), hint = $("[data-link-hint]"), v = normLink(input.value);
    hint.classList.remove("is-ok", "is-warn");
    if (!input.value.trim()) { hint.textContent = "Copy it from the address bar or the Share button."; return false; }
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
      if (!link.value.trim()) { setError("Paste your game's Roblox link to continue.", link); return false; }
      if (!checkLink()) { setError("That should be a roblox.com game link.", link); return false; }
      link.value = normLink(link.value);
    }
    if (n === 3) {
      var email = $("#f-email");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) { setError("Add your email so I can reply.", email); return false; }
      if (!form.querySelector('input[name="age"]:checked')) { setError("Pick your age. Under 18 is completely fine."); return false; }
    }
    return true;
  }

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
    new FormData(form).forEach(function (v, k) { if (String(v).trim()) data[k] = String(v).trim(); });
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
        if (el.type === "radio") el.checked = el.value === d[k]; else el.value = d[k];
      });
    });
    if (d.game_link) checkLink();
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
    game_link: "Game", problem: "What's wrong", notes: "Notes", service: "Interested in", budget: "Budget",
    m_dau: "Daily players", m_session_min: "Avg session (min)", m_d1: "D1 %", m_d7: "D7 %", m_payer: "Payer conversion %",
    email: "Email", name: "Name", discord: "Discord", age: "Age", source: "Source"
  };
  function summary(d) {
    return Object.keys(LABELS).filter(function (k) { return d[k]; }).map(function (k) {
      return LABELS[k] + ": " + (k === "problem" ? PROBLEM[d[k]] || d[k] : d[k]);
    }).join("\n");
  }

  function finish(data, fallback) {
    form.hidden = true;
    var done = $("[data-done]");
    done.hidden = false;
    $("[data-done-email]").textContent = data.email || "your email";
    if (fallback) {
      $("[data-done-title]").textContent = "Almost there. One more tap.";
      $("[data-done-text]").hidden = true;
      $("[data-fallback]").hidden = false;
      $("[data-mailto]").href = "mailto:" + (CFG.contactEmail || "") + "?subject=" + encodeURIComponent("Game submission: " + (data.game_link || "")) + "&body=" + encodeURIComponent(summary(data));
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
      if (e.target.id === "f-link") checkLink();
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
        body: JSON.stringify(Object.assign({ _subject: "New game: " + (data.game_link || "") }, data))
      }).then(function (res) {
        if (!res.ok) throw new Error(res.status);
        finish(data, false);
      }).catch(function () {
        btn.classList.remove("is-loading");
        btn.firstChild.textContent = "Send my game ";
        setError("That didn't send. Check your connection and try again. Your answers are saved.");
      });
    });

    // every "Fix this" / "Start with an audit" / plan button carries its choice into the form
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
    // hide it wherever the page already shows its own buttons: the leak finder, the plans, the form
    var seen = new Map();
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) { seen.set(x.target, x.isIntersecting); });
      covered = Array.from(seen.values()).some(Boolean);
      update();
    }, { rootMargin: "-25% 0px -25% 0px" });
    [$("[data-leaks]"), $(".plans")].forEach(function (el) { if (el) io.observe(el); });
    // and from the moment the form comes into view
    new IntersectionObserver(function (en) { atEnd = en[0].isIntersecting || en[0].boundingClientRect.top < 0; update(); }).observe($("#send"));
  }

  initReview();
  wireConfig();
  initHeader();
  initChat();
  initGames();
  initLeaks();
  initAccordions();
  initForm();
  initDock();
  initReveals();
})();
