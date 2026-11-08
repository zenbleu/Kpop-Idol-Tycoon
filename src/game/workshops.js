/**
 * workshops.js — Talent Workshops & Fan Service Training System
 *
 * Provides dedicated training programs for actors during hiatus or recovery:
 * 1. Method Acting Masterclass (ACT, LANG, XP, Fame)
 * 2. Chemistry & Intimacy Workshop (Mutual pair chemistry, Morale, Fixed CP bonus)
 * 3. Variety & Fan-Service Camp (COMEDY, VISUAL, Loyalty, Fame)
 * 4. Holistic Spa & Morale Retreat (100% Morale restore, Injury rehab, Loyalty)
 * 5. OST Vocal & Stage Coaching (SING, DANCE, XP)
 */
import { A, pushEventLog } from './stateCore.js'
import { grantExp, TIER_STATS } from './actors.js'
import { getChem, applyChemistryDelta, bondKey } from './chemistry.js'

export const WORKSHOPS = [
  {
    id: 'acting',
    title: 'Method Acting Masterclass',
    icon: '🎭',
    category: 'Acting & Emotional Depth',
    cost: 350,
    desc: 'Intensive script analysis, micro-expression control, and crying on cue with veteran drama directors.',
    target: 'solo',
    highlights: ['+3 to +5 ACT Skill', '+1 to +2 LANG Skill', '+35 XP', '+15 Fame', '+5 Morale'],
    skills: { act: [3, 5], lang: [1, 2] },
    xp: 35,
    fame: 15,
    morale: 5,
    loyalty: 2,
  },
  {
    id: 'chemistry',
    title: 'Chemistry & Intimacy Workshop',
    icon: '💖',
    category: 'Co-Star Synergy (Pair)',
    cost: 500,
    desc: 'Sensory intimacy drills, prolonged eye-contact rehearsals, and romantic script reads between two co-stars.',
    target: 'pair',
    highlights: ['+8 to +14 Mutual Chemistry 💕', '+10 Morale (Both)', '+25 XP & Fame (Both)'],
    extraCpBonus: '+4 Extra Chem & +30 Fame if Official Fixed CP',
    chemRange: [8, 14],
    cpChemBonus: 4,
    cpFameBonus: 30,
    xp: 25,
    fame: 25,
    morale: 10,
    loyalty: 5,
  },
  {
    id: 'fan_service',
    title: 'Variety & Fan-Service Camp',
    icon: '✨',
    category: 'Charm & Fan Engagement',
    cost: 400,
    desc: 'Charming variety talk show practice, fan-service interview etiquette, aegyo/flirting timing, and viral social media training.',
    target: 'solo',
    highlights: ['+3 to +5 COMEDY Skill', '+2 to +3 VISUAL Skill', '+15 Loyalty', '+50 Fame', '+12 Morale'],
    skills: { comedy: [3, 5], visual: [2, 3] },
    xp: 25,
    fame: 50,
    morale: 12,
    loyalty: 15,
  },
  {
    id: 'wellness',
    title: 'Holistic Spa & Morale Retreat',
    icon: '🌸',
    category: 'Rest & Injury Recovery',
    cost: 450,
    desc: 'Luxury hot spring relaxation, psychological wellness consultation, and physical therapy. Clears burnout and cuts injury time.',
    target: 'solo',
    allowedWhenInjured: true,
    highlights: ['Restores Morale to 100% 😊', 'Reduces Injury by 2 Weeks 🩹', '+10 Loyalty', '+2 FITNESS Skill'],
    skills: { fitness: [2, 3] },
    fullMorale: true,
    injuryCutWeeks: 2,
    loyalty: 10,
    fame: 10,
    xp: 15,
  },
  {
    id: 'vocal',
    title: 'OST Vocal & Stage Coaching',
    icon: '🎤',
    category: 'Vocal Performance',
    cost: 300,
    desc: 'Breath control, studio microphone technique, and emotional duet singing for drama theme songs and OST singles.',
    target: 'solo',
    highlights: ['+3 to +5 SING Skill', '+1 to +2 DANCE Skill', '+30 XP', '+20 Fame', '+4 Morale'],
    skills: { sing: [3, 5], dance: [1, 2] },
    xp: 30,
    fame: 20,
    morale: 4,
    loyalty: 2,
  },
]

export function getWorkshop(id) {
  return WORKSHOPS.find(w => w.id === id) || null
}

function randRange(min, max, rng = Math.random) {
  const r = typeof rng === 'function' ? rng() : Math.random()
  return Math.floor(r * (max - min + 1)) + min
}

/**
 * Validates whether an actor (or pair) can attend the specified workshop.
 */
export function canAttendWorkshop(workshop, actor, partner = null, money = Infinity) {
  if (!workshop || !actor || !actor.signed) {
    return { ok: false, reason: 'Actor must be signed to your studio.' }
  }
  if (money < workshop.cost) {
    return { ok: false, reason: `Insufficient funds (₩${workshop.cost.toLocaleString()} required).` }
  }
  if (actor.status === 'filming') {
    return { ok: false, reason: 'Actor is actively filming on-set.' }
  }
  if (actor.status === 'injured' && !workshop.allowedWhenInjured) {
    return { ok: false, reason: 'Actor is injured. Choose the Holistic Spa Retreat instead.' }
  }

  if (workshop.target === 'pair') {
    if (!partner || !partner.signed) {
      return { ok: false, reason: 'Select a signed co-star to attend together.' }
    }
    if (partner.id === actor.id) {
      return { ok: false, reason: 'Must choose a different actor as partner.' }
    }
    if (partner.status === 'filming') {
      return { ok: false, reason: `${partner.name} is currently filming on-set.` }
    }
    if (partner.status === 'injured') {
      return { ok: false, reason: `${partner.name} is currently injured.` }
    }
  }

  return { ok: true }
}

/**
 * Executes a workshop session, applying all stat, chemistry, XP, and morale gains.
 */
export function executeWorkshop(state, dispatch, workshopId, primaryActorId, partnerActorId = null, rng = Math.random) {
  const workshop = getWorkshop(workshopId)
  if (!workshop) return { success: false, error: 'Unknown workshop' }

  const actor = state.actors.find(a => a.id === primaryActorId)
  const partner = partnerActorId ? state.actors.find(a => a.id === partnerActorId) : null

  const check = canAttendWorkshop(workshop, actor, partner, state.money)
  if (!check.ok) {
    return { success: false, error: check.reason }
  }

  // 1. Deduct cost
  dispatch({ type: A.ADD_MONEY, amount: -workshop.cost })

  const gains = []
  const currentTierStats = TIER_STATS[actor.tier] || { skillMax: 95 }
  const actorPatch = {}

  // 2. Skill bonuses
  if (workshop.skills) {
    const updatedSkills = { ...(actor.skills || {}) }
    for (const [skillKey, [min, max]] of Object.entries(workshop.skills)) {
      const inc = randRange(min, max, rng)
      const current = updatedSkills[skillKey] || 0
      const capped = Math.min(99, Math.min(currentTierStats.skillMax + 5, current + inc))
      const delta = capped - current
      updatedSkills[skillKey] = capped
      if (delta > 0) {
        gains.push(`+${delta} ${skillKey.toUpperCase()}`)
      }
    }
    actorPatch.skills = updatedSkills
  }

  // 3. XP & Fame
  if (workshop.xp) {
    const expResult = grantExp(actor, workshop.xp)
    actorPatch.exp = expResult.exp
    actorPatch.level = expResult.level
    gains.push(`+${workshop.xp} XP`)
  }

  if (workshop.fame) {
    actorPatch.fame = (actor.fame || 0) + workshop.fame
    gains.push(`+${workshop.fame} Fame`)
  }

  // 4. Morale & Loyalty
  if (workshop.fullMorale) {
    actorPatch.happiness = 100
    gains.push('Morale restored to 100% 😊')
  } else if (workshop.morale) {
    actorPatch.happiness = Math.min(100, (actor.happiness || 70) + workshop.morale)
    gains.push(`+${workshop.morale} Morale`)
  }

  if (workshop.loyalty) {
    actorPatch.loyalty = Math.min(100, (actor.loyalty || 60) + workshop.loyalty)
    gains.push(`+${workshop.loyalty} Loyalty`)
  }

  // 5. Injury rehab
  if (workshop.injuryCutWeeks && actor.status === 'injured') {
    const remaining = Math.max(0, (actor.injuredWeeks || 2) - workshop.injuryCutWeeks)
    actorPatch.injuredWeeks = remaining
    if (remaining === 0) {
      actorPatch.status = 'available'
      gains.push('Injuries fully healed! 🩹')
    } else {
      gains.push(`Injury shortened by ${workshop.injuryCutWeeks} weeks! (${remaining} wks left)`)
    }
  }

  // 6. Chemistry & Intimacy Pair Workshop
  let chemDelta = 0
  let isFixedCP = false
  if (workshop.id === 'chemistry' && partner) {
    isFixedCP = (state.fixedCPs || []).some(
      ([a, b]) => (a === actor.id && b === partner.id) || (a === partner.id && b === actor.id)
    )

    chemDelta = randRange(workshop.chemRange[0], workshop.chemRange[1], rng)
    if (isFixedCP && workshop.cpChemBonus) {
      chemDelta += workshop.cpChemBonus
    }

    const chemPatches = applyChemistryDelta(actor, partner, chemDelta)
    const newChemVal = getChem(chemPatches[actor.id] || actor, partner.id)

    actorPatch.chemistry_map = chemPatches[actor.id]?.chemistry_map || actor.chemistry_map

    const partnerExp = grantExp(partner, workshop.xp)
    const partnerPatch = {
      chemistry_map: chemPatches[partner.id]?.chemistry_map || partner.chemistry_map,
      happiness: Math.min(100, (partner.happiness || 70) + workshop.morale),
      loyalty: Math.min(100, (partner.loyalty || 60) + workshop.loyalty),
      exp: partnerExp.exp,
      level: partnerExp.level,
      fame: (partner.fame || 0) + (isFixedCP ? workshop.fame + workshop.cpFameBonus : workshop.fame),
    }

    if (isFixedCP) {
      actorPatch.fame = (actorPatch.fame || actor.fame || 0) + workshop.cpFameBonus
    }

    dispatch({ type: A.UPDATE_ACTOR, id: partner.id, patch: partnerPatch })

    gains.push(`💕 Mutual Chemistry +${chemDelta} (Now ${newChemVal}%)`)
    if (isFixedCP) {
      gains.push(`💞 Official CP Bonus (+${workshop.cpChemBonus} Chem, +${workshop.cpFameBonus} Fame each)`)
    }
  }

  // Dispatch primary actor patch
  dispatch({ type: A.UPDATE_ACTOR, id: actor.id, patch: actorPatch })

  // Log to studio timeline
  const partnerLabel = partner ? ` & ${partner.name}` : ''
  const logMsg = `🎓 [Workshop] ${actor.name}${partnerLabel} completed ${workshop.title}! (${gains.join(', ')})`
  pushEventLog(dispatch, logMsg, 'gold', state.week)

  return {
    success: true,
    workshop,
    actor,
    partner,
    gains,
    isFixedCP,
    cost: workshop.cost,
  }
}
