/**
 * state.jsx — React Context provider for K-pop Idol Tycoon.
 * Manages central game state, actions, offline sales tick loop,
 * and LocalStorage synchronization.
 */

import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react'
import {
  getInitialGameState,
  loadGameFromStorage,
  saveGameToStorage,
  importSaveFromJSON,
} from './save.js'
import { advanceGameWeek } from './weekAdvance.js'
import { processOfflineSales, advanceSalesSession } from './sales.js'
import { updateIdolTier } from './idols.js'
import { createGroup, removeIdolFromGroup, canAdjustIncomeDistribution } from './groups.js'
import { startAlbumProduction } from './production.js'
import { executeConcert, executeTour } from './concerts.js'
import { UPGRADES } from './upgrades.js'
import { WARDROBE_ITEMS } from './balance.js'
import { playSfx } from './audio.js'

const GameContext = createContext(null)

// Action types
export const ACTION = {
  INIT_STATE: 'INIT_STATE',
  START_NEW_GAME: 'START_NEW_GAME',
  ADVANCE_WEEK: 'ADVANCE_WEEK',
  RECRUIT_IDOL: 'RECRUIT_IDOL',
  UPDATE_IDOL_STAGE_NAME: 'UPDATE_IDOL_STAGE_NAME',
  TRAIN_IDOL: 'TRAIN_IDOL',
  CREATE_GROUP: 'CREATE_GROUP',
  SET_GROUP_ROLES: 'SET_GROUP_ROLES',
  REMOVE_IDOL_FROM_GROUP: 'REMOVE_IDOL_FROM_GROUP',
  REMOVE_IDOL_FROM_COMPANY: 'REMOVE_IDOL_FROM_COMPANY',
  DISBAND_GROUP: 'DISBAND_GROUP',
  SET_INCOME_DISTRIBUTION: 'SET_INCOME_DISTRIBUTION',
  OFFER_RETENTION: 'OFFER_RETENTION',
  START_PRODUCTION: 'START_PRODUCTION',
  TICK_SALES: 'TICK_SALES',
  BUY_UPGRADE: 'BUY_UPGRADE',
  BUY_WARDROBE: 'BUY_WARDROBE',
  EQUIP_WARDROBE: 'EQUIP_WARDROBE',
  ADD_SCHEDULE_ACTIVITY: 'ADD_SCHEDULE_ACTIVITY',
  REMOVE_SCHEDULE_ACTIVITY: 'REMOVE_SCHEDULE_ACTIVITY',
  EXECUTE_CONCERT: 'EXECUTE_CONCERT',
  EXECUTE_TOUR: 'EXECUTE_TOUR',
  DISMISS_WEEK_SUMMARY: 'DISMISS_WEEK_SUMMARY',
  PUSH_TOAST: 'PUSH_TOAST',
  DISMISS_TOAST: 'DISMISS_TOAST',
  LOAD_SAVE: 'LOAD_SAVE',
  RESET_GAME: 'RESET_GAME',
}

function gameReducer(state, action) {
  switch (action.type) {
    case ACTION.INIT_STATE:
      return action.state

    case ACTION.START_NEW_GAME: {
      const init = getInitialGameState({
        companyName: action.companyName,
        ceoName: action.ceoName,
        logoStyle: action.logoStyle,
        description: action.description,
        tutorialCompleted: action.tutorialCompleted,
      })
      init.started = true
      saveGameToStorage('auto', init)
      return init
    }

    case ACTION.ADVANCE_WEEK: {
      const next = advanceGameWeek(state)
      return next
    }

    case ACTION.DISMISS_WEEK_SUMMARY:
      return { ...state, weekSummary: null }

    case ACTION.RECRUIT_IDOL: {
      const { idol, cost } = action
      if (state.money < cost) return state
      const updatedIdols = [...state.idols, idol]
      const next = {
        ...state,
        money: state.money - cost,
        idols: updatedIdols,
        toasts: [...(state.toasts || []), { id: Date.now() + Math.random(), message: `Recruited ${idol.name} (${idol.tier}-Tier)!`, variant: 'gold' }],
      }
      saveGameToStorage('auto', next)
      return next
    }

    case ACTION.UPDATE_IDOL_STAGE_NAME: {
      const { idolId, newStageName } = action
      return {
        ...state,
        idols: state.idols.map(i => i.id === idolId ? { ...i, stageName: newStageName.trim() } : i),
      }
    }

    case ACTION.TRAIN_IDOL: {
      const { idolId, statKey, cost = 1_000_000, staminaCost = 15, fatigueGain = 12 } = action
      const idol = state.idols.find(i => i.id === idolId)
      if (!idol || state.money < cost || (idol.currentStamina || 0) < staminaCost) return state

      // Diminishing returns calculation
      const currentVal = idol.stats[statKey] || 10
      const roomToGrow = Math.max(1, 100 - currentVal)
      let growthBase = Math.max(1, Math.round((roomToGrow / 25) + Math.random() * 2))

      // Potential multiplier
      const potMult = { P: 1.5, S: 1.35, A: 1.2, B: 1.0, C: 0.85, D: 0.7, F: 0.5 }[idol.potential] || 1.0
      const personalityBonus = idol.personality === 'Hardworking' ? 1.15 : 1.0
      const totalGrowth = Math.max(1, Math.round(growthBase * potMult * personalityBonus))

      const updatedStats = {
        ...idol.stats,
        [statKey]: Math.min(100, currentVal + totalGrowth),
      }

      const updatedIdol = updateIdolTier({
        ...idol,
        stats: updatedStats,
        currentStamina: Math.max(0, (idol.currentStamina || 100) - staminaCost),
        fatigue: Math.min(100, (idol.fatigue || 0) + fatigueGain),
        trainingHistory: [
          `Trained ${statKey} (+${totalGrowth})`,
          ...(idol.trainingHistory || []),
        ].slice(0, 15),
      })

      const next = {
        ...state,
        money: state.money - cost,
        idols: state.idols.map(i => i.id === idolId ? updatedIdol : i),
      }
      saveGameToStorage('auto', next)
      return next
    }

    case ACTION.CREATE_GROUP: {
      try {
        const newGroup = createGroup({
          name: action.name,
          gender: action.gender,
          memberIds: action.memberIds,
          currentWeek: state.totalWeeksPassed || 1,
          idolRoster: state.idols,
          maxCapacity: state.maxMembersPerGroup || 10,
        })

        // Assign groupId to selected idols
        const updatedIdols = state.idols.map(i => {
          if (action.memberIds.includes(i.id)) {
            return { ...i, groupId: newGroup.id, isSolo: false }
          }
          return i
        })

        const next = {
          ...state,
          groups: [...state.groups, newGroup],
          idols: updatedIdols,
          toasts: [
            ...(state.toasts || []),
            { id: Date.now() + Math.random(), message: `Debut Alert: "${newGroup.name}" officially formed!`, variant: 'gold' },
          ],
        }
        saveGameToStorage('auto', next)
        return next
      } catch (err) {
        return {
          ...state,
          toasts: [...(state.toasts || []), { id: Date.now() + Math.random(), message: err.message, variant: 'red' }],
        }
      }
    }

    case ACTION.SET_GROUP_ROLES: {
      const { idolId, roles } = action
      return {
        ...state,
        idols: state.idols.map(i => i.id === idolId ? { ...i, groupRoles: roles } : i),
      }
    }

    case ACTION.REMOVE_IDOL_FROM_GROUP: {
      const { groupId, idolId } = action
      const group = state.groups.find(g => g.id === groupId)
      if (!group) return state

      const { updatedGroup, cooldownUntil, loyaltyPenalty } = removeIdolFromGroup(
        group,
        idolId,
        state.totalWeeksPassed || 1
      )

      const updatedIdols = state.idols.map(i => {
        if (i.id === idolId) {
          return {
            ...i,
            groupId: null,
            groupRoles: [],
            groupCooldownUntilWeek: cooldownUntil,
            loyalty: Math.max(10, (i.loyalty || 80) - loyaltyPenalty),
          }
        }
        return i
      })

      const next = {
        ...state,
        groups: state.groups.map(g => g.id === groupId ? updatedGroup : g),
        idols: updatedIdols,
        toasts: [
          ...(state.toasts || []),
          { id: Date.now() + Math.random(), message: `Idol removed from group. 6-month cooldown activated.`, variant: 'red' },
        ],
      }
      saveGameToStorage('auto', next)
      return next
    }

    case ACTION.REMOVE_IDOL_FROM_COMPANY: {
      const { idolId } = action
      const idol = state.idols.find(i => i.id === idolId)
      if (!idol) return state

      // Remove from groups as well
      const updatedGroups = state.groups.map(g => {
        if (g.members.includes(idolId)) {
          return {
            ...g,
            members: g.members.filter(id => id !== idolId),
            loyalty: Math.max(10, (g.loyalty || 80) - 25),
          }
        }
        return g
      })

      // Permanently remove from idol roster
      const updatedIdols = state.idols.filter(i => i.id !== idolId)
      const next = {
        ...state,
        idols: updatedIdols,
        groups: updatedGroups,
        companyScore: Math.max(0, (state.companyScore || 0) - 5),
        toasts: [
          ...(state.toasts || []),
          { id: Date.now() + Math.random(), message: `${idol.name} was permanently dismissed from the agency.`, variant: 'red' },
        ],
      }
      saveGameToStorage('auto', next)
      return next
    }

    case ACTION.DISBAND_GROUP: {
      const { groupId } = action
      const grp = state.groups.find(g => g.id === groupId)
      if (!grp) return state

      // Release members back to trainee roster
      const updatedIdols = state.idols.map(i => {
        if (grp.members.includes(i.id)) {
          return {
            ...i,
            groupId: null,
            groupRoles: [],
            loyalty: Math.max(15, (i.loyalty || 80) - 15),
          }
        }
        return i
      })

      const next = {
        ...state,
        groups: state.groups.filter(g => g.id !== groupId),
        idols: updatedIdols,
        productions: state.productions.filter(p => p.targetId !== groupId),
        toasts: [
          ...(state.toasts || []),
          { id: Date.now() + Math.random(), message: `Group "${grp.name}" was disbanded. Members returned to trainee roster.`, variant: 'red' },
        ],
      }
      saveGameToStorage('auto', next)
      return next
    }

    case ACTION.SET_INCOME_DISTRIBUTION: {
      const { groupId, companyPercent, groupPercent } = action
      const group = state.groups.find(g => g.id === groupId)
      if (!group) return state

      const check = canAdjustIncomeDistribution(group, state.productions, state.activeSales)
      if (!check.allowed) {
        return {
          ...state,
          toasts: [...(state.toasts || []), { id: Date.now() + Math.random(), message: check.reason, variant: 'red' }],
        }
      }

      if (companyPercent + groupPercent !== 100) return state

      const next = {
        ...state,
        groups: state.groups.map(g => g.id === groupId ? {
          ...g,
          incomeDistribution: { companyPercent, groupPercent },
        } : g),
        toasts: [...(state.toasts || []), { id: Date.now() + Math.random(), message: `Income distribution updated to ${companyPercent}% Company / ${groupPercent}% Group.`, variant: 'gold' }],
      }
      saveGameToStorage('auto', next)
      return next
    }

    case ACTION.OFFER_RETENTION: {
      const { idolId, cost } = action
      if (state.money < cost) return state

      const next = {
        ...state,
        money: state.money - cost,
        idols: state.idols.map(i => {
          if (i.id === idolId) {
            return {
              ...i,
              loyalty: Math.min(100, (i.loyalty || 20) + 35),
              retentionCount: (i.retentionCount || 0) + 1,
            }
          }
          return i
        }),
        toasts: [...(state.toasts || []), { id: Date.now() + Math.random(), message: `Retention bonus paid. Idol loyalty restored!`, variant: 'gold' }],
      }
      saveGameToStorage('auto', next)
      return next
    }

    case ACTION.START_PRODUCTION: {
      const prod = startAlbumProduction(action.params)
      if (state.money < prod.cost) return state

      const next = {
        ...state,
        money: state.money - prod.cost,
        productions: [...state.productions, prod],
        toasts: [...(state.toasts || []), { id: Date.now() + Math.random(), message: `Started production on "${prod.title}" (${prod.releaseType})!`, variant: 'gold' }],
      }
      saveGameToStorage('auto', next)
      return next
    }

    case ACTION.TICK_SALES: {
      if (!state.activeSales || state.activeSales.length === 0) return state
      let addedMoney = 0
      const updatedList = []

      for (const s of state.activeSales) {
        if (s.completed) {
          updatedList.push(s)
          continue
        }
        const { updatedSession, companyEarnedDelta } = advanceSalesSession(s)
        addedMoney += companyEarnedDelta
        updatedList.push(updatedSession)
      }

      if (addedMoney === 0 && updatedList.every((s, idx) => s.secondsElapsed === state.activeSales[idx]?.secondsElapsed)) {
        return state
      }

      return {
        ...state,
        money: state.money + addedMoney,
        activeSales: updatedList,
      }
    }

    case ACTION.BUY_UPGRADE: {
      const { upgradeId } = action
      const upg = UPGRADES.find(u => u.id === upgradeId)
      if (!upg || state.upgrades.includes(upgradeId)) return state

      if (upg.costType === 'rubies') {
        if (state.rubies < upg.cost) return state
      } else {
        if (state.money < upg.cost) return state
      }

      const newUpgrades = [...state.upgrades, upgradeId]
      let newCapacity = state.auditionCandidateCapacity
      let newGroupSlots = state.maxGroupSlots
      let unlockMain2 = state.unlockedTrainingMain2
      let unlockMain3 = state.unlockedTrainingMain3
      let unlockDomestic = state.unlockedDomesticAuditions
      let unlockIntl = state.unlockedInternationalAuditions
      let unlockGlobal = state.unlockedGlobalAuditions

      if (upg.effect?.candidateCapacity) newCapacity = Math.max(newCapacity, upg.effect.candidateCapacity)
      if (upg.effect?.maxGroupSlots) newGroupSlots = Math.max(newGroupSlots, upg.effect.maxGroupSlots)
      if (upg.effect?.unlockMain2) unlockMain2 = true
      if (upg.effect?.unlockMain3) unlockMain3 = true
      if (upg.effect?.unlockDomesticAuditions) unlockDomestic = true
      if (upg.effect?.unlockInternationalAuditions) unlockIntl = true
      if (upg.effect?.unlockGlobalAuditions) unlockGlobal = true

      const next = {
        ...state,
        money: upg.costType === 'money' ? state.money - upg.cost : state.money,
        rubies: upg.costType === 'rubies' ? state.rubies - upg.cost : state.rubies,
        upgrades: newUpgrades,
        auditionCandidateCapacity: newCapacity,
        maxGroupSlots: newGroupSlots,
        unlockedTrainingMain2: unlockMain2,
        unlockedTrainingMain3: unlockMain3,
        unlockedDomesticAuditions: unlockDomestic,
        unlockedInternationalAuditions: unlockIntl,
        unlockedGlobalAuditions: unlockGlobal,
        toasts: [...(state.toasts || []), { id: Date.now() + Math.random(), message: `Upgrade completed: ${upg.name}!`, variant: 'gold' }],
      }
      saveGameToStorage('auto', next)
      return next
    }

    case ACTION.BUY_WARDROBE: {
      const { item } = action
      if (state.wardrobeInventory?.includes(item.id)) return state

      if (item.priceType === 'rubies') {
        if (state.rubies < item.price) return state
      } else {
        if (state.money < item.price) return state
      }

      const next = {
        ...state,
        money: item.priceType === 'money' ? state.money - item.price : state.money,
        rubies: item.priceType === 'rubies' ? state.rubies - item.price : state.rubies,
        wardrobeInventory: [...(state.wardrobeInventory || []), item.id],
        toasts: [...(state.toasts || []), { id: Date.now() + Math.random(), message: `Purchased ${item.name} for wardrobe!`, variant: 'gold' }],
      }
      saveGameToStorage('auto', next)
      return next
    }

    case ACTION.EQUIP_WARDROBE: {
      const { targetType, targetId, clothingId } = action
      if (targetType === 'group') {
        return {
          ...state,
          groups: state.groups.map(g => g.id === targetId ? { ...g, equippedClothing: clothingId } : g),
        }
      }
      return {
        ...state,
        idols: state.idols.map(i => i.id === targetId ? { ...i, equippedClothing: clothingId } : i),
      }
    }

    case ACTION.ADD_SCHEDULE_ACTIVITY: {
      const { day, activity } = action
      const plan = state.weeklyPlan || {}
      const dayList = plan[day] || []
      const updatedPlan = {
        ...plan,
        [day]: [...dayList, { id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, ...activity }],
      }
      return {
        ...state,
        weeklyPlan: updatedPlan,
      }
    }

    case ACTION.REMOVE_SCHEDULE_ACTIVITY: {
      const { day, activityId } = action
      const plan = state.weeklyPlan || {}
      const dayList = plan[day] || []
      const updatedPlan = {
        ...plan,
        [day]: dayList.filter(a => a.id !== activityId),
      }
      return {
        ...state,
        weeklyPlan: updatedPlan,
      }
    }

    case ACTION.EXECUTE_CONCERT: {
      const { concertParams } = action
      const result = executeConcert(concertParams)

      // Apply result to target
      let updatedGroups = state.groups
      let updatedIdols = state.idols

      if (concertParams.targetType === 'group') {
        updatedGroups = state.groups.map(g => {
          if (g.id === concertParams.targetId) {
            return {
              ...g,
              popularity: Math.min(100, (g.popularity || 20) + result.popularityGain),
              fanbase: (g.fanbase || 1000) + result.fanGain,
            }
          }
          return g
        })
        // Apply fatigue to group members
        const grp = state.groups.find(g => g.id === concertParams.targetId)
        if (grp) {
          updatedIdols = state.idols.map(i => {
            if (grp.members.includes(i.id)) {
              return {
                ...i,
                fatigue: Math.min(100, (i.fatigue || 0) + result.fatigueGain),
                currentStamina: Math.max(0, (i.currentStamina || 100) - 25),
              }
            }
            return i
          })
        }
      }

      const next = {
        ...state,
        money: state.money + result.companyEarnings,
        groups: updatedGroups,
        idols: updatedIdols,
        concertsCompleted: (state.concertsCompleted || 0) + 1,
        toasts: [...(state.toasts || []), {
          id: Date.now() + Math.random(),
          message: `${result.isSoldOut ? 'SOLD OUT! ' : ''}${result.venueName} concert earned ₩${result.companyEarnings.toLocaleString()}!`,
          variant: 'gold',
        }],
      }
      saveGameToStorage('auto', next)
      return next
    }

    case ACTION.EXECUTE_TOUR: {
      const { group, tourName, stopsCount } = action
      const result = executeTour({
        group,
        tourName,
        stopsCount,
        companyReputation: state.companyReputation,
      })

      const updatedGroups = state.groups.map(g => {
        if (g.id === group.id) {
          return {
            ...g,
            popularity: Math.min(100, (g.popularity || 20) + result.popularityGain),
            fanbase: (g.fanbase || 1000) + result.fanGain,
          }
        }
        return g
      })

      const updatedIdols = state.idols.map(i => {
        if (group.members.includes(i.id)) {
          return {
            ...i,
            fatigue: Math.min(100, (i.fatigue || 0) + result.fatigueGain),
            currentStamina: Math.max(0, (i.currentStamina || 100) - 45),
          }
        }
        return i
      })

      const next = {
        ...state,
        money: state.money + result.companyEarnings,
        groups: updatedGroups,
        idols: updatedIdols,
        concertsCompleted: (state.concertsCompleted || 0) + stopsCount,
        toasts: [...(state.toasts || []), {
          id: Date.now() + Math.random(),
          message: `Tour "${tourName}" completed across ${stopsCount} cities! Company earned ₩${result.companyEarnings.toLocaleString()}.`,
          variant: 'gold',
        }],
      }
      saveGameToStorage('auto', next)
      return next
    }

    case ACTION.LOAD_SAVE: {
      const loaded = action.saveData
      // Run offline sales catchup
      const { updatedSales, totalCompanyPayout } = processOfflineSales(loaded.activeSales || [])
      const stateWithOfflineCatchup = {
        ...loaded,
        money: loaded.money + totalCompanyPayout,
        activeSales: updatedSales,
        toasts: [
          ...(loaded.toasts || []),
          totalCompanyPayout > 0 ? {
            id: Date.now() + Math.random(),
            message: `Welcome back! Offline album sales earned ₩${totalCompanyPayout.toLocaleString()}.`,
            variant: 'gold',
          } : null,
        ].filter(Boolean),
      }
      saveGameToStorage('auto', stateWithOfflineCatchup)
      return stateWithOfflineCatchup
    }

    case ACTION.RESET_GAME: {
      localStorage.clear()
      return getInitialGameState()
    }

    case ACTION.PUSH_TOAST:
      return {
        ...state,
        toasts: [...(state.toasts || []).slice(-4), { id: Date.now() + Math.random(), ...action.toast }],
      }

    case ACTION.DISMISS_TOAST:
      return {
        ...state,
        toasts: (state.toasts || []).filter(t => t.id !== action.id),
      }

    default:
      return state
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, null, () => {
    // Attempt auto-load on start
    const saved = loadGameFromStorage('auto')
    if (saved && saved.started) {
      const { updatedSales, totalCompanyPayout } = processOfflineSales(saved.activeSales || [])
      return {
        ...saved,
        money: saved.money + totalCompanyPayout,
        activeSales: updatedSales,
      }
    }
    return getInitialGameState()
  })

  // Real-time sales progress ticker loop (runs every 1 second while game is open)
  useEffect(() => {
    if (!state.started || !state.activeSales || state.activeSales.length === 0) return
    const timer = setInterval(() => {
      dispatch({ type: ACTION.TICK_SALES })
    }, 1000)
    return () => clearInterval(timer)
  }, [state.started, state.activeSales?.length])

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
