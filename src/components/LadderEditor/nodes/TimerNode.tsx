import { useState } from 'react'
import { Handle, Position } from '@xyflow/react'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { useLadderStore } from '../../../store/ladderStore'

interface TimerNodeData {
  address: string
  preset: number
  accumulated: number
  done: boolean
  timing: boolean
  enabled: boolean
  highlighted?: boolean
  powerIn?: boolean
  powerOut?: boolean
  blocking?: boolean
  onUpdateAddress?: (address: string) => void
  onUpdatePreset?: (preset: number) => void
  onDelete?: () => void
}

interface TimerNodeProps {
  data: TimerNodeData
}

export function TimerNode({ data }: TimerNodeProps) {
  const { address, preset, accumulated, done, timing, enabled, highlighted, powerOut, blocking, onUpdateAddress, onUpdatePreset, onDelete } = data
  const [editingAddress, setEditingAddress] = useState(false)
  const [editingPreset, setEditingPreset] = useState(false)
  const [editAddressValue, setEditAddressValue] = useState(address)
  const [editPresetValue, setEditPresetValue] = useState(preset.toString())
  const c = useThemeColors()
  const progress = preset > 0 ? (accumulated / preset) * 100 : 0
  
  // Determine border style based on priority: highlighted > blocking > powerOut > default
  let borderStyle = `2px solid ${c.nodeBorder}`
  let boxShadowStyle = 'none'
  
  if (powerOut) {
    borderStyle = '2px solid #00ff88'
    boxShadowStyle = '0 0 6px rgba(0,255,136,0.3)'
  }
  if (blocking) {
    borderStyle = '2px solid #ff4444'
    boxShadowStyle = '0 0 6px rgba(255,68,68,0.5)'
  }
  if (highlighted) {
    borderStyle = '2px solid #ffaa00'
    boxShadowStyle = '0 0 8px #ffaa00'
  }
  const setHighlightedAddress = useLadderStore(s => s.setHighlightedAddress)
  
  const handleAddressClick = () => {
    if (onUpdateAddress) {
      setEditingAddress(true)
      setEditAddressValue(address)
    }
  }
  
  const handlePresetClick = () => {
    if (onUpdatePreset) {
      setEditingPreset(true)
      setEditPresetValue(preset.toString())
    }
  }
  
  const handleAddressSave = () => {
    if (onUpdateAddress && editAddressValue.trim()) {
      onUpdateAddress(editAddressValue.trim())
    }
    setEditingAddress(false)
  }
  
  const handlePresetSave = () => {
    if (onUpdatePreset) {
      const numValue = parseFloat(editPresetValue)
      if (!isNaN(numValue) && numValue >= 0) {
        onUpdatePreset(numValue)
      }
    }
    setEditingPreset(false)
  }
  
  const handleAddressKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddressSave()
    } else if (e.key === 'Escape') {
      setEditingAddress(false)
      setEditAddressValue(address)
    }
  }
  
  const handlePresetKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePresetSave()
    } else if (e.key === 'Escape') {
      setEditingPreset(false)
      setEditPresetValue(preset.toString())
    }
  }
  
  return (
    <div 
      style={{
        background: enabled ? c.timerBgActive : c.timerBg,
        border: borderStyle,
        borderRadius: '4px',
        padding: '8px',
        fontFamily: 'monospace',
        fontSize: '10px',
        color: c.textPrimary,
        minWidth: '80px',
        textAlign: 'center',
        position: 'relative',
        boxShadow: boxShadowStyle,
      }}
      onMouseEnter={() => setHighlightedAddress(address)}
      onMouseLeave={() => setHighlightedAddress(null)}
    >
      <Handle type="target" position={Position.Left} />
      
      {onDelete && (
        <button
          className="ladder-node-delete-btn"
          onClick={onDelete}
          title="Delete element"
        >
          ×
        </button>
      )}
      
      <div style={{ fontWeight: 'bold', marginBottom: '4px', color: c.accentCyan }}>
        TON
      </div>
      
      <div 
        style={{ marginBottom: '2px', cursor: onUpdateAddress ? 'pointer' : 'default' }}
        onClick={handleAddressClick}
      >
        {editingAddress ? (
          <input
            className="ladder-node-edit-input"
            value={editAddressValue}
            onChange={(e) => setEditAddressValue(e.target.value)}
            onBlur={handleAddressSave}
            onKeyDown={handleAddressKeyDown}
            onClick={(e) => e.stopPropagation()}
            autoFocus
            style={{ width: '60px', fontSize: '10px' }}
          />
        ) : (
          address
        )}
      </div>
      
      <div 
        style={{ marginBottom: '4px', fontSize: '9px', cursor: onUpdatePreset ? 'pointer' : 'default' }}
        onClick={handlePresetClick}
      >
        Preset: {editingPreset ? (
          <input
            className="ladder-node-edit-input"
            type="text"
            inputMode="decimal"
            pattern="[0-9.]*"
            value={editPresetValue}
            onChange={(e) => setEditPresetValue(e.target.value)}
            onBlur={handlePresetSave}
            onKeyDown={handlePresetKeyDown}
            onClick={(e) => e.stopPropagation()}
            autoFocus
            style={{ width: '40px', fontSize: '9px' }}
          />
        ) : (
          `${preset}s`
        )}
      </div>
      
      <div style={{ marginBottom: '4px', fontSize: '9px' }}>
        Accum: {accumulated.toFixed(1)}s
      </div>
      
      {/* Progress bar */}
      <div style={{
        width: '100%',
        height: '4px',
        background: c.timerBg,
        border: `1px solid ${c.nodeBorder}`,
        marginBottom: '4px',
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: timing ? '#ffaa00' : done ? '#00ff88' : c.nodeBorder,
          transition: 'width 0.1s',
        }} />
      </div>
      
      {/* Status bits */}
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px' }}>
        <span style={{ color: done ? '#0f0' : c.textMuted }}>DN</span>
        <span style={{ color: timing ? '#fa0' : c.textMuted }}>TT</span>
        <span style={{ color: enabled ? '#0f0' : c.textMuted }}>EN</span>
      </div>
      
      <Handle type="source" position={Position.Right} />
    </div>
  )
}