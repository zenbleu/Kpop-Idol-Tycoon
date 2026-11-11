/**
 * TopBar.jsx — Responsive Side-by-Side Top Panel for K-pop Idol Tycoon.
 * 
 * Features:
 * - Top Status Row: Brand, CEO, Tier, Reputation, ₩ Won, 💎 Rubies, 📅 In-Game Date.
 * - Navigation: Clean two-row 7-column grid layout with consistent gaps.
 *   Guarantees ZERO overlapping, zero clipping, and distinct active indicators.
 * - Actions Cluster: High-visibility Arcade 'NEXT WEEK' advance button and '? GUIDE'.
 */

import React, { useState } from 'react'
import { useGame, ACTION } from '../game/state.jsx'
import { formatMoney } from '../game/balance.js'
import { playSfx } from '../game/audio.js'

export const LANDING_TABS_ROW1 = [
  { id: 'dashboard',   label: 'Dashboard',  icon: '🏠' },
  { id: 'company',     label: 'Agency HQ',  icon: '🏢' },
  { id: 'auditions',   label: 'Auditions',  icon: '✨' },
  { id: 'idols',       label: 'Idols',      icon: '🎤' },
  { id: 'groups',      label: 'Groups',     icon: '👥' },
  { id: 'solo',        label: 'Soloists',   icon: '⭐' },
  { id: 'training',    label: 'Training',   icon: '🏋️' },
]

export const LANDING_TABS_ROW2 = [
  { id: 'production',  label: 'Studio',     icon: '💿' },
  { id: 'schedules',   label: 'Planner',    icon: '📅' },
  { id: 'concerts',    label: 'Concerts',   icon: '🏟️' },
  { id: 'wardrobe',    label: 'Wardrobe',   icon: '👗' },
  { id: 'news',        label: 'News',       icon: '📰' },
  { id: 'statistics',  label: 'Stats',      icon: '📊' },
  { id: 'saveload',    label: 'Save/Load',  icon: '💾' },
]

export default function TopBar({ currentScreen, setScreen, onOpenTutorial }) {
  const { state, dispatch } = useGame()
  const [advancing, setAdvancing] = useState(false)

  const handleNextWeek = () => {
    if (advancing) return
    setAdvancing(true)
    playSfx('click')

    setTimeout(() => {
      dispatch({ type: ACTION.ADVANCE_WEEK })
      setAdvancing(false)
      playSfx('fanfare')
    }, 280)
  }

  const handleTabClick = (tabId) => {
    playSfx('click')
    setScreen(tabId)
  }

  const tierColors = {
    P: '#FFD700',
    S: '#FF6B9D',
    A: '#C084FC',
    B: '#60A5FA',
    C: '#34D399',
    D: '#FBBF24',
    F: '#9CA3AF',
  }

  const tierColor = tierColors[state.companyTier] || '#9CA3AF'

  const emblemMap = {
    neon_star: '⭐',
    cyber_heart: '💖',
    royal_crown: '👑',
    galaxy_blossom: '🌸',
    retro_diamond: '💎',
  }

  const emblemIcon = emblemMap[state.logoStyle] || '🎤'

  return (
    <header className="w-full bg-[#160d2e] border-b-2 border-[#543b8a] shadow-2xl z-40 px-3 sm:px-5 py-2.5 font-pixel">
      <div className="max-w-7xl mx-auto flex flex-col gap-2.5">
        {/* Line 1: Company Brand & Resource Badges */}
        <div className="flex items-center justify-between gap-2 sm:gap-3 flex-wrap">
          {/* Brand & CEO Box */}
          <div className="flex items-center gap-2 bg-[#20133f] px-2.5 py-1.5 rounded-xl border border-[#4d3284] shadow-sm">
            <span className="text-base select-none leading-none" title={state.logoStyle || 'Emblem'}>
              {emblemIcon}
            </span>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-bold text-yellow-300 tracking-wide whitespace-nowrap">
                {state.companyName || 'K-pop Agency'}
              </span>
              <span className="text-[9px] text-purple-300 whitespace-nowrap">
                CEO {state.ceoName || 'Jin'}
              </span>
            </div>
            <div className="flex items-center gap-1.5 ml-1">
              <span
                className="px-2 py-0.5 rounded text-[8px] sm:text-[9px] border font-bold uppercase tracking-wider whitespace-nowrap"
                style={{
                  borderColor: tierColor,
                  color: tierColor,
                  backgroundColor: 'rgba(20, 10, 36, 0.85)',
                }}
                title={`Tier ${state.companyTier}${state.companyTierModifier || ''}`}
              >
                TIER {state.companyTier}{state.companyTierModifier || ''}
              </span>
              <span
                className="px-2 py-0.5 rounded text-[8px] sm:text-[9px] text-purple-200 bg-[#2d1b54] border border-[#5d3b9e] whitespace-nowrap"
                title="Agency Reputation"
              >
                {state.companyReputation || 'Local'}
              </span>
            </div>
          </div>

          {/* Financial & Calendar Badges */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {/* Capital (₩) */}
            <div
              className="flex items-center gap-1 bg-[#100724] px-2.5 py-1.5 rounded-lg border border-yellow-500/50 text-yellow-300 text-[9px] sm:text-[10px] shadow-inner whitespace-nowrap"
              title="Liquid Agency Capital (Won)"
            >
              <span className="text-yellow-400 font-bold">₩</span>
              <span className="font-bold">{formatMoney(state.money).replace('₩', '')}</span>
            </div>

            {/* Rubies (💎) */}
            <div
              className="flex items-center gap-1 bg-[#100724] px-2.5 py-1.5 rounded-lg border border-pink-500/50 text-pink-300 text-[9px] sm:text-[10px] shadow-inner whitespace-nowrap"
              title="Premium Rubies"
            >
              <span>💎</span>
              <span className="font-bold">{state.rubies || 0}</span>
            </div>

            {/* Game Calendar */}
            <div
              className="flex items-center gap-1 bg-[#100724] px-2.5 py-1.5 rounded-lg border border-cyan-500/50 text-cyan-300 text-[9px] sm:text-[10px] shadow-inner whitespace-nowrap"
              title="Current In-Game Date"
            >
              <span>📅</span>
              <span className="font-bold">Y{state.year}·M{state.month}·W{state.week}</span>
            </div>
          </div>
        </div>

        {/* Line 2 & 3: The 14 Landing Navigation Tabs (Structured Grid — No overlap, no clipping) */}
        <div className="flex flex-col gap-1.5 pt-1.5 border-t border-[#3e2770]/70">
          {/* Row 1: Dashboard, Agency HQ, Auditions, Idols, Groups, Soloists, Training */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 sm:gap-1.5">
            {LANDING_TABS_ROW1.map((tab) => {
              const isActive = currentScreen === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`px-2 py-1.5 rounded-lg text-[9px] sm:text-[10px] whitespace-nowrap transition-all duration-150 flex items-center justify-center gap-1 border min-w-0 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FF2E7E] via-[#A855F7] to-[#6366F1] text-yellow-200 border-yellow-300 font-bold shadow-md shadow-pink-500/30'
                      : 'bg-[#20133f] text-purple-200 border-[#472d7c] hover:border-pink-400 hover:text-white hover:bg-[#2d1b58]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="text-[10px] sm:text-xs select-none leading-none flex-shrink-0">{tab.icon}</span>
                  <span className="truncate">{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Row 2: Studio, Planner, Concerts, Wardrobe, News, Stats, Save/Load */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1 sm:gap-1.5">
            {LANDING_TABS_ROW2.map((tab) => {
              const isActive = currentScreen === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`px-2 py-1.5 rounded-lg text-[9px] sm:text-[10px] whitespace-nowrap transition-all duration-150 flex items-center justify-center gap-1 border min-w-0 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FF2E7E] via-[#A855F7] to-[#6366F1] text-yellow-200 border-yellow-300 font-bold shadow-md shadow-pink-500/30'
                      : 'bg-[#20133f] text-purple-200 border-[#472d7c] hover:border-pink-400 hover:text-white hover:bg-[#2d1b58]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="text-[10px] sm:text-xs select-none leading-none flex-shrink-0">{tab.icon}</span>
                  <span className="truncate">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ─── Centered Horizontal Action Buttons: [ NEXT WEEK ]  [ GUIDE ] ─── */}
        <div className="flex items-center justify-center gap-3 pt-1 border-t border-[#3e2770]/40 w-full">
          {/* Next Week Button — Arcade style, Glowing Hot-Pink Border */}
          <button
            onClick={handleNextWeek}
            disabled={advancing}
            className={`w-48 sm:w-56 h-11 sm:h-12 px-4 rounded-xl font-bold tracking-wider transition-all duration-200 border-2 sm:border-[3px] border-[#FF2E7E] bg-[#1a0d33] hover:bg-[#27134d] active:scale-98 flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
              advancing
                ? 'opacity-60 cursor-wait'
                : 'kpop-next-week-glow hover:border-[#FFA5CD]'
            }`}
            title="Advance timeline by 1 operational week"
            aria-label="Advance Game Week"
          >
            <span className="text-sm sm:text-base text-yellow-300 select-none">▶</span>
            <span className="text-xs sm:text-sm text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] whitespace-nowrap">
              {advancing ? '⏳ ADVANCING...' : 'NEXT WEEK'}
            </span>
          </button>

          {/* Guide Button — Placed immediately to the right, vertically aligned */}
          {onOpenTutorial && (
            <button
              onClick={onOpenTutorial}
              className="h-11 sm:h-12 px-4 sm:px-5 rounded-xl font-bold bg-[#1a0d33] hover:bg-[#27134d] text-white hover:text-pink-200 border-2 border-[#543b8a] hover:border-[#FF2E7E] transition-all whitespace-nowrap active:scale-98 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              title="Open Tycoon Player Guide"
              aria-label="Tycoon Guide"
            >
              <span className="text-pink-400 font-bold text-xs sm:text-sm select-none">?</span>
              <span className="text-xs sm:text-sm tracking-wider">GUIDE</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
