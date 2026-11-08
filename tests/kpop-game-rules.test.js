import test from 'node:test'
import assert from 'node:assert/strict'
import {
  getTierFromScore,
  IDOL_TIER_THRESHOLDS,
  GROUP_REMOVAL_COOLDOWN_WEEKS,
  STARTING_RESOURCES,
} from '../src/game/balance.js'
import {
  generateRandomIdol,
  calculateOverallRating,
  updateIdolTier,
} from '../src/game/idols.js'
import {
  createGroup,
  getMaknaeIdol,
  removeIdolFromGroup,
  canAdjustIncomeDistribution,
} from '../src/game/groups.js'
import {
  createEmptyWeeklyPlan,
  simulateDayActivities,
} from '../src/game/schedules.js'
import {
  startAlbumSalesSession,
  advanceSalesSession,
  processOfflineSales,
} from '../src/game/sales.js'
import {
  getInitialGameState,
  validateSaveData,
} from '../src/game/save.js'

test('idol tier thresholds adhere strictly to specification', () => {
  assert.equal(getTierFromScore(0), 'F')
  assert.equal(getTierFromScore(9), 'F')
  assert.equal(getTierFromScore(10), 'D')
  assert.equal(getTierFromScore(19), 'D')
  assert.equal(getTierFromScore(20), 'C')
  assert.equal(getTierFromScore(39), 'C')
  assert.equal(getTierFromScore(40), 'B')
  assert.equal(getTierFromScore(69), 'B')
  assert.equal(getTierFromScore(70), 'A')
  assert.equal(getTierFromScore(87), 'A')
  assert.equal(getTierFromScore(88), 'S')
  assert.equal(getTierFromScore(94), 'S')
  assert.equal(getTierFromScore(95), 'P')
  assert.equal(getTierFromScore(100), 'P')
})

test('maknae is automatically detected as the youngest member', () => {
  const idol1 = { id: 'i1', name: 'Elder', age: 22, birthMonth: 3 }
  const idol2 = { id: 'i2', name: 'Middle', age: 19, birthMonth: 5 }
  const idol3 = { id: 'i3', name: 'Maknae', age: 17, birthMonth: 9 }

  const group = {
    id: 'grp1',
    name: 'TEST GROUP',
    members: ['i1', 'i2', 'i3'],
  }

  const maknae = getMaknaeIdol(group, [idol1, idol2, idol3])
  assert.ok(maknae)
  assert.equal(maknae.id, 'i3')
  assert.equal(maknae.name, 'Maknae')
})

test('removing idol from group triggers 6-month (26 week) cooldown', () => {
  const idol = { id: 'idol_test', name: 'Trainee', loyalty: 80 }
  const group = {
    id: 'grp_test',
    name: 'STARS',
    members: ['idol_test'],
    loyalty: 85,
    popularity: 50,
  }

  const currentWeek = 10
  const result = removeIdolFromGroup(group, 'idol_test', currentWeek)

  assert.equal(result.cooldownUntil, 10 + GROUP_REMOVAL_COOLDOWN_WEEKS)
  assert.equal(result.cooldownUntil, 36)
  assert.equal(result.updatedGroup.members.length, 0)
  assert.equal(result.updatedGroup.loyalty, 70) // 85 - 15
})

test('income distribution is locked during active album production or sales', () => {
  const group = { id: 'grp_prod', name: 'ALPHA' }

  // 1. Without active productions or sales -> allowed
  const allowedCheck = canAdjustIncomeDistribution(group, [], [])
  assert.equal(allowedCheck.allowed, true)

  // 2. With active album production -> locked
  const activeProductions = [{ targetId: 'grp_prod', completed: false }]
  const lockedProdCheck = canAdjustIncomeDistribution(group, activeProductions, [])
  assert.equal(lockedProdCheck.allowed, false)

  // 3. With active sales campaign -> locked
  const activeSales = [{ targetId: 'grp_prod', completed: false }]
  const lockedSalesCheck = canAdjustIncomeDistribution(group, [], activeSales)
  assert.equal(lockedSalesCheck.allowed, false)
})

test('7-day schedule simulator processes daily activities', () => {
  const plan = createEmptyWeeklyPlan()
  assert.ok(plan.Monday)
  assert.ok(plan.Sunday)

  const idols = [{ id: 'i1', name: 'Singer', currentStamina: 100, maxStamina: 100, fatigue: 0, loyalty: 80, popularity: 20 }]
  const result = simulateDayActivities({
    day: 'Monday',
    activities: [{
      id: 'act1',
      name: 'Radio Show',
      activityType: 'small_event',
      targetType: 'idol',
      targetId: 'i1',
      staminaCost: 10,
      fatigueGain: 8,
      revenue: 1_000_000,
      popularityGain: 2,
    }],
    idols,
    groups: [],
    companyReputation: 'Local',
  })

  assert.ok(result.dayIncome > 0)
  assert.equal(result.idolDeltas.i1.staminaDelta, -15)
  assert.equal(result.idolDeltas.i1.fatigueDelta, 12)
})

test('real-time sales advance session and offline catch-up works', () => {
  const session = startAlbumSalesSession({
    album: {
      id: 'prod_test',
      title: 'FIRST HIT',
      releaseType: 'Single',
      quality: 85,
    },
    targetType: 'group',
    targetId: 'grp1',
    targetName: 'STARS',
    fanbase: 10000,
    popularity: 45,
    companyReputation: 'Local',
    companyTier: 'F',
    incomeDistribution: { companyPercent: 60, groupPercent: 40 },
  })

  assert.equal(session.albumTitle, 'FIRST HIT')
  assert.equal(session.secondsElapsed, 0)
  assert.equal(session.completed, false)

  // Advance session by 5 seconds
  const tick1 = advanceSalesSession(session, session.salesStartTime + 5000)
  assert.equal(tick1.updatedSession.secondsElapsed, 5)
  assert.ok(tick1.updatedSession.copiesSold >= 0)

  // Test offline progress calculation
  const fiveMinutesAgo = Date.now() - 300_000 // 300 seconds ago
  const offlineSession = {
    ...session,
    salesStartTime: fiveMinutesAgo,
    secondsElapsed: 0,
  }

  const { updatedSales, totalCompanyPayout } = processOfflineSales([offlineSession], Date.now())
  assert.ok(updatedSales[0].secondsElapsed >= 300)
  assert.ok(totalCompanyPayout >= 0)
})

test('initial game state starts with ₩100M and 100 Rubies', () => {
  const init = getInitialGameState({ companyName: 'Neon Wave Records' })
  assert.equal(init.money, 100_000_000)
  assert.equal(init.rubies, 100)
  assert.equal(init.companyTier, 'F')
  assert.equal(init.companyReputation, 'Local')
  assert.equal(validateSaveData(init).valid, true)
})
