import type { Rung, PLCMemory } from '../types/ladder'

export interface LadderExample {
  id: string
  name: string
  description: string
  rungs: Rung[]
  memory: PLCMemory
}

const createSandboxMemory = (): PLCMemory => ({
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
})

export const ladderExamples: LadderExample[] = [
  {
    id: 'simple-on-off',
    name: 'Simple ON/OFF',
    description: 'Toggle I:0/0 to turn O:0/0 on/off. Basic contact-coil relationship.',
    rungs: [
      {
        id: 'rung-1',
        comment: 'Simple ON/OFF',
        elements: [
          { id: 'e1', type: 'contact-no', address: 'I:0/0' },
          { id: 'e2', type: 'coil', address: 'O:0/0' },
        ],
      },
    ],
    memory: createSandboxMemory(),
  },
  {
    id: 'and-logic',
    name: 'AND Logic',
    description: 'Both I:0/0 AND I:0/1 must be ON to energize O:0/0.',
    rungs: [
      {
        id: 'rung-1',
        comment: 'AND Logic',
        elements: [
          { id: 'e1', type: 'contact-no', address: 'I:0/0' },
          { id: 'e2', type: 'contact-no', address: 'I:0/1' },
          { id: 'e3', type: 'coil', address: 'O:0/0' },
        ],
      },
    ],
    memory: createSandboxMemory(),
  },
  {
    id: 'not-nc-contact',
    name: 'NOT (NC Contact)',
    description: 'O:0/0 is ON when I:0/0 is OFF. NC contact passes current when address is false.',
    rungs: [
      {
        id: 'rung-1',
        comment: 'NOT Logic',
        elements: [
          { id: 'e1', type: 'contact-nc', address: 'I:0/0' },
          { id: 'e2', type: 'coil', address: 'O:0/0' },
        ],
      },
    ],
    memory: createSandboxMemory(),
  },
  {
    id: 'seal-in-latch',
    name: 'Seal-In Latch',
    description: 'Press I:0/0 to latch ON. Press I:0/1 to unlatch. B3:0/0 holds the state, O:0/0 shows result.',
    rungs: [
      {
        id: 'rung-1',
        comment: 'Start button sets bit',
        elements: [
          { id: 'e1', type: 'contact-no', address: 'I:0/0', label: 'Start' },
          { id: 'e2', type: 'coil', address: 'B3:0/0' },
        ],
      },
      {
        id: 'rung-2',
        comment: 'Seal-in with stop',
        elements: [
          { id: 'e3', type: 'contact-no', address: 'B3:0/0' },
          { id: 'e4', type: 'contact-nc', address: 'I:0/1', label: 'Stop' },
          { id: 'e5', type: 'coil', address: 'B3:0/0' },
        ],
      },
      {
        id: 'rung-3',
        comment: 'Output follows bit',
        elements: [
          { id: 'e6', type: 'contact-no', address: 'B3:0/0' },
          { id: 'e7', type: 'coil', address: 'O:0/0' },
        ],
      },
    ],
    memory: createSandboxMemory(),
  },
  {
    id: 'timer-delay-on',
    name: 'Timer Delay ON',
    description: 'O:0/0 turns ON 3 seconds after I:0/0 is activated. Release I:0/0 to reset.',
    rungs: [
      {
        id: 'rung-1',
        comment: 'Timer with 3s preset',
        elements: [
          { id: 'e1', type: 'contact-no', address: 'I:0/0' },
          { id: 'e2', type: 'timer-ton', address: 'T4:0' },
        ],
      },
      {
        id: 'rung-2',
        comment: 'Output when timer done',
        elements: [
          { id: 'e3', type: 'contact-no', address: 'T4:0.DN' },
          { id: 'e4', type: 'coil', address: 'O:0/0' },
        ],
      },
    ],
    memory: {
      ...createSandboxMemory(),
      timers: {
        'T4:0': { preset: 3, accumulated: 0, done: false, timing: false, enabled: false },
        'T4:1': { preset: 3, accumulated: 0, done: false, timing: false, enabled: false },
      },
    },
  },
  {
    id: 'alternating-outputs',
    name: 'Alternating Outputs',
    description: 'With I:0/0 ON, outputs alternate every 2 seconds. O:0/0 and O:0/1 toggle back and forth.',
    rungs: [
      {
        id: 'rung-1',
        comment: 'Timer runs when enabled and bit is off',
        elements: [
          { id: 'e1', type: 'contact-no', address: 'I:0/0', label: 'Enable' },
          { id: 'e2', type: 'contact-nc', address: 'B3:0/0' },
          { id: 'e3', type: 'timer-ton', address: 'T4:0' },
        ],
      },
      {
        id: 'rung-2',
        comment: 'Toggle bit when timer done',
        elements: [
          { id: 'e4', type: 'contact-no', address: 'T4:0.DN' },
          { id: 'e5', type: 'coil', address: 'B3:0/0' },
        ],
      },
      {
        id: 'rung-3',
        comment: 'Output 0 when bit is off',
        elements: [
          { id: 'e6', type: 'contact-nc', address: 'B3:0/0' },
          { id: 'e7', type: 'coil', address: 'O:0/0' },
        ],
      },
      {
        id: 'rung-4',
        comment: 'Output 1 when bit is on',
        elements: [
          { id: 'e8', type: 'contact-no', address: 'B3:0/0' },
          { id: 'e9', type: 'coil', address: 'O:0/1' },
        ],
      },
    ],
    memory: {
      ...createSandboxMemory(),
      timers: {
        'T4:0': { preset: 2, accumulated: 0, done: false, timing: false, enabled: false },
        'T4:1': { preset: 3, accumulated: 0, done: false, timing: false, enabled: false },
      },
    },
  },
]
