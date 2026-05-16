const mongoose = require("mongoose")

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: String,
    link: {
      type: String,
      unique: true,
    },
    pubDate: Date,
    source: String,
    category: String,
  },
  {
    timestamps: true,
  }
)

const News = mongoose.model("News", newsSchema)

module.exports = News
