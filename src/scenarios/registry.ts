import { sandbox } from './sandbox'
import { singleTrafficLight } from './single-traffic-light'
import { fourWayIntersection } from './four-way-intersection'
import { conveyorBelt } from './conveyor-belt'
import { garageDoor } from './garage-door'
import type { ScenarioConfig } from './types'

export const scenarios: ScenarioConfig[] = [
  sandbox,
  singleTrafficLight,
  fourWayIntersection,
  conveyorBelt,
  garageDoor,
]

export const getScenarioById = (id: string): ScenarioConfig | undefined =>
  scenarios.find(s => s.id === id)

export function registerCustomScenario(config: ScenarioConfig): void {
  const idx = scenarios.findIndex(s => s.id === config.id)
  if (idx >= 0) scenarios[idx] = config
  else scenarios.push(config)
}