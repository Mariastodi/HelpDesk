# GPM Desk

Aplicativo mobile para abertura e acompanhamento de chamados de suporte, desenvolvido com React Native, Expo e TypeScript.

## Funcionalidades

- Seleção e redefinição do ambiente de acesso
- Autenticação com JWT e sessão local com expiração
- Tratamento de usuários sem instituição, com uma instituição ou com múltiplas instituições
- Seleção e persistência da instituição ativa por usuário e ambiente
- Chamados e consumo de horas isolados por instituição
- Listagem de chamados com atualização manual, busca, filtros e ordenação
- Indicadores clicáveis para Em atendimento, Aguardando atendimento, Validação e Encerrado
- Busca por ID ou descrição sem diferenciação entre maiúsculas, minúsculas e acentos
- Filtros por status e período de abertura, com validação das datas informadas
- Ordenação por data de abertura, prazo de vencimento ou prioridade
- Cores de status consistentes entre indicadores e cartões
- Indicadores de SLA independentes das cores de status
- Monitoramento do consumo de horas de suporte
- Alerta demonstrativo de limite crítico de horas em uma das instituições
- Abertura de chamado com fotos da câmera ou galeria e documentos PDF, XLS e XLSX
- Transcrição de voz em português diretamente no campo de descrição
- Detalhes do chamado com fluxo de atendimento, histórico e visualização de anexos
- Persistência de sessão, instituição e chamados simulados com AsyncStorage
- Menu lateral com informações, ajuda, suporte via WhatsApp, configurações, redefinição de ambiente e saída

## Execução

Instale as dependências e inicie o Expo Dev Client:

```bash
npm install
npm start
```

Para executar diretamente em um simulador ou emulador:

```bash
npm run ios
npm run android
```

O projeto possui um modo de demonstração local. Credenciais e dados sensíveis não são publicados neste repositório.

## Validação

```bash
npm run typecheck
npm run lint
npx expo-doctor
```

Para validar a geração dos bundles:

```bash
npx expo export --platform ios
npx expo export --platform android
```

## Estrutura

```text
src
├── core
│   ├── components
│   ├── config
│   ├── contexts
│   │   ├── auth
│   │   ├── institution
│   │   ├── loader
│   │   └── toast
│   ├── enums
│   ├── routers
│   ├── services
│   └── theme
└── modules
    ├── auth
    │   ├── repository
    │   ├── routers
    │   ├── screens
    │   └── utils
    ├── help-desk
    │   ├── components
    │   ├── enums
    │   ├── repository
    │   ├── routers
    │   ├── screens
    │   ├── services
    │   └── utils
    └── institution
        ├── components
        └── repository
```

## Chamados e filtros

Os quatro indicadores superiores também funcionam como filtros rápidos:

- **Em atendimento:** chamados em atendimento
- **Aguardando:** chamados aguardando atendimento
- **Validação:** chamados aguardando validação do usuário
- **Encerrado:** chamados encerrados

Um segundo toque no indicador selecionado remove o filtro rápido. O filtro avançado permite escolher um dos status principais, a ordenação e um período de abertura. As alterações realizadas no modal somente são aplicadas após o toque em **Aplicar filtros**.

A faixa lateral de cada cartão representa o status do chamado. O ícone de relógio e seu texto representam separadamente a situação do prazo: dentro do prazo, próximo do vencimento, vencido ou concluído.

## Contexto institucional

Após a autenticação, o aplicativo consulta os vínculos do usuário:

- Sem vínculo, apresenta orientação e permite voltar ao login
- Com um vínculo, seleciona a instituição automaticamente
- Com múltiplos vínculos, solicita a escolha da instituição

A instituição selecionada é usada nas consultas, na abertura dos chamados, no consumo de horas e nas chaves de cache local. A troca de instituição limpa os dados anteriores antes de carregar o novo contexto.

## Configuração de integração

O aplicativo está preparado para integração HTTP, mas utiliza repositórios simulados enquanto as rotas definitivas do backend não estiverem disponíveis. Essa seleção fica centralizada em `src/core/config/app-config.ts`.

Os endereços presentes em `src/core/services/api/client.ts` são provisórios e devem ser substituídos pelos endpoints oficiais antes da homologação integrada ou da publicação em produção.

Antes de publicar o aplicativo em produção, também é necessário:

- Desativar o modo simulado para a build integrada
- Confirmar rotas, parâmetros, respostas e códigos de negócio com o backend
- Validar câmera, galeria, documentos, voz e links externos em aparelhos físicos
- Configurar identificadores, permissões, certificados e perfis de assinatura das plataformas
