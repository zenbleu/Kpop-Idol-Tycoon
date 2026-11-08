/**
 * balance.js — Central game balance configuration for K-pop Idol Tycoon.
 * All core constants, tier thresholds, reputation levels, costs, and multipliers.
 */

export const GAME_VERSION = 1

export const STARTING_RESOURCES = {
  money: 100_000_000, // ₩100,000,000
  rubies: 100,
  companyTier: 'F',
  companyTierModifier: '', // e.g. 'F', 'F+'
  companyReputation: 'Local',
  auditionCandidateCapacity: 2,
  maxGroupSlots: 1, // Starts with 1, up to 5 via upgrades
  maxMembersPerGroup: 10,
  startYear: 2026,
  startMonth: 1,
  startWeek: 1,
}

/**
 * MANDATORY IDOL TIER THRESHOLDS
 * Exact ranges as specified in the game master prompt:
 * F: 0–9
 * D: 10–19
 * C: 20–39
 * B: 40–69
 * A: 70–87
 * S: 88–94
 * P: 95–100
 */
export const IDOL_TIER_THRESHOLDS = [
  { tier: 'P', min: 95, max: 100, color: '#FFD700', bg: '#4A3B00' },
  { tier: 'S', min: 88, max: 94,  color: '#FF6B9D', bg: '#4A1D32' },
  { tier: 'A', min: 70, max: 87,  color: '#C084FC', bg: '#361D4A' },
  { tier: 'B', min: 40, max: 69,  color: '#60A5FA', bg: '#172E4F' },
  { tier: 'C', min: 20, max: 39,  color: '#34D399', bg: '#0F3826' },
  { tier: 'D', min: 10, max: 19,  color: '#FBBF24', bg: '#3D2F0A' },
  { tier: 'F', min: 0,  max: 9,   color: '#9CA3AF', bg: '#252930' },
]

export function getTierFromScore(score) {
  const s = Math.max(0, Math.min(100, Math.round(score)))
  for (const t of IDOL_TIER_THRESHOLDS) {
    if (s >= t.min) return t.tier
  }
  return 'F'
}

/**
 * COMPANY TIERS & PROGRESSION
 */
export const COMPANY_TIERS = ['F', 'D', 'C', 'B', 'A', 'S', 'P']

export const COMPANY_TIER_CONFIG = {
  F: { minScore: 0, title: 'Basement Studio', maxGroups: 1 },
  D: { minScore: 20, title: 'Indie Agency', maxGroups: 2 },
  C: { minScore: 40, title: 'Rising Label', maxGroups: 2 },
  B: { minScore: 60, title: 'Established Entertainment', maxGroups: 3 },
  A: { minScore: 80, title: 'Major Agency', maxGroups: 4 },
  S: { minScore: 120, title: 'Top-Tier Powerhouse', maxGroups: 5 },
  P: { minScore: 160, title: 'Global Entertainment Empire', maxGroups: 5 },
}

/**
 * COMPANY REPUTATION LEVELS (Milestone-based)
 */
export const REPUTATION_LEVELS = [
  { level: 1, name: 'Local', minScore: 0, desc: 'Known only in the local neighborhood and small trainee circles.' },
  { level: 2, name: 'Regional', minScore: 25, desc: 'Recognized in metropolitan areas with steady local media coverage.' },
  { level: 3, name: 'National', minScore: 50, desc: 'Household name in South Korea with consistent national broadcast presence.' },
  { level: 4, name: 'International', minScore: 80, desc: 'Chart-topping acts across Asia, Japan, and Southeast Asia.' },
  { level: 5, name: 'Global', minScore: 120, desc: 'Major worldwide fanbase, Billboard chart entries, European & Americas presence.' },
  { level: 6, name: 'Worldwide', minScore: 160, desc: 'Uncontested global titan shaping world pop culture.' },
]

/**
 * IDOL STAT WEIGHTS BY SPECIALTY
 */
export const SPECIALTY_WEIGHTS = {
  'Vocal specialist': {
    vocal: 0.35, musical: 0.20, stamina: 0.10, entertainment: 0.10, language: 0.05,
    dance: 0.05, rap: 0.05, acting: 0.05, writing: 0.05,
  },
  'Dance specialist': {
    dance: 0.35, fitness: 0.20, choreography: 0.15, stamina: 0.15, vocal: 0.05,
    visual: 0.05, entertainment: 0.05,
  },
  'Rap specialist': {
    rap: 0.35, writing: 0.20, entertainment: 0.15, stamina: 0.15, musical: 0.05,
    dance: 0.05, vocal: 0.05,
  },
  'All-rounder': {
    vocal: 0.20, dance: 0.20, rap: 0.15, stamina: 0.15, musical: 0.10,
    visual: 0.10, entertainment: 0.10,
  },
  'Composer': {
    composition: 0.35, musical: 0.25, writing: 0.15, vocal: 0.10, stamina: 0.10,
    entertainment: 0.05,
  },
  'Performer': {
    dance: 0.25, visual: 0.25, vocal: 0.15, choreography: 0.15, stamina: 0.10,
    entertainment: 0.10,
  },
  'Entertainer': {
    entertainment: 0.35, acting: 0.25, language: 0.15, vocal: 0.10, dance: 0.05,
    stamina: 0.10,
  },
}

/**
 * IDOL PERSONALITY EFFECTS
 */
export const PERSONALITIES = {
  Hardworking: {
    name: 'Hardworking',
    desc: 'Takes pride in rigorous effort. +15% training stat efficiency.',
    trainingBonus: 0.15,
    fatigueMultiplier: 1.0,
    songwritingBonus: 0,
    charismBonus: 0,
  },
  Creative: {
    name: 'Creative',
    desc: 'Spontaneous artistic genius. +20% song composition and lyric writing quality.',
    trainingBonus: 0,
    fatigueMultiplier: 1.0,
    songwritingBonus: 0.20,
    charismBonus: 0,
  },
  Charismatic: {
    name: 'Charismatic',
    desc: 'Naturally magnetic stage aura. +15% popularity and fan acquisition rate.',
    trainingBonus: 0,
    fatigueMultiplier: 1.0,
    songwritingBonus: 0,
    charismBonus: 0.15,
  },
  Perfectionist: {
    name: 'Perfectionist',
    desc: 'Never settles for mediocrity. +10% album and concert quality, but accumulates 15% more fatigue.',
    trainingBonus: 0.05,
    fatigueMultiplier: 1.15,
    songwritingBonus: 0.10,
    charismBonus: 0.05,
  },
  Shy: {
    name: 'Shy',
    desc: 'Reserved at first, but deeply loyal. Recovers stamina faster and builds stronger loyalty with good care.',
    trainingBonus: 0,
    fatigueMultiplier: 0.85,
    songwritingBonus: 0,
    charismBonus: -0.05,
  },
}

/**
 * GROUP ROLES
 */
export const GROUP_ROLES = [
  'Leader',
  'Main vocalist',
  'Lead vocalist',
  'Main dancer',
  'Lead dancer',
  'Main rapper',
  'Lead rapper',
  'Visual',
  'Center',
]

/**
 * ALBUM PRODUCTION CONFIG
 */
export const PRODUCTION_TYPES = {
  Single: {
    name: 'Single',
    weeksToProduce: 1,
    baseCost: 8_000_000,
    trackCount: 2,
    baseSalesMultiplier: 1.0,
    description: 'A punchy 1-week lead single or comeback track.',
  },
  EP: {
    name: 'Mini Album (EP)',
    weeksToProduce: 3,
    baseCost: 22_000_000,
    trackCount: 5,
    baseSalesMultiplier: 1.8,
    description: 'A 3-week extended play showcasing group identity.',
  },
  Album: {
    name: 'Full Album',
    weeksToProduce: 4,
    baseCost: 45_000_000,
    trackCount: 10,
    baseSalesMultiplier: 2.8,
    description: 'A massive 4-week studio album with full promotions.',
  },
}

export const ALBUM_CONFIGS = {
  single: { baseCost: 15_000_000, staminaCost: 25, durationWeeks: 1, name: 'Single' },
  ep: { baseCost: 35_000_000, staminaCost: 40, durationWeeks: 3, name: 'Mini Album (EP)' },
  album: { baseCost: 60_000_000, staminaCost: 55, durationWeeks: 4, name: 'Full Album' },
  Single: { baseCost: 15_000_000, staminaCost: 25, durationWeeks: 1, name: 'Single' },
  EP: { baseCost: 35_000_000, staminaCost: 40, durationWeeks: 3, name: 'Mini Album (EP)' },
  Album: { baseCost: 60_000_000, staminaCost: 55, durationWeeks: 4, name: 'Full Album' },
}

export const WRITERS = [
  { id: 'w_novice', name: 'In-House Trainee Writer', cost: 2_000_000, skill: 10, tier: 'Rookie' },
  { id: 'w_indie', name: 'Rising Indie Songwriter', cost: 6_000_000, skill: 20, tier: 'Mid' },
  { id: 'w_hitmaker', name: 'Veteran Chart Hitmaker', cost: 15_000_000, skill: 35, tier: 'Top' },
  { id: 'w_legend', name: 'Legendary Master Lyricist', cost: 30_000_000, skill: 50, tier: 'Top' },
]

export const PRODUCERS = [
  { id: 'p_rookie', name: 'Underground Beatmaker', cost: 3_000_000, skill: 10, tier: 'Rookie' },
  { id: 'p_engineer', name: 'Seasoned Sound Architect', cost: 8_000_000, skill: 22, tier: 'Mid' },
  { id: 'p_hitmaker', name: 'Top-Tier K-pop Producer', cost: 18_000_000, skill: 38, tier: 'Top' },
  { id: 'p_grammy', name: 'Grammy-Winning Executive Mixer', cost: 38_000_000, skill: 55, tier: 'Top' },
]


export const GENRES = [
  'Pop',
  'Dance-pop',
  'R&B',
  'Hip-hop',
  'Electronic',
  'Ballad',
  'Rock',
]

export const CONCEPTS = ['Pure', 'Cute', 'Chic', 'Sexy']

/**
 * CONCERT VENUES
 */
export const CONCERT_VENUES = [
  {
    id: 'hall',
    name: 'Small Art Hall',
    capacity: 1000,
    rentalCost: 5_000_000,
    minPopularity: 15,
    type: 'Domestic',
    description: 'An intimate 1,000-seat theater for fan club debuts.',
  },
  {
    id: 'theater',
    name: 'Metropolitan Civic Center',
    capacity: 5000,
    rentalCost: 20_000_000,
    minPopularity: 35,
    type: 'Domestic',
    description: 'A 5,000-seat auditorium for established idols.',
  },
  {
    id: 'arena',
    name: 'Olympic Gymnastics Arena',
    capacity: 15000,
    rentalCost: 65_000_000,
    minPopularity: 60,
    type: 'International',
    description: 'The premier 15,000-seat arena for national stars and international tour stops.',
  },
  {
    id: 'stadium',
    name: 'World Cup Grand Stadium',
    capacity: 50000,
    rentalCost: 200_000_000,
    minPopularity: 82,
    type: 'Global',
    description: 'A colossal 50,000-capacity open stadium for global icons.',
  },
]

/**
 * WARDROBE (CLOTHING) ITEMS
 * Tiers F–A: Purchased with Korean Won (₩)
 * Tiers S–P: Purchased with Rubies (💎)
 */
export const WARDROBE_ITEMS = [
  // F–A (Money)
  { id: 'c_f_school', name: 'Vintage School Uniform', tier: 'F', concept: 'Pure', priceType: 'money', price: 2_500_000, qualityBonus: 3, visualBonus: 4 },
  { id: 'c_f_street', name: 'Oversized Street Hoodie', tier: 'F', concept: 'Chic', priceType: 'money', price: 3_000_000, qualityBonus: 3, visualBonus: 5 },
  { id: 'c_d_pastel', name: 'Pastel Knit Cardigans', tier: 'D', concept: 'Cute', priceType: 'money', price: 6_000_000, qualityBonus: 6, visualBonus: 8 },
  { id: 'c_d_denim', name: 'Distressed Denim Set', tier: 'D', concept: 'Chic', priceType: 'money', price: 7_500_000, qualityBonus: 6, visualBonus: 9 },
  { id: 'c_c_sailor', name: 'Seaside Sailor Ensemble', tier: 'C', concept: 'Cute', priceType: 'money', price: 14_000_000, qualityBonus: 10, visualBonus: 13 },
  { id: 'c_c_leather', name: 'Rider Leather Jackets', tier: 'C', concept: 'Sexy', priceType: 'money', price: 18_000_000, qualityBonus: 11, visualBonus: 15 },
  { id: 'c_b_suit', name: 'Tailored Velvet Suits', tier: 'B', concept: 'Chic', priceType: 'money', price: 32_000_000, qualityBonus: 16, visualBonus: 20 },
  { id: 'c_b_ethereal', name: 'Ethereal White Chiffon', tier: 'B', concept: 'Pure', priceType: 'money', price: 35_000_000, qualityBonus: 17, visualBonus: 22 },
  { id: 'c_a_runway', name: 'Haute Couture Runway Gowns', tier: 'A', concept: 'Sexy', priceType: 'money', price: 65_000_000, qualityBonus: 24, visualBonus: 28 },
  { id: 'c_a_cyber', name: 'Cyberpunk Holographic Gear', tier: 'A', concept: 'Chic', priceType: 'money', price: 75_000_000, qualityBonus: 26, visualBonus: 30 },

  // S–P (Rubies)
  { id: 'c_s_crystal', name: 'Diamond Crystal Stage Wear', tier: 'S', concept: 'Sexy', priceType: 'rubies', price: 120, qualityBonus: 35, visualBonus: 38 },
  { id: 'c_s_royal', name: 'Imperial Royal Regalia', tier: 'S', concept: 'Chic', priceType: 'rubies', price: 140, qualityBonus: 38, visualBonus: 40 },
  { id: 'c_p_celestial', name: 'Celestial Deity Starlight Attire', tier: 'P', concept: 'Pure', priceType: 'rubies', price: 250, qualityBonus: 48, visualBonus: 50 },
  { id: 'c_p_neon', name: 'Futuristic Neon Empress Robes', tier: 'P', concept: 'Chic', priceType: 'rubies', price: 300, qualityBonus: 50, visualBonus: 52 },
]

/**
 * 6-MONTH COOLDOWN DURATION (in game weeks)
 * 26 weeks = 6 months
 */
export const GROUP_REMOVAL_COOLDOWN_WEEKS = 26

/**
 * ALBUM SALES DURATION (in real-time seconds)
 * 10 real-world minutes = 600 seconds
 */
export const ALBUM_SALES_DURATION_SECONDS = 600

/**
 * Currency formatter for Korean Won (₩)
 */
export function formatMoney(amount) {
  return '₩' + Math.max(0, Math.round(amount || 0)).toLocaleString()
}

