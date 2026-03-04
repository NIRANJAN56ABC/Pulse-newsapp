const express = require("express")
const cors = require("cors")
const dotenv = require("dotenv")
const path = require("path")

const connectDB = require("./config/db")
const newsRoutes = require("./routes/newsRoutes")
require("dotenv").config()
// dotenv.config({ path: path.resolve(__dirname, "../.env") })

const app = express()

app.use(cors())
app.use(express.json())

connectDB()

app.use("/api/news", newsRoutes)

app.get("/", (req, res) => {
  res.send("News API Running")
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})