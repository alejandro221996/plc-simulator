import type { Challenge } from './types'

export const scenarioChallenges = new Map<string, Challenge[]>([
  ['sandbox', [
    {
      id: 'simple-and',
      title: 'Simple AND Gate',
      description: 'Make O:0/0 turn ON only when both I:0/0 AND I:0/1 are ON.',
      hint: 'Add two NO contacts (I:0/0 and I:0/1) in series, followed by a coil (O:0/0).',
      validate: (memory) => {
        const i0 = memory.inputs['I:0/0']
        const i1 = memory.inputs['I:0/1']
        const o0 = memory.outputs['O:0/0']
        if (i0 && i1) return o0 === true
        return o0 === false
      }
    },
    {
      id: 'seal-in-latch',
      title: 'Seal-In Latch',
      description: 'O:0/1 must stay ON after I:0/2 is briefly activated, even after I:0/2 turns OFF. Use I:0/3 to unlatch.',
      hint: 'Use B3:0/0 as a latch bit. Rung 1: I:0/2 OR B3:0/0, with NC I:0/3, energizes B3:0/0. Rung 2: B3:0/0 energizes O:0/1.',
      validate: (memory) => {
        if (memory.inputs['I:0/3']) return memory.outputs['O:0/1'] === false
        return true
      }
    },
    {
      id: 'timer-delay',
      title: 'Timer Delay',
      description: 'O:0/2 must turn ON 3 seconds after I:0/0 is activated. Change T4:0 preset to 3.',
      hint: 'Create a rung with I:0/0 energizing T4:0 timer, then another rung with T4:0.DN energizing O:0/2.',
      validate: (memory) => memory.timers['T4:0']?.preset === 3
    }
  ]],
  
  ['single-traffic-light', [
    {
      id: 'faster-green',
      title: 'Faster Green',
      description: 'Change the green light cycle to 3 seconds instead of 5 seconds.',
      hint: 'Modify the T4:0 timer preset value to 3.',
      validate: (memory) => memory.timers['T4:0']?.preset === 3
    },
    {
      id: 'emergency-stop',
      title: 'Add Emergency Stop',
      description: 'When I:0/1 (Stop) is active, all lights should turn off.',
      hint: 'Add normally closed contacts for I:0/1 in the light output rungs.',
      validate: (memory) => {
        if (memory.inputs['I:0/1']) {
          return !memory.outputs['O:0/0'] && !memory.outputs['O:0/1'] && !memory.outputs['O:0/2']
        }
        return true
      }
    }
  ]],
  
  ['four-way-intersection', [
    {
      id: 'shorter-yellow',
      title: 'Shorter Yellow',
      description: 'Reduce the North-South yellow phase to 2 seconds.',
      hint: 'Change the T4:1 timer preset to 2.',
      validate: (memory) => memory.timers['T4:1']?.preset === 2
    },
    {
      id: 'pedestrian-phase',
      title: 'Pedestrian Phase',
      description: 'When I:0/2 (Ped Request) is pressed, O:0/6 (Walk Signal) should activate.',
      hint: 'Add a rung that energizes O:0/6 when I:0/2 is true.',
      validate: (_memory, _scanCount, history) => {
        const pedRequested = history.some(h => h.inputs['I:0/2'])
        if (pedRequested) {
          return history.some(h => h.outputs['O:0/6'])
        }
        return true
      }
    }
  ]],
  
  ['conveyor-belt', [
    {
      id: 'longer-piston',
      title: 'Longer Piston',
      description: 'Change the piston activation time to 3 seconds.',
      hint: 'Modify the T4:0 timer preset to 3.',
      validate: (memory) => memory.timers['T4:0']?.preset === 3
    },
    {
      id: 'stop-on-reject',
      title: 'Stop on Reject',
      description: 'When a reject box is detected (I:0/3), the motor (O:0/0) should stop.',
      hint: 'Add a normally closed contact for I:0/3 in the motor control rung.',
      validate: (memory) => {
        if (memory.inputs['I:0/3']) {
          return !memory.outputs['O:0/0']
        }
        return true
      }
    }
  ]],
  
  ['garage-door', [
    {
      id: 'quick-auto-close',
      title: 'Quick Auto-Close',
      description: 'Reduce the auto-close timer to 2 seconds so the door closes faster after opening.',
      hint: 'Modify the T4:0 timer preset value to 2.',
      validate: (memory) => memory.timers['T4:0']?.preset === 2
    },
    {
      id: 'safety-light',
      title: 'Safety Light',
      description: 'The light (O:0/2) should turn on when the photocell (I:0/4) detects an obstacle.',
      hint: 'Add a rung that energizes O:0/2 when I:0/4 is true.',
      validate: (memory) => {
        if (memory.inputs['I:0/4']) {
          return memory.outputs['O:0/2']
        }
        return true
      }
    }
  ]]
])