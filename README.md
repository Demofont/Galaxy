# Galaxy Particle System - React Three.js

This is a React Three.js implementation of a beautiful galaxy particle system with 100,000 particles forming spiral arms.

## Features

- **100,000 particle galaxy** with spiral arms
- **Color gradient** from warm inner colors to cool outer colors
- **Interactive camera controls** - orbit, zoom, pan
- **Fullscreen functionality** - double-click to toggle
- **Responsive design** - automatically adapts to window resize
- **Modern React architecture** using React Three Fiber

## Galaxy Parameters

- **Count**: 100,000 particles
- **Size**: 0.01 (particle size)
- **Radius**: 5 (galaxy radius)
- **Branches**: 3 (spiral arms)
- **Spin**: 1 (spiral tightness)
- **Randomness**: 0.2 (particle spread)
- **Inside Color**: #ff6030 (warm orange-red)
- **Outside Color**: #1b3984 (cool blue)

## Setup

```bash
# Install dependencies
npm install

# Run the local server at localhost:5173
npm run dev

# Build for production
npm run build
```

## Technologies Used

- **React** - UI framework
- **React Three Fiber** - React renderer for Three.js
- **React Three Drei** - Useful helpers for React Three Fiber
- **Three.js** - 3D graphics library
- **Vite** - Build tool and dev server

## Interactive Features

1. **Camera Controls**: Use mouse to orbit, zoom, and pan around the galaxy
2. **Fullscreen**: Double-click anywhere to toggle fullscreen mode
3. **Responsive**: Resize your browser window to see automatic adaptation

## Performance Notes

- Uses `BufferGeometry` for efficient particle rendering
- `AdditiveBlending` for beautiful glowing effect
- Automatic cleanup prevents memory leaks
- Optimized for smooth 60fps performance
