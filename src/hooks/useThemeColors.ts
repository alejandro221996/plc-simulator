import { useThemeStore } from '../store/themeStore'

export function useThemeColors() {
  const theme = useThemeStore(s => s.theme)
  const d = theme === 'dark'
  
  return {
    bgPrimary: d ? '#0a0a0a' : '#f0f2f5',
    bgSecondary: d ? '#1a1a1a' : '#ffffff',
    bgPanel: d ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.95)',
    textPrimary: d ? '#fff' : '#1a1a1a',
    textMuted: d ? '#888' : '#666',
    borderColor: d ? '#444' : '#d0d0d0',
    borderLight: d ? '#555' : '#bbb',
    accentCyan: d ? '#0ff' : '#0088aa',
    accentOrange: d ? '#fa0' : '#cc7700',
    accentBlue: d ? '#4488ff' : '#2266cc',
    inputBg: d ? '#333' : '#e8eaed',
    nodeBg: d ? '#333' : '#e0e0e0',
    nodeBgActive: d ? '#00ff88' : '#00cc66',
    nodeBorder: d ? '#666' : '#999',
    railColor: d ? '#4488ff' : '#2266cc',
    railBorder: d ? '#6699ff' : '#4488dd',
    sceneBg: d ? '#111' : '#d0d5db',
    timerBg: d ? '#222' : '#d5d5d5',
    timerBgActive: d ? '#444' : '#c0c0c0',
  }
}