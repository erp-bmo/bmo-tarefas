# Automação — Sistema Interno ↔ BMO Tarefas

## Quem é dono de quê

| Dado | Fonte oficial | Quem atualiza |
|---|---|---|
| Carteira (cliente, segmento, Gerente de Contas, ID) | Sistema Interno | Skill `bmo-sync-sistema-interno` (Claude no computador, com Claude in Chrome) → `bmo_clientes` |
| Andamento do SOP por cliente | Supabase (`bmo_sop_andamento`) | Pessoas, pela aba Processo SOP do BMO Tarefas |
| Catálogo do SOP (74 tarefas, POPs) | Painel SOP v8 → `bmo_sop_catalogo` | Migração no repositório, a cada nova versão do SOP |
| Tarefas das atas (subtarefas) | `bmo_tasks` | BMO Intelligence → validação no BMO Tarefas |
| Estrutura do banco | Este repositório (`supabase/migrations`) | Só por migração revisada aqui |

Regra de ouro: **uma conversa só mexe na estrutura do banco** (este repositório). A conversa no computador lê o
Sistema Interno e grava dados, nunca estrutura.

## Como instalar a skill (uma vez)

1. Compacte a pasta `bmo-sync-sistema-interno` em um `.zip` (ou use o zip enviado na conversa).
2. No app Claude: Configurações → Capacidades → Skills → Enviar skill → escolha o zip.
3. Confirme que o conector do Supabase está ativo na conversa (o mesmo projeto do BMO Tarefas).

## Rotina

- **Diária (agendada):** dias úteis às 07h40, antes das bases das 8h do report de segunda.
  Computador ligado, Chrome aberto e logado no Sistema Interno.
- **Atualizar agora:** em qualquer conversa no computador, peça "rodar a sincronização da carteira".
- **Saúde:** toda execução grava uma linha em `bmo_sync_log` (`sync_type = 'carteira_sistema_interno'`).
  Sem linha nova no dia = a rotina não rodou (computador desligado ou sessão expirada).

## Próximo passo (roadmap item 6)

Mesma ponte no sentido contrário: tarefas **aprovadas** no BMO Tarefas (`approved = true`, vínculo com o SOP
validado) criadas/atualizadas no Sistema Interno. Só depois da carteira estar estável — e, idealmente, já com API.
