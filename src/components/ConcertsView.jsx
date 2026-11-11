/**
 * ConcertsView.jsx — Modal-First Concert & Live Events Division.
 *
 * Level 1: Main tab is a clean Live Events Overview displaying concert statistics,
 *          available venues catalog summary, and clear entry points to plan events.
 * Level 2: Dedicated Modals for Planning a Single Concert, Launching a Multi-City World Tour,
 *          and Hosting the Grand Agency All-Star Festival.
 */

import React, { useState } from 'react'
import { useGame, ACTION } from '../game/state.jsx'
import { CONCERT_VENUES, formatMoney } from '../game/balance.js'
import { calculateConcertAttendance } from '../game/concerts.js'
import { playSfx } from '../game/audio.js'
import Modal from './ui/Modal.jsx'

export default function ConcertsView() {
  const { state, dispatch } = useGame()

  // Modal-First triggers
  const [showConcertModal, setShowConcertModal] = useState(false)
  const [showTourModal, setShowTourModal] = useState(false)
  const [showGrandModal, setShowGrandModal] = useState(false)

  // Single Concert form state
  const [targetType, setTargetType] = useState('group') // 'group' or 'solo'
  const [targetId, setTargetId] = useState(state.groups[0]?.id || '')
  const [selectedVenueId, setSelectedVenueId] = useState('hall_small')
  const [ticketPrice, setTicketPrice] = useState(65_000)
  const [marketingBudget, setMarketingBudget] = useState(10_000_000)

  // Tour form state
  const [tourGroupName, setTourGroupName] = useState(state.groups[0]?.id || '')
  const [tourStops, setTourStops] = useState(3)
  const [tourTitle, setTourTitle] = useState('WORLDWIDE DOMINATION TOUR')

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
    setShowConcertModal(false)
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
    setShowTourModal(false)
  }

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
    setShowGrandModal(false)
  }

  return (
    <div className="space-y-4 font-pixel">
      {/* ── LEVEL 1: Main Tab Overview Header ──────────────────────────── */}
      <div className="bg-[#1e1338] border-2 border-[#543b8a] p-3.5 sm:p-4 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🏟️</span>
            <h2 className="text-sm sm:text-base font-bold text-white">
              LIVE CONCERTS & WORLD TOURS OVERVIEW
            </h2>
          </div>
          <p className="text-[10px] text-purple-200 mt-0.5">
            Arena tours & showcase events. Completed: <strong className="text-yellow-300">{state.concertsCompleted || 0} Shows</strong>. Configure live events in modals.
          </p>
        </div>

        {/* Modal Entry Points */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => {
              setShowConcertModal(true)
              playSfx('click')
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-yellow-500 hover:bg-yellow-400 text-black border border-yellow-300 shadow active:scale-95"
          >
            + Plan Concert
          </button>
          <button
            type="button"
            onClick={() => {
              setShowTourModal(true)
              playSfx('click')
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-pink-600 hover:bg-pink-500 text-white border border-pink-400 shadow active:scale-95"
          >
            + World Tour
          </button>
          <button
            type="button"
            onClick={() => {
              setShowGrandModal(true)
              playSfx('click')
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#2d1b4e] hover:bg-[#3d2668] text-yellow-300 border border-yellow-500/40 shadow active:scale-95"
          >
            + All-Star Festival
          </button>
        </div>
      </div>

      {/* ── LEVEL 1: Venues & Tours Catalog Summary ────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {CONCERT_VENUES.map(venue => (
          <div
            key={venue.id}
            onClick={() => {
              setSelectedVenueId(venue.id)
              setShowConcertModal(true)
              playSfx('click')
            }}
            className="bg-[#1e1338] border-2 border-[#543b8a] rounded-2xl p-3.5 shadow-md hover:border-yellow-400 cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <strong className="text-xs text-white">{venue.name}</strong>
                <span className="text-[9px] text-yellow-300 bg-yellow-950/70 border border-yellow-500/40 px-1.5 py-0.2 rounded font-bold">
                  {venue.capacity.toLocaleString()} seats
                </span>
              </div>
              <p className="text-[9px] text-purple-300 mt-1">
                Standard acoustic staging & dynamic ticketing.
              </p>
              <div className="mt-2 text-[10px] text-yellow-300 bg-[#120b24] p-2 rounded-lg border border-[#3b2462] flex justify-between">
                <span className="text-purple-400 text-[9px]">Lease Cost:</span>
                <strong>{formatMoney(venue.rentalCost)}</strong>
              </div>
            </div>
            <button
              type="button"
              className="mt-3 w-full py-1.5 rounded-lg text-[9px] font-bold bg-[#241744] hover:bg-yellow-500 hover:text-black text-purple-200 border border-purple-500/40 transition-colors text-center"
            >
              Book Venue →
            </button>
          </div>
        ))}
      </div>

      {/* ── LEVEL 2: PLAN CONCERT MODAL ────────────────────────────────── */}
      {showConcertModal && (
        <Modal
          isOpen={showConcertModal}
          onClose={() => setShowConcertModal(false)}
          title="PLAN ARENA CONCERT"
          subtitle="Configure artist, venue lease, ticket price, and marketing"
          icon="🏟️"
          size="xl"
          borderColor="border-yellow-500"
          footer={
            <div className="flex justify-between items-center gap-3">
              <div className="text-[10px]">
                <span>Est. Net: </span>
                <strong className={forecastNet >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                  {formatMoney(forecastNet)}
                </strong>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowConcertModal(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs bg-[#241744] text-purple-200 border border-purple-500/40"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleHoldConcert}
                  disabled={state.money < forecastExpenses}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold bg-yellow-500 hover:bg-yellow-400 disabled:bg-gray-800 disabled:text-gray-500 text-black border border-yellow-300 shadow"
                >
                  Hold Concert ({formatMoney(forecastExpenses)})
                </button>
              </div>
            </div>
          }
        >
          <div className="space-y-3.5 text-xs">
            {/* Target Select */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-purple-200 mb-1">PERFORMER TYPE</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('group')
                      setTargetId(groupOptions[0]?.id || '')
                    }}
                    className={`py-1.5 px-3 rounded-lg border text-xs ${
                      targetType === 'group'
                        ? 'bg-pink-900/70 border-pink-400 text-white font-bold'
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
                    className={`py-1.5 px-3 rounded-lg border text-xs ${
                      targetType === 'solo'
                        ? 'bg-pink-900/70 border-pink-400 text-white font-bold'
                        : 'bg-[#241744] border-[#442f70] text-purple-300'
                    }`}
                  >
                    Soloist
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-purple-200 mb-1">HEADLINING ARTIST</label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full bg-[#120b24] border border-[#52338c] rounded-lg px-2.5 py-1.5 text-white text-xs"
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
              <label className="block text-[10px] text-purple-200 mb-1.5">SELECT VENUE</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CONCERT_VENUES.map(venue => {
                  const isSelected = selectedVenueId === venue.id
                  return (
                    <div
                      key={venue.id}
                      onClick={() => setSelectedVenueId(venue.id)}
                      className={`p-2 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-yellow-950/70 border-yellow-400 shadow'
                          : 'bg-[#241744] border-[#442f70] hover:border-purple-400'
                      }`}
                    >
                      <strong className="text-[10px] text-white block truncate">{venue.name}</strong>
                      <span className="text-[8px] text-yellow-300">{venue.capacity.toLocaleString()} seats</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#120b24] p-3 rounded-xl border border-[#3b2462]">
              <div>
                <div className="flex justify-between text-[10px] text-purple-200 mb-1">
                  <span>Ticket Price:</span>
                  <strong className="text-yellow-300">{formatMoney(ticketPrice)}</strong>
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
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-purple-200 mb-1">
                  <span>Marketing:</span>
                  <strong className="text-emerald-400">{formatMoney(marketingBudget)}</strong>
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
              </div>
            </div>

            {/* Forecast Summary */}
            <div className="bg-[#120b24] p-3 rounded-xl border border-[#3b2462] space-y-1.5 text-[10px]">
              <div className="flex justify-between text-purple-300">
                <span>Estimated Turnout:</span>
                <strong className={forecast.isSoldOut ? 'text-emerald-400' : 'text-white'}>
                  {forecast.ticketsSold.toLocaleString()} / {selectedVenue.capacity.toLocaleString()} ({forecast.attendanceRate}%) {forecast.isSoldOut ? '🔥 SOLD OUT!' : ''}
                </strong>
              </div>
              <div className="flex justify-between text-purple-300">
                <span>Est. Gross Revenue:</span>
                <strong className="text-white">{formatMoney(forecastGross)}</strong>
              </div>
              <div className="flex justify-between text-purple-300">
                <span>Venue Lease & Promotion:</span>
                <strong className="text-red-400">{formatMoney(forecastExpenses)}</strong>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── LEVEL 2: WORLD TOUR MODAL ──────────────────────────────────── */}
      {showTourModal && (
        <Modal
          isOpen={showTourModal}
          onClose={() => setShowTourModal(false)}
          title="LAUNCH MULTI-CITY WORLD TOUR"
          subtitle="International stadium tour across Asia, Americas, and Europe"
          icon="✈️"
          size="lg"
          borderColor="border-pink-500"
          footer={
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowTourModal(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs bg-[#241744] text-purple-200 border border-purple-500/40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLaunchTour}
                disabled={state.money < (tourStops * 40_000_000) || groupOptions.length === 0}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-pink-600 hover:bg-pink-500 text-white border border-pink-400 shadow"
              >
                Launch Tour ({formatMoney(tourStops * 40_000_000)})
              </button>
            </div>
          }
        >
          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[10px] text-purple-200 mb-1">TOUR TITLE</label>
              <input
                type="text"
                value={tourTitle}
                onChange={(e) => setTourTitle(e.target.value)}
                placeholder="WORLD TOUR 2026"
                className="w-full bg-[#120b24] border border-[#52338c] rounded-lg px-2.5 py-1.5 text-white text-xs"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-purple-200 mb-1">HEADLINE GROUP</label>
                <select
                  value={tourGroupName}
                  onChange={(e) => setTourGroupName(e.target.value)}
                  className="w-full bg-[#120b24] border border-[#52338c] rounded-lg px-2.5 py-1.5 text-white text-xs"
                >
                  {groupOptions.map(g => (
                    <option key={g.id} value={g.id}>{g.name} (Fanbase: {g.fanbase?.toLocaleString()})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] text-purple-200 mb-1">TOUR STOPS</label>
                <select
                  value={tourStops}
                  onChange={(e) => setTourStops(Number(e.target.value))}
                  className="w-full bg-[#120b24] border border-[#52338c] rounded-lg px-2.5 py-1.5 text-white text-xs"
                >
                  <option value={3}>3 Cities (Asia Arena Leg)</option>
                  <option value={5}>5 Cities (Worldwide Stadium Leg)</option>
                </select>
              </div>
            </div>

            <div className="bg-[#120b24] p-3 rounded-xl border border-[#3b2462] text-[10px] text-purple-300">
              <div>Logistics & Arena Leases: <strong className="text-yellow-400">{formatMoney(tourStops * 40_000_000)}</strong></div>
              <p className="text-[9px] text-purple-400 mt-1">Multi-city tour generates tremendous fanbase expansion and merchandise revenue.</p>
            </div>
          </div>
        </Modal>
      )}

      {/* ── LEVEL 2: GRAND ALL-STAR FESTIVAL MODAL ─────────────────────── */}
      {showGrandModal && (
        <Modal
          isOpen={showGrandModal}
          onClose={() => setShowGrandModal(false)}
          title={`${state.companyName?.toUpperCase()} ALL-STAR FESTIVAL`}
          subtitle="Monumental 50,000-seat Olympic Stadium showcase"
          icon="👑"
          size="md"
          borderColor="border-yellow-500"
          footer={
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowGrandModal(false)}
                className="px-3.5 py-1.5 rounded-lg text-xs bg-[#241744] text-purple-200 border border-purple-500/40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleGrandConcert}
                disabled={state.money < 120_000_000 || (state.idols?.length || 0) === 0}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-yellow-500 hover:bg-yellow-400 text-black border border-yellow-300 shadow"
              >
                Headline Festival (₩120M)
              </button>
            </div>
          }
        >
          <div className="space-y-3 text-xs leading-relaxed text-purple-200">
            <p>
              Unite all trainees, boy groups, girl groups, and soloists onto one monumental 50,000-capacity Olympic Stadium stage. Drives massive brand prestige and company reputation.
            </p>
            <div className="bg-[#120b24] p-3 rounded-xl border border-[#3b2462] space-y-1 text-[10px]">
              <div>• Total Participating Roster: <strong className="text-white">{state.idols?.length || 0} Idols</strong></div>
              <div>• Staging & Broadcast Budget: <strong className="text-yellow-300">₩120,000,000</strong></div>
              <div>• Venue: <strong className="text-pink-300">Olympic World Stadium (50,000 seats)</strong></div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
