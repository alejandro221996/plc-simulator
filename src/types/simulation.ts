export type TrafficState = 'green' | 'yellow' | 'red'
export type SimulationStatus = 'stopped' | 'running'
export type SimulationMode = 'auto' | 'ladder'
export type SpeedMultiplier = 1 | 2 | 5

export interface SimulationState {
  currentState: TrafficState
  status: SimulationStatus
  mode: SimulationMode
  timeRemaining: number
  speed: SpeedMultiplier
  cycleCount: number
}

export interface LightConfig {
  duration: number
  color: string
  emissiveColor: string
  position: [number, number, number]
}