/**
 * ScheduleView.jsx — Modal-First Weekly Schedule Planner.
 *
 * Level 1: Main tab is a clean 7-day chronological week overview showing
 *          activity counts, free days, stamina burn, and expected revenue.
 * Level 2: Dedicated Add Activity Modal (select day, type, scope, and target)
 *          and Activity Details Inspector Modal (view vitals impact, delete/edit).
 */

import React, { useState } from 'react'
import { useGame, ACTION } from '../game/state.jsx'
import { formatMoney } from '../game/balance.js'
import { ACTIVITY_TYPES, WEEK_DAYS } from '../game/schedules.js'
import { playSfx } from '../game/audio.js'
import Modal from './ui/Modal.jsx'

export default function ScheduleView() {
  const { state, dispatch } = useGame()

  const [selectedDay, setSelectedDay] = useState('Monday')
  const [showAddModal, setShowAddModal] = useState(false)
  const [inspectingActivity, setInspectingActivity] = useState(null) // { day, activity }

  // Add activity form state inside modal
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
    <div className="space-y-4 font-pixel">
      {/* ── LEVEL 1: Main Tab Weekly Overview Header ───────────────────── */}
      <div className="bg-[#1e1338] border-2 border-[#543b8a] p-3.5 sm:p-4 rounded-2xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🗓️</span>
            <h2 className="text-sm sm:text-base font-bold text-white">
              WEEKLY SCHEDULE PLANNER OVERVIEW
            </h2>
          </div>
          <p className="text-[10px] text-purple-200 mt-0.5">
            7-day chronological itinerary. Click any day to add an event, or click an activity to view details.
          </p>
        </div>

        {/* Weekly Metrics Strip */}
        <div className="flex items-center gap-2 flex-wrap text-[10px]">
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
              type="button"
              onClick={() => handleOpenAddModal(selectedDay)}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-pink-600 hover:bg-pink-500 text-white border border-pink-400 shadow transition-all active:scale-95"
            >
              + Add Event
            </button>
            {totalActivities > 0 && (
              <button
                type="button"
                onClick={handleClearWeek}
                className="px-2.5 py-1.5 rounded-lg text-[10px] bg-[#2a133d] hover:bg-red-950 border border-red-500/40 text-red-300 transition-colors"
                title="Clear all activities from the week"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── LEVEL 1: The 7-Day Overview Grid ───────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-2.5">
        {daysOfWeek.map(day => {
          const acts = weeklyPlan[day] || []
          const isSelected = selectedDay === day
          const dayStaminaCost = acts.reduce((s, a) => s + (a.staminaCost || 0), 0)
          const dayRevenue = acts.reduce((s, a) => s + (a.revenue || 0), 0)

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
              <div>
                {/* Day Header Strip */}
                <div className="flex items-center justify-between pb-1.5 border-b border-[#3b2762] mb-1.5">
                  <div className="flex items-center gap-1">
                    <strong className={`text-[11px] tracking-wider ${
                      isSelected ? 'text-yellow-300' : 'text-white'
                    }`}>
                      {day.slice(0, 3).toUpperCase()}
                    </strong>
                    {(day === 'Saturday' || day === 'Sunday') && (
                      <span className="text-[7px] text-pink-300 bg-pink-950/60 px-1 rounded">
                        WKND
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[8px] text-purple-300 bg-[#120b24] px-1.5 py-0.2 rounded border border-purple-500/30">
                      {acts.length}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenAddModal(day)
                      }}
                      className="w-4 h-4 rounded flex items-center justify-center bg-pink-600/80 hover:bg-pink-500 text-white text-[9px] font-bold"
                      title={`Add activity to ${day}`}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Day Metrics */}
                {acts.length > 0 && (
                  <div className="flex items-center justify-between text-[8px] text-purple-300 mb-1.5 px-0.5">
                    <span className="text-red-400">-{dayStaminaCost} STA</span>
                    {dayRevenue > 0 && (
                      <span className="text-yellow-300">+{formatMoney(dayRevenue)}</span>
                    )}
                  </div>
                )}

                {/* Activities List */}
                <div className="space-y-1.5 overflow-y-auto max-h-[190px] pr-0.5 scrollbar-thin">
                  {acts.length === 0 ? (
                    <div className="py-6 px-1 text-center text-purple-400/80 text-[9px] flex flex-col items-center justify-center gap-1">
                      <span className="text-base select-none">🏖️</span>
                      <span>Rest Day</span>
                      <button
                        type="button"
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
                        title="Click to inspect activity details in modal"
                      >
                        <div className="flex items-center justify-between text-[9px] font-bold text-yellow-300">
                          <span className="truncate flex items-center gap-1">
                            <span>{getActivityIcon(act.type)}</span>
                            <span className="truncate">{act.name}</span>
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveActivity(day, act.id)
                            }}
                            className="text-purple-400 hover:text-red-400 ml-1 text-[9px] font-bold opacity-70 group-hover:opacity-100"
                            title="Remove Activity"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-[8px] text-purple-300">
                          <span className="truncate max-w-[85px] text-purple-200">
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

              {/* Day Bottom Quick Add */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  handleOpenAddModal(day)
                }}
                className="mt-2 w-full py-1 rounded-lg border border-dashed border-[#503385] hover:border-yellow-400 text-[8px] text-purple-300 hover:text-yellow-300 hover:bg-[#2a174f] transition-all text-center"
              >
                + Add Activity
              </button>
            </div>
          )
        })}
      </div>

      {/* ── LEVEL 2: DEDICATED ACTIVITY DETAILS INSPECTOR MODAL ────────── */}
      {inspectingActivity && (
        <Modal
          isOpen={!!inspectingActivity}
          onClose={() => setInspectingActivity(null)}
          title={inspectingActivity.activity.name}
          subtitle={`Scheduled for ${inspectingActivity.day}`}
          icon={getActivityIcon(inspectingActivity.activity.type)}
          size="md"
          borderColor="border-pink-500"
          footer={
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  handleRemoveActivity(inspectingActivity.day, inspectingActivity.activity.id)
                }}
                className="px-3 py-1.5 rounded-lg text-xs bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-500/50 transition-colors"
              >
                Delete Activity
              </button>
              <button
                type="button"
                onClick={() => setInspectingActivity(null)}
                className="px-4 py-1.5 rounded-lg text-xs bg-[#241744] text-purple-200 border border-purple-500/40"
              >
                Close Details
              </button>
            </div>
          }
        >
          <div className="space-y-2.5 text-xs bg-[#120b24] p-3.5 rounded-xl border border-[#3b2462]">
            <div className="flex justify-between text-purple-300 text-[10px]">
              <span>Target Scope:</span>
              <strong className="text-white">{inspectingActivity.activity.targetName}</strong>
            </div>
            <div className="flex justify-between text-purple-300 text-[10px]">
              <span>Activity Type:</span>
              <strong className="text-pink-300 uppercase">{inspectingActivity.activity.type?.replace('_', ' ')}</strong>
            </div>
            <div className="flex justify-between text-purple-300 text-[10px]">
              <span>Stamina Impact:</span>
              <strong className={inspectingActivity.activity.staminaCost > 0 ? 'text-red-400' : 'text-emerald-400'}>
                {inspectingActivity.activity.staminaCost > 0 ? `-${inspectingActivity.activity.staminaCost} STA` : '+40 Recovery'}
              </strong>
            </div>
            <div className="flex justify-between text-purple-300 text-[10px]">
              <span>Fatigue Impact:</span>
              <strong className={inspectingActivity.activity.fatigueGain > 0 ? 'text-yellow-400' : 'text-emerald-400'}>
                {inspectingActivity.activity.fatigueGain > 0 ? `+${inspectingActivity.activity.fatigueGain} FAT` : '-30 Fatigue'}
              </strong>
            </div>
            <div className="flex justify-between text-purple-300 text-[10px]">
              <span>Revenue Expected:</span>
              <strong className="text-emerald-400">
                +{formatMoney(inspectingActivity.activity.revenue || 0)}
              </strong>
            </div>
            {inspectingActivity.activity.popularityGain > 0 && (
              <div className="flex justify-between text-purple-300 text-[10px]">
                <span>Popularity Gain:</span>
                <strong className="text-cyan-300">+{inspectingActivity.activity.popularityGain} pts</strong>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ── LEVEL 2: DEDICATED ADD ACTIVITY MODAL ──────────────────────── */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title={`SCHEDULE ACTIVITY FOR ${selectedDay.toUpperCase()}`}
          subtitle="Configure routine, promotional events, or agency vacation"
          icon="✨"
          size="lg"
          borderColor="border-pink-500"
        >
          <form onSubmit={handleAddActivity} className="space-y-3.5 text-xs">
            {/* Day Selector Strip */}
            <div>
              <label className="block text-[10px] text-purple-300 mb-1">
                SCHEDULE FOR DAY
              </label>
              <div className="grid grid-cols-7 gap-1">
                {daysOfWeek.map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDay(d)}
                    className={`py-1 rounded text-[9px] border transition-all ${
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
              <label className="block text-[10px] text-purple-300 mb-1">
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
                      className={`p-2.5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-pink-900/70 border-pink-400 text-white shadow ring-1 ring-pink-400'
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
              <label className="block text-[10px] text-purple-300 mb-1">
                CUSTOM EVENT NAME (OPTIONAL)
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={currentActivityConfig.name}
                maxLength={30}
                className="w-full bg-[#120b24] border border-[#52338c] rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-pink-500"
              />
            </div>

            {/* Target Scope and Assignment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] text-purple-300 mb-1">
                  TARGET SCOPE
                </label>
                <select
                  value={targetType}
                  onChange={(e) => {
                    setTargetType(e.target.value)
                    setTargetId('')
                  }}
                  className="w-full bg-[#120b24] border border-[#52338c] rounded-lg px-2 py-1.5 text-white text-xs"
                >
                  <option value="all">Entire Agency / All Idols</option>
                  <option value="group">Specific Group</option>
                  <option value="idol">Specific Idol / Soloist</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-purple-300 mb-1">
                  TARGET ASSIGNMENT
                </label>
                {targetType === 'all' ? (
                  <div className="bg-[#120b24] border border-[#52338c] rounded-lg px-2.5 py-1.5 text-purple-300 text-xs">
                    All Roster Members
                  </div>
                ) : targetType === 'group' ? (
                  <select
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    className="w-full bg-[#120b24] border border-[#52338c] rounded-lg px-2 py-1.5 text-white text-xs"
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
                    className="w-full bg-[#120b24] border border-[#52338c] rounded-lg px-2 py-1.5 text-white text-xs"
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
            <div className="pt-2 border-t border-[#3d276b] flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs bg-[#241744] text-purple-200 border border-purple-500/40"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-pink-600 hover:bg-pink-500 text-white border border-pink-400 shadow"
              >
                Schedule Activity
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
