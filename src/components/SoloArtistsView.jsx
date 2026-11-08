import React, { useState } from 'react'
import { useGame, ACTION } from '../game/state.jsx'
import { playSfx } from '../game/audio.js'
import { getAssetPath } from '../lib/assets.js'

export default function SoloArtistsView() {
  const { state, dispatch } = useGame()
  const [selectedSoloIdol, setSelectedSoloIdol] = useState(null)
  const [showPromoteModal, setShowPromoteModal] = useState(false)

  // Eligible idols for solo debut: not currently promoting solo
  const soloArtists = state.idols.filter(i => i.isSolo)
  const candidateIdols = state.idols.filter(i => !i.isSolo)

  const handlePromoteToSolo = (idol) => {
    dispatch({
      type: ACTION.UPDATE_IDOL_STAGE_NAME,
      idolId: idol.id,
      newStageName: idol.stageName || idol.name,
    })
    // Set isSolo flag
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
          { id: Date.now(), message: `${idol.stageName || idol.name} launched as an official Solo Artist!`, variant: 'gold' },
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
    if (selectedSoloIdol?.id === idol.id) setSelectedSoloIdol(null)
  }

  return (
    <div className="space-y-4">
      {/* ── Level 1: Header Bar ──────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#1e1338] border-2 border-[#543b8a] p-3.5 sm:p-4 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🌟</span>
            <h2 className="text-base sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-300 font-pixel">
              SOLO ARTISTS DIVISION
            </h2>
          </div>
          <p className="text-[10px] text-purple-200 mt-0.5 font-pixel leading-relaxed">
            Manage individual spotlight artists, exclusive solo releases, and personal brand loyalty.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-pixel text-yellow-300 bg-[#2d1b4e] px-3 py-2 rounded-lg border border-yellow-500/30 whitespace-nowrap">
            Soloists: {soloArtists.length} Artists
          </span>
          <button
            onClick={() => {
              setShowPromoteModal(true)
              playSfx('click')
            }}
            className="btn-primary text-xs font-pixel py-2 px-3 sm:px-4 shadow-md flex items-center gap-1.5 whitespace-nowrap"
          >
            + DEBUT SOLO ARTIST
          </button>
        </div>
      </div>

      {/* ── Level 1: Solo Artists Cards Grid ─────────────────────────── */}
      {soloArtists.length === 0 ? (
        <div className="bg-[#1e1338]/80 border-2 border-dashed border-[#543b8a] rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">🌟</div>
          <h3 className="text-base font-bold text-white font-pixel mb-2">No Debuted Solo Artists</h3>
          <p className="text-xs text-purple-300 font-pixel max-w-md mx-auto mb-6 leading-relaxed">
            Cultivate standout talent with dedicated solo releases. Select an idol from your agency to debut as a Solo Artist!
          </p>
          <button
            onClick={() => {
              setShowPromoteModal(true)
              playSfx('click')
            }}
            className="btn-primary text-xs font-pixel py-3 px-6"
          >
            DEBUT FIRST SOLO ARTIST
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {soloArtists.map(artist => {
            const group = state.groups.find(g => g.id === artist.groupId)

            return (
              <div
                key={artist.id}
                onClick={() => {
                  setSelectedSoloIdol(artist)
                  playSfx('click')
                }}
                className="bg-[#1e1338] border-2 border-[#543b8a] rounded-xl p-3 shadow-md hover:border-yellow-400 cursor-pointer transition-all hover:scale-[1.01] flex flex-col justify-between"
                title="Click to view solo artist dossier and actions"
              >
                <div>
                  <div className="flex items-start gap-2.5">
                    <img
                      src={getAssetPath(artist.portrait)}
                      alt={artist.name}
                      className="w-12 h-12 rounded-lg object-cover border-2 border-yellow-400/60 shadow flex-shrink-0"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = getAssetPath('/images/actors-portraits/Actor_01.jpg')
                      }}
                    />
                    <div className="flex-1 min-w-0 font-pixel">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-white truncate">
                          {artist.stageName || artist.name}
                        </h3>
                        <span className="text-[8px] font-pixel text-yellow-300 bg-yellow-950/70 border border-yellow-500/40 px-1 py-0.2 rounded">
                          {artist.tier}
                        </span>
                      </div>
                      <p className="text-[9px] text-purple-300 truncate mt-0.5">
                        {artist.name} · {artist.age}y
                      </p>
                      <div className="text-[8px] text-yellow-300 truncate mt-0.5">
                        {artist.specialty}
                      </div>
                    </div>
                  </div>

                  {/* Status chip */}
                  <div className="mt-2 text-[8px] font-pixel">
                    <span className={`px-2 py-0.5 rounded border inline-block truncate max-w-full ${
                      group ? 'bg-purple-950/60 border-purple-500/40 text-purple-300' : 'bg-blue-950/60 border-blue-500/40 text-blue-300'
                    }`}>
                      {group ? `👥 Group: ${group.name}` : '⭐ Independent Soloist'}
                    </span>
                  </div>

                  {/* Metrics */}
                  <div className="mt-2 grid grid-cols-2 gap-1.5 bg-[#120b24] p-2 rounded-lg border border-[#37235a] text-[9px] font-pixel">
                    <div className="flex justify-between">
                      <span className="text-purple-400">Fanbase:</span>
                      <span className="text-emerald-400 font-bold">{(artist.soloFanbase || 1500).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-purple-400">Pop:</span>
                      <span className="text-pink-300 font-bold">{artist.popularity || 15}/100</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-[#37235a] flex items-center justify-between text-[9px] font-pixel text-purple-300">
                  <span>Loyalty: <strong className="text-yellow-300">{artist.loyalty || 80}%</strong></span>
                  <span className="text-pink-400 font-bold">Dossier →</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* ── Level 2 & 3: Selected Solo Artist Dossier Modal ──────────── */}
      {selectedSoloIdol && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setSelectedSoloIdol(null)}
        >
          <div
            className="bg-[#1c1236] border-2 border-yellow-500/80 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#3d276b]">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-pixel text-yellow-300 bg-yellow-950/80 px-2 py-0.5 rounded border border-yellow-500/40">
                  {selectedSoloIdol.tier}-TIER
                </span>
                <h3 className="text-sm font-bold text-white font-pixel">
                  {selectedSoloIdol.stageName || selectedSoloIdol.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSoloIdol(null)}
                className="text-purple-400 hover:text-white font-pixel text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            {/* Profile Hero: Balanced Portrait (w-20 h-20) */}
            <div className="flex items-center gap-4 bg-[#120b24] p-3 rounded-xl border border-[#3b2462]">
              <img
                src={getAssetPath(selectedSoloIdol.portrait)}
                alt={selectedSoloIdol.name}
                className="w-20 h-20 rounded-xl object-cover border-2 border-yellow-400 shadow flex-shrink-0"
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = getAssetPath('/images/actors-portraits/Actor_01.jpg')
                }}
              />
              <div className="font-pixel text-[10px] space-y-1">
                <h4 className="text-xs font-bold text-white">{selectedSoloIdol.name}</h4>
                <div className="text-purple-300">Age {selectedSoloIdol.age} · {selectedSoloIdol.gender}</div>
                <div className="text-emerald-300">Potential: {selectedSoloIdol.potential}-Grade</div>
                <div className="text-yellow-300">Fanbase: {(selectedSoloIdol.soloFanbase || 1500).toLocaleString()} fans</div>
              </div>
            </div>

            {/* Core Stats Breakdown */}
            <div className="space-y-1.5 text-[9px] font-pixel bg-[#120b24] p-3 rounded-xl border border-[#3b2462]">
              <div className="text-[10px] text-pink-400 font-bold mb-1">SKILL ATTRIBUTES</div>
              {['vocal', 'dance', 'rap', 'visual', 'charisma'].map(k => (
                <div key={k} className="flex justify-between items-center text-purple-300">
                  <span className="uppercase">{k}:</span>
                  <span className="text-white font-bold">{selectedSoloIdol.stats?.[k] ?? 50} / 100</span>
                </div>
              ))}
            </div>

            {/* Actions (Level 3) */}
            <div className="flex justify-between items-center pt-2 border-t border-[#3d276b]">
              <button
                onClick={() => handleRetireSolo(selectedSoloIdol)}
                className="px-3 py-1.5 rounded-lg text-xs font-pixel bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-700/60 transition-colors"
              >
                Retire Solo Status
              </button>
              <button
                onClick={() => setSelectedSoloIdol(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-pixel bg-[#2d1b4e] hover:bg-[#3d2668] text-white border border-purple-500/40"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Level 3: Debut Solo Artist Modal ─────────────────────────── */}
      {showPromoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1c1236] border-2 border-[#5d3b9e] rounded-2xl p-5 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#3d276b]">
              <h3 className="text-sm font-bold text-yellow-300 font-pixel">
                SELECT IDOL FOR SOLO DEBUT
              </h3>
              <button
                onClick={() => setShowPromoteModal(false)}
                className="text-purple-400 hover:text-white font-pixel text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-purple-200 font-pixel leading-relaxed">
              Choose an idol from your roster to launch as an official solo artist. Idols can maintain both group and solo activities simultaneously.
            </p>

            {candidateIdols.length === 0 ? (
              <p className="text-xs text-purple-300 font-pixel text-center py-6 bg-[#120b24] rounded-xl border border-[#3b2462]">
                All eligible idols in the agency are already solo artists.
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto p-1">
                {candidateIdols.map(idol => (
                  <div
                    key={idol.id}
                    onClick={() => handlePromoteToSolo(idol)}
                    className="p-2.5 rounded-xl bg-[#241744] border border-[#442f70] hover:border-yellow-400 cursor-pointer flex items-center justify-between transition-colors shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={getAssetPath(idol.portrait)}
                        alt={idol.name}
                        className="w-10 h-10 rounded-lg object-cover border border-purple-400/50 flex-shrink-0"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = getAssetPath('/images/actors-portraits/Actor_01.jpg')
                        }}
                      />
                      <div className="font-pixel">
                        <div className="text-xs font-bold text-white">
                          {idol.stageName || idol.name}
                        </div>
                        <div className="text-[8px] text-purple-300 flex items-center gap-1.5 mt-0.5">
                          <span className="text-yellow-300">{idol.tier}-Tier</span>
                          <span>•</span>
                          <span>{idol.age}y</span>
                          <span>•</span>
                          <span>{idol.specialty}</span>
                        </div>
                      </div>
                    </div>
                    <button className="px-2.5 py-1 rounded bg-yellow-500 hover:bg-yellow-400 text-black font-bold text-[9px] font-pixel shadow">
                      DEBUT
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 border-t border-[#3d276b] flex justify-end">
              <button
                onClick={() => setShowPromoteModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-pixel bg-[#241744] text-purple-200 border border-purple-500/40"
              >
                CANCEL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
