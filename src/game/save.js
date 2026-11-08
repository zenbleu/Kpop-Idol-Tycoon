/**
 * save.js — LocalStorage persistence, multi-slot saves, auto-save,
 * JSON export/import with validation, and schema migration.
 */

import { GAME_VERSION, STARTING_RESOURCES } from './balance.js'
import { generateMarketTrends } from './trends.js'
import { createEmptyWeeklyPlan } from './schedules.js'

export const SAVE_KEY_PREFIX = 'kpop_idol_tycoon_slot_'
export const AUTOSAVE_KEY = 'kpop_idol_tycoon_autosave'

export function getInitialGameState(options = {}) {
  return {
    saveVersion: GAME_VERSION,
    started: false,
    companyName: options.companyName || 'StarLight Entertainment',
    ceoName: options.ceoName || 'Producer Jin',
    logoStyle: options.logoStyle || 'neon_star',
    description: options.description || 'A passionate agency dedicated to crafting the next global K-pop sensation.',
    tutorialCompleted: options.tutorialCompleted || false,

    // Resources
    money: STARTING_RESOURCES.money,
    rubies: STARTING_RESOURCES.rubies,
    companyTier: STARTING_RESOURCES.companyTier,
    companyTierModifier: STARTING_RESOURCES.companyTierModifier,
    companyReputation: STARTING_RESOURCES.companyReputation,
    companyScore: 0,

    // Calendar
    year: STARTING_RESOURCES.startYear,
    month: STARTING_RESOURCES.startMonth,
    week: STARTING_RESOURCES.startWeek,
    totalWeeksPassed: 0,

    // Capabilities
    auditionCandidateCapacity: STARTING_RESOURCES.auditionCandidateCapacity,
    maxGroupSlots: STARTING_RESOURCES.maxGroupSlots,
    maxMembersPerGroup: STARTING_RESOURCES.maxMembersPerGroup,
    unlockedTrainingMain2: false,
    unlockedTrainingMain3: false,
    unlockedDomesticAuditions: false,
    unlockedInternationalAuditions: false,
    unlockedGlobalAuditions: false,

    // Rosters
    idols: [],
    groups: [],
    soloArtists: [],
    upgrades: [],
    wardrobeInventory: ['c_f_school', 'c_f_street'], // Starting wardrobe

    // Production & Sales
    productions: [],
    activeSales: [],
    discographyHistory: [],

    // Schedules (7 days)
    weeklyPlan: createEmptyWeeklyPlan(),
    completedWeekSummaries: [],

    // News & Trends
    trends: generateMarketTrends(1),
    news: [
      {
        id: 'news_init',
        type: 'company_founded',
        headline: `[OFFICIAL] ${options.companyName || 'StarLight Entertainment'} officially founded!`,
        detail: 'The new entertainment agency has opened its doors in Seoul, preparing to audition aspiring idol trainees.',
        week: 1,
        year: 2026,
        sentiment: 'gold',
        timestamp: Date.now(),
      },
    ],
    eventsLog: [],

    // Statistics
    concertsCompleted: 0,
    totalAlbumCopiesSold: 0,
    totalRevenueEver: 0,
    totalExpensesEver: 0,

    // UI state
    settings: {
      sfxOn: true,
      scanlines: true,
      animSpeed: 'normal',
    },
    modalQueue: [],
    toasts: [],
    lastSaved: null,
  }
}

/**
 * Validates whether an imported object contains valid save structure.
 */
export function validateSaveData(data) {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Save file is empty or not a valid JSON object.' }
  }
  if (!data.companyName) {
    return { valid: false, error: 'Missing company name.' }
  }
  if (typeof data.money !== 'number') {
    return { valid: false, error: 'Invalid or missing currency balance.' }
  }
  if (!Array.isArray(data.idols)) {
    return { valid: false, error: 'Corrupt idol roster.' }
  }
  return { valid: true }
}

/**
 * Migrates older saves or applies defaults to missing fields.
 */
export function migrateSaveData(raw) {
  const base = getInitialGameState()
  const migrated = {
    ...base,
    ...raw,
    saveVersion: GAME_VERSION,
    weeklyPlan: raw.weeklyPlan || createEmptyWeeklyPlan(),
    upgrades: raw.upgrades || [],
    idols: (raw.idols || []).map(i => ({
      ...i,
      contract: i.contract || { durationWeeks: 52, remainingWeeks: 52, salaryWeekly: 200_000, status: 'Active' },
      loyalty: i.loyalty ?? 85,
      fatigue: i.fatigue ?? 0,
      currentStamina: i.currentStamina ?? (i.stats?.stamina || 100),
      maxStamina: 100,
      groupCooldownUntilWeek: i.groupCooldownUntilWeek ?? null,
      retentionCount: i.retentionCount ?? 0,
    })),
    groups: (raw.groups || []).map(g => ({
      ...g,
      incomeDistribution: g.incomeDistribution || { companyPercent: 50, groupPercent: 50 },
      members: g.members || [],
      loyalty: g.loyalty ?? 85,
    })),
    wardrobeInventory: raw.wardrobeInventory || base.wardrobeInventory,
    trends: raw.trends || base.trends,
    news: raw.news || base.news,
  }
  return migrated
}

/**
 * Saves current state into a specific slot or autosave.
 */
export function saveGameToStorage(slot = 1, state) {
  try {
    const key = slot === 'auto' ? AUTOSAVE_KEY : `${SAVE_KEY_PREFIX}${slot}`
    const payload = {
      ...state,
      lastSaved: Date.now(),
      toasts: [], // Don't persist transient notifications
      modalQueue: [],
    }
    localStorage.setItem(key, JSON.stringify(payload))
    return { success: true, timestamp: payload.lastSaved }
  } catch (err) {
    console.error('Save failed:', err)
    return { success: false, error: err.message }
  }
}

/**
 * Loads game state from a specific slot or autosave.
 */
export function loadGameFromStorage(slot = 1) {
  try {
    const key = slot === 'auto' ? AUTOSAVE_KEY : `${SAVE_KEY_PREFIX}${slot}`
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    const valid = validateSaveData(parsed)
    if (!valid.valid) {
      console.warn('Save invalid:', valid.error)
      return null
    }
    return migrateSaveData(parsed)
  } catch (err) {
    console.error('Load failed:', err)
    return null
  }
}

/**
 * Deletes save from a specific slot.
 */
export function deleteGameFromStorage(slot = 1) {
  try {
    const key = slot === 'auto' ? AUTOSAVE_KEY : `${SAVE_KEY_PREFIX}${slot}`
    localStorage.removeItem(key)
    return true
  } catch (err) {
    console.error('Delete save failed:', err)
    return false
  }
}

/**
 * Inspects all save slots for timestamps & summary info.
 */
export function inspectSaveSlots() {
  const slots = [1, 2, 3, 'auto']
  return slots.map(slot => {
    const key = slot === 'auto' ? AUTOSAVE_KEY : `${SAVE_KEY_PREFIX}${slot}`
    const raw = localStorage.getItem(key)
    if (!raw) return { slot, exists: false }
    try {
      const parsed = JSON.parse(raw)
      return {
        slot,
        exists: true,
        companyName: parsed.companyName,
        ceoName: parsed.ceoName,
        money: parsed.money,
        rubies: parsed.rubies,
        companyTier: parsed.companyTier,
        year: parsed.year,
        month: parsed.month,
        week: parsed.week,
        idolsCount: parsed.idols?.length || 0,
        groupsCount: parsed.groups?.length || 0,
        lastSaved: parsed.lastSaved,
      }
    } catch {
      return { slot, exists: false, error: 'Corrupt' }
    }
  })
}

/**
 * Exports current game state as a formatted JSON string.
 */
export function exportSaveToJSON(state) {
  const cleanState = {
    ...state,
    lastSaved: Date.now(),
    toasts: [],
    modalQueue: [],
  }
  return JSON.stringify(cleanState, null, 2)
}

/**
 * Validates and parses an imported JSON save string.
 */
export function importSaveFromJSON(jsonString) {
  try {
    const parsed = JSON.parse(jsonString)
    const check = validateSaveData(parsed)
    if (!check.valid) {
      return { success: false, error: check.error }
    }
    const migrated = migrateSaveData(parsed)
    return { success: true, state: migrated }
  } catch (err) {
    return { success: false, error: `Invalid JSON syntax: ${err.message}` }
  }
}