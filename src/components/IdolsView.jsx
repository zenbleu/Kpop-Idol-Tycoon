/**
 * IdolsView.jsx — Modal-First Idol & Trainee Management Interface.
 *
 * Level 1: Main tab is an evenly distributed SQUARE-CARD GRID ROSTER.
 *          Cards are distributed across the available content width without wasted horizontal space.
 *          Strictly NO large portraits on the main screen.
 * Level 2: Real Modal Overlay: Idol Profile Dossier with balanced portrait (84x84),
 *          full attributes, potential, personality, vitals, and contract terms.
 * Level 3: Contextual actions inside modal (rename stage name, retention bonus, contract termination confirmation).
 */

import React, { useState } from 'react'
import { useGame, ACTION } from '../game/state.jsx'
import { getAssetPath } from '../lib/assets.js'
import { formatMoney } from '../game/balance.js'
import { playSfx } from '../game/audio.js'
import Modal from './ui/Modal.jsx'

export default function IdolsView() {
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
    setNewStageName(idol.stageName || idol.name || '')
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
    <div className="space-y-4 font-pixel">
      {/* ── LEVEL 1: Main Tab Overview Header & Filters ────────────────── */}
      <div className="bg-[#1e1338] border-2 border-[#543b8a] p-3.5 sm:p-4 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-xl">🎤</span>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-white">
              AGENCY IDOL ROSTER OVERVIEW
            </h2>
            <p className="text-[10px] text-purple-300 mt-0.5">
              Active Talent: <strong className="text-yellow-300">{idols.length} Idols</strong> · Click any idol card to open the full dossier modal
            </p>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search idol..."
            className="bg-[#120b24] border border-[#52338c] rounded-lg px-2.5 py-1 text-white text-[10px] focus:outline-none focus:border-pink-500 w-32 sm:w-40"
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
                className={`px-2.5 py-1 rounded text-[9px] whitespace-nowrap transition-all border cursor-pointer ${
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

      {/* ── LEVEL 1: EVENLY DISTRIBUTED SQUARE-CARD GRID ROSTER ─────────── */}
      {filteredIdols.length === 0 ? (
        <div className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-8 text-center text-purple-300">
          <p className="text-xs">No idols found matching this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 sm:gap-4">
          {filteredIdols.map(idol => {
            const group = state.groups.find(g => g.id === idol.groupId)
            const isUnloyal = (idol.loyalty || 80) <= 35
            const isFatigued = (idol.fatigue || 0) >= 70
            const tierColor = getTierColor(idol.tier)

            return (
              <div
                key={idol.id}
                onClick={() => handleOpenProfile(idol)}
                className={`p-3.5 rounded-2xl bg-[#1e1338] border-2 shadow-xl hover:border-pink-400 cursor-pointer flex flex-col justify-between transition-all duration-150 hover:scale-[1.02] min-h-[220px] ${
                  isUnloyal
                    ? 'border-red-500/70 bg-red-950/20'
                    : isFatigued
                    ? 'border-yellow-500/70 bg-yellow-950/20'
                    : 'border-[#543b8a]'
                }`}
                title="Click to open idol profile modal"
              >
                {/* Card Top: Tier Badge & Status Chip */}
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-2">
                    <span
                      className="px-2 py-0.5 rounded text-[8px] font-bold uppercase shadow-sm flex-shrink-0"
                      style={{ backgroundColor: tierColor, color: '#000' }}
                    >
                      {idol.tier}-Tier
                    </span>

                    <span className={`px-2 py-0.5 rounded text-[8px] truncate font-bold border max-w-[120px] ${
                      group
                        ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                        : idol.isSolo
                        ? 'bg-pink-950/80 border-pink-500/50 text-pink-300'
                        : 'bg-purple-950/80 border-purple-500/50 text-purple-300'
                    }`}>
                      {group ? group.name : idol.isSolo ? 'Soloist' : 'Trainee'}
                    </span>
                  </div>

                  {/* Card Body: Identity with micro-thumbnail strictly bounded */}
                  <div className="flex items-start gap-2.5 mb-2.5">
                    <img
                      src={getAssetPath(idol.portrait)}
                      alt={idol.name}
                      style={{
                        width: '28px',
                        height: '28px',
                        minWidth: '28px',
                        minHeight: '28px',
                        maxWidth: '28px',
                        maxHeight: '28px',
                        borderRadius: '6px',
                        objectFit: 'cover',
                        border: `1.5px solid ${tierColor}`,
                        flexShrink: 0,
                      }}
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = getAssetPath('/images/actors-portraits/Actor_01.jpg')
                      }}
                    />

                    <div className="min-w-0 flex-1">
                      <strong className="text-white text-xs block truncate leading-tight">
                        {idol.stageName || idol.name}
                      </strong>
                      <div className="text-[9px] text-purple-300 truncate mt-0.5">
                        {idol.name !== idol.stageName ? `${idol.name} · ` : ''}{idol.age}y · {idol.gender}
                      </div>
                    </div>
                  </div>

                  {/* Specialty & Potential */}
                  <div className="p-1.5 bg-[#120826] rounded-lg border border-[#3b2762] text-[9px] space-y-0.5 mb-2.5">
                    <div className="flex justify-between items-center text-yellow-300">
                      <span className="text-purple-400 text-[8px]">SPECIALTY:</span>
                      <strong className="truncate max-w-[90px]">{idol.specialty || 'All-Rounder'}</strong>
                    </div>
                    <div className="flex justify-between items-center text-emerald-300">
                      <span className="text-purple-400 text-[8px]">POTENTIAL:</span>
                      <strong>{idol.potential}-Grade</strong>
                    </div>
                  </div>

                  {/* Vitals Gauges: Stamina & Loyalty */}
                  <div className="space-y-1.5 text-[8px]">
                    <div>
                      <div className="flex justify-between text-purple-300 mb-0.5">
                        <span>STAMINA:</span>
                        <strong className="text-emerald-300">{idol.currentStamina ?? 100}%</strong>
                      </div>
                      <div className="w-full bg-[#120826] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-400 h-full rounded-full transition-all"
                          style={{ width: `${idol.currentStamina ?? 100}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-purple-300 mb-0.5">
                        <span>LOYALTY:</span>
                        <strong className={(idol.loyalty || 80) < 35 ? 'text-red-400' : 'text-yellow-300'}>
                          {idol.loyalty ?? 80}%
                        </strong>
                      </div>
                      <div className="w-full bg-[#120826] h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            (idol.loyalty || 80) < 35 ? 'bg-red-500' : 'bg-yellow-400'
                          }`}
                          style={{ width: `${idol.loyalty ?? 80}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Bottom CTA */}
                <div className="mt-3 pt-2 border-t border-[#342058]">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleOpenProfile(idol)
                    }}
                    className="w-full py-1.5 px-2 rounded-lg text-[9px] font-bold bg-[#2d1b4e] hover:bg-pink-600 hover:text-white text-pink-300 border border-pink-500/40 transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-1"
                  >
                    <span>Dossier Modal</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── LEVEL 2: DEDICATED IDOL PROFILE & MANAGEMENT MODAL (PORTAL OVERLAY) ── */}
      {selectedIdol && (
        <Modal
          isOpen={!!selectedIdol}
          onClose={() => setSelectedIdol(null)}
          title={`IDOL DOSSIER: ${selectedIdol.stageName || selectedIdol.name}`}
          subtitle={`${selectedIdol.tier}-Tier Artist · ${selectedIdol.gender} · Age ${selectedIdol.age}`}
          icon="⭐"
          size="lg"
          borderColor="border-pink-500"
          footer={
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setDismissConfirmIdol(selectedIdol)}
                className="px-3 py-1.5 rounded-lg text-xs bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-500/50 transition-colors cursor-pointer"
              >
                ⚠️ Dismiss Idol
              </button>
              <button
                type="button"
                onClick={() => setSelectedIdol(null)}
                className="px-4 py-1.5 rounded-lg text-xs bg-[#2d1b4e] hover:bg-[#3d2668] text-white border border-purple-500/40 transition-colors cursor-pointer"
              >
                Close Profile
              </button>
            </div>
          }
        >
          <div className="space-y-3.5 text-xs">
            {/* Section 1: Portrait & Core Identity */}
            <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start bg-[#120826] p-3.5 rounded-xl border border-[#3b2762]">
              {/* Properly Sized Portrait (84x84) */}
              <div className="relative flex-shrink-0" style={{ width: '84px', height: '84px' }}>
                <img
                  src={getAssetPath(selectedIdol.portrait)}
                  alt={selectedIdol.name}
                  style={{
                    width: '84px',
                    height: '84px',
                    minWidth: '84px',
                    minHeight: '84px',
                    maxWidth: '84px',
                    maxHeight: '84px',
                    borderRadius: '12px',
                    objectFit: 'cover',
                    border: `2px solid ${getTierColor(selectedIdol.tier)}`,
                  }}
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = getAssetPath('/images/actors-portraits/Actor_01.jpg')
                  }}
                />
                <span
                  className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded text-[8px] font-bold uppercase shadow"
                  style={{ backgroundColor: getTierColor(selectedIdol.tier), color: '#000' }}
                >
                  {selectedIdol.tier}-Tier
                </span>
              </div>

              <div className="flex-1 min-w-0 space-y-1.5 text-xs text-center sm:text-left">
                {/* Stage Name & Rename Control (Level 3) */}
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  {editingStageName ? (
                    <div className="flex gap-1 items-center">
                      <input
                        type="text"
                        value={newStageName}
                        onChange={e => setNewStageName(e.target.value)}
                        maxLength={20}
                        className="bg-[#1e1338] border border-[#52338c] rounded px-2 py-0.5 text-xs text-white"
                        placeholder="New Stage Name"
                      />
                      <button
                        type="button"
                        className="px-2 py-0.5 rounded bg-pink-600 text-white text-[9px] cursor-pointer"
                        onClick={handleSaveStageName}
                      >
                        SAVE
                      </button>
                      <button
                        type="button"
                        className="px-2 py-0.5 rounded bg-[#241744] text-purple-300 text-[9px] cursor-pointer"
                        onClick={() => setEditingStageName(false)}
                      >
                        CANCEL
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-sm">
                        "{selectedIdol.stageName || selectedIdol.name}"
                      </span>
                      <button
                        type="button"
                        className="text-[9px] text-pink-400 hover:underline cursor-pointer"
                        onClick={() => setEditingStageName(true)}
                      >
                        [Rename]
                      </button>
                    </div>
                  )}
                </div>

                <div className="text-purple-300 text-[10px]">
                  Real Name: <strong className="text-white">{selectedIdol.name}</strong> · Nationality: {selectedIdol.nationality}
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-[10px] pt-0.5">
                  <span className="text-yellow-300">Specialty: <strong>{selectedIdol.specialty}</strong></span>
                  <span>•</span>
                  <span className="text-pink-300">Personality: <strong>{selectedIdol.personality}</strong></span>
                  <span>•</span>
                  <span className="text-emerald-300">Potential: <strong>{selectedIdol.potential}-Grade</strong></span>
                </div>
              </div>
            </div>

            {/* Section 2: Skill Attributes (0–100) */}
            <div className="bg-[#120826] p-3.5 rounded-xl border border-[#3b2762]">
              <div className="text-[10px] text-pink-400 mb-2 font-bold uppercase tracking-wider">
                Assessed Skill Attributes (0–100)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[9px]">
                {Object.entries(selectedIdol.stats || {}).map(([statKey, val]) => (
                  <div key={statKey} className="flex items-center justify-between gap-2">
                    <span className="text-purple-300 uppercase w-16">{statKey}</span>
                    <div className="flex-1 bg-[#231544] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-yellow-400 h-full rounded-full transition-all"
                        style={{ width: `${val}%` }}
                      />
                    </div>
                    <span className="text-white font-bold w-7 text-right">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: Vitals & Condition */}
            <div className="grid grid-cols-2 gap-3 bg-[#120826] p-3 rounded-xl border border-[#3b2762] text-[10px]">
              <div>
                <div className="flex justify-between text-purple-300 mb-1">
                  <span>Stamina:</span>
                  <span className="text-emerald-300 font-bold">{selectedIdol.currentStamina ?? 100}%</span>
                </div>
                <div className="w-full bg-[#231544] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full"
                    style={{ width: `${selectedIdol.currentStamina ?? 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-purple-300 mb-1">
                  <span>Fatigue:</span>
                  <span className={(selectedIdol.fatigue || 0) >= 70 ? 'text-red-400 font-bold' : 'text-yellow-300 font-bold'}>
                    {selectedIdol.fatigue ?? 0}%
                  </span>
                </div>
                <div className="w-full bg-[#231544] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-red-500 h-full rounded-full"
                    style={{ width: `${selectedIdol.fatigue ?? 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Contract & Loyalty Management (Level 3) */}
            <div className="bg-[#120b24] p-3.5 rounded-xl border border-[#3b2762] text-[10px] space-y-2">
              <div className="flex justify-between text-purple-300">
                <span>Contract Duration:</span>
                <span className="text-white font-bold">{selectedIdol.contract?.remainingWeeks || 52} weeks remaining</span>
              </div>
              <div className="flex justify-between text-purple-300">
                <span>Weekly Salary:</span>
                <span className="text-yellow-300 font-bold">{formatMoney(selectedIdol.contract?.salaryWeekly)} / wk</span>
              </div>
              <div className="flex justify-between text-purple-300">
                <span>Loyalty Rating:</span>
                <span className={selectedIdol.loyalty < 35 ? 'text-red-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {selectedIdol.loyalty}% ({selectedIdol.retentionCount || 0} retention bonuses granted)
                </span>
              </div>

              {/* Retention Bonus Action */}
              <div className="pt-1.5">
                <button
                  type="button"
                  className="w-full py-2 px-3 rounded-lg text-[10px] font-bold bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-800 disabled:text-gray-500 text-black shadow transition-all active:scale-95 cursor-pointer"
                  onClick={() => handleOfferRetention(selectedIdol)}
                  disabled={state.money < calculateRetentionCost(selectedIdol)}
                >
                  💰 GRANT RETENTION BONUS (+35 LOYALTY) — {formatMoney(calculateRetentionCost(selectedIdol))}
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── LEVEL 3: Permanent Dismissal Confirmation Modal (PORTAL OVERLAY) ── */}
      {dismissConfirmIdol && (
        <Modal
          isOpen={!!dismissConfirmIdol}
          onClose={() => setDismissConfirmIdol(null)}
          title="CONFIRM CONTRACT TERMINATION"
          icon="⚠️"
          size="sm"
          borderColor="border-red-500"
          footer={
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg text-xs bg-[#241744] text-purple-200 border border-purple-500/40 cursor-pointer"
                onClick={() => setDismissConfirmIdol(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg text-xs bg-red-600 hover:bg-red-500 text-white font-bold border border-red-400 shadow cursor-pointer"
                onClick={handlePermanentDismissal}
              >
                Terminate Contract
              </button>
            </div>
          }
        >
          <div className="space-y-3 text-center">
            <p className="text-xs text-purple-200 leading-relaxed">
              Are you sure you want to permanently dismiss <strong className="text-white">{dismissConfirmIdol.name}</strong> ({dismissConfirmIdol.stageName || dismissConfirmIdol.name})?
            </p>
            <p className="text-[10px] text-red-300 bg-red-950/60 p-2 rounded-lg border border-red-600/40">
              All trainee training investments and agency loyalty will be forfeited permanently.
            </p>
          </div>
        </Modal>
      )}
    </div>
  )
}
