const { GoogleGenAI } = require('@google/genai')

let ai

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in the environment.')
  }

  if (!ai) {
    ai = new GoogleGenAI({ apiKey })
  }

  return ai
}

const summarizeArticle = async (text) => {
  if (!text || !text.trim()) {
    throw new Error('No article text provided to summarize.')
  }

  const client = getClient()

  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: text,
  })

  // @google/genai returns `text` as a property, not a function
  const summaryText = typeof response.text === 'string'
    ? response.text
    : Array.isArray(response.candidates)
      ? response.candidates
          .flatMap((c) => c.content?.parts ?? [])
          .map((p) => p.text ?? '')
          .join(' ')
      : ''

  return summaryText.trim()
}

module.exports = {
  summarizeArticle,
}

// const { GoogleGenAI } = require("@google/genai")

// let ai

// const getClient = () => {
//   const apiKey = process.env.GEMINI_API_KEY

//   if (!apiKey) {
//     throw new Error("GEMINI_API_KEY is not set in the environment.")
//   }

//   if (!ai) {
//     ai = new GoogleGenAI({ apiKey })
//   }

//   return ai
// }

// const summarizeArticle = async (text) => {
//   if (!text || !text.trim()) {
//     throw new Error("No article text provided to summarize.")
//   }

//   const client = getClient()

//   const prompt = `
// Summarize the following news article.

// Rules:
// - Return ONLY 3 short bullet points
// - Each bullet must start with "-"
// - No introduction or explanation
// - Each bullet under 20 words
// - Focus only on key facts

// Example format:
// - Point one
// - Point two
// - Point three

// Article:
// ${text}
// `

//   const response = await client.models.generateContent({
//     model: "gemini-2.5-flash",
//     contents: prompt,
//     config: {
//       temperature: 0.2
//     }
//   })

//   const summaryText =
//     typeof response.text === "string"
//       ? response.text
//       : Array.isArray(response.candidates)
//       ? response.candidates
//           .flatMap((c) => c.content?.parts ?? [])
//           .map((p) => p.text ?? "")
//           .join(" ")
//       : ""

//   return summaryText.trim()
// }

// module.exports = {
//   summarizeArticle,
// }
