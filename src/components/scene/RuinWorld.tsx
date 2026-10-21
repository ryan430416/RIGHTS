import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { DrawPhase } from '../../lib/draw.ts'
import { createBrokenPillarGeometry, createGothicArchGeometry } from './geometry.ts'
import { vortexFragment, vortexVertex } from './shaders.ts'

export type SceneMode = DrawPhase

type RuinWorldProps = {
  mode: SceneMode
  reducedMotion: boolean
  mobile: boolean
}

function intensityFor(mode: SceneMode): number {
  if (mode === 'summoning') return 1
  if (mode === 'result') return 0.35
  return 0.55
}

function StoneMaterial({
  color = '#2a3348',
  roughness = 0.92,
  emissive = '#000000',
  emissiveIntensity = 0,
}: {
  color?: string
  roughness?: number
  emissive?: string
  emissiveIntensity?: number
}) {
  return (
    <meshStandardMaterial
      color={color}
      roughness={roughness}
      metalness={0.06}
      emissive={emissive}
      emissiveIntensity={emissiveIntensity}
      flatShading
    />
  )
}

function Pillar({
  position,
  height = 2.4,
  radius = 0.22,
  color = '#2c3549',
}: {
  position: [number, number, number]
  height?: number
  radius?: number
  color?: string
}) {
  const geo = useMemo(() => createBrokenPillarGeometry(height, radius), [height, radius])
  return (
    <mesh geometry={geo} position={position} castShadow>
      <StoneMaterial color={color} />
    </mesh>
  )
}

function DistantArch({ position, scale = 1, color = '#1a2233' }: { position: [number, number, number]; scale?: number; color?: string }) {
  const geo = useMemo(() => createGothicArchGeometry(2.1, 3.1, 1.45, 2.45, 0.28), [])
  return (
    <mesh geometry={geo} position={position} scale={scale} rotation={[0, 0, 0]}>
      <meshStandardMaterial color={color} roughness={0.96} metalness={0.04} />
    </mesh>
  )
}

function Portal({ intensity }: { intensity: number }) {
  const arch = useMemo(() => createGothicArchGeometry(2.55, 3.85, 1.6, 3.05, 0.62), [])
  const rim = useMemo(() => createGothicArchGeometry(2.7, 4.05, 2.35, 3.55, 0.12), [])
  const vortexMat = useRef<THREE.ShaderMaterial>(null)

  useFrame(({ clock }) => {
    if (!vortexMat.current) return
    vortexMat.current.uniforms.uTime.value = clock.elapsedTime
    vortexMat.current.uniforms.uIntensity.value = THREE.MathUtils.lerp(
      vortexMat.current.uniforms.uIntensity.value,
      intensity,
      0.08,
    )
  })

  return (
    <group position={[3.1, 0, -1.2]}>
      <mesh geometry={arch} castShadow receiveShadow>
        <StoneMaterial color="#313b52" />
      </mesh>
      <mesh geometry={rim} position={[0, 0, 0.02]}>
        <meshStandardMaterial
          color="#c49a4a"
          emissive="#8a6528"
          emissiveIntensity={0.22 + intensity * 0.35}
          roughness={0.55}
          metalness={0.25}
        />
      </mesh>
      {/* layered stone blocks on the frame */}
      {[
        [-1.15, 0.55, 0.28],
        [1.15, 0.7, 0.28],
        [-0.95, 2.1, 0.3],
        [0.95, 2.2, 0.3],
        [0, 3.55, 0.34],
      ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow>
          <boxGeometry args={[0.42 + (i % 2) * 0.1, 0.28, 0.34]} />
          <StoneMaterial color={i % 2 ? '#3a4560' : '#2a3348'} />
        </mesh>
      ))}
      <mesh position={[0, 3.72, 0.4]}>
        <octahedronGeometry args={[0.16, 0]} />
        <meshStandardMaterial color="#e2c37a" emissive="#d4a84e" emissiveIntensity={0.8 + intensity * 0.6} />
      </mesh>
      <mesh position={[0, 1.55, 0.05]}>
        <planeGeometry args={[2.7, 3.5]} />
        <shaderMaterial
          ref={vortexMat}
          vertexShader={vortexVertex}
          fragmentShader={vortexFragment}
          transparent
          depthWrite={false}
          uniforms={{
            uTime: { value: 0 },
            uIntensity: { value: intensity },
          }}
        />
      </mesh>
      {/* depth discs behind vortex */}
      {[0.2, 0.45, 0.75].map((z, i) => (
        <mesh key={z} position={[0, 1.55, -0.2 - z]} rotation={[0, 0, i * 0.4]}>
          <ringGeometry args={[0.35 + i * 0.25, 0.9 + i * 0.2, 48]} />
          <meshBasicMaterial
            color={i % 2 ? '#d2a65a' : '#6f93b8'}
            transparent
            opacity={0.08 + intensity * 0.08}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
      <pointLight position={[0, 1.6, 0.6]} color="#e0b35a" intensity={1.2 + intensity * 2.2} distance={8} />
      <pointLight position={[0, 1.4, -0.4]} color="#6ea0c8" intensity={0.5 + intensity * 0.8} distance={6} />
    </group>
  )
}

function LightFlows({ intensity, reducedMotion }: { intensity: number; reducedMotion: boolean }) {
  const group = useRef<THREE.Group>(null)
  const curves = useMemo(() => {
    const mk = (pts: [number, number, number][]) =>
      new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)))
    return [
      {
        curve: mk([
          [-5.5, 2.8, 1.2],
          [-2.8, 3.1, 0.2],
          [0.4, 2.6, -0.4],
          [2.4, 2.0, -0.9],
          [3.1, 1.7, -1.05],
        ]),
        color: '#d8b25c',
        radius: 0.032,
        glow: 0.07,
      },
      {
        curve: mk([
          [-5.2, 1.5, 1.6],
          [-2.2, 1.9, 0.6],
          [0.8, 2.2, -0.2],
          [2.6, 1.8, -0.85],
          [3.05, 1.55, -1.1],
        ]),
        color: '#7aa7c9',
        radius: 0.022,
        glow: 0.055,
      },
      {
        curve: mk([
          [-4.8, 3.6, 0.4],
          [-1.5, 3.3, -0.3],
          [1.2, 2.7, -0.7],
          [2.9, 1.9, -1.0],
        ]),
        color: '#e0c27a',
        radius: 0.016,
        glow: 0.04,
      },
    ]
  }, [])

  const tubes = useMemo(
    () =>
      curves.flatMap(({ curve, color, radius, glow }) => [
        { geo: new THREE.TubeGeometry(curve, 80, radius, 7, false), color, core: true },
        { geo: new THREE.TubeGeometry(curve, 64, glow, 6, false), color, core: false },
      ]),
    [curves],
  )

  useFrame(({ clock }) => {
    if (!group.current || reducedMotion) return
    const t = clock.elapsedTime
    const speed = 1.2 + intensity * 2.4
    group.current.children.forEach((child, i) => {
      const mesh = child as THREE.Mesh
      const mat = mesh.material as THREE.MeshBasicMaterial
      const core = i % 2 === 0
      mat.opacity =
        (core ? 0.42 : 0.14) +
        intensity * (core ? 0.28 : 0.12) +
        Math.sin(t * speed + i) * 0.05
    })
  })

  return (
    <group ref={group}>
      {tubes.map((tube, i) => (
        <mesh key={i} geometry={tube.geo}>
          <meshBasicMaterial
            color={tube.color}
            transparent
            opacity={tube.core ? 0.5 : 0.18}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  )
}

function Ground({ intensity }: { intensity: number }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[28, 18]} />
        <meshStandardMaterial color="#0a101c" roughness={0.95} metalness={0.05} />
      </mesh>
      {/* broken elongated reflections */}
      {[
        [2.6, 0.02, -0.4, 1.8, 0.35, '#c9a04e'],
        [1.4, 0.02, 0.5, 1.2, 0.22, '#6d97b8'],
        [3.4, 0.02, 0.8, 0.9, 0.18, '#d2b06a'],
        [-0.2, 0.02, 0.2, 0.7, 0.14, '#5f87a8'],
      ].map(([x, y, z, w, d, color], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0.2 * (i % 2 ? 1 : -1)]} position={[x as number, y as number, z as number]}>
          <planeGeometry args={[w as number, d as number]} />
          <meshBasicMaterial
            color={color as string}
            transparent
            opacity={0.08 + intensity * 0.1}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  )
}

function Debris({ mobile }: { mobile: boolean }) {
  const rocks = useMemo(() => {
    const list: { pos: [number, number, number]; scale: [number, number, number]; rot: number }[] = [
      { pos: [-3.2, 0.18, 1.8], scale: [0.7, 0.35, 0.5], rot: 0.4 },
      { pos: [-2.2, 0.12, 2.3], scale: [0.4, 0.22, 0.35], rot: -0.6 },
      { pos: [1.2, 0.16, 2.0], scale: [0.55, 0.28, 0.4], rot: 0.2 },
      { pos: [4.2, 0.2, 1.4], scale: [0.65, 0.32, 0.45], rot: -0.3 },
    ]
    if (!mobile) {
      list.push(
        { pos: [-4.5, 0.25, 0.6], scale: [0.5, 0.4, 0.35], rot: 0.8 },
        { pos: [5.0, 0.15, 0.2], scale: [0.45, 0.25, 0.4], rot: -0.5 },
      )
    }
    return list
  }, [mobile])

  return (
    <group>
      {rocks.map((rock, i) => (
        <mesh key={i} position={rock.pos} scale={rock.scale} rotation={[0, rock.rot, 0.1]} castShadow>
          <boxGeometry args={[1, 1, 1]} />
          <StoneMaterial color={i % 2 ? '#2f3a50' : '#243044'} />
        </mesh>
      ))}
    </group>
  )
}

function MistParticles({ count, reducedMotion }: { count: number; reducedMotion: boolean }) {
  const ref = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i += 1) {
      const n1 = ((i * 73) % 100) / 100
      const n2 = ((i * 41) % 100) / 100
      const n3 = ((i * 97) % 100) / 100
      arr[i * 3] = (n1 - 0.35) * 12
      arr[i * 3 + 1] = 0.4 + n2 * 4.5
      arr[i * 3 + 2] = -2 + n3 * 5
    }
    return arr
  }, [count])

  useFrame(({ clock }) => {
    if (!ref.current || reducedMotion) return
    ref.current.rotation.y = clock.elapsedTime * 0.02
  })

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [positions])

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial color="#c9b27a" size={0.035} transparent opacity={0.35} depthWrite={false} sizeAttenuation />
    </points>
  )
}

function CameraRig({ mobile, mode }: { mobile: boolean; mode: SceneMode }) {
  const { camera } = useThree()
  useFrame(() => {
    const target = mobile
      ? new THREE.Vector3(0.4, 1.7, 7.2)
      : new THREE.Vector3(mode === 'result' ? 0.8 : 0.2, 1.85, 6.6)
    camera.position.lerp(target, 0.05)
    camera.lookAt(mobile ? 0.6 : 1.8, 1.5, -1)
  })
  return null
}

export function RuinWorld({ mode, reducedMotion, mobile }: RuinWorldProps) {
  const intensity = intensityFor(mode)
  const dim = mode === 'result' ? 0.55 : 1

  return (
    <group>
      <color attach="background" args={['#070c16']} />
      <fog attach="fog" args={['#0a1220', 7, mobile ? 16 : 20]} />
      <ambientLight intensity={0.18 * dim} color="#6f849e" />
      <directionalLight
        position={[-4, 6, 3]}
        intensity={0.35 * dim}
        color="#9eb0c8"
        castShadow={!mobile}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <hemisphereLight args={['#1c2a40', '#06090f', 0.45 * dim]} />

      <Ground intensity={intensity * dim} />
      <Portal intensity={intensity} />
      <LightFlows intensity={intensity} reducedMotion={reducedMotion} />
      <Debris mobile={mobile} />
      <MistParticles count={mobile ? 28 : 56} reducedMotion={reducedMotion} />

      {/* left reading-side ruins — darker, keep text readable */}
      <Pillar position={[-4.4, 1.2, -0.4]} height={2.5} radius={0.24} color="#243044" />
      <Pillar position={[-3.7, 0.95, -1.5]} height={2.0} radius={0.2} color="#1e283a" />
      <Pillar position={[-4.9, 0.7, -2.4]} height={1.5} radius={0.16} color="#1a2233" />
      <DistantArch position={[-4.0, 0, -3.0]} scale={0.9} color="#171f2e" />
      <DistantArch position={[-2.2, 0, -4.2]} scale={0.72} color="#121a28" />
      <DistantArch position={[-0.2, 0, -5.4]} scale={0.58} color="#0e1520" />

      {/* right guiding ruins */}
      <Pillar position={[5.2, 1.35, -0.2]} height={2.8} radius={0.26} />
      <Pillar position={[4.5, 0.95, -1.8]} height={2.0} radius={0.18} color="#262f42" />
      <Pillar position={[5.6, 0.7, -2.8]} height={1.5} radius={0.15} color="#1f283a" />
      <DistantArch position={[5.5, 0, -3.4]} scale={0.8} color="#151d2c" />
      <DistantArch position={[4.0, 0, -4.8]} scale={0.62} color="#101824" />

      {/* mid broken lintels / stone blocks */}
      <mesh position={[-2.8, 2.5, -1.0]} rotation={[0, 0.3, 0.15]} castShadow>
        <boxGeometry args={[1.5, 0.32, 0.38]} />
        <StoneMaterial color="#303a50" />
      </mesh>
      <mesh position={[-2.3, 1.1, -0.7]} rotation={[0.1, 0.5, 0]} castShadow>
        <boxGeometry args={[0.7, 0.45, 0.5]} />
        <StoneMaterial color="#2a3348" />
      </mesh>
      <mesh position={[1.9, 2.9, -2.2]} rotation={[0, -0.4, -0.1]}>
        <boxGeometry args={[1.2, 0.26, 0.32]} />
        <StoneMaterial color="#1c2536" />
      </mesh>
      <mesh position={[2.2, 0.35, 0.9]} rotation={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[0.9, 0.4, 0.55]} />
        <StoneMaterial color="#2f3a50" emissive="#3a2a12" emissiveIntensity={0.08} />
      </mesh>

      <CameraRig mobile={mobile} mode={mode} />
    </group>
  )
}
