import { useLadderStore } from '../../store/ladderStore'
import { TrafficLightScene } from './TrafficLightScene'
import { IntersectionScene } from './IntersectionScene'
import { ConveyorScene } from './ConveyorScene'
import { GarageDoorScene } from './GarageDoorScene'
import { CustomSceneViewer } from './CustomSceneViewer'
import { SandboxPanel } from './SandboxPanel'

export function SceneViewer() {
  const activeScenarioId = useLadderStore(s => s.activeScenarioId)

  if (activeScenarioId?.startsWith('custom-')) {
    return <CustomSceneViewer />
  }

  switch (activeScenarioId) {
    case 'single-traffic-light':
      return <TrafficLightScene />
    case 'four-way-intersection':
      return <IntersectionScene />
    case 'conveyor-belt':
      return <ConveyorScene />
    case 'garage-door':
      return <GarageDoorScene />
    case 'sandbox':
      return <SandboxPanel />
    default:
      return <TrafficLightScene />
  }
}