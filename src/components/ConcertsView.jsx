import React, { useState } from 'react'
import { useGame, ACTION } from '../game/state.jsx'
import { CONCERT_VENUES, formatMoney } from '../game/balance.js'
import { calculateConcertAttendance } from '../game/concerts.js'
import { playSfx } from '../game/audio.js'

export default function ConcertsView() {
  const { state, dispatch } = useGame()

  const [activeTab, setActiveTab] = useState('single') // 'single', 'tour', 'grand'
  const [targetType, setTargetType] = useState('group') // 'group' or 'solo'
  const [targetId, setTargetId] = useState(state.groups[0]?.id || '')
  const [selectedVenueId, setSelectedVenueId] = useState('hall_small')
  const [ticketPrice, setTicketPrice] = useState(65_000)
  const [marketingBudget, setMarketingBudget] = useState(10_000_000)

  // Tour state
  const [tourGroupName, setTourGroupName] = useState(state.groups[0]?.id || '')
  const [tourStops, setTourStops] = useState(3)
  const [tourTitle, setTourTitle] = useState('WORLDWIDE DOMINATION TOUR')

  // Result modal
  const [concertResult, setConcertResult] = useState(null)

  const groupOptions = state.groups || []
  const soloOptions = state.idols.filter(i => i.isSolo)

  const selectedVenue = CONCERT_VENUES.find(v => v.id === selectedVenueId) || CONCERT_VENUES[0]

  // Get selected target entity
  let currentTarget = null
  let fanbase = 1000
  let popularity = 20
  let incomeDistribution = { companyPercent: 50, groupPercent: 50 }

  if (targetType === 'group') {
    currentTarget = state.groups.find(g => g.id === targetId) || state.groups[0]
    if (currentTarget) {
      fanbase = currentTarget.fanbase || 1000
      popularity = currentTarget.popularity || 20
      incomeDistribution = currentTarget.incomeDistribution || { companyPercent: 50, groupPercent: 50 }
    }
  } else {
    currentTarget = state.idols.find(i => i.id === targetId) || soloOptions[0]
    if (currentTarget) {
      fanbase = currentTarget.soloFanbase || 800
      popularity = currentTarget.popularity || 20
      incomeDistribution = { companyPercent: 50, groupPercent: 50 }
    }
  }

  // Live forecast
  const forecast = calculateConcertAttendance({
    venue: selectedVenue,
    fanbase,
    popularity,
    ticketPrice,
    marketingBudget,
    companyReputation: state.companyReputation || 'Local',
  })

  const forecastGross = forecast.ticketsSold * ticketPrice + Math.round(forecast.ticketsSold * ticketPrice * 0.18)
  const forecastExpenses = selectedVenue.rentalCost + marketingBudget
  const forecastNet = forecastGross - forecastExpenses
  const companyForecast = Math.round(forecastNet * (incomeDistribution.companyPercent / 100))

  const handleHoldConcert = () => {
    if (!currentTarget) {
      dispatch({
        type: ACTION.PUSH_TOAST,
        toast: { message: 'Please select a performer for the concert.', variant: 'red' },
      })
      playSfx('buzz')
      return
    }

    const totalCost = selectedVenue.rentalCost + marketingBudget
    if (state.money < totalCost) {
      dispatch({
        type: ACTION.PUSH_TOAST,
        toast: { message: `Insufficient funds for venue rental & promo (${formatMoney(totalCost)})!`, variant: 'red' },
      })
      playSfx('buzz')
      return
    }

    playSfx('cheer')
    dispatch({
      type: ACTION.EXECUTE_CONCERT,
      concertParams: {
        targetType,
        targetId: currentTarget.id,
        targetName: targetType === 'group' ? currentTarget.name : (currentTarget.stageName || currentTarget.name),
        venueId: selectedVenue.id,
        ticketPrice,
        marketingBudget,
        fanbase,
        popularity,
        companyReputation: state.companyReputation || 'Local',
        incomeDistribution,
      },
    })
  }

  const handleLaunchTour = () => {
    const grp = state.groups.find(g => g.id === tourGroupName)
    if (!grp) {
      dispatch({
        type: ACTION.PUSH_TOAST,
        toast: { message: 'Select a group for the world tour.', variant: 'red' },
      })
      playSfx('buzz')
      return
    }

    const costPerStop = 25_000_000 + 15_000_000
    const totalTourCost = costPerStop * tourStops

    if (state.money < totalTourCost) {
      dispatch({
        type: ACTION.PUSH_TOAST,
        toast: { message: `Insufficient funds for World Tour logistics (${formatMoney(totalTourCost)})!`, variant: 'red' },
      })
      playSfx('buzz')
      return
    }

    playSfx('cheer')
    dispatch({
      type: ACTION.EXECUTE_TOUR,
      tourParams: {
        group: grp,
        tourName: tourTitle || 'WORLD TOUR',
        stopsCount: tourStops,
        marketingPerStop: 15_000_000,
        companyReputation: state.companyReputation || 'National',
      },
    })
  }

  // Company Grand Concert
  const handleGrandConcert = () => {
    if (state.idols.length === 0) return
    const grandCost = 120_000_000
    if (state.money < grandCost) {
      dispatch({
        type: ACTION.PUSH_TOAST,
        toast: { message: `Company Grand Showcase requires ₩120,000,000 in staging budget!`, variant: 'red' },
      })
      playSfx('buzz')
      return
    }

    const stadiumVenue = CONCERT_VENUES.find(v => v.id === 'stadium') || CONCERT_VENUES[3]

    playSfx('cheer')
    dispatch({
      type: ACTION.EXECUTE_CONCERT,
      concertParams: {
        targetType: 'company',
        targetId: 'company_all',
        targetName: `${state.companyName} Grand Festival`,
        venueId: stadiumVenue.id,
        ticketPrice: 120_000,
        marketingBudget: 40_000_000,
        fanbase: state.idols.length * 3500,
        popularity: 85,
        companyReputation: state.companyReputation || 'Global',
        incomeDistribution: { companyPercent: 80, groupPercent: 20 },
      },
    })
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1e1338] border-2 border-[#543b8a] p-4 rounded-xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-300 font-pixel">
            LIVE CONCERTS & WORLD TOURS
          </h2>
          <p className="text-xs text-purple-200 mt-1 font-pixel leading-relaxed">
            Rent high-capacity arenas, set dynamic ticket prices, coordinate global tour legs, and headline agency-wide showcases.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('single')}
            className={`px-3 py-1.5 rounded-lg text-xs font-pixel border transition-all ${
              activeTab === 'single'
                ? 'bg-yellow-500 border-yellow-300 text-black font-bold shadow-md'
                : 'bg-[#241744] border-[#442f70] text-purple-300 hover:border-yellow-500/40'
            }`}
          >
            Live Concert
          </button>
          <button
            onClick={() => setActiveTab('tour')}
            className={`px-3 py-1.5 rounded-lg text-xs font-pixel border transition-all ${
              activeTab === 'tour'
                ? 'bg-yellow-500 border-yellow-300 text-black font-bold shadow-md'
                : 'bg-[#241744] border-[#442f70] text-purple-300 hover:border-yellow-500/40'
            }`}
          >
            World Tour
          </button>
          <button
            onClick={() => setActiveTab('grand')}
            className={`px-3 py-1.5 rounded-lg text-xs font-pixel border transition-all ${
              activeTab === 'grand'
                ? 'bg-yellow-500 border-yellow-300 text-black font-bold shadow-md'
                : 'bg-[#241744] border-[#442f70] text-purple-300 hover:border-yellow-500/40'
            }`}
          >
            Agency Showcase
          </button>
        </div>
      </div>

      {/* SINGLE CONCERT TAB */}
      {activeTab === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Setup */}
          <div className="lg:col-span-2 space-y-5 bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-5 shadow-xl">
            {/* Target Select */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-pixel text-purple-200 mb-1">
                  PERFORMER TYPE
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('group')
                      setTargetId(groupOptions[0]?.id || '')
                    }}
                    className={`py-2 px-3 rounded-lg border text-xs font-pixel ${
                      targetType === 'group'
                        ? 'bg-pink-900/70 border-pink-400 text-white'
                        : 'bg-[#241744] border-[#442f70] text-purple-300'
                    }`}
                  >
                    Group
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('solo')
                      setTargetId(soloOptions[0]?.id || '')
                    }}
                    className={`py-2 px-3 rounded-lg border text-xs font-pixel ${
                      targetType === 'solo'
                        ? 'bg-pink-900/70 border-pink-400 text-white'
                        : 'bg-[#241744] border-[#442f70] text-purple-300'
                    }`}
                  >
                    Soloist
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-pixel text-purple-200 mb-1">
                  HEADLINING ARTIST
                </label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full bg-[#120b24] border border-[#52338c] rounded-lg px-3 py-2 text-white font-pixel text-xs"
                >
                  {targetType === 'group' ? (
                    groupOptions.map(g => (
                      <option key={g.id} value={g.id}>{g.name} (Tier {g.tier})</option>
                    ))
                  ) : (
                    soloOptions.map(s => (
                      <option key={s.id} value={s.id}>{s.stageName || s.name} (Tier {s.tier})</option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Venue Selector */}
            <div>
              <label className="block text-xs font-pixel text-purple-200 mb-2">
                SELECT CONCERT VENUE
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CONCERT_VENUES.map(venue => {
                  const isSelected = selectedVenueId === venue.id
                  return (
                    <div
                      key={venue.id}
                      onClick={() => {
                        setSelectedVenueId(venue.id)
                        playSfx('click')
                      }}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-yellow-950/70 border-yellow-400 shadow-md'
                          : 'bg-[#241744] border-[#442f70] hover:border-purple-400'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-pixel">{venue.name}</span>
                        <span className="text-[10px] font-pixel text-yellow-300">
                          {venue.capacity.toLocaleString()} seats
                        </span>
                      </div>
                      <div className="text-[10px] text-purple-300 font-pixel mt-1 flex justify-between">
                        <span>Rental: {formatMoney(venue.rentalCost)}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Sliders: Ticket Price & Marketing */}
            <div className="space-y-4 bg-[#120b24] p-4 rounded-xl border border-[#3b2462]">
              <div>
                <div className="flex justify-between text-xs font-pixel text-purple-200 mb-1">
                  <span>Ticket Price:</span>
                  <span className="text-yellow-300 font-bold">{formatMoney(ticketPrice)} / ticket</span>
                </div>
                <input
                  type="range"
                  min="30000"
                  max="250000"
                  step="5000"
                  value={ticketPrice}
                  onChange={(e) => setTicketPrice(Number(e.target.value))}
                  className="w-full accent-yellow-400 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-purple-400 font-pixel mt-0.5">
                  <span>₩30,000 (Affordable)</span>
                  <span>₩250,000 (VIP Premium)</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-pixel text-purple-200 mb-1">
                  <span>Marketing & Promotion:</span>
                  <span className="text-emerald-400 font-bold">{formatMoney(marketingBudget)}</span>
                </div>
                <input
                  type="range"
                  min="2000000"
                  max="50000000"
                  step="2000000"
                  value={marketingBudget}
                  onChange={(e) => setMarketingBudget(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-purple-400 font-pixel mt-0.5">
                  <span>₩2M (Social Media)</span>
                  <span>₩50M (Billboards & TV Ads)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Forecast & Execution */}
          <div className="space-y-4 bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-yellow-300 font-pixel mb-3">
                BOX OFFICE FORECAST
              </h3>

              <div className="space-y-2.5 text-xs font-pixel bg-[#120b24] p-3.5 rounded-xl border border-[#3b2462] mb-4">
                <div className="flex justify-between text-purple-300">
                  <span>Estimated Attendance:</span>
                  <span className={`font-bold ${forecast.isSoldOut ? 'text-emerald-400' : 'text-white'}`}>
                    {forecast.ticketsSold.toLocaleString()} / {selectedVenue.capacity.toLocaleString()} ({forecast.attendanceRate}%)
                  </span>
                </div>
                {forecast.isSoldOut && (
                  <div className="text-[9px] font-pixel text-yellow-300 bg-yellow-950/70 border border-yellow-500/40 p-1 rounded text-center">
                    🔥 PROJECTED SOLD OUT EVENT!
                  </div>
                )}
                <div className="flex justify-between text-purple-300">
                  <span>Est. Ticket Gross:</span>
                  <span className="text-white font-bold">{formatMoney(forecast.ticketsSold * ticketPrice)}</span>
                </div>
                <div className="flex justify-between text-purple-300">
                  <span>Est. Merchandise:</span>
                  <span className="text-purple-200">{formatMoney(Math.round(forecast.ticketsSold * ticketPrice * 0.18))}</span>
                </div>
                <div className="flex justify-between text-purple-300">
                  <span>Total Expenses:</span>
                  <span className="text-red-400 font-bold">{formatMoney(forecastExpenses)}</span>
                </div>
                <div className="pt-2 border-t border-[#37235a] flex justify-between items-center text-sm">
                  <span className="text-yellow-300 font-bold">Est. Net Profit:</span>
                  <span className={`font-bold ${forecastNet >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatMoney(forecastNet)}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-[#241744] rounded-xl border border-[#442f70] text-xs font-pixel space-y-1">
                <div className="flex justify-between text-purple-300">
                  <span>Agency Share ({incomeDistribution.companyPercent}%):</span>
                  <span className="text-yellow-300 font-bold">{formatMoney(companyForecast)}</span>
                </div>
                <div className="flex justify-between text-purple-300">
                  <span>Artist Payout ({incomeDistribution.groupPercent}%):</span>
                  <span className="text-pink-300 font-bold">{formatMoney(forecastNet - companyForecast)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleHoldConcert}
              disabled={state.money < forecastExpenses}
              className="w-full btn-primary text-xs font-pixel py-3 shadow-lg disabled:opacity-50"
            >
              HOLD CONCERT ({formatMoney(forecastExpenses)})
            </button>
          </div>
        </div>
      )}

      {/* WORLD TOUR TAB */}
      {activeTab === 'tour' && (
        <div className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-6 shadow-xl space-y-5">
          <div className="max-w-2xl">
            <h3 className="text-base font-bold text-yellow-300 font-pixel mb-1">
              MULTI-CITY WORLD TOUR EXPEDITION
            </h3>
            <p className="text-xs text-purple-200 font-pixel leading-relaxed">
              Embark on an international concert tour spanning prestigious arenas across Seoul, Tokyo, Bangkok, Los Angeles, and London. Massive revenue potential with substantial fatigue impact.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-pixel text-purple-200 mb-1">TOUR TITLE</label>
              <input
                type="text"
                value={tourTitle}
                onChange={(e) => setTourTitle(e.target.value)}
                placeholder="WORLD TOUR 2026"
                className="w-full bg-[#120b24] border border-[#52338c] rounded-lg px-3 py-2 text-white font-pixel text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-pixel text-purple-200 mb-1">HEADLINE GROUP</label>
              <select
                value={tourGroupName}
                onChange={(e) => setTourGroupName(e.target.value)}
                className="w-full bg-[#120b24] border border-[#52338c] rounded-lg px-3 py-2 text-white font-pixel text-xs"
              >
                {groupOptions.map(g => (
                  <option key={g.id} value={g.id}>{g.name} (Fanbase: {g.fanbase?.toLocaleString()})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-pixel text-purple-200 mb-1">TOUR LENGTH</label>
              <select
                value={tourStops}
                onChange={(e) => setTourStops(Number(e.target.value))}
                className="w-full bg-[#120b24] border border-[#52338c] rounded-lg px-3 py-2 text-white font-pixel text-xs"
              >
                <option value={3}>3 Cities (Asian Leg)</option>
                <option value={5}>5 Cities (Global Arena Leg)</option>
              </select>
            </div>
          </div>

          <div className="bg-[#120b24] p-4 rounded-xl border border-[#37235a] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="text-xs font-pixel text-purple-300 space-y-1">
              <div>Total Logistics Budget: <span className="text-yellow-400 font-bold">{formatMoney(tourStops * 40_000_000)}</span></div>
              <div className="text-[10px] text-purple-400">Includes arena leases, international crew flights, and local marketing.</div>
            </div>

            <button
              onClick={handleLaunchTour}
              disabled={state.money < (tourStops * 40_000_000) || groupOptions.length === 0}
              className="btn-primary text-xs font-pixel py-3 px-6 shadow-lg disabled:opacity-50"
            >
              LAUNCH WORLD TOUR
            </button>
          </div>
        </div>
      )}

      {/* AGENCY SHOWCASE TAB */}
      {activeTab === 'grand' && (
        <div className="bg-[#1e1338] border-2 border-yellow-500/80 rounded-2xl p-6 shadow-xl space-y-5">
          <div className="max-w-2xl">
            <div className="inline-block px-2.5 py-1 rounded bg-yellow-500/20 text-yellow-300 font-pixel text-[10px] mb-2 border border-yellow-500/40">
              AGENCY FLAGSHIP SPECTACULAR
            </div>
            <h3 className="text-lg font-bold text-white font-pixel mb-1">
              {state.companyName?.toUpperCase()} GRAND ALL-STAR FESTIVAL
            </h3>
            <p className="text-xs text-purple-200 font-pixel leading-relaxed">
              Unite all trainees, boy groups, girl groups, and soloists onto one monumental 50,000-capacity Olympic Stadium stage. Drives massive brand prestige and company reputation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#120b24] p-4 rounded-xl border border-[#3b2462] text-xs font-pixel">
            <div>
              <span className="text-purple-400">Total Participating Roster:</span>
              <p className="text-yellow-300 font-bold text-sm mt-0.5">{state.idols?.length || 0} Idols</p>
            </div>
            <div>
              <span className="text-purple-400">Venue:</span>
              <p className="text-white font-bold text-sm mt-0.5">World Olympic Stadium (50k)</p>
            </div>
            <div>
              <span className="text-purple-400">Production Investment:</span>
              <p className="text-pink-300 font-bold text-sm mt-0.5">₩120,000,000</p>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleGrandConcert}
              disabled={state.money < 120_000_000 || (state.idols?.length || 0) === 0}
              className="btn-primary text-xs font-pixel py-3 px-6 shadow-xl disabled:opacity-50"
            >
              HEADLINE GRAND AGENCY FESTIVAL (₩120M)
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
