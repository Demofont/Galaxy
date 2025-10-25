import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import * as dat from 'dat.gui'

export default function Galaxy() {
  const pointsRef = useRef()
  const linesRef = useRef()
  const [parameters, setParameters] = useState({
    count: 100000,
    size: 0.01,
    radius: 5,
    branches: 3,
    spin: 1,
    randomness: 0.2,
    randomnessPower: 3,
    insideColor: '#ff6030',
    outsideColor: '#1b3984',
    // Line parameters
    showLines: false,
    lineDistance: 0.5,
    lineOpacity: 0.3,
    lineColor: '#ffffff',
    maxConnections: 3
  })

  const generateGalaxy = () => {
    // Create geometry
    const geometry = new THREE.BufferGeometry()
    
    const positions = new Float32Array(parameters.count * 3)
    const colors = new Float32Array(parameters.count * 3)
    
    const colorInside = new THREE.Color(parameters.insideColor)
    const colorOutside = new THREE.Color(parameters.outsideColor)
    
    for (let i = 0; i < parameters.count; i++) {
      const i3 = i * 3
      
      // Position
      const radius = Math.random() * parameters.radius
      const spinAngle = radius * parameters.spin
      const branchAngle = (i % parameters.branches) / parameters.branches * Math.PI * 2
      
      const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
      const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
      const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1)
      
      positions[i3 + 0] = Math.cos(branchAngle + spinAngle) * radius + randomX
      positions[i3 + 1] = 0 + randomY
      positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ
      
      // Color
      const mixedColor = colorInside.clone()
      mixedColor.lerp(colorOutside, radius / parameters.radius)
      
      colors[i3 + 0] = mixedColor.r
      colors[i3 + 1] = mixedColor.g
      colors[i3 + 2] = mixedColor.b
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
    
    return geometry
  }

  const generateLines = (positions) => {
    if (!parameters.showLines) return null
    
    const lineGeometry = new THREE.BufferGeometry()
    const linePositions = []
    const lineColors = []
    
    const lineColor = new THREE.Color(parameters.lineColor)
    
    // Create a spatial hash for efficient neighbor finding
    const spatialHash = new Map()
    const hashSize = parameters.lineDistance * 2
    
    // Hash particles for efficient lookup
    for (let i = 0; i < parameters.count; i++) {
      const x = positions[i * 3]
      const y = positions[i * 3 + 1]
      const z = positions[i * 3 + 2]
      
      const hashKey = `${Math.floor(x / hashSize)},${Math.floor(y / hashSize)},${Math.floor(z / hashSize)}`
      
      if (!spatialHash.has(hashKey)) {
        spatialHash.set(hashKey, [])
      }
      spatialHash.get(hashKey).push(i)
    }
    
    // Find connections
    for (let i = 0; i < parameters.count; i++) {
      const x1 = positions[i * 3]
      const y1 = positions[i * 3 + 1]
      const z1 = positions[i * 3 + 2]
      
      const connections = []
      
      // Check nearby hash buckets
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dz = -1; dz <= 1; dz++) {
            const hashKey = `${Math.floor(x1 / hashSize) + dx},${Math.floor(y1 / hashSize) + dy},${Math.floor(z1 / hashSize) + dz}`
            const bucket = spatialHash.get(hashKey)
            
            if (bucket) {
              for (const j of bucket) {
                if (i >= j) continue // Avoid duplicate connections
                
                const x2 = positions[j * 3]
                const y2 = positions[j * 3 + 1]
                const z2 = positions[j * 3 + 2]
                
                const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2)
                
                if (distance <= parameters.lineDistance) {
                  connections.push({ j, distance })
                }
              }
            }
          }
        }
      }
      
      // Sort by distance and limit connections
      connections.sort((a, b) => a.distance - b.distance)
      const limitedConnections = connections.slice(0, parameters.maxConnections)
      
      // Add line segments
      for (const connection of limitedConnections) {
        const j = connection.j
        
        // Add line vertices
        linePositions.push(x1, y1, z1)
        linePositions.push(positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2])
        
        // Add line colors
        lineColors.push(lineColor.r, lineColor.g, lineColor.b)
        lineColors.push(lineColor.r, lineColor.g, lineColor.b)
      }
    }
    
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3))
    lineGeometry.setAttribute('color', new THREE.Float32BufferAttribute(lineColors, 3))
    
    return lineGeometry
  }

  const { geometry, material, lineGeometry, lineMaterial } = useMemo(() => {
    const geometry = generateGalaxy()
    const positions = geometry.attributes.position.array
    const lineGeometry = generateLines(positions)
    
    // Create material
    const material = new THREE.PointsMaterial({
      size: parameters.size,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true
    })
    
    // Create line material
    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: parameters.lineOpacity,
      blending: THREE.AdditiveBlending
    })
    
    return { geometry, material, lineGeometry, lineMaterial }
  }, [parameters])

  // Setup GUI
  useEffect(() => {
    const gui = new dat.GUI({ width: 360, closed: true })
    
    gui.add(parameters, 'count').min(100).max(1000000).step(100).onFinishChange(() => {
      setParameters({...parameters})
    })
    gui.add(parameters, 'size').min(0.001).max(0.1).step(0.001).onFinishChange(() => {
      setParameters({...parameters})
    })
    gui.add(parameters, 'radius').min(0.01).max(20).step(0.01).onFinishChange(() => {
      setParameters({...parameters})
    })
    gui.add(parameters, 'branches').min(2).max(20).step(1).onFinishChange(() => {
      setParameters({...parameters})
    })
    gui.add(parameters, 'spin').min(-5).max(5).step(0.001).onFinishChange(() => {
      setParameters({...parameters})
    })
    gui.add(parameters, 'randomness').min(0).max(2).step(0.001).onFinishChange(() => {
      setParameters({...parameters})
    })
    gui.add(parameters, 'randomnessPower').min(1).max(10).step(0.001).onFinishChange(() => {
      setParameters({...parameters})
    })
    gui.addColor(parameters, 'insideColor').onFinishChange(() => {
      setParameters({...parameters})
    })
    gui.addColor(parameters, 'outsideColor').onFinishChange(() => {
      setParameters({...parameters})
    })
    
    // Line controls
    const lineFolder = gui.addFolder('Connecting Lines')
    lineFolder.add(parameters, 'showLines').onFinishChange(() => {
      setParameters({...parameters})
    })
    lineFolder.add(parameters, 'lineDistance').min(0.1).max(2).step(0.1).onFinishChange(() => {
      setParameters({...parameters})
    })
    lineFolder.add(parameters, 'lineOpacity').min(0.1).max(1).step(0.1).onFinishChange(() => {
      setParameters({...parameters})
    })
    lineFolder.add(parameters, 'maxConnections').min(1).max(10).step(1).onFinishChange(() => {
      setParameters({...parameters})
    })
    lineFolder.addColor(parameters, 'lineColor').onFinishChange(() => {
      setParameters({...parameters})
    })
    
    return () => {
      gui.destroy()
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
      if (lineGeometry) lineGeometry.dispose()
      if (lineMaterial) lineMaterial.dispose()
    }
  }, [geometry, material, lineGeometry, lineMaterial])

  return (
    <>
      <points ref={pointsRef} geometry={geometry} material={material} />
      {lineGeometry && (
        <lineSegments ref={linesRef} geometry={lineGeometry} material={lineMaterial} />
      )}
    </>
  )
}
