"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, PresentationControls, ContactShadows } from "@react-three/drei"
import { motion } from "framer-motion"

function Book(props: any) {
  const ref = useRef<any>()

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.3) * 0.1
    }
  })

  // Since we don't have a real book model, we'll create a simple book shape
  return (
    <group ref={ref} {...props}>
      {/* Book cover */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[3, 4, 0.5]} />
        <meshStandardMaterial color="#27548A" roughness={0.5} metalness={0.2} />
      </mesh>

      {/* Book pages */}
      <mesh position={[0, 0, 0.1]} castShadow>
        <boxGeometry args={[2.8, 3.8, 0.3]} />
        <meshStandardMaterial color="#F5EEDC" roughness={0.8} />
      </mesh>

      {/* Book title */}
      <mesh position={[0, 0.5, 0.3]} castShadow>
        <boxGeometry args={[2, 0.5, 0.05]} />
        <meshStandardMaterial color="#DDA853" roughness={0.5} />
      </mesh>
    </group>
  )
}

export function ThreeDBook() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="h-[400px] w-full"
    >
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 8], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <PresentationControls
          global
          zoom={0.8}
          rotation={[0, 0, 0]}
          polar={[-Math.PI / 4, Math.PI / 4]}
          azimuth={[-Math.PI / 4, Math.PI / 4]}
        >
          <Book position={[0, 0, 0]} />
        </PresentationControls>
        <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={10} blur={1.5} far={4} />
        <Environment preset="city" />
      </Canvas>
    </motion.div>
  )
}

