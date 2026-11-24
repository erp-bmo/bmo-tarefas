-- Blocos de reunião por cliente (aba Tarefas)
-- Cada reunião transcrita (ata Gemini/tl;dv ou bloco de agenda) vira um bloco,
-- ligado ao cliente do cadastro, com data real e link da ata.
alter table public.bmo_meetings
  add column if not exists cliente_id   text references public.bmo_clientes(id),
  add column if not exists meeting_date date,
  add column if not exists ata_url      text;

create index if not exists bmo_meetings_cliente_data_idx
  on public.bmo_meetings (cliente_id, meeting_date desc);

comment on column public.bmo_meetings.meeting_date is 'Data da reunião (ordena os blocos da mais recente para a mais antiga)';
comment on column public.bmo_meetings.ata_url      is 'Link da ata/anotações (Google Docs) que originou as tarefas';
