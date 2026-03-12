# PLC Traffic Light Simulator

Educational 3D traffic light simulator built with React Three Fiber, designed for PLC training similar to LogixPro.

## Features

- **3D Traffic Light**: Realistic traffic light with pole and three colored bulbs (Red, Yellow, Green)
- **State Machine**: Automatic cycling through Green(5s) → Yellow(2s) → Red(5s)
- **Real-time Controls**: Start/Stop, Reset, Speed multiplier (1x, 2x, 5x)
- **Visual Feedback**: Emissive materials with glow effects for active lights
- **Industrial Aesthetic**: Dark theme with grid floor and warehouse lighting
- **Performance Optimized**: 60 FPS stable with efficient state management

## Tech Stack

- **React 19.2.0** - UI framework
- **React Three Fiber 9.5.0** - 3D rendering
- **Drei 10.7.7** - R3F helpers (OrbitControls, Html, Environment)
- **Three.js 0.183.1** - Core 3D engine
- **Zustand 5.0.11** - State management
- **TypeScript 5.9.3** - Type safety
- **Vite 7.3.1** - Build tool

## Architecture

```
src/
├── components/
│   ├── Scene3D/           # 3D Traffic Light + Environment
│   ├── ControlPanel/      # 2D UI Controls
│   └── HtmlOverlay/       # Status display over 3D
├── store/
│   └── simulationStore.ts # Zustand state machine
├── types/
│   └── simulation.ts      # TypeScript interfaces
└── test/
    └── stateMachine.test.ts # State machine validation
```

## Usage

```bash
# Development
npm run dev

# Build
npm run build

# Preview build
npm run preview
```

## Controls

- **START/STOP**: Toggle simulation
- **RESET**: Return to initial state (Red light)
- **Speed**: Adjust simulation speed (1x, 2x, 5x)
- **Mouse**: Orbit around the traffic light (OrbitControls)

## State Machine

The traffic light follows a standard PLC pattern:
1. **Red** (5 seconds) - Stop
2. **Green** (5 seconds) - Go  
3. **Yellow** (2 seconds) - Caution
4. **Red** (repeat cycle)

Each complete cycle increments the counter displayed in the UI.

## Performance

- Optimized for 60 FPS continuous operation
- Efficient state management with Zustand
- Reused geometries and materials
- Frame-rate independent animations using delta time