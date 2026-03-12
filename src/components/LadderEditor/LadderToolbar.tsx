import { useLadderStore } from '../../store/ladderStore'
import { getScenarioById } from '../../scenarios/registry'
import { useThemeColors } from '../../hooks/useThemeColors'

export function LadderToolbar() {
  const { 
    isRunning, 
    memory, 
    activeScenarioId,
    speed,
    scanCount,
    start, 
    stop, 
    reset, 
    loadProgram, 
    addRung,
    clearProgram,

    toggleInput,
    setSpeed,
    step
  } = useLadderStore()
  const c = useThemeColors()
  
  const activeScenario = getScenarioById(activeScenarioId)

  const handleDragStart = (e: React.DragEvent, elementData: any) => {
    e.dataTransfer.setData('application/ladder-element', JSON.stringify(elementData))
  }
  
  return (
    <div style={{
      width: '280px',
      background: c.bgSecondary,
      border: `1px solid ${c.borderColor}`,
      borderRadius: '8px',
      padding: '16px',
      fontFamily: 'monospace',
      fontSize: '12px',
      color: c.textPrimary,
      overflowY: 'auto',
      flexShrink: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      
      {/* Section 1: Components */}
      <div>
        <h3 style={{ margin: '0 0 12px 0', color: c.accentCyan, fontSize: '14px' }}>
          Components
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, {type:'contact-no', address:'I:0/0'})}
            style={{
              padding: '12px 8px',
              border: `2px dashed ${c.nodeBorder}`,
              borderRadius: '4px',
              textAlign: 'center',
              cursor: 'grab',
              backgroundColor: c.nodeBg,
              fontSize: '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <div style={{ fontSize: '16px' }}>—| |—</div>
            <div>Contact NO</div>
          </div>
          
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, {type:'contact-nc', address:'I:0/1'})}
            style={{
              padding: '12px 8px',
              border: `2px dashed ${c.nodeBorder}`,
              borderRadius: '4px',
              textAlign: 'center',
              cursor: 'grab',
              backgroundColor: c.nodeBg,
              fontSize: '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <div style={{ fontSize: '16px' }}>—|/|—</div>
            <div>Contact NC</div>
          </div>
          
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, {type:'coil', address:'O:0/0'})}
            style={{
              padding: '12px 8px',
              border: `2px dashed ${c.nodeBorder}`,
              borderRadius: '4px',
              textAlign: 'center',
              cursor: 'grab',
              backgroundColor: c.nodeBg,
              fontSize: '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <div style={{ fontSize: '16px' }}>—( )—</div>
            <div>Coil</div>
          </div>
          
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, {type:'timer-ton', address:'T4:0'})}
            style={{
              padding: '12px 8px',
              border: `2px dashed ${c.nodeBorder}`,
              borderRadius: '4px',
              textAlign: 'center',
              cursor: 'grab',
              backgroundColor: c.nodeBg,
              fontSize: '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <div style={{ fontSize: '14px' }}>TON</div>
            <div>Timer</div>
          </div>
        </div>
      </div>

      {/* Section 2: Program Controls */}
      <div>
        <h3 style={{ margin: '0 0 12px 0', color: c.accentCyan, fontSize: '14px' }}>
          Program Controls
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={addRung}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: c.accentBlue,
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '11px',
            }}
          >
            ADD RUNG
          </button>
          
          <button
            onClick={clearProgram}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: '#ff4444',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '11px',
            }}
          >
            CLEAR ALL
          </button>
          
          <button
            onClick={loadProgram}
            style={{
              width: '100%',
              padding: '8px',
              backgroundColor: c.accentBlue,
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '11px',
            }}
          >
            LOAD DEFAULT
          </button>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={isRunning ? stop : start}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: isRunning ? '#ff4444' : '#44ff44',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'monospace',
                fontSize: '11px',
              }}
            >
              {isRunning ? 'STOP' : 'RUN'}
            </button>
            
            <button
              onClick={step}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: '#00cccc',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'monospace',
                fontSize: '11px',
              }}
            >
              STEP
            </button>
            
            <button
              onClick={reset}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: c.accentOrange,
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                fontWeight: 'bold',
                cursor: 'pointer',
                fontFamily: 'monospace',
                fontSize: '11px',
              }}
            >
              RESET
            </button>
          </div>
        </div>
      </div>
      
      {/* Section 2.5: Simulation Controls */}
      <div>
        <h3 style={{ margin: '0 0 12px 0', color: c.accentCyan, fontSize: '14px' }}>
          Simulation Controls
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '11px', color: c.textPrimary, minWidth: '40px' }}>Speed:</label>
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              style={{
                flex: 1,
                padding: '4px 8px',
                backgroundColor: c.bgSecondary,
                color: c.textPrimary,
                border: `1px solid ${c.borderColor}`,
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '11px',
              }}
            >
              <option value={0.25}>0.25x</option>
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={2}>2x</option>
              <option value={5}>5x</option>
            </select>
          </div>
          
          <div style={{ 
            fontSize: '10px', 
            color: c.textMuted, 
            fontFamily: 'monospace',
            textAlign: 'center'
          }}>
            Scans: {scanCount}
          </div>
        </div>
      </div>
      
      {/* Section 3: Inputs */}
      <div>
        <h4 style={{ margin: '0 0 8px 0', color: c.accentOrange, fontSize: '12px' }}>
          Inputs
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {activeScenario?.ioMap.inputs.map(input => (
            <label key={input.address} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                checked={memory.inputs[input.address] || false}
                onChange={() => toggleInput(input.address)}
                style={{ transform: 'scale(1.2)' }}
              />
              <span>{input.address} ({input.label})</span>
            </label>
          ))}
        </div>
      </div>
      
      {/* Section 4: I/O Reference */}
      <div>
        <h4 style={{ margin: '0 0 8px 0', color: c.accentOrange, fontSize: '12px' }}>
          I/O Reference
        </h4>
        
        {activeScenario && (
          <>
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontSize: '10px', color: c.textMuted, marginBottom: '4px' }}>
                Outputs:
              </div>
              {activeScenario.ioMap.outputs.map(output => (
                <div key={output.address} style={{ fontSize: '10px', color: c.textMuted }}>
                  {output.address} - {output.label}
                </div>
              ))}
            </div>
            
            {activeScenario.ioMap.timers.length > 0 && (
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '10px', color: c.textMuted, marginBottom: '4px' }}>
                  Timers:
                </div>
                {activeScenario.ioMap.timers.map(timer => (
                  <div key={timer.address} style={{ fontSize: '10px', color: c.textMuted }}>
                    {timer.address} - {timer.label}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Section 5: PLC Memory Display */}
      <div>
        <h4 style={{ margin: '0 0 8px 0', color: c.accentOrange, fontSize: '12px' }}>
          PLC Memory
        </h4>
        
        {/* Outputs */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '10px', color: c.textMuted, marginBottom: '4px' }}>
            Outputs:
          </div>
          {Object.entries(memory.outputs).map(([addr, value]) => (
            <div key={addr} style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '10px',
              color: value ? '#0f0' : c.textMuted
            }}>
              <span>{addr}</span>
              <span>{value ? 'ON' : 'OFF'}</span>
            </div>
          ))}
        </div>
        
        {/* Bits */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '10px', color: c.textMuted, marginBottom: '4px' }}>
            Bits:
          </div>
          {Object.entries(memory.bits).map(([addr, value]) => (
            <div key={addr} style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '10px',
              color: value ? '#0f0' : c.textMuted
            }}>
              <span>{addr}</span>
              <span>{value ? 'ON' : 'OFF'}</span>
            </div>
          ))}
        </div>
        
        {/* Timers */}
        <div>
          <div style={{ fontSize: '10px', color: c.textMuted, marginBottom: '4px' }}>
            Timers:
          </div>
          {Object.entries(memory.timers).map(([addr, timer]) => (
            <div key={addr} style={{ marginBottom: '4px' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontSize: '10px',
                color: timer.done ? '#0f0' : timer.timing ? '#fa0' : c.textMuted
              }}>
                <span>{addr}</span>
                <span>{timer.accumulated.toFixed(1)}/{timer.preset}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}