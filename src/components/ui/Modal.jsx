/**
 * Modal.jsx — Robust Portal Modal Container Component for K-pop Idol Tycoon.
 * 
 * Uses React createPortal to mount directly to document.body.
 * Guarantees a genuine fixed-position viewport overlay with dimmed blurred backdrop,
 * independent scrolling, escape-key and backdrop dismissal, and body scroll lock.
 */

import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  size = 'md', // 'sm' | 'md' | 'lg' | 'xl'
  children,
  footer,
  borderColor = 'border-[#543b8a]',
}) {
  const dialogRef = useRef(null)

  // Handle escape key and body scroll lock
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose?.()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    document.body.classList.add('modal-open')
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.classList.remove('modal-open')
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Size mapping
  const maxWidthMap = {
    sm: '420px',
    md: '540px',
    lg: '720px',
    xl: '960px',
  }
  const chosenMaxWidth = maxWidthMap[size] || '540px'

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-5 overflow-y-auto font-pixel"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        maxWidth: '100vw',
        maxHeight: '100vh',
        margin: 0,
        boxSizing: 'border-box',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(8, 4, 20, 0.88)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        padding: '16px',
        overflowY: 'auto',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className={`bg-[#190f33] border-2 ${borderColor} rounded-2xl w-full shadow-2xl flex flex-col font-pixel`}
        style={{
          width: '100%',
          maxWidth: chosenMaxWidth,
          maxHeight: 'min(90vh, 90dvh)',
          backgroundColor: '#190f33',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 30px rgba(255, 107, 157, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          margin: 'auto',
          position: 'relative',
        }}
      >
        {/* Modal Header */}
        <div
          className="flex items-center justify-between p-3.5 sm:p-4 border-b border-[#3b2762] bg-[#140b2a] flex-shrink-0"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: '1px solid #3b2762',
            backgroundColor: '#140b2a',
            flexShrink: 0,
          }}
        >
          <div className="flex items-center gap-2.5 min-w-0" style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            {icon && <span className="text-lg flex-shrink-0" style={{ fontSize: '18px', flexShrink: 0 }}>{icon}</span>}
            <div className="min-w-0" style={{ minWidth: 0 }}>
              <h3 className="text-xs sm:text-sm font-bold text-white truncate" style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffffff', margin: 0 }}>
                {title}
              </h3>
              {subtitle && (
                <p className="text-[9px] text-purple-300 truncate mt-0.5" style={{ fontSize: '9px', color: '#d8b4fe', margin: '2px 0 0 0' }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-purple-300 hover:text-white text-xs font-pixel px-2.5 py-1 rounded-lg bg-[#241744] hover:bg-[#342260] border border-purple-500/40 transition-colors ml-2 flex-shrink-0"
            style={{
              fontSize: '11px',
              padding: '4px 10px',
              backgroundColor: '#241744',
              color: '#d8b4fe',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              borderRadius: '6px',
              cursor: 'pointer',
              flexShrink: 0,
              marginLeft: '8px',
            }}
            aria-label="Close dialog"
          >
            ✕
          </button>
        </div>

        {/* Modal Body (Scrolls independently if content overflows) */}
        <div
          className="p-3.5 sm:p-4 overflow-y-auto flex-1 space-y-3"
          style={{
            padding: '16px',
            overflowY: 'auto',
            flex: '1 1 auto',
          }}
        >
          {children}
        </div>

        {/* Modal Footer (Optional) */}
        {footer && (
          <div
            className="p-3 sm:p-3.5 border-t border-[#3b2762] bg-[#120826] flex-shrink-0"
            style={{
              padding: '12px 16px',
              borderTop: '1px solid #3b2762',
              backgroundColor: '#120826',
              flexShrink: 0,
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  )

  // Mount to body via createPortal so it is outside any main layout flow
  if (typeof document !== 'undefined' && document.body) {
    return createPortal(modalContent, document.body)
  }

  return modalContent
}
