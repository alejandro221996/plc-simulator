import { useState } from 'react'
import { useChallengeStore } from '../../store/challengeStore'
import { scenarioChallenges } from '../../scenarios/challenges'
import { useThemeColors } from '../../hooks/useThemeColors'

export function ChallengePanel() {
  const c = useThemeColors()
  const [collapsed, setCollapsed] = useState(false)
  const [showHints, setShowHints] = useState<Record<string, boolean>>({})
  
  const { mode, setMode, activeScenarioId, challengeResults } = useChallengeStore()
  
  const challenges = scenarioChallenges.get(activeScenarioId) || []
  const completedCount = Object.values(challengeResults).filter(Boolean).length
  
  const toggleHint = (challengeId: string) => {
    setShowHints(prev => ({ ...prev, [challengeId]: !prev[challengeId] }))
  }

  return (
    <div style={{
      borderBottom: `1px solid ${c.borderColor}`,
      background: c.bgSecondary,
      color: c.textPrimary,
      fontFamily: 'monospace',
      fontSize: '12px',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px',
        borderBottom: `1px solid ${c.borderColor}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ color: c.textPrimary, fontWeight: 'bold' }}>
            Challenges
          </span>
          {mode === 'challenge' && challenges.length > 0 && (
            <span style={{
              color: c.accentCyan,
              fontSize: '10px',
              background: c.bgPrimary,
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              {completedCount}/{challenges.length}
            </span>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            background: 'none',
            border: 'none',
            color: c.textMuted,
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          {collapsed ? '▲' : '▼'}
        </button>
      </div>

      {!collapsed && (
        <div style={{ padding: '12px' }}>
          {/* Mode Toggle */}
          <div style={{
            display: 'flex',
            gap: '4px',
            marginBottom: '12px',
            background: c.bgPrimary,
            borderRadius: '4px',
            padding: '2px'
          }}>
            <button
              onClick={() => setMode('sandbox')}
              style={{
                flex: 1,
                padding: '6px 12px',
                border: 'none',
                borderRadius: '2px',
                background: mode === 'sandbox' ? c.accentCyan : 'transparent',
                color: mode === 'sandbox' ? '#000' : c.textMuted,
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              Sandbox
            </button>
            <button
              onClick={() => setMode('challenge')}
              style={{
                flex: 1,
                padding: '6px 12px',
                border: 'none',
                borderRadius: '2px',
                background: mode === 'challenge' ? c.accentCyan : 'transparent',
                color: mode === 'challenge' ? '#000' : c.textMuted,
                cursor: 'pointer',
                fontSize: '11px'
              }}
            >
              Challenge
            </button>
          </div>

          {/* Challenges List */}
          {mode === 'challenge' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {challenges.length === 0 ? (
                <div style={{ color: c.textMuted, textAlign: 'center', padding: '20px' }}>
                  No challenges available for this scenario
                </div>
              ) : (
                challenges.map(challenge => {
                  const passed = challengeResults[challenge.id] || false
                  return (
                    <div
                      key={challenge.id}
                      style={{
                        background: c.bgPrimary,
                        border: `1px solid ${passed ? '#00ff88' : c.borderColor}`,
                        borderRadius: '4px',
                        padding: '8px'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '4px'
                      }}>
                        <span style={{
                          color: passed ? '#00ff88' : '#ff3333',
                          fontSize: '14px'
                        }}>
                          {passed ? '✅' : '❌'}
                        </span>
                        <span style={{
                          color: c.textPrimary,
                          fontWeight: 'bold',
                          fontSize: '11px'
                        }}>
                          {challenge.title}
                        </span>
                      </div>
                      
                      <div style={{
                        color: c.textMuted,
                        fontSize: '10px',
                        lineHeight: '1.4',
                        marginBottom: challenge.hint ? '6px' : '0'
                      }}>
                        {challenge.description}
                      </div>
                      
                      {challenge.hint && (
                        <div>
                          <button
                            onClick={() => toggleHint(challenge.id)}
                            style={{
                              background: 'none',
                              border: `1px solid ${c.borderColor}`,
                              color: c.textMuted,
                              cursor: 'pointer',
                              fontSize: '9px',
                              padding: '2px 6px',
                              borderRadius: '2px'
                            }}
                          >
                            {showHints[challenge.id] ? 'Hide Hint' : 'Show Hint'}
                          </button>
                          
                          {showHints[challenge.id] && (
                            <div style={{
                              color: c.accentCyan,
                              fontSize: '9px',
                              marginTop: '4px',
                              padding: '4px',
                              background: c.bgSecondary,
                              borderRadius: '2px',
                              fontStyle: 'italic'
                            }}>
                              💡 {challenge.hint}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          )}

          {mode === 'sandbox' && (
            <div style={{
              color: c.textMuted,
              fontSize: '10px',
              textAlign: 'center',
              padding: '20px'
            }}>
              Switch to Challenge mode to see objectives
            </div>
          )}
        </div>
      )}
    </div>
  )
}