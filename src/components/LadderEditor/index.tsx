import { useEffect, useMemo, useCallback } from 'react'
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  useReactFlow,
  type Node,
  type Edge,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { ContactNode } from './nodes/ContactNode'
import { CoilNode } from './nodes/CoilNode'
import { TimerNode } from './nodes/TimerNode'
import { PowerRailNode } from './nodes/PowerRailNode'
import { LadderToolbar } from './LadderToolbar'
import { useLadderStore } from '../../store/ladderStore'
import './LadderEditor.css'

const nodeTypes = {
  'contact-no': ContactNode,
  'contact-nc': ContactNode,
  'coil': CoilNode,
  'timer-ton': TimerNode,
  'power-rail': PowerRailNode,
}

export function LadderEditor() {
  const { rungs, memory, isRunning, tick, addElement, removeElement, updateElement, addRung, highlightedAddress, powerFlow } = useLadderStore()
  const { screenToFlowPosition } = useReactFlow()
  
  // Convert rungs to React Flow nodes and edges
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = []
    const edges: Edge[] = []
    
    const RUNG_HEIGHT = 100
    const ELEMENT_WIDTH = 120
    const RAIL_WIDTH = 50
    
    rungs.forEach((rung, rungIndex) => {
      const y = rungIndex * RUNG_HEIGHT + 50
      
      // Check if rung is energized (last element has power out)
      const flow = powerFlow[rung.id]
      const lastElement = rung.elements[rung.elements.length - 1]
      const rungEnergized = lastElement && flow?.[lastElement.id]?.powerOut || false
      
      // Left power rail
      nodes.push({
        id: `rail-left-${rung.id}`,
        type: 'power-rail',
        position: { x: 20, y: y - 20 },
        data: { type: 'left', rungEnergized },
        draggable: false,
      })
      
      // Right power rail
      const rightRailX = 20 + RAIL_WIDTH + (rung.elements.length * ELEMENT_WIDTH) + 20
      nodes.push({
        id: `rail-right-${rung.id}`,
        type: 'power-rail',
        position: { x: rightRailX, y: y - 20 },
        data: { type: 'right', rungEnergized },
        draggable: false,
      })
      
      // Rung elements
      rung.elements.forEach((element, elementIndex) => {
        const x = 20 + RAIL_WIDTH + (elementIndex * ELEMENT_WIDTH)
        
        // Get power flow info
        const flow = powerFlow[rung.id]?.[element.id]
        
        // Get energized state and timer data
        let energized = false
        let timerData = {}
        
        if (element.type === 'contact-no') {
          energized = getContactValue(element.address, memory)
        } else if (element.type === 'contact-nc') {
          energized = !getContactValue(element.address, memory)
        } else if (element.type === 'coil') {
          energized = memory.outputs[element.address] || memory.bits[element.address] || false
        } else if (element.type === 'timer-ton') {
          const timer = memory.timers[element.address]
          energized = timer?.enabled || false
          timerData = timer || { preset: 0, accumulated: 0, done: false, timing: false, enabled: false }
        }
        
        nodes.push({
          id: `${rung.id}-${element.id}`,
          type: element.type,
          position: { x, y },
          data: {
            address: element.address,
            label: element.label,
            type: element.type,
            energized,
            highlighted: element.address === highlightedAddress,
            powerIn: flow?.powerIn ?? false,
            powerOut: flow?.powerOut ?? false,
            blocking: flow?.blocking ?? false,
            ...timerData,
            onUpdateAddress: (newAddress: string) => {
              updateElement(rung.id, element.id, { address: newAddress })
            },
            onUpdatePreset: (newPreset: number) => {
              useLadderStore.getState().updateTimerPreset(element.address, newPreset)
            },
            onDelete: () => {
              removeElement(rung.id, element.id)
            },
          },
          draggable: true,
        })
      })
      
      // Create edges (connections between elements)
      if (rung.elements.length > 0) {
        const rungHasHighlight = rung.elements.some(el => el.address === highlightedAddress)
        const flow = powerFlow[rung.id]
        
        // Connect left rail to first element
        const railToFirstPowered = isRunning // Left rail is always powered when running
        edges.push({
          id: `edge-${rung.id}-rail-left-to-e${0}`,
          source: `rail-left-${rung.id}`,
          target: `${rung.id}-${rung.elements[0].id}`,
          animated: railToFirstPowered,
          style: { stroke: rungHasHighlight ? '#ffaa00' : (railToFirstPowered ? '#00ff88' : '#555'), strokeWidth: 2 },
        })
        
        // Connect elements in series
        for (let i = 0; i < rung.elements.length - 1; i++) {
          const sourceElement = rung.elements[i]
          const sourceFlow = flow?.[sourceElement.id]
          const edgePowered = sourceFlow?.powerOut ?? false
          
          edges.push({
            id: `edge-${rung.id}-e${i}-to-e${i+1}`,
            source: `${rung.id}-${sourceElement.id}`,
            target: `${rung.id}-${rung.elements[i + 1].id}`,
            animated: edgePowered,
            style: { stroke: rungHasHighlight ? '#ffaa00' : (edgePowered ? '#00ff88' : '#555'), strokeWidth: 2 },
          })
        }
        
        // Connect last element to right rail
        const lastElement = rung.elements[rung.elements.length - 1]
        const lastFlow = flow?.[lastElement.id]
        const lastToPowered = lastFlow?.powerOut ?? false
        
        edges.push({
          id: `edge-${rung.id}-e${rung.elements.length-1}-to-rail-right`,
          source: `${rung.id}-${lastElement.id}`,
          target: `rail-right-${rung.id}`,
          animated: lastToPowered,
          style: { stroke: rungHasHighlight ? '#ffaa00' : (lastToPowered ? '#00ff88' : '#555'), strokeWidth: 2 },
        })
      }
    })
    
    return { initialNodes: nodes, initialEdges: edges }
  }, [rungs, memory, highlightedAddress, powerFlow, isRunning])
  
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  
  // Update nodes when memory changes
  useEffect(() => {
    setNodes(initialNodes)
    setEdges(initialEdges)
  }, [initialNodes, initialEdges, setNodes, setEdges])
  
  // Drag & drop handlers
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    
    const elementData = event.dataTransfer.getData('application/ladder-element')
    if (!elementData) return
    
    const { type, address } = JSON.parse(elementData)
    const position = screenToFlowPosition({ x: event.clientX, y: event.clientY })
    
    // Calculate which rung based on Y position
    const RUNG_HEIGHT = 100
    const rungIndex = Math.floor((position.y - 50) / RUNG_HEIGHT)
    
    let targetRungId: string
    if (rungIndex < 0 || rungIndex >= rungs.length) {
      // Create new rung if dropped outside existing rungs
      addRung()
      targetRungId = `rung-${rungs.length + 1}`
    } else {
      targetRungId = rungs[rungIndex].id
    }
    
    // Generate unique element ID and add to rung
    const elementId = `e${Date.now()}`
    addElement(targetRungId, {
      id: elementId,
      type,
      address,
    })
  }, [screenToFlowPosition, rungs, addRung, addElement])

  // Ladder engine tick
  useEffect(() => {
    if (!isRunning) return
    
    const interval = setInterval(() => {
      tick(0.1) // 100ms tick
    }, 100)
    
    return () => clearInterval(interval)
  }, [isRunning, tick])
  
  return (
    <div className="ladder-toolbar-container">
      <LadderToolbar />
      <div className="ladder-flow-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          className="ladder-editor"
          nodesDraggable={true}
          nodesConnectable={false}
          elementsSelectable={true}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <Controls />
          <Background />
        </ReactFlow>
        <button 
          className="ladder-add-rung-btn"
          onClick={addRung}
          title="Add New Rung"
        >
          + Add Rung
        </button>
      </div>
    </div>
  )
}

// Helper function to get contact value from memory
function getContactValue(address: string, memory: any): boolean {
  // Handle timer bits (e.g., T4:0.DN, T4:1.TT)
  if (address.includes('.')) {
    const [timerAddr, bit] = address.split('.')
    const timer = memory.timers[timerAddr]
    if (!timer) return false
    
    switch (bit) {
      case 'DN': return timer.done
      case 'TT': return timer.timing
      case 'EN': return timer.enabled
      default: return false
    }
  }
  
  // Regular inputs, outputs, or bits
  return memory.inputs[address] || memory.outputs[address] || memory.bits[address] || false
}