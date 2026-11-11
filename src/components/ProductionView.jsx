/**
 * ProductionView.jsx — Modal-First Album Recording & Production Studio.
 *
 * Level 1: Main tab is a clean Production Overview displaying active recordings progress,
 *          live real-time 10-minute commercial sales campaigns, and discography summaries.
 * Level 2: Dedicated New Production Modal containing complete album configuration
 *          (format, artist, genre, concept, lyricist, producer, and budget summary).
 */

import React, { useState } from 'react'
import { useGame, ACTION } from '../game/state.jsx'
import {
  ALBUM_CONFIGS,
  GENRES,
  CONCEPTS,
  WRITERS,
  PRODUCERS,
  formatMoney,
} from '../game/balance.js'
import { playSfx } from '../game/audio.js'
import Modal from './ui/Modal.jsx'

export default function ProductionView() {
  const { state, dispatch } = useGame()

  // Modal-First: New production form is opened via dedicated modal
  const [showNewProdModal, setShowNewProdModal] = useState(false)
  const [activeSubView, setActiveSubView] = useState('active') // 'active', 'sales', 'discography'

  // Form state inside modal
  const [targetType, setTargetType] = useState('group') // 'group' or 'solo'
  const [targetId, setTargetId] = useState(state.groups[0]?.id || '')
  const [releaseType, setReleaseType] = useState('single')
  const [title, setTitle] = useState('')
  const [genre, setGenre] = useState(GENRES[0])
  const [concept, setConcept] = useState(CONCEPTS[0])
  const [writerId, setWriterId] = useState(WRITERS[0].id)
  const [producerId, setProducerId] = useState(PRODUCERS[0].id)

  const activeTrend = state.currentTrend || { genre: 'Pop', concept: 'Teen Crush' }

  // Target options
  const groupOptions = state.groups || []
  const soloOptions = state.idols.filter(i => i.isSolo)

  // Current config
  const config = ALBUM_CONFIGS[releaseType] || ALBUM_CONFIGS.single
  const selectedWriter = WRITERS.find(w => w.id === writerId) || WRITERS[0]
  const selectedProducer = PRODUCERS.find(p => p.id === producerId) || PRODUCERS[0]
  const totalCost = config.baseCost + selectedWriter.cost + selectedProducer.cost

  // Synergy check
  const genreMatch = genre === activeTrend.genre
  const conceptMatch = concept === activeTrend.concept
  const synergyScore = (genreMatch ? 15 : 0) + (conceptMatch ? 15 : 0)

  // Random title generator
  const handleGenerateTitle = () => {
    playSfx('click')
    const prefixes = ['NEO', 'VELVET', 'MIDNIGHT', 'ECLIPSE', 'CYBER', 'SUPER', 'SWEET', 'DREAM', 'GOLDEN', 'CHERRY']
    const roots = ['HORIZON', 'SYMPHONY', 'HEARTBEAT', 'PARADOX', 'UTOPIA', 'FEVER', 'REVOLUTION', 'ECHO', 'WHISPER', 'VOYAGE']
    const p = prefixes[Math.floor(Math.random() * prefixes.length)]
    const r = roots[Math.floor(Math.random() * roots.length)]
    setTitle(`${p} ${r}`)
  }

  // Handle start production
  const handleStartProduction = (e) => {
    e.preventDefault()

    if (!title.trim()) {
      dispatch({
        type: ACTION.PUSH_TOAST,
        toast: { message: 'Please enter an album title.', variant: 'red' },
      })
      playSfx('buzz')
      return
    }

    if (!targetId) {
      dispatch({
        type: ACTION.PUSH_TOAST,
        toast: { message: 'Please select a group or solo artist.', variant: 'red' },
      })
      playSfx('buzz')
      return
    }

    if (state.money < totalCost) {
      dispatch({
        type: ACTION.PUSH_TOAST,
        toast: { message: `Insufficient funds! (Requires ${formatMoney(totalCost)})`, variant: 'red' },
      })
      playSfx('buzz')
      return
    }

    // Check if target is already producing
    const existing = state.productions?.find(p => p.targetId === targetId && !p.completed)
    if (existing) {
      dispatch({
        type: ACTION.PUSH_TOAST,
        toast: { message: 'This artist/group is already recording an album!', variant: 'red' },
      })
      playSfx('buzz')
      return
    }

    // Check stamina of target
    let targetName = ''
    if (targetType === 'group') {
      const grp = state.groups.find(g => g.id === targetId)
      targetName = grp?.name || 'Group'
      const members = state.idols.filter(i => grp?.members.includes(i.id))
      const exhausted = members.find(m => (m.currentStamina || 0) < config.staminaCost)
      if (exhausted) {
        dispatch({
          type: ACTION.PUSH_TOAST,
          toast: {
            message: `${exhausted.stageName || exhausted.name} lacks sufficient stamina (${config.staminaCost} required)!`,
            variant: 'red',
          },
        })
        playSfx('buzz')
        return
      }
    } else {
      const soloist = state.idols.find(i => i.id === targetId)
      targetName = soloist?.stageName || soloist?.name || 'Soloist'
      if ((soloist?.currentStamina || 0) < config.staminaCost) {
        dispatch({
          type: ACTION.PUSH_TOAST,
          toast: {
            message: `${targetName} lacks sufficient stamina (${config.staminaCost} required)!`,
            variant: 'red',
          },
        })
        playSfx('buzz')
        return
      }
    }

    playSfx('coin')
    dispatch({
      type: ACTION.START_PRODUCTION,
      params: {
        title: title.trim(),
        targetType,
        targetId,
        targetName,
        releaseType,
        genre,
        concept,
        writer: selectedWriter,
        producer: selectedProducer,
        cost: totalCost,
        currentWeek: state.totalWeeksPassed || 1,
        activeTrend,
      },
    })

    setTitle('')
    setShowNewProdModal(false)
    setActiveSubView('active')
  }

  const activeProductions = state.productions?.filter(p => !p.completed) || []
  const discography = state.discography || []
  const activeSales = state.activeSales || []

  return (
    <div className="space-y-4 font-pixel">
      {/* ── LEVEL 1: Main Tab Overview Header ──────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#1e1338] border-2 border-[#543b8a] p-3.5 sm:p-4 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">💿</span>
            <h2 className="text-sm sm:text-base font-bold text-white">
              RECORDING & PRODUCTION STUDIO OVERVIEW
            </h2>
          </div>
          <p className="text-[10px] text-purple-200 mt-0.5">
            Active Recordings: <strong className="text-pink-300">{activeProductions.length}</strong> · Live Sales Windows: <strong className="text-yellow-300">{activeSales.filter(s => !s.completed).length}</strong> · Discography: <strong className="text-emerald-400">{discography.length} Releases</strong>
          </p>
        </div>

        {/* Primary Action Button to Open Production Modal */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex bg-[#120b24] p-1 rounded-xl border border-[#442f70]">
            <button
              type="button"
              onClick={() => {
                setActiveSubView('active')
                playSfx('click')
              }}
              className={`px-2.5 py-1 rounded text-[9px] transition-all ${
                activeSubView === 'active' ? 'bg-pink-600 text-white font-bold' : 'text-purple-300 hover:text-white'
              }`}
            >
              In-Studio ({activeProductions.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSubView('sales')
                playSfx('click')
              }}
              className={`px-2.5 py-1 rounded text-[9px] transition-all ${
                activeSubView === 'sales' ? 'bg-pink-600 text-white font-bold' : 'text-purple-300 hover:text-white'
              }`}
            >
              Live Sales ({activeSales.filter(s => !s.completed).length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveSubView('discography')
                playSfx('click')
              }}
              className={`px-2.5 py-1 rounded text-[9px] transition-all ${
                activeSubView === 'discography' ? 'bg-pink-600 text-white font-bold' : 'text-purple-300 hover:text-white'
              }`}
            >
              Archive ({discography.length})
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowNewProdModal(true)
              playSfx('click')
            }}
            className="btn-primary text-xs py-2 px-3 sm:px-4 shadow-md flex items-center gap-1.5 whitespace-nowrap active:scale-95"
          >
            + New Production
          </button>
        </div>
      </div>

      {/* ── LEVEL 1: Subview Content (In-Studio / Live Sales / Discography) ── */}

      {/* A. Active Recordings in Studio */}
      {activeSubView === 'active' && (
        <div className="space-y-3">
          {activeProductions.length === 0 ? (
            <div className="bg-[#1e1338]/80 border-2 border-dashed border-[#543b8a] rounded-2xl p-10 text-center">
              <div className="text-4xl mb-3">🎧</div>
              <h3 className="text-sm font-bold text-white mb-1">No Active Studio Recordings</h3>
              <p className="text-xs text-purple-300 max-w-md mx-auto mb-5 leading-relaxed">
                All audio booths and mixing consoles are idle. Configure a new single, EP, or full album through the New Production Modal!
              </p>
              <button
                type="button"
                onClick={() => {
                  setShowNewProdModal(true)
                  playSfx('click')
                }}
                className="btn-primary text-xs py-2.5 px-5"
              >
                + Open Production Modal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {activeProductions.map(prod => {
                const totalWeeks = prod.durationWeeks || 1
                const passed = prod.weeksPassed || 0
                const percent = Math.min(100, Math.round((passed / totalWeeks) * 100))

                return (
                  <div
                    key={prod.id}
                    className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-4 shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[8px] text-yellow-300 bg-yellow-950/70 border border-yellow-500/40 px-1.5 py-0.2 rounded uppercase font-bold">
                            {prod.releaseType}
                          </span>
                          <h3 className="text-sm font-bold text-white mt-1">"{prod.title}"</h3>
                          <p className="text-xs text-pink-300 mt-0.5">By {prod.targetName}</p>
                        </div>
                        <div className="text-right text-[10px] text-purple-300">
                          <div>Week {passed} / {totalWeeks}</div>
                          <div className="text-emerald-400 font-bold mt-0.5">{percent}% Ready</div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <div className="w-full bg-[#120b24] h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-pink-500 to-yellow-400 h-full rounded-full transition-all duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-[9px] text-purple-300 bg-[#120b24] p-2.5 rounded-xl border border-[#37235a]">
                        <div>Genre: <strong className="text-white">{prod.genre}</strong></div>
                        <div>Concept: <strong className="text-white">{prod.concept}</strong></div>
                        <div>Lyricist: <strong className="text-white">{prod.writer?.name}</strong></div>
                        <div>Producer: <strong className="text-white">{prod.producer?.name}</strong></div>
                      </div>
                    </div>

                    <p className="text-[8px] text-purple-400 mt-2.5 text-center">
                      Advances 1 week on "Next Week". Releases automatically upon 100% completion!
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* B. Live 10-Minute Sales Monitor */}
      {activeSubView === 'sales' && (
        <div className="space-y-3">
          {activeSales.length === 0 ? (
            <div className="bg-[#1e1338]/80 border-2 border-dashed border-[#543b8a] rounded-2xl p-10 text-center">
              <div className="text-4xl mb-3">💿</div>
              <h3 className="text-sm font-bold text-white mb-1">No Active Live Sales Campaign</h3>
              <p className="text-xs text-purple-300 max-w-md mx-auto mb-4">
                When an album completes production, it enters a live 10-minute real-time sales campaign with real-time revenue accrual!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeSales.map(sale => {
                const remainingSecs = Math.max(0, 600 - (sale.secondsElapsed || 0))
                const mins = Math.floor(remainingSecs / 60)
                const secs = Math.floor(remainingSecs % 60)
                const timeStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`
                const percent = Math.min(100, Math.round(((sale.secondsElapsed || 0) / 600) * 100))

                return (
                  <div
                    key={sale.id}
                    className={`bg-[#1e1338] border-2 rounded-2xl p-4 shadow-xl ${
                      sale.completed ? 'border-purple-800 opacity-80' : 'border-yellow-500/80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#3b2762]">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-white">"{sale.title}"</h3>
                          <span className="text-[8px] text-yellow-300 bg-yellow-950/70 border border-yellow-500/40 px-1.5 py-0.2 rounded font-bold uppercase">
                            {sale.releaseType}
                          </span>
                          {sale.completed ? (
                            <span className="text-[8px] text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded">
                              CONCLUDED
                            </span>
                          ) : (
                            <span className="text-[8px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded animate-pulse">
                              LIVE WINDOW: {timeStr}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-pink-300 mt-0.5">Artist: {sale.targetName}</p>
                      </div>

                      <div className="sm:text-right">
                        <span className="text-[9px] text-purple-300 block">Total Revenue Earned:</span>
                        <strong className="text-yellow-400 text-sm">
                          {formatMoney(sale.totalRevenueEarned || 0)}
                        </strong>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="flex justify-between text-[9px] text-purple-300 mb-1">
                        <span>Campaign Progress ({percent}%)</span>
                        <span>{timeStr} Left</span>
                      </div>
                      <div className="w-full bg-[#120b24] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-yellow-500 via-pink-500 to-emerald-400 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#120b24] p-2.5 rounded-xl border border-[#3b2462] text-[10px]">
                      <div>
                        <span className="text-purple-400 text-[8px] block">Units Sold</span>
                        <strong className="text-white">{(sale.unitsSold || 0).toLocaleString()}</strong>
                      </div>
                      <div>
                        <span className="text-purple-400 text-[8px] block">Agency Profit</span>
                        <strong className="text-emerald-400">{formatMoney(sale.companyEarned || 0)}</strong>
                      </div>
                      <div>
                        <span className="text-purple-400 text-[8px] block">Artist Payout</span>
                        <strong className="text-pink-400">{formatMoney(sale.groupEarned || 0)}</strong>
                      </div>
                      <div>
                        <span className="text-purple-400 text-[8px] block">Critics Score</span>
                        <strong className="text-yellow-300">{sale.criticsScore || 85} / 100</strong>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* C. Discography Archive Overview */}
      {activeSubView === 'discography' && (
        <div className="space-y-3">
          {discography.length === 0 ? (
            <div className="bg-[#1e1338]/80 border-2 border-dashed border-[#543b8a] rounded-2xl p-10 text-center">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="text-sm font-bold text-white mb-1">No Published Discography Yet</h3>
              <p className="text-xs text-purple-300 max-w-md mx-auto mb-4">
                Completed album campaigns are permanently archived here with certified sales and critic scores!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {discography.map((album, idx) => (
                <div
                  key={album.id || idx}
                  className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-3.5 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] text-yellow-300 bg-yellow-950/70 border border-yellow-500/40 px-1.5 py-0.2 rounded uppercase font-bold">
                        {album.releaseType}
                      </span>
                      <span className="text-[9px] text-purple-400">
                        Released Wk {album.releasedWeek || 1}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white mt-1.5">"{album.title}"</h4>
                    <p className="text-[10px] text-pink-300 mt-0.5">{album.targetName}</p>

                    <div className="mt-2.5 space-y-1 bg-[#120b24] p-2 rounded-xl border border-[#37235a] text-[9px] text-purple-300">
                      <div className="flex justify-between">
                        <span>Units Sold:</span>
                        <strong className="text-white">{(album.unitsSold || 0).toLocaleString()}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Revenue:</span>
                        <strong className="text-yellow-300">{formatMoney(album.totalRevenue || 0)}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Critics Score:</span>
                        <strong className="text-emerald-400">{album.criticsScore || 80}/100</strong>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-[#37235a] text-[8px] text-purple-400 flex justify-between">
                    <span>{album.genre}</span>
                    <span>{album.concept}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── LEVEL 2: DEDICATED NEW PRODUCTION MODAL ────────────────────── */}
      {showNewProdModal && (
        <Modal
          isOpen={showNewProdModal}
          onClose={() => setShowNewProdModal(false)}
          title="CONFIGURE NEW ALBUM PRODUCTION"
          subtitle="Assemble creative vision, select format, and hire top-liners"
          icon="✨"
          size="xl"
          borderColor="border-pink-500"
        >
          <form onSubmit={handleStartProduction} className="space-y-3.5 text-xs">
            {/* Title & Target Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-purple-200 text-[10px] mb-1">
                  ALBUM TITLE *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. LOVE SHOT, DYNAMO"
                    maxLength={30}
                    className="flex-1 bg-[#120b24] border border-[#52338c] rounded-lg px-2.5 py-1.5 text-white text-xs focus:outline-none focus:border-pink-500"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateTitle}
                    className="px-2.5 py-1.5 rounded-lg bg-[#2d1b4e] border border-purple-500 text-yellow-300 text-xs hover:bg-purple-800"
                    title="Generate Title"
                  >
                    🎲
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-purple-200 text-[10px] mb-1">
                  TARGET ARTIST / GROUP *
                </label>
                <div className="flex gap-2">
                  <select
                    value={targetType}
                    onChange={(e) => {
                      setTargetType(e.target.value)
                      setTargetId(e.target.value === 'group' ? groupOptions[0]?.id : soloOptions[0]?.id)
                    }}
                    className="bg-[#120b24] border border-[#52338c] rounded-lg px-2 py-1.5 text-purple-200 text-xs"
                  >
                    <option value="group">Group</option>
                    <option value="solo">Soloist</option>
                  </select>

                  <select
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    className="flex-1 bg-[#120b24] border border-[#52338c] rounded-lg px-2 py-1.5 text-white text-xs"
                  >
                    {targetType === 'group' ? (
                      groupOptions.length === 0 ? (
                        <option value="">No Groups Available</option>
                      ) : (
                        groupOptions.map(g => (
                          <option key={g.id} value={g.id}>
                            {g.name} ({g.gender}, Tier {g.tier})
                          </option>
                        ))
                      )
                    ) : (
                      soloOptions.length === 0 ? (
                        <option value="">No Solo Artists Debuted</option>
                      ) : (
                        soloOptions.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.stageName || s.name} (Tier {s.tier})
                          </option>
                        ))
                      )
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Release Format Buttons */}
            <div>
              <label className="block text-purple-200 text-[10px] mb-1.5">
                RELEASE FORMAT
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { key: 'single', name: 'Digital Single', weeks: '1 Wk', base: '₩15,000,000', sta: 25 },
                  { key: 'ep', name: 'Mini Album (EP)', weeks: '3 Wks', base: '₩35,000,000', sta: 40 },
                  { key: 'album', name: 'Studio Album', weeks: '4 Wks', base: '₩60,000,000', sta: 55 },
                ].map(item => (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => setReleaseType(item.key)}
                    className={`p-2 rounded-xl border text-left transition-all ${
                      releaseType === item.key
                        ? 'bg-gradient-to-r from-pink-900/80 to-purple-900/80 border-pink-400 text-white shadow'
                        : 'bg-[#241744] border-[#442f70] text-purple-300 hover:border-purple-400'
                    }`}
                  >
                    <div className="text-xs font-bold">{item.name}</div>
                    <div className="text-[10px] text-yellow-300 mt-0.5">{item.base}</div>
                    <div className="text-[8px] text-purple-300 mt-0.5 flex justify-between">
                      <span>{item.weeks}</span>
                      <span>-{item.sta} STA</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Genre & Concept */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-purple-200 text-[10px]">GENRE</label>
                  {genreMatch && (
                    <span className="text-[8px] text-emerald-400">🔥 TREND MATCH (+15)</span>
                  )}
                </div>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full bg-[#120b24] border border-[#52338c] rounded-lg px-2.5 py-1.5 text-white text-xs"
                >
                  {GENRES.map(g => (
                    <option key={g} value={g}>{g} {g === activeTrend.genre ? '★ (Hot Trend)' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-purple-200 text-[10px]">CONCEPT</label>
                  {conceptMatch && (
                    <span className="text-[8px] text-pink-400">✨ TREND MATCH (+15)</span>
                  )}
                </div>
                <select
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  className="w-full bg-[#120b24] border border-[#52338c] rounded-lg px-2.5 py-1.5 text-white text-xs"
                >
                  {CONCEPTS.map(c => (
                    <option key={c} value={c}>{c} {c === activeTrend.concept ? '★ (Hot Trend)' : ''}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lyricist & Producer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-purple-200 text-[10px] mb-1">
                  TOP-LINER / LYRICIST
                </label>
                <select
                  value={writerId}
                  onChange={(e) => setWriterId(e.target.value)}
                  className="w-full bg-[#120b24] border border-[#52338c] rounded-lg px-2.5 py-1.5 text-white text-xs"
                >
                  {WRITERS.map(w => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({formatMoney(w.cost)}) +{w.skill} Skill
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-purple-200 text-[10px] mb-1">
                  SOUND PRODUCER / MIXER
                </label>
                <select
                  value={producerId}
                  onChange={(e) => setProducerId(e.target.value)}
                  className="w-full bg-[#120b24] border border-[#52338c] rounded-lg px-2.5 py-1.5 text-white text-xs"
                >
                  {PRODUCERS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatMoney(p.cost)}) +{p.skill} Skill
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Budget & Synergy Summary (Level 3) */}
            <div className="bg-[#120b24] p-3 rounded-xl border border-[#3b2462] space-y-1.5 text-[10px]">
              <div className="flex justify-between text-purple-300">
                <span>Base Production + Creators:</span>
                <span className="text-white font-bold">{formatMoney(totalCost)}</span>
              </div>
              <div className="flex justify-between text-purple-300">
                <span>Trend Synergy Bonus:</span>
                <span className="text-emerald-400 font-bold">+{synergyScore}% Expected Acclaim & Sales</span>
              </div>
              <div className="pt-1.5 border-t border-[#37235a] flex justify-between items-center text-xs">
                <span className="text-yellow-300 font-bold">Total Production Budget:</span>
                <strong className="text-yellow-400 text-sm">{formatMoney(totalCost)}</strong>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-[#3d276b] flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowNewProdModal(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs bg-[#241744] text-purple-200 border border-purple-500/40"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={state.money < totalCost || !targetId}
                className="px-5 py-1.5 rounded-lg text-xs font-bold bg-pink-600 hover:bg-pink-500 disabled:bg-gray-800 disabled:text-gray-500 text-white border border-pink-400 shadow"
              >
                Start Recording ({formatMoney(totalCost)})
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
