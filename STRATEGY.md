# Khaiel: strategy and launch brief

The thinking behind the site: positioning, offer, customer journey, the signature feature, the visual concept, and exactly what's still needed before launch.

Everything marked **PROPOSED** is my recommendation, not something you've approved. On the site these values carry a `data-proposed` attribute and show striped markers while review mode is on.

---

## 1. Positioning

**One line:** A Roblox growth studio that finds exactly where your game loses players, then fixes it. It's run by a creator who builds and runs live games.

| | |
|---|---|
| **For** | Roblox developers with a live (or about-to-launch) game that isn't growing. That covers solo devs through small studios. |
| **Not** | A freelancer portfolio, a "get rich on Roblox" course, or an agency that promises front page. |
| **Category** | Diagnosis-first growth and development studio. |
| **Promise** | A defined process and concrete work: diagnosis, then a ranked list of fixes, then implementation. Outcomes like algorithm placement, revenue and retention are never promised. |
| **Why you** | You run your own games (evidence pending, see §5). You show your thinking in public on TikTok. And you can both diagnose *and* build. |
| **The enemy** | Guessing, plus the "the algorithm hates my game" myth. Roblox's own docs say recommendations follow player behaviour, so the problem can be found. |

Hero line: **"Your game isn't dead. It's leaking."** It reframes the visitor's despair ("dead game") into something specific and fixable, and it sets up the whole brand metaphor.

---

## 2. The signature: the Leak Map

Every Roblox game has to get players through six checkpoints. Each one maps to a signal Roblox documents on [create.roblox.com/docs/discovery](https://create.roblox.com/docs/discovery) (verified Oct 2026):

| # | Checkpoint | Question | Roblox signal |
|---|---|---|---|
| 01 | **Click** | Do players see your game and choose it? | Play through rate |
| 02 | **Hook** | Do new players get hooked in the first minutes? | First play bounce rate |
| 03 | **Loop** | Is there always a next thing to chase? | Playtime per user, co-play days |
| 04 | **D1** | Do players come back tomorrow? | Play days per user (Day 1) |
| 05 | **D7** | Is there still a game here next week? | Play days per user (Days 2–7) |
| 06 | **Spend** | Do engaged players have something worth buying? | Spend days, Robux spend |

The Leak Map is the interactive dashboard on the site, and it's built to run the whole business:

1. **It gives your audience a vocabulary.** "My game leaks at Hook" is easy to say in a comment, and easy for you to answer in one line.
2. **It's a content format.** A TikTok series called *Leak of the Day*: take one submitted game, diagnose one checkpoint, and end with "find your leak, link in bio." The video and the site share the same six-checkpoint visual, so the jump from video to site feels seamless.
3. **It routes buyers.** Visitors sort themselves into a checkpoint, and from there into a sprint. Submissions arrive with the checkpoint, ticked symptoms, quiz answers and metrics already filled in, which makes them pre-qualified.
4. **It is the deliverable.** Every audit ends with a Leak Map scorecard and ranked fixes. Each fix is tagged with the sprint that covers it, so the report sells the next step without feeling like a pitch.
5. **It can become a product later.** A self-serve "Leak Map check" where devs enter their Creator Hub numbers and get a scorecard. Build this only once you have real benchmark data from audits, collected with permission.

**Honesty rules baked in:** every chart says "Illustrative example," the hero animation says "Simulation, not real data," and the FAQ refuses to guarantee growth.

### Two ways into the map
- **"I know where it hurts"**: tap a checkpoint. You see what the leak looks like (symptoms you can tick), an illustrative chart, what I investigate, what the sprint includes, the deliverables, the timeline and the price. A **"Fix my ___"** button carries everything into the form.
- **"Why isn't my game growing?"**: six one-tap questions produce a *self-reported Leak Map* and a recommended starting point:
  - Barely any plays and mostly "not sure" → **Quick Read** (no data needed).
  - Mostly "not sure" → **Full Game Audit** ("you're flying blind").
  - A clear leak → **Audit, then that checkpoint's sprint.** Hook is prioritised first, because traffic poured into a leaky first session is wasted.
  - Nothing leaking → **Audit, then Growth Partner.**

---

## 3. Customer journey

```
TikTok video ──► bio link / comment reply ("I'd check your HOOK. Map in bio")
                     │
                     ▼
              Hero: "Your game isn't dead. It's leaking."
          ┌──────────┴───────────┐
   Submit your game     Why isn't my game growing?
          │                      │
          │              6-tap quiz → your Leak Map → recommended start
          │                      │
          │   Leak Map: pick checkpoint → symptoms → scope → "Fix my X"
          │                      │
          ▼                      ▼
   Intake (5 steps, prefilled: checkpoint, symptoms, quiz, UTM, in-app flag)
          │
          ▼
   Reply in 2 business days (PROPOSED) with recommendation
          │
          ▼
   Quick Read ($149) or Full Game Audit ($950) → report + walkthrough
          │
          ▼
   DIY with the plan ─or─ Sprint (audit fee credited ≤30 days) ─► Growth Partner
```

**Phone-first details:**
- The sticky "Submit your game" dock appears after the hero. It hides inside the Leak Map and the form, where it would get in the way.
- The checkpoint rail sticks under the header while you scroll a checkpoint's details.
- Quiz answers and form choices are single taps, sized for thumbs.
- The form saves a draft locally. TikTok's in-app browser often reloads the page when someone switches apps, and the draft survives that.
- Submissions record `utm_*`, the referrer, and whether the visitor came from TikTok's in-app browser.

**Link your videos like this** so you can see which videos bring in clients:
`https://<your-site>/?utm_source=tiktok&utm_content=<video-id>`

---

## 4. Offer architecture and pricing (all PROPOSED)

Twelve services organised into a buying ladder, not twelve cards:

| Step | Offer | Scope | Delivery | Proposed price |
|---|---|---|---|---|
| 1 · Diagnose | **Quick Read** | 15–20 min recorded new-player teardown, top 3 leaks, written summary. No data needed. | 5 business days | **$149** |
| 1 · Diagnose | **Full Game Audit** | Analytics across all 6 checkpoints, phone + PC playthroughs, 3-game competitor teardown, ranked fix list (impact × effort × how to measure), 60-min recorded call | 7–10 business days | **$950**, credited toward a sprint within 30 days |
| 2 · Fix | **Discovery & Launch Sprint** | Thumbnail/icon direction, copy, thumbnail personalization test plan, launch plan | ~2 wks | from **$2,500** |
| 2 · Fix | **First Session Sprint** | First 5 minutes redesigned, onboarding funnel events, built, readout | 2–3 wks | from **$3,500** |
| 2 · Fix | **Engagement Sprint** | Loop/progression map, pacing & economy model, feature specs, built | 3–4 wks | from **$4,500** |
| 2 · Fix | **Retention Sprint** (D1 or D7 focus) | Return hooks / long-term goals / 8-week live-ops calendar, built | 2–4 wks | from **$3,500** |
| 2 · Fix | **Monetization Sprint** | Monetization map, price ladder, shop UX, built, readout | 2–3 wks | from **$3,500** |
| 3 · Build | **Custom development** | Full games, features, scripting, bug fixes, QA | Quoted | Larger builds from **$8,000**; **Fix Block** 10 hrs **$950** |
| 3 · Grow | **Growth Partner** | Monthly analytics review + roadmap, build days, launch/live-event strategy, Discord | Monthly | from **$4,000/mo**, 3-month minimum |
| Side lane | **AI workflow coaching** | 1:1 on AI-assisted prototyping, scripting, assets, testing | 60 min | **$199**, or 4 for **$699** |

Where the original twelve services landed:
- Game audits → Step 1.
- Hook / first minutes → First Session Sprint.
- Engagement, progression, replayability → Engagement Sprint.
- D1 and D7 → Retention Sprint.
- Monetization → Monetization Sprint.
- Marketing, launch, thumbnails and icons → Discovery & Launch Sprint.
- Done-for-you dev, scripting, bug fixes → Custom development.
- Playtesting and QA → included in every sprint and build.
- AI workflows → coaching lane.

**Pricing logic:**
- Effective rate of about **$95–$120/hr** of senior time:
  - Quick Read ≈ 1.5–2 hrs.
  - Audit ≈ 8–10 hrs.
  - Sprints ≈ 25–50 hrs, including implementation.
- **The Quick Read** handles the large TikTok crowd with small budgets without eating your week. Cap it, for example at 5 per week.
- **The audit is the gateway.** It's priced as an easy yes for anyone with revenue, and the 30-day credit turns it into a risk-free first step toward a sprint.
- **Sprints are fixed-price after the audit,** so scope is set from evidence and the price never comes out of a guess.
- **Raise prices** when you're booked 3+ weeks out. Don't add discounts.

**Decide before launch:**
- Refund policy. Suggestion: full refund before work starts, none after delivery; sprints paid in milestones.
- Payment provider. Stripe Payment Links are the simplest option.
- Whether you'll sign NDAs. The FAQ currently says yes (PROPOSED).
- Revenue share. Currently not offered.
- Whether you have artists or devs for production work. If not, keep "art direction" (not final art) and size sprints to your own hours.

---

## 5. Proof: what I need from you

Nothing on the site invents proof. Each slot below is marked `data-needs`: in review mode it shows a yellow "Needs" label, and in live mode it's hidden entirely.

### The "$30K/month" claim. Confirm all of these before it goes anywhere public:

1. **Currency.** USD?
2. **Basis.** Which number is it?
   - **DevEx cash actually paid out.** The standard rate is **$0.0038 per earned Robux** (since Sept 5, 2025). A higher **$0.0054** rate applies to some qualifying purchases (since June 8, 2026).
   - **Robux earned, valued at the DevEx rate.**
   - **Robux spent by players, valued at the purchase price** (roughly 1¢ per Robux).

   These differ by about 3×. $30K of player spending ≈ 2.4M Robux, which is about $9K in DevEx. $30K of DevEx ≈ 7.9M Robux earned.
3. **Period.** Which months? Average or best month? Is it current?
4. **Scope.** Which games? Your share, or the game's total if co-owned?
5. **Evidence.** DevEx payout history and/or Creator Hub revenue charts, dated. Redacting is fine.

Once confirmed, phrase it precisely, for example: *"My games paid out $X in DevEx over [months]. Screenshots."*

### Also needed
- **Your games.** Links, your role on each, co-owners if any. Visitors can verify visit counts on Roblox themselves.
- **TikTok.** Handle, follower count with the date you checked it, and 2–3 videos to link.
- **A photo or short video loop of you.** A real face is the fastest trust signal for TikTok traffic.
- **Case files.** Only real ones: game link, permission, before/after screenshots with dates, and what you actually did. Your own games count.
- **Testimonials.** Only verbatim quotes, with written permission.

---

## 6. Risks and policies

- **Minors.** A big share of the Roblox TikTok audience is under 18. The site lets anyone submit, but paid work needs a parent or guardian to agree and pay (PROPOSED in the FAQ and the intake age question). DevEx itself requires creators to be 13+.
- **No guarantees.** Keep this language. It builds trust, and it keeps you out of disputes.
- **Roblox trademarks.** The footer has a non-affiliation disclaimer. Don't use the Roblox logo.
- **Access.** Never ask for passwords. Use Team Create, group roles, or analytics access.
- **Capacity.** You're one person, so cap Quick Reads per week and keep a waitlist instead of discounting.

---

## 7. Visual concept: "Signal & Leak"

**What makes the reference site magnetic:**
- A living, atmospheric backdrop.
- A choreographed entrance.
- Dense, verifiable proof (exact numbers, linked).
- One hot accent on near-black.
- Mono metadata that reads as technical credibility.

**How this site translates those principles, without copying any of it:**

| Principle | Translation |
|---|---|
| Living backdrop | A **player-flow simulation**: lime players stream through six checkpoint rings (obby checkpoints seen edge-on). Ember sparks leak out at each one, and the few who buy turn gold. The motion is the argument. |
| Atmosphere | A **stud-grid baseplate** that lights up lime under the cursor, as if inspecting it. Film grain. Glow is used only where light means something. |
| Accent | **Lime = players still in the game, ember = players leaking out.** Colour always carries meaning. |
| Typography | **Archivo Expanded** (wide, heavy, game-title energy without being childish) with **Martian Mono** for readouts. |
| Choreography | A blur-in hero; headings revealed by a lime **scanline**; charts that draw in; the checkpoint rail's beam advances as you move along it; the period of "leaking." literally drips. |
| Proof density | The sample audit is a **paper report**, a tactile contrast moment. Proof slots stay empty until they're real. |

**Deliberately not taken from the reference:**
- The blurred screenshot slideshow.
- The red/black palette.
- IBM Plex.
- The leaderboard table.
- Its layout, copy or structure.

---

## 8. Launch checklist

- [ ] Approve or edit every proposed price, timeline and policy. Search `data-proposed` in `index.html`. Prices exist only in `index.html`; the quiz reads them from the page.
- [ ] Provide the proof items in §5. Fill or delete each `data-needs` slot.
- [ ] In `assets/js/config.js`, set `formEndpoint` (e.g. Formspree), `contactEmail`, `tiktokUrl` and `discordUrl`.
- [ ] Set `reviewMode: false`.
- [ ] Turn on GitHub Pages (Settings → Pages → Deploy from branch → `main` / root). If you add a custom domain, update `og:url` and `og:image` in `index.html`.
- [ ] Send a test submission from your phone *inside TikTok's in-app browser*.
- [ ] Optional: privacy-friendly analytics (Plausible or Umami), and Stripe Payment Links that you send after the fit check.

## 9. Next builds after launch
1. Case file pages, once there are real results.
2. A self-serve Leak Map check (enter your Creator Hub numbers, get a scorecard).
3. Quick Read checkout with Stripe Payment Links and a capped weekly calendar.
4. A *Leak of the Day* submission flow wired straight into your content pipeline.
