const express = require("express")
const News = require("../models/news")
const fetchTopNews = require("../services/rssService")
const { summarizeArticle } = require("../services/aiService")

const router = express.Router()

router.get("/", async (req, res) => {

  try {

    const articles = await fetchTopNews()

    for (let item of articles) {

      await News.updateOne(
        { link: item.link },
        {
          title: item.title,
          content: item.contentSnippet,
          link: item.link,
          pubDate: item.pubDate
        },
        { upsert: true }
      )

    }

    const news = await News.find()
      .sort({ pubDate: -1 })
      .limit(20)

    res.json(news)

  } catch (error) {

    res.status(500).json({ message: "Error fetching news" })

  }

})

router.post("/summarize", async (req, res) => {

  try {

    const { text } = req.body

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Text is required to summarize." })
    }

    const summary = await summarizeArticle(text)

    res.json({ summary })

  } 
//   catch (error) {

//     console.error("Error summarizing article:", error.message)
//     res.status(500).json({
//       message: "Error summarizing article with AI.",
//     })

//   }
catch (error) {
    console.error("Error summarizing article:", error)
  
    if (error?.status === 429 || error?.error?.code === 429) {
      return res.status(429).json({
        error: "AI quota reached. Please try again later."
      })
    }
  
    res.status(500).json({
      error: "Failed to summarize article"
    })
  }

})

module.exports = router