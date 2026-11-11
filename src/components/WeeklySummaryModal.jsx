import React from 'react'
import { useGame, ACTION } from '../game/state.jsx'
import { formatMoney } from '../game/balance.js'
import { playSfx } from '../game/audio.js'
import Modal from './ui/Modal.jsx'

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
    <Modal
      isOpen={!!summary}
      onClose={handleClose}
      title={`WEEK ${summary.week} • MONTH ${summary.month}, ${summary.year}`}
      subtitle={`${state.companyName} Operations Summary`}
      icon="📊"
      size="lg"
      borderColor="border-yellow-500"
      footer={
        <button
          onClick={handleClose}
          className="w-full btn-primary text-xs font-pixel py-3 shadow-lg"
        >
          CONTINUE TO NEXT WEEK →
        </button>
      }
    >
      <div className="space-y-4 font-pixel">
        {/* Financial Recap Cards */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-[#120b24] p-3 rounded-xl border border-[#3b2462] text-center">
            <span className="text-[9px] text-purple-400">Gross Revenue</span>
            <div className="text-xs font-bold text-emerald-400 mt-1">
              +{formatMoney(summary.income || 0)}
            </div>
          </div>

          <div className="bg-[#120b24] p-3 rounded-xl border border-[#3b2462] text-center">
            <span className="text-[9px] text-purple-400">Total Expenses</span>
            <div className="text-xs font-bold text-red-400 mt-1">
              -{formatMoney(summary.expenses || 0)}
            </div>
          </div>

          <div className={`bg-[#120b24] p-3 rounded-xl border text-center ${
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
          <div className="text-[10px] text-purple-300 bg-[#241744] p-2.5 rounded-lg border border-[#3b2762] flex justify-between">
            <span>Weekly Roster Salaries Paid:</span>
            <span className="text-yellow-300 font-bold">{formatMoney(summary.salariesPaid)}</span>
          </div>
        )}

        {/* Important Events / Alerts */}
        {summary.importantEvents && summary.importantEvents.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-yellow-300 mb-2">
              ⚠️ KEY OCCURRENCES & ALERTS
            </h4>
            <div className="space-y-1.5 bg-yellow-950/30 p-3 rounded-xl border border-yellow-700/50 max-h-32 overflow-y-auto">
              {summary.importantEvents.map((evt, idx) => (
                <div key={idx} className="text-[10px] text-yellow-200">
                  • {evt}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chronological Itinerary Execution Logs */}
        {summary.dailyLogs && summary.dailyLogs.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-purple-200 mb-2">
              🗓️ 7-DAY SCHEDULE EXECUTION
            </h4>
            <div className="space-y-1 bg-[#120b24] p-3 rounded-xl border border-[#3b2462] max-h-36 overflow-y-auto">
              {summary.dailyLogs.map((log, idx) => (
                <div key={idx} className="text-[10px] text-purple-300 flex items-center gap-1.5">
                  <span className="text-emerald-400">✓</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Company Status Snapshot */}
        <div className="grid grid-cols-2 gap-3 bg-[#120b24] p-3 rounded-xl border border-[#3b2462] text-xs">
          <div>
            <span className="text-purple-400 text-[10px]">Company Tier:</span>
            <div className="text-yellow-300 font-bold mt-0.5">{summary.companyTier}</div>
          </div>
          <div>
            <span className="text-purple-400 text-[10px]">Reputation:</span>
            <div className="text-cyan-300 font-bold mt-0.5">{summary.companyReputation}</div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
