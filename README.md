# nassauTickets

Sistema de Controle de Atendimento para Laboratório de Análises Clínicas. Projeto acadêmico de Mobile Coding — Alta Performance.

## Estado desta entrega

Frontend React demonstrativo: **Totem → Atendimento → Painel**, com emissão SP/SG/SE, seleção de próxima senha, segunda chamada, início, finalização e ausência confirmada. Há áudio opcional, histórico de cinco chamadas e controles para simular falha e encerramento.

**Limites:** dados fictícios em memória, compartilhados somente entre rotas da mesma aba. Recarregar apaga os dados. Não há autenticação, API, banco, sincronização entre dispositivos nem relatórios de gestor. O expediente é controlado manualmente na simulação; o relógio real ainda não bloqueia emissões. Não usar para atendimento real.

## Objetivo e arquitetura

Organizar emissão, fila e atendimento com rastreabilidade e interface acessível. O cliente usa o totem anonimamente; o atendente opera o guichê; o painel apresenta chamadas efetivadas. Nesta versão, o acesso ao atendente é aberto para demonstração.

Componentes React → hooks de estado/comandos → interface de serviço → adaptador em memória. O backend futuro será responsável por autenticação, autorização, numeração, seleção atômica, persistência, expediente e auditoria. Sua tecnologia ainda será definida e justificada pela equipe entre as opções da atividade.

## Tecnologias

React 19, TypeScript, Vite, React Router, CSS responsivo, Vitest/Testing Library e Cypress. Dependências Ionic/Capacitor da base foram preservadas; as novas telas usam componentes React e HTML sem o contêiner de abas do template. Nenhuma dependência nova é necessária para este marco.

## Instalação e execução

Ambiente validado: Node.js 24.19.0 e npm 11.17.0. Usar versão compatível com os `engines` das dependências do lockfile; não confundir o runtime do frontend com a escolha futura do backend.

```sh
git clone --branch dev https://github.com/joellyf/nassauTickets.git
cd nassauTickets/frontend
npm ci
npm run dev
```

Abra o endereço impresso pelo Vite, normalmente http://localhost:5173. Todas as instruções npm partem de `frontend/`. Não há variáveis de ambiente, credenciais ou serviços externos necessários para o mock.

```sh
npm run build
npm run lint
npm run test.unit -- --run
npm run preview
```

Para testar com Cypress, deixe `npm run dev` ativo e execute `npm run test.e2e` em outro terminal. Caso use outra porta, configure `--config baseUrl=http://127.0.0.1:5174`. A primeira execução do Cypress pode exigir download do navegador de testes.

Rotas: `/totem`, `/atendimento`, `/painel`. Em hospedagem estática futura, configurar fallback das rotas para `index.html`.

## Demonstração em uma aba

1. No Totem, emita uma senha SP e anote o número. Volte ao início para emitir SG/SE.
2. Abra Atendimento, escolha o guichê e chame a próxima senha.
3. Abra Painel para ver número, guichê e histórico. A próxima senha nunca é antecipada.
4. Volte ao Atendimento, use Chamar novamente e confira “Última chamada” no Painel.
5. Inicie/finalize ou confirme ausência depois da segunda chamada.
6. Em “Controles da simulação”, teste falha do serviço ou encerramento. O encerramento descarta senhas não iniciadas; reabrir não recupera senhas descartadas.
7. Opcionalmente, ative o áudio no rodapé antes de chamar; ele acompanha as novas chamadas desta aba. Disponibilidade de voz depende do navegador/sistema.

## Documentação

- [Requisitos do professor e dúvidas](docs/requirements/REQUISITOS.md)
- [Decisões e escopo implementado](docs/requirements/IMPLEMENTACAO.md)
- [Guia visual](docs/branding/README.md)
- [Mockups e protótipo](docs/mockups/README.md)
- [Máquina de estados](docs/models/uml/estados.md)
- [MER proposto](docs/mer/README.md)
- [Contexto para continuidade](docs/contexto-atual.md)

## Branches e contribuição

Desenvolver em `dev`. Enviar commits pequenos e descritivos em português, revisar e integrar `dev` em `main` por merge ao concluir o marco combinado. Não reescrever o histórico da equipe. O histórico deve demonstrar esse fluxo conforme a atividade.

Repositório da equipe: https://github.com/joellyf/nassauTickets. Contribuições pelo fork de Henry devem ter `joellyf:dev` como destino do PR. A entrega acadêmica será a URL pública da equipe no Teams. A proposta de marco não equivale a uma porcentagem oficial sem os critérios do professor.

## Próximas entregas

Login real, único gestor e cadastros; integração REST; relatórios diário/mensal e auditoria persistente; concorrência transacional; atualização entre dispositivos; horários controlados pelo servidor; revisão das regras ambíguas com professor; avaliação completa de acessibilidade e desempenho.

## Licença

MIT, conforme [LICENSE](LICENSE).

## Membros
| Nome | Matrícula | Papel |
| :--- | :--- | :--- |
| Joelly Fernanda | 01781734 | Scrum Master |
| Henry Torres | 01852068 | Desenvolvedor |
| Danilo Gabriel | 01792132 | Desenvolvedor |
| Lucas Silva | 01798602 | Documentador |
| Luiz Eduardo | 01803321 | Testador |
| Laryssa Eduarda Nascimento | 01814379 | Documentador |
| Maria Eduarda Aguiar | 01781734 | Testador |
