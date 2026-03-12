import { scenarioChallenges } from '../scenarios/challenges'
import type { PLCMemory } from '../types/ladder'

describe('Challenge Integration Tests', () => {
  describe('Traffic Light Challenges', () => {
    const challenges = scenarioChallenges.get('single-traffic-light')!

    test('should validate faster green challenge', () => {
      const fasterGreenChallenge = challenges.find(c => c.id === 'faster-green')!
      
      const memoryWith3s: PLCMemory = {
        inputs: {},
        outputs: {},
        bits: {},
        timers: { 'T4:0': { preset: 3, accumulated: 0, done: false, timing: false, enabled: false } }
      }
      
      expect(fasterGreenChallenge.validate(memoryWith3s, 1, [])).toBe(true)
      
      const memoryWith5s: PLCMemory = {
        inputs: {},
        outputs: {},
        bits: {},
        timers: { 'T4:0': { preset: 5, accumulated: 0, done: false, timing: false, enabled: false } }
      }
      
      expect(fasterGreenChallenge.validate(memoryWith5s, 1, [])).toBe(false)
    })

    test('should validate emergency stop challenge', () => {
      const emergencyStopChallenge = challenges.find(c => c.id === 'emergency-stop')!
      
      const memoryWithStopActive: PLCMemory = {
        inputs: { 'I:0/1': true },
        outputs: { 'O:0/0': false, 'O:0/1': false, 'O:0/2': false },
        bits: {},
        timers: {}
      }
      
      expect(emergencyStopChallenge.validate(memoryWithStopActive, 1, [])).toBe(true)
      
      const memoryWithLightOn: PLCMemory = {
        inputs: { 'I:0/1': true },
        outputs: { 'O:0/0': true, 'O:0/1': false, 'O:0/2': false },
        bits: {},
        timers: {}
      }
      
      expect(emergencyStopChallenge.validate(memoryWithLightOn, 1, [])).toBe(false)
    })
  })

  describe('Conveyor Belt Challenges', () => {
    const challenges = scenarioChallenges.get('conveyor-belt')!

    test('should validate longer piston challenge', () => {
      const longerPistonChallenge = challenges.find(c => c.id === 'longer-piston')!
      
      const memoryWith3s: PLCMemory = {
        inputs: {},
        outputs: {},
        bits: {},
        timers: { 'T4:0': { preset: 3, accumulated: 0, done: false, timing: false, enabled: false } }
      }
      
      expect(longerPistonChallenge.validate(memoryWith3s, 1, [])).toBe(true)
      
      const memoryWith2s: PLCMemory = {
        inputs: {},
        outputs: {},
        bits: {},
        timers: { 'T4:0': { preset: 2, accumulated: 0, done: false, timing: false, enabled: false } }
      }
      
      expect(longerPistonChallenge.validate(memoryWith2s, 1, [])).toBe(false)
    })

    test('should validate stop on reject challenge', () => {
      const stopOnRejectChallenge = challenges.find(c => c.id === 'stop-on-reject')!
      
      const memoryWithRejectAndMotorOff: PLCMemory = {
        inputs: { 'I:0/3': true },
        outputs: { 'O:0/0': false },
        bits: {},
        timers: {}
      }
      
      expect(stopOnRejectChallenge.validate(memoryWithRejectAndMotorOff, 1, [])).toBe(true)
      
      const memoryWithRejectAndMotorOn: PLCMemory = {
        inputs: { 'I:0/3': true },
        outputs: { 'O:0/0': true },
        bits: {},
        timers: {}
      }
      
      expect(stopOnRejectChallenge.validate(memoryWithRejectAndMotorOn, 1, [])).toBe(false)
    })
  })

  describe('Garage Door Challenges', () => {
    const challenges = scenarioChallenges.get('garage-door')!

    test('should validate faster blink challenge', () => {
      const fasterBlinkChallenge = challenges.find(c => c.id === 'faster-blink')!
      
      const memoryWith05s: PLCMemory = {
        inputs: {},
        outputs: {},
        bits: {},
        timers: { 'T4:0': { preset: 0.5, accumulated: 0, done: false, timing: false, enabled: false } }
      }
      
      expect(fasterBlinkChallenge.validate(memoryWith05s, 1, [])).toBe(true)
    })

    test('should validate safety light challenge', () => {
      const safetyLightChallenge = challenges.find(c => c.id === 'safety-light')!
      
      const memoryWithObstacleAndLightOn: PLCMemory = {
        inputs: { 'I:0/3': true },
        outputs: { 'O:0/2': true },
        bits: {},
        timers: {}
      }
      
      expect(safetyLightChallenge.validate(memoryWithObstacleAndLightOn, 1, [])).toBe(true)
    })
  })
})