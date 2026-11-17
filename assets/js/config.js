/*
  Site configuration — the only file you need to touch for launch settings.

  REVIEW MODE
  While `reviewMode` is true, the page shows striped "caution tape" markers on:
    - [data-proposed]  prices, timelines and policies I proposed but you haven't approved
    - [data-needs]     proof slots that need real evidence from you
  Set `reviewMode: false` before sending traffic. In live mode, [data-needs] slots are
  hidden entirely and [data-proposed] values render as normal text — so approve or edit
  every proposed value first. You can preview either mode with ?review=1 or ?review=0.
*/
window.SITE_CONFIG = {
  reviewMode: false,

  brand: "Khaiel",

  // How many Roblox games you've worked on in total. The leaderboard only shows the
  // biggest ones (data/roblox.config.json); this number shows as "30+" across the page.
  gamesWorkedOn: 30,

  // The form posts to /api/lead, which sends it to Discord. The webhook URL is NOT here: it's in
  // Vercel → your project → Settings → Environment Variables → DISCORD_WEBHOOK, so nobody can read it.
  // Only fill this in to send the form somewhere else instead (Formspree, Basin, any JSON POST endpoint).
  formEndpoint: "",

  // Shown in the email fallback and the footer. Leave empty to hide.
  contactEmail: "",

  // Optional social links. Leave empty to hide.
  tiktokUrl: "https://www.tiktok.com/@khaieldev",
  discordUrl: "https://discord.com/users/875776204387520552",

  // Your Discord username (without the @). Shows on the "DM me on Discord" card and
  // adds a "Copy username" button. Leave empty to show just the button.
  discordUsername: "khaieldev"
};
