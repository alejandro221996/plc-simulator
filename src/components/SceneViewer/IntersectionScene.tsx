import { useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrthographicCamera, Text, OrbitControls } from '@react-three/drei'
import { useLadderStore } from '../../store/ladderStore'
import { useThemeColors } from '../../hooks/useThemeColors'
import { PLCTooltip } from './PLCTooltip'

interface Car {
  id: number
  x: number
  y: number
  direction: 'NS' | 'EW'
}

function IntersectionContent() {
  const c = useThemeColors()
  const [cars, setCars] = useState<Car[]>([
    { id: 1, x: 0.5, y: -4, direction: 'NS' },
    { id: 2, x: -4, y: -0.5, direction: 'EW' }
  ])
  const [nextCarId, setNextCarId] = useState(3)
  const [hovered, setHovered] = useState<{ address: string; label: string; position: [number,number,number] } | null>(null)
  
  const outputs = useLadderStore(s => s.memory.outputs)
  const highlightedAddress = useLadderStore(s => s.highlightedAddress)

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
  
  useFrame((_, delta) => {
    const { isRunning, tick, memory, speed } = useLadderStore.getState()
    
    if (isRunning) {
      tick(delta)
    }

    const outputs = memory.outputs
    const visualDelta = delta * speed
    
    // Animate cars based on traffic lights
    setCars(prev => prev.map(car => {
      const nsGreen = outputs['O:0/2']
      const ewGreen = outputs['O:0/5']
      
      if (car.direction === 'NS') {
        // Move if green OR already in/past intersection (y > -1)
        if (nsGreen || car.y > -1) {
          const newY = car.y + visualDelta * 2
          return { ...car, y: newY > 4 ? -4 : newY }
        }
      } else if (car.direction === 'EW') {
        if (ewGreen || car.x > -1) {
          const newX = car.x + visualDelta * 2
          return { ...car, x: newX > 4 ? -4 : newX }
        }
      }
      return car
    }))


  })

  const spawnCar = (direction: 'NS' | 'EW', clickX: number, clickY: number) => {
    const newCar: Car = {
      id: nextCarId,
      x: direction === 'NS' ? 0.5 : clickX,
      y: direction === 'EW' ? -0.5 : clickY,
      direction
    }
    setCars(prev => [...prev, newCar])
    setNextCarId(prev => prev + 1)
  }

  const handleRoadClick = (event: any) => {
    event.stopPropagation()
    const point = event.point
    
    // NS lane: x around 0.5, y range -4 to 4
    if (Math.abs(point.x - 0.5) < 0.8 && point.y > -3 && point.y < 3) {
      spawnCar('NS', point.x, point.y)
    }
    // EW lane: y around -0.5, x range -4 to 4  
    else if (Math.abs(point.y + 0.5) < 0.8 && point.x > -3 && point.x < 3) {
      spawnCar('EW', point.x, point.y)
    }
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
      {/* Horizontal Road - clickable */}
      <mesh 
        position={[0, 0, 0]}
        onClick={handleRoadClick}
      >
        <planeGeometry args={[8, 2]} />
        <meshBasicMaterial 
          color="#444" 
        />
      </mesh>
      
      {/* Vertical Road - clickable */}
      <mesh 
        position={[0, 0, 0.01]}
        onClick={handleRoadClick}
      >
        <planeGeometry args={[2, 8]} />
        <meshBasicMaterial 
          color="#444" 
        />
      </mesh>

      {/* Lane markings */}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[8, 0.1]} />
        <meshBasicMaterial color="#fff" />
      </mesh>
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[0.1, 8]} />
        <meshBasicMaterial color="#fff" />
      </mesh>

      {/* NS Traffic Lights - positioned at top-right */}
      <group position={[2, 2, 0.03]}>
        {/* Housing */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[0.4, 1.2]} />
          <meshBasicMaterial color="#222" />
        </mesh>
        {/* Red */}
        <mesh 
          position={[0, 0.3, 0]}
          scale={getPulseScale('O:0/0')}
          onPointerEnter={() => {
            setHovered({ address: 'O:0/0', label: 'NS-Red', position: [2, 2.8, 0.05] })
            useLadderStore.getState().setHighlightedAddress('O:0/0')
          }}
          onPointerLeave={() => {
            setHovered(null)
            useLadderStore.getState().setHighlightedAddress(null)
          }}
        >
          <circleGeometry args={[0.15]} />
          <meshStandardMaterial 
            color={outputs['O:0/0'] ? '#ff3333' : '#333'} 
            emissive={outputs['O:0/0'] ? '#ff3333' : '#000'}
            emissiveIntensity={getPulseIntensity('O:0/0', outputs['O:0/0'] ? 2 : 0)}
          />
        </mesh>
        {/* Yellow */}
        <mesh 
          position={[0, 0, 0]}
          scale={getPulseScale('O:0/1')}
          onPointerEnter={() => {
            setHovered({ address: 'O:0/1', label: 'NS-Yellow', position: [2, 2.5, 0.05] })
            useLadderStore.getState().setHighlightedAddress('O:0/1')
          }}
          onPointerLeave={() => {
            setHovered(null)
            useLadderStore.getState().setHighlightedAddress(null)
          }}
        >
          <circleGeometry args={[0.15]} />
          <meshStandardMaterial 
            color={outputs['O:0/1'] ? '#ffaa00' : '#333'} 
            emissive={outputs['O:0/1'] ? '#ffaa00' : '#000'}
            emissiveIntensity={getPulseIntensity('O:0/1', outputs['O:0/1'] ? 2 : 0)}
          />
        </mesh>
        {/* Green */}
        <mesh 
          position={[0, -0.3, 0]}
          scale={getPulseScale('O:0/2')}
          onPointerEnter={() => {
            setHovered({ address: 'O:0/2', label: 'NS-Green', position: [2, 2.2, 0.05] })
            useLadderStore.getState().setHighlightedAddress('O:0/2')
          }}
          onPointerLeave={() => {
            setHovered(null)
            useLadderStore.getState().setHighlightedAddress(null)
          }}
        >
          <circleGeometry args={[0.15]} />
          <meshStandardMaterial 
            color={outputs['O:0/2'] ? '#00ff88' : '#333'} 
            emissive={outputs['O:0/2'] ? '#00ff88' : '#000'}
            emissiveIntensity={getPulseIntensity('O:0/2', outputs['O:0/2'] ? 2 : 0)}
          />
        </mesh>
      </group>

      {/* EW Traffic Lights - positioned at bottom-left */}
      <group position={[-2, -2, 0.03]}>
        {/* Housing */}
        <mesh position={[0, 0, -0.01]}>
          <planeGeometry args={[0.4, 1.2]} />
          <meshBasicMaterial color="#222" />
        </mesh>
        {/* Red */}
        <mesh 
          position={[0, 0.3, 0]}
          onPointerEnter={() => setHovered({ address: 'O:0/3', label: 'EW-Red', position: [-2, -1.2, 0.05] })}
          onPointerLeave={() => setHovered(null)}
        >
          <circleGeometry args={[0.15]} />
          <meshStandardMaterial 
            color={outputs['O:0/3'] ? '#ff3333' : '#333'} 
            emissive={outputs['O:0/3'] ? '#ff3333' : '#000'}
            emissiveIntensity={outputs['O:0/3'] ? 2 : 0}
          />
        </mesh>
        {/* Yellow */}
        <mesh 
          position={[0, 0, 0]}
          onPointerEnter={() => setHovered({ address: 'O:0/4', label: 'EW-Yellow', position: [-2, -1.5, 0.05] })}
          onPointerLeave={() => setHovered(null)}
        >
          <circleGeometry args={[0.15]} />
          <meshStandardMaterial 
            color={outputs['O:0/4'] ? '#ffaa00' : '#333'} 
            emissive={outputs['O:0/4'] ? '#ffaa00' : '#000'}
            emissiveIntensity={outputs['O:0/4'] ? 2 : 0}
          />
        </mesh>
        {/* Green */}
        <mesh 
          position={[0, -0.3, 0]}
          onPointerEnter={() => setHovered({ address: 'O:0/5', label: 'EW-Green', position: [-2, -1.8, 0.05] })}
          onPointerLeave={() => setHovered(null)}
        >
          <circleGeometry args={[0.15]} />
          <meshStandardMaterial 
            color={outputs['O:0/5'] ? '#00ff88' : '#333'} 
            emissive={outputs['O:0/5'] ? '#00ff88' : '#000'}
            emissiveIntensity={outputs['O:0/5'] ? 2 : 0}
          />
        </mesh>
      </group>

      {/* Walk Signal */}
      <mesh 
        position={[-3, 3, 0.03]}
        onPointerEnter={() => setHovered({ address: 'O:0/6', label: 'Walk Signal', position: [-3, 3.5, 0.05] })}
        onPointerLeave={() => setHovered(null)}
      >
        <circleGeometry args={[0.2]} />
        <meshStandardMaterial 
          color={outputs['O:0/6'] ? '#fff' : '#333'} 
          emissive={outputs['O:0/6'] ? '#fff' : '#000'}
          emissiveIntensity={outputs['O:0/6'] ? 2 : 0}
        />
      </mesh>

      {/* Pedestrian Request Button */}
      <mesh 
        position={[-3.5, 2.5, 0.03]} 
        scale={getPulseScale('I:0/2')}
        onPointerEnter={() => {
          setHovered({ address: 'I:0/2', label: 'Ped Button', position: [-3.5, 3, 0.05] })
          useLadderStore.getState().setHighlightedAddress('I:0/2')
        }}
        onPointerLeave={() => {
          setHovered(null)
          useLadderStore.getState().setHighlightedAddress(null)
        }}
      >
        <planeGeometry args={[0.3, 0.3]} />
        <meshBasicMaterial 
          color={c.accentBlue}
        />
      </mesh>

      {/* Dynamic Cars */}
      {cars.map(car => (
        <mesh key={car.id} position={[car.x, car.y, 0.02]}>
          <planeGeometry args={car.direction === 'NS' ? [0.3, 0.6] : [0.6, 0.3]} />
          <meshBasicMaterial color={car.direction === 'NS' ? '#4488ff' : '#ff8844'} />
        </mesh>
      ))}

      {/* Labels */}
      <Text position={[2.8, 3.2, 0.04]} fontSize={0.2} color={c.accentCyan} anchorX="center" anchorY="middle">
        NS Traffic Light
      </Text>
      <Text position={[2.8, 2.8, 0.04]} fontSize={0.14} color={c.textMuted} anchorX="center" anchorY="middle">
        {'O:0/0 Red  O:0/1 Yellow  O:0/2 Green'}
      </Text>

      <Text position={[-2.8, -1.2, 0.04]} fontSize={0.2} color={c.accentCyan} anchorX="center" anchorY="middle">
        EW Traffic Light
      </Text>
      <Text position={[-2.8, -0.8, 0.04]} fontSize={0.14} color={c.textMuted} anchorX="center" anchorY="middle">
        {'O:0/3 Red  O:0/4 Yellow  O:0/5 Green'}
      </Text>

      <Text position={[-3.5, 3.2, 0.04]} fontSize={0.14} color={c.textMuted} anchorX="center" anchorY="middle">
        PED (I:0/2)
      </Text>
      <Text position={[-3, 3.8, 0.04]} fontSize={0.14} color={c.textMuted} anchorX="center" anchorY="middle">
        WALK (O:0/6)
      </Text>

      {/* I/O Reference */}
      <Text position={[0, -3.8, 0.03]} fontSize={0.13} color={c.textMuted} anchorX="center" anchorY="middle">
        {'I:0/0 Start  I:0/1 Stop  I:0/2 Ped Request'}
      </Text>
      <Text position={[0, -4.1, 0.03]} fontSize={0.13} color={c.textMuted} anchorX="center" anchorY="middle">
        {'Click road to spawn cars  |  Blue=NS  Orange=EW'}
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

export function IntersectionScene() {
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
      <IntersectionContent />
    </Canvas>
  )
}