/*
  EXAMPLE DATA: six fictional games so you can see the dashboard working.
  Visitors never see it: while "example" is true, the leaderboard and stats only show in review mode.
  To show your real games, list them in data/roblox.config.json. The GitHub workflow
  (or scripts/update-roblox.ps1) then rewrites this file with live numbers from Roblox.
*/
window.ROBLOX_DATA = {
  "example": true,
  "updatedAt": null,
  "headshot": "assets/img/avatar-placeholder.jpg",
  "games": [
    { "name": "Lava Factory Tycoon", "url": "#", "icon": "assets/img/icons/ex-1.jpg", "role": "Creator", "visits": 48210342, "playing": 3184, "favorites": 412093, "likeRatio": 91, "peakCCU": 21460 },
    { "name": "Rainbow Tower Obby",  "url": "#", "icon": "assets/img/icons/ex-2.jpg", "role": "Creator", "visits": 31754118, "playing": 1942, "favorites": 268110, "likeRatio": 88, "peakCCU": 12805 },
    { "name": "Egg Hatch Simulator", "url": "#", "icon": "assets/img/icons/ex-3.jpg", "role": "Lead scripter", "visits": 17903477, "playing": 861, "favorites": 150322, "likeRatio": 90, "peakCCU": 9350 },
    { "name": "Midnight Hallway",    "url": "#", "icon": "assets/img/icons/ex-4.jpg", "role": "Creator", "visits": 8402190, "playing": 412, "favorites": 98431, "likeRatio": 93, "peakCCU": 6108 },
    { "name": "Block Defense",       "url": "#", "icon": "assets/img/icons/ex-5.jpg", "role": "Systems", "visits": 5251006, "playing": 248, "favorites": 40117, "likeRatio": 87, "peakCCU": 3912 },
    { "name": "Neon Kart Rush",      "url": "#", "icon": "assets/img/icons/ex-6.jpg", "role": "Creator", "visits": 2104882, "playing": 97, "favorites": 19870, "likeRatio": 89, "peakCCU": 1804 }
  ]
};
