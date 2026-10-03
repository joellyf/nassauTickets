# Matriz de requisitos do frontend

Fonte: “Atividade — Projeto nassauTickets”, páginas indicadas abaixo. Requisitos são extraídos do enunciado; soluções e critérios abaixo detalham o escopo completo. Consulte IMPLEMENTACAO.md para o estado do incremento; a matriz não representa conclusão integral.

## Funcionalidades e aceite

| ID | Exigência e fonte | Interface / responsabilidade | Critério de aceite proposto |
|---|---|---|---|
| RF01 | Cliente anônimo; SP, SG e SE (pp. 3–4, 6) | Totem + API | Escolher um dos três tipos; confirmar senha retornada pela API; não solicitar identificação pessoal |
| RF02 | Padrão `YYMMDD-PPSQ`; SQ tem três dígitos, por tipo, reinício diário (p. 4) | API gera; totem apresenta | Exemplo para 03/10/2026: `261003-SP001`; sequência independente para SG e SE |
| RF03 | Alternância `[SP] → [SE|SG]` e fallback (p. 4) | Backend seleciona; atendente solicita | Cenários de filas cheias e vazias validados após resolver as ambiguidades abaixo |
| RF04 | Qualquer guichê atende qualquer tipo (p. 4) | Atendente + API | Operador de um guichê consegue atender SP, SG e SE |
| RF05 | Chamar, iniciar, finalizar e chamar novamente (p. 5) | Atendente | Botões seguem o estado retornado pelo servidor; ações inválidas não são aceitas pelo backend |
| RF06 | Ausência após duas chamadas (pp. 4–5) | Atendente + API | Registrar primeira e segunda chamadas; marcar `NÃO_COMPARECEU` conforme regra de confirmação a definir |
| RF07 | Expediente 7h–17h; concluir iniciados; descartar fila ao encerrar (p. 4) | API + telas | Aviso de encerramento; atendimento iniciado continua até conclusão; destino das senhas restantes registrado |
| RF08 | Cinco últimas senhas chamadas; não mostrar próxima (p. 5) | Painel | Exibir somente chamadas efetivadas; nunca antecipar a fila; informar guichê |
| RF09 | Máquina de estados (p. 5) | Tipos compartilhados + API | Exibir estados e transições permitidas; finalizar só atendimento iniciado |
| RF10 | Relatórios diário e mensal (pp. 5–6) | Gestor | Totais emitidos/atendidos, totais por tipo, detalhe, tempo médio e auditoria com filtros de período |
| RF11 | Detalhamento de senhas (pp. 5–6) | Relatórios | Número, tipo, emissão, atendimento e guichê; campos de atendimento vazios para não atendidas |
| RF12 | Auditoria (p. 6) | Backend registra; gestor consulta | Atendente, guichê, senha e horários das duas chamadas, início e fim |
| RF13 | Login de atendente; um atendente também gestor (p. 6) | Login e autorização | Totem anônimo; relatórios/cadastros restritos ao gestor também na API |
| RF14 | Cadastros sob responsabilidade do gestor (p. 6) | Gestão | Entidades e operações precisam ser confirmadas no documento-base |
| RF15 | Áudio com prioridade, senha e guichê; repetição com “Última chamada” (p. 6) | Painel | Cada chamada produz indicação visual e áudio; segunda chamada inclui a indicação exigida |
| RF16 | Concorrência entre atendentes (p. 6) | Backend transacional + frontend | Duas solicitações simultâneas não reservam a mesma senha para guichês diferentes |
| RF17 | Falhas do backend/banco (p. 6) | Todas as telas | Mensagem clara de indisponibilidade; estado desatualizado identificado; nenhuma emissão fictícia |
| RF18 | Proposta para acompanhar desempenho (p. 6) | Gestão | Definir indicadores e fórmula de tempo médio; diferenciar tempo em fila e tempo de atendimento |

## Requisitos transversais

| Tema | Origem | Proposta verificável |
|---|---|---|
| Acessibilidade | p. 3 | Foco visível, navegação por teclado, rótulos acessíveis, contraste medido, alvos de toque amplos e avisos que não dependem só de cor/áudio |
| Segurança e LGPD | p. 3 | Totem/painel sem dados pessoais; API autoriza operações; nenhuma credencial no repositório; retenção e acesso à auditoria definidos pela equipe |
| Disponibilidade | pp. 3, 6 | Avisar perda de conexão, oferecer reconexão e reconciliar o estado após retorno |
| Desempenho | pp. 3, 6 | Medir tempo entre comando, confirmação e atualização do painel; estabelecer metas com equipe/professor, sem inventá-las como exigência |
| Concorrência e auditoria | pp. 3, 6 | Garantias no servidor; frontend bloqueia duplo clique, mas isso não substitui atomicidade ou idempotência |
| Organização React | pp. 7–8 | Componentes, páginas e serviços separados; estado, eventos, efeitos, listas, formulários e consumo assíncrono REST demonstráveis |

## Pontos que precisam de decisão

1. **Referência disponível:** trabalhar com o PDF da atividade e confirmar com o professor os detalhes que ele não resolve; outro documento não é pré-requisito para começar.
2. **Prioridade:** a fórmula indica alternância SP/não-SP, mas o texto sobre “a cada novo atendimento” permite outra leitura. Proposta provisória: alternar globalmente uma SP com uma SE, ou SG se não houver SE; dentro do tipo, FIFO. Validar fallback, reinício diário da alternância e comportamento com vários guichês.
3. **Estados:** o diagrama coloca `CHAMADA_NOVAMENTE` antes de `EM_ATENDIMENTO`, embora o cliente possa chegar na primeira chamada. Proposta: permitir `CHAMADA → EM_ATENDIMENTO` e `CHAMADA → CHAMADA_NOVAMENTE → EM_ATENDIMENTO` ou `NÃO_COMPARECEU`.
4. **Ausência de cerca de 5%:** esclarecer se é cenário de simulação/teste. Não descartar aleatoriamente clientes reais nem marcar ausência antes das chamadas.
5. **Encerramento:** definir se a emissão é bloqueada exatamente às 17h, como tratar uma senha chamada mas não iniciada e qual estado representa descarte. `DESCARTADA` seria proposta adicional, não estado explicitamente listado no diagrama.
6. **Segunda chamada:** definir quem confirma ausência e eventual tempo de espera; não existe prazo de tolerância informado.
7. **Painel:** confirmar se a segunda chamada ocupa outra posição no histórico das cinco últimas ou atualiza a mesma senha. Confirmar necessidade de impressão do ticket; ela não está explicitamente exigida no PDF fornecido.
8. **Gestão:** confirmar cadastros exigidos, associação atendente–guichê e regras de sessão. Não criar perfis de gestor ilimitados contra a previsão de um único atendente gestor.
9. **Numeração e relógio:** definir fuso oficial, fonte do horário, tratamento após 999 senhas por tipo e exclusividade da sequência no servidor.
10. **Tempo médio:** definir população, fórmula e limites de período; proposta: média de `finalização − início` das senhas atendidas no período.

Essas pendências não impedem a organização das rotas, componentes, estados visuais e serviços simulados. Impedem tratar as regras propostas como especificação final.
