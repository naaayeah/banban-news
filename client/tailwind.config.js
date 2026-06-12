export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        daum: { blue: '#3B6EF6', 'blue-light': '#EAF1FF', red: '#D94C4C', gray: '#8A8F99', bg: '#F1F2F4', text: '#1A1A1A' },
      },
      borderRadius: { card: '20px' },
      boxShadow: { card: '0 2px 10px rgba(0,0,0,.04)' },
    },
  },
  plugins: [],
};
