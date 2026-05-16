const express = require("express")
const { fetchTopNews } = require("../services/rssService")
const News = require("../models/news")

const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const articles = await fetchTopNews()
    res.json(articles)
  } catch (error) {
    console.error("[newsRoutes] Error:", error.message)
    res.status(500).json({ message: "Error fetching news" })
  }
})

// POST /api/news/by-links
// Body: { links: ["https://...", ...] }
// Returns the matching News documents in the same order as the input links.
router.post("/by-links", async (req, res) => {
  try {
    const { links } = req.body
    if (!Array.isArray(links) || links.length === 0) {
      return res.json([])
    }

    const articles = await News.find({ link: { $in: links } }).lean()

    // Preserve the original order (most-recently-read first)
    const byLink = Object.fromEntries(articles.map((a) => [a.link, a]))
    const ordered = links.map((l) => byLink[l]).filter(Boolean)

    res.json(ordered)
  } catch (error) {
    console.error("[newsRoutes] by-links error:", error.message)
    res.status(500).json({ message: "Error fetching articles by links" })
  }
})

module.exports = router
