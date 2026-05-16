const Parser = require("rss-parser")
const News = require("../models/news")
const { generateDigest } = require("./digestService")

const parser = new Parser({
  timeout: 10000,
  headers: { "User-Agent": "Mozilla/5.0 (compatible; NewsSummarizer/1.0)" },
})

const SOURCES = [
  // ── General / World ───────────────────────────────────────────────────────
  { name: "Google News IN",  url: "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en",       category: "General"    },
  { name: "Reuters",         url: "https://feeds.reuters.com/reuters/topNews",                    category: "World"      },
  { name: "BBC News",        url: "https://feeds.bbci.co.uk/news/rss.xml",                        category: "World"      },
  { name: "Al Jazeera",      url: "https://www.aljazeera.com/xml/rss/all.xml",                    category: "World"      },
  { name: "NPR News",        url: "https://feeds.npr.org/1001/rss.xml",                           category: "World"      },

  // ── Technology ────────────────────────────────────────────────────────────
  { name: "Hacker News",     url: "https://hnrss.org/frontpage",                                  category: "Technology" },
  { name: "TechCrunch",      url: "https://techcrunch.com/feed/",                                 category: "Technology" },
  { name: "The Verge",       url: "https://www.theverge.com/rss/index.xml",                       category: "Technology" },
  { name: "Wired",           url: "https://www.wired.com/feed/rss",                               category: "Technology" },

  // ── India ─────────────────────────────────────────────────────────────────
  { name: "The Hindu",       url: "https://www.thehindu.com/feeder/default.rss",                  category: "India"      },
  { name: "NDTV",            url: "https://feeds.feedburner.com/ndtvnews-top-stories",             category: "India"      },
  { name: "Times of India",  url: "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",   category: "India"      },

  // ── Business ──────────────────────────────────────────────────────────────
  { name: "Financial Times", url: "https://www.ft.com/rss/home",                                  category: "Business"   },

  // ── Science ───────────────────────────────────────────────────────────────
  { name: "NASA",            url: "https://www.nasa.gov/rss/dyn/breaking_news.rss",               category: "Science"    },

  // ── Sports ───────────────────────────────────────────────────────────────
  { name: "ESPN",            url: "https://www.espn.com/espn/rss/news",                           category: "Sports"     },
]

const CACHE_TTL_MS = 15 * 60 * 1000

let memCache = { articles: [], lastFetched: null }

function normalize(item, source) {
  return {
    title: item.title?.trim() ?? "Untitled",
    link: item.link ?? item.guid ?? null,
    pubDate: item.pubDate ?? item.isoDate ?? null,
    source: source.name,
    category: source.category,
    content: item.contentSnippet ?? item.summary ?? null,
  }
}

async function fetchSource(source) {
  try {
    const feed = await parser.parseURL(source.url)
    return feed.items.map((item) => normalize(item, source))
  } catch (err) {
    console.error(`[rssService] Failed to fetch "${source.name}": ${err.message}`)
    return []
  }
}

async function fetchFromRSS() {
  const results = await Promise.allSettled(SOURCES.map(fetchSource))
  const articles = results
    .filter((r) => r.status === "fulfilled")
    .flatMap((r) => r.value)

  articles.sort((a, b) => {
    const da = a.pubDate ? new Date(a.pubDate) : 0
    const db = b.pubDate ? new Date(b.pubDate) : 0
    return db - da
  })

  return articles
}

async function saveToMongo(articles) {
  const valid = articles.filter((a) => a.link)
  const ops = valid.map((a) => ({
    updateOne: {
      filter: { link: a.link },
      update: {
        $set: {
          title: a.title,
          content: a.content,
          pubDate: a.pubDate ? new Date(a.pubDate) : null,
          source: a.source,
          category: a.category,
        },
      },
      upsert: true,
    },
  }))

  if (ops.length > 0) {
    await News.bulkWrite(ops, { ordered: false })
    console.log(`[rssService] Upserted ${ops.length} articles to MongoDB`)
  }
}

async function loadFromMongo(limit = 60) {
  return News.find().sort({ pubDate: -1 }).limit(limit).lean()
}

async function fetchTopNews() {
  const now = Date.now()
  const isStale = !memCache.lastFetched || now - memCache.lastFetched > CACHE_TTL_MS

  if (!isStale && memCache.articles.length > 0) {
    console.log("[rssService] Serving from memory cache")
    return memCache.articles
  }

  console.log("[rssService] Fetching from RSS sources...")
  let articles = []

  try {
    articles = await fetchFromRSS()
    if (articles.length > 0) await saveToMongo(articles)
  } catch (err) {
    console.error("[rssService] RSS fetch failed:", err.message)
  }

  if (articles.length === 0) {
    console.log("[rssService] Falling back to MongoDB cache")
    articles = await loadFromMongo()
  }

  if (articles.length > 0) {
    memCache.articles = articles
    memCache.lastFetched = now
    // Fire-and-forget digest generation — doesn't block the news response
    generateDigest(articles).catch(() => {})
  }

  return memCache.articles
}

function startAutoRefresh(intervalMs = CACHE_TTL_MS) {
  console.log(`[rssService] Auto-refresh every ${intervalMs / 60000} minutes`)
  setInterval(async () => {
    console.log("[rssService] Background refresh triggered")
    memCache.lastFetched = null
    await fetchTopNews()
  }, intervalMs)
}

module.exports = { fetchTopNews, startAutoRefresh }
