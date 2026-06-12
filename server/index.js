import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-haiku-4-5-20251001';

let issuesCache = null;
let issuesCachedAt = 0;
const CACHE_TTL = 10 * 60 * 1000;

const FALLBACK_ISSUES = {
  issues: [
    { title: '윤석열 내란 재판', gist: '12·3 비상계엄 선포로 인한 내란 혐의 재판 진행 중', leftHint: '내란 단죄, 민주주의 수호', rightHint: '정치 보복, 사법 독립 훼손', imageKeyword: 'court' },
    { title: '차별금지법 제정', gist: '성적 지향 등을 포함한 포괄적 차별금지법 제정 논의', leftHint: '보편적 인권 보호 입법 시급', rightHint: '종교·표현의 자유 침해 우려', imageKeyword: 'parliament' },
    { title: '정년 65세 연장', gist: '법정 정년을 현행 60세에서 65세로 연장하는 방안 논의', leftHint: '고령 노동권 보호, 연장 필요', rightHint: '청년 일자리 잠식, 역효과', imageKeyword: 'labor' },
    { title: '의대 정원 확대', gist: '정부의 의대 정원 증원 방침에 의료계가 반발 중', leftHint: '의료 공백 해소, 확대 지지', rightHint: '의료 질 하락, 철회 요구', imageKeyword: 'hospital' },
  ],
};

function safeParseJSON(text) {
  const cleaned = text.replace(/```[a-z]*\n?/g, '').replace(/```/g, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('JSON 없음');
  return JSON.parse(cleaned.slice(start, end + 1));
}

app.get('/api/issues', async (req, res) => {
  const forceRefresh = req.query.refresh === '1';
  if (!forceRefresh && issuesCache && Date.now() - issuesCachedAt < CACHE_TTL) {
    return res.json(issuesCache);
  }
  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 900,
      messages: [{
        role: 'user',
        content: `한국에서 현재 여론이 크게 갈리는 정치·사회 쟁점 4개를 JSON으로만 출력해줘. 코드펜스 없이. 한국어.
{"issues":[{"title":"10자이내","gist":"30자이내중립설명","leftHint":"진보시각15자이내","rightHint":"보수시각15자이내","imageKeyword":"parliament|protest|economy|court|election|hospital|labor|education 중 하나"}]}
정확히 4개.`,
      }],
    });
    const text = response.content.filter(b => b.type === 'text').map(b => b.text).join('');
    const data = safeParseJSON(text);
    issuesCache = data;
    issuesCachedAt = Date.now();
    res.json(data);
  } catch (e) {
    console.error('[/api/issues]', e.message);
    res.json(issuesCache || FALLBACK_ISSUES);
  }
});

app.post('/api/analyze', async (req, res) => {
  const { topic } = req.body || {};
  if (!topic) return res.status(400).json({ error: 'topic 필요' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  try {
    send({ type: 'status', message: '분석 중…' });

    let fullText = '';
    const stream = await client.messages.stream({
      model: MODEL,
      max_tokens: 4000,
      messages: [{
        role: 'user',
        content: `당신은 한국 뉴스 양면 비교 분석 도구입니다. 이슈: "${topic}"
진보(민주당계)와 보수(국민의힘계)가 이 이슈를 어떻게 다르게 프레이밍하는지 상세히 분석하세요.
- 어느 쪽도 옹호 금지. 각 진영이 무엇을 강조하고 무엇을 생략하는지 분석.
- 사실과 해석을 명확히 구분.
- 성향 분류는 단정이 아닌 일반적 경향.

아래 JSON만 출력. 코드펜스/인사 절대 금지. 한국어.
{
  "gist": "이 사안이 무엇인지 중립적으로 2문장",
  "context": "이 이슈의 역사적·제도적 배경 1~2문장",
  "left": {
    "label": "진보 성향",
    "headline": "진보 진영의 핵심 주장 한 문장 (신문 헤드라인 스타일)",
    "frame": "진보 진영이 이 이슈를 바라보는 전체적 프레이밍 2문장",
    "points": [
      {"title": "강조점 제목", "desc": "구체적 설명 1~2문장"},
      {"title": "강조점 제목", "desc": "구체적 설명 1~2문장"},
      {"title": "강조점 제목", "desc": "구체적 설명 1~2문장"}
    ],
    "omits": "진보 진영이 잘 언급하지 않는 불편한 사실 1문장",
    "sources": [
      {"outlet": "언론사명", "title": "실제 기사 제목 스타일", "url": "https://example.com", "date": "2026.06"},
      {"outlet": "언론사명", "title": "실제 기사 제목 스타일", "url": "https://example.com", "date": "2026.06"},
      {"outlet": "언론사명", "title": "실제 기사 제목 스타일", "url": "https://example.com", "date": "2026.06"}
    ]
  },
  "right": {
    "label": "보수 성향",
    "headline": "보수 진영의 핵심 주장 한 문장 (신문 헤드라인 스타일)",
    "frame": "보수 진영이 이 이슈를 바라보는 전체적 프레이밍 2문장",
    "points": [
      {"title": "강조점 제목", "desc": "구체적 설명 1~2문장"},
      {"title": "강조점 제목", "desc": "구체적 설명 1~2문장"},
      {"title": "강조점 제목", "desc": "구체적 설명 1~2문장"}
    ],
    "omits": "보수 진영이 잘 언급하지 않는 불편한 사실 1문장",
    "sources": [
      {"outlet": "언론사명", "title": "실제 기사 제목 스타일", "url": "https://example.com", "date": "2026.06"},
      {"outlet": "언론사명", "title": "실제 기사 제목 스타일", "url": "https://example.com", "date": "2026.06"},
      {"outlet": "언론사명", "title": "실제 기사 제목 스타일", "url": "https://example.com", "date": "2026.06"}
    ]
  },
  "center": {
    "label": "중도·사실 위주",
    "frame": "사실에 기반한 균형 시각 2문장",
    "facts": ["핵심 사실 1", "핵심 사실 2", "핵심 사실 3"]
  },
  "sentiment": {"left": 42, "center": 23, "right": 35},
  "blindspot": "양쪽 진영 모두 잘 다루지 않는 핵심 지점 2문장"
}`,
      }],
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta') {
        fullText += chunk.delta.text;
        send({ type: 'delta', text: chunk.delta.text });
      }
    }

    try {
      send({ type: 'done', data: safeParseJSON(fullText) });
    } catch {
      send({ type: 'error', message: 'JSON 파싱 실패' });
    }
  } catch (e) {
    console.error('[/api/analyze]', e.message);
    send({ type: 'error', message: e.message });
  } finally {
    res.end();
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`반반 서버 (${MODEL}) 실행 중: http://localhost:${PORT}`));
