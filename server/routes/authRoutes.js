const express = require("express")
const passport = require("passport")
const jwt = require("jsonwebtoken")

const router = express.Router()

function makeToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "30d" })
}

// ── Initiate Google OAuth ────────────────────────────────────────────────────
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
)

// ── Google OAuth callback ────────────────────────────────────────────────────
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: `${process.env.CLIENT_URL}/?auth=failed` }),
  (req, res) => {
    const token = makeToken(req.user._id)
    // Redirect to client with token in query param — client stores it
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${token}`)
  }
)

// ── Get current user ─────────────────────────────────────────────────────────
router.get("/me", async (req, res) => {
  const header = req.headers.authorization
  if (!header?.startsWith("Bearer ")) return res.status(401).json({ message: "No token" })
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET)
    const User = require("../models/user")
    const user = await User.findById(payload.userId).select("-__v").lean()
    if (!user) return res.status(404).json({ message: "User not found" })
    res.json(user)
  } catch {
    res.status(401).json({ message: "Invalid token" })
  }
})

module.exports = router
