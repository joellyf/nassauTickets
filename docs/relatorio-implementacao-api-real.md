# Relatório de implementação — API real

Data: 04/10/2026 | Branch: `dev`

## Objetivo

Conectar as telas Totem, Atendimento e Painel ao backend REST com persistência MySQL e validar o fluxo de atendimento em execução local.

## O que foi feito

- Implementado backend Express com autenticação, validação de requisições, regras de fila, transações MySQL, auditoria, relatórios e rotas de saúde.
- Substituído o serviço em memória do frontend por um adaptador HTTP para emissão, chamada, atualização de status e consulta periódica do snapshot.
- Implementada inicialização do schema em bancos vazios. Em bancos já existentes, o startup valida tabelas e colunas necessárias sem apagar dados; divergências exigem migração explícita.
- Atualizado o script de seed para preparar os três guichês e usuários acadêmicos padrão.
- Removida da interface a mensagem que identificava a experiência como demonstração local.

## Validação

- `npm run build` no frontend: concluído com sucesso.
- `GET /api/health`: HTTP 200, com conexão MySQL operacional.
- Fluxo no navegador: emissão de `261004-SG001`, chamada no guichê 01, início e finalização do atendimento; senha exibida no Painel com guichê correspondente.
- Inicialização/validação do bootstrap contra o schema local: concluída sem remover tabelas existentes.
- `npm test` no backend: comando concluído, mas o projeto não possui testes automatizados (`0` testes encontrados).

## Limitações e observações

- A interface ainda usa o identificador de atendente de demonstração; a tela de login não está integrada ao fluxo do frontend.
- A validação ponta a ponta foi manual em ambiente local, não em ambiente de produção.
- Durante o reparo do schema local, a base `nassautickets` foi reconstruída e os registros da tabela antiga não foram preservados. A base alternativa local verificada não continha tickets. O bootstrap foi posteriormente alterado para nunca descartar tabelas existentes.
- As credenciais de demonstração devem ser trocadas antes de qualquer uso fora do ambiente acadêmico.