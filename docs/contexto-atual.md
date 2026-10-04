# Contexto atual — nassauTickets

Atualização: 03/10/2026. Frente: frontend. Branch de desenvolvimento: dev. Repositório da equipe: joellyf/nassauTickets; origin local é o fork henryttorres, upstream é a equipe.

## Entrega implementada

Backend funcional com persistência MySQL e frontend integrado ao serviço real. O startup inicializa a base a partir de schema.sql quando ela está vazia e valida a estrutura quando já existem tabelas, sem apagá-las. O fluxo de emissão de senha, chamada do próximo ticket, painel e ações de atendimento depende do banco real em vez do mock local.

React/TypeScript/Vite: rotas Totem, Atendimento e Painel, serviço em memória migrado para API real; emite SP/SG/SE com sequência por tipo/data; alterna SP e SE/SG com FIFO por tipo; opera três guichês; permite chamada, repetição, início, finalização e ausência confirmada após duas chamadas. Painel mostra cinco eventos efetivados. Áudio opcional e estado online em vez de mensagem de demonstração.

Layout claro/verde, responsivo; foco visível, rótulos e zoom habilitado. README mantém Membros e inclui execução. Requisitos, decisões, identidade, MER e estados UML em docs/.

## Limites

Ainda requer validação end-to-end com login e uso real em navegador para confirmar UX final, especialmente sobre sincronização de tela entre totem, atendimento e painel. O expediente continua controlado por `ALLOW_AFTER_HOURS` em ambiente local; em produção, a regra deve permanecer no relógio real. A persistência está funcional, mas não substitui checagens de fluxo completo em ambiente de testes do professor.

## Validação

A base foi validada diretamente com MySQL: tabela `guiches` e usuários padrão foram reconstituídos e o backend agora inicializa automaticamente a estrutura a partir de `backend/schema.sql`. A build do frontend ainda foi validada em ambiente local e o teste de API foi reexecutado contra `/api/tickets/emissao` e `/api/tickets/chamar-proximo`. Não presumir servidor aberto em nova sessão. Conferir Git antes de qualquer alteração e usar histórico para confirmar commits/publicação.

## Próximo passo

Validar fluxo completo no browser: login real, emissão de senha no totem, chamada no guichê, painel sincronizado e ações de status no atendimento. Depois disso, consolidar relatórios e ajustes finais de UX conforme o professor.

## Ajuste de ambiente recente

Em 04/10/2026, a inicialização do backend foi bloqueada por variável obrigatória ausente: `JWT_SECRET`. Também havia divergência entre o schema MySQL local e o esperado pelo backend. A base de desenvolvimento foi reconstruída para permitir o teste funcional; depois, o bootstrap foi ajustado para inicializar somente bases vazias e apenas validar bases existentes, sem apagá-las. Schemas antigos agora precisam de migração explícita.
