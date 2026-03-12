export type LadderElementType = 'contact-no' | 'contact-nc' | 'coil' | 'timer-ton'

export interface LadderElement {
  id: string
  type: LadderElementType
  address: string
  label?: string
}

export interface TimerConfig {
  preset: number
  accumulated: number
  done: boolean
  timing: boolean
  enabled: boolean
}

export interface Rung {
  id: string
  elements: LadderElement[]
  comment?: string
}

export interface PLCMemory {
  inputs: Record<string, boolean>
  outputs: Record<string, boolean>
  bits: Record<string, boolean>
  timers: Record<string, TimerConfig>
}

export type PowerFlowEntry = { powerIn: boolean; powerOut: boolean; blocking: boolean }
export type PowerFlowMap = Record<string, PowerFlowEntry>