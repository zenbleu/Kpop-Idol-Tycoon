/**
 * Dashboard.jsx — Central agency command dashboard.
 * Live album sales ticker, active productions, schedule preview,
 * market trends, alerts, and quick actions.
 */

import React from 'react'
import { useGame } from '../game/state.jsx'
import { playSfx } from '../game/audio.js'

export default function Dashboard({ setScreen }) {
  const { state } = useGame()

  const formatMoney = (val) => '₩' + Math.max(0, val || 0).toLocaleString()

  // Derive total fanbase
  const groupFans = (state.groups || []).reduce((s, g) => s + (g.fanbase || 0), 0)
  const idolFans = (state.idols || []).reduce((s, i) => s + (i.fanbase || 0), 0)
  const totalFans = groupFans + idolFans

  // Alerts
  const lowLoyaltyIdols = (state.idols || []).filter(i => (i.loyalty || 80) < 30 && !i.hasLeft)
  const highFatigueIdols = (state.idols || []).filter(i => (i.fatigue || 0) >= 75 && !i.hasLeft)
  const expiringContracts = (state.idols || []).filter(i => (i.contract?.remainingWeeks || 52) <= 4 && !i.hasLeft)

  const activeSales = state.activeSales || []
  const activeProds = state.productions || []

  return (
    <div className="dashboard-container">
      {/* ── 1. Agency Quick Status Strip ───────────────────────────────── */}
      <div className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-sm md:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-300 font-pixel">
            AGENCY HEADQUARTERS COMMAND
          </h1>
          <p className="text-[10px] text-purple-300 font-pixel mt-0.5">
            Active Roster: <strong className="text-white">{state.idols?.length || 0} Idols</strong> · Groups: <strong className="text-pink-300">{state.groups?.length || 0}/{state.maxGroupSlots || 3}</strong> · Global Fandom: <strong className="text-emerald-400">{totalFans.toLocaleString()}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          <button
            onClick={() => setScreen('production')}
            className="px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-xl text-xs font-pixel bg-pink-600 hover:bg-pink-500 text-white border-2 border-pink-400 shadow-md transition-all flex items-center gap-2 active:scale-95 hover:scale-105"
          >
            <span className="text-sm">💿</span> + New Album
          </button>
          <button
            onClick={() => setScreen('auditions')}
            className="px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-xl text-xs font-pixel bg-yellow-500 hover:bg-yellow-400 text-black font-bold border-2 border-yellow-300 shadow-md transition-all flex items-center gap-2 active:scale-95 hover:scale-105"
          >
            <span className="text-sm">✨</span> Scout Talent
          </button>
          <button
            onClick={() => setScreen('schedules')}
            className="px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-xl text-xs font-pixel bg-[#2d1b54] hover:bg-[#3d266e] text-purple-200 border-2 border-[#5d3b9e] shadow-md transition-all flex items-center gap-2 active:scale-95 hover:scale-105"
          >
            <span className="text-sm">📅</span> Planner
          </button>
        </div>
      </div>

      {/* ── 2. Warnings / High Priority Alerts ────────────────────────── */}
      {(lowLoyaltyIdols.length > 0 || highFatigueIdols.length > 0 || expiringContracts.length > 0) && (
        <div className="panel alert-panel">
          <div className="panel-title text-red">⚠️ AGENCY STATUS WARNINGS</div>
          <div className="alerts-list">
            {lowLoyaltyIdols.map(i => (
              <div key={i.id} className="alert-item red">
                <span>💔 Low Loyalty: <strong>{i.name}</strong> ({i.loyalty}%) is dissatisfied and considering departure!</span>
                <button className="btn-gold small" onClick={() => setScreen('idols')}>OFFER RETENTION</button>
              </div>
            ))}
            {highFatigueIdols.map(i => (
              <div key={i.id} className="alert-item yellow">
                <span>😴 Severe Exhaustion: <strong>{i.name}</strong> has {i.fatigue}% fatigue. Assign vacation to avoid collapse!</span>
                <button className="btn-primary small" onClick={() => setScreen('schedules')}>PLAN REST</button>
              </div>
            ))}
            {expiringContracts.map(i => (
              <div key={i.id} className="alert-item yellow">
                <span>📄 Contract Alert: <strong>{i.name}</strong>'s contract expires in {i.contract?.remainingWeeks} weeks!</span>
                <button className="btn-primary small" onClick={() => setScreen('idols')}>VIEW CONTRACT</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. Real-Time Active Album Sales Monitor ───────────────────── */}
      {activeSales.length > 0 && (
        <div className="panel live-sales-panel">
          <div className="panel-title text-gold flex items-center justify-between">
            <span>🔥 LIVE ALBUM SALES IN PROGRESS (10-MINUTE WINDOW)</span>
            <span className="small text-pink">REAL-TIME TICKER</span>
          </div>
          <div className="sales-session-grid">
            {activeSales.map(sale => {
              const secondsLeft = Math.max(0, sale.durationSeconds - sale.secondsElapsed)
              const mins = Math.floor(secondsLeft / 60)
              const secs = secondsLeft % 60
              const progressPct = Math.min(100, Math.round((sale.secondsElapsed / sale.durationSeconds) * 100))

              return (
                <div key={sale.id} className="active-sale-card">
                  <div className="sale-card-header">
                    <strong>"{sale.albumTitle}"</strong>
                    <span className="tag-chip">{sale.releaseType}</span>
                    <span className="sale-artist">{sale.targetName}</span>
                  </div>

                  <div className="sale-metric-strip">
                    <div>Copies Sold: <strong className="text-gold">{sale.copiesSold.toLocaleString()}</strong> / {sale.expectedTotalCopies.toLocaleString()}</div>
                    <div>Total Revenue: <strong className="text-green">{formatMoney(sale.totalRevenueGenerated)}</strong></div>
                    <div>Company Payout ({sale.incomeDistribution?.companyPercent}%): <strong className="text-pink">{formatMoney(sale.companyRevenueCredited)}</strong></div>
                  </div>

                  {/* Progress Bar */}
                  <div className="sale-progress-wrap mt-1">
                    <div className="sale-progress-track">
                      <div className="sale-progress-fill" style={{ width: `${progressPct}%` }} />
                    </div>
                    <div className="sale-timer-text">
                      <span>{sale.completed ? 'COMPLETED' : `Time Remaining: ${mins}m ${secs < 10 ? '0' : ''}${secs}s`}</span>
                      <span>{progressPct}%</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── 4. Main Dashboard Grid (Productions, Trends, Schedules) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Active Album Productions */}
        <div className="panel rounded-2xl border-2 border-[#543b8a] bg-[#1e1338] p-4 shadow-xl">
          <div className="panel-title flex items-center justify-between pb-2 mb-3 border-b border-[#3b2762] text-xs font-bold text-yellow-300">
            <span>💿 RECORDING STUDIO</span>
            <button className="px-2.5 py-1 rounded-lg text-[9px] bg-pink-600 hover:bg-pink-500 text-white font-bold border border-pink-400" onClick={() => setScreen('production')}>+ PRODUCE</button>
          </div>
          {activeProds.length === 0 ? (
            <div className="empty-slot-msg text-center py-6 text-purple-300 text-xs">
              <p>No albums currently in production.</p>
              <button className="mt-3 px-3 py-1.5 rounded-lg text-xs bg-pink-600 hover:bg-pink-500 text-white font-bold border border-pink-400" onClick={() => setScreen('production')}>
                START ALBUM PRODUCTION
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {activeProds.map(p => {
                const pct = Math.min(100, Math.round((p.weeksCompleted / p.totalWeeksRequired) * 100))
                return (
                  <div key={p.id} className="p-3 rounded-xl bg-[#120826] border border-[#3b2762]">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <strong className="text-white truncate">"{p.title}"</strong>
                      <span className="px-1.5 py-0.2 rounded text-[8px] bg-pink-950/80 text-pink-300 border border-pink-500/40">{p.releaseType}</span>
                    </div>
                    <div className="text-[9px] text-purple-300">Artist: {p.targetName} · {p.genre} · {p.concept}</div>
                    <div className="mt-2">
                      <div className="flex justify-between text-[8px] text-purple-300 mb-0.5">
                        <span>PROGRESS</span>
                        <span>{p.weeksCompleted}/{p.totalWeeksRequired} WEEKS</span>
                      </div>
                      <div className="w-full bg-[#241744] h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-pink-500 to-yellow-400 h-full rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Market Trends */}
        <div className="panel rounded-2xl border-2 border-[#543b8a] bg-[#1e1338] p-4 shadow-xl">
          <div className="panel-title flex items-center justify-between pb-2 mb-3 border-b border-[#3b2762] text-xs font-bold text-yellow-300">
            <span>📈 MUSIC MARKET TRENDS</span>
            <span className="text-[9px] text-purple-300 font-normal">UPDATED WEEKLY</span>
          </div>
          <div className="space-y-2.5 text-xs">
            <div className="text-white font-bold p-2.5 rounded-xl bg-[#120826] border border-[#3b2762]">
              "{state.trends?.headline}"
            </div>
            <div className="flex items-center gap-2 flex-wrap text-[10px]">
              <span className="text-purple-400">Trending Genres:</span>
              {(state.trends?.genres || []).map(g => (
                <span key={g} className="px-2 py-0.5 rounded-lg bg-yellow-950/80 text-yellow-300 border border-yellow-500/40 font-bold">🔥 {g}</span>
              ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap text-[10px]">
              <span className="text-purple-400">Trending Concept:</span>
              {(state.trends?.concepts || []).map(c => (
                <span key={c} className="px-2 py-0.5 rounded-lg bg-pink-950/80 text-pink-300 border border-pink-500/40 font-bold">✨ {c}</span>
              ))}
            </div>
            <p className="text-[9px] text-purple-300 leading-relaxed pt-1">
              Albums aligning with trending genres and concepts earn substantial quality and sales bonuses!
            </p>
          </div>
        </div>

        {/* Weekly Schedule Preview */}
        <div className="panel rounded-2xl border-2 border-[#543b8a] bg-[#1e1338] p-4 shadow-xl">
          <div className="panel-title flex items-center justify-between pb-2 mb-3 border-b border-[#3b2762] text-xs font-bold text-yellow-300">
            <span>📅 WEEKLY ACTIVITY PLAN</span>
            <button className="px-2.5 py-1 rounded-lg text-[9px] bg-[#2d1b54] hover:bg-pink-600 text-purple-200 hover:text-white font-bold border border-purple-500/40" onClick={() => setScreen('schedules')}>PLANNER →</button>
          </div>
          <div className="space-y-1.5 text-xs">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
              const acts = state.weeklyPlan?.[day] || []
              return (
                <div key={day} className="flex items-center justify-between p-1.5 rounded-lg bg-[#120826] border border-[#3b2762] text-[9px]">
                  <strong className="text-yellow-300 w-12">{day.slice(0, 3)}:</strong>
                  <span className="text-purple-200 truncate flex-1 text-right">
                    {acts.length === 0 ? (
                      <em className="text-purple-400/60">Rest Day</em>
                    ) : (
                      acts.map(a => a.targetName ? `${a.targetName} (${a.name})` : a.name).join(', ')
                    )}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Quick Agency Actions */}
        <div className="panel rounded-2xl border-2 border-[#543b8a] bg-[#1e1338] p-4 shadow-xl">
          <div className="panel-title pb-2 mb-3 border-b border-[#3b2762] text-xs font-bold text-yellow-300">
            ⚡ QUICK AGENCY ACTIONS
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[10px]">
            <button className="p-3 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-black font-bold border border-yellow-300 shadow cursor-pointer text-center" onClick={() => setScreen('auditions')}>
              ✨ AUDITION TALENT
            </button>
            <button className="p-3 rounded-xl bg-[#241744] hover:bg-[#342260] text-purple-200 hover:text-white font-bold border border-purple-500/40 shadow cursor-pointer text-center" onClick={() => setScreen('groups')}>
              👥 GROUPS
            </button>
            <button className="p-3 rounded-xl bg-[#241744] hover:bg-[#342260] text-purple-200 hover:text-white font-bold border border-purple-500/40 shadow cursor-pointer text-center" onClick={() => setScreen('training')}>
              🏋️ TRAIN IDOLS
            </button>
            <button className="p-3 rounded-xl bg-[#241744] hover:bg-[#342260] text-purple-200 hover:text-white font-bold border border-purple-500/40 shadow cursor-pointer text-center" onClick={() => setScreen('concerts')}>
              🏟️ PLAN CONCERT
            </button>
            <button className="p-3 rounded-xl bg-[#241744] hover:bg-[#342260] text-purple-200 hover:text-white font-bold border border-purple-500/40 shadow cursor-pointer text-center" onClick={() => setScreen('company')}>
              🏢 HQ UPGRADES
            </button>
            <button className="p-3 rounded-xl bg-[#241744] hover:bg-[#342260] text-purple-200 hover:text-white font-bold border border-purple-500/40 shadow cursor-pointer text-center" onClick={() => setScreen('wardrobe')}>
              👗 WARDROBE SHOP
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
