import React from 'react';

const trending = [
  { rank: 1, keyword: '대통령 선거', dir: 'up' },
  { rank: 2, keyword: '반도체 규제', dir: 'down' },
  { rank: 3, keyword: '최저임금', dir: 'up' },
  { rank: 4, keyword: '의대 정원', dir: 'same' },
  { rank: 5, keyword: '부동산 대책', dir: 'down' },
  { rank: 6, keyword: '탄핵 심판', dir: 'up' },
  { rank: 7, keyword: '한미 관계', dir: 'same' },
  { rank: 8, keyword: '금리 인하', dir: 'up' },
  { rank: 9, keyword: '전기차 보조금', dir: 'down' },
  { rank: 10, keyword: '청년 주거', dir: 'new' },
];

const dirIcon = { up: '▲', down: '▼', same: '–', new: 'NEW' };
const dirColor = { up: 'text-red-500', down: 'text-blue-500', same: 'text-gray-400', new: 'text-orange-500' };

const products = [
  { emoji: '👟', name: '에어맥스 270', price: '129,000원' },
  { emoji: '👜', name: '크로스백', price: '49,000원' },
  { emoji: '🎧', name: '무선 이어폰', price: '89,000원' },
  { emoji: '⌚', name: '스마트워치', price: '199,000원' },
];

export default function Sidebar() {
  return (
    <aside className="w-full lg:w-[360px] flex-shrink-0 flex flex-col gap-4">
      {/* Profile card */}
      <div className="bg-white rounded-card shadow-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3B6EF6] to-[#E84EAA] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">반</div>
          <div className="min-w-0">
            <p className="text-sm font-bold">반반이님</p>
            <p className="text-xs text-gray-400 truncate">banban@news.com</p>
          </div>
          <button className="ml-auto text-xs text-gray-400 hover:text-gray-600 flex-shrink-0">로그아웃</button>
        </div>
        <div className="flex gap-2">
          {['✉️ 메일', '☕ 카페', '👤 MY'].map(label => (
            <button key={label} className="flex-1 py-2 rounded-full bg-gray-50 text-xs text-gray-600 hover:bg-[#EAF1FF] hover:text-[#3B6EF6] transition-colors">
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Trending */}
      <div className="bg-white rounded-card shadow-card p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold">🔥 실시간 인기검색어</h3>
          <span className="text-[10px] text-gray-400">기준 12:00</span>
        </div>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
          {trending.map(({ rank, keyword, dir }) => (
            <li key={rank} className="flex items-center gap-2">
              <span className={`text-xs font-bold w-4 ${rank <= 3 ? 'text-[#3B6EF6]' : 'text-gray-400'}`}>{rank}</span>
              <span className="text-xs text-gray-700 flex-1 truncate">{keyword}</span>
              <span className={`text-[10px] ${dirColor[dir]}`}>{dirIcon[dir]}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Shopping */}
      <div className="bg-white rounded-card shadow-card p-5">
        <h3 className="text-sm font-bold mb-3">🛍️ 쇼핑</h3>
        <div className="grid grid-cols-2 gap-3">
          {products.map(({ emoji, name, price }) => (
            <div key={name} className="bg-gray-50 rounded-xl p-3 flex flex-col items-center gap-1">
              <span className="text-3xl">{emoji}</span>
              <p className="text-xs font-medium text-center">{name}</p>
              <p className="text-xs text-[#3B6EF6] font-bold">{price}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Weather */}
      <div className="bg-white rounded-card shadow-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400">서울특별시 강남구</p>
            <p className="text-3xl font-bold mt-1">24°</p>
            <p className="text-xs text-gray-500 mt-1">🌤️ 맑음 · 미세먼지 좋음</p>
          </div>
          <div className="text-right text-xs text-gray-400 space-y-1">
            <p>최고 28° / 최저 17°</p>
            <p>강수확률 10%</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
