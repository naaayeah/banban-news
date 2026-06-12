import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = 'claude-haiku-4-5-20251001';

const analyzeCache = new Map();
const ANALYZE_TTL = 30 * 60 * 1000;

function safeParseJSON(text) {
  const cleaned = text.replace(/```[a-z]*\n?/g, '').replace(/```/g, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('JSON 없음');
  return JSON.parse(cleaned.slice(start, end + 1));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { topic } = req.body || {};
  if (!topic) return res.status(400).json({ error: 'topic 필요' });

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  const send = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`);

  // 캐시 히트
  const cached = analyzeCache.get(topic);
  if (cached && Date.now() - cached.at < ANALYZE_TTL) {
    send({ type: 'status', message: '캐시에서 불러오는 중…' });
    send({ type: 'done', data: cached.data });
    return res.end();
  }

  try {
    send({ type: 'status', message: '분석 중…' });

    let fullText = '';
    const stream = await client.messages.stream({
      model: MODEL,
      max_tokens: 2500,
      messages: [{
        role: 'user',
        content: `한국 뉴스 양면 비교. 이슈: "${topic}". JSON만 출력. 코드펜스/인사 금지. 한국어.
{"gist":"중립 요약 1문장","context":"배경 1문장","left":{"label":"진보 성향","headline":"진보 헤드라인 1문장","frame":"진보 프레이밍 1문장","points":[{"title":"강조점","desc":"설명 1문장"},{"title":"강조점","desc":"설명 1문장"}],"omits":"진보가 생략하는 사실 1문장","sources":[{"outlet":"언론사","title":"기사제목","url":"https://example.com","date":"2026.06"},{"outlet":"언론사","title":"기사제목","url":"https://example.com","date":"2026.06"},{"outlet":"언론사","title":"기사제목","url":"https://example.com","date":"2026.06"}]},"right":{"label":"보수 성향","headline":"보수 헤드라인 1문장","frame":"보수 프레이밍 1문장","points":[{"title":"강조점","desc":"설명 1문장"},{"title":"강조점","desc":"설명 1문장"}],"omits":"보수가 생략하는 사실 1문장","sources":[{"outlet":"언론사","title":"기사제목","url":"https://example.com","date":"2026.06"},{"outlet":"언론사","title":"기사제목","url":"https://example.com","date":"2026.06"},{"outlet":"언론사","title":"기사제목","url":"https://example.com","date":"2026.06"}]},"center":{"label":"중도·사실 위주","frame":"균형 시각 1문장","facts":["사실1","사실2","사실3"]},"sentiment":{"left":42,"center":23,"right":35},"blindspot":"양쪽 모두 안 다루는 지점 1문장"}`,
      }],
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta?.type === 'text_delta') {
        fullText += chunk.delta.text;
      }
    }

    try {
      const parsed = safeParseJSON(fullText);
      analyzeCache.set(topic, { data: parsed, at: Date.now() });
      send({ type: 'done', data: parsed });
    } catch {
      send({ type: 'error', message: 'JSON 파싱 실패' });
    }
  } catch (e) {
    console.error('[/api/analyze]', e.message);
    send({ type: 'error', message: e.message });
  } finally {
    res.end();
  }
}
