import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrthographicCamera, Text } from '@react-three/drei'
import { useBuilderStore, type BuilderElement } from '../../store/builderStore'
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
    <primitive object={new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({ color: c.borderColor, opacity: 0.3, transparent: true }))} />
  )
}

function BuilderElementMesh({ element }: { element: BuilderElement }) {
  const c = useThemeColors()
  const { selectedElementId, selectElement, moveElement } = useBuilderStore()
  const memory = useLadderStore(s => s.memory)
  const toggleInput = useLadderStore(s => s.toggleInput)
  
  const isSelected = selectedElementId === element.id
  const isActive = memory.outputs[element.address] || memory.inputs[element.address] || false
  
  const handlePointerDown = (e: any) => {
    e.stopPropagation()
    selectElement(element.id)
    
    const startPos = { x: e.point.x, y: e.point.y }
    const elementStart = { x: element.x, y: element.y }
    
    const handlePointerMove = (e: any) => {
      const deltaX = e.point.x - startPos.x
      const deltaY = e.point.y - startPos.y
      moveElement(element.id, elementStart.x + deltaX, elementStart.y + deltaY)
    }
    
    const handlePointerUp = () => {
      document.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('pointerup', handlePointerUp)
    }
    
    document.addEventListener('pointermove', handlePointerMove)
    document.addEventListener('pointerup', handlePointerUp)
  }
  
  const handleClick = (e: any) => {
    e.stopPropagation()
    if (element.type === 'button') {
      toggleInput(element.address)
    }
  }

  const getColor = () => {
    if (isSelected) return c.accentBlue
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
        onPointerDown={handlePointerDown}
        onClick={handleClick}
        onPointerOver={() => document.body.style.cursor = 'pointer'}
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
      
      <Text
        position={[0, -0.5, 0.01]}
        fontSize={0.15}
        color={c.textPrimary}
        anchorX="center"
        anchorY="middle"
      >
        {element.label}
      </Text>
      
      <Text
        position={[0, -0.7, 0.01]}
        fontSize={0.1}
        color={c.textMuted}
        anchorX="center"
        anchorY="middle"
      >
        {element.address}
      </Text>
    </group>
  )
}

export function BuilderCanvas() {
  const c = useThemeColors()
  const canvasRef = useRef<HTMLDivElement>(null!)
  const { elements, addElement, selectElement } = useBuilderStore()

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const elementType = e.dataTransfer.getData('elementType') as any
    if (!elementType) return

    const rect = canvasRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left - rect.width / 2) / rect.width) * 10
    const y = -((e.clientY - rect.top - rect.height / 2) / rect.height) * 10
    
    addElement(elementType, Math.round(x * 2) / 2, Math.round(y * 2) / 2)
  }

  const handleCanvasClick = () => {
    selectElement(null)
  }

  return (
    <div
      ref={canvasRef}
      style={{ flex: 1, height: '100%' }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <Canvas style={{ background: c.sceneBg }}>
        <OrthographicCamera makeDefault position={[0, 0, 10]} zoom={50} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        
        <GridLines />
        
        {elements.map(element => (
          <BuilderElementMesh key={element.id} element={element} />
        ))}
        
        <mesh
          position={[0, 0, -1]}
          onClick={handleCanvasClick}
        >
          <planeGeometry args={[20, 20]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      </Canvas>
    </div>
  )
}