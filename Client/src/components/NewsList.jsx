import { useState, useMemo, useRef, useEffect } from "react"
import ArticleModal from "./ArticleModal"
import { useAuth } from "../context/AuthContext"

// ── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ["All", "World", "Technology", "Science", "Health", "Business", "Sports", "India"]
const ALL_SOURCES = [
  "Google News IN", "Reuters", "BBC News", "Al Jazeera", "NPR News",
  "Hacker News", "TechCrunch", "The Verge", "Wired",
  "The Hindu", "NDTV", "Times of India",
  "Financial Times", "NASA", "ESPN",
]

const CAT_STYLE = {
  Science:    { pill: "bg-emerald-400/10 text-emerald-500 ring-emerald-400/20 dark:text-emerald-300", bar: "#34d399" },
  Technology: { pill: "bg-sky-400/10 text-sky-500 ring-sky-400/20 dark:text-sky-300",               bar: "#38bdf8" },
  World:      { pill: "bg-orange-400/10 text-orange-500 ring-orange-400/20 dark:text-orange-300",   bar: "#fb923c" },
  Health:     { pill: "bg-purple-400/10 text-purple-500 ring-purple-400/20 dark:text-purple-300",   bar: "#c084fc" },
  Business:   { pill: "bg-amber-400/10 text-amber-500 ring-amber-400/20 dark:text-amber-300",       bar: "#fbbf24" },
  Sports:     { pill: "bg-rose-400/10 text-rose-500 ring-rose-400/20 dark:text-rose-300",           bar: "#fb7185" },
  India:      { pill: "bg-orange-400/10 text-orange-500 ring-orange-400/20 dark:text-orange-300",   bar: "#fb923c" },
  General:    { pill: "bg-slate-400/10 text-slate-500 ring-slate-400/20 dark:text-slate-400",       bar: "#94a3b8" },
}

const CATEGORY_KEYWORDS = {
  Science:    ["study", "research", "climate", "ocean", "space", "cern", "physics", "biology", "chemistry", "quark", "plasma", "nasa", "science"],
  Technology: ["ai", "tech", "amazon", "google", "apple", "alexa", "software", "app", "robot", "digital", "cyber", "data"],
  Health:     ["health", "medical", "disease", "tuberculosis", "covid", "hospital", "doctor", "vaccine", "mental", "cancer"],
  Business:   ["market", "economy", "stock", "gdp", "trade", "company", "startup", "fund", "revenue", "billion", "trillion"],
  Sports:     ["cricket", "football", "ipl", "nba", "fifa", "match", "tournament", "player", "league", "sport"],
  World:      ["war", "iran", "ukraine", "nato", "trump", "election", "political", "government", "president", "minister", "conflict"],
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function detectCategory(title = "", source = "") {
  const text = (title + " " + source).toLowerCase()
  for (const [cat, kws] of Object.entries(CATEGORY_KEYWORDS)) {
    if (kws.some((kw) => text.includes(kw))) return cat
  }
  return null
}

function formatTime(pubDate) {
  if (!pubDate) return null
  const d = new Date(pubDate)
  const ms = Date.now() - d
  const m = Math.floor(ms / 60000)
  const h = Math.floor(ms / 3600000)
  const dy = Math.floor(ms / 86400000)
  if (m < 60) return `${m}m ago`
  if (h < 24) return `${h}h ago`
  if (dy < 7) return `${dy}d ago`
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function extractSource(a) {
  if (a.source) return a.source
  try { return new URL(a.link).hostname.replace("www.", "") } catch { return null }
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl p-5" style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
      <div className="h-3 w-14 animate-pulse rounded-full" style={{ background: "var(--border-default)" }} />
      <div className="space-y-2 pt-1">
        <div className="h-4 w-full animate-pulse rounded" style={{ background: "var(--border-subtle)" }} />
        <div className="h-4 w-5/6 animate-pulse rounded" style={{ background: "var(--border-subtle)" }} />
        <div className="h-4 w-4/6 animate-pulse rounded" style={{ background: "var(--border-subtle)" }} />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="h-2.5 w-20 animate-pulse rounded" style={{ background: "var(--border-subtle)" }} />
        <div className="h-6 w-16 animate-pulse rounded-lg" style={{ background: "var(--border-subtle)" }} />
      </div>
    </div>
  )
}

// ── Article Card ─────────────────────────────────────────────────────────────

function ArticleCard({ article, isBookmarked, onBookmark, onOpen }) {
  const source = extractSource(article)
  const timeStr = formatTime(article.pubDate)
  const cat = article._category
  const s = CAT_STYLE[cat] ?? CAT_STYLE.General
  const [copied, setCopied] = useState(false)

  const handleShare = async (e) => {
    e.stopPropagation()
    if (navigator.share) {
      try { await navigator.share({ title: article.title, url: article.link }) } catch { /* cancelled */ }
    } else {
      try {
        await navigator.clipboard.writeText(article.link)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      } catch { /* blocked */ }
    }
  }

  return (
    <article
      onClick={() => onOpen(article)}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl transition-all duration-200"
      style={{
        border: "1px solid var(--border-subtle)",
        background: "var(--bg-surface)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "var(--border-hover)"
        e.currentTarget.style.background = "var(--bg-surface-hover)"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "var(--border-subtle)"
        e.currentTarget.style.background = "var(--bg-surface)"
      }}
    >
      {/* Left color bar on hover */}
      <div
        className="absolute left-0 top-0 h-full w-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-70"
        style={{ background: s.bar }}
      />

      <div className="flex flex-1 flex-col p-5">
        {/* Category + time */}
        <div className="mb-3.5 flex items-center justify-between gap-2">
          {cat ? (
            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ring-1 ${s.pill}`}>
              {cat}
            </span>
          ) : <span />}
          {timeStr && (
            <span className="shrink-0 text-[11px]" style={{ color: "var(--text-quaternary)", fontFamily: "var(--font-mono)" }}>
              {timeStr}
            </span>
          )}
        </div>

        {/* Title — Playfair Display */}
        <h2
          className="flex-1 line-clamp-3 leading-[1.45] transition-colors duration-150"
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "15px",
            fontWeight: 600,
            color: "var(--text-secondary)",
          }}
        >
          {article.title}
        </h2>

        {/* Snippet */}
        {article.content && (
          <p
            className="mt-2.5 line-clamp-2 text-[12px] leading-relaxed"
            style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-sans)" }}
          >
            {article.content}
          </p>
        )}

        {/* Footer */}
        <div className="mt-4 flex items-center gap-2 pt-3.5" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          {source && (
            <span className="truncate text-[11px]" style={{ color: "var(--text-quaternary)", fontFamily: "var(--font-mono)" }}>
              {source}
            </span>
          )}
          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            {/* Share */}
            <button
              onClick={handleShare}
              title={copied ? "Copied!" : "Share"}
              className="flex h-7 w-7 items-center justify-center rounded-lg transition-all"
              style={{
                background: copied ? "rgba(52,211,153,0.15)" : "var(--accent-bg)",
                color: copied ? "#34d399" : "var(--text-tertiary)",
              }}
            >
              {copied ? (
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              ) : (
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                </svg>
              )}
            </button>

            {/* Bookmark */}
            <button
              onClick={(e) => { e.stopPropagation(); onBookmark(article) }}
              title={isBookmarked ? "Remove" : "Save"}
              className="flex h-7 w-7 items-center justify-center rounded-lg transition-all"
              style={{
                background: isBookmarked ? "rgba(251,191,36,0.15)" : "var(--accent-bg)",
                color: isBookmarked ? "rgb(252,211,77)" : "var(--text-tertiary)",
              }}
            >
              <svg className="h-3.5 w-3.5" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
              </svg>
            </button>

            {/* Read */}
            {article.link && (
              <a
                href={article.link}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all"
                style={{ background: "var(--accent-bg)", color: "var(--text-secondary)" }}
              >
                Read
                <svg className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}

// ── Source Filter ─────────────────────────────────────────────────────────────

function SourceFilter({ activeSources, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const isFiltered = activeSources.length < ALL_SOURCES.length

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", fn)
    return () => document.removeEventListener("mousedown", fn)
  }, [])

  const toggle = (src) => {
    if (activeSources.includes(src)) {
      if (activeSources.length === 1) return
      onChange(activeSources.filter((s) => s !== src))
    } else {
      onChange([...activeSources, src])
    }
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12px] font-medium transition-all"
        style={{
          background: isFiltered ? "rgba(56,189,248,0.1)" : "var(--accent-bg)",
          color: isFiltered ? "rgb(56,189,248)" : "var(--text-tertiary)",
          outline: isFiltered ? "1px solid rgba(56,189,248,0.2)" : "none",
        }}
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591L15.75 12.5v6.75a.75.75 0 0 1-.375.648l-3 1.5a.75.75 0 0 1-1.125-.648V12.5L4.659 7.409A2.25 2.25 0 0 1 4 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
        </svg>
        Sources
        {isFiltered && (
          <span className="flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold" style={{ background: "rgba(56,189,248,0.2)", color: "rgb(56,189,248)" }}>
            {activeSources.length}
          </span>
        )}
        <svg className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-30 mt-2 w-48 rounded-xl p-1.5 shadow-2xl"
          style={{ border: "1px solid var(--border-default)", background: "var(--bg-elevated)" }}
        >
          <button
            onClick={() => onChange(isFiltered ? [...ALL_SOURCES] : [ALL_SOURCES[0]])}
            className="mb-0.5 w-full rounded-lg px-3 py-2 text-left text-[11px] font-medium transition-all"
            style={{ color: "var(--text-tertiary)" }}
          >
            {isFiltered ? "Select all" : "Deselect all"}
          </button>
          <div className="my-1" style={{ borderTop: "1px solid var(--border-subtle)" }} />
          {ALL_SOURCES.map((src) => {
            const on = activeSources.includes(src)
            return (
              <button
                key={src}
                onClick={() => toggle(src)}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[12px] transition-all"
                style={{ color: on ? "var(--text-primary)" : "var(--text-tertiary)" }}
              >
                <span
                  className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition"
                  style={{
                    borderColor: on ? "rgba(56,189,248,0.5)" : "var(--border-default)",
                    background: on ? "rgba(56,189,248,0.2)" : "transparent",
                    color: on ? "rgb(56,189,248)" : "transparent",
                  }}
                >
                  <svg className="h-2 w-2" fill="none" stroke="currentColor" strokeWidth="3.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </span>
                {src}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Stop words ───────────────────────────────────────────────────────────────

const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with","by",
  "from","as","is","was","are","were","be","been","being","have","has","had",
  "do","does","did","will","would","could","should","may","might","shall",
  "not","no","nor","so","yet","both","either","neither","each","few","more",
  "most","other","some","such","than","then","that","this","these","those",
  "it","its","he","she","they","we","you","i","his","her","their","our","your",
  "who","which","what","when","where","how","why","after","before","over",
  "under","again","further","once","here","there","all","any","both","each",
  "new","says","say","said","report","reports","amid","after","over","into",
  "up","out","about","against","between","through","during","without","within",
  "along","following","across","behind","beyond","plus","except","up","down",
  "off","above","below","near","just","also","back","now","even","well","way",
  "get","got","make","made","take","took","know","think","see","come","go",
  "one","two","three","first","second","last","next","many","much","more",
  "can","us","vs","per","amid","amid","amid","amid","amid",
])

// ── Trending topics extractor ─────────────────────────────────────────────────

function extractTrending(articles, topN = 12) {
  const freq = {}
  for (const a of articles) {
    const words = (a.title ?? "")
      .toLowerCase()
      .replace(/[^a-z\s'-]/g, " ")
      .split(/\s+/)
    for (const w of words) {
      const clean = w.replace(/^[-']+|[-']+$/g, "")
      if (clean.length < 3) continue
      if (STOP_WORDS.has(clean)) continue
      freq[clean] = (freq[clean] ?? 0) + 1
    }
  }
  return Object.entries(freq)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([word, count]) => ({ word: word.charAt(0).toUpperCase() + word.slice(1), count }))
}

// ── Trending strip ────────────────────────────────────────────────────────────

function TrendingStrip({ articles, onSelect }) {
  const topics = useMemo(() => extractTrending(articles), [articles])
  if (topics.length === 0) return null

  const max = topics[0].count

  return (
    <div className="mb-6">
      <div className="mb-2.5 flex items-center gap-2">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "#f97316" }} />
        <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-quaternary)", fontFamily: "var(--font-mono)" }}>
          Trending now
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {topics.map(({ word, count }) => {
          const weight = count / max
          const opacity = 0.5 + weight * 0.5
          const size = weight > 0.7 ? "13px" : weight > 0.4 ? "12px" : "11px"
          return (
            <button
              key={word}
              onClick={() => onSelect(word)}
              className="rounded-lg px-2.5 py-1 transition-all duration-150"
              style={{
                fontSize: size,
                fontWeight: weight > 0.6 ? 600 : 500,
                color: `rgba(var(--text-secondary-rgb, 180,180,180), ${opacity})`,
                color: "var(--text-tertiary)",
                background: "var(--accent-bg)",
                border: "1px solid var(--border-subtle)",
                fontFamily: "var(--font-sans)",
                opacity,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--border-hover)"
                e.currentTarget.style.background = "var(--bg-surface)"
                e.currentTarget.style.opacity = "1"
                e.currentTarget.style.color = "var(--text-primary)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-subtle)"
                e.currentTarget.style.background = "var(--accent-bg)"
                e.currentTarget.style.opacity = opacity
                e.currentTarget.style.color = "var(--text-tertiary)"
              }}
            >
              {word}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Share helper ──────────────────────────────────────────────────────────────

async function shareArticle(e, article) {
  e.stopPropagation()
  const shareData = { title: article.title, url: article.link }
  if (navigator.share) {
    try { await navigator.share(shareData) } catch { /* user cancelled */ }
  } else {
    try { await navigator.clipboard.writeText(article.link) } catch { /* clipboard blocked */ }
  }
}

function scoreArticle(article, weights) {
  const catScore = weights[article._category] ?? 0
  // small recency bonus: articles from the last 6 hours get +1
  const ageMs = article.pubDate ? Date.now() - new Date(article.pubDate) : Infinity
  const recencyBonus = ageMs < 6 * 3600 * 1000 ? 1 : 0
  return catScore + recencyBonus
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function NewsList({ articles, loading, error, query, onQueryChange, bookmarks, onToggleBookmark, onArticleOpen }) {
  const { user } = useAuth()
  const [activeCat, setActiveCat] = useState("All")
  const [activeSources, setActiveSources] = useState(ALL_SOURCES)
  const [modal, setModal] = useState(null)

  // categoryWeights comes back as a plain object from the API
  const weights = useMemo(() => {
    if (!user?.categoryWeights) return {}
    // handle both Map (if somehow still a Map) and plain object
    if (user.categoryWeights instanceof Map) return Object.fromEntries(user.categoryWeights)
    return user.categoryWeights
  }, [user?.categoryWeights])

  const hasWeights = Object.keys(weights).length > 0
  const showForYou = !!user // only show tab when logged in

  const enriched = useMemo(
    () => articles.map((a) => ({ ...a, _category: detectCategory(a.title, a.source ?? "") })),
    [articles]
  )

  const filtered = useMemo(() => {
    if (activeCat === "For You") {
      // score every article and sort descending; filter out score-0 only if we have weights
      return [...enriched]
        .map((a) => ({ ...a, _score: scoreArticle(a, weights) }))
        .sort((a, b) => b._score - a._score)
        .filter((a) => !hasWeights || a._score > 0 || !hasWeights)
    }
    return enriched.filter((a) => {
      const matchCat = activeCat === "All" || a._category === activeCat
      const matchSrc = activeSources.includes(a.source)
      return matchCat && matchSrc
    })
  }, [enriched, activeCat, activeSources, weights, hasWeights])

  const bookmarkIds = useMemo(
    () => new Set(bookmarks.map((b) => b._id ?? b.link)),
    [bookmarks]
  )

  return (
    <main className="w-full px-4 py-6 sm:px-6 sm:py-10">

      {/* Header */}
      <div className="mb-8">
        <h1
          className="tracking-tight"
          style={{ fontFamily: "var(--font-serif)", fontSize: "28px", fontWeight: 700, color: "var(--text-primary)" }}
        >
          {activeCat === "For You" ? "For You" : "Today's Headlines"}
        </h1>
        <p className="mt-1 text-[13px]" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-sans)" }}>
          {activeCat === "For You"
            ? "Ranked by your reading habits"
            : "Curated from trusted sources around the world"}
        </p>
      </div>

      {/* Trending topics — only on All tab when articles are loaded */}
      {activeCat === "All" && !loading && enriched.length > 0 && (
        <TrendingStrip articles={enriched} onSelect={(word) => onQueryChange(word)} />
      )}

      {/* Search + filter */}
      <div className="mb-5 flex items-center gap-2">
        <div className="relative flex-1">
          <svg className="pointer-events-none absolute inset-y-0 left-3 my-auto h-3.5 w-3.5" style={{ color: "var(--text-tertiary)" }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            className="w-full rounded-xl py-2.5 pl-9 pr-4 text-[13px] outline-none transition-all"
            style={{
              border: "1px solid var(--border-subtle)",
              background: "var(--accent-bg)",
              color: "var(--text-primary)",
              fontFamily: "var(--font-sans)",
            }}
            placeholder="Search headlines…"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onFocus={(e) => { e.target.style.borderColor = "var(--border-hover)"; e.target.style.background = "var(--bg-surface)" }}
            onBlur={(e) => { e.target.style.borderColor = "var(--border-subtle)"; e.target.style.background = "var(--accent-bg)" }}
          />
        </div>
        {activeCat !== "For You" && (
          <SourceFilter activeSources={activeSources} onChange={setActiveSources} />
        )}
      </div>

      {/* For You — nudge for new users with no history yet */}
      {activeCat === "For You" && !hasWeights && !loading && (
        <div
          className="mb-6 flex items-start gap-3 rounded-xl px-4 py-3.5 text-[13px]"
          style={{ border: "1px solid rgba(139,92,246,0.15)", background: "rgba(139,92,246,0.05)", color: "#a78bfa" }}
        >
          <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
          </svg>
          Keep reading articles and this feed will personalise itself to your interests.
        </div>
      )}

      {/* Category pills — horizontally scrollable on mobile */}
      <div className="mb-6 -mx-4 sm:mx-0">
        <div className="flex items-center gap-1 overflow-x-auto px-4 pb-1 sm:flex-wrap sm:px-0 sm:pb-0"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* For You tab — only when logged in */}
          {showForYou && (
            <button
              onClick={() => setActiveCat("For You")}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all"
              style={{
                background: activeCat === "For You" ? "linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.2))" : "transparent",
                color: activeCat === "For You" ? "#a78bfa" : "var(--text-tertiary)",
                outline: activeCat === "For You" ? "1px solid rgba(139,92,246,0.3)" : "none",
                fontFamily: "var(--font-sans)",
              }}
            >
              <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" />
              </svg>
              For You
            </button>
          )}

          {showForYou && (
            <span className="h-4 w-px shrink-0" style={{ background: "var(--border-subtle)" }} />
          )}

          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className="shrink-0 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all"
              style={{
                background: activeCat === cat ? "var(--border-default)" : "transparent",
                color: activeCat === cat ? "var(--text-primary)" : "var(--text-tertiary)",
                fontFamily: "var(--font-sans)",
              }}
            >
              {cat}
            </button>
          ))}

          {!loading && (
            <span className="ml-auto shrink-0 pl-2 text-[11px]" style={{ color: "var(--text-quaternary)", fontFamily: "var(--font-mono)" }}>
              {filtered.length} {filtered.length === 1 ? "article" : "articles"}
            </span>
          )}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => <Skeleton key={i} />)}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex items-start gap-3 rounded-xl px-4 py-3.5 text-[13px]" style={{ border: "1px solid rgba(248,113,113,0.15)", background: "rgba(248,113,113,0.05)", color: "rgb(248,113,113)" }}>
          <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
          </svg>
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-3 py-24 text-center">
          <svg className="h-7 w-7" style={{ color: "var(--border-default)" }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          <p className="text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            {activeCat !== "All" ? `No ${activeCat} articles found.` : "No articles match your search."}
          </p>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && filtered.length > 0 && (
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((a) => (
            <ArticleCard
              key={a._id ?? a.link}
              article={a}
              isBookmarked={bookmarkIds.has(a._id ?? a.link)}
              onBookmark={onToggleBookmark}
              onOpen={(article) => { setModal(article); onArticleOpen?.(article) }}
            />
          ))}
        </section>
      )}

      {/* Modal */}
      {modal && (
        <ArticleModal
          article={modal}
          isBookmarked={bookmarkIds.has(modal._id ?? modal.link)}
          onToggleBookmark={onToggleBookmark}
          onClose={() => setModal(null)}
        />
      )}
    </main>
  )
}
