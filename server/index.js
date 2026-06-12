import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
app.use(cors());
app.use(express.json());

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function safeParseJSON(text) {
  const cleaned = text.replace(/```[a-z]*\n?/g, '').replace(/```/g, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('응답에서 JSON을 찾지 못했습니다');
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function callClaude(prompt) {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    messages: [{ role: 'user', content: prompt }],
  });
  const text = response.content.filter(b => b.type === 'text').map(b => b.text).join('');
  if (!text) throw new Error('LLM이 텍스트 응답을 반환하지 않았습니다');
  return safeParseJSON(text);
}

app.get('/api/issues', async (req, res) => {
  try {
    const data = await callClaude(
      `오늘 한국에서 여론이 가장 크게 갈리는 정치·사회 쟁점 4개를 웹 검색으로 찾아줘. 진영 간 의견 차가 뚜렷한 것 위주로.
아래 JSON만 출력. 코드펜스/설명 금지. 한국어. 간결하게.
{
  "issues": [
    {
      "title": "짧은 쟁점명(12자 이내)",
      "gist": "한 줄 중립 설명",
      "leftHint": "진보 진영이 이 이슈를 보는 시각 한 문장(신문 헤드라인 스타일, 15자 이내)",
      "rightHint": "보수 진영이 이 이슈를 보는 시각 한 문장(신문 헤드라인 스타일, 15자 이내)",
      "imageKeyword": "이 이슈를 대표하는 영어 단어 1개(Unsplash 검색용, 예: parliament, protest, economy)"
    }
  ]
}
issues는 4개.`
    );
    res.json(data);
  } catch (e) {
    console.error('[/api/issues]', e.message);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/analyze', async (req, res) => {
  const { topic } = req.body || {};
  if (!topic) return res.status(400).json({ error: 'topic 필드가 필요합니다' });
  try {
    const data = await callClaude(
      `당신은 중립적인 '뉴스 양면 비교' 도구입니다. 아래 이슈에 대해 웹 검색으로 최신 한국 언론 보도를 찾아, 진영별로 어떻게 다르게 '프레이밍'하는지 정리하세요.
원칙:
- 어느 쪽도 옹호하지 말 것. "누가 옳다"가 아니라 "각 진영이 무엇을 강조하고 무엇을 생략하는지"를 기술.
- 사실과 해석을 구분.
- 한국 기준: 진보=민주당계, 보수=국민의힘계. 성향 분류는 단정이 아니라 일반적 경향.
- sentiment는 댓글/커뮤니티 여론의 대략적 기울기 추정치(데모용)이며 실측이 아님.
이슈: "${topic}"
아래 JSON만 출력. 코드펜스/설명/인사 금지. 한국어. 매우 간결하게.
{"gist":"이 사안이 무엇인지 중립적으로 한 문장","sides":[{"lean":"left","label":"진보 성향","frame":"한 줄 프레이밍","points":["강조점","강조점"]},{"lean":"center","label":"중도·사실 위주","frame":"한 줄","points":["핵심 사실","핵심 사실"]},{"lean":"right","label":"보수 성향","frame":"한 줄","points":["강조점","강조점"]}],"sentiment":{"left":40,"center":25,"right":35},"blindspot":"한쪽 진영이 거의 다루지 않는 지점 한 문장","sources":[{"outlet":"언론사","lean":"left","title":"기사 제목","url":"https://example.com"}]}
sources는 3개. points는 각 2개 이내. 모든 문장 짧게.`
    );
    res.json(data);
  } catch (e) {
    console.error('[/api/analyze]', e.message);
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`반반 서버 실행 중: http://localhost:${PORT}`));
