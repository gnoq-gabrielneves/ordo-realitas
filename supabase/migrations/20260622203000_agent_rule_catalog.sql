create table if not exists public.agent_rule_catalog (
  id text primary key,
  kind text not null check (
    kind in (
      'origem',
      'classe',
      'poder_origem',
      'poder_classe',
      'poder_paranormal',
      'poder_hexatombe',
      'hexatombe_regra'
    )
  ),
  name text not null,
  source text not null,
  element text check (element is null or element in ('sangue', 'morte', 'medo', 'conhecimento', 'energia')),
  class_name text,
  origin_name text,
  requirement text,
  action text,
  cost_pe integer check (cost_pe is null or cost_pe >= 0),
  summary text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agent_rule_catalog_kind_idx on public.agent_rule_catalog(kind);
create index if not exists agent_rule_catalog_element_idx on public.agent_rule_catalog(element);
create index if not exists agent_rule_catalog_name_idx on public.agent_rule_catalog using gin (to_tsvector('portuguese', name || ' ' || summary));

drop trigger if exists agent_rule_catalog_set_updated_at on public.agent_rule_catalog;
create trigger agent_rule_catalog_set_updated_at before update on public.agent_rule_catalog
for each row execute function public.set_updated_at();

alter table public.agent_rule_catalog enable row level security;

drop policy if exists "Authenticated users can read agent rule catalog" on public.agent_rule_catalog;
create policy "Authenticated users can read agent rule catalog"
on public.agent_rule_catalog for select
to authenticated
using (true);

insert into public.agent_rule_catalog
  (id, kind, name, source, element, class_name, origin_name, requirement, action, cost_pe, summary, data)
values
  ('classe:combatente', 'classe', 'Combatente', 'Ordem Paranormal RPG', null, 'Combatente', null, null, null, null, 'Especialista em confronto direto, armas e resistência em cenas de ação.', '{}'::jsonb),
  ('classe:especialista', 'classe', 'Especialista', 'Ordem Paranormal RPG', null, 'Especialista', null, null, null, null, 'Agente versátil focado em perícias, investigação, suporte e soluções táticas.', '{}'::jsonb),
  ('classe:ocultista', 'classe', 'Ocultista', 'Ordem Paranormal RPG', null, 'Ocultista', null, null, null, null, 'Conjurador de rituais que troca estabilidade por acesso direto ao Outro Lado.', '{}'::jsonb),
  ('classe:sobrevivente', 'classe', 'Sobrevivente', 'Sobrevivendo ao Horror', null, 'Sobrevivente', null, null, null, null, 'Pessoa comum tentando sobreviver ao paranormal com recursos mais limitados.', '{}'::jsonb),

  ('poder_origem:academico', 'poder_origem', 'Saber é Poder', 'Ordem Paranormal RPG - Origens', null, null, 'Acadêmico', null, null, null, 'Ao fazer um teste usando Intelecto, pode gastar PE para receber bônus no teste.', '{}'::jsonb),
  ('poder_origem:agente-saude', 'poder_origem', 'Técnica Medicinal', 'Ordem Paranormal RPG - Origens', null, null, 'Agente de Saúde', null, null, null, 'Melhora o uso de Medicina para cuidar de aliados durante cenas e interlúdios.', '{}'::jsonb),
  ('poder_origem:amnésico', 'poder_origem', 'Vislumbres do Passado', 'Ordem Paranormal RPG - Origens', null, null, 'Amnésico', null, null, null, 'O mestre escolhe pistas ou lembranças úteis ligadas ao passado apagado do personagem.', '{}'::jsonb),
  ('poder_origem:artista', 'poder_origem', 'Magnum Opus', 'Ordem Paranormal RPG - Origens', null, null, 'Artista', null, null, null, 'Uma vez por missão, alguém pode reconhecer sua obra, ajudando interações sociais.', '{}'::jsonb),
  ('poder_origem:atleta', 'poder_origem', '110%', 'Ordem Paranormal RPG - Origens', null, null, 'Atleta', null, null, null, 'Ao se esforçar em testes físicos, pode gastar PE para melhorar o resultado.', '{}'::jsonb),
  ('poder_origem:chef', 'poder_origem', 'Ingrediente Secreto', 'Ordem Paranormal RPG - Origens', null, null, 'Chef', null, null, null, 'Usa culinária e improviso para preparar algo útil em cenas apropriadas.', '{}'::jsonb),
  ('poder_origem:criminoso', 'poder_origem', 'O Crime Compensa', 'Ordem Paranormal RPG - Origens', null, null, 'Criminoso', null, null, null, 'Ao fim de missão, pode preservar um item encontrado sem contar no limite comum da próxima missão.', '{}'::jsonb),
  ('poder_origem:cultista-arrependido', 'poder_origem', 'Traços do Outro Lado', 'Ordem Paranormal RPG - Origens', null, null, 'Cultista Arrependido', null, null, null, 'Começa com um poder paranormal à escolha, mas carrega consequências do contato.', '{}'::jsonb),
  ('poder_origem:desgarrado', 'poder_origem', 'Calejado', 'Ordem Paranormal RPG - Origens', null, null, 'Desgarrado', null, null, null, 'Recebe PV adicional conforme avança, representando resistência de quem sobreviveu sozinho.', '{}'::jsonb),
  ('poder_origem:engenheiro', 'poder_origem', 'Ferramenta Favorita', 'Ordem Paranormal RPG - Origens', null, null, 'Engenheiro', null, null, null, 'Escolhe uma ferramenta ou item de ofício que recebe utilidade especial.', '{}'::jsonb),
  ('poder_origem:executivo', 'poder_origem', 'Processo Otimizado', 'Ordem Paranormal RPG - Origens', null, null, 'Executivo', null, null, null, 'Usa método e organização para tornar certas tarefas mais eficientes.', '{}'::jsonb),
  ('poder_origem:investigador', 'poder_origem', 'Faro para Pistas', 'Ordem Paranormal RPG - Origens', null, null, 'Investigador', null, null, null, 'Uma vez por cena, pode gastar PE para melhorar um teste para procurar pistas.', '{}'::jsonb),
  ('poder_origem:lutador', 'poder_origem', 'Mão Pesada', 'Ordem Paranormal RPG - Origens', null, null, 'Lutador', null, null, null, 'Recebe bônus em rolagens de dano com ataques corpo a corpo.', '{}'::jsonb),
  ('poder_origem:magnata', 'poder_origem', 'Patrocinador da Ordem', 'Ordem Paranormal RPG - Origens', null, null, 'Magnata', null, null, null, 'Seu limite de crédito é considerado um nível acima.', '{}'::jsonb),
  ('poder_origem:mercenario', 'poder_origem', 'Posição de Combate', 'Ordem Paranormal RPG - Origens', null, null, 'Mercenário', null, null, null, 'No primeiro turno de uma cena de ação, pode gastar PE para ganhar mobilidade extra.', '{}'::jsonb),
  ('poder_origem:militar', 'poder_origem', 'Para Bellum', 'Ordem Paranormal RPG - Origens', null, null, 'Militar', null, null, null, 'Recebe bônus em rolagens de dano com armas de fogo.', '{}'::jsonb),
  ('poder_origem:operario', 'poder_origem', 'Ferramenta de Trabalho', 'Ordem Paranormal RPG - Origens', null, null, 'Operário', null, null, null, 'Escolhe uma arma ligada ao ofício e a usa melhor em combate.', '{}'::jsonb),
  ('poder_origem:policial', 'poder_origem', 'Patrulha', 'Ordem Paranormal RPG - Origens', null, null, 'Policial', null, null, null, 'Recebe bônus fixo de Defesa.', '{}'::jsonb),
  ('poder_origem:religioso', 'poder_origem', 'Acalentar', 'Ordem Paranormal RPG - Origens', null, null, 'Religioso', null, null, null, 'Melhora testes de Religião para acalmar e pode restaurar Sanidade.', '{}'::jsonb),
  ('poder_origem:servidor-publico', 'poder_origem', 'Espírito Cívico', 'Ordem Paranormal RPG - Origens', null, null, 'Servidor Público', null, null, null, 'Ao ajudar alguém, pode gastar PE para aumentar o bônus concedido.', '{}'::jsonb),
  ('poder_origem:teorico-conspiracao', 'poder_origem', 'Eu Já Sabia', 'Ordem Paranormal RPG - Origens', null, null, 'Teórico da Conspiração', null, null, null, 'Recebe resistência a dano mental baseada no Intelecto.', '{}'::jsonb),
  ('poder_origem:ti', 'poder_origem', 'Motor de Busca', 'Ordem Paranormal RPG - Origens', null, null, 'T.I.', null, null, null, 'Com acesso à internet, pode substituir certos testes por Tecnologia a critério do mestre.', '{}'::jsonb),
  ('poder_origem:trabalhador-rural', 'poder_origem', 'Desbravador', 'Ordem Paranormal RPG - Origens', null, null, 'Trabalhador Rural', null, null, null, 'Melhora Adestramento ou Sobrevivência e ignora penalidades de terreno difícil.', '{}'::jsonb),
  ('poder_origem:trambiqueiro', 'poder_origem', 'Impostor', 'Ordem Paranormal RPG - Origens', null, null, 'Trambiqueiro', null, null, null, 'Uma vez por cena, pode gastar PE para substituir um teste por Enganação.', '{}'::jsonb),
  ('poder_origem:universitario', 'poder_origem', 'Dedicação', 'Ordem Paranormal RPG - Origens', null, null, 'Universitário', null, null, null, 'Recebe PE adicional e aumenta o limite de gasto por turno.', '{}'::jsonb),
  ('poder_origem:vitima', 'poder_origem', 'Cicatrizes Psicológicas', 'Ordem Paranormal RPG - Origens', null, null, 'Vítima', null, null, null, 'Recebe Sanidade adicional conforme NEX; com PD, melhora resistência a medo.', '{}'::jsonb),

  ('poder_paranormal:aprender-ritual', 'poder_paranormal', 'Aprender Ritual', 'Ordem Paranormal RPG - Poderes Paranormais', null, null, null, null, null, null, 'Você aprende um ritual à escolha e pode trocar um ritual conhecido, respeitando NEX e limite de rituais.', '{}'::jsonb),
  ('poder_paranormal:resistir-elemento', 'poder_paranormal', 'Resistir a <Elemento>', 'Ordem Paranormal RPG - Poderes Paranormais', null, null, null, null, null, null, 'Escolha Conhecimento, Energia, Morte ou Sangue; você recebe resistência contra o elemento escolhido.', '{}'::jsonb),
  ('poder_paranormal:afinidade-elemental', 'poder_paranormal', 'Afinidade Elemental', 'Ordem Paranormal RPG - Poderes Paranormais', null, null, null, 'NEX 50%', null, null, 'Você desenvolve afinidade com um elemento, dispensando componentes daquele elemento e liberando afinidades.', '{}'::jsonb),
  ('poder_paranormal:sangue-ferro', 'poder_paranormal', 'Sangue de Ferro', 'Ordem Paranormal RPG - Poderes Paranormais', 'sangue', null, null, null, null, null, 'Seu corpo se torna mais resistente, aumentando sua capacidade de suportar dano.', '{}'::jsonb),
  ('poder_paranormal:anatomia-insana', 'poder_paranormal', 'Anatomia Insana', 'Ordem Paranormal RPG - Poderes Paranormais', 'sangue', null, null, 'Sangue 2', null, null, 'Seu corpo transfigurado pode ignorar dano adicional de críticos e ataques furtivos.', '{}'::jsonb),
  ('poder_paranormal:arma-sangue', 'poder_paranormal', 'Arma de Sangue', 'Ordem Paranormal RPG - Poderes Paranormais', 'sangue', null, null, null, 'Movimento', 2, 'Permite manifestar uma arma orgânica de Sangue ligada ao próprio corpo.', '{}'::jsonb),
  ('poder_paranormal:sangue-fervente', 'poder_paranormal', 'Sangue Fervente', 'Ordem Paranormal RPG - Poderes Paranormais', 'sangue', null, null, 'Sangue 2', null, null, 'Enquanto machucado, a dor desperta força bestial e concede bônus em Agilidade ou Força.', '{}'::jsonb),
  ('poder_paranormal:sangue-vivo', 'poder_paranormal', 'Sangue Vivo', 'Ordem Paranormal RPG - Poderes Paranormais', 'sangue', null, null, 'Sangue 1', null, null, 'Na primeira vez que fica machucado na cena, recebe cura acelerada limitada pela metade dos PV máximos.', '{}'::jsonb),
  ('poder_paranormal:expansao-conhecimento', 'poder_paranormal', 'Expansão de Conhecimento', 'Ordem Paranormal RPG - Poderes Paranormais', 'conhecimento', null, null, 'Conhecimento 1', null, null, 'Você absorve fragmentos de saber impossível para acessar uma habilidade fora do comum.', '{}'::jsonb),
  ('poder_paranormal:percepcao-paranormal', 'poder_paranormal', 'Percepção Paranormal', 'Ordem Paranormal RPG - Poderes Paranormais', 'conhecimento', null, null, null, null, null, 'Em cenas de investigação, pode repetir um dado baixo ao procurar pistas, aceitando o novo resultado.', '{}'::jsonb),
  ('poder_paranormal:precognicao', 'poder_paranormal', 'Precognição', 'Ordem Paranormal RPG - Poderes Paranormais', 'conhecimento', null, null, 'Conhecimento 1', null, null, 'Vislumbres do futuro ajudam a reagir melhor contra ameaças e perigos.', '{}'::jsonb),
  ('poder_paranormal:sensitivo', 'poder_paranormal', 'Sensitivo', 'Ordem Paranormal RPG - Poderes Paranormais', 'conhecimento', null, null, null, null, null, 'Você sente emoções e intenções, recebendo apoio em interações sociais e leitura de pessoas.', '{}'::jsonb),
  ('poder_paranormal:visao-oculto', 'poder_paranormal', 'Visão do Oculto', 'Ordem Paranormal RPG - Poderes Paranormais', 'conhecimento', null, null, null, null, null, 'Sua percepção paranormal melhora testes de Percepção e permite enxergar no escuro.', '{}'::jsonb),
  ('poder_paranormal:potencial-aprimorado', 'poder_paranormal', 'Potencial Aprimorado', 'Ordem Paranormal RPG - Poderes Paranormais', 'morte', null, null, null, null, null, 'A Morte distorce seus limites, ampliando sua reserva para usar habilidades.', '{}'::jsonb),
  ('poder_paranormal:encarar-morte', 'poder_paranormal', 'Encarar a Morte', 'Ordem Paranormal RPG - Poderes Paranormais', 'morte', null, null, null, null, null, 'Durante cenas de ação, aumenta seu limite de gasto de PE sem alterar a DT dos efeitos.', '{}'::jsonb),
  ('poder_paranormal:escapar-morte', 'poder_paranormal', 'Escapar da Morte', 'Ordem Paranormal RPG - Poderes Paranormais', 'morte', null, null, 'Morte 1', null, null, 'Uma vez por cena, evita cair a 0 PV por dano comum e permanece de pé por pouco.', '{}'::jsonb),
  ('poder_paranormal:potencial-reaproveitado', 'poder_paranormal', 'Potencial Reaproveitado', 'Ordem Paranormal RPG - Poderes Paranormais', 'morte', null, null, null, null, null, 'Ao passar em testes de resistência, absorve momentos desperdiçados e ganha PE temporários.', '{}'::jsonb),
  ('poder_paranormal:surto-temporal', 'poder_paranormal', 'Surto Temporal', 'Ordem Paranormal RPG - Poderes Paranormais', 'morte', null, null, 'Morte 2', 'Livre', 3, 'Manipula brevemente o fluxo do tempo para agir em um ritmo anormal.', '{}'::jsonb),
  ('poder_paranormal:afortunado', 'poder_paranormal', 'Afortunado', 'Ordem Paranormal RPG - Poderes Paranormais', 'energia', null, null, null, null, null, 'A Energia distorce a sorte, permitindo resultados improváveis em momentos críticos.', '{}'::jsonb),
  ('poder_paranormal:campo-protetor', 'poder_paranormal', 'Campo Protetor', 'Ordem Paranormal RPG - Poderes Paranormais', 'energia', null, null, 'Energia 1', 'Reação', 1, 'Cria uma proteção instável de Energia para reduzir ou evitar ameaças imediatas.', '{}'::jsonb),
  ('poder_paranormal:causalidade-fortuita', 'poder_paranormal', 'Causalidade Fortuita', 'Ordem Paranormal RPG - Poderes Paranormais', 'energia', null, null, null, null, null, 'Em investigação, a Energia conduz descobertas e reduz a DT para procurar pistas.', '{}'::jsonb),
  ('poder_paranormal:golpe-sorte', 'poder_paranormal', 'Golpe de Sorte', 'Ordem Paranormal RPG - Poderes Paranormais', 'energia', null, null, 'Energia 1', null, null, 'Seus ataques recebem aumento na margem de ameaça, tornando críticos mais prováveis.', '{}'::jsonb),
  ('poder_paranormal:manipular-entropia', 'poder_paranormal', 'Manipular Entropia', 'Ordem Paranormal RPG - Poderes Paranormais', 'energia', null, null, 'Energia 1', 'Reação', 2, 'Quando outro ser em alcance curto faz um teste, pode forçar a rerrolagem de um dado.', '{}'::jsonb),

  ('poder_hexatombe:desejo', 'poder_hexatombe', 'Fruto da Ambição', 'Arquivos Secretos - Hexatombe', null, null, null, 'Sacrifício do Desejo', 'Passiva', 0, 'Escolha um poder ou ritual que conheça. Além do efeito padrão, a habilidade se torna um gatilho para assumir sua forma suprema.', '{}'::jsonb),
  ('poder_hexatombe:rancor', 'poder_hexatombe', 'Ódio Suprimido', 'Arquivos Secretos - Hexatombe', null, null, null, 'Sacrifício do Rancor', 'Completa', 3, 'Explode de raiva contra seres em alcance curto, exigindo Fortitude e Reflexos contra sua DT.', '{}'::jsonb),
  ('poder_hexatombe:obsessao', 'poder_hexatombe', 'Despertar Obsessão', 'Arquivos Secretos - Hexatombe', null, null, null, 'Sacrifício da Obsessão', 'Padrão', 3, 'Força um alvo a encarar ou desviar; em falha, ele fica obcecado por você por 1 rodada.', '{}'::jsonb),
  ('poder_hexatombe:prazer', 'poder_hexatombe', 'Estimular Hedonismo', 'Arquivos Secretos - Hexatombe', null, null, null, 'Sacrifício do Prazer', 'Padrão', 3, 'Toma um alvo por prazer insano; em falha, ele perde autopreservação e fica indefeso por 1 rodada.', '{}'::jsonb),
  ('poder_hexatombe:orgulho', 'poder_hexatombe', 'Arrogância Diabólica', 'Arquivos Secretos - Hexatombe', null, null, null, 'Sacrifício do Orgulho', 'Padrão', 3, 'Provoca imprudência no alvo ou causa dano mental inevitável se ele resistir.', '{}'::jsonb),
  ('poder_hexatombe:culpa', 'poder_hexatombe', 'Causar Culpa', 'Arquivos Secretos - Hexatombe', null, null, null, 'Sacrifício da Culpa', 'Padrão', 3, 'O alvo revive culpa extrema, fica indefeso e testa no início dos turnos para se libertar.', '{}'::jsonb),

  ('hexatombe_regra:digno-sacrificio', 'hexatombe_regra', 'Digno de Sacrifício', 'Arquivos Secretos - Hexatombe', null, null, null, null, null, null, 'Para ser sacrifício da Hexatombe, o personagem precisa ter carregado o Trono em algum momento.', '{}'::jsonb),
  ('hexatombe_regra:batalha-intencoes', 'hexatombe_regra', 'Batalha de Intenções', 'Arquivos Secretos - Hexatombe', null, null, null, null, null, null, 'Conflitos diretos de intenção aumentam dano contra o alvo e reduzem danos vindos de fora do confronto.', '{}'::jsonb),
  ('hexatombe_regra:trocas-recursos', 'hexatombe_regra', 'Trocas de Recursos', 'Arquivos Secretos - Hexatombe', null, null, null, null, null, null, 'Informações custam 1 recurso; segredos relevantes custam 3 recursos.', '{}'::jsonb)
on conflict (id) do update set
  kind = excluded.kind,
  name = excluded.name,
  source = excluded.source,
  element = excluded.element,
  class_name = excluded.class_name,
  origin_name = excluded.origin_name,
  requirement = excluded.requirement,
  action = excluded.action,
  cost_pe = excluded.cost_pe,
  summary = excluded.summary,
  data = excluded.data;
