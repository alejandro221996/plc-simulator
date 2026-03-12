import { useState } from 'react'
import { Handle, Position } from '@xyflow/react'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { useLadderStore } from '../../../store/ladderStore'

interface CoilNodeData {
  address: string
  label?: string
  energized: boolean
  highlighted?: boolean
  powerIn?: boolean
  powerOut?: boolean
  blocking?: boolean
  onUpdateAddress?: (address: string) => void
  onDelete?: () => void
}

interface CoilNodeProps {
  data: CoilNodeData
}

export function CoilNode({ data }: CoilNodeProps) {
  const { address, label, energized, highlighted, powerOut, blocking, onUpdateAddress, onDelete } = data
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(address)
  const [showTooltip, setShowTooltip] = useState(false)
  const c = useThemeColors()
  const setHighlightedAddress = useLadderStore(s => s.setHighlightedAddress)
  
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
  
  const handleAddressClick = () => {
    if (onUpdateAddress) {
      setEditing(true)
      setEditValue(address)
    }
  }
  
  const handleSave = () => {
    if (onUpdateAddress && editValue.trim()) {
      onUpdateAddress(editValue.trim())
    }
    setEditing(false)
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave()
    } else if (e.key === 'Escape') {
      setEditing(false)
      setEditValue(address)
    }
  }
  
  // Color based on address (traffic light outputs) - KEEP FUNCTIONAL COLORS
  const getCoilColor = () => {
    if (address === 'O:0/0') return energized ? '#ff3333' : '#660000' // Red
    if (address === 'O:0/1') return energized ? '#ffaa00' : '#664400' // Yellow
    if (address === 'O:0/2') return energized ? '#00ff88' : '#006644' // Green
    return energized ? c.accentBlue : c.nodeBg // Generic themed
  }
  
  return (
    <div 
      style={{
        background: getCoilColor(),
        border: borderStyle,
        borderRadius: '4px',
        padding: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        color: energized ? '#000' : c.textPrimary,
        minWidth: '60px',
        textAlign: 'center',
        position: 'relative',
        boxShadow: boxShadowStyle,
      }}
      onMouseEnter={() => {
        setHighlightedAddress(address)
        setShowTooltip(true)
      }}
      onMouseLeave={() => {
        setHighlightedAddress(null)
        setShowTooltip(false)
      }}
    >
      {blocking && showTooltip && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '4px',
          background: '#1a1a2e',
          color: '#ff6666',
          border: '1px solid #ff4444',
          borderRadius: '4px',
          padding: '4px 8px',
          fontSize: '10px',
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
          zIndex: 1000,
          pointerEvents: 'none'
        }}>
          No current reaching this coil
        </div>
      )}
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
      
      <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
        --( )--
      </div>
      
      <div 
        style={{ fontSize: '10px', opacity: 0.8, cursor: onUpdateAddress ? 'pointer' : 'default' }}
        onClick={handleAddressClick}
      >
        {editing ? (
          <input
            className="ladder-node-edit-input"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        ) : (
          <>
            {label && <div>{label}</div>}
            <div style={{ fontSize: '9px', opacity: 0.6 }}>{address}</div>
          </>
        )}
      </div>
      <Handle type="source" position={Position.Right} />
    </div>
  )
}