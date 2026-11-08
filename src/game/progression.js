/**
 * progression.js — Company Tier calculation, Company Reputation milestones,
 * and comprehensive agency progression scoring.
 */

import {
  COMPANY_TIERS,
  COMPANY_TIER_CONFIG,
  REPUTATION_LEVELS,
} from './balance.js'

/**
 * Calculates the comprehensive company progression score (0–200+).
 */
export function calculateCompanyScore(state) {
  let score = 0

  // 1. Financial stability (up to 30 pts)
  const money = state.money || 0
  if (money >= 1_000_000_000) score += 30
  else if (money >= 500_000_000) score += 25
  else if (money >= 200_000_000) score += 18
  else if (money >= 100_000_000) score += 10
  else if (money >= 50_000_000) score += 5

  // 2. Idol roster & development (up to 35 pts)
  const idols = state.idols || []
  if (idols.length > 0) {
    const avgScore = idols.reduce((s, i) => s + (i.overallScore || 0), 0) / idols.length
    score += (avgScore / 100) * 20

    const highTierCount = idols.filter(i => ['A', 'S', 'P'].includes(i.tier)).length
    score += Math.min(15, highTierCount * 5)
  }

  // 3. Group popularity & discography (up to 45 pts)
  const groups = state.groups || []
  if (groups.length > 0) {
    const maxGroupPop = Math.max(...groups.map(g => g.popularity || 0))
    score += Math.min(25, maxGroupPop * 0.3)

    const totalAlbumsReleased = groups.reduce((s, g) => s + (g.discography?.length || 0), 0)
    score += Math.min(20, totalAlbumsReleased * 4)
  }

  // 4. Upgrades completed (up to 35 pts)
  const upgrades = state.upgrades || []
  score += Math.min(35, upgrades.length * 2.5)

  // 5. Total fanbase (up to 35 pts)
  const totalFans = (groups.reduce((s, g) => s + (g.fanbase || 0), 0)) +
    (idols.reduce((s, i) => s + (i.fanbase || 0), 0))
  if (totalFans >= 500_000) score += 35
  else if (totalFans >= 150_000) score += 28
  else if (totalFans >= 50_000) score += 20
  else if (totalFans >= 10_000) score += 12
  else if (totalFans >= 2_000) score += 6

  // 6. Concert and tour experience (up to 20 pts)
  const concertsCompleted = state.concertsCompleted || 0
  score += Math.min(20, concertsCompleted * 4)

  return Math.round(score)
}

/**
 * Derives Company Tier and + Modifier based on progression score.
 */
export function getCompanyTierFromScore(score) {
  let tier = 'F'
  let hasPlus = false

  if (score >= COMPANY_TIER_CONFIG.P.minScore) {
    tier = 'P'
    hasPlus = score >= COMPANY_TIER_CONFIG.P.minScore + 20
  } else if (score >= COMPANY_TIER_CONFIG.S.minScore) {
    tier = 'S'
    hasPlus = score >= COMPANY_TIER_CONFIG.S.minScore + 18
  } else if (score >= COMPANY_TIER_CONFIG.A.minScore) {
    tier = 'A'
    hasPlus = score >= COMPANY_TIER_CONFIG.A.minScore + 15
  } else if (score >= COMPANY_TIER_CONFIG.B.minScore) {
    tier = 'B'
    hasPlus = score >= COMPANY_TIER_CONFIG.B.minScore + 10
  } else if (score >= COMPANY_TIER_CONFIG.C.minScore) {
    tier = 'C'
    hasPlus = score >= COMPANY_TIER_CONFIG.C.minScore + 10
  } else if (score >= COMPANY_TIER_CONFIG.D.minScore) {
    tier = 'D'
    hasPlus = score >= COMPANY_TIER_CONFIG.D.minScore + 10
  } else {
    tier = 'F'
    hasPlus = score >= 10
  }

  return {
    tier,
    modifier: hasPlus ? '+' : '',
    fullTier: `${tier}${hasPlus ? '+' : ''}`,
  }
}

/**
 * Determines eligible Company Reputation based on milestones.
 */
export function getCompanyReputation(state, score) {
  const groups = state.groups || []
  const concerts = state.concertsCompleted || 0
  const totalAlbums = groups.reduce((s, g) => s + (g.discography?.length || 0), 0)

  // Worldwide: Exceptional score (160+), S/P tier, multi-group discography
  if (score >= 160 && concerts >= 10 && totalAlbums >= 8) {
    return 'Worldwide'
  }
  // Global: Score 120+, sold out major concert, international release
  if (score >= 120 && concerts >= 5 && totalAlbums >= 5) {
    return 'Global'
  }
  // International: Score 80+, concert performed, multi-album history
  if (score >= 80 && concerts >= 2 && totalAlbums >= 3) {
    return 'International'
  }
  // National: Score 50+, released at least 2 albums or had prominent broadcast
  if (score >= 50 && totalAlbums >= 2) {
    return 'National'
  }
  // Regional: Score 25+, debut completed
  if (score >= 25 && (totalAlbums >= 1 || (groups.length > 0 && groups[0].popularity >= 15))) {
    return 'Regional'
  }

  return 'Local'
}
