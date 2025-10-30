/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        fadeInUp: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        float: "float 4s ease-in-out infinite",
        blob: "blob 8s infinite ease-in-out",
        fadeInUp: "fadeInUp 0.8s ease-out forwards",
      },
      animationDelay: {
        200: "0.2s",
        400: "0.4s",
        600: "0.6s",
        800: "0.8s",
        2000: "2s",
        4000: "4s",
      },
    },
  },
  plugins: [],
};
