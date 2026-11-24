---
name: bmo-sync-sistema-interno
description: Sincroniza a carteira de clientes do Sistema Interno BMO (interno.bmogestao.com.br) com a base do BMO Tarefas no Supabase (tabela bmo_clientes), lendo a aba logada pelo Claude in Chrome. Use quando pedirem "sincronizar a carteira", "atualizar clientes do sistema interno", "atualizar agora", "rodar a sincronização" ou quando a tarefa agendada diária disparar. Só lê o Sistema Interno; só grava no Supabase.
---

# Sincronização Sistema Interno → BMO Tarefas (carteira de clientes)

Você é a ponte entre o Sistema Interno da BMO e a base do BMO Tarefas, enquanto não existe API.
O Sistema Interno é a **fonte oficial da carteira** (quem é cliente, segmento, Gerente de Contas, ID).
O Supabase é a **fonte oficial do andamento do SOP** — esta skill nunca mexe nele.

## Regras que não mudam

1. **Só leitura no Sistema Interno.** Não clique em salvar, editar, excluir ou criar nada lá.
2. **Nunca digite senha.** Se a aba mostrar a tela de login, pare e avise: "Sessão do Sistema Interno expirou — faça login na aba e peça para rodar de novo."
3. **Não altere a estrutura do banco** (create/alter/drop). A estrutura é mantida no repositório `erp-bmo/bmo-tarefas` (`supabase/migrations`). Se faltar coluna, pare e avise.
4. **Nunca apague cliente.** Cliente que sumiu do Sistema Interno é só sinalizado no resumo.
5. **Na dúvida, não grave.** Correspondência ambígua ou situação desconhecida vai para o resumo como pendência.
6. **Toda execução termina com registro em `bmo_sync_log`**, mesmo quando não houve mudança ou deu erro.

## Destino no Supabase (projeto pqwjrasdemihucqwqxro)

`public.bmo_clientes`
| Coluna | Uso |
|---|---|
| `id` | chave (slug: minúsculas, sem acento, hífens). Ex.: `injecta-medinfuse` |
| `nome` | nome oficial |
| `grafias` | text[] com grafias alternativas (as atas usam nomes livres) |
| `segmento` | `Em Implementação` · `Implementado` · `Churn` · null (a definir) |
| `id_sistema_interno` | ID/código do cliente no Sistema Interno — **chave preferencial de correspondência** |
| `gerente_contas` | Gerente de Contas responsável |
| `inicio_kickoff` | data de início/Kick-off (date) |
| `updated_at` | atualize com `now()` em toda gravação |

`public.bmo_sync_log`: `id` (text), `sync_type`, `client`, `tasks_count`, `payload_preview`, `status`, `created_at`.

## Passo a passo

### 1. Pré-checagem
- Confirme que a aba `interno.bmogestao.com.br` está aberta e logada (não é a tela `/login`).
- Leia a carteira atual: `select id, nome, grafias, segmento, id_sistema_interno, gerente_contas, inicio_kickoff from bmo_clientes order by nome;`

### 2. Leitura do Sistema Interno
Abra a lista de clientes (dashboard ou a visão de clientes) e extraia, para **cada** cliente: nome, ID/código,
situação/fase, Gerente de Contas e data de início, quando existirem. Percorra todas as páginas/abas da lista.
Se algum campo não existir na tela, registre como "não disponível" — não invente.

### 3. Correspondência (nesta ordem)
1. `id_sistema_interno` igual → mesmo cliente.
2. Nome do sistema igual a `nome` ou a uma das `grafias`, comparando sem acento, sem pontuação e sem diferença de maiúsculas.
3. Sem correspondência → **cliente novo**.
4. Mais de uma correspondência possível → **pendência** (não grave).

### 4. Situação do Sistema Interno → `segmento`
| No Sistema Interno | segmento |
|---|---|
| onboarding, implantação, implementação, kick-off, setup | `Em Implementação` |
| ativo, implementado, gestão, recorrente, acompanhamento | `Implementado` |
| cancelado, encerrado, inativo, churn, pausado definitivamente | `Churn` |
| qualquer outra coisa | pendência — não altere o segmento |

Na primeira execução, mostre a tabela real de situações encontradas e confirme o mapeamento com quem pediu.

### 5. Diferenças (mostre antes de gravar)
Monte uma tabela: cliente · campo · valor atual na base · valor no Sistema Interno · ação
(`atualizar`, `novo`, `sumiu do sistema`, `pendência`).
- **Execução manual ("atualizar agora")**: mostre a tabela e peça "ok" antes de gravar.
- **Execução agendada**: grave direto só `atualizar` e `novo`; tudo que for `pendência` ou `sumiu do sistema` vai para o resumo, sem gravar.
- Nunca troque um valor preenchido por vazio.

### 6. Gravação (uma transação)
```sql
begin;
-- cliente existente: só os campos que mudaram
update public.bmo_clientes
   set segmento = '…', gerente_contas = '…', id_sistema_interno = '…', updated_at = now()
 where id = '…';
-- cliente novo
insert into public.bmo_clientes (id, nome, grafias, segmento, id_sistema_interno, gerente_contas, inicio_kickoff)
values ('slug', 'Nome Oficial', '{}', '…', '…', '…', null)
on conflict (id) do nothing;
-- grafia nova encontrada para cliente existente
update public.bmo_clientes
   set grafias = array(select distinct unnest(grafias || array['Grafia Nova']) order by 1), updated_at = now()
 where id = '…';
commit;
```

### 7. Registro
```sql
insert into public.bmo_sync_log (id, sync_type, client, tasks_count, payload_preview, status)
values ('sync-carteira-' || to_char(now(), 'YYYYMMDD-HH24MI'), 'carteira_sistema_interno', null,
        <nº de clientes alterados ou criados>, '<resumo curto: X atualizados, Y novos, Z pendências>',
        '<ok | sem_mudancas | pendencias | erro_login | erro>');
```

### 8. Resumo final (curto)
- Atualizados: lista "cliente: campo antigo → novo"
- Novos: lista
- Sumiram do Sistema Interno: lista (nada foi apagado)
- Pendências para decisão humana: lista com o motivo
- Próxima execução: horário da tarefa agendada
