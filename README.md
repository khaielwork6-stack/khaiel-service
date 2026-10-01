# Khaiel — Roblox growth studio site

A single page that turns TikTok attention into clients: *"Your game isn't dead. It's leaking players."*

- **Strategy, offers, proof requirements and the launch checklist:** [STRATEGY.md](STRATEGY.md)
- **Art direction and the prompt for every image:** [design/ART_DIRECTION.md](design/ART_DIRECTION.md)
- **No build step and no dependencies:** plain HTML, CSS and JS. Open `index.html` in a browser to run it locally.

## Structure
```
index.html             All content and copy. Prices live only here.
assets/css/site.css    Visual system, mobile-first
assets/js/config.js    Launch settings: review mode, form endpoint, links
assets/js/site.js      Leak finder, accordions, 3-step form, mobile dock, hero details
assets/img/            Web-sized renders (all under 110 KB)
assets/og.jpg          1200×630 link preview
design/prompts/        The exact prompt used for each image
design/masters/        Full-resolution PNGs (local only, git-ignored)
```

## Review mode
While `reviewMode: true` is set in `config.js`, the page looks exactly like the live site, plus a small pill in the bottom-left corner. Press **Show** to highlight:

- **Proposed values** (`data-proposed`): prices, timelines and policies you haven't approved. To approve one, edit it and remove the attribute.
- **Proof slots** (`data-needs`): places waiting for real evidence. They're always hidden from visitors.

Set `reviewMode: false` before sending traffic. You can preview either mode with `?review=1` or `?review=0`.

## Connect the form
1. Paste a Formspree URL (or any JSON POST endpoint) into `formEndpoint`.
2. Set `contactEmail`.

Until then, submitting opens a prefilled email, so no lead is lost. Each submission includes:
- the game link and the problem picked;
- notes, service, budget and any numbers given;
- contact details and age;
- the UTM source, and whether the visitor came through TikTok's in-app browser.

## Deploy
GitHub → **Settings → Pages** → Deploy from branch `main` / root. The site goes live at `https://khaielwork6-stack.github.io/khaiel-service/`.
