import { create } from 'zustand'
import type { ScenarioConfig } from '../scenarios/types'
import type { PLCMemory, TimerConfig } from '../types/ladder'

export type BuilderElementType = 'light' | 'sensor' | 'motor' | 'button' | 'indicator' | 'timer-display'

export interface BuilderElement {
  id: string
  type: BuilderElementType
  x: number
  y: number
  address: string
  label: string
  color?: string
}

export interface CustomScenario {
  id: string
  name: string
  elements: BuilderElement[]
  createdAt: number
}

interface BuilderStore {
  elements: BuilderElement[]
  selectedElementId: string | null
  scenarioName: string
  savedScenarios: CustomScenario[]
  addElement: (type: BuilderElementType, x: number, y: number) => void
  removeElement: (id: string) => void
  updateElement: (id: string, updates: Partial<BuilderElement>) => void
  moveElement: (id: string, x: number, y: number) => void
  selectElement: (id: string | null) => void
  setScenarioName: (name: string) => void
  saveScenario: () => void
  loadScenario: (scenario: CustomScenario) => void
  deleteSavedScenario: (id: string) => void
  clearCanvas: () => void
  generateScenarioConfig: () => ScenarioConfig
}

let inputCounter = 0
let outputCounter = 0
let timerCounter = 0

const getNextAddress = (type: BuilderElementType): string => {
  switch (type) {
    case 'sensor':
    case 'button':
      return `I:0/${inputCounter++}`
    case 'light':
    case 'motor':
    case 'indicator':
      return `O:0/${outputCounter++}`
    case 'timer-display':
      return `T4:${timerCounter++}`
    default:
      return 'UNKNOWN'
  }
}

const getDefaultLabel = (type: BuilderElementType): string => {
  switch (type) {
    case 'light': return 'Light'
    case 'sensor': return 'Sensor'
    case 'motor': return 'Motor'
    case 'button': return 'Button'
    case 'indicator': return 'Indicator'
    case 'timer-display': return 'Timer'
    default: return 'Element'
  }
}

const loadSavedScenarios = (): CustomScenario[] => {
  try {
    const saved = localStorage.getItem('plc-custom-scenarios')
    return saved ? JSON.parse(saved) : []
  } catch {
    return []
  }
}

export const useBuilderStore = create<BuilderStore>((set, get) => ({
  elements: [],
  selectedElementId: null,
  scenarioName: 'My Scenario',
  savedScenarios: loadSavedScenarios(),

  addElement: (type, x, y) => {
    const id = `${type}-${Date.now()}`
    const element: BuilderElement = {
      id,
      type,
      x,
      y,
      address: getNextAddress(type),
      label: getDefaultLabel(type),
      color: type === 'light' || type === 'indicator' ? '#00ff88' : undefined
    }
    set(state => ({ elements: [...state.elements, element] }))
  },

  removeElement: (id) => {
    set(state => ({ 
      elements: state.elements.filter(e => e.id !== id),
      selectedElementId: state.selectedElementId === id ? null : state.selectedElementId
    }))
  },

  updateElement: (id, updates) => {
    set(state => ({
      elements: state.elements.map(e => e.id === id ? { ...e, ...updates } : e)
    }))
  },

  moveElement: (id, x, y) => {
    set(state => ({
      elements: state.elements.map(e => e.id === id ? { ...e, x, y } : e)
    }))
  },

  selectElement: (id) => {
    set({ selectedElementId: id })
  },

  setScenarioName: (name) => {
    set({ scenarioName: name })
  },

  saveScenario: () => {
    const { elements, scenarioName, savedScenarios } = get()
    const scenario: CustomScenario = {
      id: `custom-${scenarioName.toLowerCase().replace(/\s+/g, '-')}`,
      name: scenarioName,
      elements: [...elements],
      createdAt: Date.now()
    }
    
    const updated = savedScenarios.filter(s => s.id !== scenario.id)
    updated.push(scenario)
    
    set({ savedScenarios: updated })
    localStorage.setItem('plc-custom-scenarios', JSON.stringify(updated))
  },

  loadScenario: (scenario) => {
    set({ 
      elements: [...scenario.elements],
      scenarioName: scenario.name,
      selectedElementId: null
    })
  },

  deleteSavedScenario: (id) => {
    const updated = get().savedScenarios.filter(s => s.id !== id)
    set({ savedScenarios: updated })
    localStorage.setItem('plc-custom-scenarios', JSON.stringify(updated))
  },

  clearCanvas: () => {
    set({ elements: [], selectedElementId: null })
    inputCounter = 0
    outputCounter = 0
    timerCounter = 0
  },

  generateScenarioConfig: () => {
    const { elements, scenarioName } = get()
    const id = `custom-${scenarioName.toLowerCase().replace(/\s+/g, '-')}`
    
    const inputs = elements.filter(e => e.type === 'sensor' || e.type === 'button')
      .map(e => ({ address: e.address, label: e.label, description: e.label }))
    
    const outputs = elements.filter(e => e.type === 'light' || e.type === 'motor' || e.type === 'indicator')
      .map(e => ({ address: e.address, label: e.label, description: e.label }))
    
    const timers = elements.filter(e => e.type === 'timer-display')
      .map(e => ({ address: e.address, label: e.label, preset: 5000 }))
    
    const defaultMemory: PLCMemory = {
      inputs: Object.fromEntries(inputs.map(i => [i.address, false])),
      outputs: Object.fromEntries(outputs.map(o => [o.address, false])),
      bits: {},
      timers: Object.fromEntries(timers.map(t => [t.address, {
        preset: 5000,
        accumulated: 0,
        done: false,
        timing: false,
        enabled: false
      } as TimerConfig]))
    }

    return {
      id,
      name: scenarioName,
      description: `Custom scenario: ${scenarioName}`,
      complexity: 1 as const,
      ioMap: { inputs, outputs, timers, bits: [] },
      defaultProgram: [],
      defaultMemory,
      sceneComponent: 'custom'
    }
  }
}))