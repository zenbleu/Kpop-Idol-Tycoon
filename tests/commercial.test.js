import test from 'node:test'
import assert from 'node:assert/strict'
import {
  COMMERCIAL_TYPES,
  canLaunchCommercial,
  calculateCommercialPreview,
  launchCommercialVenture,
  tickCommercialVentures,
} from '../src/game/commercial.js'
import { A, gameReducer } from '../src/game/stateCore.js'

test('commercial catalog defines 4 core ventures', () => {
  assert.equal(Object.keys(COMMERCIAL_TYPES).length, 4)
  assert.ok(COMMERCIAL_TYPES.ost)
  assert.ok(COMMERCIAL_TYPES.merch)
  assert.ok(COMMERCIAL_TYPES.fan_meeting)
  assert.ok(COMMERCIAL_TYPES.endorsement)
  assert.equal(COMMERCIAL_TYPES.ost.durationWeeks, 8)
  assert.equal(COMMERCIAL_TYPES.endorsement.cost, 0)
})

test('canLaunchCommercial verifies funds, grade, and actor status', () => {
  const actorA = { id: 1, name: 'Ren', signed: true, status: 'available', skills: { vocal: 60, visual: 70, charm: 65 }, happiness: 80 }
  const actorB = { id: 2, name: 'Haru', signed: true, status: 'available', skills: { vocal: 55, visual: 75, charm: 70 }, happiness: 85 }
  const state = {
    money: 1000,
    week: 10,
    actors: [actorA, actorB],
    fixedCPs: [],
    commercialVentures: [],
    commercialHistory: [],
    commercialCooldowns: {},
  }

  const highGradeProd = { id: 'p1', title: 'Cherry Blossoms', grade: 'A', leadIds: [1, 2] }
  const lowGradeProd = { id: 'p2', title: 'Rough Cut', grade: 'F', leadIds: [1, 2] }

  // High grade prod is eligible for OST and Merch
  const ostCheck = canLaunchCommercial('ost', { prod: highGradeProd, state })
  assert.equal(ostCheck.eligible, true)

  const merchCheck = canLaunchCommercial('merch', { prod: highGradeProd, state })
  assert.equal(merchCheck.eligible, true)

  // Low grade prod is rejected for Merch (needs B) and OST (needs C)
  assert.equal(canLaunchCommercial('merch', { prod: lowGradeProd, state }).eligible, false)
  assert.equal(canLaunchCommercial('ost', { prod: lowGradeProd, state }).eligible, false)

  // Insufficient funds check
  const poorState = { ...state, money: 50 }
  assert.equal(canLaunchCommercial('ost', { prod: highGradeProd, state: poorState }).eligible, false)
})

test('OST single launch creates active venture and pays weekly royalties over 8 weeks', () => {
  const actorA = { id: 1, name: 'Ren', signed: true, status: 'available', tier: 'Rising Star', skills: { vocal: 60, visual: 70 }, fame: 50 }
  const actorB = { id: 2, name: 'Haru', signed: true, status: 'available', tier: 'Rising Star', skills: { vocal: 65, visual: 75 }, fame: 60 }
  let state = {
    money: 2000,
    week: 1,
    popularity: 10000,
    reputation: 20,
    actors: [actorA, actorB],
    fixedCPs: [],
    commercialVentures: [],
    commercialHistory: [],
    commercialCooldowns: {},
    eventLog: [],
  }

  const dispatch = action => {
    state = gameReducer(state, action)
  }

  const prod = { id: 'prod_hit', title: 'Secret Roommate', grade: 'A', leadIds: [1, 2] }

  const success = launchCommercialVenture('ost', { prod, state, dispatch })
  assert.equal(success, true)

  // Initial deduction and active venture added
  assert.equal(state.money, 2000 - 250)
  assert.equal(state.commercialVentures.length, 1)
  const venture = state.commercialVentures[0]
  assert.equal(venture.type, 'ost')
  assert.equal(venture.weeksRemaining, 8)
  assert.ok(venture.weeklyRoyalty > 0)

  // Tick 8 weeks and verify royalties accumulate
  const weeklyRate = venture.weeklyRoyalty
  for (let w = 1; w <= 8; w++) {
    const res = tickCommercialVentures(state, dispatch, w)
    assert.equal(res.weeklyCommercialRevenue, weeklyRate)
  }

  // After 8 weeks, active venture should be archived to commercialHistory
  assert.equal(state.commercialVentures.length, 0)
  assert.equal(state.commercialHistory.length, 1)
  assert.equal(state.commercialHistory[0].revenue, weeklyRate * 8)
})

test('Collector Photobook merch drop provides instant profit and boosts fame', () => {
  const actorA = { id: 1, name: 'Aiden', signed: true, status: 'available', tier: 'Popular', skills: { visual: 85 }, fame: 120 }
  const actorB = { id: 2, name: 'Leo', signed: true, status: 'available', tier: 'Popular', skills: { visual: 90 }, fame: 130 }
  let state = {
    money: 3000,
    week: 12,
    popularity: 50000,
    reputation: 40,
    actors: [actorA, actorB],
    fixedCPs: [[1, 2]], // Fixed CP
    commercialVentures: [],
    commercialHistory: [],
    commercialCooldowns: {},
    eventLog: [],
  }

  const dispatch = action => {
    state = gameReducer(state, action)
  }

  const prod = { id: 'p_photo', title: 'Summer Kiss', grade: 'S', leadIds: [1, 2] }
  const preview = calculateCommercialPreview('merch', { prod, actorA, actorB, state })
  assert.ok(preview.revenueEst > preview.cost)
  assert.equal(preview.isFixedCP, true)

  const success = launchCommercialVenture('merch', { prod, state, dispatch })
  assert.equal(success, true)

  // Verify money increased by net profit (deducted 400, added revenueEst)
  assert.equal(state.money, 3000 - 400 + preview.revenueEst)
  assert.equal(state.commercialHistory.length, 1)
  assert.equal(state.commercialHistory[0].type, 'merch')

  // Verify cooldown was set
  assert.equal(state.commercialCooldowns[`cooldown_merch_${prod.id}`], 12)
})

test('World Fan-Meeting Tour provides box office revenue, grants chemistry to Fixed CPs', () => {
  const actorA = {
    id: 1,
    name: 'Aiden',
    signed: true,
    status: 'available',
    tier: 'Worldwide',
    skills: { charm: 80 },
    happiness: 80,
    fame: 200,
    chemistry_map: { 2: 70 },
  }
  const actorB = {
    id: 2,
    name: 'Leo',
    signed: true,
    status: 'available',
    tier: 'Worldwide',
    skills: { charm: 85 },
    happiness: 85,
    fame: 220,
    chemistry_map: { 1: 70 },
  }

  let state = {
    money: 5000,
    week: 20,
    popularity: 100000,
    reputation: 50,
    actors: [actorA, actorB],
    fixedCPs: [[1, 2]],
    commercialVentures: [],
    commercialHistory: [],
    commercialCooldowns: {},
    eventLog: [],
  }

  const dispatch = action => {
    state = gameReducer(state, action)
  }

  const success = launchCommercialVenture('fan_meeting', { pair: [1, 2], state, dispatch })
  assert.equal(success, true)

  // Fixed CP chemistry boosted by +8
  const updatedA = state.actors.find(a => a.id === 1)
  assert.equal(updatedA.chemistry_map[2], 78)

  // Leads expended tour morale
  assert.ok(updatedA.happiness < 80)

  // Tour recorded
  assert.equal(state.commercialHistory.length, 1)
  assert.equal(state.commercialHistory[0].type, 'fan_meeting')
})

test('Luxury Couple Brand CF requires 0 cost and pays sponsorship fee', () => {
  const actorA = { id: 1, name: 'Ren', signed: true, status: 'available', tier: 'Popular', skills: { charm: 70 }, fame: 150, happiness: 70 }
  const actorB = { id: 2, name: 'Haru', signed: true, status: 'available', tier: 'Popular', skills: { charm: 75 }, fame: 160, happiness: 75 }
  let state = {
    money: 1000,
    week: 25,
    popularity: 80000,
    reputation: 45,
    actors: [actorA, actorB],
    fixedCPs: [[1, 2]],
    commercialVentures: [],
    commercialHistory: [],
    commercialCooldowns: {},
    eventLog: [],
  }

  const dispatch = action => {
    state = gameReducer(state, action)
  }

  const preview = calculateCommercialPreview('endorsement', { actorA, actorB, state })
  assert.equal(preview.cost, 0)
  assert.ok(preview.revenueEst >= 1000)

  const success = launchCommercialVenture('endorsement', { pair: [1, 2], state, dispatch })
  assert.equal(success, true)

  // Studio received full sponsorship fee with zero upfront cost
  assert.equal(state.money, 1000 + preview.revenueEst)
  assert.equal(state.commercialHistory[0].type, 'endorsement')
})
