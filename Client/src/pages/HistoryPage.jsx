import { useState, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip,
} from "recharts"
import Navbar from "../components/Navbar"
import ArticleModal from "../components/ArticleModal"
import { useAuth } from "../context/AuthContext"

// ── Constants ────────────────────────────────────────────────────────────────

const CAT_COLOR = {
  Science:    "#34d399",
  Technology: "#38bdf8",
  World:      "#fb923c",
  Health:     "#c084fc",
  Business:   "#fbbf24",
  Sports:     "#fb7185",
  India:      "#f97316",
  General:    "#94a3b8",
}

const CAT_STYLE = {
  Science:    { pill: "bg-emerald-400/10 text-emerald-500 ring-emerald-400/20", bar: "#34d399" },
  Technology: { pill: "bg-sky-400/10 text-sky-500 ring-sky-400/20",            bar: "#38bdf8" },
  World:      { pill: "bg-orange-400/10 text-orange-500 ring-orange-400/20",   bar: "#fb923c" },
  Health:     { pill: "bg-purple-400/10 text-purple-500 ring-purple-400/20",   bar: "#c084fc" },
  Business:   { pill: "bg-amber-400/10 text-amber-500 ring-amber-400/20",      bar: "#fbbf24" },
  Sports:     { pill: "bg-rose-400/10 text-rose-500 ring-rose-400/20",         bar: "#fb7185" },
  India:      { pill: "bg-orange-400/10 text-orange-500 ring-orange-400/20",   bar: "#f97316" },
  General:    { pill: "bg-slate-400/10 text-slate-500 ring-slate-400/20",      bar: "#94a3b8" },
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

// ── Custom Radar Tooltip ──────────────────────────────────────────────────────

function RadarTooltip({ active, payload }) {
  if (!active || !payload?.length) return null
  const { subject, value } = payload[0].payload
  return (
    <div
      className="rounded-xl px-3 py-2 text-[12px] shadow-xl"
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)", color: "var(--text-primary)" }}
    >
      <span style={{ color: CAT_COLOR[subject] ?? "var(--text-tertiary)", fontWeight: 700 }}>{subject}</span>
      <span style={{ color: "var(--text-tertiary)" }}> · {value} reads</span>
    </div>
  )
}

// ── Stats Panel ───────────────────────────────────────────────────────────────

function StatsPanel({ articles, categoryWeights }) {
  const now = Date.now()
  const ONE_WEEK = 7 * 24 * 3600 * 1000

  const thisWeek = useMemo(
    () => articles.filter((a) => a.pubDate && now - new Date(a.pubDate) < ONE_WEEK),
    [articles]
  )

  // Build category counts from categoryWeights (all-time) for the radar
  const radarData = useMemo(() => {
    const weights = categoryWeights instanceof Map
      ? Object.fromEntries(categoryWeights)
      : (categoryWeights ?? {})
    return Object.entries(weights)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .map(([cat, value]) => ({ subject: cat, value }))
  }, [categoryWeights])

  // Top 2 categories for the summary sentence
  const topCats = radarData.slice(0, 2).map((d) => d.subject)

  // Bar chart data — top 5 categories
  const barData = radarData.slice(0, 5)
  const maxVal = barData[0]?.value ?? 1

  if (articles.length === 0) return null

  return (
    <div
      className="mb-10 overflow-hidden rounded-2xl"
      style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}
    >
      {/* Summary sentence */}
      <div className="px-6 pt-6 pb-4" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
        <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-sans)" }}>
          You've read{" "}
          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            {articles.length} {articles.length === 1 ? "article" : "articles"}
          </span>{" "}
          in total
          {thisWeek.length > 0 && (
            <>, <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{thisWeek.length}</span> this week</>
          )}
          {topCats.length > 0 && (
            <> — mostly{" "}
              {topCats.map((cat, i) => (
                <span key={cat}>
                  <span style={{ color: CAT_COLOR[cat] ?? "var(--text-primary)", fontWeight: 600 }}>{cat}</span>
                  {i < topCats.length - 1 ? " and " : ""}
                </span>
              ))}
            </>
          )}.
        </p>
      </div>

      {/* Two-column layout: bar chart + radar */}
      <div className="grid gap-0 md:grid-cols-2" style={{ borderBottom: "1px solid var(--border-subtle)" }}>

        {/* ── Bar chart ── */}
        <div className="px-6 py-5" style={{ borderRight: "1px solid var(--border-subtle)" }}>
          <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-quaternary)", fontFamily: "var(--font-mono)" }}>
            Top categories
          </p>
          {barData.length === 0 ? (
            <p className="text-[12px]" style={{ color: "var(--text-quaternary)" }}>No data yet</p>
          ) : (
            <div className="flex flex-col gap-3">
              {barData.map(({ subject, value }) => {
                const pct = Math.round((value / maxVal) * 100)
                const color = CAT_COLOR[subject] ?? "#94a3b8"
                return (
                  <div key={subject} className="flex items-center gap-3">
                    <span
                      className="w-20 shrink-0 text-right text-[11px] font-medium"
                      style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-sans)" }}
                    >
                      {subject}
                    </span>
                    <div className="relative flex-1 overflow-hidden rounded-full" style={{ height: "6px", background: "var(--border-subtle)" }}>
                      <div
                        className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}60` }}
                      />
                    </div>
                    <span
                      className="w-6 shrink-0 text-right text-[11px] tabular-nums"
                      style={{ color: "var(--text-quaternary)", fontFamily: "var(--font-mono)" }}
                    >
                      {value}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Radar chart ── */}
        <div className="flex flex-col px-6 py-5">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-quaternary)", fontFamily: "var(--font-mono)" }}>
            Reading profile
          </p>
          {radarData.length < 3 ? (
            <div className="flex flex-1 items-center justify-center py-8">
              <p className="text-[12px] text-center" style={{ color: "var(--text-quaternary)" }}>
                Read articles from 3+ categories<br />to see your profile
              </p>
            </div>
          ) : (
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
                  <PolarGrid stroke="var(--border-subtle)" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fill: "var(--text-quaternary)", fontSize: 10, fontFamily: "var(--font-mono)" }}
                  />
                  <Radar
                    dataKey="value"
                    stroke="#6366f1"
                    fill="#6366f1"
                    fillOpacity={0.15}
                    strokeWidth={1.5}
                  />
                  <Tooltip content={<RadarTooltip />} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Stat pills row */}
      <div className="grid grid-cols-3 divide-x" style={{ "--tw-divide-opacity": 1, borderColor: "var(--border-subtle)" }}>
        {[
          { label: "Total read", value: articles.length },
          { label: "This week",  value: thisWeek.length },
          { label: "Categories", value: radarData.length },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col items-center gap-0.5 px-4 py-4" style={{ borderRight: "1px solid var(--border-subtle)" }}>
            <span
              className="text-[22px] font-bold tabular-nums"
              style={{ fontFamily: "var(--font-serif)", color: "var(--text-primary)" }}
            >
              {value}
            </span>
            <span className="text-[10px] uppercase tracking-widest" style={{ color: "var(--text-quaternary)", fontFamily: "var(--font-mono)" }}>
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── History Card ──────────────────────────────────────────────────────────────

function HistoryCard({ article, onOpen }) {
  const source = extractSource(article)
  const timeStr = formatTime(article.pubDate)
  const cat = article._category
  const s = CAT_STYLE[cat] ?? CAT_STYLE.General

  return (
    <article
      onClick={() => onOpen(article)}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl transition-all duration-200"
      style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--border-hover)"; e.currentTarget.style.background = "var(--bg-surface-hover)" }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.background = "var(--bg-surface)" }}
    >
      <div className="absolute left-0 top-0 h-full w-0.5 opacity-0 transition-opacity duration-200 group-hover:opacity-70" style={{ background: s.bar }} />

      <div className="flex flex-1 flex-col p-5">
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

        <h2
          className="flex-1 line-clamp-3 leading-[1.45]"
          style={{ fontFamily: "var(--font-serif)", fontSize: "15px", fontWeight: 600, color: "var(--text-secondary)" }}
        >
          {article.title}
        </h2>

        {article.content && (
          <p className="mt-2.5 line-clamp-2 text-[12px] leading-relaxed" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-sans)" }}>
            {article.content}
          </p>
        )}

        <div className="mt-4 flex items-center gap-2 pt-3.5" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          {source && (
            <span className="truncate text-[11px]" style={{ color: "var(--text-quaternary)", fontFamily: "var(--font-mono)" }}>
              {source}
            </span>
          )}
          {article.link && (
            <a
              href={article.link}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="ml-auto inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all"
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
    </article>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HistoryPage({ theme, onToggleTheme }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [modal, setModal] = useState(null)

  const rawHistory = user?.readHistory ?? []

  const articles = useMemo(() => rawHistory
    .map((entry) => {
      if (typeof entry === "string") return { title: entry, link: entry, _category: null }
      return { ...entry, _category: detectCategory(entry.title, entry.source ?? "") }
    })
    .filter((a) => a.title && a.title !== a.link),
  [rawHistory])

  return (
    <div className="min-h-screen transition-colors duration-200" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <Navbar bookmarkCount={user?.bookmarks?.length ?? 0} theme={theme} onToggleTheme={onToggleTheme} />

      <div className="mx-auto max-w-7xl px-6 py-10">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-5 inline-flex items-center gap-1.5 text-[12px] font-medium transition-colors"
            style={{ color: "var(--text-tertiary)" }}
            onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
            onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-tertiary)"}
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Back
          </button>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", fontWeight: 700, color: "var(--text-primary)" }}>
            Reading History
          </h1>
          <p className="mt-1 text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            {articles.length === 0
              ? "No articles read yet"
              : `${articles.length} ${articles.length === 1 ? "article" : "articles"} opened`}
          </p>
        </div>

        {/* Stats panel — only when there's data */}
        <StatsPanel articles={articles} categoryWeights={user?.categoryWeights} />

        {/* Empty state */}
        {articles.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-32 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}>
              <svg className="h-5 w-5" style={{ color: "var(--text-quaternary)" }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>Nothing here yet</p>
              <p className="mt-1 text-[12px]" style={{ color: "var(--text-quaternary)" }}>Articles you open will appear here.</p>
            </div>
            <button
              onClick={() => navigate("/news")}
              className="mt-2 rounded-xl px-5 py-2.5 text-[12px] font-semibold transition"
              style={{ background: "var(--text-primary)", color: "var(--bg-base)" }}
            >
              Browse headlines
            </button>
          </div>
        )}

        {/* Article cards */}
        {articles.length > 0 && (
          <>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-widest" style={{ color: "var(--text-quaternary)", fontFamily: "var(--font-mono)" }}>
              Recently opened
            </p>
            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {articles.map((a) => (
                <HistoryCard key={a._id ?? a.link} article={a} onOpen={setModal} />
              ))}
            </section>
          </>
        )}
      </div>

      {modal && (
        <ArticleModal
          article={modal}
          isBookmarked={false}
          onToggleBookmark={() => {}}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
