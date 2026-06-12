import React from 'react';

const quickLinks = [
  { icon: '🗺️', label: '지도' }, { icon: '💰', label: '금융' }, { icon: '✉️', label: '메일' },
  { icon: '⚽', label: '스포츠' }, { icon: '🌤️', label: '날씨' }, { icon: '🎮', label: '게임' },
  { icon: '☕', label: '카페' }, { icon: '🛍️', label: '쇼핑' }, { icon: '📰', label: '뉴스' },
];

export default function Header() {
  return (
    <div className="w-full bg-white pb-4 pt-6 px-4 shadow-sm">
      <div className="max-w-5xl mx-auto flex flex-col items-center gap-4">
        {/* Search bar */}
        <div className="w-full max-w-2xl p-[2px] rounded-full" style={{ background: 'linear-gradient(90deg,#3B6EF6,#7C4EF6,#E84EAA,#F97316,#FACC15)' }}>
          <div className="bg-white rounded-full flex items-center px-4 py-3 gap-3">
            {/* Gradient D */}
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#3B6EF6,#E84EAA)' }}>D</div>
            <input
              className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400"
              placeholder="검색어를 입력해주세요"
            />
            <span className="text-gray-400 text-lg">⌨️</span>
            <button className="w-8 h-8 rounded-full bg-[#3B6EF6] flex items-center justify-center text-white text-sm">🔍</button>
          </div>
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap justify-center gap-2">
          {quickLinks.map(({ icon, label }) => (
            <button key={label} className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-full px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:shadow-md transition-shadow">
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
