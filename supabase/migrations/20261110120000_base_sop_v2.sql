-- ════════════════════════════════════════════════════════════════════
-- Base do SOP v2 — BMO Tarefas (nova versão)
-- Roadmap "Base SOP e integração com o Sistema Interno" (10/11/2026), itens 1, 3 e 5.
--
-- Converte a base v1 (20261110042422_bmo_base_sop_v1, piloto Injecta) para a estrutura
-- oficial, sem perder dado:
--   bmo_clientes        → renomeia/acrescenta colunas; mantém as linhas
--   bmo_sop_etapas +
--   bmo_sop_tarefas     → substituídas por bmo_sop_catalogo (carga em 20261110120100)
--   bmo_sop_andamento   → recriada (estava vazia na v1)
--   bmo_tasks           → vínculo com o SOP harmonizado; colunas da v1 mantidas
-- Idempotente: pode rodar mais de uma vez.
-- ════════════════════════════════════════════════════════════════════

-- ─── 0. Views da v1 (recriadas no fim com a estrutura nova) ──────────
drop view if exists public.bmo_sop_gantt;
drop view if exists public.bmo_sop_status;

-- ─── 1. Clientes ─────────────────────────────────────────────────────
create table if not exists public.bmo_clientes (
  id    text primary key,
  nome  text not null
);
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'bmo_clientes' and column_name = 'aliases') then
    alter table public.bmo_clientes rename column aliases to grafias;
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'bmo_clientes' and column_name = 'interno_id') then
    alter table public.bmo_clientes rename column interno_id to id_sistema_interno;
  end if;
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'bmo_clientes' and column_name = 'atualizado_em') then
    alter table public.bmo_clientes rename column atualizado_em to updated_at;
  end if;
  -- "ativo" da v1 vira segmento: inativo = Churn
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'bmo_clientes' and column_name = 'ativo') then
    execute 'update public.bmo_clientes set segmento = ''Churn'' where ativo = false';
    alter table public.bmo_clientes drop column ativo;
  end if;
end $$;

alter table public.bmo_clientes
  add column if not exists grafias            text[] not null default '{}',   -- grafias alternativas usadas nas atas
  add column if not exists segmento           text,                          -- Em Implementação | Implementado | Churn; vazio = a definir
  add column if not exists squad              text default 'Squad Palermo',
  add column if not exists aba_planilha       text,                          -- aba do cliente na planilha do BMO Intelligence
  add column if not exists id_sistema_interno text,
  add column if not exists gerente_contas     text,                          -- responsável BMO (usuário do Sistema Interno)
  add column if not exists inicio_kickoff     date,                          -- Dia 0, base do Gantt planejado
  add column if not exists created_at         timestamptz not null default now(),
  add column if not exists updated_at         timestamptz not null default now();
alter table public.bmo_clientes alter column segmento drop not null;
alter table public.bmo_clientes alter column segmento drop default;
alter table public.bmo_clientes alter column squad drop not null;
alter table public.bmo_clientes drop constraint if exists bmo_clientes_segmento_check;
alter table public.bmo_clientes add constraint bmo_clientes_segmento_check
  check (segmento in ('Em Implementação', 'Implementado', 'Churn'));
create unique index if not exists bmo_clientes_nome_uq on public.bmo_clientes (nome);

-- ─── 2. Catálogo do SOP ──────────────────────────────────────────────
create table if not exists public.bmo_sop_catalogo (
  id                 text primary key,                  -- 'E01-T01' … 'E14-T01'
  versao             text not null,                     -- versão do Painel SOP de origem
  etapa_num          int  not null,
  etapa_nome         text not null,
  workflow           text not null check (workflow in ('Implementação', 'Gestão Contínua')),
  ordem              int  not null,                     -- ordem dentro da etapa
  sequencia          int  not null,                     -- ordem global (etapa, depois ordem): define a "frente"
  tarefa             text not null,
  descricao          text,
  papel_responsavel  text,
  tipo               text check (tipo in ('Manual', 'Recorrente')),
  prazo_padrao       text,
  prioridade         text check (prioridade in ('P1', 'P2', 'P3')),
  gate               text,
  skill_vinculada    text,
  sem_ini            numeric,                           -- semana planejada de início da etapa
  sem_fim            numeric,                           -- semana planejada de fim da etapa
  pop                jsonb,                             -- POP v8: objetivo, entradas, passos, saída, ferramentas, cuidados, pendências
  checklist          jsonb,                             -- itens de checklist da tarefa (E01-T04, E03-T04)
  ativo              boolean not null default true      -- tarefa retirada do SOP vira false, não é apagada
);
create unique index if not exists bmo_sop_catalogo_sequencia_idx on public.bmo_sop_catalogo (sequencia) where ativo;

-- ─── 3. Andamento por cliente ────────────────────────────────────────
-- A v1 criou esta tabela com outras colunas e sem linhas; recria só nesse caso.
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'bmo_sop_andamento' and column_name = 'tarefa_id') then
    if exists (select 1 from public.bmo_sop_andamento) then
      raise exception 'bmo_sop_andamento (v1) tem linhas: converta antes de recriar';
    end if;
    drop table public.bmo_sop_andamento;
  end if;
end $$;

create table if not exists public.bmo_sop_andamento (
  cliente_id     text not null references public.bmo_clientes (id) on update cascade,
  sop_tarefa_id  text not null references public.bmo_sop_catalogo (id) on update cascade,
  status         text not null default 'nao_iniciada'
                 check (status in ('nao_iniciada', 'em_andamento', 'bloqueada', 'concluida', 'nao_se_aplica')),
  iniciado_em    date,
  concluido_em   date,
  concluido_por  text,
  evidencia      text,
  origem         text not null default 'manual',       -- manual | sync | carga
  updated_at     timestamptz not null default now(),
  primary key (cliente_id, sop_tarefa_id)
);

-- Regra "Datas": início ao entrar em andamento; conclusão ao concluir.
create or replace function public.bmo_sop_andamento_datas() returns trigger
language plpgsql set search_path = public as $$
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

-- Checklists por cliente (documentos de fechamento, Checklist de Coleta)
create table if not exists public.bmo_sop_checks (
  cliente_id  text not null references public.bmo_clientes (id) on update cascade,
  check_id    text not null,                           -- ex.: 'CHK-E03-T04-01'
  l1          boolean not null default false,          -- 1º check (ex.: Recebido / Conferido — Vendedor)
  l2          boolean not null default false,          -- 2º check (ex.: Validado / Conferido — GC)
  updated_at  timestamptz not null default now(),
  primary key (cliente_id, check_id)
);

-- ─── 4. Tarefas das atas (bmo_tasks) ─────────────────────────────────
alter table public.bmo_tasks drop constraint if exists bmo_tasks_sop_tarefa_id_fkey;
alter table public.bmo_tasks drop constraint if exists bmo_tasks_cliente_id_fkey;
do $$
begin
  if exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'bmo_tasks' and column_name = 'vinculo_sop_status') then
    alter table public.bmo_tasks drop constraint if exists bmo_tasks_vinculo_sop_status_check;
    alter table public.bmo_tasks rename column vinculo_sop_status to vinculo_status;
  end if;
end $$;
alter table public.bmo_tasks
  add column if not exists sop_tarefa_id   text,
  add column if not exists cliente_id      text,
  add column if not exists vinculo_status  text,
  add column if not exists resp_bmo        text,       -- usuário BMO (padronizado)
  add column if not exists resp_cliente    text;       -- pessoa do cliente (texto livre)
-- A v1 marcou "sugerido" por padrão até em tarefas sem tarefa do SOP: corrige.
update public.bmo_tasks set vinculo_status = 'sem_vinculo'
  where sop_tarefa_id is null and (vinculo_status is null or vinculo_status = 'sugerido');
alter table public.bmo_tasks alter column vinculo_status set default 'sem_vinculo';
alter table public.bmo_tasks alter column vinculo_status set not null;
alter table public.bmo_tasks drop constraint if exists bmo_tasks_vinculo_status_check;
alter table public.bmo_tasks add constraint bmo_tasks_vinculo_status_check
  check (vinculo_status in ('sem_vinculo', 'sugerido', 'validado', 'descartado'));
alter table public.bmo_tasks add constraint bmo_tasks_sop_tarefa_id_fkey
  foreign key (sop_tarefa_id) references public.bmo_sop_catalogo (id) on update cascade;
alter table public.bmo_tasks add constraint bmo_tasks_cliente_id_fkey
  foreign key (cliente_id) references public.bmo_clientes (id) on update cascade;
create index if not exists bmo_tasks_sop_idx on public.bmo_tasks (cliente_id, sop_tarefa_id);

-- ─── 5. Catálogo da v1 (substituído por bmo_sop_catalogo) ────────────
drop table if exists public.bmo_sop_tarefas;
drop table if exists public.bmo_sop_etapas;

-- ─── 6. Situação do SOP por cliente e Gantt ──────────────────────────
-- Frente = tarefa mais adiantada (sequência) já iniciada, concluída ou bloqueada.
-- Pendente anterior = tarefa antes da frente que não está Concluída nem Não se aplica.
-- Subtarefas = tarefas das atas validadas e ligadas à tarefa do SOP (indicador; não mudam o status).
create or replace view public.bmo_sop_situacao with (security_invoker = true) as
with base as (
  select c.id as cliente_id, t.id as sop_tarefa_id, t.etapa_num, t.etapa_nome, t.workflow,
         t.ordem, t.sequencia, t.tarefa, t.papel_responsavel, t.sem_ini, t.sem_fim, c.inicio_kickoff,
         coalesce(a.status, 'nao_iniciada') as status, a.iniciado_em, a.concluido_em, a.evidencia
  from public.bmo_clientes c
  cross join public.bmo_sop_catalogo t
  left join public.bmo_sop_andamento a on a.cliente_id = c.id and a.sop_tarefa_id = t.id
  where t.ativo and coalesce(c.segmento, '') <> 'Churn'
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
       coalesce(s.sub_concluidas, 0) as subtarefas_concluidas,
       (b.status not in ('concluida', 'nao_se_aplica') and coalesce(s.sub_total, 0) > 0
        and s.sub_total = s.sub_concluidas) as subtarefas_todas_concluidas
from base b
left join frente f on f.cliente_id = b.cliente_id
left join subtarefas s on s.cliente_id = b.cliente_id and s.sop_tarefa_id = b.sop_tarefa_id;

create or replace view public.bmo_sop_gantt with (security_invoker = true) as
select cliente_id, etapa_num, etapa_nome, workflow,
       min(planejado_inicio) as planejado_inicio, max(planejado_fim) as planejado_fim,
       min(iniciado_em) as inicio_real,
       case when bool_and(status in ('concluida', 'nao_se_aplica')) then max(concluido_em) end as fim_real,
       round(100.0 * count(*) filter (where status in ('concluida', 'nao_se_aplica')) / count(*), 0) as pct,
       count(*) filter (where pendente_anterior) as pendentes_anteriores,
       case
         when bool_and(status in ('concluida', 'nao_se_aplica')) then 'concluida'
         when bool_or(pendente_anterior) then 'pendente'
         when bool_or(status in ('em_andamento', 'concluida', 'bloqueada')) then 'em_andamento'
         else 'nao_iniciada'
       end as situacao
from public.bmo_sop_situacao
group by cliente_id, etapa_num, etapa_nome, workflow;

-- ─── 7. Acesso ───────────────────────────────────────────────────────
-- O app ainda não tem login: segue o padrão das tabelas atuais (chave pública lê e grava).
-- Catálogo: só leitura pelo app. Decisão pendente do roadmap: login antes de ampliar o uso.
alter table public.bmo_clientes      enable row level security;
alter table public.bmo_sop_catalogo  enable row level security;
alter table public.bmo_sop_andamento enable row level security;
alter table public.bmo_sop_checks    enable row level security;
drop policy if exists public_all_clientes on public.bmo_clientes;
create policy public_all_clientes on public.bmo_clientes for all using (true) with check (true);
drop policy if exists public_read_catalogo on public.bmo_sop_catalogo;
create policy public_read_catalogo on public.bmo_sop_catalogo for select using (true);
drop policy if exists public_all_andamento on public.bmo_sop_andamento;
create policy public_all_andamento on public.bmo_sop_andamento for all using (true) with check (true);
drop policy if exists public_all_checks on public.bmo_sop_checks;
create policy public_all_checks on public.bmo_sop_checks for all using (true) with check (true);
