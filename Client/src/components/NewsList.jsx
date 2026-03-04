// function NewsList({
//   articles,
//   loading,
//   error,
//   query,
//   onQueryChange,
//   onSummarize,
// }) {
//   const handleChange = (event) => {
//     onQueryChange(event.target.value)
//   }

//   return (
//     <main className="flex-1 space-y-4 px-4 py-6">
//         <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
//           <p className="text-xs text-slate-400">
//             Curated from Google News. Use AI summary to get quick bullet-point recaps.
//           </p>
//           <div className="relative w-full max-w-md">
//             <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 className="h-4 w-4"
//               >
//                 <circle cx="11" cy="11" r="6" />
//                 <line x1="16.5" y1="16.5" x2="21" y2="21" />
//               </svg>
//             </span>
//             <input
//               type="text"
//               className="w-full rounded-full border border-slate-700 bg-slate-900/80 py-2 pl-9 pr-3 text-xs text-slate-100 shadow-sm outline-none transition focus:border-sky-500/70 focus:bg-slate-900 focus:ring-2 focus:ring-sky-500/40"
//               placeholder="Search headlines or content…"
//               value={query}
//               onChange={handleChange}
//             />
//           </div>
//         </div>

//         {loading && (
//           <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
//             {Array.from({ length: 6 }).map((_, idx) => (
//               <div
//                 // eslint-disable-next-line react/no-array-index-key
//                 key={idx}
//                 className="h-40 rounded-2xl border border-slate-800 bg-slate-900/60 shadow-md shadow-slate-950/40"
//               >
//                 <div className="h-full animate-pulse rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800/70 to-slate-900" />
//               </div>
//             ))}
//           </div>
//         )}

//         {error && !loading && (
//           <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-xs text-red-100">
//             {error}
//           </div>
//         )}

//         {!loading && !error && articles.length === 0 && (
//           <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-xs text-slate-300">
//             No articles found. Try a different search.
//           </div>
//         )}

//         {!loading && !error && articles.length > 0 && (
//           <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
//             {articles.map((article) => (
//               <article
//                 key={article._id ?? article.link}
//                 className="group flex min-h-[180px] flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 px-6 py-5 shadow-md shadow-slate-950/40 transition hover:-translate-y-0.5 hover:border-sky-500/60 hover:shadow-xl hover:shadow-sky-900/60"
//               >
//                 <div>
//                   <h2 className="line-clamp-3 text-sm font-semibold leading-snug text-slate-50">
//                     {article.title}
//                   </h2>
//                   <p className="mt-1 text-[11px] text-slate-500">
//                     {article.pubDate ? new Date(article.pubDate).toLocaleString() : 'No date'}
//                   </p>
//                 </div>

//                 <div className="mt-3 flex flex-wrap items-center gap-2">
//                   {article.link && (
//                     <a
//                       href={article.link}
//                       className="inline-flex items-center gap-1 rounded-full bg-sky-500 px-3 py-1.5 text-[11px] font-semibold text-slate-950 shadow-sm shadow-sky-500/40 transition hover:bg-sky-400"
//                       target="_blank"
//                       rel="noreferrer"
//                     >
//                       Read full article
//                       <span className="text-xs">↗</span>
//                     </a>
//                   )}
//                   <button
//                     type="button"
//                     onClick={() => onSummarize(article)}
//                     className="inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-[11px] font-medium text-slate-100 transition hover:border-sky-500/70 hover:bg-slate-900"
//                   >
//                     <span className="text-xs text-sky-400">✦</span>
//                     AI summary
//                   </button>
//                 </div>
//               </article>
//             ))}
//           </section>
//         )}
//     </main>
//   )
// }

// export default NewsList

function NewsList({
  articles,
  loading,
  error,
  query,
  onQueryChange,
  onSummarize,
}) {
  const handleChange = (event) => {
    onQueryChange(event.target.value)
  }

  return (
    <main className="flex-1 px-6 py-8">

      {/* Top Section */}
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <p className="text-xs text-slate-400">
          Curated from Google News. Use AI summary to get quick bullet-point insights.
        </p>

        {/* Search */}
        <div className="relative w-full max-w-md">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-500">
            🔍
          </span>

          <input
            type="text"
            className="w-full rounded-full border border-slate-700 bg-slate-900/80 py-2.5 pl-9 pr-4 text-sm text-slate-100 shadow-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30"
            placeholder="Search headlines or content…"
            value={query}
            onChange={handleChange}
          />
        </div>
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="h-44 rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-md"
            >
              <div className="h-full animate-pulse rounded-xl bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && articles.length === 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
          No articles found. Try another search.
        </div>
      )}

      {/* News Grid */}
      {!loading && !error && articles.length > 0 && (
        <section className="grid gap-7 sm:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <article
              key={article._id ?? article.link}
              className="group flex min-h-[190px] flex-col justify-between rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-900/70 p-6 shadow-lg shadow-slate-950/40 transition duration-200 hover:-translate-y-1 hover:border-sky-500/60 hover:shadow-sky-900/40"
            >
              <div>
                <h2 className="line-clamp-3 text-base font-semibold leading-snug text-slate-100 group-hover:text-white">
                  {article.title}
                </h2>

                <p className="mt-2 text-xs text-slate-500">
                  {article.pubDate
                    ? new Date(article.pubDate).toLocaleString()
                    : "No date"}
                </p>
              </div>

              {/* Buttons */}
              <div className="mt-5 flex flex-wrap gap-3">

                {article.link && (
                  <a
                    href={article.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-500 px-4 py-1.5 text-xs font-semibold text-white shadow-md shadow-sky-500/30 transition hover:scale-105 hover:shadow-sky-500/50"
                  >
                    Read article ↗
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => onSummarize(article)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900 px-4 py-1.5 text-xs font-medium text-slate-200 transition hover:border-sky-500 hover:text-white"
                >
                  ✦ AI summary
                </button>

              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  )
}

export default NewsList

// import SearchBar from "./SearchBar"
// import TrendingNews from "./TrendingNews"
// import LatestNews from "./LatestNews"

// function NewsList({
//   articles,
//   loading,
//   error,
//   query,
//   onQueryChange,
//   onSummarize,
// }) {
//   const trending = articles.slice(0, 3)
//   const latest = articles.slice(3)

//   return (
//     <main className="flex-1 space-y-10 px-6 py-8">

//       <SearchBar query={query} onQueryChange={onQueryChange} />

//       {loading && <p className="text-sm text-slate-400">Loading news...</p>}

//       {error && (
//         <div className="text-red-400 text-sm">
//           {error}
//         </div>
//       )}

//       {!loading && !error && (
//         <>
//           <TrendingNews
//             articles={trending}
//             onSummarize={onSummarize}
//           />

//           <LatestNews
//             articles={latest}
//             onSummarize={onSummarize}
//           />
//         </>
//       )}
//     </main>
//   )
// }

// export default NewsList