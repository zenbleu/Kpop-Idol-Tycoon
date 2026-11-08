/**
 * TalentWorkshops.jsx — Talent Workshops & Fan Service Training Panel
 *
 * Allows player to invest funds during hiatus/prep to actively train actors,
 * build intimacy/chemistry between co-stars, boost loyalty, and speed up recovery.
 */
import React, { useState, useMemo } from 'react'
import { useGame } from '../game/state.jsx'
import { WORKSHOPS, canAttendWorkshop, executeWorkshop } from '../game/workshops.js'
import { actorDisplayName, TIER_COLOR } from '../game/actors.js'
import { getChem, chemTier } from '../game/chemistry.js'
import { SFX } from '../game/audio.js'
import { ActorPortrait } from './ActorRoster.jsx'

export default function TalentWorkshops({ actor }) {
  const { state, dispatch } = useGame()
  const [selectedWorkshopId, setSelectedWorkshopId] = useState('acting')
  const [partnerId, setPartnerId] = useState(null)
  const [lastResult, setLastResult] = useState(null)

  // Signed co-stars for Chemistry Workshop
  const eligiblePartners = useMemo(() => {
    return state.actors.filter(
      a => a.signed && a.id !== actor.id && a.status !== 'filming'
    )
  }, [state.actors, actor.id])

  const selectedWorkshop = useMemo(() => {
    return WORKSHOPS.find(w => w.id === selectedWorkshopId) || WORKSHOPS[0]
  }, [selectedWorkshopId])

  const currentPartner = useMemo(() => {
    if (!partnerId) return null
    return state.actors.find(a => a.id === partnerId) || null
  }, [state.actors, partnerId])

  // Check if they are an official Fixed CP
  const isOfficialCP = useMemo(() => {
    if (!currentPartner) return false
    return (state.fixedCPs || []).some(
      ([a, b]) => (a === actor.id && b === currentPartner.id) || (a === currentPartner.id && b === actor.id)
    )
  }, [state.fixedCPs, actor.id, currentPartner])

  const attendanceCheck = useMemo(() => {
    return canAttendWorkshop(selectedWorkshop, actor, currentPartner, state.money)
  }, [selectedWorkshop, actor, currentPartner, state.money])

  const handleEnroll = () => {
    if (!attendanceCheck.ok) return
    const result = executeWorkshop(state, dispatch, selectedWorkshop.id, actor.id, partnerId)
    if (result.success) {
      SFX.confirm()
      setLastResult(result)
    }
  }

  if (!actor || !actor.signed) {
    return null
  }

  return (
    <div className="panel" style={{ border: '2px solid var(--gold)', background: 'rgba(255, 215, 0, 0.04)' }}>
      {/* Title */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
        <div className="panel-title" style={{ margin: 0, padding: 0, border: 'none', color: 'var(--gold)' }}>
          🎓 TALENT WORKSHOPS & FAN SERVICE
        </div>
        <div style={{ fontSize: 7, color: 'var(--lav)' }}>
          Studio Budget: <span style={{ color: 'var(--gold)', fontWeight: 'bold' }}>₩{state.money.toLocaleString()}</span>
        </div>
      </div>

      <div style={{ fontSize: 7, color: 'var(--lav)', lineHeight: 1.6, marginBottom: 12 }}>
        Send <strong style={{ color: 'var(--pink)' }}>{actorDisplayName(actor)}</strong> to professional development camps during hiatus. Build acting range, stage charisma, recover mental health, or deepen intimacy with co-stars!
      </div>

      {/* Workshop selection pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 6, marginBottom: 14 }}>
        {WORKSHOPS.map(w => {
          const isSelected = w.id === selectedWorkshopId
          const affordable = state.money >= w.cost
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => {
                SFX.click()
                setSelectedWorkshopId(w.id)
                setLastResult(null)
              }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                padding: '8px 10px',
                border: isSelected ? '2px solid var(--gold)' : '2px solid var(--shadow)',
                background: isSelected ? 'rgba(255, 215, 0, 0.15)' : 'var(--bg-inset)',
                boxShadow: isSelected ? '0 0 10px rgba(255, 215, 0, 0.25)' : 'none',
                opacity: affordable ? 1 : 0.6,
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14 }}>{w.icon}</span>
                <span style={{ fontSize: 7, color: isSelected ? 'var(--gold)' : 'var(--white)', fontWeight: 'bold' }}>
                  {w.title}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                <span style={{ fontSize: 6.5, color: 'var(--lav)' }}>{w.category}</span>
                <span style={{ fontSize: 7, color: affordable ? 'var(--gold)' : 'var(--red)', fontWeight: 'bold' }}>
                  ₩{w.cost}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Selected Workshop Detail Card */}
      <div style={{ background: 'var(--bg-inset)', border: '2px solid var(--shadow)', padding: 12, borderRadius: 4, marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>{selectedWorkshop.icon}</span>
            <div>
              <div style={{ fontSize: 9, color: 'var(--gold)', fontWeight: 'bold' }}>
                {selectedWorkshop.title}
              </div>
              <div style={{ fontSize: 6.5, color: 'var(--lav)' }}>
                {selectedWorkshop.category} · Tuition: ₩{selectedWorkshop.cost}
              </div>
            </div>
          </div>

          <span className="tag-chip" style={{ borderColor: 'var(--pink)', color: 'var(--pink)', fontSize: 7 }}>
            {selectedWorkshop.target === 'pair' ? '👥 Co-Star Pair' : '👤 Solo Training'}
          </span>
        </div>

        <p style={{ fontSize: 7, color: 'var(--white)', lineHeight: 1.6, margin: '8px 0' }}>
          {selectedWorkshop.desc}
        </p>

        {/* Expected Gains */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, margin: '8px 0' }}>
          {selectedWorkshop.highlights.map((h, idx) => (
            <span
              key={idx}
              style={{
                fontSize: 6.5,
                padding: '3px 6px',
                background: 'rgba(92, 225, 160, 0.12)',
                border: '1px solid var(--green)',
                color: 'var(--green)',
                borderRadius: 2,
              }}
            >
              ★ {h}
            </span>
          ))}
          {selectedWorkshop.extraCpBonus && (
            <span
              style={{
                fontSize: 6.5,
                padding: '3px 6px',
                background: 'rgba(255, 107, 157, 0.15)',
                border: '1px solid var(--pink)',
                color: 'var(--pink)',
                borderRadius: 2,
              }}
            >
              💞 {selectedWorkshop.extraCpBonus}
            </span>
          )}
        </div>

        {/* Chemistry Partner Picker (if pair workshop) */}
        {selectedWorkshop.target === 'pair' && (
          <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--shadow)' }}>
            <div style={{ fontSize: 7.5, color: 'var(--pink)', fontWeight: 'bold', marginBottom: 6 }}>
              SELECT CO-STAR PARTNER:
            </div>
            {eligiblePartners.length === 0 ? (
              <div style={{ fontSize: 7, color: 'var(--gray)', padding: 6 }}>
                No other signed actors are currently free to train. Sign more talent or wait for filming to finish.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 6, maxHeight: 180, overflowY: 'auto' }}>
                {eligiblePartners.map(p => {
                  const isSelected = p.id === partnerId
                  const chemVal = getChem(actor, p.id)
                  const tier = chemTier(chemVal)
                  const isPairCp = (state.fixedCPs || []).some(
                    ([a, b]) => (a === actor.id && b === p.id) || (a === p.id && b === actor.id)
                  )

                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        SFX.click()
                        setPartnerId(p.id)
                        setLastResult(null)
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: 6,
                        border: isSelected ? '2px solid var(--pink)' : '1px solid var(--shadow)',
                        background: isSelected ? 'rgba(255, 107, 157, 0.15)' : 'var(--bg)',
                        cursor: 'pointer',
                      }}
                    >
                      <ActorPortrait actor={p} size={32} />
                      <div style={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
                        <div style={{ fontSize: 7, color: 'var(--white)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {actorDisplayName(p)}
                        </div>
                        <div style={{ fontSize: 6, color: tier.color }}>
                          {tier.emoji} {chemVal}% Chem
                        </div>
                        {isPairCp && (
                          <div style={{ fontSize: 5.5, color: 'var(--pink)', fontWeight: 'bold' }}>
                            💞 Official CP
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}

            {currentPartner && (
              <div style={{ marginTop: 8, fontSize: 7, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>✓ Partner Selected:</span>
                <strong>{actorDisplayName(currentPartner)}</strong>
                {isOfficialCP && <span style={{ color: 'var(--gold)' }}>(+Bonus CP Fan Hype Active!)</span>}
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: 7, color: attendanceCheck.ok ? 'var(--green)' : 'var(--red)' }}>
            {attendanceCheck.ok ? 'Ready to enroll!' : `⚠️ ${attendanceCheck.reason}`}
          </div>

          <button
            type="button"
            className="btn-primary"
            disabled={!attendanceCheck.ok}
            onClick={handleEnroll}
            style={{
              fontSize: 8,
              padding: '10px 16px',
              cursor: attendanceCheck.ok ? 'pointer' : 'not-allowed',
              opacity: attendanceCheck.ok ? 1 : 0.5,
              background: attendanceCheck.ok ? 'var(--gold)' : undefined,
              color: attendanceCheck.ok ? '#120A24' : undefined,
              border: '2px solid #8A7000',
              boxShadow: '0 4px 0 #8A7000',
            }}
          >
            🎓 ENROLL NOW (−₩{selectedWorkshop.cost})
          </button>
        </div>
      </div>

      {/* Celebratory Result Card */}
      {lastResult && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 107, 157, 0.15) 100%)',
            border: '2px solid var(--gold)',
            borderRadius: 4,
            padding: 12,
            animation: 'pulse-glow 2s infinite',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 20 }}>🎉</span>
            <div>
              <div style={{ fontSize: 8.5, color: 'var(--gold)', fontWeight: 'bold' }}>
                WORKSHOP GRADUATION!
              </div>
              <div style={{ fontSize: 7, color: 'var(--white)' }}>
                {actorDisplayName(actor)}
                {lastResult.partner ? ` & ${actorDisplayName(lastResult.partner)}` : ''} completed{' '}
                <strong>{lastResult.workshop.title}</strong>!
              </div>
            </div>
          </div>

          <div style={{ fontSize: 7, color: 'var(--lav)', marginTop: 4, marginBottom: 6 }}>
            Gains & Rewards:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {lastResult.gains.map((gain, gIdx) => (
              <span
                key={gIdx}
                style={{
                  fontSize: 7,
                  padding: '3px 8px',
                  background: 'var(--bg-inset)',
                  border: '1px solid var(--gold)',
                  color: 'var(--gold)',
                  borderRadius: 2,
                  fontWeight: 'bold',
                }}
              >
                ✨ {gain}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
