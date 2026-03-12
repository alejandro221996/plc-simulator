import { useState } from 'react'
import { useLadderStore } from '../../store/ladderStore'
import { useThemeColors } from '../../hooks/useThemeColors'
import { ladderExamples } from '../../scenarios/ladder-examples'

export function ExampleSelector() {
  const c = useThemeColors()
  const loadExample = useLadderStore(s => s.loadExample)
  const [selectedId, setSelectedId] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value
    if (!id) return
    
    const example = ladderExamples.find(ex => ex.id === id)
    if (example) {
      loadExample(example.rungs, example.memory)
      setSelectedId('')
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 12px',
      background: c.bgSecondary,
      borderBottom: `1px solid ${c.borderColor}`,
      fontFamily: 'monospace',
      fontSize: '11px',
    }}>
      <label style={{ color: c.textMuted, whiteSpace: 'nowrap' }}>
        Load Example:
      </label>
      <select
        value={selectedId}
        onChange={handleChange}
        style={{
          padding: '4px 8px',
          background: c.inputBg,
          color: c.textPrimary,
          border: `1px solid ${c.borderColor}`,
          borderRadius: '3px',
          fontFamily: 'monospace',
          fontSize: '11px',
          cursor: 'pointer',
          minWidth: '200px',
        }}
      >
        <option value="">— Load Example —</option>
        {ladderExamples.map(ex => (
          <option key={ex.id} value={ex.id}>
            {ex.name}
          </option>
        ))}
      </select>
      <span style={{ color: c.textMuted, fontSize: '10px', flex: 1 }}>
        {selectedId && ladderExamples.find(ex => ex.id === selectedId)?.description}
      </span>
    </div>
  )
}
