/**
 * TopBar.jsx — Responsive Side-by-Side Top Panel for K-pop Idol Tycoon.
 * Left: Company Info (Brand, CEO, Tier, Reputation, ₩ Money, 💎 Rubies, 📅 Calendar).
 * Right: All 14 Landing Tabs arranged in a 2-row grid + ALWAYS-VISIBLE Guide & Next Week buttons.
 * Guarantees zero clipping: Wardrobe, News, Stats, Save/Load, Guide, and Next Week are 100% visible!
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
    <header className="w-full bg-[#160d2e] border-b-2 border-[#543b8a] shadow-2xl z-40 px-4 sm:px-6 py-3 flex flex-col gap-2.5 flex-shrink-0 font-pixel">
      {/* ─── TOP ROW: Company Info (Left) + Actions: Guide & Next Week (Right) ─── */}
      <div className="w-full flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
        {/* Left: Agency Info Hub & Resource Badges */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {/* Brand & CEO Box */}
          <div className="flex items-center gap-2.5 bg-[#20133f] px-3.5 py-2 rounded-xl border border-[#4d3284] shadow-sm">
            <span className="text-xl select-none leading-none" title={state.logoStyle || 'Emblem'}>
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
            <div className="flex items-center gap-1.5 ml-1.5">
              <span
                className="px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-pixel border font-bold uppercase tracking-wider whitespace-nowrap"
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
                className="px-2 py-0.5 rounded text-[8px] sm:text-[9px] font-pixel text-purple-200 bg-[#2d1b54] border border-[#5d3b9e] whitespace-nowrap"
                title="Agency Reputation"
              >
                {state.companyReputation || 'Local'}
              </span>
            </div>
          </div>

          {/* Financial & Calendar Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Capital (₩) */}
            <div
              className="flex items-center gap-1.5 bg-[#100724] px-3 py-1.5 rounded-xl border border-yellow-500/50 text-yellow-300 text-[9px] sm:text-[10px] font-pixel shadow-inner whitespace-nowrap"
              title="Liquid Agency Capital (Won)"
            >
              <span className="text-yellow-400 font-bold">₩</span>
              <span className="font-bold">{formatMoney(state.money).replace('₩', '')}</span>
            </div>

            {/* Rubies (💎) */}
            <div
              className="flex items-center gap-1.5 bg-[#100724] px-3 py-1.5 rounded-xl border border-pink-500/50 text-pink-300 text-[9px] sm:text-[10px] font-pixel shadow-inner whitespace-nowrap"
              title="Premium Rubies"
            >
              <span>💎</span>
              <span className="font-bold">{state.rubies || 0}</span>
            </div>

            {/* Game Calendar */}
            <div
              className="flex items-center gap-1.5 bg-[#100724] px-3 py-1.5 rounded-xl border border-cyan-500/50 text-cyan-300 text-[9px] sm:text-[10px] font-pixel shadow-inner whitespace-nowrap"
              title="Current In-Game Date"
            >
              <span>📅</span>
              <span>Y{state.year}·M{state.month}·W{state.week}</span>
            </div>
          </div>
        </div>

        {/* Right: Actions (Guide + Large Glowing Pink Next Week) */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          {/* Guide Button */}
          {onOpenTutorial && (
            <button
              onClick={onOpenTutorial}
              className="px-3.5 py-2.5 rounded-xl text-[9px] sm:text-[10px] font-pixel font-bold bg-[#241445] hover:bg-[#341d63] text-purple-200 hover:text-yellow-300 border border-[#5d3b9e] hover:border-yellow-400 transition-all text-center shadow-md whitespace-nowrap active:scale-95"
              title="Open Tycoon Player Guide"
              aria-label="Tycoon Guide"
            >
              ❓ GUIDE
            </button>
          )}

          {/* Next Week Button — Large, Iconic Hot Pink, Glowing Neon Highlight */}
          <button
            onClick={handleNextWeek}
            disabled={advancing}
            className={`relative px-6 py-2.5 sm:px-7 sm:py-3 rounded-xl text-xs sm:text-sm font-pixel font-bold tracking-wider transition-all duration-200 border-2 active:translate-y-0.5 flex-shrink-0 whitespace-nowrap shadow-lg ${
              advancing
                ? 'bg-[#3b1c34] text-pink-300/60 border-pink-900 cursor-wait shadow-none'
                : 'bg-gradient-to-r from-[#FF2E7E] via-[#FF5493] to-[#E01765] text-white border-[#FFAFD1] hover:brightness-110 active:brightness-95 kpop-next-week-glow'
            }`}
            title="Advance timeline by 1 operational week"
            aria-label="Advance Game Week"
          >
            <span className="flex items-center justify-center gap-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] whitespace-nowrap">
              {advancing ? '⏳ ADVANCING...' : '▶ NEXT WEEK'}
            </span>
          </button>
        </div>
      </div>

      {/* ─── BOTTOM ROW: All 14 Landing Navigation Tabs (Spacious, Clean, No Compactness) ─── */}
      <div className="w-full pt-2 border-t border-[#3e2770]/80 flex flex-col gap-1.5">
        {/* Row 1: Dashboard, Agency HQ, Auditions, Idols, Groups, Soloists, Training */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {LANDING_TABS_ROW1.map((tab) => {
            const isActive = currentScreen === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-[8.5px] sm:text-[9.5px] font-pixel whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 border flex-shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FF2E7E] via-[#A855F7] to-[#6366F1] text-yellow-200 border-yellow-300 font-bold shadow-md shadow-pink-500/30 scale-[1.03]'
                    : 'bg-[#20133f] text-purple-200 border-[#472d7c] hover:border-pink-400 hover:text-white hover:bg-[#2d1b58] hover:scale-[1.02]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="text-[11px] sm:text-xs select-none leading-none">{tab.icon}</span>
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Row 2: Studio, Planner, Concerts, Wardrobe, News, Stats, Save/Load */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {LANDING_TABS_ROW2.map((tab) => {
            const isActive = currentScreen === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-[8.5px] sm:text-[9.5px] font-pixel whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 border flex-shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#FF2E7E] via-[#A855F7] to-[#6366F1] text-yellow-200 border-yellow-300 font-bold shadow-md shadow-pink-500/30 scale-[1.03]'
                    : 'bg-[#20133f] text-purple-200 border-[#472d7c] hover:border-pink-400 hover:text-white hover:bg-[#2d1b58] hover:scale-[1.02]'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="text-[11px] sm:text-xs select-none leading-none">{tab.icon}</span>
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </header>
  )
}
