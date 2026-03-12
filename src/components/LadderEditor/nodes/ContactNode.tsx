import { useState } from 'react'
import { Handle, Position } from '@xyflow/react'
import { useThemeColors } from '../../../hooks/useThemeColors'
import { useLadderStore } from '../../../store/ladderStore'

interface ContactNodeData {
  address: string
  label?: string
  type: 'contact-no' | 'contact-nc'
  energized: boolean
  highlighted?: boolean
  powerIn?: boolean
  powerOut?: boolean
  blocking?: boolean
  onUpdateAddress?: (address: string) => void
  onDelete?: () => void
}

interface ContactNodeProps {
  data: ContactNodeData
}

export function ContactNode({ data }: ContactNodeProps) {
  const { address, label, type, energized, highlighted, powerOut, blocking, onUpdateAddress, onDelete } = data
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(address)
  const [showTooltip, setShowTooltip] = useState(false)
  const c = useThemeColors()
  const isNC = type === 'contact-nc'
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
  
  return (
    <div 
      style={{
        background: energized ? c.nodeBgActive : c.nodeBg,
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
          {type === 'contact-no' 
            ? `"${address} is OFF — needs ON to pass current"`
            : `"${address} is ON — NC needs OFF to pass current"`
          }
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
        --[{isNC ? '/' : ' '}]--
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