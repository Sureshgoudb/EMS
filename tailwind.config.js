/** @type {import('tailwindcss').Config} */
module.exports = {
  
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
 
 darkMode: 'class',
  theme: {
    fontFamily: {
      'sans': ['ui-sans-serif', 'system-ui'],
      'serif': ['ui-serif', 'Georgia'],
      'mono': ['ui-monospace', 'SFMono-Regular'],
      'display': ['Oswald'],
      'font-three': ['Kaushan Script','cursive'],
    },
    extend: {
      colors: { 
         'primary' : '#3056d3',
        'custom-grey': '#e2e8f0', 
        'custom-green': '#609966', 
        'custom-blue': '#344D67', 
        'footer-bg' : '#021a32',
        'device-page-bg' : '#f2f2f2',
        'theme-color' : '#02b2af'

      }
    },
  },
  plugins: [],
}

