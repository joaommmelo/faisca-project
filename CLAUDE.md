# Faísca — contexto do projecto

Este ficheiro é a fonte de verdade para quem trabalha neste repositório: o briefing original de marca e de produto, o pedido da v2 e as decisões tomadas com o dono do projecto, o que está feito e as convenções de código. Lê-o todo antes de mexer no projecto e actualiza-o quando o estado mudar.

## Estado actual (v2, 21 de Outubro de 2026)

A v1 (só multiplicação) está na `main`. A v2 está na branch `v2`, ainda por juntar à `main`.

**Feito e verificado na v2:**

- Quatro operações no menu principal: Soma, Subtração, Multiplicação (como na v1) e Divisão (só dentro das tabuadas).
- Soma e subtração por dificuldade (Fácil até 20, Médio até 100, Difícil até 1000), com tipos de competência (transporte e empréstimo), em resposta directa ou na vertical.
- Conta na vertical com cursor da direita para a esquerda, linha de marcas não validada e feedback por coluna.
- Segunda tentativa antes de mostrar a resposta; níveis que abrem competências mais difíceis; desbloqueio por convite; rede de segurança; mealheiro com moedas e ajudas graduadas.
- Dados na versão 2, com migração da v1 testada (caixas, tabuadas, modo e estatísticas mantêm-se). Dados de uma versão mais nova nunca são reescritos. Aviso no ecrã inicial quando o browser não guarda.
- PWA instalável (manifest, ícones, service worker) a funcionar sem rede; build em `docs/` para o GitHub Pages.
- 167 testes unitários (Vitest) a passar; `tsc` e `oxlint` limpos.
- Testado num Chrome headless a 360, 390 e 820 px, sem erros na consola nem scroll horizontal: todas as operações, a vertical com ajuda e empréstimo através do zero, os marcos, o convite de desbloqueio, a rede de segurança, a migração da v1 e o arranque sem rede.

**À espera de decisão do dono do projecto:**

- Juntar a `v2` à `main` (e a partir daí publicar a v2).
- Ortografia: os modos dizem «Só directas» e «Directas + inversas», como no briefing. A escola segue o Acordo Ortográfico («diretas»). Mudar é só em `Messages.getModeLabel` (`src/utils/messages.ts`).
- Mascote: é um cão castanho genérico. Se chegar uma fotografia do cão real, ajustar `src/components/Mascot.tsx`, `public/favicon.svg` e os ícones em `public/icons/` às características dele.
- Visibilidade do repositório: está privado. O GitHub Pages num repositório privado exige GitHub Pro. Com o repositório público (ou Pro): *Settings → Pages → Deploy from a branch*, branch com o build, pasta `/docs`.
- Autoria dos 8 primeiros commits: estão com o email da conta de trabalho (`jmelo-catappult`). Passá-los para a conta pessoal implica reescrever o histórico já publicado (force push). Só com autorização explícita.

## Comandos

```bash
npm install
npm run dev          # servidor local (http://localhost:5173); `-- --host` para abrir no tablet
npm test             # Vitest, uma vez
npm run test:watch
npm run build        # tsc -b + vite build → docs/ (é o que o GitHub Pages publica)
npm run preview      # serve o build de docs/, com o service worker activo
npm run lint         # oxlint
```

`tsc` e os testes são o critério de correcção: correr ambos antes de cada commit. O build é feito localmente e a pasta `docs/` vai no commit; o GitHub Pages serve-a tal como está, por isso é preciso voltar a correr `npm run build` e fazer commit de `docs/` sempre que a app muda.

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

## Pedido da v2 (resumo) e decisões do dono do projecto

O pedido original da v2 está resumido aqui; as respostas do dono do projecto (21 de Outubro de 2026) mudaram algumas regras e prevalecem sobre o pedido.

### Pedido

- Público dos 6 aos 9 anos, usado só pela criança, sem área de pais nem PIN.
- Menu com quatro operações, cada uma com a sua prática e o seu resumo de progresso, por perfil. A multiplicação mantém o comportamento da v1.
- Soma e subtração: dificuldades Fácil (até 20), Médio (até 100) e Difícil (até 1000); as por desbloquear aparecem com cadeado, como objectivo. A criança escolhe o formato: só o resultado ou conta na vertical. O motor escolhe os tipos de pergunta pelas competências mais fracas, sem controlo manual.
- Regras: subtração nunca negativa, divisão sempre exacta, sem perguntas repetidas seguidas.
- Vertical: números um por baixo do outro, operador à esquerda, linha, uma célula por dígito preenchida da direita para a esquerda com o cursor a avançar sozinho, linha para o «e vai 1» e o empréstimo (visível e não validada), teclado próprio da v1, feedback por coluna.
- Progresso por competência na soma (sem transporte, transporte numa coluna, transporte em cadeia) e na subtração (sem empréstimo, com empréstimo, empréstimo através do zero). A divisão dentro das tabuadas usa as caixas da multiplicação. Uma pergunta com ajuda não conta e fica registada como ajudada.
- Níveis por operação e dificuldade (a multiplicação tem um só), 20 + 10 × N respostas para sair do nível N, com tecto. Desbloqueio: 15 certas nas últimas 20 escritas ou verticais, sem ajuda, com pelo menos 10 perguntas diferentes, com convite que a criança aceita ou adia. Rede de segurança: menos de 5 certas nas últimas 10 propõe a dificuldade anterior, sem perder nível nem moedas.
- Moedas: 1 por cada 5 certas, sem ajuda, com o contador a nunca descer; máximo de 5, num mealheiro. Cada ajuda custa 1 moeda, com limite por sessão, nunca na escolha múltipla. Ajudas graduadas: na vertical, realçar a coluna, mostrar o transporte ou empréstimo e só no fim o dígito; na multiplicação, um facto vizinho que a criança já saiba.
- Visual vibrante, contraste AA, certo e errado distintos também por ícone, forma e movimento; animações só em CSS (`transform` e `opacity`), no máximo 1 s por resposta, tocar salta; festas maiores só em marcos; erro sem abanar nem vermelho forte; `prefers-reduced-motion` respeitado; sem sons.
- Armazenamento em `localStorage` atrás de uma camada própria, pedido de armazenamento persistente, aviso quando não guarda, PWA instalável e offline, migração da v1 sem perder progresso, sem exportação.
- Fora de âmbito: multiplicação e divisão na vertical, decimais, fracções, contas online, sons, rankings, exportação, área de pais.

### Decisões do dono do projecto

- **O Faísca fica sempre**, e é masculino («o Faísca»).
- **Moedas:** começa-se com 3. Ganham-se em todas as dificuldades (não só na mais alta). A escolha múltipla conta metade: são precisas 10 certas em escolha múltipla para uma moeda, contra 5 escritas ou na vertical.
- **Os níveis tornam as perguntas mais difíceis:** em cada dificuldade, o nível 1 só tem o tipo mais fácil e cada nível abre o tipo seguinte (por exemplo, no Difícil da soma: nível 1 sem transporte, nível 2 com transporte numa coluna, nível 3 em cadeia). O motor reforça os mais fracos entre os tipos abertos.
- **Num erro, tenta-se antes de ver:** à primeira falha o Faísca diz «Quase! Tenta outra vez.» sem mostrar a resposta (na vertical realça as colunas erradas; na escolha múltipla risca a opção escolhida). À segunda mostra a resposta certa. Só a primeira tentativa conta.
- **Divisão só dentro das tabuadas:** é o inverso das tabuadas de 1 a 12 (até 144 ÷ 12), escolhida por tabuadas como a multiplicação, sem Fácil/Médio/Difícil. Os números maiores ficam para quando houver contas na vertical para a multiplicação e a divisão.
- **Teclado até 4 dígitos** (1000 no Difícil).
- **Build local para `docs/`**, servido pelo GitHub Pages a partir da branch; sem workflow de Actions.

---

## Como está implementado

### Estrutura

```text
src/
  utils/                    lógica pura, sem React; cada pasta tem utils.ts + utils.test.ts
    operations/             OperationsUtils: as quatro operações, símbolo, cálculo
    difficulties/           DifficultiesUtils: Fácil/Médio/Difícil, limites, mínimo de cada número
    arithmetic/             ArithmeticUtils: colunas, transportes, empréstimos, tipos de competência, gerador
    random/                 RandomUtils: shuffle, moeda ao ar, inteiro num intervalo, sorteio ponderado
    facts/                  FactsUtils: factores 1–12, 78 factos, id "3x7", tabuadas por defeito
    leitner/                LeitnerUtils: caixas 1–5 de factos e de competências, peso de sorteio
    questions/              QuestionsUtils: perguntas das quatro operações, formato, retry
    distractors/            DistractorsUtils: 3 distratores + resposta, baralhados
    session/                SessionUtils: criar, duas tentativas, ajuda, avançar, resumo
    levels/                 LevelsUtils: níveis, pontos e últimas respostas por operação e dificuldade
    wallet/                 WalletUtils: o mealheiro (moedas e progresso até à próxima)
    progression/            ProgressionUtils: aplicar uma resposta, fim de sessão, desbloqueio, rede de segurança
    helps/                  HelpsUtils: quando há ajuda, passos na vertical, facto vizinho
    vertical/               VerticalUtils: colunas da conta e o que a criança já escreveu
    stats/                  StatsUtils: jogos, dias de prática, dias seguidos (moment)
    progress/               ProgressUtils: domínio 0–5 de factos e competências, contas dominadas
    profiles/               ProfilesUtils: AppData, perfis, definições por operação, validação do nome
    storage/                StorageUtils: load/save no localStorage, migração da v1, persistência
    keypad/                 KeypadUtils: regras do valor escrito no teclado
    time/                   TimeUtils: formatar o tempo do cronómetro (moment)
    messages.ts             Messages: as frases do Faísca que reagem à criança
  components/               Mascot, Logo, Icons, Celebration, OperationPicker, SegmentedField, TablesPicker,
                            SwitchField, PiggyBank, LevelMeter, Equation, ChoiceOptions, NumericKeypad,
                            KeypadAnswer, VerticalAnswer, VerticalProblem, HelpButton, HintBubble,
                            TryAgainNote, FeedbackSheet, Stopwatch, ProfileForm, ProgressMap, sparkPath.ts
  screens/                  WelcomeScreen, HomeScreen, SessionScreen, SummaryScreen, ProgressScreen
  hooks/useFocusOnMount.ts  foco no título ao abrir um ecrã (leitores de ecrã)
  test/                     random.ts (PRNG com semente, mulberry32) e profiles.ts (perfil de teste)
  App.tsx                   estado da app (AppData) e navegação por `view`, sem router
  index.css                 tokens de cor e espaçamento e todos os estilos
pwa/service-worker.js       modelo do sw.js; o plugin em vite.config.ts preenche a lista de ficheiros
public/                     favicon, manifest.webmanifest, icons/ (any, maskable, Apple), .nojekyll
docs/                       o build, publicado pelo GitHub Pages (não editar à mão)
```

`App.tsx` guarda o `AppData` e grava-o no `localStorage` sempre que muda, se o armazenamento estiver disponível e os dados não forem de uma versão mais nova. A navegação é um `useState<View>` (`home`, `session`, `summary`, `progress`), sem router, por isso o build funciona em qualquer subcaminho (`base: "./"` no Vite). Sem perfis aparece o `WelcomeScreen`.

Cada pergunta tem a forma `left (operador) right = result`, com `kind` a dizer qual dos termos se pede, `boxKey` (o facto ou a competência que treina) e `trackId` (onde contam os níveis: `"addition:easy"`, `"multiplication"`).

### Regras do motor (como estão implementadas)

| Regra | Valor | Onde |
| --- | --- | --- |
| Perguntas por sessão | 10; × e ÷ sorteadas sem repetição; + e − sem repetir pergunta na sessão | `SessionUtils.getQuestionsPerSession()` |
| Dificuldades | Fácil: resultado (soma) ou número de partida (subtração) até 20, números ≥ 1. Médio: de 21 a 100, números ≥ 10. Difícil: de 101 a 1000, números ≥ 100 | `DifficultiesUtils` |
| Subtração | o número tirado é sempre menor: resultado ≥ 1 | `ArithmeticUtils.generate` |
| Competências da soma | sem transporte (0), numa coluna (1), em cadeia (2 ou mais transportes, só no Difícil) | `ArithmeticUtils.classify` |
| Competências da subtração | sem empréstimo, com empréstimo, através do zero (pedir a um 0, como em 403 − 127; só no Difícil) | `ArithmeticUtils.classify` |
| Gerador | sorteia números dentro da dificuldade até acertar no tipo pedido | `ArithmeticUtils.generate` |
| Tipos abertos | o nível N abre os N primeiros tipos da dificuldade | `ArithmeticUtils.getOpenSkills` |
| Sorteio do tipo | peso `1 / caixa` da competência, entre os abertos | `SessionUtils` |
| Caixa de um facto (×, ÷) | certo → sobe uma (máx. 5); errado → volta à 1 (como na v1) | `LeitnerUtils.applyAnswer` |
| Caixa de uma competência (+, −) | certo → sobe uma; errado → desce só uma | `LeitnerUtils.applySkillAnswer` |
| Divisão | dividendo = produto de um facto das tabuadas escolhidas; divisor = um dos factores; treina a caixa desse facto | `QuestionsUtils.buildDivision` |
| Formato | vertical se a criança a escolheu (+, −); senão caixa ≥ 3 → teclado, abaixo → escolha múltipla | `QuestionsUtils` |
| Tentativas | 2; a primeira falha só diz «tenta outra vez»; a segunda mostra a resposta | `SessionUtils.getAttemptsPerQuestion()` |
| O que conta | só a primeira tentativa, sem ajuda e fora das repetições | `SessionUtils.countsForProgress`, `isFirstTryCorrect` |
| Repetição de um erro | uma vez, 3 perguntas depois; um erro na última pergunta fica para a próxima sessão (nunca a mesma pergunta seguida) | `SessionUtils.scheduleRetry` |
| Pontos | escrita ou vertical certa = 2; escolha múltipla certa = 1 | `LevelsUtils.getPointsForAnswer` |
| Níveis | sair do nível N pede 20 + 10 × N respostas escritas certas (o dobro em escolha múltipla), no máximo 100 | `LevelsUtils.getPointsToLevelUp` |
| Desbloqueio | na dificuldade mais alta aberta, com todos os tipos abertos: 15 certas nas últimas 20 escritas ou verticais, ≥ 10 perguntas diferentes. Desbloqueia logo; o convite só decide se se joga já | `ProgressionUtils.getUnlockableDifficulty`, `finishSession` |
| Rede de segurança | fora do Fácil: menos de 5 certas nas últimas 10 (qualquer formato) e pelo menos 10 respostas desde a última proposta | `ProgressionUtils.getSafetyNetDifficulty` |
| Moedas | 3 no início; 1 por cada 10 pontos (5 escritas ou 10 de escolha múltipla), em qualquer dificuldade; máximo 5; com o mealheiro cheio o progresso espera, completo, e a moeda entra quando se gasta outra | `WalletUtils` |
| Ajudas | 1 moeda por pergunta (os passos seguintes na mesma pergunta são grátis), no máximo 3 por sessão; na vertical (+, −) e no teclado (×, ÷); nunca na escolha múltipla nem no «só o resultado» de + e − | `HelpsUtils` |
| Ajuda na vertical | na coluna do cursor: realçar → marcas (o 1 que veio de trás; o empréstimo até ao vizinho que empresta) → dígito | `HelpsUtils.getVerticalSteps`, `VerticalUtils.getHelpMarkColumns` |
| Ajuda no × e ÷ | o facto vizinho (move o número escondido ±1) que está na caixa mais alta | `HelpsUtils.getNeighbourFact` |
| Vertical | soma com uma célula a mais à esquerda (não denuncia o transporte); confirmar pede dígitos seguidos desde as unidades; célula vazia à esquerda vale 0 | `VerticalUtils` |
| Distratores (+, −) | ±1, ±10, cada coluna sozinha (esquecer o transporte; tirar o menor do maior), dígitos trocados | `DistractorsUtils` |
| Distratores (×, ÷) | como na v1; a divisão usa os da resposta-factor (±1 e o número mostrado) | `DistractorsUtils` |
| Teclado | até 4 dígitos (1000); um «0» isolado é substituído | `KeypadUtils` |
| Dias seguidos | +1 em dias consecutivos; só aparece se o último dia for hoje ou ontem | `StatsUtils` |
| Contador de jogos | só conta sessões terminadas; caixas, níveis e moedas gravam-se a cada resposta | `ProgressionUtils.finishSession` |

O factor 0 do briefing («factos com 0, 1 e 10») não existe nas tabuadas de 1 a 12, por isso só 1 e 10 têm peso reduzido.

### Decisões tomadas onde o briefing e o pedido não diziam nada

- A caixa 3 (duas certas seguidas) é o limiar para a resposta escrita, em factos e em competências.
- Uma competência agrega muitas perguntas diferentes, por isso um erro só a faz descer uma caixa (um facto continua a voltar à caixa 1).
- «Até 20» limita o resultado da soma e o número de partida da subtração; cada dificuldade começa acima do limite da anterior, para o Médio nunca repetir o Fácil.
- O nível 1 de cada dificuldade só tem o tipo mais fácil; o convite de desbloqueio só aparece quando todos os tipos dessa dificuldade estão abertos, para nenhum tipo ficar por treinar.
- A escolha múltipla também conta metade para os níveis (não só para as moedas), para quem começa em escolha múltipla não ficar parado.
- Uma pergunta acertada à segunda tentativa volta mais tarde na sessão, como um erro; uma pergunta acertada com ajuda não volta.
- Aceitar um convite (desbloqueio ou rede de segurança) começa logo um jogo nessa dificuldade; recusar não muda nada.
- Uma resposta certa avança sozinha ao fim de 1 s (`PRAISE_DISPLAY_MILLISECONDS` em `SessionScreen.tsx`), ou logo, tocando no ecrã. Uma errada e uma com marcos (moeda, nível) esperam pelo «Seguinte».
- As marcas da vertical são toques (põe e tira um «1»); na subtração a ajuda mostra o algarismo riscado e o novo valor por cima (3 → 13, 0 → 9).
- O cronómetro conta para cima e mostra o tempo no fim; nunca conta para baixo.
- Sair a meio pede confirmação («O que já fizeste fica guardado.»).
- Apagar um perfil, com confirmação, no fundo do ecrã inicial.
- Nomes de perfil: até 20 caracteres, sem repetidos (ignora maiúsculas).
- O Faísca é tratado no masculino («Eu sou o Faísca»): é um cão. Correcção do dono do projecto, a 21 de Outubro de 2026.
- O modo privado não se consegue detectar com fiabilidade (o Safari deixa escrever e apaga no fim). O aviso aparece quando escrever no `localStorage` falha de facto, ou quando os dados são de uma versão mais nova. O pedido de armazenamento persistente só é feito quando já há um perfil.

### UI, marca e acessibilidade

- **Tokens** em `:root` no `src/index.css`: fundo creme `#fff7ec`, azul `#1f5fd1` (confiança, botões principais), amarelo `#ffc83d` (energia, botão Jogar, moedas), castanhos do cão, verde para certo e tons quentes suaves (nunca vermelho) para errado. Uma cor por operação (`--op-*` e `--op-*-soft`): laranja na soma, azul-petróleo na subtração, azul na multiplicação, violeta na divisão; cada ecrã e cartão de uma operação usa `--op-ink`/`--op-soft`. Espaçamentos `--space-1` a `--space-6`. Todas as combinações de texto têm contraste ≥ 4,5:1.
- **Níveis de domínio** (`--level-0` a `--level-5`), no mapa e nas competências: cinzento → pêssego → amarelo → amarelo-esverdeado → verde-claro → verde. Legendas: Por praticar, A começar, A aprender, A melhorar, Quase lá, Dominado.
- **Tipografia:** Nunito (variável), alojada no próprio site através de `@fontsource-variable/nunito`, sem pedidos à Google (privacidade das crianças).
- **Mascote** (`Mascot.tsx`): cão castanho de orelhas caídas escuras, mancha creme na testa e no focinho, coleira azul com uma chapa em forma de faísca. Expressões: `happy` (início), `cheer` (certo, convite de desbloqueio), `encourage` (tenta outra vez, errado, rede de segurança, sair), `proud` (resumo e progresso). É sempre decorativa (`aria-hidden`); a mensagem está no balão.
- **Ecrã inicial:** perfis, mealheiro (moedas, cinco espaços e barra até à próxima), as quatro operações com um resumo de uma linha («Fácil · nível 2»), as definições da operação escolhida (dificuldade com cadeados e formato; ou tabuadas e modo), cronómetro, Jogar.
- **Certo e errado não dependem só da cor:** certo tem visto, salto do Faísca e destaque verde; a opção escolhida errada fica riscada e tracejada; a vertical realça as colunas erradas.
- **Feedback:** «Tenta outra vez» num balão junto à pergunta; o resultado final num painel fixo em baixo com o Faísca, a mensagem, os marcos e o botão «Seguinte».
- **Teclado do dispositivo nunca abre na sessão:** o teclado numérico é próprio. Um teclado físico também funciona (dígitos, Backspace, Enter).
- **Leitores de ecrã:** cada pergunta tem um título escondido lido como frase («Quanto é 52 menos 27?»), que recebe o foco a cada pergunta nova. As células da vertical dizem a casa («Casa das dezenas: 6»). O botão «Seguinte» é descrito pela mensagem. As ajudas e o «tenta outra vez» são anunciados (`role="status"`).
- **Movimento:** só `transform` e `opacity`, nada enquanto a criança pensa. Certo: o resultado cresce um pouco e o Faísca salta (menos de 1 s). Erro: a opção afunda suavemente, sem abanar. Marcos (moeda, nível, desbloqueio, fim de sessão): faíscas a subir e a moeda a rodar. Com `prefers-reduced-motion: reduce` tudo passa a um esvanecer curto e as faíscas desaparecem. Não há sons.
- **Layout:** largura máxima de 640 px e margem lateral de 16 px. Em ecrãs ≥ 600×800 a sessão fica centrada e os botões crescem. O botão Jogar fica fixo no fundo do ecrã inicial.

### Dados guardados

- Chave do `localStorage`: `faisca:data`. Forma (versão 2): `{ version: 2, profiles: Profile[], activeProfileId }`, com `Profile = { id, name, settings, boxes, skillBoxes, tracks, unlockedDifficulties, wallet, stats }`:
  - `settings = { operation, isTimerEnabled, addition: { difficulty, layout }, subtraction: { difficulty, layout }, multiplication: { tables, mode }, division: { tables } }`;
  - `boxes = { "3x7": 1..5 }` (multiplicação e divisão), `skillBoxes = { "addition:easy:carry": 1..5 }`;
  - `tracks = { "addition:easy": { level, points, recentAnswers (últimas 40), answersSinceSafetyNet } }`;
  - `unlockedDifficulties = { addition, subtraction }` (a mais alta aberta), `wallet = { coins, points }`, `stats` como na v1.
- **Migração:** os dados da v1 são convertidos em `StorageUtils.migrateFromVersionOne` (caixas, tabuadas, modo, cronómetro e estatísticas mantêm-se; a operação fica Multiplicação; começa com 3 moedas). Antes de mudar outra vez a forma dos dados é preciso subir `ProfilesUtils.getDataVersion()` **e** acrescentar a migração em `StorageUtils.load`, senão as crianças perdem o progresso.
- Dados ilegíveis recomeçam do zero. Dados de uma versão **mais nova** não são lidos nem reescritos: a app corre em memória e avisa no ecrã inicial (protege o progresso de uma versão antiga em cache).
- Se o browser bloquear o armazenamento, a app funciona só em memória e avisa no ecrã inicial.

### PWA e deploy

- `public/manifest.webmanifest` (nome, cores, `display: standalone`, ícones `any` e `maskable`), `apple-touch-icon` e meta tags do iOS em `index.html`.
- O plugin `serviceWorker()` em `vite.config.ts` escreve `sw.js` a partir de `pwa/service-worker.js`, com a lista exacta dos ficheiros do build e de `public/` e uma versão que muda quando qualquer ficheiro muda. A página vai primeiro à rede (uma versão nova aparece logo que há ligação) e usa a cópia guardada sem rede; os ficheiros com hash vêm da cache. Só é registado no build de produção (`src/main.tsx`).
- O build vai para `docs/` (`build.outDir`), com `.nojekyll`, e é publicado pelo GitHub Pages a partir da branch. `docs/` é gerado: nunca editar à mão.

### Convenções de código

Seguem as normas globais do dono do projecto (`~/.claude/CLAUDE.md`), aplicadas a um frontend:

- **Lógica fora da UI:** tudo o que decide vive em `src/utils/<feature>/utils.ts`, numa classe `<Feature>Utils` só com métodos estáticos e as interfaces da feature no mesmo ficheiro. Os componentes só mostram e chamam. Os testes ficam ao lado (`utils.test.ts`).
- **Funções puras** que devolvem estado novo (sessões, perfis, caixas, níveis, mealheiro); nada muta o que recebe. A aleatoriedade entra como `RandomSource` para os testes serem deterministas.
- **Valores de configuração** são getters estáticos (`getQuestionsPerSession()`, `getRetryGap()`, `getMaxCoins()`, `getUnlockWindow()`), não literais espalhados.
- **Listas de valores válidos** são `getValidX()` + `isValidX()` com tipos de string literal, nunca `enum` (o `tsconfig` também tem `erasableSyntaxOnly`).
- **Verificações de vazio explícitas** (`length === 0`, `=== null`, `!== undefined`), nunca por truthiness.
- **`const` inicializados com IIFE** para derivações não triviais, em vez de `let` reatribuído.
- **Datas sempre com `moment`**, nunca com contas sobre `Date`.
- **Guard clauses** e retornos cedo; tipos explícitos nas fronteiras.
- **Nada de nomes `useX` fora dos hooks:** o lint de React trata `Utils.useX` como hook (por isso `SessionUtils.registerHelp`).
- **Texto:** as frases que reagem à criança estão em `Messages` (`src/utils/messages.ts`); as etiquetas fixas dos botões ficam no componente. Tudo em PT-PT, curto, positivo e **neutro em género** para a criança (nada de «pronto/pronta», «obrigado/a»; «O teu progresso, Rita»). O Faísca é masculino.
- Código, identificadores, comentários e mensagens de commit em inglês; UI e documentação em PT-PT.

## Ideias para depois (não pedidas)

- Exportar e importar o progresso de um perfil (cópia de segurança, mudar de dispositivo sem conta).
- Multiplicação e divisão na vertical, e depois divisões com números maiores.
- Pré-visualizar no mapa as tabuadas seleccionadas.
- Sugerir, no Safari do iOS, adicionar a app ao ecrã principal: fora dele, o Safari apaga os dados de um site ao fim de 7 dias sem uso.
