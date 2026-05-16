import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener("mousedown", fn)
    return () => document.removeEventListener("mousedown", fn)
  }, [])

  if (!user) {
    return (
      <a
        href="https://pulse-newsapp.onrender.com/api/auth/google"
        className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all"
        style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "#fff" }}
      >
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#fff"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#fff"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#fff"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#fff"/>
        </svg>
        Sign in
      </a>
    )
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-all"
        style={{ background: open ? "var(--accent-bg-hover)" : "transparent" }}
      >
        {user.avatar ? (
          <img src={user.avatar} alt={user.name} className="h-7 w-7 rounded-full object-cover" />
        ) : (
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-bold text-white"
            style={{ background: "linear-gradient(135deg,#6366f1,#8b5cf6)" }}
          >
            {user.name?.[0]?.toUpperCase()}
          </span>
        )}
        <span className="hidden text-[12px] font-medium sm:block" style={{ color: "var(--text-secondary)" }}>
          {user.name?.split(" ")[0]}
        </span>
        <svg className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} style={{ color: "var(--text-tertiary)" }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-2 w-52 rounded-xl p-1.5 shadow-2xl"
          style={{ border: "1px solid var(--border-default)", background: "var(--bg-elevated)" }}
        >
          {/* User info */}
          <div className="px-3 py-2.5 mb-1" style={{ borderBottom: "1px solid var(--border-subtle)" }}>
            <p className="text-[13px] font-semibold" style={{ color: "var(--text-primary)", fontFamily: "var(--font-sans)" }}>
              {user.name}
            </p>
            <p className="text-[11px] mt-0.5" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
              {user.email}
            </p>
          </div>

          <button
            onClick={() => { navigate("/bookmarks"); setOpen(false) }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] transition-all"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--accent-bg)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
            </svg>
            Saved articles
            {user.bookmarks?.length > 0 && (
              <span className="ml-auto text-[10px] font-bold" style={{ color: "var(--text-quaternary)" }}>
                {user.bookmarks.length}
              </span>
            )}
          </button>

          <button
            onClick={() => { navigate("/history"); setOpen(false) }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] transition-all"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--accent-bg)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
            Reading history
          </button>

          <div className="my-1" style={{ borderTop: "1px solid var(--border-subtle)" }} />

          <button
            onClick={() => { logout(); setOpen(false) }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[12px] transition-all"
            style={{ color: "rgb(248,113,113)" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(248,113,113,0.08)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
