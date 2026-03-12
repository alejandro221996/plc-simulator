import { evaluateRungs } from '../engine/ladderEngine'
import type { Rung, PLCMemory } from '../types/ladder'
import { useFaultStore } from '../store/faultStore'

describe('evaluateRungs', () => {
  beforeEach(() => {
    useFaultStore.getState().clearFaults()
  })

  test('should handle contact-no basic operation', () => {
    const memory: PLCMemory = {
      inputs: { 'I:0/0': true },
      outputs: { 'O:0/0': false },
      bits: {},
      timers: {}
    }
    
    const rung: Rung = {
      id: 'test-rung',
      elements: [
        { id: 'e1', type: 'contact-no', address: 'I:0/0' },
        { id: 'e2', type: 'coil', address: 'O:0/0' }
      ]
    }

    const result = evaluateRungs([rung], memory, 0.1)
    expect(result.outputs['O:0/0']).toBe(true)

    memory.inputs['I:0/0'] = false
    const result2 = evaluateRungs([rung], memory, 0.1)
    expect(result2.outputs['O:0/0']).toBe(false)
  })

  test('should handle contact-nc basic operation', () => {
    const memory: PLCMemory = {
      inputs: { 'I:0/1': false },
      outputs: { 'O:0/0': false },
      bits: {},
      timers: {}
    }
    
    const rung: Rung = {
      id: 'test-rung',
      elements: [
        { id: 'e1', type: 'contact-nc', address: 'I:0/1' },
        { id: 'e2', type: 'coil', address: 'O:0/0' }
      ]
    }

    const result = evaluateRungs([rung], memory, 0.1)
    expect(result.outputs['O:0/0']).toBe(true)

    memory.inputs['I:0/1'] = true
    const result2 = evaluateRungs([rung], memory, 0.1)
    expect(result2.outputs['O:0/0']).toBe(false)
  })

  test('should handle series contacts (AND logic)', () => {
    const memory: PLCMemory = {
      inputs: { 'I:0/0': true, 'I:0/1': true },
      outputs: { 'O:0/0': false },
      bits: {},
      timers: {}
    }
    
    const rung: Rung = {
      id: 'test-rung',
      elements: [
        { id: 'e1', type: 'contact-no', address: 'I:0/0' },
        { id: 'e2', type: 'contact-no', address: 'I:0/1' },
        { id: 'e3', type: 'coil', address: 'O:0/0' }
      ]
    }

    const result = evaluateRungs([rung], memory, 0.1)
    expect(result.outputs['O:0/0']).toBe(true)

    memory.inputs['I:0/0'] = false
    const result2 = evaluateRungs([rung], memory, 0.1)
    expect(result2.outputs['O:0/0']).toBe(false)
  })

  test('should handle timer TON operation', () => {
    const memory: PLCMemory = {
      inputs: {},
      outputs: {},
      bits: { 'B3:0/0': true },
      timers: { 'T4:0': { preset: 1, accumulated: 0, done: false, timing: false, enabled: false } }
    }
    
    const rung: Rung = {
      id: 'test-rung',
      elements: [
        { id: 'e1', type: 'contact-no', address: 'B3:0/0' },
        { id: 'e2', type: 'timer-ton', address: 'T4:0' }
      ]
    }

    // First scan enables the timer
    let result = evaluateRungs([rung], memory, 0.5)
    expect(result.timers['T4:0'].enabled).toBe(true)
    expect(result.timers['T4:0'].timing).toBe(true)
    
    // Second scan accumulates time
    result = evaluateRungs([rung], result, 0.5)
    expect(result.timers['T4:0'].accumulated).toBe(0.5)
    expect(result.timers['T4:0'].done).toBe(false)

    result = evaluateRungs([rung], result, 0.6)
    expect(result.timers['T4:0'].accumulated).toBe(1)
    expect(result.timers['T4:0'].done).toBe(true)
  })

  test('should reset timer on power loss', () => {
    const memory: PLCMemory = {
      inputs: {},
      outputs: {},
      bits: { 'B3:0/0': true },
      timers: { 'T4:0': { preset: 5, accumulated: 2, done: false, timing: true, enabled: true } }
    }
    
    const rung: Rung = {
      id: 'test-rung',
      elements: [
        { id: 'e1', type: 'contact-no', address: 'B3:0/0' },
        { id: 'e2', type: 'timer-ton', address: 'T4:0' }
      ]
    }

    memory.bits['B3:0/0'] = false
    const result = evaluateRungs([rung], memory, 0.1)
    expect(result.timers['T4:0'].accumulated).toBe(0)
    expect(result.timers['T4:0'].done).toBe(false)
  })

  test('should handle reset bit B3:0/1', () => {
    const memory: PLCMemory = {
      inputs: {},
      outputs: { 'O:0/0': true },
      bits: { 'B3:0/1': true },
      timers: { 'T4:0': { preset: 5, accumulated: 3, done: false, timing: true, enabled: true } }
    }
    
    const rung: Rung = {
      id: 'test-rung',
      elements: []
    }

    const result = evaluateRungs([rung], memory, 0.1)
    expect(result.timers['T4:0'].accumulated).toBe(0)
    expect(result.timers['T4:0'].done).toBe(false)
    expect(result.outputs['O:0/0']).toBe(false)
    expect(result.bits['B3:0/1']).toBe(false)
  })

  test('should apply speed multiplier', () => {
    const memory: PLCMemory = {
      inputs: {},
      outputs: {},
      bits: { 'B3:0/0': true },
      timers: { 'T4:0': { preset: 1, accumulated: 0, done: false, timing: false, enabled: false } }
    }
    
    const rung: Rung = {
      id: 'test-rung',
      elements: [
        { id: 'e1', type: 'contact-no', address: 'B3:0/0' },
        { id: 'e2', type: 'timer-ton', address: 'T4:0' }
      ]
    }

    // First scan enables the timer
    let result = evaluateRungs([rung], memory, 0.1 * 2)
    expect(result.timers['T4:0'].enabled).toBe(true)
    
    // Second scan accumulates time with speed multiplier
    result = evaluateRungs([rung], result, 0.1 * 2)
    expect(result.timers['T4:0'].accumulated).toBe(0.2)
  })

  test('should apply fault injection', () => {
    const memory: PLCMemory = {
      inputs: { 'I:0/0': false },
      outputs: { 'O:0/0': false },
      bits: {},
      timers: {}
    }
    
    const rung: Rung = {
      id: 'test-rung',
      elements: [
        { id: 'e1', type: 'contact-no', address: 'I:0/0' },
        { id: 'e2', type: 'coil', address: 'O:0/0' }
      ]
    }

    useFaultStore.getState().addFault('I:0/0', 'stuck-on')
    const result = evaluateRungs([rung], memory, 0.1)
    expect(result.inputs['I:0/0']).toBe(true)
  })
})