/**
 * IdolsView.jsx — Full idol roster management following the 3-level information hierarchy.
 * Level 1: Clean, compact idol roster grid for browsing and filtering.
 * Level 2: Organized Idol Profile Dossier modal with balanced portrait and full stats.
 * Level 3: Contextual management actions (renaming, loyalty retention bonus, dismissal).
 */

import React, { useState } from 'react'
import { useGame, ACTION } from '../game/state.jsx'
import { getAssetPath } from '../lib/assets.js'
import { formatMoney } from '../game/balance.js'
import { playSfx } from '../game/audio.js'

export default function IdolsView({ onSelectIdolToTrain }) {
  const { state, dispatch } = useGame()
  const [filter, setFilter] = useState('all') // 'all' | 'trainees' | 'grouped' | 'solo' | 'fatigued' | 'unloyal'
  const [selectedIdol, setSelectedIdol] = useState(null)
  const [editingStageName, setEditingStageName] = useState(false)
  const [newStageName, setNewStageName] = useState('')
  const [dismissConfirmIdol, setDismissConfirmIdol] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const idols = state.idols || []

  // Filtering
  const filteredIdols = idols.filter(idol => {
    if (idol.hasLeft) return false
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchName = (idol.name || '').toLowerCase().includes(q)
      const matchStage = (idol.stageName || '').toLowerCase().includes(q)
      if (!matchName && !matchStage) return false
    }
    if (filter === 'trainees') return !idol.groupId && !idol.isSolo
    if (filter === 'grouped') return !!idol.groupId
    if (filter === 'solo') return !!idol.isSolo
    if (filter === 'fatigued') return (idol.fatigue || 0) >= 70
    if (filter === 'unloyal') return (idol.loyalty || 80) <= 35
    return true
  })

  // Open profile modal (Level 2)
  const handleOpenProfile = (idol) => {
    setSelectedIdol(idol)
    setNewStageName(idol.stageName || '')
    setEditingStageName(false)
    playSfx('click')
  }

  // Save stage name (Level 3)
  const handleSaveStageName = () => {
    if (!newStageName.trim() || !selectedIdol) return
    playSfx('click')
    dispatch({
      type: ACTION.UPDATE_IDOL_STAGE_NAME,
      idolId: selectedIdol.id,
      newStageName: newStageName.trim(),
    })
    setSelectedIdol(prev => ({ ...prev, stageName: newStageName.trim() }))
    setEditingStageName(false)
  }

  // Retention offer calculation
  const calculateRetentionCost = (idol) => {
    const times = idol.retentionCount || 0
    const baseCost = 10_000_000
    const tierMultiplier = { P: 4.0, S: 3.0, A: 2.2, B: 1.6, C: 1.2, D: 1.0, F: 0.8 }[idol.tier] || 1.0
    const repeatedMultiplier = 1 + times * 0.5
    return Math.round(baseCost * tierMultiplier * repeatedMultiplier)
  }

  // Offer retention (Level 3)
  const handleOfferRetention = (idol) => {
    const cost = calculateRetentionCost(idol)
    if (state.money < cost) {
      dispatch({ type: ACTION.PUSH_TOAST, toast: { message: 'Insufficient funds for retention bonus!', variant: 'red' } })
      playSfx('buzz')
      return
    }

    playSfx('coin')
    dispatch({
      type: ACTION.OFFER_RETENTION,
      idolId: idol.id,
      cost,
    })
    if (selectedIdol?.id === idol.id) {
      setSelectedIdol(prev => ({
        ...prev,
        loyalty: Math.min(100, (prev.loyalty || 20) + 35),
        retentionCount: (prev.retentionCount || 0) + 1,
      }))
    }
  }

  // Confirm dismissal (Level 3)
  const handlePermanentDismissal = () => {
    if (!dismissConfirmIdol) return
    playSfx('buzz')
    dispatch({
      type: ACTION.REMOVE_IDOL_FROM_COMPANY,
      idolId: dismissConfirmIdol.id,
    })
    setDismissConfirmIdol(null)
    setSelectedIdol(null)
  }

  const getTierColor = (tier) => {
    switch (tier) {
      case 'P': return '#FFD700'
      case 'S': return '#FF6B9D'
      case 'A': return '#C084FC'
      case 'B': return '#60A5FA'
      case 'C': return '#34D399'
      case 'D': return '#FBBF24'
      default: return '#9CA3AF'
    }
  }

  return (
    <div className="space-y-4">
      {/* ── Level 1: Roster Overview Header & Filters ───────────────────── */}
      <div className="bg-[#1e1338] border-2 border-[#543b8a] p-3.5 sm:p-4 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🎤</span>
          <div>
            <h2 className="text-base font-bold text-white font-pixel">
              AGENCY IDOL & TRAINEE ROSTER
            </h2>
            <div className="text-[10px] text-purple-300 font-pixel">
              Total Roster: <strong className="text-yellow-300">{idols.length} Idols</strong> · Click any idol card to view profile & actions
            </div>
          </div>
        </div>

        {/* Filter Buttons & Search */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search idol..."
            className="bg-[#120b24] border border-[#52338c] rounded-lg px-2.5 py-1 text-white font-pixel text-[10px] focus:outline-none focus:border-pink-500 w-32 sm:w-40"
          />

          <div className="flex gap-1 overflow-x-auto py-0.5">
            {[
              { id: 'all', label: `ALL (${idols.length})` },
              { id: 'trainees', label: `TRAINEES (${idols.filter(i => !i.groupId && !i.isSolo).length})` },
              { id: 'grouped', label: `GROUP (${idols.filter(i => i.groupId).length})` },
              { id: 'solo', label: `SOLO (${idols.filter(i => i.isSolo).length})` },
              { id: 'fatigued', label: `TIRED (${idols.filter(i => (i.fatigue || 0) >= 70).length})` },
              { id: 'unloyal', label: `UNHAPPY (${idols.filter(i => (i.loyalty || 80) <= 35).length})` },
            ].map(tab => (
              <button
                key={tab.id}
                className={`px-2 py-1 rounded text-[9px] font-pixel whitespace-nowrap transition-all border ${
                  filter === tab.id
                    ? 'bg-pink-600 text-white font-bold border-pink-400 shadow-sm'
                    : 'bg-[#241744] text-purple-200 border-[#472e7a] hover:border-pink-400'
                }`}
                onClick={() => {
                  playSfx('click')
                  setFilter(tab.id)
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Level 1: Compact Idol Cards Grid ───────────────────────────── */}
      {filteredIdols.length === 0 ? (
        <div className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-8 text-center text-purple-300 font-pixel">
          <p className="text-sm">No idols found matching this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredIdols.map(idol => {
            const group = state.groups.find(g => g.id === idol.groupId)
            const isUnloyal = (idol.loyalty || 80) <= 35
            const isFatigued = (idol.fatigue || 0) >= 70
            const tierColor = getTierColor(idol.tier)

            return (
              <div
                key={idol.id}
                onClick={() => handleOpenProfile(idol)}
                className={`bg-[#1e1338] border-2 rounded-xl p-3 flex flex-col justify-between transition-all hover:border-pink-400 cursor-pointer shadow-md hover:scale-[1.01] active:scale-[0.99] ${
                  isUnloyal
                    ? 'border-red-500/80 bg-[#241126]'
                    : isFatigued
                    ? 'border-yellow-500/80 bg-[#25182a]'
                    : 'border-[#4c347f]'
                }`}
                title="Click to view detailed profile and actions"
              >
                <div>
                  {/* Top: Avatar + Identity */}
                  <div className="flex gap-2.5 items-start">
                    <div className="relative flex-shrink-0">
                      <img
                        src={getAssetPath(idol.portrait)}
                        alt={idol.name}
                        className="w-12 h-12 rounded-lg object-cover border-2 shadow-sm"
                        style={{ borderColor: tierColor }}
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = getAssetPath('/images/actors-portraits/Actor_01.jpg')
                        }}
                      />
                      <span
                        className="absolute -bottom-1 -right-1 px-1 rounded text-[8px] font-pixel font-bold uppercase shadow"
                        style={{ backgroundColor: tierColor, color: '#000' }}
                      >
                        {idol.tier}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0 font-pixel">
                      <div className="flex items-center justify-between">
                        <strong className="text-white text-xs truncate" title={idol.name}>
                          {idol.stageName || idol.name}
                        </strong>
                        <span className="text-[9px] text-purple-300">
                          {idol.age}y
                        </span>
                      </div>
                      <div className="text-[10px] text-purple-300 truncate">
                        {idol.name} · {idol.nationality?.slice(0, 3)}
                      </div>
                      <div className="text-[9px] text-yellow-300 truncate mt-0.5">
                        {idol.specialty || 'All-Rounder'}
                      </div>
                    </div>
                  </div>

                  {/* Status & Potential row */}
                  <div className="mt-2.5 flex items-center justify-between text-[9px] font-pixel">
                    <span className={`px-2 py-0.5 rounded border truncate max-w-[130px] ${
                      group
                        ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                        : idol.isSolo
                        ? 'bg-pink-950/70 border-pink-500/50 text-pink-300'
                        : 'bg-purple-950/70 border-purple-500/50 text-purple-300'
                    }`}>
                      {group ? `👥 ${group.name}` : idol.isSolo ? '⭐ Solo' : '🌱 Trainee'}
                    </span>
                    <span className="text-purple-300">
                      Pot: <strong className="text-emerald-300">{idol.potential}</strong>
                    </span>
                  </div>

                  {/* Key Vitals (Stamina & Loyalty) */}
                  <div className="mt-2 grid grid-cols-2 gap-2 bg-[#120826] p-2 rounded-lg border border-[#37235e] text-[9px] font-pixel">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-400">STA</span>
                      <span className="text-emerald-300 font-bold">{idol.currentStamina ?? 100}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-400">LOY</span>
                      <span className={(idol.loyalty || 80) < 35 ? 'text-red-400 font-bold' : 'text-yellow-300 font-bold'}>
                        {idol.loyalty ?? 80}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer link hint */}
                <div className="mt-2.5 pt-2 border-t border-[#37235e] flex items-center justify-between text-[9px] font-pixel text-purple-300">
                  <span>{formatMoney(idol.contract?.salaryWeekly)}/wk</span>
                  <span className="text-pink-400 font-bold">Profile →</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Level 2 & 3: Detailed Idol Profile Dossier Modal ───────────── */}
      {selectedIdol && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
          onClick={() => setSelectedIdol(null)}
        >
          <div
            className="bg-[#1c1236] border-2 border-pink-500 rounded-2xl p-5 max-w-lg w-full shadow-2xl max-h-[92vh] overflow-y-auto space-y-4"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#3d276b]">
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-pixel font-bold uppercase shadow"
                  style={{ backgroundColor: getTierColor(selectedIdol.tier), color: '#000' }}
                >
                  {selectedIdol.tier}-TIER
                </span>
                <h2 className="text-base font-bold text-white font-pixel">
                  {selectedIdol.name}
                </h2>
              </div>
              <button
                onClick={() => setSelectedIdol(null)}
                className="text-purple-400 hover:text-white font-pixel text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* Profile Hero: Balanced Portrait (w-20 h-20) + Essential Identity */}
            <div className="flex gap-4 items-center bg-[#120826] p-3 rounded-xl border border-[#3b2762]">
              <img
                src={getAssetPath(selectedIdol.portrait)}
                alt={selectedIdol.name}
                className="w-20 h-20 rounded-xl object-cover border-2 shadow-md flex-shrink-0"
                style={{ borderColor: getTierColor(selectedIdol.tier) }}
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = getAssetPath('/images/actors-portraits/Actor_01.jpg')
                }}
              />
              <div className="flex-1 min-w-0 font-pixel text-xs space-y-1">
                {/* Stage Name with Rename Action (Level 3) */}
                <div className="flex items-center gap-2">
                  {editingStageName ? (
                    <div className="flex gap-1 items-center">
                      <input
                        type="text"
                        value={newStageName}
                        onChange={e => setNewStageName(e.target.value)}
                        maxLength={20}
                        className="bg-[#1e1338] border border-[#52338c] rounded px-2 py-0.5 text-xs text-white"
                      />
                      <button className="btn-primary text-[9px] py-1 px-2" onClick={handleSaveStageName}>SAVE</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-300 font-bold">"{selectedIdol.stageName}"</span>
                      <button
                        className="text-[9px] text-pink-400 hover:underline"
                        onClick={() => setEditingStageName(true)}
                      >
                        [Rename]
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-purple-300 text-[10px]">
                  Age {selectedIdol.age} · {selectedIdol.nationality} · {selectedIdol.gender}
                </div>
                <div className="text-yellow-300 text-[10px]">
                  Specialty: {selectedIdol.specialty}
                </div>
                <div className="text-pink-300 text-[10px]">
                  Personality: {selectedIdol.personality}
                </div>
                <div className="text-emerald-300 text-[10px]">
                  Potential: {selectedIdol.potential}-Grade · Score: {selectedIdol.overallScore} pts
                </div>
              </div>
            </div>

            {/* Level 2: Skill Attributes Breakdown (0–100) */}
            <div className="bg-[#120826] p-3 rounded-xl border border-[#3b2762]">
              <div className="text-[10px] text-pink-400 font-pixel mb-2 font-bold uppercase">
                Skill Attributes (0–100)
              </div>
              <div className="grid grid-cols-2 gap-2 text-[9px] font-pixel">
                {Object.entries(selectedIdol.stats || {}).map(([statKey, val]) => (
                  <div key={statKey} className="flex items-center justify-between gap-1.5">
                    <span className="text-purple-300 uppercase w-12">{statKey}</span>
                    <div className="flex-1 bg-[#231544] h-1.5 rounded-full overflow-hidden">
                      <div className="bg-pink-400 h-full rounded-full" style={{ width: `${val}%` }} />
                    </div>
                    <span className="text-white font-bold w-6 text-right">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Level 2 & 3: Contract & Loyalty Management */}
            <div className="bg-[#120826] p-3 rounded-xl border border-[#3b2762] text-[10px] font-pixel space-y-2">
              <div className="flex justify-between text-purple-300">
                <span>Contract Remaining:</span>
                <span className="text-white font-bold">{selectedIdol.contract?.remainingWeeks || 52} weeks</span>
              </div>
              <div className="flex justify-between text-purple-300">
                <span>Weekly Salary:</span>
                <span className="text-yellow-300 font-bold">{formatMoney(selectedIdol.contract?.salaryWeekly)} / week</span>
              </div>
              <div className="flex justify-between text-purple-300">
                <span>Loyalty Rating:</span>
                <span className={selectedIdol.loyalty < 35 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {selectedIdol.loyalty}% ({selectedIdol.retentionCount || 0} retention bonuses awarded)
                </span>
              </div>

              {/* Retention Action (Level 3) */}
              <div className="pt-1">
                <button
                  className="w-full btn-gold text-xs font-pixel py-2 shadow"
                  onClick={() => handleOfferRetention(selectedIdol)}
                  disabled={state.money < calculateRetentionCost(selectedIdol)}
                >
                  OFFER RETENTION BONUS ({formatMoney(calculateRetentionCost(selectedIdol))})
                </button>
              </div>
            </div>

            {/* Modal Actions (Level 3) */}
            <div className="flex justify-between items-center pt-2 border-t border-[#3d276b]">
              <button
                className="px-3 py-1.5 rounded-lg text-xs font-pixel bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-500/50 transition-colors"
                onClick={() => setDismissConfirmIdol(selectedIdol)}
              >
                ⚠️ DISMISS IDOL
              </button>
              <button
                className="px-4 py-1.5 rounded-lg text-xs font-pixel bg-[#2d1b4e] hover:bg-[#3d2668] text-white border border-purple-500/40"
                onClick={() => setSelectedIdol(null)}
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Level 3: Permanent Dismissal Confirmation Modal ────────────── */}
      {dismissConfirmIdol && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setDismissConfirmIdol(null)}
        >
          <div
            className="bg-[#2a0e1b] border-2 border-red-500 rounded-2xl p-6 max-w-md w-full shadow-2xl font-pixel text-center space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="text-3xl">⚠️</div>
            <h3 className="text-sm font-bold text-red-400 uppercase">
              CONFIRM IDOL TERMINATION
            </h3>
            <p className="text-xs text-purple-200 leading-relaxed">
              Are you sure you want to permanently terminate <strong className="text-white">{dismissConfirmIdol.name}</strong> ({dismissConfirmIdol.stageName})?
              All contracts and trainee investments will be forfeited.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                className="px-4 py-2 rounded-xl text-xs bg-[#1f102e] text-purple-200 border border-purple-500/40 hover:bg-[#2d1645]"
                onClick={() => setDismissConfirmIdol(null)}
              >
                CANCEL
              </button>
              <button
                className="px-4 py-2 rounded-xl text-xs bg-red-600 hover:bg-red-500 text-white font-bold border border-red-400 shadow-lg"
                onClick={handlePermanentDismissal}
              >
                YES, TERMINATE CONTRACT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
