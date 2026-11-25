/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        aqi: {
          good: '#10B981',       // 0-50
          moderate: '#F59E0B',   // 51-100
          poor: '#F97316',       // 101-200
          unhealthy: '#EF4444',  // 201-300
          severe: '#7C3AED',     // 301-400
          hazardous: '#881337',  // 401+
        }
      }
    },
  },
  plugins: [],
}
