import { Html } from '@react-three/drei'
import { useSimulationStore } from '../../store/simulationStore'
import { useThemeColors } from '../../hooks/useThemeColors'

export function StatusOverlay() {
  const { currentState, timeRemaining, status, cycleCount } = useSimulationStore()
  const c = useThemeColors()
  
  const stateColors = {
    red: '#ff3333',
    yellow: '#ffaa00',
    green: '#00ff88',
  }
  
  return (
    <Html
      position={[1.5, 2, 0]}
      distanceFactor={8}
      center
    >
      <div style={{
        background: c.bgPanel,
        color: c.textPrimary,
        padding: '12px 16px',
        borderRadius: '8px',
        border: `2px solid ${stateColors[currentState]}`,
        fontFamily: 'monospace',
        fontSize: '14px',
        minWidth: '120px',
        textAlign: 'center',
      }}>
        <div style={{ 
          color: stateColors[currentState], 
          fontWeight: 'bold',
          textTransform: 'uppercase',
          marginBottom: '4px'
        }}>
          {currentState}
        </div>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>
          {status === 'running' ? `${timeRemaining.toFixed(1)}s` : 'STOPPED'}
        </div>
        <div style={{ fontSize: '10px', opacity: 0.6, marginTop: '4px' }}>
          Cycles: {cycleCount}
        </div>
      </div>
    </Html>
  )
}