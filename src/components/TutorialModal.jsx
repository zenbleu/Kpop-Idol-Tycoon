import React, { useState } from 'react'
import { playSfx } from '../game/audio.js'

export default function TutorialModal({ onClose }) {
  const [page, setPage] = useState(0)

  const pages = [
    {
      title: 'WELCOME TO K-POP IDOL TYCOON!',
      icon: '✨',
      content: (
        <div className="space-y-3 text-xs font-pixel text-purple-200 leading-relaxed">
          <p>
            You are the Chief Executive Producer of your own entertainment agency. Your mission: scout trainee talent, debut chart-topping Boy & Girl groups, cultivate breakout soloists, and rise from a humble local company to a worldwide musical empire!
          </p>
          <div className="bg-[#120b24] p-3 rounded-xl border border-[#3b2462] space-y-1.5 text-[10px]">
            <p>• Starting Funds: <span className="text-yellow-300 font-bold">₩100,000,000</span> & <span className="text-pink-300 font-bold">100 Rubies 💎</span></p>
            <p>• Company Tier: <span className="text-white font-bold">Tier F (Local)</span></p>
            <p>• 100% Offline Game with LocalStorage multi-slot auto-saves</p>
          </div>
        </div>
      ),
    },
    {
      title: 'SCOUTING & IDOL TIERS',
      icon: '🎤',
      content: (
        <div className="space-y-3 text-xs font-pixel text-purple-200 leading-relaxed">
          <p>
            Visit the <span className="text-yellow-300">Auditions</span> division to discover new prospects.
          </p>
          <div className="space-y-1.5 bg-[#120b24] p-3 rounded-xl border border-[#3b2462] text-[10px]">
            <p>• <span className="text-white font-bold">Money Auditions:</span> Street Castings (Free), Domestic, International, and Global Worldwide scouts.</p>
            <p>• <span className="text-pink-300 font-bold">Ruby Auditions:</span> Fast-track premier trainee signings with guaranteed minimum tiers.</p>
            <p>• <span className="text-yellow-300 font-bold">Exact Tier Thresholds:</span> F (0–9), D (10–19), C (20–39), B (40–69), A (70–87), S (88–94), P (95–100).</p>
          </div>
        </div>
      ),
    },
    {
      title: 'GROUPS, ROLES & THE MAKNAE',
      icon: '👥',
      content: (
        <div className="space-y-3 text-xs font-pixel text-purple-200 leading-relaxed">
          <p>
            Form distinct <span className="text-blue-300">Boy Groups</span> and <span className="text-pink-300">Girl Groups</span> of up to 10 members each (expandable up to 5 total active groups).
          </p>
          <div className="space-y-1.5 bg-[#120b24] p-3 rounded-xl border border-[#3b2462] text-[10px]">
            <p>• <span className="text-pink-300 font-bold">Automatic Maknae:</span> The youngest member is automatically detected and designated as the official Maknae.</p>
            <p>• <span className="text-yellow-300 font-bold">Stage Roles:</span> Assign Leader, Main Vocal, Lead Dancer, Rapper, Visual, and Center.</p>
            <p>• <span className="text-red-300 font-bold">6-Month Cooldown:</span> Removing an idol from a group triggers a mandatory 26-week cooldown before they can join any group.</p>
            <p>• <span className="text-emerald-300 font-bold">Income Split:</span> Balance company profits vs artist payout. Locked during active production or sales.</p>
          </div>
        </div>
      ),
    },
    {
      title: 'PRODUCTIONS & 10-MIN SALES',
      icon: '💿',
      content: (
        <div className="space-y-3 text-xs font-pixel text-purple-200 leading-relaxed">
          <p>
            Produce <span className="text-white font-bold">Singles (1wk)</span>, <span className="text-white font-bold">EPs (3wks)</span>, and <span className="text-white font-bold">Full Albums (4wks)</span>.
          </p>
          <div className="space-y-1.5 bg-[#120b24] p-3 rounded-xl border border-[#3b2462] text-[10px]">
            <p>• <span className="text-yellow-300 font-bold">Cultural Trends:</span> Match active Genre & Concept to trigger a +30% Acclaim & Sales boost!</p>
            <p>• <span className="text-emerald-300 font-bold">10-Minute Sales Window:</span> When complete, album enters an active 10-minute real-world sales window with live revenue updates.</p>
            <p>• <span className="text-cyan-300 font-bold">Offline Progress:</span> Even when closed, returning to the game instantly calculates offline sales progress!</p>
          </div>
        </div>
      ),
    },
    {
      title: 'SCHEDULES, CONCERTS & BEYOND',
      icon: '🏟️',
      content: (
        <div className="space-y-3 text-xs font-pixel text-purple-200 leading-relaxed">
          <p>
            Coordinate a 7-day weekly itinerary (Monday through Sunday) with multiple activities per day.
          </p>
          <div className="space-y-1.5 bg-[#120b24] p-3 rounded-xl border border-[#3b2462] text-[10px]">
            <p>• <span className="text-white font-bold">Concerts & Tours:</span> Fill Small Art Halls, Metropolitan Theaters, Olympic Arenas, and 50,000-seat Stadiums.</p>
            <p>• <span className="text-pink-300 font-bold">Wardrobe Attire:</span> Unlock stage outfits (Pure, Cute, Chic, Sexy) in Tiers F–A (Won) and S–P (Rubies).</p>
            <p>• <span className="text-yellow-300 font-bold">Upgrades Tree:</span> Expand headquarters, audition candidate capacity, unlock Main 2 and Main 3 Practice Studios.</p>
          </div>
        </div>
      ),
    },
  ]

  const current = pages[page]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
      <div className="bg-[#1c1236] border-2 border-pink-500 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-[#3d276b] mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{current.icon}</span>
            <h3 className="text-sm font-bold text-yellow-300 font-pixel">
              {current.title}
            </h3>
          </div>
          <button
            onClick={() => {
              playSfx('click')
              onClose()
            }}
            className="text-purple-400 hover:text-white font-pixel text-sm"
          >
            ✕
          </button>
        </div>

        <div className="min-h-[190px]">
          {current.content}
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between pt-4 border-t border-[#3d276b] mt-4">
          <div className="flex gap-1.5">
            {pages.map((_, i) => (
              <div
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  page === i ? 'bg-yellow-400 scale-110' : 'bg-[#3b2462]'
                }`}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {page > 0 && (
              <button
                onClick={() => {
                  playSfx('click')
                  setPage(p => p - 1)
                }}
                className="btn-secondary text-xs font-pixel py-2 px-3"
              >
                ← PREV
              </button>
            )}

            {page < pages.length - 1 ? (
              <button
                onClick={() => {
                  playSfx('click')
                  setPage(p => p + 1)
                }}
                className="btn-primary text-xs font-pixel py-2 px-4"
              >
                NEXT →
              </button>
            ) : (
              <button
                onClick={() => {
                  playSfx('cheer')
                  onClose()
                }}
                className="btn-primary text-xs font-pixel py-2 px-4"
              >
                LET'S PRODUCE! 🚀
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
