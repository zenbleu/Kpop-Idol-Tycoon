/**
 * TitleScreen.jsx — Retro pixel game start and company creation screen.
 * Allows player to name their agency, CEO, pick an emblem, and start.
 */

import React, { useState } from 'react'
import { useGame, ACTION } from '../game/state.jsx'
import { inspectSaveSlots, loadGameFromStorage } from '../game/save.js'
import { playSfx } from '../game/audio.js'

const LOGO_STYLES = [
  { id: 'neon_star', icon: '⭐', name: 'Neon Star', color: '#FF6B9D' },
  { id: 'cyber_heart', icon: '💖', name: 'Cyber Heart', color: '#FF5470' },
  { id: 'royal_crown', icon: '👑', name: 'Royal Crown', color: '#FFD700' },
  { id: 'galaxy_blossom', icon: '🌸', name: 'Galaxy Blossom', color: '#C084FC' },
  { id: 'retro_diamond', icon: '💎', name: 'Retro Diamond', color: '#6BC5FF' },
]

export default function TitleScreen({ onStartComplete }) {
  const { dispatch } = useGame()
  const [companyName, setCompanyName] = useState('StarLight Entertainment')
  const [ceoName, setCeoName] = useState('Producer Jin')
  const [logoStyle, setLogoStyle] = useState('neon_star')
  const [description, setDescription] = useState('A visionary agency dedicated to scouting raw talent and dominating global music charts.')
  const [includeTutorial, setIncludeTutorial] = useState(true)
  const [showLoadModal, setShowLoadModal] = useState(false)

  const slots = inspectSaveSlots()
  const hasExistingSaves = slots.some(s => s.exists)

  const handleStart = (e) => {
    e.preventDefault()
    if (!companyName.trim()) return

    playSfx('fanfare')
    dispatch({
      type: ACTION.START_NEW_GAME,
      companyName: companyName.trim(),
      ceoName: ceoName.trim() || 'CEO',
      logoStyle,
      description: description.trim(),
      tutorialCompleted: !includeTutorial,
    })

    if (onStartComplete) onStartComplete()
  }

  const handleLoadSlot = (slot) => {
    playSfx('click')
    const loaded = loadGameFromStorage(slot)
    if (loaded) {
      dispatch({ type: ACTION.LOAD_SAVE, saveData: loaded })
      if (onStartComplete) onStartComplete()
    }
  }

  return (
    <div className="title-screen-container">
      <div className="title-pixel-card">
        {/* Banner Header */}
        <div className="title-banner">
          <div className="title-kpop-icon">🎤</div>
          <h1 className="title-main-heading">K-POP IDOL TYCOON</h1>
          <p className="title-sub-heading">ENT. AGENCY MANAGEMENT SIMULATOR</p>
        </div>

        {/* Form Container */}
        <form onSubmit={handleStart} className="company-creation-form">
          <div className="field">
            <label htmlFor="company-name-input">ENTERTAINMENT AGENCY NAME</label>
            <input
              id="company-name-input"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. StarLight Entertainment"
              required
              maxLength={30}
            />
          </div>

          <div className="field">
            <label htmlFor="ceo-name-input">CEO / PRODUCER NAME</label>
            <input
              id="ceo-name-input"
              type="text"
              value={ceoName}
              onChange={(e) => setCeoName(e.target.value)}
              placeholder="e.g. Producer Jin"
              required
              maxLength={24}
            />
          </div>

          <div className="field">
            <label>AGENCY EMBLEM & THEME</label>
            <div className="emblem-selector-grid">
              {LOGO_STYLES.map(style => (
                <button
                  type="button"
                  key={style.id}
                  className={`emblem-btn ${logoStyle === style.id ? 'active' : ''}`}
                  onClick={() => {
                    playSfx('click')
                    setLogoStyle(style.id)
                  }}
                  style={{
                    borderColor: logoStyle === style.id ? style.color : '#3A2666',
                    boxShadow: logoStyle === style.id ? `0 0 12px ${style.color}` : 'none',
                  }}
                >
                  <span className="emblem-emoji">{style.icon}</span>
                  <span className="emblem-text">{style.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label htmlFor="company-desc-input">AGENCY VISION & CONCEPT</label>
            <textarea
              id="company-desc-input"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Agency vision statement..."
              maxLength={120}
            />
          </div>

          <div className="tutorial-checkbox-row">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={includeTutorial}
                onChange={(e) => setIncludeTutorial(e.target.checked)}
              />
              <span>Enable interactive starter guide & hints</span>
            </label>
          </div>

          <div className="starting-resources-box">
            <div className="res-title">STARTING CAPITAL & STATUS</div>
            <div className="res-grid">
              <div className="res-item"><span>Capital:</span> <strong>₩100,000,000</strong></div>
              <div className="res-item"><span>Rubies:</span> <strong>100 💎</strong></div>
              <div className="res-item"><span>Tier:</span> <strong>F (Basement)</strong></div>
              <div className="res-item"><span>Reputation:</span> <strong>Local</strong></div>
            </div>
          </div>

          <div className="title-actions">
            <button type="submit" className="btn-primary btn-found">
              ✨ FOUND ENTERTAINMENT AGENCY
            </button>
            {hasExistingSaves && (
              <button
                type="button"
                className="btn-gold btn-load-title"
                onClick={() => setShowLoadModal(true)}
              >
                📂 LOAD EXISTING GAME
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Load Save Modal */}
      {showLoadModal && (
        <div className="modal-backdrop" onClick={() => setShowLoadModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">SELECT SAVE FILE</h2>
            <div className="save-slots-list">
              {slots.filter(s => s.exists).map(s => (
                <div key={s.slot} className="save-slot-card">
                  <div className="save-slot-header">
                    <strong>{s.slot === 'auto' ? 'AUTOSAVE' : `SLOT ${s.slot}`}</strong>
                    <span className="save-date">
                      {s.lastSaved ? new Date(s.lastSaved).toLocaleDateString() : '—'}
                    </span>
                  </div>
                  <div className="save-slot-body">
                    <div>{s.companyName} ({s.companyTier} Tier)</div>
                    <div className="small text-gold">₩{s.money?.toLocaleString()} · {s.idolsCount} Idols · {s.groupsCount} Groups</div>
                    <div className="tiny text-lav">Year {s.year} · Month {s.month} · Week {s.week}</div>
                  </div>
                  <button
                    className="btn-primary mt-1"
                    onClick={() => handleLoadSlot(s.slot)}
                  >
                    ▶ LOAD THIS GAME
                  </button>
                </div>
              ))}
            </div>
            <button
              className="btn-danger mt-2"
              onClick={() => setShowLoadModal(false)}
            >
              CLOSE
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
