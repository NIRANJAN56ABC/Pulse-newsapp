import { useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"

// ── Scroll-reveal hook ────────────────────────────────────────────────────────
// Adds .in-view to every .reveal element inside the container when it enters
// the viewport. Runs once per element — no re-triggering on scroll back up.
function useReveal(containerRef) {
  useEffect(() => {
    const els = containerRef.current?.querySelectorAll(".reveal") ?? []
    if (!els.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view")
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.12 }
    )

    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [containerRef])
}

// ── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
      </svg>
    ),
    label: "Multiple Sources",
    desc: "Reuters, BBC, TechCrunch, The Hindu, Hacker News — all in one feed.",
    color: "#38bdf8",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3ZM6 6h.008v.008H6V6Z" />
      </svg>
    ),
    label: "Smart Categories",
    desc: "Articles auto-tagged across World, Tech, Health, Business, Sports, and more.",
    color: "#34d399",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
      </svg>
    ),
    label: "Instant Search",
    desc: "Filter hundreds of headlines by keyword in real time.",
    color: "#c084fc",
  },
  {
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
      </svg>
    ),
    label: "Bookmarks",
    desc: "Save any article with one click. Persists across sessions.",
    color: "#fbbf24",
  },
]

const SOURCES = [
  { name: "Reuters",         cat: "World"      },
  { name: "BBC News",        cat: "World"      },
  { name: "Al Jazeera",      cat: "World"      },
  { name: "NPR News",        cat: "World"      },
  { name: "TechCrunch",      cat: "Technology" },
  { name: "Hacker News",     cat: "Technology" },
  { name: "The Verge",       cat: "Technology" },
  { name: "Wired",           cat: "Technology" },
  { name: "The Hindu",       cat: "India"      },
  { name: "NDTV",            cat: "India"      },
  { name: "Times of India",  cat: "India"      },
  { name: "Financial Times", cat: "Business"   },
  { name: "NASA",            cat: "Science"    },
  { name: "ESPN",            cat: "Sports"     },
  { name: "Google News",     cat: "General"    },
]

const STATS = [
  { value: "15",   label: "Sources" },
  { value: "200+", label: "Articles / day" },
  { value: "15m",  label: "Refresh rate" },
  { value: "8",    label: "Categories" },
]

// ── Component ─────────────────────────────────────────────────────────────────

export default function LandingPage({ theme, onToggleTheme }) {
  const navigate = useNavigate()
  const isDark = theme === "dark"
  const pageRef = useRef(null)
  useReveal(pageRef)

  return (
    <div
      ref={pageRef}
      className="min-h-screen overflow-x-hidden transition-colors duration-200"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}
    >

      {/* ── Nav ── */}
      <header
        className="sticky top-0 z-50 backdrop-blur-xl"
        style={{
          background: `color-mix(in srgb, var(--bg-base) 90%, transparent)`,
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 2px 8px rgba(99,102,241,0.3)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2 12 6 12 8 5 10 19 12 9 14 15 16 12 22 12" />
              </svg>
            </span>
            <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 700, fontSize: "18px", letterSpacing: "-0.01em", color: "var(--text-primary)" }}>
              Pulse
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTheme}
              title={isDark ? "Light mode" : "Dark mode"}
              className="flex h-8 w-8 items-center justify-center rounded-lg transition-all"
              style={{ background: "var(--accent-bg)", color: "var(--text-tertiary)" }}
            >
              {isDark ? (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="4" />
                  <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <button
              onClick={() => navigate("/news")}
              className="rounded-lg px-4 py-2 text-[12px] font-medium transition-all"
              style={{ border: "1px solid var(--border-default)", background: "var(--accent-bg)", color: "var(--text-secondary)" }}
            >
              Open App →
            </button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center px-4 pb-16 pt-16 text-center sm:px-6 sm:pb-24 sm:pt-24">

        {/* Badge — animates in first */}
        <div
          className="hero-badge relative mb-8 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-medium"
          style={{ border: "1px solid var(--border-default)", background: "var(--accent-bg)", color: "var(--text-tertiary)" }}
        >
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Live news · 6 trusted sources
        </div>

        {/* Headline */}
        <h1
          className="hero-title relative max-w-2xl leading-[1.08] tracking-tight"
          style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(40px, 6vw, 64px)", fontWeight: 700, color: "var(--text-primary)" }}
        >
          The world's news,
          <br />
          <span style={{ color: "var(--text-tertiary)" }}>without the noise</span>
        </h1>

        {/* Subtext */}
        <p
          className="hero-sub relative mt-6 max-w-md leading-relaxed"
          style={{ fontSize: "15px", color: "var(--text-tertiary)", fontFamily: "var(--font-sans)" }}
        >
          Clean, fast, distraction-free. Real headlines from sources you trust — filtered, categorized, always fresh.
        </p>

        {/* CTA */}
        <button
          onClick={() => navigate("/news")}
          className="hero-cta group relative mt-10 inline-flex items-center gap-2.5 rounded-2xl px-7 py-3.5 text-[13px] font-semibold transition active:scale-[0.98]"
          style={{ background: "var(--text-primary)", color: "var(--bg-base)", fontFamily: "var(--font-sans)" }}
        >
          Open Pulse
          <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </button>

        {/* Stats */}
        <div
          className="hero-stats relative mt-12 grid w-full max-w-xl grid-cols-2 overflow-hidden rounded-2xl sm:mt-16 sm:grid-cols-4"
          style={{ border: "1px solid var(--border-subtle)", background: "var(--border-subtle)" }}
        >
          {STATS.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1 px-5 py-5" style={{ background: "var(--bg-base)" }}>
              <span className="font-bold" style={{ fontSize: "22px", color: "var(--text-primary)", fontFamily: "var(--font-serif)" }}>
                {value}
              </span>
              <span className="text-[11px]" style={{ color: "var(--text-quaternary)", fontFamily: "var(--font-mono)" }}>
                {label}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 sm:pb-24">
        {/* Section heading */}
        <div className="reveal mb-10 text-center">
          <h2 className="font-bold" style={{ fontFamily: "var(--font-serif)", fontSize: "24px", color: "var(--text-primary)" }}>
            Built for readers, not algorithms
          </h2>
          <p className="mt-2 text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            No tracking. No recommendations. Just the news.
          </p>
        </div>

        {/* Cards — each staggered */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon, label, desc, color }, i) => (
            <div
              key={label}
              className={`reveal reveal-delay-${i + 1} flex flex-col gap-4 rounded-2xl p-5 transition-all`}
              style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}
            >
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
                style={{ background: `${color}15`, color, outline: `1px solid ${color}25` }}
              >
                {icon}
              </span>
              <div>
                <p className="text-[13px] font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>
                  {label}
                </p>
                <p className="mt-1.5 text-[12px] leading-relaxed" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-sans)" }}>
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Sources ── */}
      <section className="px-4 py-16 sm:px-6 sm:py-24" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div className="mx-auto max-w-4xl">
          <div className="reveal mb-8 text-center">
            <h2 className="font-bold" style={{ fontFamily: "var(--font-serif)", fontSize: "24px", color: "var(--text-primary)" }}>
              Sources
            </h2>
            <p className="mt-2 text-[13px]" style={{ color: "var(--text-tertiary)" }}>
              Established outlets with reliable RSS feeds
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SOURCES.map(({ name, cat }, i) => (
              <div
                key={name}
                className={`reveal reveal-delay-${i + 1} flex items-center justify-between rounded-xl px-4 py-3`}
                style={{ border: "1px solid var(--border-subtle)", background: "var(--bg-surface)" }}
              >
                <span className="text-[13px] font-medium" style={{ color: "var(--text-secondary)", fontFamily: "var(--font-sans)" }}>
                  {name}
                </span>
                <span
                  className="rounded-md px-2 py-0.5 text-[10px]"
                  style={{ border: "1px solid var(--border-subtle)", background: "var(--accent-bg)", color: "var(--text-quaternary)", fontFamily: "var(--font-mono)" }}
                >
                  {cat}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-4 py-16 sm:px-6 sm:py-24">
        <div
          className="reveal relative mx-auto max-w-xl overflow-hidden rounded-3xl p-14 text-center"
          style={{ border: "1px solid var(--border-default)", background: "var(--bg-surface)" }}
        >
          <h2 className="relative font-bold" style={{ fontFamily: "var(--font-serif)", fontSize: "28px", color: "var(--text-primary)" }}>
            Stay informed, simply
          </h2>
          <p className="relative mt-3 text-[13px]" style={{ color: "var(--text-tertiary)" }}>
            No account. No paywall. Open the app and start reading.
          </p>
          <button
            onClick={() => navigate("/news")}
            className="relative mt-8 inline-flex items-center gap-2 rounded-2xl px-7 py-3.5 text-[13px] font-semibold transition active:scale-[0.98]"
            style={{ background: "var(--text-primary)", color: "var(--bg-base)", fontFamily: "var(--font-sans)" }}
          >
            Open Pulse
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-7" style={{ borderTop: "1px solid var(--border-subtle)" }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between text-[11px]" style={{ color: "var(--text-quaternary)", fontFamily: "var(--font-mono)" }}>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2 12 6 12 8 5 10 19 12 9 14 15 16 12 22 12" />
              </svg>
            </span>
            <span style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 700, fontSize: "14px", color: "var(--text-tertiary)" }}>Pulse</span>
          </div>
          <span>Built with React &amp; Node.js</span>
        </div>
      </footer>

    </div>
  )
}
