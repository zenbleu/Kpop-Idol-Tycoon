/**
 * IdolsView.jsx — Full idol roster management, profiles, stage name editing,
 * retention offers, and permanent company dismissal.
 */

import React, { useState } from 'react'
import { useGame, ACTION } from '../game/state.jsx'
import { assetUrl } from '../lib/assets.js'
import { playSfx } from '../game/audio.js'

export default function IdolsView({ onSelectIdolToTrain }) {
  const { state, dispatch } = useGame()
  const [filter, setFilter] = useState('all') // 'all' | 'trainees' | 'grouped' | 'solo' | 'fatigued' | 'unloyal'
  const [selectedIdol, setSelectedIdol] = useState(null)
  const [editingStageName, setEditingStageName] = useState(false)
  const [newStageName, setNewStageName] = useState('')
  const [dismissConfirmIdol, setDismissConfirmIdol] = useState(null)

  const formatMoney = (val) => '₩' + Math.max(0, val || 0).toLocaleString()

  const idols = state.idols || []

  // Filtering
  const filteredIdols = idols.filter(idol => {
    if (idol.hasLeft) return false
    if (filter === 'trainees') return !idol.groupId && !idol.isSolo
    if (filter === 'grouped') return !!idol.groupId
    if (filter === 'solo') return !!idol.isSolo
    if (filter === 'fatigued') return (idol.fatigue || 0) >= 70
    if (filter === 'unloyal') return (idol.loyalty || 80) <= 35
    return true
  })

  // Open profile modal
  const handleOpenProfile = (idol) => {
    setSelectedIdol(idol)
    setNewStageName(idol.stageName || '')
    setEditingStageName(false)
    playSfx('click')
  }

  // Save stage name
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

  // Offer retention
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

  // Confirm dismissal
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

  return (
    <div className="idols-view-container">
      {/* ── 1. Top Filters & Counter ───────────────────────────────── */}
      <div className="panel">
        <div className="panel-title flex items-center justify-between">
          <span>🎤 AGENCY IDOL & TRAINEE ROSTER</span>
          <span className="small text-gold">TOTAL: {idols.length} IDOLS</span>
        </div>

        <div className="seg">
          {[
            { id: 'all', label: `ALL (${idols.length})` },
            { id: 'trainees', label: `TRAINEES (${idols.filter(i => !i.groupId && !i.isSolo).length})` },
            { id: 'grouped', label: `GROUP MEMBERS (${idols.filter(i => i.groupId).length})` },
            { id: 'solo', label: `SOLO ARTISTS (${idols.filter(i => i.isSolo).length})` },
            { id: 'fatigued', label: `FATIGUED (${idols.filter(i => (i.fatigue || 0) >= 70).length})` },
            { id: 'unloyal', label: `LOW LOYALTY (${idols.filter(i => (i.loyalty || 80) <= 35).length})` },
          ].map(tab => (
            <button
              key={tab.id}
              className={filter === tab.id ? 'sel' : ''}
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

      {/* ── 2. Idol Roster Cards Grid ────────────────────────────────── */}
      <div className="idols-grid mt-2">
        {filteredIdols.length === 0 ? (
          <div className="panel empty-slot-msg">
            <p>No idols found matching this filter.</p>
          </div>
        ) : (
          filteredIdols.map(idol => {
            const group = state.groups.find(g => g.id === idol.groupId)
            const retentionCost = calculateRetentionCost(idol)

            return (
              <div key={idol.id} className="idol-card panel">
                <div className="idol-card-top flex gap-2">
                  <div className="portrait">
                    <img
                      src={assetUrl(idol.portrait)}
                      alt={idol.name}
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.parentNode.classList.add('broken-img-fallback')
                      }}
                    />
                    <div className="fallback">🎤</div>
                  </div>
                  <div className="idol-main-info">
                    <div className="flex items-center justify-between">
                      <strong className="text-white">{idol.name}</strong>
                      <span className="tier-tag text-gold">{idol.tier}-TIER</span>
                    </div>
                    <div className="tiny text-lav">Stage Name: "{idol.stageName}"</div>
                    <div className="tiny text-lav">Age: {idol.age} · {idol.nationality} · {idol.gender}</div>
                    <div className="tiny text-gold">{idol.specialty}</div>
                    <div className="tiny text-pink">Personality: {idol.personality}</div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="status-chips-row mt-1">
                  {group ? (
                    <span className="tag-chip text-green">Group: {group.name}</span>
                  ) : idol.isSolo ? (
                    <span className="tag-chip text-pink">⭐ Solo Artist</span>
                  ) : (
                    <span className="tag-chip text-lav">🌱 Trainee</span>
                  )}
                  {idol.groupCooldownUntilWeek && idol.groupCooldownUntilWeek > (state.totalWeeksPassed || 1) && (
                    <span className="tag-chip text-red">
                      Cooldown: {idol.groupCooldownUntilWeek - (state.totalWeeksPassed || 1)}W left
                    </span>
                  )}
                </div>

                {/* Vital Bars */}
                <div className="idol-vitals-strip mt-2">
                  <div className="stat-bar-wrap">
                    <span className="bar-label">STA</span>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${idol.currentStamina || 100}%`, background: '#5CE1A0' }} /></div>
                    <span className="bar-val">{idol.currentStamina || 100}</span>
                  </div>
                  <div className="stat-bar-wrap">
                    <span className="bar-label">FAT</span>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${idol.fatigue || 0}%`, background: idol.fatigue > 75 ? '#FF5470' : '#FF6B9D' }} /></div>
                    <span className="bar-val">{idol.fatigue || 0}</span>
                  </div>
                  <div className="stat-bar-wrap">
                    <span className="bar-label">LOY</span>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${idol.loyalty || 80}%`, background: idol.loyalty < 35 ? '#FF5470' : '#FFD700' }} /></div>
                    <span className="bar-val">{idol.loyalty || 80}</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="idol-card-footer mt-2 flex justify-between items-center">
                  <div className="tiny text-lav">
                    Salary: {formatMoney(idol.contract?.salaryWeekly)}/wk
                  </div>
                  <div className="flex gap-1">
                    {idol.loyalty < 40 && (
                      <button
                        className="btn-gold small"
                        onClick={() => handleOfferRetention(idol)}
                        title={`Offer ₩${retentionCost.toLocaleString()} bonus to restore loyalty`}
                      >
                        RETAIN
                      </button>
                    )}
                    <button
                      className="btn-primary small"
                      onClick={() => handleOpenProfile(idol)}
                    >
                      DOSSIER
                    </button>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ── 3. Detailed Idol Profile Modal ────────────────────────────── */}
      {selectedIdol && (
        <div className="modal-backdrop" onClick={() => setSelectedIdol(null)}>
          <div className="modal-box idol-dossier-modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">IDOL PROFILE: {selectedIdol.name}</h2>

            <div className="flex gap-2">
              <div className="portrait big">
                <img src={assetUrl(selectedIdol.portrait)} alt={selectedIdol.name} />
              </div>
              <div className="modal-info-block">
                <div className="stage-name-edit-row">
                  {editingStageName ? (
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={newStageName}
                        onChange={e => setNewStageName(e.target.value)}
                        maxLength={20}
                        style={{ padding: '4px', fontSize: '10px' }}
                      />
                      <button className="btn-primary small" onClick={handleSaveStageName}>SAVE</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span>Stage Name: <strong>"{selectedIdol.stageName}"</strong></span>
                      <button className="btn-primary small" onClick={() => setEditingStageName(true)}>RENAME</button>
                    </div>
                  )}
                </div>
                <div>Age: <strong>{selectedIdol.age} (Born Month {selectedIdol.birthMonth})</strong></div>
                <div>Nationality: <strong>{selectedIdol.nationality} · {selectedIdol.gender}</strong></div>
                <div>Specialty: <strong className="text-gold">{selectedIdol.specialty}</strong></div>
                <div>Personality: <strong className="text-pink">{selectedIdol.personality}</strong></div>
                <div>Potential: <strong className="text-green">{selectedIdol.potential}-Grade</strong></div>
                <div>Calculated Tier: <strong className="text-gold">{selectedIdol.tier} ({selectedIdol.overallScore} pts)</strong></div>
                <div>Individual Popularity: <strong>{selectedIdol.popularity} / 100</strong></div>
                <div>Personal Fanbase: <strong>{selectedIdol.fanbase?.toLocaleString() || 0} fans</strong></div>
              </div>
            </div>

            {/* Stats Breakdown */}
            <div className="stats-breakdown-section mt-2">
              <div className="small text-pink mb-1">SKILL STATS ATTRIBUTES (0–100)</div>
              <div className="stats-2col-grid">
                {Object.entries(selectedIdol.stats || {}).map(([statKey, val]) => (
                  <div key={statKey} className="stat-bar-wrap">
                    <span className="bar-label" style={{ width: '48px', textTransform: 'capitalize' }}>{statKey}</span>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${val}%` }} /></div>
                    <span className="bar-val">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contract Info */}
            <div className="cost-preview mt-2">
              <div>Contract Status: <strong>{selectedIdol.contract?.status || 'Active'}</strong></div>
              <div>Remaining Duration: <strong>{selectedIdol.contract?.remainingWeeks || 52} weeks</strong></div>
              <div>Weekly Salary: <strong>{formatMoney(selectedIdol.contract?.salaryWeekly)} / week</strong></div>
            </div>

            {/* Loyalty & Retention */}
            <div className="retention-section mt-2">
              <div className="flex justify-between items-center mb-1">
                <span>Loyalty: <strong className={selectedIdol.loyalty < 35 ? 'text-red' : 'text-green'}>{selectedIdol.loyalty}%</strong></span>
                <span>Times Retained: {selectedIdol.retentionCount || 0}</span>
              </div>
              <button
                className="btn-gold"
                style={{ width: '100%', textAlign: 'center' }}
                onClick={() => handleOfferRetention(selectedIdol)}
                disabled={state.money < calculateRetentionCost(selectedIdol)}
              >
                OFFER RETENTION BONUS ({formatMoney(calculateRetentionCost(selectedIdol))})
              </button>
            </div>

            {/* Actions */}
            <div className="flex justify-between mt-3">
              <button
                className="btn-danger"
                onClick={() => setDismissConfirmIdol(selectedIdol)}
              >
                ⚠️ DISMISS FROM AGENCY
              </button>
              <button className="btn-primary" onClick={() => setSelectedIdol(null)}>
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. Permanent Dismissal Confirmation Modal ─────────────────── */}
      {dismissConfirmIdol && (
        <div className="modal-backdrop" onClick={() => setDismissConfirmIdol(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title text-red">⚠️ PERMANENT AGENCY DISMISSAL</h2>
            <p className="small mb-2">
              Are you sure you want to permanently dismiss <strong>{dismissConfirmIdol.name}</strong> from the agency?
            </p>
            <div className="cost-preview text-red mb-2">
              <p>• The idol will permanently leave and cannot be re-recruited.</p>
              <p>• They will NOT return to the trainee pool.</p>
              <p>• Group loyalty will drop significantly.</p>
              <p>• Company reputation will suffer a penalty.</p>
              <p>• This action is permanent and irreversible.</p>
            </div>

            <div className="flex justify-between">
              <button className="btn-primary" onClick={() => setDismissConfirmIdol(null)}>
                CANCEL
              </button>
              <button className="btn-danger" onClick={handlePermanentDismissal}>
                CONFIRM PERMANENT DISMISSAL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
