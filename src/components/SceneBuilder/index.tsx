import { ElementPalette } from './ElementPalette'
import { BuilderCanvas } from './BuilderCanvas'
import { useBuilderStore } from '../../store/builderStore'
import { useLadderStore } from '../../store/ladderStore'
import { useThemeColors } from '../../hooks/useThemeColors'
import { registerCustomScenario } from '../../scenarios/registry'

function PropertiesPanel() {
  const c = useThemeColors()
  const { elements, selectedElementId, updateElement, removeElement } = useBuilderStore()
  
  const selectedElement = elements.find(e => e.id === selectedElementId)
  if (!selectedElement) return null

  return (
    <div style={{
      width: '200px',
      height: '100%',
      background: c.bgSecondary,
      borderLeft: `1px solid ${c.borderColor}`,
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      <h3 style={{ color: c.textPrimary, margin: 0, fontSize: '14px' }}>Properties</h3>
      
      <div>
        <label style={{ color: c.textMuted, fontSize: '11px', display: 'block', marginBottom: '4px' }}>
          Address
        </label>
        <input
          value={selectedElement.address}
          onChange={(e) => updateElement(selectedElement.id, { address: e.target.value })}
          style={{
            width: '100%',
            padding: '6px',
            background: c.inputBg,
            border: `1px solid ${c.borderColor}`,
            borderRadius: '4px',
            color: c.textPrimary,
            fontSize: '12px'
          }}
        />
      </div>

      <div>
        <label style={{ color: c.textMuted, fontSize: '11px', display: 'block', marginBottom: '4px' }}>
          Label
        </label>
        <input
          value={selectedElement.label}
          onChange={(e) => updateElement(selectedElement.id, { label: e.target.value })}
          style={{
            width: '100%',
            padding: '6px',
            background: c.inputBg,
            border: `1px solid ${c.borderColor}`,
            borderRadius: '4px',
            color: c.textPrimary,
            fontSize: '12px'
          }}
        />
      </div>

      {(selectedElement.type === 'light' || selectedElement.type === 'indicator') && (
        <div>
          <label style={{ color: c.textMuted, fontSize: '11px', display: 'block', marginBottom: '4px' }}>
            Color
          </label>
          <input
            type="color"
            value={selectedElement.color || '#00ff88'}
            onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
            style={{
              width: '100%',
              height: '32px',
              padding: '2px',
              background: c.inputBg,
              border: `1px solid ${c.borderColor}`,
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          />
        </div>
      )}

      <button
        onClick={() => removeElement(selectedElement.id)}
        style={{
          marginTop: 'auto',
          padding: '8px',
          background: '#ff4444',
          border: 'none',
          borderRadius: '4px',
          color: 'white',
          fontSize: '12px',
          cursor: 'pointer'
        }}
      >
        Delete Element
      </button>
    </div>
  )
}

export function SceneBuilder() {
  const c = useThemeColors()
  const { scenarioName, selectedElementId, generateScenarioConfig } = useBuilderStore()
  const loadScenario = useLadderStore(s => s.loadScenario)

  const handleLoadToSimulator = () => {
    const config = generateScenarioConfig()
    registerCustomScenario(config)
    loadScenario(config)
    // Switch to simulator mode will be handled by parent App component
    window.dispatchEvent(new CustomEvent('switchToSimulator'))
  }

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      background: c.bgPrimary 
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: `1px solid ${c.borderColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <h2 style={{ color: c.textPrimary, margin: 0, fontSize: '18px' }}>
          Scene Builder - {scenarioName}
        </h2>
        <button
          onClick={handleLoadToSimulator}
          style={{
            padding: '8px 16px',
            background: c.accentBlue,
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Load to Simulator
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex' }}>
        <ElementPalette />
        <BuilderCanvas />
        {selectedElementId && <PropertiesPanel />}
      </div>
    </div>
  )
}