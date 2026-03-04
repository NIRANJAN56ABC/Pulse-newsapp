import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'
import Navbar from './components/Navbar'
import NewsList from './components/NewsList'
import DetailView from './components/DetailView'

function App() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [view, setView] = useState('list')
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [detailSummary, setDetailSummary] = useState('')
  const [detailError, setDetailError] = useState('')
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true)
        setError('')
        const response = await axios.get('http://localhost:5000/api/news')
        setArticles(response.data || [])
      } catch (err) {
        setError('Unable to load news. Please ensure the server is running on port 5000.')
      } finally {
        setLoading(false)
      }
    }

    fetchNews()
  }, [])

  const handleSummarize = async (article) => {
    const text = article.content ?? article.title
    if (!text) return

    setSelectedArticle(article)
    setView('detail')
    setDetailLoading(true)
    setDetailError('')
    setDetailSummary('')

    try {
      const response = await axios.post('http://localhost:5000/api/news/summarize', { text })

      setDetailSummary(response.data?.summary ?? 'No summary returned.')
    } catch (e) {
      setDetailError(
        'Unable to get AI summary. Check that the backend is running with GEMINI_API_KEY configured.',
      )
    } finally {
      setDetailLoading(false)
    }
  }

  const filteredArticles = articles.filter((article) => {
    const text = `${article.title ?? ''} ${article.content ?? ''}`.toLowerCase()

    const matchesQuery = text.includes(query.toLowerCase())

    return matchesQuery
  })

  if (view === 'detail' && selectedArticle) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50">
        <Navbar />
        <DetailView
          article={selectedArticle}
          summary={detailSummary}
          error={detailError}
          loading={detailLoading}
          onBack={() => {
            setView('list')
            setDetailError('')
            setDetailSummary('')
            setDetailLoading(false)
          }}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <Navbar />
      <div className="mx-auto flex max-w-6xl gap-4 px-4">
        <NewsList
          articles={filteredArticles}
          loading={loading}
          error={error}
          query={query}
          onQueryChange={setQuery}
          onSummarize={handleSummarize}
        />
      </div>
    </div>
  )
}

export default App
