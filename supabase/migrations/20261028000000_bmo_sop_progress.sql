-- Progresso de cada cliente no SOP + BPM (etapas, tarefas e checklists).
-- id = '<cliente>::<item_id>'
--   kind 'tarefa' → item_id = ID da tarefa (ex.: E01-T01), status = nao_iniciado | andamento | concluido | bloqueado | na
--   kind 'check'  → item_id = '<CHK-id>#l1' ou '<CHK-id>#l2', status = ok | ''
--   kind 'meta'   → item_id = 'inicio', value = data do Kick-off (YYYY-MM-DD)
create table if not exists public.bmo_sop_progress (
  id text primary key,
  client text not null,
  item_id text not null,
  kind text not null default 'tarefa',
  status text default '',
  value text default '',
  updated_at timestamptz default now()
);
create index if not exists bmo_sop_progress_client_idx on public.bmo_sop_progress (client);

alter table public.bmo_sop_progress enable row level security;
drop policy if exists public_all_sop_progress on public.bmo_sop_progress;
create policy public_all_sop_progress on public.bmo_sop_progress for all using (true) with check (true);
