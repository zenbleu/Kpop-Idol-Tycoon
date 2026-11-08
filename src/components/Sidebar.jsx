/**
 * Sidebar.jsx — Responsive retro navigation sidebar for K-pop Idol Tycoon.
 * Supports desktop fixed sidebar and collapsible mobile navigation.
 */

import React from 'react'
import { playSfx } from '../game/audio.js'

export const NAV_ITEMS = [
  { id: 'dashboard',   label: 'Dashboard',       icon: '🏠' },
  { id: 'company',     label: 'Company HQ',      icon: '🏢' },
  { id: 'auditions',   label: 'Auditions',       icon: '✨' },
  { id: 'idols',       label: 'Idols & Trainees', icon: '🎤' },
  { id: 'groups',      label: 'Groups',          icon: '👥' },
  { id: 'solo',        label: 'Solo Artists',    icon: '⭐' },
  { id: 'training',    label: 'Training Center', icon: '🏋️' },
  { id: 'production',  label: 'Album Studio',    icon: '💿' },
  { id: 'schedules',   label: 'Weekly Planner',  icon: '📅' },
  { id: 'concerts',    label: 'Concerts & Tours', icon: '🏟️' },
  { id: 'wardrobe',    label: 'Wardrobe',        icon: '👗' },
  { id: 'news',        label: 'News & Trends',   icon: '📰' },
  { id: 'statistics',  label: 'Statistics',      icon: '📊' },
  { id: 'saveload',    label: 'Save / Load',     icon: '💾' },
]

export default function Sidebar({ currentScreen, setScreen }) {
  const handleSelect = (id) => {
    playSfx('click')
    setScreen(id)
  }

  return (
    <aside className="app-sidebar" aria-label="Game Navigation">
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(item => {
          const isActive = currentScreen === item.id
          return (
            <button
              key={item.id}
              className={`nav-button ${isActive ? 'active' : ''}`}
              onClick={() => handleSelect(item.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <span className="nav-icon" aria-hidden="true">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </button>
          )
        })}
      </nav>
      <div className="sidebar-footer">
        <span className="footer-title">K-POP IDOL TYCOON</span>
        <span className="footer-sub">v1.0.0 · OFFLINE SIM</span>
      </div>
    </aside>
  )
}
