# 반반 (半半) — 양쪽 다 듣는 뉴스

다음(Daum) 포털 스타일 UI에 「반반」 양면 뉴스 기능을 탑재한 내부 공모전 데모.

## 실행 방법

### 1. API 키 설정
```bash
cp server/.env.example server/.env
# server/.env 파일 열어서 ANTHROPIC_API_KEY 값 입력
```

### 2. 패키지 설치
```bash
npm run install:all
# 또는
cd server && npm install && cd ../client && npm install
```

### 3. 개발 서버 실행 (동시)
```bash
npm run dev
```
- 프론트엔드: http://localhost:5173
- 백엔드: http://localhost:3001

## API 엔드포인트
- `GET /api/issues` — 오늘 여론이 갈리는 쟁점 4개 반환
- `POST /api/analyze` — `{ topic }` 받아 양면 분석 반환
