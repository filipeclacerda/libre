# Changelog

Todas as mudanças notáveis deste projeto são documentadas aqui.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/),
e o projeto segue [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [1.1.0] - 2026-06-21

Primeira grande atualização pós-lançamento: correção de bugs que geravam más
avaliações, ativação das alavancas de retenção/ASO e abertura para novos mercados
(moeda configurável + Espanhol).

### Adicionado
- **Espanhol (es)** como terceiro idioma, com detecção automática pelo locale do
  dispositivo e seletor manual em Configurações (PT / EN / ES).
- **Moeda configurável**: detecção automática no onboarding via locale e edição
  manual em Configurações. Todos os valores monetários agora usam o símbolo e o
  formato corretos (fim do "R$" fixo no inglês).
- **Etapa de notificações no onboarding** (passo 5/5) com *opt-in* suave, pedindo
  permissão para lembretes que ajudam a manter o foco.
- **Orquestrador de notificações** (`syncNotifications`): mensagem motivacional
  diária, próximos 1–3 marcos de tempo/saúde e alerta no horário mais comum de
  fissura (a partir de 5 registros no diário).
- **Pedido de avaliação na loja** (`expo-store-review`) disparado uma única vez no
  pico emocional, ao fechar a celebração de uma conquista.
- **Compartilhamento de conquista**: gera um card de imagem e abre a folha de
  compartilhamento do sistema (`react-native-view-shot` + `expo-sharing`).
- **Persistência dos gatilhos** escolhidos no onboarding, pré-selecionados no
  diário e na tela de SOS.
- Helpers internos: `src/lib/format.ts` (formatação de moeda via `Intl`),
  `src/lib/healthMilestones.ts` (marcos de saúde compartilhados) e
  `src/constants/triggers.ts` (gatilhos canônicos).

### Corrigido
- **Recaída não apaga mais as conquistas**: registrar uma recaída deixou de
  resetar os badges, eliminando a enxurrada de pop-ups de celebração ao voltar
  para a Home.
- **Crash no Expo Go (Android)**: `expo-notifications` lançava erro já na
  importação (auto-registro de push token removido do Expo Go no SDK 53),
  derrubando o app inteiro. O módulo agora é carregado de forma preguiçosa e
  ignorado no Expo Go Android, onde as notificações exigem um *development build*.
- Idioma de notificação e formatação de datas/moeda agora respeitam o idioma
  ativo do app.

### Alterado
- **Performance da Home**: o cronômetro vivo foi isolado em um subcomponente
  (`LiveTimer`) que atualiza a cada segundo, enquanto as métricas da jornada
  passam a recalcular a cada 60s e ficam memoizadas — bem menos re-renders.
- Cabeçalho do onboarding internacionalizado e atualizado para 5 etapas.
- Rótulos de categorias em Configurações passaram a usar i18n.
- `app.json`: adicionados `ios.config.usesNonExemptEncryption: false` e
  `description`; registrado o plugin do `expo-sharing`.

### Removido
- **Campo de e-mail no onboarding**, alinhando o app à política de privacidade
  (nenhum dado pessoal é coletado).
- Arquivos mortos do template (`App.tsx`, `index.ts`) — o entry real é
  `expo-router/entry`.

[1.1.0]: https://github.com/filipelacerda/libre/releases/tag/v1.1.0
