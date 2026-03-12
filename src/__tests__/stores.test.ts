import { useLadderStore } from '../store/ladderStore'
import { useChallengeStore } from '../store/challengeStore'
import { useTraceStore } from '../store/traceStore'
import { useFaultStore } from '../store/faultStore'
import { singleTrafficLight } from '../scenarios/single-traffic-light'

describe('Store Tests', () => {
  beforeEach(() => {
    // Reset stores to initial state
    useLadderStore.setState({
      rungs: singleTrafficLight.defaultProgram,
      memory: singleTrafficLight.defaultMemory,
      isRunning: false,
      activeScenarioId: 'single-traffic-light',
      speed: 1,
      scanCount: 0,
      highlightedAddress: null
    })
    
    useChallengeStore.setState({
      activeScenarioId: '',
      challengeResults: {},
      memoryHistory: [],
      mode: 'sandbox'
    })
    
    useTraceStore.setState({
      snapshots: [],
      isRecording: false,
      selectedSignals: []
    })
    
    useFaultStore.setState({
      faults: {}
    })
  })

  describe('ladderStore', () => {
    test('should set input value', () => {
      const store = useLadderStore.getState()
      store.setInput('I:0/0', true)
      expect(useLadderStore.getState().memory.inputs['I:0/0']).toBe(true)
      
      store.setInput('I:0/0', false)
      expect(useLadderStore.getState().memory.inputs['I:0/0']).toBe(false)
    })

    test('should toggle input value', () => {
      const store = useLadderStore.getState()
      const initial = useLadderStore.getState().memory.inputs['I:0/0']
      
      store.toggleInput('I:0/0')
      expect(useLadderStore.getState().memory.inputs['I:0/0']).toBe(!initial)
      
      store.toggleInput('I:0/0')
      expect(useLadderStore.getState().memory.inputs['I:0/0']).toBe(initial)
    })

    test('should set speed', () => {
      const store = useLadderStore.getState()
      store.setSpeed(2)
      expect(useLadderStore.getState().speed).toBe(2)
      
      store.setSpeed(0.5)
      expect(useLadderStore.getState().speed).toBe(0.5)
    })

    test('should increment scan count on step', () => {
      const store = useLadderStore.getState()
      const initialCount = useLadderStore.getState().scanCount
      
      store.step()
      expect(useLadderStore.getState().scanCount).toBe(initialCount + 1)
      expect(useLadderStore.getState().isRunning).toBe(false)
    })

    test('should load scenario', () => {
      const store = useLadderStore.getState()
      store.loadScenario(singleTrafficLight)
      
      const state = useLadderStore.getState()
      expect(state.rungs).toBe(singleTrafficLight.defaultProgram)
      expect(state.memory).toBe(singleTrafficLight.defaultMemory)
      expect(state.activeScenarioId).toBe(singleTrafficLight.id)
      expect(state.isRunning).toBe(false)
      expect(state.scanCount).toBe(0)
    })
  })

  describe('challengeStore', () => {
    test('should evaluate challenges', () => {
      const store = useChallengeStore.getState()
      store.setMode('challenge')
      
      const memory = {
        inputs: {},
        outputs: {},
        bits: {},
        timers: { 'T4:0': { preset: 3, accumulated: 0, done: false, timing: false, enabled: false } }
      }
      
      useChallengeStore.setState({ activeScenarioId: 'single-traffic-light' })
      store.evaluateChallenges(memory, 1)
      
      const results = useChallengeStore.getState().challengeResults
      expect(results['faster-green']).toBe(true)
    })
  })

  describe('traceStore', () => {
    test('should push snapshots up to limit', () => {
      const store = useTraceStore.getState()
      store.toggleRecording() // Enable recording
      
      const memory = {
        inputs: { 'I:0/0': true },
        outputs: { 'O:0/0': false },
        bits: {},
        timers: {}
      }
      
      for (let i = 0; i < 5; i++) {
        store.pushSnapshot(memory, i)
      }
      
      expect(useTraceStore.getState().snapshots.length).toBe(5)
      
      // Test ring buffer - push 201 total
      for (let i = 5; i < 201; i++) {
        store.pushSnapshot(memory, i)
      }
      
      expect(useTraceStore.getState().snapshots.length).toBe(200)
    })

    test('should not push when recording disabled', () => {
      const store = useTraceStore.getState()
      // Recording is false by default
      
      const memory = {
        inputs: { 'I:0/0': true },
        outputs: { 'O:0/0': false },
        bits: {},
        timers: {}
      }
      
      store.pushSnapshot(memory, 1)
      expect(useTraceStore.getState().snapshots.length).toBe(0)
    })

    test('should toggle recording', () => {
      const store = useTraceStore.getState()
      expect(useTraceStore.getState().isRecording).toBe(false)
      
      store.toggleRecording()
      expect(useTraceStore.getState().isRecording).toBe(true)
      
      store.toggleRecording()
      expect(useTraceStore.getState().isRecording).toBe(false)
    })
  })

  describe('faultStore', () => {
    test('should add and remove faults', () => {
      const store = useFaultStore.getState()
      
      store.addFault('I:0/0', 'stuck-on')
      expect(useFaultStore.getState().faults['I:0/0']).toBe('stuck-on')
      
      store.removeFault('I:0/0')
      expect(useFaultStore.getState().faults['I:0/0']).toBeUndefined()
    })

    test('should apply faults to memory', () => {
      const store = useFaultStore.getState()
      const memory = {
        inputs: { 'I:0/0': false },
        outputs: { 'O:0/0': false }
      }
      
      store.addFault('I:0/0', 'stuck-on')
      store.applyFaults(memory)
      
      expect(memory.inputs['I:0/0']).toBe(true)
    })
  })
})