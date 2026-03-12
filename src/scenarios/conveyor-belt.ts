import type { ScenarioConfig } from './types'

export const conveyorBelt: ScenarioConfig = {
  id: 'conveyor-belt',
  name: 'Conveyor Belt with Sorting',
  description: 'Conveyor system with box detection and reject mechanism',
  complexity: 2,
  ioMap: {
    inputs: [
      { address: 'I:0/0', label: 'Start', description: 'Start button' },
      { address: 'I:0/1', label: 'Stop', description: 'Stop button' },
      { address: 'I:0/2', label: 'Sensor', description: 'Box detection sensor' },
      { address: 'I:0/3', label: 'Box Type', description: 'Reject box type sensor' },
    ],
    outputs: [
      { address: 'O:0/0', label: 'Motor Belt', description: 'Conveyor motor' },
      { address: 'O:0/1', label: 'Piston Extend', description: 'Reject piston' },
      { address: 'O:0/2', label: 'Green Indicator', description: 'Good box indicator' },
      { address: 'O:0/3', label: 'Red Indicator', description: 'Reject box indicator' },
    ],
    timers: [
      { address: 'T4:0', label: 'Piston Extend', preset: 2 },
    ],
    bits: [
      { address: 'B3:0/0', label: 'Run' },
      { address: 'B3:0/1', label: 'Sorting Active' },
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
      comment: 'Conveyor motor (run when not sorting)',
      elements: [
        { id: 'e4', type: 'contact-no', address: 'B3:0/0', label: 'Run' },
        { id: 'e5', type: 'contact-nc', address: 'B3:0/1', label: 'Sorting Active' },
        { id: 'e6', type: 'coil', address: 'O:0/0', label: 'Motor Belt' },
      ],
    },
    {
      id: 'rung-3',
      comment: 'Sorting active when reject box detected',
      elements: [
        { id: 'e7', type: 'contact-no', address: 'I:0/2', label: 'Sensor' },
        { id: 'e8', type: 'contact-no', address: 'I:0/3', label: 'Box Type' },
        { id: 'e9', type: 'coil', address: 'B3:0/1', label: 'Sorting Active' },
      ],
    },
    {
      id: 'rung-4',
      comment: 'Piston extend timer',
      elements: [
        { id: 'e10', type: 'contact-no', address: 'B3:0/1', label: 'Sorting Active' },
        { id: 'e11', type: 'timer-ton', address: 'T4:0' },
      ],
    },
    {
      id: 'rung-5',
      comment: 'Piston extend output',
      elements: [
        { id: 'e12', type: 'contact-no', address: 'B3:0/1', label: 'Sorting Active' },
        { id: 'e13', type: 'contact-nc', address: 'T4:0.DN' },
        { id: 'e14', type: 'coil', address: 'O:0/1', label: 'Piston Extend' },
      ],
    },
    {
      id: 'rung-6',
      comment: 'Green indicator (good box)',
      elements: [
        { id: 'e17', type: 'contact-no', address: 'I:0/2', label: 'Sensor' },
        { id: 'e18', type: 'contact-nc', address: 'I:0/3', label: 'Box Type' },
        { id: 'e19', type: 'coil', address: 'O:0/2', label: 'Green Indicator' },
      ],
    },
    {
      id: 'rung-7',
      comment: 'Red indicator (reject box)',
      elements: [
        { id: 'e20', type: 'contact-no', address: 'I:0/2', label: 'Sensor' },
        { id: 'e21', type: 'contact-no', address: 'I:0/3', label: 'Box Type' },
        { id: 'e22', type: 'coil', address: 'O:0/3', label: 'Red Indicator' },
      ],
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
      'T4:0': { preset: 2, accumulated: 0, done: false, timing: false, enabled: false },
    },
  },
  sceneComponent: 'conveyor',
}