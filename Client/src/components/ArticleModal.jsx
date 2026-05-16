import { useEffect, useState } from "react"

const CAT_COLORS = {
  Science:    { bg: "rgba(52,211,153,0.1)",  text: "#34d399", ring: "rgba(52,211,153,0.2)" },
  Technology: { bg: "rgba(56,189,248,0.1)",  text: "#38bdf8", ring: "rgba(56,189,248,0.2)" },
  World:      { bg: "rgba(251,146,60,0.1)",  text: "#fb923c", ring: "rgba(251,146,60,0.2)" },
  Health:     { bg: "rgba(192,132,252,0.1)", text: "#c084fc", ring: "rgba(192,132,252,0.2)" },
  Business:   { bg: "rgba(251,191,36,0.1)",  text: "#fbbf24", ring: "rgba(251,191,36,0.2)" },
  Sports:     { bg: "rgba(251,113,133,0.1)", text: "#fb7185", ring: "rgba(251,113,133,0.2)" },
  India:      { bg: "rgba(251,146,60,0.1)",  text: "#fb923c", ring: "rgba(251,146,60,0.2)" },
  General:    { bg: "rgba(148,163,184,0.1)", text: "#94a3b8", ring: "rgba(148,163,184,0.2)" },
}

function formatFull(pubDate) {
  if (!pubDate) return null
  return new Date(pubDate).toLocaleDateString(undefined, {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  })
}

function extractSource(article) {
  if (article.source) return article.source
  try { return new URL(article.link).hostname.replace("www.", "") } catch { return null }
}

export default function ArticleModal({ article, isBookmarked, onToggleBookmark, onClose }) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
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
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose() }
    window.addEventListener("keydown", fn)
    return () => window.removeEventListener("keydown", fn)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = "" }
  }, [])

  if (!article) return null

  const source = extractSource(article)
  const dateStr = formatFull(article.pubDate)
  const category = article._category
  const cat = CAT_COLORS[category] ?? CAT_COLORS.General

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4 md:p-8"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-in relative flex w-full flex-col overflow-hidden rounded-t-2xl shadow-2xl sm:max-w-lg sm:rounded-2xl"
        style={{
          border: "1px solid var(--border-default)",
          background: "var(--bg-elevated)",
          maxHeight: "92dvh",
        }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-center justify-between gap-3 px-5 py-3.5"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <div className="flex min-w-0 items-center gap-2.5">
            {category && (
              <span
                className="shrink-0 inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
                style={{ background: cat.bg, color: cat.text, outline: `1px solid ${cat.ring}` }}
              >
                {category}
              </span>
            )}
            {source && (
              <span
                className="truncate text-[12px] font-medium"
                style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}
              >
                {source}
              </span>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {/* Share */}
            <button
              onClick={handleShare}
              title={copied ? "Copied!" : "Share"}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-all"
              style={{
                background: copied ? "rgba(52,211,153,0.15)" : "var(--accent-bg)",
                color: copied ? "#34d399" : "var(--text-tertiary)",
              }}
            >
              {copied ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                </svg>
              )}
            </button>

            {/* Bookmark */}
            <button
              onClick={() => onToggleBookmark(article)}
              title={isBookmarked ? "Remove bookmark" : "Save"}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-all"
              style={{
                background: isBookmarked ? "rgba(251,191,36,0.15)" : "var(--accent-bg)",
                color: isBookmarked ? "rgb(252,211,77)" : "var(--text-tertiary)",
              }}
            >
              <svg className="h-4 w-4" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-all"
              style={{ background: "var(--accent-bg)", color: "var(--text-tertiary)" }}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          {/* Title — Playfair Display */}
          <h2
            className="leading-[1.45] tracking-tight"
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "20px",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            {article.title}
          </h2>

          {/* Date */}
          {dateStr && (
            <p
              className="mt-3 text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: "var(--text-quaternary)", fontFamily: "var(--font-mono)" }}
            >
              {dateStr}
            </p>
          )}

          <div className="my-5" style={{ borderTop: "1px solid var(--border-subtle)" }} />

          {/* Content */}
          {article.content ? (
            <p
              className="text-[14px] leading-[1.8]"
              style={{ color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}
            >
              {article.content}
            </p>
          ) : (
            <p
              className="text-[13px] italic"
              style={{ color: "var(--text-quaternary)", fontFamily: "var(--font-sans)" }}
            >
              No preview available — open the full article to read more.
            </p>
          )}
          <div className="h-4" />
        </div>

        {/* ── Footer ── */}
        <div
          className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <p className="text-[12px]" style={{ color: "var(--text-quaternary)", fontFamily: "var(--font-sans)" }}>
            Continue on <span style={{ color: "var(--text-tertiary)" }}>{source ?? "source"}</span>
          </p>
          {article.link && (
            <a
              href={article.link}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl px-5 py-2.5 text-[12px] font-semibold transition active:scale-[0.97]"
              style={{
                background: "var(--text-primary)",
                color: "var(--bg-base)",
                fontFamily: "var(--font-sans)",
              }}
            >
              Read full article
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
