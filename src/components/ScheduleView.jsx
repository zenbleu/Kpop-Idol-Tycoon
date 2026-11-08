import React, { useState } from 'react'
import { useGame, ACTION } from '../game/state.jsx'
import { formatMoney } from '../game/balance.js'
import { ACTIVITY_TYPES, WEEK_DAYS } from '../game/schedules.js'
import { playSfx } from '../game/audio.js'

export default function ScheduleView() {
  const { state, dispatch } = useGame()

  const [selectedDay, setSelectedDay] = useState('Monday')
  const [showAddModal, setShowAddModal] = useState(false)
  const [inspectingActivity, setInspectingActivity] = useState(null) // { day, activity }
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'focus'

  // Add activity form state
  const [activityTypeKey, setActivityTypeKey] = useState('small_event')
  const [targetType, setTargetType] = useState('all') // 'all', 'group', 'idol'
  const [targetId, setTargetId] = useState('')
  const [customName, setCustomName] = useState('')

  const daysOfWeek = WEEK_DAYS || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const weeklyPlan = state.weeklyPlan || {}

  const currentActivityConfig = ACTIVITY_TYPES[activityTypeKey] || ACTIVITY_TYPES.small_event

  // Calculate weekly summary metrics
  const allScheduledActivities = daysOfWeek.flatMap(day => (weeklyPlan[day] || []).map(act => ({ ...act, day })))
  const totalActivities = allScheduledActivities.length
  const totalEstRevenue = allScheduledActivities.reduce((sum, act) => sum + (act.revenue || 0), 0)
  const totalStaminaCost = allScheduledActivities.reduce((sum, act) => sum + (act.staminaCost || 0), 0)
  const freeDaysCount = daysOfWeek.filter(day => (weeklyPlan[day] || []).length === 0).length

  const handleOpenAddModal = (day = selectedDay) => {
    setSelectedDay(day)
    setCustomName('')
    setActivityTypeKey('small_event')
    setTargetType('all')
    setTargetId('')
    setShowAddModal(true)
    playSfx('click')
  }

  const handleAddActivity = (e) => {
    e.preventDefault()

    const actName = customName.trim() || currentActivityConfig.name
    let targetName = 'Entire Agency'
    if (targetType === 'group') {
      const g = state.groups.find(grp => grp.id === targetId)
      targetName = g ? g.name : 'Selected Group'
    } else if (targetType === 'idol') {
      const i = state.idols.find(idol => idol.id === targetId)
      targetName = i ? (i.stageName || i.name) : 'Selected Idol'
    }

    dispatch({
      type: ACTION.ADD_SCHEDULE_ACTIVITY,
      day: selectedDay,
      activity: {
        name: actName,
        type: activityTypeKey,
        targetType,
        targetId,
        targetName,
        staminaCost: currentActivityConfig.staminaCost || 0,
        fatigueGain: currentActivityConfig.fatigueGain || 0,
        revenue: currentActivityConfig.revenue || 0,
        cost: currentActivityConfig.cost || 0,
        popularityGain: currentActivityConfig.popularityGain || 0,
      },
    })

    playSfx('coin')
    setShowAddModal(false)
  }

  const handleRemoveActivity = (day, activityId) => {
    dispatch({
      type: ACTION.REMOVE_SCHEDULE_ACTIVITY,
      day,
      activityId,
    })
    playSfx('click')
    if (inspectingActivity?.activity?.id === activityId) {
      setInspectingActivity(null)
    }
  }

  const handleQuickRestDay = (day) => {
    const config = ACTIVITY_TYPES.vacation
    dispatch({
      type: ACTION.ADD_SCHEDULE_ACTIVITY,
      day,
      activity: {
        name: config.name,
        type: 'vacation',
        targetType: 'all',
        targetId: '',
        targetName: 'Entire Agency',
        staminaCost: config.staminaCost || 0,
        fatigueGain: 0,
        revenue: 0,
        cost: config.costPerPerson || 0,
        popularityGain: 0,
      },
    })
    playSfx('click')
  }

  const handleClearWeek = () => {
    if (totalActivities === 0) return
    daysOfWeek.forEach(day => {
      const acts = weeklyPlan[day] || []
      acts.forEach(a => {
        dispatch({ type: ACTION.REMOVE_SCHEDULE_ACTIVITY, day, activityId: a.id })
      })
    })
    playSfx('click')
  }

  const getActivityIcon = (typeKey) => {
    switch (typeKey) {
      case 'vacation': return '🏖️'
      case 'small_event': return '📻'
      case 'big_event': return '📺'
      case 'solo_event': return '⭐'
      case 'company_event': return '👑'
      default: return '📅'
    }
  }

  return (
    <div className="space-y-4">
      {/* ── 1. Compact Header & Metric Bar ───────────────────────────────── */}
      <div className="bg-[#1e1338] border-2 border-[#543b8a] p-3.5 sm:p-4 rounded-2xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">🗓️</span>
            <h2 className="text-base sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-300 font-pixel">
              WEEKLY SCHEDULE PLANNER
            </h2>
            <span className="text-[10px] text-purple-300 bg-[#120b24] px-2 py-0.5 rounded-full border border-purple-500/30 font-pixel">
              7-DAY CHRONOLOGICAL ITINERARY
            </span>
          </div>
          <p className="text-[10px] text-purple-200 mt-0.5 font-pixel">
            Plan daily routines, promotional gigs, and recuperation. Activities execute sequentially on "Next Week".
          </p>
        </div>

        {/* Quick Weekly Stats Pills */}
        <div className="flex items-center gap-2 flex-wrap text-[10px] font-pixel">
          <div className="bg-[#120b24] px-2.5 py-1.5 rounded-lg border border-purple-500/40 text-purple-200">
            Events: <strong className="text-white">{totalActivities}</strong>
          </div>
          <div className="bg-[#120b24] px-2.5 py-1.5 rounded-lg border border-yellow-500/40 text-yellow-300">
            Est. Rev: <strong>+{formatMoney(totalEstRevenue)}</strong>
          </div>
          <div className="bg-[#120b24] px-2.5 py-1.5 rounded-lg border border-pink-500/40 text-pink-300">
            STA Burn: <strong>-{totalStaminaCost}</strong>
          </div>
          <div className="bg-[#120b24] px-2.5 py-1.5 rounded-lg border border-emerald-500/40 text-emerald-300">
            Free Days: <strong>{freeDaysCount}/7</strong>
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <button
              onClick={() => handleOpenAddModal(selectedDay)}
              className="px-3 py-1.5 rounded-lg text-xs font-pixel bg-pink-600 hover:bg-pink-500 text-white font-bold border border-pink-400 shadow transition-all active:scale-95"
            >
              + ADD EVENT
            </button>
            {totalActivities > 0 && (
              <button
                onClick={handleClearWeek}
                className="px-2.5 py-1.5 rounded-lg text-[10px] font-pixel bg-[#2a133d] hover:bg-red-950 border border-red-500/40 text-red-300 transition-colors"
                title="Clear all activities from the week"
              >
                CLEAR
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── 2. View Mode Switcher (Grid vs Day Focus) on Mobile/Tablet ── */}
      <div className="flex lg:hidden items-center justify-between bg-[#190e30] p-1.5 rounded-xl border border-[#442c73]">
        <div className="flex gap-1 overflow-x-auto py-0.5">
          {daysOfWeek.map(day => (
            <button
              key={day}
              onClick={() => {
                setSelectedDay(day)
                setViewMode('focus')
              }}
              className={`px-2 py-1 rounded text-[9px] font-pixel whitespace-nowrap transition-all ${
                selectedDay === day && viewMode === 'focus'
                  ? 'bg-yellow-400 text-black font-bold'
                  : 'bg-[#221344] text-purple-200'
              }`}
            >
              {day.slice(0, 3)} ({(weeklyPlan[day] || []).length})
            </button>
          ))}
        </div>
        <button
          onClick={() => setViewMode(viewMode === 'grid' ? 'focus' : 'grid')}
          className="ml-2 text-[9px] font-pixel text-yellow-300 px-2 py-1 rounded bg-[#2b1652] border border-yellow-500/40 whitespace-nowrap"
        >
          {viewMode === 'grid' ? '🔍 Focus' : '📊 7-Day'}
        </button>
      </div>

      {/* ── 3. The 7-Day Compact Grid ────────────────────────────────────── */}
      <div className={`grid gap-2.5 ${
        viewMode === 'focus' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-7'
      }`}>
        {daysOfWeek.map(day => {
          const acts = weeklyPlan[day] || []
          const isSelected = selectedDay === day
          const dayStaminaCost = acts.reduce((s, a) => s + (a.staminaCost || 0), 0)
          const dayRevenue = acts.reduce((s, a) => s + (a.revenue || 0), 0)

          if (viewMode === 'focus' && selectedDay !== day) return null

          return (
            <div
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`bg-[#1e1338] border-2 rounded-2xl p-2.5 flex flex-col justify-between cursor-pointer transition-all duration-150 relative ${
                isSelected
                  ? 'border-yellow-400 shadow-lg shadow-yellow-500/10 bg-[#231542]'
                  : 'border-[#432d6f] hover:border-purple-400/80 bg-[#1e1338]'
              } min-h-[220px] max-h-[340px]`}
            >
              {/* Day Header Strip */}
              <div>
                <div className="flex items-center justify-between pb-1.5 border-b border-[#3b2762] mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[11px] font-bold font-pixel tracking-wider ${
                      isSelected ? 'text-yellow-300' : 'text-white'
                    }`}>
                      {day.slice(0, 3).toUpperCase()}
                    </span>
                    {day === 'Saturday' || day === 'Sunday' ? (
                      <span className="text-[8px] font-pixel text-pink-300 bg-pink-950/60 px-1 rounded">
                        WKND
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] font-pixel text-purple-300 bg-[#120b24] px-1.5 py-0.2 rounded border border-purple-500/30">
                      {acts.length}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenAddModal(day)
                      }}
                      className="w-5 h-5 rounded flex items-center justify-center bg-pink-600/80 hover:bg-pink-500 text-white text-[10px] font-bold"
                      title={`Add activity to ${day}`}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Day Summary Micro-metrics */}
                {acts.length > 0 && (
                  <div className="flex items-center justify-between text-[8px] font-pixel text-purple-300 mb-1.5 px-0.5">
                    <span className="text-red-400">-{dayStaminaCost} STA</span>
                    {dayRevenue > 0 && (
                      <span className="text-yellow-300">+{formatMoney(dayRevenue)}</span>
                    )}
                  </div>
                )}

                {/* Activities Scrollable List (Compact Chips) */}
                <div className="space-y-1.5 overflow-y-auto max-h-[190px] pr-0.5 scrollbar-thin">
                  {acts.length === 0 ? (
                    <div className="py-6 px-2 text-center text-purple-400/80 text-[10px] font-pixel flex flex-col items-center justify-center gap-1.5">
                      <span className="text-base select-none">🏖️</span>
                      <span>Rest Day</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleQuickRestDay(day)
                        }}
                        className="text-[8px] text-cyan-300 hover:text-cyan-200 underline mt-0.5"
                      >
                        + Vacation (+40 STA)
                      </button>
                    </div>
                  ) : (
                    acts.map(act => (
                      <div
                        key={act.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          setInspectingActivity({ day, activity: act })
                        }}
                        className="p-1.5 rounded-lg bg-[#261749] border border-[#503385] hover:border-pink-400/80 transition-all cursor-pointer flex flex-col gap-0.5 group shadow-sm"
                        title="Click to inspect activity details"
                      >
                        <div className="flex items-center justify-between text-[9px] font-bold text-yellow-300">
                          <span className="truncate flex items-center gap-1">
                            <span>{getActivityIcon(act.type)}</span>
                            <span className="truncate">{act.name}</span>
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveActivity(day, act.id)
                            }}
                            className="text-purple-400 hover:text-red-400 ml-1 text-[10px] font-bold opacity-70 group-hover:opacity-100"
                            title="Remove Activity"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-[8px] text-purple-300">
                          <span className="truncate max-w-[85px] text-purple-200 font-pixel">
                            {act.targetName}
                          </span>
                          <span className={act.staminaCost > 0 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                            {act.staminaCost > 0 ? `-${act.staminaCost}` : '+Rest'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Bottom Quick Action: + Add Activity */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleOpenAddModal(day)
                }}
                className="mt-2 w-full py-1 rounded-lg border border-dashed border-[#503385] hover:border-yellow-400 text-[9px] font-pixel text-purple-300 hover:text-yellow-300 hover:bg-[#2a174f] transition-all text-center"
              >
                + Add
              </button>
            </div>
          )
        })}
      </div>

      {/* ── 4. ACTIVITY DETAILS INSPECTOR MODAL ───────────────────────────── */}
      {inspectingActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#1c1236] border-2 border-pink-500 rounded-2xl p-5 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#3d276b] mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">{getActivityIcon(inspectingActivity.activity.type)}</span>
                <div>
                  <h3 className="text-sm font-bold text-white font-pixel">
                    {inspectingActivity.activity.name}
                  </h3>
                  <span className="text-[9px] text-yellow-300 font-pixel uppercase">
                    Scheduled on {inspectingActivity.day}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInspectingActivity(null)}
                className="text-purple-400 hover:text-white font-pixel text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 text-xs font-pixel">
              <div className="bg-[#120b24] p-3 rounded-xl border border-[#3b2462] space-y-1.5">
                <div className="flex justify-between text-purple-300">
                  <span>Target Scope:</span>
                  <span className="text-white font-bold">{inspectingActivity.activity.targetName}</span>
                </div>
                <div className="flex justify-between text-purple-300">
                  <span>Activity Type:</span>
                  <span className="text-pink-300 uppercase">{inspectingActivity.activity.type?.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between text-purple-300">
                  <span>Stamina Impact:</span>
                  <span className={inspectingActivity.activity.staminaCost > 0 ? 'text-red-400' : 'text-emerald-400'}>
                    {inspectingActivity.activity.staminaCost > 0 ? `-${inspectingActivity.activity.staminaCost} STA` : '+40 Recovery'}
                  </span>
                </div>
                <div className="flex justify-between text-purple-300">
                  <span>Fatigue Impact:</span>
                  <span className={inspectingActivity.activity.fatigueGain > 0 ? 'text-yellow-400' : 'text-emerald-400'}>
                    {inspectingActivity.activity.fatigueGain > 0 ? `+${inspectingActivity.activity.fatigueGain} FAT` : '-30 Fatigue'}
                  </span>
                </div>
                <div className="flex justify-between text-purple-300">
                  <span>Revenue Expected:</span>
                  <span className="text-emerald-400 font-bold">
                    +{formatMoney(inspectingActivity.activity.revenue || 0)}
                  </span>
                </div>
                {inspectingActivity.activity.popularityGain > 0 && (
                  <div className="flex justify-between text-purple-300">
                    <span>Popularity Gain:</span>
                    <span className="text-cyan-300">+{inspectingActivity.activity.popularityGain} pts</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-[#3d276b] mt-4 flex items-center justify-between">
              <button
                onClick={() => {
                  handleRemoveActivity(inspectingActivity.day, inspectingActivity.activity.id)
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-pixel bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-500/50 transition-colors"
              >
                DELETE ACTIVITY
              </button>
              <button
                onClick={() => setInspectingActivity(null)}
                className="btn-secondary text-xs font-pixel py-1.5 px-4"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 5. ADD ACTIVITY MODAL (COMPACT & CATEGORIZED) ───────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#1c1236] border-2 border-pink-500 rounded-2xl p-5 max-w-lg w-full shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#3d276b] mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">✨</span>
                <h3 className="text-sm font-bold text-yellow-300 font-pixel">
                  ADD SCHEDULE ACTIVITY FOR {selectedDay.toUpperCase()}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-purple-400 hover:text-white font-pixel text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddActivity} className="space-y-3.5">
              {/* Day Selector Strip */}
              <div>
                <label className="block text-[10px] font-pixel text-purple-300 mb-1">
                  SCHEDULE FOR DAY
                </label>
                <div className="grid grid-cols-7 gap-1">
                  {daysOfWeek.map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDay(d)}
                      className={`py-1 rounded text-[9px] font-pixel border transition-all ${
                        selectedDay === d
                          ? 'bg-yellow-400 text-black font-bold border-yellow-300 scale-105'
                          : 'bg-[#150b29] border-[#3b2462] text-purple-300 hover:border-pink-400'
                      }`}
                    >
                      {d.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Activity Types Grid */}
              <div>
                <label className="block text-[10px] font-pixel text-purple-300 mb-1">
                  SELECT ACTIVITY TYPE
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(ACTIVITY_TYPES).map(([key, config]) => {
                    const isSelected = activityTypeKey === key
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setActivityTypeKey(key)}
                        className={`p-2.5 rounded-xl border text-left font-pixel transition-all ${
                          isSelected
                            ? 'bg-pink-900/70 border-pink-400 text-white shadow-md ring-1 ring-pink-400'
                            : 'bg-[#241744] border-[#442f70] text-purple-300 hover:border-pink-500/50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs font-bold text-yellow-200">
                          <span>{getActivityIcon(key)}</span>
                          <span className="truncate">{config.name}</span>
                        </div>
                        <div className="text-[9px] text-purple-300 mt-1 flex items-center justify-between">
                          <span className={config.staminaCost > 0 ? 'text-red-400' : 'text-emerald-400'}>
                            {config.staminaCost > 0 ? `STA -${config.staminaCost} • FAT +${config.fatigueGain}` : `+40 STA • -30 FAT`}
                          </span>
                        </div>
                        {config.revenue > 0 && (
                          <div className="text-[9px] text-yellow-300 mt-0.5 font-bold">
                            Rev: +{formatMoney(config.revenue)}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Custom Event Name (Optional) */}
              <div>
                <label className="block text-[10px] font-pixel text-purple-300 mb-1">
                  CUSTOM EVENT NAME (OPTIONAL)
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={currentActivityConfig.name}
                  maxLength={30}
                  className="w-full bg-[#120b24] border border-[#52338c] rounded-lg px-3 py-1.5 text-white font-pixel text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              {/* Target Scope and Target Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[10px] font-pixel text-purple-300 mb-1">
                    TARGET SCOPE
                  </label>
                  <select
                    value={targetType}
                    onChange={(e) => {
                      setTargetType(e.target.value)
                      setTargetId('')
                    }}
                    className="w-full bg-[#120b24] border border-[#52338c] rounded-lg px-2.5 py-1.5 text-white font-pixel text-xs"
                  >
                    <option value="all">Entire Agency / All Idols</option>
                    <option value="group">Specific Group</option>
                    <option value="idol">Specific Idol / Soloist</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-pixel text-purple-300 mb-1">
                    TARGET ASSIGNMENT
                  </label>
                  {targetType === 'all' ? (
                    <div className="bg-[#120b24] border border-[#52338c] rounded-lg px-2.5 py-1.5 text-purple-300 font-pixel text-xs">
                      All Roster Members
                    </div>
                  ) : targetType === 'group' ? (
                    <select
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                      className="w-full bg-[#120b24] border border-[#52338c] rounded-lg px-2.5 py-1.5 text-white font-pixel text-xs"
                    >
                      <option value="">Select Group...</option>
                      {state.groups?.map(g => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  ) : (
                    <select
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                      className="w-full bg-[#120b24] border border-[#52338c] rounded-lg px-2.5 py-1.5 text-white font-pixel text-xs"
                    >
                      <option value="">Select Idol...</option>
                      {state.idols?.map(i => (
                        <option key={i.id} value={i.id}>{i.stageName || i.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-[#3d276b] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary text-xs font-pixel py-1.5 px-4"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs font-pixel py-1.5 px-5"
                >
                  SCHEDULE ACTIVITY →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
