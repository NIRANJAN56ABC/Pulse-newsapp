function DetailView({
  article,
  summary,
  error,
  loading,
  onBack,
}) {
  if (!article) return null

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto max-w-6xl space-y-4 px-4 py-6">
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-slate-500 hover:bg-slate-800 transition-colors"
          onClick={onBack}
        >
          <span className="text-sm">←</span>
          Back to headlines
        </button>

        <section className="grid gap-6 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.2fr)] items-start">
          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-4 shadow-xl shadow-slate-950/40">
            <h2 className="mb-2 text-lg font-semibold leading-snug text-slate-50 md:text-xl">
              {article.title}
            </h2>
            <p className="mb-4 text-xs text-slate-400">
              {article.pubDate ? new Date(article.pubDate).toLocaleString() : 'No date'}
            </p>
            {article.link && (
              <a
                href={article.link}
                className="inline-flex items-center gap-1 rounded-full bg-sky-500 px-3 py-1.5 text-xs font-semibold text-slate-950 shadow-sm shadow-sky-500/40 hover:bg-sky-400 transition-colors"
                target="_blank"
                rel="noreferrer"
              >
                Read full article
                <span className="text-sm">↗</span>
              </a>
            )}
            {article.content && (
              <p className="mt-4 text-sm leading-relaxed text-slate-200">
                {article.content}
              </p>
            )}
          </article>

          <section className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-950 px-5 py-4 shadow-2xl shadow-slate-950/70">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-sky-400">
                  AI summary
                </p>
                <h3 className="text-sm font-semibold text-slate-50 md:text-base">
                  Key takeaways
                </h3>
              </div>
            </div>

            {loading && (
              <p className="mt-2 text-xs text-slate-300">Summarizing…</p>
            )}
            {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
            {summary && !loading && (
              <pre className="mt-3 max-h-[320px] overflow-auto whitespace-pre-wrap rounded-xl bg-slate-900/90 px-3 py-3 text-xs leading-relaxed text-slate-100">
                {summary}
              </pre>
            )}
          </section>
        </section>
      </main>
    </div>
  )
}

export default DetailView

