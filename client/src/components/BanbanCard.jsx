import React, { useEffect, useState } from 'react';

const today = new Date().toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });

const IMAGE_MAP = {
  parliament: 'https://images.unsplash.com/photo-1529107386315-e147a4497e39?w=1200&h=500&fit=crop&auto=format',
  protest:    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&h=500&fit=crop&auto=format',
  economy:    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&h=500&fit=crop&auto=format',
  court:      'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=1200&h=500&fit=crop&auto=format',
  election:   'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=1200&h=500&fit=crop&auto=format',
  hospital:   'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=500&fit=crop&auto=format',
  labor:      'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=1200&h=500&fit=crop&auto=format',
  education:  'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1200&h=500&fit=crop&auto=format',
};
const FALLBACKS = Object.values(IMAGE_MAP);
function getImageUrl(keyword, idx) {
  return IMAGE_MAP[(keyword || '').toLowerCase()] || FALLBACKS[(idx || 0) % FALLBACKS.length];
}

/* ─────────────────────────────────────────────
   상세 모달 — 반반 좌우 분할 레이아웃
───────────────────────────────────────────── */
function DetailModal({ topic, imageKeyword, issueIndex, onClose }) {
  const [data, setData]     = useState(null);
  const [status, setStatus] = useState('분석 중…');
  const [done, setDone]     = useState(false);
  const [error, setError]   = useState(null);
  const imgUrl = getImageUrl(imageKeyword, issueIndex);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic }),
        });
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let buf = '';
        while (true) {
          const { value, done: sd } = await reader.read();
          if (sd || cancelled) break;
          buf += dec.decode(value, { stream: true });
          const lines = buf.split('\n');
          buf = lines.pop();
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            try {
              const ev = JSON.parse(line.slice(5).trim());
              if (ev.type === 'status') setStatus(ev.message);
              if (ev.type === 'done')   { setData(ev.data); setDone(true); }
              if (ev.type === 'error')  setError(ev.message);
            } catch {}
          }
        }
      } catch (e) { if (!cancelled) setError(e.message); }
    })();
    return () => { cancelled = true; };
  }, [topic]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto"
         style={{ background: 'rgba(10,20,50,0.6)', backdropFilter: 'blur(6px)' }}
         onClick={onClose}>
      <div className="min-h-screen flex items-start justify-center py-6 px-3">
        <div className="w-full max-w-4xl bg-[#F1F2F4] rounded-[24px] overflow-hidden shadow-2xl"
             onClick={e => e.stopPropagation()}>

          {/* ── 히어로 이미지 ── */}
          <div className="relative h-56 overflow-hidden">
            <img src={imgUrl} alt={topic} className="w-full h-full object-cover" />
            {/* 좌우 그라데이션 오버레이 */}
            <div className="absolute inset-0"
                 style={{ background: 'linear-gradient(90deg, rgba(59,110,246,0.55) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0.25) 60%, rgba(217,76,76,0.55) 100%)' }} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

            {/* 뒤로가기 */}
            <button onClick={onClose}
                    className="absolute top-4 left-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center backdrop-blur-sm transition-colors text-sm font-medium">
              ←
            </button>

            {/* 반반 뱃지 */}
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/30">
              <span className="text-white text-xs font-bold">반반 분석</span>
            </div>

            {/* 이슈 제목 */}
            <div className="absolute bottom-0 left-0 right-0 px-6 pb-5">
              <h2 className="text-white text-2xl font-extrabold drop-shadow-lg">{topic}</h2>
            </div>

            {/* 좌우 진영 레이블 (이미지 위) */}
            <div className="absolute bottom-0 left-0 right-0 flex">
              <div className="flex-1 flex items-end pb-5 pl-6">
                <span className="text-[11px] text-blue-200 font-bold tracking-wider">← 진보</span>
              </div>
              <div className="flex-1 flex items-end justify-end pb-5 pr-6">
                <span className="text-[11px] text-red-200 font-bold tracking-wider">보수 →</span>
              </div>
            </div>
          </div>

          {/* ── 콘텐츠 ── */}
          <div className="p-5 flex flex-col gap-4">

            {/* 로딩 */}
            {!done && !error && (
              <div className="bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,.04)] flex flex-col items-center gap-5 py-14 px-8">
                <div className="relative w-14 h-14">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-100" />
                  <div className="absolute inset-0 rounded-full border-4 border-[#3B6EF6] border-t-transparent animate-spin" />
                  <div className="absolute inset-2 rounded-full border-4 border-[#D94C4C] border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-[#1A1A1A]">{status}</p>
                  <p className="text-xs text-[#8A8F99] mt-1">진보·중도·보수 시각을 비교 분석 중…</p>
                </div>
                {/* 스켈레톤 — 반반 미리보기 */}
                <div className="w-full grid grid-cols-2 gap-3">
                  {[0,1].map(col => (
                    <div key={col} className={`rounded-[16px] p-4 space-y-2 ${col===0?'bg-[#EAF1FF]':'bg-[#FFF0F0]'}`}>
                      <div className={`h-3 w-16 rounded-full animate-pulse ${col===0?'bg-blue-200':'bg-red-200'}`}/>
                      {[100,80,90,70].map((w,i)=>(
                        <div key={i} className={`h-2.5 rounded-full animate-pulse ${col===0?'bg-blue-100':'bg-red-100'}`}
                             style={{width:`${w}%`,animationDelay:`${i*0.1}s`}}/>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,.04)] p-5">
                <p className="text-[#D94C4C] text-sm">오류: {error}</p>
              </div>
            )}

            {done && data && (
              <>
                {/* 중립 요약 + 배경 */}
                <div className="bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,.04)] px-5 py-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#8A8F99] tracking-wide uppercase">중립 요약</span>
                  </div>
                  <p className="text-sm text-[#1A1A1A] leading-relaxed font-medium">{data.gist}</p>
                  {data.context && (
                    <p className="text-xs text-[#8A8F99] leading-relaxed border-t border-gray-100 pt-2 mt-1">{data.context}</p>
                  )}
                </div>

                {/* 여론 온도계 */}
                {data.sentiment && (
                  <div className="bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,.04)] px-5 py-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-[#1A1A1A]">여론 온도계</span>
                      <span className="text-[10px] text-[#8A8F99] bg-[#F1F2F4] rounded-full px-2.5 py-1">AI 추정 · 데모용</span>
                    </div>
                    <div className="flex rounded-full overflow-hidden h-7 shadow-inner">
                      <div className="flex items-center justify-center text-white text-xs font-bold"
                           style={{ width:`${data.sentiment.left}%`, background:'linear-gradient(90deg,#2549C8,#3B6EF6)' }}>
                        진보 {data.sentiment.left}%
                      </div>
                      <div className="flex items-center justify-center text-white text-xs font-bold"
                           style={{ width:`${data.sentiment.center}%`, background:'#8A8F99' }}>
                        {data.sentiment.center}%
                      </div>
                      <div className="flex items-center justify-center text-white text-xs font-bold"
                           style={{ width:`${data.sentiment.right}%`, background:'linear-gradient(90deg,#D94C4C,#B83232)' }}>
                        보수 {data.sentiment.right}%
                      </div>
                    </div>
                    <p className="text-[10px] text-[#8A8F99] mt-2">
                      * 실제 서비스에선 다음 뉴스 댓글·카페 반응 실데이터로 대체됩니다.
                    </p>
                  </div>
                )}

                {/* ── 핵심: 진보 vs 보수 좌우 반반 ── */}
                <div className="grid grid-cols-2 gap-3">
                  {/* 진보 패널 */}
                  <SidePanel side={data.left} lean="left" imageKeyword={imageKeyword} issueIndex={issueIndex * 2} />
                  {/* 보수 패널 */}
                  <SidePanel side={data.right} lean="right" imageKeyword={imageKeyword} issueIndex={issueIndex * 2 + 1} />
                </div>

                {/* 중도 */}
                {data.center && (
                  <div className="bg-white rounded-[20px] shadow-[0_2px_10px_rgba(0,0,0,.04)] overflow-hidden">
                    <div className="h-1 bg-[#8A8F99]" />
                    <div className="px-5 py-4 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#8A8F99]" />
                        <span className="text-xs font-extrabold text-[#5C6370] tracking-wide">중도 · 사실 위주</span>
                      </div>
                      <p className="text-sm text-[#1A1A1A] leading-relaxed">{data.center.frame}</p>
                      {data.center.facts?.length > 0 && (
                        <ul className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {data.center.facts.map((fact, i) => (
                            <li key={i} className="bg-[#F4F5F7] rounded-[12px] px-3 py-2 text-xs text-[#1A1A1A] flex items-start gap-2">
                              <span className="text-[#8A8F99] font-bold flex-shrink-0">{i+1}</span>
                              {fact}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}

                {/* 블라인드스팟 */}
                {data.blindspot && (
                  <div className="bg-[#EAF1FF] rounded-[20px] shadow-[0_2px_10px_rgba(59,110,246,.08)] px-5 py-4 flex items-start gap-3 border border-[#C2D5FF]">
                    <div>
                      <p className="text-xs font-extrabold text-[#3B6EF6] mb-1.5 tracking-wide">블라인드스팟 — 양쪽 모두 잘 안 다루는 지점</p>
                      <p className="text-sm text-[#1A1A1A] leading-relaxed">{data.blindspot}</p>
                    </div>
                  </div>
                )}

                {/* 고지 */}
                <p className="text-center text-[11px] text-[#8A8F99] pb-2">
                  성향 분류는 단정이 아니라 일반적 경향이며, 판단은 당신의 몫입니다.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── 진보/보수 각 패널 컴포넌트 ── */
function SidePanel({ side, lean, imageKeyword, issueIndex }) {
  const isLeft = lean === 'left';
  const color  = isLeft ? '#3B6EF6' : '#D94C4C';
  const gradBg = isLeft
    ? 'linear-gradient(160deg,#EAF1FF 0%,#F5F8FF 100%)'
    : 'linear-gradient(160deg,#FFF0F0 0%,#FFF8F8 100%)';
  const tagBg  = isLeft ? '#3B6EF6' : '#D94C4C';
  const imgUrl = getImageUrl(imageKeyword, issueIndex ?? (isLeft ? 0 : 1));

  if (!side) return null;

  return (
    <div className="flex flex-col gap-2.5">
      {/* 메인 분석 카드 */}
      <div className="rounded-[20px] overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,.06)]"
           style={{ background: gradBg }}>
        {/* 패널 이미지 */}
        <div className="relative h-28 overflow-hidden">
          <img src={imgUrl} alt={side.label} className="w-full h-full object-cover" />
          <div className="absolute inset-0"
               style={{ background: isLeft
                 ? 'linear-gradient(180deg,rgba(59,110,246,0.45) 0%,rgba(0,0,0,0.55) 100%)'
                 : 'linear-gradient(180deg,rgba(217,76,76,0.45) 0%,rgba(0,0,0,0.55) 100%)' }} />
          {/* 라벨 태그 */}
          <span className="absolute top-2.5 left-2.5 text-[11px] font-extrabold text-white rounded-full px-2.5 py-0.5"
                style={{ background: tagBg }}>
            {side.label || (isLeft ? '진보 성향' : '보수 성향')}
          </span>
          {/* 헤드라인 — 이미지 위 한 줄 */}
          <p className="absolute bottom-0 left-0 right-0 px-3 pb-2.5 text-[11px] font-bold text-white leading-snug line-clamp-2 drop-shadow">
            "{side.headline || ''}"
          </p>
        </div>

        <div className="p-4 flex flex-col gap-3">

          {/* 프레이밍 */}
          {side.frame && (
            <p className="text-xs text-[#1A1A1A] leading-relaxed border-l-[3px] pl-3"
               style={{ borderColor: color }}>
              {side.frame}
            </p>
          )}

          {/* 강조점 */}
          {side.points?.length > 0 && (
            <ul className="flex flex-col gap-2.5">
              {side.points.map((pt, i) => (
                <li key={i} className="flex flex-col gap-0.5">
                  <span className="text-[11px] font-bold flex items-center gap-1.5" style={{ color }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                    {pt.title || pt}
                  </span>
                  {pt.desc && (
                    <p className="text-[11px] text-[#5C6370] leading-snug pl-3">{pt.desc}</p>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* 생략하는 사실 */}
          {side.omits && (
            <div className="rounded-[10px] px-3 py-2 text-[11px] text-[#5C6370] leading-snug"
                 style={{ background: isLeft ? '#EAF1FF' : '#FFF0F0' }}>
              <span className="font-bold" style={{ color }}>생략 경향 </span>
              {side.omits}
            </div>
          )}
        </div>
      </div>

      {/* 근거 기사 */}
      {side.sources?.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="text-[10px] font-bold text-[#8A8F99] px-1">근거 기사</p>
          {side.sources.map((s, i) => (
            <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
               className="flex items-start gap-2 bg-white rounded-[14px] px-3 py-2.5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group border border-transparent hover:border-gray-100">
              <span className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[10px] font-bold flex-shrink-0" style={{ color }}>{s.outlet}</span>
                  {s.date && <span className="text-[10px] text-[#8A8F99]">{s.date}</span>}
                </div>
                <p className="text-[11px] text-[#1A1A1A] leading-snug line-clamp-2 group-hover:text-[#3B6EF6] transition-colors">
                  {s.title}
                </p>
              </div>
              <span className="text-gray-300 text-xs flex-shrink-0 mt-0.5 group-hover:text-[#3B6EF6]">→</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── 이슈 카드 (홈) ── */
function IssueCard({ issue, index, onClick }) {
  return (
    <button onClick={onClick}
            className="w-full text-left bg-white rounded-[16px] shadow-[0_2px_10px_rgba(0,0,0,.06)] overflow-hidden hover:shadow-[0_8px_24px_rgba(59,110,246,.14)] hover:-translate-y-0.5 transition-all group">
      <div className="relative h-36 overflow-hidden bg-gray-100">
        <img src={getImageUrl(issue.imageKeyword, index)} alt={issue.title}
             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
             onError={e => { e.target.style.display='none'; }} />
        <div className="absolute inset-0"
             style={{ background:'linear-gradient(90deg,rgba(59,110,246,.45) 0%,transparent 35%,transparent 65%,rgba(217,76,76,.45) 100%)' }} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <span className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-[#3B6EF6] text-white text-[11px] font-bold flex items-center justify-center shadow">
          {index + 1}
        </span>
        <p className="absolute bottom-2.5 left-3 right-3 text-white text-sm font-bold drop-shadow leading-snug">
          {issue.title}
        </p>
      </div>

      {/* 진보/보수 힌트 */}
      <div className="flex divide-x divide-gray-100">
        <div className="flex-1 px-3 py-2.5">
          <div className="flex items-center gap-1 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B6EF6]" />
            <span className="text-[10px] font-bold text-[#3B6EF6]">진보</span>
          </div>
          <p className="text-[11px] text-[#1A1A1A] leading-snug line-clamp-2">{issue.leftHint || '—'}</p>
        </div>
        <div className="flex-1 px-3 py-2.5">
          <div className="flex items-center gap-1 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D94C4C]" />
            <span className="text-[10px] font-bold text-[#D94C4C]">보수</span>
          </div>
          <p className="text-[11px] text-[#1A1A1A] leading-snug line-clamp-2">{issue.rightHint || '—'}</p>
        </div>
      </div>

      <div className="px-3 pb-3 pt-1.5 flex items-center justify-between border-t border-gray-50">
        <p className="text-[11px] text-[#8A8F99] line-clamp-1 flex-1">{issue.gist}</p>
        <span className="text-[10px] text-[#3B6EF6] font-semibold ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          전체 분석 →
        </span>
      </div>
    </button>
  );
}

/* ── 메인 반반 카드 ── */
export default function BanbanCard() {
  const [issues, setIssues]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [selected, setSelected] = useState(null);

  const fetchIssues = (force = false) => {
    setLoading(true);
    setError(null);
    fetch(`/api/issues${force ? '?refresh=1' : ''}`)
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
            <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#3B6EF6] to-[#7C4EF6] flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-black">半</span>
            </div>
            <div>
              <h2 className="font-extrabold text-[15px] leading-tight text-[#1A1A1A]">
                반반 <span className="text-[#3B6EF6]">半半</span>
              </h2>
              <p className="text-[11px] text-[#8A8F99]">양쪽 다 듣는 뉴스 · 오늘의 쟁점</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#8A8F99] hidden sm:block">{today}</span>
            <button onClick={() => fetchIssues(true)}
                    className="w-8 h-8 rounded-full bg-[#EAF1FF] text-[#3B6EF6] text-sm hover:bg-[#3B6EF6] hover:text-white transition-colors flex items-center justify-center"
                    title="새로고침">↻</button>
          </div>
        </div>

        {/* 컬럼 레이블 */}
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#3B6EF6]" />
          <span className="text-[11px] font-bold text-[#3B6EF6]">진보 시선</span>
          <span className="text-[#D0D3D9] text-xs mx-1">vs</span>
          <span className="w-2 h-2 rounded-full bg-[#D94C4C]" />
          <span className="text-[11px] font-bold text-[#D94C4C]">보수 시선</span>
          <span className="ml-auto text-[10px] text-[#D0D3D9]">클릭하면 전체 분석 →</span>
        </div>

        {/* 이슈 그리드 */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-44 bg-[#F1F2F4] rounded-[16px] animate-pulse" />
            ))}
          </div>
        )}
        {error && (
          <p className="text-[#D94C4C] text-sm bg-[#FFF0F0] rounded-[12px] p-3">오류: {error}</p>
        )}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {issues.map((issue, i) => (
              <IssueCard key={i} issue={issue} index={i}
                         onClick={() => setSelected({ title: issue.title, imageKeyword: issue.imageKeyword, index: i })} />
            ))}
          </div>
        )}
      </div>

      {selected && (
        <DetailModal
          topic={selected.title}
          imageKeyword={selected.imageKeyword}
          issueIndex={selected.index}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
