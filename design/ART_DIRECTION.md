# Art direction: Roblox front page

The site has to feel like Roblox the moment it loads, because it's a Roblox service. Every image is drawn in **front-page Roblox game thumbnail style**:
- glossy 3D renders;
- classic studs on every block;
- blocky R15-style avatars with simple smiley faces;
- saturated but tasteful colour;
- cinematic light.

The interface around the images borrows from the Roblox app itself:
- the dark-theme greys;
- the green Play button;
- the in-game window with its player count and chat;
- a leaderboard styled like the in-game player list;
- game tiles that show 👍 like ratio and 👤 players.

All images were generated with **ChatGPT image generation, run through your Codex app** (`codex exec` with the `imagegen` tool). The prompts are in [`prompts/`](prompts). The full-resolution masters are in `masters/`, which is kept locally and git-ignored.

## The story the images tell, top to bottom
| Where | Image | Story |
|---|---|---|
| Hero | `hero-wide` (desktop) / `hero-square` (phone, tablet) | Players run an obby. Several fall off and one breaks apart mid-"oof". Only two reach the finish. **Your game is leaking players.** |
| My games | `avatar-placeholder`, example icons `ex-1…6` | Placeholders only (see below) |
| Pricing: Game Audit | `plan-audit` | A dev's magnifier reveals the missing block that players fall through |
| Pricing: Fix Sprint | `plan-fix` | A builder snaps the missing block into place while players cross |
| Pricing: Build & Grow | `plan-grow` | A packed hub with a golden noob statue and fireworks: a game on the front page |
| "Let's plug the leak" | `final-wide` | The same obby, fixed. Everyone made it to the finish |

`v3-01-hero-wide` was generated first and attached as the **style reference** to every other prompt. That's why the set is consistent.

## Placeholders: never shown as yours
- **`avatar-placeholder.jpg`** is a generic avatar. It only appears in review mode. Set `robloxUserId` in `data/roblox.config.json` and your real avatar headshot replaces it automatically.
- **`icons/ex-1…6.jpg`** are icons for six *fictional* games used as example data. Your real games bring their own icons from Roblox.

No other studio's games or assets are used anywhere. Showing someone else's game in your track record would read as a claim that you made it.

## Regenerating or adding an image
```
Get-Content design\prompts\v3-05-plan-audit.txt -Raw | & "$env:LOCALAPPDATA\OpenAI\Codex\bin\<version>\codex.exe" exec - -i design\masters\v3-01-hero-wide.png --skip-git-repo-check -s read-only
```
Codex replies with the path of the PNG it saved, under `~/.codex/generated_images/`. Export it for the web as JPEG at quality 78–84.
