/** @type {import('tailwindcss').Config} */

// ============================================================
//  IDENTIDADE VISUAL — amorECA
//  Cores extraídas das peças da chapa:
//    #2E2156  roxo tinta      #6E4FC4  roxo médio
//    #A184E5  lilás           #ECD821  amarelo
//    #F5F4E3  creme           #F2785C  coral
//  Tipografia: Inter Tight (títulos 900, caixa baixa, tracking negativo)
//
//  Este é o único arquivo que precisa mudar para ajustar a
//  identidade do app inteiro: as telas usam as escalas
//  "purple" (principal) e "amber" (destaque).
// ============================================================

const MARCA = {
  principal: {
    50: "#F5F4E3", // creme — fundo das telas
    100: "#E7DFF7", // lilás claro
    200: "#D4C6F0",
    300: "#BCA6EA",
    400: "#A184E5", // lilás
    500: "#8A66DA",
    600: "#6E4FC4", // roxo médio
    700: "#553A9E",
    800: "#2E2156", // roxo tinta — barra, botões, textos
    900: "#241A44",
    950: "#171029",
  },
  destaque: {
    50: "#FEFCE6",
    100: "#FCF7BF",
    200: "#F8EE86",
    300: "#F3E349",
    400: "#ECD821", // amarelo amorECA
    500: "#D6C014",
    600: "#AE9810",
    700: "#8A7713",
    800: "#725F17",
    900: "#614F19",
    950: "#383009",
  },
};

export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        purple: MARCA.principal,
        amber: MARCA.destaque,
        coral: "#F2785C",
        creme: "#F5F4E3",
        tinta: "#2E2156",
        lilas: "#A184E5",
      },
      fontFamily: {
        sans: ["'Inter Tight'", "Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        titulo: "-0.03em",
        olho: "0.3em",
      },
    },
  },
  plugins: [],
};
