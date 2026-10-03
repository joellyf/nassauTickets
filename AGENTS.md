# nassauTickets — contexto enxuto e entregas por metas

Adaptado em 03/10/2026 das regras de contexto enxuto do projeto Cortéx, a pedido de Henry.

1. Identifique a entrega solicitada. Use o contexto válido já disponível antes de buscar mais informações.
2. Quando precisar retomar o projeto, leia `docs/contexto-atual.md` uma vez; consulte os documentos apontados apenas conforme a tarefa.
3. Antes de editar código, confirme pasta, branch e alterações existentes. Evidência atual prevalece sobre resumos; preserve o trabalho dos colegas.
4. Use buscas direcionadas com `rg`; não despeje lockfiles, dependências, builds ou logs completos no contexto.
5. Execute uma meta por vez com entrega e critério de aceite. Não reabra decisões resolvidas sem evidência nova.
6. Use ferramentas diretas quando adequadas. Subagentes apenas mediante solicitação explícita ou instrução aplicável.
7. Valide proporcionalmente: documentação não exige build; código exige as verificações pertinentes; interface exige conferir os fluxos afetados. Não repita verificações sem mudança, falha ou dúvida concreta.
8. Ao concluir mudança material, atualize `docs/contexto-atual.md` em até cerca de 350 palavras: estado, evidências datadas, limitações e próximo passo. Não confunda testes antigos com resultados atuais.
9. Prefira commits pequenos em etapas coerentes e verificadas. Não espere esgotar a sessão; deixe o estado retomável. Não afirme conhecer o saldo exato de tokens sem evidência.
10. Trabalhe em `dev`, conforme o professor, com integração posterior em `main`. Confirme o remote antes de publicar. Commit local não significa publicação no GitHub.
11. Relate resultado, validação e pendências em poucas linhas. Economia de tokens não justifica omitir requisitos ou verificações necessárias.

Esta é a cópia de implementação do nassauTickets. Repositório da equipe: https://github.com/joellyf/nassauTickets. Manter requisitos e decisões em docs/.
