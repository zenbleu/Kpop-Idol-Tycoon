/**
 * groups.js — Group formation, roles, automatic Maknae detection,
 * idol removal (6-month cooldown & permanent company removal),
 * group disbandment, and income distribution logic.
 */

import { GROUP_REMOVAL_COOLDOWN_WEEKS } from './balance.js'
import { getTierFromScore } from './balance.js'

/**
 * Automatically identifies the Maknae of a group (the youngest idol).
 * In case of a tie in age, checks birthMonth, then ID as a deterministic tie-breaker.
 */
export function getMaknaeIdol(group, idolRoster) {
  if (!group || !group.members || group.members.length === 0) return null
  const members = idolRoster.filter(a => group.members.includes(a.id))
  if (members.length === 0) return null

  // Sort by age ascending, then birthMonth descending (born later in year = younger), then id
  const sorted = [...members].sort((a, b) => {
    if (a.age !== b.age) return a.age - b.age
    const bmA = a.birthMonth ?? 6
    const bmB = b.birthMonth ?? 6
    if (bmA !== bmB) return bmB - bmA
    return String(a.id).localeCompare(String(b.id))
  })

  return sorted[0]
}

/**
 * Calculates average group tier and stats based on current members.
 */
export function calculateGroupTier(group, idolRoster) {
  const members = idolRoster.filter(a => group.members.includes(a.id))
  if (members.length === 0) return 'F'
  const avgScore = members.reduce((sum, m) => sum + (m.overallScore || 0), 0) / members.length
  return getTierFromScore(avgScore)
}

/**
 * Creates a new group.
 */
export function createGroup({
  name,
  gender, // 'Boy Group' | 'Girl Group'
  memberIds,
  currentWeek,
  idolRoster,
  maxCapacity = 10,
}) {
  if (!name || name.trim() === '') {
    throw new Error('Group name cannot be empty.')
  }
  if (!memberIds || memberIds.length === 0) {
    throw new Error('A group must have at least one member.')
  }
  if (memberIds.length > maxCapacity) {
    throw new Error(`Group cannot exceed ${maxCapacity} members.`)
  }

  // Validate member eligibility
  const requiredGender = gender === 'Boy Group' ? 'Male' : 'Female'
  for (const id of memberIds) {
    const idol = idolRoster.find(a => a.id === id)
    if (!idol) throw new Error(`Idol ${id} not found in company roster.`)
    if (idol.gender !== requiredGender) {
      throw new Error(`${idol.name} (${idol.gender}) cannot be assigned to a ${gender}.`)
    }
    if (idol.groupId) {
      throw new Error(`${idol.name} is already a member of another group.`)
    }
    // Check 6-month cooldown
    if (idol.groupCooldownUntilWeek && idol.groupCooldownUntilWeek > currentWeek) {
      const weeksLeft = idol.groupCooldownUntilWeek - currentWeek
      throw new Error(`${idol.name} is on cooldown from leaving their previous group (${weeksLeft} weeks remaining).`)
    }
  }

  const id = `group_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
  const group = {
    id,
    name: name.trim(),
    gender,
    members: [...memberIds],
    popularity: 5,
    fanbase: 500,
    tier: 'F',
    debutDate: currentWeek,
    incomeDistribution: { companyPercent: 50, groupPercent: 50 },
    loyalty: 85,
    currentProductionId: null,
    isPromoting: false,
    discography: [],
    equippedClothing: null,
  }

  group.tier = calculateGroupTier(group, idolRoster)
  return group
}

/**
 * Validates if group income distribution can be adjusted.
 * Must NOT be changed during active album production or active sales promotion.
 */
export function canAdjustIncomeDistribution(group, activeProductions = [], activeSales = []) {
  if (!group) return { allowed: false, reason: 'Group not found.' }

  // Check active production
  const hasActiveProduction = activeProductions.some(
    p => p.targetId === group.id && !p.completed
  )
  if (hasActiveProduction || group.currentProductionId) {
    return {
      allowed: false,
      reason: 'Income distribution cannot be changed while an album is in active production.',
    }
  }

  // Check active sales
  const hasActiveSales = activeSales.some(
    s => s.targetId === group.id && !s.completed
  )
  if (hasActiveSales || group.isPromoting) {
    return {
      allowed: false,
      reason: 'Income distribution cannot be changed during an active album sales promotion.',
    }
  }

  return { allowed: true }
}

/**
 * Removes an idol from a group (Kick from group).
 * Idol returns to trainee status, retains stats, potential, contract, personality.
 * Receives a 6-month (26 week) cooldown before they can join any group.
 * Group suffers a loyalty and popularity hit.
 */
export function removeIdolFromGroup(group, idolId, currentWeek) {
  if (!group.members.includes(idolId)) {
    throw new Error('Idol is not a member of this group.')
  }

  const updatedMembers = group.members.filter(id => id !== idolId)
  const loyaltyPenalty = 15
  const popularityPenalty = Math.max(1, Math.round(group.popularity * 0.08))

  const updatedGroup = {
    ...group,
    members: updatedMembers,
    loyalty: Math.max(10, (group.loyalty || 80) - loyaltyPenalty),
    popularity: Math.max(0, (group.popularity || 0) - popularityPenalty),
  }

  const cooldownUntil = currentWeek + GROUP_REMOVAL_COOLDOWN_WEEKS

  return {
    updatedGroup,
    cooldownUntil,
    loyaltyPenalty,
    popularityPenalty,
  }
}
