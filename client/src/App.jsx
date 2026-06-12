import React from 'react';
import Header from './components/Header.jsx';
import BanbanCard from './components/BanbanCard.jsx';
import Sidebar from './components/Sidebar.jsx';

const newsTabs = ['주요뉴스', '추천', '언론사', '심층탐사', '경제', '라이브'];

const newsData = {
  '주요뉴스': [
    { outlet: '한겨레',   img: 'https://images.unsplash.com/photo-1529107386315-e147a4497e39?w=80&h=60&fit=crop', title: '선관위 부정선거 의혹 확산…야당 "즉각 전수조사" 촉구', time: '8분 전' },
    { outlet: '조선일보', img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=80&h=60&fit=crop', title: '정부, 의대 정원 2027년까지 단계적 확대 검토 발표', time: '22분 전' },
    { outlet: 'KBS',      img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=80&h=60&fit=crop', title: '코스피 2,800 돌파…반도체·이차전지 동반 강세', time: '35분 전' },
    { outlet: '연합뉴스', img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=80&h=60&fit=crop', title: '최저임금 내년 1만2천원 안 논의…노사 입장 충돌', time: '47분 전' },
    { outlet: 'MBC',      img: 'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=80&h=60&fit=crop', title: '노란봉투법 헌법소원 각하…노동계 강력 반발', time: '1시간 전' },
    { outlet: '중앙일보', img: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=80&h=60&fit=crop', title: '교육부, 수능 절대평가 전환 공청회 열기로', time: '1시간 14분 전' },
    { outlet: 'SBS',      img: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w=80&h=60&fit=crop', title: '6·3 지방선거 D-12, 격전지 민심 향방 촉각', time: '1시간 30분 전' },
    { outlet: '경향신문', img: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=80&h=60&fit=crop', title: '대법원, 전·현직 국회의원 선거법 위반 심리 가속', time: '2시간 전' },
  ],
  '경제': [
    { outlet: '매일경제', img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=80&h=60&fit=crop', title: '원·달러 환율 1,320원대…수출기업 채산성 우려', time: '15분 전' },
    { outlet: '한국경제', img: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=80&h=60&fit=crop', title: 'Fed 금리 동결…한국은행 연내 인하 기대 유지', time: '32분 전' },
    { outlet: '서울경제', img: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=80&h=60&fit=crop', title: '삼성전자 HBM4 양산 돌입…엔비디아 공급 확대', time: '55분 전' },
    { outlet: '머니투데이', img: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=80&h=60&fit=crop', title: '서울 아파트 매매지수 5주 연속 상승세 지속', time: '1시간 전' },
    { outlet: '이데일리', img: 'https://images.unsplash.com/photo-1565372195458-9de0b320ef04?w=80&h=60&fit=crop', title: '전기차 보조금 100만원 추가 지원…하반기 집행', time: '1시간 20분 전' },
    { outlet: '파이낸셜', img: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=80&h=60&fit=crop', title: 'AI 반도체 수출 규제 완화…한국 기업 수혜 예상', time: '2시간 전' },
  ],
  '추천': [
    { outlet: '한겨레',   img: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=80&h=60&fit=crop', title: '"기후위기는 선택 아닌 생존"…청년 기후행동 만 명 집결', time: '3시간 전' },
    { outlet: '조선',     img: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=80&h=60&fit=crop', title: '내년 의대 정시 비율 40%로 상향…수험생 촉각', time: '4시간 전' },
    { outlet: 'KBS',      img: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=80&h=60&fit=crop', title: '전국 출산율 0.72…지방 소멸 시계 빨라진다', time: '5시간 전' },
    { outlet: '연합',     img: 'https://images.unsplash.com/photo-1529107386315-e147a4497e39?w=80&h=60&fit=crop', title: '한일 정상회담 서울 개최 합의…관계 정상화 가속', time: '6시간 전' },
  ],
};

const liveCards = [
  { emoji: '🎙️', title: '국회 대정부 질문 LIVE', badge: 'LIVE',  img: 'https://images.unsplash.com/photo-1529107386315-e147a4497e39?w=300&h=160&fit=crop' },
  { emoji: '⚽',  title: '한국 vs 일본 친선전 하이라이트', badge: '스포츠', img: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=300&h=160&fit=crop' },
  { emoji: '📊',  title: '오늘의 증시 브리핑', badge: '경제',  img: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=300&h=160&fit=crop' },
];

export default function App() {
  const [activeTab, setActiveTab] = React.useState('주요뉴스');
  const articles = newsData[activeTab] || newsData['주요뉴스'];

  return (
    <div className="min-h-screen bg-[#F1F2F4]">
      <Header />

      {/* 반반 Hero */}
      <div className="w-full bg-gradient-to-b from-[#E5EEFF] to-[#F1F2F4] border-b border-[#CDD9FF] py-7 px-4">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-[#3B6EF6] text-white text-[11px] font-bold rounded-full px-3 py-1 shadow-sm">✨ 반반 뉴스</span>
              <span className="text-xs text-[#3B6EF6] font-medium">두 시각으로 읽는 오늘의 쟁점</span>
            </div>
            <BanbanCard />
          </div>
          <Sidebar />
        </div>
      </div>

      {/* 배경 콘텐츠 */}
      <main className="max-w-5xl mx-auto px-4 py-5">
        <p className="text-[11px] text-gray-300 mb-4 text-center tracking-widest">─────── 더보기 ───────</p>

        {/* 광고 + 배너 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 opacity-75">
          <div className="bg-white rounded-[20px] shadow-card p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center text-2xl flex-shrink-0">🌸</div>
            <div>
              <p className="text-[10px] text-gray-400">AD</p>
              <p className="text-sm font-semibold">이 봄, 당신만의 향 — 마이센스</p>
              <p className="text-xs text-[#3B6EF6] mt-0.5">지금 30% 할인 →</p>
            </div>
          </div>
          <div className="rounded-[20px] p-5 text-white flex items-center justify-between overflow-hidden relative"
               style={{ background: 'linear-gradient(135deg,#D94C4C,#F97316)' }}>
            <div>
              <p className="text-[10px] opacity-80 mb-0.5">지방선거 D-12</p>
              <p className="text-lg font-extrabold">Go! 2026 🏃</p>
              <p className="text-[10px] opacity-80 mt-0.5">내 지역 후보 확인하기</p>
            </div>
            <span className="text-5xl opacity-20 absolute right-4">🗳️</span>
          </div>
        </div>

        {/* LIVE 카드 */}
        <div className="grid grid-cols-3 gap-3 mb-4 opacity-75">
          {liveCards.map(({ title, badge, img }) => (
            <div key={title} className="bg-white rounded-[20px] shadow-card overflow-hidden">
              <div className="relative h-20 overflow-hidden bg-gray-100">
                <img src={img} alt={title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20" />
              </div>
              <div className="p-3">
                <span className="text-[10px] font-bold text-[#3B6EF6] bg-[#EAF1FF] rounded px-1.5 py-0.5">{badge}</span>
                <p className="text-xs font-medium leading-snug mt-1.5">{title}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 뉴스 카드 */}
        <div className="bg-white rounded-[20px] shadow-card p-5 opacity-80">
          <div className="flex gap-2 flex-wrap mb-4">
            {newsTabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        activeTab === tab
                          ? 'bg-[#EAF1FF] text-[#3B6EF6]'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}>
                {tab}
              </button>
            ))}
          </div>
          <ul className="flex flex-col divide-y divide-gray-50">
            {articles.map(({ outlet, img, title, time }) => (
              <li key={title} className="py-3 flex items-center gap-3 hover:bg-gray-50 rounded-xl px-2 -mx-2 transition-colors cursor-pointer">
                <img src={img} alt={title}
                     className="w-16 h-12 rounded-lg object-cover flex-shrink-0 bg-gray-100"
                     onError={e => { e.target.style.display = 'none'; }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 leading-snug line-clamp-2">{title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-gray-400 bg-gray-100 rounded px-1.5 py-0.5">{outlet}</span>
                    <span className="text-[10px] text-gray-400">{time}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
