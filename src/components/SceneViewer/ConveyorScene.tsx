import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrthographicCamera, Text, OrbitControls } from '@react-three/drei'
import { useLadderStore } from '../../store/ladderStore'
import { useThemeColors } from '../../hooks/useThemeColors'
import { PLCTooltip } from './PLCTooltip'
import * as THREE from 'three'

interface Box {
  id: number
  x: number
  y: number
  isReject: boolean
  ejected: boolean
}

interface Stripe {
  id: number
  x: number
}

// Module-level counters — outside React, immune to StrictMode
let goodCount = 0
let rejectCount = 0
const countedGood = new Set<number>()
const countedReject = new Set<number>()

function ConveyorContent() {
  const c = useThemeColors()
  const pistonArmRef = useRef<THREE.Mesh>(null!)
  const [boxes, setBoxes] = useState<Box[]>([])
  const [stripes, setStripes] = useState<Stripe[]>(() => 
    Array.from({ length: 10 }, (_, i) => ({ id: i, x: -4 + i * 0.8 }))
  )
  const [nextBoxId, setNextBoxId] = useState(0)
  const [hovered, setHovered] = useState<{ address: string; label: string; position: [number,number,number] } | null>(null)
  const boxesRef = useRef<Box[]>([])
  
  const highlightedAddress = useLadderStore(s => s.highlightedAddress)
  
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
  
  useFrame((_, delta) => {
    const { isRunning, tick, memory } = useLadderStore.getState()
    
    if (isRunning) {
      tick(delta)
    }

    const outputs = memory.outputs
    const motorOn = outputs['O:0/0']
    const pistonExtend = outputs['O:0/1']

    // Animate belt stripes when motor is on
    if (motorOn) {
      setStripes(prev => prev.map(stripe => ({
        ...stripe,
        x: stripe.x + delta * 2 > 4 ? -4 : stripe.x + delta * 2
      })))
    }

    // Animate piston arm
    if (pistonArmRef.current) {
      const targetY = pistonExtend ? -0.5 : 1.0
      pistonArmRef.current.position.y += (targetY - pistonArmRef.current.position.y) * delta * 8
    }

    // Spawn boxes periodically when running
    if (isRunning && motorOn) {
      const timer = Math.floor(Date.now() / 3000)
      if (timer !== nextBoxId) {
        setBoxes(prev => [...prev, {
          id: nextBoxId,
          x: -4,
          y: 0.5,
          isReject: Math.random() > 0.7,
          ejected: false
        }])
        setNextBoxId(timer)
      }
    }

    // Move boxes, handle ejection
    setBoxes(prev => {
      const updated = prev.map(box => {
        if (box.ejected) {
          return { ...box, y: box.y - delta * 3 }
        }
        if (pistonExtend && box.isReject && box.x >= 0.8 && box.x <= 1.8) {
          if (!countedReject.has(box.id)) {
            countedReject.add(box.id)
            rejectCount++
          }
          return { ...box, ejected: true }
        }
        if (motorOn) {
          const newX = box.x + delta * 2
          if (!box.isReject && box.x < 1.5 && newX >= 1.5 && !countedGood.has(box.id)) {
            countedGood.add(box.id)
            goodCount++
          }
          return { ...box, x: newX }
        }
        return box
      }).filter(box => box.x < 5 && box.y > -2.5)

      boxesRef.current = updated
      return updated
    })

    // Update sensor OUTSIDE of setBoxes to avoid setState-during-render
    const boxInSensor = boxesRef.current.find(b => !b.ejected && b.x >= 0.8 && b.x <= 1.5)
    useLadderStore.setState(state => ({
      memory: {
        ...state.memory,
        inputs: {
          ...state.memory.inputs,
          'I:0/2': !!boxInSensor,
          'I:0/3': boxInSensor ? boxInSensor.isReject : false
        }
      }
    }))
  })

  const handleBeltClick = (event: any) => {
    event.stopPropagation()
    const point = event.point
    const isReject = event.shiftKey
    
    const newBox: Box = {
      id: Date.now(),
      x: point.x,
      y: 0.5,
      isReject,
      ejected: false
    }
    
    setBoxes(prev => [...prev, newBox])
  }

  const handleSensorClick = (_event: any) => {
    // Removed: use toolbar checkboxes
  }

  const handlePistonClick = (_event: any) => {
    // Removed: use toolbar checkboxes
  }

  const getValueForAddress = (addr: string): boolean => {
    const memory = useLadderStore.getState().memory
    if (addr.startsWith('I:')) return memory.inputs[addr] || false
    if (addr.startsWith('O:')) return memory.outputs[addr] || false
    if (addr.startsWith('B3:')) return memory.bits[addr] || false
    return false
  }

  const outputs = useLadderStore(s => s.memory.outputs)
  const inputs = useLadderStore(s => s.memory.inputs)

  return (
    <>
      {/* Belt Frame - Top */}
      <mesh position={[0, 1, 0.01]}>
        <planeGeometry args={[8, 0.05]} />
        <meshBasicMaterial color="#666" />
      </mesh>

      {/* Belt Frame - Bottom */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[8, 0.05]} />
        <meshBasicMaterial color="#666" />
      </mesh>

      {/* Belt Surface - clickable */}
      <mesh 
        position={[0, 0.5, 0]}
        onClick={handleBeltClick}
      >
        <planeGeometry args={[8, 1]} />
        <meshBasicMaterial color="#444" />
      </mesh>

      {/* Belt Stripes */}
      {stripes.map(stripe => (
        <mesh key={stripe.id} position={[stripe.x, 0.5, 0.01]}>
          <planeGeometry args={[0.1, 0.8]} />
          <meshBasicMaterial color="#555" />
        </mesh>
      ))}

      {/* Direction Arrows */}
      <mesh position={[-2, 0.5, 0.02]}>
        <coneGeometry args={[0.1, 0.2, 3]} />
        <meshBasicMaterial color="#555" />
      </mesh>
      <mesh position={[0, 0.5, 0.02]}>
        <coneGeometry args={[0.1, 0.2, 3]} />
        <meshBasicMaterial color="#555" />
      </mesh>
      <mesh position={[2, 0.5, 0.02]}>
        <coneGeometry args={[0.1, 0.2, 3]} />
        <meshBasicMaterial color="#555" />
      </mesh>

      {/* Sensor Emitter (top) */}
      <mesh position={[1, 1.1, 0.02]}>
        <planeGeometry args={[0.15, 0.08]} />
        <meshBasicMaterial color="#ff3333" />
      </mesh>

      {/* Sensor Receiver (bottom) */}
      <mesh position={[1, -0.1, 0.02]}>
        <planeGeometry args={[0.15, 0.08]} />
        <meshBasicMaterial color="#ff3333" />
      </mesh>

      {/* Sensor Laser Beam - clickable */}
      <mesh 
        position={[1, 0.5, 0.02]}
        scale={getPulseScale('I:0/2')}
        onClick={handleSensorClick}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'default'}
        onPointerEnter={() => {
          setHovered({ address: 'I:0/2', label: 'Sensor', position: [1, 0.8, 0.05] })
          useLadderStore.getState().setHighlightedAddress('I:0/2')
        }}
        onPointerLeave={() => {
          setHovered(null)
          useLadderStore.getState().setHighlightedAddress(null)
        }}
      >
        <planeGeometry args={[0.04, 1.2]} />
        <meshStandardMaterial 
          color="#ff3333" 
          emissive="#ff3333" 
          emissiveIntensity={getPulseIntensity('I:0/2', inputs['I:0/2'] ? 4 : 2)} 
        />
      </mesh>

      {/* Piston Body */}
      <mesh position={[1.2, 1.3, 0.02]}>
        <planeGeometry args={[0.3, 0.4]} />
        <meshBasicMaterial color="#888" />
      </mesh>

      {/* Piston Arm - clickable */}
      <mesh 
        ref={pistonArmRef}
        position={[1.2, 1.0, 0.02]}
        scale={getPulseScale('O:0/1')}
        onClick={handlePistonClick}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
        onPointerOut={() => document.body.style.cursor = 'default'}
        onPointerEnter={() => {
          setHovered({ address: 'O:0/1', label: 'Piston', position: [1.2, 1.6, 0.05] })
          useLadderStore.getState().setHighlightedAddress('O:0/1')
        }}
        onPointerLeave={() => {
          setHovered(null)
          useLadderStore.getState().setHighlightedAddress(null)
        }}
      >
        <planeGeometry args={[0.15, 1.5]} />
        <meshBasicMaterial color="#aaa" />
      </mesh>

      {/* Reject Chute */}
      <mesh position={[1.2, -1, 0.01]}>
        <planeGeometry args={[1, 2]} />
        <meshBasicMaterial color="#553322" />
      </mesh>

      {/* Reject Bin */}
      <mesh position={[1.2, -2.2, 0.01]}>
        <planeGeometry args={[1.2, 0.4]} />
        <meshBasicMaterial color="#442211" />
      </mesh>

      {/* Boxes */}
      {boxes.map(box => (
        <group key={box.id} position={[box.x, box.y, 0.02]}>
          <mesh>
            <planeGeometry args={[0.35, 0.35]} />
            <meshBasicMaterial color={box.isReject ? '#cc4444' : '#44cc44'} />
          </mesh>
          <mesh position={[0, 0, 0.01]}>
            <planeGeometry args={[0.3, 0.3]} />
            <meshBasicMaterial 
              color="transparent" 
              transparent 
              opacity={0}
            />
            <meshBasicMaterial color={box.isReject ? '#882222' : '#228822'} />
          </mesh>
        </group>
      ))}

      {/* Indicator Lights */}
      <mesh 
        position={[-3, 2, 0.02]}
        scale={getPulseScale('O:0/2')}
        onPointerEnter={() => {
          setHovered({ address: 'O:0/2', label: 'Green Indicator', position: [-3, 2.3, 0.05] })
          useLadderStore.getState().setHighlightedAddress('O:0/2')
        }}
        onPointerLeave={() => {
          setHovered(null)
          useLadderStore.getState().setHighlightedAddress(null)
        }}
      >
        <circleGeometry args={[0.2]} />
        <meshStandardMaterial 
          color={outputs['O:0/2'] ? '#00ff88' : '#333'} 
          emissive={outputs['O:0/2'] ? '#00ff88' : '#000'}
          emissiveIntensity={getPulseIntensity('O:0/2', outputs['O:0/2'] ? 2 : 0)}
        />
      </mesh>
      <mesh 
        position={[-1, 2, 0.02]}
        scale={getPulseScale('O:0/3')}
        onPointerEnter={() => {
          setHovered({ address: 'O:0/3', label: 'Red Indicator', position: [-1, 2.3, 0.05] })
          useLadderStore.getState().setHighlightedAddress('O:0/3')
        }}
        onPointerLeave={() => {
          setHovered(null)
          useLadderStore.getState().setHighlightedAddress(null)
        }}
      >
        <circleGeometry args={[0.2]} />
        <meshStandardMaterial 
          color={outputs['O:0/3'] ? '#ff3333' : '#333'} 
          emissive={outputs['O:0/3'] ? '#ff3333' : '#000'}
          emissiveIntensity={getPulseIntensity('O:0/3', outputs['O:0/3'] ? 2 : 0)}
        />
      </mesh>

      {/* Motor Belt indicator (invisible but hoverable area) */}
      <mesh 
        position={[0, 0.5, 0.001]}
        scale={getPulseScale('O:0/0')}
        onPointerEnter={() => {
          setHovered({ address: 'O:0/0', label: 'Motor Belt', position: [0, 1.2, 0.05] })
          useLadderStore.getState().setHighlightedAddress('O:0/0')
        }}
        onPointerLeave={() => {
          setHovered(null)
          useLadderStore.getState().setHighlightedAddress(null)
        }}
      >
        <planeGeometry args={[8, 1]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Labels with I/O addresses */}
      {/* Left side - inputs/outputs legend */}
      <Text position={[-3.5, -0.8, 0.03]} fontSize={0.18} color={c.textMuted} anchorX="left" anchorY="middle">
        {'I:0/0 Start  I:0/1 Stop'}
      </Text>
      <Text position={[-3.5, -1.2, 0.03]} fontSize={0.18} color={c.textMuted} anchorX="left" anchorY="middle">
        {'I:0/2 Sensor  I:0/3 Box Type'}
      </Text>
      <Text position={[-3.5, -1.6, 0.03]} fontSize={0.18} color={c.textMuted} anchorX="left" anchorY="middle">
        {'O:0/0 Motor  O:0/1 Piston'}
      </Text>

      {/* Sensor label - to the right of sensor, not below */}
      <Text position={[1.6, 1.15, 0.03]} fontSize={0.14} color="#ff6666" anchorX="left" anchorY="middle">
        {'SENSOR (I:0/2)'}
      </Text>

      {/* Piston label - above piston body */}
      <Text position={[1.2, 1.7, 0.03]} fontSize={0.14} color={c.textMuted} anchorX="center" anchorY="middle">
        {'PISTON (O:0/1)'}
      </Text>

      {/* Motor label - left side of belt */}
      <Text position={[-3.5, 0.5, 0.03]} fontSize={0.14} color={c.textMuted} anchorX="left" anchorY="middle">
        {'MOTOR (O:0/0)'}
      </Text>

      {/* Reject bin label */}
      <Text position={[1.2, -2.6, 0.03]} fontSize={0.14} color={c.textMuted} anchorX="center" anchorY="middle">
        REJECT BIN
      </Text>

      {/* Counters - module-level, immune to StrictMode */}
      <Text position={[-3, 2.5, 0.03]} fontSize={0.22} color="#44cc44" anchorX="center">
        {`✓ ${goodCount}`}
      </Text>
      <Text position={[-1, 2.5, 0.03]} fontSize={0.22} color="#cc4444" anchorX="center">
        {`✗ ${rejectCount}`}
      </Text>
      <Text position={[-3, 2.2, 0.03]} fontSize={0.15} color={c.textMuted} anchorX="center" anchorY="middle">
        {'GOOD (O:0/2)'}
      </Text>
      <Text position={[-1, 2.2, 0.03]} fontSize={0.15} color={c.textMuted} anchorX="center" anchorY="middle">
        {'REJECT (O:0/3)'}
      </Text>

      {/* Instructions */}
      <Text position={[0, -2, 0.03]} fontSize={0.13} color={c.textMuted} anchorX="center" anchorY="middle">
        Click belt: spawn Good | Shift+Click: spawn Reject
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

export function ConveyorScene() {
  const c = useThemeColors()
  
  return (
    <Canvas style={{ background: c.sceneBg }}>
      <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={50} />
      <ambientLight intensity={0.8} />
      <OrbitControls 
        enableRotate={false}
        enableZoom={true}
        enablePan={true}
        minZoom={20}
        maxZoom={150}
      />
      <ConveyorContent />
    </Canvas>
  )
}