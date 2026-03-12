import { scenarios, getScenarioById } from '../../scenarios/registry'
import { useLadderStore } from '../../store/ladderStore'
import { useThemeColors } from '../../hooks/useThemeColors'

export function ScenarioSelector() {
  const activeScenarioId = useLadderStore(s => s.activeScenarioId)
  const loadScenario = useLadderStore(s => s.loadScenario)
  const c = useThemeColors()
  
  const activeScenario = getScenarioById(activeScenarioId)
  
  const handleScenarioChange = (scenarioId: string) => {
    const scenario = getScenarioById(scenarioId)
    if (scenario) {
      loadScenario(scenario)
    }
  }
  
  return (
    <div style={{
      padding: '16px',
      background: c.bgSecondary,
      borderBottom: `1px solid ${c.borderColor}`,
      fontFamily: 'monospace',
      fontSize: '12px',
    }}>
      <label style={{ 
        display: 'block', 
        marginBottom: '8px', 
        color: c.accentCyan,
        fontWeight: 'bold'
      }}>
        Scenario:
      </label>
      
      <select
        value={activeScenarioId}
        onChange={(e) => handleScenarioChange(e.target.value)}
        style={{
          width: '100%',
          padding: '8px',
          backgroundColor: c.inputBg,
          color: c.textPrimary,
          border: `1px solid ${c.borderLight}`,
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '12px',
          marginBottom: '8px',
        }}
      >
        {scenarios.map(scenario => (
          <option key={scenario.id} value={scenario.id}>
            {scenario.name} {'⭐'.repeat(scenario.complexity)}
          </option>
        ))}
      </select>
      
      {activeScenario && (
        <div style={{
          fontSize: '11px',
          color: c.textMuted,
          lineHeight: '1.4',
        }}>
          {activeScenario.description}
        </div>
      )}
    </div>
  )
}