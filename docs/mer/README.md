# MER inicial — proposta para revisão com backend

Não há banco implementado. Validar este modelo com a equipe, inclusive estratégia de sequência diária, autorização e auditoria.

```mermaid
erDiagram
    ATENDENTE ||--o{ EVENTO_ATENDIMENTO : executa
    GUICHE ||--o{ EVENTO_ATENDIMENTO : recebe
    SENHA ||--o{ EVENTO_ATENDIMENTO : registra
    ATENDENTE {
        bigint id PK
        string nome
        string login UK
        string senha_hash
        boolean gestor
    }
    GUICHE {
        bigint id PK
        string identificacao UK
        boolean ativo
    }
    SENHA {
        bigint id PK
        string numero UK
        string tipo
        string estado
        datetime emitida_em
    }
    EVENTO_ATENDIMENTO {
        bigint id PK
        bigint senha_id FK
        bigint atendente_id FK
        bigint guiche_id FK
        string acao
        datetime ocorrido_em
    }
```

Cliente permanece anônimo. Eventos propostos: chamada, segunda chamada, início, fim, ausência e descarte. Evento automático de descarte pode não ter atendente/guichê. A restrição de único gestor e o algoritmo atômico de numeração/fila precisam de desenho no backend; o diagrama não os resolve sozinho.
