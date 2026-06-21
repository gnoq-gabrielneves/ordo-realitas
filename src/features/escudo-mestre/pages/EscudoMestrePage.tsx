"use client";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import {
  AlertTriangle,
  Brain,
  Crosshair,
  Dice5,
  HeartPulse,
  ListChecks,
  Moon,
  Search,
  Shield,
  ShieldAlert,
  Skull,
  Sparkles,
  Swords,
  UserPlus,
} from "lucide-react";
import { useMemo, useState } from "react";

type ShieldItem = {
  title: string;
  detail: string;
  tag?: string;
};

type ShieldSection = {
  id: string;
  label: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  items: ShieldItem[];
};

type NpcDraft = {
  name: string;
  concept: string;
  age: string;
  appearance: string;
  personality: string;
  hook: string;
};

const SECTIONS: ShieldSection[] = [
  {
    id: "condicoes",
    label: "Condicoes",
    title: "Condicoes",
    description: "Efeitos recorrentes para aplicar rapido durante cenas tensas.",
    icon: HeartPulse,
    items: [
      { title: "Abalado", detail: "Sofre -O em testes. Se receber novamente, vira apavorado.", tag: "medo" },
      { title: "Agarrado", detail: "Fica desprevenido e imovel, sofre -O em ataques e so ataca com armas leves.", tag: "paralisia" },
      { title: "Apavorado", detail: "Sofre -OO em pericias e deve fugir da fonte do medo se puder.", tag: "medo" },
      { title: "Atordoado", detail: "Fica desprevenido e nao pode fazer acoes.", tag: "mental" },
      { title: "Caido", detail: "-OO em ataques corpo a corpo, deslocamento 1,5m; -5 Defesa contra corpo a corpo e +5 contra distancia." },
      { title: "Cego", detail: "Fica desprevenido e lento; -OO em pericias de Agilidade/Forca e ataques contra seus alvos tem camuflagem total.", tag: "sentidos" },
      { title: "Confuso", detail: "No inicio do turno role 1d6 para definir comportamento aleatorio.", tag: "mental" },
      { title: "Debilitado", detail: "Sofre -OO em testes de Agilidade, Forca e Vigor. Se repetir, fica inconsciente." },
      { title: "Desprevenido", detail: "Sofre -5 na Defesa e -O em Reflexos." },
      { title: "Em Chamas", detail: "No inicio do turno sofre 1d6 fogo. Apagar com acao padrao ou imersao em agua." },
      { title: "Enjoado", detail: "So realiza acao padrao ou acao de movimento por rodada." },
      { title: "Enlouquecendo", detail: "Ao iniciar tres turnos assim na cena, fica insano. Diplomacia DT 20 +5 por acalmada anterior encerra." },
      { title: "Fraco", detail: "Sofre -O em Agilidade, Forca e Vigor. Se repetir, vira debilitado." },
      { title: "Inconsciente", detail: "Fica indefeso e nao faz acoes nem reacoes. Acordar alguem exige acao padrao." },
      { title: "Indefeso", detail: "Conta como desprevenido, sofre -10 Defesa, falha em Reflexos e pode sofrer golpe de misericordia." },
      { title: "Morrendo", detail: "Com 0 PV. Se iniciar tres turnos morrendo na cena, morre. Medicina DT 20 +5 por estabilizacao anterior encerra." },
      { title: "Sangrando", detail: "No inicio do turno faz Vigor DT 20. Sucesso remove; falha perde 1d6 PV. Medicina DT 20 estabiliza." },
      { title: "Vulneravel", detail: "Sofre -2 na Defesa." },
    ],
  },
  {
    id: "investigacao",
    label: "Investigacao",
    title: "Investigacao",
    description: "Fluxo para cenas de pistas, urgencia e uso criativo de pericias.",
    icon: Search,
    items: [
      { title: "Comece claro", detail: "Diga quando a cena de investigacao comeca e descreva objetos, pessoas e pontos interativos." },
      { title: "Rodadas abstratas", detail: "Cada rodada pode representar segundos, minutos ou horas. A funcao e dar turnos equivalentes." },
      { title: "Procurar pistas", detail: "Jogador escolhe pericia e descreve como usa. DT 15 para acao adequada, 20 para complexa, 25+ para vaga ou dificil." },
      { title: "Facilitar investigacao", detail: "Uma acao de suporte pode conceder +2 no proximo teste de procurar pistas de cada aliado na cena." },
      { title: "Ajudar", detail: "Use a regra geral de ajuda: ajudante testa contra DT 10 e soma bonus ao lider se passar." },
      { title: "Habilidades e itens", detail: "Permita usos criativos; se a ideia ajuda mas nao da bonus por regra, voce pode conceder +5." },
      { title: "Urgencia muito baixa", detail: "6 rodadas disponiveis antes do evento encerrar ou complicar a cena.", tag: "urgencia" },
      { title: "Urgencia baixa", detail: "5 rodadas disponiveis.", tag: "urgencia" },
      { title: "Urgencia media", detail: "4 rodadas disponiveis.", tag: "urgencia" },
      { title: "Urgencia alta", detail: "3 rodadas disponiveis.", tag: "urgencia" },
      { title: "Urgencia muito alta", detail: "2 rodadas disponiveis.", tag: "urgencia" },
      { title: "Pressao por falhas", detail: "Para aumentar tensao, a cada tres falhas em procurar pistas reduza a urgencia em 1 rodada." },
    ],
  },
  {
    id: "combate",
    label: "Combate",
    title: "Combate",
    description: "Sequencia basica de rodada, acoes e ataques.",
    icon: Swords,
    items: [
      { title: "Inicio do combate", detail: "Todos rolam Iniciativa. O mestre define quem percebeu os inimigos." },
      { title: "Surpresa", detail: "Quem nao percebeu inimigos fica surpreendido, desprevenido e nao age na primeira rodada." },
      { title: "Turno padrao", detail: "Escolha: uma acao padrao + uma de movimento; ou duas de movimento; ou uma acao completa." },
      { title: "Acoes livres", detail: "Podem ser feitas no turno, mas o mestre limita se forem complexas ou longas demais." },
      { title: "Reacoes", detail: "Respostas a eventos. Podem ocorrer fora do turno, inclusive quando o personagem nao faria acoes normais." },
      { title: "Ataque", detail: "Luta para corpo a corpo, Pontaria para distancia. A DT do teste e a Defesa do alvo." },
      { title: "Atirar em corpo a corpo", detail: "Ataque a distancia contra alvo engajado em corpo a corpo sofre -O." },
      { title: "Dano corpo a corpo/arremesso", detail: "Some Forca ao dano da arma." },
      { title: "Dano de disparo/fogo", detail: "Use apenas o dano da arma, salvo efeitos especificos." },
      { title: "Critico", detail: "Se acertar com rolagem dentro da margem da arma, multiplique os dados de dano. Bonus numericos nao multiplicam." },
    ],
  },
  {
    id: "dts",
    label: "DTs",
    title: "Dificuldade de testes",
    description: "Escala rapida para escolher uma DT sem travar a mesa.",
    icon: Dice5,
    items: [
      { title: "Facil - DT 5", detail: "Normalmente nem precisa rolar; use so para escala." },
      { title: "Media - DT 10", detail: "Tarefa simples com alguma incerteza." },
      { title: "Dificil - DT 15", detail: "Tarefa exigente, mas comum para agentes preparados." },
      { title: "Muito dificil - DT 20", detail: "Situacao arriscada ou tecnica." },
      { title: "Formidavel - DT 25", detail: "Especialista, equipamento certo ou boa ideia fazem diferenca." },
      { title: "Heroica - DT 30", detail: "Feito raro, dramatico ou paranormalmente complexo." },
      { title: "Quase impossivel - DT 35", detail: "Use para algo extremo, com consequencia narrativa forte." },
      { title: "Circunstancia favoravel", detail: "Conceda +O quando a ideia, preparo ou cena ajudam muito." },
      { title: "Circunstancia desfavoravel", detail: "Aplique -O quando pressao, ambiente ou abordagem atrapalham." },
      { title: "Escolher 10/20", detail: "Sem pressao, escolha 10. Sem pressao e sem consequencia por falha, escolha 20 gastando muito mais tempo." },
    ],
  },
  {
    id: "manobras",
    label: "Manobras",
    title: "Manobras de combate",
    description: "Ataques corpo a corpo usados para controlar a cena em vez de causar dano direto.",
    icon: Crosshair,
    items: [
      { title: "Teste de manobra", detail: "Faca ataque corpo a corpo oposto por Luta do alvo. Empate exige novo teste." },
      { title: "Agarrar", detail: "Alvo fica agarrado. Para escapar, usa acao padrao e vence teste oposto. Quem agarra ocupa uma mao e move metade." },
      { title: "Derrubar", detail: "Alvo fica caido. Se vencer por 5+, tambem empurra 1,5m." },
      { title: "Desarmar", detail: "Derruba item segurado. Se vencer por 5+, empurra o item 1,5m." },
      { title: "Empurrar", detail: "Empurra 1,5m, +1,5m para cada 5 pontos de diferenca. Pode avancar junto gastando movimento." },
      { title: "Quebrar", detail: "Ataca item carregado pelo alvo. Use estatisticas de objeto quando necessario." },
      { title: "Atropelar", detail: "Durante movimento, tente atravessar espaco ocupado. Se vencer o teste oposto, derruba e continua." },
      { title: "Fintar", detail: "Enganacao contra Reflexos em alcance curto. Se passar, alvo fica desprevenido contra seu proximo ataque." },
    ],
  },
  {
    id: "situacoes",
    label: "Situacoes",
    title: "Situacoes especiais",
    description: "Modificadores comuns de posicionamento, visao e terreno.",
    icon: AlertTriangle,
    items: [
      { title: "Atacante caido", detail: "Sofre -OO no ataque." },
      { title: "Atacante cego", detail: "Ataques tem 50% de chance de falha." },
      { title: "Posicao elevada", detail: "Atacante recebe +O." },
      { title: "Flanqueando", detail: "+O em ataque corpo a corpo quando aliado esta do lado oposto do alvo." },
      { title: "Atacante invisivel", detail: "+OO contra alvos que nao possam percebe-lo." },
      { title: "Atacante ofuscado", detail: "Sofre -O." },
      { title: "Alvo caido", detail: "-5 Defesa contra corpo a corpo; +5 Defesa contra distancia." },
      { title: "Alvo cego ou desprevenido", detail: "Sofre -5 Defesa." },
      { title: "Camuflagem leve", detail: "Ataques tem 20% de chance de falha." },
      { title: "Camuflagem total", detail: "Ataques tem 50% de chance de falha." },
      { title: "Cobertura leve", detail: "+5 Defesa." },
      { title: "Cobertura total", detail: "Nao pode ser alvo de ataques comuns." },
      { title: "Terreno dificil", detail: "Movimento custa o dobro." },
    ],
  },
  {
    id: "defesa",
    label: "Defesa",
    title: "Acoes de defesa",
    description: "Reacoes defensivas para personagens treinados.",
    icon: Shield,
    items: [
      { title: "Limite", detail: "So uma reacao especial de defesa por rodada." },
      { title: "Declare antes", detail: "Bloqueio e esquiva precisam ser declarados antes do ataque ser rolado." },
      { title: "Bloqueio", detail: "Treinado em Fortitude. Contra ataque corpo a corpo, recebe RD igual ao bonus de Fortitude contra aquele ataque." },
      { title: "Contra-ataque", detail: "Treinado em Luta. Se ataque corpo a corpo errar voce, use reacao para atacar o agressor." },
      { title: "Esquiva", detail: "Treinado em Reflexos. Some seu bonus de Reflexos na Defesa contra o ataque." },
      { title: "Dano massivo", detail: "Se sofrer metade ou mais dos PV totais de uma vez e nao cair a 0, teste Fortitude DT 15 +2 por 10 de dano." },
    ],
  },
  {
    id: "interludio",
    label: "Interludio",
    title: "Interludio",
    description: "Pausa segura entre cenas para recuperar, planejar e revisar pistas.",
    icon: Moon,
    items: [
      { title: "Quando usar", detail: "Cena de descanso ou preparacao em local minimamente seguro." },
      { title: "Acoes por personagem", detail: "Cada personagem pode fazer ate duas acoes de interludio." },
      { title: "Alimentar-se", detail: "Escolha uma refeicao especial para melhorar outra acao do interludio." },
      { title: "Dormir", detail: "Recupera PV e PE conforme limite de PE e qualidade do descanso: precario, normal, confortavel ou luxuoso." },
      { title: "Relaxar", detail: "Funciona como dormir, mas recupera Sanidade. Participantes ajudam uns aos outros." },
      { title: "Exercitar-se", detail: "Ganha +1d6 em um teste futuro baseado em Agilidade, Forca ou Vigor." },
      { title: "Ler", detail: "Ganha +1d6 em um teste futuro baseado em Intelecto ou Presenca." },
      { title: "Manutencao", detail: "Conserta um item quebrado, restaurando seus PV." },
      { title: "Revisar caso", detail: "Revisite uma cena de investigacao. Se passar no teste, recupere pista complementar perdida." },
    ],
  },
  {
    id: "perigos",
    label: "Perigos",
    title: "Perigos",
    description: "Riscos que nao sao criaturas: ambiente, armadilhas, clima e sobrevivencia.",
    icon: Skull,
    items: [
      { title: "Acido", detail: "Exposicao causa dano quimico por rodada; imersao total e muito mais severa." },
      { title: "Armadilhas", detail: "Defina efeito, teste de resistencia e DT para encontrar/desarmar com Investigacao ou Crime." },
      { title: "Clima extremo", detail: "Calor ou frio severo pede Fortitude periodica; falha causa dano que so cura ao sair do ambiente." },
      { title: "Neblina", detail: "Pode gerar camuflagem leve ou total conforme distancia e densidade." },
      { title: "Chuva/tempestade", detail: "Penaliza Percepcao; tempestades podem gerar eventos perigosos por rodada." },
      { title: "Vento forte", detail: "Penaliza ataques a distancia e pode apagar chamas ou dissipar nevoa." },
      { title: "Doencas", detail: "Ao contato, teste resistencia. Falha infecta no estagio I; ao fim de cada cena, teste para piorar ou curar." },
      { title: "Fome e sede", detail: "Depois de um dia sem comida ou agua, Fortitude diaria progressiva; falhas acumulam condicoes graves." },
      { title: "Fumaca", detail: "Fortitude no inicio do turno; falha pode fazer perder turno, PV e ainda concede camuflagem." },
      { title: "Eletricidade/lava", detail: "Use dano por rodada conforme intensidade da fonte ou exposicao." },
    ],
  },
];

const NPC_NAMES = ["Aline Torres", "Caio Nogueira", "Helena Prado", "Rafael Muniz", "Mara Sales", "Otavio Ferraz", "Lia Andrade", "Dante Rocha"];
const NPC_CONCEPTS = [
  "testemunha que sabe mais do que admite",
  "funcionario de arquivo com acesso a documentos apagados",
  "vizinho que ouviu algo impossivel de madrugada",
  "policial local pressionado por superiores",
  "parente de uma vitima tentando esconder culpa",
  "ocultista arrependido procurando protecao",
  "especialista chamado para analisar um simbolo",
  "sobrevivente que perdeu a nocao do tempo",
];
const NPC_AGES = ["adolescente", "jovem adulto", "adulto", "maduro", "idoso"];
const NPC_APPEARANCES = ["olheiras marcadas", "postura rigida", "roupas formais gastas", "cicatriz discreta", "maos sempre inquietas", "voz baixa", "cabelo improvisadamente cortado", "sorriso facil demais"];
const NPC_PERSONALITIES = ["desconfiado", "prestativo ate demais", "impulsivo", "metodico", "supersticioso", "cansado e direto", "vaidoso", "culpado mas cooperativo"];
const NPC_HOOKS = [
  "tem uma pista complementar, mas quer uma garantia antes de falar",
  "viu um simbolo e copiou errado em um papel",
  "esta sendo seguido por alguem que nao aparece em cameras",
  "mente sobre onde estava na noite do evento",
  "reconhece um dos agentes de uma missao antiga",
  "carrega um objeto que nao entende e nao consegue descartar",
  "pode virar aliado se os agentes protegerem sua familia",
  "serve como isca perfeita para a proxima cena",
];

const INITIAL_NPC: NpcDraft = {
  name: "Aline Torres",
  concept: "testemunha que sabe mais do que admite",
  age: "adulto",
  appearance: "olheiras marcadas",
  personality: "desconfiado",
  hook: "tem uma pista complementar, mas quer uma garantia antes de falar",
};

function pick<T>(list: readonly T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function createNpc(): NpcDraft {
  return {
    name: pick(NPC_NAMES),
    concept: pick(NPC_CONCEPTS),
    age: pick(NPC_AGES),
    appearance: pick(NPC_APPEARANCES),
    personality: pick(NPC_PERSONALITIES),
    hook: pick(NPC_HOOKS),
  };
}

export function EscudoMestrePage() {
  const [query, setQuery] = useState("");
  const [npc, setNpc] = useState<NpcDraft>(INITIAL_NPC);

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SECTIONS;

    return SECTIONS
      .map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          `${section.title} ${item.title} ${item.detail} ${item.tag ?? ""}`.toLowerCase().includes(q),
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [query]);

  return (
    <main className="flex-1 overflow-y-auto">
      <section className="border-b border-border bg-card px-6 py-6">
        <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
          <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="rounded-sm text-[10px] uppercase tracking-[0.18em]">
                Consulta do mestre
              </Badge>
              <Badge variant="secondary" className="rounded-sm text-[10px] uppercase tracking-[0.18em]">
                Ordem Paranormal
              </Badge>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Escudo do Mestre</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              Referencia rapida para conduzir cenas, improvisar regras e criar NPCs sem interromper a mesa.
              Os textos sao resumos operacionais para consulta durante o jogo.
            </p>
          </div>

          <div className="relative w-full xl:w-96">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar condicao, manobra, DT..."
              className="pl-9"
            />
          </div>
        </div>
      </section>

      <div className="grid gap-6 px-6 py-6 xl:grid-cols-[220px_1fr_340px]">
        <aside className="hidden xl:block">
          <div className="sticky top-6 space-y-1 border border-border bg-card p-2">
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <section.icon className="h-3.5 w-3.5" />
                {section.label}
              </a>
            ))}
          </div>
        </aside>

        <div className="space-y-6">
          <section className="grid gap-3 md:grid-cols-3">
            <QuickCard icon={ListChecks} title="Durante a mesa" detail="Busque por regra, condicao ou acao e resolva em segundos." />
            <QuickCard icon={ShieldAlert} title="Improviso controlado" detail="DTs, perigos e urgencia ficam juntos para decisao rapida." />
            <QuickCard icon={Sparkles} title="Sem abrir o livro" detail="Use como lembrete, nao como substituto do material oficial." />
          </section>

          {filteredSections.length === 0 ? (
            <div className="border border-dashed border-border py-16 text-center">
              <p className="text-sm font-medium">Nada encontrado.</p>
              <p className="mt-1 text-xs text-muted-foreground">Tente buscar por sangrando, DT, fintar ou interludio.</p>
            </div>
          ) : (
            filteredSections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-6 border border-border bg-card p-5">
                <div className="mb-5 flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-border bg-muted text-primary">
                    <section.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary/70">
                      {section.label}
                    </p>
                    <h2 className="text-base font-semibold">{section.title}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
                  </div>
                </div>

                <div className="grid gap-3 lg:grid-cols-2">
                  {section.items.map((item) => (
                    <article key={`${section.id}-${item.title}`} className="border border-border bg-background p-3">
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <h3 className="text-sm font-semibold">{item.title}</h3>
                        {item.tag && (
                          <span className="shrink-0 border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-wider text-muted-foreground">
                            {item.tag}
                          </span>
                        )}
                      </div>
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        <RichText text={item.detail} />
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>

        <aside className="space-y-6">
          <div className="sticky top-6 space-y-6">
            <section className="border border-primary/30 bg-primary/5 p-5">
              <UserPlus className="mb-3 h-5 w-5 text-primary" />
              <p className="text-sm font-semibold">Criador de NPCs</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Gera um coadjuvante rapido para cenas de investigacao, suspeitos ou aliados improvisados.
              </p>

              <div className="mt-4 space-y-3 border border-border bg-card p-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Nome</p>
                  <p className="text-base font-semibold">{npc.name}</p>
                </div>
                <NpcLine label="Conceito" value={npc.concept} />
                <NpcLine label="Idade" value={npc.age} />
                <NpcLine label="Aparencia" value={npc.appearance} />
                <NpcLine label="Personalidade" value={npc.personality} />
                <NpcLine label="Gancho" value={npc.hook} />
              </div>

              <Button type="button" className="mt-4 w-full" onClick={() => setNpc(createNpc())}>
                Gerar NPC
              </Button>
            </section>

            <section className="border border-border bg-card p-5">
              <Brain className="mb-3 h-5 w-5 text-primary" />
              <p className="text-sm font-semibold">Decisao rapida</p>
              <div className="mt-3 space-y-2 text-sm">
                <DecisionLine label="Acao boa e simples" value="DT 15" />
                <DecisionLine label="Acao complexa" value="DT 20" />
                <DecisionLine label="Vaga ou arriscada" value="DT 25+" />
                <DecisionLine label="Ideia muito boa" value="+O ou +5" />
                <DecisionLine label="Cena sob pressao" value="Urgencia" />
              </div>
            </section>
          </div>
        </aside>
      </div>
    </main>
  );
}

function QuickCard({
  icon: Icon,
  title,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail: string;
}) {
  return (
    <div className="border border-border bg-card p-4">
      <Icon className="mb-3 h-5 w-5 text-primary" />
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

function NpcLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="text-sm leading-relaxed">{value}</p>
    </div>
  );
}

function DecisionLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn("shrink-0 font-mono text-xs font-semibold text-primary")}>
        <RichText text={value} />
      </span>
    </div>
  );
}

function RichText({ text }: { text: string }) {
  const parts = text.split(/([+-]O{1,3})/g);

  return (
    <>
      {parts.map((part, index) => {
        const match = part.match(/^([+-])(O{1,3})$/);
        if (!match) return <span key={`${part}-${index}`}>{part}</span>;

        return (
          <D20Token
            key={`${part}-${index}`}
            sign={match[1] as "+" | "-"}
            amount={match[2].length}
          />
        );
      })}
    </>
  );
}

function D20Token({ sign, amount }: { sign: "+" | "-"; amount: number }) {
  return (
    <span className={cn(
      "mx-1 inline-flex items-center gap-1.5 align-middle font-mono text-[10px] font-semibold",
      sign === "+" ? "text-primary" : "text-destructive",
    )}>
      <span className="text-xs leading-none">{sign}</span>
      <span className="inline-flex items-center gap-0.5 leading-none" aria-label={`${sign}${amount}d20`}>
        {Array.from({ length: amount }).map((_, index) => (
          <span
            key={index}
            className="relative inline-flex h-4 w-4 items-center justify-center text-[8px] font-black leading-none text-white"
            title={`${sign}${amount}d20`}
          >
            <span
              className={cn(
                "absolute inset-0 border [clip-path:polygon(50%_0%,95%_28%,82%_90%,18%_90%,5%_28%)]",
                sign === "+"
                  ? "border-primary bg-primary"
                  : "border-destructive bg-destructive",
              )}
            />
            <span className="relative">20</span>
          </span>
        ))}
      </span>
    </span>
  );
}
