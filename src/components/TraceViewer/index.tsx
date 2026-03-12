import { useRef, useEffect, useState } from 'react'
import { useTraceStore } from '../../store/traceStore'
import { useLadderStore } from '../../store/ladderStore'
import { useThemeColors } from '../../hooks/useThemeColors'

export function TraceViewer() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const colors = useThemeColors()
  
  const { snapshots, isRecording, selectedSignals, toggleRecording, toggleSignal, clearTrace } = useTraceStore()
  const memory = useLadderStore(s => s.memory)
  
  // Get all available addresses
  const availableAddresses = [
    ...Object.keys(memory.inputs),
    ...Object.keys(memory.outputs)
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || isCollapsed) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.fillStyle = colors.bgSecondary
    ctx.fillRect(0, 0, rect.width, rect.height)

    if (selectedSignals.length === 0 || snapshots.length === 0) return

    const rowHeight = 40
    const labelWidth = 80
    const signalWidth = rect.width - labelWidth - 20
    // Stretch samples to fill available width
    const pixelsPerSample = snapshots.length > 1 ? signalWidth / (snapshots.length - 1) : signalWidth

    // Draw grid
    ctx.strokeStyle = colors.borderColor
    ctx.lineWidth = 0.5
    const gridStep = Math.max(1, Math.floor(snapshots.length / 20))
    for (let i = 0; i < snapshots.length; i += gridStep) {
      const x = labelWidth + i * pixelsPerSample
      if (x < rect.width) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, rect.height)
        ctx.stroke()
      }
    }

    // Draw signals
    selectedSignals.forEach((address, signalIndex) => {
      const y = signalIndex * rowHeight + 15
      const highY = y - 8
      const lowY = y + 8

      // Draw label
      ctx.fillStyle = colors.textMuted
      ctx.font = '12px monospace'
      ctx.textAlign = 'right'
      ctx.fillText(address, labelWidth - 5, y + 3)

      // Draw waveform
      ctx.strokeStyle = colors.accentCyan
      ctx.lineWidth = 1
      ctx.beginPath()

      let lastValue = false
      let lastX = labelWidth

      for (let i = 0; i < snapshots.length; i++) {
        const snapshot = snapshots[i]
        const isInput = address.startsWith('I:')
        const value = isInput ? snapshot.inputs[address] : snapshot.outputs[address]
        
        const x = labelWidth + i * pixelsPerSample
        
        if (i === 0) {
          ctx.moveTo(x, value ? highY : lowY)
        } else {
          // Draw transition if value changed
          if (value !== lastValue) {
            ctx.lineTo(x, lastValue ? highY : lowY)
            ctx.lineTo(x, value ? highY : lowY)
          } else {
            ctx.lineTo(x, value ? highY : lowY)
          }
        }
        
        lastValue = value
        lastX = x
      }

      ctx.stroke()

      // Draw current state indicator
      ctx.fillStyle = lastValue ? '#00ff88' : '#666'
      ctx.beginPath()
      ctx.arc(lastX, lastValue ? highY : lowY, 3, 0, Math.PI * 2)
      ctx.fill()
    })
  }, [snapshots, selectedSignals, colors, isCollapsed])

  return (
    <div style={{ 
      background: colors.bgSecondary, 
      borderTop: `1px solid ${colors.borderColor}`,
      borderBottom: `1px solid ${colors.borderColor}`
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        background: colors.bgPrimary,
        borderBottom: isCollapsed ? 'none' : `1px solid ${colors.borderColor}`
      }}>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            background: 'none',
            border: 'none',
            color: colors.textPrimary,
            cursor: 'pointer',
            marginRight: '8px',
            fontSize: '14px'
          }}
        >
          {isCollapsed ? '▶' : '▼'}
        </button>
        
        <span style={{ color: colors.textPrimary, fontWeight: 'bold', marginRight: '16px' }}>
          Logic Analyzer
        </span>
        
        <button
          onClick={toggleRecording}
          style={{
            background: isRecording ? '#ff3333' : colors.borderColor,
            border: 'none',
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '8px',
            fontSize: '12px'
          }}
        >
          {isRecording ? '⏹ Recording' : '⏺ Record'}
        </button>
        
        <button
          onClick={clearTrace}
          style={{
            background: colors.borderColor,
            border: 'none',
            color: colors.textPrimary,
            padding: '4px 8px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          Clear
        </button>
        
        <span style={{ color: colors.textMuted, marginLeft: '16px', fontSize: '12px' }}>
          {snapshots.length} samples
        </span>
      </div>

      {!isCollapsed && (
        <>
          {/* Signal selector */}
          <div style={{
            padding: '8px 12px',
            background: colors.bgPrimary,
            borderBottom: `1px solid ${colors.borderColor}`,
            display: 'flex',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            {availableAddresses.map(address => (
              <label key={address} style={{
                display: 'flex',
                alignItems: 'center',
                color: colors.textMuted,
                fontSize: '12px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={selectedSignals.includes(address)}
                  onChange={() => toggleSignal(address)}
                  style={{ marginRight: '4px' }}
                />
                {address}
              </label>
            ))}
          </div>

          {/* Canvas area */}
          <div style={{ position: 'relative' }}>
            <canvas
              ref={canvasRef}
              style={{
                width: '100%',
                height: Math.max(150, selectedSignals.length * 40 + 20),
                display: 'block'
              }}
            />
            {selectedSignals.length === 0 && (
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                color: colors.textMuted,
                fontSize: '14px'
              }}>
                Select signals to display
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}