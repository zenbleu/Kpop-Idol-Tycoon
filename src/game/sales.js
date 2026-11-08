/**
 * sales.js — Real-time 10-minute album sales simulation,
 * revenue distribution between Company and Group,
 * and offline progress calculation based on real timestamps.
 */

import { ALBUM_SALES_DURATION_SECONDS } from './balance.js'

/**
 * Calculates estimated final sales copies based on quality, fanbase, popularity, and reputation.
 */
export function calculateTotalExpectedSales({
  quality,
  releaseType,
  fanbase = 1000,
  popularity = 20,
  companyReputation = 'Local',
  companyTier = 'F',
}) {
  const repMultipliers = {
    Local: 1.0,
    Regional: 1.5,
    National: 2.8,
    International: 5.5,
    Global: 10.0,
    Worldwide: 22.0,
  }

  const typeMultipliers = {
    Single: 1.2,
    EP: 1.0,
    Album: 0.85,
  }

  const repMult = repMultipliers[companyReputation] || 1.0
  const typeMult = typeMultipliers[releaseType] || 1.0
  const qualityFactor = Math.pow(quality / 50, 1.6)

  // Base sales driven by existing fanbase + popularity reach
  const fanBuyers = fanbase * 0.45
  const casualBuyers = (popularity * 250) * repMult * qualityFactor

  const totalCopies = Math.round((fanBuyers + casualBuyers) * typeMult)
  return Math.max(150, totalCopies)
}

/**
 * Creates a new active sales session.
 */
export function startAlbumSalesSession({
  album,
  targetType,
  targetId,
  targetName,
  incomeDistribution,
  fanbase,
  popularity,
  companyReputation,
  companyTier,
}) {
  const expectedTotalCopies = calculateTotalExpectedSales({
    quality: album.quality,
    releaseType: album.releaseType,
    fanbase,
    popularity,
    companyReputation,
    companyTier,
  })

  const pricePerUnit = album.releaseType === 'Single' ? 6_000 : (album.releaseType === 'EP' ? 16_000 : 25_000)
  const expectedTotalRevenue = expectedTotalCopies * pricePerUnit

  const salesId = `sale_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`

  return {
    id: salesId,
    albumId: album.id,
    albumTitle: album.title,
    releaseType: album.releaseType,
    quality: album.quality,
    targetType,
    targetId,
    targetName,
    pricePerUnit,
    expectedTotalCopies,
    expectedTotalRevenue,
    incomeDistribution: { ...incomeDistribution }, // Snapshot distribution!
    salesStartTime: Date.now(),
    durationSeconds: ALBUM_SALES_DURATION_SECONDS, // 600s
    secondsElapsed: 0,
    copiesSold: 0,
    totalRevenueGenerated: 0,
    companyRevenueCredited: 0,
    groupRevenueCredited: 0,
    completed: false,
    popularityGainApplied: false,
  }
}

/**
 * Updates an ongoing sales session with elapsed time.
 * Returns the incremental revenue and copies sold in this step.
 */
export function advanceSalesSession(session, currentTimestamp = Date.now()) {
  if (session.completed) return { updatedSession: session, companyEarnedDelta: 0, groupEarnedDelta: 0, copiesDelta: 0 }

  const totalElapsed = Math.min(
    session.durationSeconds,
    Math.floor((currentTimestamp - session.salesStartTime) / 1000)
  )

  const progressFraction = Math.min(1.0, totalElapsed / session.durationSeconds)

  // Sales curve: high burst at release (first 30%), steady middle, tail off at end
  // Using an ease-out curve: 1 - (1 - p)^1.4
  const salesCurve = 1 - Math.pow(1 - progressFraction, 1.4)
  const currentTotalCopies = Math.min(session.expectedTotalCopies, Math.round(session.expectedTotalCopies * salesCurve))
  const currentTotalRevenue = currentTotalCopies * session.pricePerUnit

  const companySharePct = (session.incomeDistribution?.companyPercent ?? 50) / 100
  const groupSharePct = (session.incomeDistribution?.groupPercent ?? 50) / 100

  const targetCompanyRevenue = Math.round(currentTotalRevenue * companySharePct)
  const targetGroupRevenue = Math.round(currentTotalRevenue * groupSharePct)

  const companyDelta = Math.max(0, targetCompanyRevenue - (session.companyRevenueCredited || 0))
  const groupDelta = Math.max(0, targetGroupRevenue - (session.groupRevenueCredited || 0))
  const copiesDelta = Math.max(0, currentTotalCopies - (session.copiesSold || 0))

  const isComplete = totalElapsed >= session.durationSeconds

  const updatedSession = {
    ...session,
    secondsElapsed: totalElapsed,
    copiesSold: currentTotalCopies,
    totalRevenueGenerated: currentTotalRevenue,
    companyRevenueCredited: (session.companyRevenueCredited || 0) + companyDelta,
    groupRevenueCredited: (session.groupRevenueCredited || 0) + groupDelta,
    completed: isComplete,
  }

  return {
    updatedSession,
    companyEarnedDelta: companyDelta,
    groupEarnedDelta: groupDelta,
    copiesDelta,
    isComplete,
  }
}

/**
 * Recovers offline progress for all active sales sessions when game loads.
 */
export function processOfflineSales(activeSales = [], currentTimestamp = Date.now()) {
  let totalCompanyPayout = 0
  let totalCopiesSold = 0
  const processedSales = []
  const completedReports = []

  for (const session of activeSales) {
    if (session.completed) {
      processedSales.push(session)
      continue
    }

    const { updatedSession, companyEarnedDelta, copiesDelta, isComplete } = advanceSalesSession(session, currentTimestamp)
    totalCompanyPayout += companyEarnedDelta
    totalCopiesSold += copiesDelta
    processedSales.push(updatedSession)

    if (isComplete && !session.completed) {
      completedReports.push({
        albumTitle: updatedSession.albumTitle,
        targetName: updatedSession.targetName,
        copiesSold: updatedSession.copiesSold,
        totalRevenue: updatedSession.totalRevenueGenerated,
        companyShare: updatedSession.companyRevenueCredited,
        groupShare: updatedSession.groupRevenueCredited,
      })
    }
  }

  return {
    updatedSales: processedSales,
    totalCompanyPayout,
    totalCopiesSold,
    completedReports,
  }
}
