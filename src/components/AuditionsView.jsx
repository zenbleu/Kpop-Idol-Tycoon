/**
 * AuditionsView.jsx — Talent scouting and idol recruitment interface.
 * Money Auditions (Streets, Domestic, International, Global)
 * and Ruby Auditions (1w [F-D], 3w [D-C], 1m [C-B], 2m [A]).
 */

import React, { useState } from 'react'
import { useGame, ACTION } from '../game/state.jsx'
import { AUDITION_TYPES, RUBY_AUDITIONS, generateAuditionCandidates, generateRubyAuditionCandidates } from '../game/idols.js'
import { assetUrl } from '../lib/assets.js'
import { playSfx } from '../game/audio.js'

export default function AuditionsView() {
  const { state, dispatch } = useGame()
  const [activeTab, setActiveTab] = useState('money') // 'money' | 'ruby'
  const [selectedMoneyType, setSelectedMoneyType] = useState('Streets')
  const [rubyGender, setRubyGender] = useState('Male')
  const [rubyDuration, setRubyDuration] = useState('1_week')
  const [currentCandidates, setCurrentCandidates] = useState([])
  const [inspectingCandidate, setInspectingCandidate] = useState(null)

  const formatMoney = (val) => '₩' + Math.max(0, val || 0).toLocaleString()

  const capacity = state.auditionCandidateCapacity || 2

  // Run Money Audition
  const handleRunMoneyAudition = (typeKey) => {
    const config = AUDITION_TYPES[typeKey]
    if (!config) return

    if (state.money < config.cost) {
      dispatch({ type: ACTION.PUSH_TOAST, toast: { message: 'Insufficient funds for this audition!', variant: 'red' } })
      playSfx('buzz')
      return
    }

    playSfx('coin')
    const candidates = generateAuditionCandidates(typeKey, capacity)
    setCurrentCandidates(candidates)
  }

  // Run Ruby Audition
  const handleRunRubyAudition = () => {
    const config = RUBY_AUDITIONS[rubyDuration]
    if (!config) return

    if (state.rubies < config.rubyCost) {
      dispatch({ type: ACTION.PUSH_TOAST, toast: { message: 'Not enough rubies 💎!', variant: 'red' } })
      playSfx('buzz')
      return
    }

    playSfx('coin')
    dispatch({
      type: ACTION.BUY_UPGRADE, // deduct rubies
      upgradeId: `ruby_spent_${Date.now()}`,
    })
    const candidates = generateRubyAuditionCandidates(rubyDuration, capacity, rubyGender)
    setCurrentCandidates(candidates)
  }

  // Recruit candidate
  const handleRecruit = (candidate) => {
    if (state.money < candidate.signingCost) {
      dispatch({ type: ACTION.PUSH_TOAST, toast: { message: 'Insufficient funds to pay signing bonus!', variant: 'red' } })
      playSfx('buzz')
      return
    }

    playSfx('fanfare')
    dispatch({
      type: ACTION.RECRUIT_IDOL,
      idol: candidate,
      cost: candidate.signingCost,
    })

    // Remove recruited idol from current candidates
    setCurrentCandidates(prev => prev.filter(c => c.id !== candidate.id))
    if (inspectingCandidate?.id === candidate.id) setInspectingCandidate(null)
  }

  const handleDismissCandidate = (candidateId) => {
    playSfx('click')
    setCurrentCandidates(prev => prev.filter(c => c.id !== candidateId))
    if (inspectingCandidate?.id === candidateId) setInspectingCandidate(null)
  }

  return (
    <div className="auditions-container">
      {/* ── 1. Audition Type Selector ───────────────────────────────── */}
      <div className="panel">
        <div className="panel-title flex items-center justify-between">
          <span>✨ TALENT AUDITION DESK</span>
          <span className="small text-gold">CANDIDATE CAPACITY: {capacity} SLOTS</span>
        </div>

        <div className="seg mb-2">
          <button
            className={activeTab === 'money' ? 'sel' : ''}
            onClick={() => {
              playSfx('click')
              setActiveTab('money')
            }}
          >
            💰 AGENCY CAPITAL AUDITIONS (₩)
          </button>
          <button
            className={activeTab === 'ruby' ? 'sel' : ''}
            onClick={() => {
              playSfx('click')
              setActiveTab('ruby')
            }}
          >
            💎 PREMIUM RUBY RECRUITMENT
          </button>
        </div>

        {/* Tab A: Money Auditions */}
        {activeTab === 'money' && (
          <div className="money-auditions-grid">
            {Object.entries(AUDITION_TYPES).map(([key, config]) => {
              const isUnlocked = key === 'Streets' ||
                (key === 'Domestic' && state.unlockedDomesticAuditions) ||
                (key === 'International' && state.unlockedInternationalAuditions) ||
                (key === 'Global' && state.unlockedGlobalAuditions)
              const canAfford = state.money >= config.cost

              return (
                <div key={key} className={`audition-card ${isUnlocked ? '' : 'locked'}`}>
                  <div className="audition-header">
                    <strong>{config.name}</strong>
                    <span className="tag-chip text-gold">{config.tierRange} TIER</span>
                  </div>
                  <p className="tiny text-lav mt-1">{config.description}</p>
                  <div className="audition-cost mt-1">
                    Cost: <strong className="text-gold">{formatMoney(config.cost)}</strong>
                  </div>

                  <button
                    className={`btn-primary mt-2 ${canAfford && isUnlocked ? '' : 'btn-disabled'}`}
                    disabled={!isUnlocked || !canAfford}
                    onClick={() => handleRunMoneyAudition(key)}
                  >
                    {!isUnlocked ? '🔒 LOCKED (UPGRADE REQ)' : (canAfford ? `SCOUT ${capacity} CANDIDATES` : 'INSUFFICIENT FUNDS')}
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {/* Tab B: Ruby Auditions */}
        {activeTab === 'ruby' && (
          <div className="ruby-auditions-panel">
            <p className="small text-lav mb-2">
              Private scouts target vetted talents with high potential. Durations determine the intended candidate tier bracket (max tier is A).
            </p>

            <div className="ruby-settings-row mb-2">
              <div className="field">
                <label>SCOUT GENDER</label>
                <div className="seg">
                  <button
                    className={rubyGender === 'Male' ? 'sel' : ''}
                    onClick={() => setRubyGender('Male')}
                  >
                    MALE IDOLS
                  </button>
                  <button
                    className={rubyGender === 'Female' ? 'sel' : ''}
                    onClick={() => setRubyGender('Female')}
                  >
                    FEMALE IDOLS
                  </button>
                </div>
              </div>
            </div>

            <div className="ruby-durations-grid">
              {Object.entries(RUBY_AUDITIONS).map(([key, config]) => {
                const isSelected = rubyDuration === key
                const canAfford = state.rubies >= config.rubyCost

                return (
                  <div
                    key={key}
                    className={`ruby-plan-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      playSfx('click')
                      setRubyDuration(key)
                    }}
                  >
                    <div className="ruby-card-title">
                      <strong>{config.name}</strong>
                      <span className="text-pink">💎 {config.rubyCost}</span>
                    </div>
                    <div className="tag-chip text-gold mt-1">Expected: {config.tierRange} Tier</div>
                    <p className="tiny text-lav mt-1">{config.description}</p>
                  </div>
                )
              })}
            </div>

            <div className="mt-3">
              <button
                className="btn-gold"
                disabled={state.rubies < (RUBY_AUDITIONS[rubyDuration]?.rubyCost || 0)}
                onClick={handleRunRubyAudition}
              >
                💎 DISPATCH PRIVATE SCOUT ({RUBY_AUDITIONS[rubyDuration]?.rubyCost} RUBIES)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── 2. Candidate Pool Results ─────────────────────────────────── */}
      {currentCandidates.length > 0 && (
        <div className="panel mt-2">
          <div className="panel-title flex items-center justify-between">
            <span>📋 AUDITION CANDIDATES ({currentCandidates.length} AVAILABLE)</span>
            <span className="small text-lav">INSPECT OR SIGN</span>
          </div>

          <div className="candidates-grid">
            {currentCandidates.map(candidate => (
              <div key={candidate.id} className="candidate-card">
                <div className="candidate-portrait-row">
                  <div className="portrait">
                    <img
                      src={assetUrl(candidate.portrait)}
                      alt={candidate.name}
                      onError={(e) => {
                        e.target.style.display = 'none'
                        e.target.parentNode.classList.add('broken-img-fallback')
                      }}
                    />
                    <div className="fallback">🎤</div>
                  </div>
                  <div className="candidate-summary">
                    <div className="candidate-name-row">
                      <strong className="text-white">{candidate.name}</strong>
                      <span className="tier-tag" style={{ color: candidate.tier === 'P' ? '#FFD700' : (candidate.tier === 'S' ? '#FF6B9D' : '#C084FC') }}>
                        {candidate.tier}-TIER
                      </span>
                    </div>
                    <div className="tiny text-lav">Stage: "{candidate.stageName}" · Age: {candidate.age}</div>
                    <div className="tiny text-lav">{candidate.nationality} · {candidate.gender}</div>
                    <div className="tiny text-gold">Specialty: {candidate.specialty}</div>
                    <div className="tiny text-pink">Personality: {candidate.personality}</div>
                    <div className="tiny text-green">Potential: {candidate.potential}-Grade</div>
                  </div>
                </div>

                {/* Main Stats bars */}
                <div className="candidate-mini-stats mt-2">
                  <div className="stat-bar-wrap">
                    <span className="bar-label">VOC</span>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${candidate.stats?.vocal || 50}%` }} /></div>
                    <span className="bar-val">{candidate.stats?.vocal || 50}</span>
                  </div>
                  <div className="stat-bar-wrap">
                    <span className="bar-label">DAN</span>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${candidate.stats?.dance || 50}%` }} /></div>
                    <span className="bar-val">{candidate.stats?.dance || 50}</span>
                  </div>
                  <div className="stat-bar-wrap">
                    <span className="bar-label">RAP</span>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${candidate.stats?.rap || 50}%` }} /></div>
                    <span className="bar-val">{candidate.stats?.rap || 50}</span>
                  </div>
                  <div className="stat-bar-wrap">
                    <span className="bar-label">VIS</span>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${candidate.visual || 50}%` }} /></div>
                    <span className="bar-val">{candidate.visual || 50}</span>
                  </div>
                </div>

                <div className="candidate-footer mt-2">
                  <div className="signing-cost-text">
                    Signing: <strong className="text-gold">{formatMoney(candidate.signingCost)}</strong>
                  </div>
                  <div className="candidate-btn-group">
                    <button
                      className="btn-primary small"
                      onClick={() => setInspectingCandidate(candidate)}
                    >
                      DETAILS
                    </button>
                    <button
                      className="btn-gold small"
                      onClick={() => handleRecruit(candidate)}
                      disabled={state.money < candidate.signingCost}
                    >
                      SIGN
                    </button>
                    <button
                      className="btn-danger small"
                      onClick={() => handleDismissCandidate(candidate.id)}
                    >
                      PASS
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Candidate Detailed Inspection Modal */}
      {inspectingCandidate && (
        <div className="modal-backdrop" onClick={() => setInspectingCandidate(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">CANDIDATE DOSSIER: {inspectingCandidate.name}</h2>
            <div className="flex gap-2">
              <div className="portrait big">
                <img
                  src={assetUrl(inspectingCandidate.portrait)}
                  alt={inspectingCandidate.name}
                />
              </div>
              <div className="modal-details">
                <div>Stage Name: <strong>{inspectingCandidate.stageName}</strong></div>
                <div>Age: <strong>{inspectingCandidate.age} (Born Month {inspectingCandidate.birthMonth})</strong></div>
                <div>Nationality: <strong>{inspectingCandidate.nationality}</strong></div>
                <div>Specialty: <strong className="text-gold">{inspectingCandidate.specialty}</strong></div>
                <div>Personality: <strong className="text-pink">{inspectingCandidate.personality}</strong></div>
                <div>Potential: <strong className="text-green">{inspectingCandidate.potential}-Grade</strong></div>
                <div>Visual Rating: <strong className="text-gold">{inspectingCandidate.visual} / 100</strong></div>
                <div>Calculated Tier: <strong className="text-pink">{inspectingCandidate.tier} ({inspectingCandidate.overallScore} pts)</strong></div>
              </div>
            </div>

            <div className="all-stats-breakdown mt-2">
              <div className="small text-pink mb-1">ALL SKILL STATS (0–100)</div>
              <div className="stats-2col-grid">
                {Object.entries(inspectingCandidate.stats || {}).map(([statName, val]) => (
                  <div key={statName} className="stat-bar-wrap">
                    <span className="bar-label" style={{ width: '48px', textTransform: 'capitalize' }}>{statName}</span>
                    <div className="bar-track"><div className="bar-fill" style={{ width: `${val}%` }} /></div>
                    <span className="bar-val">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="cost-preview mt-2">
              <div>Signing Bonus: <strong className="text-gold">{formatMoney(inspectingCandidate.signingCost)}</strong></div>
              <div>Starting Salary: <strong className="text-lav">{formatMoney(inspectingCandidate.contract?.salaryWeekly)} / week</strong></div>
            </div>

            <div className="flex justify-between mt-2">
              <button className="btn-danger" onClick={() => setInspectingCandidate(null)}>CLOSE</button>
              <button
                className="btn-gold"
                onClick={() => handleRecruit(inspectingCandidate)}
                disabled={state.money < inspectingCandidate.signingCost}
              >
                SIGN TO TRAINEE ROSTER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
