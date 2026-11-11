import React, { useState, useEffect } from 'react'
import { useGame, ACTION } from '../game/state.jsx'
import {
  saveGameToStorage,
  loadGameFromStorage,
  AUTOSAVE_KEY,
  SAVE_KEY_PREFIX,
} from '../game/save.js'
import { formatMoney } from '../game/balance.js'
import { playSfx } from '../game/audio.js'
import Modal from './ui/Modal.jsx'

export default function SaveLoadView() {
  const { state, dispatch } = useGame()

  const [slotMeta, setSlotMeta] = useState({})
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // Refresh slots metadata
  const refreshSlots = () => {
    const meta = {}
    // Autosave
    const autoRaw = localStorage.getItem(AUTOSAVE_KEY)
    if (autoRaw) {
      try {
        meta.auto = JSON.parse(autoRaw)
      } catch (e) {}
    }
    // Slots 1, 2, 3
    for (let i = 1; i <= 3; i++) {
      const raw = localStorage.getItem(`${SAVE_KEY_PREFIX}${i}`)
      if (raw) {
        try {
          meta[i] = JSON.parse(raw)
        } catch (e) {}
      }
    }
    setSlotMeta(meta)
  }

  useEffect(() => {
    refreshSlots()
  }, [state])

  const handleSaveToSlot = (slot) => {
    const res = saveGameToStorage(slot, state)
    if (res.success) {
      playSfx('coin')
      dispatch({
        type: ACTION.PUSH_TOAST,
        toast: { message: `Game saved to Slot ${slot}!`, variant: 'gold' },
      })
      refreshSlots()
    }
  }

  const handleLoadFromSlot = (slot) => {
    const loaded = loadGameFromStorage(slot)
    if (loaded) {
      playSfx('cheer')
      dispatch({
        type: ACTION.LOAD_SAVE,
        state: loaded,
      })
      dispatch({
        type: ACTION.PUSH_TOAST,
        toast: { message: `Loaded save from Slot ${slot}!`, variant: 'gold' },
      })
    }
  }

  // Export JSON
  const handleExportJSON = () => {
    playSfx('click')
    const jsonStr = JSON.stringify(state, null, 2)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `kpop_tycoon_${state.companyName.toLowerCase().replace(/\s+/g, '_')}_wk${state.totalWeeksPassed || 1}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  // Import JSON
  const handleImportFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result)
        if (!parsed.companyName || typeof parsed.money !== 'number') {
          throw new Error('Invalid save file format.')
        }
        dispatch({
          type: ACTION.LOAD_SAVE,
          state: parsed,
        })
        playSfx('cheer')
        dispatch({
          type: ACTION.PUSH_TOAST,
          toast: { message: `Save file successfully imported!`, variant: 'gold' },
        })
      } catch (err) {
        dispatch({
          type: ACTION.PUSH_TOAST,
          toast: { message: `Failed to load save file: ${err.message}`, variant: 'red' },
        })
        playSfx('buzz')
      }
    }
    reader.readAsText(file)
  }

  // Reset Game
  const handleResetGame = () => {
    playSfx('buzz')
    localStorage.removeItem(AUTOSAVE_KEY)
    localStorage.removeItem(`${SAVE_KEY_PREFIX}1`)
    localStorage.removeItem(`${SAVE_KEY_PREFIX}2`)
    localStorage.removeItem(`${SAVE_KEY_PREFIX}3`)
    dispatch({ type: ACTION.RESET_GAME })
    setShowResetConfirm(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1e1338] border-2 border-[#543b8a] p-4 rounded-xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-300 font-pixel">
            SAVE & LOAD MANAGEMENT
          </h2>
          <p className="text-xs text-purple-200 mt-1 font-pixel leading-relaxed">
            Persistent browser LocalStorage with automatic saves, 3 manual slots, and JSON file export/import. 100% offline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportJSON}
            className="btn-primary text-xs font-pixel py-2 px-3 shadow-md flex items-center gap-1.5"
          >
            <span>💾</span> Export JSON
          </button>
          <label className="btn-secondary text-xs font-pixel py-2 px-3 shadow-md cursor-pointer flex items-center gap-1.5">
            <span>📥</span> Import JSON
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Autosave Slot */}
        <div className="bg-[#1e1338] border-2 border-emerald-500/80 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#3b2762]">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <h3 className="text-xs font-bold text-emerald-300 font-pixel">
                AUTOSAVE SLOT
              </h3>
            </div>
            <span className="text-[9px] font-pixel text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded">
              Saved every week
            </span>
          </div>

          {slotMeta.auto ? (
            <div className="space-y-2 text-xs font-pixel bg-[#120b24] p-3 rounded-xl border border-[#3b2462]">
              <div className="flex justify-between text-purple-300">
                <span>Agency:</span>
                <span className="text-white font-bold">{slotMeta.auto.companyName}</span>
              </div>
              <div className="flex justify-between text-purple-300">
                <span>Date:</span>
                <span className="text-yellow-300">Wk {slotMeta.auto.week}, {slotMeta.auto.year}</span>
              </div>
              <div className="flex justify-between text-purple-300">
                <span>Funds:</span>
                <span className="text-emerald-400 font-bold">{formatMoney(slotMeta.auto.money)}</span>
              </div>
              <div className="flex justify-between text-purple-300">
                <span>Idols Roster:</span>
                <span className="text-purple-200">{slotMeta.auto.idols?.length || 0} Idols</span>
              </div>
              <div className="pt-2 border-t border-[#37235a] text-[9px] text-purple-400 flex justify-between">
                <span>Last Updated:</span>
                <span>{slotMeta.auto.lastSaved ? new Date(slotMeta.auto.lastSaved).toLocaleTimeString() : 'N/A'}</span>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-purple-400 font-pixel text-xs">
              No autosave data found yet.
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => handleLoadFromSlot('auto')}
              disabled={!slotMeta.auto}
              className="w-full btn-secondary text-xs font-pixel py-2 disabled:opacity-40"
            >
              Restore Autosave
            </button>
          </div>
        </div>

        {/* Manual Slots 1, 2, 3 */}
        {[1, 2, 3].map(slot => {
          const meta = slotMeta[slot]

          return (
            <div
              key={slot}
              className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-5 shadow-xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#3b2762]">
                <div className="flex items-center gap-2">
                  <span className="text-lg">📁</span>
                  <h3 className="text-xs font-bold text-yellow-300 font-pixel">
                    MANUAL SLOT {slot}
                  </h3>
                </div>
                <span className="text-[9px] font-pixel text-purple-300 bg-[#120b24] px-2 py-0.5 rounded">
                  {meta ? 'Occupied' : 'Empty'}
                </span>
              </div>

              {meta ? (
                <div className="space-y-2 text-xs font-pixel bg-[#120b24] p-3 rounded-xl border border-[#3b2462]">
                  <div className="flex justify-between text-purple-300">
                    <span>Agency:</span>
                    <span className="text-white font-bold">{meta.companyName}</span>
                  </div>
                  <div className="flex justify-between text-purple-300">
                    <span>Date:</span>
                    <span className="text-yellow-300">Wk {meta.week}, {meta.year}</span>
                  </div>
                  <div className="flex justify-between text-purple-300">
                    <span>Funds:</span>
                    <span className="text-emerald-400 font-bold">{formatMoney(meta.money)}</span>
                  </div>
                  <div className="flex justify-between text-purple-300">
                    <span>Idols Roster:</span>
                    <span className="text-purple-200">{meta.idols?.length || 0} Idols</span>
                  </div>
                  <div className="pt-2 border-t border-[#37235a] text-[9px] text-purple-400 flex justify-between">
                    <span>Saved:</span>
                    <span>{meta.lastSaved ? new Date(meta.lastSaved).toLocaleString() : 'N/A'}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-purple-400 font-pixel text-xs">
                  Empty save slot.
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleSaveToSlot(slot)}
                  className="flex-1 btn-primary text-xs font-pixel py-2"
                >
                  Save to Slot {slot}
                </button>
                <button
                  onClick={() => handleLoadFromSlot(slot)}
                  disabled={!meta}
                  className="flex-1 btn-secondary text-xs font-pixel py-2 disabled:opacity-40"
                >
                  Load Slot {slot}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Danger Zone */}
      <div className="bg-red-950/30 border-2 border-red-800/60 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xs font-bold text-red-400 font-pixel mb-1">
            ⚠️ DANGER ZONE: RESET ALL GAME DATA
          </h3>
          <p className="text-[10px] text-purple-300 font-pixel">
            Permanently clear all local save slots and start completely fresh from company founding.
          </p>
        </div>

        <button
          onClick={() => setShowResetConfirm(true)}
          className="btn-danger text-xs font-pixel py-2.5 px-4"
        >
          RESET TO NEW GAME
        </button>
      </div>

      {/* RESET CONFIRM MODAL */}
      {showResetConfirm && (
        <Modal
          isOpen={showResetConfirm}
          onClose={() => setShowResetConfirm(false)}
          title="CONFIRM HARD RESET?"
          subtitle="Permanently erase agency save data"
          icon="⚠️"
          size="sm"
          borderColor="border-red-600"
          footer={
            <div className="flex justify-end gap-2.5 w-full">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="btn-secondary text-xs font-pixel py-1.5 px-3"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={handleResetGame}
                className="btn-danger text-xs font-pixel py-1.5 px-3.5"
              >
                WIPE & START OVER
              </button>
            </div>
          }
        >
          <p className="text-xs text-purple-200 font-pixel leading-relaxed">
            This action will erase your current agency progress, idols, groups, and local storage saves.
          </p>
        </Modal>
      )}
    </div>
  )
}
