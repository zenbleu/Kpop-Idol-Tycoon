/**
 * concerts.js — Concerts, World Tours, and Company Grand Concerts.
 * Venues, ticket pricing, attendance simulation, and revenue calculation.
 */

import { CONCERT_VENUES } from './balance.js'

export function calculateConcertAttendance({
  venue,
  fanbase = 1000,
  popularity = 30,
  ticketPrice = 50_000,
  marketingBudget = 5_000_000,
  companyReputation = 'Local',
}) {
  const repMultipliers = {
    Local: 1.0,
    Regional: 1.25,
    National: 1.8,
    International: 2.8,
    Global: 4.5,
    Worldwide: 8.0,
  }
  const repMult = repMultipliers[companyReputation] || 1.0

  // Price sensitivity factor: 50,000 is baseline
  const priceRatio = 50_000 / Math.max(10_000, ticketPrice)
  const priceFactor = Math.pow(priceRatio, 0.7)

  // Marketing boost
  const marketingFactor = 1 + Math.log10(Math.max(1_000_000, marketingBudget) / 1_000_000) * 0.15

  // Demand calculation
  const fanDemand = fanbase * 0.35 * priceFactor
  const casualDemand = (popularity * 120) * repMult * marketingFactor * priceFactor
  const totalDemand = Math.round(fanDemand + casualDemand)

  const ticketsSold = Math.min(venue.capacity, Math.max(50, totalDemand))
  const attendanceRate = Math.min(100, Math.round((ticketsSold / venue.capacity) * 100))

  return {
    ticketsSold,
    attendanceRate,
    isSoldOut: ticketsSold >= venue.capacity,
  }
}

export function executeConcert({
  targetType,
  targetId,
  targetName,
  venueId,
  ticketPrice,
  marketingBudget,
  fanbase,
  popularity,
  companyReputation,
  incomeDistribution = { companyPercent: 50, groupPercent: 50 },
}) {
  const venue = CONCERT_VENUES.find(v => v.id === venueId) || CONCERT_VENUES[0]

  const { ticketsSold, attendanceRate, isSoldOut } = calculateConcertAttendance({
    venue,
    fanbase,
    popularity,
    ticketPrice,
    marketingBudget,
    companyReputation,
  })

  const ticketRevenue = ticketsSold * ticketPrice
  const mdSales = Math.round(ticketRevenue * 0.18) // 18% additional merchandise revenue
  const totalGross = ticketRevenue + mdSales

  const expenses = venue.rentalCost + marketingBudget
  const netProfit = totalGross - expenses

  // Split according to income distribution
  const companySharePct = (incomeDistribution.companyPercent ?? 50) / 100
  const groupSharePct = (incomeDistribution.groupPercent ?? 50) / 100

  const companyEarnings = Math.round(netProfit * companySharePct)
  const groupEarnings = Math.round(netProfit * groupSharePct)

  const popularityGain = Math.round((attendanceRate / 100) * (venue.capacity / 2500) + 2)
  const fanGain = Math.round(ticketsSold * (isSoldOut ? 0.35 : 0.20))

  return {
    venueName: venue.name,
    capacity: venue.capacity,
    ticketsSold,
    attendanceRate,
    isSoldOut,
    ticketRevenue,
    mdSales,
    totalGross,
    expenses,
    netProfit,
    companyEarnings,
    groupEarnings,
    popularityGain,
    fanGain,
    fatigueGain: venue.capacity >= 15000 ? 40 : 25,
  }
}

/**
 * Executes a Multi-City World Tour (3 to 5 tour stops).
 */
export function executeTour({
  group,
  tourName,
  stopsCount = 3,
  marketingPerStop = 15_000_000,
  companyReputation = 'National',
}) {
  const arenaVenue = CONCERT_VENUES.find(v => v.id === 'arena') || CONCERT_VENUES[2]

  let totalGross = 0
  let totalExpenses = 0
  let totalTickets = 0
  let totalFansGained = 0

  for (let i = 0; i < stopsCount; i++) {
    const res = executeConcert({
      targetType: 'group',
      targetId: group.id,
      targetName: group.name,
      venueId: arenaVenue.id,
      ticketPrice: 95_000,
      marketingBudget: marketingPerStop,
      fanbase: group.fanbase,
      popularity: group.popularity,
      companyReputation,
      incomeDistribution: group.incomeDistribution,
    })
    totalGross += res.totalGross
    totalExpenses += res.expenses
    totalTickets += res.ticketsSold
    totalFansGained += res.fanGain
  }

  const netProfit = totalGross - totalExpenses
  const companyEarnings = Math.round(netProfit * ((group.incomeDistribution?.companyPercent ?? 50) / 100))
  const groupEarnings = Math.round(netProfit * ((group.incomeDistribution?.groupPercent ?? 50) / 100))

  return {
    tourName,
    stopsCount,
    totalTickets,
    totalGross,
    totalExpenses,
    netProfit,
    companyEarnings,
    groupEarnings,
    popularityGain: Math.min(25, stopsCount * 4),
    fanGain: totalFansGained,
    fatigueGain: Math.min(80, stopsCount * 22),
  }
}
