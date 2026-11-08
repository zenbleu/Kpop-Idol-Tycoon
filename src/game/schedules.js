/**
 * schedules.js — 7-day weekly activity planner (Monday through Sunday),
 * multiple activities per day, targets (Idol, Group, Solo, Company),
 * validation, and chronological daily simulation.
 */

export const WEEK_DAYS = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export const ACTIVITY_TYPES = {
  vacation: {
    id: 'vacation',
    name: 'Vacation / Rest',
    category: 'Recovery',
    staminaCost: 0,
    staminaRecovery: 40,
    fatigueReduction: 30,
    costPerPerson: 500_000,
    baseIncome: 0,
    loyaltyBonus: 2,
    popularityGain: 0,
    fanbaseGain: 0,
    desc: 'Relaxation time to recover stamina, soothe accumulated exhaustion, and boost idol loyalty.',
  },
  small_event: {
    id: 'small_event',
    name: 'Small Event (Radio / Local Show)',
    category: 'Promotion',
    staminaCost: 15,
    staminaRecovery: 0,
    fatigueReduction: 0,
    fatigueGain: 12,
    costPerPerson: 300_000,
    baseIncome: 3_500_000,
    loyaltyBonus: 0,
    popularityGain: 2,
    fanbaseGain: 150,
    desc: 'Local radio appearances, regional festival performances, and university campus events.',
  },
  big_event: {
    id: 'big_event',
    name: 'Major Event (TV Show / Music Broadcast)',
    category: 'Promotion',
    staminaCost: 35,
    staminaRecovery: 0,
    fatigueReduction: 0,
    fatigueGain: 25,
    costPerPerson: 1_200_000,
    baseIncome: 14_000_000,
    loyaltyBonus: 1,
    popularityGain: 6,
    fanbaseGain: 800,
    desc: 'National prime-time television variety show, high-profile music stage broadcast, or major brand endorsement.',
  },
  solo_event: {
    id: 'solo_event',
    name: 'Solo Schedule (CF / Drama OST / Photoshoot)',
    category: 'Solo',
    staminaCost: 20,
    staminaRecovery: 0,
    fatigueReduction: 0,
    fatigueGain: 18,
    costPerPerson: 500_000,
    baseIncome: 7_500_000,
    loyaltyBonus: 1,
    popularityGain: 4,
    fanbaseGain: 400,
    desc: 'Individual commercial advertisement, fashion magazine pictorial, or drama soundtrack feature.',
  },
  company_event: {
    id: 'company_event',
    name: 'Company Fanmeeting & Showcase',
    category: 'Company',
    staminaCost: 25,
    staminaRecovery: 0,
    fatigueReduction: 0,
    fatigueGain: 20,
    costPerPerson: 2_000_000,
    baseIncome: 28_000_000,
    loyaltyBonus: 3,
    popularityGain: 5,
    fanbaseGain: 1200,
    desc: 'Special agency-wide fan festival, showcase event, or reality vlog broadcast bringing all fans together.',
  },
}

/**
 * Creates an empty 7-day schedule map.
 */
export function createEmptyWeeklyPlan() {
  return {
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
    Saturday: [],
    Sunday: [],
  }
}

/**
 * Validates adding a planned activity to a given day.
 */
export function validateActivity({
  day,
  activityType,
  targetType,
  targetId,
  currentPlan,
  idols,
  groups,
}) {
  if (!WEEK_DAYS.includes(day)) {
    return { valid: false, error: 'Invalid day of the week.' }
  }

  const typeConfig = ACTIVITY_TYPES[activityType]
  if (!typeConfig) {
    return { valid: false, error: 'Unknown activity type.' }
  }

  // Target validation
  if (targetType === 'idol') {
    const idol = idols.find(a => a.id === targetId)
    if (!idol) return { valid: false, error: 'Target idol not found.' }
    if (idol.hasLeft) return { valid: false, error: 'Idol has left the company.' }
  } else if (targetType === 'group') {
    const group = groups.find(g => g.id === targetId)
    if (!group) return { valid: false, error: 'Target group not found.' }
    if (!group.members || group.members.length === 0) {
      return { valid: false, error: 'Group has no active members.' }
    }
  } else if (targetType === 'solo') {
    const idol = idols.find(a => a.id === targetId && a.isSolo)
    if (!idol) return { valid: false, error: 'Solo artist not found.' }
  }

  // Check stamina warnings
  const dayActivities = currentPlan[day] || []
  let accumulatedStaminaCost = typeConfig.staminaCost
  for (const act of dayActivities) {
    if (act.targetId === targetId || act.targetType === 'company') {
      accumulatedStaminaCost += ACTIVITY_TYPES[act.activityType]?.staminaCost || 0
    }
  }

  let warning = null
  if (accumulatedStaminaCost > 70) {
    warning = 'High stamina demand on this day. Idols may suffer heavy fatigue!'
  }

  return { valid: true, warning }
}

/**
 * Simulates a single day's planned activities.
 */
export function simulateDayActivities({
  day,
  activities = [],
  idols = [],
  groups = [],
  companyReputation = 'Local',
}) {
  let dayIncome = 0
  let dayExpenses = 0
  const idolDeltas = {} // { [idolId]: { staminaDelta, fatigueDelta, loyaltyDelta, popularityDelta } }
  const completedActivityLogs = []

  const repMultipliers = {
    Local: 1.0,
    Regional: 1.3,
    National: 2.0,
    International: 3.5,
    Global: 6.0,
    Worldwide: 12.0,
  }
  const repMult = repMultipliers[companyReputation] || 1.0

  // 1. Process explicit planned activities
  for (const act of activities) {
    const config = ACTIVITY_TYPES[act.activityType]
    if (!config) continue

    // Determine affected idols
    let participatingIdols = []
    if (act.targetType === 'idol' || act.targetType === 'solo') {
      const found = idols.find(i => i.id === act.targetId)
      if (found) participatingIdols.push(found)
    } else if (act.targetType === 'group') {
      const grp = groups.find(g => g.id === act.targetId)
      if (grp) {
        participatingIdols = idols.filter(i => grp.members.includes(i.id))
      }
    } else if (act.targetType === 'company') {
      participatingIdols = idols.filter(i => !i.hasLeft)
    }

    if (participatingIdols.length === 0) continue

    // Calculate costs & income
    const actCost = (config.costPerPerson || 0) * participatingIdols.length
    const actIncome = Math.round((config.baseIncome || 0) * repMult)
    dayExpenses += actCost
    dayIncome += actIncome

    // Apply stat changes to each participating idol
    for (const idol of participatingIdols) {
      if (!idolDeltas[idol.id]) {
        idolDeltas[idol.id] = {
          staminaDelta: 0,
          fatigueDelta: 0,
          loyaltyDelta: 0,
          popularityDelta: 0,
        }
      }

      if (act.activityType === 'vacation') {
        idolDeltas[idol.id].staminaDelta += config.staminaRecovery
        idolDeltas[idol.id].fatigueDelta -= config.fatigueReduction
        idolDeltas[idol.id].loyaltyDelta += config.loyaltyBonus
      } else {
        idolDeltas[idol.id].staminaDelta -= config.staminaCost
        idolDeltas[idol.id].fatigueDelta += config.fatigueGain || 10
        idolDeltas[idol.id].loyaltyDelta += config.loyaltyBonus || 0
        idolDeltas[idol.id].popularityDelta += config.popularityGain || 1
      }
    }

    completedActivityLogs.push({
      day,
      name: config.name,
      targetName: act.targetName || 'Company',
      income: actIncome,
      expenses: actCost,
    })
  }

  // 2. Natural daily rest for idols with NO activity on this day
  const activeIdolIds = new Set(Object.keys(idolDeltas))
  for (const idol of idols) {
    if (!activeIdolIds.has(idol.id) && !idol.hasLeft) {
      // Passive natural overnight rest
      idolDeltas[idol.id] = {
        staminaDelta: 15,
        fatigueDelta: -8,
        loyaltyDelta: 0,
        popularityDelta: 0,
      }
    }
  }

  return {
    dayIncome,
    dayExpenses,
    idolDeltas,
    completedActivityLogs,
  }
}
