/**
 * CompanyView.jsx — Company headquarters, reputation milestones,
 * and the comprehensive 6-branch company upgrade tree.
 * Optimized with compact subviews, organized upgrade cards, and reduced scrolling.
 */

import React, { useState } from 'react'
import { useGame, ACTION } from '../game/state.jsx'
import { UPGRADES } from '../game/upgrades.js'
import { REPUTATION_LEVELS, COMPANY_TIER_CONFIG, formatMoney } from '../game/balance.js'
import { playSfx } from '../game/audio.js'

export default function CompanyView() {
  const { state, dispatch } = useGame()
  const [subview, setSubview] = useState('upgrades') // 'upgrades' | 'milestones' | 'profile'
  const [selectedBranch, setSelectedBranch] = useState('All')

  const branches = ['All', 'Headquarters', 'Training', 'Auditions', 'Production', 'Marketing', 'Management']

  const handleBuyUpgrade = (upgrade) => {
    if (state.upgrades.includes(upgrade.id)) return

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
  }

  const filteredUpgrades = selectedBranch === 'All'
    ? UPGRADES
    : UPGRADES.filter(u => u.branch === selectedBranch)

  const emblemMap = {
    neon_star: '⭐',
    cyber_heart: '💖',
    royal_crown: '👑',
    galaxy_blossom: '🌸',
    retro_diamond: '💎',
  }

  const emblem = emblemMap[state.logoStyle] || '⭐'
  const unlockedCount = (state.upgrades || []).length

  return (
    <div className="space-y-4">
      {/* ── 1. Compact Header with Subview Selector ──────────────────────── */}
      <div className="bg-[#1e1338] border-2 border-[#543b8a] p-3.5 sm:p-4 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl p-2 rounded-xl bg-[#120826] border border-[#4d3284]">
            {emblem}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-white font-pixel">
                {state.companyName}
              </h2>
              <span className="px-2 py-0.5 rounded text-[9px] font-pixel text-yellow-300 bg-[#2b174e] border border-yellow-500/50">
                Tier {state.companyTier}{state.companyTierModifier}
              </span>
            </div>
            <div className="text-[10px] text-purple-300 font-pixel mt-0.5">
              CEO: <strong>{state.ceoName}</strong> · Reputation: <strong className="text-cyan-300">{state.companyReputation}</strong> · Score: <strong className="text-pink-300">{state.companyScore || 0} pts</strong>
            </div>
          </div>
        </div>

        {/* Subview Tabs */}
        <div className="flex items-center gap-1.5 bg-[#120826] p-1 rounded-xl border border-[#432d6f]">
          <button
            onClick={() => {
              playSfx('click')
              setSubview('upgrades')
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-pixel transition-all ${
              subview === 'upgrades'
                ? 'bg-pink-600 text-white font-bold shadow'
                : 'text-purple-300 hover:text-white hover:bg-[#251647]'
            }`}
          >
            ⚡ Upgrades ({unlockedCount}/{UPGRADES.length})
          </button>
          <button
            onClick={() => {
              playSfx('click')
              setSubview('milestones')
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-pixel transition-all ${
              subview === 'milestones'
                ? 'bg-pink-600 text-white font-bold shadow'
                : 'text-purple-300 hover:text-white hover:bg-[#251647]'
            }`}
          >
            🌐 Milestones
          </button>
          <button
            onClick={() => {
              playSfx('click')
              setSubview('profile')
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-pixel transition-all ${
              subview === 'profile'
                ? 'bg-pink-600 text-white font-bold shadow'
                : 'text-purple-300 hover:text-white hover:bg-[#251647]'
            }`}
          >
            🏢 Agency Identity
          </button>
        </div>
      </div>

      {/* ── 2. SUBVIEW A: Upgrades Tree ──────────────────────────────────── */}
      {subview === 'upgrades' && (
        <div className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#3b2762]">
            <div className="text-xs font-bold text-yellow-300 font-pixel">
              🏢 AGENCY UPGRADE TREE ({unlockedCount} / {UPGRADES.length} UNLOCKED)
            </div>

            {/* Branch Filter Pills */}
            <div className="flex gap-1 overflow-x-auto py-0.5">
              {branches.map(b => (
                <button
                  key={b}
                  onClick={() => {
                    playSfx('click')
                    setSelectedBranch(b)
                  }}
                  className={`px-2.5 py-1 rounded text-[9px] font-pixel transition-all border whitespace-nowrap ${
                    selectedBranch === b
                      ? 'bg-yellow-400 text-black font-bold border-yellow-300 shadow'
                      : 'bg-[#150b29] text-purple-300 border-[#3d276b] hover:border-yellow-400/60'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Upgrades Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredUpgrades.map(upg => {
              const isUnlocked = state.upgrades.includes(upg.id)
              const prereqMet = !upg.prereq || state.upgrades.includes(upg.prereq)
              const canAfford = upg.costType === 'rubies'
                ? state.rubies >= upg.cost
                : state.money >= upg.cost
              const isAvailable = prereqMet && !isUnlocked

              return (
                <div
                  key={upg.id}
                  className={`p-3 rounded-xl border flex flex-col justify-between transition-all font-pixel ${
                    isUnlocked
                      ? 'bg-emerald-950/40 border-emerald-500/50'
                      : isAvailable
                      ? 'bg-[#221442] border-[#503487] hover:border-pink-400/80'
                      : 'bg-[#140b24] border-[#2f1f4d] opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[8px] mb-1">
                      <span className="px-1.5 py-0.2 rounded bg-purple-900/60 text-purple-300 border border-purple-600/40 uppercase">
                        {upg.branch}
                      </span>
                      {isUnlocked ? (
                        <span className="text-emerald-400 font-bold">✓ UNLOCKED</span>
                      ) : !prereqMet ? (
                        <span className="text-purple-400">🔒 LOCKED</span>
                      ) : (
                        <span className="text-yellow-300 font-bold">AVAILABLE</span>
                      )}
                    </div>

                    <h3 className="text-xs font-bold text-white mb-0.5">
                      {upg.name}
                    </h3>
                    <p className="text-[9px] text-purple-300 leading-tight mb-2">
                      {upg.desc}
                    </p>

                    <div className="text-[9px] text-yellow-300 bg-[#120826] p-1.5 rounded-lg border border-[#392461]">
                      ⚡ {upg.effectDesc}
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#392461] flex items-center justify-between text-[10px]">
                    <div>
                      {upg.costType === 'rubies' ? (
                        <span className="text-pink-300 font-bold">💎 {upg.cost}</span>
                      ) : (
                        <span className="text-yellow-300 font-bold">{formatMoney(upg.cost)}</span>
                      )}
                    </div>

                    {!isUnlocked ? (
                      <button
                        className={`px-3 py-1 rounded text-[9px] font-bold transition-all shadow ${
                          isAvailable && canAfford
                            ? 'bg-yellow-400 hover:bg-yellow-300 text-black'
                            : 'bg-[#2a1a4a] text-purple-400 border border-purple-600/30 cursor-not-allowed'
                        }`}
                        disabled={!isAvailable || !canAfford}
                        onClick={() => handleBuyUpgrade(upg)}
                      >
                        {!prereqMet ? '🔒 PREREQ' : canAfford ? 'PURCHASE' : 'NO FUNDS'}
                      </button>
                    ) : (
                      <span className="text-[9px] text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40">
                        PURCHASED
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── 3. SUBVIEW B: Reputation Milestones ──────────────────────────── */}
      {subview === 'milestones' && (
        <div className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-4 shadow-xl space-y-3 font-pixel">
          <div className="flex items-center justify-between pb-2 border-b border-[#3b2762]">
            <span className="text-xs font-bold text-yellow-300">
              🌐 AGENCY REPUTATION MILESTONES
            </span>
            <span className="text-[10px] text-purple-200">
              Current Rank: <strong className="text-yellow-300">{state.companyReputation}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {REPUTATION_LEVELS.map(rep => {
              const isAchieved = rep.name === state.companyReputation ||
                REPUTATION_LEVELS.findIndex(r => r.name === state.companyReputation) >= REPUTATION_LEVELS.findIndex(r => r.name === rep.name)

              return (
                <div
                  key={rep.name}
                  className={`p-3 rounded-xl border flex flex-col justify-between ${
                    isAchieved
                      ? 'bg-emerald-950/40 border-emerald-500/60'
                      : 'bg-[#150b29] border-[#392461] opacity-70'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[9px] mb-1">
                      <strong className="text-white text-xs">{rep.level}. {rep.name}</strong>
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                        isAchieved ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-400' : 'bg-[#241744] text-purple-400'
                      }`}>
                        {isAchieved ? '✓ UNLOCKED' : '🔒 LOCKED'}
                      </span>
                    </div>
                    <p className="text-[10px] text-purple-300 mt-1">{rep.desc}</p>
                  </div>

                  <div className="mt-2 text-[9px] text-yellow-300 pt-1 border-t border-[#3b2762]">
                    Required Score: <strong>{rep.minScore}+ pts</strong>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── 4. SUBVIEW C: Agency Identity & Stats ────────────────────────── */}
      {subview === 'profile' && (
        <div className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-5 shadow-xl space-y-4 font-pixel">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#3b2762]">
            <div>
              <h3 className="text-sm font-bold text-white">{state.companyName} Operations Profile</h3>
              <p className="text-[10px] text-purple-300 mt-0.5">{state.description}</p>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#120826] border border-yellow-500/40 text-center">
              <span className="text-[8px] text-purple-300 block">COMPANY TIER</span>
              <strong className="text-yellow-300 text-sm">Tier {state.companyTier}{state.companyTierModifier}</strong>
              <span className="text-[8px] text-purple-300 block">({COMPANY_TIER_CONFIG[state.companyTier]?.title})</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#120826] p-3 rounded-xl border border-[#3b2762] text-center">
              <span className="text-[9px] text-purple-400">Progression Score</span>
              <div className="text-sm font-bold text-pink-300 mt-0.5">{state.companyScore || 0} pts</div>
            </div>
            <div className="bg-[#120826] p-3 rounded-xl border border-[#3b2762] text-center">
              <span className="text-[9px] text-purple-400">Max Group Slots</span>
              <div className="text-sm font-bold text-gold mt-0.5">{state.maxGroupSlots || 3} Groups</div>
            </div>
            <div className="bg-[#120826] p-3 rounded-xl border border-[#3b2762] text-center">
              <span className="text-[9px] text-purple-400">Audition Capacity</span>
              <div className="text-sm font-bold text-emerald-300 mt-0.5">{state.auditionCandidateCapacity || 2} Slots</div>
            </div>
            <div className="bg-[#120826] p-3 rounded-xl border border-[#3b2762] text-center">
              <span className="text-[9px] text-purple-400">Concerts Completed</span>
              <div className="text-sm font-bold text-cyan-300 mt-0.5">{state.concertsCompleted || 0}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
