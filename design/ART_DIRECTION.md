# Art direction: "Night Diorama"

All site imagery was generated with **ChatGPT image generation, run through your Codex app** (`codex exec`). It uses the `imagegen` tool and counts toward your ChatGPT plan. The exact prompts are in [`prompts/`](prompts) and the full-resolution masters are in `masters/`. The masters are kept locally and git-ignored.

## The idea in one sentence
Your players are tiny lime orbs of light walking a floating path through glowing checkpoints. The players who quit turn into ember sparks and fall into the dark.

That one picture tells the visitor the whole business before they read a word: *your game is leaking players at specific checkpoints, and they can be found and fixed.* The art also tells a story in order:
1. **Hero:** the game is leaking.
2. **Pricing:** diagnose it (the magnifier), fix it (the gap being repaired), grow it (the thriving island).
3. **Closing section:** the same world repaired, with nothing leaking.

## Style bible
| | |
|---|---|
| **Medium** | Premium cinematic 3D render, a miniature diorama with a tilt-shift macro feel. |
| **World** | Chunky toy-like bricks with rounded edges and small round studs, in matte graphite, slate blue and deep teal. Floating islands have jagged rock undersides. Not voxel, not pixel art, not Minecraft. |
| **Players** | Tiny glowing lime orbs (`#C6FF3D`). They're never characters, which also keeps the art clear of Roblox avatar IP. |
| **Quitting players** | Ember-orange sparks (`#FF6A3D`) falling with short trails. |
| **Checkpoints** | Slim glowing lime rings standing on the walkway. |
| **Light** | Night. The orbs, rings, spawn pad and beacon are the light sources, with a cool rim light, volumetric haze, bloom and shallow depth of field. |
| **Palette** | Near-black `#07090C`, graphite, slate blue, deep teal, lime and ember. Nothing else: no purple, no pink. |
| **Composition** | Edges always fade to `#07090C`, so every image melts into the page with no visible rectangle. Wide images leave the left ~40% empty for the headline. |
| **Never** | Text, logos, UI, people, avatars, watermarks, stars or a horizon. |

## Assets
| File on site | Master | Prompt | Used for |
|---|---|---|---|
| `assets/img/hero-wide-1600.jpg`, `-1100` | `hero-wide-v2.png` | `02-hero-wide.txt` | Desktop hero (1200px and up) |
| `assets/img/hero-square-900.jpg`, `-1254` | `hero-square.png` | `03-hero-square.txt` | Phone and tablet hero |
| `assets/img/plan-audit-900.jpg` | `plan-audit.png` | `04-plan-audit.txt` | Game Audit card |
| `assets/img/plan-fix-900.jpg` | `plan-fix.png` | `05-plan-fix.txt` | Fix Sprint card |
| `assets/img/plan-grow-900.jpg` | `plan-grow.png` | `06-plan-grow.txt` | Build & Grow card |
| `assets/img/final-wide-1600.jpg`, `-1100` | `final-wide.png` | `07-final-wide.txt` | "Let's plug the leak" band |
| `assets/og.jpg` | composited from `hero-wide-v2.png` | n/a | Link preview (TikTok bio, Discord, iMessage) |

`hero-wide-v1.png` (`01-hero-wide-original.txt`) was the first render. It became the **style reference** attached to every other prompt, which is why the whole set is consistent.

## Live details layered on the hero
The hero render is static. `site.js` adds two kinds of animation on top of it, positioned in percentages of each render (`HERO_FX`):
- Ember sparks dropping from each checkpoint.
- Slow pulses on the spawn pad and the beacon.

If you regenerate a hero image, update those coordinates.

## Regenerating or adding an image
From PowerShell, with a prompt file (`-i` attaches the style reference):

```
Get-Content design\prompts\04-plan-audit.txt -Raw | & "$env:LOCALAPPDATA\OpenAI\Codex\bin\<version>\codex.exe" exec - -i design\masters\hero-wide-v1.png --skip-git-repo-check -s read-only
```

Codex replies with the path of the saved PNG, under `~/.codex/generated_images/`. Export it for the web as JPEG at quality 80–84. Dark renders compress very well, and every site image is under 110 KB.

**Known quirk:** the model draws 7 checkpoint rings instead of 6 even when asked. Nobody counts rings, and the composition is more important than the count.
