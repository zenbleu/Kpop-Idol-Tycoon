/**
 * AuditionsView.jsx — Modal-First Talent Auditions & Recruitment.
 *
 * Level 1: Main tab is a clean overview of available scouting programs,
 *          tier brackets, costs, and scout slot capacities.
 * Level 2: Dedicated Audition Scout Results Modal where players review
 *          scouted candidates, inspect full dossiers, and negotiate signing contracts.
 * Level 3: Candidate Dossier inspection modal with full assessed skill attributes.
 */

import React, { useState } from 'react'
import { useGame, ACTION } from '../game/state.jsx'
import { AUDITION_TYPES, RUBY_AUDITIONS, generateAuditionCandidates, generateRubyAuditionCandidates } from '../game/idols.js'
import { getAssetPath } from '../lib/assets.js'
import { playSfx } from '../game/audio.js'
import Modal from './ui/Modal.jsx'

export default function AuditionsView() {
  const { state, dispatch } = useGame()
  const [activeTab, setActiveTab] = useState('money') // 'money' | 'ruby'
  const [rubyGender, setRubyGender] = useState('Male')
  const [rubyDuration, setRubyDuration] = useState('1_week')

  // Modal-First: Candidate scouting session opens in a dedicated modal
  const [scoutModalOpen, setScoutModalOpen] = useState(false)
  const [currentCandidates, setCurrentCandidates] = useState([])
  const [activeAuditionName, setActiveAuditionName] = useState('')
  const [inspectingCandidate, setInspectingCandidate] = useState(null)

  const formatMoney = (val) => '₩' + Math.max(0, val || 0).toLocaleString()
  const capacity = state.auditionCandidateCapacity || 2

  // Run Money Audition (Level 2)
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
    setActiveAuditionName(config.name)
    setScoutModalOpen(true)
  }

  // Run Ruby Audition (Level 2)
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
    setActiveAuditionName(`Headhunter (${config.name})`)
    setScoutModalOpen(true)
  }

  // Recruit candidate (Level 3)
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
    <div className="space-y-4 font-pixel">
      {/* ── LEVEL 1: Main Tab Header & Scouting Switcher ───────────────── */}
      <div className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-3.5 sm:p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">✨</span>
            <h2 className="text-sm sm:text-base font-bold text-white">
              TALENT AUDITIONS DESK OVERVIEW
            </h2>
          </div>
          <p className="text-[10px] text-purple-200 mt-0.5">
            Select a scouting program to launch auditions. Candidates will appear in the Auditions Modal.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-[10px] text-yellow-300 bg-[#2d1b4e] px-2.5 py-1.5 rounded-lg border border-yellow-500/30 whitespace-nowrap">
            Scout Slots: {capacity} Candidates
          </span>
          <div className="flex bg-[#120b24] p-1 rounded-xl border border-[#442f70]">
            <button
              type="button"
              onClick={() => {
                playSfx('click')
                setActiveTab('money')
              }}
              className={`px-3 py-1 rounded text-[10px] transition-all ${
                activeTab === 'money'
                  ? 'bg-yellow-500 text-black font-bold shadow'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              Agency (₩)
            </button>
            <button
              type="button"
              onClick={() => {
                playSfx('click')
                setActiveTab('ruby')
              }}
              className={`px-3 py-1 rounded text-[10px] transition-all ${
                activeTab === 'ruby'
                  ? 'bg-pink-600 text-white font-bold shadow'
                  : 'text-purple-300 hover:text-white'
              }`}
            >
              💎 Ruby Scout
            </button>
          </div>
        </div>
      </div>

      {/* ── LEVEL 1: Available Audition Types Grid ──────────────────────── */}
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
                className={`bg-[#1e1338] border-2 rounded-2xl p-3.5 flex flex-col justify-between transition-all ${
                  !isUnlocked
                    ? 'border-[#382856] opacity-60'
                    : 'border-[#543b8a] hover:border-yellow-400 shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-xs text-white truncate">
                      {config.name}
                    </strong>
                    <span className="text-[9px] text-yellow-300 bg-yellow-950/70 border border-yellow-500/40 px-1 py-0.2 rounded font-bold">
                      {config.tierRange} Tier
                    </span>
                  </div>

                  <p className="text-[9px] text-purple-300 line-clamp-2 min-h-[26px] leading-relaxed">
                    {config.description}
                  </p>

                  <div className="mt-2 text-[10px] text-yellow-300 bg-[#120b24] p-2 rounded-lg border border-[#3b2462] flex justify-between items-center">
                    <span className="text-purple-400 text-[9px]">Scout Fee:</span>
                    <strong className="text-yellow-400">{formatMoney(config.cost)}</strong>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!isUnlocked || !canAfford}
                  onClick={() => handleRunMoneyAudition(key)}
                  className={`mt-3 w-full py-2 px-2 rounded-lg text-[9px] border transition-all ${
                    !isUnlocked
                      ? 'bg-[#1b1236] border-[#382856] text-purple-500 cursor-not-allowed'
                      : canAfford
                      ? 'bg-yellow-500 hover:bg-yellow-400 text-black border-yellow-300 font-bold shadow active:scale-95'
                      : 'bg-[#241744] border-red-500/40 text-red-300 cursor-not-allowed'
                  }`}
                >
                  {!isUnlocked ? '🔒 Locked (HQ Upgrade)' : canAfford ? `Scout ${capacity} Candidates →` : 'Insufficient Funds'}
                </button>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-4 shadow-xl space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-[#3b2762]">
            <div>
              <h3 className="text-xs font-bold text-pink-300">
                💎 HEADHUNTER PRIVATE SCOUTING SERVICE
              </h3>
              <p className="text-[9px] text-purple-300 mt-0.5">
                Target vetted elite talents with guaranteed potential (Max bracket: A-Tier).
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[9px] text-purple-300">Gender Target:</span>
              <div className="flex bg-[#120b24] p-0.5 rounded-lg border border-[#442f70]">
                <button
                  type="button"
                  onClick={() => setRubyGender('Male')}
                  className={`px-2.5 py-1 rounded text-[9px] transition-colors ${
                    rubyGender === 'Male' ? 'bg-blue-600 text-white font-bold' : 'text-purple-300 hover:text-white'
                  }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setRubyGender('Female')}
                  className={`px-2.5 py-1 rounded text-[9px] transition-colors ${
                    rubyGender === 'Female' ? 'bg-pink-600 text-white font-bold' : 'text-purple-300 hover:text-white'
                  }`}
                >
                  Female
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {Object.entries(RUBY_AUDITIONS).map(([key, config]) => {
              const isSelected = rubyDuration === key
              return (
                <div
                  key={key}
                  onClick={() => {
                    playSfx('click')
                    setRubyDuration(key)
                  }}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-pink-950/70 border-pink-400 shadow ring-1 ring-pink-500/30'
                      : 'bg-[#241744] border-[#442f70] hover:border-pink-400/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-xs text-white">{config.name}</strong>
                      <span className="text-[10px] text-pink-400 font-bold">
                        💎 {config.rubyCost}
                      </span>
                    </div>
                    <span className="inline-block text-[8px] text-yellow-300 bg-yellow-950/70 border border-yellow-500/40 px-1 py-0.2 rounded mt-0.5">
                      Expected: {config.tierRange} Tier
                    </span>
                    <p className="text-[9px] text-purple-300 mt-1.5 leading-relaxed">
                      {config.description}
                    </p>
                  </div>
                  <div className="mt-2 text-right">
                    <span className={`text-[9px] ${isSelected ? 'text-pink-300 font-bold' : 'text-purple-400'}`}>
                      {isSelected ? '✓ SELECTED' : 'Click to Select'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleRunRubyAudition}
              disabled={state.rubies < (RUBY_AUDITIONS[rubyDuration]?.rubyCost || 0)}
              className="py-2 px-5 rounded-xl text-xs bg-pink-600 hover:bg-pink-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold border-2 border-pink-400 shadow transition-all active:scale-95"
            >
              💎 Dispatch Scout ({RUBY_AUDITIONS[rubyDuration]?.rubyCost || 0} Rubies)
            </button>
          </div>
        </div>
      )}

      {/* ── LEVEL 2: DEDICATED AUDITION CANDIDATES MODAL ──────────────── */}
      {scoutModalOpen && (
        <Modal
          isOpen={scoutModalOpen}
          onClose={() => setScoutModalOpen(false)}
          title={`SCOUTED CANDIDATES: ${activeAuditionName}`}
          subtitle={`${currentCandidates.length} potential trainee candidates seeking agency contracts`}
          icon="📋"
          size="xl"
          borderColor="border-yellow-500"
          footer={
            <div className="flex justify-between items-center gap-3">
              <span className="text-[9px] text-purple-300">
                Available slots: {capacity} | Remaining candidates: {currentCandidates.length}
              </span>
              <button
                type="button"
                onClick={() => {
                  setCurrentCandidates([])
                  setScoutModalOpen(false)
                }}
                className="px-4 py-1.5 rounded-lg text-xs bg-[#241744] hover:bg-[#342260] text-purple-200 border border-purple-500/40"
              >
                Close Session
              </button>
            </div>
          }
        >
          {currentCandidates.length === 0 ? (
            <div className="p-8 text-center text-purple-300">
              <p className="text-xs">All candidates have been evaluated and processed.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                      {/* Identity Row */}
                      <div className="flex items-start gap-2.5">
                        <img
                          src={getAssetPath(candidate.portrait)}
                          alt={candidate.name}
                          className="rounded-lg object-cover border border-purple-400/50 flex-shrink-0 shadow"
                          style={{
                            width: '36px',
                            height: '36px',
                            minWidth: '36px',
                            minHeight: '36px',
                            maxWidth: '36px',
                            maxHeight: '36px',
                            borderRadius: '8px',
                            objectFit: 'cover',
                          }}
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = getAssetPath('/images/actors-portraits/Actor_01.jpg')
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <strong className="text-xs text-white truncate">
                              {candidate.stageName || candidate.name}
                            </strong>
                            <span className={`text-[8px] px-1.5 py-0.2 rounded border ${tierColor} flex-shrink-0 font-bold`}>
                              {candidate.tier}-Tier
                            </span>
                          </div>
                          <div className="text-[9px] text-purple-300 truncate">
                            {candidate.name} · {candidate.age}y · {candidate.nationality}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[8px] text-yellow-300 bg-yellow-950/50 border border-yellow-600/30 px-1 rounded">
                              {candidate.specialty}
                            </span>
                            <span className="text-[8px] text-emerald-300 bg-emerald-950/50 border border-emerald-600/30 px-1 rounded">
                              Pot: {candidate.potential}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Mini Skill Overview */}
                      <div className="mt-2.5 grid grid-cols-4 gap-1 bg-[#120b24] p-1.5 rounded-lg border border-[#3b2462] text-[8px] text-center">
                        <div><span className="text-purple-400 block">VOC</span><strong className="text-yellow-300">{candidate.stats?.vocal || 50}</strong></div>
                        <div><span className="text-purple-400 block">DAN</span><strong className="text-pink-300">{candidate.stats?.dance || 50}</strong></div>
                        <div><span className="text-purple-400 block">RAP</span><strong className="text-blue-300">{candidate.stats?.rap || 50}</strong></div>
                        <div><span className="text-purple-400 block">VIS</span><strong className="text-emerald-300">{candidate.visual || 50}</strong></div>
                      </div>

                      {/* Signing fee */}
                      <div className="mt-2 flex items-center justify-between text-[9px] px-0.5">
                        <span className="text-purple-300">Signing Fee:</span>
                        <strong className="text-yellow-300">{formatMoney(candidate.signingCost)}</strong>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-2.5 pt-2 border-t border-[#37235a] flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setInspectingCandidate(candidate)}
                        className="flex-1 py-1 rounded-lg text-[9px] bg-[#2d1b4e] hover:bg-[#3d2668] text-purple-200 border border-purple-500/40"
                      >
                        Dossier
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRecruit(candidate)}
                        disabled={!canAffordSigning}
                        className={`flex-1 py-1 rounded-lg text-[9px] border font-bold transition-all ${
                          canAffordSigning
                            ? 'bg-yellow-500 hover:bg-yellow-400 text-black border-yellow-300 shadow active:scale-95'
                            : 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
                        }`}
                      >
                        Sign
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDismissCandidate(candidate.id)}
                        className="px-2 py-1 rounded-lg text-[9px] bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-700/50"
                        title="Pass Candidate"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Modal>
      )}

      {/* ── LEVEL 3: CANDIDATE DETAILED DOSSIER INSPECTION MODAL ──────── */}
      {inspectingCandidate && (
        <Modal
          isOpen={!!inspectingCandidate}
          onClose={() => setInspectingCandidate(null)}
          title={`CANDIDATE DOSSIER: ${inspectingCandidate.name}`}
          subtitle={`${inspectingCandidate.tier}-Tier Candidate · Stage Name: ${inspectingCandidate.stageName}`}
          icon="⭐"
          size="md"
          borderColor="border-yellow-500"
          footer={
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setInspectingCandidate(null)}
                className="px-3.5 py-1.5 rounded-lg text-xs bg-[#241744] text-purple-200 border border-purple-500/40"
              >
                Back to Session
              </button>
              <button
                type="button"
                onClick={() => handleRecruit(inspectingCandidate)}
                disabled={state.money < inspectingCandidate.signingCost}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-800 disabled:text-gray-500 text-black border border-yellow-300 shadow"
              >
                Sign Candidate ({formatMoney(inspectingCandidate.signingCost)})
              </button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            {/* Bio Hero */}
            <div className="flex items-center gap-3 bg-[#120b24] p-3 rounded-xl border border-[#3b2462]">
              <img
                src={getAssetPath(inspectingCandidate.portrait)}
                alt={inspectingCandidate.name}
                className="rounded-xl object-cover border-2 border-yellow-400 shadow flex-shrink-0"
                style={{
                  width: '64px',
                  height: '64px',
                  minWidth: '64px',
                  minHeight: '64px',
                  maxWidth: '64px',
                  maxHeight: '64px',
                  borderRadius: '10px',
                  objectFit: 'cover',
                }}
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = getAssetPath('/images/actors-portraits/Actor_01.jpg')
                }}
              />
              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[9px]">
                <div><span className="text-purple-400">Age:</span> <strong className="text-white">{inspectingCandidate.age}y</strong></div>
                <div><span className="text-purple-400">Nationality:</span> <strong className="text-white">{inspectingCandidate.nationality}</strong></div>
                <div><span className="text-purple-400">Specialty:</span> <strong className="text-yellow-300">{inspectingCandidate.specialty}</strong></div>
                <div><span className="text-purple-400">Potential:</span> <strong className="text-emerald-400">{inspectingCandidate.potential}-Grade</strong></div>
                <div><span className="text-purple-400">Visual:</span> <strong className="text-pink-400">{inspectingCandidate.visual}/100</strong></div>
                <div><span className="text-purple-400">Personality:</span> <strong className="text-purple-200">{inspectingCandidate.personality}</strong></div>
              </div>
            </div>

            {/* Full Stats Breakdown */}
            <div className="bg-[#120b24] p-3 rounded-xl border border-[#3b2462] space-y-1.5">
              <span className="text-[9px] text-pink-400 font-bold block uppercase">
                Assessed Skill Attributes (0–100)
              </span>
              <div className="grid grid-cols-2 gap-2 text-[9px]">
                {Object.entries(inspectingCandidate.stats || {}).map(([statName, val]) => (
                  <div key={statName} className="space-y-0.5">
                    <div className="flex justify-between">
                      <span className="text-purple-400 uppercase">{statName}</span>
                      <strong className="text-yellow-300">{val}</strong>
                    </div>
                    <div className="h-1.5 w-full bg-[#241744] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-pink-500 to-yellow-400 rounded-full" style={{ width: `${val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms */}
            <div className="bg-[#120b24] p-2.5 rounded-xl border border-[#3b2462] flex items-center justify-between text-[10px]">
              <div>
                <span className="text-purple-400 text-[8px] block">Signing Fee Bonus:</span>
                <strong className="text-yellow-300">{formatMoney(inspectingCandidate.signingCost)}</strong>
              </div>
              <div className="text-right">
                <span className="text-purple-400 text-[8px] block">Weekly Wage:</span>
                <strong className="text-white">{formatMoney(inspectingCandidate.contract?.salaryWeekly)}/wk</strong>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
