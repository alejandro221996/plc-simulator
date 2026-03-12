import type { ScenarioConfig } from './types'

export const fourWayIntersection: ScenarioConfig = {
  id: 'four-way-intersection',
  name: '4-Way Intersection',
  description: 'Complex intersection with NS/EW phases and pedestrian crossing',
  complexity: 2,
  ioMap: {
    inputs: [
      { address: 'I:0/0', label: 'Start', description: 'Start button' },
      { address: 'I:0/1', label: 'Stop', description: 'Stop button' },
      { address: 'I:0/2', label: 'Ped Request', description: 'Pedestrian crossing request' },
    ],
    outputs: [
      { address: 'O:0/0', label: 'NS-Red', description: 'North-South red light' },
      { address: 'O:0/1', label: 'NS-Yellow', description: 'North-South yellow light' },
      { address: 'O:0/2', label: 'NS-Green', description: 'North-South green light' },
      { address: 'O:0/3', label: 'EW-Red', description: 'East-West red light' },
      { address: 'O:0/4', label: 'EW-Yellow', description: 'East-West yellow light' },
      { address: 'O:0/5', label: 'EW-Green', description: 'East-West green light' },
      { address: 'O:0/6', label: 'Walk Signal', description: 'Pedestrian walk signal' },
    ],
    timers: [
      { address: 'T4:0', label: 'NS-Green', preset: 10 },
      { address: 'T4:1', label: 'NS-Yellow', preset: 3 },
      { address: 'T4:2', label: 'All-Red', preset: 1 },
      { address: 'T4:3', label: 'EW-Green', preset: 10 },
      { address: 'T4:4', label: 'EW-Yellow', preset: 3 },
      { address: 'T4:5', label: 'All-Red-2', preset: 1 },
    ],
    bits: [
      { address: 'B3:0/0', label: 'Run' },
      { address: 'B3:0/1', label: 'Reset' },
      { address: 'B3:0/2', label: 'NS-Phase' },
      { address: 'B3:0/3', label: 'EW-Phase' },
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
      comment: 'NS Green timer',
      elements: [
        { id: 'e4', type: 'contact-no', address: 'B3:0/0', label: 'Run' },
        { id: 'e5', type: 'contact-nc', address: 'B3:0/3', label: 'EW-Phase' },
        { id: 'e6', type: 'timer-ton', address: 'T4:0' },
      ],
    },
    {
      id: 'rung-3',
      comment: 'NS Yellow timer',
      elements: [
        { id: 'e7', type: 'contact-no', address: 'T4:0.DN' },
        { id: 'e8', type: 'timer-ton', address: 'T4:1' },
      ],
    },
    {
      id: 'rung-4',
      comment: 'All Red timer',
      elements: [
        { id: 'e9', type: 'contact-no', address: 'T4:1.DN' },
        { id: 'e10', type: 'timer-ton', address: 'T4:2' },
      ],
    },
    {
      id: 'rung-5',
      comment: 'EW Green timer',
      elements: [
        { id: 'e11', type: 'contact-no', address: 'T4:2.DN' },
        { id: 'e12', type: 'timer-ton', address: 'T4:3' },
      ],
    },
    {
      id: 'rung-6',
      comment: 'EW Yellow timer',
      elements: [
        { id: 'e13', type: 'contact-no', address: 'T4:3.DN' },
        { id: 'e14', type: 'timer-ton', address: 'T4:4' },
      ],
    },
    {
      id: 'rung-7',
      comment: 'All Red 2 timer',
      elements: [
        { id: 'e15', type: 'contact-no', address: 'T4:4.DN' },
        { id: 'e16', type: 'timer-ton', address: 'T4:5' },
      ],
    },
    {
      id: 'rung-8',
      comment: 'Cycle reset - restarts all timers',
      elements: [
        { id: 'e17', type: 'contact-no', address: 'T4:5.DN' },
        { id: 'e18', type: 'coil', address: 'B3:RESET', label: 'Reset' },
      ],
    },
    {
      id: 'rung-9',
      comment: 'NS Green light',
      elements: [
        { id: 'e19', type: 'contact-no', address: 'B3:0/0', label: 'Run' },
        { id: 'e20', type: 'contact-nc', address: 'T4:0.DN' },
        { id: 'e21', type: 'coil', address: 'O:0/2', label: 'NS-Green' },
      ],
    },
    {
      id: 'rung-10',
      comment: 'NS Yellow light',
      elements: [
        { id: 'e22', type: 'contact-no', address: 'T4:0.DN' },
        { id: 'e23', type: 'contact-nc', address: 'T4:1.DN' },
        { id: 'e24', type: 'coil', address: 'O:0/1', label: 'NS-Yellow' },
      ],
    },
    {
      id: 'rung-11',
      comment: 'EW Green light',
      elements: [
        { id: 'e25', type: 'contact-no', address: 'T4:2.DN' },
        { id: 'e26', type: 'contact-nc', address: 'T4:3.DN' },
        { id: 'e27', type: 'coil', address: 'O:0/5', label: 'EW-Green' },
      ],
    },
    {
      id: 'rung-12',
      comment: 'EW Yellow light',
      elements: [
        { id: 'e28', type: 'contact-no', address: 'T4:3.DN' },
        { id: 'e29', type: 'contact-nc', address: 'T4:4.DN' },
        { id: 'e30', type: 'coil', address: 'O:0/4', label: 'EW-Yellow' },
      ],
    },
    {
      id: 'rung-13',
      comment: 'NS Red light (when not green and not yellow)',
      elements: [
        { id: 'e31', type: 'contact-no', address: 'B3:0/0', label: 'Run' },
        { id: 'e32', type: 'contact-nc', address: 'O:0/2', label: 'NS-Green' },
        { id: 'e32b', type: 'contact-nc', address: 'O:0/1', label: 'NS-Yellow' },
        { id: 'e33', type: 'coil', address: 'O:0/0', label: 'NS-Red' },
      ],
    },
    {
      id: 'rung-14',
      comment: 'EW Red light (when not green and not yellow)',
      elements: [
        { id: 'e34', type: 'contact-no', address: 'B3:0/0', label: 'Run' },
        { id: 'e35', type: 'contact-nc', address: 'O:0/5', label: 'EW-Green' },
        { id: 'e35b', type: 'contact-nc', address: 'O:0/4', label: 'EW-Yellow' },
        { id: 'e36', type: 'coil', address: 'O:0/3', label: 'EW-Red' },
      ],
    },
  ],
  defaultMemory: {
    inputs: {
      'I:0/0': false,
      'I:0/1': false,
      'I:0/2': false,
    },
    outputs: {
      'O:0/0': false,
      'O:0/1': false,
      'O:0/2': false,
      'O:0/3': false,
      'O:0/4': false,
      'O:0/5': false,
      'O:0/6': false,
    },
    bits: {
      'B3:0/0': false,
      'B3:0/1': false,
      'B3:0/2': false,
      'B3:0/3': false,
      'B3:RESET': false,
    },
    timers: {
      'T4:0': { preset: 10, accumulated: 0, done: false, timing: false, enabled: false },
      'T4:1': { preset: 3, accumulated: 0, done: false, timing: false, enabled: false },
      'T4:2': { preset: 1, accumulated: 0, done: false, timing: false, enabled: false },
      'T4:3': { preset: 10, accumulated: 0, done: false, timing: false, enabled: false },
      'T4:4': { preset: 3, accumulated: 0, done: false, timing: false, enabled: false },
      'T4:5': { preset: 1, accumulated: 0, done: false, timing: false, enabled: false },
    },
  },
  sceneComponent: 'intersection',
}