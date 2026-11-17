// Receives the "Send me your game" form and posts it to your Discord channel.
// The webhook URL lives in Vercel (Settings → Environment Variables → DISCORD_WEBHOOK),
// never in the page, so nobody can read it from the site and spam or delete it.

const LABELS = {
  game_link: "Game", no_game: "No game yet", idea: "Idea", service: "Needs", problem: "Holding it back",
  budget: "Budget", notes: "Notes", m_dau: "Daily players", m_session_min: "Avg session (min)",
  m_d1: "D1 %", m_d7: "D7 %", m_payer: "Payer conversion %", email: "Email", discord: "Discord", name: "Name"
};
const PROBLEM = {
  click: "Nobody clicks it", hook: "Players quit in the first minute", loop: "They get bored fast",
  d1: "They don't come back tomorrow", d7: "They're gone within a week", spend: "They play, but nobody buys",
  new: "It's not out yet", unsure: "Not sure"
};
const INLINE = ["budget", "email", "discord", "name"];

// best effort: each server instance remembers recent senders for 10 minutes
const recent = new Map();
const WINDOW_MS = 10 * 60 * 1000, MAX_PER_WINDOW = 5;
function tooMany(ip) {
  const now = Date.now();
  const hits = (recent.get(ip) || []).filter(t => now - t < WINDOW_MS);
  hits.push(now);
  recent.set(ip, hits);
  return hits.length > MAX_PER_WINDOW;
}

function clean(v, max) { return String(v == null ? "" : v).replace(/\s+/g, " ").trim().slice(0, max); }

module.exports = async (req, res) => {
  if (req.method !== "POST") { res.setHeader("Allow", "POST"); return res.status(405).json({ error: "POST only" }); }

  const webhook = process.env.DISCORD_WEBHOOK;
  if (!webhook) return res.status(503).json({ error: "not configured" });

  let data = req.body;
  if (typeof data === "string") { try { data = JSON.parse(data); } catch { data = null; } }
  if (!data || typeof data !== "object") return res.status(400).json({ error: "bad request" });

  // bots fill in the hidden "company" box; people never see it. Pretend it worked.
  if (clean(data.company, 200)) return res.status(200).json({ ok: true });

  const email = clean(data.email, 200), discord = clean(data.discord, 100);
  if (!email && !discord) return res.status(400).json({ error: "add an email or Discord" });
  if (!clean(data.game_link, 300) && !clean(data.no_game, 50)) return res.status(400).json({ error: "add a game link" });

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (tooMany(ip)) return res.status(429).json({ error: "slow down" });

  const fields = Object.keys(LABELS).map(k => {
    let v = clean(data[k], 1000);
    if (!v) return null;
    if (k === "problem") v = v.split(", ").map(p => PROBLEM[p] || p).join(", ");
    return { name: LABELS[k], value: v, inline: INLINE.includes(k) };
  }).filter(Boolean);

  const source = clean(data.source, 200);
  const message = {
    username: "Khaiel site",
    allowed_mentions: { parse: [] },
    embeds: [{
      title: ("New project: " + (clean(data.game_link, 230) || "starting from an idea")),
      color: 0x00b06f,
      fields: fields.slice(0, 25),
      footer: { text: source ? "Came from " + source : "Direct visit" },
      timestamp: new Date().toISOString()
    }]
  };

  try {
    const r = await fetch(webhook, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(message) });
    if (!r.ok) return res.status(502).json({ error: "discord said " + r.status });
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ error: "couldn't reach discord" });
  }
};
