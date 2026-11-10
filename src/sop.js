// SOP + BPM — Modelo de Gestão BMO (v8.0-pop-20261103)
// Gerado a partir do Painel_SOP_BMO_v8.html (SEED), com o POP de cada etapa e tarefa
// (Manual de POPs v8). Para atualizar, substitua os arrays abaixo.
export const SOP_VERSAO = "v8.0-pop-20261103"

export const SOP_ETAPAS = [
 {
  "num": 1,
  "nome": "Kick-off",
  "workflow": "Implementação",
  "objetivo": "Formalizar a entrada do cliente: \"Ganho\" registrado no CRM, squad definido, cadastro completo com documentos conferidos, grupo ativo com boas-vindas do Vendedor e do Gerente de Contas e Formulário de diagnóstico enviado pelo cliente.",
  "trigger": "Contrato assinado + proposta aceita.",
  "gate": "\"Ganho\" no CRM + squad definido + cadastro completo + 3 documentos conferidos + grupo criado com boas-vindas (Vendedor e Gerente de Contas) + Formulário enviado com data de preferência.",
  "mp": "MP1 — Comercial e Fechamento",
  "semIni": 0,
  "semFim": 0.5,
  "pop": {
   "ent": [
    "Contrato assinado",
    "Proposta aceita",
    "Comprovante de pagamento",
    "Relatório de Fechamento",
    "Dados cadastrais do contrato (CNPJ, razão social, endereço com CEP, responsável)"
   ],
   "sai": [
    "\"Ganho\" no CRM",
    "Squad registrado",
    "Cliente cadastrado com 3 documentos conferidos",
    "Grupo \"Gestão <> bmo & [Cliente]\" ativo",
    "Formulário de diagnóstico enviado com data de preferência"
   ],
   "dep": "Fechamento comercial.",
   "cad": "Pontual · Dia 0 até o envio do Formulário",
   "pend": [
    "Template oficial das mensagens de boas-vindas (Vendedor e GC) não localizado no Projeto.",
    "Sistema de CRM usado para o registro do \"Ganho\" não nomeado nas fontes."
   ]
  }
 },
 {
  "num": 2,
  "nome": "Onboarding e Diagnóstico",
  "workflow": "Implementação",
  "objetivo": "Ler o formulário, construir o diagnóstico inicial e realizar a reunião de onboarding com metas alinhadas.",
  "trigger": "Kick-off concluído + formulário preenchido.",
  "gate": "Diagnóstico aprovado + reunião realizada + apresentação salva na área do cliente.",
  "mp": "MP2 — Onboarding e Diagnóstico",
  "semIni": 0.5,
  "semFim": 1.5,
  "pop": {
   "ent": [
    "Formulário de diagnóstico preenchido",
    "Data de preferência do cliente",
    "Arquivos-base disponíveis (PCF, atas, WhatsApp)"
   ],
   "sai": [
    "Briefing/diagnóstico aprovado internamente",
    "Reunião de onboarding realizada",
    "Lista de coleta enviada",
    "Apresentação salva na área do cliente"
   ],
   "dep": "Etapa 1 concluída.",
   "cad": "Pontual · Dia 1 até a reunião"
  }
 },
 {
  "num": 3,
  "nome": "Coleta e Organização dos Dados",
  "workflow": "Implementação",
  "objetivo": "Receber, organizar e validar os dados de implementação a partir do Checklist de Coleta: extratos bancários (OFX), acesso ao sistema de gestão, taxas de cartão, alíquotas tributárias (via contador), planilhas financeiras, DRE existente, regras do negócio e, se pertinente, identidade visual e plano de negócios.",
  "trigger": "Onboarding realizado + mensagem de coleta enviada.",
  "gate": "Itens obrigatórios do Checklist de Coleta recebidos e validados + OFX organizado + acesso ao sistema de gestão testado + taxas e alíquotas registradas.",
  "mp": "MP3 — Implementação Financeira",
  "semIni": 1.5,
  "semFim": 2.5,
  "pop": {
   "ent": [
    "Checklist de Coleta (16 itens, BD_Checklists)",
    "Extratos OFX 6 meses",
    "Acesso ao sistema de gestão",
    "Contato do contador"
   ],
   "sai": [
    "OFX organizado por conta e período",
    "Acessos, taxas e alíquotas registrados",
    "Itens obrigatórios recebidos e validados"
   ],
   "dep": "Onboarding realizado + mensagem de coleta enviada.",
   "cad": "Semanal até concluir a coleta",
   "pend": [
    "Formato do report semanal de implementação a decidir na rodada da Etapa 11 (PV-10)."
   ]
  }
 },
 {
  "num": 4,
  "nome": "BD_Financeiro",
  "workflow": "Implementação",
  "objetivo": "Parametrizar o Conta Azul, ativar a integração bancária e concluir a conciliação retroativa de no mínimo 3 meses.",
  "trigger": "Coleta de dados recebida + reunião financeira agendada.",
  "gate": "Conta Azul parametrizado + integração ativa + conciliação de 3 meses sem inconsistências.",
  "mp": "MP3 — Implementação Financeira",
  "semIni": 1.75,
  "semFim": 4.0,
  "pop": {
   "ent": [
    "OFX organizado (E03-T01)",
    "Plano de contas",
    "Estrutura de custos da clínica"
   ],
   "sai": [
    "ContaAzul parametrizado",
    "Integração bancária ativa",
    "Conciliação retroativa de 3 meses sem inconsistências",
    "BD_Financeiro"
   ],
   "dep": "Coleta recebida + reunião financeira agendada.",
   "cad": "Pontual com follow-up semanal",
   "pend": [
    "Modelo padrão da planilha de movimentações não identificadas não localizado no Projeto."
   ]
  }
 },
 {
  "num": 5,
  "nome": "BD_Vendas",
  "workflow": "Implementação",
  "objetivo": "Validar o uso do sistema de vendas do cliente, treinar a equipe se necessário e estabelecer a atualização diária da base.",
  "trigger": "Onboarding concluído + acesso ao sistema solicitado.",
  "gate": "Sistema validado + acesso BMO criado + base de vendas atualizada diariamente.",
  "mp": "MP3 — Implementação Financeira",
  "semIni": 1.5,
  "semFim": 3.5,
  "pop": {
   "ent": [
    "Acesso BMO ao sistema de vendas/agendamento",
    "Contato de quem lança as vendas"
   ],
   "sai": [
    "Sistema validado",
    "Acesso BMO testado",
    "BD_Vendas atualizado diariamente"
   ],
   "dep": "Onboarding concluído + acesso solicitado.",
   "cad": "Diária (atualização da base)"
  }
 },
 {
  "num": 6,
  "nome": "BD_Cunt",
  "workflow": "Implementação",
  "objetivo": "Construir e validar as fichas técnicas de custo unitário por procedimento a partir de notas fiscais e orçamentos.",
  "trigger": "Solicitação de NFs e orçamentos recebida.",
  "gate": "Ficha técnica validada com o cliente + BD_Cunt parametrizado e disponível.",
  "mp": "MP3 — Implementação Financeira",
  "semIni": 2.0,
  "semFim": 4.5,
  "pop": {
   "ent": [
    "NFs das últimas compras",
    "Orçamentos de insumos",
    "Tabela de procedimentos"
   ],
   "sai": [
    "Ficha técnica validada com o cliente",
    "BD_Cunt parametrizado"
   ],
   "dep": "NFs e orçamentos recebidos (item 7 do Checklist de Coleta).",
   "cad": "Pontual",
   "pend": [
    "Não há prompt de pré-construção de ficha técnica na biblioteca (lacuna da etapa)."
   ]
  }
 },
 {
  "num": 7,
  "nome": "DRE e DFC",
  "workflow": "Implementação",
  "objetivo": "Construir a DRE Financeira, a DRE Gerencial e o DFC, apresentar a DRE retroativa ao cliente e arquivar os entregáveis.",
  "trigger": "Bases BD_Financeiro, BD_Vendas e BD_Cunt concluídas.",
  "gate": "DREs e DFC construídos e revisados + reunião de apresentação realizada + arquivos salvos.",
  "mp": "MP3 — Implementação Financeira",
  "semIni": 4.0,
  "semFim": 6.0,
  "pop": {
   "ent": [
    "BD_Financeiro conciliado",
    "BD_Vendas",
    "BD_Cunt",
    "Alíquotas e taxas registradas"
   ],
   "sai": [
    "DRE Financeira",
    "DRE Gerencial",
    "DFC integrado ao PCF",
    "Apresentação da DRE retroativa",
    "Arquivos na área do cliente"
   ],
   "dep": "Etapas 4, 5 e 6 concluídas.",
   "cad": "Pontual (retroativo)"
  }
 },
 {
  "num": 8,
  "nome": "Pricer",
  "workflow": "Implementação",
  "objetivo": "Analisar a tabela de preços atual, ratear o custo fixo por categoria, construir e treinar a ferramenta de precificação.",
  "trigger": "BD_Cunt finalizado + tabela de preços recebida.",
  "gate": "Pricer validado em reunião + ajustes aplicados + módulo disponível na área do cliente.",
  "mp": "MP3 — Implementação Financeira",
  "semIni": 4.5,
  "semFim": 7.0,
  "pop": {
   "ent": [
    "Tabela de preços vigente",
    "BD_Cunt finalizado",
    "Estrutura de custo fixo da DRE",
    "Taxas de cartão e alíquotas"
   ],
   "sai": [
    "Rateio de custo fixo validado",
    "Pricer aprovado",
    "Pricer publicado no módulo do cliente"
   ],
   "dep": "BD_Cunt finalizado + tabela de preços recebida.",
   "cad": "Pontual",
   "pend": [
    "Critério padrão de rateio do custo fixo por categoria não documentado no Projeto.",
    "Margem-alvo padrão BMO não documentada."
   ]
  }
 },
 {
  "num": 9,
  "nome": "BI — Dashboard de Acompanhamento",
  "workflow": "Implementação",
  "objetivo": "Construir as quatro abas do BI: Análise de Lucratividade, Análise Comercial, Análise de Margem e Planejamento Estratégico (parcial).",
  "trigger": "DRE, DFC e Pricer concluídos.",
  "gate": "Quatro abas construídas, testadas e validadas internamente.",
  "mp": "MP4 — Reports e BI",
  "semIni": 6.0,
  "semFim": 8.5,
  "pop": {
   "ent": [
    "DRE e DFC",
    "Pricer",
    "BD_Vendas",
    "BD_Cunt"
   ],
   "sai": [
    "Abas Lucratividade, Comercial e Margem validadas",
    "Aba Planejamento Estratégico parcial"
   ],
   "dep": "DRE, DFC e Pricer concluídos.",
   "cad": "Pontual"
  }
 },
 {
  "num": 10,
  "nome": "Planejamento Estratégico",
  "workflow": "Implementação",
  "objetivo": "Construir a projeção trimestral com insights, realizar a reunião estratégica e finalizar o BI com as metas validadas.",
  "trigger": "BI construído + projeção trimestral elaborada.",
  "gate": "Reunião realizada + BI finalizado com metas + apresentação salva na área do cliente.",
  "mp": "MP5 — Gestão Contínua",
  "semIni": 8.5,
  "semFim": 10.0,
  "pop": {
   "ent": [
    "BI construído",
    "PCF auditado (Fase 1, Prompt A)",
    "Histórico e atas datadas"
   ],
   "sai": [
    "Projeção trimestral e insights",
    "Diagnóstico Fase 6 (ICB, restrição dominante, IDE, OKR)",
    "Reunião de Planejamento Estratégico",
    "BI com metas validadas"
   ],
   "dep": "BI construído. Na biblioteca: Fase 1 → Fase 2 → Fase 6 → Fase 3.",
   "cad": "Trimestral (marco final da implementação)"
  }
 },
 {
  "num": 11,
  "nome": "Report Semanal",
  "workflow": "Gestão Contínua",
  "objetivo": "Atualizar as bases, construir, validar e enviar o report semanal ao cliente toda segunda-feira.",
  "trigger": "Cliente em Gestão Contínua (implementação concluída).",
  "gate": "Report enviado no SLA + confirmação de recebimento registrada.",
  "mp": "MP5 — Gestão Contínua",
  "semIni": 10.0,
  "semFim": 12.0,
  "pop": {
   "ent": [
    "BD_Vendas e BD_Financeiro da semana",
    "Tarefas no BMO Tarefas (status)",
    "KPIs da restrição dominante (Fase 6)"
   ],
   "sai": [
    "Report enviado no SLA",
    "Confirmação de recebimento registrada"
   ],
   "dep": "Cliente em Gestão Contínua.",
   "cad": "Toda segunda-feira · SLA: bases 8h → report 10h → envio 12h",
   "pend": [
    "Template padrão do report semanal não localizado no Projeto (etapa sem prompt dedicado — prioridade máxima O1)."
   ]
  }
 },
 {
  "num": 12,
  "nome": "Planejamento Financeiro Mensal",
  "workflow": "Gestão Contínua",
  "objetivo": "Enviar metas, comissionamento e repasse, realizar a reunião mensal de resultado e consolidar a DRE com custos fechados.",
  "trigger": "Virada do mês + bases atualizadas.",
  "gate": "Reunião realizada + DRE consolidada enviada até o dia 15 + arquivos salvos.",
  "mp": "MP5 — Gestão Contínua",
  "semIni": 10.0,
  "semFim": 12.0,
  "pop": {
   "ent": [
    "Metas validadas no BI",
    "Regras de comissionamento e repasse (Checklist itens 10 e 11)",
    "Custos do mês"
   ],
   "sai": [
    "Meta do mês enviada",
    "Comissionamento e repasse enviados",
    "Reunião de resultado",
    "DRE consolidada até o dia 15"
   ],
   "dep": "Virada do mês + bases atualizadas.",
   "cad": "Mensal · 1º ao 15º dia útil",
   "pend": [
    "O conteúdo de acompanhamento mensal está preso ao arquivo da Dra. Natalia Dyna, que não está no Projeto."
   ]
  }
 },
 {
  "num": 13,
  "nome": "Gestão de Riscos",
  "workflow": "Gestão Contínua",
  "objetivo": "Preencher a planilha semanal de riscos, revisar em reunião interna e definir plano de ação para clientes em risco.",
  "trigger": "Cliente em Gestão Contínua + reunião semanal programada.",
  "gate": "Planilha atualizada + riscos classificados + planos de ação com owner e prazo.",
  "mp": "MP6 — Gestão de Riscos e Oportunidades",
  "semIni": 10.0,
  "semFim": 12.0,
  "pop": {
   "ent": [
    "Planilha de Gestão de Riscos",
    "Último contato do decisor",
    "Uso de Pricer, BI, DRE e ERP",
    "Atas e grupos de WhatsApp"
   ],
   "sai": [
    "Planilha atualizada",
    "Riscos classificados",
    "Plano de ação com owner e prazo"
   ],
   "dep": "Cliente em Gestão Contínua + reunião semanal programada.",
   "cad": "Semanal · reunião interna quarta ou quinta"
  }
 },
 {
  "num": 14,
  "nome": "Encerramento / Expansão",
  "workflow": "Gestão Contínua",
  "objetivo": "Revisar o ciclo do cliente e executar o handoff para CRM ao encerrar o contrato ou abrir frente de expansão.",
  "trigger": "Sinal de churn OU encerramento de contrato.",
  "gate": "Handoff registrado + CRM atualizado.",
  "mp": "MP7 — Expansão e Retenção",
  "semIni": 11.0,
  "semFim": 12.0,
  "pop": {
   "ent": [
    "Sinal de churn ou encerramento de contrato",
    "Histórico completo do cliente"
   ],
   "sai": [
    "Handoff registrado",
    "CRM atualizado",
    "Relatório de Churn / História Clínica (quando churn)"
   ],
   "dep": "Sinal de churn OU encerramento.",
   "cad": "Pontual · fim de ciclo",
   "pend": [
    "Checklist curto de handoff ainda não criado (ação recomendada: Simplificar)."
   ]
  }
 }
]

export const SOP_TAREFAS = [
 {
  "id": "E01-T01",
  "etapaNum": 1,
  "nTarefa": 1,
  "tarefa": "Registro do \"Ganho\" no CRM",
  "descricao": "Ao fechar a venda, o Vendedor registra a oportunidade como \"Ganho\" no CRM. É o marco formal de entrada do cliente e o gatilho para o Diretor definir o squad.",
  "responsavel": "Vendedor",
  "tipo": "Manual",
  "prazo": "Dia 0",
  "prioridade": "P1",
  "gate": "Oportunidade registrada como \"Ganho\" no CRM.",
  "vinculado": "Nenhum",
  "pop": {
   "obj": "Formalizar a entrada do cliente e disparar a definição do squad.",
   "ent": [
    "Contrato assinado",
    "Proposta aceita"
   ],
   "passos": [
    "Conferir que contrato e proposta estão assinados e aceitos.",
    "Abrir a oportunidade no CRM e mudar o estágio para \"Ganho\".",
    "Registrar valor de implementação e MRR conforme proposta.",
    "Avisar o Diretor que o cliente está pronto para definição do squad."
   ],
   "sai": "Oportunidade em \"Ganho\" no CRM.",
   "ferr": [
    "CRM"
   ],
   "cuid": [
    "Sem \"Ganho\" registrado, o squad não é definido — é o marco formal do Dia 0."
   ],
   "pend": [
    "Nome do CRM e campos obrigatórios da oportunidade não constam nas fontes."
   ]
  }
 },
 {
  "id": "E01-T02",
  "etapaNum": 1,
  "nTarefa": 2,
  "tarefa": "Definição do squad",
  "descricao": "Com o \"Ganho\" registrado no CRM, o Diretor designa formalmente qual squad atenderá o cliente, considerando carga de carteira e perfil da clínica. Conclui quando o squad está registrado no sistema interno.",
  "responsavel": "Diretor",
  "tipo": "Manual",
  "prazo": "Dia 0",
  "prioridade": "P1",
  "gate": "Squad definido e registrado no sistema.",
  "vinculado": "Nenhum",
  "pop": {
   "obj": "Designar o squad que atenderá o cliente.",
   "ent": [
    "\"Ganho\" no CRM",
    "Carga atual de cada squad",
    "Perfil da clínica"
   ],
   "passos": [
    "Verificar a carga de carteira de cada squad (meta: 30 clientes por squad).",
    "Avaliar o perfil da clínica (especialidade, porte, complexidade).",
    "Designar o squad e registrá-lo no sistema interno.",
    "Comunicar o Vendedor e o Gerente de Contas do squad escolhido."
   ],
   "sai": "Squad registrado no sistema interno.",
   "ferr": [
    "Sistema interno BMO"
   ],
   "cuid": [
    "Registrar o squad antes do cadastro (E01-T03) — o cadastro exige o campo Squad."
   ]
  }
 },
 {
  "id": "E01-T03",
  "etapaNum": 1,
  "nTarefa": 3,
  "tarefa": "Criação do perfil, acesso e cadastro do cliente no sistema interno",
  "descricao": "Com o squad definido, o Vendedor cria o perfil e o acesso do cliente no sistema interno e preenche o cadastro completo, aproveitando os dados já coletados para o contrato (CNPJ, razão social, endereço com CEP, nome completo e e-mail do responsável). Sem este cadastro, nenhuma etapa seguinte é liberada.",
  "responsavel": "Vendedor",
  "tipo": "Manual",
  "prazo": "Dia 0",
  "prioridade": "P1",
  "gate": "Perfil e acesso criados + cadastro completo no sistema.",
  "vinculado": "Nenhum",
  "pop": {
   "obj": "Criar perfil, acesso e cadastro completo do cliente.",
   "ent": [
    "Dados do contrato: CNPJ, razão social, endereço com CEP, nome e e-mail do responsável",
    "Squad definido"
   ],
   "passos": [
    "Acessar /client/new no sistema interno.",
    "Preencher Nome, Squad, Status, Segmento, Produto, Cidade/UF, Dia do Pagamento, Data de início, Implementação (R$), MRR e Template \"padrão\".",
    "Criar as credenciais no Pricer no padrão clinica.nome com a senha de 1º acesso (Manual de Boas Práticas, Fase 2).",
    "Ativar \"Exibir formulário de onboarding para esta clínica\" e validar em \"Acessar Pricer\".",
    "Conferir que o cadastro redireciona para a visão do Squad."
   ],
   "sai": "Perfil, acesso e cadastro completos no sistema.",
   "ferr": [
    "Sistema interno (bmo-interno.onrender.com)",
    "Pricer (app.bmogestao.com.br)"
   ],
   "cuid": [
    "Login em minúsculas, sem espaço ou acento.",
    "Campo Cidade/UF exige seleção da opção listada; se não existir, criar pelo botão \"+\"."
   ]
  }
 },
 {
  "id": "E01-T04",
  "etapaNum": 1,
  "nTarefa": 4,
  "tarefa": "Anexo e conferência dos documentos de fechamento",
  "descricao": "O Vendedor anexa ao cadastro os três documentos de fechamento: Comprovante de Pagamento, Contrato Assinado e Relatório de Fechamento. Cada documento recebe um check de conferência, dado pelo Vendedor e/ou pelo Gerente de Contas (checklist na aba BD_Checklists).",
  "responsavel": "Vendedor",
  "tipo": "Manual",
  "prazo": "Dia 0",
  "prioridade": "P1",
  "gate": "3 documentos anexados, cada um com check de conferência (Vendedor e/ou Gerente de Contas).",
  "vinculado": "Nenhum",
  "pop": {
   "obj": "Anexar e conferir os três documentos de fechamento.",
   "ent": [
    "Comprovante de Pagamento",
    "Contrato Assinado",
    "Relatório de Fechamento"
   ],
   "passos": [
    "Anexar os três documentos ao cadastro do cliente.",
    "Marcar o check de conferência de cada documento (Vendedor e/ou GC) no Controle por cliente.",
    "Liberar a Etapa 2 somente com os 3 itens conferidos."
   ],
   "sai": "3 documentos anexados e conferidos (CHK-E01-T04-01 a 03).",
   "ferr": [
    "Sistema interno",
    "Painel — Controle por cliente"
   ],
   "cuid": [
    "Regra de conclusão: basta um dos dois checks por documento (Vendedor ou GC)."
   ]
  },
  "checklist": [
   {
    "id": "CHK-E01-T04-01",
    "item": "Comprovante de Pagamento",
    "obrig": "Obrigatório",
    "uso": "Formalização do contrato; libera a Etapa 2",
    "periodo": "—",
    "resp": "Vendedor",
    "l1": "Conferido — Vendedor",
    "l2": "Conferido — Gerente de Contas"
   },
   {
    "id": "CHK-E01-T04-02",
    "item": "Contrato Assinado",
    "obrig": "Obrigatório",
    "uso": "Formalização do contrato; libera a Etapa 2",
    "periodo": "—",
    "resp": "Vendedor",
    "l1": "Conferido — Vendedor",
    "l2": "Conferido — Gerente de Contas"
   },
   {
    "id": "CHK-E01-T04-03",
    "item": "Relatório de Fechamento",
    "obrig": "Obrigatório",
    "uso": "Formalização do contrato; libera a Etapa 2",
    "periodo": "—",
    "resp": "Vendedor",
    "l1": "Conferido — Vendedor",
    "l2": "Conferido — Gerente de Contas"
   }
  ]
 },
 {
  "id": "E01-T05",
  "etapaNum": 1,
  "nTarefa": 5,
  "tarefa": "Criação do grupo, boas-vindas e envio do acesso ao Formulário",
  "descricao": "Concluído o cadastro com os documentos, o Vendedor cria o grupo de WhatsApp do cliente no padrão \"Gestão <> bmo & [Cliente]\" (ou reaproveita o grupo já criado na negociação) e adiciona os integrantes do squad designado. Envia a mensagem padrão de boas-vindas apresentando o squad e o papel de cada um e, em seguida, o acesso à Área do Cliente BMO (link, usuário e senha) com as instruções do Formulário de diagnóstico: preencher com calma, de preferência no computador, com o máximo de detalhes, e clicar em Enviar.",
  "responsavel": "Vendedor",
  "tipo": "Manual",
  "prazo": "Dia 0",
  "prioridade": "P1",
  "gate": "Grupo criado com o squad completo + boas-vindas com apresentação do time + acesso à Área do Cliente e instruções do Formulário enviados.",
  "vinculado": "Nenhum",
  "pop": {
   "obj": "Criar o grupo, apresentar o squad e enviar o acesso ao Formulário.",
   "ent": [
    "Cadastro concluído",
    "Credenciais da Área do Cliente",
    "Integrantes do squad"
   ],
   "passos": [
    "Criar o grupo de WhatsApp \"Gestão <> bmo & [Cliente]\" ou reaproveitar o da negociação.",
    "Adicionar os integrantes do squad.",
    "Enviar a mensagem padrão de boas-vindas apresentando o squad e o papel de cada um (termo oficial: Analista de Negócios).",
    "Enviar link app.bmogestao.com.br/Pricer-bmo, login e senha.",
    "Orientar o Formulário: preencher com calma, no computador, com o máximo de detalhes, e clicar em Enviar."
   ],
   "sai": "Grupo com squad completo + boas-vindas + acesso e instruções enviados.",
   "ferr": [
    "WhatsApp Business",
    "Pricer / Área do Cliente"
   ],
   "cuid": [
    "Conferir o acesso em \"Acessar Pricer\" antes do envio para não mandar credencial errada."
   ],
   "pend": [
    "Texto padrão da mensagem de boas-vindas do Vendedor não localizado no Projeto."
   ]
  }
 },
 {
  "id": "E01-T06",
  "etapaNum": 1,
  "nTarefa": 6,
  "tarefa": "Boas-vindas do Gerente de Contas e reforço do Formulário",
  "descricao": "No mesmo dia, o Gerente de Contas envia no grupo sua mensagem de boas-vindas, se apresenta como responsável pelo acompanhamento junto ao time de execução e reforça que, com o Formulário enviado, o squad agenda a reunião de onboarding (conforme a data de preferência informada) e solicita os primeiros documentos.",
  "responsavel": "Gerente de Contas",
  "tipo": "Manual",
  "prazo": "Dia 0",
  "prioridade": "P1",
  "gate": "Boas-vindas do Gerente de Contas enviadas no grupo no mesmo dia das boas-vindas do Vendedor.",
  "vinculado": "Nenhum",
  "pop": {
   "obj": "Apresentar o Gerente de Contas e reforçar o Formulário.",
   "ent": [
    "Boas-vindas do Vendedor enviadas"
   ],
   "passos": [
    "No mesmo dia, enviar a mensagem de boas-vindas do GC no grupo.",
    "Apresentar-se como responsável pelo acompanhamento junto ao time de execução.",
    "Reforçar que, com o Formulário enviado, o squad agenda o onboarding na data de preferência e solicita os primeiros documentos."
   ],
   "sai": "Boas-vindas do GC no grupo, no mesmo dia das do Vendedor.",
   "ferr": [
    "WhatsApp Business"
   ],
   "pend": [
    "Texto padrão da mensagem do GC não localizado no Projeto."
   ]
  }
 },
 {
  "id": "E01-T07",
  "etapaNum": 1,
  "nTarefa": 7,
  "tarefa": "Acompanhamento até o envio do Formulário de diagnóstico",
  "descricao": "O Vendedor pede ao cliente que confirme no grupo quando enviar o Formulário e acompanha até o envio, incluindo a data de preferência para a reunião de onboarding. O Gerente de Contas confirma o recebimento pelo aviso do sistema. Com o envio confirmado, o Vendedor sinaliza no grupo a passagem para o squad, que agenda o onboarding — fim do Kick-off e início da Etapa 2.",
  "responsavel": "Vendedor + Gerente de Contas",
  "tipo": "Manual",
  "prazo": "Até o envio do Formulário",
  "prioridade": "P1",
  "gate": "Formulário enviado + recebimento confirmado pelo GC (aviso do sistema) + passagem para o squad sinalizada no grupo.",
  "vinculado": "Nenhum",
  "pop": {
   "obj": "Acompanhar até o envio do Formulário e passar o cliente ao squad.",
   "ent": [
    "Formulário liberado",
    "Grupo ativo"
   ],
   "passos": [
    "Pedir ao cliente que confirme no grupo quando enviar o Formulário.",
    "Acompanhar até o envio, incluindo a data de preferência para o onboarding.",
    "GC confirma o recebimento pelo aviso do sistema.",
    "Vendedor sinaliza no grupo a passagem para o squad — fim do Kick-off."
   ],
   "sai": "Formulário enviado, recebimento confirmado e passagem sinalizada.",
   "ferr": [
    "Sistema interno (aviso de Formulário)",
    "WhatsApp"
   ],
   "cuid": [
    "Não iniciar a Etapa 2 sem a confirmação do GC pelo sistema."
   ],
   "pend": [
    "Prazo máximo de cobrança do Formulário não definido nas fontes."
   ]
  }
 },
 {
  "id": "E02-T01",
  "etapaNum": 2,
  "nTarefa": 1,
  "tarefa": "Leitura do formulário e identificação da data de preferência para a reunião",
  "descricao": "O Gerente de Contas analisa as respostas do Formulário de diagnóstico, extrai os pontos críticos e identifica a data e o horário de preferência informados pelo cliente para a reunião de onboarding.",
  "responsavel": "Gerente de Contas",
  "tipo": "Manual",
  "prazo": "Dia 1",
  "prioridade": "P1",
  "gate": "Análise concluída + data de preferência identificada.",
  "vinculado": "Fase0-Prompt-Abertura-Briefing-Estrategico.md",
  "pop": {
   "obj": "Extrair do Formulário os pontos críticos e a data preferida da reunião.",
   "ent": [
    "Formulário de diagnóstico enviado"
   ],
   "passos": [
    "Ler as respostas do Formulário na Área do Cliente.",
    "Listar os pontos críticos (dores, metas, sistemas usados, estrutura).",
    "Identificar data e horário de preferência para o onboarding.",
    "Abrir o Projeto Claude do cliente (\"BMO × [Clínica]\") e registrar os achados."
   ],
   "sai": "Análise concluída + data de preferência identificada.",
   "ferr": [
    "Área do Cliente",
    "Claude (Projeto do cliente)"
   ]
  }
 },
 {
  "id": "E02-T02",
  "etapaNum": 2,
  "nTarefa": 2,
  "tarefa": "Agendamento da reunião de onboarding",
  "descricao": "O GC agenda a reunião com o cliente na janela identificada e confirma a presença dos participantes necessários (decisor + squad).",
  "responsavel": "Gerente de Contas",
  "tipo": "Manual",
  "prazo": "Dia 1",
  "prioridade": "P1",
  "gate": "Reunião agendada e confirmada.",
  "vinculado": "Fase0-Prompt-Abertura-Briefing-Estrategico.md",
  "pop": {
   "obj": "Agendar a reunião de onboarding com decisor e squad.",
   "ent": [
    "Data de preferência",
    "Agenda do squad"
   ],
   "passos": [
    "Consultar conflitos na agenda.",
    "Criar o evento \"[Cliente] & BMO <> Onboarding\" com Google Meet, duração padrão de 1 hora.",
    "Convidar o decisor e o squad.",
    "Confirmar a presença no grupo do cliente."
   ],
   "sai": "Reunião agendada e confirmada.",
   "ferr": [
    "Google Calendar",
    "WhatsApp"
   ],
   "cuid": [
    "Data sem horário confirmado não é agendada — aguardar a confirmação."
   ]
  }
 },
 {
  "id": "E02-T03",
  "etapaNum": 2,
  "nTarefa": 3,
  "tarefa": "Envio da lista de coleta de dados (Checklist de Coleta)",
  "descricao": "Logo após a reunião de onboarding, envia no grupo a lista de dados e documentos alinhada na reunião, a partir do Checklist de Coleta (aba BD_Checklists), com o período e o formato de cada item. O cliente pode enviar pelo grupo ou por e-mail, conforme sua preferência. Itens marcados \"se pertinente\" entram conforme o perfil do cliente.",
  "responsavel": "Analista de Negócios",
  "tipo": "Manual",
  "prazo": "Após a reunião de onboarding (mesmo dia)",
  "prioridade": "P1",
  "gate": "Lista de coleta enviada no grupo, com período e formato de cada item e os canais aceitos (grupo ou e-mail).",
  "vinculado": "Fase0-Prompt-Abertura-Briefing-Estrategico.md",
  "pop": {
   "obj": "Enviar a lista de coleta logo após a reunião.",
   "ent": [
    "Checklist de Coleta (BD_Checklists)",
    "Itens alinhados na reunião"
   ],
   "passos": [
    "Selecionar os itens do Checklist de Coleta pertinentes ao perfil do cliente.",
    "Informar período e formato de cada item.",
    "Enviar no grupo, indicando que o cliente pode responder pelo grupo ou por e-mail.",
    "Marcar os itens no Controle por cliente conforme forem chegando (E03-T04)."
   ],
   "sai": "Lista enviada com período, formato e canais aceitos.",
   "ferr": [
    "WhatsApp",
    "Painel — Controle por cliente"
   ],
   "cuid": [
    "Itens \"se pertinente\" entram conforme o perfil do cliente."
   ]
  }
 },
 {
  "id": "E02-T04",
  "etapaNum": 2,
  "nTarefa": 4,
  "tarefa": "Construção da apresentação de diagnóstico",
  "descricao": "O GC estrutura a apresentação de onboarding com o diagnóstico inicial, gargalos identificados e proposta de plano. Revisão interna antes da reunião.",
  "responsavel": "Gerente de Contas",
  "tipo": "Manual",
  "prazo": "Antes da reunião",
  "prioridade": "P1",
  "gate": "Apresentação revisada e aprovada internamente.",
  "vinculado": "Fase0-Prompt-Abertura-Briefing-Estrategico.md",
  "pop": {
   "obj": "Montar a apresentação de diagnóstico inicial.",
   "ent": [
    "Formulário",
    "Briefing Estratégico (Fase 0)",
    "Arquivos-base do cliente"
   ],
   "passos": [
    "Rodar o Prompt de Abertura (Fase 0, Parte B) no Projeto do cliente.",
    "Revisar as 12 seções do briefing e auditar a Seção 11 (Mapa Claim → Fonte).",
    "Gerar a apresentação de Onboarding pela skill bmo-onboarding-pptx.",
    "Revisar internamente antes da reunião."
   ],
   "sai": "Apresentação revisada e aprovada internamente.",
   "ferr": [
    "Claude",
    "PowerPoint"
   ],
   "cuid": [
    "Inconsistência estrutural no PCF durante a calibração → pausar e ir à Fase 1, Prompt A."
   ]
  }
 },
 {
  "id": "E02-T05",
  "etapaNum": 2,
  "nTarefa": 5,
  "tarefa": "Reunião de onboarding realizada",
  "descricao": "GC e Analista de Negócios conduzem a reunião: apresentam o diagnóstico, alinham metas e expectativas, definem o plano inicial de ação com o cliente e alinham a lista de dados a coletar (Checklist de Coleta).",
  "responsavel": "Gerente de Contas + Analista de Negócios",
  "tipo": "Manual",
  "prazo": "Conforme agenda",
  "prioridade": "P1",
  "gate": "Reunião realizada + apresentação salva.",
  "vinculado": "Fase0-Prompt-Abertura-Briefing-Estrategico.md",
  "pop": {
   "obj": "Conduzir a reunião de onboarding.",
   "ent": [
    "Apresentação aprovada",
    "Checklist de Coleta"
   ],
   "passos": [
    "Apresentar o diagnóstico e os gargalos identificados.",
    "Alinhar metas e expectativas.",
    "Definir o plano inicial de ação com o cliente.",
    "Alinhar a lista de dados a coletar.",
    "Garantir gravação (Gemini ou tl;dv) para extração dos itens de ação."
   ],
   "sai": "Reunião realizada + apresentação salva.",
   "ferr": [
    "Google Meet",
    "Gemini / tl;dv"
   ],
   "cuid": [
    "Itens de ação da ata vão para o BMO Tarefas (SOP de Tarefas, seção 4)."
   ]
  }
 },
 {
  "id": "E02-T06",
  "etapaNum": 2,
  "nTarefa": 6,
  "tarefa": "Apresentação salva na área do cliente",
  "descricao": "O GC arquiva a apresentação final na área do cliente no sistema, garantindo rastreabilidade e acesso permanente ao material apresentado.",
  "responsavel": "Gerente de Contas",
  "tipo": "Manual",
  "prazo": "Dia da reunião",
  "prioridade": "P2",
  "gate": "Arquivo disponível na área do cliente.",
  "vinculado": "Fase0-Prompt-Abertura-Briefing-Estrategico.md",
  "pop": {
   "obj": "Arquivar a apresentação na área do cliente.",
   "ent": [
    "Apresentação final"
   ],
   "passos": [
    "Salvar a versão final na área do cliente no sistema.",
    "Colar a Seção 12 do briefing nas Instruções do Projeto Claude do cliente."
   ],
   "sai": "Arquivo disponível na área do cliente.",
   "ferr": [
    "Sistema interno",
    "Claude (Projeto do cliente)"
   ]
  }
 },
 {
  "id": "E03-T01",
  "etapaNum": 3,
  "nTarefa": 1,
  "tarefa": "Recebimento e organização dos extratos bancários (OFX)",
  "descricao": "O Analista Financeiro recebe os extratos bancários em OFX dos últimos 6 meses (pelo grupo ou por e-mail), valida a integridade e organiza no sistema interno e na pasta do cliente, por conta e período.",
  "responsavel": "Analista Financeiro",
  "tipo": "Manual",
  "prazo": "Assim que recebido",
  "prioridade": "P1",
  "gate": "Extratos OFX dos últimos 6 meses organizados e validados no sistema e na pasta do cliente.",
  "vinculado": "Nenhum",
  "pop": {
   "obj": "Receber, validar e organizar os extratos OFX.",
   "ent": [
    "OFX de todas as contas PJ, últimos 6 meses"
   ],
   "passos": [
    "Receber os OFX pelo grupo ou por e-mail.",
    "Validar integridade: período completo, todas as contas, arquivos abrindo.",
    "Organizar por conta e período no sistema interno e na pasta do cliente.",
    "Marcar \"Recebido\" e \"Validado\" no item 1 do Checklist de Coleta."
   ],
   "sai": "OFX de 6 meses organizados e validados.",
   "ferr": [
    "Sistema interno",
    "Pasta do cliente"
   ],
   "cuid": [
    "Lacuna de IA nesta tarefa: organização do OFX ainda manual."
   ]
  }
 },
 {
  "id": "E03-T02",
  "etapaNum": 3,
  "nTarefa": 2,
  "tarefa": "Registro de acessos, taxas de cartão e alíquotas tributárias",
  "descricao": "O Analista de Negócios registra o acesso da BMO ao sistema de gestão do cliente (usuário com perfil que permita ver as informações financeiras e administrativas) e quais módulos o cliente de fato alimenta (agenda, prontuário, financeiro, estoque), as taxas de cartão por bandeira/modalidade e a alíquota de imposto aplicável, confirmada com o contador do cliente.",
  "responsavel": "Analista de Negócios",
  "tipo": "Manual",
  "prazo": "Assim que recebido",
  "prioridade": "P1",
  "gate": "Acesso ao sistema de gestão testado + taxas por bandeira/modalidade e alíquotas (confirmadas com o contador) registradas.",
  "vinculado": "Nenhum",
  "pop": {
   "obj": "Registrar acesso ao sistema de gestão, taxas de cartão e alíquotas.",
   "ent": [
    "Usuário BMO no sistema de gestão",
    "Taxas por bandeira e modalidade",
    "Contato do contador"
   ],
   "passos": [
    "Testar o acesso com perfil que veja informações financeiras e administrativas.",
    "Registrar os módulos que o cliente alimenta (agenda, prontuário, financeiro, estoque).",
    "Registrar taxas por bandeira e modalidade (débito, crédito, parcelado).",
    "Confirmar regime e alíquota por tipo de receita com o contador."
   ],
   "sai": "Acesso testado + taxas e alíquotas registradas.",
   "ferr": [
    "Sistema de gestão do cliente"
   ],
   "cuid": [
    "Liberar o perfil pode levar ~2 semanas e gerar custo de licença — alinhar com o cliente antes de pedir."
   ]
  }
 },
 {
  "id": "E03-T03",
  "etapaNum": 3,
  "nTarefa": 3,
  "tarefa": "Recebimento das informações complementares e regras do negócio",
  "descricao": "O Analista de Negócios recebe e organiza na pasta do cliente as informações complementares do Checklist de Coleta: planilhas financeiras (identificação de pagamentos, comprovantes, contas a pagar), DRE ou relatórios gerenciais já existentes, regras do negócio (remuneração, bonificação e comissionamento da equipe, repasses médicos, procedimentos com custo de terceiros) e, se pertinente, material de identidade visual e plano de negócios. Indica a etapa do SOP que vai usar cada item.",
  "responsavel": "Analista de Negócios",
  "tipo": "Manual",
  "prazo": "Assim que recebido",
  "prioridade": "P2",
  "gate": "Itens recebidos organizados na pasta do cliente, com a etapa de destino identificada.",
  "vinculado": "Nenhum",
  "pop": {
   "obj": "Organizar as informações complementares e as regras do negócio.",
   "ent": [
    "Planilhas financeiras",
    "DRE existente",
    "Regras de remuneração, comissão e repasse",
    "Procedimentos com custo de terceiros",
    "Identidade visual e plano de negócios (se pertinente)"
   ],
   "passos": [
    "Salvar cada item na pasta do cliente.",
    "Indicar a etapa do SOP que usa cada item (E04, E06, E07, E08, E10, E12).",
    "Atualizar o Checklist de Coleta."
   ],
   "sai": "Itens organizados com a etapa de destino identificada.",
   "ferr": [
    "Pasta do cliente",
    "Painel — Controle por cliente"
   ]
  }
 },
 {
  "id": "E03-T04",
  "etapaNum": 3,
  "nTarefa": 4,
  "tarefa": "Acompanhamento das pendências da coleta",
  "descricao": "O Analista de Negócios atualiza o Checklist de Coleta e cobra no grupo do cliente, toda semana, os itens ainda pendentes, até que todos os obrigatórios sejam recebidos e validados. No caso observado, a cobrança foi feita no report semanal da implementação (ver PV-10).",
  "responsavel": "Analista de Negócios",
  "tipo": "Recorrente",
  "prazo": "Semanal, até concluir a coleta",
  "prioridade": "P1",
  "gate": "Checklist de Coleta com todos os itens obrigatórios recebidos e validados.",
  "vinculado": "Nenhum",
  "pop": {
   "obj": "Cobrar semanalmente as pendências da coleta.",
   "ent": [
    "Checklist de Coleta do cliente"
   ],
   "passos": [
    "Toda semana, revisar o Checklist de Coleta no Controle por cliente.",
    "Listar os itens obrigatórios pendentes.",
    "Cobrar no grupo do cliente.",
    "Repetir até todos os obrigatórios estarem recebidos e validados."
   ],
   "sai": "Todos os itens obrigatórios recebidos e validados.",
   "ferr": [
    "Painel — Controle por cliente",
    "WhatsApp"
   ],
   "cuid": [
    "Regra: item concluído só com os dois checks (Recebido e Validado)."
   ],
   "pend": [
    "Canal da cobrança no report semanal de implementação a decidir (PV-10)."
   ]
  },
  "checklist": [
   {
    "id": "CHK-E03-T04-01",
    "item": "Extratos bancários de todas as contas PJ",
    "obrig": "Obrigatório",
    "uso": "Organização do OFX (E03-T01) e conciliação retroativa (E04-T03)",
    "periodo": "OFX · últimos 6 meses",
    "resp": "Analista Financeiro",
    "l1": "Recebido",
    "l2": "Validado"
   },
   {
    "id": "CHK-E03-T04-02",
    "item": "Planilhas financeiras (identificação de pagamentos, comprovantes, contas a pagar e a receber)",
    "obrig": "Se houver",
    "uso": "Conciliação e classificação (E04)",
    "periodo": "Excel ou export do sistema",
    "resp": "Analista Financeiro",
    "l1": "Recebido",
    "l2": "Validado"
   },
   {
    "id": "CHK-E03-T04-03",
    "item": "Acesso ao sistema de gestão do cliente (usuário BMO)",
    "obrig": "Obrigatório",
    "uso": "Registro de acessos (E03-T02) e base de vendas (E05)",
    "periodo": "Perfil com acesso financeiro e administrativo",
    "resp": "Analista de Negócios",
    "l1": "Recebido",
    "l2": "Validado"
   },
   {
    "id": "CHK-E03-T04-04",
    "item": "Contato do contador",
    "obrig": "Obrigatório",
    "uso": "Confirmar regime e alíquotas (E03-T02)",
    "periodo": "Nome e telefone",
    "resp": "Analista de Negócios",
    "l1": "Recebido",
    "l2": "Validado"
   },
   {
    "id": "CHK-E03-T04-05",
    "item": "Alíquota tributária e regime de tributação",
    "obrig": "Obrigatório",
    "uso": "Registro de alíquotas (E03-T02), DRE (E07) e Pricer (E08)",
    "periodo": "Alíquota por tipo de receita",
    "resp": "Analista de Negócios",
    "l1": "Recebido",
    "l2": "Validado"
   },
   {
    "id": "CHK-E03-T04-06",
    "item": "Taxas da máquina de cartão",
    "obrig": "Obrigatório",
    "uso": "Registro de taxas (E03-T02) e Pricer (E08)",
    "periodo": "Por bandeira e modalidade (débito, crédito, parcelado)",
    "resp": "Analista de Negócios",
    "l1": "Recebido",
    "l2": "Validado"
   },
   {
    "id": "CHK-E03-T04-07",
    "item": "Notas fiscais das últimas compras de medicamentos e materiais",
    "obrig": "Se houver",
    "uso": "BD_Cunt (E06)",
    "periodo": "Últimas compras",
    "resp": "Analista de Negócios",
    "l1": "Recebido",
    "l2": "Validado"
   },
   {
    "id": "CHK-E03-T04-08",
    "item": "Tabela de preços e custos dos procedimentos e serviços",
    "obrig": "Obrigatório",
    "uso": "BD_Cunt (E06) e Pricer (E08)",
    "periodo": "Tabela atualizada",
    "resp": "Analista de Negócios",
    "l1": "Recebido",
    "l2": "Validado"
   },
   {
    "id": "CHK-E03-T04-09",
    "item": "DRE ou relatórios gerenciais já existentes",
    "obrig": "Se houver",
    "uso": "Ponto de partida da DRE (E07)",
    "periodo": "Últimos meses disponíveis",
    "resp": "Analista de Negócios",
    "l1": "Recebido",
    "l2": "Validado"
   },
   {
    "id": "CHK-E03-T04-10",
    "item": "Regras do negócio: remuneração, bonificação e comissionamento da equipe",
    "obrig": "Se houver",
    "uso": "Comissionamento (E12-T02)",
    "periodo": "Documento ou descrição",
    "resp": "Analista de Negócios",
    "l1": "Recebido",
    "l2": "Validado"
   },
   {
    "id": "CHK-E03-T04-11",
    "item": "Regras do negócio: repasses médicos e de outros profissionais",
    "obrig": "Se houver",
    "uso": "Repasse médico (E12-T03)",
    "periodo": "Regra por profissional/serviço",
    "resp": "Analista de Negócios",
    "l1": "Recebido",
    "l2": "Validado"
   },
   {
    "id": "CHK-E03-T04-12",
    "item": "Regras do negócio: procedimentos com custo de terceiros (ex.: exames repassados a laboratório)",
    "obrig": "Se houver",
    "uso": "BD_Cunt (E06) e Pricer (E08)",
    "periodo": "Custo e preço cobrado por procedimento",
    "resp": "Analista de Negócios",
    "l1": "Recebido",
    "l2": "Validado"
   },
   {
    "id": "CHK-E03-T04-13",
    "item": "Contato de quem lança as vendas/atendimentos no sistema",
    "obrig": "Obrigatório",
    "uso": "Verificação dos lançamentos (E05-T01) e treinamento (E05-T02)",
    "periodo": "Nome e telefone",
    "resp": "Analista de Negócios",
    "l1": "Recebido",
    "l2": "Validado"
   },
   {
    "id": "CHK-E03-T04-14",
    "item": "Material de identidade visual (logo, cores, fontes)",
    "obrig": "Se pertinente",
    "uso": "Apresentações (E02, E07, E10) e BI (E09)",
    "periodo": "Arquivos de marca",
    "resp": "Analista de Negócios",
    "l1": "Recebido",
    "l2": "Validado"
   },
   {
    "id": "CHK-E03-T04-15",
    "item": "Plano de negócios ou planejamento existente",
    "obrig": "Se pertinente",
    "uso": "Planejamento Estratégico (E10)",
    "periodo": "Documento vigente",
    "resp": "Gerente de Contas",
    "l1": "Recebido",
    "l2": "Validado"
   },
   {
    "id": "CHK-E03-T04-16",
    "item": "Uso atual do sistema de gestão: módulos que o cliente alimenta (agenda, prontuário, financeiro, estoque)",
    "obrig": "Obrigatório",
    "uso": "Define a fonte das bases: sistema ou planilhas (E03-T02, E04, E05-T01)",
    "periodo": "Resposta direta",
    "resp": "Analista de Negócios",
    "l1": "Recebido",
    "l2": "Validado"
   }
  ]
 },
 {
  "id": "E04-T01",
  "etapaNum": 4,
  "nTarefa": 1,
  "tarefa": "Reunião financeira com o cliente",
  "descricao": "O AF conduz a reunião de parametrização: alinha o plano de contas no Conta Azul, a integração bancária e a estrutura de custos da clínica.",
  "responsavel": "Analista Financeiro",
  "tipo": "Manual",
  "prazo": "Após onboarding",
  "prioridade": "P1",
  "gate": "Reunião realizada + parametrização iniciada.",
  "vinculado": "Nenhum (coberto indiretamente pelo briefing)",
  "pop": {
   "obj": "Conduzir a reunião de parametrização financeira.",
   "ent": [
    "OFX organizado",
    "Estrutura de custos"
   ],
   "passos": [
    "Agendar \"[Cliente] & BMO <> Reunião Financeira\".",
    "Alinhar o plano de contas no ContaAzul.",
    "Alinhar a integração bancária e a estrutura de custos.",
    "Registrar decisões e itens de ação."
   ],
   "sai": "Reunião realizada + parametrização iniciada.",
   "ferr": [
    "Google Meet",
    "ContaAzul"
   ]
  }
 },
 {
  "id": "E04-T02",
  "etapaNum": 4,
  "nTarefa": 2,
  "tarefa": "Parametrização do Conta Azul + integração bancária",
  "descricao": "O AF configura o plano de contas, as categorias e ativa a integração bancária automática no Conta Azul. Testa o fluxo de importação.",
  "responsavel": "Analista Financeiro",
  "tipo": "Manual",
  "prazo": "Após reunião",
  "prioridade": "P1",
  "gate": "Conta Azul parametrizado e integração ativa.",
  "vinculado": "Nenhum (coberto indiretamente pelo briefing)",
  "pop": {
   "obj": "Parametrizar o ContaAzul e ativar a integração bancária.",
   "ent": [
    "Plano de contas alinhado"
   ],
   "passos": [
    "Configurar plano de contas e categorias.",
    "Ativar a integração bancária automática.",
    "Testar o fluxo de importação com um extrato recente."
   ],
   "sai": "ContaAzul parametrizado e integração ativa.",
   "ferr": [
    "ContaAzul"
   ]
  }
 },
 {
  "id": "E04-T03",
  "etapaNum": 4,
  "nTarefa": 3,
  "tarefa": "Conciliação bancária retroativa (mínimo 3 meses)",
  "descricao": "O AF concilia os últimos 3 meses de movimentações bancárias, categorizando cada lançamento. Base indispensável para a DRE retroativa.",
  "responsavel": "Analista Financeiro",
  "tipo": "Manual",
  "prazo": "Contínuo",
  "prioridade": "P1",
  "gate": "Conciliação de 3 meses concluída sem inconsistências.",
  "vinculado": "Nenhum (coberto indiretamente pelo briefing)",
  "pop": {
   "obj": "Conciliar no mínimo 3 meses retroativos.",
   "ent": [
    "Extratos OFX",
    "ContaAzul parametrizado"
   ],
   "passos": [
    "Importar os 3 meses mais recentes.",
    "Categorizar cada lançamento.",
    "Separar os não identificados para a planilha da E04-T04.",
    "Fechar cada mês sem inconsistências."
   ],
   "sai": "Conciliação de 3 meses sem inconsistências.",
   "ferr": [
    "ContaAzul"
   ],
   "cuid": [
    "Base indispensável para a DRE retroativa (Etapa 7)."
   ]
  }
 },
 {
  "id": "E04-T04",
  "etapaNum": 4,
  "nTarefa": 4,
  "tarefa": "Envio de planilha de movimentações não identificadas",
  "descricao": "Durante a conciliação, o AF consolida as movimentações sem identificação em planilha padrão e envia ao cliente para classificação.",
  "responsavel": "Analista Financeiro",
  "tipo": "Recorrente",
  "prazo": "Durante conciliação",
  "prioridade": "P2",
  "gate": "Planilha enviada e resposta registrada.",
  "vinculado": "Nenhum (coberto indiretamente pelo briefing)",
  "pop": {
   "obj": "Enviar a planilha de movimentações não identificadas.",
   "ent": [
    "Lançamentos sem identificação"
   ],
   "passos": [
    "Consolidar data, valor e histórico bancário de cada movimentação.",
    "Enviar ao cliente para classificação.",
    "Registrar a resposta e reclassificar no ContaAzul."
   ],
   "sai": "Planilha enviada e resposta registrada.",
   "ferr": [
    "ContaAzul",
    "Excel"
   ],
   "pend": [
    "Modelo padrão da planilha não localizado no Projeto."
   ]
  }
 },
 {
  "id": "E04-T05",
  "etapaNum": 4,
  "nTarefa": 5,
  "tarefa": "Cobrança recorrente ao cliente para identificar movimentações",
  "descricao": "O AF acompanha semanalmente o retorno do cliente sobre as movimentações pendentes, mantendo follow-up ativo até a classificação completa.",
  "responsavel": "Analista Financeiro",
  "tipo": "Recorrente",
  "prazo": "Semanal",
  "prioridade": "P2",
  "gate": "Movimentações identificadas ou follow-up ativo.",
  "vinculado": "Nenhum (coberto indiretamente pelo briefing)",
  "pop": {
   "obj": "Fazer follow-up semanal das movimentações pendentes.",
   "ent": [
    "Planilha enviada"
   ],
   "passos": [
    "Toda semana, conferir o que o cliente já respondeu.",
    "Cobrar o restante no grupo.",
    "Encerrar quando todas estiverem classificadas."
   ],
   "sai": "Movimentações identificadas ou follow-up ativo.",
   "ferr": [
    "WhatsApp",
    "ContaAzul"
   ]
  }
 },
 {
  "id": "E05-T01",
  "etapaNum": 5,
  "nTarefa": 1,
  "tarefa": "Verificação do uso e preenchimento correto do sistema",
  "descricao": "O AN audita o sistema de vendas/agendamento do cliente: verifica se procedimentos, valores e status estão sendo lançados corretamente.",
  "responsavel": "Analista de Negócios",
  "tipo": "Manual",
  "prazo": "Após onboarding",
  "prioridade": "P1",
  "gate": "Sistema validado e em uso correto.",
  "vinculado": "Fase4-Comercial-Calendario-Vendas.md (Prompt 3)",
  "pop": {
   "obj": "Auditar o uso do sistema de vendas/agendamento.",
   "ent": [
    "Acesso ao sistema",
    "Contato de quem lança"
   ],
   "passos": [
    "Conferir se procedimentos, valores e status estão sendo lançados.",
    "Comparar uma amostra com o faturamento do período.",
    "Registrar falhas de preenchimento."
   ],
   "sai": "Sistema validado e em uso correto.",
   "ferr": [
    "Sistema de gestão do cliente"
   ],
   "cuid": [
    "Se o cliente usa o sistema só para prontuário, a base de vendas sai de planilhas (item 16 do Checklist)."
   ]
  }
 },
 {
  "id": "E05-T02",
  "etapaNum": 5,
  "nTarefa": 2,
  "tarefa": "Treinamento da secretária (se necessário)",
  "descricao": "Caso a auditoria identifique lançamentos incorretos, o AN treina a equipe da clínica no preenchimento padrão do sistema.",
  "responsavel": "Analista de Negócios",
  "tipo": "Manual",
  "prazo": "Após verificação",
  "prioridade": "P2",
  "gate": "Treinamento realizado e registrado.",
  "vinculado": "Fase4-Comercial-Calendario-Vendas.md (Prompt 3)",
  "pop": {
   "obj": "Treinar a equipe no preenchimento padrão.",
   "ent": [
    "Falhas registradas na auditoria"
   ],
   "passos": [
    "Agendar o treinamento com quem lança as vendas.",
    "Demonstrar o preenchimento correto.",
    "Gravar o treinamento.",
    "Validar os lançamentos da semana seguinte."
   ],
   "sai": "Treinamento realizado e registrado.",
   "ferr": [
    "Google Meet"
   ],
   "cuid": [
    "Padrão validado: treinamento gravado + checklist semanal de validação."
   ]
  }
 },
 {
  "id": "E05-T03",
  "etapaNum": 5,
  "nTarefa": 3,
  "tarefa": "Criação do acesso secundário para a BMO",
  "descricao": "O AN solicita/cria um acesso próprio da BMO no sistema do cliente, permitindo extração de dados sem depender da equipe da clínica.",
  "responsavel": "Analista de Negócios",
  "tipo": "Manual",
  "prazo": "Após verificação",
  "prioridade": "P1",
  "gate": "Acesso BMO criado e testado.",
  "vinculado": "Fase4-Comercial-Calendario-Vendas.md (Prompt 3)",
  "pop": {
   "obj": "Criar o acesso secundário da BMO.",
   "ent": [
    "Aprovação do cliente"
   ],
   "passos": [
    "Solicitar o usuário BMO no sistema do cliente.",
    "Testar a extração dos dados de vendas.",
    "Registrar o acesso no cadastro."
   ],
   "sai": "Acesso BMO criado e testado.",
   "ferr": [
    "Sistema de gestão do cliente"
   ],
   "cuid": [
    "Mesmo cuidado da E03-T02: possível custo de licença."
   ]
  }
 },
 {
  "id": "E05-T04",
  "etapaNum": 5,
  "nTarefa": 4,
  "tarefa": "Atualização da base de vendas",
  "descricao": "O AN extrai e atualiza diariamente a base de vendas no sistema interno, garantindo dados frescos para reports, BI e análises.",
  "responsavel": "Analista de Negócios",
  "tipo": "Recorrente",
  "prazo": "Diário",
  "prioridade": "P1",
  "gate": "Base de vendas atualizada e sem inconsistências.",
  "vinculado": "Fase4-Comercial-Calendario-Vendas.md (Prompt 3)",
  "pop": {
   "obj": "Atualizar diariamente o BD_Vendas.",
   "ent": [
    "Acesso BMO"
   ],
   "passos": [
    "Extrair as vendas do dia anterior.",
    "Atualizar o BD_Vendas no sistema interno.",
    "Conferir inconsistências (valores zerados, procedimentos sem cadastro)."
   ],
   "sai": "BD_Vendas atualizado e sem inconsistências.",
   "ferr": [
    "Sistema de gestão do cliente",
    "Sistema interno"
   ],
   "cuid": [
    "⚠️ DIVERGÊNCIA de responsável: aqui é o Analista de Negócios; na E11-T01 o BD_Vendas é atualizado pelo Analista Financeiro."
   ]
  }
 },
 {
  "id": "E06-T01",
  "etapaNum": 6,
  "nTarefa": 1,
  "tarefa": "Solicitação de orçamentos e NFs de compras dos últimos meses",
  "descricao": "O AN solicita ao cliente as notas fiscais de compras e orçamentos recentes de insumos — matéria-prima do custo unitário por procedimento.",
  "responsavel": "Analista de Negócios",
  "tipo": "Manual",
  "prazo": "Após onboarding",
  "prioridade": "P1",
  "gate": "Documentos recebidos e arquivados.",
  "vinculado": "Nenhum",
  "pop": {
   "obj": "Solicitar NFs e orçamentos de insumos.",
   "ent": [
    "Lista de procedimentos"
   ],
   "passos": [
    "Conferir se o item 7 do Checklist de Coleta já foi recebido.",
    "Solicitar só o que faltar.",
    "Arquivar NFs e orçamentos na pasta do cliente."
   ],
   "sai": "Documentos recebidos e arquivados.",
   "ferr": [
    "Pasta do cliente"
   ],
   "cuid": [
    "Evitar pedir duas vezes: o item já consta no Checklist de Coleta (E03)."
   ]
  }
 },
 {
  "id": "E06-T02",
  "etapaNum": 6,
  "nTarefa": 2,
  "tarefa": "Pré-construção da ficha técnica",
  "descricao": "O AN estrutura a ficha técnica preliminar de cada procedimento: insumos, quantidades e custos unitários com base nas NFs recebidas.",
  "responsavel": "Analista de Negócios",
  "tipo": "Manual",
  "prazo": "Antes da reunião",
  "prioridade": "P1",
  "gate": "Ficha técnica pré-construída para validação.",
  "vinculado": "Nenhum",
  "pop": {
   "obj": "Pré-construir a ficha técnica de cada procedimento.",
   "ent": [
    "NFs e orçamentos",
    "Tabela de procedimentos"
   ],
   "passos": [
    "Listar insumos por procedimento.",
    "Estimar quantidades.",
    "Calcular o custo unitário com base nas NFs.",
    "Preparar a ficha para validação."
   ],
   "sai": "Ficha técnica pré-construída.",
   "ferr": [
    "Excel / BD_Cunt"
   ],
   "pend": [
    "Prompt de pré-construção ainda não existe (oportunidade da etapa)."
   ]
  }
 },
 {
  "id": "E06-T03",
  "etapaNum": 6,
  "nTarefa": 3,
  "tarefa": "Reunião de validação da ficha técnica com o cliente",
  "descricao": "O AN valida com o cliente cada ficha técnica: quantidades reais utilizadas, insumos faltantes e ajustes de custo. Registro das decisões.",
  "responsavel": "Analista de Negócios",
  "tipo": "Manual",
  "prazo": "Após pré-construção",
  "prioridade": "P1",
  "gate": "Reunião realizada e ficha validada.",
  "vinculado": "Nenhum",
  "pop": {
   "obj": "Validar a ficha técnica com o cliente.",
   "ent": [
    "Ficha pré-construída"
   ],
   "passos": [
    "Revisar cada ficha com o cliente: quantidades reais, insumos faltantes, custos.",
    "Registrar as decisões."
   ],
   "sai": "Ficha validada e decisões registradas.",
   "ferr": [
    "Google Meet"
   ]
  }
 },
 {
  "id": "E06-T04",
  "etapaNum": 6,
  "nTarefa": 4,
  "tarefa": "Parametrização final do BD_Cunt",
  "descricao": "O AN aplica os ajustes validados e publica o BD_Cunt final no sistema — base oficial de custo unitário que alimenta o Pricer.",
  "responsavel": "Analista de Negócios",
  "tipo": "Manual",
  "prazo": "Após validação",
  "prioridade": "P1",
  "gate": "BD_Cunt finalizado e disponível.",
  "vinculado": "Nenhum",
  "pop": {
   "obj": "Publicar o BD_Cunt final.",
   "ent": [
    "Ajustes validados"
   ],
   "passos": [
    "Aplicar os ajustes.",
    "Publicar o BD_Cunt no sistema."
   ],
   "sai": "BD_Cunt finalizado e disponível para o Pricer.",
   "ferr": [
    "Sistema interno"
   ]
  }
 },
 {
  "id": "E07-T01",
  "etapaNum": 7,
  "nTarefa": 1,
  "tarefa": "Construção da DRE Financeira",
  "descricao": "O AN constrói a DRE por regime de caixa/competência contábil a partir do BD_Financeiro conciliado. Revisão interna obrigatória.",
  "responsavel": "Analista de Negócios",
  "tipo": "Manual",
  "prazo": "Após bases prontas",
  "prioridade": "P1",
  "gate": "DRE Financeira construída e revisada.",
  "vinculado": "Fase1-PCF-Revisao-Elaboracao.md + Fase2-Painel-HTML-DRE-DFC.md",
  "pop": {
   "obj": "Construir a DRE Financeira.",
   "ent": [
    "BD_Financeiro conciliado"
   ],
   "passos": [
    "Montar a DRE pelo regime acordado a partir do BD_Financeiro.",
    "Rodar a auditoria de consistência do PCF (Fase 1, Prompt A).",
    "Revisão interna obrigatória."
   ],
   "sai": "DRE Financeira construída e revisada.",
   "ferr": [
    "PCF",
    "Claude"
   ],
   "cuid": [
    "Sinalizar divergências entre demonstrativos com ⚠️ DIVERGÊNCIA."
   ]
  }
 },
 {
  "id": "E07-T02",
  "etapaNum": 7,
  "nTarefa": 2,
  "tarefa": "Construção da DRE Gerencial",
  "descricao": "O AN constrói a visão gerencial do resultado, com ajustes que retratam a lucratividade real da operação, sem distorções fiscais.",
  "responsavel": "Analista de Negócios",
  "tipo": "Manual",
  "prazo": "Após bases prontas",
  "prioridade": "P1",
  "gate": "DRE Gerencial construída e revisada.",
  "vinculado": "Fase1-PCF-Revisao-Elaboracao.md + Fase2-Painel-HTML-DRE-DFC.md",
  "pop": {
   "obj": "Construir a DRE Gerencial.",
   "ent": [
    "DRE Financeira",
    "BD_Vendas",
    "BD_Cunt"
   ],
   "passos": [
    "Aplicar os ajustes gerenciais que retratam a lucratividade real.",
    "Conferir repasses e custos de terceiros.",
    "Revisão interna."
   ],
   "sai": "DRE Gerencial construída e revisada.",
   "ferr": [
    "PCF"
   ]
  }
 },
 {
  "id": "E07-T03",
  "etapaNum": 7,
  "nTarefa": 3,
  "tarefa": "Construção do DFC",
  "descricao": "O AN estrutura o Demonstrativo de Fluxo de Caixa: entradas, saídas e saldo projetado, integrado às DREs no PCF.",
  "responsavel": "Analista de Negócios",
  "tipo": "Manual",
  "prazo": "Após bases prontas",
  "prioridade": "P1",
  "gate": "DFC integrado ao PCF.",
  "vinculado": "Fase1-PCF-Revisao-Elaboracao.md + Fase2-Painel-HTML-DRE-DFC.md",
  "pop": {
   "obj": "Construir o DFC integrado ao PCF.",
   "ent": [
    "DREs",
    "Saldos bancários"
   ],
   "passos": [
    "Estruturar entradas, saídas e saldo.",
    "Integrar ao PCF.",
    "Gerar o Painel HTML DRE × DFC para compatibilização."
   ],
   "sai": "DFC integrado ao PCF.",
   "ferr": [
    "PCF",
    "Claude"
   ]
  }
 },
 {
  "id": "E07-T04",
  "etapaNum": 7,
  "nTarefa": 4,
  "tarefa": "Construção da apresentação da DRE retroativa",
  "descricao": "O AN monta a apresentação executiva da DRE retroativa: resultado dos últimos meses, principais linhas e leitura estratégica.",
  "responsavel": "Analista de Negócios",
  "tipo": "Manual",
  "prazo": "Antes da reunião",
  "prioridade": "P1",
  "gate": "Apresentação revisada e pronta.",
  "vinculado": "Fase1-PCF-Revisao-Elaboracao.md + Fase2-Painel-HTML-DRE-DFC.md",
  "pop": {
   "obj": "Montar a apresentação da DRE retroativa.",
   "ent": [
    "DREs e DFC revisados"
   ],
   "passos": [
    "Selecionar o resultado dos últimos meses e as principais linhas.",
    "Escrever a leitura estratégica em linguagem executiva para o sócio.",
    "Revisar."
   ],
   "sai": "Apresentação pronta.",
   "ferr": [
    "PowerPoint",
    "Claude"
   ]
  }
 },
 {
  "id": "E07-T05",
  "etapaNum": 7,
  "nTarefa": 5,
  "tarefa": "Agendamento da reunião de apresentação da DRE retroativa",
  "descricao": "O GC agenda a reunião de apresentação com o decisor da clínica, garantindo a presença de quem valida o resultado.",
  "responsavel": "Gerente de Contas",
  "tipo": "Manual",
  "prazo": "Após DREs prontas",
  "prioridade": "P1",
  "gate": "Reunião agendada e confirmada.",
  "vinculado": "Fase1-PCF-Revisao-Elaboracao.md + Fase2-Painel-HTML-DRE-DFC.md",
  "pop": {
   "obj": "Agendar a apresentação da DRE retroativa.",
   "ent": [
    "Apresentação pronta"
   ],
   "passos": [
    "Agendar com o decisor \"[Cliente] & BMO <> Apresentação PCF\".",
    "Confirmar presença."
   ],
   "sai": "Reunião agendada e confirmada.",
   "ferr": [
    "Google Calendar"
   ]
  }
 },
 {
  "id": "E07-T06",
  "etapaNum": 7,
  "nTarefa": 6,
  "tarefa": "Reunião de apresentação da DRE retroativa realizada",
  "descricao": "O GC apresenta a DRE retroativa ao cliente: resultado, gargalos e primeiros direcionamentos. Registro formal da reunião.",
  "responsavel": "Gerente de Contas",
  "tipo": "Manual",
  "prazo": "Após agendamento",
  "prioridade": "P1",
  "gate": "Reunião realizada e registrada.",
  "vinculado": "Fase1-PCF-Revisao-Elaboracao.md + Fase2-Painel-HTML-DRE-DFC.md",
  "pop": {
   "obj": "Apresentar a DRE retroativa ao cliente.",
   "ent": [
    "Apresentação"
   ],
   "passos": [
    "Apresentar resultado, gargalos e primeiros direcionamentos.",
    "Gravar a reunião e registrar os itens de ação."
   ],
   "sai": "Reunião realizada e registrada.",
   "ferr": [
    "Google Meet",
    "Gemini / tl;dv"
   ]
  }
 },
 {
  "id": "E07-T07",
  "etapaNum": 7,
  "nTarefa": 7,
  "tarefa": "DREs e apresentação salvas na área do cliente",
  "descricao": "O AN arquiva DREs, DFC e apresentação na área do cliente — rastreabilidade completa do primeiro ciclo financeiro.",
  "responsavel": "Analista de Negócios",
  "tipo": "Manual",
  "prazo": "Após reunião",
  "prioridade": "P2",
  "gate": "Arquivos disponíveis na área do cliente.",
  "vinculado": "Fase1-PCF-Revisao-Elaboracao.md + Fase2-Painel-HTML-DRE-DFC.md",
  "pop": {
   "obj": "Arquivar DREs, DFC e apresentação.",
   "ent": [
    "Arquivos finais"
   ],
   "passos": [
    "Salvar na área do cliente.",
    "Subir o PCF no Projeto Claude do cliente."
   ],
   "sai": "Arquivos disponíveis na área do cliente.",
   "ferr": [
    "Sistema interno"
   ]
  }
 },
 {
  "id": "E08-T01",
  "etapaNum": 8,
  "nTarefa": 1,
  "tarefa": "Verificação da tabela de preço atual do cliente",
  "descricao": "O AN mapeia a tabela de preços vigente da clínica por procedimento — o ponto de partida da análise de precificação.",
  "responsavel": "Analista de Negócios",
  "tipo": "Manual",
  "prazo": "Início da etapa",
  "prioridade": "P1",
  "gate": "Tabela de preços mapeada.",
  "vinculado": "Nenhum",
  "pop": {
   "obj": "Mapear a tabela de preços vigente.",
   "ent": [
    "Tabela de preços (item 8 do Checklist)"
   ],
   "passos": [
    "Conferir o item 8 do Checklist de Coleta.",
    "Mapear preço por procedimento."
   ],
   "sai": "Tabela de preços mapeada.",
   "ferr": [
    "Excel"
   ],
   "cuid": [
    "Item já pedido na Coleta (E03) — não repetir a solicitação."
   ]
  }
 },
 {
  "id": "E08-T02",
  "etapaNum": 8,
  "nTarefa": 2,
  "tarefa": "Análise e rateio do custo fixo por categoria",
  "descricao": "O AN analisa a estrutura de custo fixo da DRE e define o critério de rateio por categoria de procedimento. Validação interna do critério.",
  "responsavel": "Analista de Negócios",
  "tipo": "Manual",
  "prazo": "Antes da construção",
  "prioridade": "P1",
  "gate": "Rateio concluído e validado.",
  "vinculado": "Nenhum",
  "pop": {
   "obj": "Ratear o custo fixo por categoria de procedimento.",
   "ent": [
    "DRE (custo fixo)",
    "Mix de vendas"
   ],
   "passos": [
    "Levantar o custo fixo da DRE.",
    "Definir o critério de rateio por categoria.",
    "Validar o critério internamente."
   ],
   "sai": "Rateio concluído e validado.",
   "ferr": [
    "PCF",
    "Excel"
   ],
   "pend": [
    "Critério padrão de rateio não documentado no Projeto."
   ]
  }
 },
 {
  "id": "E08-T03",
  "etapaNum": 8,
  "nTarefa": 3,
  "tarefa": "Construção do Pricer",
  "descricao": "O AN constrói a ferramenta de precificação: custo unitário (BD_Cunt) + rateio de fixo + margem alvo = preço sugerido por procedimento.",
  "responsavel": "Analista de Negócios",
  "tipo": "Manual",
  "prazo": "Após rateio",
  "prioridade": "P1",
  "gate": "Pricer construído e revisado.",
  "vinculado": "Nenhum",
  "pop": {
   "obj": "Construir o Pricer.",
   "ent": [
    "BD_Cunt",
    "Rateio",
    "Taxas e alíquotas"
   ],
   "passos": [
    "Compor: custo unitário + rateio de fixo + taxas + impostos + margem-alvo.",
    "Calcular o preço sugerido por procedimento.",
    "Comparar com a tabela vigente.",
    "Revisar."
   ],
   "sai": "Pricer construído e revisado.",
   "ferr": [
    "Pricer"
   ],
   "pend": [
    "Margem-alvo padrão não documentada."
   ]
  }
 },
 {
  "id": "E08-T04",
  "etapaNum": 8,
  "nTarefa": 4,
  "tarefa": "Agendamento da reunião de validação e treinamento do Pricer",
  "descricao": "O GC agenda a reunião dupla: validar os preços sugeridos com o decisor e treinar o uso da ferramenta.",
  "responsavel": "Gerente de Contas",
  "tipo": "Manual",
  "prazo": "Após Pricer pronto",
  "prioridade": "P1",
  "gate": "Reunião agendada e confirmada.",
  "vinculado": "Nenhum",
  "pop": {
   "obj": "Agendar validação e treinamento do Pricer.",
   "ent": [
    "Pricer pronto"
   ],
   "passos": [
    "Agendar reunião dupla com o decisor (validação + treinamento).",
    "Confirmar presença."
   ],
   "sai": "Reunião agendada.",
   "ferr": [
    "Google Calendar"
   ]
  }
 },
 {
  "id": "E08-T05",
  "etapaNum": 8,
  "nTarefa": 5,
  "tarefa": "Reunião de validação e treinamento do Pricer realizada",
  "descricao": "O AN conduz a reunião: apresenta a lógica de precificação, valida os preços por procedimento e treina o cliente no uso do módulo.",
  "responsavel": "Analista de Negócios",
  "tipo": "Manual",
  "prazo": "Após agendamento",
  "prioridade": "P1",
  "gate": "Reunião realizada + Pricer validado.",
  "vinculado": "Nenhum",
  "pop": {
   "obj": "Validar os preços e treinar o cliente.",
   "ent": [
    "Pricer"
   ],
   "passos": [
    "Apresentar a lógica de precificação.",
    "Validar preço por procedimento.",
    "Treinar o uso do módulo e gravar."
   ],
   "sai": "Pricer validado e cliente treinado.",
   "ferr": [
    "Pricer",
    "Google Meet"
   ]
  }
 },
 {
  "id": "E08-T06",
  "etapaNum": 8,
  "nTarefa": 6,
  "tarefa": "Ajustes pós-reunião do Pricer",
  "descricao": "O AN aplica os ajustes solicitados na reunião (margens, custos, procedimentos) e submete a versão final à aprovação.",
  "responsavel": "Analista de Negócios",
  "tipo": "Manual",
  "prazo": "Após reunião",
  "prioridade": "P2",
  "gate": "Ajustes aplicados e Pricer final aprovado.",
  "vinculado": "Nenhum",
  "pop": {
   "obj": "Aplicar os ajustes pós-reunião.",
   "ent": [
    "Ajustes pedidos"
   ],
   "passos": [
    "Ajustar margens, custos e procedimentos.",
    "Submeter a versão final à aprovação."
   ],
   "sai": "Pricer final aprovado.",
   "ferr": [
    "Pricer"
   ]
  }
 },
 {
  "id": "E08-T07",
  "etapaNum": 8,
  "nTarefa": 7,
  "tarefa": "Pricer disponibilizado no módulo do cliente",
  "descricao": "O AN publica o Pricer aprovado no módulo do cliente no sistema — ferramenta viva de precificação em uso pela clínica.",
  "responsavel": "Analista de Negócios",
  "tipo": "Manual",
  "prazo": "Após ajustes",
  "prioridade": "P1",
  "gate": "Pricer acessível na área do cliente.",
  "vinculado": "Nenhum",
  "pop": {
   "obj": "Publicar o Pricer no módulo do cliente.",
   "ent": [
    "Pricer aprovado"
   ],
   "passos": [
    "Publicar na área do cliente.",
    "Validar o acesso como cliente em \"Acessar Pricer\"."
   ],
   "sai": "Pricer acessível na área do cliente.",
   "ferr": [
    "Pricer"
   ]
  }
 },
 {
  "id": "E09-T01",
  "etapaNum": 9,
  "nTarefa": 1,
  "tarefa": "Construção da aba Análise de Lucratividade",
  "descricao": "O AN constrói a aba de lucratividade do BI: margem por período, evolução do resultado e comparativos com o planejado.",
  "responsavel": "Analista de Negócios",
  "tipo": "Manual",
  "prazo": "Após bases prontas",
  "prioridade": "P1",
  "gate": "Aba construída e validada.",
  "vinculado": "Fase2-Painel-HTML-DRE-DFC.md (parcial)",
  "pop": {
   "obj": "Construir a aba Análise de Lucratividade do BI.",
   "ent": [
    "DRE, DFC, Pricer, BD_Vendas, BD_Cunt"
   ],
   "passos": [
    "Montar a aba: margem por período, evolução do resultado e comparativo com o planejado.",
    "Usar o padrão visual BMO.",
    "Testar com os dados reais do cliente.",
    "Validar internamente."
   ],
   "sai": "Aba construída e validada.",
   "ferr": [
    "BI Dashboard",
    "Claude"
   ]
  }
 },
 {
  "id": "E09-T02",
  "etapaNum": 9,
  "nTarefa": 2,
  "tarefa": "Construção da aba Análise Comercial",
  "descricao": "O AN constrói a aba comercial: volume de vendas, ticket médio, mix de procedimentos e funil — alimentada pelo BD_Vendas.",
  "responsavel": "Analista de Negócios",
  "tipo": "Manual",
  "prazo": "Após bases prontas",
  "prioridade": "P1",
  "gate": "Aba construída e validada.",
  "vinculado": "Fase2-Painel-HTML-DRE-DFC.md (parcial)",
  "pop": {
   "obj": "Construir a aba Análise Comercial do BI.",
   "ent": [
    "DRE, DFC, Pricer, BD_Vendas, BD_Cunt"
   ],
   "passos": [
    "Montar a aba: volume, ticket médio, mix de procedimentos e funil a partir do BD_Vendas.",
    "Usar o padrão visual BMO.",
    "Testar com os dados reais do cliente.",
    "Validar internamente."
   ],
   "sai": "Aba construída e validada.",
   "ferr": [
    "BI Dashboard",
    "Claude"
   ]
  }
 },
 {
  "id": "E09-T03",
  "etapaNum": 9,
  "nTarefa": 3,
  "tarefa": "Construção da aba Análise de Margem",
  "descricao": "O AN constrói a aba de margem por procedimento: cruza BD_Vendas com BD_Cunt para mostrar a margem de contribuição real de cada serviço.",
  "responsavel": "Analista de Negócios",
  "tipo": "Manual",
  "prazo": "Após bases prontas",
  "prioridade": "P1",
  "gate": "Aba construída e validada.",
  "vinculado": "Fase2-Painel-HTML-DRE-DFC.md (parcial)",
  "pop": {
   "obj": "Construir a aba Análise de Margem do BI.",
   "ent": [
    "DRE, DFC, Pricer, BD_Vendas, BD_Cunt"
   ],
   "passos": [
    "Montar a aba: margem de contribuição por procedimento cruzando BD_Vendas × BD_Cunt.",
    "Usar o padrão visual BMO.",
    "Testar com os dados reais do cliente.",
    "Validar internamente."
   ],
   "sai": "Aba construída e validada.",
   "ferr": [
    "BI Dashboard",
    "Claude"
   ]
  }
 },
 {
  "id": "E09-T04",
  "etapaNum": 9,
  "nTarefa": 4,
  "tarefa": "Construção parcial da aba Planejamento Estratégico",
  "descricao": "O AN pré-estrutura a aba de planejamento (metas e projeções) que será finalizada na Etapa 10 após a reunião estratégica.",
  "responsavel": "Analista de Negócios",
  "tipo": "Manual",
  "prazo": "Após bases prontas",
  "prioridade": "P2",
  "gate": "Aba parcial construída para validação.",
  "vinculado": "Fase2-Painel-HTML-DRE-DFC.md (parcial)",
  "pop": {
   "obj": "Pré-estruturar a aba Planejamento Estratégico.",
   "ent": [
    "Histórico consolidado"
   ],
   "passos": [
    "Estruturar metas e projeções em branco para a Etapa 10.",
    "Deixar os campos de meta prontos para receber os OKR."
   ],
   "sai": "Aba parcial pronta para validação.",
   "ferr": [
    "BI Dashboard"
   ]
  }
 },
 {
  "id": "E10-T01",
  "etapaNum": 10,
  "nTarefa": 1,
  "tarefa": "Construção da projeção trimestral e insights",
  "descricao": "O GC constrói a projeção do trimestre com base no histórico e nos insights das análises — o material central da reunião estratégica.",
  "responsavel": "Gerente de Contas",
  "tipo": "Manual",
  "prazo": "Antes da reunião",
  "prioridade": "P1",
  "gate": "Projeção e insights prontos para reunião.",
  "vinculado": "Fase3-Apresentacao-Planejamento-PPTX.md",
  "pop": {
   "obj": "Construir a projeção trimestral e o diagnóstico estratégico.",
   "ent": [
    "PCF",
    "BI",
    "Atas datadas"
   ],
   "passos": [
    "Rodar Fase 1 Prompt A (auditoria) e Prompt B (projeção) ou a skill bmo-preenchimento-pcf.",
    "Rodar o gate ICB: abaixo de 60% o entregável vira o plano de correção da base.",
    "Conduzir os 5 pilares e nomear a restrição dominante em uma frase com o número que a sustenta.",
    "Calcular o IDE e montar cenários e OKR (skill bmo-planejamento-financeiro-estrategico).",
    "Gerar o deck de 14 slides (Fase 3)."
   ],
   "sai": "Projeção, diagnóstico e deck prontos.",
   "ferr": [
    "Claude",
    "PCF",
    "PowerPoint"
   ],
   "cuid": [
    "Ordem obrigatória: Fase 1 → Fase 2 → Fase 6 → Fase 3. O deck nunca alimenta o diagnóstico."
   ]
  }
 },
 {
  "id": "E10-T02",
  "etapaNum": 10,
  "nTarefa": 2,
  "tarefa": "Agendamento da reunião de Planejamento Estratégico",
  "descricao": "O GC agenda a reunião estratégica com o decisor, garantindo tempo adequado para discussão de metas e direcionamento.",
  "responsavel": "Gerente de Contas",
  "tipo": "Manual",
  "prazo": "Após BI pronto",
  "prioridade": "P1",
  "gate": "Reunião agendada e confirmada.",
  "vinculado": "Fase3-Apresentacao-Planejamento-PPTX.md",
  "pop": {
   "obj": "Agendar a reunião de Planejamento Estratégico.",
   "ent": [
    "Deck pronto"
   ],
   "passos": [
    "Agendar \"[Cliente] & BMO <> Planejamento Estratégico [Trimestre]\" com tempo para discussão (≈ 50 min).",
    "Confirmar presença do decisor."
   ],
   "sai": "Reunião agendada.",
   "ferr": [
    "Google Calendar"
   ]
  }
 },
 {
  "id": "E10-T03",
  "etapaNum": 10,
  "nTarefa": 3,
  "tarefa": "Reunião de Planejamento Estratégico realizada",
  "descricao": "O GC conduz a reunião: apresenta a projeção, valida as metas do trimestre e registra as decisões estratégicas do cliente.",
  "responsavel": "Gerente de Contas",
  "tipo": "Manual",
  "prazo": "Após agendamento",
  "prioridade": "P1",
  "gate": "Reunião realizada e registrada.",
  "vinculado": "Fase3-Apresentacao-Planejamento-PPTX.md",
  "pop": {
   "obj": "Conduzir a reunião de Planejamento Estratégico.",
   "ent": [
    "Deck",
    "Painel do IDE"
   ],
   "passos": [
    "Seguir a pauta: Resultado → Desvio → Causa → Restrição → Prioridade → Plano → Ownership → Prazo.",
    "Fechar 3 a 5 iniciativas, cada uma ligada a um KR com owner e prazo.",
    "Gravar e registrar as decisões."
   ],
   "sai": "Reunião realizada e decisões registradas.",
   "ferr": [
    "Google Meet",
    "Gemini / tl;dv"
   ]
  }
 },
 {
  "id": "E10-T04",
  "etapaNum": 10,
  "nTarefa": 4,
  "tarefa": "Finalização da aba Planejamento Estratégico no BI com metas validadas",
  "descricao": "O AN insere as metas validadas na aba de planejamento do BI — fechando o ciclo de implementação com o painel completo.",
  "responsavel": "Analista de Negócios",
  "tipo": "Manual",
  "prazo": "Após reunião",
  "prioridade": "P1",
  "gate": "BI finalizado com metas validadas.",
  "vinculado": "Fase3-Apresentacao-Planejamento-PPTX.md",
  "pop": {
   "obj": "Inserir as metas validadas no BI.",
   "ent": [
    "Decisões da reunião"
   ],
   "passos": [
    "Preencher a aba Planejamento Estratégico com as metas.",
    "Atualizar o Dashboard Consolidado."
   ],
   "sai": "BI finalizado com metas validadas.",
   "ferr": [
    "BI Dashboard"
   ]
  }
 },
 {
  "id": "E10-T05",
  "etapaNum": 10,
  "nTarefa": 5,
  "tarefa": "Apresentação salva na área do cliente",
  "descricao": "O AN arquiva a apresentação do planejamento na área do cliente. Marco de conclusão da implementação — cliente migra para Gestão Contínua.",
  "responsavel": "Analista de Negócios",
  "tipo": "Manual",
  "prazo": "Após reunião",
  "prioridade": "P2",
  "gate": "Arquivo disponível na área do cliente.",
  "vinculado": "Fase3-Apresentacao-Planejamento-PPTX.md",
  "pop": {
   "obj": "Arquivar a apresentação e migrar o cliente para Gestão Contínua.",
   "ent": [
    "Apresentação final"
   ],
   "passos": [
    "Salvar na área do cliente.",
    "Mudar o segmento do cliente para \"Implementado\" no sistema.",
    "Ativar o ciclo recorrente (Etapas 11 a 13)."
   ],
   "sai": "Arquivo salvo e cliente em Gestão Contínua.",
   "ferr": [
    "Sistema interno"
   ]
  }
 },
 {
  "id": "E11-T01",
  "etapaNum": 11,
  "nTarefa": 1,
  "tarefa": "Atualização do BD_Vendas",
  "descricao": "O AF atualiza a base de vendas com os dados da semana — primeiro insumo do report. SLA institucional: segunda-feira pela manhã.",
  "responsavel": "Analista Financeiro",
  "tipo": "Recorrente",
  "prazo": "Toda segunda-feira",
  "prioridade": "P1",
  "gate": "BD_Vendas atualizado e pronto para o report.",
  "vinculado": "Nenhum",
  "pop": {
   "obj": "Atualizar o BD_Vendas da semana (até 8h).",
   "ent": [
    "Acesso BMO ao sistema de vendas"
   ],
   "passos": [
    "Extrair as vendas da semana.",
    "Atualizar o BD_Vendas.",
    "Conferir inconsistências."
   ],
   "sai": "BD_Vendas pronto para o report.",
   "ferr": [
    "Sistema de gestão do cliente"
   ],
   "cuid": [
    "⚠️ DIVERGÊNCIA de responsável com a E05-T04 (Analista de Negócios)."
   ]
  }
 },
 {
  "id": "E11-T02",
  "etapaNum": 11,
  "nTarefa": 2,
  "tarefa": "Atualização do BD_Financeiro",
  "descricao": "O AF importa o OFX da semana, categoriza os lançamentos e atualiza o BD_Financeiro — segundo insumo do report.",
  "responsavel": "Analista Financeiro",
  "tipo": "Recorrente",
  "prazo": "Toda segunda-feira",
  "prioridade": "P1",
  "gate": "BD_Financeiro atualizado e pronto para o report.",
  "vinculado": "Nenhum",
  "pop": {
   "obj": "Atualizar o BD_Financeiro da semana (até 8h).",
   "ent": [
    "OFX da semana"
   ],
   "passos": [
    "Importar o OFX da semana.",
    "Categorizar os lançamentos.",
    "Atualizar o BD_Financeiro."
   ],
   "sai": "BD_Financeiro pronto para o report.",
   "ferr": [
    "ContaAzul"
   ]
  }
 },
 {
  "id": "E11-T03",
  "etapaNum": 11,
  "nTarefa": 3,
  "tarefa": "Construção do Report",
  "descricao": "O AN constrói o report semanal no template padrão: indicadores, análise da semana, destaques e próximos passos.",
  "responsavel": "Analista de Negócios",
  "tipo": "Recorrente",
  "prazo": "Toda segunda-feira",
  "prioridade": "P1",
  "gate": "Report construído e pronto para revisão.",
  "vinculado": "Nenhum",
  "pop": {
   "obj": "Construir o report semanal (até 10h).",
   "ent": [
    "Bases atualizadas",
    "Tarefas do BMO Tarefas"
   ],
   "passos": [
    "Importar as atas da semana anterior para o BMO Tarefas.",
    "Montar o report: indicadores, análise da semana, atividades realizadas (Concluídas nos últimos 7 dias) e previstas (Pendentes e Em andamento).",
    "Incluir os KPIs da restrição dominante (Fase 6, cadência semanal).",
    "Excluir tarefas Bloqueadas."
   ],
   "sai": "Report pronto para revisão.",
   "ferr": [
    "BMO Tarefas",
    "Claude"
   ],
   "pend": [
    "Template padrão do report não localizado no Projeto."
   ]
  }
 },
 {
  "id": "E11-T04",
  "etapaNum": 11,
  "nTarefa": 4,
  "tarefa": "Validação do Report",
  "descricao": "O GC revisa o report: coerência da análise, adequação do tom e validação dos próximos passos antes do envio ao cliente.",
  "responsavel": "Gerente de Contas",
  "tipo": "Recorrente",
  "prazo": "Toda segunda-feira",
  "prioridade": "P1",
  "gate": "Report validado e aprovado para envio.",
  "vinculado": "Nenhum",
  "pop": {
   "obj": "Validar o report.",
   "ent": [
    "Report construído"
   ],
   "passos": [
    "Revisar coerência da análise e tom executivo.",
    "Validar os próximos passos.",
    "Aprovar o envio."
   ],
   "sai": "Report aprovado.",
   "ferr": [
    "BMO Tarefas"
   ]
  }
 },
 {
  "id": "E11-T05",
  "etapaNum": 11,
  "nTarefa": 5,
  "tarefa": "Envio do Report",
  "descricao": "O AN envia o report validado pelo canal padrão do cliente e registra o envio com data e hora no sistema.",
  "responsavel": "Analista de Negócios",
  "tipo": "Recorrente",
  "prazo": "Toda segunda-feira",
  "prioridade": "P1",
  "gate": "Report enviado e registrado.",
  "vinculado": "Nenhum",
  "pop": {
   "obj": "Enviar o report (até 12h).",
   "ent": [
    "Report aprovado"
   ],
   "passos": [
    "Enviar pelo canal padrão do cliente (grupo de WhatsApp).",
    "Registrar data e hora do envio no sistema."
   ],
   "sai": "Report enviado e registrado.",
   "ferr": [
    "WhatsApp",
    "Sistema interno"
   ]
  }
 },
 {
  "id": "E11-T06",
  "etapaNum": 11,
  "nTarefa": 6,
  "tarefa": "Confirmação do Recebimento do Report",
  "descricao": "O cliente confirma o recebimento — sinal de engajamento monitorado pela Gestão de Riscos (Etapa 13).",
  "responsavel": "Cliente",
  "tipo": "Recorrente",
  "prazo": "Toda segunda-feira",
  "prioridade": "P2",
  "gate": "Confirmação de recebimento registrada.",
  "vinculado": "Nenhum",
  "pop": {
   "obj": "Registrar a confirmação de recebimento.",
   "ent": [
    "Report enviado"
   ],
   "passos": [
    "Registrar a reação do cliente ao report.",
    "Levar o sinal para a planilha de riscos (campo \"Reação aos reports\")."
   ],
   "sai": "Confirmação registrada.",
   "ferr": [
    "Sistema interno",
    "Planilha de riscos"
   ],
   "cuid": [
    "É sinal de engajamento monitorado na Etapa 13."
   ]
  }
 },
 {
  "id": "E12-T01",
  "etapaNum": 12,
  "nTarefa": 1,
  "tarefa": "Envio da Meta do Mês e salvo na área do cliente",
  "descricao": "O AN envia a meta mensal ao cliente no primeiro dia útil e arquiva o documento na área do cliente.",
  "responsavel": "Analista de Negócios",
  "tipo": "Recorrente",
  "prazo": "1º dia útil do mês",
  "prioridade": "P1",
  "gate": "Meta enviada e arquivo salvo.",
  "vinculado": "Acompanhamento mensal (preso a cliente específico)",
  "pop": {
   "obj": "Enviar a meta do mês (1º dia útil).",
   "ent": [
    "Metas validadas no BI"
   ],
   "passos": [
    "Extrair a meta do mês do planejamento.",
    "Enviar ao cliente.",
    "Arquivar na área do cliente."
   ],
   "sai": "Meta enviada e salva.",
   "ferr": [
    "BI",
    "WhatsApp"
   ]
  }
 },
 {
  "id": "E12-T02",
  "etapaNum": 12,
  "nTarefa": 2,
  "tarefa": "Envio do comissionamento comercial do mês anterior",
  "descricao": "O AN calcula e envia o comissionamento comercial do mês fechado, com memória de cálculo, e arquiva na área do cliente.",
  "responsavel": "Analista de Negócios",
  "tipo": "Recorrente",
  "prazo": "5º dia útil do mês",
  "prioridade": "P1",
  "gate": "Comissionamento enviado e salvo.",
  "vinculado": "Acompanhamento mensal (preso a cliente específico)",
  "pop": {
   "obj": "Calcular e enviar o comissionamento (5º dia útil).",
   "ent": [
    "Regras de comissionamento (Checklist item 10)",
    "BD_Vendas do mês"
   ],
   "passos": [
    "Aplicar as regras sobre as vendas do mês fechado.",
    "Montar a memória de cálculo.",
    "Enviar e arquivar."
   ],
   "sai": "Comissionamento enviado com memória de cálculo.",
   "ferr": [
    "Excel"
   ]
  }
 },
 {
  "id": "E12-T03",
  "etapaNum": 12,
  "nTarefa": 3,
  "tarefa": "Envio do repasse médico do mês anterior",
  "descricao": "O AN calcula e envia o repasse médico do mês fechado conforme as regras acordadas, e arquiva na área do cliente.",
  "responsavel": "Analista de Negócios",
  "tipo": "Recorrente",
  "prazo": "5º dia útil do mês",
  "prioridade": "P1",
  "gate": "Repasse enviado e salvo.",
  "vinculado": "Acompanhamento mensal (preso a cliente específico)",
  "pop": {
   "obj": "Calcular e enviar o repasse médico (5º dia útil).",
   "ent": [
    "Regras de repasse (Checklist item 11)"
   ],
   "passos": [
    "Aplicar as regras acordadas por profissional e serviço.",
    "Enviar e arquivar."
   ],
   "sai": "Repasse enviado e salvo.",
   "ferr": [
    "Excel"
   ]
  }
 },
 {
  "id": "E12-T04",
  "etapaNum": 12,
  "nTarefa": 4,
  "tarefa": "Construção da apresentação de resultado mensal com custos provisionados",
  "descricao": "O AN estrutura a apresentação do resultado do mês com custos provisionados — material da reunião mensal.",
  "responsavel": "Analista de Negócios",
  "tipo": "Recorrente",
  "prazo": "Antes da reunião",
  "prioridade": "P1",
  "gate": "Apresentação construída e revisada.",
  "vinculado": "Acompanhamento mensal (preso a cliente específico)",
  "pop": {
   "obj": "Montar a apresentação do resultado com custos provisionados.",
   "ent": [
    "PCF do mês"
   ],
   "passos": [
    "Rodar a leitura mensal Realizado × Planejado.",
    "Destacar desvios, pontos positivos e de atenção.",
    "Montar a apresentação."
   ],
   "sai": "Apresentação revisada.",
   "ferr": [
    "Claude",
    "PowerPoint"
   ]
  }
 },
 {
  "id": "E12-T05",
  "etapaNum": 12,
  "nTarefa": 5,
  "tarefa": "Agendamento da reunião mensal",
  "descricao": "O GC agenda a reunião de resultado com o decisor no início do mês, garantindo a cadência do rito mensal.",
  "responsavel": "Gerente de Contas",
  "tipo": "Recorrente",
  "prazo": "Início do mês",
  "prioridade": "P1",
  "gate": "Reunião agendada e confirmada.",
  "vinculado": "Acompanhamento mensal (preso a cliente específico)",
  "pop": {
   "obj": "Agendar a reunião mensal.",
   "ent": [
    "Apresentação"
   ],
   "passos": [
    "Agendar no início do mês com o decisor.",
    "Confirmar presença."
   ],
   "sai": "Reunião agendada.",
   "ferr": [
    "Google Calendar"
   ]
  }
 },
 {
  "id": "E12-T06",
  "etapaNum": 12,
  "nTarefa": 6,
  "tarefa": "Reunião de resultado realizada",
  "descricao": "O GC apresenta o resultado do mês, analisa desvios em relação à meta e valida o plano de ação dos próximos 30 dias.",
  "responsavel": "Gerente de Contas",
  "tipo": "Recorrente",
  "prazo": "1ª semana do mês",
  "prioridade": "P1",
  "gate": "Reunião realizada e registrada.",
  "vinculado": "Acompanhamento mensal (preso a cliente específico)",
  "pop": {
   "obj": "Conduzir a reunião de resultado.",
   "ent": [
    "Apresentação"
   ],
   "passos": [
    "Apresentar resultado e desvios em relação à meta.",
    "Validar o plano de ação dos próximos 30 dias.",
    "Gravar e registrar."
   ],
   "sai": "Reunião realizada e registrada.",
   "ferr": [
    "Google Meet"
   ]
  }
 },
 {
  "id": "E12-T07",
  "etapaNum": 12,
  "nTarefa": 7,
  "tarefa": "Consolidação da DRE com custos fechados",
  "descricao": "O AN consolida a DRE definitiva do mês com todos os custos fechados (substituindo os provisionados). Prazo institucional: dia 15.",
  "responsavel": "Analista de Negócios",
  "tipo": "Recorrente",
  "prazo": "Até dia 15",
  "prioridade": "P1",
  "gate": "DRE consolidada e sem pendências.",
  "vinculado": "Acompanhamento mensal (preso a cliente específico)",
  "pop": {
   "obj": "Consolidar a DRE com custos fechados (até dia 15).",
   "ent": [
    "Custos fechados"
   ],
   "passos": [
    "Substituir provisionados por realizados.",
    "Rodar o CHECK do Pilar 5 e atualizar Saúde Financeira e Estrutura Econômica (sem recalcular o IDE)."
   ],
   "sai": "DRE consolidada sem pendências.",
   "ferr": [
    "PCF"
   ]
  }
 },
 {
  "id": "E12-T08",
  "etapaNum": 12,
  "nTarefa": 8,
  "tarefa": "Construção da apresentação da DRE consolidada",
  "descricao": "O AN monta a apresentação comparativa: DRE financeira vs. gerencial e destrinchamento de custos do mês fechado.",
  "responsavel": "Analista de Negócios",
  "tipo": "Recorrente",
  "prazo": "Até dia 15",
  "prioridade": "P1",
  "gate": "Apresentação construída e revisada.",
  "vinculado": "Acompanhamento mensal (preso a cliente específico)",
  "pop": {
   "obj": "Montar a apresentação da DRE consolidada.",
   "ent": [
    "DRE consolidada"
   ],
   "passos": [
    "Comparar DRE Financeira × DRE Gerencial.",
    "Destrinchar custos do mês fechado.",
    "Anexar 1 página do CHECK do Pilar 5."
   ],
   "sai": "Apresentação revisada.",
   "ferr": [
    "PowerPoint"
   ]
  }
 },
 {
  "id": "E12-T09",
  "etapaNum": 12,
  "nTarefa": 9,
  "tarefa": "Envio da DRE consolidada + sinalização no grupo do WhatsApp",
  "descricao": "O AN envia a DRE consolidada ao cliente e sinaliza no grupo — fechamento formal do ciclo financeiro do mês.",
  "responsavel": "Analista de Negócios",
  "tipo": "Recorrente",
  "prazo": "Dia 15",
  "prioridade": "P1",
  "gate": "DRE enviada e sinalizada no grupo.",
  "vinculado": "Acompanhamento mensal (preso a cliente específico)",
  "pop": {
   "obj": "Enviar a DRE consolidada e sinalizar no grupo (dia 15).",
   "ent": [
    "Apresentação"
   ],
   "passos": [
    "Enviar a DRE consolidada.",
    "Sinalizar no grupo do WhatsApp."
   ],
   "sai": "DRE enviada e sinalizada.",
   "ferr": [
    "WhatsApp"
   ]
  }
 },
 {
  "id": "E12-T10",
  "etapaNum": 12,
  "nTarefa": 10,
  "tarefa": "DRE e apresentação salvas na área do cliente",
  "descricao": "O AN arquiva a DRE consolidada e a apresentação na área do cliente — rastreabilidade completa do mês.",
  "responsavel": "Analista de Negócios",
  "tipo": "Recorrente",
  "prazo": "Dia 15",
  "prioridade": "P2",
  "gate": "Arquivos disponíveis na área do cliente.",
  "vinculado": "Acompanhamento mensal (preso a cliente específico)",
  "pop": {
   "obj": "Arquivar DRE e apresentação (dia 15).",
   "ent": [
    "Arquivos finais"
   ],
   "passos": [
    "Salvar na área do cliente.",
    "Atualizar o PCF no Projeto Claude do cliente."
   ],
   "sai": "Arquivos disponíveis.",
   "ferr": [
    "Sistema interno"
   ]
  }
 },
 {
  "id": "E13-T01",
  "etapaNum": 13,
  "nTarefa": 1,
  "tarefa": "Preenchimento semanal da planilha de gestão de riscos",
  "descricao": "O GC atualiza semanalmente a planilha de riscos da carteira: engajamento, uso de produto e resultado de cada cliente (Health Score).",
  "responsavel": "Gerente de Contas",
  "tipo": "Recorrente",
  "prazo": "Toda semana",
  "prioridade": "P1",
  "gate": "Planilha preenchida e atualizada.",
  "vinculado": "Nenhum",
  "pop": {
   "obj": "Atualizar a planilha de riscos da carteira.",
   "ent": [
    "Planilha de riscos",
    "Atas, WhatsApp e reports da semana"
   ],
   "passos": [
    "Atualizar \"Últ. contato decisor\" somente com mensagem do próprio decisor.",
    "Preencher Engajamento, uso de Pricer/BI/DRE/ERP, situação financeira, MRR, tendência e objetivo.",
    "Recalcular Score e nível de risco após qualquer reordenação.",
    "Ordenar por Fase → Score decrescente."
   ],
   "sai": "Planilha preenchida e atualizada.",
   "ferr": [
    "Planilha de Gestão de Riscos",
    "Supabase (bmo_risk_snapshots)"
   ],
   "cuid": [
    "Contato de apoio ou de membro BMO não conta como contato do decisor.",
    "Cliente em churn: Hist. churn = Sim, Tendência = Caindo, Atingindo objetivo = Não."
   ]
  }
 },
 {
  "id": "E13-T02",
  "etapaNum": 13,
  "nTarefa": 2,
  "tarefa": "Reunião interna de revisão de riscos",
  "descricao": "GC e Diretor revisam a carteira na reunião semanal: classificam riscos, identificam clientes críticos e priorizam ações.",
  "responsavel": "GC + Diretor",
  "tipo": "Recorrente",
  "prazo": "Toda quarta ou quinta",
  "prioridade": "P1",
  "gate": "Reunião realizada e riscos classificados.",
  "vinculado": "Nenhum",
  "pop": {
   "obj": "Revisar os riscos em reunião interna (quarta ou quinta).",
   "ent": [
    "Planilha atualizada"
   ],
   "passos": [
    "Revisar a carteira com o Diretor.",
    "Classificar riscos e identificar críticos.",
    "Priorizar ações."
   ],
   "sai": "Riscos classificados.",
   "ferr": [
    "Google Meet"
   ]
  }
 },
 {
  "id": "E13-T03",
  "etapaNum": 13,
  "nTarefa": 3,
  "tarefa": "Definição e registro do plano de ação para clientes em risco",
  "descricao": "Para cada cliente classificado em risco, o GC define ação de contenção com owner e prazo, registrada no sistema.",
  "responsavel": "Gerente de Contas",
  "tipo": "Manual",
  "prazo": "Após reunião",
  "prioridade": "P1",
  "gate": "Plano de ação registrado com owner e prazo.",
  "vinculado": "Nenhum",
  "pop": {
   "obj": "Definir e registrar o plano de ação para clientes em risco.",
   "ent": [
    "Clientes classificados em risco"
   ],
   "passos": [
    "Definir ação de contenção ligada a um entregável BMO (DRE, DFC, preço, indicadores, planejamento).",
    "Especificar o mecanismo, não só a intenção.",
    "Registrar com owner e prazo na coluna Plano de ação."
   ],
   "sai": "Plano registrado com owner e prazo.",
   "ferr": [
    "Planilha de riscos",
    "BMO Tarefas"
   ],
   "cuid": [
    "Ações alinhadas ao cliente, nunca tarefas internas da BMO."
   ]
  }
 },
 {
  "id": "E13-T04",
  "etapaNum": 13,
  "nTarefa": 4,
  "tarefa": "Acompanhamento do plano de ação com o squad",
  "descricao": "O GC acompanha a execução dos planos de contenção junto ao squad até a reversão do risco ou decisão de encerramento.",
  "responsavel": "Gerente de Contas",
  "tipo": "Manual",
  "prazo": "Contínuo",
  "prioridade": "P2",
  "gate": "Plano em execução e progresso registrado.",
  "vinculado": "Nenhum",
  "pop": {
   "obj": "Acompanhar o plano de contenção com o squad.",
   "ent": [
    "Planos registrados"
   ],
   "passos": [
    "Acompanhar a execução semanal.",
    "Registrar o progresso.",
    "Escalar quando não houver reversão."
   ],
   "sai": "Plano em execução com progresso registrado.",
   "ferr": [
    "BMO Tarefas"
   ]
  }
 },
 {
  "id": "E14-T01",
  "etapaNum": 14,
  "nTarefa": 1,
  "tarefa": "Revisão e handoff CRM",
  "descricao": "Ao encerrar o contrato (ou abrir expansão), o GC revisa o ciclo completo do cliente e executa o handoff para o CRM com o histórico documentado.",
  "responsavel": "Gerente de Contas",
  "tipo": "Manual",
  "prazo": "Ao encerrar contrato",
  "prioridade": "P1",
  "gate": "Handoff registrado e CRM atualizado.",
  "vinculado": "Nenhum",
  "pop": {
   "obj": "Revisar o ciclo e fazer o handoff para o CRM.",
   "ent": [
    "Histórico completo do cliente",
    "Mensagem de cancelamento ou de expansão"
   ],
   "passos": [
    "Revisar o ciclo: entrada, diagnóstico, entregas, evolução.",
    "Em churn: produzir o Relatório de Churn nas 6 seções, com a citação literal da mensagem de cancelamento.",
    "Pedir ao GC as Observações Gerais (seção 6) antes de finalizar.",
    "Atualizar o CRM e registrar o handoff."
   ],
   "sai": "Handoff registrado e CRM atualizado.",
   "ferr": [
    "CRM",
    "Word / PDF"
   ],
   "cuid": [
    "A seção 6 nunca é gerada por especulação — vem do GC."
   ]
  }
 }
]
