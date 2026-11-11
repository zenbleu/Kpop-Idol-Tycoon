/**
 * GroupsView.jsx — Modal-First Idol Groups Management.
 *
 * Level 1: Main tab is a clean overview of all debuted boy and girl groups.
 *          Does NOT swap out the main screen with a huge detailed panel.
 * Level 2: Dedicated Group Management Modal for the selected group containing
 *          the full member lineup, role assignments, and revenue distribution.
 * Level 3: Submodals for role assignment, kicking members, and disbandment.
 */

import React, { useState } from 'react'
import { useGame, ACTION } from '../game/state.jsx'
import { getMaknaeIdol, canAdjustIncomeDistribution } from '../game/groups.js'
import { GROUP_REMOVAL_COOLDOWN_WEEKS } from '../game/balance.js'
import { playSfx } from '../game/audio.js'
import { getAssetPath } from '../lib/assets.js'
import Modal from './ui/Modal.jsx'

export default function GroupsView() {
  const { state, dispatch } = useGame()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [newGroupGender, setNewGroupGender] = useState('Boy Group') // 'Boy Group' or 'Girl Group'
  const [selectedMemberIds, setSelectedMemberIds] = useState([])

  // Modal-First: Selected group opens in a Management Modal (never replaces main tab)
  const [inspectingGroup, setInspectingGroup] = useState(null)

  // Submodals (Level 3)
  const [roleModalIdol, setRoleModalIdol] = useState(null) // idol to edit roles for
  const [selectedRoles, setSelectedRoles] = useState([])
  const [kickModal, setKickModal] = useState(null) // { group, idol }
  const [disbandModalGroup, setDisbandModalGroup] = useState(null)
  const [tempCompanyPercent, setTempCompanyPercent] = useState(50)

  const maxGroups = state.maxGroupSlots || 3
  const currentGroupsCount = state.groups?.length || 0
  const canCreateMore = currentGroupsCount < maxGroups

  // Active group data synced with state
  const activeGroup = state.groups?.find(g => g.id === inspectingGroup?.id) || inspectingGroup

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
  const handleOpenRoleModal = (idol) => {
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
    setRoleModalIdol(null)
  }

  // Save Income distribution
  const handleSaveIncomeDistribution = () => {
    if (!activeGroup) return
    const check = canAdjustIncomeDistribution(activeGroup, state.productions, state.activeSales)
    if (!check.allowed) {
      dispatch({
        type: ACTION.PUSH_TOAST,
        toast: { message: check.reason, variant: 'red' },
      })
      playSfx('buzz')
      return
    }

    const groupPercent = 100 - tempCompanyPercent
    dispatch({
      type: ACTION.SET_INCOME_DISTRIBUTION,
      groupId: activeGroup.id,
      companyPercent: tempCompanyPercent,
      groupPercent,
    })
    playSfx('coin')
    dispatch({
      type: ACTION.PUSH_TOAST,
      toast: { message: `Revenue split updated: ${tempCompanyPercent}% Agency / ${groupPercent}% Group`, variant: 'gold' },
    })
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
    setInspectingGroup(null)
  }

  const handleOpenGroupManagement = (group) => {
    setInspectingGroup(group)
    setTempCompanyPercent(group.incomeDistribution?.companyPercent ?? 50)
    playSfx('click')
  }

  return (
    <div className="space-y-4 font-pixel">
      {/* ── LEVEL 1: Main Tab Overview Header ──────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#1e1338] border-2 border-[#543b8a] p-3.5 sm:p-4 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">👥</span>
            <h2 className="text-sm sm:text-base font-bold text-white">
              IDOL GROUPS OVERVIEW
            </h2>
          </div>
          <p className="text-[10px] text-purple-200 mt-0.5">
            Active Groups: <strong className="text-yellow-300">{currentGroupsCount} / {maxGroups} Slots</strong> · Select a group to open the Group Management Modal
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleOpenCreateModal}
            disabled={!canCreateMore}
            className="btn-primary text-xs py-2 px-3 sm:px-4 shadow-md flex items-center gap-1.5 whitespace-nowrap active:scale-95"
          >
            + Debut New Group
          </button>
        </div>
      </div>

      {/* ── LEVEL 1: Groups Compact Overview Grid ──────────────────────── */}
      {(!state.groups || state.groups.length === 0) ? (
        <div className="bg-[#1e1338]/80 border-2 border-dashed border-[#543b8a] rounded-2xl p-10 text-center">
          <div className="text-4xl mb-3">🎤</div>
          <h3 className="text-sm font-bold text-white mb-1">No Active Groups Yet</h3>
          <p className="text-xs text-purple-300 max-w-md mx-auto mb-5 leading-relaxed">
            Form your agency's flagship Boy or Girl Group to begin producing albums, scheduling TV appearances, and filling stadiums!
          </p>
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="btn-primary text-xs py-2.5 px-5"
          >
            + Debut First Group
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {state.groups.map(group => {
            const groupMembers = state.idols.filter(i => group.members.includes(i.id))
            const maknae = getMaknaeIdol(group, state.idols)
            const split = group.incomeDistribution || { companyPercent: 50, groupPercent: 50 }

            return (
              <div
                key={group.id}
                onClick={() => handleOpenGroupManagement(group)}
                className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-4 shadow-xl hover:border-pink-400 cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between"
                title="Click to open group management modal"
              >
                <div>
                  {/* Group Identity Header */}
                  <div className="flex items-center justify-between pb-2.5 border-b border-[#3b2762]">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-white truncate">
                          {group.name}
                        </h3>
                        <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                          group.gender === 'Boy Group'
                            ? 'bg-blue-900/70 text-blue-300 border border-blue-600'
                            : 'bg-pink-900/70 text-pink-300 border border-pink-600'
                        }`}>
                          {group.gender}
                        </span>
                        <span className="text-[8px] bg-yellow-950/70 border border-yellow-500/40 text-yellow-300 px-1 py-0.2 rounded font-bold">
                          Tier {group.tier}
                        </span>
                      </div>
                      {maknae && (
                        <p className="text-[9px] text-pink-300 truncate mt-0.5">
                          Maknae: {maknae.stageName || maknae.name} ({maknae.age}y)
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Compact Metrics Strip */}
                  <div className="grid grid-cols-3 gap-2 bg-[#120b24] p-2 rounded-xl border border-[#3b2462] my-2.5 text-[9px] text-center">
                    <div>
                      <span className="text-[8px] text-purple-400 block">MEMBERS</span>
                      <strong className="text-white">{group.members.length} / {state.maxMembersPerGroup || 10}</strong>
                    </div>
                    <div>
                      <span className="text-[8px] text-purple-400 block">FANBASE</span>
                      <strong className="text-emerald-400">{(group.fanbase || 0).toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-[8px] text-purple-400 block">LOYALTY</span>
                      <strong className="text-yellow-300">{group.loyalty || 80}%</strong>
                    </div>
                  </div>

                  {/* Compact Member Roster Preview (Text/Micro Dots, No Large Portraits) */}
                  <div className="text-[9px] text-purple-300 line-clamp-1 py-1">
                    Lineup: {groupMembers.map(m => m.stageName || m.name).join(' · ')}
                  </div>
                </div>

                {/* Footer Split & Action */}
                <div className="mt-2.5 pt-2 border-t border-[#37235a] flex items-center justify-between text-[9px]">
                  <span className="text-purple-300">
                    Split: <strong className="text-yellow-300">{split.companyPercent}%</strong> / {split.groupPercent}%
                  </span>
                  <span className="text-pink-400 font-bold hover:underline">
                    Manage Group →
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── LEVEL 2: DEDICATED GROUP MANAGEMENT MODAL ─────────────────── */}
      {activeGroup && (
        <Modal
          isOpen={!!activeGroup}
          onClose={() => setInspectingGroup(null)}
          title={`GROUP MANAGEMENT: ${activeGroup.name}`}
          subtitle={`${activeGroup.gender} · Tier ${activeGroup.tier} · ${activeGroup.members.length} Members`}
          icon="👥"
          size="xl"
          borderColor="border-pink-500"
          footer={
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setDisbandModalGroup(activeGroup)}
                className="px-3 py-1.5 rounded-lg text-xs bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-700/60 transition-colors"
              >
                ⚠️ Disband Group
              </button>
              <button
                type="button"
                onClick={() => setInspectingGroup(null)}
                className="px-4 py-1.5 rounded-lg text-xs bg-[#241744] hover:bg-[#342260] text-purple-200 border border-purple-500/40"
              >
                Close Management
              </button>
            </div>
          }
        >
          {/* Section 1: Overview & Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-[#120b24] p-3 rounded-xl border border-[#3b2462] text-[10px] text-center">
            <div>
              <span className="text-purple-400 block text-[9px]">Capacity</span>
              <strong className="text-white text-xs">{activeGroup.members.length} / {state.maxMembersPerGroup || 10}</strong>
            </div>
            <div>
              <span className="text-purple-400 block text-[9px]">Popularity</span>
              <strong className="text-pink-300 text-xs">{activeGroup.popularity || 0} / 100</strong>
            </div>
            <div>
              <span className="text-purple-400 block text-[9px]">Global Fandom</span>
              <strong className="text-emerald-400 text-xs">{(activeGroup.fanbase || 0).toLocaleString()}</strong>
            </div>
            <div>
              <span className="text-purple-400 block text-[9px]">Group Loyalty</span>
              <strong className="text-yellow-300 text-xs">{activeGroup.loyalty || 80}%</strong>
            </div>
          </div>

          {/* Section 2: Member Lineup & Stage Roles */}
          <div>
            <div className="text-xs text-purple-200 font-bold mb-2 uppercase">
              Group Lineup & Stage Roles ({activeGroup.members.length} Members)
            </div>
            <div className="space-y-2 max-h-[320px] overflow-y-auto pr-1">
              {state.idols.filter(i => activeGroup.members.includes(i.id)).map(member => {
                const maknae = getMaknaeIdol(activeGroup, state.idols)
                const isMaknae = maknae?.id === member.id

                return (
                  <div
                    key={member.id}
                    className="p-2.5 rounded-xl bg-[#241744] border border-[#442f70] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                  >
                    {/* Identity */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={getAssetPath(member.portrait)}
                        alt={member.name}
                        className="rounded-lg object-cover border border-purple-400/50 flex-shrink-0"
                        style={{
                          width: '32px',
                          height: '32px',
                          minWidth: '32px',
                          minHeight: '32px',
                          maxWidth: '32px',
                          maxHeight: '32px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                        }}
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = getAssetPath('/images/actors-portraits/Actor_01.jpg')
                        }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <strong className="text-white text-xs truncate">
                            {member.stageName || member.name}
                          </strong>
                          <span className="text-[8px] text-yellow-300 bg-yellow-950/70 border border-yellow-500/40 px-1 rounded">
                            {member.tier}
                          </span>
                          {isMaknae && (
                            <span className="text-[8px] text-pink-300 bg-pink-950/80 border border-pink-500/40 px-1 rounded">
                              MAKNAE
                            </span>
                          )}
                        </div>
                        <div className="text-[9px] text-purple-300 truncate">
                          {member.specialty} · Age {member.age} · STA {member.currentStamina ?? 100}%
                        </div>
                      </div>
                    </div>

                    {/* Roles & Controls */}
                    <div className="flex items-center gap-2 flex-wrap sm:justify-end">
                      <div className="flex flex-wrap gap-1">
                        {(member.groupRoles && member.groupRoles.length > 0) ? (
                          member.groupRoles.map(role => (
                            <span
                              key={role}
                              className="text-[8px] bg-[#321c59] text-purple-200 border border-[#52338c] px-1.5 py-0.2 rounded"
                            >
                              {role}
                            </span>
                          ))
                        ) : (
                          <span className="text-[8px] text-purple-400 italic">No roles</span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenRoleModal(member)}
                        className="px-2 py-1 rounded text-[9px] bg-pink-900/60 hover:bg-pink-800 text-pink-200 border border-pink-500/40"
                      >
                        Edit Roles
                      </button>

                      <button
                        type="button"
                        onClick={() => setKickModal({ group: activeGroup, idol: member })}
                        className="px-2 py-1 rounded text-[9px] bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-700/60"
                      >
                        Kick
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Section 3: Revenue Distribution Configuration */}
          <div className="bg-[#120b24] p-3.5 rounded-xl border border-[#3b2462] space-y-2 text-xs">
            <div className="flex justify-between items-center text-[10px]">
              <span className="text-purple-300">Revenue Split Configuration:</span>
              <span className="text-yellow-300 font-bold">
                {tempCompanyPercent}% Agency / {100 - tempCompanyPercent}% Group
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="90"
              step="5"
              value={tempCompanyPercent}
              onChange={(e) => setTempCompanyPercent(Number(e.target.value))}
              className="w-full accent-pink-500 cursor-pointer"
            />
            <div className="flex justify-between items-center pt-1">
              <span className="text-[9px] text-purple-400">
                Higher member share increases loyalty. Lower increases profit margins.
              </span>
              <button
                type="button"
                onClick={handleSaveIncomeDistribution}
                className="px-3 py-1 rounded-lg text-[9px] font-bold bg-yellow-500 hover:bg-yellow-400 text-black shadow"
              >
                Save Split
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── LEVEL 3: DEBUT NEW GROUP MODAL ─────────────────────────────── */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="DEBUT NEW IDOL GROUP"
          subtitle={`Select gender and assemble lineup (Capacity: ${state.maxMembersPerGroup || 10})`}
          icon="✨"
          size="lg"
          borderColor="border-pink-500"
        >
          <form onSubmit={handleCreateGroup} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-purple-200 mb-1">GROUP NAME *</label>
              <input
                type="text"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="e.g. STARLIGHT, ECLIPSE, CHROMA"
                maxLength={24}
                className="w-full bg-[#120b24] border border-[#52338c] rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:border-pink-500"
              />
            </div>

            <div>
              <label className="block text-purple-200 mb-1">GROUP TYPE *</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setNewGroupGender('Boy Group')
                    setSelectedMemberIds([])
                  }}
                  className={`p-2 rounded-xl border text-xs transition-all ${
                    newGroupGender === 'Boy Group'
                      ? 'bg-blue-900/60 border-blue-400 text-blue-200 font-bold shadow'
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
                  className={`p-2 rounded-xl border text-xs transition-all ${
                    newGroupGender === 'Girl Group'
                      ? 'bg-pink-900/60 border-pink-400 text-pink-200 font-bold shadow'
                      : 'bg-[#241744] border-[#442f70] text-purple-300'
                  }`}
                >
                  💖 Girl Group (Female)
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-purple-200">
                  SELECT TRAINEES ({selectedMemberIds.length} / {state.maxMembersPerGroup || 10})
                </label>
                <span className="text-[10px] text-yellow-300">
                  Available: {availableTrainees.length} candidates
                </span>
              </div>

              {availableTrainees.length === 0 ? (
                <div className="p-4 bg-[#120b24] rounded-xl border border-[#3b2462] text-center text-purple-300">
                  <p>No available {requiredGender} trainees without group membership.</p>
                  <p className="text-[10px] text-purple-400 mt-1">Scout new candidates in Auditions tab!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 bg-[#120b24] rounded-xl border border-[#3b2462]">
                  {availableTrainees.map(idol => {
                    const isSelected = selectedMemberIds.includes(idol.id)
                    return (
                      <div
                        key={idol.id}
                        onClick={() => handleToggleMemberSelect(idol.id)}
                        className={`p-2 rounded-lg border cursor-pointer flex items-center gap-2 transition-all ${
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
                          className="rounded-lg object-cover border border-purple-400/50 flex-shrink-0"
                          style={{
                            width: '28px',
                            height: '28px',
                            minWidth: '28px',
                            minHeight: '28px',
                            maxWidth: '28px',
                            maxHeight: '28px',
                            borderRadius: '6px',
                            objectFit: 'cover',
                          }}
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = getAssetPath('/images/actors-portraits/Actor_01.jpg')
                          }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-white truncate">
                            {idol.stageName || idol.name}
                          </div>
                          <div className="text-[8px] text-purple-300">
                            {idol.tier}-Tier · {idol.age}y · {idol.specialty}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-[#3d276b] flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs bg-[#241744] text-purple-200 border border-purple-500/40"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={selectedMemberIds.length === 0 || !newGroupName.trim()}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-pink-600 hover:bg-pink-500 disabled:bg-gray-800 disabled:text-gray-500 text-white border border-pink-400 shadow"
              >
                Debut Group
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── LEVEL 3: ROLE EDITOR MODAL ─────────────────────────────────── */}
      {roleModalIdol && (
        <Modal
          isOpen={!!roleModalIdol}
          onClose={() => setRoleModalIdol(null)}
          title={`ROLES: ${roleModalIdol.stageName || roleModalIdol.name}`}
          subtitle={`Assign official positions within ${activeGroup?.name}`}
          icon="👑"
          size="md"
          borderColor="border-pink-500"
          footer={
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRoleModalIdol(null)}
                className="px-3 py-1.5 rounded-lg text-xs bg-[#241744] text-purple-200 border border-purple-500/40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRoles}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-pink-600 hover:bg-pink-500 text-white border border-pink-400 shadow"
              >
                Save Roles
              </button>
            </div>
          }
        >
          <div className="grid grid-cols-2 gap-2 text-xs">
            {roleOptions.map(role => {
              const isSelected = selectedRoles.includes(role)
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleToggleRole(role)}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    isSelected
                      ? 'bg-pink-900/70 border-pink-400 text-yellow-300 font-bold shadow-sm'
                      : 'bg-[#241744] border-[#442f70] text-purple-200 hover:border-purple-400'
                  }`}
                >
                  {isSelected ? '✓ ' : '+ '} {role}
                </button>
              )
            })}
          </div>
        </Modal>
      )}

      {/* ── LEVEL 3: KICK MEMBER CONFIRMATION MODAL ────────────────────── */}
      {kickModal && (
        <Modal
          isOpen={!!kickModal}
          onClose={() => setKickModal(null)}
          title="REMOVE MEMBER FROM GROUP"
          icon="⚠️"
          size="sm"
          borderColor="border-red-500"
          footer={
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setKickModal(null)}
                className="px-3 py-1.5 rounded-lg text-xs bg-[#241744] text-purple-200 border border-purple-500/40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmKick}
                className="btn-danger text-xs py-1.5 px-3.5 shadow"
              >
                Confirm Kick
              </button>
            </div>
          }
        >
          <div className="space-y-2 text-xs leading-relaxed text-purple-200">
            <p>
              Remove <strong className="text-white">{kickModal.idol.stageName || kickModal.idol.name}</strong> from <strong className="text-pink-300">{kickModal.group.name}</strong>?
            </p>
            <div className="bg-red-950/50 border border-red-800/60 rounded-xl p-2.5 text-[9px] text-red-200 space-y-1">
              <p>• Returns to company trainee roster.</p>
              <p>• 6-month cooldown ({GROUP_REMOVAL_COOLDOWN_WEEKS} weeks) before joining another group.</p>
              <p>• Group loyalty drops by -15.</p>
            </div>
          </div>
        </Modal>
      )}

      {/* ── LEVEL 3: DISBAND GROUP CONFIRMATION MODAL ──────────────────── */}
      {disbandModalGroup && (
        <Modal
          isOpen={!!disbandModalGroup}
          onClose={() => setDisbandModalGroup(null)}
          title={`DISBAND ${disbandModalGroup.name.toUpperCase()}?`}
          icon="⚠️"
          size="sm"
          borderColor="border-red-500"
          footer={
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDisbandModalGroup(null)}
                className="px-3 py-1.5 rounded-lg text-xs bg-[#241744] text-purple-200 border border-purple-500/40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDisband}
                className="btn-danger text-xs py-1.5 px-3.5 shadow"
              >
                Disband Group
              </button>
            </div>
          }
        >
          <p className="text-xs text-purple-200 leading-relaxed">
            Disbanding <strong className="text-white">{disbandModalGroup.name}</strong> will dissolve the team permanently. All {disbandModalGroup.members.length} members will return to trainee status with a loyalty penalty.
          </p>
        </Modal>
      )}
    </div>
  )
}
