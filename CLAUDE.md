# Faísca — contexto do projecto

Este ficheiro é a fonte de verdade para quem trabalha neste repositório: o briefing original de marca e de produto, o que está feito, as decisões tomadas e as convenções de código. Lê-o todo antes de mexer no projecto e actualiza-o quando o estado mudar.

## Estado actual (v1, 21 de Outubro de 2026)

**Feito e verificado:**

- Motor de perguntas completo e isolado da UI: 78 factos, caixas de Leitner por perfil, sorteio ponderado, perguntas directas e inversas, distratores credíveis, sessão de 10 perguntas com repetição dos erros, estatísticas (jogos, dias de prática, dias seguidos).
- UI completa: boas-vindas (primeiro perfil), início (perfis, tabuadas, modo, cronómetro, Jogar), sessão (escolha múltipla ou teclado numérico próprio, feedback do Faísca), resumo final, mapa de progresso 12×12 com legenda e estatísticas.
- Mascote em SVG com quatro expressões; identidade visual aplicada em todos os ecrãs.
- 85 testes unitários (Vitest) a passar; `tsc` e `oxlint` limpos; build de produção a funcionar na raiz e num subcaminho (GitHub Pages).
- Fluxo completo testado num Chrome headless, a 390 px (telemóvel) e 820 px (tablet), sem erros na consola nem scroll horizontal (também a 360 px).
- README em PT-PT; workflow de deploy para GitHub Pages em `.github/workflows/deploy.yml`.

**À espera de decisão do dono do projecto:**

- Ortografia: os modos dizem «Só directas» e «Directas + inversas», como no briefing. A escola segue o Acordo Ortográfico («diretas»). Mudar é só em `Messages.getModeLabel` (`src/utils/messages.ts`).
- Mascote: é um cão castanho genérico. Se chegar uma fotografia do cão real, ajustar `src/components/Mascot.tsx` (e `public/favicon.svg`) às características dele.
- Visibilidade do repositório: está privado. O GitHub Pages num repositório privado exige GitHub Pro, por isso o workflow de deploy corre só à mão (`workflow_dispatch`). Ao tornar o repositório público, activar o Pages e repor o gatilho `push` para `main`.
- Autoria dos 8 primeiros commits: estão com o email da conta de trabalho (`jmelo-catappult`). Passá-los para a conta pessoal implica reescrever o histórico já publicado (force push). Só com autorização explícita.

## Comandos

```bash
npm install
npm run dev          # servidor local (http://localhost:5173); `-- --host` para abrir no tablet
npm test             # Vitest, uma vez
npm run test:watch
npm run build        # tsc -b + vite build → dist/
npm run lint         # oxlint
```

`tsc` e os testes são o critério de correcção: correr ambos antes de cada commit.

## Repositório e git

- GitHub: `joaommmelo/faisca-project`, privado (conta pessoal, não a de trabalho). O `gh` tem sessão iniciada nesta conta.
- Identidade git **local a este repositório**: `João Melo <46906321+joaommmelo@users.noreply.github.com>`.
- O helper de credenciais também é local a este repositório (`gh auth git-credential`). **Não mexer na configuração global do git:** os repositórios de trabalho usam HTTPS com as credenciais da conta de trabalho no keychain.
- Commits pequenos, um por etapa, com mensagens em inglês e o trailer `Co-Authored-By` do Claude.

---

## Briefing de marca (original)

### Marca: Faísca

**Faísca** é uma web app educativa para crianças praticarem as tabuadas de forma divertida, autónoma e sem pressão. A mascote é um cão castanho chamado Faísca, inspirado no cão verdadeiro dos pais do dono do projecto.

### Identidade da marca

- **Nome:** Faísca
- **Mascote:** um cão castanho, simpático, expressivo e brincalhão.
- **Conceito:** aprender matemática com um companheiro que incentiva, celebra o progresso e ajuda a criança a ganhar confiança.
- **Público-alvo:** crianças dos 8 anos, podendo ser utilizada por crianças mais novas.
- **Idioma:** português europeu (PT-PT), com linguagem simples, natural, positiva e frases curtas.
- **Personalidade:** alegre, curiosa, encorajadora, paciente e divertida. Nunca infantilizada em excesso, competitiva ou julgadora.
- **Tagline provisória:** «Acende o teu talento!»

### Princípios da experiência

- Aprender a brincar, sem parecer uma ficha escolar.
- Celebrar o esforço, a aprendizagem e a evolução, não apenas as respostas certas.
- Tratar os erros como oportunidades para aprender, sem castigos, vergonha ou pressão.
- Utilizar feedback imediato, positivo e curto.
- Mostrar o progresso de forma visual e motivadora.
- Evitar cronómetros obrigatórios, rankings e mecânicas que penalizem a criança por falhar um dia.
- Priorizar a autonomia: a criança deve conseguir navegar e jogar sem ajuda constante de um adulto.

### Direcção visual

- Design alegre, acolhedor, moderno e simples.
- Formas arredondadas, elementos visuais amigáveis e ilustrações expressivas.
- A mascote deve ser um cão castanho, com uma expressão calorosa e facilmente reconhecível. Se for disponibilizada uma fotografia do cão real, utilizá-la como referência para preservar as suas características distintivas.
- Usar cores alegres com bom contraste e uma hierarquia visual clara. O azul pode transmitir confiança, o amarelo energia e os tons quentes podem remeter para a cor do cão.
- Tipografia arredondada, muito legível e adequada a crianças em idade escolar.
- Animações pequenas e recompensadoras, sem distrair do exercício.
- Evitar excesso de elementos decorativos, interfaces demasiado carregadas ou um aspecto excessivamente pré-escolar.

### Comportamento da mascote

O Faísca acompanha a criança durante a experiência:

- Quando a resposta está certa, celebra de forma breve e entusiástica.
- Quando está errada, reage com simpatia e incentiva uma nova tentativa, mostrando a resposta correcta.
- Nos ecrãs de progresso, transmite orgulho na evolução da criança.
- No final de uma sessão, felicita a criança pela prática e sugere continuar quando quiser.

A mascote deve apoiar a aprendizagem sem interromper constantemente o exercício nem ocupar demasiado espaço no ecrã.

### Tom de voz

Frases curtas e naturais em português europeu, por exemplo:

- «Muito bem!»
- «Boa! Acertaste!»
- «Quase! A resposta certa é 42.»
- «Vamos tentar outra vez?»
- «Estás a melhorar!»
- «Boa sessão! Até à próxima!»

Evitar expressões brasileiras, linguagem demasiado formal, sarcasmo, culpabilização e mensagens que associem erros a falta de inteligência.

### Regras de UX e acessibilidade

- Mobile-first e tablet-first.
- Botões grandes, com alvos tácteis de pelo menos 48 px.
- Números e enunciados grandes, com leitura imediata.
- Navegação simples, sem depender do teclado nativo do dispositivo.
- Contraste adequado, feedback compreensível e suporte básico para navegação por teclado e leitores de ecrã.
- A interface deve funcionar bem sem animações, sons ou efeitos obrigatórios.

### Contexto do produto

A app permite praticar as tabuadas de 1 a 12, com perguntas directas e inversas, escolha múltipla ou resposta através de teclado numérico próprio. Adapta o formato ao domínio de cada facto e usa repetição espaçada para reforçar os que ainda não estão consolidados. O progresso é individual por perfil e guardado localmente.

**Instrução para o desenvolvimento:** manter a identidade do Faísca consistente em todos os ecrãs e componentes. Dar prioridade à clareza, à facilidade de utilização e à motivação da criança. A marca deve estar presente nos detalhes da experiência, sem transformar cada ecrã numa ilustração nem prejudicar a rapidez dos exercícios.

---

## Especificação do produto (original)

### Objectivo

Web app em React para uma criança de 8 anos praticar as tabuadas do 1 ao 12, utilizável também por crianças mais novas. Toda a interface em português europeu (PT-PT), com linguagem simples e curta.

### Stack

- Vite + React + TypeScript, sem backend.
- Progresso guardado em `localStorage`.
- Deploy estático (Netlify ou GitHub Pages).
- Mobile-first e tablet-first: alvos tácteis grandes (mín. 48 px), tipografia grande, sem dependência do teclado nativo.

### Ecrã inicial

- Escolha de perfil por nome (vários perfis no mesmo dispositivo, cada um com o seu progresso).
- Escolha das tabuadas a praticar (selecção múltipla de 1 a 12). Por defeito: 2, 5 e 10.
- Modo «Só directas» ou «Directas + inversas».
- Botão grande «Jogar».

### Sessão

- 10 perguntas por sessão, sem cronómetro. Cronómetro opcional, desligado por defeito.
- Tipos de pergunta: directa `7 × 8 = ?`; inversas `? × 7 = 56` e `7 × ? = 56`.
- Formatos de resposta: escolha múltipla com 4 opções; resposta escrita num teclado numérico próprio no ecrã (0–9, apagar, confirmar).
- Distratores credíveis na escolha múltipla: vizinhos na tabuada (7×7, 7×9), resultado ±1, dígitos trocados. Nunca valores absurdos nem repetidos.
- Escolha do formato por facto, consoante o domínio: facto novo ou fraco → escolha múltipla; facto já dominado → resposta escrita.
- Feedback imediato: certo (positivo e curto) ou errado (mostra a resposta correcta). Um facto errado volta a aparecer mais tarde na mesma sessão.
- Ecrã final: pontuação, factos a reforçar, botão «Jogar outra vez».

### Selecção de perguntas (repetição espaçada)

- Cada facto único (a×b com a≤b, 78 factos) tem uma caixa de Leitner de 1 a 5 por perfil.
- Acertou → sobe uma caixa. Errou → volta à caixa 1.
- Peso de sorteio inversamente proporcional à caixa; factos com 0, 1 e 10 têm peso reduzido.
- A ordem dos factores (3×7 vs 7×3) é aleatória na apresentação.

### Progresso

- Mapa 12×12 onde cada célula tem cor consoante a caixa (cinzento = por praticar, até verde = dominado).
- Contador de sessões e sequência de dias (streak) leves, sem penalizações por falhar um dia.

### Qualidade

- Lógica do motor de perguntas (geração, distratores, caixas de Leitner) isolada da UI e coberta por testes unitários (Vitest).
- Acessibilidade básica: contraste adequado, navegação por teclado, `aria-label` nos botões do teclado numérico.
- README curto com como correr, testar e fazer deploy.

### Fora de âmbito (para já)

Contas online, sincronização entre dispositivos, rankings, sons, divisões como tipo de pergunta autónomo.

### Forma de trabalhar

Começar pelo motor de perguntas e testes, depois a UI da sessão, depois o mapa de progresso. Commits pequenos por etapa.

---

## Como está implementado

### Estrutura

```text
src/
  utils/                    lógica pura, sem React; cada pasta tem utils.ts + utils.test.ts
    random/                 RandomUtils: shuffle, moeda ao ar, sorteio ponderado sem reposição
    facts/                  FactsUtils: factores 1–12, 78 factos, id "3x7", tabuadas por defeito
    leitner/                LeitnerUtils: caixas 1–5, applyAnswer, peso de sorteio
    questions/              QuestionsUtils: modos, tipo de pergunta, formato, retry
    distractors/            DistractorsUtils: 3 distratores + resposta, baralhados
    session/                SessionUtils: criar, responder, avançar, posição, resumo
    stats/                  StatsUtils: jogos, dias de prática, dias seguidos (moment)
    progress/               ProgressUtils: nível 0–5 de cada célula do mapa, contas dominadas
    profiles/               ProfilesUtils: AppData, perfis, definições, validação do nome
    storage/                StorageUtils: load/save no localStorage
    keypad/                 KeypadUtils: regras do valor escrito no teclado
    time/                   TimeUtils: formatar o tempo do cronómetro (moment)
    messages.ts             Messages: as frases do Faísca que reagem à criança
  components/               Mascot, Logo, Icons, Equation, ChoiceOptions, NumericKeypad,
                            FeedbackSheet, Stopwatch, TablesPicker, ModePicker, SwitchField,
                            ProfileForm, ProgressMap, sparkPath.ts
  screens/                  WelcomeScreen, HomeScreen, SessionScreen, SummaryScreen, ProgressScreen
  hooks/useFocusOnMount.ts  foco no título ao abrir um ecrã (leitores de ecrã)
  test/random.ts            PRNG com semente (mulberry32) para testes deterministas
  App.tsx                   estado da app (AppData) e navegação por `view`, sem router
  index.css                 tokens de cor e todos os estilos
```

`App.tsx` guarda o `AppData` e grava-o no `localStorage` sempre que muda. A navegação é um `useState<View>` (`home`, `session`, `summary`, `progress`), sem router, por isso o build funciona em qualquer subcaminho (`base: "./"` no Vite). Sem perfis aparece o `WelcomeScreen`.

### Regras do motor (como estão implementadas)

| Regra | Valor | Onde |
| --- | --- | --- |
| Perguntas por sessão | 10, sorteadas sem repetição | `SessionUtils.getQuestionsPerSession()` |
| Facto nunca praticado | conta como caixa 1; no mapa é «Por praticar» (nível 0) | `LeitnerUtils.getBox`, `ProgressUtils.getLevel` |
| Certo / errado | sobe uma caixa (máx. 5) / volta à caixa 1 | `LeitnerUtils.applyAnswer` |
| Peso de sorteio | `1 / caixa`; ×0,3 se um factor for 1 ou 10 | `LeitnerUtils.getDrawWeight` |
| Formato | caixa ≥ 3 → teclado; abaixo → escolha múltipla | `QuestionsUtils.getKeypadMinBox()` |
| Modo misto | 50% directas, 25% `? × b`, 25% `a × ?` | `QuestionsUtils.build` |
| Ordem dos factores | aleatória em cada pergunta | `QuestionsUtils.build` |
| Repetição de um erro | uma vez, 3 perguntas depois (ou logo a seguir se for a última) | `SessionUtils.getRetryGap()`, `submitAnswer` |
| Repetição | não mexe na caixa e não conta para a pontuação | `SessionUtils.submitAnswer`, `getSummary` |
| Pontuação | certas à primeira, de 10 | `SessionUtils.getSummary` |
| Factos a reforçar | os errados à primeira, mesmo que a repetição tenha acertado | `SessionUtils.getSummary` |
| Distratores (directas) | vizinhos `a×(b±1)` e `(a±1)×b` com factores 1–12, ±1, dígitos trocados (só 2 dígitos, sem zero final); se faltarem, distâncias maiores | `DistractorsUtils` |
| Distratores (inversas) | resposta ±1 e o factor já mostrado, sempre entre 1 e 12; se faltarem, distâncias maiores | `DistractorsUtils` |
| Teclado | até 3 dígitos (144); um «0» isolado é substituído | `KeypadUtils` |
| Dias seguidos | +1 em dias consecutivos; só aparece se o último dia for hoje ou ontem | `StatsUtils` |
| Contador de jogos | só conta sessões terminadas; as caixas gravam-se a cada resposta | `App.tsx` |

O factor 0 do briefing («factos com 0, 1 e 10») não existe nas tabuadas de 1 a 12, por isso só 1 e 10 têm peso reduzido.

### Decisões tomadas onde o briefing não dizia nada

- A caixa 3 (duas certas seguidas) é o limiar para a resposta escrita.
- Um erro repete-se só uma vez por sessão; um segundo erro fica para as próximas sessões (o facto já está na caixa 1, por isso sai muitas vezes).
- Uma resposta certa avança sozinha ao fim de 1,5 s (`PRAISE_DISPLAY_MILLISECONDS` em `SessionScreen.tsx`); uma errada espera pelo botão «Seguinte», para dar tempo de ler a correcção.
- O cronómetro conta para cima e mostra o tempo no fim; nunca conta para baixo.
- Sair a meio pede confirmação («O que já fizeste fica guardado.»).
- Acrescentado sem estar no briefing: apagar um perfil, com confirmação, no fundo do ecrã inicial.
- Nomes de perfil: até 20 caracteres, sem repetidos (ignora maiúsculas).
- O Faísca é tratado no masculino («Eu sou o Faísca»): é um cão. Correcção do dono do projecto, a 21 de Outubro de 2026.

### UI, marca e acessibilidade

- **Tokens** em `:root` no `src/index.css`: fundo creme `#fff7ec`, azul `#1f5fd1` (confiança, botões principais), amarelo `#ffc83d` (energia, botão Jogar), castanhos do cão, verde para certo e tons quentes suaves (nunca vermelho) para errado. Todas as combinações de texto têm contraste ≥ 4,5:1.
- **Níveis do mapa** (`--level-0` a `--level-5`): cinzento → pêssego → amarelo → amarelo-esverdeado → verde-claro → verde. Legendas: Por praticar, A começar, A aprender, A melhorar, Quase lá, Dominado.
- **Tipografia:** Nunito (variável), alojada no próprio site através de `@fontsource-variable/nunito`, sem pedidos à Google (privacidade das crianças).
- **Mascote** (`Mascot.tsx`): cão castanho de orelhas caídas escuras, mancha creme na testa e no focinho, coleira azul com uma chapa em forma de faísca. Expressões: `happy` (início), `cheer` (certo, com faíscas a cintilar e um salto), `encourage` (errado e confirmação de saída, cabeça inclinada e sobrancelhas de apoio), `proud` (resumo e progresso). É sempre decorativa (`aria-hidden`); a mensagem está no balão.
- **Feedback:** painel fixo em baixo, verde-claro (certo) ou pêssego (errado), com o Faísca, a mensagem e o botão «Seguinte». A equação mostra sempre a resposta certa depois de responder.
- **Teclado do dispositivo nunca abre na sessão:** o teclado numérico é próprio. Um teclado físico também funciona (dígitos, Backspace, Enter).
- **Leitores de ecrã:** cada pergunta tem um título escondido lido como frase («Quanto é 7 vezes 8?»), que recebe o foco a cada pergunta nova. O botão «Seguinte» é descrito pela mensagem de feedback. Os botões do teclado têm `aria-label`. As células do mapa têm texto escondido («7 × 8 = 56: A aprender»).
- **Movimento:** animações só com `prefers-reduced-motion: no-preference`; tudo funciona sem elas. Não há sons.
- **Layout:** largura máxima de 640 px e margem lateral de 16 px. Em ecrãs ≥ 600×800 a sessão fica centrada e os botões crescem. O botão Jogar fica fixo no fundo do ecrã inicial.

### Dados guardados

- Chave do `localStorage`: `faisca:data`. Forma: `{ version: 1, profiles: Profile[], activeProfileId }`, com `Profile = { id, name, settings: { tables, mode, isTimerEnabled }, boxes: { "3x7": 1..5 }, stats: { sessionsCompleted, practiceDays, currentStreak, lastPracticeDay } }`.
- **Atenção:** hoje, dados ilegíveis ou de outra versão fazem a app recomeçar do zero e são reescritos. Antes de mudar a forma dos dados é preciso subir `ProfilesUtils.getDataVersion()` **e** escrever uma migração em `StorageUtils.load`, senão as crianças perdem o progresso.
- Se o browser bloquear o armazenamento, a app funciona só em memória e deixa um aviso na consola.

### Convenções de código

Seguem as normas globais do dono do projecto (`~/.claude/CLAUDE.md`), aplicadas a um frontend:

- **Lógica fora da UI:** tudo o que decide vive em `src/utils/<feature>/utils.ts`, numa classe `<Feature>Utils` só com métodos estáticos e as interfaces da feature no mesmo ficheiro. Os componentes só mostram e chamam. Os testes ficam ao lado (`utils.test.ts`).
- **Funções puras** que devolvem estado novo (sessões, perfis, caixas); nada muta o que recebe. A aleatoriedade entra como `RandomSource` para os testes serem deterministas.
- **Valores de configuração** são getters estáticos (`getQuestionsPerSession()`, `getRetryGap()`, `getDefaultTables()`), não literais espalhados.
- **Listas de valores válidos** são `getValidX()` + `isValidX()` com tipos de string literal, nunca `enum` (o `tsconfig` também tem `erasableSyntaxOnly`).
- **Verificações de vazio explícitas** (`length === 0`, `=== null`, `!== undefined`), nunca por truthiness.
- **`const` inicializados com IIFE** para derivações não triviais, em vez de `let` reatribuído.
- **Datas sempre com `moment`**, nunca com contas sobre `Date`.
- **Guard clauses** e retornos cedo; tipos explícitos nas fronteiras.
- **Texto:** as frases que reagem à criança estão em `Messages` (`src/utils/messages.ts`); as etiquetas fixas dos botões ficam no componente. Tudo em PT-PT, curto, positivo e **neutro em género** (nada de «pronto/pronta», «obrigado/a»; «O teu progresso, Rita»).
- Código, identificadores, comentários e mensagens de commit em inglês; UI e documentação em PT-PT.

## Ideias para depois (não pedidas)

- Migrações de dados versionadas (ver «Dados guardados»).
- Exportar e importar o progresso de um perfil (cópia de segurança, mudar de dispositivo sem conta).
- PWA (instalar no ecrã inicial e funcionar sem rede).
- Pré-visualizar no mapa as tabuadas seleccionadas.
