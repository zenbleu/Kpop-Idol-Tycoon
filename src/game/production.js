/**
 * production.js — Music release production (Single, EP, Full Album),
 * genre/concept synergies, writer & producer assignments, recording progress,
 * and album quality calculation.
 */

import { PRODUCTION_TYPES, GENRES, CONCEPTS } from './balance.js'

export function calculateAlbumQuality({
  releaseType,
  genre,
  concept,
  targetIdols,
  writer,
  producer,
  currentTrends,
  equippedClothing,
  studioUpgradeLevel = 0,
}) {
  if (!targetIdols || targetIdols.length === 0) return 50

  // 1. Core performance skill average (Vocal, Rap, Musicality)
  const avgVocal = targetIdols.reduce((s, i) => s + (i.stats?.vocal || 50), 0) / targetIdols.length
  const avgRap = targetIdols.reduce((s, i) => s + (i.stats?.rap || 50), 0) / targetIdols.length
  const avgMusical = targetIdols.reduce((s, i) => s + (i.stats?.musical || 50), 0) / targetIdols.length

  let performanceScore = 0
  if (genre === 'Hip-hop') {
    performanceScore = avgRap * 0.5 + avgVocal * 0.3 + avgMusical * 0.2
  } else if (genre === 'Ballad') {
    performanceScore = avgVocal * 0.6 + avgMusical * 0.3 + avgRap * 0.1
  } else {
    // Pop, Dance-pop, R&B, Electronic, Rock
    performanceScore = avgVocal * 0.4 + avgRap * 0.3 + avgMusical * 0.3
  }

  // 2. Writer quality
  let writerScore = 55
  if (writer.type === 'idol') {
    const idolWriter = targetIdols.find(i => i.id === writer.id) || writer
    const wStat = (idolWriter.stats?.writing || 50) * 0.6 + (idolWriter.stats?.composition || 50) * 0.4
    writerScore = wStat
    if (idolWriter.personality === 'Creative') writerScore += 10
  } else if (writer.tier === 'Top') {
    writerScore = 80
  } else {
    writerScore = 60
  }

  // 3. Producer quality
  let producerScore = 55
  if (producer.type === 'idol') {
    const idolProd = targetIdols.find(i => i.id === producer.id) || producer
    const pStat = (idolProd.stats?.composition || 50) * 0.6 + (idolProd.stats?.musical || 50) * 0.4
    producerScore = pStat
    if (idolProd.personality === 'Creative') producerScore += 10
  } else if (producer.tier === 'Top') {
    producerScore = 82
  } else {
    producerScore = 62
  }

  // 4. Trend synergy bonus
  let trendBonus = 0
  if (currentTrends) {
    if (currentTrends.genres?.includes(genre)) trendBonus += 8
    if (currentTrends.concepts?.includes(concept)) trendBonus += 8
  }

  // 5. Clothing bonus
  let clothingBonus = 0
  if (equippedClothing) {
    clothingBonus += equippedClothing.qualityBonus || 0
    if (equippedClothing.concept === concept) clothingBonus += 5
  }

  // 6. Studio facility bonus
  const studioBonus = studioUpgradeLevel * 4

  const rawQuality =
    performanceScore * 0.45 +
    writerScore * 0.25 +
    producerScore * 0.20 +
    trendBonus +
    clothingBonus +
    studioBonus

  return Math.max(15, Math.min(100, Math.round(rawQuality)))
}

/**
 * Initializes a new album production.
 */
export function startAlbumProduction({
  targetType, // 'group' | 'solo'
  targetId,
  targetName,
  title,
  releaseType, // 'Single' | 'EP' | 'Album'
  genre,
  concept,
  writer,
  producer,
  currentWeek,
  cost,
}) {
  const typeConfig = PRODUCTION_TYPES[releaseType] || PRODUCTION_TYPES.Single
  const id = `prod_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

  return {
    id,
    targetType,
    targetId,
    targetName,
    title: title.trim(),
    releaseType,
    genre,
    concept,
    writer,
    producer,
    totalWeeksRequired: typeConfig.weeksToProduce,
    weeksCompleted: 0,
    startWeek: currentWeek,
    cost,
    completed: false,
    quality: 0,
  }
}
