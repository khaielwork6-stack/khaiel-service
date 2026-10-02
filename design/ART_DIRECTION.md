# Art direction: real Roblox, no generated art

The site has to feel like Roblox the moment it loads. Every visual is either:
- a **real Roblox asset**: the official thumbnails and icons of the games I've worked on, or
- **UI drawn in code** (HTML/CSS/SVG) that looks like something a developer actually sees.

**No AI-generated images.** They were tried in v3 and read as generic "AI slop". Real thumbnails from real games are more convincing than any render.

The interface borrows from the Roblox app itself:
- the dark-theme greys;
- the green Play button;
- the server chat and player count;
- a leaderboard styled like the in-game player list;
- game tiles that show 👍 like ratio and 👤 players.

## What's on the page, top to bottom
| Where | Visual | Source |
|---|---|---|
| Hero | Live showcase: rotates through the games, sorted by players right now, with the total playing count | Roblox thumbnails, icons and live stats |
| My work | Stats, leaderboard, "Play them yourself" tiles | Roblox thumbnails, icons and stats |
| The story | A statement that lights up word by word as you scroll | Type only |
| Live demo | A simulated game's Creator Hub-style analytics: six benchmark cards with percentile sliders and fix switches, a live CCU chart, Robux per day, and a scripted "Khaiel AI" analyst. Labelled "Simulated" | Drawn in code. "Your Game" is fictional; the benchmark tags are illustrative |
| Services: Full Game Development | One of the games' real thumbnails drops in as studded Roblox bricks, then "Live on Roblox" with its real visits and studio | Roblox thumbnails and stats |
| Services: Growth & the Algorithm | The games sort themselves by who's playing right now; #1 climbs from the bottom | Roblox icons, like ratios, live player counts |
| Services: Thumbnails, Icons & Trailers | Two real thumbnails of the same game side by side; the one Roblox shows first gets "Main thumbnail" | Roblox thumbnails (every game has 2–6) |
| Services: Monetization | The game's real store: three passes from across its price ladder, Roblox's "Buy item" prompt, a cursor buying each | Roblox game passes, icons and prices |
| Services: Scripting & Systems | A badge script types itself out in a Roblox Studio window, then a real badge pops with how many players have it | Roblox badges and award counts |
| Services: Growth Partner | The last 7 days, with each game's icon on the day it was last updated | Roblox "updated" dates |
| Services: Game Audit | A Creator Hub-style scan: the CCU line falls, two leaks are flagged, then the fixes land and the line climbs | Drawn in code (simulated) |
| Services: "Message me anyway" | A Discord "Message Requests" window with the kind of requests Roblox devs send | Drawn in code (Discord dark theme) |
| Contact: "DM me on Discord" | A Discord profile card that tilts toward the pointer, with an aurora banner and an orbiting border; links to the Discord profile | Drawn in code |
| "Let's plug the leak" | A tilted, scrolling wall of the game thumbnails | Roblox thumbnails |
| Link preview (`assets/og.jpg`) | The headline beside the four biggest games' thumbnails | Roblox thumbnails, composited locally |

All Roblox assets are loaded from Roblox's CDN (`rbxcdn.com`). The URLs come from `assets/data/roblox.js`, which the stats workflow refreshes every 6 hours: thumbnails, icons, live stats, game passes (with prices and icons), badges (with award counts) and update dates. Nothing is copied into the repo except `og.jpg`. When a game changes its passes, thumbnails or badges on Roblox, the site follows within 6 hours.

## Rules
- **Credit the studio.** These games belong to other studios. Wherever a game appears, its studio is named ("by Grassini"), and the copy says "games I've worked on", never "my games".
- **Simulated stays simulated.** The leaking-players story and the service illustrations never use a real game's imagery or name, so they can't suggest anything about a real game.
- **Motion with manners.** Every illustration only animates while it's on screen, and anyone with "reduce motion" turned on sees the finished state instead.
- **Your face.** Every avatar on the page (hero, "Hey, I'm Khaiel", the story, the AI analyst, the Discord card) is your photo, `assets/img/khaiel.jpg`.

## Rebuilding the link preview
The preview card is the headline plus the four most-visited games. Rebuild it when the games change: download their thumbnails from the `thumb` URLs in `assets/data/roblox.js`, place them in a 2×2 tilted grid on the right of a 1200×630 canvas (`#111214`), with the headline on the left. Export as JPEG at quality ~86.
