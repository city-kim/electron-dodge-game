/**
 * 플레이어 관리 클래스
 * - 플레이어 스프라이트 생성, 애니메이션, 이동, 입력 처리를 담당합니다
 * - 수동 이동(키보드)과 자동 이동(랜덤 워킹) 모드를 지원합니다
 * - 일시정지/재개 기능을 통해 게임 상태를 제어할 수 있습니다
 */

import * as Phaser from 'phaser'
import { PlayerState } from '@/app/types/game'
import { GAME_CONFIG } from '@/app/config/game-config'

export class PlayerManager {
  /** 플레이어 스프라이트 객체 (물리 엔진 적용) */
  private player:
    | (Phaser.Types.Physics.Arcade.SpriteWithDynamicBody & {
        direction?: 'up' | 'down' | 'left' | 'right'
      })
    | null = null

  /** 방향키 입력 객체 */
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null

  /** WASD 키 입력 객체 */
  private wasd: Record<
    'up' | 'left' | 'down' | 'right',
    Phaser.Input.Keyboard.Key
  > | null = null

  private state: PlayerState = {
    target: null,
    idle: 0,
  }

  private bonusSpeed = 0

  /**
   * 플레이어 스프라이트를 생성하고 초기화합니다
   * - 물리 엔진을 적용한 스프라이트 생성
   * - 애니메이션 설정 및 키보드 입력 설정
   * @param scene Phaser 씬 객체
   */
  createPlayer(scene: Phaser.Scene) {
    const { width, height } = GAME_CONFIG

    this.player = scene.physics.add.sprite(width / 2, height / 2, 'sprite')
    this.player.body.setAllowGravity(false)

    const { hitbox } = GAME_CONFIG
    this.player.body.setSize(hitbox.width, hitbox.height)
    this.player.body.setOffset(hitbox.offsetX, hitbox.offsetY)

    this.createAnimations(scene)

    // 플레이어 초기 상태 설정
    this.player.play('sprite-down') // 아래 방향 애니메이션 시작
    this.player.direction = 'down' // 초기 방향 설정

    // 키보드 입력 설정
    this.setupInput(scene)
  }

  /**
   * 플레이어의 4방향 애니메이션을 생성합니다
   * - 스프라이트 시트에서 각 방향별로 프레임을 분리하여 애니메이션 생성
   * - 각 애니메이션은 8fps로 무한 반복됩니다
   * @param scene Phaser 씬 객체
   */
  private createAnimations(scene: Phaser.Scene) {
    // 아래 방향 애니메이션 (프레임 0-2)
    scene.anims.create({
      key: 'sprite-down',
      frames: scene.anims.generateFrameNumbers('sprite', { start: 0, end: 2 }),
      frameRate: 8, // 초당 8프레임
      repeat: -1, // 무한 반복
    })

    // 왼쪽 방향 애니메이션 (프레임 3-5)
    scene.anims.create({
      key: 'sprite-left',
      frames: scene.anims.generateFrameNumbers('sprite', { start: 3, end: 5 }),
      frameRate: 8,
      repeat: -1,
    })

    // 오른쪽 방향 애니메이션 (프레임 6-8)
    scene.anims.create({
      key: 'sprite-right',
      frames: scene.anims.generateFrameNumbers('sprite', { start: 6, end: 8 }),
      frameRate: 8,
      repeat: -1,
    })

    // 위 방향 애니메이션 (프레임 9-11)
    scene.anims.create({
      key: 'sprite-up',
      frames: scene.anims.generateFrameNumbers('sprite', { start: 9, end: 11 }),
      frameRate: 8,
      repeat: -1,
    })
  }

  /**
   * 키보드 입력을 설정합니다
   * - 방향키와 WASD 키를 모두 지원합니다
   * @param scene Phaser 씬 객체
   */
  private setupInput(scene: Phaser.Scene) {
    if (scene.input.keyboard) {
      // 방향키 입력 설정
      this.cursors = scene.input.keyboard.createCursorKeys()

      // WASD 키 입력 설정
      this.wasd = scene.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W, // W키 = 위
        left: Phaser.Input.Keyboard.KeyCodes.A, // A키 = 왼쪽
        down: Phaser.Input.Keyboard.KeyCodes.S, // S키 = 아래
        right: Phaser.Input.Keyboard.KeyCodes.D, // D키 = 오른쪽
      }) as {
        up: Phaser.Input.Keyboard.Key
        left: Phaser.Input.Keyboard.Key
        down: Phaser.Input.Keyboard.Key
        right: Phaser.Input.Keyboard.Key
      }
    }
  }

  /**
   * 플레이어 상태를 업데이트합니다
   * - 매 프레임마다 호출되어 플레이어의 이동과 애니메이션을 처리합니다
   * - 일시정지 상태일 때는 모든 액션을 정지합니다
   * @param deltaTime 이전 프레임과의 시간 차이 (초)
   */
  update(deltaTime: number) {
    if (this.player) {
      // 수동 이동 모드 처리
      this.handleManualMove(deltaTime)
    }
  }

  /**
   * 수동 이동 모드를 처리합니다
   * - 키보드 입력(방향키 또는 WASD)에 따라 플레이어를 이동시킵니다
   * - 대각선 이동 시 속도가 빨라지지 않도록 정규화를 적용합니다
   * @param deltaTime 이전 프레임과의 시간 차이 (초)
   */
  private handleManualMove(deltaTime: number) {
    if (!this.player || !this.cursors || !this.wasd) return

    const speed = GAME_CONFIG.speed + this.bonusSpeed

    let dx = 0
    let dy = 0

    // 키보드 입력에 따른 이동 방향 설정
    if (this.cursors.left?.isDown || this.wasd.left?.isDown) dx -= 1 // 왼쪽
    if (this.cursors.right?.isDown || this.wasd.right?.isDown) dx += 1 // 오른쪽
    if (this.cursors.up?.isDown || this.wasd.up?.isDown) dy -= 1 // 위쪽
    if (this.cursors.down?.isDown || this.wasd.down?.isDown) dy += 1 // 아래쪽

    // 이동 입력이 있을 때만 처리
    if (dx || dy) {
      const len = Math.hypot(dx, dy) // 대각선 이동 시 속도 보정을 위한 거리 계산
      dx /= len // 정규화 (대각선 이동 시 속도가 빨라지지 않도록)
      dy /= len // 정규화
      const nextX = this.player.x + dx * speed * deltaTime
      const nextY = this.player.y + dy * speed * deltaTime
      this.updatePlayerDirection(dx, dy) // 플레이어 방향 업데이트
      this.clampToZone(nextX, nextY) // 이동 영역 내로 제한
    }
  }

  /**
   * 플레이어를 지정된 영역 내로 제한합니다
   * - 플레이어가 이동 가능한 영역을 벗어나지 않도록 좌표를 제한합니다
   * @param nx 새로운 X 좌표
   * @param ny 새로운 Y 좌표
   */
  private clampToZone(nx: number, ny: number) {
    if (this.player) {
      const { zone } = GAME_CONFIG
      const halfW = this.player.width / 2 // 플레이어 크기의 절반 (너비)
      const halfH = this.player.height / 2 // 플레이어 크기의 절반 (높이)

      // 플레이어가 영역을 벗어나지 않도록 좌표 제한
      this.player.x = Phaser.Math.Clamp(
        nx,
        zone.x + halfW,
        zone.x + zone.w - halfW,
      )
      this.player.y = Phaser.Math.Clamp(
        ny,
        zone.y + halfH,
        zone.y + zone.h - halfH,
      )
    }
  }

  /**
   * 플레이어의 이동 방향에 따라 애니메이션을 업데이트합니다
   * - 이동하지 않으면 아무것도 하지 않습니다
   * - 수평 이동이 수직 이동보다 크면 좌우, 그렇지 않으면 상하 방향을 결정합니다
   * - 방향이 변경되었을 때만 애니메이션을 재생합니다
   * @param dx X축 이동 방향 (-1 ~ 1)
   * @param dy Y축 이동 방향 (-1 ~ 1)
   */
  private updatePlayerDirection(dx: number, dy: number) {
    if (!this.player || (dx === 0 && dy === 0)) return

    let newDirection = this.player.direction

    // 수평 이동이 수직 이동보다 크면 좌우, 그렇지 않으면 상하 방향 결정
    if (Math.abs(dx) > Math.abs(dy)) {
      newDirection = dx > 0 ? 'right' : 'left'
    } else {
      newDirection = dy > 0 ? 'down' : 'up'
    }

    // 방향이 변경되었을 때만 애니메이션 재생
    if (newDirection !== this.player.direction) {
      this.player.direction = newDirection
      switch (newDirection) {
        case 'up':
          this.player.play('sprite-up')
          break
        case 'down':
          this.player.play('sprite-down')
          break
        case 'left':
          this.player.play('sprite-left')
          break
        case 'right':
          this.player.play('sprite-right')
          break
      }
    }
  }

  /**
   * 모든 액션을 정지합니다
   * - 현재 상태를 저장하여 나중에 복원할 수 있도록 합니다
   */
  stop() {
    // 모든 액션 정지
    this.state.target = null
    this.state.idle = 0
    // 플레이어 애니메이션 정지
    if (this.player) this.player.anims.stop()
  }

  /**
   * 모든 액션을 재개합니다
   */
  play() {
    // 플레이어 애니메이션 재개
    if (this.player && this.player.direction) {
      switch (this.player.direction) {
        case 'up':
          this.player.play('sprite-up')
          break
        case 'down':
          this.player.play('sprite-down')
          break
        case 'left':
          this.player.play('sprite-left')
          break
        case 'right':
          this.player.play('sprite-right')
          break
      }
    }
  }

  addSpeed(amount: number) {
    this.bonusSpeed += amount
  }

  resetSpeed() {
    this.bonusSpeed = 0
  }

  getSpeed() {
    return GAME_CONFIG.speed + this.bonusSpeed
  }

  getPlayer(): Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | null {
    return this.player
  }

  /**
   * 플레이어의 현재 위치를 반환합니다
   * @returns 플레이어의 X, Y 좌표 또는 null
   */
  getPosition(): { x: number; y: number } | null {
    return this.player ? { x: this.player.x, y: this.player.y } : null
  }
}
