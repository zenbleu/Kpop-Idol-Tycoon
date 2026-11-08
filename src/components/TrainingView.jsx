import React, { useState } from 'react'
import { useGame, ACTION } from '../game/state.jsx'
import { playSfx } from '../game/audio.js'
import { getAssetPath } from '../lib/assets.js'

export default function TrainingView() {
  const { state, dispatch } = useGame()
  const [selectedIdolId, setSelectedIdolId] = useState(state.idols[0]?.id || null)
  const [activeFacility, setActiveFacility] = useState('main') // 'main', 'main2', 'main3'

  const selectedIdol = state.idols.find(i => i.id === selectedIdolId) || state.idols[0]

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

  const handleTrain = (statKey) => {
    if (!selectedIdol) return

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

    if ((selectedIdol.currentStamina || 0) < staminaCost) {
      dispatch({
        type: ACTION.PUSH_TOAST,
        toast: { message: `${selectedIdol.stageName || selectedIdol.name} is too exhausted to train! Let them rest.`, variant: 'red' },
      })
      playSfx('buzz')
      return
    }

    if ((selectedIdol.fatigue || 0) >= 90) {
      dispatch({
        type: ACTION.PUSH_TOAST,
        toast: { message: `Dangerously high fatigue! Risk of severe injury or burnout.`, variant: 'red' },
      })
      playSfx('buzz')
      return
    }

    playSfx('coin')
    dispatch({
      type: ACTION.TRAIN_IDOL,
      idolId: selectedIdol.id,
      statKey,
      cost,
      staminaCost,
      fatigueGain: 12,
    })
  }

  // Quick Rest action (restore stamina, reduce fatigue)
  const handleQuickRest = () => {
    if (!selectedIdol) return
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
        idols: state.idols.map(i => i.id === selectedIdol.id ? {
          ...i,
          currentStamina: Math.min(100, (i.currentStamina || 50) + 35),
          fatigue: Math.max(0, (i.fatigue || 0) - 30),
        } : i),
        toasts: [
          ...(state.toasts || []),
          { id: Date.now(), message: `${selectedIdol.stageName || selectedIdol.name} attended Luxury Spa wellness care!`, variant: 'gold' },
        ],
      },
    })
  }

  return (
    <div className="space-y-4">
      {/* ── 1. Top Header & Facilities Strip ──────────────────────────────── */}
      <div className="bg-[#1e1338] border-2 border-[#543b8a] p-3.5 sm:p-4 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏋️</span>
            <h2 className="text-base sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300 font-pixel">
              IDOL TRAINING ACADEMY
            </h2>
          </div>
          <p className="text-[10px] text-purple-200 mt-0.5 font-pixel">
            Hone trainee and artist skills. Gains depend on innate Potential (F–P) and current stamina.
          </p>
        </div>

        {/* Facility Selector */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {facilities.map(fac => (
            <button
              key={fac.id}
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
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-pixel border transition-all ${
                activeFacility === fac.id
                  ? 'bg-emerald-900/70 border-emerald-400 text-emerald-200 shadow-sm font-bold'
                  : fac.unlocked
                  ? 'bg-[#241744] border-[#442f70] text-purple-200 hover:border-emerald-500/40'
                  : 'bg-[#150e26] border-[#2a1d47] text-purple-500 opacity-60'
              }`}
            >
              {fac.unlocked ? '🏛️' : '🔒'} {fac.name}
            </button>
          ))}
        </div>
      </div>

      {/* ── 2. Split Command Center: Idol List (Left) + Modules (Right) ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Compact Idol Selector (4 Cols) */}
        <div className="lg:col-span-4 bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col justify-between max-h-[580px]">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-[#3b2762] mb-2 font-pixel">
              <span className="text-xs font-bold text-white">
                ROSTER ({state.idols.length})
              </span>
              <span className="text-[9px] text-emerald-300">
                ₩1,000,000 / Drill
              </span>
            </div>

            {/* Scrollable Idol List */}
            <div className="space-y-1.5 overflow-y-auto max-h-[500px] pr-1 scrollbar-thin">
              {state.idols.map(idol => {
                const isSelected = idol.id === selectedIdol?.id
                return (
                  <div
                    key={idol.id}
                    onClick={() => {
                      setSelectedIdolId(idol.id)
                      playSfx('click')
                    }}
                    className={`p-2 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'bg-emerald-950/70 border-emerald-400 shadow-md ring-1 ring-emerald-400'
                        : 'bg-[#241744] border-[#442f70] hover:border-purple-400 hover:bg-[#2b1b4f]'
                    }`}
                  >
                    <img
                      src={getAssetPath(idol.portrait)}
                      alt={idol.name}
                      className="w-11 h-11 rounded-lg object-cover border border-purple-400/50 flex-shrink-0"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = getAssetPath('/images/actors-portraits/Actor_01.jpg')
                      }}
                    />
                    <div className="flex-1 min-w-0 font-pixel">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-white truncate max-w-[100px]">
                          {idol.stageName || idol.name}
                        </span>
                        <span className="text-[8px] text-yellow-300 bg-yellow-950/70 px-1 py-0.2 rounded border border-yellow-600/40">
                          {idol.tier}
                        </span>
                      </div>

                      <div className="text-[8px] text-purple-300 mt-1 flex items-center justify-between">
                        <span className="text-emerald-300">STA {idol.currentStamina ?? 100}%</span>
                        <span className={(idol.fatigue || 0) > 75 ? 'text-red-400 font-bold' : 'text-purple-300'}>
                          FAT {idol.fatigue ?? 0}%
                        </span>
                      </div>

                      <div className="w-full bg-[#120b24] h-1 rounded-full overflow-hidden mt-1">
                        <div
                          className="bg-emerald-400 h-full rounded-full transition-all"
                          style={{ width: `${idol.currentStamina ?? 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Idol Overview + Drill Grid (8 Cols) */}
        {selectedIdol ? (
          <div className="lg:col-span-8 space-y-4">
            {/* Selected Idol Card & Vitals */}
            <div className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-4 shadow-xl font-pixel">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#3b2762]">
                <div className="flex items-center gap-3">
                  <img
                    src={getAssetPath(selectedIdol.portrait)}
                    alt={selectedIdol.name}
                    className="w-14 h-14 rounded-xl object-cover border-2 border-emerald-400 shadow-md flex-shrink-0"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = getAssetPath('/images/actors-portraits/Actor_01.jpg')
                    }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">
                        {selectedIdol.stageName || selectedIdol.name}
                      </h3>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                        Tier {selectedIdol.tier}
                      </span>
                      <span className="text-[9px] text-purple-200 bg-purple-950/70 border border-purple-600/40 px-1.5 py-0.2 rounded">
                        Pot: {selectedIdol.potential}
                      </span>
                    </div>
                    <p className="text-[10px] text-purple-300 mt-1">
                      Personality: <span className="text-pink-300 font-bold">{selectedIdol.personality}</span> • Specialty: <span className="text-yellow-300 font-bold">{selectedIdol.specialty}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleQuickRest}
                  className="px-3 py-1.5 rounded-xl text-[10px] font-pixel bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-200 transition-colors flex items-center gap-1.5 self-start sm:self-center shadow"
                  title="Restores 35 Stamina, reduces Fatigue by 30"
                >
                  <span>🛁</span> Spa Rest (₩2M)
                </button>
              </div>

              {/* Vitals Progress Bars */}
              <div className="mt-3 grid grid-cols-2 gap-3 text-[10px]">
                <div>
                  <div className="flex justify-between text-purple-200 mb-1">
                    <span>Stamina</span>
                    <span className="text-emerald-400 font-bold">{selectedIdol.currentStamina ?? 100} / 100</span>
                  </div>
                  <div className="w-full bg-[#120b24] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-green-300 h-full rounded-full transition-all"
                      style={{ width: `${selectedIdol.currentStamina ?? 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-purple-200 mb-1">
                    <span>Fatigue</span>
                    <span className={(selectedIdol.fatigue || 0) > 75 ? 'text-red-400 font-bold' : 'text-yellow-400 font-bold'}>
                      {selectedIdol.fatigue ?? 0} / 100
                    </span>
                  </div>
                  <div className="w-full bg-[#120b24] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-yellow-500 to-red-500 h-full rounded-full transition-all"
                      style={{ width: `${selectedIdol.fatigue ?? 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Training Modules Grid (5 Drills) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {trainingModules.map(mod => {
                const currentVal = selectedIdol.stats?.[mod.key] ?? 30
                const isSpecialty = selectedIdol.specialty?.toLowerCase().includes(mod.key)
                const isExhausted = (selectedIdol.currentStamina ?? 100) < 15

                return (
                  <div
                    key={mod.key}
                    className="bg-[#1e1338] border-2 border-[#543b8a] rounded-xl p-3 shadow-lg flex flex-col justify-between hover:border-emerald-500/50 transition-all font-pixel"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-base">{mod.icon}</span>
                          <span className="text-xs font-bold text-white truncate max-w-[110px]">{mod.name}</span>
                        </div>
                        {isSpecialty && (
                          <span className="text-[8px] font-pixel text-pink-300 bg-pink-950/80 px-1 py-0.2 rounded border border-pink-500/40">
                            SPECIAL
                          </span>
                        )}
                      </div>

                      <p className="text-[9px] text-purple-300 leading-tight mb-2">
                        {mod.desc}
                      </p>

                      <div className="flex items-center justify-between text-[10px] mb-1">
                        <span className="text-purple-300">Level:</span>
                        <span className="text-yellow-300 font-bold">{currentVal} / 100</span>
                      </div>

                      <div className="w-full bg-[#120b24] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 h-full rounded-full transition-all"
                          style={{ width: `${currentVal}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#37235a] flex items-center justify-between">
                      <span className="text-[8px] text-purple-400">
                        -15 STA
                      </span>
                      <button
                        onClick={() => handleTrain(mod.key)}
                        disabled={isExhausted || state.money < 1_000_000}
                        className={`text-[9px] font-pixel py-1 px-2.5 rounded-lg border transition-all ${
                          isExhausted || state.money < 1_000_000
                            ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow'
                        }`}
                      >
                        TRAIN (₩1M)
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 flex items-center justify-center p-12 bg-[#1e1338] border-2 border-dashed border-[#543b8a] rounded-2xl">
            <p className="text-xs text-purple-300 font-pixel">Select an idol from the left roster to begin training.</p>
          </div>
        )}
      </div>
    </div>
  )
}
