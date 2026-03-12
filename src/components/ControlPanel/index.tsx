import { useLadderStore } from '../../store/ladderStore'
import { getScenarioById } from '../../scenarios/registry'
import { useThemeColors } from '../../hooks/useThemeColors'

export function ControlPanel() {
  const activeScenarioId = useLadderStore(s => s.activeScenarioId)
  const isLadderRunning = useLadderStore(s => s.isRunning)
  const c = useThemeColors()
  
  const activeScenario = getScenarioById(activeScenarioId)
  
  return (
    <div style={{
      padding: '16px',
      borderBottom: `1px solid ${c.borderColor}`,
      background: c.bgSecondary,
      color: c.textPrimary,
      fontFamily: 'monospace',
    }}>
      <h3 style={{ margin: '0 0 16px 0', color: c.accentCyan }}>
        {activeScenario?.name || 'PLC Simulator'}
      </h3>
      
      {/* Status Display */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          marginBottom: '8px'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: isLadderRunning ? '#00ff88' : '#666',
            boxShadow: `0 0 8px ${isLadderRunning ? '#00ff88' : '#666'}`,
          }} />
          <span style={{ textTransform: 'uppercase', fontWeight: 'bold' }}>
            {isLadderRunning ? 'RUNNING' : 'STOPPED'}
          </span>
        </div>
        
        <div style={{ fontSize: '12px', opacity: 0.7 }}>
          Mode: LADDER
        </div>
      </div>
      
      {/* Info */}
      <div style={{ 
        padding: '12px',
        background: 'rgba(68, 136, 255, 0.1)',
        border: `1px solid ${c.accentBlue}`,
        borderRadius: '4px',
        fontSize: '11px',
        color: c.accentBlue
      }}>
        {activeScenario?.description || 'Controlled by Ladder Logic program.'}
        <br />Use the Ladder Editor to control the simulation.
      </div>
    </div>
  )
}
