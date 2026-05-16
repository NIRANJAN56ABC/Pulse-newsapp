const express = require("express")
const cors = require("cors")
const session = require("express-session")
require("dotenv").config()

const connectDB = require("./config/db")
const passport = require("./config/passport")
const newsRoutes = require("./routes/newsRoutes")
const authRoutes = require("./routes/authRoutes")
const userRoutes = require("./routes/userRoutes")
const digestRoutes = require("./routes/digestRoutes")
const { startAutoRefresh } = require("./services/rssService")

const app = express()

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true)
    // Allow localhost for development
    if (origin.startsWith("http://localhost")) return callback(null, true)
    // Allow any vercel.app subdomain
    if (origin.endsWith(".vercel.app")) return callback(null, true)
    // Allow the main production domain
    if (origin === "https://pulse-newsapp.vercel.app") return callback(null, true)
    return callback(new Error("Not allowed by CORS"))
  },
  credentials: true,
}))
app.use(express.json())

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,       // HTTPS only (Render uses HTTPS)
    sameSite: "none",   // required for cross-origin (Vercel ↔ Render)
  }
}))
app.use(passport.initialize())

connectDB()

app.use("/api/news",   newsRoutes)
app.use("/api/auth",   authRoutes)
app.use("/api/user",   userRoutes)
app.use("/api/digest", digestRoutes)

app.get("/", (req, res) => res.send("Pulse API Running"))

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  startAutoRefresh()
})
