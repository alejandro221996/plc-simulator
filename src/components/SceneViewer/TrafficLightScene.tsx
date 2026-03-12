import { useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrthographicCamera, Text, OrbitControls } from '@react-three/drei'
import { useLadderStore } from '../../store/ladderStore'
import { useThemeColors } from '../../hooks/useThemeColors'
import { PLCTooltip } from './PLCTooltip'

function TrafficLightContent() {
  const c = useThemeColors()
  const [hovered, setHovered] = useState<{ address: string; label: string; position: [number,number,number] } | null>(null)
  
  const outputs = useLadderStore(s => s.memory.outputs)
  const inputs = useLadderStore(s => s.memory.inputs)
  const highlightedAddress = useLadderStore(s => s.highlightedAddress)

  const getPulseScale = (address: string): number => {
    if (address === highlightedAddress) {
      return 1 + Math.sin(Date.now() * 0.006) * 0.15
    }
    return 1
  }

  const getPulseIntensity = (address: string, baseIntensity: number): number => {
    if (address === highlightedAddress) {
      return baseIntensity + 2
    }
    return baseIntensity
  }

  useFrame((_, delta) => {
    useLadderStore.getState().tick(delta)
  })

  const getValueForAddress = (addr: string): boolean => {
    const memory = useLadderStore.getState().memory
    if (addr.startsWith('I:')) return memory.inputs[addr] || false
    if (addr.startsWith('O:')) return memory.outputs[addr] || false
    return false
  }

  // Determine light states based on mode
  const redOn = outputs['O:0/0']
  const yellowOn = outputs['O:0/1']
  const greenOn = outputs['O:0/2']

  return (
    <>
      {/* Ground line */}
      <mesh position={[0, -3.2, 0]}>
        <planeGeometry args={[6, 0.05]} />
        <meshBasicMaterial color="#666" />
      </mesh>

      {/* Pole base */}
      <mesh position={[0, -3, 0.01]}>
        <planeGeometry args={[0.6, 0.15]} />
        <meshBasicMaterial color="#444" />
      </mesh>

      {/* Pole */}
      <mesh position={[0, -2, 0.01]}>
        <planeGeometry args={[0.15, 2]} />
        <meshBasicMaterial color="#555" />
      </mesh>

      {/* Housing */}
      <mesh position={[0, 0.2, 0.02]}>
        <planeGeometry args={[0.9, 2.4]} />
        <meshBasicMaterial color="#1a1a1a" />
      </mesh>

      {/* Housing border */}
      <mesh position={[0, 0.2, 0.01]}>
        <planeGeometry args={[0.95, 2.45]} />
        <meshBasicMaterial color="#333" />
      </mesh>

      {/* Visors/hoods */}
      <mesh position={[0, 1.02, 0.03]}>
        <planeGeometry args={[0.6, 0.08]} />
        <meshBasicMaterial color="#111" />
      </mesh>
      <mesh position={[0, 0.32, 0.03]}>
        <planeGeometry args={[0.6, 0.08]} />
        <meshBasicMaterial color="#111" />
      </mesh>
      <mesh position={[0, -0.38, 0.03]}>
        <planeGeometry args={[0.6, 0.08]} />
        <meshBasicMaterial color="#111" />
      </mesh>

      {/* Red Light Glow (behind) */}
      {redOn && (
        <mesh position={[0, 0.7, 0.025]}>
          <circleGeometry args={[0.4]} />
          <meshBasicMaterial color="#ff3333" transparent opacity={0.3} />
        </mesh>
      )}

      {/* Red Light */}
      <mesh 
        position={[0, 0.7, 0.04]}
        scale={getPulseScale('O:0/0')}
        onPointerEnter={() => {
          setHovered({ address: 'O:0/0', label: 'Red', position: [0.8, 0.7, 0.05] })
          useLadderStore.getState().setHighlightedAddress('O:0/0')
        }}
        onPointerLeave={() => {
          setHovered(null)
          useLadderStore.getState().setHighlightedAddress(null)
        }}
      >
        <circleGeometry args={[0.28]} />
        <meshStandardMaterial 
          color={redOn ? '#ff3333' : '#2a2a2a'} 
          emissive={redOn ? '#ff3333' : '#000'}
          emissiveIntensity={getPulseIntensity('O:0/0', redOn ? 3 : 0)}
        />
      </mesh>

      {/* Yellow Light Glow (behind) */}
      {yellowOn && (
        <mesh position={[0, 0, 0.025]}>
          <circleGeometry args={[0.4]} />
          <meshBasicMaterial color="#ffaa00" transparent opacity={0.3} />
        </mesh>
      )}

      {/* Yellow Light */}
      <mesh 
        position={[0, 0, 0.04]}
        scale={getPulseScale('O:0/1')}
        onPointerEnter={() => {
          setHovered({ address: 'O:0/1', label: 'Yellow', position: [0.8, 0, 0.05] })
          useLadderStore.getState().setHighlightedAddress('O:0/1')
        }}
        onPointerLeave={() => {
          setHovered(null)
          useLadderStore.getState().setHighlightedAddress(null)
        }}
      >
        <circleGeometry args={[0.28]} />
        <meshStandardMaterial 
          color={yellowOn ? '#ffaa00' : '#2a2a2a'} 
          emissive={yellowOn ? '#ffaa00' : '#000'}
          emissiveIntensity={getPulseIntensity('O:0/1', yellowOn ? 3 : 0)}
        />
      </mesh>

      {/* Green Light Glow (behind) */}
      {greenOn && (
        <mesh position={[0, -0.7, 0.025]}>
          <circleGeometry args={[0.4]} />
          <meshBasicMaterial color="#00ff88" transparent opacity={0.3} />
        </mesh>
      )}

      {/* Green Light */}
      <mesh 
        position={[0, -0.7, 0.04]}
        scale={getPulseScale('O:0/2')}
        onPointerEnter={() => {
          setHovered({ address: 'O:0/2', label: 'Green', position: [0.8, -0.7, 0.05] })
          useLadderStore.getState().setHighlightedAddress('O:0/2')
        }}
        onPointerLeave={() => {
          setHovered(null)
          useLadderStore.getState().setHighlightedAddress(null)
        }}
      >
        <circleGeometry args={[0.28]} />
        <meshStandardMaterial 
          color={greenOn ? '#00ff88' : '#2a2a2a'} 
          emissive={greenOn ? '#00ff88' : '#000'}
          emissiveIntensity={getPulseIntensity('O:0/2', greenOn ? 3 : 0)}
        />
      </mesh>

      {/* Control Panel Box */}
      <mesh position={[0, -2.5, 0.02]}>
        <planeGeometry args={[2.5, 0.8]} />
        <meshBasicMaterial color="#2a2a2a" />
      </mesh>

      {/* Control Panel Border */}
      <mesh position={[0, -2.5, 0.01]}>
        <planeGeometry args={[2.55, 0.85]} />
        <meshBasicMaterial color="#444" />
      </mesh>

      {/* Start Button */}
      <mesh 
        position={[-0.5, -2.5, 0.03]}
        scale={getPulseScale('I:0/0')}
        onPointerEnter={() => {
          setHovered({ address: 'I:0/0', label: 'Start', position: [-0.5, -2, 0.05] })
          useLadderStore.getState().setHighlightedAddress('I:0/0')
        }}
        onPointerLeave={() => {
          setHovered(null)
          useLadderStore.getState().setHighlightedAddress(null)
        }}
      >
        <circleGeometry args={[0.2]} />
        <meshBasicMaterial 
          color={inputs['I:0/0'] ? '#00ff88' : '#00aa44'}
        />
      </mesh>

      {/* Stop Button */}
      <mesh 
        position={[0.5, -2.5, 0.03]}
        scale={getPulseScale('I:0/1')}
        onPointerEnter={() => {
          setHovered({ address: 'I:0/1', label: 'Stop', position: [0.5, -2, 0.05] })
          useLadderStore.getState().setHighlightedAddress('I:0/1')
        }}
        onPointerLeave={() => {
          setHovered(null)
          useLadderStore.getState().setHighlightedAddress(null)
        }}
      >
        <circleGeometry args={[0.2]} />
        <meshBasicMaterial 
          color={inputs['I:0/1'] ? '#ff6666' : '#aa0000'}
        />
      </mesh>

      {/* Address Labels */}
      <Text position={[1.2, 0.7, 0.04]} fontSize={0.15} color={c.textMuted} anchorX="left" anchorY="middle">
        O:0/0
      </Text>
      <Text position={[1.2, 0, 0.04]} fontSize={0.15} color={c.textMuted} anchorX="left" anchorY="middle">
        O:0/1
      </Text>
      <Text position={[1.2, -0.7, 0.04]} fontSize={0.15} color={c.textMuted} anchorX="left" anchorY="middle">
        O:0/2
      </Text>

      {/* Button Labels */}
      <Text position={[-0.5, -2.9, 0.04]} fontSize={0.12} color={c.textMuted} anchorX="center" anchorY="middle">
        START
      </Text>
      <Text position={[0.5, -2.9, 0.04]} fontSize={0.12} color={c.textMuted} anchorX="center" anchorY="middle">
        STOP
      </Text>


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

export function TrafficLightScene() {
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
      <TrafficLightContent />
    </Canvas>
  )
}