import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

export default function AuthCallback() {
  const [params] = useSearchParams()
  const { loginWithToken } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const token = params.get("token")
    if (!token) { navigate("/"); return }

    loginWithToken(token)
      .then(() => navigate("/news"))
      .catch(() => navigate("/"))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ background: "var(--bg-base)" }}
    >
      <div className="flex flex-col items-center gap-4">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-transparent"
          style={{ borderTopColor: "#6366f1", borderRightColor: "#8b5cf6" }}
        />
        <p className="text-[13px]" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-sans)" }}>
          Signing you in…
        </p>
      </div>
    </div>
  )
}
