import type { ScenarioConfig } from './types'

export const sandbox: ScenarioConfig = {
  id: 'sandbox',
  name: 'Sandbox',
  description: 'Free practice mode — build your own ladder logic programs',
  complexity: 1,
  ioMap: {
    inputs: [
      { address: 'I:0/0', label: 'Input 0', description: 'Input 0' },
      { address: 'I:0/1', label: 'Input 1', description: 'Input 1' },
      { address: 'I:0/2', label: 'Input 2', description: 'Input 2' },
      { address: 'I:0/3', label: 'Input 3', description: 'Input 3' },
    ],
    outputs: [
      { address: 'O:0/0', label: 'Output 0', description: 'Output 0' },
      { address: 'O:0/1', label: 'Output 1', description: 'Output 1' },
      { address: 'O:0/2', label: 'Output 2', description: 'Output 2' },
      { address: 'O:0/3', label: 'Output 3', description: 'Output 3' },
    ],
    timers: [
      { address: 'T4:0', label: 'Timer 0', preset: 5 },
      { address: 'T4:1', label: 'Timer 1', preset: 3 },
    ],
    bits: [
      { address: 'B3:0/0', label: 'Bit 0' },
      { address: 'B3:0/1', label: 'Bit 1' },
    ],
  },
  defaultProgram: [
    {
      id: 'rung-1',
      comment: 'Add your logic here',
      elements: [],
    },
  ],
  defaultMemory: {
    inputs: {
      'I:0/0': false,
      'I:0/1': false,
      'I:0/2': false,
      'I:0/3': false,
    },
    outputs: {
      'O:0/0': false,
      'O:0/1': false,
      'O:0/2': false,
      'O:0/3': false,
    },
    bits: {
      'B3:0/0': false,
      'B3:0/1': false,
    },
    timers: {
      'T4:0': { preset: 5, accumulated: 0, done: false, timing: false, enabled: false },
      'T4:1': { preset: 3, accumulated: 0, done: false, timing: false, enabled: false },
    },
  },
  sceneComponent: 'sandbox',
}