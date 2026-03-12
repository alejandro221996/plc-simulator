import { create } from 'zustand'
import type { Rung, PLCMemory, LadderElement, PowerFlowMap } from '../types/ladder'
import type { ScenarioConfig } from '../scenarios/types'
import { evaluateRungs, evaluateRungWithFlow } from '../engine/ladderEngine'
import { singleTrafficLight } from '../scenarios/single-traffic-light'
import { getScenarioById } from '../scenarios/registry'
import { useChallengeStore } from './challengeStore'
import { useTraceStore } from './traceStore'

interface LadderStore {
  rungs: Rung[]
  memory: PLCMemory
  powerFlow: Record<string, PowerFlowMap>
  isRunning: boolean
  activeScenarioId: string
  speed: number
  scanCount: number
  highlightedAddress: string | null
  start: () => void
  stop: () => void
  addRung: () => void
  removeRung: (id: string) => void
  addElement: (rungId: string, element: LadderElement) => void
  removeElement: (rungId: string, elementId: string) => void
  updateElement: (rungId: string, elementId: string, updates: Partial<LadderElement>) => void
  updateTimerPreset: (address: string, preset: number) => void
  clearProgram: () => void
  toggleInput: (address: string) => void
  setInput: (address: string, value: boolean) => void
  tick: (delta: number) => void
  reset: () => void
  loadProgram: () => void
  loadScenario: (config: ScenarioConfig) => void
  setSpeed: (speed: number) => void
  step: () => void
  setHighlightedAddress: (address: string | null) => void
  loadExample: (rungs: Rung[], memory: PLCMemory) => void
}

const createDefaultMemory = (): PLCMemory => ({
  inputs: {
    'I:0/0': false, // Start
    'I:0/1': false, // Stop
  },
  outputs: {
    'O:0/0': false, // Red
    'O:0/1': false, // Yellow
    'O:0/2': false, // Green
  },
  bits: {
    'B3:0/0': false, // Run bit
    'B3:0/1': false, // Reset bit
  },
  timers: {
    'T4:0': { preset: 5, accumulated: 0, done: false, timing: false, enabled: false }, // Green timer
    'T4:1': { preset: 2, accumulated: 0, done: false, timing: false, enabled: false }, // Yellow timer
    'T4:2': { preset: 5, accumulated: 0, done: false, timing: false, enabled: false }, // Red timer
  },
})

const createDefaultProgram = (): Rung[] => [
  {
    id: 'rung-1',
    comment: 'Start/Stop latch',
    elements: [
      { id: 'e1', type: 'contact-no', address: 'I:0/0', label: 'Start' },
      { id: 'e2', type: 'contact-nc', address: 'I:0/1', label: 'Stop' },
      { id: 'e3', type: 'coil', address: 'B3:0/0', label: 'Run' },
    ],
  },
  {
    id: 'rung-2',
    comment: 'Green phase timer (5s)',
    elements: [
      { id: 'e4', type: 'contact-no', address: 'B3:0/0', label: 'Run' },
      { id: 'e5', type: 'timer-ton', address: 'T4:0' },
    ],
  },
  {
    id: 'rung-3',
    comment: 'Yellow phase timer (2s)',
    elements: [
      { id: 'e6', type: 'contact-no', address: 'T4:0.DN' },
      { id: 'e7', type: 'contact-no', address: 'B3:0/0', label: 'Run' },
      { id: 'e8', type: 'timer-ton', address: 'T4:1' },
    ],
  },
  {
    id: 'rung-4',
    comment: 'Red phase timer (5s)',
    elements: [
      { id: 'e9', type: 'contact-no', address: 'T4:1.DN' },
      { id: 'e10', type: 'contact-no', address: 'B3:0/0', label: 'Run' },
      { id: 'e11', type: 'timer-ton', address: 'T4:2' },
    ],
  },
  {
    id: 'rung-5',
    comment: 'Cycle reset when red done',
    elements: [
      { id: 'e12', type: 'contact-no', address: 'T4:2.DN' },
      { id: 'e13', type: 'coil', address: 'B3:0/1', label: 'Reset' },
    ],
  },
  {
    id: 'rung-6',
    comment: 'GREEN light: Run AND green timer not done',
    elements: [
      { id: 'e14', type: 'contact-no', address: 'B3:0/0', label: 'Run' },
      { id: 'e15', type: 'contact-nc', address: 'T4:0.DN' },
      { id: 'e16', type: 'coil', address: 'O:0/2', label: 'Green' },
    ],
  },
  {
    id: 'rung-7',
    comment: 'YELLOW light: Green done AND yellow not done',
    elements: [
      { id: 'e17', type: 'contact-no', address: 'T4:0.DN' },
      { id: 'e18', type: 'contact-nc', address: 'T4:1.DN' },
      { id: 'e19', type: 'coil', address: 'O:0/1', label: 'Yellow' },
    ],
  },
  {
    id: 'rung-8',
    comment: 'RED light: Yellow done AND red not done',
    elements: [
      { id: 'e20', type: 'contact-no', address: 'T4:1.DN' },
      { id: 'e21', type: 'contact-nc', address: 'T4:2.DN' },
      { id: 'e22', type: 'coil', address: 'O:0/0', label: 'Red' },
    ],
  },
]

export const useLadderStore = create<LadderStore>((set, get) => ({
  rungs: singleTrafficLight.defaultProgram,
  memory: singleTrafficLight.defaultMemory,
  powerFlow: {},
  isRunning: false,
  activeScenarioId: 'single-traffic-light',
  speed: 1,
  scanCount: 0,
  highlightedAddress: null,

  start: () => set({ isRunning: true }),

  stop: () => {
    const { activeScenarioId } = get()
    const scenario = getScenarioById(activeScenarioId)
    set({
      isRunning: false,
      scanCount: 0,
      memory: scenario ? scenario.defaultMemory : createDefaultMemory(),
    })
  },

  addRung: () => {
    const newRung: Rung = {
      id: `rung-${Date.now()}`,
      elements: [],
    }
    set(state => ({ rungs: [...state.rungs, newRung] }))
  },

  removeRung: (id: string) => {
    set(state => ({ rungs: state.rungs.filter(r => r.id !== id) }))
  },

  addElement: (rungId: string, element: LadderElement) => {
    const elementWithId = {
      ...element,
      id: `el-${Date.now()}-${Math.random().toString(36).slice(2,6)}`
    }
    
    set(state => {
      const newState = {
        rungs: state.rungs.map(rung =>
          rung.id === rungId
            ? { ...rung, elements: [...rung.elements, elementWithId] }
            : rung
        )
      }
      
      // Auto-create timer entry if timer-ton
      if (element.type === 'timer-ton' && !state.memory.timers[element.address]) {
        return {
          ...newState,
          memory: {
            ...state.memory,
            timers: {
              ...state.memory.timers,
              [element.address]: { preset: 5, accumulated: 0, done: false, timing: false, enabled: false }
            }
          }
        }
      }
      
      return newState
    })
  },

  removeElement: (rungId: string, elementId: string) => {
    set(state => ({
      rungs: state.rungs.map(rung =>
        rung.id === rungId
          ? { ...rung, elements: rung.elements.filter(e => e.id !== elementId) }
          : rung
      )
    }))
  },

  updateElement: (rungId: string, elementId: string, updates: Partial<LadderElement>) => {
    set(state => ({
      rungs: state.rungs.map(rung =>
        rung.id === rungId
          ? {
              ...rung,
              elements: rung.elements.map(element =>
                element.id === elementId ? { ...element, ...updates } : element
              )
            }
          : rung
      )
    }))
  },

  updateTimerPreset: (address: string, preset: number) => {
    set(state => ({
      memory: {
        ...state.memory,
        timers: {
          ...state.memory.timers,
          [address]: { ...state.memory.timers[address], preset }
        }
      }
    }))
  },

  clearProgram: () => {
    set({
      rungs: [],
      memory: singleTrafficLight.defaultMemory
    })
  },

  toggleInput: (address: string) => {
    set(state => ({
      memory: {
        ...state.memory,
        inputs: {
          ...state.memory.inputs,
          [address]: !state.memory.inputs[address]
        }
      }
    }))
  },

  setInput: (address: string, value: boolean) => {
    set(state => ({
      memory: {
        ...state.memory,
        inputs: {
          ...state.memory.inputs,
          [address]: value
        }
      }
    }))
  },

  tick: (delta: number) => {
    const { rungs, memory, isRunning, speed } = get()
    if (!isRunning) return
    
    const newMemory = evaluateRungs(rungs, memory, delta * speed)
    
    // Calculate power flow for visualization
    const newPowerFlow: Record<string, PowerFlowMap> = {}
    for (const rung of get().rungs) {
      newPowerFlow[rung.id] = evaluateRungWithFlow(rung, newMemory)
    }
    
    const newScanCount = get().scanCount + 1
    set({ memory: newMemory, powerFlow: newPowerFlow, scanCount: newScanCount })
    
    useChallengeStore.getState().pushMemorySnapshot(newMemory)
    useChallengeStore.getState().evaluateChallenges(newMemory, newScanCount)
    useTraceStore.getState().pushSnapshot(newMemory, newScanCount)
  },

  reset: () => {
    const { activeScenarioId } = get()
    const scenario = getScenarioById(activeScenarioId)
    set({
      memory: scenario ? scenario.defaultMemory : createDefaultMemory(),
      powerFlow: {},
      isRunning: false,
      scanCount: 0,
    })
  },

  loadProgram: () => {
    set({
      rungs: createDefaultProgram(),
      memory: createDefaultMemory(),
    })
  },

  loadScenario: (config: ScenarioConfig) => {
    set({
      rungs: config.defaultProgram,
      memory: config.defaultMemory,
      powerFlow: {},
      activeScenarioId: config.id,
      isRunning: false,
      scanCount: 0,
    })
    
    useChallengeStore.getState().resetChallenges(config.id)
  },

  setSpeed: (speed: number) => {
    set({ speed })
  },

  step: () => {
    const { rungs, memory } = get()
    const newMemory = evaluateRungs(rungs, memory, 0.1)
    set({ memory: newMemory, scanCount: get().scanCount + 1, isRunning: false })
  },

  setHighlightedAddress: (address: string | null) => {
    set({ highlightedAddress: address })
  },

  loadExample: (rungs: Rung[], memory: PLCMemory) => {
    set({ rungs, memory, powerFlow: {}, isRunning: false, scanCount: 0 })
  },
}))