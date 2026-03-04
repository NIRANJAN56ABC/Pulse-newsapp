const Parser = require("rss-parser")

const parser = new Parser()

const fetchTopNews = async () => {

  try {

    const feed = await parser.parseURL(
      "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en"
    )

    return feed.items

  } catch (error) {

    console.error("RSS fetch error:", error.message)
    return []

  }

}

module.exports = fetchTopNews