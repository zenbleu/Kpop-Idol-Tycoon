/**
 * CommercialHub.jsx — Couple (CP) Merchandising, OSTs & Fan-Meetings Hub
 *
 * Implements 1.B:
 * - Drama Spin-Offs (OSTs & Limited Photobook drops)
 * - Couple (CP) World Fan-Meeting Tours & Luxury Dual Brand CF Deals
 * - Active digital streaming royalties tracker
 * - Lifetime commercial records & box office earnings
 */
import React, { useState, useMemo } from 'react'
import { useGame } from '../game/state.jsx'
import {
  COMMERCIAL_TYPES,
  canLaunchCommercial,
  calculateCommercialPreview,
  launchCommercialVenture,
} from '../game/commercial.js'
import { fmtMoney, fmtPop } from '../game/ranking.js'
import { getChem, bondKey } from '../game/chemistry.js'
import { actorDisplayName } from '../game/actors.js'
import { ActorPortrait } from './ActorRoster.jsx'
import { SFX } from '../game/audio.js'

export default function CommercialHub({ initialProdId = null }) {
  const { state, dispatch } = useGame()
  const [activeTab, setActiveTab] = useState('spinoffs') // 'spinoffs' | 'couples' | 'royalties' | 'records'
  const [selectedProdId, setSelectedProdId] = useState(initialProdId)
  const [confirmModal, setConfirmModal] = useState(null) // { type, prod, pair, preview }

  const activeVentures = useMemo(() => state.commercialVentures ?? [], [state.commercialVentures])
  const commercialHistory = useMemo(() => state.commercialHistory ?? [], [state.commercialHistory])

  // Total weekly royalties
  const weeklyRoyaltiesTotal = useMemo(() => {
    return activeVentures.reduce((sum, v) => sum + (v.weeklyRoyalty ?? 0), 0)
  }, [activeVentures])

  // Total lifetime commercial revenue
  const lifetimeCommercialRevenue = useMemo(() => {
    const fromHistory = commercialHistory.reduce((sum, h) => sum + (h.revenue ?? 0), 0)
    const fromActive = activeVentures.reduce((sum, v) => sum + (v.totalEarned ?? 0), 0)
    return fromHistory + fromActive
  }, [commercialHistory, activeVentures])

  // Completed productions available for spin-offs
  const completedProds = useMemo(() => {
    return [...(state.history ?? [])].sort((a, b) => (b.weekCompleted ?? 0) - (a.weekCompleted ?? 0))
  }, [state.history])

  // Pairs eligible for couple commercial ventures (Fixed CPs first, then pairs with chemistry >= 50)
  const couplePairs = useMemo(() => {
    const pairs = []
    const seen = new Set()

    // 1. Fixed CPs
    for (const [idA, idB] of (state.fixedCPs ?? [])) {
      const a = state.actors.find(act => act.id === idA)
      const b = state.actors.find(act => act.id === idB)
      if (a?.signed && b?.signed) {
        const key = bondKey(idA, idB)
        seen.add(key)
        const nameKey = (state.fixedCPNames ?? {})[key]
        pairs.push({
          actorA: a,
          actorB: b,
          isFixedCP: true,
          cpName: nameKey || `${a.name} & ${b.name}`,
          chem: getChem(a, b.id),
        })
      }
    }

    // 2. High chemistry signed pairs from roster
    const signed = state.actors.filter(a => a.signed)
    for (let i = 0; i < signed.length; i++) {
      for (let j = i + 1; j < signed.length; j++) {
        const a = signed[i]
        const b = signed[j]
        const key = bondKey(a.id, b.id)
        if (!seen.has(key)) {
          const chem = getChem(a, b.id)
          if (chem >= 50) {
            seen.add(key)
            pairs.push({
              actorA: a,
              actorB: b,
              isFixedCP: false,
              cpName: `${a.name} & ${b.name}`,
              chem,
            })
          }
        }
      }
    }

    return pairs.sort((x, y) => (y.isFixedCP ? 1 : 0) - (x.isFixedCP ? 1 : 0) || y.chem - x.chem)
  }, [state.fixedCPs, state.fixedCPNames, state.actors])

  function handleOpenConfirm(typeKey, prod = null, pair = null) {
    SFX.click()
    let actorA = null
    let actorB = null

    if (pair) {
      actorA = pair.actorA
      actorB = pair.actorB
    } else if (prod) {
      const leads = (prod.leadIds ?? []).map(id => state.actors.find(a => a.id === id)).filter(Boolean)
      if (leads.length >= 2) {
        actorA = leads[0]
        actorB = leads[1]
      } else {
        const cast = (prod.castIds ?? []).map(id => state.actors.find(a => a.id === id)).filter(Boolean)
        actorA = cast[0]
        actorB = cast[1]
      }
    }

    if (!actorA || !actorB) return

    const preview = calculateCommercialPreview(typeKey, { prod, actorA, actorB, state })
    const check = canLaunchCommercial(typeKey, { prod, pair: [actorA.id, actorB.id], state })

    setConfirmModal({
      typeKey,
      prod,
      actorA,
      actorB,
      preview,
      check,
    })
  }

  function handleExecuteVenture() {
    if (!confirmModal) return
    const { typeKey, prod, actorA, actorB } = confirmModal
    const success = launchCommercialVenture(typeKey, {
      prod,
      pair: [actorA.id, actorB.id],
      state,
      dispatch,
    })
    if (success) {
      setConfirmModal(null)
    }
  }

  return (
    <div style={styles.container}>
      {/* ── Top Header Banner ── */}
      <div className="panel" style={styles.heroPanel}>
        <div style={styles.heroTitleRow}>
          <div>
            <div className="panel-title" style={{ fontSize: 13, color: 'var(--pink)', marginBottom: 4 }}>
              🛍️ CP MERCHANDISING, OSTs & FAN TOURS
            </div>
            <div style={styles.heroSubtitle}>
              Monetize hit dramas and official couples through digital soundtracks, photobooks, and sold-out world fan-meeting stages!
            </div>
          </div>
          <div style={styles.kpiContainer}>
            <div style={styles.kpiCard}>
              <div style={styles.kpiLabel}>ROYALTIES INFLOW</div>
              <div style={{ ...styles.kpiVal, color: 'var(--green)' }}>+{fmtMoney(weeklyRoyaltiesTotal)}/wk</div>
            </div>
            <div style={styles.kpiCard}>
              <div style={styles.kpiLabel}>LIFETIME COMMERCIAL</div>
              <div style={{ ...styles.kpiVal, color: 'var(--gold)' }}>{fmtMoney(lifetimeCommercialRevenue)}</div>
            </div>
          </div>
        </div>

        {/* ── Tab Switcher ── */}
        <div style={styles.tabBar}>
          <button
            type="button"
            className={activeTab === 'spinoffs' ? 'btn-primary' : ''}
            onClick={() => { SFX.click(); setActiveTab('spinoffs') }}
            style={{ ...styles.tabBtn, ...(activeTab === 'spinoffs' ? styles.tabBtnActive : {}) }}
          >
            🎬 Drama Spin-Offs ({completedProds.length})
          </button>
          <button
            type="button"
            className={activeTab === 'couples' ? 'btn-primary' : ''}
            onClick={() => { SFX.click(); setActiveTab('couples') }}
            style={{ ...styles.tabBtn, ...(activeTab === 'couples' ? styles.tabBtnActive : {}) }}
          >
            💕 Couple Tours & CFs ({couplePairs.length})
          </button>
          <button
            type="button"
            className={activeTab === 'royalties' ? 'btn-primary' : ''}
            onClick={() => { SFX.click(); setActiveTab('royalties') }}
            style={{ ...styles.tabBtn, ...(activeTab === 'royalties' ? styles.tabBtnActive : {}) }}
          >
            📻 Active Royalties ({activeVentures.length})
          </button>
          <button
            type="button"
            className={activeTab === 'records' ? 'btn-primary' : ''}
            onClick={() => { SFX.click(); setActiveTab('records') }}
            style={{ ...styles.tabBtn, ...(activeTab === 'records' ? styles.tabBtnActive : {}) }}
          >
            📜 Commercial History ({commercialHistory.length})
          </button>
        </div>
      </div>

      {/* ── TAB 1: DRAMA SPIN-OFFS (OSTs & Merch) ── */}
      {activeTab === 'spinoffs' && (
        <div style={styles.contentSection}>
          {completedProds.length === 0 ? (
            <div className="panel" style={styles.emptyState}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>🎬</div>
              <div style={{ fontSize: 9, color: 'var(--white)', marginBottom: 4 }}>NO COMPLETED DRAMAS YET</div>
              <div style={{ fontSize: 7, color: 'var(--lav)', maxWidth: 400, margin: '0 auto' }}>
                Complete and broadcast your first BL production to unlock OST music video recordings and collector photobook merchandise drops!
              </div>
            </div>
          ) : (
            <div style={styles.cardsGrid}>
              {completedProds.map(prod => {
                const leads = (prod.leadIds ?? []).map(id => state.actors.find(a => a.id === id)).filter(Boolean)
                const leadA = leads[0] || state.actors.find(a => a.id === prod.castIds?.[0])
                const leadB = leads[1] || state.actors.find(a => a.id === prod.castIds?.[1])

                const ostCheck = canLaunchCommercial('ost', { prod, state })
                const merchCheck = canLaunchCommercial('merch', { prod, state })
                const tourCheck = canLaunchCommercial('fan_meeting', { prod, state })

                const existingOST = activeVentures.find(v => v.type === 'ost' && v.prodId === prod.id)
                const completedOST = commercialHistory.find(v => v.type === 'ost' && v.prodId === prod.id)

                const isFixedCP = leadA && leadB && (state.fixedCPs ?? []).some(([x, y]) =>
                  (x === leadA.id && y === leadB.id) || (x === leadB.id && y === leadA.id)
                )

                return (
                  <div key={prod.id ?? `${prod.title}-${prod.weekCompleted}`} className="panel" style={styles.prodCard}>
                    {/* Header */}
                    <div style={styles.prodCardHeader}>
                      <div>
                        <div style={styles.prodCardTitle}>
                          🎬 {prod.title}
                          {isFixedCP && (
                            <span style={styles.fixedCpBadge}>💕 OFFICIAL CP</span>
                          )}
                        </div>
                        <div style={styles.prodCardMeta}>
                          Grade <strong style={{ color: 'var(--gold)' }}>{prod.grade ?? 'B'}</strong> · Score {prod.score ?? 0}/100 · Completed Wk {prod.weekCompleted ?? '—'}
                        </div>
                      </div>
                      <div style={styles.portraitPair}>
                        {leadA && <ActorPortrait actor={leadA} size={36} />}
                        {leadB && <ActorPortrait actor={leadB} size={36} />}
                      </div>
                    </div>

                    {/* Leads Display */}
                    <div style={styles.leadsTag}>
                      Starring: <strong>{leadA ? actorDisplayName(leadA) : 'Lead 1'}</strong> & <strong>{leadB ? actorDisplayName(leadB) : 'Lead 2'}</strong>
                    </div>

                    {/* Action Buttons Grid */}
                    <div style={styles.actionRow}>
                      {/* 1. OST Single & MV */}
                      <div style={styles.actionCol}>
                        <div style={styles.actionTitle}>🎵 OST SINGLE & MV</div>
                        <div style={styles.actionDesc}>8 weeks digital music royalties + fame boost</div>
                        {existingOST ? (
                          <div style={styles.statusActiveTag}>
                            📻 AIRING ({existingOST.weeksRemaining}w left · +{fmtMoney(existingOST.weeklyRoyalty)}/wk)
                          </div>
                        ) : completedOST ? (
                          <div style={styles.statusDoneTag}>
                            ✅ ARCHIVED ({fmtMoney(completedOST.revenue)} earned)
                          </div>
                        ) : (
                          <button
                            type="button"
                            className={ostCheck.eligible ? 'btn-primary' : ''}
                            disabled={!ostCheck.eligible}
                            onClick={() => handleOpenConfirm('ost', prod)}
                            style={styles.launchBtn}
                            title={ostCheck.reason}
                          >
                            {ostCheck.eligible ? `Record OST (${fmtMoney(COMMERCIAL_TYPES.ost.cost)})` : ostCheck.reason}
                          </button>
                        )}
                      </div>

                      {/* 2. Photobook & Photocards */}
                      <div style={styles.actionCol}>
                        <div style={styles.actionTitle}>📸 PHOTOBOOK DROP</div>
                        <div style={styles.actionDesc}>Limited deluxe photobook, photocards & standees</div>
                        <button
                          type="button"
                          className={merchCheck.eligible ? 'btn-primary' : ''}
                          disabled={!merchCheck.eligible}
                          onClick={() => handleOpenConfirm('merch', prod)}
                          style={styles.launchBtn}
                          title={merchCheck.reason}
                        >
                          {merchCheck.eligible ? `Launch Merch (${fmtMoney(COMMERCIAL_TYPES.merch.cost)})` : merchCheck.reason}
                        </button>
                      </div>

                      {/* 3. World Fan-Meeting Tour */}
                      <div style={styles.actionCol}>
                        <div style={styles.actionTitle}>✈️ WORLD FAN-MEETING</div>
                        <div style={styles.actionDesc}>Concert tour & hi-touch stage across Asia</div>
                        <button
                          type="button"
                          className={tourCheck.eligible ? 'btn-primary' : ''}
                          disabled={!tourCheck.eligible}
                          onClick={() => handleOpenConfirm('fan_meeting', prod)}
                          style={styles.launchBtn}
                          title={tourCheck.reason}
                        >
                          {tourCheck.eligible ? `Book Tour (${fmtMoney(COMMERCIAL_TYPES.fan_meeting.cost)})` : tourCheck.reason}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: COUPLE TOURS & BRAND DEALS ── */}
      {activeTab === 'couples' && (
        <div style={styles.contentSection}>
          <div style={{ marginBottom: 10, fontSize: 7.5, color: 'var(--lav)' }}>
            Dual-star commercial ventures leverage the chemistry and fandom appeal of your top pairings. Fixed CPs receive massive 25%–35% bonus revenue and shipper engagement!
          </div>

          {couplePairs.length === 0 ? (
            <div className="panel" style={styles.emptyState}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>💕</div>
              <div style={{ fontSize: 9, color: 'var(--white)', marginBottom: 4 }}>NO COUPLES READY YET</div>
              <div style={{ fontSize: 7, color: 'var(--lav)', maxWidth: 420, margin: '0 auto' }}>
                Form an official Fixed CP from the Actor Profile screen or pair actors together in productions to build their chemistry to 50+!
              </div>
            </div>
          ) : (
            <div style={styles.cardsGrid}>
              {couplePairs.map(pair => {
                const { actorA, actorB, isFixedCP, cpName, chem } = pair
                const tourCheck = canLaunchCommercial('fan_meeting', { pair: [actorA.id, actorB.id], state })
                const endorseCheck = canLaunchCommercial('endorsement', { pair: [actorA.id, actorB.id], state })

                return (
                  <div key={bondKey(actorA.id, actorB.id)} className="panel" style={styles.coupleCard}>
                    {/* Header */}
                    <div style={styles.coupleCardHeader}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={styles.portraitPair}>
                          <ActorPortrait actor={actorA} size={42} />
                          <ActorPortrait actor={actorB} size={42} />
                        </div>
                        <div>
                          <div style={{ fontSize: 10, color: isFixedCP ? 'var(--pink)' : 'var(--white)', fontWeight: 'bold' }}>
                            {cpName}
                          </div>
                          <div style={{ fontSize: 7, color: 'var(--lav)', marginTop: 2 }}>
                            Chemistry: <strong style={{ color: chem >= 70 ? 'var(--pink)' : 'var(--green)' }}>{chem}/100</strong>
                            {isFixedCP && <span style={{ marginLeft: 6, color: 'var(--gold)' }}>★ FIXED CP</span>}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 7, color: 'var(--gray)' }}>Status</div>
                        <div style={{ fontSize: 7.5, color: 'var(--white)' }}>
                          {actorA.status} / {actorB.status}
                        </div>
                      </div>
                    </div>

                    {/* Dual Venture Actions */}
                    <div style={styles.coupleActions}>
                      {/* Fan-Meeting Tour */}
                      <div style={styles.coupleActionCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: 8, color: 'var(--gold)', fontWeight: 'bold' }}>✈️ WORLD FAN-MEETING TOUR</span>
                          <span style={{ fontSize: 7, color: 'var(--lav)' }}>Cost: {fmtMoney(COMMERCIAL_TYPES.fan_meeting.cost)}</span>
                        </div>
                        <div style={{ fontSize: 6.5, color: 'var(--gray)', marginBottom: 8, lineHeight: 1.4 }}>
                          Multi-city arena concerts. Massive ticket box office, +110 Fame, +8 Rep. (−8 Morale to leads).
                          {isFixedCP && ' 💕 +35% ticket bonus & +8 Chemistry boost!'}
                        </div>
                        <button
                          type="button"
                          className={tourCheck.eligible ? 'btn-primary' : ''}
                          disabled={!tourCheck.eligible}
                          onClick={() => handleOpenConfirm('fan_meeting', null, pair)}
                          style={styles.coupleLaunchBtn}
                        >
                          {tourCheck.eligible ? '✈️ Book Arena Fan-Meeting' : tourCheck.reason}
                        </button>
                      </div>

                      {/* Luxury Brand CF */}
                      <div style={styles.coupleActionCard}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontSize: 8, color: 'var(--pink)', fontWeight: 'bold' }}>💎 LUXURY BRAND DUAL CF</span>
                          <span style={{ fontSize: 7, color: 'var(--green)' }}>Cost: FREE (Sponsored)</span>
                        </div>
                        <div style={{ fontSize: 6.5, color: 'var(--gray)', marginBottom: 8, lineHeight: 1.4 }}>
                          Dual ambassador contract for high fashion or beauty. Instant sponsor payout, +45 Fame, +6 Rep.
                          {isFixedCP && ' 💕 Exclusive CP premium sponsor rate!'}
                        </div>
                        <button
                          type="button"
                          className={endorseCheck.eligible ? 'btn-primary' : ''}
                          disabled={!endorseCheck.eligible}
                          onClick={() => handleOpenConfirm('endorsement', null, pair)}
                          style={styles.coupleLaunchBtn}
                        >
                          {endorseCheck.eligible ? '💎 Sign Brand Endorsement' : endorseCheck.reason}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: ACTIVE ROYALTIES ── */}
      {activeTab === 'royalties' && (
        <div style={styles.contentSection}>
          <div className="panel">
            <div className="panel-title" style={{ color: 'var(--green)' }}>📻 DIGITAL SOUNDTRACK ROYALTIES STREAM</div>
            <div style={{ fontSize: 7, color: 'var(--lav)', marginBottom: 12 }}>
              Soundtracks broadcast over national streaming charts pay weekly royalties to your studio for 8 weeks after drama release.
            </div>

            {activeVentures.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>📻</div>
                <div style={{ fontSize: 8, color: 'var(--gray)' }}>No active soundtrack streams currently paying royalties.</div>
                <div style={{ fontSize: 7, color: 'var(--lav)', marginTop: 4 }}>
                  Release an OST Single & MV from the Drama Spin-offs tab to start streaming!
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {activeVentures.map(v => {
                  const pct = Math.round(((8 - v.weeksRemaining) / 8) * 100)
                  return (
                    <div key={v.id} style={styles.royaltyCard}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                        <div>
                          <div style={{ fontSize: 8.5, color: 'var(--white)', fontWeight: 'bold' }}>
                            🎵 {v.title}
                          </div>
                          <div style={{ fontSize: 7, color: 'var(--lav)', marginTop: 2 }}>
                            Singers: {v.pairNames} {v.isFixedCP && <span style={{ color: 'var(--pink)' }}>💕 (Fixed CP Bonus)</span>}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 9, color: 'var(--green)', fontWeight: 'bold' }}>
                            +{fmtMoney(v.weeklyRoyalty)}/wk
                          </div>
                          <div style={{ fontSize: 6.5, color: 'var(--lav)' }}>
                            {v.weeksRemaining} week{v.weeksRemaining === 1 ? '' : 's'} remaining
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div style={styles.progressBarBg}>
                        <div style={{ ...styles.progressBarFill, width: `${pct}%` }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 6.5, color: 'var(--gray)', marginTop: 4 }}>
                        <span>Week {8 - v.weeksRemaining} of 8</span>
                        <span>Total earned so far: <strong style={{ color: 'var(--gold)' }}>{fmtMoney(v.totalEarned ?? 0)}</strong></span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 4: COMMERCIAL LOG & RECORDS ── */}
      {activeTab === 'records' && (
        <div style={styles.contentSection}>
          <div className="panel">
            <div className="panel-title" style={{ color: 'var(--gold)' }}>📜 COMMERCIAL VENTURES ARCHIVE</div>
            <div style={{ fontSize: 7, color: 'var(--lav)', marginBottom: 12 }}>
              Permanent record of all soundtrack runs, collector photobook drops, fan-meeting tour box offices, and brand CFs.
            </div>

            {commercialHistory.length === 0 ? (
              <div style={styles.emptyState}>
                <div style={{ fontSize: 20, marginBottom: 6 }}>📜</div>
                <div style={{ fontSize: 8, color: 'var(--gray)' }}>No commercial ventures recorded yet.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {commercialHistory.map((rec, idx) => (
                  <div key={rec.id ?? idx} style={styles.recordRow}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 16 }}>
                        {rec.type === 'ost' ? '🎵' : rec.type === 'merch' ? '📸' : rec.type === 'fan_meeting' ? '✈️' : '💎'}
                      </span>
                      <div>
                        <div style={{ fontSize: 8, color: 'var(--white)', fontWeight: 'bold' }}>
                          {rec.title}
                        </div>
                        <div style={{ fontSize: 6.5, color: 'var(--lav)', marginTop: 2 }}>
                          {rec.pairNames} · Week {rec.week} {rec.isFixedCP && <span style={{ color: 'var(--pink)' }}>💕 Fixed CP</span>}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 8.5, color: 'var(--gold)', fontWeight: 'bold' }}>
                        +{fmtMoney(rec.revenue)}
                      </div>
                      <div style={{ fontSize: 6.5, color: (rec.netProfit ?? 0) >= 0 ? 'var(--green)' : 'var(--red)' }}>
                        Net: {fmtMoney(rec.netProfit ?? rec.revenue)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Confirmation & Preview Modal ── */}
      {confirmModal && (
        <div style={styles.modalOverlay}>
          <div className="panel" style={styles.modalContent}>
            <div className="panel-title" style={{ color: 'var(--pink)' }}>
              {COMMERCIAL_TYPES[confirmModal.typeKey]?.icon} CONFIRM {COMMERCIAL_TYPES[confirmModal.typeKey]?.name.toUpperCase()}
            </div>

            <div style={{ fontSize: 8, color: 'var(--lav)', marginBottom: 12, lineHeight: 1.5 }}>
              {COMMERCIAL_TYPES[confirmModal.typeKey]?.tagline}
            </div>

            {/* Pair Details */}
            <div style={styles.modalPairBox}>
              <div style={styles.portraitPair}>
                <ActorPortrait actor={confirmModal.actorA} size={42} />
                <ActorPortrait actor={confirmModal.actorB} size={42} />
              </div>
              <div>
                <div style={{ fontSize: 8.5, color: 'var(--white)', fontWeight: 'bold' }}>
                  {actorDisplayName(confirmModal.actorA)} & {actorDisplayName(confirmModal.actorB)}
                </div>
                <div style={{ fontSize: 7, color: 'var(--lav)', marginTop: 2 }}>
                  Chemistry: {getChem(confirmModal.actorA, confirmModal.actorB.id)}/100
                  {confirmModal.preview?.isFixedCP && (
                    <span style={{ color: 'var(--gold)', marginLeft: 6 }}>★ Fixed Couple Bonus Applied</span>
                  )}
                </div>
              </div>
            </div>

            {/* Projected Financials & Stat Gains */}
            {confirmModal.preview && (
              <div style={styles.previewGrid}>
                <div style={styles.previewItem}>
                  <span style={styles.previewLabel}>UPFRONT INVESTMENT</span>
                  <strong style={{ color: confirmModal.preview.cost > 0 ? 'var(--red)' : 'var(--green)' }}>
                    {confirmModal.preview.cost > 0 ? `−${fmtMoney(confirmModal.preview.cost)}` : 'FREE (Sponsored)'}
                  </strong>
                </div>

                {confirmModal.preview.weeklyRoyalty != null && (
                  <div style={styles.previewItem}>
                    <span style={styles.previewLabel}>WEEKLY ROYALTIES</span>
                    <strong style={{ color: 'var(--green)' }}>+{fmtMoney(confirmModal.preview.weeklyRoyalty)}/wk (8 wks)</strong>
                  </div>
                )}

                {confirmModal.preview.revenueEst != null && (
                  <div style={styles.previewItem}>
                    <span style={styles.previewLabel}>PROJECTED REVENUE</span>
                    <strong style={{ color: 'var(--gold)' }}>+{fmtMoney(confirmModal.preview.revenueEst)}</strong>
                  </div>
                )}

                {confirmModal.preview.netProfit != null && (
                  <div style={styles.previewItem}>
                    <span style={styles.previewLabel}>PROJECTED NET PROFIT</span>
                    <strong style={{ color: 'var(--green)' }}>+{fmtMoney(confirmModal.preview.netProfit)}</strong>
                  </div>
                )}

                <div style={styles.previewItem}>
                  <span style={styles.previewLabel}>FAME / POPULARITY</span>
                  <strong style={{ color: 'var(--pink)' }}>
                    +{confirmModal.preview.fameGain} Fame · +{fmtPop(confirmModal.preview.popGain)} Pop
                  </strong>
                </div>

                <div style={styles.previewItem}>
                  <span style={styles.previewLabel}>STUDIO REPUTATION</span>
                  <strong style={{ color: 'var(--blue)' }}>+{confirmModal.preview.repGain} Rep</strong>
                </div>

                {confirmModal.preview.moraleCost && (
                  <div style={styles.previewItem}>
                    <span style={styles.previewLabel}>LEAD MORALE COST</span>
                    <strong style={{ color: 'var(--red)' }}>−{confirmModal.preview.moraleCost} Morale (Tour Fatigue)</strong>
                  </div>
                )}
              </div>
            )}

            {/* Dialog Buttons */}
            <div style={styles.modalBtnRow}>
              <button
                type="button"
                onClick={() => { SFX.click(); setConfirmModal(null) }}
                style={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleExecuteVenture}
                style={styles.confirmBtn}
              >
                🚀 Confirm & Launch!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  heroPanel: {
    padding: 14,
  },
  heroTitleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  heroSubtitle: {
    fontSize: 7.5,
    color: 'var(--lav)',
    lineHeight: 1.5,
    maxWidth: 500,
  },
  kpiContainer: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
  },
  kpiCard: {
    background: 'var(--bg-inset)',
    border: '2px solid var(--shadow)',
    padding: '8px 12px',
    textAlign: 'center',
    minWidth: 120,
  },
  kpiLabel: {
    fontSize: 6,
    color: 'var(--lav)',
    letterSpacing: 1,
    marginBottom: 2,
  },
  kpiVal: {
    fontSize: 9,
    fontWeight: 'bold',
  },
  tabBar: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
    borderTop: '1px solid var(--shadow)',
    paddingTop: 10,
  },
  tabBtn: {
    fontSize: 7.5,
    padding: '7px 12px',
    background: 'var(--bg-inset)',
    color: 'var(--lav)',
    border: '2px solid var(--shadow)',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  tabBtnActive: {
    color: 'var(--white)',
    border: '2px solid var(--pink)',
  },
  contentSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  emptyState: {
    padding: 30,
    textAlign: 'center',
  },
  cardsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  prodCard: {
    padding: 12,
    border: '2px solid var(--shadow)',
  },
  prodCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  prodCardTitle: {
    fontSize: 9.5,
    color: 'var(--white)',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  fixedCpBadge: {
    fontSize: 6.5,
    color: 'var(--pink)',
    background: 'rgba(255, 110, 199, 0.15)',
    border: '1px solid var(--pink)',
    padding: '2px 5px',
    borderRadius: 2,
  },
  prodCardMeta: {
    fontSize: 7,
    color: 'var(--lav)',
    marginTop: 2,
  },
  portraitPair: {
    display: 'flex',
    gap: 4,
  },
  leadsTag: {
    fontSize: 7,
    color: 'var(--lav)',
    background: 'var(--bg-inset)',
    padding: '4px 8px',
    marginBottom: 10,
  },
  actionRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 8,
  },
  actionCol: {
    background: 'var(--bg-inset)',
    border: '1px solid var(--shadow)',
    padding: 8,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  actionTitle: {
    fontSize: 7.5,
    color: 'var(--gold)',
    fontWeight: 'bold',
    marginBottom: 3,
  },
  actionDesc: {
    fontSize: 6.5,
    color: 'var(--lav)',
    lineHeight: 1.4,
    marginBottom: 8,
    flexGrow: 1,
  },
  launchBtn: {
    fontSize: 7,
    padding: '7px 8px',
    width: '100%',
    cursor: 'pointer',
    textAlign: 'center',
  },
  statusActiveTag: {
    fontSize: 7,
    padding: '6px 8px',
    textAlign: 'center',
    color: 'var(--green)',
    background: 'rgba(57, 255, 122, 0.12)',
    border: '1px solid var(--green)',
  },
  statusDoneTag: {
    fontSize: 7,
    padding: '6px 8px',
    textAlign: 'center',
    color: 'var(--gold)',
    background: 'rgba(255, 215, 0, 0.12)',
    border: '1px solid var(--gold)',
  },
  coupleCard: {
    padding: 12,
  },
  coupleCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    borderBottom: '1px solid var(--shadow)',
    paddingBottom: 8,
  },
  coupleActions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: 8,
  },
  coupleActionCard: {
    background: 'var(--bg-inset)',
    border: '1px solid var(--shadow)',
    padding: 8,
  },
  coupleLaunchBtn: {
    fontSize: 7.5,
    padding: '8px 10px',
    width: '100%',
    cursor: 'pointer',
    textAlign: 'center',
  },
  royaltyCard: {
    background: 'var(--bg-inset)',
    border: '1px solid var(--shadow)',
    padding: 10,
  },
  progressBarBg: {
    height: 8,
    background: 'var(--bg-deep)',
    border: '1px solid var(--shadow)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    background: 'var(--green)',
    transition: 'width 0.3s ease',
  },
  recordRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'var(--bg-inset)',
    border: '1px solid var(--shadow)',
    padding: '8px 10px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: 16,
  },
  modalContent: {
    maxWidth: 480,
    width: '100%',
    padding: 16,
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  modalPairBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    background: 'var(--bg-inset)',
    padding: 10,
    marginBottom: 12,
    border: '1px solid var(--shadow)',
  },
  previewGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 8,
    marginBottom: 14,
  },
  previewItem: {
    background: 'var(--bg-inset)',
    padding: 8,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  previewLabel: {
    fontSize: 6,
    color: 'var(--lav)',
    letterSpacing: 0.5,
  },
  modalBtnRow: {
    display: 'flex',
    gap: 10,
    justifyContent: 'flex-end',
    borderTop: '1px solid var(--shadow)',
    paddingTop: 12,
  },
  cancelBtn: {
    fontSize: 7.5,
    padding: '8px 14px',
    background: 'var(--bg-inset)',
    color: 'var(--lav)',
    border: '2px solid var(--shadow)',
    cursor: 'pointer',
  },
  confirmBtn: {
    fontSize: 7.5,
    padding: '8px 16px',
    cursor: 'pointer',
  },
}
