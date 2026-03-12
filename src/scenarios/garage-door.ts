import type { ScenarioConfig } from './types'

export const garageDoor: ScenarioConfig = {
  id: 'garage-door',
  name: 'Garage Door Controller',
  description: 'Two-button garage door with auto-close timer and photocell safety',
  complexity: 2,
  ioMap: {
    inputs: [
      { address: 'I:0/0', label: 'BTN UP', description: 'Press to open door' },
      { address: 'I:0/1', label: 'BTN DOWN', description: 'Press to close door' },
      { address: 'I:0/2', label: 'Limit Top', description: 'Top limit switch (auto)' },
      { address: 'I:0/3', label: 'Limit Bottom', description: 'Bottom limit switch (auto)' },
      { address: 'I:0/4', label: 'Photocell', description: 'Safety photocell (obstacle)' },
    ],
    outputs: [
      { address: 'O:0/0', label: 'Motor Up', description: 'Motor up direction' },
      { address: 'O:0/1', label: 'Motor Down', description: 'Motor down direction' },
      { address: 'O:0/2', label: 'Light', description: 'Light (on while moving)' },
    ],
    timers: [
      { address: 'T4:0', label: 'Auto-Close', preset: 5 },
    ],
    bits: [
      { address: 'B3:0/0', label: 'Go Up' },
      { address: 'B3:0/1', label: 'Go Down' },
    ],
  },
  defaultProgram: [
    {
      id: 'rung-1',
      comment: 'BTN UP and not at top → Go Up',
      elements: [
        { id: 'e1', type: 'contact-no', address: 'I:0/0', label: 'BTN UP' },
        { id: 'e2', type: 'contact-nc', address: 'I:0/2', label: 'Not at Top' },
        { id: 'e3', type: 'coil', address: 'B3:0/0', label: 'Go Up' },
      ],
    },
    {
      id: 'rung-2',
      comment: 'Auto-close timer: at top, no buttons pressed',
      elements: [
        { id: 'e4', type: 'contact-no', address: 'I:0/2', label: 'At Top' },
        { id: 'e5', type: 'contact-nc', address: 'I:0/0', label: 'No BTN UP' },
        { id: 'e6', type: 'contact-nc', address: 'I:0/1', label: 'No BTN DN' },
        { id: 'e7', type: 'timer-ton', address: 'T4:0' },
      ],
    },
    {
      id: 'rung-3',
      comment: 'BTN DOWN and not at bottom and no obstacle → Go Down',
      elements: [
        { id: 'e8', type: 'contact-no', address: 'I:0/1', label: 'BTN DN' },
        { id: 'e9', type: 'contact-nc', address: 'I:0/3', label: 'Not at Bot' },
        { id: 'e10', type: 'contact-nc', address: 'I:0/4', label: 'No Obstacle' },
        { id: 'e11', type: 'coil', address: 'B3:0/1', label: 'Go Down' },
      ],
    },
    {
      id: 'rung-4',
      comment: 'Timer done and not at bottom and no obstacle → Go Down',
      elements: [
        { id: 'e12', type: 'contact-no', address: 'T4:0.DN' },
        { id: 'e13', type: 'contact-nc', address: 'I:0/3', label: 'Not at Bot' },
        { id: 'e14', type: 'contact-nc', address: 'I:0/4', label: 'No Obstacle' },
        { id: 'e15', type: 'coil', address: 'B3:0/1', label: 'Go Down' },
      ],
    },
    {
      id: 'rung-5',
      comment: 'Go Up → Motor Up',
      elements: [
        { id: 'e16', type: 'contact-no', address: 'B3:0/0', label: 'Go Up' },
        { id: 'e17', type: 'coil', address: 'O:0/0', label: 'Motor Up' },
      ],
    },
    {
      id: 'rung-6',
      comment: 'Go Down → Motor Down',
      elements: [
        { id: 'e18', type: 'contact-no', address: 'B3:0/1', label: 'Go Down' },
        { id: 'e19', type: 'coil', address: 'O:0/1', label: 'Motor Down' },
      ],
    },
    {
      id: 'rung-7',
      comment: 'Light while up',
      elements: [
        { id: 'e20', type: 'contact-no', address: 'O:0/0', label: 'Motor Up' },
        { id: 'e21', type: 'coil', address: 'O:0/2', label: 'Light' },
      ],
    },
    {
      id: 'rung-8',
      comment: 'Light while down',
      elements: [
        { id: 'e22', type: 'contact-no', address: 'O:0/1', label: 'Motor Down' },
        { id: 'e23', type: 'coil', address: 'O:0/2', label: 'Light' },
      ],
    },
  ],
  defaultMemory: {
    inputs: {
      'I:0/0': false,
      'I:0/1': false,
      'I:0/2': false,
      'I:0/3': true, // Start at bottom
      'I:0/4': false,
    },
    outputs: {
      'O:0/0': false,
      'O:0/1': false,
      'O:0/2': false,
    },
    bits: {
      'B3:0/0': false,
      'B3:0/1': false,
    },
    timers: {
      'T4:0': { preset: 5, accumulated: 0, done: false, timing: false, enabled: false },
    },
  },
  sceneComponent: 'garage-door',
}