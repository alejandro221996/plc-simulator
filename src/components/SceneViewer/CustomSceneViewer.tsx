import { Canvas } from '@react-three/fiber'
import { OrthographicCamera, Text, Html, OrbitControls } from '@react-three/drei'
import { useBuilderStore } from '../../store/builderStore'
import { useLadderStore } from '../../store/ladderStore'
import { useThemeColors } from '../../hooks/useThemeColors'
import * as THREE from 'three'

function GridLines() {
  const c = useThemeColors()
  const points = []
  
  for (let i = -5; i <= 5; i++) {
    points.push(new THREE.Vector3(i, -5, 0), new THREE.Vector3(i, 5, 0))
    points.push(new THREE.Vector3(-5, i, 0), new THREE.Vector3(5, i, 0))
  }
  
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  
  return (
    <primitive object={new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: c.borderColor, opacity: 0.2, transparent: true }))} />
  )
}

function CustomElement({ element }: { element: any }) {
  const c = useThemeColors()
  const memory = useLadderStore(s => s.memory)
  const toggleInput = useLadderStore(s => s.toggleInput)
  
  const isActive = memory.outputs[element.address] || memory.inputs[element.address] || false
  
  const handleClick = (e: any) => {
    e.stopPropagation()
    if (element.type === 'button') {
      toggleInput(element.address)
    }
  }

  const getColor = () => {
    if (isActive) return element.color || '#00ff88'
    return '#666666'
  }

  const getEmissive = () => {
    if (isActive && (element.type === 'light' || element.type === 'indicator')) {
      return element.color || '#00ff88'
    }
    return '#000000'
  }

  return (
    <group position={[element.x, element.y, 0]}>
      <mesh
        onClick={handleClick}
        onPointerOver={() => {
          if (element.type === 'button') {
            document.body.style.cursor = 'pointer'
          }
        }}
        onPointerOut={() => document.body.style.cursor = 'default'}
      >
        {element.type === 'light' || element.type === 'button' || element.type === 'indicator' ? (
          <circleGeometry args={[0.3, 16]} />
        ) : (
          <planeGeometry args={[0.6, 0.4]} />
        )}
        <meshStandardMaterial
          color={getColor()}
          emissive={getEmissive()}
          emissiveIntensity={isActive ? 0.3 : 0}
        />
      </mesh>
      
      {element.type === 'motor' && (
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.3}
          color={c.textPrimary}
          anchorX="center"
          anchorY="middle"
        >
          ⚙️
        </Text>
      )}
      
      <Html distanceFactor={8} center position={[0, -0.6, 0]}>
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          color: isActive ? '#00ff88' : '#888',
          padding: '2px 6px',
          borderRadius: '4px',
          fontSize: '10px',
          whiteSpace: 'nowrap',
          textAlign: 'center'
        }}>
          <div>{element.label}</div>
          <div style={{ fontSize: '8px', opacity: 0.7 }}>{element.address}</div>
        </div>
      </Html>
    </group>
  )
}

export function CustomSceneViewer() {
  const c = useThemeColors()
  const activeScenarioId = useLadderStore(s => s.activeScenarioId)
  const savedScenarios = useBuilderStore(s => s.savedScenarios)
  
  const scenario = savedScenarios.find(s => s.id === activeScenarioId)
  if (!scenario) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: c.sceneBg,
        color: c.textMuted
      }}>
        Custom scenario not found
      </div>
    )
  }

  return (
    <Canvas style={{ background: c.sceneBg }}>
      <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={50} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <OrbitControls 
        enableRotate={false}
        enableZoom={true}
        enablePan={true}
        minZoom={20}
        maxZoom={150}
      />
      
      <GridLines />
      
      {scenario.elements.map(element => (
        <CustomElement key={element.id} element={element} />
      ))}
    </Canvas>
  )
}