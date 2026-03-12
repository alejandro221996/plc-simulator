import { create } from 'zustand'
import type { PLCMemory } from '../types/ladder'
import { scenarioChallenges } from '../scenarios/challenges'

interface ChallengeStore {
  activeScenarioId: string
  challengeResults: Record<string, boolean>
  memoryHistory: PLCMemory[]
  mode: 'sandbox' | 'challenge'
  setMode: (mode: 'sandbox' | 'challenge') => void
  pushMemorySnapshot: (memory: PLCMemory) => void
  evaluateChallenges: (memory: PLCMemory, scanCount: number) => void
  resetChallenges: (scenarioId: string) => void
}

export const useChallengeStore = create<ChallengeStore>((set, get) => ({
  activeScenarioId: '',
  challengeResults: {},
  memoryHistory: [],
  mode: 'sandbox',

  setMode: (mode) => set({ mode }),

  pushMemorySnapshot: (memory) => {
    const { memoryHistory } = get()
    const newHistory = [...memoryHistory, memory]
    if (newHistory.length > 100) {
      newHistory.shift()
    }
    set({ memoryHistory: newHistory })
  },

  evaluateChallenges: (memory, scanCount) => {
    const { activeScenarioId, memoryHistory, mode } = get()
    if (mode !== 'challenge') return

    const challenges = scenarioChallenges.get(activeScenarioId)
    if (!challenges) return

    const newResults: Record<string, boolean> = {}
    challenges.forEach(challenge => {
      newResults[challenge.id] = challenge.validate(memory, scanCount, memoryHistory)
    })

    set({ challengeResults: newResults })
  },

  resetChallenges: (scenarioId) => {
    set({
      activeScenarioId: scenarioId,
      challengeResults: {},
      memoryHistory: []
    })
  }
}))