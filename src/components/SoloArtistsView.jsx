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
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1e1338] border-2 border-[#543b8a] p-4 rounded-xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-300 font-pixel">
            SOLO ARTISTS DIVISION
          </h2>
          <p className="text-xs text-purple-200 mt-1 font-pixel leading-relaxed">
            Manage individual spotlight artists, exclusive solo single/EP releases, and personal brand loyalty.
          </p>
        </div>

        <button
          onClick={() => {
            setShowPromoteModal(true)
            playSfx('click')
          }}
          className="btn-primary text-xs font-pixel py-2 px-4 shadow-md flex items-center gap-2"
        >
          + DEBUT SOLO ARTIST
        </button>
      </div>

      {/* Solo Artists Grid */}
      {soloArtists.length === 0 ? (
        <div className="bg-[#1e1338]/80 border-2 border-dashed border-[#543b8a] rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4">🌟</div>
          <h3 className="text-lg font-bold text-white font-pixel mb-2">No Debuted Solo Artists</h3>
          <p className="text-xs text-purple-300 font-pixel max-w-md mx-auto mb-6 leading-relaxed">
            Cultivate standout talent with dedicated solo releases. Select an idol to debut as a Solo Artist!
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {soloArtists.map(artist => {
            const group = state.groups.find(g => g.id === artist.groupId)
            const soloProductions = state.productions.filter(p => p.targetId === artist.id)

            return (
              <div
                key={artist.id}
                className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-5 shadow-xl hover:border-yellow-500/60 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-4">
                    <img
                      src={getAssetPath(artist.portrait)}
                      alt={artist.name}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-yellow-400/60 shadow-md"
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = getAssetPath('/images/actors-portraits/Actor_01.jpg')
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white font-pixel truncate">
                          {artist.stageName || artist.name}
                        </h3>
                        <span className="text-[10px] font-pixel text-yellow-300 bg-yellow-950/70 border border-yellow-500/40 px-1.5 py-0.5 rounded">
                          {artist.tier}-Tier
                        </span>
                      </div>
                      <p className="text-[10px] text-purple-300 font-pixel mt-0.5">
                        {artist.name} • {artist.age}y • {artist.gender}
                      </p>
                      {group ? (
                        <p className="text-[9px] font-pixel text-pink-300 mt-1">
                          Group Member: <span className="font-bold">{group.name}</span>
                        </p>
                      ) : (
                        <p className="text-[9px] font-pixel text-blue-300 mt-1">
                          Independent Soloist
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Vitals & Fanbase */}
                  <div className="mt-4 grid grid-cols-2 gap-2 bg-[#120b24] p-3 rounded-xl border border-[#37235a] text-[10px] font-pixel">
                    <div>
                      <span className="text-purple-400">Solo Fanbase:</span>
                      <p className="text-yellow-300 font-bold mt-0.5">{(artist.soloFanbase || 1500).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-purple-400">Popularity:</span>
                      <p className="text-pink-300 font-bold mt-0.5">{artist.popularity || 15} / 100</p>
                    </div>
                    <div>
                      <span className="text-purple-400">Specialty:</span>
                      <p className="text-emerald-300 font-bold mt-0.5 truncate">{artist.specialty}</p>
                    </div>
                    <div>
                      <span className="text-purple-400">Loyalty:</span>
                      <p className="text-cyan-300 font-bold mt-0.5">{artist.loyalty || 80}%</p>
                    </div>
                  </div>

                  {/* Solo discography count */}
                  <div className="mt-3 text-[10px] font-pixel text-purple-300 flex items-center justify-between">
                    <span>Solo Releases: {soloProductions.length}</span>
                    <span className="text-yellow-400">Debut Wk: {artist.soloDebutWeek || 1}</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#37235a] flex justify-between items-center">
                  <button
                    onClick={() => handleRetireSolo(artist)}
                    className="text-[10px] font-pixel text-purple-400 hover:text-red-400 transition-colors"
                  >
                    Retire Solo Status
                  </button>
                  <button
                    onClick={() => {
                      setSelectedSoloIdol(artist)
                      playSfx('click')
                    }}
                    className="btn-secondary text-[10px] font-pixel py-1.5 px-3"
                  >
                    View Dossier
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* PROMOTE TO SOLO MODAL */}
      {showPromoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1c1236] border-2 border-[#5d3b9e] rounded-2xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#3d276b] mb-4">
              <h3 className="text-sm font-bold text-yellow-300 font-pixel">
                SELECT IDOL FOR SOLO DEBUT
              </h3>
              <button
                onClick={() => setShowPromoteModal(false)}
                className="text-purple-400 hover:text-white font-pixel text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-purple-200 font-pixel mb-4 leading-relaxed">
              Choose an idol from your roster to launch as an official solo artist. Idols can maintain both group and solo activities simultaneously.
            </p>

            {candidateIdols.length === 0 ? (
              <p className="text-xs text-purple-300 font-pixel text-center py-6">
                All eligible idols in the agency are already solo artists.
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto p-1">
                {candidateIdols.map(idol => (
                  <div
                    key={idol.id}
                    onClick={() => handlePromoteToSolo(idol)}
                    className="p-3 rounded-xl bg-[#241744] border border-[#442f70] hover:border-yellow-400 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={getAssetPath(idol.portrait)}
                        alt={idol.name}
                        className="w-10 h-10 rounded-lg object-cover border border-purple-400/50"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = getAssetPath('/images/actors-portraits/Actor_01.jpg')
                        }}
                      />
                      <div>
                        <div className="text-xs font-bold text-white font-pixel">
                          {idol.stageName || idol.name}
                        </div>
                        <div className="text-[9px] text-purple-300 font-pixel flex items-center gap-2 mt-0.5">
                          <span className="text-yellow-300">{idol.tier}-Tier</span>
                          <span>•</span>
                          <span>{idol.specialty}</span>
                          <span>•</span>
                          <span>{idol.age}y</span>
                        </div>
                      </div>
                    </div>

                    <button className="btn-primary text-[10px] font-pixel py-1.5 px-3">
                      DEBUT SOLO
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-5 pt-3 border-t border-[#3d276b] flex justify-end">
              <button
                onClick={() => setShowPromoteModal(false)}
                className="btn-secondary text-xs font-pixel py-2 px-4"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOSSIER MODAL */}
      {selectedSoloIdol && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1c1236] border-2 border-yellow-500 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#3d276b] mb-4">
              <h3 className="text-sm font-bold text-yellow-300 font-pixel">
                SOLO DOSSIER: {selectedSoloIdol.stageName || selectedSoloIdol.name}
              </h3>
              <button
                onClick={() => setSelectedSoloIdol(null)}
                className="text-purple-400 hover:text-white font-pixel text-sm"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center gap-4 mb-4">
              <img
                src={getAssetPath(selectedSoloIdol.portrait)}
                alt={selectedSoloIdol.name}
                className="w-20 h-20 rounded-xl object-cover border-2 border-yellow-400"
              />
              <div>
                <h4 className="text-base font-bold text-white font-pixel">{selectedSoloIdol.stageName || selectedSoloIdol.name}</h4>
                <p className="text-xs text-purple-300 font-pixel">{selectedSoloIdol.name} ({selectedSoloIdol.age}y)</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-pixel text-yellow-300 bg-yellow-950/80 px-2 py-0.5 rounded border border-yellow-500/40">
                    Tier: {selectedSoloIdol.tier}
                  </span>
                  <span className="text-[10px] font-pixel text-purple-200">
                    Potential: {selectedSoloIdol.potential}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs font-pixel bg-[#120b24] p-3 rounded-xl border border-[#3b2462] mb-4">
              <div className="flex justify-between text-purple-300">
                <span>Vocal:</span>
                <span className="text-white font-bold">{selectedSoloIdol.stats?.vocal ?? 50}</span>
              </div>
              <div className="flex justify-between text-purple-300">
                <span>Dance:</span>
                <span className="text-white font-bold">{selectedSoloIdol.stats?.dance ?? 50}</span>
              </div>
              <div className="flex justify-between text-purple-300">
                <span>Rap:</span>
                <span className="text-white font-bold">{selectedSoloIdol.stats?.rap ?? 50}</span>
              </div>
              <div className="flex justify-between text-purple-300">
                <span>Visual:</span>
                <span className="text-white font-bold">{selectedSoloIdol.stats?.visual ?? 50}</span>
              </div>
              <div className="flex justify-between text-purple-300">
                <span>Charisma:</span>
                <span className="text-white font-bold">{selectedSoloIdol.stats?.charisma ?? 50}</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedSoloIdol(null)}
                className="btn-primary text-xs font-pixel py-2 px-5"
              >
                CLOSE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
