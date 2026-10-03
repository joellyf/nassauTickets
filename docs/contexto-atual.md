# Contexto atual — nassauTickets

Atualização: 03/10/2026. Frente: frontend. Branch de desenvolvimento: dev. Repositório da equipe: joellyf/nassauTickets; origin local é o fork henryttorres, upstream é a equipe.

## Entrega implementada

React/TypeScript/Vite: rotas Totem, Atendimento e Painel, serviço em memória e interface de serviço separada. Emite SP/SG/SE com sequência por tipo/data; alterna SP e SE/SG com FIFO por tipo; opera três guichês; permite chamada, repetição, início, finalização e ausência confirmada após duas chamadas. Painel mostra cinco eventos efetivados. Áudio opcional e simulação de indisponibilidade/encerramento.

Layout claro/verde, responsivo; foco visível, rótulos e zoom habilitado. Exemplos Tab1/2/3 removidos; dependências Ionic preservadas sem importação nas telas novas.

README mantém Membros e inclui execução. Requisitos, decisões, identidade, capturas, MER proposto e estados UML em docs/. AGENTS.md orienta contexto enxuto.

## Limites

Mock restrito a uma aba; recarga perde dados. Sem backend, login, autorização, persistência, relatórios ou sincronização entre dispositivos. Expediente manual, não governado pelo relógio real. Interpretações provisórias: alternância, eventos repetidos no painel e descarte de chamadas não iniciadas. Aproximadamente 5% de ausência ainda exige esclarecimento; não implementado como descarte aleatório.

## Validação

Build/lint e testes registrados em validacao-2026-10-03.md. Fluxo também verificado no Chrome; capturas reais em mockups/. Não presumir servidor aberto em nova sessão. Conferir Git antes de qualquer alteração e usar histórico para confirmar commits/publicação.

## Próximo passo

Responsável pelo backend e contrato REST a definir; confirmar regras com professor, prototipar login/gestão/relatórios e integrar autenticação/concorrência reais. Meta semanal de 40% ainda depende de critério da disciplina, não equivale a percentual comprovado.
