import { useFrame } from '@react-three/fiber'
import { useLadderStore } from '../../store/ladderStore'

export function SimulationLoop() {
  const ladderTick = useLadderStore(s => s.tick)

  useFrame((_, delta) => {
    ladderTick(delta)
  })

  return null
}
