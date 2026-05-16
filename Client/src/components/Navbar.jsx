import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import UserMenu from "./UserMenu"

export default function Navbar({ bookmarkCount = 0, theme, onToggleTheme }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { user } = useAuth()
  const isDark = theme === "dark"

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-xl"
      style={{
        background: `color-mix(in srgb, var(--bg-base) 90%, transparent)`,
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5">

        {/* Logo */}
        <button onClick={() => navigate("/")} className="group flex items-center gap-2">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-xl transition-transform group-hover:scale-105 sm:h-8 sm:w-8"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", boxShadow: "0 2px 8px rgba(99,102,241,0.35)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="2 12 6 12 8 5 10 19 12 9 14 15 16 12 22 12" />
            </svg>
          </span>
          <span
            style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontWeight: 700, fontSize: "17px", letterSpacing: "-0.01em", color: "var(--text-primary)" }}
          >
            Pulse
          </span>
        </button>

        {/* Right */}
        <div className="flex items-center gap-1">

          {/* Bookmarks — icon only on mobile, icon+label on sm+ */}
          {user && (
            <button
              onClick={() => navigate("/bookmarks")}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[12px] font-medium transition-all sm:px-3"
              style={{
                background: pathname === "/bookmarks" ? "rgba(251,191,36,0.1)" : "transparent",
                color: pathname === "/bookmarks" ? "rgb(252,211,77)" : "var(--text-tertiary)",
              }}
              title="Saved articles"
            >
              <svg className="h-4 w-4 shrink-0" fill={pathname === "/bookmarks" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
              </svg>
              <span className="hidden sm:inline">Saved</span>
              {bookmarkCount > 0 && (
                <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] font-bold" style={{ background: "rgba(251,191,36,0.2)", color: "rgb(252,211,77)" }}>
                  {bookmarkCount}
                </span>
              )}
            </button>
          )}

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
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

          {/* Live pill — hidden on very small screens */}
          <div className="hidden items-center gap-1.5 px-2 sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-[11px] font-medium" style={{ color: "var(--text-quaternary)" }}>Live</span>
          </div>

          {/* User menu / Sign in */}
          <UserMenu />

        </div>
      </div>
    </header>
  )
}
