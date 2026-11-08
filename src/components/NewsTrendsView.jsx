import React, { useState } from 'react'
import { useGame } from '../game/state.jsx'
import { GENRES, CONCEPTS } from '../game/balance.js'

export default function NewsTrendsView() {
  const { state } = useGame()
  const [filterSentiment, setFilterSentiment] = useState('ALL') // 'ALL', 'positive', 'negative', 'gold'

  const newsFeed = state.newsFeed || []
  const currentTrend = state.currentTrend || { genre: 'Pop', concept: 'Teen Crush' }

  const filteredNews = newsFeed.filter(item => {
    if (filterSentiment === 'ALL') return true
    return item.sentiment === filterSentiment
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1e1338] border-2 border-[#543b8a] p-4 rounded-xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-300 font-pixel">
            ENTERTAINMENT NEWS WIRE & MARKET TRENDS
          </h2>
          <p className="text-xs text-purple-200 mt-1 font-pixel leading-relaxed">
            Stay ahead of fast-shifting music market trends, track breaking tabloid headlines, and review company milestones.
          </p>
        </div>
      </div>

      {/* Market Trends Card */}
      <div className="bg-[#1e1338] border-2 border-yellow-500/80 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-3 border-b border-[#3b2762] mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">📊</span>
            <h3 className="text-sm font-bold text-yellow-300 font-pixel">
              CURRENT GLOBAL MUSIC MARKET TRENDS
            </h3>
          </div>
          <span className="text-[10px] font-pixel text-purple-300 bg-[#120b24] px-2 py-0.5 rounded border border-[#442f70]">
            Syncs Weekly
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#120b24] p-4 rounded-xl border border-[#3b2462] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-pixel text-purple-400">#1 TRENDING GENRE</span>
              <div className="text-lg font-bold text-white font-pixel mt-1 flex items-center gap-2">
                <span className="text-yellow-400">🔥</span> {currentTrend.genre || 'Pop'}
              </div>
            </div>
            <div className="text-right text-[10px] font-pixel text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2.5 py-1 rounded">
              +15% Album Score
            </div>
          </div>

          <div className="bg-[#120b24] p-4 rounded-xl border border-[#3b2462] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-pixel text-purple-400">#1 TRENDING CONCEPT</span>
              <div className="text-lg font-bold text-white font-pixel mt-1 flex items-center gap-2">
                <span className="text-pink-400">✨</span> {currentTrend.concept || 'Teen Crush'}
              </div>
            </div>
            <div className="text-right text-[10px] font-pixel text-pink-400 bg-pink-950/70 border border-pink-500/40 px-2.5 py-1 rounded">
              +15% Album Score
            </div>
          </div>
        </div>

        <p className="text-[10px] text-purple-300 font-pixel mt-3 bg-[#241744] p-2.5 rounded-lg border border-[#442f70]">
          💡 Producer Tip: Match both the trending Genre and Concept in your album production to trigger the maximum +30% Market Synergy Acclaim Bonus!
        </p>
      </div>

      {/* News Feed Terminal */}
      <div className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#3b2762] mb-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">📰</span>
            <h3 className="text-sm font-bold text-white font-pixel">
              AGENCY & INDUSTRY NEWS FEED ({filteredNews.length})
            </h3>
          </div>

          {/* Filter sentiments */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['ALL', 'gold', 'positive', 'negative'].map(f => (
              <button
                key={f}
                onClick={() => setFilterSentiment(f)}
                className={`px-2.5 py-1 rounded text-[10px] font-pixel border transition-all ${
                  filterSentiment === f
                    ? 'bg-purple-700 border-purple-400 text-white font-bold'
                    : 'bg-[#120b24] border-[#3b2462] text-purple-300 hover:border-purple-400'
                }`}
              >
                {f === 'ALL' ? 'All News' : f === 'gold' ? 'Milestones' : f === 'positive' ? 'Positive' : 'Alerts'}
              </button>
            ))}
          </div>
        </div>

        {filteredNews.length === 0 ? (
          <div className="text-center py-12 text-purple-400 font-pixel text-xs">
            No news articles matching current filter. Advance the weeks to generate real-time headlines!
          </div>
        ) : (
          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
            {filteredNews.map(item => {
              const isGold = item.sentiment === 'gold'
              const isNegative = item.sentiment === 'negative'

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isGold
                      ? 'bg-yellow-950/40 border-yellow-500/60 shadow-sm'
                      : isNegative
                      ? 'bg-red-950/40 border-red-700/60'
                      : 'bg-[#241744] border-[#442f70] hover:border-purple-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-pixel px-2 py-0.5 rounded border ${
                      isGold
                        ? 'bg-yellow-900/60 text-yellow-300 border-yellow-500/40'
                        : isNegative
                        ? 'bg-red-900/60 text-red-300 border-red-500/40'
                        : 'bg-[#120b24] text-purple-300 border-[#3b2462]'
                    }`}>
                      {item.type.toUpperCase().replace('_', ' ')}
                    </span>

                    <span className="text-[9px] font-pixel text-purple-400">
                      Wk {item.week}, {item.year || 2026}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-white font-pixel leading-snug">
                    {item.headline}
                  </h4>

                  {item.detail && (
                    <p className="text-[10px] text-purple-200 font-pixel mt-1.5 leading-relaxed">
                      {item.detail}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
