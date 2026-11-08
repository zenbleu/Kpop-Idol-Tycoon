/**
 * idols.js — Idol data models, procedural generation, stat rating calculations,
 * and audition candidate pools for K-pop Idol Tycoon.
 */

import {
  IDOL_TIER_THRESHOLDS,
  getTierFromScore,
  SPECIALTY_WEIGHTS,
  PERSONALITIES,
} from './balance.js'
import { assetUrl } from '../lib/assets.js'

// Available local portrait image assets
export const PORTRAIT_PATHS = [
  ...Array.from({ length: 20 }, (_, i) => {
    const num = String(i + 1).padStart(2, '0')
    return `/images/actors-portraits/Actor_${num}.jpg`
  }),
  '/images/pool/Ace_Wordwide.jpg',
  '/images/pool/Akira_Worldwide.jpg',
  '/images/pool/Chen_Popular.jpg',
  '/images/pool/Haoran_Worldwide.jpg',
  '/images/pool/Haruto_Rising_star.jpg',
  '/images/pool/Hyunjin_Rising_star.jpg',
  '/images/pool/Jaehyun_Popular.jpg',
  '/images/pool/Jaemin_Rookie.jpg',
  '/images/pool/Jake_Popular.jpg',
  '/images/pool/Jeno_Worldwide.jpg',
  '/images/pool/Jihoon_Rookie.jpg',
  '/images/pool/Jinu_Rookie.jpg',
  '/images/pool/Justin_Rising_star.jpg',
  '/images/pool/Keonho_Popular.jpg',
  '/images/pool/Maki_Rookie.jpg',
  '/images/pool/Sehun_Popular.jpg',
  '/images/pool/Woojin_Rising_star.jpg',
  '/images/pool/Yichen_Rising_star.jpg',
  '/images/pool/Yoshi_Rookie.jpg',
  '/images/pool/Zen_Worldwide.jpg',
]

export const IDOL_NAMES = {
  maleFirst: [
    'Min-jun', 'Seo-jun', 'Ha-joon', 'Do-yoon', 'Eun-woo', 'Si-woo', 'Ji-ho', 'Ye-jun',
    'Yu-jun', 'Joo-won', 'Su-ho', 'Tae-hyung', 'Jung-kook', 'Jimin', 'Seok-jin', 'Yoon-gi',
    'Nam-joon', 'Hyun-woo', 'Bo-gum', 'Kang-in', 'Taemin', 'Min-ho', 'Kai', 'Baek-hyun',
    'Jae-hyun', 'Ren-jun', 'Mark', 'Lucas', 'Felix', 'Bang-chan', 'Hyun-jin', 'Haruto',
  ],
  femaleFirst: [
    'Seo-yeon', 'Seo-yoon', 'Ji-woo', 'Seo-hyun', 'Ha-eun', 'Ha-yoon', 'Min-seo', 'Ji-yoo',
    'Chae-won', 'Ye-eun', 'Jennie', 'Lisa', 'Rosé', 'Ji-soo', 'Nayeon', 'Sana', 'Momo',
    'Jihyo', 'Mina', 'Dahyun', 'Chaeyoung', 'Tzuyu', 'Karina', 'Winter', 'Giselle', 'Ningning',
    'Wonyoung', 'Yujin', 'Hanni', 'Minji', 'Danielle', 'Haerin', 'Hyein', 'Yeji', 'Ryujin',
  ],
  lastNames: [
    'Kim', 'Lee', 'Park', 'Choi', 'Jung', 'Kang', 'Cho', 'Yoon', 'Jang', 'Lim',
    'Han', 'Oh', 'Seo', 'Shin', 'Kwon', 'Hwang', 'Ahn', 'Song', 'Jeon', 'Hong',
  ],
  stageNamePrefixes: [
    'Neo', 'Star', 'V', 'Kai', 'Jay', 'Leo', 'Ray', 'Ren', 'Zen', 'Aero',
    'Nova', 'Luna', 'Joy', 'Eve', 'Belle', 'Mia', 'Aria', 'Sora', 'Hana', 'Rin',
  ],
}

export const NATIONALITIES = [
  { name: 'Korean', weight: 65 },
  { name: 'Japanese', weight: 12 },
  { name: 'Chinese', weight: 8 },
  { name: 'American', weight: 5 },
  { name: 'Thai', weight: 4 },
  { name: 'Canadian', weight: 3 },
  { name: 'Australian', weight: 3 },
]

export const SPECIALTIES = [
  'Vocal specialist',
  'Dance specialist',
  'Rap specialist',
  'All-rounder',
  'Composer',
  'Performer',
  'Entertainer',
]

/**
 * Calculates the idol's weighted overall rating (0–100) based on their specialty.
 */
export function calculateOverallRating(idol) {
  const spec = idol.specialty || 'All-rounder'
  const weights = SPECIALTY_WEIGHTS[spec] || SPECIALTY_WEIGHTS['All-rounder']
  const stats = idol.stats || {}

  let totalWeightedScore = 0
  let totalWeight = 0

  for (const [statKey, weight] of Object.entries(weights)) {
    const val = stats[statKey] ?? (statKey === 'visual' ? (idol.visual ?? 50) : 50)
    totalWeightedScore += val * weight
    totalWeight += weight
  }

  // Also factor visual slightly if not already in weights
  if (!weights.visual && idol.visual) {
    totalWeightedScore += idol.visual * 0.05
    totalWeight += 0.05
  }

  const normalized = totalWeight > 0 ? totalWeightedScore / totalWeight : 50
  return Math.max(0, Math.min(100, Math.round(normalized)))
}

/**
 * Recalculates and updates idol overallScore and tier.
 */
export function updateIdolTier(idol) {
  const overall = calculateOverallRating(idol)
  const tier = getTierFromScore(overall)
  return {
    ...idol,
    overallScore: overall,
    tier,
  }
}

/**
 * Generates an idol profile with initial stats and attributes.
 */
export function generateRandomIdol(options = {}) {
  const id = `idol_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
  const gender = options.gender || (Math.random() < 0.5 ? 'Male' : 'Female')
  const firstNames = gender === 'Male' ? IDOL_NAMES.maleFirst : IDOL_NAMES.femaleFirst
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
  const lastName = IDOL_NAMES.lastNames[Math.floor(Math.random() * IDOL_NAMES.lastNames.length)]
  const fullName = `${lastName} ${firstName}`
  const stageName = options.stageName || (Math.random() < 0.4
    ? IDOL_NAMES.stageNamePrefixes[Math.floor(Math.random() * IDOL_NAMES.stageNamePrefixes.length)]
    : firstName)

  // Nationality
  let nat = 'Korean'
  const r = Math.random() * 100
  let cumulative = 0
  for (const item of NATIONALITIES) {
    cumulative += item.weight
    if (r <= cumulative) {
      nat = item.name
      break
    }
  }

  const age = options.age || (16 + Math.floor(Math.random() * 8)) // 16–23
  const birthMonth = Math.floor(Math.random() * 12) + 1

  // Personality
  const personalityKeys = Object.keys(PERSONALITIES)
  const personality = options.personality || personalityKeys[Math.floor(Math.random() * personalityKeys.length)]

  // Specialty
  const specialty = options.specialty || SPECIALTIES[Math.floor(Math.random() * SPECIALTIES.length)]

  // Potential (F to P, weighted towards C, B, A)
  const potentialRoll = Math.random() * 100
  let potential = 'C'
  if (potentialRoll < 10) potential = 'D'
  else if (potentialRoll < 40) potential = 'C'
  else if (potentialRoll < 75) potential = 'B'
  else if (potentialRoll < 93) potential = 'A'
  else if (potentialRoll < 98) potential = 'S'
  else potential = 'P'

  if (options.minPotential) potential = options.minPotential

  // Target base stat range
  const minBase = options.minStat || 15
  const maxBase = options.maxStat || 45

  const stats = {
    // Main stats
    vocal: randomStat(minBase, maxBase),
    dance: randomStat(minBase, maxBase),
    rap: randomStat(minBase, maxBase),
    stamina: Math.max(60, randomStat(60, 95)),

    // Additional stats
    musical: randomStat(minBase, maxBase),
    language: randomStat(nat === 'Korean' ? 15 : 45, maxBase),
    acting: randomStat(minBase, maxBase),
    fitness: randomStat(minBase, maxBase),
    composition: randomStat(10, maxBase - 5),
    writing: randomStat(10, maxBase - 5),
    choreography: randomStat(minBase, maxBase),
    entertainment: randomStat(minBase, maxBase),
  }

  // Boost specialty stats
  if (specialty === 'Vocal specialist') {
    stats.vocal = Math.min(100, stats.vocal + 20)
    stats.musical = Math.min(100, stats.musical + 15)
  } else if (specialty === 'Dance specialist') {
    stats.dance = Math.min(100, stats.dance + 20)
    stats.fitness = Math.min(100, stats.fitness + 15)
    stats.choreography = Math.min(100, stats.choreography + 15)
  } else if (specialty === 'Rap specialist') {
    stats.rap = Math.min(100, stats.rap + 20)
    stats.writing = Math.min(100, stats.writing + 15)
  } else if (specialty === 'Composer') {
    stats.composition = Math.min(100, stats.composition + 25)
    stats.musical = Math.min(100, stats.musical + 20)
    stats.writing = Math.min(100, stats.writing + 15)
  } else if (specialty === 'Performer') {
    stats.dance = Math.min(100, stats.dance + 15)
    stats.choreography = Math.min(100, stats.choreography + 15)
  } else if (specialty === 'Entertainer') {
    stats.entertainment = Math.min(100, stats.entertainment + 20)
    stats.acting = Math.min(100, stats.acting + 15)
  }

  const visual = randomStat(25, 80)
  const portraitIndex = Math.floor(Math.random() * PORTRAIT_PATHS.length)
  const portrait = options.portrait || PORTRAIT_PATHS[portraitIndex]

  const idol = {
    id,
    name: fullName,
    stageName,
    gender,
    age,
    birthMonth,
    nationality: nat,
    personality,
    specialty,
    potential,
    visual,
    portrait,
    stats,
    popularity: options.popularity ?? Math.floor(Math.random() * 10) + 1,
    fanbase: options.fanbase ?? Math.floor(Math.random() * 500) + 100,
    loyalty: options.loyalty ?? 85,
    fatigue: 0,
    maxStamina: 100,
    currentStamina: 100,
    contract: {
      durationWeeks: 52, // 1 year starting contract
      remainingWeeks: 52,
      salaryWeekly: Math.max(100_000, Math.round((minBase * 25_000) / 10_000) * 10_000),
      signedWeek: 1,
      status: 'Active',
    },
    groupId: null,
    groupRoles: [],
    isSolo: false,
    groupCooldownUntilWeek: null, // For 6-month cooldown after group kick
    retentionCount: 0,
    trainingHistory: [],
    equippedClothing: null,
  }

  return updateIdolTier(idol)
}

function randomStat(min, max) {
  return Math.min(100, Math.max(1, Math.floor(min + Math.random() * (max - min + 1))))
}

/**
 * Audition candidate pool generation
 */
export const AUDITION_TYPES = {
  Streets: {
    name: 'Street Scouting',
    cost: 3_000_000,
    tierRange: 'F–C',
    statRange: [10, 35],
    minRep: 'Local',
    rubyCost: 0,
    description: 'Scout talent in bustling youth districts like Hongdae, Sinchon, and Apgujeong.',
  },
  Domestic: {
    name: 'National Audition Tour',
    cost: 15_000_000,
    tierRange: 'D–B',
    statRange: [25, 55],
    minRep: 'Regional',
    rubyCost: 0,
    description: 'Organize high-profile auditions across Seoul, Busan, Daegu, and Gwangju.',
  },
  International: {
    name: 'Pan-Asian Global Auditions',
    cost: 45_000_000,
    tierRange: 'C–A',
    statRange: [40, 75],
    minRep: 'National',
    rubyCost: 0,
    description: 'Hold auditions in Tokyo, Taipei, Bangkok, and Los Angeles.',
  },
  Global: {
    name: 'Worldwide Scouting Project',
    cost: 120_000_000,
    tierRange: 'B–S',
    statRange: [55, 88],
    minRep: 'International',
    rubyCost: 0,
    description: 'A prestigious worldwide scout search across major music capitals.',
  },
}

/**
 * Ruby Audition Durations and Tier Brackets (Max Tier is A)
 */
export const RUBY_AUDITIONS = {
  '1_week': {
    name: '1-Week Quick Scout',
    rubyCost: 20,
    tierRange: 'F–D',
    statRange: [15, 30],
    description: 'Fast private scouts across local academies.',
  },
  '3_weeks': {
    name: '3-Week Targeted Scout',
    rubyCost: 45,
    tierRange: 'D–C',
    statRange: [30, 48],
    description: 'Vetted prospects scouted directly from performing arts high schools.',
  },
  '1_month': {
    name: '1-Month Premium Search',
    rubyCost: 80,
    tierRange: 'C–B',
    statRange: [45, 68],
    description: 'Elite trainees with notable pre-debut training experience.',
  },
  '2_months': {
    name: '2-Month Master Recruitment',
    rubyCost: 150,
    tierRange: 'A',
    statRange: [70, 86],
    description: 'Top-tier prodigies ready for immediate debut consideration.',
  },
}

/**
 * Generate candidate pool for a given audition
 */
export function generateAuditionCandidates(auditionType, count = 2, genderOverride = null) {
  const config = AUDITION_TYPES[auditionType] || AUDITION_TYPES.Streets
  const [minStat, maxStat] = config.statRange

  const candidates = []
  for (let i = 0; i < count; i++) {
    const candidate = generateRandomIdol({
      gender: genderOverride,
      minStat,
      maxStat,
    })
    // Candidate recruitment cost is proportional to overall score
    candidate.signingCost = Math.round((candidate.overallScore * 200_000 + 1_500_000) / 100_000) * 100_000
    candidates.push(candidate)
  }
  return candidates
}

/**
 * Generate candidates from a Ruby audition
 */
export function generateRubyAuditionCandidates(durationKey, count = 2, gender = 'Male') {
  const config = RUBY_AUDITIONS[durationKey] || RUBY_AUDITIONS['1_week']
  const [minStat, maxStat] = config.statRange

  const candidates = []
  for (let i = 0; i < count; i++) {
    const candidate = generateRandomIdol({
      gender,
      minStat,
      maxStat,
      minPotential: durationKey === '2_months' ? 'A' : (durationKey === '1_month' ? 'B' : 'C'),
    })
    candidate.signingCost = Math.round((candidate.overallScore * 100_000 + 500_000) / 100_000) * 100_000
    candidates.push(candidate)
  }
  return candidates
}
