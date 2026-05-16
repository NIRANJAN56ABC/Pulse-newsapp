const axios = require("axios")

const OPENROUTER_API = "https://openrouter.ai/api/v1/chat/completions"
const MODEL = "meta-llama/llama-3.1-8b-instruct:free"

// In-memory cache
let digestCache = { text: null, generatedAt: null }

async function generateDigest(articles) {
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn("[digestService] OPENROUTER_API_KEY not set — skipping digest")
    return null
  }

  // Pick top 10 most recent articles with real titles
  const top = articles
    .filter((a) => a.title && a.title !== "Untitled")
    .slice(0, 10)

  if (top.length === 0) return null

  const headlines = top.map((a, i) => `${i + 1}. ${a.title}`).join("\n")

  const prompt = `You are a professional news anchor writing a daily briefing. Based on the following headlines, write a single flowing paragraph (3-5 sentences) that summarizes the most important stories of the day. Connect the stories naturally, be concise and journalistic. Do not use bullet points. Do not start with "Today" — vary the opening. Do not mention that these are headlines.

Headlines:
${headlines}

Write the briefing paragraph now:`

  try {
    const { data } = await axios.post(
      OPENROUTER_API,
      {
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        max_tokens: 200,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.CLIENT_URL ?? "http://localhost:5173",
          "X-Title": "Pulse News",
        },
        timeout: 20000,
      }
    )

    const text = data?.choices?.[0]?.message?.content?.trim()
    if (!text) throw new Error("Empty response from OpenRouter")

    digestCache = { text, generatedAt: new Date().toISOString() }
    console.log("[digestService] Digest generated successfully")
    return digestCache
  } catch (err) {
    console.error("[digestService] Failed to generate digest:", err.message)
    return digestCache.text ? digestCache : null // return stale cache on error
  }
}

function getDigestCache() {
  return digestCache
}

module.exports = { generateDigest, getDigestCache }
