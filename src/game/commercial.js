/**
 * commercial.js — Couple (CP) Merchandising, OSTs & Fan-Meetings Engine
 *
 * Implements post-release monetization and couple brand expansion:
 * 1. OST Singles & MVs (weekly recurring royalties for 8 weeks)
 * 2. Collector Photobooks & Photocards (instant high-margin merch drop)
 * 3. World Fan-Meeting Tours (live stage concerts with massive fame & ticket sales)
 * 4. Luxury Couple Brand Endorsements (lucrative sponsored dual-CF campaigns)
 */
import { A, pushToast, pushEventLog } from './stateCore.js'
import { getChem, bondKey } from './chemistry.js'
import { actorDisplayName, grantExp } from './actors.js'
import { fmtMoney } from './ranking.js'
import { SFX } from './audio.js'

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)) }

export const COMMERCIAL_TYPES = {
  ost: {
    id: 'ost',
    name: 'OST Single & Music Video',
    shortName: 'OST & MV',
    icon: '🎵',
    tagline: 'Record lead romantic duet theme with cinematic MV release',
    cost: 250,
    minGrade: 'C',
    durationWeeks: 8,
    cooldownWeeks: 12,
  },
  merch: {
    id: 'merch',
    name: 'Collector Photobook & Photocards',
    shortName: 'Photobook Drop',
    icon: '📸',
    tagline: 'Limited deluxe couple photobook, photocards & acrylic standees',
    cost: 400,
    minGrade: 'B',
    durationWeeks: 0, // instant drop
    cooldownWeeks: 6,
  },
  fan_meeting: {
    id: 'fan_meeting',
    name: 'World Fan-Meeting Tour',
    shortName: 'Fan-Meeting Tour',
    icon: '✈️',
    tagline: 'Live couple concert stage, hi-touch session & world tour talk show',
    cost: 800,
    minGrade: 'A',
    durationWeeks: 0, // instant resolution
    cooldownWeeks: 8,
  },
  endorsement: {
    id: 'endorsement',
    name: 'Luxury Couple Brand CF',
    shortName: 'Brand Endorsement',
    icon: '💎',
    tagline: 'Dual brand ambassador contract for luxury cosmetics or designer fashion',
    cost: 0, // sponsored payout
    minGrade: null,
    durationWeeks: 0, // instant contract payment
    cooldownWeeks: 10,
  },
}

/**
 * Check if a commercial venture can be launched
 */
export function canLaunchCommercial(typeKey, { prod = null, pair = null, state }) {
  const def = COMMERCIAL_TYPES[typeKey]
  if (!def) return { eligible: false, reason: 'Unknown commercial venture' }

  // Check funds
  if ((state.money ?? 0) < def.cost) {
    return { eligible: false, reason: `Insufficient funds (requires ${fmtMoney(def.cost)})` }
  }

  // Identify pair of actors
  let actorA = null
  let actorB = null

  if (pair && pair.length >= 2) {
    actorA = state.actors.find(a => a.id === pair[0])
    actorB = state.actors.find(a => a.id === pair[1])
  } else if (prod) {
    const leads = (prod.leadIds ?? []).map(id => state.actors.find(a => a.id === id)).filter(Boolean)
    if (leads.length >= 2) {
      actorA = leads[0]
      actorB = leads[1]
    } else {
      const cast = (prod.castIds ?? []).map(id => state.actors.find(a => a.id === id)).filter(Boolean)
      if (cast.length >= 2) {
        actorA = cast[0]
        actorB = cast[1]
      }
    }
  }

  if (!actorA || !actorB) {
    return { eligible: false, reason: 'Requires at least 2 signed lead actors' }
  }

  // Both actors must still be signed
  if (!actorA.signed || !actorB.signed) {
    return { eligible: false, reason: 'Both lead actors must still be signed to your studio' }
  }

  // Check if actors are injured
  if (actorA.status === 'injured' || actorB.status === 'injured') {
    return { eligible: false, reason: 'Injured actors cannot participate in tours or shoots' }
  }

  const bKey = bondKey(actorA.id, actorB.id)
  const isFixedCP = (state.fixedCPs ?? []).some(([x, y]) => (x === actorA.id && y === actorB.id) || (x === actorB.id && y === actorA.id))

  // Production-specific checks (OST & Merch)
  if (typeKey === 'ost' || typeKey === 'merch') {
    if (!prod) return { eligible: false, reason: 'Requires a completed drama release' }

    // Check production grade threshold
    const gradeOrder = ['F', 'D', 'C', 'B', 'A', 'S', 'S+']
    const prodGradeIndex = gradeOrder.indexOf(prod.grade ?? 'C')
    const minGradeIndex = gradeOrder.indexOf(def.minGrade)
    if (prodGradeIndex < minGradeIndex) {
      return { eligible: false, reason: `Requires at least Grade ${def.minGrade} release (Drama grade: ${prod.grade ?? '—'})` }
    }

    // Only 1 OST per drama
    if (typeKey === 'ost') {
      const existingOST = (state.commercialVentures ?? []).some(v => v.type === 'ost' && v.prodId === prod.id)
      const pastOST = (state.commercialHistory ?? []).some(v => v.type === 'ost' && v.prodId === prod.id)
      if (existingOST || pastOST) {
        return { eligible: false, reason: 'This drama already has an official OST single release' }
      }
    }

    // Check photobook cooldown on production
    if (typeKey === 'merch') {
      const cooldownKey = `cooldown_merch_${prod.id}`
      const lastWeek = state.commercialCooldowns?.[cooldownKey]
      if (lastWeek && (state.week - lastWeek) < def.cooldownWeeks) {
        const remaining = def.cooldownWeeks - (state.week - lastWeek)
        return { eligible: false, reason: `Merch drop on cooldown for this drama (${remaining} wk left)` }
      }
    }
  }

  // Fan-meeting specific checks
  if (typeKey === 'fan_meeting') {
    const chem = getChem(actorA, actorB.id)
    const gradeOrder = ['F', 'D', 'C', 'B', 'A', 'S', 'S+']
    const prodGradeIndex = prod ? gradeOrder.indexOf(prod.grade ?? 'C') : -1
    const minGradeIndex = gradeOrder.indexOf(def.minGrade)

    const meetsGrade = prodGradeIndex >= minGradeIndex
    const meetsChem = chem >= 55 || isFixedCP

    if (!meetsGrade && !meetsChem) {
      return { eligible: false, reason: `Requires Grade ${def.minGrade} drama OR 55+ Chemistry (Current: ${chem})` }
    }

    if ((actorA.happiness ?? 70) < 30 || (actorB.happiness ?? 70) < 30) {
      return { eligible: false, reason: 'Actors are too exhausted/unhappy for an international tour (Need 30+ Morale)' }
    }

    const cooldownKey = `cooldown_fan_meeting_${bKey}`
    const lastWeek = state.commercialCooldowns?.[cooldownKey]
    if (lastWeek && (state.week - lastWeek) < def.cooldownWeeks) {
      const remaining = def.cooldownWeeks - (state.week - lastWeek)
      return { eligible: false, reason: `Tour cooldown active for this pair (${remaining} wk left)` }
    }
  }

  // Brand Endorsement CF checks
  if (typeKey === 'endorsement') {
    const chem = getChem(actorA, actorB.id)
    if (!isFixedCP && chem < 60) {
      return { eligible: false, reason: `Brand requires Fixed CP status OR 60+ Chemistry (Current: ${chem})` }
    }

    const cooldownKey = `cooldown_endorsement_${bKey}`
    const lastWeek = state.commercialCooldowns?.[cooldownKey]
    if (lastWeek && (state.week - lastWeek) < def.cooldownWeeks) {
      const remaining = def.cooldownWeeks - (state.week - lastWeek)
      return { eligible: false, reason: `Brand exclusivity period active (${remaining} wk left)` }
    }
  }

  return { eligible: true, actorA, actorB, isFixedCP }
}

/**
 * Calculate expected preview rewards for a venture
 */
export function calculateCommercialPreview(typeKey, { prod = null, actorA, actorB, state }) {
  const def = COMMERCIAL_TYPES[typeKey]
  if (!def || !actorA || !actorB) return null

  const isFixedCP = (state.fixedCPs ?? []).some(([x, y]) => (x === actorA.id && y === actorB.id) || (x === actorB.id && y === actorA.id))
  const chem = getChem(actorA, actorB.id)
  const avgVisual = ((actorA.skills?.visual ?? 50) + (actorB.skills?.visual ?? 50)) / 2
  const avgVocal = ((actorA.skills?.vocal ?? 40) + (actorB.skills?.vocal ?? 40)) / 2
  const avgCharm = ((actorA.skills?.charm ?? 50) + (actorB.skills?.charm ?? 50)) / 2

  const gradeMults = { 'S+': 2.4, S: 1.9, A: 1.5, B: 1.2, C: 1.0, D: 0.8, F: 0.6 }
  const pGrade = prod?.grade ?? 'B'
  const gradeMult = gradeMults[pGrade] ?? 1.0

  if (typeKey === 'ost') {
    // 8 weeks of royalties
    const baseRoyalty = 75
    const vocalBonus = (avgVocal / 100) * 0.4
    const chemBonus = (chem / 100) * 0.3
    const cpBonus = isFixedCP ? 0.25 : 0.0

    const weeklyEst = Math.round(baseRoyalty * gradeMult * (1 + vocalBonus + chemBonus + cpBonus))
    const totalEst = weeklyEst * def.durationWeeks

    return {
      cost: def.cost,
      weeklyRoyalty: weeklyEst,
      totalEst,
      durationWeeks: def.durationWeeks,
      fameGain: 12,
      popGain: 2500,
      repGain: 4,
      isFixedCP,
    }
  }

  if (typeKey === 'merch') {
    const baseRev = 850
    const visualBonus = (avgVisual / 100) * 550
    const cpBonus = isFixedCP ? 1.3 : 1.0
    const revenueEst = Math.round((baseRev * (gradeMult * 0.7 + 0.3) + visualBonus) * cpBonus)
    const netProfit = revenueEst - def.cost

    return {
      cost: def.cost,
      revenueEst,
      netProfit,
      fameGain: 35,
      popGain: 4000,
      repGain: 3,
      isFixedCP,
    }
  }

  if (typeKey === 'fan_meeting') {
    const tierBonus = {
      Worldwide: 1200,
      Popular: 700,
      'Rising Star': 350,
      Rookie: 150,
    }
    const leadBonus = (tierBonus[actorA.tier] ?? 200) + (tierBonus[actorB.tier] ?? 200)
    const charmRev = (avgCharm / 100) * 600
    const chemRev = (chem / 100) * 800
    const cpBonus = isFixedCP ? 1.35 : 1.0

    const revenueEst = Math.round((1400 + leadBonus + charmRev + chemRev) * cpBonus)
    const netProfit = revenueEst - def.cost

    return {
      cost: def.cost,
      revenueEst,
      netProfit,
      moraleCost: 8,
      xpGain: 35,
      fameGain: 110,
      popGain: 8000,
      repGain: 8,
      isFixedCP,
    }
  }

  if (typeKey === 'endorsement') {
    const tierContract = {
      Worldwide: 1800,
      Popular: 1100,
      'Rising Star': 600,
      Rookie: 300,
    }
    const leadVal = (tierContract[actorA.tier] ?? 400) + (tierContract[actorB.tier] ?? 400)
    const chemVal = (chem / 100) * 700
    const cpVal = isFixedCP ? 1.3 : 1.0

    const contractPayout = Math.round((600 + leadVal + chemVal) * cpVal)

    return {
      cost: 0,
      revenueEst: contractPayout,
      netProfit: contractPayout,
      fameGain: 45,
      popGain: 6500,
      repGain: 6,
      moraleGain: 6,
      isFixedCP,
    }
  }

  return null
}

/**
 * Launch a commercial venture
 */
export function launchCommercialVenture(typeKey, { prod = null, pair = null, state, dispatch }) {
  const check = canLaunchCommercial(typeKey, { prod, pair, state })
  if (!check.eligible) {
    pushToast(dispatch, check.reason, 'red')
    return false
  }

  const { actorA, actorB, isFixedCP } = check
  const def = COMMERCIAL_TYPES[typeKey]
  const preview = calculateCommercialPreview(typeKey, { prod, actorA, actorB, state })
  if (!preview) return false

  const bKey = bondKey(actorA.id, actorB.id)
  const pairNames = `${actorDisplayName(actorA)} & ${actorDisplayName(actorB)}`
  const week = state.week

  // 1. Deduct cost upfront
  if (def.cost > 0) {
    dispatch({ type: A.ADD_MONEY, amount: -def.cost })
  }

  // 2. Process Venture Execution
  if (typeKey === 'ost') {
    const venture = {
      id: `comm_ost_${prod.id}_${Date.now()}`,
      type: 'ost',
      prodId: prod.id,
      prodTitle: prod.title,
      pairIds: [actorA.id, actorB.id],
      pairNames,
      title: `${prod.title} — Official OST Single & MV`,
      weeksRemaining: def.durationWeeks,
      durationWeeks: def.durationWeeks,
      weeklyRoyalty: preview.weeklyRoyalty,
      totalEarned: 0,
      createdWeek: week,
      isFixedCP,
    }

    dispatch({ type: A.ADD_COMMERCIAL_VENTURE, venture })
    dispatch({ type: A.ADD_REPUTATION, amount: preview.repGain })
    dispatch({ type: A.SET_POPULARITY, value: (state.popularity ?? 0) + preview.popGain })

    // Boost actor stats
    for (const actor of [actorA, actorB]) {
      dispatch({
        type: A.UPDATE_ACTOR,
        id: actor.id,
        patch: {
          fame: (actor.fame ?? 0) + preview.fameGain,
          happiness: clamp((actor.happiness ?? 70) + 4, 0, 100),
        },
      })
      grantExp(actor, 20, dispatch)
    }

    SFX.award()
    pushEventLog(
      dispatch,
      `🎵 Released OST Single & MV for "${prod.title}" starring ${pairNames}! Streaming royalties active for ${def.durationWeeks} weeks (~${fmtMoney(preview.weeklyRoyalty)}/wk).`,
      'gold',
      week
    )

    dispatch({
      type: A.PUSH_MODAL,
      modal: {
        type: 'generic',
        data: {
          title: `🎵 OST & MV RELEASED!`,
          message:
            `The official soundtrack single and music video for "${prod.title}" starring ${pairNames} is now on digital charts!\n\n` +
            `• Estimated weekly streaming royalties: ${fmtMoney(preview.weeklyRoyalty)}/wk for ${def.durationWeeks} weeks\n` +
            `• Studio popularity: +${preview.popGain.toLocaleString()}\n` +
            `• Lead actors fame: +${preview.fameGain} ✨\n\n` +
            `${isFixedCP ? '💕 Fixed CP Shipper Bonus: 25% higher stream count!' : ''}`,
        },
      },
    })
    return true
  }

  if (typeKey === 'merch') {
    const revenue = preview.revenueEst
    dispatch({ type: A.ADD_MONEY, amount: revenue })
    dispatch({ type: A.ADD_REPUTATION, amount: preview.repGain })
    dispatch({ type: A.SET_POPULARITY, value: (state.popularity ?? 0) + preview.popGain })

    // Cooldown on this drama
    dispatch({ type: A.SET_COMMERCIAL_COOLDOWN, key: `cooldown_merch_${prod.id}`, week })

    for (const actor of [actorA, actorB]) {
      dispatch({
        type: A.UPDATE_ACTOR,
        id: actor.id,
        patch: {
          fame: (actor.fame ?? 0) + preview.fameGain,
        },
      })
      grantExp(actor, 15, dispatch)
    }

    const record = {
      id: `merch_${prod.id}_${Date.now()}`,
      type: 'merch',
      prodId: prod.id,
      prodTitle: prod.title,
      pairNames,
      title: `${prod.title} — Collector Photobook & Photocards`,
      revenue,
      cost: def.cost,
      netProfit: preview.netProfit,
      week,
      isFixedCP,
    }
    dispatch({ type: A.ADD_COMMERCIAL_HISTORY, record })

    SFX.cash()
    pushEventLog(
      dispatch,
      `📸 Collector Photobook drop for "${prod.title}" sold out! Revenue: ${fmtMoney(revenue)} (Net: +${fmtMoney(preview.netProfit)}).`,
      'gold',
      week
    )

    dispatch({
      type: A.PUSH_MODAL,
      modal: {
        type: 'generic',
        data: {
          title: `📸 PHOTOBOOK & MERCH DROP SOLD OUT!`,
          message:
            `Collector photobooks and photocard binders for "${prod.title}" starring ${pairNames} flew off the shelves!\n\n` +
            `• Total Gross Revenue: ${fmtMoney(revenue)}\n` +
            `• Net Studio Profit: +${fmtMoney(preview.netProfit)}\n` +
            `• Studio Popularity: +${preview.popGain.toLocaleString()}\n` +
            `• Lead Actors Fame: +${preview.fameGain} ✨\n\n` +
            `${isFixedCP ? '💕 Fixed CP Collector Edition: +30% sales volume from devoted fans!' : ''}`,
        },
      },
    })
    return true
  }

  if (typeKey === 'fan_meeting') {
    const revenue = preview.revenueEst
    dispatch({ type: A.ADD_MONEY, amount: revenue })
    dispatch({ type: A.ADD_REPUTATION, amount: preview.repGain })
    dispatch({ type: A.SET_POPULARITY, value: (state.popularity ?? 0) + preview.popGain })

    // Cooldown on pair
    dispatch({ type: A.SET_COMMERCIAL_COOLDOWN, key: `cooldown_fan_meeting_${bKey}`, week })

    for (const actor of [actorA, actorB]) {
      dispatch({
        type: A.UPDATE_ACTOR,
        id: actor.id,
        patch: {
          fame: (actor.fame ?? 0) + preview.fameGain,
          happiness: clamp((actor.happiness ?? 70) - preview.moraleCost, 10, 100),
        },
      })
      grantExp(actor, preview.xpGain, dispatch)
    }

    // Boost pair chemistry if fixed CP
    if (isFixedCP) {
      dispatch({
        type: A.UPDATE_ACTOR,
        id: actorA.id,
        patch: {
          chemistry_map: {
            ...(actorA.chemistry_map ?? {}),
            [actorB.id]: clamp(getChem(actorA, actorB.id) + 8, 0, 100),
          },
        },
      })
      dispatch({
        type: A.UPDATE_ACTOR,
        id: actorB.id,
        patch: {
          chemistry_map: {
            ...(actorB.chemistry_map ?? {}),
            [actorA.id]: clamp(getChem(actorB, actorA.id) + 8, 0, 100),
          },
        },
      })
    }

    const record = {
      id: `fan_meet_${bKey}_${Date.now()}`,
      type: 'fan_meeting',
      prodId: prod?.id ?? null,
      prodTitle: prod?.title ?? 'Special Stage',
      pairNames,
      title: `${pairNames} — World Fan-Meeting Tour`,
      revenue,
      cost: def.cost,
      netProfit: preview.netProfit,
      week,
      isFixedCP,
    }
    dispatch({ type: A.ADD_COMMERCIAL_HISTORY, record })

    SFX.cheer()
    pushEventLog(
      dispatch,
      `✈️ ${pairNames} World Fan-Meeting Tour packed stadiums! Box Office: ${fmtMoney(revenue)} (+${preview.repGain} rep, +${preview.fameGain} fame).`,
      'gold',
      week
    )

    dispatch({
      type: A.PUSH_MODAL,
      modal: {
        type: 'generic',
        data: {
          title: `✈️ FAN-MEETING TOUR COMPLETED!`,
          message:
            `Stadiums packed across Seoul, Bangkok, and Tokyo for ${pairNames}!\n\n` +
            `• Tour Box Office Revenue: ${fmtMoney(revenue)}\n` +
            `• Net Studio Profit: +${fmtMoney(preview.netProfit)}\n` +
            `• Studio Reputation: +${preview.repGain} · Popularity: +${preview.popGain.toLocaleString()}\n` +
            `• Actors: +${preview.fameGain} Fame · +${preview.xpGain} EXP · (−${preview.moraleCost} energy from travel)\n\n` +
            `${isFixedCP ? '💕 Fixed CP Synergy: Chemistry increased by +8 from unforgettable moments on stage!' : ''}`,
        },
      },
    })
    return true
  }

  if (typeKey === 'endorsement') {
    const revenue = preview.revenueEst
    dispatch({ type: A.ADD_MONEY, amount: revenue })
    dispatch({ type: A.ADD_REPUTATION, amount: preview.repGain })
    dispatch({ type: A.SET_POPULARITY, value: (state.popularity ?? 0) + preview.popGain })

    // Cooldown on pair
    dispatch({ type: A.SET_COMMERCIAL_COOLDOWN, key: `cooldown_endorsement_${bKey}`, week })

    for (const actor of [actorA, actorB]) {
      dispatch({
        type: A.UPDATE_ACTOR,
        id: actor.id,
        patch: {
          fame: (actor.fame ?? 0) + preview.fameGain,
          happiness: clamp((actor.happiness ?? 70) + preview.moraleGain, 0, 100),
        },
      })
      grantExp(actor, 18, dispatch)
    }

    const record = {
      id: `endorse_${bKey}_${Date.now()}`,
      type: 'endorsement',
      prodId: prod?.id ?? null,
      prodTitle: 'Brand Dual CF',
      pairNames,
      title: `${pairNames} — Luxury Brand Dual CF Deal`,
      revenue,
      cost: 0,
      netProfit: revenue,
      week,
      isFixedCP,
    }
    dispatch({ type: A.ADD_COMMERCIAL_HISTORY, record })

    SFX.cash()
    pushEventLog(
      dispatch,
      `💎 ${pairNames} signed luxury dual brand endorsement! Sponsor fee: +${fmtMoney(revenue)} (+${preview.repGain} rep, +${preview.fameGain} fame).`,
      'gold',
      week
    )

    dispatch({
      type: A.PUSH_MODAL,
      modal: {
        type: 'generic',
        data: {
          title: `💎 LUXURY BRAND DEAL SIGNED!`,
          message:
            `Major luxury lifestyle brand signed ${pairNames} for a national billboard and commercial TV campaign!\n\n` +
            `• Sponsor Endorsement Payout: +${fmtMoney(revenue)}\n` +
            `• Studio Reputation: +${preview.repGain} · Popularity: +${preview.popGain.toLocaleString()}\n` +
            `• Actors: +${preview.fameGain} Fame · Morale +${preview.moraleGain} (brand pride)\n\n` +
            `${isFixedCP ? '💕 Fixed CP Power: Iconic couple pairing secured premium dual ambassador rates!' : ''}`,
        },
      },
    })
    return true
  }

  return false
}

/**
 * Ticks active commercial ventures (OST royalties) every week during advanceWeekPipeline
 */
export function tickCommercialVentures(state, dispatch, week) {
  const activeVentures = state.commercialVentures ?? []
  if (!activeVentures.length) {
    return { weeklyCommercialRevenue: 0, activeVentureSummaries: [] }
  }

  let totalWeeklyRoyalty = 0
  const updatedVentures = []
  const completedVentures = []
  const summaries = []

  for (const v of activeVentures) {
    if (v.type === 'ost') {
      const royalty = v.weeklyRoyalty ?? 60
      totalWeeklyRoyalty += royalty
      const remaining = (v.weeksRemaining ?? 1) - 1
      const totalEarned = (v.totalEarned ?? 0) + royalty

      summaries.push({
        title: v.title,
        royalty,
        remaining,
      })

      if (remaining > 0) {
        updatedVentures.push({
          ...v,
          weeksRemaining: remaining,
          totalEarned,
        })
      } else {
        // Venture complete -> move to history
        completedVentures.push({
          ...v,
          weeksRemaining: 0,
          totalEarned,
          completedWeek: week,
        })
      }
    } else {
      updatedVentures.push(v)
    }
  }

  // Update state with updated active ventures
  dispatch({ type: A.SET_COMMERCIAL_VENTURES, ventures: updatedVentures })

  // Archive finished ventures
  for (const finished of completedVentures) {
    dispatch({
      type: A.ADD_COMMERCIAL_HISTORY,
      record: {
        id: finished.id,
        type: finished.type,
        prodId: finished.prodId,
        prodTitle: finished.prodTitle,
        pairNames: finished.pairNames,
        title: finished.title,
        revenue: finished.totalEarned,
        cost: COMMERCIAL_TYPES.ost.cost,
        netProfit: finished.totalEarned - COMMERCIAL_TYPES.ost.cost,
        week,
        isFixedCP: finished.isFixedCP,
      },
    })
    pushEventLog(
      dispatch,
      `🎵 OST chart run for "${finished.prodTitle}" completed! Total lifetime royalties earned: ${fmtMoney(finished.totalEarned)}.`,
      'gold',
      week
    )
  }

  // Payout weekly royalties
  if (totalWeeklyRoyalty > 0) {
    dispatch({ type: A.ADD_MONEY, amount: totalWeeklyRoyalty })
    pushEventLog(
      dispatch,
      `📻 Digital music charts paid ${fmtMoney(totalWeeklyRoyalty)} in active OST royalties this week.`,
      'green',
      week
    )
  }

  return {
    weeklyCommercialRevenue: totalWeeklyRoyalty,
    activeVentureSummaries: summaries,
  }
}
