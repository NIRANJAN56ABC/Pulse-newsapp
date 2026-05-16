const express = require("express")
const User = require("../models/user")
const { requireAuth } = require("../middleware/auth")

const router = express.Router()

// All routes require auth
router.use(requireAuth)

// ── Bookmarks ────────────────────────────────────────────────────────────────

// GET all bookmarks
router.get("/bookmarks", async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("bookmarks").lean()
    res.json(user.bookmarks)
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch bookmarks" })
  }
})

// POST add bookmark
router.post("/bookmarks", async (req, res) => {
  try {
    const article = req.body
    if (!article?.link) return res.status(400).json({ message: "Article link required" })

    await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { bookmarks: article } },
      { new: true }
    )
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ message: "Failed to add bookmark" })
  }
})

// DELETE remove bookmark by link
router.delete("/bookmarks", async (req, res) => {
  try {
    const { link } = req.body
    if (!link) return res.status(400).json({ message: "Link required" })

    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { bookmarks: { link } } }
    )
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ message: "Failed to remove bookmark" })
  }
})

// ── Read history ─────────────────────────────────────────────────────────────

// POST record article open — stores full article snapshot, keeps last 50
router.post("/history", async (req, res) => {
  try {
    const { link, category, article } = req.body
    if (!link) return res.status(400).json({ message: "Link required" })

    const user = await User.findById(req.user._id)

    // Build the snapshot — use full article if provided, otherwise minimal stub
    const snapshot = article && article.title
      ? { title: article.title, link, source: article.source, category: article.category ?? category, content: article.content, pubDate: article.pubDate }
      : { title: link, link }

    // Prepend, deduplicate by link, cap at 50
    user.readHistory = [
      snapshot,
      ...user.readHistory.filter((h) => h.link !== link),
    ].slice(0, 50)

    // Update category weights for "For You" feed
    if (category) {
      const current = user.categoryWeights.get(category) ?? 0
      user.categoryWeights.set(category, current + 1)
    }

    await user.save()
    res.json({ ok: true })
  } catch (e) {
    res.status(500).json({ message: "Failed to record history" })
  }
})

// GET read history
router.get("/history", async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("readHistory").lean()
    res.json(user.readHistory)
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch history" })
  }
})

// ── Category weights (For You) ────────────────────────────────────────────────

router.get("/preferences", async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("categoryWeights").lean()
    res.json(Object.fromEntries(user.categoryWeights))
  } catch (e) {
    res.status(500).json({ message: "Failed to fetch preferences" })
  }
})

module.exports = router
