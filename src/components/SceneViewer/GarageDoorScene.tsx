import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrthographicCamera, Text, OrbitControls } from '@react-three/drei'
import { useLadderStore } from '../../store/ladderStore'
import { useThemeColors } from '../../hooks/useThemeColors'
import { PLCTooltip } from './PLCTooltip'
import * as THREE from 'three'

function GarageDoorContent() {
  const c = useThemeColors()
  const doorRef = useRef<THREE.Mesh>(null!)
  const doorLinesRef = useRef<THREE.Group>(null!)
  const doorPosition = useRef(0) // 0 = bottom, 1 = top
  const prevLimits = useRef({ top: false, bottom: true })
  const [hovered, setHovered] = useState<{ address: string; label: string; position: [number,number,number] } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ y: 0, doorPos: 0 })
  const wasClosingRef = useRef(false)
  
  const highlightedAddress = useLadderStore(s => s.highlightedAddress)
  const outputs = useLadderStore(s => s.memory.outputs)
  const inputs = useLadderStore(s => s.memory.inputs)
  const timers = useLadderStore(s => s.memory.timers)
  
  // Pulse effect for highlighted elements
  const getPulseScale = (address: string): number => {
    if (address === highlightedAddress) {
      return 1 + 0.15 * Math.sin(Date.now() * 0.006)
    }
    return 1
  }

  const getPulseIntensity = (address: string, baseIntensity: number): number => {
    if (address === highlightedAddress) {
      return Math.max(baseIntensity, 4)
    }
    return baseIntensity
  }

  // Determine door status (no setState during render — use ref)
  const motorUp = outputs['O:0/0']
  const motorDown = outputs['O:0/1']
  if (motorDown) wasClosingRef.current = true
  else if (!motorDown && !motorUp) wasClosingRef.current = false

  let statusText = 'STOPPED'
  let statusColor = '#666666'
  if (motorUp) { statusText = 'OPENING...'; statusColor = '#00ff88' }
  else if (motorDown) { statusText = 'CLOSING...'; statusColor = '#ffaa00' }
  else if (inputs['I:0/4'] && wasClosingRef.current) { statusText = 'SAFETY STOP!'; statusColor = '#ff3333' }
  else if (inputs['I:0/2']) { statusText = 'OPEN'; statusColor = '#00ff88' }
  else if (inputs['I:0/3']) { statusText = 'CLOSED'; statusColor = '#666666' }

  const timer = timers['T4:0']
  const timerCountdown = timer?.timing ? `Auto-close in ${Math.ceil(timer.preset - timer.accumulated)}s` : null
  
  useFrame((_, delta) => {
    const store = useLadderStore.getState()
    const { isRunning, tick } = store
    const outputs = store.memory.outputs
    const motorUp = outputs['O:0/0']
    const motorDown = outputs['O:0/1']

    // 1. Animate door position FIRST (before tick)
    if (doorRef.current && !isDragging) {
      const speed = 1.5 * delta
      if (motorUp && doorPosition.current < 1) {
        doorPosition.current = Math.min(1, doorPosition.current + speed)
      } else if (motorDown && doorPosition.current > 0) {
        doorPosition.current = Math.max(0, doorPosition.current - speed)
      }
      doorRef.current.position.y = doorPosition.current * 2
      if (doorLinesRef.current) {
        doorLinesRef.current.position.y = doorPosition.current * 2
      }
    }

    // 2. Update limit switches SYNCHRONOUSLY before tick
    const newTop = doorPosition.current >= 0.98
    const newBottom = doorPosition.current <= 0.02
    if (newTop !== prevLimits.current.top || newBottom !== prevLimits.current.bottom) {
      const wasTop = prevLimits.current.top
      const wasBottom = prevLimits.current.bottom
      prevLimits.current = { top: newTop, bottom: newBottom }
      const cur = useLadderStore.getState()
      useLadderStore.setState({
        memory: {
          ...cur.memory,
          inputs: {
            ...cur.memory.inputs,
            'I:0/2': newTop,
            'I:0/3': newBottom,
            ...(newTop && !wasTop ? { 'I:0/0': false } : {}),
            ...(newBottom && !wasBottom ? { 'I:0/1': false } : {}),
          }
        }
      })
    }

    // 3. NOW tick with up-to-date limit switches
    if (isRunning) {
      tick(delta)
    }
  })

  const handleDoorPointerDown = (event: any) => {
    event.stopPropagation()
    setIsDragging(true)
    setDragStart({ y: event.point.y, doorPos: doorPosition.current })
    document.body.style.cursor = 'grabbing'
  }

  const handleDoorPointerMove = (event: any) => {
    if (!isDragging) return
    event.stopPropagation()
    
    const deltaY = event.point.y - dragStart.y
    const newPos = Math.max(0, Math.min(1, dragStart.doorPos + deltaY / 2))
    
    doorPosition.current = newPos
    if (doorRef.current) {
      doorRef.current.position.y = newPos * 2
    }
    if (doorLinesRef.current) {
      doorLinesRef.current.position.y = newPos * 2
    }
  }

  const handleDoorPointerUp = () => {
    setIsDragging(false)
    document.body.style.cursor = 'grab'
  }

  const getValueForAddress = (addr: string): boolean => {
    const memory = useLadderStore.getState().memory
    if (addr.startsWith('I:')) return memory.inputs[addr] || false
    if (addr.startsWith('O:')) return memory.outputs[addr] || false
    if (addr.startsWith('B3:')) return memory.bits[addr] || false
    return false
  }

  return (
    <>
      {/* Status Text */}
      <Text position={[0, 4.5, 0.04]} fontSize={0.25} color={statusColor} anchorX="center" anchorY="middle">
        {statusText}
      </Text>

      {/* Timer Countdown */}
      {timerCountdown && (
        <Text position={[0, 4.1, 0.04]} fontSize={0.18} color="#ffaa00" anchorX="center" anchorY="middle">
          {timerCountdown}
        </Text>
      )}

      {/* Garage Frame */}
      <mesh position={[0, 1, 0]}>
        <planeGeometry args={[4, 4]} />
        <meshBasicMaterial color="#666" transparent opacity={0} />
      </mesh>
      
      {/* Frame outline */}
      <mesh position={[-2, 1, 0.01]}>
        <planeGeometry args={[0.1, 4]} />
        <meshBasicMaterial color="#666" />
      </mesh>
      <mesh position={[2, 1, 0.01]}>
        <planeGeometry args={[0.1, 4]} />
        <meshBasicMaterial color="#666" />
      </mesh>
      <mesh position={[0, 3, 0.01]}>
        <planeGeometry args={[4, 0.1]} />
        <meshBasicMaterial color="#666" />
      </mesh>

      {/* Door Panel - draggable */}
      <mesh 
        ref={doorRef} 
        position={[0, 0, 0.02]}
        onPointerDown={handleDoorPointerDown}
        onPointerMove={handleDoorPointerMove}
        onPointerUp={handleDoorPointerUp}
        onPointerOver={() => document.body.style.cursor = isDragging ? 'grabbing' : 'grab'}
        onPointerOut={() => document.body.style.cursor = 'default'}
      >
        <planeGeometry args={[3.5, 2]} />
        <meshBasicMaterial 
          color="#8B4513"
        />
      </mesh>
      
      {/* Door panel lines - also draggable */}
      <group 
        ref={doorLinesRef} 
        position={[0, 0, 0.03]}
        onPointerDown={handleDoorPointerDown}
        onPointerMove={handleDoorPointerMove}
        onPointerUp={handleDoorPointerUp}
        onPointerOver={() => document.body.style.cursor = isDragging ? 'grabbing' : 'grab'}
        onPointerOut={() => document.body.style.cursor = 'default'}
      >
        <mesh position={[0, 0.5, 0]}>
          <planeGeometry args={[3.2, 0.05]} />
          <meshBasicMaterial color="#654321" />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[3.2, 0.05]} />
          <meshBasicMaterial color="#654321" />
        </mesh>
        <mesh position={[0, -0.5, 0]}>
          <planeGeometry args={[3.2, 0.05]} />
          <meshBasicMaterial color="#654321" />
        </mesh>
      </group>

      {/* Top Limit Switch */}
      <mesh 
        position={[-1.5, 2.8, 0.02]}
        scale={getPulseScale('I:0/2')}
        onPointerEnter={() => {
          setHovered({ address: 'I:0/2', label: 'Top Limit Switch', position: [-1.5, 3.3, 0.05] })
          useLadderStore.getState().setHighlightedAddress('I:0/2')
        }}
        onPointerLeave={() => {
          setHovered(null)
          useLadderStore.getState().setHighlightedAddress(null)
        }}
      >
        <circleGeometry args={[0.1]} />
        <meshStandardMaterial 
          color={inputs['I:0/2'] ? '#00ff88' : '#333'} 
          emissive={inputs['I:0/2'] ? '#00ff88' : '#000'}
          emissiveIntensity={getPulseIntensity('I:0/2', inputs['I:0/2'] ? 2 : 0)}
        />
      </mesh>

      {/* Bottom Limit Switch */}
      <mesh 
        position={[-1.5, -0.8, 0.02]}
        scale={getPulseScale('I:0/3')}
        onPointerEnter={() => {
          setHovered({ address: 'I:0/3', label: 'Bottom Limit Switch', position: [-1.5, -0.3, 0.05] })
          useLadderStore.getState().setHighlightedAddress('I:0/3')
        }}
        onPointerLeave={() => {
          setHovered(null)
          useLadderStore.getState().setHighlightedAddress(null)
        }}
      >
        <circleGeometry args={[0.1]} />
        <meshStandardMaterial 
          color={inputs['I:0/3'] ? '#00ff88' : '#333'} 
          emissive={inputs['I:0/3'] ? '#00ff88' : '#000'}
          emissiveIntensity={getPulseIntensity('I:0/3', inputs['I:0/3'] ? 2 : 0)}
        />
      </mesh>

      {/* Photocell Beam */}
      <mesh 
        position={[0, 0.3, 0.02]} 
        scale={getPulseScale('I:0/4')}
        onPointerEnter={() => {
          setHovered({ address: 'I:0/4', label: 'Photocell Beam', position: [0, 0.8, 0.05] })
          useLadderStore.getState().setHighlightedAddress('I:0/4')
        }}
        onPointerLeave={() => {
          setHovered(null)
          useLadderStore.getState().setHighlightedAddress(null)
        }}
      >
        <planeGeometry args={[3, 0.05]} />
        <meshBasicMaterial 
          color={inputs['I:0/4'] ? '#ff3333' : '#ffaa00'} 
          transparent 
          opacity={0.7}
        />
      </mesh>

      {/* Obstacle visualization when photocell is blocked */}
      {inputs['I:0/4'] && (
        <mesh position={[0, 0.3, 0.025]}>
          <planeGeometry args={[0.4, 0.4]} />
          <meshBasicMaterial color="#ff6666" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Light */}
      <mesh 
        position={[0, 3.5, 0.02]}
        scale={getPulseScale('O:0/2')}
        onPointerEnter={() => {
          setHovered({ address: 'O:0/2', label: 'Light', position: [0, 4, 0.05] })
          useLadderStore.getState().setHighlightedAddress('O:0/2')
        }}
        onPointerLeave={() => {
          setHovered(null)
          useLadderStore.getState().setHighlightedAddress(null)
        }}
      >
        <circleGeometry args={[0.2]} />
        <meshStandardMaterial 
          color={outputs['O:0/2'] ? '#ffff00' : '#333'} 
          emissive={outputs['O:0/2'] ? '#ffff00' : '#000'}
          emissiveIntensity={getPulseIntensity('O:0/2', outputs['O:0/2'] ? 2 : 0)}
        />
      </mesh>

      {/* BTN UP */}
      <mesh 
        position={[3, 1.5, 0.02]} 
        scale={getPulseScale('I:0/0')}
        onPointerEnter={() => {
          setHovered({ address: 'I:0/0', label: 'Button Up', position: [3, 2, 0.05] })
          useLadderStore.getState().setHighlightedAddress('I:0/0')
        }}
        onPointerLeave={() => {
          setHovered(null)
          useLadderStore.getState().setHighlightedAddress(null)
        }}
      >
        <circleGeometry args={[0.3]} />
        <meshStandardMaterial 
          color={inputs['I:0/0'] ? '#00ff88' : c.accentBlue} 
          emissive={inputs['I:0/0'] ? '#00ff88' : '#000'}
          emissiveIntensity={getPulseIntensity('I:0/0', inputs['I:0/0'] ? 1 : 0)}
        />
      </mesh>

      {/* BTN DOWN */}
      <mesh 
        position={[3, 0.5, 0.02]} 
        scale={getPulseScale('I:0/1')}
        onPointerEnter={() => {
          setHovered({ address: 'I:0/1', label: 'Button Down', position: [3, 1, 0.05] })
          useLadderStore.getState().setHighlightedAddress('I:0/1')
        }}
        onPointerLeave={() => {
          setHovered(null)
          useLadderStore.getState().setHighlightedAddress(null)
        }}
      >
        <circleGeometry args={[0.3]} />
        <meshStandardMaterial 
          color={inputs['I:0/1'] ? '#ff3333' : c.accentBlue} 
          emissive={inputs['I:0/1'] ? '#ff3333' : '#000'}
          emissiveIntensity={getPulseIntensity('I:0/1', inputs['I:0/1'] ? 1 : 0)}
        />
      </mesh>

      {/* Motor Direction Indicators */}
      {/* Up Arrow */}
      <mesh 
        position={[3, 2.5, 0.02]}
        scale={getPulseScale('O:0/0')}
        onPointerEnter={() => {
          setHovered({ address: 'O:0/0', label: 'Motor Up', position: [3, 3, 0.05] })
          useLadderStore.getState().setHighlightedAddress('O:0/0')
        }}
        onPointerLeave={() => {
          setHovered(null)
          useLadderStore.getState().setHighlightedAddress(null)
        }}
      >
        <planeGeometry args={[0.3, 0.15]} />
        <meshStandardMaterial 
          color={outputs['O:0/0'] ? '#00ff88' : '#333'} 
          emissive={outputs['O:0/0'] ? '#00ff88' : '#000'}
          emissiveIntensity={getPulseIntensity('O:0/0', outputs['O:0/0'] ? 2 : 0)}
        />
      </mesh>
      {/* Down Arrow */}
      <mesh 
        position={[3, -0.5, 0.02]}
        scale={getPulseScale('O:0/1')}
        onPointerEnter={() => {
          setHovered({ address: 'O:0/1', label: 'Motor Down', position: [3, 0, 0.05] })
          useLadderStore.getState().setHighlightedAddress('O:0/1')
        }}
        onPointerLeave={() => {
          setHovered(null)
          useLadderStore.getState().setHighlightedAddress(null)
        }}
      >
        <planeGeometry args={[0.3, 0.15]} />
        <meshStandardMaterial 
          color={outputs['O:0/1'] ? '#ff3333' : '#333'} 
          emissive={outputs['O:0/1'] ? '#ff3333' : '#000'}
          emissiveIntensity={getPulseIntensity('O:0/1', outputs['O:0/1'] ? 2 : 0)}
        />
      </mesh>

      {/* Labels with I/O addresses */}
      <Text position={[-1.5, 3.2, 0.03]} fontSize={0.13} color={c.textMuted} anchorX="center" anchorY="middle">
        {'TOP LIMIT (I:0/2)'}
      </Text>
      <Text position={[-1.5, -1.1, 0.03]} fontSize={0.13} color={c.textMuted} anchorX="center" anchorY="middle">
        {'BTM LIMIT (I:0/3)'}
      </Text>
      <Text position={[0, -0.1, 0.03]} fontSize={0.13} color="#ffaa00" anchorX="center" anchorY="middle">
        {'PHOTOCELL (I:0/4)'}
      </Text>
      <Text position={[3, 1.8, 0.03]} fontSize={0.13} color={c.textMuted} anchorX="center" anchorY="middle">
        {'BTN UP (I:0/0)'}
      </Text>
      <Text position={[3, 0.2, 0.03]} fontSize={0.13} color={c.textMuted} anchorX="center" anchorY="middle">
        {'BTN DN (I:0/1)'}
      </Text>
      <Text position={[3, 2.8, 0.03]} fontSize={0.13} color={c.textMuted} anchorX="center" anchorY="middle">
        {'UP (O:0/0)'}
      </Text>
      <Text position={[3, -0.8, 0.03]} fontSize={0.13} color={c.textMuted} anchorX="center" anchorY="middle">
        {'DOWN (O:0/1)'}
      </Text>
      <Text position={[0, 3.8, 0.03]} fontSize={0.13} color={c.textMuted} anchorX="center" anchorY="middle">
        {'LIGHT (O:0/2)'}
      </Text>
      <Text position={[0, -1.5, 0.03]} fontSize={0.12} color={c.textMuted} anchorX="center" anchorY="middle">
        Use ladder toolbar checkboxes to toggle inputs
      </Text>

      {/* Tooltip */}
      {hovered && (
        <PLCTooltip
          address={hovered.address}
          label={hovered.label}
          value={getValueForAddress(hovered.address)}
          visible={true}
          position={hovered.position}
        />
      )}
    </>
  )
}

export function GarageDoorScene() {
  const c = useThemeColors()
  
  return (
    <Canvas style={{ background: c.sceneBg }}>
      <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={60} />
      <ambientLight intensity={0.8} />
      <OrbitControls 
        enableRotate={false}
        enableZoom={true}
        enablePan={true}
        minZoom={20}
        maxZoom={150}
      />
      <GarageDoorContent />
    </Canvas>
  )
}