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
  origin: process.env.CLIENT_URL,
  credentials: true,
}))
app.use(express.json())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
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
