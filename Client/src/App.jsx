import { useEffect, useState, useCallback } from "react"
import { Routes, Route } from "react-router-dom"
import axios from "axios"
import "./App.css"
import Navbar from "./components/Navbar"
import NewsList from "./components/NewsList"
import LandingPage from "./components/LandingPage"
import BookmarksPage from "./components/BookmarksPage"
import AuthCallback from "./pages/AuthCallback"
import HistoryPage from "./pages/HistoryPage"
import { useLocalStorage } from "./hooks/useLocalStorage"
import { useTheme } from "./hooks/useTheme"
import { AuthProvider, useAuth } from "./context/AuthContext"



function NewsApp({ theme, onToggleTheme }) {
  const { user, addBookmark, removeBookmark, recordRead } = useAuth()
  const [localBookmarks, setLocalBookmarks] = useLocalStorage("newsreader-bookmarks", [])

  const [articles, setArticles] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState("")
  const [query, setQuery]       = useState("")
//useeffect
  useEffect(() => {
  const fetchNews = async () => {
    try {
      setLoading(true)
      setError("")

      const API = "https://pulse-newsapp.onrender.com/api"

      const { data } = await axios.get(`${API}/news`)

      setArticles(data || [])
    } catch (err) {
      console.error(err)
      setError("Unable to load news. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  fetchNews()
}, [])

  
  const bookmarks = user ? (user.bookmarks ?? []) : localBookmarks

  const handleToggleBookmark = useCallback((article) => {
    if (user) {
      const exists = (user.bookmarks ?? []).some((b) => b.link === article.link)
      exists ? removeBookmark(article.link) : addBookmark(article)
    } else {
      setLocalBookmarks((prev) => {
        const id = article._id ?? article.link
        const exists = prev.some((b) => (b._id ?? b.link) === id)
        return exists ? prev.filter((b) => (b._id ?? b.link) !== id) : [article, ...prev]
      })
    }
  }, [user, addBookmark, removeBookmark, setLocalBookmarks])

  const handleArticleOpen = useCallback((article) => {
    recordRead(article)
  }, [recordRead])

  const filtered = articles.filter((a) => {
    const text = `${a.title ?? ""} ${a.content ?? ""}`.toLowerCase()
    return text.includes(query.toLowerCase())
  })

  return (
    <div className="min-h-screen transition-colors duration-200" style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}>
      <Navbar bookmarkCount={bookmarks.length} theme={theme} onToggleTheme={onToggleTheme} />
      <div className="mx-auto max-w-7xl">
        <NewsList
          articles={filtered}
          loading={loading}
          error={error}
          query={query}
          onQueryChange={setQuery}
          bookmarks={bookmarks}
          onToggleBookmark={handleToggleBookmark}
          onArticleOpen={handleArticleOpen}
        />
      </div>
    </div>
  )
}

// ── Bookmarks wrapper ─────────────────────────────────────────────────────────

function BookmarksWrapper({ theme, onToggleTheme }) {
  const { user, removeBookmark } = useAuth()
  const [localBookmarks, setLocalBookmarks] = useLocalStorage("newsreader-bookmarks", [])

  const bookmarks = user ? (user.bookmarks ?? []) : localBookmarks

  const handleToggle = useCallback((article) => {
    if (user) {
      removeBookmark(article.link)
    } else {
      setLocalBookmarks((prev) => prev.filter((b) => (b._id ?? b.link) !== (article._id ?? article.link)))
    }
  }, [user, removeBookmark, setLocalBookmarks])

  return (
    <BookmarksPage
      bookmarks={bookmarks}
      onToggleBookmark={handleToggle}
      theme={theme}
      onToggleTheme={onToggleTheme}
    />
  )
}

// ── Root ─────────────────────────────────────────────────────────────────────

function AppRoutes() {
  const { theme, toggle } = useTheme()

  return (
    <Routes>
      <Route path="/"               element={<LandingPage theme={theme} onToggleTheme={toggle} />} />
      <Route path="/news"           element={<NewsApp theme={theme} onToggleTheme={toggle} />} />
      <Route path="/bookmarks"      element={<BookmarksWrapper theme={theme} onToggleTheme={toggle} />} />
      <Route path="/history"        element={<HistoryPage theme={theme} onToggleTheme={toggle} />} />
      <Route path="/auth/callback"  element={<AuthCallback />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
