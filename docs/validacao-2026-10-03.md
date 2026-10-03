# Validação do primeiro incremento — 03/10/2026

## Ambiente

Windows, Node 24.19.0, npm 11.17.0, dependências do clone existente, Vite 8.3.2. Verificações executadas em frontend/. Não foi feita reinstalação limpa com npm ci nesta sessão; instruções de reprodução usam o lockfile existente, cujas versões não foram alteradas.

| Verificação | Resultado observado |
|---|---|
| npm run build | Aprovado após correção da tipagem no teste de interface |
| npm run lint | Aprovado |
| npm run test.unit -- --run | 14 testes aprovados em 3 arquivos |
| npm run test.e2e -- --config baseUrl=http://127.0.0.1:5174 | 1 teste aprovado, Cypress 13.17.0 / Electron 118 headless |
| Chrome, fluxo manual | Emissão SP, chamada, repetição, painel, início e finalização confirmados |
| Totem em 390 px | Conteúdo com 375 px (barra de rolagem incluída no viewport); sem excesso horizontal; captura registrada |
| Painel em 390 px | Largura de conteúdo 375 px; estado de segunda chamada confirmado pela árvore de acessibilidade |
| Teclado no Totem | Tab alcança emissão SP; foco com outline sólido observado |
| Console observado no Chrome | Consulta não retornou erros ou avisos no período observado |

## Cobertura dos testes

Numeração diária por tipo; alternância e fallback; FIFO dentro do tipo; transições inválidas; primeira/segunda chamada; horários; ausência; guichê ocupado; solicitações concorrentes no mesmo mock; histórico de cinco eventos; indisponibilidade sem mutação; encerramento; fila vazia. Teste de interface cobre duplo clique, não antecipação no painel e fluxo completo. Áudio usa síntese de voz substituída por spy: valida conteúdo e ausência de repetição por rerender, sem comprovar saída sonora real.

Cypress executou o fluxo no navegador: emissão, chamada, repetição, painel e finalização. Depois desse teste foram removidos somente exemplos não usados, corrigida tipagem do teste de interface e adicionado teste de áudio; build/lint/unitários foram executados novamente. A aplicação funcional não recebeu novas mudanças após o E2E.

## Medida do build

Na base, o JS principal moderno tinha aproximadamente 1.343 kB minificado; neste incremento, 223,49 kB (71,59 kB gzip). É medida do artefato de build local, não benchmark de tempo de resposta, carga de servidor ou pontuação Lighthouse. Dependências Ionic/Capacitor permanecem instaladas, porém não entram nas novas telas.

## Limitações da validação

Não é auditoria completa de acessibilidade, segurança, LGPD ou desempenho. Voz real, leitores de tela, todos os tamanhos/dispositivos, API, persistência e concorrência entre computadores não foram validados. A captura de página inteira falhou na ferramenta do navegador; as imagens salvas são recortes reais de viewport. Cypress emitiu aviso de base Browserslist antiga e deprecações do runtime; a execução terminou sem falhas.
