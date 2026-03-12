import { Html } from '@react-three/drei'

interface PLCTooltipProps {
  address: string
  label: string
  value: boolean
  visible: boolean
  position: [number, number, number]
}

export function PLCTooltip({ address, label, value, visible, position }: PLCTooltipProps) {
  if (!visible) return null

  return (
    <Html position={position} center distanceFactor={8}>
      <div style={{
        background: 'rgba(0,0,0,0.9)',
        border: '1px solid #0ff',
        color: '#fff',
        fontFamily: 'monospace',
        fontSize: '11px',
        padding: '4px 8px',
        borderRadius: '2px',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        width: '150px'
      }}>
        <div>{address} ({label})</div>
        <div style={{ color: value ? '#00ff88' : '#666' }}>
          Status: {value ? 'ON' : 'OFF'}
        </div>
      </div>
    </Html>
  )
}