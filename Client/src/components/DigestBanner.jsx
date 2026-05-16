import { useState, useEffect, useRef } from "react"
import axios from "axios"

const API = "http://localhost:5000/api"
const RETRY_INTERVAL = 8000   // retry every 8s if digest not ready yet
const MAX_RETRIES    = 15     // give up after ~2 minutes

function timeAgo(iso) {
  if (!iso) return null
  const ms = Date.now() - new Date(iso)
  const m = Math.floor(ms / 60000)
  if (m < 1) return "just now"
  if (m < 60) return `${m}m ago`
  return `${Math.floor(m / 60)}h ago`
}

export default function DigestBanner() {
  const [digest,   setDigest]   = useState(null)   // { text, generatedAt }
  const [loading,  setLoading]  = useState(true)
  const [failed,   setFailed]   = useState(false)
  const [expanded, setExpanded] = useState(true)
  const retries = useRef(0)

  useEffect(() => {
    let timer

    async function fetchDigest() {
      try {
        const { data } = await axios.get(`${API}/digest`)
        setDigest(data)
        setLoading(false)
      } catch (err) {
        // 503 = not ready yet, keep retrying
        if (err?.response?.status === 503 && retries.current < MAX_RETRIES) {
          retries.current += 1
          timer = setTimeout(fetchDigest, RETRY_INTERVAL)
        } else {
          // real error or gave up — hide the banner
          setFailed(true)
          setLoading(false)
        }
      }
    }

    fetchDigest()
    return () => clearTimeout(timer)
  }, [])

  // Don't render if permanently failed
  if (failed) return null

  return (
    <div
      className="mb-8 overflow-hidden rounded-2xl transition-all duration-300"
      style={{
        border: "1px solid rgba(99,102,241,0.2)",
        background: "linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.04) 100%)",
      }}
    >
      {/* Header row */}
      <div
        className="flex items-center justify-between gap-3 px-5 py-3.5"
        style={{ borderBottom: expanded ? "1px solid rgba(99,102,241,0.12)" : "none" }}
      >
        <div className="flex items-center gap-2.5">
          {/* AI spark icon */}
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 2px 8px rgba(99,102,241,0.35)" }}
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
            </svg>
          </span>

          <div>
            <p
              className="text-[12px] font-semibold"
              style={{ color: "#a78bfa", fontFamily: "var(--font-sans)", letterSpacing: "0.01em" }}
            >
              AI Briefing
            </p>
            {digest?.generatedAt && (
              <p className="text-[10px]" style={{ color: "var(--text-quaternary)", fontFamily: "var(--font-mono)" }}>
                Updated {timeAgo(digest.generatedAt)}
              </p>
            )}
            {loading && (
              <p className="text-[10px]" style={{ color: "var(--text-quaternary)", fontFamily: "var(--font-mono)" }}>
                Generating…
              </p>
            )}
          </div>
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex h-7 w-7 items-center justify-center rounded-lg transition-all"
          style={{ background: "rgba(99,102,241,0.1)", color: "#a78bfa" }}
          title={expanded ? "Collapse" : "Expand"}
        >
          <svg
            className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? "" : "rotate-180"}`}
            fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>

      {/* Body */}
      {expanded && (
        <div className="px-5 py-4">
          {loading ? (
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="h-1.5 w-1.5 animate-pulse rounded-full"
                    style={{
                      background: "#6366f1",
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
              <span className="text-[12px]" style={{ color: "var(--text-quaternary)", fontFamily: "var(--font-sans)" }}>
                Generating today's briefing…
              </span>
            </div>
          ) : (
            <p
              className="text-[13px] leading-[1.8]"
              style={{
                color: "var(--text-secondary)",
                fontFamily: "var(--font-sans)",
                fontStyle: "italic",
              }}
            >
              {digest?.text}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
