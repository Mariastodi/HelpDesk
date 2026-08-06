# GPM Desk

Aplicativo mobile de abertura e acompanhamento de chamados, desenvolvido com React Native, Expo e TypeScript.

## Funcionalidades

- Seleção e redefinição de ambiente
- Login mockado com JWT e sessão local com expiração
- Listagem de chamados com busca, filtros, ordenação e indicadores de SLA
- Monitoramento do consumo de horas de suporte
- Abertura de chamado com fotos da câmera ou galeria e documentos PDF, XLS e XLSX
- Detalhes do chamado com fluxo de atendimento, histórico e visualização de anexos
- Cache local de chamados e sessão com AsyncStorage
- Menu lateral com informações, ajuda, suporte via WhatsApp, troca de ambiente e saída

## Execução

```bash
npm install
npm start
```

Para executar diretamente em um emulador:

```bash
npm run android
npm run ios
```

No modo mockado, qualquer usuário é aceito e a senha é `1234`.

## Validação

```bash
npm run typecheck
npm run lint
npx expo-doctor
```

## Estrutura

```text
src
├── core
│   ├── components
│   ├── config
│   ├── contexts
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
    └── help-desk
        ├── components
        ├── enums
        ├── repository
        ├── routers
        ├── screens
        └── utils
```

## Configuração de integração

O aplicativo está preparado para integração HTTP, mas usa repositórios mockados enquanto as rotas definitivas do backend não estiverem disponíveis. Essa seleção fica centralizada em `src/core/config/app-config.ts`.

Os endereços da API em `src/core/services/api/client.ts` são provisórios e devem ser substituídos pelos endpoints oficiais antes da publicação.
