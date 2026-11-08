import React, { useState } from 'react'
import { useGame, ACTION } from '../game/state.jsx'
import {
  ALBUM_CONFIGS,
  GENRES,
  CONCEPTS,
  WRITERS,
  PRODUCERS,
} from '../game/balance.js'
import { formatMoney } from '../game/balance.js'
import { playSfx } from '../game/audio.js'

export default function ProductionView() {
  const { state, dispatch } = useGame()

  const [activeTab, setActiveTab] = useState('active') // 'active', 'new', 'sales', 'discography'

  // Form state
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

  // Check synergy
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
    setActiveTab('active')
  }

  const activeProductions = state.productions?.filter(p => !p.completed) || []
  const discography = state.discography || []
  const activeSales = state.activeSales || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1e1338] border-2 border-[#543b8a] p-4 rounded-xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-yellow-300 font-pixel">
            RECORDING & PRODUCTION STUDIO
          </h2>
          <p className="text-xs text-purple-200 mt-1 font-pixel leading-relaxed">
            Record Singles, EPs, and Full Albums. Match current cultural trends, hire top lyricists, and launch 10-minute real-time album release campaigns.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('new')}
            className={`px-3 py-1.5 rounded-lg text-xs font-pixel border transition-all ${
              activeTab === 'new'
                ? 'bg-pink-600 border-pink-400 text-white shadow-md'
                : 'bg-[#241744] border-[#442f70] text-purple-300 hover:border-pink-500/40'
            }`}
          >
            + New Production
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-pixel border transition-all relative ${
              activeTab === 'active'
                ? 'bg-pink-600 border-pink-400 text-white shadow-md'
                : 'bg-[#241744] border-[#442f70] text-purple-300 hover:border-pink-500/40'
            }`}
          >
            In-Studio ({activeProductions.length})
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-3 py-1.5 rounded-lg text-xs font-pixel border transition-all relative ${
              activeTab === 'sales'
                ? 'bg-pink-600 border-pink-400 text-white shadow-md'
                : 'bg-[#241744] border-[#442f70] text-purple-300 hover:border-pink-500/40'
            }`}
          >
            Live Sales ({activeSales.filter(s => !s.completed).length})
          </button>
          <button
            onClick={() => setActiveTab('discography')}
            className={`px-3 py-1.5 rounded-lg text-xs font-pixel border transition-all ${
              activeTab === 'discography'
                ? 'bg-pink-600 border-pink-400 text-white shadow-md'
                : 'bg-[#241744] border-[#442f70] text-purple-300 hover:border-pink-500/40'
            }`}
          >
            Discography ({discography.length})
          </button>
        </div>
      </div>

      {/* NEW PRODUCTION FORM */}
      {activeTab === 'new' && (
        <form onSubmit={handleStartProduction} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Album Setup */}
            <div className="lg:col-span-2 space-y-5 bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-5 shadow-xl">
              {/* Title & Target */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-pixel text-purple-200 mb-1">
                    ALBUM TITLE *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. LOVE SHOT, DYNAMO"
                      maxLength={30}
                      className="flex-1 bg-[#120b24] border border-[#52338c] rounded-lg px-3 py-2 text-white font-pixel text-xs focus:outline-none focus:border-pink-500"
                    />
                    <button
                      type="button"
                      onClick={handleGenerateTitle}
                      className="px-2.5 py-2 rounded-lg bg-[#2d1b4e] border border-purple-500 text-yellow-300 text-xs font-pixel hover:bg-purple-800"
                      title="Generate Title"
                    >
                      🎲
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-pixel text-purple-200 mb-1">
                    TARGET ARTIST / GROUP *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={targetType}
                      onChange={(e) => {
                        setTargetType(e.target.value)
                        setTargetId(e.target.value === 'group' ? groupOptions[0]?.id : soloOptions[0]?.id)
                      }}
                      className="bg-[#120b24] border border-[#52338c] rounded-lg px-2 py-2 text-purple-200 font-pixel text-xs"
                    >
                      <option value="group">Group</option>
                      <option value="solo">Soloist</option>
                    </select>

                    <select
                      value={targetId}
                      onChange={(e) => setTargetId(e.target.value)}
                      className="flex-1 bg-[#120b24] border border-[#52338c] rounded-lg px-3 py-2 text-white font-pixel text-xs"
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

              {/* Release Type Buttons */}
              <div>
                <label className="block text-xs font-pixel text-purple-200 mb-2">
                  RELEASE FORMAT
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { key: 'single', name: 'Digital Single', weeks: '1 Week', base: '₩15,000,000', sta: 25 },
                    { key: 'ep', name: 'Mini Album (EP)', weeks: '3 Weeks', base: '₩35,000,000', sta: 40 },
                    { key: 'album', name: 'Full Studio Album', weeks: '4 Weeks', base: '₩60,000,000', sta: 55 },
                  ].map(item => (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setReleaseType(item.key)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        releaseType === item.key
                          ? 'bg-gradient-to-r from-pink-900/80 to-purple-900/80 border-pink-400 text-white shadow-lg'
                          : 'bg-[#241744] border-[#442f70] text-purple-300 hover:border-purple-400'
                      }`}
                    >
                      <div className="text-xs font-bold font-pixel">{item.name}</div>
                      <div className="text-[10px] text-yellow-300 font-pixel mt-1">{item.base}</div>
                      <div className="text-[9px] text-purple-300 font-pixel mt-1 flex justify-between">
                        <span>Production: {item.weeks}</span>
                        <span>STA: -{item.sta}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Genre & Concept */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-pixel text-purple-200">GENRE</label>
                    {genreMatch && (
                      <span className="text-[9px] font-pixel text-emerald-400">🔥 TREND MATCH (+15)</span>
                    )}
                  </div>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full bg-[#120b24] border border-[#52338c] rounded-lg px-3 py-2 text-white font-pixel text-xs"
                  >
                    {GENRES.map(g => (
                      <option key={g} value={g}>{g} {g === activeTrend.genre ? '★ (Hot Trend)' : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-pixel text-purple-200">CONCEPT</label>
                    {conceptMatch && (
                      <span className="text-[9px] font-pixel text-pink-400">✨ TREND MATCH (+15)</span>
                    )}
                  </div>
                  <select
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    className="w-full bg-[#120b24] border border-[#52338c] rounded-lg px-3 py-2 text-white font-pixel text-xs"
                  >
                    {CONCEPTS.map(c => (
                      <option key={c} value={c}>{c} {c === activeTrend.concept ? '★ (Hot Trend)' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Writer & Producer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-pixel text-purple-200 mb-1">
                    TOP-LINER / LYRICIST
                  </label>
                  <select
                    value={writerId}
                    onChange={(e) => setWriterId(e.target.value)}
                    className="w-full bg-[#120b24] border border-[#52338c] rounded-lg px-3 py-2 text-white font-pixel text-xs"
                  >
                    {WRITERS.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({formatMoney(w.cost)}) +{w.skill} Skill
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-pixel text-purple-200 mb-1">
                    SOUND PRODUCER / MIXER
                  </label>
                  <select
                    value={producerId}
                    onChange={(e) => setProducerId(e.target.value)}
                    className="w-full bg-[#120b24] border border-[#52338c] rounded-lg px-3 py-2 text-white font-pixel text-xs"
                  >
                    {PRODUCERS.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({formatMoney(p.cost)}) +{p.skill} Skill
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Right Col: Cost Breakdown & Launch */}
            <div className="space-y-4 bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-yellow-300 font-pixel mb-3">
                  PRODUCTION SUMMARY
                </h3>

                <div className="space-y-2.5 text-xs font-pixel bg-[#120b24] p-3.5 rounded-xl border border-[#3b2462] mb-4">
                  <div className="flex justify-between text-purple-300">
                    <span>Base Production:</span>
                    <span className="text-white font-bold">{formatMoney(config.baseCost)}</span>
                  </div>
                  <div className="flex justify-between text-purple-300">
                    <span>Lyricist Fee:</span>
                    <span className="text-white font-bold">{formatMoney(selectedWriter.cost)}</span>
                  </div>
                  <div className="flex justify-between text-purple-300">
                    <span>Producer Fee:</span>
                    <span className="text-white font-bold">{formatMoney(selectedProducer.cost)}</span>
                  </div>
                  <div className="pt-2 border-t border-[#37235a] flex justify-between items-center text-sm">
                    <span className="text-yellow-300 font-bold">Total Budget:</span>
                    <span className="text-yellow-400 font-bold">{formatMoney(totalCost)}</span>
                  </div>
                </div>

                {/* Cultural synergy badge */}
                <div className="p-3 bg-[#241744] rounded-xl border border-[#442f70] text-xs font-pixel space-y-1">
                  <div className="text-purple-300">Market Synergy Bonus:</div>
                  <div className="text-emerald-300 font-bold">
                    +{synergyScore}% Expected Acclaim & Sales
                  </div>
                  <div className="text-[9px] text-purple-400 mt-1">
                    Current Trend: {activeTrend.genre} • {activeTrend.concept}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={state.money < totalCost || !targetId}
                className="w-full btn-primary text-xs font-pixel py-3 shadow-lg disabled:opacity-50"
              >
                START PRODUCTION ({formatMoney(totalCost)})
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ACTIVE IN-STUDIO RECORDINGS */}
      {activeTab === 'active' && (
        <div className="space-y-4">
          {activeProductions.length === 0 ? (
            <div className="bg-[#1e1338]/80 border-2 border-dashed border-[#543b8a] rounded-2xl p-12 text-center">
              <div className="text-5xl mb-4">🎧</div>
              <h3 className="text-lg font-bold text-white font-pixel mb-2">No Active Recordings</h3>
              <p className="text-xs text-purple-300 font-pixel max-w-md mx-auto mb-6">
                All studios are currently idle. Start a new album production to begin recording tracks!
              </p>
              <button
                onClick={() => setActiveTab('new')}
                className="btn-primary text-xs font-pixel py-2.5 px-5"
              >
                CREATE NEW ALBUM
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeProductions.map(prod => {
                const totalWeeks = prod.durationWeeks || 1
                const passed = prod.weeksPassed || 0
                const percent = Math.min(100, Math.round((passed / totalWeeks) * 100))

                return (
                  <div
                    key={prod.id}
                    className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-5 shadow-xl relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[9px] font-pixel text-yellow-300 bg-yellow-950/70 border border-yellow-500/40 px-2 py-0.5 rounded uppercase">
                          {prod.releaseType}
                        </span>
                        <h3 className="text-base font-bold text-white font-pixel mt-1.5">{prod.title}</h3>
                        <p className="text-xs text-pink-300 font-pixel mt-0.5">By {prod.targetName}</p>
                      </div>
                      <div className="text-right text-xs font-pixel text-purple-300">
                        <div>Wk {passed} / {totalWeeks}</div>
                        <div className="text-emerald-400 font-bold mt-0.5">{percent}% Ready</div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="w-full bg-[#120b24] h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-pink-500 to-yellow-400 h-full rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2 text-[10px] font-pixel text-purple-300 bg-[#120b24] p-3 rounded-xl border border-[#37235a]">
                      <div>Genre: <span className="text-white">{prod.genre}</span></div>
                      <div>Concept: <span className="text-white">{prod.concept}</span></div>
                      <div>Writer: <span className="text-white">{prod.writer?.name}</span></div>
                      <div>Producer: <span className="text-white">{prod.producer?.name}</span></div>
                    </div>

                    <p className="text-[9px] text-purple-400 font-pixel mt-3 text-center">
                      Advances 1 week on "Next Week" simulation. Releases automatically when 100% complete!
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* LIVE 10-MINUTE SALES MONITOR */}
      {activeTab === 'sales' && (
        <div className="space-y-4">
          {activeSales.length === 0 ? (
            <div className="bg-[#1e1338]/80 border-2 border-dashed border-[#543b8a] rounded-2xl p-12 text-center">
              <div className="text-5xl mb-4">💿</div>
              <h3 className="text-lg font-bold text-white font-pixel mb-2">No Active Sales Window</h3>
              <p className="text-xs text-purple-300 font-pixel max-w-md mx-auto mb-6">
                When an album completes production, it enters an intensive 10-minute real-time commercial sales campaign with live revenue updates!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeSales.map(sale => {
                const remainingSecs = Math.max(0, 600 - (sale.secondsElapsed || 0))
                const mins = Math.floor(remainingSecs / 60)
                const secs = Math.floor(remainingSecs % 60)
                const timeStr = `${mins}:${secs < 10 ? '0' : ''}${secs}`
                const percent = Math.min(100, Math.round(((sale.secondsElapsed || 0) / 600) * 100))

                return (
                  <div
                    key={sale.id}
                    className={`bg-[#1e1338] border-2 rounded-2xl p-5 shadow-xl transition-all ${
                      sale.completed ? 'border-purple-800 opacity-80' : 'border-yellow-500/80 shadow-yellow-500/10'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#3b2762]">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-bold text-white font-pixel">{sale.title}</h3>
                          <span className="text-[9px] font-pixel text-yellow-300 bg-yellow-950/70 border border-yellow-500/40 px-2 py-0.5 rounded">
                            {sale.releaseType.toUpperCase()}
                          </span>
                          {sale.completed ? (
                            <span className="text-[9px] font-pixel text-purple-400 bg-purple-950/80 px-2 py-0.5 rounded">
                              SALES CONCLUDED
                            </span>
                          ) : (
                            <span className="text-[9px] font-pixel text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded animate-pulse">
                              LIVE WINDOW: {timeStr}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-pink-300 font-pixel mt-0.5">Artist: {sale.targetName}</p>
                      </div>

                      <div className="text-right font-pixel">
                        <span className="text-xs text-purple-300">Revenue Earned:</span>
                        <div className="text-base text-yellow-400 font-bold">
                          {formatMoney(sale.totalRevenueEarned || 0)}
                        </div>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs font-pixel text-purple-300 mb-1">
                        <span>Real-Time Sales Progress ({percent}%)</span>
                        <span>{timeStr} Left</span>
                      </div>
                      <div className="w-full bg-[#120b24] h-3 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-yellow-500 via-pink-500 to-emerald-400 h-full rounded-full transition-all duration-1000"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Sales Metrics */}
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#120b24] p-3 rounded-xl border border-[#3b2462] text-xs font-pixel">
                      <div>
                        <span className="text-purple-400">Total Units Sold:</span>
                        <p className="text-white font-bold mt-0.5">{(sale.unitsSold || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-purple-400">Agency Profit:</span>
                        <p className="text-emerald-400 font-bold mt-0.5">{formatMoney(sale.companyEarned || 0)}</p>
                      </div>
                      <div>
                        <span className="text-purple-400">Artist Payout:</span>
                        <p className="text-pink-400 font-bold mt-0.5">{formatMoney(sale.groupEarned || 0)}</p>
                      </div>
                      <div>
                        <span className="text-purple-400">Acclaim:</span>
                        <p className="text-yellow-300 font-bold mt-0.5">{sale.criticsScore || 85} / 100</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* DISCOGRAPHY ARCHIVE */}
      {activeTab === 'discography' && (
        <div className="space-y-4">
          {discography.length === 0 ? (
            <div className="bg-[#1e1338]/80 border-2 border-dashed border-[#543b8a] rounded-2xl p-12 text-center">
              <div className="text-5xl mb-4">🏆</div>
              <h3 className="text-lg font-bold text-white font-pixel mb-2">No Released Albums Yet</h3>
              <p className="text-xs text-purple-300 font-pixel max-w-md mx-auto mb-6">
                Your agency has not published any albums yet. Start your first release today!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {discography.map((album, idx) => (
                <div
                  key={album.id || idx}
                  className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-4 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-pixel text-yellow-300 bg-yellow-950/70 border border-yellow-500/40 px-2 py-0.5 rounded uppercase">
                        {album.releaseType}
                      </span>
                      <span className="text-[10px] font-pixel text-purple-400">
                        Released Wk {album.releasedWeek || 1}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white font-pixel mt-2">{album.title}</h4>
                    <p className="text-xs text-pink-300 font-pixel mt-0.5">{album.targetName}</p>

                    <div className="mt-3 space-y-1 bg-[#120b24] p-2.5 rounded-xl border border-[#37235a] text-[10px] font-pixel text-purple-300">
                      <div className="flex justify-between">
                        <span>Units Sold:</span>
                        <span className="text-white font-bold">{(album.unitsSold || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Revenue:</span>
                        <span className="text-yellow-300 font-bold">{formatMoney(album.totalRevenue || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Critics Score:</span>
                        <span className="text-emerald-400 font-bold">{album.criticsScore || 80}/100</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[#37235a] text-[9px] font-pixel text-purple-400 flex justify-between">
                    <span>{album.genre}</span>
                    <span>{album.concept}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
