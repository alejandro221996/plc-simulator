import { create } from 'zustand'
import type { PLCMemory } from '../types/ladder'

interface TraceSnapshot {
  scanCount: number
  inputs: Record<string, boolean>
  outputs: Record<string, boolean>
}

interface TraceStore {
  snapshots: TraceSnapshot[]
  isRecording: boolean
  selectedSignals: string[]
  pushSnapshot: (memory: PLCMemory, scanCount: number) => void
  toggleRecording: () => void
  toggleSignal: (address: string) => void
  clearTrace: () => void
  setSelectedSignals: (signals: string[]) => void
}

export const useTraceStore = create<TraceStore>((set, get) => ({
  snapshots: [],
  isRecording: false,
  selectedSignals: [],

  pushSnapshot: (memory: PLCMemory, scanCount: number) => {
    const { isRecording, snapshots } = get()
    if (!isRecording) return

    const snapshot: TraceSnapshot = {
      scanCount,
      inputs: { ...memory.inputs },
      outputs: { ...memory.outputs }
    }

    const newSnapshots = [...snapshots, snapshot]
    if (newSnapshots.length > 200) {
      newSnapshots.shift()
    }

    set({ snapshots: newSnapshots })
  },

  toggleRecording: () => set(state => ({ isRecording: !state.isRecording })),

  toggleSignal: (address: string) => {
    set(state => ({
      selectedSignals: state.selectedSignals.includes(address)
        ? state.selectedSignals.filter(s => s !== address)
        : [...state.selectedSignals, address]
    }))
  },

  clearTrace: () => set({ snapshots: [] }),

  setSelectedSignals: (signals: string[]) => set({ selectedSignals: signals })
}))