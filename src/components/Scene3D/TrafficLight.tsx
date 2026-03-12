import { useSimulationStore } from '../../store/simulationStore'
import type { TrafficState } from '../../types/simulation'

const LIGHT_COLORS: Record<TrafficState, { color: string; emissive: string }> = {
  red: { color: '#ff3333', emissive: '#ff0000' },
  yellow: { color: '#ffaa00', emissive: '#ff8800' },
  green: { color: '#00ff88', emissive: '#00cc44' },
}

const LIGHT_POSITIONS: Record<TrafficState, [number, number, number]> = {
  red: [0, 2.5, 0.3],    // Protruding forward from housing
  yellow: [0, 2, 0.3],   // Protruding forward from housing  
  green: [0, 1.5, 0.3],  // Protruding forward from housing
}

function TrafficLightBulb({ state, isActive }: { state: TrafficState; isActive: boolean }) {
  const { color, emissive } = LIGHT_COLORS[state]
  const position = LIGHT_POSITIONS[state]
  
  return (
    <group>
      <mesh position={position}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial
          color={isActive ? color : '#333'}
          emissive={isActive ? emissive : '#000'}
          emissiveIntensity={isActive ? 3 : 0}
          metalness={0.1}
          roughness={0.3}
        />
      </mesh>
      {/* Dynamic point light for active bulb */}
      {isActive && (
        <pointLight
          position={position}
          color={color}
          intensity={2}
          distance={8}
          decay={2}
        />
      )}
    </group>
  )
}

export function TrafficLight() {
  const currentState = useSimulationStore(s => s.currentState)
  
  return (
    <group position={[0, 0, 0]}>
      {/* Pole */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 2]} />
        <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
      </mesh>
      
      {/* Housing - rectangular box open at front */}
      <mesh position={[0, 2, -0.1]}>
        <boxGeometry args={[0.4, 1.2, 0.3]} />
        <meshStandardMaterial color="#222" metalness={0.6} roughness={0.4} />
      </mesh>
      
      {/* Lights */}
      <TrafficLightBulb state="red" isActive={currentState === 'red'} />
      <TrafficLightBulb state="yellow" isActive={currentState === 'yellow'} />
      <TrafficLightBulb state="green" isActive={currentState === 'green'} />
    </group>
  )
}