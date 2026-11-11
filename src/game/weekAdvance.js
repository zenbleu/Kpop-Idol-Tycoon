/**
 * weekAdvance.js — The central weekly progression simulation engine.
 * Simulates all 7 days in chronological order, processes planned activities,
 * stamina, fatigue, contracts, salaries, album productions, 10-minute sales,
 * income distribution loyalty effects, 6-month cooldowns, random events,
 * company tier updates, and builds the Weekly Summary Report.
 */

import { simulateDayActivities, WEEK_DAYS, createEmptyWeeklyPlan } from './schedules.js'
import { calculateAlbumQuality } from './production.js'
import { startAlbumSalesSession, advanceSalesSession } from './sales.js'
import { checkWeeklyRandomEvent } from './events.js'
import { generateMilestoneNews } from './news.js'
import { generateMarketTrends } from './trends.js'
import { calculateCompanyScore, getCompanyTierFromScore, getCompanyReputation } from './progression.js'
import { calculateGroupTier } from './groups.js'
import { updateIdolTier } from './idols.js'
import { saveGameToStorage } from './save.js'

export function advanceGameWeek(state) {
  const currentWeek = state.week || 1
  const currentMonth = state.month || 1
  const currentYear = state.year || 2026
  const totalWeeks = (state.totalWeeksPassed || 0) + 1

  let weeklyGrossIncome = 0
  let weeklyTotalExpenses = 0
  const dailyLogs = []
  const importantEvents = []

  // Copy mutable arrays
  let idols = state.idols.map(i => ({ ...i, stats: { ...i.stats }, contract: { ...i.contract } }))
  let groups = state.groups.map(g => ({ ...g, members: [...g.members], incomeDistribution: { ...g.incomeDistribution } }))
  let productions = state.productions.map(p => ({ ...p }))
  let activeSales = state.activeSales.map(s => ({ ...s }))
  let news = [...state.news]
  let eventLog = [...(state.eventsLog || [])]
  let discography = [...state.discographyHistory]

  // ── 1. Chronological Daily Simulation (Monday – Sunday) ───────────────────
  const weeklyPlan = state.weeklyPlan || createEmptyWeeklyPlan()
  for (const day of WEEK_DAYS) {
    const dayActivities = weeklyPlan[day] || []
    const dayResult = simulateDayActivities({
      day,
      activities: dayActivities,
      idols,
      groups,
      companyReputation: state.companyReputation || 'Local',
    })

    weeklyGrossIncome += dayResult.dayIncome
    weeklyTotalExpenses += dayResult.dayExpenses

    if (dayResult.completedActivityLogs.length > 0) {
      dailyLogs.push(...dayResult.completedActivityLogs)
    }

    // Apply day deltas to idols
    for (const [idolId, deltas] of Object.entries(dayResult.idolDeltas)) {
      const idx = idols.findIndex(i => i.id === idolId)
      if (idx !== -1) {
        const idol = idols[idx]
        const newStamina = Math.max(0, Math.min(idol.maxStamina || 100, (idol.currentStamina ?? 100) + deltas.staminaDelta))
        const newFatigue = Math.max(0, Math.min(100, (idol.fatigue ?? 0) + deltas.fatigueDelta))
        const newLoyalty = Math.max(0, Math.min(100, (idol.loyalty ?? 85) + deltas.loyaltyDelta))
        const newPopularity = Math.max(0, (idol.popularity ?? 0) + deltas.popularityDelta)

        idols[idx] = {
          ...idol,
          currentStamina: newStamina,
          fatigue: newFatigue,
          loyalty: newLoyalty,
          popularity: newPopularity,
        }
      }
    }
  }

  // ── 2. Weekly Salaries & Contracts ────────────────────────────────────────
  let totalSalariesPaid = 0
  for (let idx = 0; idx < idols.length; idx++) {
    const idol = idols[idx]
    if (idol.hasLeft) continue

    const salary = idol.contract?.salaryWeekly || 250_000
    totalSalariesPaid += salary

    // Advance contract duration
    const remWeeks = (idol.contract?.remainingWeeks ?? 52) - 1
    const updatedContract = {
      ...idol.contract,
      remainingWeeks: remWeeks,
    }

    if (remWeeks === 4) {
      importantEvents.push(`⚠️ ${idol.name}'s contract expires in 4 weeks! Prepare renewal terms.`)
    } else if (remWeeks <= 0) {
      importantEvents.push(`🚨 ${idol.name}'s contract has EXPIRED! Renew immediately or risk departure.`)
      updatedContract.status = 'Expired'
    }

    idols[idx] = {
      ...idol,
      contract: updatedContract,
    }
  }
  weeklyTotalExpenses += totalSalariesPaid

  // ── 3. Income Distribution Loyalty & Stability Effects ───────────────────
  for (let gIdx = 0; gIdx < groups.length; gIdx++) {
    const grp = groups[gIdx]
    const groupPct = grp.incomeDistribution?.groupPercent ?? 50
    const companyPct = grp.incomeDistribution?.companyPercent ?? 50

    // Group receives >= 70%: loyalty & training bonuses
    if (groupPct >= 70) {
      const bonus = groupPct >= 85 ? 4 : 2
      groups[gIdx].loyalty = Math.min(100, (grp.loyalty || 85) + bonus)
      for (const mId of grp.members) {
        const mIdx = idols.findIndex(i => i.id === mId)
        if (mIdx !== -1) {
          idols[mIdx].loyalty = Math.min(100, (idols[mIdx].loyalty || 85) + bonus)
        }
      }
    } else if (companyPct >= 70) {
      // Company takes >= 70%: loyalty penalties
      const penalty = companyPct >= 90 ? 4 : 2
      groups[gIdx].loyalty = Math.max(10, (grp.loyalty || 85) - penalty)
      for (const mId of grp.members) {
        const mIdx = idols.findIndex(i => i.id === mId)
        if (mIdx !== -1) {
          idols[mIdx].loyalty = Math.max(10, (idols[mIdx].loyalty || 85) - penalty)
        }
      }
    }

    // Check for low loyalty departure warnings
    for (const mId of grp.members) {
      const mIdx = idols.findIndex(i => i.id === mId)
      if (mIdx !== -1 && idols[mIdx].loyalty < 30) {
        importantEvents.push(`💔 Low loyalty alert: ${idols[mIdx].name} (${idols[mIdx].loyalty}%) is unhappy and considering departure!`)
      }
    }
  }

  // ── 4. Six-Month Cooldown Tracking ────────────────────────────────────────
  for (let idx = 0; idx < idols.length; idx++) {
    const idol = idols[idx]
    if (idol.groupCooldownUntilWeek && totalWeeks >= idol.groupCooldownUntilWeek) {
      idols[idx] = {
        ...idol,
        groupCooldownUntilWeek: null,
      }
      importantEvents.push(`✨ ${idol.name}'s 6-month group departure cooldown has expired! They may now join a group.`)
    }
  }

  // ── 5. Album Production Advancements ──────────────────────────────────────
  const updatedProductions = []
  for (const prod of productions) {
    if (prod.completed) continue

    const nextWeeksComp = prod.weeksCompleted + 1
    const targetGroup = groups.find(g => g.id === prod.targetId)
    const participatingIdols = idols.filter(i => {
      if (prod.targetType === 'group' && targetGroup) {
        return targetGroup.members.includes(i.id)
      }
      return i.id === prod.targetId
    })

    // Consume recording stamina
    for (const idol of participatingIdols) {
      const iIdx = idols.findIndex(i => i.id === idol.id)
      if (iIdx !== -1) {
        idols[iIdx].currentStamina = Math.max(0, idols[iIdx].currentStamina - 15)
        idols[iIdx].fatigue = Math.min(100, idols[iIdx].fatigue + 12)
      }
    }

    if (nextWeeksComp >= prod.totalWeeksRequired) {
      // Production Complete!
      const quality = calculateAlbumQuality({
        releaseType: prod.releaseType,
        genre: prod.genre,
        concept: prod.concept,
        targetIdols: participatingIdols,
        writer: prod.writer,
        producer: prod.producer,
        currentTrends: state.trends,
        equippedClothing: null,
        studioUpgradeLevel: (state.upgrades || []).filter(u => u.startsWith('prod_studio')).length,
      })

      const completedProd = {
        ...prod,
        weeksCompleted: nextWeeksComp,
        completed: true,
        quality,
        completedWeek: currentWeek,
        completedYear: currentYear,
      }

      discography.push(completedProd)
      importantEvents.push(`🎉 "${prod.title}" (${prod.releaseType}) by ${prod.targetName} completed recording with Quality ${quality}/100!`)

      // Generate Comeback News
      const releaseNews = generateMilestoneNews({
        type: 'album_release',
        data: {
          targetName: prod.targetName,
          releaseType: prod.releaseType,
          albumTitle: prod.title,
          genre: prod.genre,
          concept: prod.concept,
        },
        week: currentWeek,
        year: currentYear,
      })
      if (releaseNews) news.unshift(releaseNews)

      // Start 10-Minute Real-Time Sales Session
      const salesSession = startAlbumSalesSession({
        album: completedProd,
        targetType: prod.targetType,
        targetId: prod.targetId,
        targetName: prod.targetName,
        incomeDistribution: targetGroup?.incomeDistribution || { companyPercent: 50, groupPercent: 50 },
        fanbase: targetGroup?.fanbase || 1500,
        popularity: targetGroup?.popularity || 25,
        companyReputation: state.companyReputation || 'Local',
        companyTier: state.companyTier || 'F',
      })
      activeSales.push(salesSession)
    } else {
      updatedProductions.push({
        ...prod,
        weeksCompleted: nextWeeksComp,
      })
    }
  }

  // ── 6. Active Album Sales Advancement ────────────────────────────────────
  let totalSalesCompanyIncome = 0
  const remainingSales = []
  for (const session of activeSales) {
    const { updatedSession, companyEarnedDelta, isComplete } = advanceSalesSession(session)
    totalSalesCompanyIncome += companyEarnedDelta
    if (!isComplete) {
      remainingSales.push(updatedSession)
    } else {
      // Completed sales report
      importantEvents.push(`📈 Album Sales Concluded: "${session.albumTitle}" sold ${updatedSession.copiesSold.toLocaleString()} copies, earning ₩${updatedSession.totalRevenueGenerated.toLocaleString()} total!`)
      const chartNews = generateMilestoneNews({
        type: 'album_sales_complete',
        data: {
          targetName: session.targetName,
          albumTitle: session.albumTitle,
          copiesSold: updatedSession.copiesSold,
        },
        week: currentWeek,
        year: currentYear,
      })
      if (chartNews) news.unshift(chartNews)
    }
  }
  weeklyGrossIncome += totalSalesCompanyIncome

  // ── 7. Random Weekly Events ───────────────────────────────────────────────
  const eventCheck = checkWeeklyRandomEvent(state)
  if (eventCheck) {
    importantEvents.push(`⚡ Event: ${eventCheck.title} — ${eventCheck.outcome.message}`)
    weeklyGrossIncome += Math.max(0, eventCheck.outcome.moneyDelta || 0)
    weeklyTotalExpenses += Math.abs(Math.min(0, eventCheck.outcome.moneyDelta || 0))

    if (eventCheck.outcome.idolPatch) {
      for (const [idolId, patch] of Object.entries(eventCheck.outcome.idolPatch)) {
        const idx = idols.findIndex(i => i.id === idolId)
        if (idx !== -1) {
          idols[idx].popularity = Math.max(0, (idols[idx].popularity || 0) + (patch.popularityDelta || 0))
          idols[idx].fanbase = Math.max(0, (idols[idx].fanbase || 0) + (patch.fanbaseDelta || 0))
          idols[idx].loyalty = Math.max(0, Math.min(100, (idols[idx].loyalty || 0) + (patch.loyaltyDelta || 0)))
        }
      }
    }

    if (eventCheck.outcome.fatigueAllDelta) {
      for (let idx = 0; idx < idols.length; idx++) {
        idols[idx].fatigue = Math.min(100, Math.max(0, idols[idx].fatigue + eventCheck.outcome.fatigueAllDelta))
      }
    }

    eventLog.unshift({
      id: Date.now() + Math.random(),
      title: eventCheck.title,
      message: eventCheck.outcome.message,
      type: eventCheck.type,
      week: currentWeek,
    })
  }

  // ── 8. Recalculate Idol and Group Tiers ───────────────────────────────────
  idols = idols.map(updateIdolTier)
  groups = groups.map(g => ({
    ...g,
    tier: calculateGroupTier(g, idols),
  }))

  // ── 9. Net Financials ─────────────────────────────────────────────────────
  const netWeeklyProfit = weeklyGrossIncome - weeklyTotalExpenses
  const updatedMoney = Math.max(-500_000_000, (state.money || 0) + netWeeklyProfit)

  // ── 10. Company Progression & Reputation ──────────────────────────────────
  const tempState = {
    ...state,
    money: updatedMoney,
    idols,
    groups,
    productions: updatedProductions,
    concertsCompleted: state.concertsCompleted || 0,
    upgrades: state.upgrades || [],
  }
  const newCompanyScore = calculateCompanyScore(tempState)
  const { tier: newTier, modifier: newModifier, fullTier } = getCompanyTierFromScore(newCompanyScore)
  const newReputation = getCompanyReputation(tempState, newCompanyScore)

  if (newTier !== state.companyTier) {
    importantEvents.push(`🏆 Agency promoted to Company Tier ${fullTier}!`)
    const tierNews = generateMilestoneNews({
      type: 'tier_promotion',
      data: { tier: fullTier },
      week: currentWeek,
      year: currentYear,
    })
    if (tierNews) news.unshift(tierNews)
  }

  if (newReputation !== state.companyReputation) {
    importantEvents.push(`🌐 Company achieved "${newReputation}" Reputation milestone!`)
    const repNews = generateMilestoneNews({
      type: 'reputation_promotion',
      data: { reputation: newReputation },
      week: currentWeek,
      year: currentYear,
    })
    if (repNews) news.unshift(repNews)
  }

  // ── 11. Advance Calendar (4 weeks per month, 12 months per year) ──────────
  let nextWeek = currentWeek + 1
  let nextMonth = currentMonth
  let nextYear = currentYear
  if (nextWeek > 4) {
    nextWeek = 1
    nextMonth += 1
    if (nextMonth > 12) {
      nextMonth = 1
      nextYear += 1
    }
  }

  // Rotate market trends every month (week 1)
  const updatedTrends = (nextWeek === 1)
    ? generateMarketTrends(totalWeeks)
    : state.trends

  // ── 12. Create Weekly Summary ─────────────────────────────────────────────
  const weeklySummary = {
    week: currentWeek,
    month: currentMonth,
    year: currentYear,
    income: weeklyGrossIncome,
    expenses: weeklyTotalExpenses,
    netProfit: netWeeklyProfit,
    salariesPaid: totalSalariesPaid,
    dailyLogs,
    importantEvents,
    activeProductionsCount: updatedProductions.length,
    activeSalesCount: remainingSales.length,
    companyTier: fullTier,
    companyReputation: newReputation,
  }

  const nextState = {
    ...state,
    money: updatedMoney,
    companyScore: newCompanyScore,
    companyTier: newTier,
    companyTierModifier: newModifier,
    companyReputation: newReputation,
    week: nextWeek,
    month: nextMonth,
    year: nextYear,
    totalWeeksPassed: totalWeeks,
    idols,
    groups,
    productions: updatedProductions,
    activeSales: remainingSales,
    discographyHistory: discography,
    weeklyPlan: createEmptyWeeklyPlan(), // Fresh planner for the new week!
    completedWeekSummaries: [weeklySummary, ...(state.completedWeekSummaries || [])].slice(0, 24),
    news: news.slice(0, 50),
    eventsLog: eventLog.slice(0, 50),
    trends: updatedTrends,
    totalRevenueEver: (state.totalRevenueEver || 0) + Math.max(0, weeklyGrossIncome),
    totalExpensesEver: (state.totalExpensesEver || 0) + weeklyTotalExpenses,
    weekSummary: weeklySummary,
  }

  // Auto-save
  saveGameToStorage('auto', nextState)

  return nextState
}

export function useWeekAdvance() {
  return {
    advanceWeek: async () => true,
    advancing: false,
  }
}

/**
 * Async pipeline wrapper for week advancement.
 * Dispatches ADVANCE_WEEK or executes advanceGameWeek directly on the state.
 */
export async function advanceWeekPipeline({ state, dispatch, rng } = {}) {
  if (dispatch) {
    if (state && (state.idols || state.groups)) {
      const next = advanceGameWeek(state)
      dispatch({ type: 'INIT_STATE', state: next })
      return next
    }
    dispatch({ type: 'ADVANCE_WEEK' })
    return state
  }
  if (state && (state.idols || state.groups)) {
    return advanceGameWeek(state)
  }
  return state
}
