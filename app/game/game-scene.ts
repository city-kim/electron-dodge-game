import * as Phaser from 'phaser'
import { GameAPI } from '@/app/types/game'
import { GAME_CONFIG } from '@/app/config/game-config'
import { PlayerManager } from '@/app/game/player'
import { ParticleManager, PARTICLE_TYPES } from '@/app/game/particle'

type GameState = 'IDLE' | 'PLAYING' | 'GAME_OVER'

export class GameScene extends Phaser.Scene {
  private playerManager!: PlayerManager | null
  private particleManager!: ParticleManager | null
  private apiRef!: React.RefObject<GameAPI>

  private gameState: GameState = 'IDLE'
  private survivalTime = 0
  private eggCount = 0

  // UI
  private timerText!: Phaser.GameObjects.Text
  private statsText!: Phaser.GameObjects.Text
  private overlay!: Phaser.GameObjects.Rectangle
  private playButton!: Phaser.GameObjects.Container
  private gameOverContainer!: Phaser.GameObjects.Container
  private gameOverBodyText!: Phaser.GameObjects.Text

  // Egg
  private egg!: Phaser.Physics.Arcade.Sprite | null

  constructor(apiRef: React.RefObject<GameAPI>) {
    super({ key: 'GameScene' })
    this.apiRef = apiRef
  }

  preload() {
    this.load.spritesheet('sprite', 'sprite.png', {
      frameWidth: 40,
      frameHeight: 40,
      endFrame: 11,
    })

    for (const t of PARTICLE_TYPES) {
      if (t.image) this.load.image(t.key, t.image)
    }

    this.load.image('egg', 'egg.png')
  }

  create() {
    const { width, height } = GAME_CONFIG

    ParticleManager.createFallbackTextures(this)

    this.playerManager = new PlayerManager()
    this.particleManager = new ParticleManager(this)

    this.playerManager.createPlayer(this)

    const player = this.playerManager.getPlayer()
    if (player) {
      this.physics.add.overlap(player, this.particleManager.getGroup(), () => {
        if (this.gameState === 'PLAYING') this.endGame()
      })
    }

    this.createEgg()
    this.createUI(width, height)
    this.setGameState('IDLE')
    this.setupAPI()
  }

  // ── Egg ──

  private createEgg() {
    const pos = this.randomEggPosition()
    this.egg = this.physics.add.sprite(pos.x, pos.y, 'egg')
    ;(this.egg.body as Phaser.Physics.Arcade.Body).setAllowGravity(false)
    this.egg.setDepth(5)
    this.egg.setVisible(false)

    const player = this.playerManager?.getPlayer()
    if (player && this.egg) {
      this.physics.add.overlap(player, this.egg, () => {
        if (this.gameState === 'PLAYING') this.collectEgg()
      })
    }
  }

  private randomEggPosition() {
    const { zone } = GAME_CONFIG
    const margin = 24
    return {
      x: Phaser.Math.Between(zone.x + margin, zone.x + zone.w - margin),
      y: Phaser.Math.Between(zone.y + margin, zone.y + zone.h - margin),
    }
  }

  private collectEgg() {
    this.eggCount++
    this.playerManager?.addSpeed(2)

    const pos = this.randomEggPosition()
    this.egg?.setPosition(pos.x, pos.y)
  }

  // ── UI ──

  private createUI(width: number, height: number) {
    const cx = width / 2
    const cy = height / 2

    this.timerText = this.add
      .text(cx, 12, '0.000s', {
        fontFamily: '"Courier New", monospace',
        fontSize: '20px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5, 0)
      .setDepth(100)
      .setVisible(false)

    this.statsText = this.add
      .text(cx, 36, '', {
        fontFamily: '"Courier New", monospace',
        fontSize: '13px',
        color: '#bbbbbb',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5, 0)
      .setDepth(100)
      .setVisible(false)

    this.overlay = this.add
      .rectangle(cx, cy, width, height, 0x000000, 0.55)
      .setDepth(90)

    this.createPlayButton(cx, cy)
    this.createGameOverUI(cx, cy)
  }

  private createPlayButton(cx: number, cy: number) {
    const btnBg = this.add
      .rectangle(0, 0, 180, 60, 0x1a1a2e)
      .setStrokeStyle(2, 0x4ade80)

    const btnText = this.add
      .text(0, 0, '▶  PLAY', {
        fontFamily: '"Courier New", monospace',
        fontSize: '28px',
        color: '#4ade80',
      })
      .setOrigin(0.5)

    const subtitle = this.add
      .text(0, 50, '생존하세요!', {
        fontFamily: 'sans-serif',
        fontSize: '13px',
        color: '#aaaaaa',
      })
      .setOrigin(0.5)

    this.playButton = this.add
      .container(cx, cy, [btnBg, btnText, subtitle])
      .setDepth(100)

    btnBg.setInteractive({ useHandCursor: true })
    btnBg.on('pointerover', () => {
      btnBg.setFillStyle(0x252545)
      btnText.setColor('#86efac')
    })
    btnBg.on('pointerout', () => {
      btnBg.setFillStyle(0x1a1a2e)
      btnText.setColor('#4ade80')
    })
    btnBg.on('pointerdown', () => this.startGame())
  }

  private createGameOverUI(cx: number, cy: number) {
    const title = this.add
      .text(0, -80, 'GAME OVER', {
        fontFamily: '"Courier New", monospace',
        fontSize: '36px',
        color: '#f87171',
        stroke: '#000000',
        strokeThickness: 5,
      })
      .setOrigin(0.5)

    this.gameOverBodyText = this.add
      .text(0, -10, '', {
        fontFamily: '"Courier New", monospace',
        fontSize: '15px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
        lineSpacing: 6,
        align: 'center',
      })
      .setOrigin(0.5)

    const restartBg = this.add
      .rectangle(0, 65, 200, 50, 0x1a1a2e)
      .setStrokeStyle(2, 0x60a5fa)

    const restartText = this.add
      .text(0, 65, '↻  RESTART', {
        fontFamily: '"Courier New", monospace',
        fontSize: '22px',
        color: '#60a5fa',
      })
      .setOrigin(0.5)

    restartBg.setInteractive({ useHandCursor: true })
    restartBg.on('pointerover', () => {
      restartBg.setFillStyle(0x252545)
      restartText.setColor('#93c5fd')
    })
    restartBg.on('pointerout', () => {
      restartBg.setFillStyle(0x1a1a2e)
      restartText.setColor('#60a5fa')
    })
    restartBg.on('pointerdown', () => this.restartGame())

    this.gameOverContainer = this.add
      .container(cx, cy, [title, this.gameOverBodyText, restartBg, restartText])
      .setDepth(100)
      .setVisible(false)
  }

  private updateScoreboard() {
    const sec = Math.floor(this.survivalTime)
    const ms = Math.floor((this.survivalTime - sec) * 1000)
    this.timerText.setText(`${sec}.${ms.toString().padStart(3, '0')}s`)

    const dodged = this.particleManager?.dodgedCount ?? 0
    this.statsText.setText(`Egg: ${this.eggCount}  |  Dodge: ${dodged}`)
  }

  // ── State ──

  private setGameState(state: GameState) {
    this.gameState = state

    switch (state) {
      case 'IDLE':
        this.overlay.setVisible(true)
        this.playButton.setVisible(true)
        this.timerText.setVisible(false)
        this.statsText.setVisible(false)
        this.gameOverContainer.setVisible(false)
        this.egg?.setVisible(false)
        this.playerManager?.stop()
        break

      case 'PLAYING':
        this.overlay.setVisible(false)
        this.playButton.setVisible(false)
        this.timerText.setVisible(true)
        this.statsText.setVisible(true)
        this.gameOverContainer.setVisible(false)
        this.egg?.setVisible(true)
        this.survivalTime = 0
        this.eggCount = 0
        this.timerText.setText('0.000s')
        this.statsText.setText('Egg: 0  |  Dodge: 0')
        this.playerManager?.play()
        this.particleManager?.start()
        break

      case 'GAME_OVER':
        this.overlay.setVisible(true)
        this.playButton.setVisible(false)
        this.timerText.setVisible(true)
        this.statsText.setVisible(true)
        this.gameOverContainer.setVisible(true)
        this.egg?.setVisible(false)
        this.particleManager?.stop()
        this.playerManager?.stop()
        break
    }
  }

  private startGame() {
    this.setGameState('PLAYING')
  }

  private endGame() {
    const totalMs = Math.floor(this.survivalTime * 1000)
    const sec = Math.floor(this.survivalTime)
    const ms = totalMs % 1000
    const dodged = this.particleManager?.dodgedCount ?? 0
    const speed = this.playerManager?.getSpeed() ?? GAME_CONFIG.speed

    this.gameOverBodyText.setText(
      [
        `생존: ${sec}.${ms.toString().padStart(3, '0')}s (${totalMs}ms)`,
        `Egg: ${this.eggCount}  |  Dodge: ${dodged}`,
        `속도: ${speed} px/s`,
      ].join('\n'),
    )
    this.setGameState('GAME_OVER')
  }

  private restartGame() {
    this.particleManager?.reset()
    this.playerManager?.resetSpeed()

    const { width, height } = GAME_CONFIG
    const player = this.playerManager?.getPlayer()
    if (player) {
      player.x = width / 2
      player.y = height / 2
    }

    const pos = this.randomEggPosition()
    this.egg?.setPosition(pos.x, pos.y)

    this.setGameState('PLAYING')
  }

  // ── Loop ──

  update(_time: number, delta: number) {
    if (this.gameState !== 'PLAYING') return

    const dt = delta / 1000
    this.survivalTime += dt

    // 10초마다 파티클 속도 15% 증가
    const multiplier = 1 + Math.floor(this.survivalTime / 10) * 0.15
    this.particleManager?.setSpeedMultiplier(multiplier)

    this.playerManager?.update(dt)
    this.particleManager?.update()
    this.updateScoreboard()
  }

  private setupAPI() {
    this.apiRef.current.play = () => {
      this.playerManager?.play()
    }
  }

  destroy() {
    this.particleManager?.reset()
    this.particleManager = null
    this.playerManager = null
    this.egg = null
  }
}
