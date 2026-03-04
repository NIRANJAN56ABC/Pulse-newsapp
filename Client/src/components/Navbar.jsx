// function Navbar() {
//   return (
//     <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
//       <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
//         <div className="flex items-center gap-2">
//           <span className="rounded-full bg-sky-500 px-2 py-1 text-xs font-bold text-slate-950">
//             AI
//           </span>
//           <div className="flex flex-col">
//             <span className="text-sm font-semibold text-slate-50">
//               News Summarizer
//             </span>
//             <span className="text-[11px] text-slate-400">
//               Google News + Gemini summaries
//             </span>
//           </div>
//         </div>
//       </div>
//     </header>
//   )
// }

// export default Navbar

function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

        {/* Logo Section */}
        <div className="flex items-center gap-3 group">
          <span className="flex items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-blue-500 px-3 py-1 text-xs font-bold text-white shadow-lg shadow-sky-500/30 group-hover:scale-105 transition">
            AI
          </span>

          <div className="flex flex-col leading-tight">
            <span className="text-lg font-semibold text-white tracking-tight">
              News Summarizer
            </span>
            {/* <span className="text-xs text-slate-400">
              Google News + Gemini summaries
            </span> */}
          </div>
        </div>

        {/* Right Side */}
        <div className="hidden items-center gap-6 md:flex">
          <button className="text-sm text-slate-300 hover:text-white transition">
            Home
          </button>

          <button className="text-sm text-slate-300 hover:text-white transition">
            Trending
          </button>

          <button className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white hover:bg-sky-400 transition shadow-md shadow-sky-500/30">
            Refresh News
          </button>
        </div>

      </div>
    </header>
  )
}

export default Navbar

