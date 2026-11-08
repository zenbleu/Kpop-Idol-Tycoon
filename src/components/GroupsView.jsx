import React, { useState } from 'react'
import { useGame, ACTION } from '../game/state.jsx'
import { getMaknaeIdol, canAdjustIncomeDistribution } from '../game/groups.js'
import { GROUP_REMOVAL_COOLDOWN_WEEKS } from '../game/balance.js'
import { playSfx } from '../game/audio.js'
import { getAssetPath } from '../lib/assets.js'

export default function GroupsView() {
  const { state, dispatch } = useGame()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupGender, setNewGroupGender] = useState('Boy Group') // 'Boy Group' or 'Girl Group'
  const [selectedMemberIds, setSelectedMemberIds] = useState([])

  // Level 2: Selected group for detailed inspection and management
  const [selectedGroupId, setSelectedGroupId] = useState(null)

  // Role editor modal (Level 3)
  const [roleModalGroup, setRoleModalGroup] = useState(null)
  const [roleModalIdol, setRoleModalIdol] = useState(null)
  const [selectedRoles, setSelectedRoles] = useState([])

  // Kick member confirmation modal (Level 3)
  const [kickModal, setKickModal] = useState(null) // { group, idol }

  // Disband group confirmation modal (Level 3)
  const [disbandModalGroup, setDisbandModalGroup] = useState(null)

  // Income distribution modal (Level 3)
  const [incomeModalGroup, setIncomeModalGroup] = useState(null)
  const [companyPercent, setCompanyPercent] = useState(50)

  const maxGroups = state.maxGroupSlots || 3
  const currentGroupsCount = state.groups?.length || 0
  const canCreateMore = currentGroupsCount < maxGroups

  // Active selected group if any
  const selectedGroup = state.groups?.find(g => g.id === selectedGroupId) || null

  // Filter trainees for creation
  const requiredGender = newGroupGender === 'Boy Group' ? 'Male' : 'Female'
  const availableTrainees = state.idols.filter(idol => {
    if (idol.groupId) return false
    if (idol.gender !== requiredGender) return false
    if (idol.groupCooldownUntilWeek && idol.groupCooldownUntilWeek > (state.totalWeeksPassed || 1)) {
      return false
    }
    return true
  })

  // Open Create Modal
  const handleOpenCreateModal = () => {
    if (!canCreateMore) {
      dispatch({
        type: ACTION.PUSH_TOAST,
        toast: {
          message: `Group limit reached (${maxGroups}/${maxGroups}). Upgrade Headquarters to unlock more group slots!`,
          variant: 'red',
        },
      })
      playSfx('buzz')
      return
    }
    setNewGroupName('')
    setSelectedMemberIds([])
    setShowCreateModal(true)
    playSfx('click')
  }

  // Toggle member selection in creation
  const handleToggleMemberSelect = (id) => {
    playSfx('click')
    if (selectedMemberIds.includes(id)) {
      setSelectedMemberIds(selectedMemberIds.filter(i => i !== id))
    } else {
      if (selectedMemberIds.length >= (state.maxMembersPerGroup || 10)) {
        dispatch({
          type: ACTION.PUSH_TOAST,
          toast: {
            message: `Max group capacity is ${state.maxMembersPerGroup || 10} members!`,
            variant: 'red',
          },
        })
        playSfx('buzz')
        return
      }
      setSelectedMemberIds([...selectedMemberIds, id])
    }
  }

  // Submit create group
  const handleCreateGroup = (e) => {
    e.preventDefault()
    if (!newGroupName.trim()) {
      dispatch({
        type: ACTION.PUSH_TOAST,
        toast: { message: 'Please enter a group name.', variant: 'red' },
      })
      playSfx('buzz')
      return
    }
    if (selectedMemberIds.length === 0) {
      dispatch({
        type: ACTION.PUSH_TOAST,
        toast: { message: 'Select at least 1 member for the group.', variant: 'red' },
      })
      playSfx('buzz')
      return
    }

    dispatch({
      type: ACTION.CREATE_GROUP,
      name: newGroupName.trim(),
      gender: newGroupGender,
      memberIds: selectedMemberIds,
    })
    playSfx('cheer')
    setShowCreateModal(false)
  }

  // Open role modal
  const handleOpenRoleModal = (group, idol) => {
    setRoleModalGroup(group)
    setRoleModalIdol(idol)
    setSelectedRoles(idol.groupRoles || [])
    playSfx('click')
  }

  const roleOptions = ['Leader', 'Main Vocal', 'Lead Vocal', 'Main Dancer', 'Lead Dancer', 'Main Rapper', 'Lead Rapper', 'Visual', 'Center']

  const handleToggleRole = (role) => {
    playSfx('click')
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter(r => r !== role))
    } else {
      setSelectedRoles([...selectedRoles, role])
    }
  }

  const handleSaveRoles = () => {
    if (!roleModalIdol) return
    dispatch({
      type: ACTION.SET_GROUP_ROLES,
      idolId: roleModalIdol.id,
      roles: selectedRoles,
    })
    playSfx('coin')
    setRoleModalGroup(null)
    setRoleModalIdol(null)
  }

  // Income distribution modal
  const handleOpenIncomeModal = (group) => {
    const check = canAdjustIncomeDistribution(group, state.productions, state.activeSales)
    if (!check.allowed) {
      dispatch({
        type: ACTION.PUSH_TOAST,
        toast: { message: check.reason, variant: 'red' },
      })
      playSfx('buzz')
      return
    }
    setIncomeModalGroup(group)
    setCompanyPercent(group.incomeDistribution?.companyPercent ?? 50)
    playSfx('click')
  }

  const handleSaveIncomeDistribution = () => {
    if (!incomeModalGroup) return
    const groupPercent = 100 - companyPercent
    dispatch({
      type: ACTION.SET_INCOME_DISTRIBUTION,
      groupId: incomeModalGroup.id,
      companyPercent,
      groupPercent,
    })
    playSfx('coin')
    setIncomeModalGroup(null)
  }

  // Kick idol
  const handleConfirmKick = () => {
    if (!kickModal) return
    dispatch({
      type: ACTION.REMOVE_IDOL_FROM_GROUP,
      groupId: kickModal.group.id,
      idolId: kickModal.idol.id,
    })
    playSfx('buzz')
    setKickModal(null)
  }

  // Disband group
  const handleConfirmDisband = () => {
    if (!disbandModalGroup) return
    dispatch({
      type: ACTION.DISBAND_GROUP,
      groupId: disbandModalGroup.id,
    })
    playSfx('buzz')
    setDisbandModalGroup(null)
    setSelectedGroupId(null)
  }

  return (
    <div className="space-y-4">
      {/* ── Top Header Bar ───────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#1e1338] border-2 border-[#543b8a] p-3.5 sm:p-4 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">👥</span>
            <h2 className="text-base sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-300 font-pixel">
              IDOL GROUPS MANAGEMENT
            </h2>
          </div>
          <p className="text-[10px] text-purple-200 mt-0.5 font-pixel leading-relaxed">
            Form flagship Boy & Girl Groups (up to {state.maxMembersPerGroup || 10} members). Select a group to inspect members, assign official roles, and configure revenue splits.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-pixel text-yellow-300 bg-[#2d1b4e] px-3 py-2 rounded-lg border border-yellow-500/30 whitespace-nowrap">
            Active Groups: {currentGroupsCount} / {maxGroups}
          </span>
          <button
            onClick={handleOpenCreateModal}
            disabled={!canCreateMore}
            className="btn-primary text-xs font-pixel py-2 px-3 sm:px-4 shadow-md flex items-center gap-1.5 whitespace-nowrap"
          >
            + DEBUT NEW GROUP
          </button>
        </div>
      </div>

      {/* ── Level 1: Groups Overview Grid (When No Group Selected) ─────── */}
      {!selectedGroup ? (
        <div>
          {(!state.groups || state.groups.length === 0) ? (
            <div className="bg-[#1e1338]/80 border-2 border-dashed border-[#543b8a] rounded-2xl p-12 text-center">
              <div className="text-5xl mb-4">🎤</div>
              <h3 className="text-base font-bold text-white font-pixel mb-2">No Active Groups Yet</h3>
              <p className="text-xs text-purple-300 font-pixel max-w-md mx-auto mb-6 leading-relaxed">
                Your agency currently has no debuted idol groups. Scout trainees from auditions and form your first flagship group!
              </p>
              <button
                onClick={handleOpenCreateModal}
                className="btn-primary text-xs font-pixel py-3 px-6"
              >
                CREATE FIRST IDOL GROUP
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {state.groups.map(group => {
                const groupMembers = state.idols.filter(i => group.members.includes(i.id))
                const maknae = getMaknaeIdol(group, state.idols)

                return (
                  <div
                    key={group.id}
                    onClick={() => {
                      setSelectedGroupId(group.id)
                      playSfx('click')
                    }}
                    className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-4 shadow-xl hover:border-pink-400 cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between"
                  >
                    <div>
                      {/* Group Header Strip */}
                      <div className="flex items-center gap-3 pb-3 border-b border-[#3b2762]">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-600 to-purple-800 border-2 border-pink-400 flex items-center justify-center text-lg font-bold text-white shadow flex-shrink-0">
                          {group.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h3 className="text-sm font-bold text-white font-pixel truncate">
                              {group.name}
                            </h3>
                            <span className={`px-1.5 py-0.2 rounded text-[8px] font-pixel ${
                              group.gender === 'Boy Group' ? 'bg-blue-900/70 text-blue-300 border border-blue-600' : 'bg-pink-900/70 text-pink-300 border border-pink-600'
                            }`}>
                              {group.gender}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[9px] font-pixel text-yellow-300 mt-1">
                            <span className="bg-yellow-950/60 border border-yellow-600/40 px-1 rounded">
                              Tier {group.tier}
                            </span>
                            {maknae && (
                              <span className="text-pink-300 truncate">
                                Maknae: {maknae.stageName || maknae.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Group Metrics Row */}
                      <div className="grid grid-cols-3 gap-2 bg-[#120b24] p-2.5 rounded-xl border border-[#3b2462] my-3 text-[9px] font-pixel text-center">
                        <div>
                          <span className="text-purple-400 block text-[8px]">MEMBERS</span>
                          <span className="text-white font-bold">{group.members.length} / {state.maxMembersPerGroup || 10}</span>
                        </div>
                        <div>
                          <span className="text-purple-400 block text-[8px]">FANDOM</span>
                          <span className="text-emerald-400 font-bold">{(group.fanbase || 0).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-purple-400 block text-[8px]">LOYALTY</span>
                          <span className="text-yellow-300 font-bold">{group.loyalty || 80}%</span>
                        </div>
                      </div>

                      {/* Member Avatars Row */}
                      <div className="flex items-center gap-1.5 overflow-hidden py-1">
                        {groupMembers.slice(0, 5).map(m => (
                          <img
                            key={m.id}
                            src={getAssetPath(m.portrait)}
                            alt={m.name}
                            title={`${m.stageName || m.name} (${m.tier}-Tier)`}
                            className="w-8 h-8 rounded-full object-cover border-2 border-purple-400/60 shadow flex-shrink-0"
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = getAssetPath('/images/actors-portraits/Actor_01.jpg')
                            }}
                          />
                        ))}
                        {groupMembers.length > 5 && (
                          <span className="text-[9px] font-pixel text-purple-300 bg-[#2d1b4e] px-2 py-1 rounded-full border border-purple-500/40">
                            +{groupMembers.length - 5}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#37235a] flex items-center justify-between text-[10px] font-pixel text-pink-400 font-bold">
                      <span>Popularity: {group.popularity || 0}/100</span>
                      <span>Manage Group →</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      ) : (
        /* ── Level 2 & 3: Selected Group Detail View ──────────────────── */
        <div className="space-y-4">
          <div className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
            {/* Top Navigation & Actions Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#3b2762] gap-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setSelectedGroupId(null)
                    playSfx('click')
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-pixel bg-[#241744] hover:bg-[#342260] text-purple-200 border border-purple-500/40 transition-colors flex items-center gap-1"
                >
                  ← All Groups
                </button>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-white font-pixel">
                    {selectedGroup.name}
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-pixel ${
                    selectedGroup.gender === 'Boy Group' ? 'bg-blue-900/70 text-blue-300 border border-blue-600' : 'bg-pink-900/70 text-pink-300 border border-pink-600'
                  }`}>
                    {selectedGroup.gender}
                  </span>
                  <span className="text-[9px] font-pixel bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-2 py-0.5 rounded">
                    Tier: {selectedGroup.tier}
                  </span>
                </div>
              </div>

              {/* Group Action Buttons (Level 3) */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenIncomeModal(selectedGroup)}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-pixel bg-[#2d1b4e] hover:bg-[#3d2668] text-yellow-300 border border-yellow-500/40 flex items-center gap-1.5 transition-colors shadow"
                >
                  <span>💰</span> Split: {selectedGroup.incomeDistribution?.companyPercent || 50}% / {selectedGroup.incomeDistribution?.groupPercent || 50}%
                </button>
                <button
                  onClick={() => setDisbandModalGroup(selectedGroup)}
                  className="px-3 py-1.5 rounded-lg text-[10px] font-pixel bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-700/60 transition-colors"
                >
                  Disband
                </button>
              </div>
            </div>

            {/* Group Stats & Maknae Strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#120b24] p-3 rounded-xl border border-[#3b2462] text-[10px] font-pixel">
              <div className="flex items-center gap-4 flex-wrap">
                <span>Members: <strong className="text-white">{selectedGroup.members.length} / {state.maxMembersPerGroup || 10}</strong></span>
                <span>•</span>
                <span>Popularity: <strong className="text-pink-300">{selectedGroup.popularity || 0}/100</strong></span>
                <span>•</span>
                <span>Fanbase: <strong className="text-emerald-400">{(selectedGroup.fanbase || 0).toLocaleString()} fans</strong></span>
                <span>•</span>
                <span>Loyalty: <strong className="text-yellow-300">{selectedGroup.loyalty || 80}%</strong></span>
              </div>
              {(() => {
                const maknae = getMaknaeIdol(selectedGroup, state.idols)
                return maknae ? (
                  <span className="text-[10px] font-pixel text-pink-300 bg-pink-950/70 border border-pink-500/40 px-2.5 py-1 rounded-full">
                    ✨ Official Maknae: {maknae.stageName || maknae.name} ({maknae.age}y)
                  </span>
                ) : null
              })()}
            </div>

            {/* Member Roster Grid (Level 2 & 3) */}
            <div>
              <div className="text-xs font-pixel text-purple-200 mb-3 font-bold">
                GROUP LINEUP & STAGE ROLES ({selectedGroup.members.length} MEMBERS)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-1">
                {state.idols.filter(i => selectedGroup.members.includes(i.id)).map(member => {
                  const maknae = getMaknaeIdol(selectedGroup, state.idols)
                  const isMaknae = maknae?.id === member.id

                  return (
                    <div
                      key={member.id}
                      className="bg-[#241744] border border-[#442f70] rounded-xl p-3 flex flex-col justify-between hover:border-pink-500/40 transition-colors relative shadow-sm"
                    >
                      {isMaknae && (
                        <div className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[8px] font-pixel px-1.5 py-0.5 rounded shadow">
                          MAKNAE
                        </div>
                      )}

                      <div>
                        {/* Member Thumbnail & Identity */}
                        <div className="flex items-start gap-2.5">
                          <img
                            src={getAssetPath(member.portrait)}
                            alt={member.name}
                            className="w-12 h-12 rounded-lg object-cover border-2 border-purple-400/50 shadow flex-shrink-0"
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = getAssetPath('/images/actors-portraits/Actor_01.jpg')
                            }}
                          />
                          <div className="flex-1 min-w-0 font-pixel">
                            <h4 className="text-xs font-bold text-white truncate">
                              {member.stageName || member.name}
                            </h4>
                            <p className="text-[9px] text-purple-300 truncate">
                              {member.name} • {member.age}y
                            </p>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-[8px] text-yellow-300 bg-yellow-950/60 border border-yellow-600/40 px-1 rounded">
                                {member.tier}-Tier
                              </span>
                              <span className="text-[8px] text-pink-300 truncate">
                                {member.specialty}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Stage Roles Tag Row */}
                        <div className="mt-2.5 pt-2 border-t border-[#37235a]">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[8px] font-pixel text-purple-300">ROLES:</span>
                            <button
                              onClick={() => handleOpenRoleModal(selectedGroup, member)}
                              className="text-[8px] font-pixel text-pink-400 hover:text-pink-300 underline"
                            >
                              Edit Roles
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-1 min-h-[20px]">
                            {(member.groupRoles && member.groupRoles.length > 0) ? (
                              member.groupRoles.map(role => (
                                <span
                                  key={role}
                                  className="text-[8px] font-pixel bg-[#321c59] text-purple-200 border border-[#52338c] px-1.5 py-0.5 rounded"
                                >
                                  {role}
                                </span>
                              ))
                            ) : (
                              <span className="text-[8px] font-pixel text-purple-400 italic">No roles assigned</span>
                            )}
                          </div>
                        </div>

                        {/* Stamina & Fatigue */}
                        <div className="mt-2 text-[8px] font-pixel space-y-1">
                          <div className="flex justify-between text-purple-300">
                            <span>STA: {member.currentStamina ?? 100}%</span>
                            <span>FAT: {member.fatigue ?? 0}%</span>
                          </div>
                          <div className="w-full bg-[#170e2b] h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-emerald-400 h-full rounded-full"
                              style={{ width: `${member.currentStamina ?? 100}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Remove from Group (Level 3) */}
                      <div className="mt-3 pt-2 border-t border-[#37235a] flex justify-end">
                        <button
                          onClick={() => setKickModal({ group: selectedGroup, idol: member })}
                          className="text-[9px] font-pixel text-red-400 hover:text-red-300 hover:underline"
                        >
                          Kick from Group
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Level 3: Modals ───────────────────────────────────────────── */}

      {/* CREATE GROUP MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1c1236] border-2 border-[#5d3b9e] rounded-2xl p-5 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#3d276b]">
              <h3 className="text-sm font-bold text-yellow-300 font-pixel">
                DEBUT NEW IDOL GROUP
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-purple-400 hover:text-white font-pixel text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-xs font-pixel text-purple-200 mb-1">
                  GROUP NAME *
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="e.g. STARLIGHT, ECLIPSE, CHROMA"
                  maxLength={24}
                  className="w-full bg-[#120b24] border border-[#52338c] rounded-lg px-3 py-2 text-white font-pixel text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-pixel text-purple-200 mb-1">
                  GROUP TYPE *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setNewGroupGender('Boy Group')
                      setSelectedMemberIds([])
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-pixel transition-all ${
                      newGroupGender === 'Boy Group'
                        ? 'bg-blue-900/60 border-blue-400 text-blue-200 shadow-md font-bold'
                        : 'bg-[#241744] border-[#442f70] text-purple-300'
                    }`}
                  >
                    👑 Boy Group (Male)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setNewGroupGender('Girl Group')
                      setSelectedMemberIds([])
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-pixel transition-all ${
                      newGroupGender === 'Girl Group'
                        ? 'bg-pink-900/60 border-pink-400 text-pink-200 shadow-md font-bold'
                        : 'bg-[#241744] border-[#442f70] text-purple-300'
                    }`}
                  >
                    💖 Girl Group (Female)
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-pixel text-purple-200">
                    SELECT TRAINEES ({selectedMemberIds.length} / {state.maxMembersPerGroup || 10})
                  </label>
                  <span className="text-[10px] font-pixel text-yellow-300">
                    Eligible: {availableTrainees.length} trainees
                  </span>
                </div>

                {availableTrainees.length === 0 ? (
                  <div className="p-5 bg-[#120b24] rounded-xl border border-[#3b2462] text-center">
                    <p className="text-xs text-purple-300 font-pixel">
                      No available {requiredGender} trainees without group membership.
                    </p>
                    <p className="text-[10px] text-purple-400 font-pixel mt-1">
                      Scout new candidates in the Auditions tab!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto p-1 bg-[#120b24] rounded-xl border border-[#3b2462]">
                    {availableTrainees.map(idol => {
                      const isSelected = selectedMemberIds.includes(idol.id)
                      return (
                        <div
                          key={idol.id}
                          onClick={() => handleToggleMemberSelect(idol.id)}
                          className={`p-2 rounded-lg border cursor-pointer flex items-center gap-2.5 transition-all ${
                            isSelected
                              ? 'bg-pink-950/80 border-pink-500 shadow-sm'
                              : 'bg-[#1e1338] border-[#3e2768] hover:border-purple-400'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded accent-pink-500"
                          />
                          <img
                            src={getAssetPath(idol.portrait)}
                            alt={idol.name}
                            className="w-9 h-9 rounded-lg object-cover border border-purple-400/50 flex-shrink-0"
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = getAssetPath('/images/actors-portraits/Actor_01.jpg')
                            }}
                          />
                          <div className="min-w-0 flex-1 font-pixel">
                            <div className="text-xs font-bold text-white truncate">
                              {idol.stageName || idol.name}
                            </div>
                            <div className="text-[8px] text-purple-300 flex items-center gap-1 mt-0.5">
                              <span className="text-yellow-300">{idol.tier}-Tier</span>
                              <span>•</span>
                              <span>{idol.age}y</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#3d276b] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-pixel bg-[#241744] text-purple-200 border border-purple-500/40"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={selectedMemberIds.length === 0 || !newGroupName.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-pixel bg-pink-600 hover:bg-pink-500 disabled:bg-gray-800 disabled:text-gray-500 text-white font-bold border-2 border-pink-400 shadow-lg"
                >
                  DEBUT GROUP
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ROLE EDITOR MODAL */}
      {roleModalIdol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1c1236] border-2 border-[#5d3b9e] rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#3d276b]">
              <h3 className="text-sm font-bold text-white font-pixel">
                ASSIGN ROLES: {roleModalIdol.stageName || roleModalIdol.name}
              </h3>
              <button
                onClick={() => setRoleModalIdol(null)}
                className="text-purple-400 hover:text-white font-pixel text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-purple-200 font-pixel leading-relaxed">
              Select one or multiple official roles for this member within <span className="text-pink-300">{roleModalGroup?.name}</span>:
            </p>

            <div className="grid grid-cols-2 gap-2">
              {roleOptions.map(role => {
                const isSelected = selectedRoles.includes(role)
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleToggleRole(role)}
                    className={`p-2 rounded-lg border text-xs font-pixel transition-all text-left ${
                      isSelected
                        ? 'bg-pink-900/70 border-pink-400 text-yellow-300 shadow-sm font-bold'
                        : 'bg-[#241744] border-[#442f70] text-purple-200 hover:border-purple-400'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '} {role}
                  </button>
                )
              })}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-[#3d276b]">
              <button
                onClick={() => setRoleModalIdol(null)}
                className="px-4 py-2 rounded-xl text-xs font-pixel bg-[#241744] text-purple-200 border border-purple-500/40"
              >
                CANCEL
              </button>
              <button
                onClick={handleSaveRoles}
                className="px-5 py-2 rounded-xl text-xs font-pixel bg-pink-600 hover:bg-pink-500 text-white font-bold border-2 border-pink-400 shadow"
              >
                SAVE ROLES
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INCOME DISTRIBUTION MODAL */}
      {incomeModalGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1c1236] border-2 border-[#5d3b9e] rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#3d276b]">
              <h3 className="text-sm font-bold text-yellow-300 font-pixel">
                REVENUE DISTRIBUTION: {incomeModalGroup.name}
              </h3>
              <button
                onClick={() => setIncomeModalGroup(null)}
                className="text-purple-400 hover:text-white font-pixel text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-purple-200 font-pixel leading-relaxed">
              Adjust how album and concert earnings are split between the company agency and group members.
            </p>

            <div className="bg-[#120b24] p-4 rounded-xl border border-[#3b2462] space-y-3 font-pixel text-xs">
              <div className="flex justify-between items-center">
                <span className="text-purple-300">Company Agency:</span>
                <span className="text-yellow-300 font-bold">{companyPercent}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="90"
                step="5"
                value={companyPercent}
                onChange={(e) => setCompanyPercent(Number(e.target.value))}
                className="w-full accent-pink-500 cursor-pointer"
              />
              <div className="flex justify-between items-center">
                <span className="text-purple-300">Group Members:</span>
                <span className="text-pink-300 font-bold">{100 - companyPercent}%</span>
              </div>
            </div>

            <p className="text-[9px] text-purple-300 font-pixel leading-relaxed">
              Higher member percentage boosts idol loyalty and morale. Lower member percentage increases agency profit margins. Locked during album production or active sales.
            </p>

            <div className="flex justify-end gap-3 pt-2 border-t border-[#3d276b]">
              <button
                onClick={() => setIncomeModalGroup(null)}
                className="px-4 py-2 rounded-xl text-xs font-pixel bg-[#241744] text-purple-200 border border-purple-500/40"
              >
                CANCEL
              </button>
              <button
                onClick={handleSaveIncomeDistribution}
                className="px-5 py-2 rounded-xl text-xs font-pixel bg-yellow-500 hover:bg-yellow-400 text-black font-bold border-2 border-yellow-300 shadow"
              >
                CONFIRM SPLIT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KICK MEMBER MODAL */}
      {kickModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1c1236] border-2 border-red-700 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-3">
            <h3 className="text-sm font-bold text-red-400 font-pixel">
              ⚠️ REMOVE IDOL FROM GROUP?
            </h3>
            <p className="text-xs text-purple-200 font-pixel leading-relaxed">
              Are you sure you want to kick <span className="text-yellow-300">{kickModal.idol.stageName || kickModal.idol.name}</span> from <span className="text-pink-300">{kickModal.group.name}</span>?
            </p>

            <div className="bg-red-950/50 border border-red-800/60 rounded-xl p-3 text-[9px] text-red-200 font-pixel space-y-1">
              <p>• Idol will return to company trainee roster.</p>
              <p>• Mandatory <span className="text-yellow-300 font-bold">6-MONTH COOLDOWN ({GROUP_REMOVAL_COOLDOWN_WEEKS} WEEKS)</span> before joining any other group.</p>
              <p>• Group loyalty will drop by -15.</p>
              <p>• Group popularity will suffer a slight penalty.</p>
            </div>

            <div className="flex justify-between gap-3 pt-2">
              <button
                onClick={() => setKickModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-pixel bg-[#241744] text-purple-200 border border-purple-500/40"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmKick}
                className="btn-danger text-xs font-pixel py-2 px-4 shadow"
              >
                CONFIRM KICK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISBAND GROUP MODAL */}
      {disbandModalGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1c1236] border-2 border-red-700 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-3">
            <h3 className="text-sm font-bold text-red-400 font-pixel">
              ⚠️ DISBAND {disbandModalGroup.name.toUpperCase()}?
            </h3>
            <p className="text-xs text-purple-200 font-pixel leading-relaxed">
              Disbanding <span className="text-yellow-300">{disbandModalGroup.name}</span> will dissolve the group. All members will return to trainee status with a loyalty penalty.
            </p>
            <div className="flex justify-between gap-3 pt-2">
              <button
                onClick={() => setDisbandModalGroup(null)}
                className="px-4 py-2 rounded-xl text-xs font-pixel bg-[#241744] text-purple-200 border border-purple-500/40"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmDisband}
                className="btn-danger text-xs font-pixel py-2 px-4 shadow"
              >
                DISBAND GROUP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
