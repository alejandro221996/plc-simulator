import { useState, useEffect } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import { SceneViewer } from './components/SceneViewer'
import { ControlPanel } from './components/ControlPanel'
import { LadderEditor } from './components/LadderEditor'
import { ExampleSelector } from './components/LadderEditor/ExampleSelector'
import { ScenarioSelector } from './components/ScenarioSelector'
import { ChallengePanel } from './components/ChallengePanel'
import { FaultPanel } from './components/FaultPanel'
import { TraceViewer } from './components/TraceViewer'
import { SceneBuilder } from './components/SceneBuilder'
import { SandboxPanel } from './components/SceneViewer/SandboxPanel'
import { useThemeStore } from './store/themeStore'
import { useThemeColors } from './hooks/useThemeColors'
import { useLadderStore } from './store/ladderStore'
import { getScenarioById } from './scenarios/registry'

function App() {
  const { theme, toggleTheme } = useThemeStore()
  const c = useThemeColors()
  const [mode, setMode] = useState<'simulator' | 'ladder-only' | 'builder'>('simulator')
  const loadScenario = useLadderStore(s => s.loadScenario)

  useEffect(() => {
    const handleSwitchToSimulator = () => setMode('simulator')
    window.addEventListener('switchToSimulator', handleSwitchToSimulator)
    return () => window.removeEventListener('switchToSimulator', handleSwitchToSimulator)
  }, [])

  useEffect(() => {
    if (mode === 'ladder-only') {
      const sandbox = getScenarioById('sandbox')
      if (sandbox) loadScenario(sandbox)
    }
  }, [mode, loadScenario])
  
  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: c.bgPrimary
    }}>
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'fixed', top: '8px', right: '20px',
          width: '32px', height: '32px', borderRadius: '50%',
          border: `2px solid ${c.borderColor}`, background: c.bgSecondary,
          color: c.textPrimary, fontSize: '14px', cursor: 'pointer',
          zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>

      {/* Mode Tabs */}
      <div style={{
        display: 'flex', flexShrink: 0,
        borderBottom: `1px solid ${c.borderColor}`, background: c.bgSecondary
      }}>
        {(['simulator', 'ladder-only', 'builder'] as const).map(m => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: '8px 24px', border: 'none', fontSize: '13px', cursor: 'pointer',
            background: mode === m ? c.accentBlue : 'transparent',
            color: mode === m ? 'white' : c.textPrimary,
            borderBottom: mode === m ? `2px solid ${c.accentBlue}` : 'none'
          }}>
            {m === 'simulator' ? 'Simulator' : m === 'ladder-only' ? 'Ladder Only' : 'Scene Builder'}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        {mode === 'simulator' ? (
          <>
            {/* Left: Ladder Editor + Trace Viewer (60%) */}
            <div style={{
              width: '60%', display: 'flex', flexDirection: 'column',
              borderRight: `1px solid ${c.borderColor}`, minHeight: 0,
            }}>
              <div style={{ flex: 1, minHeight: 0 }}>
                <ReactFlowProvider>
                  <LadderEditor />
                </ReactFlowProvider>
              </div>
              <TraceViewer />
            </div>
            
            {/* Right: Scene + Panels (40%) — ALL scrollable together */}
            <div style={{
              width: '40%', overflowY: 'auto', minHeight: 0,
            }}>
              <ScenarioSelector />
              <div style={{ height: '35vh', minHeight: '220px' }}>
                <SceneViewer />
              </div>
              <ControlPanel />
              <ChallengePanel />
              <FaultPanel />
            </div>
          </>
        ) : mode === 'ladder-only' ? (
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <ExampleSelector />
            <div style={{ flex: 1, minHeight: 0 }}>
              <ReactFlowProvider>
                <LadderEditor />
              </ReactFlowProvider>
            </div>
            <div style={{ height: '60px', borderTop: `1px solid ${c.borderColor}` }}>
              <SandboxPanel compact />
            </div>
            <TraceViewer />
          </div>
        ) : (
          <SceneBuilder />
        )}
      </div>
    </div>
  )
}

export default App
