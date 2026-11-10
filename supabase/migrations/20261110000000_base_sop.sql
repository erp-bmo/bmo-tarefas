-- ════════════════════════════════════════════════════════════════════
-- Base do SOP — Roadmap "Base SOP e integração com o Sistema Interno" (10/11/2026)
-- Item 1 (catálogo, clientes, andamento) + item 3 (vínculo das tarefas das atas).
-- PROPOSTA PARA APROVAÇÃO — ainda não aplicada no Supabase.
-- Substitui a proposta anterior (20261028000000_bmo_sop_progress.sql), que nunca foi aplicada.
-- Nada aqui altera ou apaga dado existente: só cria tabelas e acrescenta colunas opcionais.
-- ════════════════════════════════════════════════════════════════════

-- ─── 1. Clientes ─────────────────────────────────────────────────────
-- Chave única do cliente. "grafias" junta os nomes livres já usados nas atas
-- (ex.: 'Calvet', 'Clínica Calvet'), para ligar o histórico sem reescrever texto.
create table if not exists public.bmo_clientes (
  id                  text primary key,                 -- slug estável, ex.: 'endoderma'
  nome                text not null unique,             -- nome oficial
  grafias             text[] not null default '{}',     -- grafias alternativas encontradas nas atas
  segmento            text not null default 'Em Implementação'
                      check (segmento in ('Em Implementação', 'Implementado', 'Churn')),
  id_sistema_interno  text,                             -- preenchido quando houver API / cadastro
  gerente_contas      text,                             -- responsável BMO (usuário do Sistema Interno)
  inicio_kickoff      date,                             -- Dia 0, base do Gantt planejado
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ─── 2. Catálogo do SOP ──────────────────────────────────────────────
-- Uma linha por tarefa do SOP (74 no Painel SOP). Dados da etapa ficam repetidos
-- em cada tarefa para o Gantt ler de um lugar só.
create table if not exists public.bmo_sop_catalogo (
  id                 text primary key,                  -- 'E01-T01' … 'E14-T01'
  versao             text not null,                     -- versão do Painel SOP de origem
  etapa_num          int  not null,
  etapa_nome         text not null,
  workflow           text not null check (workflow in ('Implementação', 'Gestão Contínua')),
  ordem              int  not null,                     -- ordem dentro da etapa
  sequencia          int  not null,                     -- ordem global (etapa, depois ordem) — define a "frente"
  tarefa             text not null,
  descricao          text,
  papel_responsavel  text,                              -- papel (Vendedor, GC, Analista…), não pessoa
  tipo               text check (tipo in ('Manual', 'Recorrente')),
  prazo_padrao       text,
  prioridade         text check (prioridade in ('P1', 'P2', 'P3')),
  gate               text,
  skill_vinculada    text,
  sem_ini            numeric,                           -- semana planejada de início da etapa
  sem_fim            numeric,                           -- semana planejada de fim da etapa
  ativo              boolean not null default true      -- tarefa retirada do SOP vira false, não é apagada
);
create unique index if not exists bmo_sop_catalogo_sequencia_idx on public.bmo_sop_catalogo (sequencia) where ativo;

-- ─── 3. Andamento por cliente ────────────────────────────────────────
-- Uma linha por cliente × tarefa do SOP. Sem bloqueio entre tarefas/etapas.
create table if not exists public.bmo_sop_andamento (
  cliente_id     text not null references public.bmo_clientes (id) on update cascade,
  sop_tarefa_id  text not null references public.bmo_sop_catalogo (id) on update cascade,
  status         text not null default 'nao_iniciada'
                 check (status in ('nao_iniciada', 'em_andamento', 'bloqueada', 'concluida', 'nao_se_aplica')),
  iniciado_em    date,
  concluido_em   date,
  concluido_por  text,
  evidencia      text,                                  -- opcional: link ou nota
  updated_at     timestamptz not null default now(),
  primary key (cliente_id, sop_tarefa_id)
);

-- Regra "Datas": início ao entrar em andamento; conclusão ao concluir.
create or replace function public.bmo_sop_andamento_datas() returns trigger
language plpgsql as $$
begin
  if new.status in ('em_andamento', 'concluida') and new.iniciado_em is null then
    new.iniciado_em := current_date;
  end if;
  if new.status = 'concluida' and new.concluido_em is null then
    new.concluido_em := current_date;
  elsif new.status <> 'concluida' then
    new.concluido_em := null;
    new.concluido_por := null;
  end if;
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists bmo_sop_andamento_datas on public.bmo_sop_andamento;
create trigger bmo_sop_andamento_datas before insert or update on public.bmo_sop_andamento
  for each row execute function public.bmo_sop_andamento_datas();

-- ─── 4. Vínculo das tarefas das atas (bmo_tasks) ─────────────────────
-- Subtarefas continuam livres; só ganham a tarefa do SOP e o cliente pela chave.
alter table public.bmo_tasks
  add column if not exists sop_tarefa_id   text references public.bmo_sop_catalogo (id) on update cascade,
  add column if not exists cliente_id      text references public.bmo_clientes (id) on update cascade,
  add column if not exists vinculo_status  text not null default 'sem_vinculo'
                           check (vinculo_status in ('sem_vinculo', 'sugerido', 'validado', 'descartado')),
  add column if not exists resp_bmo        text,       -- usuário BMO (padronizado)
  add column if not exists resp_cliente    text;       -- pessoa do cliente (texto livre)
create index if not exists bmo_tasks_sop_idx on public.bmo_tasks (cliente_id, sop_tarefa_id);

-- ─── 5. Frente do cliente e pendências anteriores ────────────────────
-- Frente = tarefa mais adiantada (sequência) já iniciada ou concluída.
-- Pendente anterior = tarefa antes da frente que não está Concluída nem Não se aplica.
create or replace view public.bmo_sop_situacao as
with base as (
  select c.id as cliente_id, t.id as sop_tarefa_id, t.etapa_num, t.sequencia,
         t.sem_ini, t.sem_fim, c.inicio_kickoff,
         coalesce(a.status, 'nao_iniciada') as status, a.iniciado_em, a.concluido_em
  from public.bmo_clientes c
  cross join public.bmo_sop_catalogo t
  left join public.bmo_sop_andamento a on a.cliente_id = c.id and a.sop_tarefa_id = t.id
  where t.ativo and c.segmento <> 'Churn'
),
frente as (
  select cliente_id, max(sequencia) as frente_seq
  from base where status in ('em_andamento', 'concluida', 'bloqueada')
  group by cliente_id
),
subtarefas as (
  select cliente_id, sop_tarefa_id,
         count(*) as sub_total,
         count(*) filter (where status = 'concluido') as sub_concluidas
  from public.bmo_tasks
  where vinculo_status = 'validado' and sop_tarefa_id is not null
  group by cliente_id, sop_tarefa_id
)
select b.*,
       f.frente_seq,
       (b.sequencia < coalesce(f.frente_seq, 0) and b.status not in ('concluida', 'nao_se_aplica')) as pendente_anterior,
       b.inicio_kickoff + (b.sem_ini * 7)::int as planejado_inicio,
       b.inicio_kickoff + (b.sem_fim * 7)::int as planejado_fim,
       coalesce(s.sub_total, 0) as subtarefas_total,
       coalesce(s.sub_concluidas, 0) as subtarefas_concluidas
from base b
left join frente f on f.cliente_id = b.cliente_id
left join subtarefas s on s.cliente_id = b.cliente_id and s.sop_tarefa_id = b.sop_tarefa_id;

-- ─── 6. Acesso ───────────────────────────────────────────────────────
-- ATENÇÃO (ponto do diagnóstico): o app ainda não tem login, então segue o mesmo
-- padrão das tabelas atuais — leitura e escrita para quem tem a chave pública.
-- Decisão pendente: colocar login (Supabase Auth) antes de ampliar o uso.
alter table public.bmo_clientes      enable row level security;
alter table public.bmo_sop_catalogo  enable row level security;
alter table public.bmo_sop_andamento enable row level security;
drop policy if exists public_all_clientes on public.bmo_clientes;
create policy public_all_clientes on public.bmo_clientes for all using (true) with check (true);
drop policy if exists public_read_catalogo on public.bmo_sop_catalogo;
create policy public_read_catalogo on public.bmo_sop_catalogo for select using (true);   -- catálogo: só leitura pelo app
drop policy if exists public_all_andamento on public.bmo_sop_andamento;
create policy public_all_andamento on public.bmo_sop_andamento for all using (true) with check (true);
