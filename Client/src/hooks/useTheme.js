import { useState, useEffect } from "react"

function getInitialTheme() {
  try {
    const stored = localStorage.getItem("newsreader-theme")
    if (stored === "light" || stored === "dark") return stored
  } catch {}
  // Respect OS preference on first visit
  if (window.matchMedia?.("(prefers-color-scheme: light)").matches) return "light"
  return "dark"
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    try { localStorage.setItem("newsreader-theme", theme) } catch {}
  }, [theme])

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"))

  return { theme, toggle }
}
