import type { Rung, PLCMemory } from '../types/ladder'

export interface IOEntry {
  address: string
  label: string
  description: string
}

export interface TimerEntry {
  address: string
  label: string
  preset: number
}

export interface BitEntry {
  address: string
  label: string
}

export interface Challenge {
  id: string
  title: string
  description: string
  hint?: string
  validate: (memory: PLCMemory, scanCount: number, history: PLCMemory[]) => boolean
}

export interface ScenarioConfig {
  id: string
  name: string
  description: string
  complexity: 1 | 2 | 3
  ioMap: {
    inputs: IOEntry[]
    outputs: IOEntry[]
    timers: TimerEntry[]
    bits: BitEntry[]
  }
  defaultProgram: Rung[]
  defaultMemory: PLCMemory
  sceneComponent: string
  challenges?: Challenge[]
}