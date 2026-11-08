import React from 'react'
import { useGame } from '../game/state.jsx'
import { formatMoney } from '../game/balance.js'

export default function StatisticsView() {
  const { state } = useGame()

  const discography = state.discography || []
  const totalAlbumsSold = discography.reduce((sum, d) => sum + (d.unitsSold || 0), 0)
  const totalDiscographyRevenue = discography.reduce((sum, d) => sum + (d.totalRevenue || 0), 0)

  // Best selling album
  const bestSeller = discography.length > 0
    ? [...discography].sort((a, b) => (b.unitsSold || 0) - (a.unitsSold || 0))[0]
    : null

  // Idols breakdown
  const totalIdols = state.idols?.length || 0
  const totalGroups = state.groups?.length || 0
  const totalSolos = state.idols?.filter(i => i.isSolo).length || 0

  // Tier counts
  const tierCounts = { P: 0, S: 0, A: 0, B: 0, C: 0, D: 0, F: 0 }
  state.idols?.forEach(i => {
    if (tierCounts[i.tier] !== undefined) tierCounts[i.tier]++
  })

  // Total fanbase
  const totalFanbase = (state.groups?.reduce((sum, g) => sum + (g.fanbase || 0), 0) || 0) +
    (state.idols?.reduce((sum, i) => sum + (i.soloFanbase || 0), 0) || 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1e1338] border-2 border-[#543b8a] p-4 rounded-xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-300 font-pixel">
            AGENCY PERFORMANCE & ANALYTICS
          </h2>
          <p className="text-xs text-purple-200 mt-1 font-pixel leading-relaxed">
            Comprehensive historical metrics across financial health, discography record sales, concert attendance, and idol roster tiers.
          </p>
        </div>

        <div className="text-right font-pixel text-xs bg-[#120b24] p-3 rounded-xl border border-[#3b2462]">
          <span className="text-purple-400">Total Operational Weeks:</span>
          <div className="text-yellow-300 font-bold text-sm mt-0.5">{state.totalWeeksPassed || 1} Weeks</div>
        </div>
      </div>

      {/* Financial Health Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-4 shadow-xl">
          <span className="text-[10px] font-pixel text-purple-400">CURRENT CAPITAL</span>
          <div className="text-base font-bold text-emerald-400 font-pixel mt-1">
            {formatMoney(state.money || 0)}
          </div>
          <p className="text-[9px] text-purple-300 font-pixel mt-1">Liquid Won Reserves</p>
        </div>

        <div className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-4 shadow-xl">
          <span className="text-[10px] font-pixel text-purple-400">PREMIUM RUBIES</span>
          <div className="text-base font-bold text-pink-400 font-pixel mt-1 flex items-center gap-1.5">
            <span>💎</span> {(state.rubies || 0).toLocaleString()}
          </div>
          <p className="text-[9px] text-purple-300 font-pixel mt-1">Special Talent & Wardrobe</p>
        </div>

        <div className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-4 shadow-xl">
          <span className="text-[10px] font-pixel text-purple-400">TOTAL ALBUM SALES</span>
          <div className="text-base font-bold text-yellow-300 font-pixel mt-1">
            {totalAlbumsSold.toLocaleString()} Units
          </div>
          <p className="text-[9px] text-purple-300 font-pixel mt-1">{discography.length} Releases Catalog</p>
        </div>

        <div className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-4 shadow-xl">
          <span className="text-[10px] font-pixel text-purple-400">AGGREGATE FANBASE</span>
          <div className="text-base font-bold text-cyan-300 font-pixel mt-1">
            {totalFanbase.toLocaleString()} Fans
          </div>
          <p className="text-[9px] text-purple-300 font-pixel mt-1">Worldwide Following</p>
        </div>
      </div>

      {/* Deep Dive Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Discography Highlights */}
        <div className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-xs font-bold text-yellow-300 font-pixel flex items-center gap-2">
            <span>💿</span> DISCOGRAPHY PERFORMANCE
          </h3>

          <div className="space-y-2.5 text-xs font-pixel bg-[#120b24] p-4 rounded-xl border border-[#3b2462]">
            <div className="flex justify-between text-purple-300">
              <span>Total Recorded Titles:</span>
              <span className="text-white font-bold">{discography.length}</span>
            </div>
            <div className="flex justify-between text-purple-300">
              <span>Lifetime Record Revenue:</span>
              <span className="text-emerald-400 font-bold">{formatMoney(totalDiscographyRevenue)}</span>
            </div>
            <div className="flex justify-between text-purple-300">
              <span>Average Units Per Release:</span>
              <span className="text-yellow-300 font-bold">
                {discography.length > 0 ? Math.round(totalAlbumsSold / discography.length).toLocaleString() : 0}
              </span>
            </div>
          </div>

          {bestSeller && (
            <div className="p-3 bg-[#241744] border border-[#543b8a] rounded-xl font-pixel text-xs">
              <span className="text-[10px] text-yellow-300 block mb-1">👑 ALL-TIME BEST SELLER</span>
              <div className="text-sm font-bold text-white truncate">{bestSeller.title}</div>
              <div className="text-[10px] text-purple-300 mt-1 flex justify-between">
                <span>By {bestSeller.targetName}</span>
                <span className="text-emerald-400">{(bestSeller.unitsSold || 0).toLocaleString()} copies sold</span>
              </div>
            </div>
          )}
        </div>

        {/* Talent Tier Distribution */}
        <div className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-5 shadow-xl space-y-4">
          <h3 className="text-xs font-bold text-yellow-300 font-pixel flex items-center gap-2">
            <span>🌟</span> ROSTER & TALENT TIERS
          </h3>

          <div className="space-y-2 bg-[#120b24] p-4 rounded-xl border border-[#3b2462] font-pixel text-xs">
            {Object.entries(tierCounts).map(([tier, count]) => {
              const pct = totalIdols > 0 ? Math.round((count / totalIdols) * 100) : 0
              return (
                <div key={tier} className="space-y-1">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-purple-300 font-bold">Tier {tier}:</span>
                    <span className="text-yellow-300">{count} Idols ({pct}%)</span>
                  </div>
                  <div className="w-full bg-[#1e1338] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-yellow-400 h-full rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="grid grid-cols-3 gap-2 text-center font-pixel text-xs bg-[#241744] p-3 rounded-xl border border-[#442f70]">
            <div>
              <span className="text-[9px] text-purple-400">Total Idols</span>
              <p className="text-white font-bold mt-0.5">{totalIdols}</p>
            </div>
            <div>
              <span className="text-[9px] text-purple-400">Active Groups</span>
              <p className="text-pink-300 font-bold mt-0.5">{totalGroups}</p>
            </div>
            <div>
              <span className="text-[9px] text-purple-400">Solo Artists</span>
              <p className="text-cyan-300 font-bold mt-0.5">{totalSolos}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
