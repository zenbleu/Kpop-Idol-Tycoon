import React from 'react'
import { useGame, ACTION } from '../game/state.jsx'
import { formatMoney } from '../game/balance.js'
import { playSfx } from '../game/audio.js'

export default function WeeklySummaryModal() {
  const { state, dispatch } = useGame()
  const summary = state.weekSummary

  if (!summary) return null

  const handleClose = () => {
    playSfx('click')
    dispatch({ type: ACTION.DISMISS_WEEK_SUMMARY })
  }

  const isProfitable = (summary.netProfit || 0) >= 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-[#1c1236] border-2 border-yellow-500 rounded-3xl p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-yellow-500/10">
        {/* Header */}
        <div className="text-center pb-4 border-b border-[#3d276b]">
          <span className="text-[10px] font-pixel text-yellow-300 bg-yellow-950/80 border border-yellow-500/40 px-3 py-1 rounded-full uppercase">
            End of Week Report
          </span>
          <h2 className="text-base font-bold text-white font-pixel mt-2">
            WEEK {summary.week} • MONTH {summary.month}, {summary.year}
          </h2>
          <p className="text-xs text-purple-200 font-pixel mt-0.5">
            {state.companyName} Operations Summary
          </p>
        </div>

        {/* Financial Recap Cards */}
        <div className="mt-4 grid grid-cols-3 gap-2.5">
          <div className="bg-[#120b24] p-3 rounded-xl border border-[#3b2462] text-center font-pixel">
            <span className="text-[9px] text-purple-400">Gross Revenue</span>
            <div className="text-xs font-bold text-emerald-400 mt-1">
              +{formatMoney(summary.income || 0)}
            </div>
          </div>

          <div className="bg-[#120b24] p-3 rounded-xl border border-[#3b2462] text-center font-pixel">
            <span className="text-[9px] text-purple-400">Total Expenses</span>
            <div className="text-xs font-bold text-red-400 mt-1">
              -{formatMoney(summary.expenses || 0)}
            </div>
          </div>

          <div className={`bg-[#120b24] p-3 rounded-xl border text-center font-pixel ${
            isProfitable ? 'border-emerald-500/40' : 'border-red-500/40'
          }`}>
            <span className="text-[9px] text-purple-400">Net Balance</span>
            <div className={`text-xs font-bold mt-1 ${isProfitable ? 'text-emerald-400' : 'text-red-400'}`}>
              {isProfitable ? '+' : ''}{formatMoney(summary.netProfit || 0)}
            </div>
          </div>
        </div>

        {/* Salaries Note */}
        {summary.salariesPaid > 0 && (
          <div className="mt-3 text-[10px] text-purple-300 font-pixel bg-[#241744] p-2.5 rounded-lg border border-[#3b2762] flex justify-between">
            <span>Weekly Roster Salaries Paid:</span>
            <span className="text-yellow-300 font-bold">{formatMoney(summary.salariesPaid)}</span>
          </div>
        )}

        {/* Important Events / Alerts */}
        {summary.importantEvents && summary.importantEvents.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-bold text-yellow-300 font-pixel mb-2">
              ⚠️ KEY OCCURRENCES & ALERTS
            </h4>
            <div className="space-y-1.5 bg-yellow-950/30 p-3 rounded-xl border border-yellow-700/50 max-h-32 overflow-y-auto">
              {summary.importantEvents.map((evt, idx) => (
                <div key={idx} className="text-[10px] text-yellow-200 font-pixel">
                  • {evt}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chronological Itinerary Execution Logs */}
        {summary.dailyLogs && summary.dailyLogs.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-bold text-purple-200 font-pixel mb-2">
              🗓️ 7-DAY SCHEDULE EXECUTION
            </h4>
            <div className="space-y-1 bg-[#120b24] p-3 rounded-xl border border-[#3b2462] max-h-36 overflow-y-auto">
              {summary.dailyLogs.map((log, idx) => (
                <div key={idx} className="text-[10px] text-purple-300 font-pixel flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Company Status Snapshot */}
        <div className="mt-4 grid grid-cols-2 gap-3 bg-[#120b24] p-3 rounded-xl border border-[#3b2462] font-pixel text-xs">
          <div>
            <span className="text-purple-400 text-[10px]">Company Tier:</span>
            <div className="text-yellow-300 font-bold mt-0.5">{summary.companyTier}</div>
          </div>
          <div>
            <span className="text-purple-400 text-[10px]">Reputation:</span>
            <div className="text-cyan-300 font-bold mt-0.5">{summary.companyReputation}</div>
          </div>
        </div>

        {/* Dismiss Button */}
        <div className="mt-6">
          <button
            onClick={handleClose}
            className="w-full btn-primary text-xs font-pixel py-3 shadow-lg"
          >
            CONTINUE TO NEXT WEEK →
          </button>
        </div>
      </div>
    </div>
  )
}
