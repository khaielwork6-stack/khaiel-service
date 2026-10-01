# Khaiel: strategy and launch brief (v2, simplified)

Everything marked **PROPOSED** is a recommendation you haven't approved. On the site these values carry `data-proposed`. While review mode is on, a small pill in the corner lets you highlight them.

---

## 1. Why v2 exists: what made v1 confusing

| v1 problem | v2 fix |
|---|---|
| Visitors had to learn a vocabulary first: "Leak Map", "checkpoints", Click/Hook/Loop/D1/D7/Spend, "Roblox signal", "sprints", "Quick Read", "Fix Block" | Plain words. The six moments are named the way a developer feels them: "Nobody clicks it", "Players quit in the first minute"… |
| 11 things to buy | **3 offers**: Game Audit → Fix Sprint → Build & Grow, plus coaching as a one-line footnote |
| About 15 different button labels | **One action everywhere: "Send me your game."** The other buttons ("Fix this", "Start with an audit") go to the same form, already filled in |
| The dashboard was a mini-app: 2 modes, 6 tabs, 4 sub-panels each, 6 charts | **One tap-and-read list.** Tap the problem that sounds like yours to see what it means, what I'd do, and the button |
| Prices, sprints and timelines repeated in 4 places | Each fact lives in one place |
| HUD clutter: mono labels, numbered kickers, bracket frames, stud grid, grain | One typeface, generous space, and the real games doing the visual work |
| A 5-step form | A 3-step form. Only the link and email are required |

## 2. Positioning

**Promise:** Send me your game. I'll show you exactly where it's losing players and how to fix it.

- **For** Roblox developers whose live game has stalled.
- **Credibility:** a developer whose games are live right now: 190M+ visits across the games I've worked on. Not a guru with a course.
- **Honesty:** the work is guaranteed (scope, deliverables, timeline). Outcomes are not.

**Hero line:** *"Your game isn't dead. It's leaking players."* It turns "my game is dead" into something specific and fixable.

## 3. The page, in order (each section answers one question)

1. **Hero:** *What is this?* One promise, a green Play-style button, three reassurances. Beside it, a live showcase: how many people are playing the games I've worked on right now, rotating through each game's real thumbnail.
2. **My work:** *Why trust you?* "Hey, I'm Khaiel", and four stats (total visits, peak players or favorites, playing right now, games worked on). Beside them is a leaderboard of the games, each credited to its studio, with visits and live players pulled from Roblox every 6 hours.
3. **Find your leak:** *Where is my problem?* Opens with a simulated server chat where players keep leaving. Then the KPI dashboard, simplified into a funnel of six plain-language problems plus "I'm not sure". Each bar shows the players kept (lime) and the players lost (ember). Tapping a problem opens:
   - the Creator Hub metric to check;
   - what it usually means;
   - what I'd do;
   - a **Fix this** button.
4. **How it works:** *What happens if I send it?* Three steps, then a sample audit report.
5. **Pricing:** *What does it cost?* Three plans, each illustrated with what you actually get: an audit report, a before/after chart, a growth graph.
6. **FAQ:** six questions.
7. **Send me your game:** a scrolling wall of the games' thumbnails, then a 3-step form.

## 4. Offers and pricing (all PROPOSED)

| Offer | What it is | Price | Timing |
|---|---|---|---|
| **Game Audit: Quick Read** | Recorded new-player teardown with your top 3 fixes. No data needed | **$149** | ~5 business days |
| **Game Audit: Full Audit** | All six moments, your analytics, a ranked fix list, a 60-min call | **$950** | 7–10 business days |
| **Fix Sprint** | One problem area planned, built into the game, playtested, with before-and-after numbers | from **$2,500** | 2–4 weeks |
| **Build & Grow** | Custom builds, scripting, bug fixes, QA, or a monthly growth partner | quoted; partner from **$4,000/mo** | — |
| **AI workflow coaching** | 1:1 sessions | **$199** / session | — |

**Bridge from audit to fix:** if a client books a Fix Sprint within **30 days**, their audit fee comes off the price.

**Pricing logic:**
- Effective rate of about $95–$120 per senior hour.
- The Quick Read lets small TikTok budgets say yes without eating your week, so cap it per week.
- Sprints are priced after the audit, so scope comes from evidence.

**Decide before launch:**
- Refund policy (suggestion: full refund before work starts).
- Payment provider (Stripe Payment Links is the simplest).
- Whether you'll sign NDAs (the FAQ currently says yes, PROPOSED).
- The under-18 policy (guardian approves paid work, PROPOSED).

## 5. Proof: exactly what I need from you
Nothing on the site invents proof. Fill these in, or the slots stay hidden:

1. **The "$30K/month" claim.** It's held until you confirm:
   - **Currency.**
   - **Basis.** DevEx cash (standard rate $0.0038 per earned Robux; $0.0054 for some qualifying purchases since June 2026), Robux earned, or what players spent (≈1¢ per Robux). These differ by about 3×.
   - **Period.**
   - **Which games**, and your share if any are co-owned.
   - **Dated screenshots.**
2. **Your games:** seven are live on the site. Still needed for each: **peak CCU** (Creator Hub → Analytics) and, optionally, **your role** (e.g. "Lead scripter"). Add them in `data/roblox.config.json`.
3. **TikTok:** handle, follower count and the date you checked.
4. **Your Roblox user ID** so your real avatar shows. Until then, a "K" monogram.
5. **Case studies and testimonials:** real ones only, with permission.

## 6. Launch checklist
- [ ] Approve or edit every proposed value. Search `data-proposed` in `index.html`, or use the review pill → **Show**.
- [ ] Fill the proof slots (`data-needs`) or leave them hidden.
- [ ] In `assets/js/config.js`, set `formEndpoint` (e.g. Formspree), `contactEmail`, `tiktokUrl` and `discordUrl`, then set `reviewMode: false`.
- [ ] GitHub → Settings → Pages → deploy from `main` / root. If you add a custom domain, update `og:url` and `og:image`.
- [ ] Send a test submission from your phone *inside TikTok's in-app browser*.
- [ ] Tag your TikTok links: `?utm_source=tiktok&utm_content=<video-id>`. Every submission records where it came from.

## 7. Risks
- **Minors:** much of this audience is under 18. Anyone can send a game; paid work needs a guardian.
- **No guarantees:** keep that language.
- **Trademarks:** the footer disclaims any Roblox affiliation. Game thumbnails belong to their studios: each is credited, and the copy says "games I've worked on".
- **Access:** never ask for passwords. Use collaborator access to a copy of the place.
