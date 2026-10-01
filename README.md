# Khaiel — Roblox growth studio site

A single-page site that turns TikTok attention into qualified clients for Roblox game audits, growth sprints and development.

- **Strategy, pricing logic and the launch checklist:** [STRATEGY.md](STRATEGY.md)
- **No build step and no dependencies.** It's plain HTML, CSS and JS, deployable to GitHub Pages, Netlify, Vercel or any static host.

## Structure

```
index.html            All page content and copy (prices live here)
assets/css/site.css   Visual system ("Signal & Leak"), mobile-first
assets/js/config.js   Launch settings: review mode, form endpoint, links
assets/js/flow.js     Hero player-flow simulation (canvas)
assets/js/site.js     Leak Map, quiz, charts, accordions, intake form, mobile dock
assets/og.png         1200×630 social share image
assets/favicon.svg
```

## Run it locally

Open `index.html` directly in a browser. Everything works over `file://`.

## Review mode

`reviewMode: true` in `assets/js/config.js` (the current setting) shows:

- **Striped markers** on every value I proposed that you haven't approved yet. These are prices, timelines and policies, tagged `data-proposed` in the HTML.
- **Yellow "Needs" labels** on proof slots that need real evidence from you. These are tagged `data-needs`.

To approve a value, edit it if needed and delete its `data-proposed` attribute. To fill a proof slot, replace the placeholder with the real content and delete `data-needs`.

With `reviewMode: false`:
- `data-needs` slots are **hidden**, so no placeholder proof is ever shown to visitors.
- `data-proposed` values render as normal text, so approve or edit them all **before** switching.

Preview either mode on any URL with `?review=1` or `?review=0`.

## Connect the intake form

1. Create a free form at [formspree.io](https://formspree.io), or use any endpoint that accepts a JSON POST.
2. Paste its URL into `formEndpoint` in `assets/js/config.js`.
3. Set `contactEmail`, which is used in the footer and in the email fallback.

Until an endpoint is set, submitting opens a prefilled email instead, so no lead is lost.

Every submission includes:
- the game link, checkpoint, symptoms ticked in the Leak Map, and the quiz answers;
- any metrics given, service, budget, timing, contact details and age bracket;
- UTM parameters, the referrer, and whether the visitor came through TikTok's in-app browser.

Tag your TikTok links so you can see which videos bring clients:
`https://<site>/?utm_source=tiktok&utm_content=<video-id>`

## Deploy to GitHub Pages

1. Repo → **Settings → Pages → Build and deployment**.
2. Choose **Deploy from a branch**, then **`main`** and **`/ (root)`**.
3. The site goes live at `https://khaielwork6-stack.github.io/khaiel-service/`.
4. If you add a custom domain, update `og:url` and `og:image` in `index.html`. Social previews need absolute URLs.

## Editing notes

- **Prices** live only in `index.html`. Search for the value (e.g. `$950`) to find every place it appears; the quiz reads them from the page.
- **The six checkpoints** (Click, Hook, Loop, D1, D7, Spend) are defined in each `.stage` panel in `index.html`. Their example charts are in `CHARTS` in `site.js`. All chart numbers are illustrative and labelled that way.
- **Motion** respects `prefers-reduced-motion`. The hero canvas pauses when it's off screen or the tab is hidden.
