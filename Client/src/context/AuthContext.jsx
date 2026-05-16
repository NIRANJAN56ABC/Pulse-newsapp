import { createContext, useContext, useState, useEffect, useCallback } from "react"
import axios from "axios"

const API = import.meta.env.VITE_API_URL || "https://pulse-newsapp.onrender.com/api"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // ── Bootstrap: check stored token ──────────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem("pulse-token")
    if (!token) { setLoading(false); return }

    axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => setUser(data))
      .catch(() => localStorage.removeItem("pulse-token"))
      .finally(() => setLoading(false))
  }, [])

  // ── Called from /auth/callback route after Google redirect ─────────────────
  const loginWithToken = useCallback((token) => {
    localStorage.setItem("pulse-token", token)
    return axios.get(`${API}/auth/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(({ data }) => { setUser(data); return data })
  }, [])

  // ── Sign out ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem("pulse-token")
    setUser(null)
  }, [])

  // ── Helpers for API calls with auth header ──────────────────────────────────
  const authHeader = useCallback(() => {
    const token = localStorage.getItem("pulse-token")
    return token ? { Authorization: `Bearer ${token}` } : {}
  }, [])

  // ── Bookmark sync ───────────────────────────────────────────────────────────
  const addBookmark = useCallback(async (article) => {
    if (!user) return
    await axios.post(`${API}/user/bookmarks`, article, { headers: authHeader() })
    setUser((u) => ({ ...u, bookmarks: [article, ...(u.bookmarks ?? [])] }))
  }, [user, authHeader])

  const removeBookmark = useCallback(async (link) => {
    if (!user) return
    await axios.delete(`${API}/user/bookmarks`, { data: { link }, headers: authHeader() })
    setUser((u) => ({ ...u, bookmarks: (u.bookmarks ?? []).filter((b) => b.link !== link) }))
  }, [user, authHeader])

  // ── Record article open ─────────────────────────────────────────────────────
  const recordRead = useCallback(async (article) => {
    if (!user) return
    await axios.post(
      `${API}/user/history`,
      { link: article.link, category: article._category, article },
      { headers: authHeader() }
    )
    setUser((u) => ({
      ...u,
      readHistory: [
        article,
        ...(u.readHistory ?? []).filter((h) => (h.link ?? h) !== article.link),
      ].slice(0, 50),
    }))
  }, [user, authHeader])

  return (
    <AuthContext.Provider value={{ user, loading, loginWithToken, logout, addBookmark, removeBookmark, recordRead, authHeader }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
