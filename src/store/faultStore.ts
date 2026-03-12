import { create } from 'zustand'

export type FaultType = 'stuck-on' | 'stuck-off' | 'intermittent'

interface FaultStore {
  faults: Record<string, FaultType>
  addFault: (address: string, type: FaultType) => void
  removeFault: (address: string) => void
  clearFaults: () => void
  applyFaults: (memory: { inputs: Record<string, boolean>; outputs: Record<string, boolean> }) => void
}

export const useFaultStore = create<FaultStore>((set, get) => ({
  faults: {},
  
  addFault: (address, type) => set(state => ({
    faults: { ...state.faults, [address]: type }
  })),
  
  removeFault: (address) => set(state => {
    const { [address]: _, ...rest } = state.faults
    return { faults: rest }
  }),
  
  clearFaults: () => set({ faults: {} }),
  
  applyFaults: (memory) => {
    const { faults } = get()
    for (const [address, faultType] of Object.entries(faults)) {
      const isInput = address.startsWith('I:')
      const isOutput = address.startsWith('O:')
      
      if (!isInput && !isOutput) continue
      
      const target = isInput ? memory.inputs : memory.outputs
      
      switch (faultType) {
        case 'stuck-on':
          target[address] = true
          break
        case 'stuck-off':
          target[address] = false
          break
        case 'intermittent':
          if (Math.random() > 0.5) {
            target[address] = !target[address]
          }
          break
      }
    }
  }
}))