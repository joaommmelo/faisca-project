# Faísca

**Acende o teu talento!** — uma web app para crianças praticarem as tabuadas do 1 ao 12, com a ajuda do Faísca, um cão castanho que celebra cada progresso.

- Perguntas directas (`7 × 8 = ?`) e inversas (`? × 8 = 56`, `7 × ? = 56`).
- Escolha múltipla para contas novas ou difíceis; teclado numérico próprio para as que já estão a ficar sabidas.
- Repetição espaçada com caixas de Leitner (1 a 5), por perfil.
- Vários perfis no mesmo dispositivo; tudo guardado localmente (`localStorage`), sem contas nem servidor.

## Correr

Requer Node 20.19+ (testado com Node 24).

```bash
npm install
npm run dev        # http://localhost:5173
```

Para experimentar num tablet ou telemóvel na mesma rede: `npm run dev -- --host`.

## Testar

```bash
npm test           # Vitest, uma vez
npm run test:watch # Vitest em modo watch
npm run build      # verifica os tipos (tsc) e gera dist/
```

Os testes cobrem o motor (`src/utils/`): factos, distratores, caixas de Leitner, sessão, estatísticas, perfis e armazenamento.

## Deploy

O `npm run build` gera um site estático em `dist/` com caminhos relativos, por isso funciona tanto na raiz de um domínio como num subcaminho.

- **GitHub Pages:** o workflow `.github/workflows/deploy.yml` corre os testes, faz o build e publica. Por agora corre só à mão (*Actions → Deploy to GitHub Pages → Run workflow*), porque o repositório é privado e o Pages em repositórios privados exige GitHub Pro. Com o repositório público, activar em *Settings → Pages → Source: GitHub Actions* e acrescentar `push: branches: [main]` ao `on:` do workflow para publicar a cada push.
- **Netlify:** ligar o repositório com *Build command* `npm run build` e *Publish directory* `dist`.

## Como está organizado

```text
src/
  utils/        motor e lógica, sem React (cada pasta tem utils.ts + utils.test.ts)
    facts/        os 78 factos únicos (a × b com a ≤ b)
    leitner/      caixas 1–5 e peso de sorteio
    questions/    pergunta directa/inversa e formato de resposta
    distractors/  opções credíveis: vizinhos na tabuada, ±1, dígitos trocados
    session/      10 perguntas, repetição dos erros mais à frente, resumo
    stats/        jogos, dias de prática e dias seguidos
    profiles/     perfis e definições; storage/ guarda tudo no localStorage
    messages.ts   as frases do Faísca, em PT-PT
  components/   peças de UI (mascote, teclado, mapa…)
  screens/      ecrãs: boas-vindas, início, sessão, resumo, progresso
```

### Regras do motor

- Cada facto começa por praticar (cinzento no mapa). Certo → sobe uma caixa; errado → volta à caixa 1.
- O sorteio de cada sessão é ponderado por `1 / caixa`; factos com 1 ou 10 pesam 30%.
- Caixa 3 ou mais (duas certas seguidas) → resposta no teclado; abaixo disso → escolha múltipla.
- Um erro volta a aparecer 3 perguntas depois, uma vez, sem contar para a pontuação nem mexer na caixa.
- A sequência de dias só aparece quando está activa; falhar um dia não mostra mensagens nem tira nada.
