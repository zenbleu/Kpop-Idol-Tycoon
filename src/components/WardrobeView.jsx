import React, { useState } from 'react'
import { useGame, ACTION } from '../game/state.jsx'
import { WARDROBE_ITEMS, formatMoney } from '../game/balance.js'
import { playSfx } from '../game/audio.js'

export default function WardrobeView() {
  const { state, dispatch } = useGame()

  const [conceptFilter, setConceptFilter] = useState('ALL')
  const [tierFilter, setTierFilter] = useState('ALL') // 'ALL', 'MONEY', 'RUBIES'

  // Equip modal state
  const [equipItem, setEquipItem] = useState(null)
  const [targetType, setTargetType] = useState('group') // 'group' or 'idol'
  const [targetId, setTargetId] = useState(state.groups[0]?.id || state.idols[0]?.id || '')

  const ownedIds = state.wardrobeInventory || []

  const filteredItems = WARDROBE_ITEMS.filter(item => {
    if (conceptFilter !== 'ALL' && item.concept !== conceptFilter) return false
    if (tierFilter === 'MONEY' && item.priceType !== 'money') return false
    if (tierFilter === 'RUBIES' && item.priceType !== 'rubies') return false
    return true
  })

  const handleBuy = (item) => {
    if (ownedIds.includes(item.id)) return

    if (item.priceType === 'rubies') {
      if (state.rubies < item.price) {
        dispatch({
          type: ACTION.PUSH_TOAST,
          toast: { message: `Insufficient Rubies! (Requires ${item.price} 💎)`, variant: 'red' },
        })
        playSfx('buzz')
        return
      }
    } else {
      if (state.money < item.price) {
        dispatch({
          type: ACTION.PUSH_TOAST,
          toast: { message: `Insufficient funds! (Requires ${formatMoney(item.price)})`, variant: 'red' },
        })
        playSfx('buzz')
        return
      }
    }

    playSfx('coin')
    dispatch({
      type: ACTION.BUY_WARDROBE,
      item,
    })
  }

  const handleOpenEquipModal = (item) => {
    setEquipItem(item)
    setTargetType(state.groups.length > 0 ? 'group' : 'idol')
    setTargetId(state.groups[0]?.id || state.idols[0]?.id || '')
    playSfx('click')
  }

  const handleConfirmEquip = () => {
    if (!equipItem || !targetId) return

    dispatch({
      type: ACTION.EQUIP_WARDROBE,
      targetType,
      targetId,
      clothingId: equipItem.id,
    })
    playSfx('coin')
    dispatch({
      type: ACTION.PUSH_TOAST,
      toast: { message: `Equipped ${equipItem.name}!`, variant: 'gold' },
    })
    setEquipItem(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1e1338] border-2 border-[#543b8a] p-4 rounded-xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-300 to-yellow-300 font-pixel">
            CONCEPT WARDROBE & STAGE ATTIRE
          </h2>
          <p className="text-xs text-purple-200 mt-1 font-pixel leading-relaxed">
            Acquire bespoke stage outfits. Tiers F–A unlock with Korean Won (₩); mythic Tiers S & P unlock with Rubies (💎). Outfits permanently boost stage visuals and album score.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-pixel text-yellow-300 bg-[#2d1b4e] px-3 py-2 rounded-lg border border-yellow-500/30">
            Wardrobe: {ownedIds.length} / {WARDROBE_ITEMS.length} Unlocked
          </span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#1e1338] p-3 rounded-xl border border-[#442f70]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-pixel text-purple-300 mr-1">Concept:</span>
          {['ALL', 'Pure', 'Cute', 'Chic', 'Sexy'].map(c => (
            <button
              key={c}
              onClick={() => setConceptFilter(c)}
              className={`px-3 py-1 rounded-lg text-xs font-pixel border transition-all ${
                conceptFilter === c
                  ? 'bg-pink-600 border-pink-400 text-white shadow-sm'
                  : 'bg-[#241744] border-[#442f70] text-purple-300 hover:border-pink-400'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-pixel text-purple-300 mr-1">Currency:</span>
          <button
            onClick={() => setTierFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg text-xs font-pixel border ${
              tierFilter === 'ALL' ? 'bg-yellow-500 text-black border-yellow-300 font-bold' : 'bg-[#241744] border-[#442f70] text-purple-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setTierFilter('MONEY')}
            className={`px-2.5 py-1 rounded-lg text-xs font-pixel border ${
              tierFilter === 'MONEY' ? 'bg-yellow-500 text-black border-yellow-300 font-bold' : 'bg-[#241744] border-[#442f70] text-purple-300'
            }`}
          >
            ₩ Money (F-A)
          </button>
          <button
            onClick={() => setTierFilter('RUBIES')}
            className={`px-2.5 py-1 rounded-lg text-xs font-pixel border ${
              tierFilter === 'RUBIES' ? 'bg-yellow-500 text-black border-yellow-300 font-bold' : 'bg-[#241744] border-[#442f70] text-purple-300'
            }`}
          >
            💎 Rubies (S-P)
          </button>
        </div>
      </div>

      {/* Wardrobe Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredItems.map(item => {
          const isOwned = ownedIds.includes(item.id)
          const isRubyItem = item.priceType === 'rubies'

          return (
            <div
              key={item.id}
              className={`bg-[#1e1338] border-2 rounded-2xl p-4 shadow-xl flex flex-col justify-between transition-all ${
                isOwned
                  ? 'border-emerald-500/80 shadow-emerald-500/10'
                  : isRubyItem
                  ? 'border-pink-500/80'
                  : 'border-[#543b8a] hover:border-purple-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-pixel px-2 py-0.5 rounded border ${
                    item.tier === 'P' || item.tier === 'S'
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-pink-400 shadow-sm'
                      : 'bg-[#241744] text-yellow-300 border-yellow-500/40'
                  }`}>
                    Tier {item.tier}
                  </span>

                  <span className="text-[10px] font-pixel text-purple-300 bg-[#120b24] px-2 py-0.5 rounded">
                    {item.concept}
                  </span>
                </div>

                <div className="text-3xl my-2 text-center">
                  {item.concept === 'Pure' ? '🤍' : item.concept === 'Cute' ? '🎀' : item.concept === 'Chic' ? '🖤' : '💋'}
                </div>

                <h3 className="text-xs font-bold text-white font-pixel text-center min-h-[32px] flex items-center justify-center">
                  {item.name}
                </h3>

                <div className="mt-3 space-y-1 bg-[#120b24] p-2.5 rounded-xl border border-[#3b2462] text-[10px] font-pixel">
                  <div className="flex justify-between text-purple-300">
                    <span>Visual Boost:</span>
                    <span className="text-pink-400 font-bold">+{item.visualBonus}</span>
                  </div>
                  <div className="flex justify-between text-purple-300">
                    <span>Album Quality:</span>
                    <span className="text-emerald-400 font-bold">+{item.qualityBonus}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#37235a]">
                {isOwned ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleOpenEquipModal(item)}
                      className="w-full btn-secondary text-[10px] font-pixel py-2"
                    >
                      Equip Outfit
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleBuy(item)}
                    className={`w-full text-[10px] font-pixel py-2 rounded-lg border transition-all ${
                      isRubyItem
                        ? 'bg-pink-600 hover:bg-pink-500 text-white border-pink-400 shadow-md'
                        : 'bg-yellow-500 hover:bg-yellow-400 text-black border-yellow-300 font-bold shadow-md'
                    }`}
                  >
                    Buy: {isRubyItem ? `${item.price} 💎` : formatMoney(item.price)}
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* EQUIP TARGET MODAL */}
      {equipItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1c1236] border-2 border-[#5d3b9e] rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#3d276b] mb-4">
              <h3 className="text-sm font-bold text-yellow-300 font-pixel">
                EQUIP: {equipItem.name}
              </h3>
              <button
                onClick={() => setEquipItem(null)}
                className="text-purple-400 hover:text-white font-pixel text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-purple-200 font-pixel mb-4 leading-relaxed">
              Equip this outfit to a group or individual idol to apply visual and performance score enhancements.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-pixel text-purple-200 mb-1">
                  EQUIP TARGET
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('group')
                      setTargetId(state.groups[0]?.id || '')
                    }}
                    className={`py-2 rounded-lg border text-xs font-pixel ${
                      targetType === 'group' ? 'bg-pink-900/70 border-pink-400 text-white' : 'bg-[#241744] border-[#442f70] text-purple-300'
                    }`}
                  >
                    Entire Group
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTargetType('idol')
                      setTargetId(state.idols[0]?.id || '')
                    }}
                    className={`py-2 rounded-lg border text-xs font-pixel ${
                      targetType === 'idol' ? 'bg-pink-900/70 border-pink-400 text-white' : 'bg-[#241744] border-[#442f70] text-purple-300'
                    }`}
                  >
                    Individual Idol
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-pixel text-purple-200 mb-1">
                  SELECT {targetType.toUpperCase()}
                </label>
                {targetType === 'group' ? (
                  <select
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    className="w-full bg-[#120b24] border border-[#52338c] rounded-lg px-3 py-2 text-white font-pixel text-xs"
                  >
                    {state.groups?.map(g => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                ) : (
                  <select
                    value={targetId}
                    onChange={(e) => setTargetId(e.target.value)}
                    className="w-full bg-[#120b24] border border-[#52338c] rounded-lg px-3 py-2 text-white font-pixel text-xs"
                  >
                    {state.idols?.map(i => (
                      <option key={i.id} value={i.id}>{i.stageName || i.name}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#3d276b] mt-5">
              <button
                onClick={() => setEquipItem(null)}
                className="btn-secondary text-xs font-pixel py-2 px-4"
              >
                CANCEL
              </button>
              <button
                onClick={handleConfirmEquip}
                className="btn-primary text-xs font-pixel py-2 px-5"
              >
                CONFIRM EQUIP
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
