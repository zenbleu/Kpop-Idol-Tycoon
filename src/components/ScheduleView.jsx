import React, { useState } from 'react'
import { useGame, ACTION } from '../game/state.jsx'
import { formatMoney } from '../game/balance.js'
import { ACTIVITY_TYPES } from '../game/schedules.js'
import { playSfx } from '../game/audio.js'

export default function ScheduleView() {
  const { state, dispatch } = useGame()

  const [selectedDay, setSelectedDay] = useState('Monday')
  const [showAddModal, setShowAddModal] = useState(false)

  // Add activity form state
  const [activityTypeKey, setActivityTypeKey] = useState('small_event')
  const [targetType, setTargetType] = useState('all') // 'all', 'group', 'idol'
  const [targetId, setTargetId] = useState('')
  const [customName, setCustomName] = useState('')

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  const weeklyPlan = state.weeklyPlan || {}

  const currentActivityConfig = ACTIVITY_TYPES[activityTypeKey] || ACTIVITY_TYPES.small_event

  const handleOpenAddModal = (day) => {
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
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1e1338] border-2 border-[#543b8a] p-4 rounded-xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-300 font-pixel">
            WEEKLY SCHEDULE PLANNER (7-DAY ITINERARY)
          </h2>
          <p className="text-xs text-purple-200 mt-1 font-pixel leading-relaxed">
            Schedule activities Monday through Sunday. No 4-slot limit. All 7 days are simulated chronologically on "Next Week".
          </p>
        </div>

        <button
          onClick={() => handleOpenAddModal(selectedDay)}
          className="btn-primary text-xs font-pixel py-2.5 px-4 shadow-md flex items-center gap-2"
        >
          + ADD ACTIVITY TO {selectedDay.toUpperCase()}
        </button>
      </div>

      {/* 7-Day Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
        {daysOfWeek.map(day => {
          const acts = weeklyPlan[day] || []
          const isSelected = selectedDay === day

          return (
            <div
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`bg-[#1e1338] border-2 rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all min-h-[380px] ${
                isSelected
                  ? 'border-yellow-400 shadow-lg shadow-yellow-500/10'
                  : 'border-[#452e75] hover:border-purple-400'
              }`}
            >
              <div>
                {/* Day Header */}
                <div className="flex items-center justify-between pb-2 border-b border-[#3b2762] mb-3">
                  <h3 className={`text-xs font-bold font-pixel ${isSelected ? 'text-yellow-300' : 'text-white'}`}>
                    {day.slice(0, 3).toUpperCase()}
                  </h3>
                  <span className="text-[10px] font-pixel text-purple-300 bg-[#120b24] px-1.5 py-0.5 rounded">
                    {acts.length}
                  </span>
                </div>

                {/* Activities List */}
                <div className="space-y-2">
                  {acts.length === 0 ? (
                    <div className="text-center py-8 text-purple-400 text-[10px] font-pixel italic">
                      Rest day / Free
                    </div>
                  ) : (
                    acts.map(act => (
                      <div
                        key={act.id}
                        className="p-2 rounded-xl bg-[#241744] border border-[#52338c] text-[10px] font-pixel relative group hover:border-pink-500/60 transition-colors"
                      >
                        <div className="flex items-center justify-between text-yellow-300 font-bold">
                          <span className="truncate">{act.name}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemoveActivity(day, act.id)
                            }}
                            className="text-purple-400 hover:text-red-400 ml-1 text-xs"
                            title="Remove Activity"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="text-purple-300 text-[9px] mt-0.5 truncate">
                          Target: {act.targetName}
                        </div>

                        <div className="mt-1 flex items-center justify-between text-[8px] text-purple-400">
                          {act.staminaCost > 0 ? (
                            <span className="text-red-400">-{act.staminaCost} STA</span>
                          ) : (
                            <span className="text-emerald-400">+Rest</span>
                          )}
                          {act.revenue > 0 && (
                            <span className="text-yellow-300">+{formatMoney(act.revenue)}</span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Add button inside column */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleOpenAddModal(day)
                }}
                className="mt-3 w-full py-1.5 rounded-lg border border-dashed border-[#52338c] hover:border-yellow-400 text-[10px] font-pixel text-purple-300 hover:text-yellow-300 transition-colors text-center"
              >
                + Add
              </button>
            </div>
          )
        })}
      </div>

      {/* ADD ACTIVITY MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1c1236] border-2 border-[#5d3b9e] rounded-2xl p-6 max-w-lg w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#3d276b] mb-4">
              <h3 className="text-sm font-bold text-yellow-300 font-pixel">
                ADD ACTIVITY FOR {selectedDay.toUpperCase()}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-purple-400 hover:text-white font-pixel text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddActivity} className="space-y-4">
              <div>
                <label className="block text-xs font-pixel text-purple-200 mb-1">
                  ACTIVITY TYPE
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {Object.entries(ACTIVITY_TYPES).map(([key, config]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActivityTypeKey(key)}
                      className={`p-2.5 rounded-xl border text-left font-pixel transition-all ${
                        activityTypeKey === key
                          ? 'bg-pink-900/70 border-pink-400 text-white shadow-md'
                          : 'bg-[#241744] border-[#442f70] text-purple-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{config.name}</div>
                      <div className="text-[9px] text-purple-300 mt-1">
                        {config.staminaCost > 0 ? `STA -${config.staminaCost} • FAT +${config.fatigueGain}` : `Restores Stamina • FAT -25`}
                      </div>
                      {config.revenue > 0 && (
                        <div className="text-[9px] text-yellow-300 mt-0.5">Rev: +{formatMoney(config.revenue)}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-pixel text-purple-200 mb-1">
                  CUSTOM EVENT NAME (OPTIONAL)
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder={currentActivityConfig.name}
                  maxLength={30}
                  className="w-full bg-[#120b24] border border-[#52338c] rounded-lg px-3 py-2 text-white font-pixel text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-pixel text-purple-200 mb-1">
                    TARGET SCOPE
                  </label>
                  <select
                    value={targetType}
                    onChange={(e) => {
                      setTargetType(e.target.value)
                      setTargetId('')
                    }}
                    className="w-full bg-[#120b24] border border-[#52338c] rounded-lg px-3 py-2 text-white font-pixel text-xs"
                  >
                    <option value="all">Entire Agency / All Idols</option>
                    <option value="group">Specific Group</option>
                    <option value="idol">Specific Idol / Soloist</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-pixel text-purple-200 mb-1">
                    TARGET NAME
                  </label>
                  {targetType === 'all' ? (
                    <div className="bg-[#120b24] border border-[#52338c] rounded-lg px-3 py-2 text-purple-300 font-pixel text-xs">
                      All Idols & Groups
                    </div>
                  ) : targetType === 'group' ? (
                    <select
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                      className="w-full bg-[#120b24] border border-[#52338c] rounded-lg px-3 py-2 text-white font-pixel text-xs"
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
                      className="w-full bg-[#120b24] border border-[#52338c] rounded-lg px-3 py-2 text-white font-pixel text-xs"
                    >
                      <option value="">Select Idol...</option>
                      {state.idols?.map(i => (
                        <option key={i.id} value={i.id}>{i.stageName || i.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[#3d276b] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary text-xs font-pixel py-2 px-4"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs font-pixel py-2 px-5"
                >
                  ADD TO SCHEDULE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
