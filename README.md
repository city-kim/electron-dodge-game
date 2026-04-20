# Electron Dodge Game

Electron + Next.js + Phaser 3 조합으로 만든 탄막 회피 게임.

화면을 가로지르는 무기들을 피하면서 최대한 오래 살아남으면 된다.
시간이 지날수록 빨라지니까 긴장 풀면 바로 죽음.

정적웹 배포버전

https://city-kim.github.io/electron-dodge-game/

## 게임 규칙

- 방향키 또는 WASD로 캐릭터를 이동
- 사방에서 날아오는 지뢰, 검, 도끼를 피해 생존
- 알(Egg)을 먹으면 이동 속도 +1 (먹을수록 빨라짐)
- 10초마다 장애물 속도가 15%씩 증가
- 장애물에 닿으면 게임 오버

## 스택

- **Electron** — 데스크탑 앱 쉘
- **Next.js** (App Router) — UI 렌더링
- **Phaser 3** — 게임 엔진 (Arcade Physics)
- **Tailwind CSS** — 스타일링
- **TypeScript**

## 실행

```bash
pnpm install
pnpm dev
```

## 빌드

```bash
# macOS
pnpm dist:mac

# Windows
pnpm dist:win

# 둘 다
pnpm dist:all
```

빌드 결과물은 `release/` 폴더에 생성된다.

## 프로젝트 구조

```
app/
├── config/game-config.ts   # 게임 설정값 (화면 크기, 속도, 히트박스 등)
├── game/
│   ├── game-scene.ts      # 메인 게임 씬 (상태 관리, UI, 게임 루프)
│   ├── particle.ts        # 장애물 매니저 (지뢰/검/도끼 스폰 및 이동)
│   └── player.ts          # 플레이어 매니저 (입력, 이동, 애니메이션)
├── types/game.ts          # 타입 정의
├── luncher.tsx            # Phaser 게임 인스턴스 생성 및 React 연동
├── client.tsx
├── page.tsx
└── layout.tsx
main.js                    # Electron 메인 프로세스
preload.js                 # Electron preload
public/                    # 스프라이트, 장애물 이미지, 알 이미지
```

dev 모드 실행시

```
throw new Error('Electron failed to install correctly, please delete node_modules/electron and try installing again');
```

위와같은 오류가 발생한다면

```
node node_modules/electron/install.js
```

이 명령어를 실행하면 해결됨

https://github.com/electron/electron/issues/20731

TODO: mac은 빌드 후 실행이 잘 되는데 window는 안되는문제점 해결해야함
