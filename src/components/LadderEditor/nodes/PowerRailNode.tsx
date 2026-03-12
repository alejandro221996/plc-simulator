import { Handle, Position } from '@xyflow/react'
import { useThemeColors } from '../../../hooks/useThemeColors'

interface PowerRailNodeData {
  type: 'left' | 'right'
  rungEnergized?: boolean
}

interface PowerRailNodeProps {
  data: PowerRailNodeData
}

export function PowerRailNode({ data }: PowerRailNodeProps) {
  const { type, rungEnergized } = data
  const c = useThemeColors()
  const isLeft = type === 'left'
  
  // Change color when rung is energized
  const railColor = rungEnergized ? '#00ff88' : c.railColor
  const railBorder = rungEnergized ? '#00ff88' : c.railBorder
  
  return (
    <div style={{
      width: '8px',
      height: '60px',
      background: railColor,
      border: `2px solid ${railBorder}`,
      borderRadius: '2px',
      position: 'relative',
      boxShadow: rungEnergized ? '0 0 8px rgba(0,255,136,0.6)' : `0 0 8px ${c.railColor}40`,
    }}>
      {rungEnergized && (
        <div style={{
          position: 'absolute',
          top: '2px',
          left: '2px',
          width: '4px',
          height: '4px',
          background: '#00ff88',
          borderRadius: '50%',
          boxShadow: '0 0 4px #00ff88',
        }} />
      )}
      {isLeft ? (
        <Handle 
          type="source" 
          position={Position.Right}
          style={{ 
            right: '-8px',
            background: railColor,
            border: `2px solid ${railBorder}`,
          }}
        />
      ) : (
        <Handle 
          type="target" 
          position={Position.Left}
          style={{ 
            left: '-8px',
            background: railColor,
            border: `2px solid ${railBorder}`,
          }}
        />
      )}
    </div>
  )
}