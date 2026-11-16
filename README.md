# praIA

App da comunidade ecana (ECA-USP). Créditos cooperativos pelo cuidado dos
espaços da Prainha, agenda dos espaços, mercado de trocas e governança
estudantil num lugar só.

Identidade visual da chapa **amorECA** — CALC 2026.

---

## Rodar na sua máquina

Precisa de [Node.js](https://nodejs.org) 18 ou mais novo.

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

Para conferir o build antes de publicar:

```bash
npm run build
npm run preview
```

---

## Publicar na Vercel

### Caminho mais simples — pelo site

1. Suba a pasta para um repositório no GitHub (veja abaixo).
2. Entre em [vercel.com](https://vercel.com) e clique em **Add New → Project**.
3. Escolha o repositório. A Vercel reconhece Vite sozinha e preenche:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Clique em **Deploy**. Em cerca de um minuto sai a URL.

Não há variável de ambiente para configurar — o app guarda tudo no
navegador de quem usa.

### Subindo para o GitHub

```bash
git init
git add .
git commit -m "praIA — primeira versão"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/praia.git
git push -u origin main
```

Depois do primeiro deploy, todo `git push` para a `main` publica sozinho.

### Caminho alternativo — pelo terminal

```bash
npm i -g vercel
vercel          # publica uma prévia
vercel --prod   # publica em produção
```

### Domínio próprio

Em **Settings → Domains** dá para apontar algo como `praia.eca.br`.
A Vercel mostra os registros de DNS que você precisa cadastrar.

---

## Identidade visual

Tudo que define o visual está em **`tailwind.config.js`**. Trocar os hex lá
muda o app inteiro, porque todas as telas usam as escalas `purple`
(principal) e `amber` (destaque).

| Cor | Hex | Onde aparece |
|---|---|---|
| Roxo tinta | `#2E2156` | Barra superior, botões, textos |
| Roxo médio | `#6E4FC4` | Textos de apoio |
| Lilás | `#A184E5` | Fundos de destaque |
| Amarelo | `#ECD821` | Ações, selos, indicadores |
| Creme | `#F5F4E3` | Fundo das telas |
| Coral | `#F2785C` | Coração, alertas |

Tipografia: **Inter Tight**. Títulos em caixa baixa, peso 900, entrelinha
fechada e tracking negativo. Antetítulos em caixa alta, peso 700, tracking
aberto — o componente `<Olho>` já faz isso.

Arquivos da marca em `public/marca/`:

- `logo-creme.svg`, `logo-roxo.svg`, `logo-amarelo.svg` — o mesmo desenho em
  três cores; escolha pela cor do fundo. Use o componente `<Marca cor="roxo" />`.
- `el-coracao.svg`, `el-faisca.svg`, `el-flor.svg`, `el-raios.svg` — elementos
  gráficos das peças. Use `<Elemento nome="faisca" tamanho={40} />`.
- `icone.svg` — ícone do app na aba do navegador e na tela inicial do celular.

---

## Como os dados funcionam hoje

O app guarda tudo no `localStorage` do navegador de cada pessoa
(`src/lib/storage.js`). Isso significa:

- funciona offline e sem backend nenhum;
- cada pessoa só vê os próprios dados;
- limpar os dados do navegador apaga tudo;
- validadores não veem de verdade os check-ins de outras pessoas — o "modo
  validador" é uma simulação do fluxo, no mesmo aparelho.

Para virar sistema de verdade, o que falta é backend:

1. **Autenticação** pelo login USP.
2. **Banco de dados** com usuários, check-ins, saldos, catálogo e reservas.
3. **QR real** por espaço, vinculado ao validador.
4. **Notificações** quando um check-in é aprovado ou um pedido vai ao ar.

Quando isso existir, basta trocar o corpo das três funções de
`src/lib/storage.js` por chamadas à API — o resto do app não muda.

---

## Estrutura

```
praia/
├── index.html              metadados, fonte, ícone
├── tailwind.config.js      ← identidade visual
├── vercel.json             roteamento
├── public/
│   ├── manifest.webmanifest
│   └── marca/              logo e elementos gráficos
└── src/
    ├── main.jsx
    ├── index.css
    ├── App.jsx             o app inteiro
    └── lib/storage.js      persistência
```
