import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid, Environment } from '@react-three/drei'
import { TrafficLight } from './TrafficLight'
import { SimulationLoop } from './SimulationLoop'
import { StatusOverlay } from '../HtmlOverlay'
import { useThemeColors } from '../../hooks/useThemeColors'
import { useThemeStore } from '../../store/themeStore'

export function Scene3D() {
  const c = useThemeColors()
  const theme = useThemeStore(s => s.theme)
  
  return (
    <Canvas
      camera={{ position: [3, 3, 3], fov: 50 }}
      style={{ background: c.sceneBg }}
    >
      <Environment preset="warehouse" environmentIntensity={0.3} />
      <ambientLight intensity={0.1} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} castShadow />
      
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.05}
        maxPolarAngle={Math.PI / 2.1}
        minDistance={2}
        maxDistance={10}
      />
      
      <Grid
        infiniteGrid
        fadeDistance={20}
        cellColor={theme === 'dark' ? '#333' : '#bbb'}
        sectionColor={theme === 'dark' ? '#555' : '#999'}
      />
      
      <TrafficLight />
      <StatusOverlay />
      <SimulationLoop />
    </Canvas>
  )
}