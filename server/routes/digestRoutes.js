const express = require("express")
const { getDigestCache } = require("../services/digestService")

const router = express.Router()

// GET /api/digest
// Returns the cached AI-generated daily briefing
router.get("/", (req, res) => {
  const cache = getDigestCache()
  if (!cache.text) {
    return res.status(503).json({ message: "Digest not yet available" })
  }
  res.json({ text: cache.text, generatedAt: cache.generatedAt })
})

module.exports = router
