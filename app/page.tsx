'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

interface Tank {
  mesh: THREE.Group
  health: number
  isPlayer: boolean
  lastShot: number
  moveDirection?: THREE.Vector3
  targetPosition?: THREE.Vector3
}

interface Bullet {
  mesh: THREE.Mesh
  direction: THREE.Vector3
  isPlayerBullet: boolean
}

export default function Game() {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const playerTankRef = useRef<Tank | null>(null)
  const enemyTanksRef = useRef<Tank[]>([])
  const bulletsRef = useRef<Bullet[]>([])
  const obstaclesRef = useRef<THREE.Mesh[]>([])
  const keysRef = useRef<{ [key: string]: boolean }>({})
  const mouseRef = useRef({ x: 0, y: 0 })
  const animationFrameRef = useRef<number | null>(null)

  const [playerHealth, setPlayerHealth] = useState(100)
  const [gameOver, setGameOver] = useState(false)
  const [gameWon, setGameWon] = useState(false)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x87CEEB)
    scene.fog = new THREE.Fog(0x87CEEB, 50, 200)

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
    camera.position.set(0, 30, 40)
    camera.lookAt(0, 0, 0)

    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(width, height)
    renderer.shadowMap.enabled = true
    container.appendChild(renderer.domElement)

    sceneRef.current = scene
    cameraRef.current = camera
    rendererRef.current = renderer

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(50, 100, 50)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.width = 2048
    directionalLight.shadow.mapSize.height = 2048
    scene.add(directionalLight)

    const groundGeometry = new THREE.PlaneGeometry(100, 100)
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x3d5c3d })
    const ground = new THREE.Mesh(groundGeometry, groundMaterial)
    ground.rotation.x = -Math.PI / 2
    ground.receiveShadow = true
    scene.add(ground)

    const createTank = (color: number, x: number, z: number, isPlayer: boolean): Tank => {
      const tankGroup = new THREE.Group()

      const bodyGeometry = new THREE.BoxGeometry(3, 1.5, 4)
      const bodyMaterial = new THREE.MeshStandardMaterial({ color: color })
      const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
      body.position.y = 0.75
      body.castShadow = true
      tankGroup.add(body)

      const turretGeometry = new THREE.BoxGeometry(2, 1, 2)
      const turretMaterial = new THREE.MeshStandardMaterial({ color: color })
      const turret = new THREE.Mesh(turretGeometry, turretMaterial)
      turret.position.y = 2
      turret.castShadow = true
      tankGroup.add(turret)

      const barrelGeometry = new THREE.CylinderGeometry(0.2, 0.2, 3)
      const barrelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 })
      const barrel = new THREE.Mesh(barrelGeometry, barrelMaterial)
      barrel.rotation.x = Math.PI / 2
      barrel.position.set(0, 2, 2)
      barrel.castShadow = true
      tankGroup.add(barrel)

      tankGroup.position.set(x, 0, z)
      scene.add(tankGroup)

      return {
        mesh: tankGroup,
        health: 100,
        isPlayer: isPlayer,
        lastShot: 0,
        moveDirection: new THREE.Vector3(),
        targetPosition: new THREE.Vector3(x, 0, z)
      }
    }

    const playerTank = createTank(0x228B22, 0, 30, true)
    playerTankRef.current = playerTank

    const enemyPositions = [
      { x: -20, z: -20 },
      { x: 20, z: -20 },
      { x: 0, z: -30 }
    ]

    enemyPositions.forEach(pos => {
      const enemyTank = createTank(0x8B0000, pos.x, pos.z, false)
      enemyTanksRef.current.push(enemyTank)
    })

    const createObstacle = (x: number, z: number, width: number, height: number, depth: number) => {
      const geometry = new THREE.BoxGeometry(width, height, depth)
      const material = new THREE.MeshStandardMaterial({ color: 0x8B4513 })
      const obstacle = new THREE.Mesh(geometry, material)
      obstacle.position.set(x, height / 2, z)
      obstacle.castShadow = true
      obstacle.receiveShadow = true
      scene.add(obstacle)
      obstaclesRef.current.push(obstacle)
    }

    createObstacle(-15, 0, 4, 3, 4)
    createObstacle(15, 0, 4, 3, 4)
    createObstacle(-15, -15, 4, 3, 4)
    createObstacle(15, -15, 4, 3, 4)
    createObstacle(0, -10, 6, 2, 2)
    createObstacle(-10, 10, 2, 2, 6)
    createObstacle(10, 10, 2, 2, 6)

    const shoot = (tank: Tank, isPlayer: boolean) => {
      const now = Date.now()
      if (now - tank.lastShot < 500) return

      tank.lastShot = now

      const bulletGeometry = new THREE.SphereGeometry(0.3, 16, 16)
      const bulletMaterial = new THREE.MeshStandardMaterial({ 
        color: isPlayer ? 0x00FF00 : 0xFF0000 
      })
      const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial)

      bullet.position.copy(tank.mesh.position)
      bullet.position.y = 2

      const direction = new THREE.Vector3(0, 0, -1)
      if (isPlayer) {
        direction.applyQuaternion(tank.mesh.quaternion)
      } else {
        const playerPos = playerTankRef.current?.mesh.position || new THREE.Vector3()
        direction.subVectors(playerPos, bullet.position).normalize()
      }

      scene.add(bullet)
      bulletsRef.current.push({
        mesh: bullet,
        direction: direction,
        isPlayerBullet: isPlayer
      })
    }

    const checkCollision = (position: THREE.Vector3, radius: number): boolean => {
      for (const obstacle of obstaclesRef.current) {
        const box = new THREE.Box3().setFromObject(obstacle)
        const sphere = new THREE.Sphere(position, radius)
        if (box.intersectsSphere(sphere)) {
          return true
        }
      }
      return false
    }

    const updateBullets = () => {
      const bulletsToRemove: number[] = []

      bulletsRef.current.forEach((bullet, index) => {
        bullet.mesh.position.add(bullet.direction.clone().multiplyScalar(0.5))

        if (checkCollision(bullet.mesh.position, 0.3)) {
          scene.remove(bullet.mesh)
          bulletsToRemove.push(index)
          return
        }

        if (bullet.isPlayerBullet) {
          enemyTanksRef.current.forEach(enemyTank => {
            if (enemyTank.health > 0) {
              const distance = bullet.mesh.position.distanceTo(enemyTank.mesh.position)
              if (distance < 2.5) {
                enemyTank.health -= 40
                scene.remove(bullet.mesh)
                bulletsToRemove.push(index)

                if (enemyTank.health <= 0) {
                  scene.remove(enemyTank.mesh)
                }
              }
            }
          })
        } else {
          if (playerTankRef.current && playerTankRef.current.health > 0) {
            const distance = bullet.mesh.position.distanceTo(playerTankRef.current.mesh.position)
            if (distance < 2.5) {
              playerTankRef.current.health -= 20
              setPlayerHealth(playerTankRef.current.health)
              scene.remove(bullet.mesh)
              bulletsToRemove.push(index)

              if (playerTankRef.current.health <= 0) {
                setGameOver(true)
              }
            }
          }
        }

        if (Math.abs(bullet.mesh.position.x) > 50 || Math.abs(bullet.mesh.position.z) > 50) {
          scene.remove(bullet.mesh)
          bulletsToRemove.push(index)
        }
      })

      bulletsToRemove.sort((a, b) => b - a).forEach(index => {
        bulletsRef.current.splice(index, 1)
      })
    }

    const updatePlayerTank = () => {
      if (!playerTankRef.current || gameOver || gameWon) return

      const tank = playerTankRef.current
      const speed = 0.15
      const rotationSpeed = 0.03

      let moveX = 0
      let moveZ = 0

      if (keysRef.current['w'] || keysRef.current['W']) moveZ = -1
      if (keysRef.current['s'] || keysRef.current['S']) moveZ = 1
      if (keysRef.current['a'] || keysRef.current['A']) moveX = -1
      if (keysRef.current['d'] || keysRef.current['D']) moveX = 1

      if (moveX !== 0 || moveZ !== 0) {
        const moveDirection = new THREE.Vector3(moveX, 0, moveZ).normalize()
        const targetRotation = Math.atan2(moveDirection.x, moveDirection.z)

        tank.mesh.rotation.y = THREE.MathUtils.lerp(
          tank.mesh.rotation.y,
          targetRotation,
          rotationSpeed
        )

        const newPosition = tank.mesh.position.clone()
        newPosition.add(moveDirection.multiplyScalar(speed))

        if (!checkCollision(newPosition, 2)) {
          tank.mesh.position.copy(newPosition)
        }
      }

      const mousePos = new THREE.Vector3(
        (mouseRef.current.x / width) * 2 - 1,
        -(mouseRef.current.y / height) * 2 + 1,
        0.5
      )
      mousePos.unproject(camera)
      const dir = mousePos.sub(camera.position).normalize()
      const distance = -camera.position.y / dir.y
      const groundPoint = camera.position.clone().add(dir.multiplyScalar(distance))

      const angle = Math.atan2(
        groundPoint.x - tank.mesh.position.x,
        groundPoint.z - tank.mesh.position.z
      )
      tank.mesh.rotation.y = angle
    }

    const updateEnemyTanks = () => {
      if (gameOver || gameWon) return

      enemyTanksRef.current.forEach(enemyTank => {
        if (enemyTank.health <= 0) return

        const playerTank = playerTankRef.current
        if (!playerTank) return

        const distanceToPlayer = enemyTank.mesh.position.distanceTo(playerTank.mesh.position)

        if (distanceToPlayer > 15) {
          const direction = new THREE.Vector3()
          direction.subVectors(playerTank.mesh.position, enemyTank.mesh.position).normalize()

          const newPosition = enemyTank.mesh.position.clone()
          newPosition.add(direction.multiplyScalar(0.05))

          if (!checkCollision(newPosition, 2)) {
            enemyTank.mesh.position.copy(newPosition)
          }

          const angle = Math.atan2(direction.x, direction.z)
          enemyTank.mesh.rotation.y = angle
        }

        if (distanceToPlayer < 30) {
          shoot(enemyTank, false)
        }
      })

      const aliveEnemies = enemyTanksRef.current.filter(tank => tank.health > 0)
      if (aliveEnemies.length === 0) {
        setGameWon(true)
      }
    }

    const updateCamera = () => {
      if (!playerTankRef.current || !cameraRef.current) return

      const tank = playerTankRef.current
      const targetPosition = tank.mesh.position.clone()
      targetPosition.y += 30
      targetPosition.z += 40

      cameraRef.current.position.lerp(targetPosition, 0.05)
      cameraRef.current.lookAt(tank.mesh.position)
    }

    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate)

      updatePlayerTank()
      updateEnemyTanks()
      updateBullets()
      updateCamera()

      renderer.render(scene, camera)
    }

    animate()

    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key] = true

      if (e.key === ' ' && playerTankRef.current && !gameOver && !gameWon) {
        shoot(playerTankRef.current, true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 0 && playerTankRef.current && !gameOver && !gameWon) {
        shoot(playerTankRef.current, true)
      }
    }

    const handleResize = () => {
      if (!cameraRef.current || !rendererRef.current) return

      const newWidth = container.clientWidth
      const newHeight = container.clientHeight

      cameraRef.current.aspect = newWidth / newHeight
      cameraRef.current.updateProjectionMatrix()

      rendererRef.current.setSize(newWidth, newHeight)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    container.addEventListener('mousemove', handleMouseMove)
    container.addEventListener('mousedown', handleMouseDown)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      container.removeEventListener('mousemove', handleMouseMove)
      container.removeEventListener('mousedown', handleMouseDown)
      window.removeEventListener('resize', handleResize)

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      if (rendererRef.current) {
        container.removeChild(rendererRef.current.domElement)
        rendererRef.current.dispose()
      }
    }
  }, [gameOver, gameWon])

  const restartGame = () => {
    window.location.reload()
  }

  return (
    <div className="relative w-full h-screen bg-gray-900">
      <div ref={containerRef} className="w-full h-full" />

      <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white p-4 rounded-lg">
        <div className="text-xl font-bold mb-2">玩家生命值</div>
        <div className="w-64 h-4 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${playerHealth}%` }}
          />
        </div>
        <div className="mt-2 text-lg">{playerHealth} / 100</div>
      </div>

      <div className="absolute top-4 right-4 bg-black bg-opacity-70 text-white p-4 rounded-lg">
        <div className="text-xl font-bold mb-2">操作说明</div>
        <div className="text-sm space-y-1">
          <div>WASD - 移动坦克</div>
          <div>鼠标 - 瞄准</div>
          <div>左键/空格 - 发射炮弹</div>
        </div>
      </div>

      {gameOver && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
          <div className="bg-red-600 text-white p-8 rounded-xl text-center">
            <div className="text-4xl font-bold mb-4">游戏结束</div>
            <div className="text-xl mb-6">你被击败了！</div>
            <button
              onClick={restartGame}
              className="bg-white text-red-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors"
            >
              重新开始
            </button>
          </div>
        </div>
      )}

      {gameWon && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80">
          <div className="bg-green-600 text-white p-8 rounded-xl text-center">
            <div className="text-4xl font-bold mb-4">胜利！</div>
            <div className="text-xl mb-6">你击败了所有敌方坦克！</div>
            <button
              onClick={restartGame}
              className="bg-white text-green-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors"
            >
              重新开始
            </button>
          </div>
        </div>
      )}
    </div>
  )
}