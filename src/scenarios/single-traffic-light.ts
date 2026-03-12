import type { ScenarioConfig } from './types'

export const singleTrafficLight: ScenarioConfig = {
  id: 'single-traffic-light',
  name: 'Single Traffic Light',
  description: 'Basic traffic light with 3 phases: Green (5s) → Yellow (2s) → Red (5s)',
  complexity: 1,
  ioMap: {
    inputs: [
      { address: 'I:0/0', label: 'Start', description: 'Start button' },
      { address: 'I:0/1', label: 'Stop', description: 'Stop button' },
    ],
    outputs: [
      { address: 'O:0/0', label: 'Red', description: 'Red light' },
      { address: 'O:0/1', label: 'Yellow', description: 'Yellow light' },
      { address: 'O:0/2', label: 'Green', description: 'Green light' },
    ],
    timers: [
      { address: 'T4:0', label: 'Green Timer', preset: 5 },
      { address: 'T4:1', label: 'Yellow Timer', preset: 2 },
      { address: 'T4:2', label: 'Red Timer', preset: 5 },
    ],
    bits: [
      { address: 'B3:0/0', label: 'Run' },
      { address: 'B3:RESET', label: 'Cycle Reset' },
    ],
  },
  defaultProgram: [
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
        { id: 'e13', type: 'coil', address: 'B3:RESET', label: 'Cycle Reset' },
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
  ],
  defaultMemory: {
    inputs: {
      'I:0/0': false,
      'I:0/1': false,
    },
    outputs: {
      'O:0/0': false,
      'O:0/1': false,
      'O:0/2': false,
    },
    bits: {
      'B3:0/0': false,
      'B3:RESET': false,
    },
    timers: {
      'T4:0': { preset: 5, accumulated: 0, done: false, timing: false, enabled: false },
      'T4:1': { preset: 2, accumulated: 0, done: false, timing: false, enabled: false },
      'T4:2': { preset: 5, accumulated: 0, done: false, timing: false, enabled: false },
    },
  },
  sceneComponent: 'traffic-light',
}