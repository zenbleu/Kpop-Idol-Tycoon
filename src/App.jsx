/**
 * App.jsx — Central routing and layout for K-pop Idol Tycoon.
 * Features a streamlined side-by-side Top Panel (Company Info on left, Landing Tabs on right)
 * maximizing the game screen area below.
 */

import React, { useState, useEffect } from 'react'
import { GameProvider, useGame, ACTION } from './game/state.jsx'
import LoadingScreen from './components/LoadingScreen.jsx'
import TitleScreen from './components/TitleScreen.jsx'
import TopBar from './components/TopBar.jsx'

// K-pop Idol Tycoon Views
import Dashboard from './components/Dashboard.jsx'
import CompanyView from './components/CompanyView.jsx'
import AuditionsView from './components/AuditionsView.jsx'
import IdolsView from './components/IdolsView.jsx'
import GroupsView from './components/GroupsView.jsx'
import SoloArtistsView from './components/SoloArtistsView.jsx'
import TrainingView from './components/TrainingView.jsx'
import ProductionView from './components/ProductionView.jsx'
import ScheduleView from './components/ScheduleView.jsx'
import ConcertsView from './components/ConcertsView.jsx'
import WardrobeView from './components/WardrobeView.jsx'
import NewsTrendsView from './components/NewsTrendsView.jsx'
import StatisticsView from './components/StatisticsView.jsx'
import SaveLoadView from './components/SaveLoadView.jsx'

// Modals & Overlays
import WeeklySummaryModal from './components/WeeklySummaryModal.jsx'
import TutorialModal from './components/TutorialModal.jsx'
import Confetti from './components/Confetti.jsx'
import { setSfxEnabled } from './game/audio.js'

function ToastContainer() {
  const { state, dispatch } = useGame()
  const toasts = state.toasts || []

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.slice(-4).map((toast) => {
        const isRed = toast.variant === 'red'
        const isGold = toast.variant === 'gold'

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto p-3 rounded-xl border text-xs font-pixel shadow-2xl animate-bounce-subtle flex items-center justify-between gap-3 ${
              isRed
                ? 'bg-[#2a0e1b] border-red-500 text-red-200'
                : isGold
                ? 'bg-[#291b0d] border-yellow-400 text-yellow-200'
                : 'bg-[#1b1236] border-purple-500 text-purple-200'
            }`}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => dispatch({ type: ACTION.DISMISS_TOAST, id: toast.id })}
              className="text-white/60 hover:text-white ml-2 text-sm font-bold"
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}

function GameApp() {
  const { state } = useGame()
  const [screen, setScreen] = useState('dashboard')
  const [showTutorial, setShowTutorial] = useState(false)

  // Sync settings with DOM
  useEffect(() => {
    const b = document.body
    b.classList.toggle('no-scanlines', !state.settings?.scanlines)
    b.classList.remove('anim-slow', 'anim-fast')
    if (state.settings?.animSpeed === 'slow') b.classList.add('anim-slow')
    if (state.settings?.animSpeed === 'fast') b.classList.add('anim-fast')
    setSfxEnabled(state.settings?.sfxOn !== false)
  }, [state.settings?.scanlines, state.settings?.animSpeed, state.settings?.sfxOn])

  // Title screen if game not started
  if (!state.started) {
    return <TitleScreen onOpenTutorial={() => setShowTutorial(true)} />
  }

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':
        return <Dashboard setScreen={setScreen} />
      case 'company':
        return <CompanyView />
      case 'auditions':
        return <AuditionsView />
      case 'idols':
        return <IdolsView />
      case 'groups':
        return <GroupsView />
      case 'solo':
        return <SoloArtistsView />
      case 'training':
        return <TrainingView />
      case 'production':
        return <ProductionView />
      case 'schedules':
        return <ScheduleView />
      case 'concerts':
        return <ConcertsView />
      case 'wardrobe':
        return <WardrobeView />
      case 'news':
        return <NewsTrendsView />
      case 'statistics':
        return <StatisticsView />
      case 'saveload':
        return <SaveLoadView />
      default:
        return <Dashboard setScreen={setScreen} />
    }
  }

  return (
    <div className="app-layout min-h-screen bg-[#0e071e] text-white flex flex-col font-pixel">
      {/* ─── Top Panel: Side-by-Side Company Info (Left) & Landing Tabs (Right) ─── */}
      <TopBar
        currentScreen={screen}
        setScreen={setScreen}
        onOpenTutorial={() => setShowTutorial(true)}
      />

      {/* ─── Main Game Screen Area: Maximum Space & Prominence ─── */}
      <main className="app-main flex-1 w-full max-w-7xl mx-auto p-3 sm:p-5 md:p-6 overflow-y-auto">
        {renderScreen()}
      </main>

      {/* Modals & Overlays */}
      <WeeklySummaryModal />
      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}
      <ToastContainer />
      <Confetti />
    </div>
  )
}

export default function App() {
  const [appLoading, setAppLoading] = useState(true)
  const onLoadComplete = React.useRef(() => setAppLoading(false)).current

  return (
    <>
      {appLoading && <LoadingScreen onComplete={onLoadComplete} />}
      <GameProvider>
        <GameApp />
      </GameProvider>
    </>
  )
}
