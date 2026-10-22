# Faísca — contexto do projecto

Este ficheiro é a fonte de verdade para quem trabalha neste repositório: o briefing original de marca e de produto, o pedido da v2 e as decisões tomadas com o dono do projecto, o que está feito e as convenções de código. Lê-o todo antes de mexer no projecto e actualiza-o quando o estado mudar.

## Estado actual (v2, 22 de Outubro de 2026)

A v2 foi juntada à `main` a 22 de Outubro de 2026, e o GitHub Pages passou a publicar a pasta `/docs` da `main`. A branch `v2` ficou igual à `main`.

Os sete jogos novos (ver «Jogos novos») foram juntados à `main` a 22 de Outubro de 2026, a pedido do dono, para os testar no telemóvel.

**Feito e verificado na v2:**

- Quatro operações no menu principal, mais «Misturado»: Soma, Subtração, Multiplicação e Divisão, cada uma com Fácil, Médio e Difícil. Na multiplicação e na divisão o Fácil são as tabuadas (como na v1) e o Médio e o Difícil usam números maiores.
- Soma e subtração por dificuldade (Fácil até 20, Médio até 100, Difícil até 1000), com tipos de competência (transporte e empréstimo), em resposta directa ou na vertical.
- Conta na vertical com cursor da direita para a esquerda e feedback por coluna; o «e vai 1» e o empréstimo só aparecem por cima da conta quando a ajuda os mostra.
- Segunda tentativa antes de mostrar a resposta; níveis que abrem competências mais difíceis; desbloqueio por convite; rede de segurança; mealheiro com moedas e ajudas graduadas.
- Dados na versão 9, com migração testada de todas as anteriores (v1 → v2 → v3 → v4 → v5 → v6 → v7 → v8 → v9: caixas, tabuadas, níveis, moedas, recordes e estatísticas mantêm-se). Dados de uma versão mais nova nunca são reescritos. Aviso no ecrã inicial quando o browser não guarda.
- PWA instalável (manifest, ícones, service worker) a funcionar sem rede; build em `docs/` para o GitHub Pages.
- Publicada em <https://joaommmelo.github.io/faisca-project/> (repositório público; GitHub Pages a servir a pasta `/docs` da branch `main`). Instala-se no ecrã principal: no iPhone e no iPad, Safari → Partilhar → «Adicionar ao ecrã principal»; no Android, Chrome → menu → «Instalar aplicação».
- Pedidos de 21 de Outubro, depois da v2: ecrã inicial com as operações logo no topo e a Multiplicação por defeito; moedas no canto (abrem o mealheiro); «Quem vai jogar?» no fundo; ajuda em todos os formatos (na escolha múltipla tira 2 das 4 opções); «Escrever sempre a resposta» na multiplicação e na divisão; relógio por operação, para a frente ou para trás, contra 3 minutos ou contra o recorde; recordes por categoria nas sessões perfeitas; a moeda ganha voa para o saldo. Dados na versão 3, com migração da v2 e da v1.
- Pedidos seguintes do mesmo dia (ver «Pedidos seguintes»): números maiores na multiplicação e na divisão; «Misturado» com 2, 3 ou 4 operações; início só com a escolha e um ecrã de preparação com «Mais opções»; resultado logo por baixo da conta e tudo a avançar sozinho; saída com «Sim, sair do jogo» / «Não, continuar a jogar»; relógio ligado por defeito (para a frente, meta de 3 minutos); caixas de escrever a azul; ajuda desactivada sem moedas; «Início» sempre à vista no resumo; sem as caixas do «e vai 1» na vertical. Dados na versão 4, com migração de todas as anteriores.
- Escolha múltipla nas competências (soma, subtração e × ÷ com números maiores) enquanto a criança não acerta 8 das últimas 10 respostas dessa competência, e de volta quando começa a falhar. Antes seguia a caixa da competência, que enchia num jogo e tirava a escolha múltipla para sempre.
- **Desafio sem fim**, para adultos (ver «Desafio sem fim (para adultos)»): liga-se por perfil em «Avançado», nas Definições. Perguntas seguidas, sempre escritas, cada uma com o seu tempo; a cada 5 certas sobe-se de nível, entram as outras operações, os números crescem até 7 algarismos e o tempo encurta; do nível 12 em diante fica tudo no máximo. Um erro ou o tempo a acabar terminam o desafio, e fica o recorde de certas. Não mexe no progresso da criança. Dados na versão 6.
- Pedidos de 22 de Outubro (ver «Pedidos de 22 de Outubro»): público a partir dos 4 anos; o resultado volta a uma folha fixa no fundo do ecrã, por cima do teclado ou das opções; «Seguinte ›» com seta; «Início» e «Jogar outra vez» com os mesmos cantos e com ícones (casa e ▶); o «Por desbloquear» cabe nos cartões bloqueados; «Sair» pergunta numa folha por cima do jogo escurecido, só com «Sim» e «Não» (também no desafio).
- **Seis línguas** (ver «Línguas»): português, inglês, espanhol, francês, alemão e italiano, com todo o texto da app em cada uma. A primeira vez escolhe-se pelo país (pelo fuso horário do dispositivo, sem pedidos à rede) e fica guardada; muda-se em «Língua», nas Definições e no ecrã de boas-vindas. Dados na versão 7.
- **Definições** (⚙ ao lado das moedas): «Quem vai jogar?», «Língua» e «Avançado» saíram do ecrã inicial, que fica só com o que se joga.
- **Dificuldade bloqueada:** tocar nela abre uma folha com o que falta para a abrir: onde jogar e cada passo com um visto, uma barra e quanto falta.
- **Favicon igual ao ícone da app:** o Faísca plano no quadrado amarelo, o mesmo do ecrã principal.
- **Metadados:** o nome é «Faísca · Contas», feita por João Melo, com a mesma descrição no HTML, no manifest, no `package.json` e no GitHub, e uma imagem para quando se partilha o link (ver «PWA e deploy»).
- **Descobre a conta** (ver «Descobre a conta (mini-jogo)»): um cartão na secção «Jogos» do ecrã inicial, ao lado do Misturado. Aparece um número (24) e a criança toca em dois números de 2 a 12 que, multiplicados, o dão; qualquer conta certa serve (4 × 6, 3 × 8 ou 2 × 12), e no fim o Faísca mostra as outras. 10 números das tabuadas da multiplicação, duas tentativas. Como na prática: moedas, um nível próprio, as caixas do mapa das tabuadas, jogos e dias de prática, ajuda (1 moeda: um dos números da resposta) e relógio com recordes por tabuadas. Dados na versão 8.
- **Sete jogos novos** (ver «Jogos novos (22 de Outubro de 2026)»), na secção «Jogos» do início: **Quantos são?** (contar ossos), **Amigos do 10** (quanto falta para 10, 20 ou 100), **Salta com o Faísca** (o número que falta numa sequência de saltos iguais), **Qual é o sinal?** (o sinal que falta em `6 ? 3 = 18`) e **Qual pesa mais?** (uma balança com uma conta em cada prato) partilham um motor de 10 rondas com duas tentativas, ajuda, moedas, relógio e um nível próprio que abre o tipo de ronda seguinte. A **Memória** vira cartas aos pares (ossos e o seu número, somas até 10 ou tabuadas). O **Mahjong das contas**, para adultos, liga-se em «Avançado» como o desafio. Dados na versão 9.
- 360 testes unitários (Vitest) a passar; `tsc` e `oxlint` limpos.
- Testado num Chrome headless a 360, 390 e 820 px, sem erros na consola nem scroll horizontal: todas as operações, a vertical com ajuda e empréstimo através do zero, os marcos, o convite de desbloqueio, a rede de segurança, a migração da v1 e o arranque sem rede. No desafio: até ao nível 7, a subida de nível, o tempo parado com «Sair», o fim por erro e por tempo e o recorde; a conta mais larga (7 + 7 algarismos) cabe também a 320 px. A folha do resultado (certo, errado e com moeda) em escolha múltipla, teclado e vertical, e os cartões bloqueados a 360 e 390 px. A folha do «Sair» a 360, 390 e 820 px, com toques e teclas reais: tocar fora e Escape são «Não», as teclas não chegam à resposta enquanto está aberta, e no desafio o tempo pára. As seis línguas a 360 px: início, preparação (+ e ×, com «Mais opções»), sessão, as duas folhas, progresso, desafio e resumo, sem texto a sair das caixas nem scroll horizontal; e a língua de partida com o fuso e a língua do dispositivo emulados (Lisboa com o dispositivo em inglês → português; Zurique → a do dispositivo; guardada numa viagem). No Descobre a conta: o jogo inteiro nas seis línguas a 360 px, em português a 390 e 820 px e em alemão a 320 px (a primeira escolha e o apagar, o «tenta outra vez», certo à segunda, errado duas vezes, o fim, «Sair» com «Não» e «Sim», avançar sozinho e o Jogar desligado só com a tabuada do 1), sem erros na consola nem scroll horizontal. Com moedas e progresso, nas seis línguas (de 320 a 820 px): a migração de um perfil v7 dentro da app, a ajuda (a moeda gasta e o número na primeira caixa), a moeda ganha a meio do jogo, o relógio, o primeiro recorde num jogo perfeito, o nível e o recorde no progresso, e a ajuda desligada sem moedas. Nos jogos novos, a 360 px (e o Quantos são? e o Qual pesa mais? a 820 px): cada jogo de rondas inteiro (regras, certo à primeira, errado duas vezes, a ajuda, o resultado); a Memória com ossos, somas e tabuadas, de 6 e 8 pares, a 320, 360 e 820 px (uma falha, a ajuda, o fim); o Mahjong a 360, 390 e 820 px (a dica, os pares até ao tabuleiro limpo, o resultado). E nas seis línguas a 320 px: o início, as regras e a primeira ronda de cada jogo (com a ajuda e a folha), a Memória, o Mahjong, as Definições e o progresso, sem erros na consola, sem texto a sair das caixas e sem scroll horizontal.

**À espera de decisão do dono do projecto:**

- Línguas: as traduções não foram revistas por quem as fala; vale a pena alguém nativo jogar um pouco em cada uma. Escolhas a confirmar: no inglês a ajuda chama-se «Hint»; o empréstimo da subtração ficou «retenue» no francês e «préstamo» no espanhol, que nem todas as escolas usam; o espanhol usa os tempos de Espanha («¡Has acertado!»). Os símbolos ficam × e ÷ em todas: na Alemanha e em Itália a escola usa · e : (e a Itália também ×), o que é uma decisão do dono.
- Línguas: o pedido foi «por geoip». Ficou pelo fuso horário do dispositivo (Europe/Lisbon → português), que dá o país sem mandar o IP da criança a um serviço externo e funciona sem rede. Se o dono preferir mesmo um serviço de geoip, é trocar `LocalesUtils.detect`.
- Público a partir dos 4 anos: rever o resto da app para quem ainda não lê. Há escolhas do dono: uma voz a ler as perguntas e as mensagens (o briefing exclui sons); ícones nas opções que hoje são só texto («Só o resultado», «Na vertical», os modos das tabuadas); o que acontece ao tocar num cartão bloqueado (hoje nada).

- Ortografia: os modos dizem «Só directas» e «Directas + inversas», como no briefing. A escola segue o Acordo Ortográfico («diretas»). Mudar é só em `Messages.getModeLabel` (`src/utils/messages.ts`).
- Desafio sem fim: os valores (5 certas por nível, 2 s + 3 s por algarismo, metade do tempo no nível 12) são um ponto de partida, para afinar a jogar. Estão todos em `ChallengeUtils` (`src/utils/challenge/utils.ts`).
- Descobre a conta: o «progresso» pedido ficou assim, a confirmar a jogar. O nível é do próprio jogo, e não o da Multiplicação, para as respostas daqui não abrirem o Médio da Multiplicação (o desbloqueio continua a vir da prática). A conta encontrada à primeira sobe a caixa desse facto; uma falha manda para a caixa 1 o facto mostrado, como numa falha da prática. A ajuda dá o maior dos dois números da resposta.
- Jogos novos: feitos sem as regras serem vistas antes («faz isso tudo e eu testo»), por isso tudo o que está em «Jogos novos» é um ponto de partida. A confirmar a jogar:
  - **Ritmo dos níveis:** nos jogos de rondas, uma resposta certa vale o mesmo que uma escrita (2 pontos), como no Descobre a conta, embora se escolha entre 3 ou 4 opções; a metade, o segundo tipo de ronda só abria ao fim de 6 jogos perfeitos. Está em `RoundGameUtils.getPointsForAnswer()`. Na Memória, cada par vale o mesmo que uma escolha múltipla (1 ponto), e o nível é só uma medida (não abre nada).
  - **Caixas:** os jogos de rondas têm as suas competências (os tipos de ronda), com caixas e o reforço dos mais fracos, como na prática; não tocam nas caixas das tabuadas nem das operações. A Memória com tabuadas escolhe primeiro os factos mais fracos, mas não muda as caixas: encontrar um par também é memória do sítio, não só saber a conta.
  - **O que ficou de fora:** o Quantos são? não mostra os ossos «só por um instante», como estava na sugestão: seria um relógio escondido para crianças de 4 anos. O Mahjong não tem desfazer.
  - **Relógio:** ligado por defeito em todos os jogos da criança, como os outros (também no Quantos são?, para os mais novos). O Mahjong conta sempre o tempo; o recorde é o tempo mais curto de um tabuleiro limpo sem dicas.
  - **Nomes noutras línguas** escolhidos pelos tradutores: «How many?», «Make 10», «Jump with Faísca», «Which sign?», «Which is heavier?», «Memory», «Number mahjong»; em alemão e italiano a Memória chama-se «Memory» (em alemão «memory®» é marca registada da Ravensburger; a alternativa é «Paare finden»).
- Mascote: é um cão castanho genérico. Se chegar uma fotografia do cão real, ajustar `src/components/Mascot.tsx`, `public/favicon.svg` e os ícones em `public/icons/` às características dele.
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

- GitHub: `joaommmelo/faisca-project`, público (conta pessoal, não a de trabalho). O `gh` tem sessão iniciada nesta conta.
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

### Pedidos seguintes (21 de Outubro de 2026)

- **Ecrã inicial:** o que interessa logo no topo do telemóvel: as quatro operações, as opções da escolhida e o Jogar. As moedas ficam no canto superior direito, com o valor; tocar abre o mealheiro. «Quem vai jogar?» fica no fundo, porque raramente muda (a 22 de Outubro passou para as Definições). A Multiplicação é a operação por defeito.
- **Ajudas sempre à vista:** o saldo e o progresso até à próxima moeda ficam sempre no topo da sessão, e há ajuda em todas as perguntas. Na escolha múltipla a ajuda tira 2 das 4 opções. Quando se ganha uma moeda, ela voa para o saldo (só animação: a regra das moedas não muda).
- **Escrever sempre a resposta:** uma definição na multiplicação e na divisão que tira a escolha múltipla.
- **Relógio:** opcional, por operação. Conta para a frente (por defeito) ou para trás, contra um tempo fixo ou contra o melhor tempo. Ao chegar a 0:00 o jogo continua com calma e o relógio mostra o tempo extra.
- **Recordes:** o melhor tempo de cada categoria comparável (mesma operação, dificuldade e formato; ou mesmas tabuadas, modo e forma de responder), só em sessões perfeitas: 10 certas à primeira, sem ajuda.
- **Resumo:** o «Início» tem de estar sempre à vista: fica com o «Jogar outra vez» numa barra fixa em baixo.
- **Dificuldade na multiplicação e na divisão = números maiores:** o Fácil continua a ser as tabuadas; o Médio e o Difícil passam a contas com números maiores (23 × 4, 84 ÷ 4; 157 × 6, 936 ÷ 4), com tipos de competência, níveis, desbloqueio e rede de segurança como na soma.
- **Tudo avança sozinho:** também depois de um erro e dos marcos, ao fim de pouco tempo; tocar no ecrã avança logo.
- **O resultado aparece logo por baixo da conta,** antes do teclado ou das opções, para estar sempre à vista. (Substituído a 22 de Outubro: o resultado voltou a uma folha em baixo.)
- **Ajuda desactivada com 0 moedas,** e com ar claramente apagado.
- **Sair claro:** a filha do dono do projecto não percebeu o «Sair». A pergunta «Queres sair do jogo?» passa a ter as respostas «Sim, sair do jogo» e «Não, continuar a jogar», lado a lado e com o mesmo destaque; o botão do topo diz «Sair». (Substituído a 22 de Outubro: só «Sim» e «Não», numa folha.)
- **Início menos carregado:** também confundia por ter muita coisa. O início só escolhe o que praticar; as definições passam para o ecrã de cada operação, com o essencial à vista e o resto em «Mais opções».
- **Relógio ligado por defeito,** a contar para a frente, com 3 minutos como meta.
- **Misturado:** uma mistura de 2, 3 ou as 4 operações, escolhidas pela criança.
- **Caixas de escrever sem vermelho:** a cor da soma (laranja) fazia as caixas parecerem um erro antes de responder; tudo o que a criança preenche fica azul.
- **Sem caixas do «e vai 1»:** a linha de caixas para a criança marcar o transporte e o empréstimo era confusa e não servia; saiu. A vertical começa logo nos números, e o 1 que vem de trás ou o empréstimo só aparecem por cima da conta, sem caixa, quando a ajuda os mostra.

### Pedidos de 22 de Outubro de 2026

- **Público a partir dos 4 anos:** a app tem de seguir as melhores práticas de UX e ser intuitiva para crianças a partir dos 4 anos, que ainda não sabem ler: um botão tem de se perceber pelo ícone, não só pelo texto. Substitui o «dos 6 aos 9 anos» do pedido da v2.
- **Resultado numa folha em baixo:** o «Seguinte» e a mensagem voltam a uma folha fixa no fundo do ecrã, por cima do teclado ou das opções (que já não servem depois de responder), em vez de ficarem entre a conta e as opções. A conta fica em cima, com a resposta. O «Tenta outra vez» continua logo por baixo da conta.
- **Botões do resumo iguais:** o «Jogar outra vez» tinha cantos mais redondos do que o «Início»; ficam iguais.
- **Cartões bloqueados:** o «Por desbloquear» quase saía do cartão; agora cabe.
- **Nome, autor e metadados:** a app chama-se «Faísca · Contas» e foi feita por João Melo; o resto ficou à escolha (ver «Metadados» em «PWA e deploy»).
- **Ícones:** um redesenho do Faísca em estilo de jogo (volume, brilho, raios), feito a partir de uma imagem gerada por IA, foi rejeitado pelo dono («muito AI slop»). Ficam os ícones planos originais, e o favicon passa a ser o mesmo ícone da app (antes era só a cabeça, sem fundo).
- **O que falta para desbloquear:** tocar numa dificuldade bloqueada abre uma folha (como a do «Sair») com o que é preciso para a abrir, em vez de não fazer nada.
- **Definições:** o perfil («Quem vai jogar?»), a língua e o «Avançado» passam para um ecrã de Definições, aberto pela roda dentada ⚙ no topo do ecrã inicial, à esquerda das moedas (que ficam no canto, onde o mealheiro abre por baixo delas).
- **Sair só com «Sim» e «Não», numa folha:** tanto texto confundia, e a pergunta no lugar da conta parecia mais uma pergunta do jogo. Agora sobe uma folha por cima do jogo escurecido, com o Faísca a perguntar «Queres sair do jogo?» e só «Sim» (casa) e «Não» (▶). Tocar fora da folha ou Escape é «Não». O desafio usa a mesma folha («Queres terminar o desafio?», com a estrela no «Sim»), sem a nota do que fica e do tempo parado.
- **Secção «Jogos»:** o Misturado e o Descobre a conta, largos e deitados por baixo das operações, pareciam estranhos no início. Passam para uma secção «Jogos», lado a lado e no formato dos cartões das operações; o desafio sem fim, quando está ligado, também fica lá.

### Línguas (22 de Outubro de 2026)

- **Pedido:** a app em inglês, francês, italiano, espanhol e alemão (as línguas mais comuns nos países tier 1), além do português, e por omissão na língua de quem a usa, pelo país: em Portugal, em português.
- **Como ficou:** seis cópias completas, uma por língua, com o mesmo tom (curto, positivo, neutro em género). A primeira vez que a app abre, a língua vem do país, que se tira do fuso horário do dispositivo (os telemóveis acertam-no pelo sítio onde estão): uma criança em Portugal joga em português mesmo num tablet em inglês. Países com várias línguas (Bélgica, Luxemburgo, Suíça, o fuso de Toronto que inclui o Quebeque) e países fora das seis seguem as línguas do dispositivo, pela ordem dele; se nenhuma servir, inglês. A língua detectada fica guardada, para não mudar numa viagem, e muda-se à mão em «Língua» (nas Definições e no ecrã de boas-vindas, antes de haver perfil), com cada língua escrita na própria língua.
- **Porque não geoip:** um serviço de geoip recebe o IP da criança (dados pessoais, a um terceiro) e não funciona sem rede; o fuso dá o mesmo país sem nada sair do dispositivo, como já se fez com a letra (sem pedidos à Google).
- **O que não muda com a língua:** os números (espaço nos milhares a partir de 5 algarismos, como na norma ISO, legível em todas), os símbolos × e ÷, e o nome Faísca.

### Desafio sem fim (para adultos, 21 de Outubro de 2026)

- **Pedido:** uma dificuldade «infinita», como o Balatro: cada vez mais difícil e com menos tempo para responder, até chegar a uma altura em que fica igual até o jogador falhar. É para adultos.
- **Decisões do dono do projecto:** é uma opção avançada, ligada num interruptor; as operações misturam-se mais à medida que se sobe de nível; os números vão até 7 algarismos.
- **Excepção ao briefing, só aqui:** o briefing evita relógios obrigatórios e mecânicas que penalizem, e a v2 é «usada só pela criança». O desafio tem as duas coisas porque é para adultos; por isso fica desligado em todos os perfis e só aparece no início de quem o liga.

### Descobre a conta (mini-jogo, 22 de Outubro de 2026)

- **Pedido:** um mini-jogo onde aparece um número e a criança tem de dizer qual é a multiplicação que dá esse número.
- **Como ficou:** a conta ao contrário, `? × ? = 24`. A criança toca em dois números num teclado de 2 a 12 (como o numérico, com o apagar no canto): o primeiro enche a caixa da esquerda, o segundo a da direita e responde. Muitos números têm várias contas, e qualquer uma certa serve, por qualquer ordem. Depois de acertar, o Faísca mostra as outras («Também podia ser 3 × 8 ou 2 × 12.»), o que ensina que um número tem várias famílias. Na primeira falha diz quanto dá a conta escolhida («Quase! 4 × 7 dá 28. Tenta outra vez.»), sem dar a resposta; na segunda mostra todas.
- **Tocar em vez de escrever:** dois toques num teclado de números grandes é o que uma criança de 4 anos consegue fazer sem ler, e não abre o teclado do dispositivo.
- **Decisões do dono do projecto (22 de Outubro):** moedas e progresso também neste jogo, e ajuda e relógio como na prática. Ficam as tabuadas da multiplicação (escolhê-las aqui muda também as da Multiplicação), o × 1 de fora e os nomes nas outras línguas («What times what?», «Descubre la cuenta», «Trouve la multiplication», «Finde die Malaufgabe», «Trova la moltiplicazione»).

---

### Jogos novos (22 de Outubro de 2026)

- **Pedido:** «Que mais jogos sugeres?» Sugeri seis (Quantos são?, Salta com o Faísca, Memória, Amigos do 10, Qual é o sinal?, Qual pesa mais?), e o dono pediu «faz isso tudo e eu testo», mais um modo Mahjong das cartas, para adultos.
- **Para quem ainda não lê:** o Quantos são? e o Amigos do 10 (com a caixa de 10) são para os 4 anos: ossos para contar e três números grandes. Cada jogo tem um símbolo no cartão (o osso, a balança, as cartas, os saltos) e as regras mostram uma ronda já respondida, em vez de a explicar por palavras.
- **Um motor para cinco jogos:** os cinco jogos de rondas são o mesmo jogo com tabuleiros diferentes: 10 rondas, as duas tentativas da prática, a ajuda (1 moeda, no máximo 3 por jogo), as moedas, o relógio com recordes, o avançar sozinho e a folha do resultado. Cada um tem um nível próprio, e o nível N abre os N primeiros tipos de ronda, como nas dificuldades da prática.
- **Mahjong das contas:** o solitário com peças: duas peças livres com o mesmo resultado saem (7×8 com 63−7). Fica desligado em todos os perfis e liga-se em «Avançado», nas Definições, ao lado do desafio sem fim, pela mesma excepção ao briefing (é para adultos).

## Como está implementado

### Estrutura

```text
src/
  utils/                    lógica pura, sem React; cada pasta tem utils.ts + utils.test.ts
    operations/             OperationsUtils: as quatro operações, símbolo, cálculo
    difficulties/           DifficultiesUtils: Fácil/Médio/Difícil, limites, mínimo de cada número
    arithmetic/             ArithmeticUtils: colunas, transportes, empréstimos, passos da divisão, tipos de competência, geradores das quatro operações
    random/                 RandomUtils: shuffle, moeda ao ar, inteiro num intervalo, sorteio ponderado
    facts/                  FactsUtils: factores 1–12, 78 factos, id "3x7", tabuadas por defeito
    leitner/                LeitnerUtils: caixas 1–5 de factos e de competências, peso de sorteio
    questions/              QuestionsUtils: perguntas das quatro operações, formato, retry
    distractors/            DistractorsUtils: 3 distratores + resposta, baralhados
    session/                SessionUtils: criar, duas tentativas, ajuda, avançar, resumo
    levels/                 LevelsUtils: níveis, pontos e últimas respostas por operação e dificuldade
    wallet/                 WalletUtils: o mealheiro (moedas e progresso até à próxima)
    progression/            ProgressionUtils: aplicar uma resposta, fim de sessão (tempo, recorde, convites em todas as operações jogadas), desbloqueio, rede de segurança
    clock/                  ClockUtils: relógio para a frente ou para trás, referência (3 minutos ou recorde), tempo extra
    records/                RecordsUtils: categorias comparáveis (de uma operação ou de uma mistura), melhor tempo, sessão perfeita
    helps/                  HelpsUtils: quando há ajuda, opções a tirar, pista em dois passos, passos na vertical, facto vizinho
    vertical/               VerticalUtils: colunas da conta e o que a criança já escreveu
    stats/                  StatsUtils: jogos, dias de prática, dias seguidos (moment)
    challenge/              ChallengeUtils: desafio sem fim (níveis, operações, algarismos, tempo por pergunta, contas, relógio com pausa, recorde)
    factorGame/             FactorGameUtils: Descobre a conta (números das tabuadas, as contas de cada número, duas tentativas, ajuda, moedas, nível, caixas, fim do jogo)
    roundGame/              RoundGameUtils: o motor dos jogos de rondas (rondas por nível e caixas, duas tentativas, ajuda, moedas, nível, relógio, fim)
    countingGame/           CountingGameUtils: Quantos são? (ossos como num dado, em filas, espalhados, dois grupos)
    numberBondsGame/        NumberBondsGameUtils: Amigos do 10 (para 10 com a caixa, 20, 100)
    skipCountingGame/       SkipCountingGameUtils: Salta com o Faísca (sequências de saltos iguais)
    missingSignGame/        MissingSignGameUtils: Qual é o sinal? (o sinal que falta; todos os que dão o resultado servem)
    balanceGame/            BalanceGameUtils: Qual pesa mais? (os dois pratos, o lado que pesa mais)
    memoryGame/             MemoryGameUtils: Memória (pares, virar, falhas, ajuda, moedas, nível, fim)
    mahjong/                MahjongUtils: Mahjong das contas (o tabuleiro, peças livres, tirar pares, dica, baralhar, recorde)
    numbers/                NumbersUtils: números com espaço nos milhares a partir de 5 algarismos (pt-PT)
    progress/               ProgressUtils: domínio 0–5 de factos e competências, contas dominadas
    profiles/               ProfilesUtils: AppData, perfis, definições por operação, validação do nome
    storage/                StorageUtils: load/save no localStorage, disponibilidade, persistência
    migrations/             MigrationsUtils: formas antigas congeladas e migrações v1 → v2 → v3 → v4 → v5 → v6 → v7 → v8 → v9
    keypad/                 KeypadUtils: regras do valor escrito no teclado (até 4 algarismos; 7 no desafio)
    time/                   TimeUtils: formatar o tempo do cronómetro (moment)
    install/                InstallUtils: como este dispositivo põe a app no ecrã principal
    locales/                LocalesUtils: as seis línguas, a língua de partida (país pelo fuso, depois o dispositivo), nomes e etiquetas
    messages.ts             Messages: o que a app diz, na língua escolhida (decide o quê; a cópia de cada língua diz como)
  copy/                     copy.ts (a interface Copy, com Labels para os botões e títulos) e uma cópia por língua:
                            pt.ts, en.ts, es.ts, fr.ts, de.ts, it.ts
  components/               Mascot, Logo, Icons, Celebration, PracticeTiles, GameTiles, SegmentedField, TablesPicker,
                            SwitchField, ClockField, CoinButton, PiggyBank, ProfilesPanel, LevelMeter,
                            CoinStatus, SessionClock, Equation, ChoiceOptions, NumericKeypad, KeypadAnswer,
                            VerticalAnswer, VerticalProblem, HelpButton, HintBubble, TryAgainNote,
                            FeedbackPanel, Sheet, ExitSheet, UnlockSheet, ProfileForm, ProgressMap, InstallCard, LanguagePicker,
                            FactorEquation, FactorPad, ClockResultCard, RewardsCard (também no resumo), sparkPath.ts,
                            GameSymbol, RoundBoard (o tabuleiro de cada jogo de rondas), RoundChoices, BonesPicture,
                            MemoryCardFace
  screens/                  WelcomeScreen, HomeScreen, SettingsScreen, SetupScreen, SessionScreen, SummaryScreen, ProgressScreen,
                            ChallengeScreen (regras e resultado do desafio), ChallengeSessionScreen,
                            FactorGameScreen (regras, tabuadas e resultado do Descobre a conta), FactorGameSessionScreen,
                            RoundGameScreen e RoundGameSessionScreen (os cinco jogos de rondas), MemoryGameScreen,
                            MemoryGameSessionScreen, MahjongScreen, MahjongSessionScreen
  hooks/useFocusOnMount.ts  foco no título ao abrir um ecrã (leitores de ecrã)
  hooks/useInstallPrompt.ts guarda o convite de instalação do browser e diz como instalar neste dispositivo
  test/                     random.ts (PRNG com semente, mulberry32) e profiles.ts (perfil de teste)
  App.tsx                   estado da app (AppData) e navegação por `view`, sem router
  index.css                 tokens de cor e espaçamento e todos os estilos
pwa/service-worker.js       modelo do sw.js; o plugin em vite.config.ts preenche a lista de ficheiros
public/                     favicon, manifest.webmanifest, icons/ (any, maskable, Apple), .nojekyll
docs/                       o build, publicado pelo GitHub Pages (não editar à mão)
```

`App.tsx` guarda o `AppData` e grava-o no `localStorage` sempre que muda, se o armazenamento estiver disponível e os dados não forem de uma versão mais nova. A navegação é um `useState<View>` (`home`, `settings`, `setup`, `session`, `summary`, `progress`, `challenge`, `challenge-session`, `factor-game`, `factor-game-session`, `round-game`, `round-game-session`, `memory-game`, `memory-game-session`, `mahjong`, `mahjong-session`), sem router, por isso o build funciona em qualquer subcaminho (`base: "./"` no Vite). Sem perfis aparece o `WelcomeScreen`; o primeiro perfil começa sempre no início (também depois de se apagar o último nas Definições).

Cada pergunta tem a forma `left (operador) right = result`, com `kind` a dizer qual dos termos se pede, `boxType` e `boxKey` (o facto das tabuadas, `"7x8"`, ou a competência, `"multiplication:medium:carry"`, que treina) e `trackId` (onde contam os níveis: `"addition:easy"`, `"multiplication:easy"`). O que se joga é `settings.practice`: uma operação ou `"mix"`.

### Regras do motor (como estão implementadas)

| Regra | Valor | Onde |
| --- | --- | --- |
| Perguntas por sessão | 10; nas tabuadas sorteadas sem repetição; nas competências sem repetir pergunta na sessão | `SessionUtils.getQuestionsPerSession()` |
| Misturado | 2 a 4 operações escolhidas; as 10 perguntas repartem-se o mais igual possível (4 operações: 3, 3, 2, 2, as que levam a mais tiradas à sorte) e baralham-se; cada operação usa as suas definições e sorteia primeiro o que está mais fraco | `SessionUtils.createMixedQuestions`, `ProfilesUtils.getMinMixOperations()` |
| Dificuldades (+, −) | Fácil: resultado (soma) ou número de partida (subtração) até 20, números ≥ 1. Médio: de 21 a 100, números ≥ 10. Difícil: de 101 a 1000, números ≥ 100 | `DifficultiesUtils` |
| Dificuldades (×, ÷) | Fácil: as tabuadas escolhidas, facto a facto. Médio: um factor de 13 para cima vezes um algarismo de 2 a 9, produto até 100 (23 × 4); a divisão é o inverso, dividendo até 100 e quociente ≥ 13 (84 ÷ 4). Difícil: produto ou dividendo de 101 a 1000 (157 × 6, 936 ÷ 4). Sempre exacta | `ArithmeticUtils.drawMultiplication`, `drawDivision` |
| Subtração | o número tirado é sempre menor: resultado ≥ 1 | `ArithmeticUtils.generate` |
| Competências da soma | sem transporte (0), numa coluna (1), em cadeia (2 ou mais transportes, só no Difícil) | `ArithmeticUtils.classify` |
| Competências da subtração | sem empréstimo, com empréstimo, através do zero (pedir a um 0, como em 403 − 127; só no Difícil) | `ArithmeticUtils.classify` |
| Competências da multiplicação (Médio, Difícil) | sem transporte (21 × 4), transporte numa coluna (27 × 4), em cadeia (2 ou mais transportes, 157 × 6; só no Difícil); o último algarismo escreve-se inteiro e não conta | `ArithmeticUtils.getMultiplicationCarryColumns` |
| Competências da divisão (Médio, Difícil) | sem resto pelo caminho (84 ÷ 4), com resto pelo caminho (72 ÷ 4, 156 ÷ 6), zero no resultado (um 0 que não é o último algarismo do quociente, 412 ÷ 4 = 103; só no Difícil) | `ArithmeticUtils.getDivisionSteps` |
| Gerador | sorteia números dentro da dificuldade até acertar no tipo pedido; as tabuadas não são geradas, sorteiam-se factos | `ArithmeticUtils.generate` |
| Tipos abertos | o nível N abre os N primeiros tipos da dificuldade | `ArithmeticUtils.getOpenSkills` |
| Sorteio do tipo | peso `1 / caixa` da competência, entre os abertos | `SessionUtils` |
| Caixa de um facto (tabuadas) | certo → sobe uma (máx. 5); errado → volta à 1 (como na v1) | `LeitnerUtils.applyAnswer` |
| Caixa de uma competência | certo → sobe uma; errado → desce só uma | `LeitnerUtils.applySkillAnswer` |
| Divisão no Fácil | dividendo = produto de um facto das tabuadas escolhidas; divisor = um dos factores; treina a caixa desse facto | `QuestionsUtils.buildDivision` |
| Formato | vertical se a criança a escolheu (+, −); «escrever sempre» (×, ÷) → teclado; senão, nas tabuadas, caixa do facto ≥ 3 → teclado, abaixo → escolha múltipla; nas competências, 8 certas nas últimas 10 respostas dessa competência → teclado, menos → escolha múltipla (volta quando a criança começa a falhar). Decide-se ao começar a sessão | `QuestionsUtils.getTablesAnswerFormat`, `getSkillAnswerFormat` |
| Tentativas | 2; a primeira falha só diz «tenta outra vez»; a segunda mostra a resposta | `SessionUtils.getAttemptsPerQuestion()` |
| O que conta | só a primeira tentativa, sem ajuda e fora das repetições | `SessionUtils.countsForProgress`, `isFirstTryCorrect` |
| Repetição de um erro | uma vez, 3 perguntas depois; um erro na última pergunta fica para a próxima sessão (nunca a mesma pergunta seguida) | `SessionUtils.scheduleRetry` |
| Pontos | escrita ou vertical certa = 2; escolha múltipla certa = 1 | `LevelsUtils.getPointsForAnswer` |
| Níveis | sair do nível N pede 20 + 10 × N respostas escritas certas (o dobro em escolha múltipla), no máximo 100 | `LevelsUtils.getPointsToLevelUp` |
| Desbloqueio | em cada operação, na dificuldade mais alta aberta, com todos os tipos abertos (as tabuadas não têm tipos): 15 certas nas últimas 20 escritas ou verticais, ≥ 10 perguntas diferentes. Desbloqueia logo; o convite só decide se se joga já. Num Misturado vê-se cada operação jogada e o primeiro desbloqueio ganha à rede de segurança | `ProgressionUtils.getUnlockRequirement` (os passos e o progresso, também para a folha), `getUnlockableDifficulty`, `finishSession` |
| Rede de segurança | fora do Fácil: menos de 5 certas nas últimas 10 (qualquer formato) e pelo menos 10 respostas desde a última proposta | `ProgressionUtils.getSafetyNetDifficulty` |
| Moedas | 3 no início; 1 por cada 10 pontos (5 escritas ou 10 de escolha múltipla), em qualquer dificuldade; máximo 5; com o mealheiro cheio o progresso espera, completo, e a moeda entra quando se gasta outra | `WalletUtils` |
| Ajudas | em todas as perguntas; 1 moeda por pergunta (os passos seguintes na mesma pergunta são grátis), no máximo 3 por sessão | `HelpsUtils` |
| Ajuda na escolha múltipla | tira opções erradas ainda não tentadas até ficarem 2 (a certa e outra) | `HelpsUtils.getOptionsToHide` |
| Ajuda no «só o resultado» (+, −) | um primeiro passo fácil: as dezenas primeiro (37 + 20 = 57, agora + 5), ou ir à dezena (8 + 2 = 10, agora + 3); senão onde começar a contar. Nunca dá a resposta | `HelpsUtils.getArithmeticHint` |
| Ajuda na vertical | na coluna do cursor: realçar → marcas (o 1 que veio de trás; o empréstimo até ao vizinho que empresta) → dígito | `HelpsUtils.getVerticalSteps`, `VerticalUtils.getHelpMarkColumns` |
| Ajuda nas tabuadas | o facto vizinho (move o número escondido ±1) que está na caixa mais alta | `HelpsUtils.getNeighbourFact` |
| Ajuda no × e ÷ com números maiores | um passo parcial: a ordem mais alta primeiro (20 × 4 = 80, agora junta 3 × 4; 40 ÷ 4 = 10, agora faz 32 ÷ 4 e junta); com um número redondo, tira-se o zero (2 × 4 = 8, agora junta um zero). Nunca dá a resposta | `HelpsUtils.getArithmeticHint` |
| Vertical | soma com uma célula a mais à esquerda (não denuncia o transporte); confirmar pede dígitos seguidos desde as unidades; célula vazia à esquerda vale 0 | `VerticalUtils` |
| Distratores (+, −) | ±1, ±10, cada coluna sozinha (esquecer o transporte; tirar o menor do maior), dígitos trocados | `DistractorsUtils` |
| Distratores (tabuadas) | como na v1; a divisão usa os da resposta-factor (±1 e o número mostrado) | `DistractorsUtils` |
| Distratores (×, ÷ com números maiores) | multiplicação: um grupo a mais ou a menos, ±10, esquecer os transportes (27 × 4 → 88), dígitos trocados; divisão: ±1, ±10, dígitos trocados | `DistractorsUtils` |
| Teclado | até 4 dígitos (1000); um «0» isolado é substituído | `KeypadUtils` |
| Relógio | por operação e no Misturado; ligado por defeito, a contar para a frente com meta de 3 minutos; pode contar para trás e ter o recorde da categoria como referência (3 minutos enquanto não houver); depois da referência mostra o tempo extra e o jogo continua | `ClockUtils` |
| Recordes | por categoria comparável (+, −: operação, dificuldade, formato; tabuadas: operação, tabuadas, modo, «escrever sempre»; números maiores: operação, dificuldade, «escrever sempre»; Misturado: as operações e cada uma jogada da mesma maneira); só sessões perfeitas (10 certas à primeira, sem ajuda) com o relógio ligado; fica o mais rápido | `RecordsUtils`, `ProgressionUtils.finishSession` |
| Avançar sozinho | certo ao fim de 1 s, com marcos (moeda, nível) ao fim de 2 s, errado ao fim de 2,5 s; tocar no ecrã ou «Seguinte» avança logo | `SessionScreen.tsx` (`PRAISE_`, `MILESTONE_`, `CORRECTION_DISPLAY_MILLISECONDS`) |
| Dias seguidos | +1 em dias consecutivos; só aparece se o último dia for hoje ou ontem | `StatsUtils` |
| Contador de jogos | só conta sessões terminadas; caixas, níveis e moedas gravam-se a cada resposta | `ProgressionUtils.finishSession` |

O factor 0 do briefing («factos com 0, 1 e 10») não existe nas tabuadas de 1 a 12, por isso só 1 e 10 têm peso reduzido.

**Desafio sem fim** (tudo em `ChallengeUtils`, salvo onde se diz):

| Regra | Valor | Onde |
| --- | --- | --- |
| Níveis | sobe-se a cada 5 certas | `getAnswersPerLevel()` |
| Operações | soma no nível 1; subtração no 3, multiplicação no 5, divisão no 7; cada pergunta sorteia uma das abertas | `getOperationEntryGap()`, `getOperations` |
| Algarismos | cada operação entra com 2 (o maior número da conta: soma, número de partida, produto, dividendo) e ganha 1 por nível, até 7 | `getMinDigits()`, `getMaxDigits()`, `getDigits` |
| Contas | + e −: o outro número tem pelo menos 2 algarismos e no máximo menos 1 (37 + 45, 1 234 567 + 345 678); subtração sempre positiva; × e ÷ por um algarismo de 2 a 9, divisão exacta; nunca a mesma pergunta seguida | `generate`, `createQuestion` |
| Tempo por pergunta | (2 s + 3 s por algarismo) × um factor que desce por igual de 1 no nível 1 até 0,5 no nível 12 | `getTimeLimitMilliseconds`, `getSpeedFactor` |
| Topo | nível 12: as quatro operações com 7 algarismos e metade do tempo; daí em diante nada muda até se falhar | `getTopLevel()` |
| Fim | uma resposta errada (uma só tentativa) ou o tempo a acabar; «Sair» pára o tempo e pergunta, e terminar conta como fim | `ChallengeSessionScreen.tsx` |
| Recorde | o maior número de certas numa corrida (pelo menos 1) | `isNewRecord`, `finishRun` |
| Ritmo | certo: 0,5 s até à pergunta seguinte, 1,5 s numa subida de nível (com o que mudou); o tempo da pergunta não corre entretanto | `ChallengeSessionScreen.tsx` |

**Descobre a conta** (tudo em `FactorGameUtils`, salvo onde se diz):

| Regra | Valor | Onde |
| --- | --- | --- |
| Números por jogo | 10, todos diferentes, por ordem aleatória | `getRoundsPerGame()`, `create` |
| Que números | os produtos dos factos das tabuadas escolhidas na multiplicação, sem os do × 1, cada um uma vez (2, 5 e 10: de 4 a 120). Qualquer tabuada de 2 a 12 dá 11 números, por isso há sempre 10 | `getTargets` |
| Teclado | de 2 a 12, com o apagar em baixo à esquerda, no mesmo sítio do teclado numérico: o × 1 dava todos os números. Sem tabuadas, ou só com a do 1, não se joga (o Jogar diz porquê) | `getMinFactor()`, `getFactors`, `canPlay` |
| Respostas certas | qualquer par do teclado cujo produto é o número, por qualquer ordem | `submit`, `getPairs` |
| Tentativas | as mesmas 2 da prática: a primeira falha deixa a conta escolhida nas caixas, riscada e tracejada em tom quente (como a opção errada na escolha múltipla), até ao toque seguinte, e diz quanto dá; a segunda mostra todas as contas do número | `SessionUtils.getAttemptsPerQuestion()`, `Messages.getFactorGameTryAgain` |
| Depois de responder | nas caixas, a conta da criança (se acertou) ou uma com uma tabuada escolhida; na folha, as outras contas do número | `getShownPair`, `getOtherPairs`, `Messages.getFactorGameFeedback` |
| O que conta | como na prática: só a primeira tentativa e sem ajuda | `applyResult`, `getSummary` |
| Moedas | uma conta certa à primeira vale o mesmo que uma resposta escrita (2 pontos): 5 certas, uma moeda, com as regras do mealheiro | `getPointsForAnswer()`, `WalletUtils` |
| Nível | do próprio jogo (pista `"factor-game"`), com os mesmos pontos e a mesma regra de subida da prática; não entra no desbloqueio nem na rede de segurança de nenhuma operação | `getTrackId()`, `LevelsUtils` |
| Caixas | as do mapa das tabuadas: certa à primeira, o facto encontrado sobe uma caixa; senão, o facto mostrado volta à 1 | `applyResult`, `LeitnerUtils.applyAnswer` |
| Ajuda | 1 moeda por número, no máximo 3 por jogo (as da prática): o maior dos dois números da resposta vai para a primeira caixa, nas cores do balão da ajuda, (e volta para lá depois de uma falha) e o Faísca diz «Começa pelo 6. Qual é o outro número?» | `getHintFactor`, `registerHelp`, `HelpsUtils` |
| Relógio e recordes | relógio próprio (`settings.factorGame.clock`), ligado por defeito, a contar para a frente com meta de 3 minutos, como os outros; o recorde é por tabuadas, só em jogos perfeitos | `finish`, `RecordsUtils.getFactorGameCategory`, `ProgressionUtils.registerTime` |
| Jogos e dias | um jogo terminado conta como jogo e como dia de prática | `finish`, `StatsUtils.registerSession` |
| Ritmo | certo: 1 s, ou 2 s com outras contas para ler ou com marcos (moeda, nível); errado: 2,5 s; tocar no ecrã ou «Seguinte» avança logo | `FactorGameSessionScreen.tsx` |
| Fim | certas à primeira de 10 (e quantas com ajuda), o tempo, as conquistas e, para treinar mais, cada número não acertado sozinho à primeira com todas as suas contas («24 = 2 × 12 = 3 × 8 = 4 × 6») | `getSummary`, `Messages.getFactorRoundText` |

**Jogos de rondas** (o motor em `RoundGameUtils`; cada jogo no seu `utils.ts`):

| Regra | Valor | Onde |
| --- | --- | --- |
| Rondas | 10 por jogo; nunca a mesma ronda seguida, e sem repetir enquanto houver outras | `getRoundsPerGame()`, `create` |
| Tipos de ronda | o nível N abre os N primeiros; cada ronda sorteia um tipo aberto com peso `1 / caixa` (`skillBoxes`, `"counting:to-five"`) | `getOpenSkills`, `create` |
| Tentativas | as 2 da prática; a primeira falha risca a opção e diz «tenta outra vez» | `submit` |
| O que conta | a primeira tentativa, sem ajuda: certa sobe a caixa do tipo e dá 2 pontos (moedas e nível); errada desce a caixa uma | `applyResult`, `getPointsForAnswer()` |
| Ajuda | 1 moeda por ronda, no máximo 3 por jogo; tira opções erradas até ficarem 2; na balança com contas, faz uma das contas («Pista: 7 × 8 = 56») | `registerHelp`, `getHelp` |
| Relógio e recordes | `settings.roundGames[jogo].clock`, ligado por defeito; recorde por jogo e nível, só em jogos perfeitos | `finish`, `RecordsUtils.getRoundGameCategory` |
| Quantos são? | até 5 como num dado; 6 a 10 em filas de 5; 3 a 10 espalhados numa grelha de 5 × 4; dois grupos de 1 a 5; 11 a 20 em filas de 10. 3 opções em ordem, ±1 (ou um dos grupos) | `CountingGameUtils` |
| Amigos do 10 | para 10 com a caixa de 10; para 10; para 20 (sem o 10); para 100 com dezenas; para 100 com qualquer número. 3 opções: ±1, ±10, e no 100 a falha de cada algarismo para 10 (63 + 47) | `NumberBondsGameUtils` |
| Salta com o Faísca | 5 números; saltos de 1 (até 20), de 2, de 5 ou 10, de 3 ou 4, de 6 a 9 (dentro de 12 saltos); falta um que não é o primeiro; 3 opções: ±1 ou o salto de 1 por hábito (3, 6, 7) | `SkipCountingGameUtils` |
| Qual é o sinal? | + ou − até 20; ×; ÷ (tabuadas até 10); os quatro com números maiores (até 100, 12 × 12). Sem × 1 nem ÷ 1; todos os sinais que dão o resultado servem (2 ? 2 = 4) | `MissingSignGameUtils` |
| Qual pesa mais? | dois números; uma soma e um número; somas ou subtrações; multiplicações; contas misturadas. Um em cinco pesa o mesmo; diferença de no máximo 4 (10 nas multiplicações), para não se adivinhar pelo tamanho | `BalanceGameUtils` |

**Memória** (tudo em `MemoryGameUtils`):

| Regra | Valor | Onde |
| --- | --- | --- |
| Cartas | 4, 6 ou 8 pares (6 por defeito), em filas de 4; cada par com um valor só dele | `getValidPairCounts()`, `create` |
| Que pares | ossos com o seu número (1 a 10); somas até 10 com o resultado (por defeito); factos das tabuadas da multiplicação com o produto, os mais fracos primeiro | `getValidContents()`, `drawPairs` |
| Jogadas | duas cartas viradas; se fazem par ficam para cima; senão ficam à vista 1,4 s (tocar noutra vira-as logo) | `flip`, `hideMiss`, `MemoryGameSessionScreen.tsx` |
| Ajuda | só com uma carta virada: o par dela brilha. 1 moeda por carta, no máximo 3 por jogo | `registerHelp` |
| Moedas e nível | um par encontrado sem ajuda vale 1 ponto (uma escolha múltipla); as falhas não tiram nada | `applyMatch` |
| Recordes | por cartas (o que fazem par, quantos pares e as tabuadas); só em jogos sem ajuda | `finish`, `RecordsUtils.getMemoryGameCategory` |

**Mahjong das contas** (tudo em `MahjongUtils`):

| Regra | Valor | Onde |
| --- | --- | --- |
| Tabuleiro | uma pirâmide de 36 peças em meias peças: 4 filas de 6, uma peça de cada lado das filas do meio, 2 filas de 4 por cima e 2 no topo | `getLayout` |
| Peças | 18 valores de 10 a 99, cada um com duas contas de no máximo 4 caracteres (de sinais diferentes quando há) | `drawPairs`, `getFaces` |
| Livre | nada por cima e um dos lados livre | `isFree` |
| Sempre resolúvel | as peças são postas a partir de uma solução (desmonta-se o tabuleiro dois a dois, como um jogador) | `deal` |
| Sem pares livres | «Baralhar» volta a pôr as peças que ficam, também a partir de uma solução; se não houver nenhuma, o jogo acaba | `shuffle` |
| Dica | mostra um par livre | `hint` |
| Recorde | o tempo mais curto de um tabuleiro limpo sem dicas (`profile.mahjongRecord`); não conta como jogo nem dá moedas | `finishRun` |

### Decisões tomadas onde o briefing e o pedido não diziam nada

- Nas tabuadas, a caixa 3 (duas certas seguidas) é o limiar para a resposta escrita. Nas competências não serve: uma competência junta muitas perguntas, enche a caixa numa sessão e a escolha múltipla desaparecia depois do primeiro jogo. Por isso o formato de uma competência segue as últimas 10 respostas dela (8 certas → teclado). Pedido do dono do projecto, a 21 de Outubro de 2026, «para ver no que dá».
- Uma competência agrega muitas perguntas diferentes, por isso um erro só a faz descer uma caixa (um facto continua a voltar à caixa 1).
- «Até 20» limita o resultado da soma e o número de partida da subtração; cada dificuldade começa acima do limite da anterior, para o Médio nunca repetir o Fácil.
- O nível 1 de cada dificuldade só tem o tipo mais fácil; o convite de desbloqueio só aparece quando todos os tipos dessa dificuldade estão abertos, para nenhum tipo ficar por treinar.
- No Médio da multiplicação e da divisão o factor maior começa em 13, para não repetir as tabuadas; o outro é um algarismo de 2 a 9, porque o × e o ÷ não têm conta na vertical e fazem-se de cabeça.
- Um Misturado mostra, em cada pergunta, a cor da operação dela. Aceitar um convite que veio de um Misturado joga essa operação sozinha, na nova dificuldade.
- A migração para a v4 liga o relógio onde ele ainda estava como vinha de origem (desligado, para a frente, 3 minutos); quem o tinha configurado de outra maneira mantém-no.
- A escolha múltipla também conta metade para os níveis (não só para as moedas), para quem começa em escolha múltipla não ficar parado.
- Uma pergunta acertada à segunda tentativa volta mais tarde na sessão, como um erro; uma pergunta acertada com ajuda não volta.
- Aceitar um convite (desbloqueio ou rede de segurança) começa logo um jogo nessa dificuldade; recusar não muda nada.
- Uma resposta certa avança sozinha ao fim de 1 s (`PRAISE_DISPLAY_MILLISECONDS` em `SessionScreen.tsx`), ou logo, tocando no ecrã. Uma errada e uma com marcos (moeda, nível) esperam pelo «Seguinte».
- A vertical não tem onde a criança marque o «e vai 1»: as marcas são só da ajuda e aparecem numa linha por cima da conta, que não existe antes disso. Na soma, o «1» por cima da coluna que o recebe (também quando a ajuda escreve o dígito de uma coluna que leva 1); na subtração, o algarismo riscado e o novo valor por cima (3 → 13, 0 → 9).
- O cronómetro conta para cima e mostra o tempo no fim; nunca conta para baixo.
- Sair a meio pede confirmação, numa folha só com «Sim» e «Não».
- Apagar um perfil, com confirmação, nas Definições.
- Nomes de perfil: até 20 caracteres, sem repetidos (ignora maiúsculas).
- O desafio sem fim só muda o recorde: não conta como jogo nem como dia de prática, não dá moedas nem níveis e não tem ajudas.
- O Descobre a conta tem um nível só dele, para não mudar as regras de desbloqueio da Multiplicação; as caixas são as mesmas da prática, porque encontrar 4 × 6 para 24 é saber esse facto.
- No desafio, o interruptor fica num cartão «Avançado» nas Definições, por perfil, desligado por defeito. Ligado, aparece um cartão «Desafio sem fim» por baixo do Misturado, com o recorde.
- No desafio responde-se sempre no teclado: na escolha múltipla acertava-se 1 em 4 à sorte, e na vertical escreve-se devagar demais com o tempo a contar.
- Números com 5 ou mais algarismos aparecem com espaço nos milhares (12 345, 1 234 567), como se escreve em pt-PT; até 4 algarismos ficam como estavam (1000). Nessas contas o resultado fica numa linha só dele, desde o início, para não saltar de linha enquanto se escreve.
- O Faísca é tratado no masculino («Eu sou o Faísca»): é um cão. Correcção do dono do projecto, a 21 de Outubro de 2026.
- O tempo fixo do relógio é de 3 minutos (`ClockUtils.getDefaultMinutes()`), igual em todas as operações.
- A ajuda depois de uma primeira falha na escolha múltipla deixa também só 2 opções à vista (a certa e uma não tentada); a opção já tentada continua riscada.
- O relógio só mede quando está ligado: sem relógio não há tempos guardados nem recordes.
- O modo privado não se consegue detectar com fiabilidade (o Safari deixa escrever e apaga no fim). O aviso aparece quando escrever no `localStorage` falha de facto, ou quando os dados são de uma versão mais nova. O pedido de armazenamento persistente só é feito quando já há um perfil.

### UI, marca e acessibilidade

- **Tokens** em `:root` no `src/index.css`: fundo creme `#fff7ec`, azul `#1f5fd1` (confiança, botões principais), amarelo `#ffc83d` (energia, botão Jogar, moedas), castanhos do cão, verde para certo e tons quentes suaves (nunca vermelho) para errado. Uma cor por operação (`--op-*` e `--op-*-soft`): laranja na soma, azul-petróleo na subtração, azul na multiplicação, violeta na divisão; cada ecrã e cartão de uma operação usa `--op-ink`/`--op-soft`. Espaçamentos `--space-1` a `--space-6`. Todas as combinações de texto têm contraste ≥ 4,5:1.
- **Níveis de domínio** (`--level-0` a `--level-5`), no mapa e nas competências: cinzento → pêssego → amarelo → amarelo-esverdeado → verde-claro → verde. Legendas: Por praticar, A começar, A aprender, A melhorar, Quase lá, Dominado.
- **Tipografia:** Nunito (variável), alojada no próprio site através de `@fontsource-variable/nunito`, sem pedidos à Google (privacidade das crianças).
- **Mascote** (`Mascot.tsx`): cão castanho de orelhas caídas escuras, mancha creme na testa e no focinho, coleira azul com uma chapa em forma de faísca. Expressões: `happy` (início), `cheer` (certo, convite de desbloqueio), `encourage` (tenta outra vez, errado, rede de segurança, sair), `proud` (resumo e progresso). É sempre decorativa (`aria-hidden`); a mensagem está no balão.
- **Ecrã inicial** (só escolhe o que praticar): em cima, o logótipo, a roda dentada das Definições e as moedas no canto (botão que abre o mealheiro); o Faísca; as quatro operações em cartões grandes (2 × 2, com «Fácil · nível 2»); a secção «Jogos», com o Misturado e o Descobre a conta lado a lado, nos mesmos cartões em pé das operações (o Descobre a conta com o nível), depois os jogos novos, dois a dois (Quantos são?, Amigos do 10, Salta com o Faísca, Qual é o sinal?, Qual pesa mais?, Memória), cada um com o seu símbolo e o nível, e por baixo, a toda a largura, o desafio e o Mahjong, se estiverem ligados; Ver progresso. Os cartões da mesma fila têm sempre a mesma altura, também quando um nome ocupa duas linhas.
- **Definições** (`SettingsScreen`, para o adulto): «‹ Início», o título e três cartões: «Quem vai jogar?» (escolher, criar e apagar perfis), «Língua» (cada língua escrita na própria língua, com `lang` para os leitores de ecrã) e «Avançado» (o desafio sem fim e o Mahjong do perfil escolhido). Mudar de perfil remonta o ecrã, que fecha o formulário e a confirmação de apagar.
- **Descobre a conta:** a cor da multiplicação e o símbolo «?×?». Antes de jogar: «‹ Início» e as moedas; o Faísca explica, um exemplo (4 × 6 = 24, a verde), a frase «qualquer uma serve», as tabuadas (as da multiplicação) e, em «Mais opções», o relógio; o Jogar fica fixo em baixo. Na sessão, como na prática: «✕ Sair», «Pergunta n de 10» e as moedas; a barra de progresso; o relógio; `? × ? = 24` com a caixa seguinte em azul cheio; o «Tenta outra vez»; a ajuda (ou o balão dela); o teclado de 2 a 12; depois de responder, a folha do resultado em baixo, com os marcos. No fim, como no resumo: festa, «7 de 10 certas à primeira» e as com ajuda, o tempo, as conquistas, os números para treinar, «Ver progresso» e «Início» / «Jogar outra vez» fixos em baixo. No progresso, um cartão com o nível do jogo, por baixo das operações; os recordes entram na lista dos outros («Descobre a conta · tabuadas 2, 5, 10»).
- **Desafio sem fim:** cor própria, um ardósia sóbrio (`--op-challenge`), e o símbolo ∞. Antes de jogar, as regras e o recorde. Na sessão: «✕ Sair», «Nível n» e as certas numa pastilha verde; uma barra com o tempo que falta e os segundos, que fica em tom quente (nunca vermelho) no último quarto; a conta; a mensagem da subida de nível; o teclado. No fim: como acabou, a última conta com a resposta certa a verde (e o que se escreveu, se foi um erro), as certas, o nível e o recorde.
- **Jogos novos:** cada jogo de rondas usa a cor da operação mais próxima (Quantos são? a da soma, Amigos do 10 a da subtração, Salta com o Faísca a da multiplicação, Qual é o sinal? a do Misturado, Qual pesa mais? a da divisão); a Memória tem um rosa só dela (`--op-memory`) e o Mahjong o ardósia do desafio. As regras mostram uma ronda já respondida (ou um par já encontrado) e «Mais opções» com o relógio. Na sessão, como na prática: a ronda em cima, o «tenta outra vez» e a ajuda, as opções em baixo, e a folha do resultado. No Qual é o sinal? cada sinal tem a cor da sua operação; no Qual pesa mais? os pratos são os botões, com o «=» no meio, e a trave inclina-se para o lado que pesa mais. Na Memória as cartas viradas para baixo mostram a faísca; a carta com o par da ajuda brilha em amarelo. No Mahjong as peças presas ficam mais apagadas e as camadas desviam-se um pouco, para as pilhas se lerem.
- **Ecrã de preparação** (`SetupScreen`): «‹ Início» e as moedas; o nome da operação com a sua cor; a dificuldade com cadeados (no × e ÷ com o exemplo: «tabuadas», «como 23 × 4»; nos bloqueados, o cadeado num distintivo sobre o canto do cartão, e «Por desbloquear» em letra que encolhe com o cartão, porque «desbloquear» não cabe num terço de um telemóvel; tocar num bloqueado abre a folha do que falta); as tabuadas no Fácil do × e ÷, ou o formato no + e −; no Misturado, as quatro operações para ligar e desligar, cada uma com a sua dificuldade. «Mais opções» fechado: modo das tabuadas, «Escrever sempre a resposta», relógio. O Jogar (com o ▶) fica fixo em baixo e diz porque está desligado.
- **Sessão:** no topo, «✕ Sair», «Pergunta n de 10» e as moedas com cinco pontos até à próxima (meio ponto na escolha múltipla). Com o relógio ligado, uma pastilha com o tempo e a referência («de 3:00», «recorde 1:32»); no tempo extra fica em tom quente suave, sem alarme.
- **Certo e errado não dependem só da cor:** certo tem visto, salto do Faísca e destaque verde; a opção escolhida errada fica riscada e tracejada (no Descobre a conta, a conta errada nas caixas); a vertical realça as colunas erradas.
- **Feedback:** primeiro «Tenta outra vez» num balão, logo por baixo da conta; depois o resultado numa folha fixa no fundo do ecrã, por cima do teclado ou das opções, com o Faísca, a mensagem, os marcos e o botão «Seguinte ›». Tudo avança sozinho (ver «Avançar sozinho»). A moeda ganha voa para o saldo por cima da folha.
- **Folhas** (`Sheet`): o que pára o ecrã sobe numa folha por cima dele, escurecido e inerte por trás. Tocar fora ou Escape fecha (é sempre a resposta que não muda nada), e o foco volta ao que a abriu.
- **O que falta para desbloquear** (`UnlockSheet`): as dificuldades bloqueadas são botões; tocar numa abre a folha. O Faísca diz onde jogar («Para abrir o Médio, joga no Fácil:»; no Difícil com o Médio fechado, «O Difícil abre depois do Médio…»; com tudo feito, «Já está quase! Acaba um jogo no Fácil e o Médio abre.»). Por baixo, um passo por linha, cada um com um círculo que fica verde com um visto, uma barra e «1 de 2»: chegar ao nível que abre todos os tipos (as tabuadas não têm), acertar 15 de 20 contas escritas (com «Faltam 3 contas.» quando já há 15 certas mas ainda não 20 respostas) e, só quando é isso que falta, fazer 10 contas diferentes. Um botão «Entendi».
- **Sair:** «✕ Sair» abre uma folha (`ExitSheet`, sobre a `Sheet`, um `<dialog>` modal) que sobe por cima do jogo escurecido: o Faísca pergunta «Queres sair do jogo?» e há só «Sim» (casa) e «Não» (▶), lado a lado e do mesmo tamanho. O foco começa no «Não»; tocar fora da folha ou Escape também é «Não». O jogo fica por trás, inerte, e o teclado numérico não recebe teclas enquanto a folha está aberta.
- **Caixas de escrever:** a resposta, as células da vertical, o cursor e as marcas são sempre azuis («é a tua vez»); os tons quentes ficam para os erros. A cor de cada operação fica nos cartões, nos símbolos e nos títulos.
- **Resumo:** «Início» (casa) e «Jogar outra vez» (▶) numa barra fixa em baixo, sempre à vista, com os mesmos cantos e o ícone por cima das palavras, para nenhum botão ficar mais estreito do que a sua palavra mais comprida em nenhuma língua («Startseite» em alemão). O resultado do desafio usa a mesma barra.
- **Teclado do dispositivo nunca abre na sessão:** o teclado numérico é próprio. Um teclado físico também funciona (dígitos, Backspace, Enter).
- **Leitores de ecrã:** cada pergunta tem um título escondido lido como frase («Quanto é 52 menos 27?»), que recebe o foco a cada pergunta nova. As células da vertical dizem a casa («Casa das dezenas: 6»). O botão «Seguinte» é descrito pela mensagem. As ajudas e o «tenta outra vez» são anunciados (`role="status"`).
- **Movimento:** só `transform` e `opacity`, nada enquanto a criança pensa. Certo: o resultado cresce um pouco e o Faísca salta (menos de 1 s). Erro: a opção afunda suavemente, sem abanar. Marcos (moeda, nível, desbloqueio, fim de sessão): faíscas a subir e a moeda a rodar. Com `prefers-reduced-motion: reduce` tudo passa a um esvanecer curto e as faíscas desaparecem. Não há sons.
- **Layout:** largura máxima de 640 px e margem lateral de 16 px. Em ecrãs ≥ 600×800 a sessão fica centrada e os botões crescem. O botão Jogar fica fixo no fundo do ecrã inicial.

### Dados guardados

- Chave do `localStorage`: `faisca:data`. Forma (versão 9): `{ version: 9, profiles: Profile[], activeProfileId, locale }`, com `locale` a língua do dispositivo (`null` só até à primeira detecção), com `Profile = { id, name, settings, boxes, skillBoxes, recentSkillAnswers, tracks, unlockedDifficulties, wallet, records, stats, challengeRecord, mahjongRecord }`:
  - `settings = { practice, addition: { difficulty, layout, clock }, subtraction: { difficulty, layout, clock }, multiplication: { difficulty, tables, mode, isAlwaysTyped, clock }, division: { difficulty, tables, isAlwaysTyped, clock }, mix: { operations, clock }, factorGame: { clock }, roundGames: { counting, "number-bonds", "skip-counting", "missing-sign", balance: { clock } }, memoryGame: { content, pairCount, clock }, isChallengeEnabled, isMahjongEnabled }`, com `practice` uma operação ou `"mix"` e `clock = { isEnabled, direction, reference }`;
  - `records = { "<categoria>": { category, milliseconds } }`, com `category` de uma operação (`kind: "operation"`), de uma mistura (`kind: "mix"`, `parts`) do Descobre a conta (`kind: "factor-game"`, `tables`), de um jogo de rondas (`kind: "round-game"`, `game`, `level`) ou da Memória (`kind: "memory-game"`, `content`, `pairCount`, `tables`);
  - `boxes = { "3x7": 1..5 }` (tabuadas, no Fácil da multiplicação e da divisão), `skillBoxes = { "addition:easy:carry": 1..5, "division:hard:remainder": 1..5, "counting:to-five": 1..5 }` (também os tipos de ronda dos jogos de rondas);
  - `recentSkillAnswers = { "addition:easy:carry": [true, false, …] }`: a primeira tentativa das últimas 10 respostas que contaram em cada competência, da mais antiga para a mais recente (decide escolha múltipla ou teclado);
  - `tracks = { "addition:easy": …, "multiplication:medium": { level, points, recentAnswers (últimas 40), answersSinceSafetyNet } }`, mais `"factor-game"` (o nível do Descobre a conta, criado na primeira resposta que conta), `"counting-game"`, `"number-bonds-game"`, `"skip-counting-game"`, `"missing-sign-game"`, `"balance-game"` e `"memory-game"`;
  - `unlockedDifficulties = { addition, subtraction, multiplication, division }` (a mais alta aberta), `wallet = { coins, points }`, `stats` como na v1;
  - `challengeRecord`: o maior número de certas numa corrida do desafio sem fim, ou `null`; `mahjongRecord`: o melhor tempo de um tabuleiro de Mahjong limpo sem dicas, ou `null`.
- **Migração:** `MigrationsUtils` guarda as formas antigas congeladas e migra passo a passo: v1 → v2 (caixas, tabuadas, modo, cronómetro e estatísticas mantêm-se; a operação fica Multiplicação; começa com 3 moedas) → v3 (cada operação herda o cronómetro antigo como relógio para a frente; «escrever sempre» desligado; recordes vazios) → v4 (as tabuadas passam a Fácil da multiplicação e da divisão, com o nível em `"multiplication:easy"`/`"division:easy"` e os recordes com dificuldade; desbloqueios para as quatro operações; `operation` passa a `practice`; Misturado com as quatro; relógio ligado onde estava como vinha de origem) → v5 (as últimas respostas de cada competência reconstroem-se a partir das respostas recentes de cada pista, cujo id diz que conta era; as tabuadas não têm competências) → v6 (desafio sem fim desligado e sem recorde) → v7 (`locale: null`: a língua detecta-se no arranque seguinte) → v8 (o Descobre a conta ganha o seu relógio, ligado como todos começam) → v9 (os jogos de rondas e a Memória ganham as suas definições, com o relógio ligado como todos começam; o Mahjong desligado e sem recorde). Antes de mudar outra vez a forma dos dados é preciso subir `ProfilesUtils.getDataVersion()` **e** acrescentar um passo em `MigrationsUtils`, senão as crianças perdem o progresso.
- Dados ilegíveis recomeçam do zero. Dados de uma versão **mais nova** não são lidos nem reescritos: a app corre em memória e avisa no ecrã inicial (protege o progresso de uma versão antiga em cache).
- Se o browser bloquear o armazenamento, a app funciona só em memória e avisa no ecrã inicial.

### PWA e deploy

- `public/manifest.webmanifest` (nome, cores, `display: standalone`, ícones `any` e `maskable`), `apple-touch-icon` e meta tags do iOS em `index.html`.
- **Ícones:** o Faísca plano (o desenho da cabeça da mascote, sem contornos) num quadrado amarelo `#FFC83D` de cantos arredondados. `public/favicon.svg` é esse ícone (viewBox 160, `rx` 35, a cabeça em `translate(12 14.7) scale(0.85)`), com `icons/favicon-32.png` como alternativa para browsers sem favicon em SVG; `icon-192`, `icon-512`, `icon-maskable-512` e `apple-touch-icon` são o mesmo desenho (o `maskable` e o da Apple com o amarelo até às margens).
- **Metadados** (iguais em todo o lado; mudar um é mudar todos): nome «Faísca · Contas» (`<title>`, `name` do manifest, Open Graph); por baixo do ícone no ecrã principal fica só «Faísca» (`short_name`, `apple-mobile-web-app-title`), porque o iPhone e o Android cortam a partir de uns 12 caracteres. Autor João Melo (`<meta name="author">`, `package.json`, README). Descrição: «Somas, subtrações, tabuadas e divisões para praticar a brincar, com a ajuda do Faísca. Grátis, sem anúncios e funciona sem internet.» (HTML, manifest, Open Graph, `package.json`, descrição do repositório no GitHub). Manifest com `id` (igual ao `start_url`, para a app instalada não mudar de identidade), `categories` (education, kids, games), `dir` e sem `orientation` (os tablets usam-se deitados). No HTML, `mobile-web-app-capable` ao lado do antigo `apple-mobile-web-app-capable`, e o `canonical`.
- **Pré-visualização do link** (`public/og-image.png`, 1200×630, Open Graph e `twitter:card`): fundo creme, o ícone da app, o nome em Nunito e os sinais + − × ÷ nas cores de cada operação, no estilo plano da app. As outras páginas só lêem endereços absolutos, por isso `og:url`, `og:image` e o `canonical` apontam para <https://joaommmelo.github.io/faisca-project/>: se a app mudar de endereço, mudam também.
- O plugin `serviceWorker()` em `vite.config.ts` escreve `sw.js` a partir de `pwa/service-worker.js`, com a lista exacta dos ficheiros do build e de `public/` e uma versão que muda quando qualquer ficheiro muda. A página vai primeiro à rede (uma versão nova aparece logo que há ligação) e usa a cópia guardada sem rede; os ficheiros com hash vêm da cache. Só é registado no build de produção (`src/main.tsx`).
- O build vai para `docs/` (`build.outDir`), com `.nojekyll`, e é publicado pelo GitHub Pages a partir da branch. `docs/` é gerado: nunca editar à mão.
- **Sugestão de instalação** (`InstallCard` no `WelcomeScreen`, antes do primeiro perfil): no Chrome e afins, o botão «Instalar» abre o diálogo do browser (`beforeinstallprompt`, guardado ao nível do módulo em `useInstallPrompt` porque chega quando o browser quer, muitas vezes a meio de uma sessão); no iPhone e no iPad, os passos (Partilhar, ou o menu ⋯ no iOS 26, → «Adicionar ao ecrã principal»); noutros Android, o menu ⋮. Não aparece quando a app já corre do ecrã principal. Tem de vir antes do progresso porque no iOS a app instalada **não partilha o `localStorage` com o Safari**: começa vazia. Por isso, no ecrã inicial só aparece o botão de um toque, e só onde o browser oferece o diálogo (no Android o progresso é o mesmo); no iOS não se sugere a quem já tem progresso.

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
- **Formatação:** o código segue o prettier com `--tab-width 4 --print-width 160 --trailing-comma none` (sem ficheiro de configuração; é só uma ferramenta, não uma dependência).
- **Nada de nomes `useX` fora dos hooks:** o lint de React trata `Utils.useX` como hook (por isso `SessionUtils.registerHelp`).
- **Texto:** nada de texto escrito nos componentes. Tudo o que a app diz está nas cópias (`src/copy/<língua>.ts`), que implementam a interface `Copy`: o `tsc` falha se faltar um texto numa língua. `Messages` decide o que dizer e chama a cópia da língua actual; as etiquetas fixas (botões, títulos, `aria-label`) vêm de `Messages.getLabels()`. Plurais e artigos ficam em cada cópia (as funções recebem números e chaves, não frases feitas). Um texto novo entra na interface e nas seis cópias. Em todas as línguas: curto, positivo e **neutro em género** para a criança (nada de «pronto/pronta», «obrigado/a», «bravo/brava», «prêt/prête»; «O teu progresso, Rita»). O Faísca é masculino e o nome não se traduz.
- Código, identificadores, comentários e mensagens de commit em inglês; UI e documentação em PT-PT.

## Ideias para depois (não pedidas)

- Exportar e importar o progresso de um perfil (cópia de segurança, mudar de dispositivo sem conta).
- Multiplicação e divisão na vertical, e depois divisões com números maiores.
- Pré-visualizar no mapa as tabuadas seleccionadas.
