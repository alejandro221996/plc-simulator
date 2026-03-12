import { useLadderStore } from '../../store/ladderStore'
import { useThemeColors } from '../../hooks/useThemeColors'

export function SandboxPanel({ compact }: { compact?: boolean }) {
  const memory = useLadderStore(s => s.memory)
  const c = useThemeColors()

  const LEDIndicator = ({ address, value }: { address: string; value: boolean }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: compact ? '4px' : '8px', marginBottom: compact ? 0 : '4px' }}>
      <div
        style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          backgroundColor: value ? '#00ff88' : '#444',
          border: `1px solid ${c.borderColor}`,
        }}
      />
      <span style={{ fontFamily: 'monospace', fontSize: '12px', color: c.textPrimary }}>
        {address}: {value ? 'ON' : 'OFF'}
      </span>
    </div>
  )

  const TimerDisplay = ({ address }: { address: string }) => {
    const timer = memory.timers[address]
    if (!timer) return null
    
    const progress = timer.preset > 0 ? (timer.accumulated / timer.preset) * 100 : 0

    if (compact) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ fontFamily: 'monospace', fontSize: '12px', color: c.textPrimary }}>
            {address}: {timer.accumulated.toFixed(1)}/{timer.preset}s
          </span>
        </div>
      )
    }

    return (
      <div style={{ marginBottom: '8px' }}>
        <div style={{ fontFamily: 'monospace', fontSize: '12px', color: c.textPrimary, marginBottom: '2px' }}>
          {address}: {timer.accumulated.toFixed(1)}s / {timer.preset}s
        </div>
        <div
          style={{
            width: '120px',
            height: '8px',
            backgroundColor: c.borderColor,
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${progress}%`,
              height: '100%',
              backgroundColor: timer.timing ? '#00ff88' : '#666',
              transition: 'width 0.1s ease',
            }}
          />
        </div>
      </div>
    )
  }

  if (compact) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: c.bgSecondary,
          padding: '8px 16px',
          fontFamily: 'monospace',
          fontSize: '12px',
          color: c.textPrimary,
          overflow: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        <LEDIndicator address="I:0/0" value={memory.inputs['I:0/0'] || false} />
        <LEDIndicator address="I:0/1" value={memory.inputs['I:0/1'] || false} />
        <LEDIndicator address="I:0/2" value={memory.inputs['I:0/2'] || false} />
        <LEDIndicator address="I:0/3" value={memory.inputs['I:0/3'] || false} />
        <div style={{ width: '1px', height: '24px', backgroundColor: c.borderColor }} />
        <LEDIndicator address="O:0/0" value={memory.outputs['O:0/0'] || false} />
        <LEDIndicator address="O:0/1" value={memory.outputs['O:0/1'] || false} />
        <LEDIndicator address="O:0/2" value={memory.outputs['O:0/2'] || false} />
        <LEDIndicator address="O:0/3" value={memory.outputs['O:0/3'] || false} />
        <div style={{ width: '1px', height: '24px', backgroundColor: c.borderColor }} />
        <TimerDisplay address="T4:0" />
        <TimerDisplay address="T4:1" />
        <div style={{ width: '1px', height: '24px', backgroundColor: c.borderColor }} />
        <LEDIndicator address="B3:0/0" value={memory.bits['B3:0/0'] || false} />
        <LEDIndicator address="B3:0/1" value={memory.bits['B3:0/1'] || false} />
      </div>
    )
  }

  if (compact) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: c.bgSecondary,
          padding: '8px 16px',
          fontFamily: 'monospace',
          fontSize: '12px',
          color: c.textPrimary,
          overflow: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        <LEDIndicator address="I:0/0" value={memory.inputs['I:0/0'] || false} />
        <LEDIndicator address="I:0/1" value={memory.inputs['I:0/1'] || false} />
        <LEDIndicator address="I:0/2" value={memory.inputs['I:0/2'] || false} />
        <LEDIndicator address="I:0/3" value={memory.inputs['I:0/3'] || false} />
        <div style={{ width: '1px', height: '24px', backgroundColor: c.borderColor }} />
        <LEDIndicator address="O:0/0" value={memory.outputs['O:0/0'] || false} />
        <LEDIndicator address="O:0/1" value={memory.outputs['O:0/1'] || false} />
        <LEDIndicator address="O:0/2" value={memory.outputs['O:0/2'] || false} />
        <LEDIndicator address="O:0/3" value={memory.outputs['O:0/3'] || false} />
        <div style={{ width: '1px', height: '24px', backgroundColor: c.borderColor }} />
        <TimerDisplay address="T4:0" />
        <TimerDisplay address="T4:1" />
        <div style={{ width: '1px', height: '24px', backgroundColor: c.borderColor }} />
        <LEDIndicator address="B3:0/0" value={memory.bits['B3:0/0'] || false} />
        <LEDIndicator address="B3:0/1" value={memory.bits['B3:0/1'] || false} />
      </div>
    )
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: c.bgSecondary,
        padding: '16px',
        fontFamily: 'monospace',
        fontSize: '12px',
        color: c.textPrimary,
        overflow: 'auto',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', maxWidth: '600px' }}>
        <div>
          <h3 style={{ margin: '0 0 12px 0', color: c.accentBlue }}>Inputs</h3>
          <LEDIndicator address="I:0/0" value={memory.inputs['I:0/0'] || false} />
          <LEDIndicator address="I:0/1" value={memory.inputs['I:0/1'] || false} />
          <LEDIndicator address="I:0/2" value={memory.inputs['I:0/2'] || false} />
          <LEDIndicator address="I:0/3" value={memory.inputs['I:0/3'] || false} />
        </div>

        <div>
          <h3 style={{ margin: '0 0 12px 0', color: c.accentOrange }}>Outputs</h3>
          <LEDIndicator address="O:0/0" value={memory.outputs['O:0/0'] || false} />
          <LEDIndicator address="O:0/1" value={memory.outputs['O:0/1'] || false} />
          <LEDIndicator address="O:0/2" value={memory.outputs['O:0/2'] || false} />
          <LEDIndicator address="O:0/3" value={memory.outputs['O:0/3'] || false} />
        </div>

        <div>
          <h3 style={{ margin: '0 0 12px 0', color: c.accentCyan }}>Timers</h3>
          <TimerDisplay address="T4:0" />
          <TimerDisplay address="T4:1" />
        </div>

        <div>
          <h3 style={{ margin: '0 0 12px 0', color: c.accentCyan }}>Bits</h3>
          <LEDIndicator address="B3:0/0" value={memory.bits['B3:0/0'] || false} />
          <LEDIndicator address="B3:0/1" value={memory.bits['B3:0/1'] || false} />
        </div>
      </div>

      <div
        style={{
          marginTop: '24px',
          padding: '12px',
          backgroundColor: c.bgPrimary,
          borderRadius: '4px',
          border: `1px solid ${c.borderColor}`,
          color: c.textMuted,
        }}
      >
        Build your ladder program and use toolbar checkboxes to test
      </div>
    </div>
  )
}