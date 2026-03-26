'use client'
import { useEffect, useRef } from 'react'
import * as Phaser from 'phaser'
import { GameAPI } from '@/app/types/game'
import { GAME_CONFIG } from '@/app/config/game-config'
import { GameScene } from '@/app/game/game-scene'

export default function PhaserRandomMovePage() {
  // container
  const containerRef = useRef<HTMLDivElement | null>(null)
  // game instance
  const gameRef = useRef<Phaser.Game | null>(null)
  // game api reference
  const apiRef = useRef<GameAPI>({})

  // Phaser 게임 초기화 및 설정
  useEffect(() => {
    if (!containerRef.current) return
    if (gameRef.current) return

    const { width, height } = GAME_CONFIG

    // Phaser 게임 인스턴스 생성
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      width,
      height,
      parent: containerRef.current,
      backgroundColor: '#0b0b0b',
      pixelArt: true,
      render: { pixelArt: true, antialias: false, roundPixels: true },
      physics: { default: 'arcade', arcade: { debug: false } },
      scene: new GameScene(apiRef),
    })

    gameRef.current = game

    // 컴포넌트 언마운트 시 정리 함수
    return () => {
      apiRef.current = {}
      game.destroy(true)
      gameRef.current = null
    }
  }, [])

  return (
    <div className="flex w-dvh h-dvh items-center justify-center">
      <div className="min-h-[50dvh] text-neutral-200">
        <div className="mx-auto space-y-3">
          <div className="flex flex-wrap items-center gap-3 bg-neutral-500 p-3">
            <small className="opacity-75">
              ←→↑↓ 또는 WASD로 이동 · 파티클을 피해 최대한 오래 생존하세요!
            </small>
          </div>

          <div className="bg-neutral-500 p-3">
            <div ref={containerRef} className="grid place-items-center" />
          </div>
        </div>
      </div>
    </div>
  )
}
