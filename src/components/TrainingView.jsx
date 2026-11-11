/**
 * TrainingView.jsx — Modal-First Idol Training Academy.
 *
 * Level 1: Main tab is a clean Training Overview displaying facilities status,
 *          trainee roster readiness, vitals, and clear entry points to assign drills.
 *          Does NOT permanently clutter the main screen with every drill button.
 * Level 2: Dedicated Training Management Modal where player selects the idol,
 *          evaluates stats/vitals, chooses training module or spa recovery, and confirms assignment.
 */

import React, { useState } from 'react'
import { useGame, ACTION } from '../game/state.jsx'
import { playSfx } from '../game/audio.js'
import { getAssetPath } from '../lib/assets.js'
import { formatMoney } from '../game/balance.js'
import Modal from './ui/Modal.jsx'

export default function TrainingView() {
  const { state, dispatch } = useGame()
  const [trainingModalIdol, setTrainingModalIdol] = useState(null)
  const [selectedDrillKey, setSelectedDrillKey] = useState('vocal')
  const [activeFacility, setActiveFacility] = useState('main')

  const idols = state.idols || []

  const trainingModules = [
    { key: 'vocal', name: 'Vocal Mastery', icon: '🎤', desc: 'Refine pitch, breathing, and vocal stability.' },
    { key: 'dance', name: 'Dance & Choreo', icon: '💃', desc: 'Sharpen footwork, rhythm, and body isolation.' },
    { key: 'rap', name: 'Rap Flow', icon: '🔥', desc: 'Build cadence, lyrical delivery, and punchlines.' },
    { key: 'visual', name: 'Visual & Camera', icon: '✨', desc: 'Expression control, charisma, and photoshoot gaze.' },
    { key: 'charisma', name: 'Stage Command', icon: '⚡', desc: 'Crowd interaction, stage presence, and live wit.' },
  ]

  const facilities = [
    {
      id: 'main',
      name: 'Studio 1 (Standard)',
      unlocked: true,
      desc: 'Hardwood dance studio & vocal booth.',
    },
    {
      id: 'main2',
      name: 'Studio 2 (Acoustic)',
      unlocked: Boolean(state.unlockedTrainingMain2),
      upgradeId: 'train_fac_2',
      desc: 'Acoustically isolated vocal suite.',
    },
    {
      id: 'main3',
      name: 'Studio 3 (Motion-Cap)',
      unlocked: Boolean(state.unlockedTrainingMain3),
      upgradeId: 'train_fac_3',
      desc: 'Elite motion-capture facility.',
    },
  ]

  // Open modal with specific idol
  const handleOpenTrainingModal = (idol) => {
    setTrainingModalIdol(idol)
    playSfx('click')
  }

  // Active idol in modal (keep updated with state)
  const activeModalIdol = idols.find(i => i.id === trainingModalIdol?.id) || trainingModalIdol

  // Execute drill (Level 3)
  const handleTrain = (statKey) => {
    if (!activeModalIdol) return

    const staminaCost = 15
    const cost = 1_000_000

    if (state.money < cost) {
      dispatch({
        type: ACTION.PUSH_TOAST,
        toast: { message: 'Insufficient funds for training (Requires ₩1,000,000)!', variant: 'red' },
      })
      playSfx('buzz')
      return
    }

    if ((activeModalIdol.currentStamina || 0) < staminaCost) {
      dispatch({
        type: ACTION.PUSH_TOAST,
        toast: { message: `${activeModalIdol.stageName || activeModalIdol.name} is exhausted! Let them rest.`, variant: 'red' },
      })
      playSfx('buzz')
      return
    }

    if ((activeModalIdol.fatigue || 0) >= 90) {
      dispatch({
        type: ACTION.PUSH_TOAST,
        toast: { message: `Dangerously high fatigue! Risk of severe burnout.`, variant: 'red' },
      })
      playSfx('buzz')
      return
    }

    playSfx('coin')
    dispatch({
      type: ACTION.TRAIN_IDOL,
      idolId: activeModalIdol.id,
      statKey,
      cost,
      staminaCost,
      fatigueGain: 12,
    })
  }

  // Spa rest (Level 3)
  const handleQuickRest = () => {
    if (!activeModalIdol) return
    const cost = 2_000_000
    if (state.money < cost) {
      dispatch({
        type: ACTION.PUSH_TOAST,
        toast: { message: 'Insufficient funds for Luxury Spa recovery (₩2,000,000)!', variant: 'red' },
      })
      playSfx('buzz')
      return
    }

    playSfx('coin')
    dispatch({
      type: ACTION.INIT_STATE,
      state: {
        ...state,
        money: state.money - cost,
        idols: state.idols.map(i => i.id === activeModalIdol.id ? {
          ...i,
          currentStamina: Math.min(100, (i.currentStamina || 50) + 35),
          fatigue: Math.max(0, (i.fatigue || 0) - 30),
        } : i),
        toasts: [
          ...(state.toasts || []),
          { id: Date.now(), message: `${activeModalIdol.stageName || activeModalIdol.name} attended Luxury Spa recovery!`, variant: 'gold' },
        ],
      },
    })
  }

  const selectedDrill = trainingModules.find(m => m.key === selectedDrillKey) || trainingModules[0]
  const currentStatVal = activeModalIdol?.stats?.[selectedDrillKey] ?? 30
  const canAffordDrill = state.money >= 1_000_000
  const hasEnoughStamina = (activeModalIdol?.currentStamina ?? 100) >= 15

  return (
    <div className="space-y-4 font-pixel">
      {/* ── LEVEL 1: Training Overview Header & Facilities ─────────────── */}
      <div className="bg-[#1e1338] border-2 border-[#543b8a] p-3.5 sm:p-4 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏋️</span>
            <h2 className="text-sm sm:text-base font-bold text-white">
              IDOL TRAINING ACADEMY OVERVIEW
            </h2>
          </div>
          <p className="text-[10px] text-purple-200 mt-0.5">
            Trainee development center. Select an idol to launch the Training Management Modal.
          </p>
        </div>

        {/* Facility Selector & Quick Action */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            {facilities.map(fac => (
              <button
                key={fac.id}
                type="button"
                onClick={() => {
                  if (fac.unlocked) {
                    setActiveFacility(fac.id)
                    playSfx('click')
                  } else {
                    dispatch({
                      type: ACTION.PUSH_TOAST,
                      toast: { message: `Locked! Unlock ${fac.name} in Company Upgrades.`, variant: 'red' },
                    })
                    playSfx('buzz')
                  }
                }}
                className={`px-2.5 py-1 rounded text-[9px] border transition-all ${
                  activeFacility === fac.id
                    ? 'bg-emerald-900/70 border-emerald-400 text-emerald-200 font-bold shadow-sm'
                    : fac.unlocked
                    ? 'bg-[#241744] border-[#442f70] text-purple-200 hover:border-emerald-500/40'
                    : 'bg-[#150e26] border-[#2a1d47] text-purple-500 opacity-60'
                }`}
              >
                {fac.unlocked ? '🏛️' : '🔒'} {fac.name}
              </button>
            ))}
          </div>

          {idols.length > 0 && (
            <button
              type="button"
              onClick={() => handleOpenTrainingModal(idols[0])}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-pink-600 hover:bg-pink-500 text-white border border-pink-400 shadow transition-all active:scale-95"
            >
              + Assign Training
            </button>
          )}
        </div>
      </div>

      {/* ── LEVEL 1: Clean Trainee Readiness & Stats Overview List ──────── */}
      {idols.length === 0 ? (
        <div className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-8 text-center text-purple-300">
          <p className="text-xs">No trainees or idols in company roster.</p>
        </div>
      ) : (
        <div className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl shadow-xl overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-3 px-4 py-2.5 bg-[#170e2d] border-b border-[#3b2762] text-[9px] text-purple-400 font-bold uppercase tracking-wider">
            <div className="col-span-4">Trainee / Artist</div>
            <div className="col-span-2">Specialty & Potential</div>
            <div className="col-span-3 text-center">Stamina & Fatigue Vitals</div>
            <div className="col-span-3 text-right">Training Action</div>
          </div>

          {/* Trainee Rows */}
          <div className="divide-y divide-[#322055]">
            {idols.map(idol => {
              const stamina = idol.currentStamina ?? 100
              const fatigue = idol.fatigue ?? 0
              const isExhausted = stamina < 15
              const isDangerFatigue = fatigue >= 80

              return (
                <div
                  key={idol.id}
                  onClick={() => handleOpenTrainingModal(idol)}
                  className="p-3 sm:px-4 sm:py-3 transition-colors hover:bg-[#251745] cursor-pointer flex flex-col md:grid md:grid-cols-12 md:items-center gap-2.5 sm:gap-3"
                  title="Click to open training management modal"
                >
                  {/* Col 1-4: Compact identity */}
                  <div className="md:col-span-4 flex items-center gap-2.5 min-w-0">
                    <img
                      src={getAssetPath(idol.portrait)}
                      alt={idol.name}
                      className="rounded-lg object-cover border border-purple-400/50 flex-shrink-0"
                      style={{
                        width: '28px',
                        height: '28px',
                        minWidth: '28px',
                        minHeight: '28px',
                        maxWidth: '28px',
                        maxHeight: '28px',
                        borderRadius: '6px',
                        objectFit: 'cover',
                      }}
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = getAssetPath('/images/actors-portraits/Actor_01.jpg')
                      }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <strong className="text-white text-xs truncate">
                          {idol.stageName || idol.name}
                        </strong>
                        <span className="text-[8px] text-yellow-300 bg-yellow-950/70 border border-yellow-500/40 px-1 py-0.2 rounded font-bold">
                          {idol.tier}-Tier
                        </span>
                      </div>
                      <div className="text-[9px] text-purple-300 truncate">
                        Personality: {idol.personality}
                      </div>
                    </div>
                  </div>

                  {/* Col 5-6: Specialty & Potential */}
                  <div className="md:col-span-2 flex md:flex-col justify-between md:justify-center text-[10px] min-w-0">
                    <span className="text-yellow-300 font-bold truncate">
                      {idol.specialty}
                    </span>
                    <span className="text-emerald-300 text-[9px] mt-0.5">
                      Potential: {idol.potential}-Grade
                    </span>
                  </div>

                  {/* Col 7-9: Stamina & Fatigue Progress */}
                  <div className="md:col-span-3 space-y-1 text-[9px] bg-[#120826] p-1.5 rounded-lg border border-[#3b2762] md:bg-transparent md:p-0 md:border-none">
                    <div className="flex justify-between items-center text-[8px]">
                      <span className="text-purple-300">Stamina: {stamina}%</span>
                      <span className={isDangerFatigue ? 'text-red-400 font-bold' : 'text-purple-300'}>
                        Fatigue: {fatigue}%
                      </span>
                    </div>
                    <div className="w-full bg-[#130b24] h-1.5 rounded-full overflow-hidden flex">
                      <div
                        className="bg-emerald-400 h-full rounded-full transition-all"
                        style={{ width: `${stamina}%` }}
                      />
                    </div>
                  </div>

                  {/* Col 10-12: Action Button */}
                  <div className="md:col-span-3 flex items-center justify-between md:justify-end gap-2 pt-1 md:pt-0 border-t md:border-none border-[#322055]">
                    <span className="text-[9px]">
                      {isExhausted ? (
                        <span className="text-red-400 font-bold">⚠️ Exhausted</span>
                      ) : isDangerFatigue ? (
                        <span className="text-yellow-400 font-bold">⚠️ High Fatigue</span>
                      ) : (
                        <span className="text-emerald-400">✓ Ready to Train</span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOpenTrainingModal(idol)
                      }}
                      className="px-3 py-1 rounded-lg text-[9px] font-bold bg-[#2d1b4e] hover:bg-emerald-600 hover:text-white text-emerald-300 border border-emerald-500/40 transition-colors shadow-sm"
                    >
                      Train Idol →
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── LEVEL 2: DEDICATED TRAINING MANAGEMENT MODAL ───────────────── */}
      {trainingModalIdol && activeModalIdol && (
        <Modal
          isOpen={!!trainingModalIdol}
          onClose={() => setTrainingModalIdol(null)}
          title="TRAINING MANAGEMENT & DRILL ASSIGNMENT"
          subtitle={`Honing skills for ${activeModalIdol.stageName || activeModalIdol.name}`}
          icon="🏋️"
          size="lg"
          borderColor="border-emerald-500"
          footer={
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleQuickRest}
                className="px-3 py-1.5 rounded-lg text-xs bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-200 transition-colors flex items-center gap-1.5"
                title="Restores 35 Stamina, reduces Fatigue by 30"
              >
                <span>🛁</span> Spa Rest (₩2,000,000)
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTrainingModalIdol(null)}
                  className="px-3 py-1.5 rounded-lg text-xs bg-[#241744] text-purple-200 border border-purple-500/40"
                >
                  Done
                </button>
                <button
                  type="button"
                  onClick={() => handleTrain(selectedDrillKey)}
                  disabled={!canAffordDrill || !hasEnoughStamina}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    !canAffordDrill || !hasEnoughStamina
                      ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow'
                  }`}
                >
                  Confirm Drill (₩1M)
                </button>
              </div>
            </div>
          }
        >
          {/* Idol Selector & Vitals Strip */}
          <div className="bg-[#120826] p-3.5 rounded-xl border border-[#3b2762] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2.5">
                <img
                  src={getAssetPath(activeModalIdol.portrait)}
                  alt={activeModalIdol.name}
                  className="rounded-lg object-cover border-2 border-emerald-400 flex-shrink-0"
                  style={{
                    width: '40px',
                    height: '40px',
                    minWidth: '40px',
                    minHeight: '40px',
                    maxWidth: '40px',
                    maxHeight: '40px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                  }}
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = getAssetPath('/images/actors-portraits/Actor_01.jpg')
                  }}
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-white">
                      {activeModalIdol.stageName || activeModalIdol.name}
                    </h4>
                    <span className="text-[8px] text-yellow-300 bg-yellow-950/70 border border-yellow-500/40 px-1 rounded">
                      {activeModalIdol.tier}-Tier
                    </span>
                    <span className="text-[8px] text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 px-1 rounded">
                      Pot: {activeModalIdol.potential}
                    </span>
                  </div>
                  <p className="text-[9px] text-purple-300 mt-0.5">
                    Specialty: <span className="text-yellow-300 font-bold">{activeModalIdol.specialty}</span> · Personality: <span className="text-pink-300 font-bold">{activeModalIdol.personality}</span>
                  </p>
                </div>
              </div>

              {/* Quick Idol Switcher */}
              <div className="sm:text-right">
                <label className="block text-[8px] text-purple-400 mb-0.5">SWITCH IDOL:</label>
                <select
                  value={activeModalIdol.id}
                  onChange={(e) => {
                    const found = idols.find(i => i.id === e.target.value)
                    if (found) setTrainingModalIdol(found)
                  }}
                  className="bg-[#1e1338] border border-[#52338c] rounded px-2 py-1 text-white text-[10px]"
                >
                  {idols.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.stageName || i.name} ({i.tier})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Vitals Progress */}
            <div className="grid grid-cols-2 gap-3 text-[9px] pt-1 border-t border-[#37235a]">
              <div>
                <div className="flex justify-between text-purple-300 mb-1">
                  <span>Stamina:</span>
                  <span className="text-emerald-300 font-bold">{activeModalIdol.currentStamina ?? 100}%</span>
                </div>
                <div className="w-full bg-[#1e1338] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-green-300 h-full rounded-full transition-all"
                    style={{ width: `${activeModalIdol.currentStamina ?? 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-purple-300 mb-1">
                  <span>Fatigue:</span>
                  <span className={(activeModalIdol.fatigue || 0) >= 80 ? 'text-red-400 font-bold' : 'text-yellow-300 font-bold'}>
                    {activeModalIdol.fatigue ?? 0}%
                  </span>
                </div>
                <div className="w-full bg-[#1e1338] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-red-500 h-full rounded-full transition-all"
                    style={{ width: `${activeModalIdol.fatigue ?? 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Drill Category Selector (5 Modules) */}
          <div>
            <label className="block text-[10px] text-purple-300 font-bold mb-2 uppercase tracking-wider">
              Select Training Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {trainingModules.map(mod => {
                const val = activeModalIdol.stats?.[mod.key] ?? 30
                const isSelected = selectedDrillKey === mod.key
                const isSpecialty = activeModalIdol.specialty?.toLowerCase().includes(mod.key)

                return (
                  <div
                    key={mod.key}
                    onClick={() => {
                      setSelectedDrillKey(mod.key)
                      playSfx('click')
                    }}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-950/70 border-emerald-400 shadow-md ring-1 ring-emerald-400'
                        : 'bg-[#241744] border-[#442f70] hover:border-purple-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-base">{mod.icon}</span>
                        <strong className="text-xs text-white">{mod.name}</strong>
                      </div>
                      {isSpecialty && (
                        <span className="text-[8px] text-pink-300 bg-pink-950/80 px-1 py-0.2 rounded border border-pink-500/40">
                          SPECIALTY
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-purple-300 mt-1 line-clamp-1">
                      {mod.desc}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[9px]">
                      <span className="text-purple-300">Level:</span>
                      <span className="text-yellow-300 font-bold">{val} / 100</span>
                    </div>
                    <div className="w-full bg-[#120b24] h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className="bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 h-full rounded-full"
                        style={{ width: `${val}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Drill Execution Breakdown (Level 3) */}
          <div className="bg-[#120826] p-3.5 rounded-xl border border-[#3b2762] space-y-2 text-[10px]">
            <div className="text-yellow-300 font-bold flex items-center justify-between">
              <span>Selected Drill: {selectedDrill.name}</span>
              <span>Cost: ₩1,000,000</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-purple-300 text-[9px]">
              <div>• Stamina Cost: <strong className="text-red-400">-15 STA</strong></div>
              <div>• Fatigue Gain: <strong className="text-yellow-300">+12 FAT</strong></div>
              <div>• Potential Factor: <strong className="text-emerald-300">{activeModalIdol.potential}-Grade Multiplier</strong></div>
              <div>• Current Stat: <strong className="text-white">{currentStatVal} / 100</strong></div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
