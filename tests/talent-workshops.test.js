import test from 'node:test'
import assert from 'node:assert/strict'
import { WORKSHOPS, canAttendWorkshop, executeWorkshop } from '../src/game/workshops.js'
import { A, gameReducer } from '../src/game/stateCore.js'
import { getChem } from '../src/game/chemistry.js'

const fixedRandom = val => () => val

test('talent workshops catalog has 5 distinct development tracks', () => {
  assert.equal(WORKSHOPS.length, 5)
  const ids = WORKSHOPS.map(w => w.id)
  assert.deepEqual(ids, ['acting', 'chemistry', 'fan_service', 'wellness', 'vocal'])
})

test('canAttendWorkshop checks eligibility rules correctly', () => {
  const actor = { id: 1, name: 'Aiden', signed: true, status: 'available', happiness: 80, skills: { act: 20 } }
  const partner = { id: 2, name: 'Ren', signed: true, status: 'available', happiness: 75, skills: { act: 18 } }

  const actingWs = WORKSHOPS.find(w => w.id === 'acting')
  const chemWs = WORKSHOPS.find(w => w.id === 'chemistry')
  const wellnessWs = WORKSHOPS.find(w => w.id === 'wellness')

  // Normal success
  assert.equal(canAttendWorkshop(actingWs, actor, null, 1000).ok, true)

  // Insufficient funds
  assert.equal(canAttendWorkshop(actingWs, actor, null, 100).ok, false)

  // Filming actors cannot attend
  const filmingActor = { ...actor, status: 'filming' }
  assert.equal(canAttendWorkshop(actingWs, filmingActor, null, 1000).ok, false)

  // Injured actor blocked from acting, but allowed in wellness
  const injuredActor = { ...actor, status: 'injured', injuredWeeks: 2 }
  assert.equal(canAttendWorkshop(actingWs, injuredActor, null, 1000).ok, false)
  assert.equal(canAttendWorkshop(wellnessWs, injuredActor, null, 1000).ok, true)

  // Pair workshop requires valid partner
  assert.equal(canAttendWorkshop(chemWs, actor, null, 1000).ok, false)
  assert.equal(canAttendWorkshop(chemWs, actor, partner, 1000).ok, true)
})

test('executeWorkshop method acting grants skill, xp, fame and deducts cost', () => {
  let state = {
    money: 2000,
    week: 5,
    actors: [
      { id: 1, name: 'Aiden', tier: 'Rookie', signed: true, status: 'available', happiness: 80, exp: 50, level: 1, fame: 100, skills: { act: 22, lang: 12 } }
    ],
    fixedCPs: [],
    eventLog: [],
  }

  const dispatch = action => {
    state = gameReducer(state, action)
  }

  const result = executeWorkshop(state, dispatch, 'acting', 1, null, fixedRandom(0.5))
  assert.equal(result.success, true)
  assert.equal(state.money, 2000 - 350)

  const updatedActor = state.actors.find(a => a.id === 1)
  assert.ok(updatedActor.skills.act > 22)
  assert.ok(updatedActor.skills.lang > 12)
  assert.ok(updatedActor.exp > 50)
  assert.ok(updatedActor.fame > 100)
  assert.ok(state.eventLog.length > 0)
})

test('executeWorkshop chemistry workshop boosts mutual chemistry and rewards official CP', () => {
  let state = {
    money: 3000,
    week: 10,
    actors: [
      { id: 1, name: 'Aiden', tier: 'Rookie', signed: true, status: 'available', happiness: 70, loyalty: 60, exp: 0, level: 1, fame: 50, chemistry_map: { 2: 40 } },
      { id: 2, name: 'Ren', tier: 'Rookie', signed: true, status: 'available', happiness: 70, loyalty: 60, exp: 0, level: 1, fame: 50, chemistry_map: { 1: 40 } },
    ],
    fixedCPs: [[1, 2]],
    eventLog: [],
  }

  const dispatch = action => {
    state = gameReducer(state, action)
  }

  const result = executeWorkshop(state, dispatch, 'chemistry', 1, 2, fixedRandom(0.5))
  assert.equal(result.success, true)
  assert.equal(result.isFixedCP, true)
  assert.equal(state.money, 3000 - 500)

  const a1 = state.actors.find(a => a.id === 1)
  const a2 = state.actors.find(a => a.id === 2)

  const chemA = getChem(a1, 2)
  const chemB = getChem(a2, 1)

  assert.equal(chemA, chemB)
  assert.ok(chemA > 40)
  assert.ok(a1.fame > 50)
  assert.ok(a2.fame > 50)
})

test('executeWorkshop wellness retreat heals injuries and restores 100% morale', () => {
  let state = {
    money: 1500,
    week: 12,
    actors: [
      { id: 3, name: 'Jun', tier: 'Rookie', signed: true, status: 'injured', injuredWeeks: 2, happiness: 35, loyalty: 50, skills: { fitness: 20 } }
    ],
    fixedCPs: [],
    eventLog: [],
  }

  const dispatch = action => {
    state = gameReducer(state, action)
  }

  const result = executeWorkshop(state, dispatch, 'wellness', 3, null, fixedRandom(0.5))
  assert.equal(result.success, true)

  const jun = state.actors.find(a => a.id === 3)
  assert.equal(jun.happiness, 100)
  assert.equal(jun.status, 'available')
  assert.equal(jun.injuredWeeks, 0)
  assert.ok(jun.skills.fitness > 20)
})
