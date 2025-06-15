// filepath: c:\Users\ABC\Desktop\RMT Medical Store\RMT Medical Store\tailwind.config.js
module.exports = {
    content: [
      './src/**/*.{html,js,ts,jsx,tsx}', // Adjust paths as needed
    ],    theme: {
      extend: {
        colors: {
          primary: '#036372',
          accent: '#1fa9be',
          light: '#e0f7fa',
        },
        boxShadow: {
          'brand': '0 4px 14px 0 rgba(3, 99, 114, 0.15)',
          'brand-lg': '0 10px 25px -5px rgba(3, 99, 114, 0.2)',
        },
      },
    },
    plugins: [
      require('tw-animate-css'), // Ensure this is added
    ],
  };