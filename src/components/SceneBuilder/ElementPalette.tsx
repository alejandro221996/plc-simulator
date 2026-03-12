import { useBuilderStore } from '../../store/builderStore'
import { useThemeColors } from '../../hooks/useThemeColors'

const elements = [
  { type: 'light' as const, icon: '💡', name: 'Light' },
  { type: 'sensor' as const, icon: '📡', name: 'Sensor' },
  { type: 'motor' as const, icon: '⚙️', name: 'Motor' },
  { type: 'button' as const, icon: '🔘', name: 'Button' },
  { type: 'indicator' as const, icon: '🔴', name: 'Indicator' },
  { type: 'timer-display' as const, icon: '⏱️', name: 'Timer' }
]

export function ElementPalette() {
  const c = useThemeColors()
  const { 
    scenarioName, 
    savedScenarios, 
    setScenarioName, 
    saveScenario, 
    loadScenario, 
    deleteSavedScenario, 
    clearCanvas 
  } = useBuilderStore()

  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('elementType', type)
  }

  return (
    <div style={{
      width: '200px',
      height: '100%',
      background: c.bgSecondary,
      borderRight: `1px solid ${c.borderColor}`,
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <h3 style={{ color: c.textPrimary, margin: 0, fontSize: '14px' }}>Elements</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {elements.map(({ type, icon, name }) => (
          <div
            key={type}
            draggable
            onDragStart={(e) => handleDragStart(e, type)}
            style={{
              padding: '8px 12px',
              background: c.bgPrimary,
              border: `1px solid ${c.borderColor}`,
              borderRadius: '4px',
              cursor: 'grab',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: c.textPrimary,
              fontSize: '12px'
            }}
            onMouseDown={(e) => e.currentTarget.style.cursor = 'grabbing'}
            onMouseUp={(e) => e.currentTarget.style.cursor = 'grab'}
          >
            <span style={{ fontSize: '16px' }}>{icon}</span>
            {name}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 'auto' }}>
        <h3 style={{ color: c.textPrimary, margin: '0 0 8px 0', fontSize: '14px' }}>Scenario</h3>
        
        <input
          value={scenarioName}
          onChange={(e) => setScenarioName(e.target.value)}
          style={{
            width: '100%',
            padding: '6px',
            background: c.inputBg,
            border: `1px solid ${c.borderColor}`,
            borderRadius: '4px',
            color: c.textPrimary,
            fontSize: '12px',
            marginBottom: '8px'
          }}
        />
        
        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
          <button
            onClick={saveScenario}
            style={{
              flex: 1,
              padding: '6px',
              background: c.accentBlue,
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Save
          </button>
          <button
            onClick={clearCanvas}
            style={{
              flex: 1,
              padding: '6px',
              background: c.accentOrange,
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>
        </div>

        <h4 style={{ color: c.textPrimary, margin: '0 0 8px 0', fontSize: '12px' }}>Saved</h4>
        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {savedScenarios.map(scenario => (
            <div
              key={scenario.id}
              style={{
                padding: '6px',
                background: c.bgPrimary,
                border: `1px solid ${c.borderColor}`,
                borderRadius: '4px',
                marginBottom: '4px',
                fontSize: '11px'
              }}
            >
              <div style={{ color: c.textPrimary, marginBottom: '4px' }}>{scenario.name}</div>
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => loadScenario(scenario)}
                  style={{
                    flex: 1,
                    padding: '2px 4px',
                    background: c.accentCyan,
                    border: 'none',
                    borderRadius: '2px',
                    color: 'white',
                    fontSize: '10px',
                    cursor: 'pointer'
                  }}
                >
                  Load
                </button>
                <button
                  onClick={() => deleteSavedScenario(scenario.id)}
                  style={{
                    flex: 1,
                    padding: '2px 4px',
                    background: '#ff4444',
                    border: 'none',
                    borderRadius: '2px',
                    color: 'white',
                    fontSize: '10px',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}