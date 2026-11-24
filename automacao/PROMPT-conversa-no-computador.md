# Prompt para colar na conversa do app Claude no computador

Use uma vez, depois de instalar a skill `bmo-sync-sistema-interno`. Precisa do Claude in Chrome ativo,
da aba interno.bmogestao.com.br logada e do conector do Supabase.

---

Vamos fazer a primeira sincronização da carteira de clientes do Sistema Interno com o BMO Tarefas,
usando a skill bmo-sync-sistema-interno.

Contexto importante:
- A base do BMO Tarefas no Supabase foi reorganizada hoje (migração base_sop_v2). A estrutura oficial agora é
  bmo_clientes, bmo_sop_catalogo, bmo_sop_andamento e bmo_sop_checks. As tabelas bmo_sop_etapas e
  bmo_sop_tarefas que você criou antes foram substituídas pelo catálogo; o cliente Injecta foi mantido.
- Não crie nem altere tabelas, colunas ou políticas. Só leia o Sistema Interno e grave dados em bmo_clientes
  e bmo_sync_log, como a skill descreve.

O que fazer agora:
1. Leia a lista completa de clientes da aba do Sistema Interno (todas as páginas).
2. Me mostre as situações/fases que existem lá e como elas se encaixam em Em Implementação, Implementado e Churn.
3. Me mostre a tabela de diferenças contra o bmo_clientes. Atenção especial a:
   - 9 clientes com segmento a definir: Amanda Quadrado Dermatologia, Centro Oeste Serviços Médicos,
     Clínica Keola. Amanda Lino Teixeira, Gabriella Amorim, Clínica Regen, Rebeca Pinheiro, Eliana Medeiros,
     Transformare, Instituto Humani;
   - 4 marcados como Churn sem confirmação: Clínica Calvet, Clínica Rached, Luiz Felipe, Gustavo Kobayashi;
   - o ID do Sistema Interno de todos os clientes (hoje está vazio para todos).
4. Espere meu "ok" e grave.
5. Depois, crie uma tarefa agendada para rodar esta skill em dias úteis às 07h40, no modo agendado da skill.
