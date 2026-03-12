import { useState } from 'react'
import { useFaultStore, type FaultType } from '../../store/faultStore'
import { useThemeColors } from '../../hooks/useThemeColors'

export function FaultPanel() {
  const c = useThemeColors()
  const [collapsed, setCollapsed] = useState(true)
  const [newAddress, setNewAddress] = useState('')
  const [newType, setNewType] = useState<FaultType>('stuck-off')
  
  const { faults, addFault, removeFault, clearFaults } = useFaultStore()
  
  const handleAdd = () => {
    if (newAddress.trim()) {
      addFault(newAddress.trim(), newType)
      setNewAddress('')
    }
  }
  
  const addPreset = (address: string, type: FaultType) => {
    addFault(address, type)
  }

  return (
    <div style={{
      borderBottom: `1px solid ${c.borderColor}`,
      background: c.bgSecondary,
      color: c.textPrimary,
      fontFamily: 'monospace',
      fontSize: '12px',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px',
        borderBottom: `1px solid ${c.borderColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '14px' }}>⚠️</span>
          <span style={{ color: c.textPrimary, fontWeight: 'bold' }}>
            Fault Injection
          </span>
          {Object.keys(faults).length > 0 && (
            <span style={{
              color: c.accentOrange,
              fontSize: '10px',
              background: c.bgPrimary,
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              {Object.keys(faults).length}
            </span>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'none',
            border: 'none',
            color: c.textMuted,
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {collapsed ? '▲' : '▼'}
        </button>
      </div>

      {!collapsed && (
        <div style={{ padding: '12px' }}>
          {/* Clear All Button */}
          {Object.keys(faults).length > 0 && (
            <button
              onClick={clearFaults}
              style={{
                width: '100%',
                padding: '6px',
                marginBottom: '12px',
                background: c.bgPrimary,
                border: `1px solid ${c.borderColor}`,
                color: c.textMuted,
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              Clear All
            </button>
          )}

          {/* Active Faults */}
          {Object.keys(faults).length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              {Object.entries(faults).map(([address, type]) => (
                <div
                  key={address}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    marginBottom: '4px',
                    background: c.bgPrimary,
                    border: `1px solid ${c.accentOrange}`,
                    borderRadius: '4px',
                    animation: 'pulse 2s infinite'
                  }}
                >
                  <div>
                    <span style={{ color: c.textPrimary, fontWeight: 'bold' }}>
                      {address}
                    </span>
                    <span style={{ color: c.textMuted, fontSize: '10px', marginLeft: '8px' }}>
                      {type}
                    </span>
                  </div>
                  <button
                    onClick={() => removeFault(address)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: c.accentOrange,
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Fault Form */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
              <input
                type="text"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                placeholder="I:0/2, O:0/0"
                style={{
                  flex: 1,
                  padding: '4px 6px',
                  background: c.inputBg,
                  border: `1px solid ${c.borderColor}`,
                  color: c.textPrimary,
                  borderRadius: '2px',
                  fontSize: '11px'
                }}
              />
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as FaultType)}
                style={{
                  padding: '4px',
                  background: c.inputBg,
                  border: `1px solid ${c.borderColor}`,
                  color: c.textPrimary,
                  borderRadius: '2px',
                  fontSize: '11px'
                }}
              >
                <option value="stuck-on">stuck-on</option>
                <option value="stuck-off">stuck-off</option>
                <option value="intermittent">intermittent</option>
              </select>
            </div>
            <button
              onClick={handleAdd}
              style={{
                width: '100%',
                padding: '6px',
                background: c.accentOrange,
                border: 'none',
                color: '#000',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '11px',
                fontWeight: 'bold'
              }}
            >
              + Add
            </button>
          </div>

          {/* Presets */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button
              onClick={() => addPreset('I:0/2', 'stuck-on')}
              style={{
                padding: '4px 8px',
                background: c.bgPrimary,
                border: `1px solid ${c.borderColor}`,
                color: c.textMuted,
                borderRadius: '2px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              Sensor Stuck
            </button>
            <button
              onClick={() => addPreset('O:0/0', 'stuck-off')}
              style={{
                padding: '4px 8px',
                background: c.bgPrimary,
                border: `1px solid ${c.borderColor}`,
                color: c.textMuted,
                borderRadius: '2px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              Motor Failure
            </button>
            <button
              onClick={() => addPreset('I:0/0', 'stuck-off')}
              style={{
                padding: '4px 8px',
                background: c.bgPrimary,
                border: `1px solid ${c.borderColor}`,
                color: c.textMuted,
                borderRadius: '2px',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              Wire Break
            </button>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}