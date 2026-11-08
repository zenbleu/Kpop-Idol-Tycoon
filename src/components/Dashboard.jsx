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
      <div className="dashboard-grid">
        {/* Active Album Productions */}
        <div className="panel">
          <div className="panel-title flex items-center justify-between">
            <span>💿 RECORDING STUDIO</span>
            <button className="btn-primary small" onClick={() => setScreen('production')}>+ PRODUCE</button>
          </div>
          {activeProds.length === 0 ? (
            <div className="empty-slot-msg">
              <p>No albums currently in production.</p>
              <button className="btn-primary mt-1" onClick={() => setScreen('production')}>
                START ALBUM PRODUCTION
              </button>
            </div>
          ) : (
            <div className="prod-list">
              {activeProds.map(p => {
                const pct = Math.min(100, Math.round((p.weeksCompleted / p.totalWeeksRequired) * 100))
                return (
                  <div key={p.id} className="prod-card">
                    <div className="prod-header">
                      <strong>"{p.title}"</strong>
                      <span className="tag-chip">{p.releaseType}</span>
                    </div>
                    <div className="small text-lav">Artist: {p.targetName} · {p.genre} · {p.concept}</div>
                    <div className="prod-progress-wrap mt-1">
                      <div className="stat-bar-wrap">
                        <span className="bar-label">PROG</span>
                        <div className="bar-track">
                          <div className="bar-fill" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="bar-val">{p.weeksCompleted}/{p.totalWeeksRequired}W</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Market Trends */}
        <div className="panel">
          <div className="panel-title flex items-center justify-between">
            <span>📈 MUSIC MARKET TRENDS</span>
            <span className="small text-lav">UPDATED WEEKLY</span>
          </div>
          <div className="trend-banner">
            <div className="trend-headline">"{state.trends?.headline}"</div>
            <div className="trend-tags mt-1">
              <span className="small text-lav">Trending Genres:</span>
              {(state.trends?.genres || []).map(g => (
                <span key={g} className="tag-chip text-gold">🔥 {g}</span>
              ))}
            </div>
            <div className="trend-tags mt-1">
              <span className="small text-lav">Trending Concept:</span>
              {(state.trends?.concepts || []).map(c => (
                <span key={c} className="tag-chip text-pink">✨ {c}</span>
              ))}
            </div>
            <p className="tiny text-lav mt-2">
              Albums aligning with trending genres and concepts earn substantial quality and sales bonuses!
            </p>
          </div>
        </div>

        {/* Weekly Schedule Preview */}
        <div className="panel">
          <div className="panel-title flex items-center justify-between">
            <span>📅 WEEKLY ACTIVITY PLAN</span>
            <button className="btn-primary small" onClick={() => setScreen('schedules')}>PLANNER</button>
          </div>
          <div className="schedule-preview-days">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => {
              const acts = state.weeklyPlan?.[day] || []
              return (
                <div key={day} className="preview-day-row">
                  <span className="day-name">{day.slice(0, 3)}:</span>
                  <span className="day-acts">
                    {acts.length === 0 ? (
                      <em className="text-gray">Rest Day</em>
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
        <div className="panel">
          <div className="panel-title">⚡ QUICK AGENCY ACTIONS</div>
          <div className="quick-actions-grid">
            <button className="btn-gold" onClick={() => setScreen('auditions')}>
              ✨ AUDITION TALENT
            </button>
            <button className="btn-primary" onClick={() => setScreen('groups')}>
              👥 MANAGE GROUPS
            </button>
            <button className="btn-primary" onClick={() => setScreen('training')}>
              🏋️ TRAIN IDOLS
            </button>
            <button className="btn-primary" onClick={() => setScreen('concerts')}>
              🏟️ PLAN CONCERT
            </button>
            <button className="btn-primary" onClick={() => setScreen('company')}>
              🏢 HQ UPGRADES
            </button>
            <button className="btn-primary" onClick={() => setScreen('wardrobe')}>
              👗 WARDROBE SHOP
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
