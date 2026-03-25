import * as Phaser from 'phaser'
import { GAME_CONFIG } from '@/app/config/gameConfig'

export interface ParticleTypeConfig {
  key: string
  image?: string
  imageScale?: number
  /** 충돌 판정 크기 (프레임 좌표 기준 px — 실제 월드 크기는 이 값 × scale) */
  hitboxSize: number
  minSpeed: number
  maxSpeed: number
  minInterval: number
  maxInterval: number
  spin?: [number, number]
  radius: number
  color: number
}

export const PARTICLE_TYPES: ParticleTypeConfig[] = [
  {
    key: 'pt_slow',
    hitboxSize: 30,
    spin: [60, 120],
    minSpeed: 60,
    maxSpeed: 100,
    minInterval: 500,
    maxInterval: 900,
    radius: 7,
    color: 0x4ade80,
    image: 'land-mine.png',
    imageScale: 0.5,
  },
  {
    key: 'pt_medium',
    hitboxSize: 28,
    spin: [120, 240],
    minSpeed: 150,
    maxSpeed: 220,
    minInterval: 1000,
    maxInterval: 1800,
    radius: 5,
    color: 0xfbbf24,
    image: 'sword.png',
    imageScale: 0.5,
  },
  {
    key: 'pt_fast',
    hitboxSize: 24,
    spin: [240, 400],
    minSpeed: 280,
    maxSpeed: 400,
    minInterval: 2200,
    maxInterval: 3800,
    radius: 4,
    color: 0xf87171,
    image: 'axe.png',
    imageScale: 0.5,
  },
]

export class ParticleManager {
  private scene: Phaser.Scene
  private group: Phaser.Physics.Arcade.Group
  private timers: Phaser.Time.TimerEvent[] = []
  private speedMultiplier = 1
  private _dodgedCount = 0

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.group = scene.physics.add.group()
  }

  static createFallbackTextures(scene: Phaser.Scene) {
    for (const t of PARTICLE_TYPES) {
      if (t.image) continue
      if (scene.textures.exists(t.key)) continue
      const g = scene.add.graphics()
      const pad = 3
      const size = (t.radius + pad) * 2
      g.fillStyle(t.color, 0.25)
      g.fillCircle(t.radius + pad, t.radius + pad, t.radius + pad)
      g.fillStyle(t.color, 1)
      g.fillCircle(t.radius + pad, t.radius + pad, t.radius)
      g.generateTexture(t.key, size, size)
      g.destroy()
    }
  }

  get dodgedCount() {
    return this._dodgedCount
  }

  setSpeedMultiplier(m: number) {
    this.speedMultiplier = m
  }

  start() {
    this.stop()
    for (let i = 0; i < PARTICLE_TYPES.length; i++) {
      this.scheduleSpawn(i)
    }
  }

  stop() {
    for (const t of this.timers) t.destroy()
    this.timers = []
  }

  reset() {
    this.stop()
    this.group.clear(true, true)
    this.speedMultiplier = 1
    this._dodgedCount = 0
  }

  getGroup() {
    return this.group
  }

  update() {
    const { width, height } = GAME_CONFIG
    const margin = 80
    const children = this.group.getChildren()
    for (let i = children.length - 1; i >= 0; i--) {
      const s = children[i] as Phaser.Physics.Arcade.Sprite
      if (
        s.x < -margin ||
        s.x > width + margin ||
        s.y < -margin ||
        s.y > height + margin
      ) {
        s.destroy()
        this._dodgedCount++
      }
    }
  }

  private scheduleSpawn(typeIdx: number) {
    const t = PARTICLE_TYPES[typeIdx]
    const delay = Phaser.Math.Between(t.minInterval, t.maxInterval)
    const timer = this.scene.time.delayedCall(delay, () => {
      this.spawnOne(typeIdx)
      this.scheduleSpawn(typeIdx)
    })
    this.timers.push(timer)
  }

  private spawnOne(typeIdx: number) {
    const t = PARTICLE_TYPES[typeIdx]
    const { width, height } = GAME_CONFIG
    const pad = 40

    const edge = Phaser.Math.Between(0, 3)
    let sx: number, sy: number, tx: number, ty: number

    switch (edge) {
      case 0:
        sx = Phaser.Math.Between(0, width)
        sy = -pad
        tx = Phaser.Math.Between(0, width)
        ty = height + pad
        break
      case 1:
        sx = width + pad
        sy = Phaser.Math.Between(0, height)
        tx = -pad
        ty = Phaser.Math.Between(0, height)
        break
      case 2:
        sx = Phaser.Math.Between(0, width)
        sy = height + pad
        tx = Phaser.Math.Between(0, width)
        ty = -pad
        break
      default:
        sx = -pad
        sy = Phaser.Math.Between(0, height)
        tx = width + pad
        ty = Phaser.Math.Between(0, height)
        break
    }

    const baseSpeed = Phaser.Math.Between(t.minSpeed, t.maxSpeed)
    const speed = baseSpeed * this.speedMultiplier
    const angle = Math.atan2(ty - sy, tx - sx)

    const sprite = this.group.create(
      sx,
      sy,
      t.key,
    ) as Phaser.Physics.Arcade.Sprite

    if (t.image && t.imageScale) {
      sprite.setScale(t.imageScale)
    }

    const body = sprite.body as Phaser.Physics.Arcade.Body
    body.setAllowGravity(false)

    const fw = sprite.frame.width
    const fh = sprite.frame.height
    body.setSize(t.hitboxSize, t.hitboxSize)
    body.setOffset((fw - t.hitboxSize) / 2, (fh - t.hitboxSize) / 2)

    sprite.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed)

    if (t.spin) {
      const dir = Math.random() < 0.5 ? -1 : 1
      body.setAngularVelocity(dir * Phaser.Math.Between(t.spin[0], t.spin[1]))
    }
  }
}
