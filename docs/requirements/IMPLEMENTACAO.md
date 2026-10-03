# Decisões do primeiro incremento — 03/10/2026

## Implementado no mock

- Numeração YYMMDD-PPSQ (SQ com três dígitos), sequência por tipo e data local do navegador. Limite de 999 por tipo/dia gera erro; próximo dia reinicia a contagem.
- Estado EMITIDA é transitório na operação de emissão; a senha confirmada é registrada como AGUARDANDO.
- Seleção global alterna uma SP com SE/SG; SE tem preferência sobre SG; FIFO dentro do tipo. Fila disponível é usada no fallback. Esta interpretação precisa de aceite do professor.
- Três guichês demonstrativos, qualquer tipo em qualquer guichê. Guichê ocupado não recebe outra senha.
- Atendimento pode começar na primeira ou segunda chamada. Terceira chamada é bloqueada. Ausência precisa de duas chamadas e confirmação humana; não há descarte aleatório de 5%.
- O painel mostra cinco eventos de chamada, incluindo repetições; essa interpretação de histórico precisa ser confirmada. Não mostra a próxima senha.
- Encerramento manual: bloqueia emissão/chamada, descarta fila e chamadas não iniciadas, permite finalizar atendimentos iniciados. DESCARTADA é extensão proposta ao diagrama do PDF.
- Comandos assíncronos, estados de erro/carregamento, bloqueio de duplo clique e validação das transições no serviço. Áudio opcional informa serviço/senha/guichê e “Última chamada”.

## Limites e pendências

O mock não é servidor, nem substitui autenticação/autorização, idempotência remota ou transações. A execução sequencial de JavaScript impede duplicações nos testes desta instância; isso não comprova concorrência real entre clientes. Não há persistência ou estado compartilhado entre abas. Sessões muito longas não encerram automaticamente ao trocar o dia. O relógio e o expediente reais pertencem ao futuro backend.

Login, gestor, cadastros, relatórios e auditoria consultável não estão implementados. Horários das operações são armazenados no mock para futura integração, mas não constituem trilha de auditoria com identidade autenticada. Os 5% de ausência precisam ser esclarecidos como cenário de simulação, sem afetar clientes arbitrariamente.

## Contrato futuro

A interface TicketService separa páginas do adaptador. Combinar com backend: emissão idempotente, chamada atômica, comandos de transição, snapshot do painel, sessão, relatórios e erros. O servidor deve validar todas as ações independentemente dos botões habilitados. Adicionar carregamento inicial, reconexão e eventos/polling quando existir API.
