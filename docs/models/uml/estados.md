# Estados da senha — proposta inicial

O diagrama abaixo descreve o mock. As decisões sobre descarte e atendimento na primeira chamada estão documentadas nos requisitos.

```mermaid
stateDiagram-v2
    [*] --> EMITIDA
    EMITIDA --> AGUARDANDO: emissão confirmada
    AGUARDANDO --> CHAMADA: chamar próxima
    CHAMADA --> EM_ATENDIMENTO: cliente presente
    CHAMADA --> CHAMADA_NOVAMENTE: repetir chamada
    CHAMADA_NOVAMENTE --> EM_ATENDIMENTO: cliente presente
    CHAMADA_NOVAMENTE --> NAO_COMPARECEU: confirmar ausência
    EM_ATENDIMENTO --> ATENDIDA: finalizar
    AGUARDANDO --> DESCARTADA: encerrar expediente
    CHAMADA --> DESCARTADA: encerrar expediente
    CHAMADA_NOVAMENTE --> DESCARTADA: encerrar expediente
    ATENDIDA --> [*]
    NAO_COMPARECEU --> [*]
    DESCARTADA --> [*]
```

NAO_COMPARECEU representa o valor NÃO_COMPARECEU usado no código. EMITIDA é transitório; não permanece em uma lista intermediária no mock.
