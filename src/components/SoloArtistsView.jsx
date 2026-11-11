/**
 * SoloArtistsView.jsx — Modal-First Solo Artists Division.
 *
 * Level 1: Main tab is a clean overview of debuted soloists with name, tier,
 *          popularity, fanbase, and group affiliation.
 * Level 2: Dedicated Solo Artist Profile Modal displaying full stats breakdown,
 *          biography, and solo management actions.
 * Level 3: Debut Solo Artist modal & retirement confirmation modal.
 */

import React, { useState } from 'react'
import { useGame, ACTION } from '../game/state.jsx'
import { playSfx } from '../game/audio.js'
import { getAssetPath } from '../lib/assets.js'
import Modal from './ui/Modal.jsx'

export default function SoloArtistsView() {
  const { state, dispatch } = useGame()
  const [selectedSoloIdol, setSelectedSoloIdol] = useState(null)
  const [showPromoteModal, setShowPromoteModal] = useState(false)
  const [retireConfirmIdol, setRetireConfirmIdol] = useState(null)

  const soloArtists = state.idols.filter(i => i.isSolo)
  const candidateIdols = state.idols.filter(i => !i.isSolo)

  // Active soloist synced with state
  const activeSoloist = state.idols.find(i => i.id === selectedSoloIdol?.id) || selectedSoloIdol

  const handlePromoteToSolo = (idol) => {
    dispatch({
      type: ACTION.UPDATE_IDOL_STAGE_NAME,
      idolId: idol.id,
      newStageName: idol.stageName || idol.name,
    })
    dispatch({
      type: ACTION.INIT_STATE,
      state: {
        ...state,
        idols: state.idols.map(i => i.id === idol.id ? {
          ...i,
          isSolo: true,
          soloDebutWeek: state.totalWeeksPassed || 1,
          soloFanbase: i.soloFanbase || Math.round((i.popularity || 10) * 120),
        } : i),
        toasts: [
          ...(state.toasts || []),
          { id: Date.now(), message: `${idol.stageName || idol.name} debuted as an official Solo Artist!`, variant: 'gold' },
        ],
      },
    })
    playSfx('cheer')
    setShowPromoteModal(false)
  }

  const handleRetireSolo = (idol) => {
    dispatch({
      type: ACTION.INIT_STATE,
      state: {
        ...state,
        idols: state.idols.map(i => i.id === idol.id ? {
          ...i,
          isSolo: false,
        } : i),
        toasts: [
          ...(state.toasts || []),
          { id: Date.now(), message: `${idol.stageName || idol.name} concluded their solo activities.`, variant: 'purple' },
        ],
      },
    })
    playSfx('buzz')
    setRetireConfirmIdol(null)
    setSelectedSoloIdol(null)
  }

  return (
    <div className="space-y-4 font-pixel">
      {/* ── LEVEL 1: Main Tab Header ───────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#1e1338] border-2 border-[#543b8a] p-3.5 sm:p-4 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🌟</span>
            <h2 className="text-sm sm:text-base font-bold text-white">
              SOLO ARTISTS DIVISION OVERVIEW
            </h2>
          </div>
          <p className="text-[10px] text-purple-200 mt-0.5">
            Active Soloists: <strong className="text-yellow-300">{soloArtists.length} Artists</strong> · Select an artist to inspect profile in modal
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowPromoteModal(true)
            playSfx('click')
          }}
          className="btn-primary text-xs py-2 px-3 sm:px-4 shadow-md flex items-center gap-1.5 whitespace-nowrap active:scale-95"
        >
          + Debut Solo Artist
        </button>
      </div>

      {/* ── LEVEL 1: Compact Solo Artists Overview Cards ───────────────── */}
      {soloArtists.length === 0 ? (
        <div className="bg-[#1e1338]/80 border-2 border-dashed border-[#543b8a] rounded-2xl p-10 text-center">
          <div className="text-4xl mb-3">🌟</div>
          <h3 className="text-sm font-bold text-white mb-1">No Debuted Solo Artists</h3>
          <p className="text-xs text-purple-300 max-w-md mx-auto mb-5 leading-relaxed">
            Spotlight a talented trainee or group member for individual releases, custom concepts, and personal stardom!
          </p>
          <button
            type="button"
            onClick={() => {
              setShowPromoteModal(true)
              playSfx('click')
            }}
            className="btn-primary text-xs py-2.5 px-5"
          >
            + Debut First Solo Artist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {soloArtists.map(artist => {
            const group = state.groups.find(g => g.id === artist.groupId)

            return (
              <div
                key={artist.id}
                onClick={() => {
                  setSelectedSoloIdol(artist)
                  playSfx('click')
                }}
                className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-3.5 shadow-md hover:border-yellow-400 cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between"
                title="Click to open solo artist profile modal"
              >
                <div>
                  {/* Header: Small Thumbnail + Stage Name + Tier */}
                  <div className="flex items-center gap-2.5 pb-2 border-b border-[#3b2762]">
                    <img
                      src={getAssetPath(artist.portrait)}
                      alt={artist.name}
                      className="rounded-lg object-cover border border-yellow-400/60 shadow flex-shrink-0"
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
                      <div className="flex items-center justify-between">
                        <strong className="text-white text-xs truncate">
                          {artist.stageName || artist.name}
                        </strong>
                        <span className="text-[8px] text-yellow-300 bg-yellow-950/70 border border-yellow-500/40 px-1 py-0.2 rounded font-bold">
                          {artist.tier}
                        </span>
                      </div>
                      <p className="text-[9px] text-purple-300 truncate">
                        {artist.name} · {artist.specialty}
                      </p>
                    </div>
                  </div>

                  {/* Group Affiliation Status */}
                  <div className="mt-2 text-[8px]">
                    <span className={`px-2 py-0.5 rounded border inline-block truncate max-w-full ${
                      group ? 'bg-purple-950/60 border-purple-500/40 text-purple-300' : 'bg-blue-950/60 border-blue-500/40 text-blue-300'
                    }`}>
                      {group ? `👥 Group: ${group.name}` : '⭐ Independent Soloist'}
                    </span>
                  </div>

                  {/* Metrics Strip */}
                  <div className="mt-2 grid grid-cols-2 gap-1.5 bg-[#120b24] p-2 rounded-xl border border-[#37235a] text-[9px]">
                    <div className="flex justify-between">
                      <span className="text-purple-400">Fanbase:</span>
                      <strong className="text-emerald-400">{(artist.soloFanbase || 1500).toLocaleString()}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-400">Pop:</span>
                      <strong className="text-pink-300">{artist.popularity || 15}/100</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#37235a] flex items-center justify-between text-[9px] text-purple-300">
                  <span>Loyalty: <strong className="text-yellow-300">{artist.loyalty || 80}%</strong></span>
                  <span className="text-pink-400 font-bold hover:underline">
                    Dossier →
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── LEVEL 2: DEDICATED SOLO ARTIST PROFILE MODAL ──────────────── */}
      {activeSoloist && (
        <Modal
          isOpen={!!activeSoloist}
          onClose={() => setSelectedSoloIdol(null)}
          title={`SOLO ARTIST PROFILE: ${activeSoloist.stageName || activeSoloist.name}`}
          subtitle={`${activeSoloist.tier}-Tier · Independent Spotlight Division`}
          icon="⭐"
          size="md"
          borderColor="border-yellow-500"
          footer={
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setRetireConfirmIdol(activeSoloist)}
                className="px-3 py-1.5 rounded-lg text-xs bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-700/60 transition-colors"
              >
                Retire Solo Status
              </button>
              <button
                type="button"
                onClick={() => setSelectedSoloIdol(null)}
                className="px-4 py-1.5 rounded-lg text-xs bg-[#2d1b4e] hover:bg-[#3d2668] text-white border border-purple-500/40"
              >
                Close Profile
              </button>
            </div>
          }
        >
          {/* Hero Profile (Balanced Portrait) */}
          <div className="flex items-center gap-3.5 bg-[#120b24] p-3 rounded-xl border border-[#3b2462]">
            <img
              src={getAssetPath(activeSoloist.portrait)}
              alt={activeSoloist.name}
              className="rounded-xl object-cover border-2 border-yellow-400 shadow flex-shrink-0"
              style={{
                width: '64px',
                height: '64px',
                minWidth: '64px',
                minHeight: '64px',
                maxWidth: '64px',
                maxHeight: '64px',
                borderRadius: '10px',
                objectFit: 'cover',
              }}
              onError={(e) => {
                e.target.onerror = null
                e.target.src = getAssetPath('/images/actors-portraits/Actor_01.jpg')
              }}
            />
            <div className="text-[10px] space-y-1">
              <h4 className="text-xs font-bold text-white">{activeSoloist.name}</h4>
              <div className="text-purple-300">Age {activeSoloist.age} · {activeSoloist.gender} · {activeSoloist.nationality}</div>
              <div className="text-emerald-300">Potential: {activeSoloist.potential}-Grade · Specialty: {activeSoloist.specialty}</div>
              <div className="text-yellow-300">Solo Fanbase: {(activeSoloist.soloFanbase || 1500).toLocaleString()} fans</div>
            </div>
          </div>

          {/* Skill Breakdown */}
          <div className="space-y-1.5 text-[9px] bg-[#120b24] p-3 rounded-xl border border-[#3b2462]">
            <div className="text-[10px] text-pink-400 font-bold mb-1">SKILL ATTRIBUTES</div>
            {['vocal', 'dance', 'rap', 'visual', 'charisma'].map(k => (
              <div key={k} className="flex justify-between items-center text-purple-300">
                <span className="uppercase">{k}:</span>
                <strong className="text-white">{activeSoloist.stats?.[k] ?? 50} / 100</strong>
              </div>
            ))}
          </div>
        </Modal>
      )}

      {/* ── LEVEL 3: DEBUT SOLO ARTIST MODAL ───────────────────────────── */}
      {showPromoteModal && (
        <Modal
          isOpen={showPromoteModal}
          onClose={() => setShowPromoteModal(false)}
          title="DEBUT IDOL AS SOLO ARTIST"
          subtitle="Select any idol to launch their solo career"
          icon="✨"
          size="lg"
          borderColor="border-yellow-500"
        >
          <div className="space-y-3 text-xs">
            <p className="text-purple-200 leading-relaxed text-[10px]">
              Select an eligible idol from your roster to launch as an official solo artist. Idols can maintain both group and solo activities simultaneously.
            </p>

            {candidateIdols.length === 0 ? (
              <p className="text-purple-300 text-center py-6 bg-[#120b24] rounded-xl border border-[#3b2462]">
                All eligible idols in the agency are already debuted as soloists.
              </p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {candidateIdols.map(idol => (
                  <div
                    key={idol.id}
                    onClick={() => handlePromoteToSolo(idol)}
                    className="p-2.5 rounded-xl bg-[#241744] border border-[#442f70] hover:border-yellow-400 cursor-pointer flex items-center justify-between transition-colors shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
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
                      <div>
                        <div className="text-xs font-bold text-white">
                          {idol.stageName || idol.name}
                        </div>
                        <div className="text-[8px] text-purple-300 flex items-center gap-1.5 mt-0.5">
                          <span className="text-yellow-300">{idol.tier}-Tier</span>
                          <span>•</span>
                          <span>{idol.specialty}</span>
                          <span>•</span>
                          <span>Pot: {idol.potential}</span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="px-2.5 py-1 rounded bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-[9px] shadow"
                    >
                      Debut Solo
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ── LEVEL 3: RETIRE SOLO CONFIRMATION MODAL ────────────────────── */}
      {retireConfirmIdol && (
        <Modal
          isOpen={!!retireConfirmIdol}
          onClose={() => setRetireConfirmIdol(null)}
          title="CONFIRM RETIREMENT OF SOLO STATUS"
          icon="⚠️"
          size="sm"
          borderColor="border-red-500"
          footer={
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRetireConfirmIdol(null)}
                className="px-3 py-1.5 rounded-lg text-xs bg-[#241744] text-purple-200 border border-purple-500/40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleRetireSolo(retireConfirmIdol)}
                className="btn-danger text-xs py-1.5 px-3.5 shadow"
              >
                Retire Solo
              </button>
            </div>
          }
        >
          <p className="text-xs text-purple-200 leading-relaxed">
            Conclude solo career for <strong className="text-white">{retireConfirmIdol.stageName || retireConfirmIdol.name}</strong>? They can be re-promoted later at any time.
          </p>
        </Modal>
      )}
    </div>
  )
}
