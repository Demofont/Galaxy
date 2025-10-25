import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Suspense } from 'react'
import Galaxy from './components/Galaxy'
import './App.css'

function App() {
  return (
    <div className="app">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 75 }}
        style={{ position: 'fixed', top: 0, left: 0, outline: 'none', background: 'black' }}
        onDoubleClick={() => {
          const canvas = document.querySelector('canvas')
          if (!document.fullscreenElement) {
            if (canvas.requestFullscreen) {
              canvas.requestFullscreen()
            } else if (canvas.webkitRequestFullscreen) {
              canvas.webkitRequestFullscreen()
            }
          } else {
            if (document.exitFullscreen) {
              document.exitFullscreen()
            } else if (document.webkitExitFullscreen) {
              document.webkitExitFullscreen()
            }
          }
        }}
      >
        <Suspense fallback={null}>
          <Galaxy />
          <OrbitControls enableDamping enablePan />
        </Suspense>
      </Canvas>
    </div>
  )
}

export default App
