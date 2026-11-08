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
    { key: 'vocal', name: 'Vocal Mastery', icon: '🎤', desc: 'Refine vocal pitch, breathing, and emotional range.' },
    { key: 'dance', name: 'Dance & Choreography', icon: '💃', desc: 'Synchronize sharp footwork, rhythm, and body isolation.' },
    { key: 'rap', name: 'Rap Flow & Delivery', icon: '🔥', desc: 'Build cadence, lyrical punchlines, and rhythmic control.' },
    { key: 'visual', name: 'Visual & Styling', icon: '✨', desc: 'Camera presence, facial expressions, and photoshoot charisma.' },
    { key: 'charisma', name: 'Charisma & Stage Presence', icon: '⚡', desc: 'Crowd interaction, stage command, and variety banter.' },
  ]

  const facilities = [
    {
      id: 'main',
      name: 'Main Practice Studio 1',
      unlocked: true,
      desc: 'Standard hardwood dance studio with mirror wall and basic vocal booth.',
    },
    {
      id: 'main2',
      name: 'Main Practice Studio 2',
      unlocked: Boolean(state.unlockedTrainingMain2),
      upgradeId: 'train_fac_2',
      desc: 'Acoustically isolated vocal suite with high-end condenser microphones.',
    },
    {
      id: 'main3',
      name: 'Main Practice Studio 3',
      unlocked: Boolean(state.unlockedTrainingMain3),
      upgradeId: 'train_fac_3',
      desc: 'Elite motion-capture dance facility with customized LED ambient lighting.',
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1e1338] border-2 border-[#543b8a] p-4 rounded-xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300 font-pixel">
            IDOL TRAINING ACADEMY
          </h2>
          <p className="text-xs text-purple-200 mt-1 font-pixel leading-relaxed">
            Hone trainee and artist proficiencies. Training results depend on innate Potential (F to P) and individual Personality.
          </p>
        </div>

        {/* Facility Selector */}
        <div className="flex items-center gap-2">
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
              className={`px-3 py-2 rounded-xl text-[10px] font-pixel border transition-all ${
                activeFacility === fac.id
                  ? 'bg-emerald-900/60 border-emerald-400 text-emerald-200 shadow-md'
                  : fac.unlocked
                  ? 'bg-[#241744] border-[#442f70] text-purple-200 hover:border-emerald-500/40'
                  : 'bg-[#150e26] border-[#2a1d47] text-purple-500 opacity-60'
              }`}
            >
              {fac.unlocked ? '🏛️' : '🔒'} {fac.name.split(' ')[2]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Idol Roster Column */}
        <div className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-4 shadow-xl">
          <h3 className="text-xs font-bold text-purple-200 font-pixel mb-3 flex items-center justify-between">
            <span>SELECT IDOL ({state.idols.length})</span>
            <span className="text-[10px] text-emerald-300">₩1,000,000 / Session</span>
          </h3>

          <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
            {state.idols.map(idol => {
              const isSelected = idol.id === selectedIdol?.id
              return (
                <div
                  key={idol.id}
                  onClick={() => {
                    setSelectedIdolId(idol.id)
                    playSfx('click')
                  }}
                  className={`p-3 rounded-xl border cursor-pointer flex items-center gap-3 transition-all ${
                    isSelected
                      ? 'bg-emerald-950/70 border-emerald-400 shadow-md'
                      : 'bg-[#241744] border-[#442f70] hover:border-purple-400'
                  }`}
                >
                  <img
                    src={getAssetPath(idol.portrait)}
                    alt={idol.name}
                    className="w-12 h-12 rounded-lg object-cover border border-purple-400/50"
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = getAssetPath('/images/actors-portraits/Actor_01.jpg')
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white font-pixel truncate">
                        {idol.stageName || idol.name}
                      </span>
                      <span className="text-[9px] font-pixel text-yellow-300 bg-yellow-950/70 px-1.5 py-0.2 rounded border border-yellow-600/40">
                        {idol.tier}
                      </span>
                    </div>

                    <div className="text-[9px] text-purple-300 font-pixel mt-1 flex items-center justify-between">
                      <span>STA: {idol.currentStamina ?? 100}%</span>
                      <span>FAT: {idol.fatigue ?? 0}%</span>
                    </div>

                    <div className="w-full bg-[#120b24] h-1.5 rounded-full overflow-hidden mt-1">
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

        {/* Selected Idol Stats & Modules */}
        {selectedIdol ? (
          <div className="lg:col-span-2 space-y-6">
            {/* Idol Card & Vitals */}
            <div className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-5 shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#3b2762]">
                <div className="flex items-center gap-4">
                  <img
                    src={getAssetPath(selectedIdol.portrait)}
                    alt={selectedIdol.name}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-400 shadow-md"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-white font-pixel">
                        {selectedIdol.stageName || selectedIdol.name}
                      </h3>
                      <span className="badge-tier text-[10px] font-pixel px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/40">
                        Tier {selectedIdol.tier}
                      </span>
                      <span className="text-[10px] font-pixel text-purple-200 bg-purple-950/70 border border-purple-600/40 px-2 py-0.5 rounded">
                        Pot: {selectedIdol.potential}
                      </span>
                    </div>
                    <p className="text-xs text-purple-300 font-pixel mt-1">
                      Personality: <span className="text-pink-300 font-bold">{selectedIdol.personality}</span> • Specialty: <span className="text-yellow-300">{selectedIdol.specialty}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleQuickRest}
                  className="px-3 py-2 rounded-xl text-xs font-pixel bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-200 transition-colors flex items-center gap-2"
                >
                  <span>🛁</span> Spa Rest (₩2M)
                </button>
              </div>

              {/* Vitals Bars */}
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between text-xs font-pixel text-purple-200 mb-1">
                    <span>Stamina</span>
                    <span className="text-emerald-400">{selectedIdol.currentStamina ?? 100} / 100</span>
                  </div>
                  <div className="w-full bg-[#120b24] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-green-300 h-full rounded-full transition-all"
                      style={{ width: `${selectedIdol.currentStamina ?? 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-pixel text-purple-200 mb-1">
                    <span>Fatigue</span>
                    <span className="text-red-400">{selectedIdol.fatigue ?? 0} / 100</span>
                  </div>
                  <div className="w-full bg-[#120b24] h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-yellow-500 to-red-500 h-full rounded-full transition-all"
                      style={{ width: `${selectedIdol.fatigue ?? 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Training Modules Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {trainingModules.map(mod => {
                const currentVal = selectedIdol.stats?.[mod.key] ?? 30
                const isSpecialty = selectedIdol.specialty?.toLowerCase().includes(mod.key)
                const isExhausted = (selectedIdol.currentStamina ?? 100) < 15

                return (
                  <div
                    key={mod.key}
                    className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-4 shadow-xl flex flex-col justify-between hover:border-emerald-500/50 transition-all"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{mod.icon}</span>
                          <span className="text-xs font-bold text-white font-pixel">{mod.name}</span>
                        </div>
                        {isSpecialty && (
                          <span className="text-[9px] font-pixel text-pink-300 bg-pink-950/80 px-1.5 py-0.5 rounded border border-pink-500/40">
                            SPECIALTY
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-purple-300 font-pixel mb-3">
                        {mod.desc}
                      </p>

                      <div className="flex items-center justify-between text-xs font-pixel mb-1.5">
                        <span className="text-purple-300">Proficiency:</span>
                        <span className="text-yellow-300 font-bold">{currentVal} / 100</span>
                      </div>

                      <div className="w-full bg-[#120b24] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-400 h-full rounded-full transition-all"
                          style={{ width: `${currentVal}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#37235a] flex items-center justify-between">
                      <span className="text-[9px] text-purple-400 font-pixel">
                        -15 STA • +12 FAT
                      </span>
                      <button
                        onClick={() => handleTrain(mod.key)}
                        disabled={isExhausted || state.money < 1_000_000}
                        className={`text-[10px] font-pixel py-1.5 px-3 rounded-lg border transition-all ${
                          isExhausted || state.money < 1_000_000
                            ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-md'
                        }`}
                      >
                        TRAIN (₩1M)
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Recent Training Logs */}
            {selectedIdol.trainingHistory && selectedIdol.trainingHistory.length > 0 && (
              <div className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-4 shadow-xl">
                <h4 className="text-xs font-bold text-purple-200 font-pixel mb-2">
                  RECENT ACADEMY LOGS
                </h4>
                <div className="space-y-1 text-[10px] font-pixel text-purple-300 max-h-24 overflow-y-auto">
                  {selectedIdol.trainingHistory.slice(0, 5).map((log, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-emerald-400">✓</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="lg:col-span-2 flex items-center justify-center p-12 bg-[#1e1338] border-2 border-dashed border-[#543b8a] rounded-2xl">
            <p className="text-xs text-purple-300 font-pixel">Select an idol to begin training.</p>
          </div>
        )}
      </div>
    </div>
  )
}
