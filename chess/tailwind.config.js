// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "custom-dark": "#1a1a1a",
        "custom-blue": "#3b82f6",
        "custom-red": "#ef4444",
      },
    },
  },
  plugins: [],
};
