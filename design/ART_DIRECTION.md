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
| Find your leak | Server chat window: players join and leave, and the count drops. Labeled "Simulated" | Drawn in code. Fictional usernames, not tied to any real game |
| The story | A statement that lights up word by word as you scroll | Type only |
| Services: Full Game Development | Bricks drop onto a studded baseplate and build a house; the pill flips from "Building" to "Published" | Drawn in code |
| Services: Growth & the Algorithm | "Your game" climbs a Recommended sort to #1. Labeled "Example" | Drawn in code |
| Services: Thumbnails, Icons & Trailers | A thumbnail A/B test (dull vs. bright with a classic noob and a "+1"); B wins. Labeled "Example" | Drawn in code (SVG noob) |
| Services: Monetization | A Roblox-style shop; purchase toasts roll in and today's Robux climbs | Drawn in code |
| Services: Scripting & Systems | A Luau script types itself out in Studio colours, then "0 errors" | Drawn in code |
| Services: Growth Partner | A week of update, event and admin-abuse days, with a playhead and the player count spiking. Labeled "Example" | Drawn in code (SVG) |
| Services: audit and "Message me anyway" | A mini audit report; an inbox of typical requests behind an orbiting green-and-gold border | Drawn in code |
| "Let's plug the leak" | A tilted, scrolling wall of the game thumbnails | Roblox thumbnails |
| Link preview (`assets/og.jpg`) | The headline beside the four biggest games' thumbnails | Roblox thumbnails, composited locally |

All Roblox assets are loaded from Roblox's CDN (`rbxcdn.com`). The URLs come from `assets/data/roblox.js`, which the stats workflow refreshes every 6 hours. Nothing is copied into the repo except `og.jpg`.

## Rules
- **Credit the studio.** These games belong to other studios. Wherever a game appears, its studio is named ("by Grassini"), and the copy says "games I've worked on", never "my games".
- **Simulated stays simulated.** The leaking-players story and the service illustrations never use a real game's imagery or name, so they can't suggest anything about a real game.
- **Motion with manners.** Every illustration only animates while it's on screen, and anyone with "reduce motion" turned on sees the finished state instead.
- **Your face, or nothing.** The avatar shows only when `robloxUserId` is set. Until then, a "K" monogram.

## Rebuilding the link preview
The preview card is the headline plus the four most-visited games. Rebuild it when the games change: download their thumbnails from the `thumb` URLs in `assets/data/roblox.js`, place them in a 2×2 tilted grid on the right of a 1200×630 canvas (`#111214`), with the headline on the left. Export as JPEG at quality ~86.
