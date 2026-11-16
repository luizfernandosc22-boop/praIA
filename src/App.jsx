import { useState, useEffect, useRef, useCallback } from "react";
import { storage } from "./lib/storage";
import {
  Home, Wallet, ShoppingBag, MapPin, Users, UserCircle2, ChevronRight,
  Gift, Award, Calendar, CheckCircle2, Lock, ShieldAlert, X, Phone, Send,
  EyeOff, AlertTriangle, GraduationCap, Camera, Image as ImageIcon, Plus,
  CalendarPlus, Megaphone, QrCode, Clock, ShieldCheck, Heart, ArrowLeft,
  Inbox, Sparkles, Instagram, Search, Briefcase,
} from "lucide-react";

const CSS = `
@keyframes pIn { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:none } }
@keyframes pSheet { from { opacity:0; transform:translateY(28px) } to { opacity:1; transform:none } }
@keyframes pShim { 0% { background-position:-300px 0 } 100% { background-position:300px 0 } }
@keyframes pPop { 0% { transform:scale(.85); opacity:0 } 60% { transform:scale(1.04) } 100% { transform:scale(1); opacity:1 } }
@keyframes pScan { 0% { top:0 } 100% { top:100% } }
.p-in { animation: pIn .32s cubic-bezier(.22,1,.36,1) both }
.p-sheet { animation: pSheet .26s cubic-bezier(.22,1,.36,1) both }
.p-pop { animation: pPop .4s cubic-bezier(.34,1.4,.64,1) both }
.p-sk { background:linear-gradient(90deg,#E7DFF7 25%,#F5F4E3 50%,#E7DFF7 75%); background-size:600px 100%; animation:pShim 1.2s infinite linear }
.p-scan { animation: pScan 1.6s ease-in-out infinite alternate }
@media (prefers-reduced-motion: reduce){ .p-in,.p-sheet,.p-pop,.p-sk,.p-scan{ animation:none } }
`;

// Paleta amorECA: #2E2156 tinta · #6E4FC4 roxo · #A184E5 lilás
// #ECD821 amarelo · #F5F4E3 creme · #F2785C coral
// Os valores vivem em tailwind.config.js — trocar lá troca o app inteiro.

// Marca da chapa amorECA. As três variações são o mesmo desenho
// em creme, roxo tinta e amarelo — escolha pelo fundo onde o logo cai.
const Marca = ({ largura = 104, cor = "creme", className = "" }) => (
  <img
    src={`/marca/logo-${cor}.svg`}
    alt="amorECA"
    style={{ width: largura }}
    className={`h-auto block ${className}`}
  />
);

// Elementos gráficos das peças: coração, faísca, flor e raios.
const Elemento = ({ nome, tamanho = 40, className = "", style }) => (
  <img
    src={`/marca/el-${nome}.svg`}
    alt=""
    aria-hidden="true"
    style={{ width: tamanho, height: tamanho, ...style }}
    className={className}
  />
);

// Antetítulo no estilo das peças: caixa alta, peso 700, tracking aberto.
const Olho = ({ children, className = "" }) => (
  <p className={`text-[11px] font-bold uppercase tracking-olho ${className}`}>{children}</p>
);

const TABS = [
  { id: "mural", label: "Mural", icon: Home },
  { id: "creditos", label: "Créditos", icon: Wallet },
  { id: "mercado", label: "Mercado", icon: ShoppingBag },
  { id: "espacos", label: "Espaços", icon: MapPin },
  { id: "rede", label: "Rede", icon: Users },
  { id: "perfil", label: "Perfil", icon: UserCircle2 },
];

const ESPACOS = [
  {
    id: "praca", nome: "Praça Coberta", area: "352 m²", validador: "Léo (Canil)",
    foto: "/fotos/coletivo.jpg", cor: "bg-amber-400", corTexto: "text-purple-800",
    resumo: "O maior espaço da Prainha. Festas, shows, feiras e assembleia.",
    capacidade: "até 400 pessoas", som: true, cobertura: "coberta",
  },
  {
    id: "auditorio", nome: "Auditório", area: "131 m²", validador: "Sam (CALC)",
    foto: "/fotos/sinal.jpg", cor: "bg-purple-400", corTexto: "text-creme",
    resumo: "Dois módulos que viram um só. Mesas, palestras e mostras.",
    capacidade: "120 sentados", som: true, cobertura: "fechada",
  },
  {
    id: "estudio", nome: "Estúdio Áudio/Vídeo", area: "27 m²", validador: "Ana (Com Jr)",
    foto: "/fotos/proj.jpg", cor: "bg-purple-800", corTexto: "text-creme",
    resumo: "Gravação, edição e cobertura. Três salas de edição ao lado.",
    capacidade: "6 pessoas", som: true, cobertura: "tratada",
  },
  {
    id: "convivencia", nome: "Convivência Estudos", area: "106 m²", validador: "Bia (ECAtlética)",
    foto: "/fotos/trio.jpg", cor: "bg-creme", corTexto: "text-purple-800",
    resumo: "Mesas grandes para estudar junto, reuniões e clubes.",
    capacidade: "60 pessoas", som: false, cobertura: "fechada",
  },
  {
    id: "agencias", nome: "Salas de Agências", area: "11 salas", validador: "Rafa (ECA Jr)",
    foto: "/fotos/turma.jpg", cor: "bg-purple-400", corTexto: "text-creme",
    resumo: "Base das juniores e dos coletivos. Uma sala por projeto.",
    capacidade: "8 por sala", som: false, cobertura: "fechada",
  },
  {
    id: "cafe", nome: "Café / Lanchonete", area: "26 m²", validador: "Duda (Bateréca)",
    foto: "/fotos/globo.jpg", cor: "bg-amber-400", corTexto: "text-purple-800",
    resumo: "Balcão, preparo e depósito. Ponto de resgate do Mercado.",
    capacidade: "fila de balcão", som: false, cobertura: "coberta",
  },
];

const CATEGORIAS = [
  { id: "cuidado", nome: "Cuidado e Manutenção", mult: 1, tipo: "hora" },
  { id: "prog_acad", nome: "Programativo acadêmico", mult: 1.5, tipo: "hora" },
  { id: "prog_cult", nome: "Programativo cultural", mult: 2, tipo: "hora" },
  { id: "formacao", nome: "Formação", mult: 1.5, tipo: "hora" },
  { id: "comunicacao", nome: "Comunicação e Divulgação", mult: 1.25, tipo: "hora" },
  { id: "deliberativo", nome: "Deliberativo", fixo: 25, tipo: "fixo" },
  { id: "criacao", nome: "Criação Cultural", fixo: 80, tipo: "fixo" },
];

const BASE_HORA = 10;

const ENTIDADES = [
  { nome: "ECAtlética", ig: "ecatletica", tipo: "Entidade" },
  { nome: "Bateréca", ig: "batereca", tipo: "Entidade" },
  { nome: "Canil", ig: "canil.eca", tipo: "Coletivo cultural" },
  { nome: "CALC", ig: "calc.eca", tipo: "Centro acadêmico" },
  { nome: "RD", ig: "rd.eca", tipo: "Entidade" },
  { nome: "ECA Jr", ig: "ecajr", tipo: "Empresa júnior" },
  { nome: "Opá Negra", ig: "opanegra", tipo: "Coletivo" },
  { nome: "Jornalismo Jr", ig: "jornalismojr", tipo: "Empresa júnior" },
  { nome: "Com-Arte Jr", ig: "comartejr", tipo: "Empresa júnior" },
];

function acharEntidade(nome) {
  if (!nome) return null;
  const chave = nome.trim().toLowerCase();
  return ENTIDADES.find((e) => e.nome.toLowerCase() === chave) || null;
}

function urlInstagram(handle) {
  return `https://instagram.com/${String(handle).replace(/^@/, "")}`;
}

function BotaoInstagram({ handle, className = "", rotulo }) {
  if (!handle) return null;
  const limpo = String(handle).replace(/^@/, "");
  return (
    <a href={urlInstagram(limpo)} target="_blank" rel="noopener noreferrer"
      className={`inline-flex items-center justify-center gap-2 text-sm font-medium rounded-xl bg-purple-50 text-purple-800 border border-purple-200 transition-all duration-150 active:scale-[.97] ${className}`}>
      <Instagram size={16} />
      {rotulo || `@${limpo}`}
    </a>
  );
}

const CATALOGO = [
  { id: "caderno", camada: "Entrega simples", tone: "green", nome: "Caderno praIA", preco: 40, entidade: "Canil" },
  { id: "camiseta", camada: "Entrega simples", tone: "green", nome: "Camiseta do leão", preco: 90, entidade: "ECAtlética" },
  { id: "combo", camada: "Consumo em evento", tone: "amber", nome: "Combo lanche + bebida", preco: 25, entidade: "Bateréca", soEvento: true },
  { id: "viagem", camada: "Item pesado", tone: "purple", nome: "Pacote de viagem", preco: 980, entidade: "Comissão de Pontos", vagas: 3, pesado: true },
];

// Balcão de Serviços: trabalho remunerado em dinheiro, entre estudantes e
// quem contrata. É um mural de anúncios — o praIA não intermedeia pagamento.
const AREAS_SERVICO = [
  "Fotografia", "Vídeo", "Edição", "Técnico de som", "Iluminação",
  "Design gráfico", "Social media", "Redação", "Ilustração",
  "Locução", "Produção", "Assessoria de imprensa",
];

const SERVICOS_EXEMPLO = [
  {
    id: "s1", tipo: "oferta", area: "Fotografia", titulo: "Cobertura fotográfica de festa e evento",
    pessoa: "Ana L.", entidade: "Jornalismo Jr", valor: "R$ 250 por evento",
    detalhe: "Cobertura de até 4h, entrega de 60 fotos tratadas em 5 dias. Equipamento próprio.",
    portfolio: "ana.fotografa",
  },
  {
    id: "s2", tipo: "oferta", area: "Técnico de som", titulo: "Operação de som para shows na Prainha",
    pessoa: "Théo M.", entidade: "Canil", valor: "R$ 180 por diária",
    detalhe: "Montagem, passagem e operação. Já trabalhei nas últimas quatro edições da QiB.",
    portfolio: "theo.som",
  },
  {
    id: "s3", tipo: "procura", area: "Vídeo", titulo: "Procuro videomaker para aftermovie",
    pessoa: "Bia R.", entidade: "ECAtlética", valor: "R$ 400 fechado",
    detalhe: "Aftermovie de 1 min do campeonato, com captação em dois dias e entrega em duas semanas.",
  },
  {
    id: "s4", tipo: "oferta", area: "Design gráfico", titulo: "Identidade visual e peças para evento",
    pessoa: "Duda S.", entidade: "Com-Arte Jr", valor: "a combinar",
    detalhe: "Logo, paleta, cartaz e kit de stories. Dois ciclos de ajuste inclusos.",
    portfolio: "duda.design",
  },
];

const RANKING = [
  { nome: "Théo M.", saldo: 812 }, { nome: "Bia R.", saldo: 690 }, { nome: "Ana L.", saldo: 604 },
  { nome: "Igor S.", saldo: 511 }, { nome: "Cec P.", saldo: 402 },
];

function pad(n) { return String(n).padStart(2, "0"); }
function icsDate(d) {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
}
function baixarICS({ titulo, local, inicio, duracaoHoras = 2, descricao = "" }) {
  const fim = new Date(inicio.getTime() + duracaoHoras * 3600000);
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//praIA//ECA-USP//PT-BR", "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT", `UID:${Date.now()}@praia.eca.usp.br`, `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(inicio)}`, `DTEND:${icsDate(fim)}`, `SUMMARY:${titulo}`, `LOCATION:${local}`,
    `DESCRIPTION:${descricao}`, "BEGIN:VALARM", "TRIGGER:-PT60M", "ACTION:DISPLAY", "DESCRIPTION:Lembrete", "END:VALARM",
    "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = `${titulo.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.ics`;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function comprimir(file, max = 760) {
  return new Promise((res) => {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = () => res(null);
      img.src = r.result;
    };
    r.onerror = () => res(null);
    r.readAsDataURL(file);
  });
}

const ESTADO_INICIAL = {
  onboarded: false,
  usuario: null,
  servicos: [],
  newsletter: false,
  treinos: [],
  papel: "estudante",
  saldo: 0,
  extrato: [],
  pendentes: [],
  reservas: [],
  timeline: [],
  pedidosMural: [],
  resgates: [],
  doado: 0,
  penalidade: null,
  protocolos: [],
  posts: [
    { id: 1, tag: "Assembleia", tone: "purple", meta: "28/08 · 18h", titulo: "Assembleia geral marcada para o dia 28",
      corpo: "Pauta: calendário de reservas e eleição da Câmara de Fiscalização.",
      local: "Praça Coberta", quando: "28/08, 18h", organizador: "Modelo Representativo",
      categoriaCredito: "Deliberativo", reuniao: true, presentes: 47, autor: "núcleo de Comunicação" },
    { id: 2, tag: "Evento", tone: "amber", meta: "Auditório · hoje, 19h", titulo: "Roda de conversa: economia criativa na prática",
      corpo: "Com o Colegiado de Economia Criativa e agências juniores. Entrada livre, sem inscrição prévia.",
      local: "Auditório, ECA-USP", quando: "hoje, 19h", organizador: "Colegiado de Economia Criativa",
      categoriaCredito: "Programativo acadêmico", autor: "núcleo de Comunicação",
      fotos: [{ id: "f-qib", url: "/fotos/memoria.jpg" }],
      evento: { dias: 0, h: 19, local: "Auditório, ECA-USP", espacoId: "auditorio" }, confirmado: false },
    { id: 3, tag: "Ata resumida", tone: "green", meta: "há 5 dias", titulo: "Colegiado de Eventos aprovou nova regra da Praça",
      corpo: "Resumo publicado pelo núcleo de Comunicação. A regra define prioridade de uso da Praça Coberta em semanas com mais de um evento marcado.",
      organizador: "Colegiado de Eventos", autor: "núcleo de Comunicação" },
    { id: 4, tag: "Evento", tone: "amber", meta: "Praça Coberta · sáb, 19h",
      titulo: "Fogo na Lona: performance e circo na Prainha",
      corpo: "Noite de performance aérea e intervenções cênicas, com abertura às 19h e performance principal às 22h.",
      local: "Praça Coberta", quando: "sábado, 19h", organizador: "Canil",
      categoriaCredito: "Programativo cultural", autor: "núcleo de Comunicação",
      fotos: [{ id: "f-lona", url: "/fotos/lona.jpg" }],
      evento: { dias: 5, h: 19, local: "Praça Coberta, ECA-USP", espacoId: "praca" }, confirmado: false },
  ],
};

// Newsletter acadêmica da comunidade, proposta por Talytha J.L. Souza.
// Professores indicam, estudantes curam e produzem, a comunidade recebe.
const NEWSLETTER = {
  nome: "Além da Aula",
  lema: "Conhecimento que circula",
  capa: "/fotos/turma.jpg",
  resumo:
    "Uma newsletter colaborativa que tira as indicações de leitura de dentro de uma sala só. Professores indicam artigos, livros, pesquisas, filmes e podcasts; estudantes fazem a curadoria, o texto e o design; a comunidade inteira recebe.",
  problema:
    "O problema não é falta de conteúdo, é falta de circulação: referências ótimas ficam restritas à turma daquela disciplina.",
  cadeia: [
    { n: "01", quem: "Professor", faz: "indica artigo, pesquisa, livro ou tema" },
    { n: "02", quem: "Estudante", faz: "faz curadoria e pesquisa complementar" },
    { n: "03", quem: "Estudante", faz: "desenvolve texto, edição e design" },
    { n: "04", quem: "Newsletter", faz: "organiza e apresenta o conteúdo" },
    { n: "05", quem: "Comunidade", faz: "recebe e acessa a indicação" },
  ],
  frentes: [
    { t: "Curadoria", d: "selecionar e contextualizar" },
    { t: "Pesquisa", d: "aprofundar a indicação" },
    { t: "Texto", d: "redigir e editar" },
    { t: "Design", d: "identidade, direção de arte e diagramação" },
    { t: "Divulgação", d: "criar peças para circulação" },
  ],
  autoria: "Talytha J.L. Souza",
};

// clubECA: clubes de leitura, fotografia e DJ que marcam encontros no Mural.
const CLUBES = [
  { id: "leitura", nome: "Clube de leitura", emoji: null, cor: "bg-purple-400", corTexto: "text-creme",
    descricao: "Um livro por mês, encontro para discutir no fim.", local: "Convivência Estudos" },
  { id: "foto", nome: "Clube de fotografia", cor: "bg-amber-400", corTexto: "text-purple-800",
    descricao: "Saídas fotográficas e leitura de portfólio entre pares.", local: "Estúdio Áudio/Vídeo" },
  { id: "dj", nome: "Clube de DJ", cor: "bg-purple-800", corTexto: "text-creme",
    descricao: "Troca de set, prática de mixagem e discotecagem aberta.", local: "Praça Coberta" },
];

// ---------------------------------------------------------------
//  Treinos da ECAtlética
//  Cada time mantém a própria grade semanal. Os treinos do dia
//  sobem automaticamente para o Mural.
// ---------------------------------------------------------------

const DIAS = [
  { id: 0, curto: "dom", nome: "domingo" },
  { id: 1, curto: "seg", nome: "segunda" },
  { id: 2, curto: "ter", nome: "terça" },
  { id: 3, curto: "qua", nome: "quarta" },
  { id: 4, curto: "qui", nome: "quinta" },
  { id: 5, curto: "sex", nome: "sexta" },
  { id: 6, curto: "sáb", nome: "sábado" },
];

const TIMES = [
  { id: "futsal-m", nome: "Futsal masculino", cor: "bg-purple-800", corTexto: "text-creme", resp: "Théo M." },
  { id: "futsal-f", nome: "Futsal feminino", cor: "bg-amber-400", corTexto: "text-purple-900", resp: "Bia R." },
  { id: "volei-misto", nome: "Vôlei misto", cor: "bg-purple-400", corTexto: "text-creme", resp: "Ana L." },
  { id: "basquete", nome: "Basquete", cor: "bg-coral", corTexto: "text-creme", resp: "Igor S." },
  { id: "handebol", nome: "Handebol", cor: "bg-purple-600", corTexto: "text-creme", resp: "Cec P." },
  { id: "atletismo", nome: "Atletismo", cor: "bg-amber-400", corTexto: "text-purple-900", resp: "Duda S." },
  { id: "xadrez", nome: "Xadrez", cor: "bg-purple-800", corTexto: "text-creme", resp: "Rafa T." },
];

const TREINOS_BASE = [
  { id: "t1", timeId: "futsal-m", dia: 1, hora: "19:00", fim: "21:00", local: "Quadra do CEPEUSP", obs: "Levar colete e caneleira" },
  { id: "t2", timeId: "futsal-f", dia: 1, hora: "21:00", fim: "22:30", local: "Quadra do CEPEUSP", obs: "" },
  { id: "t3", timeId: "volei-misto", dia: 2, hora: "18:30", fim: "20:30", local: "Quadra coberta, Praça da ECA", obs: "Aberto para quem nunca jogou" },
  { id: "t4", timeId: "basquete", dia: 2, hora: "20:30", fim: "22:00", local: "Quadra do CEPEUSP", obs: "" },
  { id: "t5", timeId: "handebol", dia: 3, hora: "19:00", fim: "21:00", local: "Quadra do CEPEUSP", obs: "" },
  { id: "t6", timeId: "atletismo", dia: 3, hora: "07:00", fim: "08:30", local: "Pista do CEPEUSP", obs: "Treino cedo, leve água" },
  { id: "t7", timeId: "futsal-m", dia: 4, hora: "19:00", fim: "21:00", local: "Quadra do CEPEUSP", obs: "" },
  { id: "t8", timeId: "volei-misto", dia: 4, hora: "21:00", fim: "22:30", local: "Quadra coberta, Praça da ECA", obs: "" },
  { id: "t9", timeId: "xadrez", dia: 4, hora: "18:00", fim: "20:00", local: "Convivência Estudos", obs: "Tabuleiros disponíveis no local" },
  { id: "t10", timeId: "futsal-f", dia: 5, hora: "18:00", fim: "20:00", local: "Quadra do CEPEUSP", obs: "" },
  { id: "t11", timeId: "atletismo", dia: 6, hora: "09:00", fim: "11:00", local: "Pista do CEPEUSP", obs: "Treino longo de sábado" },
  { id: "t12", timeId: "basquete", dia: 6, hora: "11:00", fim: "13:00", local: "Quadra do CEPEUSP", obs: "" },
];

function useEstado() {
  const [estado, setEstado] = useState(ESTADO_INICIAL);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await storage.get("praia:estado");
        if (r?.value) setEstado({ ...ESTADO_INICIAL, ...JSON.parse(r.value) });
      } catch { /* primeiro acesso */ }
      setCarregando(false);
    })();
  }, []);

  const salvar = useCallback((atualizador) => {
    setEstado((prev) => {
      const novo = typeof atualizador === "function" ? atualizador(prev) : { ...prev, ...atualizador };
      storage.set("praia:estado", JSON.stringify(novo)).catch(() => {});
      return novo;
    });
  }, []);

  return { estado, salvar, carregando };
}

function Card({ children, className = "", delay = 0 }) {
  return (
    <div className={`bg-white rounded-2xl border border-purple-100 p-4 p-in ${className}`} style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function Pill({ children, tone = "purple" }) {
  const t = {
    purple: "bg-purple-100 text-purple-800", amber: "bg-amber-100 text-amber-800",
    green: "bg-green-100 text-green-800", red: "bg-red-100 text-red-800",
  };
  return <span className={`text-xs font-medium px-2 py-1 rounded-full ${t[tone]}`}>{children}</span>;
}

function Skeleton({ rows = 3 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-purple-100 p-4 space-y-2">
          <div className="p-sk h-3 w-20 rounded" />
          <div className="p-sk h-4 w-full rounded" />
          <div className="p-sk h-4 w-2/3 rounded" />
        </div>
      ))}
    </div>
  );
}

function useLazy(key, ms = 420) {
  const [ok, setOk] = useState(false);
  useEffect(() => { setOk(false); const t = setTimeout(() => setOk(true), ms); return () => clearTimeout(t); }, [key, ms]);
  return ok;
}

function Progress({ value, tone = "amber" }) {
  return (
    <div className="h-1.5 w-full bg-purple-100 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-500 ease-out ${tone === "amber" ? "bg-amber-400" : "bg-green-500"}`}
        style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}

function Btn({ children, variante = "primario", className = "", ...rest }) {
  const v = {
    primario: "bg-purple-800 text-white",
    amarelo: "bg-amber-400 text-purple-900",
    suave: "bg-purple-50 text-purple-800 border border-purple-200",
    perigo: "bg-red-700 text-white",
    inativo: "bg-purple-100 text-purple-400",
  };
  return (
    <button {...rest} className={`transition-all duration-150 active:scale-[.97] text-sm font-bold rounded-full ${v[variante]} ${className}`}>
      {children}
    </button>
  );
}

function Toast({ msg }) {
  if (!msg) return null;
  return (
    <div className="absolute left-3 right-3 bottom-20 z-40 p-in">
      <div className="bg-purple-900 text-white text-sm rounded-xl px-4 py-3 flex items-start gap-2">
        <CheckCircle2 size={16} className="text-amber-300 shrink-0 mt-0.5" />
        <span>{msg}</span>
      </div>
    </div>
  );
}

function MediaPicker({ fotos, setFotos, max = 4 }) {
  const cam = useRef(null); const gal = useRef(null);
  const [carregando, setCarregando] = useState(false);

  const add = async (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    if (!files.length) return;
    setCarregando(true);
    const novas = [];
    for (const f of files) {
      const url = await comprimir(f);
      if (url) novas.push({ id: `${Date.now()}-${novas.length}`, url });
    }
    setFotos((p) => [...p, ...novas].slice(0, max));
    setCarregando(false);
  };

  return (
    <div className="space-y-2">
      <input ref={cam} type="file" accept="image/*" capture="environment" onChange={add} className="hidden" />
      <input ref={gal} type="file" accept="image/*" multiple onChange={add} className="hidden" />
      <div className="flex gap-2">
        <Btn variante="suave" onClick={() => cam.current?.click()} className="flex-1 flex items-center justify-center gap-2 py-2.5">
          <Camera size={16} /> Câmera
        </Btn>
        <Btn variante="suave" onClick={() => gal.current?.click()} className="flex-1 flex items-center justify-center gap-2 py-2.5">
          <ImageIcon size={16} /> Galeria
        </Btn>
      </div>
      {carregando && <div className="p-sk h-16 rounded-xl" />}
      {fotos.length > 0 && (
        <div className="grid grid-cols-4 gap-2">
          {fotos.map((f) => (
            <div key={f.id} className="relative aspect-square rounded-xl overflow-hidden border border-purple-100 p-pop">
              <img src={f.url} alt="" className="w-full h-full object-cover" />
              <button onClick={() => setFotos((p) => p.filter((x) => x.id !== f.id))} aria-label="Remover"
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-purple-900/80 flex items-center justify-center">
                <X size={12} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function EditorVinculos({ vinculos, setVinculos, compacto = false }) {
  const [nome, setNome] = useState("");
  const [cargo, setCargo] = useState("");
  const [ig, setIg] = useState("");

  const sugestoes = ENTIDADES.map((e) => e.nome);
  const cargos = ["Membro", "Coordenação", "Diretoria", "Presidência", "Produção", "Comunicação", "Validador de espaço"];

  const escolherNome = (n) => {
    setNome(n);
    const conhecida = acharEntidade(n);
    if (conhecida) setIg(conhecida.ig);
  };

  const adicionar = () => {
    if (!nome.trim()) return;
    const conhecida = acharEntidade(nome);
    setVinculos((v) => [...v, {
      id: Date.now(), nome: conhecida?.nome || nome.trim(),
      cargo: cargo.trim() || "Membro",
      ig: (ig || conhecida?.ig || "").replace(/^@/, "").trim(),
    }]);
    setNome(""); setCargo(""); setIg("");
  };

  return (
    <div className="space-y-2">
      {vinculos.length > 0 && (
        <div className="space-y-2">
          {vinculos.map((v) => (
            <div key={v.id} className="flex items-center justify-between gap-2 bg-purple-50 rounded-xl px-3 py-2 p-pop">
              <div className="min-w-0">
                <p className="text-sm text-purple-900 truncate">{v.nome}</p>
                <p className="text-[11px] text-purple-500 truncate">
                  {v.cargo}{v.ig ? ` · @${v.ig}` : ""}
                </p>
              </div>
              <button onClick={() => setVinculos((p) => p.filter((x) => x.id !== v.id))} aria-label="Remover vínculo"
                className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0 transition-all active:scale-90">
                <X size={13} className="text-purple-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome da entidade ou coletivo"
        className="w-full text-sm border border-purple-200 rounded-xl p-3 text-purple-900 placeholder-purple-300 focus:outline-none focus:border-purple-500 transition-colors" />

      {!compacto && (
        <div className="flex flex-wrap gap-1.5">
          {sugestoes.map((s) => (
            <button key={s} onClick={() => escolherNome(s)}
              className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-purple-200 text-purple-700 transition-all active:scale-95">
              {s}
            </button>
          ))}
        </div>
      )}

      <input value={cargo} onChange={(e) => setCargo(e.target.value)} placeholder="Seu cargo ou função"
        className="w-full text-sm border border-purple-200 rounded-xl p-3 text-purple-900 placeholder-purple-300 focus:outline-none focus:border-purple-500 transition-colors" />

      <div className="flex flex-wrap gap-1.5">
        {cargos.map((c) => (
          <button key={c} onClick={() => setCargo(c)}
            className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-purple-200 text-purple-700 transition-all active:scale-95">
            {c}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 border border-purple-200 rounded-xl px-3">
        <Instagram size={16} className="text-purple-400 shrink-0" />
        <input value={ig} onChange={(e) => setIg(e.target.value)} placeholder="instagram da entidade (opcional)"
          className="flex-1 text-sm py-3 text-purple-900 placeholder-purple-300 focus:outline-none bg-transparent" />
      </div>

      <Btn variante={nome.trim() ? "suave" : "inativo"} disabled={!nome.trim()} onClick={adicionar}
        className="w-full flex items-center justify-center gap-2 py-2.5">
        <Plus size={16} /> Adicionar vínculo
      </Btn>
    </div>
  );
}

function Login({ onEntrar }) {
  const [nome, setNome] = useState("");
  const [vinculos, setVinculos] = useState([]);

  return (
    <div className="h-full overflow-y-auto px-6 py-8 p-in">
      <div className="relative mb-6">
        <Elemento nome="faisca" tamanho={34} className="absolute -top-2 right-0 rotate-12" />
        <Elemento nome="flor" tamanho={28} className="absolute top-14 left-0 -rotate-6" />
        <div className="flex justify-center mb-3">
          <Marca largura={190} cor="roxo" />
        </div>
        <p className="text-center text-5xl font-black lowercase tracking-titulo text-purple-800 leading-none">praia</p>
        <p className="text-center text-sm font-medium text-purple-600 mt-3">
          a comunidade ecana em um lugar só
        </p>
      </div>

      <input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome"
        className="w-full text-sm border border-purple-200 rounded-xl p-3 mb-4 text-purple-900 placeholder-purple-300 focus:outline-none focus:border-purple-500 transition-colors" />

      <p className="text-xs text-purple-600 mb-2">Suas entidades e cargos</p>
      <p className="text-[11px] text-purple-400 mb-3">Você pode adicionar quantas quiser, ou pular e preencher depois no Perfil.</p>
      <EditorVinculos vinculos={vinculos} setVinculos={setVinculos} />

      <Btn variante={nome.trim() ? "primario" : "inativo"} disabled={!nome.trim()}
        onClick={() => onEntrar({ nome: nome.trim(), vinculos })} className="w-full py-3 mt-5">
        Entrar
      </Btn>
      <p className="text-[11px] text-purple-400 text-center mt-3">
        Na versão oficial o acesso é pelo login USP
      </p>
    </div>
  );
}

function NewsletterSheet({ onClose, toast, estado, salvar }) {
  const inscrito = !!estado.newsletter;
  const n = NEWSLETTER;

  return (
    <div className="absolute inset-0 z-30 flex items-end" style={{ background: "rgba(46,33,86,.5)" }}>
      <div className="w-full bg-white rounded-t-3xl p-sheet max-h-[94%] overflow-y-auto">
        <div className="relative h-[170px]">
          <img src={n.capa} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <span className="absolute inset-0 bg-gradient-to-t from-purple-900 via-purple-900/55 to-purple-900/20" />
          <button onClick={onClose} aria-label="Fechar"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-purple-900/70 flex items-center justify-center">
            <X size={16} className="text-creme" />
          </button>
          <div className="absolute inset-x-4 bottom-4">
            <Olho className="text-amber-400 mb-1.5">newsletter ecana</Olho>
            <h2 className="text-creme text-[34px] font-black lowercase tracking-titulo leading-[0.9]">
              {n.nome.toLowerCase()}
            </h2>
            <p className="text-purple-100 text-sm font-medium mt-1">{n.lema}</p>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <p className="text-sm text-purple-700 leading-relaxed">{n.resumo}</p>

          <div className="bg-amber-100 border border-amber-300 rounded-2xl p-3">
            <p className="text-sm text-amber-900 font-medium leading-snug">{n.problema}</p>
          </div>

          <div>
            <Olho className="text-purple-500 mb-3">da indicação à circulação</Olho>
            <div className="space-y-2">
              {n.cadeia.map((c, i) => (
                <div key={c.n} className="flex items-center gap-3 p-in" style={{ animationDelay: `${i * 50}ms` }}>
                  <span className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    i === n.cadeia.length - 1 ? "bg-amber-400 text-purple-900" : "bg-purple-800 text-creme"}`}>
                    {c.n}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-purple-900">{c.quem}</p>
                    <p className="text-[11px] text-purple-500 leading-tight">{c.faz}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Olho className="text-purple-500 mb-2">onde entrar</Olho>
            <div className="space-y-1.5">
              {n.frentes.map((f) => (
                <div key={f.t} className="flex items-baseline justify-between gap-3 bg-purple-50 rounded-xl px-3 py-2">
                  <span className="text-xs font-bold text-purple-800 shrink-0">{f.t}</span>
                  <span className="text-[11px] text-purple-600 text-right">{f.d}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-purple-400 mt-2">
              Trabalhar na newsletter gera crédito de Comunicação e Divulgação.
            </p>
          </div>

          <Btn variante={inscrito ? "suave" : "primario"}
            onClick={() => {
              salvar((s) => ({ ...s, newsletter: !s.newsletter }));
              toast(inscrito ? "Você saiu da lista" : "Pronto, você recebe a próxima edição");
            }}
            className="w-full flex items-center justify-center gap-2 py-3">
            <CheckCircle2 size={16} className={inscrito ? "p-pop" : ""} />
            {inscrito ? "você está na lista" : "quero receber"}
          </Btn>

          <p className="text-[11px] text-purple-400 text-center">
            Proposta de {n.autoria}
          </p>
        </div>
      </div>
    </div>
  );
}

function TreinosSheet({ onClose, estado, salvar, toast, agendar, verDetalhe }) {
  const hoje = new Date().getDay();
  const [dia, setDia] = useState(hoje);
  const [time, setTime] = useState("todos");
  const [criando, setCriando] = useState(false);

  const todos = [...TREINOS_BASE, ...(estado.treinos || [])]
    .filter((t) => !(estado.treinosRemovidos || []).includes(t.id));

  const doDia = todos
    .filter((t) => t.dia === dia && (time === "todos" || t.timeId === time))
    .sort((a, b) => a.hora.localeCompare(b.hora));

  const porTime = (id) => TIMES.find((t) => t.id === id) || TIMES[0];

  const abrirTreino = (t) => {
    const tm = porTime(t.timeId);
    const d = new Date();
    const delta = (t.dia - d.getDay() + 7) % 7;
    d.setDate(d.getDate() + delta);
    const [hh, mm] = t.hora.split(":").map(Number);
    d.setHours(hh, mm, 0, 0);
    verDetalhe({
      chave: `treino-${t.id}`, tag: "Treino", tone: "purple", titulo: tm.nome,
      subtitulo: `${DIAS[t.dia].nome} · ${t.hora}–${t.fim}`,
      corpo: t.obs || "Treino aberto a quem quiser aparecer. Chegue alguns minutos antes.",
      publicadoPor: `${tm.resp} · ECAtlética`,
      instagram: "ecatletica",
      campos: [
        { k: "Time", v: tm.nome },
        { k: "Dia", v: DIAS[t.dia].nome },
        { k: "Horário", v: `${t.hora} às ${t.fim}` },
        { k: "Local", v: t.local },
        { k: "Responsável", v: tm.resp },
      ],
      agenda: { titulo: `Treino — ${tm.nome}`, local: t.local, inicio: d, duracaoHoras: 2, descricao: t.obs || "" },
    });
  };

  return (
    <div className="absolute inset-0 z-30 flex items-end" style={{ background: "rgba(46,33,86,.5)" }}>
      <div className="w-full bg-white rounded-t-3xl p-sheet max-h-[94%] overflow-y-auto">
        <div className="relative h-[130px]">
          <img src="/fotos/turma.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <span className="absolute inset-0 bg-gradient-to-t from-purple-900 via-purple-900/60 to-purple-900/20" />
          <button onClick={onClose} aria-label="Fechar"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-purple-900/70 flex items-center justify-center">
            <X size={16} className="text-creme" />
          </button>
          <div className="absolute inset-x-4 bottom-3">
            <Olho className="text-amber-400 mb-1">ecatlética</Olho>
            <h2 className="text-creme text-[28px] font-black lowercase tracking-titulo leading-[0.92]">
              treinos da semana
            </h2>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* Dias da semana */}
          <div className="-mx-1 px-1 overflow-x-auto">
            <div className="flex gap-1.5 w-max">
              {DIAS.map((d) => {
                const n = todos.filter((t) => t.dia === d.id).length;
                const ativo = dia === d.id;
                return (
                  <button key={d.id} onClick={() => setDia(d.id)}
                    className={`w-[52px] py-2 rounded-xl text-center transition-all duration-150 active:scale-95 ${
                      ativo ? "bg-purple-800 text-creme" : "bg-purple-50 text-purple-700"}`}>
                    <span className="block text-xs font-bold lowercase">{d.curto}</span>
                    <span className={`block text-[10px] mt-0.5 ${ativo ? "text-amber-400" : "text-purple-400"}`}>
                      {n === 0 ? "—" : n}
                    </span>
                    {d.id === hoje && (
                      <span className={`block w-1 h-1 rounded-full mx-auto mt-1 ${ativo ? "bg-amber-400" : "bg-purple-400"}`} />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filtro por time */}
          <div className="-mx-1 px-1 overflow-x-auto pb-1">
            <div className="flex gap-1.5 w-max">
              <button onClick={() => setTime("todos")}
                className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all active:scale-95 ${
                  time === "todos" ? "bg-purple-800 text-creme" : "bg-white border border-purple-200 text-purple-700"}`}>
                todos os times
              </button>
              {TIMES.map((tm) => (
                <button key={tm.id} onClick={() => setTime(tm.id)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all active:scale-95 ${
                    time === tm.id ? `${tm.cor} ${tm.corTexto}` : "bg-white border border-purple-200 text-purple-700"}`}>
                  {tm.nome}
                </button>
              ))}
            </div>
          </div>

          {/* Treinos do dia escolhido */}
          {doDia.length === 0 ? (
            <div className="bg-purple-50 rounded-2xl p-5 text-center">
              <p className="text-sm text-purple-600">
                Nenhum treino {dia === hoje ? "hoje" : `na ${DIAS[dia].nome}`}
                {time !== "todos" ? " para esse time" : ""}.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {doDia.map((t, i) => {
                const tm = porTime(t.timeId);
                const meu = (estado.treinos || []).some((x) => x.id === t.id);
                return (
                  <div key={t.id} className="flex gap-2 p-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <button onClick={() => abrirTreino(t)}
                      className={`flex-1 min-w-0 text-left rounded-2xl p-3.5 ${tm.cor} ${tm.corTexto} transition-all duration-150 active:scale-[.98]`}>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-bold lowercase truncate">{tm.nome}</span>
                        <span className="text-sm font-black tabular-nums shrink-0">{t.hora}</span>
                      </div>
                      <p className="text-[11px] opacity-80 mt-1 truncate">{t.local}</p>
                      <p className="text-[11px] opacity-70 mt-0.5">
                        até {t.fim} · {tm.resp}{meu ? " · você publicou" : ""}
                      </p>
                      {t.obs && <p className="text-[11px] opacity-90 mt-1.5 leading-snug">{t.obs}</p>}
                    </button>
                    {meu && (
                      <button
                        onClick={() => {
                          salvar((s) => ({ ...s, treinos: (s.treinos || []).filter((x) => x.id !== t.id) }));
                          toast("Treino removido da grade");
                        }}
                        aria-label="Remover treino"
                        className="w-10 shrink-0 rounded-2xl bg-purple-50 flex items-center justify-center transition-all active:scale-90">
                        <X size={15} className="text-purple-500" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {criando ? (
            <NovoTreinoForm
              diaInicial={dia}
              onCancelar={() => setCriando(false)}
              onSalvar={(t) => {
                salvar((s) => ({ ...s, treinos: [...(s.treinos || []), t] }));
                setCriando(false);
                setDia(t.dia);
                toast("Treino publicado na grade da semana");
              }}
            />
          ) : (
            <Btn variante="amarelo" onClick={() => setCriando(true)} className="w-full flex items-center justify-center gap-2 py-3">
              <Plus size={16} /> publicar treino do meu time
            </Btn>
          )}

          <p className="text-[11px] text-purple-400 text-center leading-snug">
            Cada time mantém a própria grade. Os treinos de hoje aparecem no Mural sozinhos.
          </p>
        </div>
      </div>
    </div>
  );
}

function NovoTreinoForm({ diaInicial, onSalvar, onCancelar }) {
  const [timeId, setTimeId] = useState("");
  const [dia, setDia] = useState(diaInicial);
  const [hora, setHora] = useState("19:00");
  const [fim, setFim] = useState("21:00");
  const [local, setLocal] = useState("");
  const [obs, setObs] = useState("");

  return (
    <div className="border-2 border-purple-200 rounded-2xl p-3.5 space-y-3 p-in">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-purple-900">Novo treino</p>
        <button onClick={onCancelar} aria-label="Cancelar"><X size={16} className="text-purple-400" /></button>
      </div>

      <div>
        <p className="text-xs text-purple-600 mb-2">Time</p>
        <div className="flex flex-wrap gap-1.5">
          {TIMES.map((tm) => (
            <button key={tm.id} onClick={() => setTimeId(tm.id)}
              className={`text-[11px] px-2.5 py-1.5 rounded-full border transition-all active:scale-95 ${
                timeId === tm.id ? `${tm.cor} ${tm.corTexto} border-transparent` : "bg-white border-purple-200 text-purple-700"}`}>
              {tm.nome}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-xs text-purple-600 mb-2">Dia da semana</p>
        <div className="flex gap-1.5">
          {DIAS.map((d) => (
            <button key={d.id} onClick={() => setDia(d.id)}
              className={`flex-1 py-2 rounded-lg text-[11px] font-bold lowercase transition-all active:scale-95 ${
                dia === d.id ? "bg-purple-800 text-creme" : "bg-purple-50 text-purple-700"}`}>
              {d.curto}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <label className="flex-1">
          <span className="block text-xs text-purple-600 mb-1">Começa</span>
          <input type="time" value={hora} onChange={(e) => setHora(e.target.value)}
            className="w-full text-sm border border-purple-200 rounded-xl p-2.5 text-purple-900 focus:outline-none focus:border-purple-500 transition-colors" />
        </label>
        <label className="flex-1">
          <span className="block text-xs text-purple-600 mb-1">Termina</span>
          <input type="time" value={fim} onChange={(e) => setFim(e.target.value)}
            className="w-full text-sm border border-purple-200 rounded-xl p-2.5 text-purple-900 focus:outline-none focus:border-purple-500 transition-colors" />
        </label>
      </div>

      <input value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Local do treino"
        className="w-full text-sm border border-purple-200 rounded-xl p-3 text-purple-900 placeholder-purple-300 focus:outline-none focus:border-purple-500 transition-colors" />

      <input value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Aviso para o time (opcional)"
        className="w-full text-sm border border-purple-200 rounded-xl p-3 text-purple-900 placeholder-purple-300 focus:outline-none focus:border-purple-500 transition-colors" />

      <Btn variante={timeId && local.trim() ? "primario" : "inativo"} disabled={!timeId || !local.trim()}
        onClick={() => onSalvar({
          id: `t-${Date.now()}`, timeId, dia, hora, fim, local: local.trim(), obs: obs.trim(),
        })}
        className="w-full flex items-center justify-center gap-2 py-2.5">
        <Send size={16} /> publicar na grade
      </Btn>
    </div>
  );
}

function ClubeSheet({ onClose, onPublicar, usuario }) {
  const [clube, setClube] = useState(null);
  const [tema, setTema] = useState("");
  const [quando, setQuando] = useState("");
  const [local, setLocal] = useState("");
  const [etapa, setEtapa] = useState("form");
  const [prog, setProg] = useState(0);

  const esc = CLUBES.find((c) => c.id === clube);

  const publicar = () => {
    setEtapa("enviando");
    let p = 0;
    const id = setInterval(() => {
      p += 18; setProg(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(id);
        setTimeout(() => {
          onPublicar({ clube: esc, tema, quando, local: local || esc.local, autor: usuario?.nome });
          onClose();
        }, 260);
      }
    }, 85);
  };

  return (
    <div className="absolute inset-0 z-30 flex items-end" style={{ background: "rgba(46,33,86,.5)" }}>
      <div className="w-full bg-white rounded-t-3xl p-4 p-sheet max-h-[94%] overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-bold text-purple-900">clubECA</p>
          <button onClick={onClose} aria-label="Fechar"><X size={18} className="text-purple-400" /></button>
        </div>
        <p className="text-xs text-purple-500 mb-4">Marque um encontro do seu clube e publique no Mural.</p>

        {etapa === "form" && (
          <div className="space-y-3 p-in">
            <div className="space-y-2">
              {CLUBES.map((c) => (
                <button key={c.id} onClick={() => setClube(c.id)}
                  className={`w-full text-left rounded-2xl p-3.5 transition-all duration-150 active:scale-[.98] ${
                    clube === c.id ? `${c.cor} ${c.corTexto}` : "bg-purple-50 text-purple-800"}`}>
                  <p className="text-sm font-bold lowercase">{c.nome}</p>
                  <p className={`text-[11px] mt-0.5 ${clube === c.id ? "opacity-80" : "text-purple-500"}`}>
                    {c.descricao}
                  </p>
                </button>
              ))}
            </div>

            {clube && (
              <div className="space-y-3 p-in">
                <input value={tema} onChange={(e) => setTema(e.target.value)}
                  placeholder="Tema do encontro (livro, pauta, estilo…)"
                  className="w-full text-sm border border-purple-200 rounded-xl p-3 text-purple-900 placeholder-purple-300 focus:outline-none focus:border-purple-500 transition-colors" />
                <input value={quando} onChange={(e) => setQuando(e.target.value)}
                  placeholder="Quando (ex: quinta, 18h)"
                  className="w-full text-sm border border-purple-200 rounded-xl p-3 text-purple-900 placeholder-purple-300 focus:outline-none focus:border-purple-500 transition-colors" />
                <input value={local} onChange={(e) => setLocal(e.target.value)}
                  placeholder={`Local (sugerido: ${esc.local})`}
                  className="w-full text-sm border border-purple-200 rounded-xl p-3 text-purple-900 placeholder-purple-300 focus:outline-none focus:border-purple-500 transition-colors" />
              </div>
            )}

            <Btn variante={clube && tema.trim() ? "primario" : "inativo"} disabled={!clube || !tema.trim()}
              onClick={publicar} className="w-full flex items-center justify-center gap-2 py-3">
              <Send size={16} /> publicar encontro no mural
            </Btn>
            <p className="text-[11px] text-purple-400 text-center">
              Encontro de clube vai direto ao Mural, sem passar pela fila da Comunicação.
            </p>
          </div>
        )}

        {etapa === "enviando" && (
          <div className="py-8 space-y-3 p-in">
            <p className="text-sm text-purple-900 text-center">Publicando encontro</p>
            <Progress value={prog} />
            <p className="text-xs text-purple-500 text-center">{prog}%</p>
          </div>
        )}
      </div>
    </div>
  );
}

function MuralScreen({ estado, salvar, agendar, toast, irPara, verDetalhe, abrirNewsletter, abrirClube, abrirTreinos }) {
  const hoje = new Date().getDay();
  const treinosHoje = [...TREINOS_BASE, ...(estado.treinos || [])]
    .filter((t) => t.dia === hoje)
    .sort((a, b) => a.hora.localeCompare(b.hora));

  const confirmar = (id) => {
    salvar((s) => ({ ...s, posts: s.posts.map((p) => (p.id === id ? { ...p, confirmado: !p.confirmado } : p)) }));
  };

  const abrir = (p) => {
    const d = p.evento ? new Date() : null;
    if (d) { d.setDate(d.getDate() + p.evento.dias); d.setHours(p.evento.h, 0, 0, 0); }
    verDetalhe({
      chave: `post-${p.id}`, tag: p.tag, tone: p.tone, titulo: p.titulo, corpo: p.corpo,
      subtitulo: p.meta, fotos: p.fotos, publicadoPor: p.autor || "núcleo de Comunicação",
      reuniao: p.reuniao, presentesBase: p.presentes || 0,
      espacoId: p.evento?.espacoId,
      instagram: acharEntidade(p.organizador)?.ig,
      campos: [
        { k: "Local", v: p.evento?.local || p.local },
        { k: "Quando", v: p.quando || p.meta },
        { k: "Organização", v: p.organizador },
        { k: "Categoria de crédito", v: p.categoriaCredito },
      ],
      agenda: d ? { titulo: p.titulo, local: p.evento.local, inicio: d, descricao: p.corpo || "" } : null,
    });
  };

  return (
    <div className="space-y-3">
      {/* Newsletter ecana: capa com foto, abre a proposta inteira */}
      <button onClick={abrirNewsletter}
        className="relative w-full h-[168px] rounded-2xl overflow-hidden text-left p-in transition-all duration-200 active:scale-[.98]">
        <img src={NEWSLETTER.capa} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <span className="absolute inset-0 bg-gradient-to-t from-purple-900 via-purple-900/60 to-purple-900/15" />
        <Elemento nome="raios" tamanho={30} className="absolute top-3 right-3 opacity-90" />
        <span className="absolute inset-x-4 bottom-4">
          <span className="block text-[11px] font-bold uppercase tracking-olho text-amber-400 mb-1.5">
            newsletter ecana
          </span>
          <span className="block text-creme text-[30px] font-black lowercase tracking-titulo leading-[0.92]">
            além da aula
          </span>
          <span className="flex items-center gap-1.5 mt-1.5">
            <span className="text-purple-100 text-xs font-medium">
              {estado.newsletter ? "você recebe as edições" : "conhecimento que circula"}
            </span>
            <ChevronRight size={14} className="text-amber-400" />
          </span>
        </span>
      </button>

      {/* Treinos de hoje — sobem sozinhos da grade da ECAtlética */}
      {treinosHoje.length > 0 && (
        <button onClick={abrirTreinos}
          className="w-full bg-purple-800 rounded-2xl p-4 text-left p-in transition-all duration-200 active:scale-[.98]"
          style={{ animationDelay: "30ms" }}>
          <div className="flex items-center justify-between mb-3">
            <Olho className="text-amber-400">treinos de hoje</Olho>
            <ChevronRight size={16} className="text-amber-400" />
          </div>
          <div className="space-y-2">
            {treinosHoje.slice(0, 3).map((t) => {
              const tm = TIMES.find((x) => x.id === t.timeId) || TIMES[0];
              return (
                <div key={t.id} className="flex items-baseline gap-2.5">
                  <span className="text-amber-400 text-sm font-black tabular-nums shrink-0 w-[42px]">{t.hora}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-creme text-sm font-bold lowercase leading-tight truncate">{tm.nome}</span>
                    <span className="block text-purple-300 text-[11px] truncate">{t.local}</span>
                  </span>
                </div>
              );
            })}
          </div>
          {treinosHoje.length > 3 && (
            <p className="text-purple-300 text-[11px] mt-2.5">
              + {treinosHoje.length - 3} outro(s) treino(s) hoje
            </p>
          )}
          <p className="text-purple-400 text-[11px] mt-3">ECAtlética · ver a semana inteira</p>
        </button>
      )}

      {/* clubECA: atalho para marcar encontro */}
      <button onClick={abrirClube}
        className="w-full bg-amber-400 rounded-2xl p-4 flex items-center gap-3 text-left p-in transition-all duration-200 active:scale-[.98]"
        style={{ animationDelay: "60ms" }}>
        <Elemento nome="flor" tamanho={38} className="shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-purple-900 text-[17px] font-black lowercase tracking-titulo leading-none">clubECA</p>
          <p className="text-purple-800/75 text-[11px] mt-1 leading-snug">
            leitura, fotografia e DJ — marque um encontro e publique aqui
          </p>
        </div>
        <ChevronRight size={18} className="text-purple-800 shrink-0" />
      </button>

      {estado.pedidosMural.filter((p) => p.status === "pendente").length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center gap-2 p-in">
          <Clock size={16} className="text-amber-700 shrink-0" />
          <p className="text-xs text-amber-800">
            {estado.pedidosMural.filter((p) => p.status === "pendente").length} pedido(s) seu(s) na fila da Comunicação
          </p>
        </div>
      )}

      {estado.posts.map((p, i) => (
        <Card key={p.id} delay={i * 60}>
          <button onClick={() => abrir(p)} className="w-full text-left transition-all duration-150 active:scale-[.99]">
            <div className="flex items-center justify-between mb-2">
              <Pill tone={p.tone}>{p.tag}</Pill>
              <span className="text-xs text-purple-400">{p.meta}</span>
            </div>
            <p className="text-sm text-purple-900 font-medium mb-1">{p.titulo}</p>
            {p.corpo && <p className="text-sm text-purple-600 mb-3 line-clamp-2">{p.corpo}</p>}
            {p.fotos?.length > 0 && (
              <div className={`grid gap-2 mb-3 ${p.fotos.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                {p.fotos.map((f) => <img key={f.id} src={f.url} alt="" className="w-full h-32 object-cover rounded-xl p-in" />)}
              </div>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-purple-500 mb-2">
              Ver detalhes <ChevronRight size={13} />
            </span>
          </button>
          {p.evento && (
            <div className="flex gap-2">
              <Btn variante={p.confirmado ? "suave" : "primario"} onClick={() => confirmar(p.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5">
                <CheckCircle2 size={16} className={p.confirmado ? "p-pop" : ""} />
                {p.confirmado ? "Confirmado" : "Confirmar"}
              </Btn>
              <Btn variante="suave" onClick={() => irPara("espacos", p.evento.espacoId)} aria-label="Fazer check-in" className="w-12 flex items-center justify-center">
                <QrCode size={18} />
              </Btn>
              <Btn variante="amarelo" aria-label="Adicionar à agenda" className="w-12 flex items-center justify-center"
                onClick={() => {
                  const d = new Date(); d.setDate(d.getDate() + p.evento.dias); d.setHours(p.evento.h, 0, 0, 0);
                  agendar({ titulo: p.titulo, local: p.evento.local, inicio: d, descricao: p.corpo || "" });
                }}>
                <CalendarPlus size={18} />
              </Btn>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function CreditosScreen({ estado, salvar, toast, verDetalhe }) {
  const [anim, setAnim] = useState(0);
  useEffect(() => {
    const alvo = estado.saldo; let n = 0;
    if (alvo === 0) { setAnim(0); return; }
    const id = setInterval(() => { n += Math.ceil(alvo / 20); if (n >= alvo) { n = alvo; clearInterval(id); } setAnim(n); }, 28);
    return () => clearInterval(id);
  }, [estado.saldo]);

  const porCategoria = CATEGORIAS.map((c) => ({
    ...c, total: estado.extrato.filter((e) => e.categoria === c.id).reduce((a, b) => a + b.creditos, 0),
  })).filter((c) => c.total > 0);
  const maiorCat = Math.max(1, ...porCategoria.map((c) => c.total));

  const minhaPos = [...RANKING, { nome: "você", saldo: estado.saldo, eu: true }]
    .sort((a, b) => b.saldo - a.saldo).findIndex((r) => r.eu) + 1;
  const faltam = Math.max(0, 980 - estado.saldo);

  const doar = () => {
    if (estado.saldo <= 0) return;
    const v = estado.saldo;
    salvar((s) => ({ ...s, saldo: 0, doado: s.doado + v,
      extrato: [{ id: Date.now(), espaco: "Reserva Comunitária", categoria: "doacao", creditos: -v, validador: "—", data: "agora" }, ...s.extrato] }));
    toast(`${v} créditos doados à Reserva Comunitária`);
  };

  return (
    <div className="space-y-3">
      <div className="bg-purple-800 rounded-2xl p-4 p-in">
        <Olho className="text-amber-400 mb-2">saldo atual</Olho>
        <p className="text-creme text-[40px] font-black tracking-titulo leading-none mb-3 tabular-nums">{anim}<span className="text-xl font-bold ml-2">créditos</span></p>
        <Progress value={(estado.saldo / 980) * 100} />
        <p className="text-amber-300 text-xs mt-2">Expira no fim do semestre · doe o residual antes disso</p>
      </div>

      {estado.pendentes.length > 0 && (
        <Card delay={40}>
          <div className="flex items-center gap-2 mb-2">
            <Clock size={16} className="text-amber-600" />
            <p className="text-sm font-medium text-purple-900">Aguardando validação</p>
          </div>
          {estado.pendentes.map((p) => (
            <div key={p.id} className="flex items-center justify-between text-sm py-1">
              <div>
                <p className="text-purple-900">{p.espacoNome}</p>
                <p className="text-xs text-purple-500">{p.categoriaNome} · {p.validador}</p>
              </div>
              <span className="text-amber-600 font-medium">+{p.creditos}</span>
            </div>
          ))}
        </Card>
      )}

      <Card delay={80}>
        <p className="text-sm font-medium text-purple-900 mb-3">Destaque do mês</p>
        <div className="grid grid-cols-3 gap-2">
          {[{ c: "Cuidado", n: "Bia" }, { c: "Programativo", n: "Théo" }, { c: "Formação", n: "Rafa" },
            { c: "Comunicação", n: "Ana" }, { c: "Deliberativo", n: "Igor" }, { c: "Criação", n: "Duda" }].map((d, i) => (
            <div key={d.c} className="text-center p-pop" style={{ animationDelay: `${120 + i * 55}ms` }}>
              <div className="w-10 h-10 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-1">
                <Award size={18} className="text-amber-600" />
              </div>
              <p className="text-xs text-purple-900 font-medium leading-tight">{d.n}</p>
              <p className="text-[11px] text-purple-500 leading-tight">{d.c}</p>
            </div>
          ))}
        </div>
      </Card>

      {porCategoria.length > 0 && (
        <Card delay={120}>
          <p className="text-sm font-medium text-purple-900 mb-3">Por categoria</p>
          <div className="space-y-2">
            {porCategoria.map((c) => (
              <div key={c.id}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-purple-700">{c.nome}</span>
                  <span className="text-purple-900 font-medium">{c.total}</span>
                </div>
                <Progress value={(c.total / maiorCat) * 100} />
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card delay={160}>
        <p className="text-sm font-medium text-purple-900 mb-3">Ranking da viagem · público</p>
        <div className="space-y-2">
          {[...RANKING, { nome: `${estado.usuario?.nome || "você"}`, saldo: estado.saldo, eu: true }]
            .sort((a, b) => b.saldo - a.saldo).slice(0, 6).map((r, i) => (
            <div key={r.nome + i} className={`flex items-center justify-between text-sm rounded-lg px-2 py-1 ${r.eu ? "bg-amber-50" : ""}`}>
              <span className="flex items-center gap-2">
                <span className={`w-5 text-xs ${i < 3 ? "text-amber-600 font-medium" : "text-purple-400"}`}>{i + 1}º</span>
                <span className={r.eu ? "text-purple-900 font-medium" : "text-purple-700"}>{r.nome}</span>
              </span>
              <span className="text-purple-600 tabular-nums">{r.saldo}</span>
            </div>
          ))}
        </div>
        <p className="text-xs text-purple-500 mt-3">3 vagas · faltam {faltam} créditos para o preço da viagem</p>
      </Card>

      <Card delay={200}>
        <p className="text-sm font-medium text-purple-900 mb-3">Extrato</p>
        {estado.extrato.length === 0 ? (
          <p className="text-sm text-purple-500">Nenhum movimento ainda. Faça um check-in em Espaços.</p>
        ) : (
          <div className="space-y-3">
            {estado.extrato.slice(0, 8).map((e, i) => (
              <button key={e.id} onClick={() => verDetalhe({
                chave: `extrato-${e.id}`, tag: e.creditos > 0 ? "Crédito" : "Débito",
                tone: e.creditos > 0 ? "green" : "purple",
                titulo: e.espaco, subtitulo: `${e.creditos > 0 ? "+" : ""}${e.creditos} créditos`,
                publicadoPor: e.validador,
                campos: [
                  { k: "Categoria", v: CATEGORIAS.find((c) => c.id === e.categoria)?.nome || (e.categoria === "resgate" ? "Resgate no Mercado" : "Doação à Reserva") },
                  { k: "Validado por", v: e.validador },
                  { k: "Data", v: e.data },
                  { k: "Valor", v: `${e.creditos} créditos` },
                ],
              })}
                className="w-full flex items-center justify-between text-sm p-in text-left transition-all duration-150 active:scale-[.99]"
                style={{ animationDelay: `${i * 50}ms` }}>
                <div className="min-w-0">
                  <p className="text-purple-900 truncate">{e.espaco}</p>
                  <p className="text-xs text-purple-500 truncate">{e.data} · validado por {e.validador}</p>
                </div>
                <span className={`font-medium shrink-0 ml-2 ${e.creditos > 0 ? "text-green-700" : "text-purple-500"}`}>
                  {e.creditos > 0 ? "+" : ""}{e.creditos}
                </span>
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card delay={240}>
        <div className="flex items-center gap-2 mb-2">
          <Heart size={16} className="text-purple-600" />
          <p className="text-sm font-medium text-purple-900">Reserva Comunitária</p>
        </div>
        <p className="text-sm text-purple-600 mb-3">
          Doe o saldo que sobrar antes de expirar. A Comissão de Pontos aloca em projetos coletivos.
          {estado.doado > 0 && ` Você já doou ${estado.doado}.`}
        </p>
        <Btn variante={estado.saldo > 0 ? "suave" : "inativo"} disabled={estado.saldo === 0} onClick={doar} className="w-full py-2.5">
          Doar {estado.saldo} créditos
        </Btn>
      </Card>
    </div>
  );
}

function MercadoScreen({ estado, salvar, toast, verDetalhe, abrirAnuncio }) {
  const [processando, setProcessando] = useState(null);
  const [aba, setAba] = useState("creditos");
  const [filtro, setFiltro] = useState("todos");

  const abrir = (it) => verDetalhe({
    chave: `item-${it.id}`, tag: it.camada, tone: it.tone, titulo: it.nome,
    subtitulo: `${it.preco} créditos`,
    instagram: acharEntidade(it.entidade)?.ig,
    corpo: it.pesado
      ? "Item de alto valor, resgatado como mercado puro: consome o saldo e as vagas são disputadas por ranking. Quem tem mais créditos no fim do semestre leva a vaga."
      : it.soEvento
        ? "Resgate liberado apenas durante o evento, direto no ponto de atendimento da entidade responsável."
        : "Entrega simples: procure a entidade responsável para retirar. Você mesmo confirma o recebimento no app.",
    publicadoPor: it.entidade,
    campos: [
      { k: "Preço", v: `${it.preco} créditos` },
      { k: "Entidade responsável", v: it.entidade },
      { k: "Seu saldo", v: `${estado.saldo} créditos` },
      { k: "Vagas no semestre", v: it.vagas ? `${it.vagas}` : null },
      { k: "Camada", v: it.camada },
    ],
  });

  const resgatar = (item) => {
    if (estado.saldo < item.preco) { toast("Saldo insuficiente para este item"); return; }
    setProcessando(item.id);
    setTimeout(() => {
      salvar((s) => ({
        ...s, saldo: s.saldo - item.preco,
        resgates: [{ id: Date.now(), nome: item.nome, preco: item.preco }, ...s.resgates],
        extrato: [{ id: Date.now(), espaco: `Resgate — ${item.nome}`, categoria: "resgate", creditos: -item.preco, validador: item.entidade, data: "agora" }, ...s.extrato],
      }));
      setProcessando(null);
      toast(`${item.nome} resgatado · recebimento confirmado por você`);
    }, 900);
  };

  const servicos = [...(estado.servicos || []), ...SERVICOS_EXEMPLO];
  const servicosFiltrados = servicos.filter((s) => filtro === "todos" || s.tipo === filtro);

  const abrirServico = (sv) => verDetalhe({
    chave: `servico-${sv.id}`,
    tag: sv.tipo === "oferta" ? "Oferece serviço" : "Procura profissional",
    tone: sv.tipo === "oferta" ? "green" : "amber",
    titulo: sv.titulo, subtitulo: sv.valor,
    corpo: sv.detalhe,
    publicadoPor: `${sv.pessoa}${sv.entidade ? ` · ${sv.entidade}` : ""}`,
    instagram: sv.portfolio,
    campos: [
      { k: "Área", v: sv.area },
      { k: "Valor", v: sv.valor },
      { k: "Quem publicou", v: sv.pessoa },
      { k: "Entidade", v: sv.entidade },
      { k: "Pagamento", v: "combinado direto entre as partes" },
    ],
  });

  if (aba === "servicos") {
    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2 p-in">
          <button onClick={() => setAba("creditos")}
            className="rounded-xl py-2.5 text-sm font-bold bg-white border border-purple-200 text-purple-700 transition-all active:scale-[.97]">
            trocas por crédito
          </button>
          <button className="rounded-xl py-2.5 text-sm font-bold bg-purple-800 text-creme">
            balcão de serviços
          </button>
        </div>

        <div className="relative rounded-2xl overflow-hidden h-[132px] p-in">
          <img src="/fotos/proj.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
          <span className="absolute inset-0 bg-gradient-to-t from-purple-900 via-purple-900/60 to-purple-900/20" />
          <div className="absolute inset-x-4 bottom-3">
            <Olho className="text-amber-400 mb-1">trabalho remunerado</Olho>
            <h2 className="text-creme text-[26px] font-black lowercase tracking-titulo leading-[0.92]">
              quem faz, aparece aqui
            </h2>
          </div>
        </div>

        <div className="bg-amber-100 border border-amber-300 rounded-2xl p-3 flex gap-2 p-in">
          <Briefcase size={16} className="text-amber-800 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 leading-snug">
            Aqui é dinheiro, não crédito. O praIA só publica o anúncio: valor, contrato e
            pagamento são combinados direto entre vocês.
          </p>
        </div>

        <div className="flex gap-2">
          {[
            { id: "todos", r: "tudo" },
            { id: "oferta", r: "ofereço" },
            { id: "procura", r: "procuro" },
          ].map((f) => (
            <button key={f.id} onClick={() => setFiltro(f.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95 ${
                filtro === f.id ? "bg-purple-800 text-creme" : "bg-white border border-purple-200 text-purple-700"}`}>
              {f.r}
            </button>
          ))}
        </div>

        {servicosFiltrados.length === 0 ? (
          <Card><p className="text-sm text-purple-500">Nenhum anúncio nesse filtro ainda.</p></Card>
        ) : servicosFiltrados.map((sv, i) => (
          <Card key={sv.id} delay={i * 55}>
            <button onClick={() => abrirServico(sv)} className="w-full text-left transition-all duration-150 active:scale-[.99]">
              <div className="flex items-center justify-between mb-2">
                <Pill tone={sv.tipo === "oferta" ? "green" : "amber"}>
                  {sv.tipo === "oferta" ? "oferece" : "procura"}
                </Pill>
                <span className="text-[11px] text-purple-500">{sv.area}</span>
              </div>
              <p className="text-sm font-bold text-purple-900 leading-snug">{sv.titulo}</p>
              <p className="text-sm text-purple-600 mt-1">{sv.valor}</p>
              <p className="text-[11px] text-purple-400 mt-1.5">
                {sv.pessoa}{sv.entidade ? ` · ${sv.entidade}` : ""}
              </p>
            </button>
          </Card>
        ))}

        <Btn variante="amarelo" onClick={abrirAnuncio} className="w-full flex items-center justify-center gap-2 py-3">
          <Plus size={16} /> anunciar meu serviço
        </Btn>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 p-in">
        <button className="rounded-xl py-2.5 text-sm font-bold bg-purple-800 text-creme">
          trocas por crédito
        </button>
        <button onClick={() => setAba("servicos")}
          className="rounded-xl py-2.5 text-sm font-bold bg-white border border-purple-200 text-purple-700 transition-all active:scale-[.97]">
          balcão de serviços
        </button>
      </div>

      <div className="bg-purple-800 rounded-2xl p-4 flex items-center justify-between p-in">
        <Olho className="text-amber-400">seu saldo</Olho>
        <span className="text-creme text-2xl font-black tracking-titulo tabular-nums">{estado.saldo}</span>
      </div>

      {CATALOGO.map((it, i) => {
        const pode = estado.saldo >= it.preco;
        return (
          <Card key={it.id} delay={i * 60} className={it.pesado ? "border-2 border-amber-400" : ""}>
            <button onClick={() => abrir(it)} className="w-full text-left transition-all duration-150 active:scale-[.99]">
              <div className="flex items-center gap-2 mb-2">
                {it.pesado && <Gift size={16} className="text-amber-600" />}
                <Pill tone={it.tone}>{it.camada}</Pill>
              </div>
              <p className="text-sm font-medium text-purple-900">{it.nome}</p>
              <p className="text-sm text-purple-600 mb-1">
                {it.preco} créditos · {it.entidade}
                {it.soEvento && " · só durante o evento"}
                {it.vagas && ` · ${it.vagas} vagas`}
              </p>
            </button>
            {it.pesado && (
              <>
                <Progress value={(estado.saldo / it.preco) * 100} />
                <p className="text-xs text-purple-500 mt-1 mb-2">Você tem {estado.saldo} de {it.preco}</p>
              </>
            )}
            <Btn variante={pode ? "suave" : "inativo"} disabled={!pode || processando === it.id}
              onClick={() => resgatar(it)} className="w-full py-2 mt-2">
              {processando === it.id ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-purple-300 border-t-purple-700 animate-spin" />
                  Processando
                </span>
              ) : pode ? "Trocar" : `Faltam ${it.preco - estado.saldo}`}
            </Btn>
          </Card>
        );
      })}

      {estado.resgates.length > 0 && (
        <Card delay={200}>
          <p className="text-sm font-medium text-purple-900 mb-2">Meus resgates</p>
          {estado.resgates.map((r) => (
            <div key={r.id} className="flex justify-between text-sm py-1">
              <span className="text-purple-800">{r.nome}</span>
              <span className="text-purple-500">−{r.preco}</span>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

function CheckinSheet({ espaco, onClose, onEnviar }) {
  const [etapa, setEtapa] = useState("scan");
  const [cat, setCat] = useState(null);
  const [horas, setHoras] = useState(2);
  const [fotos, setFotos] = useState([]);
  const [prog, setProg] = useState(0);

  useEffect(() => { const t = setTimeout(() => setEtapa("form"), 1700); return () => clearTimeout(t); }, []);

  const categoria = CATEGORIAS.find((c) => c.id === cat);
  const creditos = !categoria ? 0 : categoria.tipo === "fixo" ? categoria.fixo : Math.round(BASE_HORA * categoria.mult * horas);

  const enviar = () => {
    setEtapa("enviando");
    let p = 0;
    const id = setInterval(() => {
      p += 14; setProg(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(id);
        setTimeout(() => { onEnviar({ espaco, categoria, creditos, fotos }); onClose(); }, 300);
      }
    }, 80);
  };

  return (
    <div className="absolute inset-0 z-30 flex items-end" style={{ background: "rgba(46,33,86,.5)" }}>
      <div className="w-full bg-white rounded-t-3xl p-4 p-sheet max-h-[92%] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-purple-900">Check-in · {espaco.nome}</p>
          <button onClick={onClose} aria-label="Fechar"><X size={18} className="text-purple-400" /></button>
        </div>

        {etapa === "scan" && (
          <div className="py-6 p-in">
            <div className="relative w-40 h-40 mx-auto rounded-2xl border-2 border-purple-800 overflow-hidden bg-purple-50 flex items-center justify-center">
              <QrCode size={64} className="text-purple-300" />
              <div className="absolute left-0 right-0 h-0.5 bg-amber-400 p-scan" />
            </div>
            <p className="text-sm text-purple-600 text-center mt-4">Lendo o QR do espaço…</p>
          </div>
        )}

        {etapa === "form" && (
          <div className="space-y-3 p-in">
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-green-700" />
              <p className="text-xs text-green-800">QR válido · validador: {espaco.validador}</p>
            </div>

            <div>
              <p className="text-xs text-purple-600 mb-2">Categoria da ação</p>
              <div className="space-y-2">
                {CATEGORIAS.map((c) => (
                  <button key={c.id} onClick={() => setCat(c.id)}
                    className={`w-full text-left rounded-xl p-2.5 border transition-all duration-150 active:scale-[.99] ${
                      cat === c.id ? "bg-purple-800 border-purple-800" : "bg-white border-purple-200"}`}>
                    <span className={`text-sm ${cat === c.id ? "text-white" : "text-purple-900"}`}>{c.nome}</span>
                    <span className={`text-[11px] ml-2 ${cat === c.id ? "text-purple-200" : "text-purple-500"}`}>
                      {c.tipo === "fixo" ? `${c.fixo} fixos` : `${c.mult}×`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {categoria?.tipo === "hora" && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-purple-600">Horas trabalhadas</span>
                  <span className="text-purple-900 font-medium">{horas}h</span>
                </div>
                <input type="range" min="1" max="8" step="1" value={horas} onChange={(e) => setHoras(+e.target.value)} className="w-full accent-purple-800" />
              </div>
            )}

            <div>
              <p className="text-xs text-purple-600 mb-2">Registro do trabalho (opcional)</p>
              <MediaPicker fotos={fotos} setFotos={setFotos} max={2} />
            </div>

            {categoria && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-center p-pop">
                <p className="text-xs text-amber-800">Vale</p>
                <p className="text-xl font-medium text-amber-900">{creditos} créditos</p>
              </div>
            )}

            <Btn variante={cat ? "primario" : "inativo"} disabled={!cat} onClick={enviar}
              className="w-full flex items-center justify-center gap-2 py-3">
              <Send size={16} /> Enviar para validação
            </Btn>
            <p className="text-[11px] text-purple-400 text-center">
              O crédito entra na conta só depois que {espaco.validador} aprovar
            </p>
          </div>
        )}

        {etapa === "enviando" && (
          <div className="py-8 space-y-3 p-in">
            <p className="text-sm text-purple-900 text-center">Enviando check-in</p>
            <Progress value={prog} />
            <p className="text-xs text-purple-500 text-center">{prog}%</p>
          </div>
        )}
      </div>
    </div>
  );
}

function EspacosScreen({ estado, salvar, agendar, toast, focoEspaco, verDetalhe, abrirTreinos }) {
  const hojeDia = new Date().getDay();
  const treinosHoje = [...TREINOS_BASE, ...(estado.treinos || [])].filter((t) => t.dia === hojeDia);
  const [sel, setSel] = useState(focoEspaco || "praca");
  const [sheet, setSheet] = useState(false);
  const pronto = useLazy(sel, 380);
  useEffect(() => { if (focoEspaco) setSel(focoEspaco); }, [focoEspaco]);

  const espaco = ESPACOS.find((e) => e.id === sel);
  const agendaBase = {
    praca: [{ evento: "Roda de conversa: economia criativa", hora: "19h · hoje", dias: 0, h: 19, org: "Colegiado de Economia Criativa" },
            { evento: "Festa de encerramento", hora: "22h · sáb", dias: 5, h: 22, org: "Canil" }],
    auditorio: [{ evento: "Mesa: gestão cultural estudantil", hora: "14h · qui", dias: 3, h: 14, org: "CALC" }],
    estudio: [{ evento: "Gravação — cobertura semanal", hora: "10h · seg", dias: 7, h: 10, org: "Com Jr" }],
    convivencia: [], agencias: [], cafe: [],
  };
  const minhas = estado.reservas.filter((r) => r.espacoId === sel)
    .map((r) => ({ evento: r.titulo, hora: r.status === "pendente" ? "aguardando aprovação" : "aprovada", dias: 4, h: 18, org: "você", minha: true, status: r.status }));
  const lista = [...(agendaBase[sel] || []), ...minhas];

  const pedirReserva = () => {
    salvar((s) => ({ ...s, reservas: [{ id: Date.now(), espacoId: sel, titulo: `Atividade em ${espaco.nome}`, status: "pendente" }, ...s.reservas] }));
    toast(`Pedido enviado para ${espaco.validador} aprovar`);
  };

  const enviarCheckin = ({ espaco: esp, categoria, creditos, fotos }) => {
    salvar((s) => ({ ...s, pendentes: [{ id: Date.now(), espacoId: esp.id, espacoNome: esp.nome, categoria: categoria.id,
      categoriaNome: categoria.nome, creditos, validador: esp.validador, fotos }, ...s.pendentes] }));
    toast(`Check-in enviado · ${esp.validador} vai validar`);
  };

  const ocupacao = (id) =>
    (agendaBase[id]?.length || 0) + estado.reservas.filter((r) => r.espacoId === id).length;

  return (
    <div className="space-y-3">
      {/* Tiras horizontais com foto: a escolha do espaço vira navegação visual */}
      <div className="-mx-3 px-3 overflow-x-auto pb-1">
        <div className="flex gap-2 w-max">
          {ESPACOS.map((e, i) => {
            const ativo = sel === e.id;
            const n = ocupacao(e.id);
            return (
              <button key={e.id} onClick={() => setSel(e.id)}
                className={`relative w-[132px] h-[92px] rounded-2xl overflow-hidden shrink-0 text-left p-in transition-all duration-200 active:scale-[.97] ${
                  ativo ? "ring-[3px] ring-amber-400" : "opacity-80"}`}
                style={{ animationDelay: `${i * 45}ms` }}>
                <img src={e.foto} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <span className="absolute inset-0 bg-gradient-to-t from-purple-900 via-purple-900/45 to-transparent" />
                {n > 0 && (
                  <span className="absolute top-2 right-2 bg-amber-400 text-purple-900 text-[10px] font-bold rounded-full px-1.5 py-0.5">
                    {n}
                  </span>
                )}
                <span className="absolute left-2.5 right-2.5 bottom-2">
                  <span className="block text-creme text-[13px] font-bold leading-tight">{e.nome}</span>
                  <span className="block text-purple-200 text-[10px]">{e.area}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {!pronto ? <Skeleton rows={2} /> : (
        <>
          {/* Capa do espaço selecionado */}
          <div className="relative rounded-2xl overflow-hidden h-[190px] p-in">
            <img src={espaco.foto} alt={espaco.nome} className="absolute inset-0 w-full h-full object-cover" />
            <span className="absolute inset-0 bg-gradient-to-t from-purple-900 via-purple-900/55 to-purple-900/10" />
            <div className="absolute inset-x-4 bottom-4">
              <Olho className="text-amber-400 mb-1.5">{espaco.cobertura} · {espaco.capacidade}</Olho>
              <h2 className="text-creme text-[30px] font-black lowercase tracking-titulo leading-[0.92]">
                {espaco.nome}
              </h2>
              <p className="text-purple-100 text-xs mt-1.5 leading-snug">{espaco.resumo}</p>
            </div>
            <Elemento nome="faisca" tamanho={26} className="absolute top-3 right-3 drop-shadow" />
          </div>

          {/* Ações grandes, lado a lado */}
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setSheet(true)}
              className="rounded-2xl bg-purple-800 text-creme p-4 text-left transition-all duration-150 active:scale-[.97] p-in">
              <QrCode size={22} className="mb-2 text-amber-400" />
              <p className="text-sm font-bold lowercase">fazer check-in</p>
              <p className="text-[11px] text-purple-300 leading-tight mt-0.5">trabalhei aqui, quero crédito</p>
            </button>
            <button onClick={pedirReserva}
              className="rounded-2xl bg-amber-400 text-purple-900 p-4 text-left transition-all duration-150 active:scale-[.97] p-in"
              style={{ animationDelay: "60ms" }}>
              <Calendar size={22} className="mb-2" />
              <p className="text-sm font-bold lowercase">reservar</p>
              <p className="text-[11px] text-purple-800/70 leading-tight mt-0.5">quero usar numa data</p>
            </button>
          </div>

          {/* Grade de treinos da ECAtlética */}
          <button onClick={abrirTreinos}
            className="w-full bg-purple-400 rounded-2xl p-4 flex items-center gap-3 text-left p-in transition-all duration-200 active:scale-[.98]"
            style={{ animationDelay: "30ms" }}>
            <Elemento nome="raios" tamanho={34} className="shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-creme text-[17px] font-black lowercase tracking-titulo leading-none">
                treinos da semana
              </p>
              <p className="text-purple-100 text-[11px] mt-1 leading-snug">
                {treinosHoje.length > 0
                  ? `${treinosHoje.length} treino(s) hoje · grade completa da ECAtlética`
                  : "grade completa dos times da ECAtlética"}
              </p>
            </div>
            <ChevronRight size={18} className="text-creme shrink-0" />
          </button>

          {/* Quem cuida do espaço */}
          <Card delay={40}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                <ShieldCheck size={18} className="text-purple-700" />
              </div>
              <div className="min-w-0">
                <p className="text-sm text-purple-900 truncate">{espaco.validador}</p>
                <p className="text-[11px] text-purple-500">valida os check-ins · mandato de 1 ano</p>
              </div>
            </div>
          </Card>

          <Card delay={60}>
            <div className="flex items-center gap-2 mb-3">
              <Calendar size={16} className="text-purple-600" />
              <p className="text-sm font-medium text-purple-900">Agenda do semestre</p>
            </div>
            {lista.length === 0 ? (
              <p className="text-sm text-purple-500">Nenhuma reserva. O espaço está livre o semestre todo.</p>
            ) : (
              <div className="space-y-3">
                {lista.map((a, i) => (
                  <div key={i} className="flex items-center justify-between gap-2 p-in" style={{ animationDelay: `${i * 55}ms` }}>
                    <button
                      onClick={() => {
                        const d = new Date(); d.setDate(d.getDate() + a.dias); d.setHours(a.h, 0, 0, 0);
                        verDetalhe({
                          chave: `agenda-${sel}-${i}`, tag: "Reserva", tone: "amber", titulo: a.evento,
                          subtitulo: `${espaco.nome} · ${a.hora}`,
                          corpo: a.minha
                            ? "Sua solicitação de reserva. O validador do espaço precisa aprovar antes de confirmar."
                            : "Reserva já aprovada pelo validador do espaço.",
                          publicadoPor: a.org,
                          espacoId: sel,
                          campos: [
                            { k: "Espaço", v: `${espaco.nome} (${espaco.area})` },
                            { k: "Horário", v: a.hora },
                            { k: "Organização", v: a.org },
                            { k: "Validador", v: espaco.validador },
                            { k: "Situação", v: a.status === "pendente" ? "aguardando aprovação" : "confirmada" },
                          ],
                          agenda: a.status === "pendente" ? null
                            : { titulo: a.evento, local: `${espaco.nome} — Prainha, ECA-USP`, inicio: d, descricao: `Organização: ${a.org}` },
                        });
                      }}
                      className="min-w-0 text-left flex-1 transition-all duration-150 active:scale-[.99]">
                      <p className="text-sm text-purple-900 truncate">{a.evento}</p>
                      <p className="text-xs text-purple-500 truncate">{a.hora} · {a.org}</p>
                    </button>
                    {a.status === "pendente" ? (
                      <Pill tone="amber">na fila</Pill>
                    ) : (
                      <Btn variante="suave" aria-label="Adicionar à agenda" className="w-9 h-9 shrink-0 flex items-center justify-center"
                        onClick={() => {
                          const d = new Date(); d.setDate(d.getDate() + a.dias); d.setHours(a.h, 0, 0, 0);
                          agendar({ titulo: a.evento, local: `${espaco.nome} — Prainha, ECA-USP`, inicio: d, descricao: `Organização: ${a.org}` });
                        }}>
                        <CalendarPlus size={16} />
                      </Btn>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}

      {sheet && <CheckinSheet espaco={espaco} onClose={() => setSheet(false)} onEnviar={enviarCheckin} />}
    </div>
  );
}

function RedeScreen({ agendar, estado, salvar, toast, verDetalhe }) {
  const grupos = [
    { n: "Entidades", q: 7, d: "ECAtlética, Bateréca, Canil, CALC, RD, ECA Jr, Opá Negra, Jornalismo Jr e representação de funcionários" },
    { n: "Colegiados", q: 14, d: "Infra, Estágios, Pertencimento, Esportes, Economia Criativa, Institucional, Inovação, Patrimônio, Cultura e Extensão, Eventos, Mecenato, Acessibilidade, Educação e Vivência" },
    { n: "Departamento", q: 9, d: "CCA, CAP, CJE, CTR, CRP, CAC, CMU, CBD e EAD" },
    { n: "Câmaras", q: 4, d: "Educação Esporte e Lazer, Desenvolvimento e Finanças, Desenvolvimento artístico cultural e Fiscalização contábil" },
  ];
  const orgaos = [
    { p: "Comissão de Pontos", n: "Bia, Théo, Rafa", d: "opera créditos e aloca a reserva",
      det: "Eleita em assembleia, com mandato de 1 ano renovável uma vez. Opera a emissão de créditos, calibra valores dentro dos limites votados em plenário, homologa ou veta validadores com justificativa registrada, assume espaços sem validador indicado e decide a alocação da Reserva Comunitária." },
    { p: "Câmara de Fiscalização", n: "Igor, Duda", d: "auditoria amostral de check-ins, resgates e reserva",
      det: "Faz auditoria amostral retroativa: puxa registros aleatórios do período e confronta com evidência. Cobre três frentes — check-ins de emissão, resgates do Mercado e decisões de alocação da Reserva. É a salvaguarda que substitui o teto de emissão." },
    { p: "Comissão Anti-Opressão", n: "Mari, Yuri, Cec", d: "apura denúncias e aplica medidas",
      det: "Recebe denúncias pelo canal protegido do app, com prazo de resposta de 72h. Pode aplicar medidas que suspendem o acesso às abas comunitárias, mantendo sempre liberada a área acadêmica. A pessoa denunciada tem direito a defesa e recurso." },
  ];

  const dataAssembleia = () => { const d = new Date(); d.setDate(d.getDate() + 18); d.setHours(18, 0, 0, 0); return d; };

  const abrirAssembleia = () => verDetalhe({
    chave: "assembleia-28", tag: "Assembleia", tone: "purple", titulo: "Assembleia geral",
    subtitulo: "28/08 · 18h · Praça Coberta",
    corpo: "Instância soberana da comunidade. Pauta desta edição: calendário de reservas do semestre e eleição da nova Câmara de Fiscalização.",
    publicadoPor: "Modelo Representativo",
    reuniao: true, presentesBase: 47,
    espacoId: "praca",
    campos: [
      { k: "Local", v: "Praça Coberta, ECA-USP" },
      { k: "Quando", v: "28/08, 18h" },
      { k: "Crédito", v: "Deliberativo, valor fixo por reunião" },
      { k: "Validação de presença", v: "Comissão de Pontos, no dia" },
    ],
    agenda: { titulo: "Assembleia geral — praIA", local: "Praça Coberta, ECA-USP", inicio: dataAssembleia(), descricao: "Presença gera crédito Deliberativo" },
  });

  return (
    <div className="space-y-3">
      <Card>
        <p className="text-sm font-medium text-purple-900 mb-3">Modelo representativo · 32 cadeiras</p>
        <div className="grid grid-cols-2 gap-2">
          {grupos.map((g, i) => (
            <button key={g.n} onClick={() => verDetalhe({
              chave: `grupo-${g.n}`, tag: "Modelo representativo", titulo: g.n,
              subtitulo: `${g.q} cadeiras`, corpo: g.d, publicadoPor: "Estatuto MECAUSP",
              campos: [{ k: "Cadeiras", v: `${g.q}` }, { k: "Total do plenário", v: "32 cadeiras" }],
            })}
              className="bg-purple-50 rounded-xl p-3 text-left p-pop transition-all duration-150 active:scale-[.97]"
              style={{ animationDelay: `${i * 65}ms` }}>
              <p className="text-lg font-medium text-purple-900">{g.q}</p>
              <p className="text-xs text-purple-600">{g.n}</p>
            </button>
          ))}
        </div>
      </Card>

      <Card delay={80}>
        <button onClick={abrirAssembleia} className="w-full text-left transition-all duration-150 active:scale-[.99]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-purple-900">Próxima assembleia</p>
            <Calendar size={16} className="text-purple-500" />
          </div>
          <p className="text-sm text-purple-600 mb-1">28/08 · Praça Coberta · presença gera crédito Deliberativo</p>
          <span className="inline-flex items-center gap-1 text-xs text-purple-500 mb-3">
            {estado.presencas?.["assembleia-28"] ? "Presença confirmada" : "Ver pauta e confirmar presença"}
            <ChevronRight size={13} />
          </span>
        </button>
        <Btn variante="amarelo" className="w-full flex items-center justify-center gap-2 py-2.5"
          onClick={() => agendar({ titulo: "Assembleia geral — praIA", local: "Praça Coberta, ECA-USP", inicio: dataAssembleia(), descricao: "Presença gera crédito Deliberativo" })}>
          <CalendarPlus size={16} /> Adicionar à minha agenda
        </Btn>
      </Card>

      <Card delay={140}>
        <p className="text-sm font-medium text-purple-900 mb-3">Quem faz o quê</p>
        <div className="space-y-3">
          {orgaos.map((r) => (
            <button key={r.p} onClick={() => verDetalhe({
              chave: `orgao-${r.p}`, tag: "Órgão", titulo: r.p, subtitulo: r.d, corpo: r.det,
              publicadoPor: "Modelo Representativo",
              campos: [{ k: "Composição atual", v: r.n }, { k: "Mandato", v: "1 ano, renovável" }],
            })}
              className="w-full flex items-start justify-between gap-2 text-left transition-all duration-150 active:scale-[.99]">
              <div>
                <p className="text-sm text-purple-900">{r.p}</p>
                <p className="text-xs text-purple-500">{r.n}</p>
                <p className="text-[11px] text-purple-400">{r.d}</p>
              </div>
              <ChevronRight size={16} className="text-purple-300 shrink-0 mt-1" />
            </button>
          ))}
        </div>
      </Card>

      <Card delay={170}>
        <div className="flex items-center gap-2 mb-3">
          <Instagram size={16} className="text-purple-600" />
          <p className="text-sm font-medium text-purple-900">Entidades no Instagram</p>
        </div>
        <div className="space-y-2">
          {ENTIDADES.map((e, i) => (
            <div key={e.nome} className="flex items-center justify-between gap-2 p-in" style={{ animationDelay: `${i * 40}ms` }}>
              <button onClick={() => verDetalhe({
                chave: `entidade-${e.nome}`, tag: e.tipo, tone: "amber", titulo: e.nome,
                subtitulo: `@${e.ig}`,
                corpo: "Acompanhe a produção e a agenda desta entidade direto no Instagram. Os eventos oficiais também aparecem no Mural do praIA.",
                publicadoPor: e.nome, instagram: e.ig,
                campos: [{ k: "Tipo", v: e.tipo }, { k: "Instagram", v: `@${e.ig}` }],
              })}
                className="min-w-0 text-left flex-1 transition-all duration-150 active:scale-[.99]">
                <p className="text-sm text-purple-900 truncate">{e.nome}</p>
                <p className="text-[11px] text-purple-500 truncate">{e.tipo} · @{e.ig}</p>
              </button>
              <a href={urlInstagram(e.ig)} target="_blank" rel="noopener noreferrer" aria-label={`Instagram de ${e.nome}`}
                className="w-9 h-9 shrink-0 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center transition-all active:scale-90">
                <Instagram size={16} className="text-purple-700" />
              </a>
            </div>
          ))}
        </div>
      </Card>

      <Card delay={210}>
        <p className="text-sm font-medium text-purple-900 mb-2">Reserva Comunitária</p>
        <p className="text-sm text-purple-600">
          Total doado pela comunidade neste semestre: {1240 + estado.doado} créditos.
          Alocação decidida pela Comissão de Pontos e auditada pela Câmara.
        </p>
      </Card>
    </div>
  );
}

function ValidadorScreen({ estado, salvar, toast }) {
  const filaCheckins = estado.pendentes;
  const filaReservas = estado.reservas.filter((r) => r.status === "pendente");

  const aprovar = (p) => {
    salvar((s) => ({
      ...s, saldo: s.saldo + p.creditos, pendentes: s.pendentes.filter((x) => x.id !== p.id),
      extrato: [{ id: Date.now(), espaco: p.espacoNome, categoria: p.categoria, creditos: p.creditos, validador: p.validador, data: "hoje" }, ...s.extrato],
    }));
    toast(`Check-in aprovado · +${p.creditos} créditos`);
  };
  const recusar = (p) => {
    salvar((s) => ({ ...s, pendentes: s.pendentes.filter((x) => x.id !== p.id) }));
    toast("Check-in recusado");
  };
  const aprovarReserva = (r) => {
    salvar((s) => ({ ...s, reservas: s.reservas.map((x) => (x.id === r.id ? { ...x, status: "aprovada" } : x)) }));
    toast("Reserva aprovada");
  };

  return (
    <div className="space-y-3">
      <div className="bg-purple-50 border border-purple-200 rounded-2xl p-3 flex gap-2 p-in">
        <ShieldCheck size={16} className="text-purple-700 shrink-0 mt-0.5" />
        <p className="text-xs text-purple-800">
          Modo validador. Você nunca pode aprovar o próprio check-in — o sistema bloqueia.
        </p>
      </div>

      <Card>
        <div className="flex items-center gap-2 mb-3">
          <Inbox size={16} className="text-purple-600" />
          <p className="text-sm font-medium text-purple-900">Check-ins na fila ({filaCheckins.length})</p>
        </div>
        {filaCheckins.length === 0 ? (
          <p className="text-sm text-purple-500">Nada pendente. Faça um check-in em Espaços para ver o fluxo.</p>
        ) : (
          <div className="space-y-3">
            {filaCheckins.map((p, i) => (
              <div key={p.id} className="border border-purple-100 rounded-xl p-3 p-in" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="text-sm text-purple-900">{p.espacoNome}</p>
                    <p className="text-xs text-purple-500">{p.categoriaNome}</p>
                  </div>
                  <span className="text-sm font-medium text-amber-600">+{p.creditos}</span>
                </div>
                {p.fotos?.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 my-2">
                    {p.fotos.map((f) => <img key={f.id} src={f.url} alt="" className="w-full h-20 object-cover rounded-lg" />)}
                  </div>
                )}
                <div className="flex gap-2 mt-2">
                  <Btn variante="primario" onClick={() => aprovar(p)} className="flex-1 py-2">Aprovar</Btn>
                  <Btn variante="suave" onClick={() => recusar(p)} className="flex-1 py-2">Recusar</Btn>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card delay={80}>
        <p className="text-sm font-medium text-purple-900 mb-3">Reservas na fila ({filaReservas.length})</p>
        {filaReservas.length === 0 ? (
          <p className="text-sm text-purple-500">Nenhuma reserva aguardando.</p>
        ) : (
          <div className="space-y-2">
            {filaReservas.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-2">
                <p className="text-sm text-purple-900 truncate">{r.titulo}</p>
                <Btn variante="primario" onClick={() => aprovarReserva(r)} className="px-3 py-1.5 shrink-0">Aprovar</Btn>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function PerfilScreen({ estado, salvar, agendar, abrirComposer, toast, verDetalhe }) {
  const penalizado = !!estado.penalidade;
  const [editando, setEditando] = useState(false);
  const [fotoSheet, setFotoSheet] = useState(false);
  const vinculos = estado.usuario?.vinculos || [];

  const setVinculos = (atualizador) => {
    salvar((s) => ({
      ...s,
      usuario: {
        ...s.usuario,
        vinculos: typeof atualizador === "function" ? atualizador(s.usuario.vinculos || []) : atualizador,
      },
    }));
  };

  const definirAvatar = (url) => salvar((s) => ({ ...s, usuario: { ...s.usuario, avatar: url } }));

  const tarefas = [
    { t: "Entrega — Roteiro Audiovisual II", d: "sex, 22/08", dias: 12, urgente: true },
    { t: "Prova — Teorias da Comunicação", d: "seg, 25/08", dias: 15, urgente: false },
    { t: "Trabalho final — Economia Criativa", d: "qua, 03/09", dias: 24, urgente: false },
  ];

  return (
    <div className="space-y-3">
      <Card>
        <div className="flex items-center gap-3">
          <button onClick={() => setFotoSheet(true)} aria-label="Trocar foto de perfil" className="relative w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-purple-800 font-medium overflow-hidden shrink-0 transition-all duration-150 active:scale-95">
            {estado.usuario?.avatar
              ? <img src={estado.usuario.avatar} alt="" className="w-full h-full object-cover" />
              : (estado.usuario?.nome || "??").slice(0, 2).toUpperCase()}
            <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-purple-800 flex items-center justify-center">
              <Camera size={11} className="text-white" />
            </span>
          </button>
          <div className="min-w-0">
            <p className="text-sm font-medium text-purple-900 truncate">{estado.usuario?.nome}</p>
            <p className="text-xs text-purple-500 truncate">
              {vinculos.length === 0
                ? "Sem vínculo cadastrado"
                : vinculos.map((v) => v.nome).join(" · ")}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[{ v: estado.saldo, l: "créditos" }, { v: estado.extrato.filter((e) => e.creditos > 0).length, l: "check-ins" }, { v: estado.doado, l: "doados" }].map((m) => (
            <div key={m.l} className="text-center">
              <p className="text-lg font-medium text-purple-900 tabular-nums">{m.v}</p>
              <p className="text-[11px] text-purple-500">{m.l}</p>
            </div>
          ))}
        </div>
      </Card>

      {penalizado && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 p-in">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={16} className="text-red-700" />
            <p className="text-sm font-medium text-red-800">Acesso restrito</p>
          </div>
          <p className="text-sm text-red-700 mb-3">
            Medida da Comissão Anti-Opressão · protocolo {estado.penalidade.protocolo}.
            Abas comunitárias suspensas por 30 dias. A área acadêmica segue liberada.
          </p>
          <Btn variante="suave" onClick={() => toast("Defesa registrada · a comissão responde em até 7 dias")} className="w-full py-2">
            Apresentar defesa ou recorrer
          </Btn>
        </div>
      )}

      <Card delay={60}>
        <button onClick={() => salvar((s) => ({ ...s, onboarded: false }))}
          className="w-full flex items-center justify-between text-left transition-all duration-150 active:scale-[.99]">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-purple-600" />
            <p className="text-sm text-purple-900">Como o praIA funciona</p>
          </div>
          <ChevronRight size={16} className="text-purple-300" />
        </button>
      </Card>

      <Card delay={90}>
        <div className="flex items-center gap-2 mb-3">
          <GraduationCap size={16} className="text-purple-600" />
          <p className="text-sm font-medium text-purple-900">Área acadêmica</p>
        </div>
        <div className="space-y-3">
          {tarefas.map((a, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm text-purple-900 truncate">{a.t}</p>
                <p className={`text-xs ${a.urgente ? "text-amber-600" : "text-purple-500"}`}>{a.d}</p>
              </div>
              <Btn variante="suave" aria-label="Adicionar à agenda" className="w-9 h-9 shrink-0 flex items-center justify-center"
                onClick={() => {
                  const d = new Date(); d.setDate(d.getDate() + a.dias); d.setHours(9, 0, 0, 0);
                  agendar({ titulo: a.t, local: "ECA-USP", inicio: d, duracaoHoras: 1 });
                }}>
                <CalendarPlus size={16} />
              </Btn>
            </div>
          ))}
        </div>
      </Card>

      {!penalizado && (
        <>
          <Card delay={120}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-purple-900">Minhas entidades</p>
              <button onClick={() => setEditando(!editando)} className="text-xs text-purple-600 transition-all active:scale-95">
                {editando ? "Concluir" : "Editar"}
              </button>
            </div>

            {editando ? (
              <div className="p-in">
                <EditorVinculos vinculos={vinculos} setVinculos={setVinculos} compacto />
              </div>
            ) : vinculos.length === 0 ? (
              <div className="text-center py-2">
                <p className="text-sm text-purple-500 mb-3">Nenhuma entidade cadastrada ainda.</p>
                <Btn variante="suave" onClick={() => setEditando(true)} className="w-full flex items-center justify-center gap-2 py-2.5">
                  <Plus size={16} /> Adicionar entidade e cargo
                </Btn>
              </div>
            ) : (
              <div className="space-y-2">
                {vinculos.map((v, i) => (
                  <div key={v.id} className="flex items-center justify-between gap-2 p-in" style={{ animationDelay: `${i * 50}ms` }}>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-purple-900 truncate">{v.nome}</p>
                      {v.ig && <p className="text-[11px] text-purple-400 truncate">@{v.ig}</p>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Pill tone="amber">{v.cargo}</Pill>
                      {v.ig && (
                        <a href={urlInstagram(v.ig)} target="_blank" rel="noopener noreferrer" aria-label={`Instagram de ${v.nome}`}
                          className="w-8 h-8 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center transition-all active:scale-90">
                          <Instagram size={15} className="text-purple-700" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card delay={150}>
            <p className="text-sm font-medium text-purple-900 mb-3">Vitrine</p>
            {estado.extrato.filter((e) => e.creditos > 0).length === 0 ? (
              <p className="text-sm text-purple-500">Seu histórico aparece aqui conforme você participa.</p>
            ) : (
              <div className="space-y-2 text-sm">
                {estado.extrato.filter((e) => e.creditos > 0).slice(0, 4).map((e) => (
                  <div key={e.id} className="flex items-center justify-between">
                    <span className="text-purple-900 truncate">{e.espaco}</span>
                    <span className="text-xs text-purple-500 shrink-0 ml-2">+{e.creditos}</span>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[11px] text-purple-400 mt-2">Preenchida sozinha pelo que você faz na comunidade</p>
          </Card>

          <Card delay={180}>
            <div className="flex items-center gap-2 mb-3">
              <Lock size={14} className="text-purple-400" />
              <p className="text-sm font-medium text-purple-900">Timeline pessoal</p>
              <span className="text-[11px] text-purple-400 ml-auto">só conexões</span>
            </div>
            {estado.timeline.length === 0 ? (
              <p className="text-sm text-purple-500">Nada publicado ainda.</p>
            ) : (
              <div className="space-y-4">
                {estado.timeline.map((p) => (
                  <div key={p.id} className="p-in">
                    <p className="text-sm text-purple-800">{p.texto}</p>
                    {p.fotos?.length > 0 && (
                      <div className={`grid gap-2 mt-2 ${p.fotos.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                        {p.fotos.map((f) => <img key={f.id} src={f.url} alt="" className="w-full h-28 object-cover rounded-xl" />)}
                      </div>
                    )}
                    <p className="text-[11px] text-purple-400 mt-1">{p.quando}</p>
                  </div>
                ))}
              </div>
            )}
            <Btn variante="suave" onClick={abrirComposer} className="w-full mt-4 flex items-center justify-center gap-2 py-2.5">
              <Plus size={16} /> Nova publicação
            </Btn>
          </Card>
        </>
      )}

      {fotoSheet && <FotoPerfilSheet onClose={() => setFotoSheet(false)} onEscolher={definirAvatar} />}
    </div>
  );
}

function FotoPerfilSheet({ onClose, onEscolher }) {
  const cam = useRef(null);
  const gal = useRef(null);
  const [carregando, setCarregando] = useState(false);

  const pegar = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    setCarregando(true);
    const url = await comprimir(f, 400);
    setCarregando(false);
    if (url) { onEscolher(url); onClose(); }
  };

  return (
    <div className="absolute inset-0 z-30 flex items-end" style={{ background: "rgba(46,33,86,.5)" }}>
      <div className="w-full bg-white rounded-t-3xl p-4 p-sheet">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-purple-900">Foto de perfil</p>
          <button onClick={onClose} aria-label="Fechar"><X size={18} className="text-purple-400" /></button>
        </div>
        <input ref={cam} type="file" accept="image/*" capture="user" onChange={pegar} className="hidden" />
        <input ref={gal} type="file" accept="image/*" onChange={pegar} className="hidden" />
        {carregando ? (
          <div className="p-sk h-24 rounded-xl" />
        ) : (
          <div className="space-y-2">
            <Btn variante="primario" onClick={() => cam.current?.click()} className="w-full flex items-center justify-center gap-2 py-3">
              <Camera size={16} /> Tirar foto agora
            </Btn>
            <Btn variante="suave" onClick={() => gal.current?.click()} className="w-full flex items-center justify-center gap-2 py-3">
              <ImageIcon size={16} /> Escolher da galeria
            </Btn>
            <Btn variante="suave" onClick={() => { onEscolher(null); onClose(); }} className="w-full py-3">
              Remover foto atual
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}

function DetalheSheet({ item, estado, salvar, agendar, toast, onClose, irPara }) {
  const confirmado = !!estado.presencas?.[item.chave];
  const totalPresentes = (item.presentesBase || 0) + (confirmado ? 1 : 0);

  const alternarPresenca = () => {
    salvar((s) => {
      const p = { ...(s.presencas || {}) };
      if (p[item.chave]) delete p[item.chave]; else p[item.chave] = true;
      return { ...s, presencas: p };
    });
    toast(confirmado ? "Presença cancelada" : "Presença confirmada");
  };

  return (
    <div className="absolute inset-0 z-30 flex items-end" style={{ background: "rgba(46,33,86,.5)" }}>
      <div className="w-full bg-white rounded-t-3xl p-in max-h-[94%] overflow-y-auto p-sheet">
        <div className="sticky top-0 bg-white flex items-center justify-between px-4 pt-4 pb-2">
          <div className="flex items-center gap-2 min-w-0">
            {item.tag && <Pill tone={item.tone || "purple"}>{item.tag}</Pill>}
          </div>
          <button onClick={onClose} aria-label="Fechar"><X size={18} className="text-purple-400" /></button>
        </div>

        <div className="px-4 pb-5 space-y-4">
          <div>
            <p className="text-2xl font-black lowercase tracking-titulo text-purple-800 leading-[0.95]">{item.titulo}</p>
            {item.subtitulo && <p className="text-sm text-purple-500 mt-0.5">{item.subtitulo}</p>}
          </div>

          {item.fotos?.length > 0 && (
            <div className={`grid gap-2 ${item.fotos.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
              {item.fotos.map((f) => (
                <img key={f.id} src={f.url} alt="" className="w-full h-36 object-cover rounded-xl p-in" />
              ))}
            </div>
          )}

          {item.corpo && <p className="text-sm text-purple-700 leading-relaxed">{item.corpo}</p>}

          {item.campos?.length > 0 && (
            <div className="bg-purple-50 rounded-2xl p-3 space-y-2">
              {item.campos.filter((c) => c.v).map((c, i) => (
                <div key={i} className="flex items-start justify-between gap-3 text-sm p-in" style={{ animationDelay: `${i * 40}ms` }}>
                  <span className="text-purple-500 shrink-0">{c.k}</span>
                  <span className="text-purple-900 text-right">{c.v}</span>
                </div>
              ))}
            </div>
          )}

          {item.publicadoPor && (
            <div className="flex items-center gap-2 text-xs text-purple-400">
              <UserCircle2 size={14} />
              <span>Informações publicadas por {item.publicadoPor}</span>
            </div>
          )}

          {item.reuniao && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-amber-900">
                  {totalPresentes} pessoa{totalPresentes === 1 ? "" : "s"} confirmada{totalPresentes === 1 ? "" : "s"}
                </p>
                {confirmado && <CheckCircle2 size={16} className="text-green-700 p-pop" />}
              </div>
              <Btn variante={confirmado ? "suave" : "primario"} onClick={alternarPresenca}
                className="w-full flex items-center justify-center gap-2 py-2.5">
                <CheckCircle2 size={16} />
                {confirmado ? "Cancelar presença" : "Confirmar presença"}
              </Btn>
              <p className="text-[11px] text-amber-700 mt-2">
                A presença gera crédito Deliberativo depois que a Comissão de Pontos valida no dia.
              </p>
            </div>
          )}

          {item.instagram && (
            <BotaoInstagram handle={item.instagram} className="w-full py-3"
              rotulo={`Ver @${String(item.instagram).replace(/^@/, "")} no Instagram`} />
          )}

          <div className="flex gap-2">
            {item.agenda && (
              <Btn variante="amarelo" onClick={() => agendar(item.agenda)} className="flex-1 flex items-center justify-center gap-2 py-2.5">
                <CalendarPlus size={16} /> Agenda
              </Btn>
            )}
            {item.espacoId && (
              <Btn variante="suave" onClick={() => { onClose(); irPara("espacos", item.espacoId); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5">
                <QrCode size={16} /> Check-in
              </Btn>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AchadosSheet({ onClose, onRegistrar, usuario }) {
  const [modo, setModo] = useState("perdi");
  const [item, setItem] = useState("");
  const [local, setLocal] = useState("");
  const [contato, setContato] = useState("");
  const [fotos, setFotos] = useState([]);
  const [etapa, setEtapa] = useState("form");
  const [prog, setProg] = useState(0);

  const enviar = () => {
    setEtapa("enviando");
    let p = 0;
    const id = setInterval(() => {
      p += 16; setProg(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(id);
        setTimeout(() => {
          onRegistrar({ modo, item, local, contato, fotos, autor: usuario?.nome });
          setEtapa("ok");
        }, 250);
      }
    }, 85);
  };

  return (
    <div className="absolute inset-0 z-30 flex items-end" style={{ background: "rgba(46,33,86,.5)" }}>
      <div className="w-full bg-white rounded-t-3xl p-4 p-sheet max-h-[92%] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Search size={18} className="text-purple-700" />
            <p className="text-sm font-medium text-purple-900">Achados e perdidos</p>
          </div>
          <button onClick={onClose} aria-label="Fechar"><X size={18} className="text-purple-400" /></button>
        </div>

        {etapa === "form" && (
          <div className="space-y-3 p-in">
            <div className="grid grid-cols-2 gap-2">
              <Btn variante={modo === "perdi" ? "primario" : "suave"} onClick={() => setModo("perdi")} className="py-2.5">
                Perdi algo
              </Btn>
              <Btn variante={modo === "achei" ? "primario" : "suave"} onClick={() => setModo("achei")} className="py-2.5">
                Achei algo
              </Btn>
            </div>

            <input value={item} onChange={(e) => setItem(e.target.value)}
              placeholder={modo === "perdi" ? "O que você perdeu" : "O que você encontrou"}
              className="w-full text-sm border border-purple-200 rounded-xl p-3 text-purple-900 placeholder-purple-300 focus:outline-none focus:border-purple-500 transition-colors" />

            <input value={local} onChange={(e) => setLocal(e.target.value)}
              placeholder={modo === "perdi" ? "Onde você acha que perdeu" : "Onde encontrou"}
              className="w-full text-sm border border-purple-200 rounded-xl p-3 text-purple-900 placeholder-purple-300 focus:outline-none focus:border-purple-500 transition-colors" />

            <div className="flex flex-wrap gap-1.5">
              {ESPACOS.map((e) => (
                <button key={e.id} onClick={() => setLocal(e.nome)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-white border border-purple-200 text-purple-700 transition-all active:scale-95">
                  {e.nome}
                </button>
              ))}
            </div>

            <input value={contato} onChange={(e) => setContato(e.target.value)}
              placeholder="Como te encontrar (instagram, telefone)"
              className="w-full text-sm border border-purple-200 rounded-xl p-3 text-purple-900 placeholder-purple-300 focus:outline-none focus:border-purple-500 transition-colors" />

            <div>
              <p className="text-xs text-purple-600 mb-2">Foto do item (opcional)</p>
              <MediaPicker fotos={fotos} setFotos={setFotos} max={2} />
            </div>

            {modo === "achei" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
                <Sparkles size={16} className="text-amber-700 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  Se puder, deixe o item com o validador do espaço. Assim quem procura sabe onde retirar.
                </p>
              </div>
            )}

            <Btn variante={item.trim() ? "primario" : "inativo"} disabled={!item.trim()} onClick={enviar}
              className="w-full flex items-center justify-center gap-2 py-3">
              <Send size={16} /> Publicar no achados e perdidos
            </Btn>
            <p className="text-[11px] text-purple-400 text-center">
              O aviso aparece no Mural para toda a comunidade
            </p>
          </div>
        )}

        {etapa === "enviando" && (
          <div className="py-8 space-y-3 p-in">
            <p className="text-sm text-purple-900 text-center">Publicando aviso</p>
            <Progress value={prog} />
            <p className="text-xs text-purple-500 text-center">{prog}%</p>
          </div>
        )}

        {etapa === "ok" && (
          <div className="py-6 text-center space-y-3 p-in">
            <div className="w-14 h-14 mx-auto rounded-full bg-green-100 flex items-center justify-center p-pop">
              <CheckCircle2 size={24} className="text-green-700" />
            </div>
            <p className="text-sm font-medium text-purple-900">Aviso publicado</p>
            <p className="text-sm text-purple-600">
              Já está no Mural. Quem tiver informação entra em contato pelo que você deixou.
            </p>
            <Btn variante="primario" onClick={onClose} className="w-full py-2.5">Fechar</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

function EmergenciaSheet({ onClose, abrirDenuncia, abrirAchados }) {
  return (
    <div className="absolute inset-0 z-30 flex items-end" style={{ background: "rgba(46,33,86,.5)" }}>
      <div className="w-full bg-white rounded-t-3xl p-4 p-sheet">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-purple-900">Canais diretos</p>
          <button onClick={onClose} aria-label="Fechar"><X size={18} className="text-purple-400" /></button>
        </div>

        <button onClick={abrirDenuncia}
          className="w-full text-left bg-red-50 border-2 border-red-200 rounded-2xl p-4 mb-3 transition-all duration-150 active:scale-[.98]">
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert size={20} className="text-red-700" />
            <p className="text-sm font-medium text-red-900">Denúncia</p>
          </div>
          <p className="text-xs text-red-700">
            Assédio, discriminação ou violência. Vai direto à Comissão Anti-Opressão, com anonimato opcional.
          </p>
        </button>

        <div className="bg-red-100 rounded-xl p-3 flex gap-2 mb-4">
          <Phone size={15} className="text-red-800 shrink-0 mt-0.5" />
          <p className="text-[11px] text-red-800">
            Risco imediato? Ligue 190 ou acione a segurança da USP: 0800 776 0080.
          </p>
        </div>

        <button onClick={abrirAchados}
          className="w-full text-left bg-purple-50 border border-purple-200 rounded-2xl p-4 transition-all duration-150 active:scale-[.98]">
          <div className="flex items-center gap-2 mb-1">
            <Search size={18} className="text-purple-700" />
            <p className="text-sm font-medium text-purple-900">Achados e perdidos</p>
          </div>
          <p className="text-xs text-purple-600">
            Canal oficial da Prainha. Registre um item perdido ou avise que encontrou algo.
          </p>
        </button>
      </div>
    </div>
  );
}

function AnuncioServicoSheet({ onClose, onPublicar, usuario }) {
  const [tipo, setTipo] = useState("oferta");
  const [area, setArea] = useState("");
  const [titulo, setTitulo] = useState("");
  const [valor, setValor] = useState("");
  const [detalhe, setDetalhe] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [etapa, setEtapa] = useState("form");
  const [prog, setProg] = useState(0);

  const publicar = () => {
    setEtapa("enviando");
    let p = 0;
    const id = setInterval(() => {
      p += 16; setProg(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(id);
        setTimeout(() => {
          onPublicar({
            id: `s${Date.now()}`, tipo, area: area || "Outro", titulo,
            valor: valor.trim() || "a combinar", detalhe,
            portfolio: portfolio.replace(/^@/, "").trim() || null,
            pessoa: usuario?.nome || "você",
            entidade: usuario?.vinculos?.[0]?.nome || "",
          });
          onClose();
        }, 280);
      }
    }, 85);
  };

  return (
    <div className="absolute inset-0 z-30 flex items-end" style={{ background: "rgba(46,33,86,.5)" }}>
      <div className="w-full bg-white rounded-t-3xl p-4 p-sheet max-h-[94%] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Briefcase size={18} className="text-purple-700" />
            <p className="text-sm font-bold text-purple-900">Balcão de serviços</p>
          </div>
          <button onClick={onClose} aria-label="Fechar"><X size={18} className="text-purple-400" /></button>
        </div>

        {etapa === "form" && (
          <div className="space-y-3 p-in">
            <div className="grid grid-cols-2 gap-2">
              <Btn variante={tipo === "oferta" ? "primario" : "suave"} onClick={() => setTipo("oferta")} className="py-2.5">
                ofereço um serviço
              </Btn>
              <Btn variante={tipo === "procura" ? "primario" : "suave"} onClick={() => setTipo("procura")} className="py-2.5">
                procuro alguém
              </Btn>
            </div>

            <div>
              <p className="text-xs text-purple-600 mb-2">Área</p>
              <div className="flex flex-wrap gap-1.5">
                {AREAS_SERVICO.map((a) => (
                  <button key={a} onClick={() => setArea(a)}
                    className={`text-[11px] px-2.5 py-1.5 rounded-full border transition-all active:scale-95 ${
                      area === a ? "bg-purple-800 text-creme border-purple-800" : "bg-white border-purple-200 text-purple-700"}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>

            <input value={titulo} onChange={(e) => setTitulo(e.target.value)}
              placeholder={tipo === "oferta" ? "O que você faz" : "O que você precisa"}
              className="w-full text-sm border border-purple-200 rounded-xl p-3 text-purple-900 placeholder-purple-300 focus:outline-none focus:border-purple-500 transition-colors" />

            <input value={valor} onChange={(e) => setValor(e.target.value)}
              placeholder="Valor (ex: R$ 250 por evento, ou a combinar)"
              className="w-full text-sm border border-purple-200 rounded-xl p-3 text-purple-900 placeholder-purple-300 focus:outline-none focus:border-purple-500 transition-colors" />

            <textarea rows={3} value={detalhe} onChange={(e) => setDetalhe(e.target.value)}
              placeholder="Detalhe o que está incluso, prazo e condições"
              className="w-full text-sm border border-purple-200 rounded-xl p-3 text-purple-900 placeholder-purple-300 focus:outline-none focus:border-purple-500 transition-colors" />

            <div className="flex items-center gap-2 border border-purple-200 rounded-xl px-3">
              <Instagram size={16} className="text-purple-400 shrink-0" />
              <input value={portfolio} onChange={(e) => setPortfolio(e.target.value)} placeholder="portfólio no instagram (opcional)"
                className="flex-1 text-sm py-3 text-purple-900 placeholder-purple-300 focus:outline-none bg-transparent" />
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
              <AlertTriangle size={15} className="text-amber-700 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800 leading-snug">
                Combine valor, prazo e pagamento direto com a outra pessoa. O praIA publica o
                anúncio, mas não intermedeia nem garante o pagamento.
              </p>
            </div>

            <Btn variante={titulo.trim() ? "primario" : "inativo"} disabled={!titulo.trim()} onClick={publicar}
              className="w-full flex items-center justify-center gap-2 py-3">
              <Send size={16} /> publicar anúncio
            </Btn>
          </div>
        )}

        {etapa === "enviando" && (
          <div className="py-8 space-y-3 p-in">
            <p className="text-sm text-purple-900 text-center">Publicando anúncio</p>
            <Progress value={prog} />
            <p className="text-xs text-purple-500 text-center">{prog}%</p>
          </div>
        )}
      </div>
    </div>
  );
}

function BoasVindas({ onConcluir }) {
  const [passo, setPasso] = useState(0);

  const passos = [
    {
      icone: <Marca largura={210} cor="roxo" />,
      fundo: "bg-amber-400", texto_cor: "text-purple-800",
      titulo: "o que você ama na eca?",
      texto: "O app da comunidade ecana. Aqui a gente combina o que acontece na Prainha, reconhece quem cuida dos espaços e mantém as decisões à vista de todo mundo.",
    },
    {
      icone: <Elemento nome="coracao" tamanho={96} />,
      fundo: "bg-purple-400", texto_cor: "text-creme",
      titulo: "por que ele existe",
      texto: "Os espaços da ECA são construídos por quem os usa. O praIA transforma esse cuidado em créditos cooperativos: quem trabalha pela comunidade acumula, e esse acúmulo volta em forma de trocas, reconhecimento e projetos coletivos.",
    },
    {
      icone: <Elemento nome="faisca" tamanho={96} />,
      fundo: "bg-creme", texto_cor: "text-purple-800",
      titulo: "como ganhar créditos",
      texto: "Faça check-in pelo QR do espaço onde você trabalhou, escolha a categoria e as horas. O validador daquele espaço confere e aprova — só então o crédito entra na sua conta. A base é 10 créditos por hora, com multiplicador por tipo de trabalho.",
    },
    {
      icone: <Elemento nome="flor" tamanho={96} />,
      fundo: "bg-amber-400", texto_cor: "text-purple-800",
      titulo: "como gastar",
      texto: "No Mercado você troca por brindes, comida e bebida nos eventos, ou junta para o pacote de viagem do semestre. O saldo expira no fim do semestre — o que sobrar pode ser doado à Reserva Comunitária, que financia projetos de todos.",
    },
    {
      icone: <Elemento nome="raios" tamanho={96} />,
      fundo: "bg-purple-400", texto_cor: "text-creme",
      titulo: "as seis abas",
      texto: "Mural traz os avisos oficiais. Créditos é sua conta. Mercado é onde se troca. Espaços mostra a planta, a agenda e o check-in. Rede reúne as 32 cadeiras e quem decide o quê. Perfil guarda suas entidades, sua vitrine e seus prazos acadêmicos.",
    },
    {
      icone: <ShieldAlert size={88} className="text-coral" strokeWidth={1.6} />,
      fundo: "bg-purple-800", texto_cor: "text-creme",
      titulo: "o botão vermelho",
      texto: "No topo da tela, sempre à mão: envia denúncia à Comissão Anti-Opressão, com anonimato opcional, e também registra itens perdidos na Prainha. Em risco imediato, ligue 190 ou acione a segurança da USP.",
    },
  ];

  const atual = passos[passo];
  const ultimo = passo === passos.length - 1;

  return (
    <div className={`h-full flex flex-col px-7 py-8 transition-colors duration-500 ${atual.fundo}`}>
      <Olho className={`${atual.texto_cor} opacity-70`}>comunidade ecana</Olho>

      <div className="flex-1 flex flex-col justify-center">
        <div key={passo} className="mb-7 p-pop">{atual.icone}</div>
        <h1 key={`t${passo}`}
          className={`text-[44px] font-black lowercase tracking-titulo leading-[0.9] mb-5 p-in ${atual.texto_cor}`}>
          {atual.titulo}
        </h1>
        <p key={`c${passo}`} className={`text-base font-medium leading-snug p-in ${atual.texto_cor} opacity-90`}>
          {atual.texto}
        </p>
      </div>

      <div className="flex justify-start gap-1.5 mb-5">
        {passos.map((_, i) => (
          <span key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
            i === passo
              ? `w-7 ${atual.texto_cor === "text-creme" ? "bg-creme" : "bg-purple-800"}`
              : `w-1.5 ${atual.texto_cor === "text-creme" ? "bg-creme/35" : "bg-purple-800/25"}`}`} />
        ))}
      </div>

      <div className="flex gap-2">
        {passo > 0 && (
          <button onClick={() => setPasso(passo - 1)}
            className={`px-5 py-3.5 rounded-full text-sm font-bold border-2 transition-all active:scale-95 ${
              atual.texto_cor === "text-creme"
                ? "border-creme/40 text-creme"
                : "border-purple-800/30 text-purple-800"}`}>
            voltar
          </button>
        )}
        <button onClick={() => (ultimo ? onConcluir() : setPasso(passo + 1))}
          className={`flex-1 py-3.5 rounded-full text-sm font-bold transition-all active:scale-[.97] ${
            atual.texto_cor === "text-creme" ? "bg-creme text-purple-800" : "bg-purple-800 text-creme"}`}>
          {ultimo ? "começar" : "continuar"}
        </button>
      </div>

      {!ultimo && (
        <button onClick={onConcluir}
          className={`text-xs font-medium mt-3 transition-all active:scale-95 ${atual.texto_cor} opacity-55`}>
          pular apresentação
        </button>
      )}
    </div>
  );
}

function BlockedScreen({ label }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-8 p-in">
      <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mb-3 p-pop">
        <Lock size={22} className="text-red-700" />
      </div>
      <p className="text-sm font-medium text-purple-900 mb-1">{label} indisponível</p>
      <p className="text-sm text-purple-600">
        Medida da Comissão Anti-Opressão em vigor. A área acadêmica no Perfil continua acessível.
      </p>
    </div>
  );
}

function ComposerSheet({ onClose, onPublicar }) {
  const [destino, setDestino] = useState("timeline");
  const [texto, setTexto] = useState("");
  const [titulo, setTitulo] = useState("");
  const [ehEvento, setEhEvento] = useState(false);
  const [ehReuniao, setEhReuniao] = useState(false);
  const [local, setLocal] = useState("");
  const [quando, setQuando] = useState("");
  const [organizador, setOrganizador] = useState("");
  const [fotos, setFotos] = useState([]);
  const [etapa, setEtapa] = useState("form");
  const [prog, setProg] = useState(0);

  const publicar = () => {
    setEtapa("enviando");
    let p = 0;
    const id = setInterval(() => {
      p += 14; setProg(Math.min(p, 100));
      if (p >= 100) {
        clearInterval(id);
        setTimeout(() => {
          onPublicar(destino, { texto, fotos, titulo, ehEvento, ehReuniao, local, quando, organizador });
          onClose();
        }, 280);
      }
    }, 80);
  };

  return (
    <div className="absolute inset-0 z-30 flex items-end" style={{ background: "rgba(46,33,86,.5)" }}>
      <div className="w-full bg-white rounded-t-3xl p-4 p-sheet max-h-[92%] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-purple-900">Nova publicação</p>
          <button onClick={onClose} aria-label="Fechar"><X size={18} className="text-purple-400" /></button>
        </div>

        {etapa === "form" && (
          <div className="space-y-3 p-in">
            <div className="grid grid-cols-2 gap-2">
              {[{ id: "timeline", t: "Minha timeline", s: "publica na hora · só conexões" },
                { id: "mural", t: "Pedir no Mural", s: "vai à fila da Comunicação" }].map((o) => (
                <button key={o.id} onClick={() => setDestino(o.id)}
                  className={`text-left rounded-xl p-3 border transition-all duration-150 active:scale-[.98] ${
                    destino === o.id ? "bg-purple-800 border-purple-800" : "bg-white border-purple-200"}`}>
                  <p className={`text-sm font-medium ${destino === o.id ? "text-white" : "text-purple-900"}`}>{o.t}</p>
                  <p className={`text-[11px] ${destino === o.id ? "text-purple-200" : "text-purple-500"}`}>{o.s}</p>
                </button>
              ))}
            </div>

            {destino === "mural" && (
              <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título do post"
                className="w-full text-sm border border-purple-200 rounded-xl p-3 text-purple-900 placeholder-purple-300 focus:outline-none focus:border-purple-500 transition-colors" />
            )}

            <textarea rows={3} value={texto} onChange={(e) => setTexto(e.target.value)}
              placeholder={destino === "mural" ? "O que a comunidade precisa saber" : "O que você está construindo hoje"}
              className="w-full text-sm border border-purple-200 rounded-xl p-3 text-purple-900 placeholder-purple-300 focus:outline-none focus:border-purple-500 transition-colors" />

            {destino === "mural" && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Btn variante={ehEvento ? "primario" : "suave"} onClick={() => { setEhEvento(!ehEvento); if (ehEvento) setEhReuniao(false); }} className="flex-1 py-2">
                    É um evento
                  </Btn>
                  <Btn variante={ehReuniao ? "primario" : "suave"} onClick={() => { setEhReuniao(!ehReuniao); if (!ehReuniao) setEhEvento(true); }} className="flex-1 py-2">
                    Reunião ou assembleia
                  </Btn>
                </div>

                {ehEvento && (
                  <div className="space-y-2 p-in">
                    <input value={local} onChange={(e) => setLocal(e.target.value)} placeholder="Local (ex: Praça Coberta)"
                      className="w-full text-sm border border-purple-200 rounded-xl p-3 text-purple-900 placeholder-purple-300 focus:outline-none focus:border-purple-500 transition-colors" />
                    <input value={quando} onChange={(e) => setQuando(e.target.value)} placeholder="Quando (ex: 28/08 às 19h)"
                      className="w-full text-sm border border-purple-200 rounded-xl p-3 text-purple-900 placeholder-purple-300 focus:outline-none focus:border-purple-500 transition-colors" />
                    <input value={organizador} onChange={(e) => setOrganizador(e.target.value)} placeholder="Quem organiza"
                      className="w-full text-sm border border-purple-200 rounded-xl p-3 text-purple-900 placeholder-purple-300 focus:outline-none focus:border-purple-500 transition-colors" />
                    {ehReuniao && (
                      <p className="text-[11px] text-purple-500 px-1">
                        Reuniões e assembleias abrem confirmação de presença na ficha do post.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <MediaPicker fotos={fotos} setFotos={setFotos} />

            {destino === "mural" && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
                <Megaphone size={16} className="text-amber-700 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  O núcleo de Comunicação revisa antes de publicar. Curar o Mural gera crédito de Comunicação para quem revisa.
                </p>
              </div>
            )}

            <Btn variante={texto.trim() ? "primario" : "inativo"} disabled={!texto.trim()} onClick={publicar}
              className="w-full flex items-center justify-center gap-2 py-3">
              <Send size={16} /> {destino === "mural" ? "Enviar pedido" : "Publicar"}
            </Btn>
          </div>
        )}

        {etapa === "enviando" && (
          <div className="py-8 space-y-3 p-in">
            <p className="text-sm text-purple-900 text-center">{fotos.length > 0 ? `Enviando ${fotos.length} imagem(ns)` : "Publicando"}</p>
            <Progress value={prog} />
            <p className="text-xs text-purple-500 text-center">{prog}%</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DenunciaSheet({ onClose, onRegistrar }) {
  const [etapa, setEtapa] = useState("form");
  const [tipo, setTipo] = useState(null);
  const [relato, setRelato] = useState("");
  const [anon, setAnon] = useState(true);
  const [fotos, setFotos] = useState([]);
  const [prog, setProg] = useState(0);
  const protocolo = useRef(`A-${Math.floor(1000 + Math.random() * 9000)}`);

  const enviar = () => {
    setEtapa("enviando");
    let p = 0;
    const id = setInterval(() => {
      p += 12; setProg(Math.min(p, 100));
      if (p >= 100) { clearInterval(id); setTimeout(() => { setEtapa("ok"); onRegistrar(protocolo.current, tipo); }, 250); }
    }, 90);
  };

  return (
    <div className="absolute inset-0 z-30 flex items-end" style={{ background: "rgba(46,33,86,.5)" }}>
      <div className="w-full bg-white rounded-t-3xl p-4 p-sheet max-h-[92%] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert size={18} className="text-red-700" />
            <p className="text-sm font-medium text-purple-900">Comissão Anti-Opressão</p>
          </div>
          <button onClick={onClose} aria-label="Fechar"><X size={18} className="text-purple-400" /></button>
        </div>

        {etapa === "form" && (
          <div className="space-y-3 p-in">
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2">
              <Phone size={16} className="text-red-700 shrink-0 mt-0.5" />
              <p className="text-xs text-red-800">
                Risco imediato? Ligue 190 ou acione a segurança da USP (0800 776 0080).
                Esta denúncia é apurada por uma comissão estudantil e não substitui socorro urgente.
              </p>
            </div>

            <div>
              <p className="text-xs text-purple-600 mb-2">Tipo de ocorrência</p>
              <div className="grid grid-cols-2 gap-2">
                {["Assédio", "Discriminação", "Violência", "Outro"].map((t) => (
                  <Btn key={t} variante={tipo === t ? "primario" : "suave"} onClick={() => setTipo(t)} className="py-2">{t}</Btn>
                ))}
              </div>
            </div>

            <textarea rows={3} value={relato} onChange={(e) => setRelato(e.target.value)}
              placeholder="O que aconteceu, quando e onde"
              className="w-full text-sm border border-purple-200 rounded-xl p-3 text-purple-900 placeholder-purple-300 focus:outline-none focus:border-purple-500 transition-colors" />

            <div>
              <p className="text-xs text-purple-600 mb-2">Anexar evidência (opcional)</p>
              <MediaPicker fotos={fotos} setFotos={setFotos} max={3} />
            </div>

            <button onClick={() => setAnon(!anon)} className="w-full flex items-center gap-2 text-sm text-purple-800 bg-purple-50 rounded-xl p-3 transition-all duration-150 active:scale-[.99]">
              <EyeOff size={16} className={anon ? "text-purple-800" : "text-purple-300"} />
              <span className="flex-1 text-left">Enviar de forma anônima</span>
              <span className={`w-9 h-5 rounded-full transition-colors duration-200 flex items-center px-0.5 ${anon ? "bg-purple-800" : "bg-purple-200"}`}>
                <span className={`w-4 h-4 bg-white rounded-full transition-transform duration-200 ${anon ? "translate-x-4" : ""}`} />
              </span>
            </button>

            <Btn variante={tipo ? "perigo" : "inativo"} disabled={!tipo} onClick={enviar}
              className="w-full flex items-center justify-center gap-2 py-3">
              <Send size={16} /> Enviar denúncia
            </Btn>
          </div>
        )}

        {etapa === "enviando" && (
          <div className="py-8 space-y-3 p-in">
            <p className="text-sm text-purple-900 text-center">Enviando com segurança</p>
            <Progress value={prog} />
            <p className="text-xs text-purple-500 text-center">Canal protegido · {prog}%</p>
          </div>
        )}

        {etapa === "ok" && (
          <div className="py-6 text-center space-y-3 p-in">
            <div className="w-14 h-14 mx-auto rounded-full bg-green-100 flex items-center justify-center p-pop">
              <CheckCircle2 size={24} className="text-green-700" />
            </div>
            <p className="text-sm font-medium text-purple-900">Denúncia registrada</p>
            <p className="text-sm text-purple-600">
              Protocolo #{protocolo.current}. A comissão responde em até 72h.
              Você acompanha pelo protocolo, sem precisar se identificar.
            </p>
            <Btn variante="primario" onClick={onClose} className="w-full py-2.5">Fechar</Btn>
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const { estado, salvar, carregando } = useEstado();
  const [tab, setTab] = useState("mural");
  const [sheet, setSheet] = useState(null);
  const [toastMsg, setToastMsg] = useState(null);
  const [foco, setFoco] = useState(null);
  const [detalhe, setDetalhe] = useState(null);
  const pronto = useLazy(tab + estado.papel, 400);

  const toast = (m) => { setToastMsg(m); setTimeout(() => setToastMsg(null), 2800); };
  const penalizado = !!estado.penalidade;

  useEffect(() => { if (penalizado && tab !== "perfil") setTab("perfil"); }, [penalizado, tab]);

  const agendar = (ev) => {
    try { baixarICS(ev); toast("Evento gerado — abra o arquivo para salvar na sua agenda"); }
    catch { toast("Não foi possível gerar o arquivo de agenda"); }
  };

  const publicar = (destino, dados) => {
    const { texto, fotos, titulo, ehEvento, ehReuniao, local, quando, organizador } = dados;
    if (destino === "timeline") {
      salvar((s) => ({ ...s, timeline: [{ id: Date.now(), texto, fotos, quando: "agora" }, ...s.timeline] }));
      toast("Publicado na sua timeline");
      setTab("perfil");
    } else {
      const novo = {
        id: Date.now(), tag: ehReuniao ? "Assembleia" : ehEvento ? "Evento" : "Aviso",
        tone: ehReuniao ? "purple" : ehEvento ? "amber" : "green",
        meta: quando || "agora", titulo: titulo?.trim() || texto.slice(0, 60),
        corpo: texto, fotos, local, quando, organizador, reuniao: ehReuniao, presentes: 0,
        autor: estado.usuario?.nome,
      };
      salvar((s) => ({
        ...s,
        pedidosMural: [{ id: novo.id, texto, fotos, status: "pendente" }, ...s.pedidosMural],
        posts: [novo, ...s.posts],
      }));
      toast("Pedido enviado ao núcleo de Comunicação");
      setTab("mural");
    }
  };

  const publicarClube = ({ clube, tema, quando, local, autor }) => {
    salvar((s) => ({
      ...s,
      posts: [{
        id: Date.now(), tag: "clubECA", tone: "amber",
        meta: quando || "a combinar",
        titulo: `${clube.nome}: ${tema}`,
        corpo: `${clube.descricao} Encontro aberto a quem quiser aparecer.`,
        local, quando, organizador: clube.nome, autor,
        categoriaCredito: "Formação",
      }, ...s.posts],
    }));
    toast("Encontro publicado no Mural");
    setTab("mural");
  };

  const publicarServico = (anuncio) => {
    salvar((s) => ({ ...s, servicos: [anuncio, ...(s.servicos || [])] }));
    toast("Anúncio publicado no balcão de serviços");
    setTab("mercado");
  };

  const registrarDenuncia = (protocolo, tipo) => {
    salvar((s) => ({ ...s, protocolos: [{ protocolo, tipo, status: "em apuração" }, ...s.protocolos] }));
  };

  const registrarAchado = ({ modo, item, local, contato, fotos, autor }) => {
    const perdi = modo === "perdi";
    salvar((s) => ({
      ...s,
      posts: [{
        id: Date.now(), tag: "Achados e perdidos", tone: "green",
        meta: "agora",
        titulo: perdi ? `Perdido: ${item}` : `Encontrado: ${item}`,
        corpo: perdi
          ? `Perdido${local ? ` em ${local}` : ""}. Se você viu ou encontrou, entre em contato.`
          : `Encontrado${local ? ` em ${local}` : ""}. Se for seu, entre em contato para combinar a retirada.`,
        fotos, local, organizador: contato, autor,
      }, ...s.posts],
    }));
    setTab("mural");
  };

  const irPara = (aba, espacoId) => { setFoco(espacoId); setTab(aba); };
  const verDetalhe = (item) => setDetalhe(item);

  const reiniciar = async () => {
    try { await storage.delete("praia:estado"); } catch {}
    window.location.reload();
  };

  if (carregando) {
    return (
      <div className="w-full flex justify-center bg-amber-50 py-8">
        <div className="w-[380px] rounded-[36px] border-8 border-purple-900 overflow-hidden bg-amber-50 p-4 space-y-3">
          <div className="p-sk h-14 rounded-2xl" />
          <Skeleton rows={3} />
        </div>
      </div>
    );
  }

  if (!estado.onboarded) {
    return (
      <div className="w-full flex justify-center bg-amber-50 py-8">
        <style>{CSS}</style>
        <div className="w-[380px] h-[680px] rounded-[36px] border-8 border-purple-900 overflow-hidden bg-white">
          <BoasVindas onConcluir={() => salvar((s) => ({ ...s, onboarded: true }))} />
        </div>
      </div>
    );
  }

  if (!estado.usuario) {
    return (
      <div className="w-full flex justify-center bg-amber-50 py-8">
        <style>{CSS}</style>
        <div className="w-[380px] h-[680px] rounded-[36px] border-8 border-purple-900 overflow-hidden bg-white">
          <Login onEntrar={(u) => salvar((s) => ({ ...s, usuario: u }))} />
        </div>
      </div>
    );
  }

  const label = estado.papel === "validador" ? "Validação" : TABS.find((t) => t.id === tab).label;
  const bloqueada = penalizado && tab !== "perfil";

  const conteudo = () => {
    if (estado.papel === "validador") return <ValidadorScreen estado={estado} salvar={salvar} toast={toast} />;
    if (bloqueada) return <BlockedScreen label={TABS.find((t) => t.id === tab).label} />;
    if (tab === "mural") return <MuralScreen estado={estado} salvar={salvar} agendar={agendar} toast={toast} irPara={irPara} verDetalhe={verDetalhe} abrirNewsletter={() => setSheet("newsletter")} abrirClube={() => setSheet("clube")} abrirTreinos={() => setSheet("treinos")} />;
    if (tab === "creditos") return <CreditosScreen estado={estado} salvar={salvar} toast={toast} verDetalhe={verDetalhe} />;
    if (tab === "mercado") return <MercadoScreen estado={estado} salvar={salvar} toast={toast} verDetalhe={verDetalhe} abrirAnuncio={() => setSheet("servico")} />;
    if (tab === "espacos") return <EspacosScreen estado={estado} salvar={salvar} agendar={agendar} toast={toast} focoEspaco={foco} verDetalhe={verDetalhe} abrirTreinos={() => setSheet("treinos")} />;
    if (tab === "rede") return <RedeScreen estado={estado} salvar={salvar} agendar={agendar} toast={toast} verDetalhe={verDetalhe} />;
    return <PerfilScreen estado={estado} salvar={salvar} agendar={agendar} toast={toast} verDetalhe={verDetalhe} abrirComposer={() => setSheet("post")} />;
  };

  return (
    <div className="w-full flex flex-col items-center bg-amber-50 py-8 gap-3">
      <style>{CSS}</style>

      <div className="relative w-[380px] rounded-[36px] border-8 border-purple-900 overflow-hidden bg-amber-50">
        <div className="bg-purple-800 px-4 pt-4 pb-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-creme text-lg font-black lowercase tracking-titulo leading-none">praia</p>
              <Marca largura={78} cor="creme" className="opacity-90" />
            </div>
            <p className="text-purple-300 text-[11px] leading-tight truncate mt-1">{label}</p>
          </div>
          {estado.papel === "validador" && (
            <button onClick={() => salvar((s) => ({ ...s, papel: "estudante" }))} aria-label="Voltar ao modo estudante"
              className="w-9 h-9 rounded-full bg-purple-700 flex items-center justify-center transition-all active:scale-95">
              <ArrowLeft size={18} className="text-white" />
            </button>
          )}
          <button onClick={() => setSheet("emergencia")} aria-label="Canais diretos: denúncia e achados e perdidos"
            className="w-9 h-9 rounded-full bg-red-600 flex items-center justify-center transition-all active:scale-95">
            <ShieldAlert size={18} className="text-white" />
          </button>
        </div>

        <div className="relative h-[560px] overflow-y-auto p-3 bg-amber-50">
          {pronto ? conteudo() : <Skeleton rows={3} />}

          {!penalizado && estado.papel === "estudante" && (
            <button onClick={() => setSheet("post")} aria-label="Nova publicação"
              className="sticky float-right bottom-3 mr-1 w-12 h-12 rounded-full bg-amber-400 flex items-center justify-center z-10 transition-all duration-150 active:scale-90">
              <Plus size={22} className="text-purple-900" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-6 bg-white border-t border-purple-100">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id && estado.papel === "estudante";
            const off = penalizado && t.id !== "perfil";
            const badge = t.id === "creditos" && estado.pendentes.length > 0;
            return (
              <button key={t.id} onClick={() => { salvar((s) => ({ ...s, papel: "estudante" })); setTab(t.id); }}
                className="relative flex flex-col items-center py-2 gap-0.5 transition-all duration-150 active:scale-95">
                {off && <span className="absolute top-1 right-3 w-1.5 h-1.5 rounded-full bg-red-500" />}
                {badge && !off && <span className="absolute top-1 right-3 w-1.5 h-1.5 rounded-full bg-amber-500" />}
                <Icon size={18} className={off ? "text-purple-200" : active ? "text-purple-800" : "text-purple-300"} />
                <span className={`text-[9px] ${off ? "text-purple-200" : active ? "text-purple-800 font-medium" : "text-purple-300"}`}>{t.label}</span>
                {active && <span className="absolute bottom-0 w-6 h-0.5 bg-amber-400 rounded-full p-in" />}
              </button>
            );
          })}
        </div>

        <Toast msg={toastMsg} />
        {detalhe && (
          <DetalheSheet item={detalhe} estado={estado} salvar={salvar} agendar={agendar}
            toast={toast} irPara={irPara} onClose={() => setDetalhe(null)} />
        )}
        {sheet === "post" && <ComposerSheet onClose={() => setSheet(null)} onPublicar={publicar} />}
        {sheet === "newsletter" && (
          <NewsletterSheet onClose={() => setSheet(null)} toast={toast} estado={estado} salvar={salvar} />
        )}
        {sheet === "treinos" && (
          <TreinosSheet onClose={() => setSheet(null)} estado={estado} salvar={salvar}
            toast={toast} agendar={agendar} verDetalhe={verDetalhe} />
        )}
        {sheet === "clube" && (
          <ClubeSheet onClose={() => setSheet(null)} usuario={estado.usuario} onPublicar={publicarClube} />
        )}
        {sheet === "servico" && (
          <AnuncioServicoSheet onClose={() => setSheet(null)} usuario={estado.usuario} onPublicar={publicarServico} />
        )}
        {sheet === "emergencia" && (
          <EmergenciaSheet onClose={() => setSheet(null)}
            abrirDenuncia={() => setSheet("denuncia")} abrirAchados={() => setSheet("achados")} />
        )}
        {sheet === "denuncia" && <DenunciaSheet onClose={() => setSheet(null)} onRegistrar={registrarDenuncia} />}
        {sheet === "achados" && (
          <AchadosSheet onClose={() => setSheet(null)} onRegistrar={registrarAchado} usuario={estado.usuario} />
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-2 max-w-[380px]">
        <Btn variante="suave" onClick={() => salvar((s) => ({ ...s, papel: s.papel === "validador" ? "estudante" : "validador" }))} className="px-4 py-2 text-xs">
          {estado.papel === "validador" ? "Modo estudante" : `Modo validador (${estado.pendentes.length})`}
        </Btn>
        <Btn variante="suave" className="px-4 py-2 text-xs"
          onClick={() => salvar((s) => ({ ...s, penalidade: s.penalidade ? null : { protocolo: "A-2081", ate: "30 dias" } }))}>
          {penalizado ? "Suspender medida" : "Simular penalidade"}
        </Btn>
        <Btn variante="suave" onClick={reiniciar} className="px-4 py-2 text-xs">Reiniciar dados</Btn>
      </div>

      <div className="flex items-center gap-2 opacity-60 mt-1">
        <Elemento nome="faisca" tamanho={14} />
        <Marca largura={88} cor="roxo" />
      </div>
    </div>
  );
}
