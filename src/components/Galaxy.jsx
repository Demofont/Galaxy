import { useRef, useMemo, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import * as dat from 'dat.gui'

export default function Galaxy() {
  const pointsRef = useRef()
  const [parameters, setParameters] = useState({
    count: 100000,
    size: 0.01,
    radius: 5,
    branches: 3,
    spin: 1,
    randomness: 0.2,
    randomnessPower: 3,
    insideColor: '#ff6030',
    outsideColor: '#1b3984'
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

  const { geometry, material } = useMemo(() => {
    const geometry = generateGalaxy()
    
    // Create material
    const material = new THREE.PointsMaterial({
      size: parameters.size,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true
    })
    
    return { geometry, material }
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
    
    return () => {
      gui.destroy()
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      geometry.dispose()
      material.dispose()
    }
  }, [geometry, material])

  return (
    <points ref={pointsRef} geometry={geometry} material={material} />
  )
}
