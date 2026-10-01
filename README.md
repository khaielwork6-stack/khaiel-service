# Khaiel — Roblox growth studio site

A single page that turns TikTok attention into clients: *"Your game isn't dead. It's leaking players."*

- **Strategy, offers, proof and the launch checklist:** [STRATEGY.md](STRATEGY.md)
- **Art direction (real Roblox assets, no AI art):** [design/ART_DIRECTION.md](design/ART_DIRECTION.md)
- **No build step:** plain HTML, CSS and JS. Open `index.html` in a browser to run it locally.

## Your games (hero showcase, leaderboard, closing wall)
The games you've worked on drive most of the visuals: the live showcase in the hero, the **My work** stats and leaderboard, and the scrolling wall above the form. Everything comes from Roblox: thumbnails, icons, visits, players right now and like ratio.

1. Open `data/roblox.config.json` and add or remove games by place ID, the number in `roblox.com/games/<placeId>/…`:
   ```json
   {
     "robloxUserId": 123456789,
     "games": [
       { "placeId": 1234567890, "role": "Creator", "peakCCU": 12500 },
       { "placeId": 9876543210, "role": "Lead scripter", "peakCCU": 4100 }
     ]
   }
   ```
2. Commit and push. The **Update Roblox stats** GitHub workflow runs and rewrites `assets/data/roblox.js`. It then reruns every 6 hours. It pulls:
   - each game's name, icon, visits, players right now, favorites and like ratio;
   - your avatar headshot.

   You can also run it locally: `powershell -File scripts/update-roblox.ps1`.

**Peak CCU** isn't published by Roblox. Copy it from Creator Hub → Analytics into `peakCCU`.

The board shows your biggest games. Your total count ("30+ games worked on") lives in `assets/js/config.js` as `gamesWorkedOn`.

## Review mode
While `reviewMode: true` is set in `assets/js/config.js`, a small pill sits in the corner. Press **Show** to highlight every proposed price and policy (`data-proposed`). Set `reviewMode: false` before sending traffic. You can preview either mode with `?review=1` or `?review=0`.

## Connect the form
Paste a Formspree URL (or any JSON POST endpoint) into `formEndpoint`, and set `contactEmail`. Until then, submitting opens a prefilled email, so no lead is lost.

## Structure
```
index.html                      All content and copy. Prices live here.
assets/css/site.css             Roblox-themed visual system, mobile-first
assets/js/config.js             Review mode, form endpoint, links
assets/js/site.js               Live showcase, server chat, leaderboard, wall, leak finder, form, dock
assets/data/roblox.js           Game stats and thumbnail URLs (generated)
data/roblox.config.json         Your games and Roblox user ID
scripts/update-roblox.ps1       Fetches live stats from Roblox's public APIs
.github/workflows/roblox-stats.yml   Runs the script every 6 hours
assets/og.jpg                   Link preview card (real game thumbnails)
```

## Deploy
GitHub → **Settings → Pages** → Deploy from branch `main` / root. The site goes live at `https://khaielwork6-stack.github.io/khaiel-service/`. For the stats workflow to commit, keep **Settings → Actions → General → Workflow permissions** on "Read and write".
