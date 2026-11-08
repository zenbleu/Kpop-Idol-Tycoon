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
    <header className="w-full bg-[#160d2e] border-b-2 border-[#543b8a] shadow-2xl z-40 px-4 sm:px-6 lg:px-8 py-3 flex items-stretch justify-between gap-4 sm:gap-6 flex-shrink-0 font-pixel">
      {/* ─── LEFT SECTION: Company Info on Top, Landing Tabs on Bottom ─── */}
      <div className="flex-1 flex flex-col justify-between gap-2.5 min-w-0">
        {/* Line 1: Company Info Hub & Resource Badges */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap" style={{ marginLeft: 10 }}>
          {/* Brand & CEO Box */}
          <div className="flex items-center gap-2 bg-[#20133f] px-3 py-1.5 rounded-xl border border-[#4d3284] shadow-sm">
            <span className="text-lg select-none leading-none" title={state.logoStyle || 'Emblem'}>
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
                style={{ marginLeft: 20 }}
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
              className="flex items-center gap-1 bg-[#100724] px-2.5 py-1 rounded-lg border border-yellow-500/50 text-yellow-300 text-[9px] sm:text-[10px] font-pixel shadow-inner whitespace-nowrap"
              style={{ marginLeft: 20 }}
              title="Liquid Agency Capital (Won)"
            >
              <span className="text-yellow-400 font-bold">₩</span>
              <span className="font-bold">{formatMoney(state.money).replace('₩', '')}</span>
            </div>

            {/* Rubies (💎) */}
            <div
              className="flex items-center gap-1 bg-[#100724] px-2.5 py-1 rounded-lg border border-pink-500/50 text-pink-300 text-[9px] sm:text-[10px] font-pixel shadow-inner whitespace-nowrap"
              style={{ marginLeft: 20 }}
              title="Premium Rubies"
            >
              <span>💎</span>
              <span className="font-bold">{state.rubies || 0}</span>
            </div>

            {/* Game Calendar */}
            <div
              className="flex items-center gap-1 bg-[#100724] px-2.5 py-1 rounded-lg border border-cyan-500/50 text-cyan-300 text-[9px] sm:text-[10px] font-pixel shadow-inner whitespace-nowrap"
              style={{ marginLeft: 30 }}
              title="Current In-Game Date"
            >
              <span>📅</span>
              <span>Y{state.year}·M{state.month}·W{state.week}</span>
            </div>
          </div>
        </div>

        {/* Line 2 & 3: The 14 Landing Navigation Tabs (Row 1 & Row 2) */}
        <div className="flex flex-col gap-1.5 pt-1 border-t border-[#3e2770]/70">
          {/* Row 1: Dashboard, Agency HQ, Auditions, Idols, Groups, Soloists, Training */}
          <div
            className="flex items-center gap-1 sm:gap-1.5 flex-wrap"
            style={{
              height: 50,
              marginLeft: 15,
              paddingLeft: 0,
              paddingTop: 10,
            }}
          >
            {LANDING_TABS_ROW1.map((tab) => {
              const isActive = currentScreen === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[8px] sm:text-[9px] font-pixel whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 border flex-shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FF2E7E] via-[#A855F7] to-[#6366F1] text-yellow-200 border-yellow-300 font-bold shadow-md shadow-pink-500/30 scale-[1.03]'
                      : 'bg-[#20133f] text-purple-200 border-[#472d7c] hover:border-pink-400 hover:text-white hover:bg-[#2d1b58] hover:scale-[1.02]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="text-[10px] sm:text-xs select-none leading-none">{tab.icon}</span>
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              )
            })}
          </div>

          {/* Row 2: Studio, Planner, Concerts, Wardrobe, News, Stats, Save/Load */}
          <div
            className="flex items-center gap-1 sm:gap-1.5 flex-wrap"
            style={{
              marginLeft: 15,
              marginTop: 0,
              marginBottom: 0,
              marginRight: 0,
              paddingBottom: 0,
              paddingLeft: 0,
              height: 65,
            }}
          >
            {LANDING_TABS_ROW2.map((tab) => {
              const isActive = currentScreen === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[8px] sm:text-[9px] font-pixel whitespace-nowrap transition-all duration-150 flex items-center gap-1.5 border flex-shrink-0 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FF2E7E] via-[#A855F7] to-[#6366F1] text-yellow-200 border-yellow-300 font-bold shadow-md shadow-pink-500/30 scale-[1.03]'
                      : 'bg-[#20133f] text-purple-200 border-[#472d7c] hover:border-pink-400 hover:text-white hover:bg-[#2d1b58] hover:scale-[1.02]'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="text-[10px] sm:text-xs select-none leading-none">{tab.icon}</span>
                  <span className="whitespace-nowrap">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ─── RIGHT SECTION: Mockup-Accurate Next Week (Top, Wide, Glowing) & Guide (Bottom, Narrower, No Glow) ─── */}
      <div className="flex flex-col items-end justify-center flex-shrink-0 self-center">
        {/* Button 1 (Top): Next Week Button — Wide, Glowing Hot-Pink Border, Dark Arcade Body */}
        <button
          onClick={handleNextWeek}
          disabled={advancing}
          style={{
            width: 310,
            height: 70,
            marginBottom: 10,
            marginRight: 10,
            marginTop: 10,
            marginLeft: 50,
          }}
          className={`relative rounded-xl sm:rounded-2xl font-pixel font-bold tracking-widest transition-all duration-200 border-[3px] sm:border-[4px] border-[#FF2E7E] bg-[#1a0d33] hover:bg-[#27134d] active:translate-y-0.5 flex items-center justify-center whitespace-nowrap shadow-xl ${
            advancing
              ? 'opacity-60 cursor-wait'
              : 'kpop-next-week-glow hover:border-[#FFA5CD]'
          }`}
          title="Advance timeline by 1 operational week"
          aria-label="Advance Game Week"
        >
          <span
            className="flex items-center justify-center gap-3 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] whitespace-nowrap"
            style={{ fontSize: 21 }}
          >
            <span className="text-base sm:text-lg">▶</span>
            <span
              style={{
                fontSize: 24,
                textAlign: 'left',
                lineHeight: 'normal',
                width: 250,
                height: 28,
                paddingLeft: 15,
                display: 'inline-block',
              }}
            >
              {advancing ? '⏳ ADVANCING...' : 'NEXT WEEK'}
            </span>
          </span>
        </button>

        {/* Button 2 (Bottom): Guide Button — Right-Aligned Under Next Week, NO Glow, Matching Hot-Pink Border */}
        {onOpenTutorial && (
          <button
            onClick={onOpenTutorial}
            style={{
              width: 120,
              height: 40,
              marginBottom: 0,
              paddingRight: 10,
              paddingLeft: 15,
              marginLeft: 235,
              textAlign: 'right',
              marginRight: 10,
              marginTop: 10,
            }}
            className="rounded-xl sm:rounded-2xl font-pixel font-bold bg-[#1a0d33] hover:bg-[#27134d] text-white hover:text-pink-200 border-[3px] sm:border-[4px] border-[#FF2E7E] hover:border-[#FFA5CD] transition-all whitespace-nowrap active:scale-98 flex items-center justify-center shadow-md"
            title="Open Tycoon Player Guide"
            aria-label="Tycoon Guide"
          >
            <span
              className="text-pink-400 font-bold text-base sm:text-lg"
              style={{ marginLeft: 0, marginRight: 10 }}
            >
              ?
            </span>
            <span className="text-white tracking-widest text-xs sm:text-sm">GUIDE</span>
          </button>
        )}
      </div>
    </header>
  )
}
