/**
 * CompanyView.jsx — Category-First Agency HQ Management & Upgrade Catalog.
 *
 * Level 1: Main overview displays agency vitals and 6 distinct, balanced, square/near-square
 *          category tiles (Headquarters, Training, Auditions, Production, Marketing, Management).
 * Level 2: Clicking any category opens the dedicated Upgrade Category Modal with spacious,
 *          readable cards for that division's upgrade progression and purchase controls.
 * Level 3: Individual upgrade inspection and instant acquisition.
 */

import React, { useState } from 'react'
import { useGame, ACTION } from '../game/state.jsx'
import { UPGRADES } from '../game/upgrades.js'
import { COMPANY_TIER_CONFIG, formatMoney } from '../game/balance.js'
import { playSfx } from '../game/audio.js'
import Modal from './ui/Modal.jsx'

export const UPGRADE_CATEGORIES = [
  {
    id: 'Headquarters',
    name: 'Headquarters',
    icon: '🏢',
    desc: 'Agency office expansion, trainee housing capacity, prestige & passive fatigue recovery.',
    color: 'from-amber-500/20 to-purple-900/40',
    borderColor: 'border-amber-500/50',
  },
  {
    id: 'Training',
    name: 'Training',
    icon: '🎓',
    desc: 'Acoustic vocal suites, dance floors, Main 2 & Main 3 curriculum unlocks & masterclasses.',
    color: 'from-emerald-500/20 to-purple-900/40',
    borderColor: 'border-emerald-500/50',
  },
  {
    id: 'Auditions',
    name: 'Auditions',
    icon: '🎤',
    desc: 'Candidate slot expansions, nationwide scouting, global talent auditions & headhunting.',
    color: 'from-pink-500/20 to-purple-900/40',
    borderColor: 'border-pink-500/50',
  },
  {
    id: 'Production',
    name: 'Production',
    icon: '💿',
    desc: 'State-of-the-art mixing studios, concept fashion vaults & cinematic MV production sets.',
    color: 'from-cyan-500/20 to-purple-900/40',
    borderColor: 'border-cyan-500/50',
  },
  {
    id: 'Marketing',
    name: 'Marketing',
    icon: '📢',
    desc: 'Music show broadcast access, variety casting networks, viral PR & global media tours.',
    color: 'from-orange-500/20 to-purple-900/40',
    borderColor: 'border-orange-500/50',
  },
  {
    id: 'Management',
    name: 'Management',
    icon: '📋',
    desc: 'Professional staff hiring, luxury recovery spas, contract law advisors & financial division.',
    color: 'from-indigo-500/20 to-purple-900/40',
    borderColor: 'border-indigo-500/50',
  },
]

export default function CompanyView() {
  const { state, dispatch } = useGame()
  const [activeCategory, setActiveCategory] = useState(null)
  const [inspectingUpgrade, setInspectingUpgrade] = useState(null)

  const emblemMap = {
    neon_star: '⭐',
    cyber_heart: '💖',
    royal_crown: '👑',
    galaxy_blossom: '🌸',
    retro_diamond: '💎',
  }

  const emblem = emblemMap[state.logoStyle] || '⭐'
  const unlockedUpgrades = state.upgrades || []
  const unlockedCount = unlockedUpgrades.length

  const handleBuyUpgrade = (upgrade) => {
    if (unlockedUpgrades.includes(upgrade.id)) return

    if (upgrade.costType === 'rubies') {
      if (state.rubies < upgrade.cost) {
        dispatch({ type: ACTION.PUSH_TOAST, toast: { message: 'Not enough rubies 💎!', variant: 'red' } })
        playSfx('buzz')
        return
      }
    } else {
      if (state.money < upgrade.cost) {
        dispatch({ type: ACTION.PUSH_TOAST, toast: { message: 'Insufficient funds ₩!', variant: 'red' } })
        playSfx('buzz')
        return
      }
    }

    playSfx('coin')
    dispatch({ type: ACTION.BUY_UPGRADE, upgradeId: upgrade.id })
    dispatch({ type: ACTION.PUSH_TOAST, toast: { message: `Acquired: ${upgrade.name}!`, variant: 'gold' } })
    if (inspectingUpgrade?.id === upgrade.id) {
      setInspectingUpgrade(null)
    }
  }

  return (
    <div className="space-y-5 font-pixel">
      {/* ── LEVEL 1: Main Tab Agency Overview Panel ─────────────────────── */}
      <div className="bg-[#1e1338] border-2 border-[#543b8a] p-4 sm:p-5 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="text-3xl p-3 rounded-2xl bg-[#120826] border-2 border-[#543b8a] shadow-inner flex-shrink-0">
            {emblem}
          </span>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                {state.companyName || 'K-pop Agency'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-lg text-[9px] text-yellow-300 bg-[#2b174e] border border-yellow-500/50 font-bold shadow-sm">
                Tier {state.companyTier}{state.companyTierModifier} ({COMPANY_TIER_CONFIG[state.companyTier]?.title || 'Agency'})
              </span>
            </div>
            <p className="text-[10px] text-purple-300 mt-1">
              CEO: <strong className="text-white">{state.ceoName}</strong> · Reputation: <strong className="text-cyan-300">{state.companyReputation}</strong> · Score: <strong className="text-pink-300">{state.companyScore || 0} pts</strong>
            </p>
          </div>
        </div>

        {/* Agency Vitals Quick Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-[9px]">
          <div className="bg-[#120826] p-2.5 rounded-xl border border-[#3b2762]">
            <span className="text-purple-400 block text-[8px] uppercase">Group Slots</span>
            <strong className="text-yellow-300 text-xs mt-0.5 block">{state.maxGroupSlots || 3} Groups</strong>
          </div>
          <div className="bg-[#120826] p-2.5 rounded-xl border border-[#3b2762]">
            <span className="text-purple-400 block text-[8px] uppercase">Scout Slots</span>
            <strong className="text-emerald-300 text-xs mt-0.5 block">{state.auditionCandidateCapacity || 2} Slots</strong>
          </div>
          <div className="bg-[#120826] p-2.5 rounded-xl border border-[#3b2762]">
            <span className="text-purple-400 block text-[8px] uppercase">HQ Upgrades</span>
            <strong className="text-pink-300 text-xs mt-0.5 block">{unlockedCount} / {UPGRADES.length}</strong>
          </div>
          <div className="bg-[#120826] p-2.5 rounded-xl border border-[#3b2762]">
            <span className="text-purple-400 block text-[8px] uppercase">Concerts Done</span>
            <strong className="text-cyan-300 text-xs mt-0.5 block">{state.concertsCompleted || 0}</strong>
          </div>
        </div>
      </div>

      {/* ── LEVEL 1: Six Category Tiles (Category-First Design) ─────────── */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-yellow-300 flex items-center gap-2">
            <span>🏢</span> AGENCY UPGRADE DIVISIONS
          </h3>
          <span className="text-[9px] text-purple-300">
            Select a division to open its full upgrade catalog modal
          </span>
        </div>

        {/* 6 Balanced Category Tiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {UPGRADE_CATEGORIES.map((cat) => {
            const branchUpgrades = UPGRADES.filter(u => u.branch === cat.id)
            const total = branchUpgrades.length
            const unlocked = branchUpgrades.filter(u => unlockedUpgrades.includes(u.id)).length
            const isAllUnlocked = total > 0 && unlocked === total
            const pct = total > 0 ? Math.round((unlocked / total) * 100) : 0

            return (
              <div
                key={cat.id}
                onClick={() => {
                  playSfx('click')
                  setActiveCategory(cat)
                }}
                className={`p-5 rounded-2xl bg-[#1e1338] border-2 ${cat.borderColor} hover:border-yellow-400 shadow-xl cursor-pointer transition-all duration-150 hover:scale-[1.01] flex flex-col justify-between min-h-[200px]`}
              >
                <div>
                  {/* Tile Header: Icon + Name + Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl select-none">{cat.icon}</span>
                      <strong className="text-sm font-bold text-white tracking-wide">
                        {cat.name}
                      </strong>
                    </div>

                    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-bold border ${
                      isAllUnlocked
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                        : 'bg-purple-950/80 text-yellow-300 border-yellow-500/40'
                    }`}>
                      {isAllUnlocked ? 'COMPLETE' : `${unlocked}/${total} ACTIVE`}
                    </span>
                  </div>

                  {/* Tile Description */}
                  <p className="text-[10px] text-purple-200 leading-relaxed min-h-[38px]">
                    {cat.desc}
                  </p>
                </div>

                {/* Progress bar + CTA */}
                <div className="mt-4 pt-3 border-t border-[#3b2762]">
                  <div className="flex justify-between items-center text-[9px] mb-1.5">
                    <span className="text-purple-300">Division Progress:</span>
                    <strong className="text-yellow-300">{pct}%</strong>
                  </div>
                  <div className="w-full bg-[#120826] h-1.5 rounded-full overflow-hidden mb-3">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-yellow-400 h-full rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <button
                    type="button"
                    className="w-full py-2 px-3 rounded-xl text-[10px] font-bold bg-[#2d1b54] hover:bg-yellow-500 hover:text-black text-yellow-300 border border-yellow-500/40 transition-colors shadow flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Inspect Catalog</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── LEVEL 2: DEDICATED CATEGORY UPGRADE CATALOG MODAL ───────────── */}
      {activeCategory && (
        <Modal
          isOpen={!!activeCategory}
          onClose={() => setActiveCategory(null)}
          title={`${activeCategory.icon} ${activeCategory.name.toUpperCase()} UPGRADE CATALOG`}
          subtitle={`${UPGRADES.filter(u => u.branch === activeCategory.id && unlockedUpgrades.includes(u.id)).length} / ${UPGRADES.filter(u => u.branch === activeCategory.id).length} facilities installed`}
          icon={activeCategory.icon}
          size="xl"
          borderColor={activeCategory.borderColor}
          footer={
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] text-purple-300">
                Capital: <strong className="text-yellow-300">{formatMoney(state.money)}</strong> · Rubies: <strong className="text-pink-300">💎 {state.rubies || 0}</strong>
              </span>
              <button
                type="button"
                onClick={() => setActiveCategory(null)}
                className="px-4 py-1.5 rounded-lg text-xs bg-[#241744] hover:bg-[#342260] text-purple-200 border border-purple-500/40 cursor-pointer"
              >
                Close Catalog
              </button>
            </div>
          }
        >
          <div className="space-y-3.5">
            {UPGRADES.filter(u => u.branch === activeCategory.id).map((upg) => {
              const isUnlocked = unlockedUpgrades.includes(upg.id)
              const prereqMet = !upg.prereq || unlockedUpgrades.includes(upg.prereq)
              const canAfford = upg.costType === 'rubies'
                ? state.rubies >= upg.cost
                : state.money >= upg.cost

              return (
                <div
                  key={upg.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    isUnlocked
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : prereqMet
                      ? 'bg-[#1e1338] border-[#4f3484] hover:border-yellow-400/80 shadow-md'
                      : 'bg-[#140b24] border-[#311f52] opacity-60'
                  }`}
                >
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-bold text-white">
                        {upg.name}
                      </h4>
                      {isUnlocked ? (
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-500/50">
                          ✓ INSTALLED
                        </span>
                      ) : !prereqMet ? (
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-purple-950/80 text-purple-400 border border-purple-500/30">
                          🔒 PREREQUISITE REQUIRED
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-yellow-950/80 text-yellow-300 border border-yellow-500/50">
                          READY TO UNLOCK
                        </span>
                      )}
                    </div>

                    <p className="text-[10px] text-purple-200 leading-relaxed">
                      {upg.desc}
                    </p>

                    <div className="p-2 rounded-lg bg-[#120826] border border-[#3b2462] text-[9px] text-yellow-300 inline-block">
                      ⚡ <strong>Strategic Benefit:</strong> {upg.effectDesc}
                    </div>

                    {upg.prereq && !isUnlocked && (
                      <div className="text-[9px] text-purple-400">
                        Prerequisite: <strong className={prereqMet ? 'text-emerald-400' : 'text-red-400'}>{upg.prereq}</strong>
                      </div>
                    )}
                  </div>

                  {/* Purchase CTA */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2.5 flex-shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#3b2762]">
                    <div className="text-right">
                      <span className="text-[9px] text-purple-400 block">Required:</span>
                      <strong className={`text-xs sm:text-sm font-bold ${upg.costType === 'rubies' ? 'text-pink-300' : 'text-yellow-300'}`}>
                        {upg.costType === 'rubies' ? `💎 ${upg.cost}` : formatMoney(upg.cost)}
                      </strong>
                    </div>

                    {isUnlocked ? (
                      <button
                        type="button"
                        disabled
                        className="py-1.5 px-4 rounded-lg text-xs bg-emerald-950/60 text-emerald-400 border border-emerald-600/40 cursor-default"
                      >
                        ✓ Active
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleBuyUpgrade(upg)}
                        disabled={!prereqMet || !canAfford}
                        className={`py-1.5 px-4 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          !prereqMet
                            ? 'bg-gray-800 text-gray-500 border-gray-700 cursor-not-allowed'
                            : canAfford
                            ? 'bg-yellow-500 hover:bg-yellow-400 text-black border-yellow-300 shadow active:scale-95'
                            : 'bg-red-950/60 text-red-300 border-red-500/40 cursor-not-allowed'
                        }`}
                      >
                        {!prereqMet ? 'Locked' : canAfford ? 'Purchase' : 'Need Funds'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </Modal>
      )}
    </div>
  )
}
