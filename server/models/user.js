const mongoose = require("mongoose")

const articleSnapshotSchema = new mongoose.Schema({
  title:    { type: String, required: true },
  link:     { type: String, required: true },
  source:   String,
  category: String,
  content:  String,
  pubDate:  Date,
  _articleId: String,
}, { _id: false })

const userSchema = new mongoose.Schema({
  googleId:    { type: String, required: true, unique: true },
  email:       { type: String, required: true },
  name:        { type: String, required: true },
  avatar:      String,
  bookmarks:   { type: [articleSnapshotSchema], default: [] },
  // category weights for "For You" feed: { Technology: 5, World: 2, ... }
  categoryWeights: { type: Map, of: Number, default: {} },
  // last 50 opened articles (full snapshot so history page never needs a DB lookup)
  readHistory: { type: [articleSnapshotSchema], default: [] },
}, { timestamps: true })

module.exports = mongoose.model("User", userSchema)
