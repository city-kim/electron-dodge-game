/**
 * 트리거 영역 인터페이스
 * - 게임 화면을 4개 영역으로 나누어 플레이어가 특정 영역에 진입했을 때 이벤트를 발생시킵니다
 */
export interface TriggerZone {
  /** 영역 고유 ID (1-4) */
  id: number
  /** 영역 이름 */
  name: string
  /** 영역의 사각형 좌표와 크기 */
  rect: Phaser.Geom.Rectangle
  /** 영역 시각화용 색상 (16진수) */
  color: number
}

/**
 * 게임 설정 인터페이스
 * - 게임의 기본 설정값들을 중앙화하여 관리합니다
 */
export interface GameConfig {
  /** 게임 화면 너비 (픽셀) */
  width: number
  /** 게임 화면 높이 (픽셀) */
  height: number
  /** 수동 이동 시 플레이어 속도 (픽셀/초) */
  speed: number
  /** 플레이어가 이동할 수 있는 영역 설정 */
  zone: {
    /** 영역 시작 X 좌표 */
    x: number
    /** 영역 시작 Y 좌표 */
    y: number
    /** 영역 너비 */
    w: number
    /** 영역 높이 */
    h: number
  }
  /** 플레이어 충돌 판정 영역 (프레임 좌표 기준, scale 적용 전) */
  hitbox: {
    width: number
    height: number
    offsetX: number
    offsetY: number
  }
  /** 자동 이동 모드 설정 */
  auto: {
    /** 자동 이동 시 플레이어 속도 (픽셀/초) */
    speed: number
    /** 목표 지점 도달 후 최소 대기 시간 (초) */
    idleMin: number
    /** 목표 지점 도달 후 최대 대기 시간 (초) */
    idleMax: number
    /** 목표 지점 도달 판정 거리 (픽셀) */
    reach: number
  }
}

/**
 * 플레이어 상태 인터페이스
 * - 플레이어의 현재 상태를 추적합니다
 */
export interface PlayerState {
  /** 플레이어가 바라보는 방향 */
  direction?: 'up' | 'down' | 'left' | 'right'
  /** 자동 이동 목표 지점 좌표 (자동 이동 모드일 때만 사용) */
  target: { x: number; y: number } | null
  /** 목표 지점 도달 후 남은 대기 시간 (초) */
  idle: number
}

/**
 * 게임 API 인터페이스
 * - React 컴포넌트에서 Phaser 게임을 제어할 수 있는 함수들을 정의합니다
 */
export interface GameAPI {
  play?: () => void
}
