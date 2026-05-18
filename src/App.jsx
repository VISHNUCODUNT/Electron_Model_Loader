import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, ContactShadows, Center, Bounds } from '@react-three/drei'

// ============================================================================
// ONLINE vs OFFLINE MODEL LOADING WORKFLOW
// 
// 1. ONLINE (Development): Vite parses `import.meta.glob` and serves the 
//    .glb files from `http://localhost:5173/Optimized/...`.
// 
// 2. OFFLINE (Production): Electron packages the `public/Optimized` folder 
//    inside the final .exe. The paths (`./Optimized/...`) are mapped directly 
//    to the user's hard drive via the `file://` protocol. No internet is used!
// ============================================================================

// Get all GLB files in the Optimized folder recursively at build time
const modelFiles = import.meta.glob('/public/Optimized/**/*.glb', { query: '?url', import: 'default', eager: true })

// Strip the '/public' prefix so the URLs resolve correctly in both Vite (dev) and Electron (prod)
const modelUrls = Object.values(modelFiles).map(url => url.replace('/public', '.'))

function Model({ url }) {
  // useGLTF fetches the binary data. 
  // Online: Fetches over HTTP. Offline: Reads from local disk.
  const { scene } = useGLTF(url)
  return <primitive object={scene} />
}

function Assembly() {
  return (
    <group>
      {modelUrls.map((url, index) => (
        <Model key={index} url={url} />
      ))}
    </group>
  )
}

function Viewer() {
  return (
    <div className="viewer-container">
      <div className="ui-overlay">
        <div className="title-card">
          <h1>TEST FPSO</h1>
          <p>Automated 3D Asset Inspection</p>
        </div>
      </div>

      <Suspense fallback={<div className="loading-msg">Initializing 3D Environment...</div>}>
        <Canvas shadows camera={{ position: [500, 300, 500], fov: 45, near: 1, far: 10000 }}>
          <color attach="background" args={['#ffffffff']} />

          <ambientLight intensity={0.5} />
          <directionalLight position={[100, 100, 50]} intensity={1} castShadow />

          <Bounds fit clip observe margin={1.2}>
            <Center>
              <Assembly />
            </Center>
          </Bounds>

          <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 1.75} />
          <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={2000} blur={2} far={10} />
        </Canvas>
      </Suspense>

      <div className="controls-help">
        LMB: Rotate • RMB: Pan • Scroll: Zoom
      </div>
    </div>
  )
}

function App() {
  return <Viewer />
}

export default App

// Preload all models
modelUrls.forEach(url => useGLTF.preload(url))
