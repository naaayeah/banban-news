import Anthropic from '@anthropic-ai/sdk';

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
    { title: '최저임금 인상', gist: '내년 최저임금을 둘러싼 노사 간 입장 차이가 큰 상황', leftHint: '생활임금 보장, 대폭 인상', rightHint: '중소기업 부담, 속도 조절', imageKeyword: 'labor' },
    { title: '수능 절대평가', gist: '수능 전 과목 절대평가 전환 여부를 두고 논란이 지속', leftHint: '경쟁 완화, 공교육 정상화', rightHint: '변별력 상실, 대입 혼란', imageKeyword: 'education' },
  ],
};

function safeParseJSON(text) {
  const cleaned = text.replace(/```[a-z]*\n?/g, '').replace(/```/g, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('JSON 없음');
  return JSON.parse(cleaned.slice(start, end + 1));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const forceRefresh = req.query.refresh === '1';
  if (!forceRefresh && issuesCache && Date.now() - issuesCachedAt < CACHE_TTL) {
    return res.status(200).json(issuesCache);
  }

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 900,
      messages: [{
        role: 'user',
        content: `한국에서 현재 여론이 크게 갈리는 정치·사회 쟁점 6개를 JSON으로만 출력해줘. 코드펜스 없이. 한국어.
{"issues":[{"title":"10자이내","gist":"30자이내중립설명","leftHint":"진보시각15자이내","rightHint":"보수시각15자이내","imageKeyword":"parliament|protest|economy|court|election|hospital|labor|education 중 하나"}]}
정확히 6개. 서로 다른 분야(정치,경제,사회,노동,교육,젠더 등)에서 고루 선택.`,
      }],
    });
    const text = response.content.filter(b => b.type === 'text').map(b => b.text).join('');
    const data = safeParseJSON(text);
    issuesCache = data;
    issuesCachedAt = Date.now();
    return res.status(200).json(data);
  } catch (e) {
    console.error('[/api/issues]', e.message);
    return res.status(200).json(issuesCache || FALLBACK_ISSUES);
  }
}
