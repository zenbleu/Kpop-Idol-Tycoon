/**
 * AuditionsView.jsx — Talent scouting and idol recruitment interface.
 * Hybrid compact layout: responsive 4-column audition tier cards,
 * compact candidate cards grid, and a full Candidate Dossier inspection modal.
 */

import React, { useState } from 'react'
import { useGame, ACTION } from '../game/state.jsx'
import { AUDITION_TYPES, RUBY_AUDITIONS, generateAuditionCandidates, generateRubyAuditionCandidates } from '../game/idols.js'
import { getAssetPath } from '../lib/assets.js'
import { playSfx } from '../game/audio.js'

export default function AuditionsView() {
  const { state, dispatch } = useGame()
  const [activeTab, setActiveTab] = useState('money') // 'money' | 'ruby'
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
      type: ACTION.BUY_UPGRADE,
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

    setCurrentCandidates(prev => prev.filter(c => c.id !== candidate.id))
    if (inspectingCandidate?.id === candidate.id) setInspectingCandidate(null)
  }

  const handleDismissCandidate = (candidateId) => {
    playSfx('click')
    setCurrentCandidates(prev => prev.filter(c => c.id !== candidateId))
    if (inspectingCandidate?.id === candidateId) setInspectingCandidate(null)
  }

  return (
    <div className="space-y-5">
      {/* ── 1. Top Control Bar ───────────────────────────────────────── */}
      <div className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h2 className="text-lg md:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-300 font-pixel">
              TALENT AUDITIONS DESK
            </h2>
          </div>
          <p className="text-xs text-purple-200 mt-1 font-pixel leading-relaxed">
            Scout prospective trainees across regional street castings, domestic auditions, and premium global talent pipelines.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-pixel text-yellow-300 bg-[#2d1b4e] px-3 py-2 rounded-lg border border-yellow-500/30 whitespace-nowrap">
            Scout Slots: {capacity} Candidates
          </span>
          <div className="flex bg-[#120b24] p-1 rounded-xl border border-[#442f70]">
            <button
              onClick={() => {
                playSfx('click')
                setActiveTab('money')
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-pixel transition-all ${
                activeTab === 'money'
                  ? 'bg-yellow-500 text-black font-bold shadow-md'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              Agency (₩)
            </button>
            <button
              onClick={() => {
                playSfx('click')
                setActiveTab('ruby')
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-pixel transition-all ${
                activeTab === 'ruby'
                  ? 'bg-pink-600 text-white font-bold shadow-md'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              💎 Ruby Scout
            </button>
          </div>
        </div>
      </div>

      {/* ── 2. Audition Method Panel ─────────────────────────────────── */}
      {activeTab === 'money' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {Object.entries(AUDITION_TYPES).map(([key, config]) => {
            const isUnlocked = key === 'Streets' ||
              (key === 'Domestic' && state.unlockedDomesticAuditions) ||
              (key === 'International' && state.unlockedInternationalAuditions) ||
              (key === 'Global' && state.unlockedGlobalAuditions)
            const canAfford = state.money >= config.cost

            return (
              <div
                key={key}
                className={`bg-[#1e1338] border-2 rounded-xl p-3.5 flex flex-col justify-between transition-all ${
                  !isUnlocked
                    ? 'border-[#382856] opacity-60'
                    : 'border-[#543b8a] hover:border-yellow-400 shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-white font-pixel truncate">
                      {config.name}
                    </span>
                    <span className="text-[10px] font-pixel text-yellow-300 bg-yellow-950/70 border border-yellow-500/40 px-1.5 py-0.5 rounded flex-shrink-0">
                      {config.tierRange} Tier
                    </span>
                  </div>

                  <p className="text-[10px] text-purple-300 font-pixel line-clamp-2 min-h-[28px] leading-relaxed">
                    {config.description}
                  </p>

                  <div className="mt-2 text-[11px] font-pixel text-yellow-300 bg-[#120b24] p-2 rounded-lg border border-[#3b2462] flex justify-between items-center">
                    <span className="text-purple-400 text-[10px]">Fee:</span>
                    <span className="font-bold">{formatMoney(config.cost)}</span>
                  </div>
                </div>

                <button
                  disabled={!isUnlocked || !canAfford}
                  onClick={() => handleRunMoneyAudition(key)}
                  className={`mt-3 w-full py-2 px-2 rounded-lg text-[10px] font-pixel border transition-all ${
                    !isUnlocked
                      ? 'bg-[#1b1236] border-[#382856] text-purple-500 cursor-not-allowed'
                      : canAfford
                      ? 'bg-yellow-500 hover:bg-yellow-400 text-black border-yellow-300 font-bold shadow-md active:scale-95'
                      : 'bg-[#241744] border-red-500/40 text-red-300 cursor-not-allowed'
                  }`}
                >
                  {!isUnlocked ? '🔒 Locked (HQ Upgrade)' : canAfford ? `Scout ${capacity} Candidates` : 'Insufficient Funds'}
                </button>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-4 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#3b2762]">
            <div>
              <h3 className="text-xs font-bold text-pink-300 font-pixel">
                💎 HEADHUNTER PRIVATE SCOUTING SERVICE
              </h3>
              <p className="text-[10px] text-purple-300 font-pixel mt-0.5">
                Target vetted elite talents with guaranteed potential (Max bracket: A-Tier).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-pixel text-purple-300">Gender Target:</span>
              <div className="flex bg-[#120b24] p-0.5 rounded-lg border border-[#442f70]">
                <button
                  onClick={() => setRubyGender('Male')}
                  className={`px-2.5 py-1 rounded text-[10px] font-pixel transition-colors ${
                    rubyGender === 'Male' ? 'bg-blue-600 text-white font-bold' : 'text-purple-300 hover:text-white'
                  }`}
                >
                  Male
                </button>
                <button
                  onClick={() => setRubyGender('Female')}
                  className={`px-2.5 py-1 rounded text-[10px] font-pixel transition-colors ${
                    rubyGender === 'Female' ? 'bg-pink-600 text-white font-bold' : 'text-purple-300 hover:text-white'
                  }`}
                >
                  Female
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(RUBY_AUDITIONS).map(([key, config]) => {
              const isSelected = rubyDuration === key
              const canAfford = state.rubies >= config.rubyCost

              return (
                <div
                  key={key}
                  onClick={() => {
                    playSfx('click')
                    setRubyDuration(key)
                  }}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-pink-950/70 border-pink-400 shadow-md ring-2 ring-pink-500/30'
                      : 'bg-[#241744] border-[#442f70] hover:border-pink-400/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-xs font-pixel text-white">{config.name}</strong>
                      <span className="text-[11px] font-pixel text-pink-400 font-bold">
                        💎 {config.rubyCost}
                      </span>
                    </div>
                    <span className="inline-block text-[9px] font-pixel text-yellow-300 bg-yellow-950/70 border border-yellow-500/40 px-1.5 py-0.2 rounded mt-1">
                      Expected: {config.tierRange} Tier
                    </span>
                    <p className="text-[10px] text-purple-300 font-pixel mt-2 leading-relaxed">
                      {config.description}
                    </p>
                  </div>
                  <div className="mt-3 text-right">
                    <span className={`text-[10px] font-pixel ${isSelected ? 'text-pink-300 font-bold' : 'text-purple-400'}`}>
                      {isSelected ? '✓ SELECTED' : 'Click to Select'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={handleRunRubyAudition}
              disabled={state.rubies < (RUBY_AUDITIONS[rubyDuration]?.rubyCost || 0)}
              className="py-2.5 px-6 rounded-xl text-xs font-pixel bg-pink-600 hover:bg-pink-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold border-2 border-pink-400 shadow-lg transition-all active:scale-95"
            >
              💎 DISPATCH SCOUT ({RUBY_AUDITIONS[rubyDuration]?.rubyCost || 0} RUBIES)
            </button>
          </div>
        </div>
      )}

      {/* ── 3. Candidate Pool Results ─────────────────────────────────── */}
      {currentCandidates.length > 0 && (
        <div className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-4 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#3b2762]">
            <div className="flex items-center gap-2">
              <span className="text-base">📋</span>
              <h3 className="text-xs sm:text-sm font-bold text-white font-pixel">
                AUDITION CANDIDATES POOL ({currentCandidates.length} AVAILABLE)
              </h3>
            </div>
            <button
              onClick={() => setCurrentCandidates([])}
              className="text-[10px] font-pixel text-purple-400 hover:text-red-300 underline"
            >
              Dismiss All
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {currentCandidates.map(candidate => {
              const canAffordSigning = state.money >= candidate.signingCost
              const tierColor = candidate.tier === 'P' ? 'text-yellow-400 border-yellow-500/50 bg-yellow-950/70'
                : candidate.tier === 'S' ? 'text-pink-400 border-pink-500/50 bg-pink-950/70'
                : candidate.tier === 'A' ? 'text-purple-300 border-purple-500/50 bg-purple-950/70'
                : 'text-blue-300 border-blue-500/50 bg-blue-950/70'

              return (
                <div
                  key={candidate.id}
                  className="bg-[#241744] border border-[#442f70] rounded-xl p-3 flex flex-col justify-between hover:border-yellow-400/50 transition-colors shadow-md"
                >
                  <div>
                    {/* Header: Portrait + Basic Info */}
                    <div className="flex items-start gap-3">
                      <img
                        src={getAssetPath(candidate.portrait)}
                        alt={candidate.name}
                        className="w-14 h-14 rounded-lg object-cover border-2 border-purple-400/50 flex-shrink-0 shadow"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = getAssetPath('/images/actors-portraits/Actor_01.jpg')
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-white font-pixel truncate">
                            {candidate.stageName || candidate.name}
                          </h4>
                          <span className={`text-[9px] font-pixel px-1.5 py-0.2 rounded border ${tierColor} flex-shrink-0`}>
                            {candidate.tier}-Tier
                          </span>
                        </div>
                        <div className="text-[10px] text-purple-300 font-pixel mt-0.5 truncate">
                          {candidate.name} · {candidate.age}y · {candidate.nationality}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          <span className="text-[9px] font-pixel text-yellow-300 bg-yellow-950/50 border border-yellow-600/30 px-1 rounded">
                            {candidate.specialty}
                          </span>
                          <span className="text-[9px] font-pixel text-emerald-300 bg-emerald-950/50 border border-emerald-600/30 px-1 rounded">
                            Pot: {candidate.potential}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Mini Stats 2x2 Grid */}
                    <div className="mt-3 grid grid-cols-2 gap-x-2 gap-y-1 bg-[#120b24] p-2 rounded-lg border border-[#3b2462] text-[9px] font-pixel">
                      <div className="flex items-center justify-between">
                        <span className="text-purple-400">VOC</span>
                        <span className="text-yellow-300 font-bold">{candidate.stats?.vocal || 50}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-purple-400">DAN</span>
                        <span className="text-pink-300 font-bold">{candidate.stats?.dance || 50}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-purple-400">RAP</span>
                        <span className="text-blue-300 font-bold">{candidate.stats?.rap || 50}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-purple-400">VIS</span>
                        <span className="text-emerald-300 font-bold">{candidate.visual || 50}</span>
                      </div>
                    </div>

                    {/* Signing fee */}
                    <div className="mt-2.5 flex items-center justify-between text-[10px] font-pixel px-1">
                      <span className="text-purple-300">Signing Fee:</span>
                      <span className="text-yellow-300 font-bold">{formatMoney(candidate.signingCost)}</span>
                    </div>
                  </div>

                  {/* Actions Button Group */}
                  <div className="mt-3 pt-2 border-t border-[#37235a] flex items-center gap-1.5">
                    <button
                      onClick={() => setInspectingCandidate(candidate)}
                      className="flex-1 py-1.5 rounded-lg text-[9px] font-pixel bg-[#2d1b4e] hover:bg-[#3d2668] text-purple-200 border border-purple-500/40 transition-colors"
                    >
                      Dossier
                    </button>
                    <button
                      onClick={() => handleRecruit(candidate)}
                      disabled={!canAffordSigning}
                      className={`flex-1 py-1.5 rounded-lg text-[9px] font-pixel border font-bold transition-all ${
                        canAffordSigning
                          ? 'bg-yellow-500 hover:bg-yellow-400 text-black border-yellow-300 shadow active:scale-95'
                          : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
                      }`}
                    >
                      Sign
                    </button>
                    <button
                      onClick={() => handleDismissCandidate(candidate.id)}
                      className="px-2 py-1.5 rounded-lg text-[9px] font-pixel bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-700/50 transition-colors"
                      title="Pass Candidate"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── 4. Candidate Detailed Inspection Modal ────────────────────── */}
      {inspectingCandidate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setInspectingCandidate(null)}
        >
          <div
            className="bg-[#1e1338] border-2 border-yellow-500/80 rounded-2xl p-5 max-w-lg w-full shadow-2xl relative space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#3b2762]">
              <div>
                <span className="text-[10px] font-pixel text-yellow-300 bg-yellow-950/70 border border-yellow-500/40 px-2 py-0.5 rounded">
                  {inspectingCandidate.tier}-TIER CANDIDATE
                </span>
                <h3 className="text-base font-bold text-white font-pixel mt-1">
                  {inspectingCandidate.name} ({inspectingCandidate.stageName})
                </h3>
              </div>
              <button
                onClick={() => setInspectingCandidate(null)}
                className="text-purple-300 hover:text-white text-sm font-pixel px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* Profile Overview */}
            <div className="flex items-center gap-4 bg-[#120b24] p-3 rounded-xl border border-[#3b2462]">
              <img
                src={getAssetPath(inspectingCandidate.portrait)}
                alt={inspectingCandidate.name}
                className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl object-cover border-2 border-yellow-400 shadow-md flex-shrink-0"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = getAssetPath('/images/actors-portraits/Actor_01.jpg')
                }}
              />
              <div className="flex-1 grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] font-pixel">
                <div><span className="text-purple-400">Age:</span> <strong className="text-white">{inspectingCandidate.age}y</strong></div>
                <div><span className="text-purple-400">Origin:</span> <strong className="text-white">{inspectingCandidate.nationality}</strong></div>
                <div><span className="text-purple-400">Specialty:</span> <strong className="text-yellow-300">{inspectingCandidate.specialty}</strong></div>
                <div><span className="text-purple-400">Potential:</span> <strong className="text-emerald-400">{inspectingCandidate.potential}-Grade</strong></div>
                <div><span className="text-purple-400">Visual:</span> <strong className="text-pink-400">{inspectingCandidate.visual}/100</strong></div>
                <div><span className="text-purple-400">Personality:</span> <strong className="text-purple-200">{inspectingCandidate.personality}</strong></div>
              </div>
            </div>

            {/* Full Stats Breakdown */}
            <div>
              <span className="text-[10px] font-pixel text-purple-300 block mb-2">
                ASSESSED SKILL ATTRIBUTES (0–100)
              </span>
              <div className="grid grid-cols-2 gap-2 bg-[#120b24] p-3 rounded-xl border border-[#3b2462]">
                {Object.entries(inspectingCandidate.stats || {}).map(([statName, val]) => (
                  <div key={statName} className="space-y-0.5">
                    <div className="flex justify-between text-[9px] font-pixel">
                      <span className="text-purple-400 uppercase">{statName}</span>
                      <span className="text-yellow-300 font-bold">{val}</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#241744] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-pink-500 to-yellow-400 rounded-full" style={{ width: `${val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contract terms */}
            <div className="bg-[#120b24] p-3 rounded-xl border border-[#3b2462] flex items-center justify-between text-[11px] font-pixel">
              <div>
                <span className="text-purple-400 block text-[9px]">Signing Bonus:</span>
                <span className="text-yellow-300 font-bold">{formatMoney(inspectingCandidate.signingCost)}</span>
              </div>
              <div className="text-right">
                <span className="text-purple-400 block text-[9px]">Weekly Wage:</span>
                <span className="text-purple-200 font-bold">{formatMoney(inspectingCandidate.contract?.salaryWeekly)}/wk</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setInspectingCandidate(null)}
                className="px-4 py-2 rounded-xl text-xs font-pixel bg-[#241744] hover:bg-[#342260] text-purple-200 border border-purple-500/40"
              >
                Close
              </button>
              <button
                onClick={() => handleRecruit(inspectingCandidate)}
                disabled={state.money < inspectingCandidate.signingCost}
                className="px-5 py-2 rounded-xl text-xs font-pixel bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-800 disabled:text-gray-500 text-black font-bold border-2 border-yellow-300 shadow-lg"
              >
                Sign Candidate To Trainee Roster
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
