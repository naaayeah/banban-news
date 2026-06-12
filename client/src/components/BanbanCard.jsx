import React, { useEffect, useState } from 'react';

const today = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });

// Unsplash 무료 이미지 (keyword 기반 seed)
function issueImageUrl(keyword, index) {
  const seeds = ['parliament', 'protest', 'economy', 'court', 'election', 'hospital', 'city', 'flag'];
  const seed = keyword || seeds[index % seeds.length];
  return `https://images.unsplash.com/photo-${unsplashIds[index % unsplashIds.length]}?w=400&h=220&fit=crop&auto=format`;
}

const unsplashIds = [
  '1529107386315-e147a4497e39', // 국회/정치
  '1504711434969-e33886168f5c', // 시위/집회
  '1611974789855-9c2a0a7236a3', // 경제/주식
  '1589829085413-56de8ae18c73', // 법원/사법
];

function getImageUrl(keyword, idx) {
  const map = {
    parliament: 'https://images.unsplash.com/photo-1529107386315-e147a4497e39?w=400&h=220&fit=crop&auto=format',
    protest:    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=220&fit=crop&auto=format',
    economy:    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=220&fit=crop&auto=format',
    court:      'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400&h=220&fit=crop&auto=format',
    election:   'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=400&h=220&fit=crop&auto=format',
    hospital:   'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=220&fit=crop&auto=format',
    labor:      'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=400&h=220&fit=crop&auto=format',
    education:  'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400&h=220&fit=crop&auto=format',
  };
  const kw = (keyword || '').toLowerCase();
  return map[kw] || `https://images.unsplash.com/photo-${unsplashIds[idx % unsplashIds.length]}?w=400&h=220&fit=crop&auto=format`;
}

/* ── 상세 모달 ── */
function DetailModal({ topic, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic }),
    })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [topic]);

  const leanColor = { left: '#3B6EF6', center: '#8A8F99', right: '#D94C4C' };
  const leanBg   = { left: '#EAF1FF',  center: '#F5F5F5',  right: '#FFF0F0' };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8 px-4"
         onClick={onClose}>
      <div className="bg-white rounded-[20px] w-full max-w-2xl shadow-2xl"
           onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2 p-5 border-b border-gray-100">
          <button onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 text-sm mr-1">
            ←
          </button>
          <span className="text-lg">⚖️</span>
          <h2 className="font-bold text-base flex-1">{topic}</h2>
        </div>

        <div className="p-5 flex flex-col gap-5">
          {loading && (
            <div className="flex flex-col items-center gap-3 py-14">
              <div className="w-9 h-9 border-4 border-[#3B6EF6] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-400">양쪽 시선을 분석하는 중…</p>
            </div>
          )}
          {error && <p className="text-red-500 text-sm bg-red-50 rounded-xl p-3">오류: {error}</p>}

          {data && !loading && (
            <>
              {/* Gist */}
              <div className="bg-[#EAF1FF] rounded-xl px-4 py-3 text-sm font-medium text-[#3B6EF6]">
                📌 {data.gist}
              </div>

              {/* Sentiment bar */}
              {data.sentiment && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-gray-700">여론 온도계</span>
                    <span className="text-[10px] text-gray-400 bg-gray-100 rounded px-2 py-0.5">AI 추정 · 데모용</span>
                  </div>
                  <div className="flex h-5 rounded-full overflow-hidden">
                    <div style={{ width: `${data.sentiment.left}%`,   background: '#3B6EF6' }} />
                    <div style={{ width: `${data.sentiment.center}%`, background: '#8A8F99' }} />
                    <div style={{ width: `${data.sentiment.right}%`,  background: '#D94C4C' }} />
                  </div>
                  <div className="flex text-[11px] mt-1.5 gap-4">
                    <span className="text-[#3B6EF6] font-medium">진보 {data.sentiment.left}%</span>
                    <span className="text-[#8A8F99]">중도 {data.sentiment.center}%</span>
                    <span className="text-[#D94C4C] font-medium">보수 {data.sentiment.right}%</span>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5">
                    * 실제 서비스에선 다음 뉴스 댓글·카페 반응 실데이터로 대체됩니다.
                  </p>
                </div>
              )}

              {/* Sides */}
              {data.sides && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {data.sides.map(side => (
                    <div key={side.lean}
                         className="rounded-xl p-4 border-l-4 flex flex-col gap-2"
                         style={{ borderColor: leanColor[side.lean], background: leanBg[side.lean] }}>
                      <span className="text-xs font-bold" style={{ color: leanColor[side.lean] }}>
                        {side.label}
                      </span>
                      <p className="text-xs font-semibold text-gray-800 leading-snug">"{side.frame}"</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {side.points.map((pt, i) => <li key={i}>· {pt}</li>)}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* Blindspot */}
              {data.blindspot && (
                <div className="bg-[#EAF1FF] border border-[#3B6EF6]/20 rounded-xl px-4 py-3 text-sm">
                  <span className="font-bold text-[#3B6EF6]">🔍 블라인드스팟 </span>
                  {data.blindspot}
                </div>
              )}

              {/* Sources */}
              {data.sources?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-2">근거 기사</p>
                  <div className="flex flex-col gap-2">
                    {data.sources.map((s, i) => (
                      <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                         className="flex items-start gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        <span className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                              style={{ background: leanColor[s.lean] || '#8A8F99' }} />
                        <div>
                          <span className="text-[10px] text-gray-400">{s.outlet} </span>
                          <span className="text-xs text-gray-700">{s.title}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <p className="text-[11px] text-gray-400 text-center border-t border-gray-100 pt-4">
                성향 분류는 단정이 아니라 일반적 경향이며, 판단은 당신의 몫입니다.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── 이슈 카드 (홈 노출용) ── */
function IssueCard({ issue, index, onClick }) {
  const imgUrl = getImageUrl(issue.imageKeyword, index);

  return (
    <button onClick={onClick}
            className="w-full text-left bg-white rounded-[16px] shadow-[0_2px_10px_rgba(0,0,0,.06)] overflow-hidden hover:shadow-[0_6px_20px_rgba(59,110,246,.15)] hover:-translate-y-0.5 transition-all group">
      {/* 썸네일 이미지 */}
      <div className="relative h-36 overflow-hidden bg-gray-100">
        <img src={imgUrl} alt={issue.title}
             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
             onError={e => { e.target.style.display = 'none'; }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        {/* 이슈 번호 뱃지 */}
        <span className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-[#3B6EF6] text-white text-[11px] font-bold flex items-center justify-center shadow">
          {index + 1}
        </span>
        {/* 이슈 제목 오버레이 */}
        <p className="absolute bottom-2.5 left-3 right-3 text-white text-sm font-bold drop-shadow leading-snug">
          {issue.title}
        </p>
      </div>

      {/* 두 진영 헤드라인 비교 */}
      <div className="flex divide-x divide-gray-100">
        {/* 진보 */}
        <div className="flex-1 px-3 py-2.5 flex flex-col gap-1">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-[#3B6EF6] flex-shrink-0" />
            <span className="text-[10px] font-bold text-[#3B6EF6]">진보</span>
          </div>
          <p className="text-[11px] text-gray-700 leading-snug line-clamp-2">
            {issue.leftHint || '분석 중…'}
          </p>
        </div>
        {/* 보수 */}
        <div className="flex-1 px-3 py-2.5 flex flex-col gap-1">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-[#D94C4C] flex-shrink-0" />
            <span className="text-[10px] font-bold text-[#D94C4C]">보수</span>
          </div>
          <p className="text-[11px] text-gray-700 leading-snug line-clamp-2">
            {issue.rightHint || '분석 중…'}
          </p>
        </div>
      </div>

      {/* 한 줄 설명 + 더보기 */}
      <div className="px-3 pb-3 pt-1 flex items-center justify-between">
        <p className="text-[11px] text-gray-400 line-clamp-1 flex-1">{issue.gist}</p>
        <span className="text-[10px] text-[#3B6EF6] font-semibold ml-2 flex-shrink-0 group-hover:underline">
          전체 분석 →
        </span>
      </div>
    </button>
  );
}

/* ── 메인 반반 카드 ── */
export default function BanbanCard() {
  const [issues, setIssues]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [selected, setSelected] = useState(null);

  const fetchIssues = () => {
    setLoading(true);
    setError(null);
    fetch('/api/issues')
      .then(r => r.json())
      .then(d => { setIssues(d.issues || []); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  };

  useEffect(() => { fetchIssues(); }, []);

  return (
    <>
      <div className="bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,.04)] p-5 flex flex-col gap-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#3B6EF6] to-[#7C4EF6] flex items-center justify-center text-lg shadow-sm">
              ⚖️
            </div>
            <div>
              <h2 className="font-extrabold text-base leading-tight">반반 <span className="text-[#3B6EF6]">半半</span></h2>
              <p className="text-[11px] text-gray-400">양쪽 다 듣는 뉴스 · 오늘의 쟁점</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-gray-400 hidden sm:block">{today}</span>
            <button onClick={fetchIssues}
                    className="w-8 h-8 flex items-center justify-center rounded-full bg-[#EAF1FF] text-[#3B6EF6] text-sm hover:bg-[#3B6EF6] hover:text-white transition-colors"
                    title="새로고침">
              ↻
            </button>
          </div>
        </div>

        {/* 컬럼 레이블 */}
        <div className="flex items-center gap-2 px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3B6EF6]" />
            <span className="text-[11px] font-bold text-[#3B6EF6]">진보 시선</span>
          </div>
          <span className="text-gray-200 text-xs">vs</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D94C4C]" />
            <span className="text-[11px] font-bold text-[#D94C4C]">보수 시선</span>
          </div>
          <span className="ml-auto text-[10px] text-gray-300">클릭하면 전체 분석 →</span>
        </div>

        {/* 이슈 그리드 */}
        {loading && (
          <div className="flex flex-col items-center gap-3 py-10">
            <div className="w-8 h-8 border-[3px] border-[#3B6EF6] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-400">오늘의 쟁점을 검색하는 중…</p>
          </div>
        )}
        {error && (
          <p className="text-red-500 text-sm bg-red-50 rounded-xl p-3">오류: {error}</p>
        )}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {issues.map((issue, i) => (
              <IssueCard key={i} issue={issue} index={i} onClick={() => setSelected(issue.title)} />
            ))}
          </div>
        )}
      </div>

      {selected && <DetailModal topic={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
