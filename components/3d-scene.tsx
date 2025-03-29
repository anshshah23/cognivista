"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, Float, MeshDistortMaterial, ContactShadows, Text3D } from "@react-three/drei"
import { motion } from "framer-motion"

function Scene() {
  const sphereRef = useRef<any>()
  const torusRef = useRef<any>()

  useFrame((state) => {
    const t = state.clock.getElapsedTime()

    if (sphereRef.current) {
      sphereRef.current.position.y = Math.sin(t * 0.5) * 0.2
      sphereRef.current.rotation.y = t * 0.2
    }

    if (torusRef.current) {
      torusRef.current.rotation.x = t * 0.1
      torusRef.current.rotation.y = t * 0.2
    }
  })

  return (
    <>
      {/* Floating sphere with distortion */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <mesh ref={sphereRef} position={[-1.5, 0, 0]} castShadow>
          <sphereGeometry args={[1, 64, 64]} />
          <MeshDistortMaterial color="#7C3AED" distort={0.4} speed={2} roughness={0.2} metalness={0.8} />
        </mesh>
      </Float>

      {/* Torus */}
      <Float speed={3} rotationIntensity={1} floatIntensity={1}>
        <mesh ref={torusRef} position={[1.5, 0, 0]} castShadow>
          <torusGeometry args={[0.8, 0.35, 32, 64]} />
          <MeshDistortMaterial color="#14B8A6" distort={0.2} speed={3} roughness={0.3} metalness={0.6} />
        </mesh>
      </Float>

      {/* 3D Text */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
        <Text3D font="/fonts/Inter_Bold.json" position={[0, -1.5, 0]} scale={0.5} letterSpacing={0.05} height={0.2}>
          SmartEdu
          <meshStandardMaterial color="#DB2777" roughness={0.3} metalness={0.7} />
        </Text3D>
      </Float>

      {/* Shadows */}
      <ContactShadows position={[0, -2, 0]} opacity={0.5} scale={10} blur={2} far={4} />
    </>
  )
}

export function ThreeDScene() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="h-[500px] w-full"
    >
      <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 6], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <Scene />
        <Environment preset="city" />
      </Canvas>
    </motion.div>
  )
}

