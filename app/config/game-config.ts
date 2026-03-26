/**
 * 게임 설정 상수 파일
 * - 게임의 모든 설정값들을 중앙화하여 관리합니다
 * - 설정 변경 시 이 파일만 수정하면 전체 게임에 반영됩니다
 */

import { GameConfig } from '@/app/types/game'

export const Container = {
  width: 400,
  height: 500,
  padding: 10,
}

/**
 * 게임의 기본 설정값들
 * - 화면 크기, 플레이어 속도, 이동 영역, 자동 이동 설정 등을 포함합니다
 */
export const GAME_CONFIG: GameConfig = {
  /** 게임 화면 너비 (픽셀) - 1024px */
  width: Container.width,
  /** 게임 화면 높이 (픽셀) - 800px */
  height: Container.height,
  /** 수동 이동 시 플레이어 속도 (픽셀/초) - 120px/s */
  speed: 120,
  /** 플레이어가 이동할 수 있는 영역 설정 */
  zone: {
    x: Container.padding,
    y: Container.padding,
    w: Container.width - Container.padding * 2,
    h: Container.height - Container.padding * 2,
  },
  /** 플레이어 충돌 판정 영역 (40x40 프레임 내 실제 캐릭터가 차지하는 영역) */
  hitbox: {
    width: 16,
    height: 16,
    offsetX: 12,
    offsetY: 16,
  },
  /** 자동 이동 모드 설정 */
  auto: {
    /** 자동 이동 시 플레이어 속도 (픽셀/초) - 수동 이동보다 느림 */
    speed: 90,
    /** 목표 지점 도달 후 최소 대기 시간 (초) - 0.3초 */
    idleMin: 0.3,
    /** 목표 지점 도달 후 최대 대기 시간 (초) - 1.2초 */
    idleMax: 1.2,
    /** 목표 지점 도달 판정 거리 (픽셀) - 6px 이내면 도달로 판정 */
    reach: 6,
  },
}
