import { create } from 'zustand'
import type { SimulationState, TrafficState, SpeedMultiplier, SimulationMode } from '../types/simulation'

const STATE_DURATIONS: Record<TrafficState, number> = {
  green: 5,
  yellow: 2,
  red: 5,
}

const STATE_SEQUENCE: TrafficState[] = ['green', 'yellow', 'red']

interface SimulationStore extends SimulationState {
  start: () => void
  stop: () => void
  reset: () => void
  setSpeed: (speed: SpeedMultiplier) => void
  setMode: (mode: SimulationMode) => void
  setCurrentState: (state: TrafficState) => void
  tick: (delta: number) => void
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  currentState: 'red',
  status: 'stopped',
  mode: 'auto',
  timeRemaining: STATE_DURATIONS.red,
  speed: 1,
  cycleCount: 0,

  start: () => set({ status: 'running' }),
  
  stop: () => set({ status: 'stopped' }),
  
  reset: () => set({
    currentState: 'red',
    status: 'stopped',
    mode: 'auto',
    timeRemaining: STATE_DURATIONS.red,
    speed: 1,
    cycleCount: 0,
  }),
  
  setSpeed: (speed: SpeedMultiplier) => set({ speed }),
  
  setMode: (mode: SimulationMode) => set({ mode }),
  
  setCurrentState: (state: TrafficState) => set({ currentState: state }),
  
  tick: (delta: number) => {
    const state = get()
    if (state.status !== 'running' || state.mode !== 'auto') return

    const newTimeRemaining = state.timeRemaining - (delta * state.speed)
    
    if (newTimeRemaining <= 0) {
      const currentIndex = STATE_SEQUENCE.indexOf(state.currentState)
      const nextIndex = (currentIndex + 1) % STATE_SEQUENCE.length
      const nextState = STATE_SEQUENCE[nextIndex]
      const newCycleCount = nextState === 'green' ? state.cycleCount + 1 : state.cycleCount
      
      set({
        currentState: nextState,
        timeRemaining: STATE_DURATIONS[nextState],
        cycleCount: newCycleCount,
      })
    } else {
      set({ timeRemaining: newTimeRemaining })
    }
  },
}))