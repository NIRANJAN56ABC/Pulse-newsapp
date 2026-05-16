import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "./Navbar"
import ArticleModal from "./ArticleModal"

const CAT_STYLE = {
  Science:    { pill: "bg-emerald-400/10 text-emerald-500 ring-emerald-400/20", bar: "#34d399" },
  Technology: { pill: "bg-sky-400/10 text-sky-500 ring-sky-400/20",            bar: "#38bdf8" },
  World:      { pill: "bg-orange-400/10 text-orange-500 ring-orange-400/20",   bar: "#fb923c" },
  Health:     { pill: "bg-purple-400/10 text-purple-500 ring-purple-400/20",   bar: "#c084fc" },
  Business:   { pill: "bg-amber-400/10 text-amber-500 ring-amber-400/20",      bar: "#fbbf24" },
  Sports:     { pill: "bg-rose-400/10 text-rose-500 ring-rose-400/20",         bar: "#fb7185" },
  India:      { pill: "bg-orange-400/10 text-orange-500 ring-orange-400/20",   bar: "#fb923c" },
  General:    { pill: "bg-slate-400/10 text-slate-500 ring-slate-400/20",      bar: "#94a3b8" },
}

function formatTime(pubDate) {
  if (!pubDate) return null
  const d = new Date(pubDate)
  const ms = Date.now() - d
  const h = Math.floor(ms / 3600000)
  const dy = Math.floor(ms / 86400000)
  if (h < 24) return `${h}h ago`
  if (dy < 7) return `${dy}d ago`
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function extractSource(a) {
  if (a.source) return a.source
  try { return new URL(a.link).hostname.replace("www.", "") } catch { return null }
}

export default function BookmarksPage({ bookmarks, onToggleBookmark, theme, onToggleTheme }) {
  const [modal, setModal] = useState(null)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen transition-colors duration-200" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <Navbar bookmarkCount={bookmarks.length} theme={theme} onToggleTheme={onToggleTheme} />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-10">

        {/* Back + Header */}
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
          <div className="flex items-end justify-between">
          <div>
            <h1
              className="tracking-tight"
              style={{ fontFamily: "var(--font-serif)", fontSize: "28px", fontWeight: 700, color: "var(--text-primary)" }}
            >
              Saved Articles
            </h1>
            <p className="mt-1 text-[13px]" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-sans)" }}>
              {bookmarks.length === 0
                ? "Nothing saved yet"
                : `${bookmarks.length} ${bookmarks.length === 1 ? "article" : "articles"}`}
            </p>
          </div>
          {bookmarks.length > 0 && (
            <button
              className="rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all"
              style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-sans)" }}
              onClick={() => bookmarks.forEach((a) => onToggleBookmark(a))}
            >
              Clear all
            </button>
          )}
        </div>
        </div>

        {/* Empty */}
        {bookmarks.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-32 text-center">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}
            >
              <svg className="h-5 w-5" style={{ color: "var(--text-quaternary)" }} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-medium" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>
                Nothing saved yet
              </p>
              <p className="mt-1 text-[12px]" style={{ color: "var(--text-quaternary)", fontFamily: "var(--font-sans)" }}>
                Click the bookmark icon on any article to save it here.
              </p>
            </div>
          </div>
        )}

        {/* Grid */}
        {bookmarks.length > 0 && (
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {bookmarks.map((article) => {
              const source = extractSource(article)
              const timeStr = formatTime(article.pubDate)
              const cat = article._category
              const s = CAT_STYLE[cat] ?? CAT_STYLE.General

              return (
                <article
                  key={article._id ?? article.link}
                  onClick={() => setModal(article)}
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
                      <button
                        onClick={(e) => { e.stopPropagation(); onToggleBookmark(article) }}
                        title="Remove"
                        className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all"
                        style={{ background: "rgba(251,191,36,0.15)", color: "rgb(252,211,77)" }}
                      >
                        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </section>
        )}
      </div>

      {modal && (
        <ArticleModal
          article={modal}
          isBookmarked={bookmarks.some((b) => (b._id ?? b.link) === (modal._id ?? modal.link))}
          onToggleBookmark={onToggleBookmark}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  )
}
