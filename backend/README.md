# nassauTickets — Backend

Backend REST para o frontend React do projeto acadêmico nassauTickets.

## Stack

- Node.js LTS / ESM
- Express
- MySQL 8
- mysql2/promise
- Zod
- JWT + bcryptjs
- Helmet + CORS + express-rate-limit
- Pino HTTP

## Arquitetura

```text
src/
├── config/          # ambiente e pool MySQL
├── controllers/     # HTTP
├── middlewares/     # autenticação, validação e erros
├── models/          # SQL/repositórios
├── routes/          # contrato REST
├── services/        # regras de negócio e transações
└── utils/           # erros, datas e mapeamento
server.js
schema.sql
```

## Instalação

1. Instale Node.js LTS e MySQL 8.
2. Entre em `backend/`.
3. Execute `npm install`.
4. Crie `.env` a partir de `.env.example`.
5. Crie o banco:

```bash
mysql -u root -p < schema.sql
```

6. Gere os usuários de demonstração:

```bash
node scripts/seed.js
```

7. Inicie:

```bash
npm run dev
```

API: `http://localhost:3001`.

## Usuários de demonstração

- `atendente@nassau.com` / `123456`
- `gestor@nassau.com` / `123456`

Troque essas credenciais antes de qualquer uso fora do ambiente acadêmico.

## Rotas principais

| Método | Rota | Acesso |
|---|---|---|
| GET | `/api/health` | público |
| POST | `/api/auth/login` | público |
| GET | `/api/auth/me` | autenticado |
| POST | `/api/tickets/emissao` | público / totem |
| POST | `/api/tickets/chamar-proximo` | atendente/gestor |
| PATCH | `/api/tickets/:id/status` | atendente/gestor |
| GET | `/api/tickets/painel` | público |
| GET | `/api/tickets/snapshot` | público |
| GET | `/api/relatorios?period=day` | gestor |
| GET | `/api/relatorios?period=month` | gestor |

### Emissão

```json
POST /api/tickets/emissao
{
  "tipo": "SP"
}
```

Retorna, por exemplo:

```json
{
  "id": "261004-SP001",
  "type": "SP",
  "status": "AGUARDANDO",
  "issuedAt": "..."
}
```

### Chamar próxima

```http
Authorization: Bearer <token>
```

```json
POST /api/tickets/chamar-proximo
{
  "guiche_id": 1
}
```

A seleção é feita dentro de transação com `FOR UPDATE`. A regra implementada é SP ↔ não-SP; entre não prioritárias, SE antes de SG e FIFO por tipo.

### Alterar estado

```json
PATCH /api/tickets/123/status
{
  "acao": "recall"
}
```

Ações: `recall`, `start`, `finish`, `absent`.

O servidor não confia no frontend: toda transição é validada novamente.

## Concorrência

A emissão usa `sequencias_diarias` com linha bloqueada por data/tipo. A chamada usa `controle_fila` + seleção de ticket com `FOR UPDATE`, tudo dentro de uma transação MySQL.

Assim, dois guichês concorrentes não devem reservar a mesma senha.

## Integração com o frontend

O frontend original usa `MockTicketService`. Nesta entrega, `frontend/src/services/ticketService.ts` foi substituído por um adaptador REST e `useTickets.ts` passou a atualizar o snapshot da API periodicamente.

Para a demonstração existente, o adaptador usa `VITE_API_URL` e `VITE_ATENDENTE_ID`. Para produção acadêmica, recomenda-se substituir o ID fixo pelo usuário autenticado via `/api/auth/login`.

Exemplo de `.env` do frontend:

```env
VITE_API_URL=http://localhost:3001/api
VITE_ATENDENTE_ID=1
```

## Observação

O documento do projeto identifica algumas decisões ainda pendentes com o professor, especialmente detalhes de alternância, encerramento e gestão. A implementação segue as decisões do incremento de 03/10/2026 e mantém `DESCARTADA` como extensão do modelo.


### Integração com o frontend atual

O frontend entregue originalmente ainda não possui uma tela de login. Por isso, o adaptador REST envia `atendente_id` (por padrão `1`) nas operações de guichê. O backend valida se esse usuário existe e está ativo. A autenticação JWT já está implementada em `/api/auth/login` e pode ser usada assim que a tela de login for integrada.

Não trate o modo por `atendente_id` como autorização suficiente em produção.
