/**
 * CompanyView.jsx — Company headquarters, reputation milestones,
 * and the comprehensive 6-branch company upgrade tree.
 */

import React, { useState } from 'react'
import { useGame, ACTION } from '../game/state.jsx'
import { UPGRADES } from '../game/upgrades.js'
import { REPUTATION_LEVELS, COMPANY_TIER_CONFIG } from '../game/balance.js'
import { playSfx } from '../game/audio.js'

export default function CompanyView() {
  const { state, dispatch } = useGame()
  const [selectedBranch, setSelectedBranch] = useState('All')

  const formatMoney = (val) => '₩' + Math.max(0, val || 0).toLocaleString()

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

  return (
    <div className="company-view-container">
      {/* ── 1. Agency Identity & Profile ────────────────────────────── */}
      <div className="panel company-profile-panel">
        <div className="profile-top-row">
          <div className="agency-emblem-large">
            <span>{state.logoStyle === 'cyber_heart' ? '💖' : (state.logoStyle === 'royal_crown' ? '👑' : (state.logoStyle === 'galaxy_blossom' ? '🌸' : (state.logoStyle === 'retro_diamond' ? '💎' : '⭐')))}</span>
          </div>
          <div className="agency-main-meta">
            <h1 className="agency-name">{state.companyName}</h1>
            <p className="agency-ceo">Chief Executive Officer: <strong>{state.ceoName}</strong></p>
            <p className="agency-desc text-lav">{state.description}</p>
          </div>
          <div className="agency-tier-summary">
            <div className="company-tier-box">
              <span className="small text-lav">COMPANY TIER</span>
              <strong className="tier-display text-gold">{state.companyTier}{state.companyTierModifier}</strong>
              <span className="tiny text-lav">{COMPANY_TIER_CONFIG[state.companyTier]?.title}</span>
            </div>
          </div>
        </div>

        {/* Progression Score Breakdown */}
        <div className="score-breakdown-strip mt-2">
          <div className="score-item">
            <span className="small text-lav">Progression Score:</span>
            <strong className="text-pink">{state.companyScore || 0} pts</strong>
          </div>
          <div className="score-item">
            <span className="small text-lav">Max Group Capacity:</span>
            <strong className="text-gold">{state.maxGroupSlots} Groups</strong>
          </div>
          <div className="score-item">
            <span className="small text-lav">Audition Candidates:</span>
            <strong className="text-green">{state.auditionCandidateCapacity} Slots</strong>
          </div>
          <div className="score-item">
            <span className="small text-lav">Concerts Held:</span>
            <strong className="text-lav">{state.concertsCompleted}</strong>
          </div>
        </div>
      </div>

      {/* ── 2. Reputation Milestones ─────────────────────────────────── */}
      <div className="panel mt-2">
        <div className="panel-title flex items-center justify-between">
          <span>🌐 COMPANY REPUTATION MILESTONES</span>
          <span className="text-gold">CURRENT: {state.companyReputation}</span>
        </div>
        <div className="reputation-grid">
          {REPUTATION_LEVELS.map(rep => {
            const isAchieved = rep.name === state.companyReputation ||
              REPUTATION_LEVELS.findIndex(r => r.name === state.companyReputation) >= REPUTATION_LEVELS.findIndex(r => r.name === rep.name)

            return (
              <div key={rep.name} className={`rep-milestone-card ${isAchieved ? 'achieved' : 'locked'}`}>
                <div className="rep-card-header">
                  <strong>{rep.level}. {rep.name}</strong>
                  <span className={`status-tag ${isAchieved ? 'active' : ''}`}>
                    {isAchieved ? '✓ UNLOCKED' : '🔒 LOCKED'}
                  </span>
                </div>
                <p className="tiny text-lav mt-1">{rep.desc}</p>
                <div className="rep-metric tiny mt-1">Required Score: {rep.minScore}+ pts</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── 3. Upgrades Tree ─────────────────────────────────────────── */}
      <div className="panel mt-2">
        <div className="panel-title flex items-center justify-between">
          <span>🏢 AGENCY UPGRADE TREE</span>
          <span className="small text-gold">UNLOCKED: {state.upgrades.length} / {UPGRADES.length}</span>
        </div>

        {/* Branch Filters */}
        <div className="seg mb-2">
          {branches.map(b => (
            <button
              key={b}
              className={selectedBranch === b ? 'sel' : ''}
              onClick={() => {
                playSfx('click')
                setSelectedBranch(b)
              }}
            >
              {b}
            </button>
          ))}
        </div>

        {/* Upgrades Grid */}
        <div className="upgrades-grid">
          {filteredUpgrades.map(upg => {
            const isUnlocked = state.upgrades.includes(upg.id)
            const prereqMet = !upg.prereq || state.upgrades.includes(upg.prereq)
            const canAfford = upg.costType === 'rubies'
              ? state.rubies >= upg.cost
              : state.money >= upg.cost
            const isAvailable = prereqMet && !isUnlocked

            return (
              <div key={upg.id} className={`upgrade-card ${isUnlocked ? 'unlocked' : (prereqMet ? 'available' : 'locked')}`}>
                <div className="upgrade-card-header">
                  <span className="upgrade-branch-tag">{upg.branch}</span>
                  {isUnlocked && <span className="tag-chip text-green">✓ PURCHASED</span>}
                </div>
                <h3 className="upgrade-name">{upg.name}</h3>
                <p className="upgrade-desc text-lav small">{upg.desc}</p>
                <div className="upgrade-effect small text-gold mt-1">
                  ⚡ {upg.effectDesc}
                </div>

                <div className="upgrade-footer mt-2">
                  <div className="upgrade-cost">
                    {upg.costType === 'rubies' ? (
                      <span className="text-pink">💎 {upg.cost} Rubies</span>
                    ) : (
                      <span className="text-gold">{formatMoney(upg.cost)}</span>
                    )}
                  </div>

                  {!isUnlocked ? (
                    <button
                      className={canAfford && isAvailable ? 'btn-gold' : 'btn-primary'}
                      disabled={!isAvailable || !canAfford}
                      onClick={() => handleBuyUpgrade(upg)}
                    >
                      {!prereqMet ? '🔒 PREREQ REQUIRED' : (canAfford ? 'PURCHASE' : 'INSUFFICIENT FUNDS')}
                    </button>
                  ) : (
                    <button className="btn-primary" disabled>
                      COMPLETED
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
