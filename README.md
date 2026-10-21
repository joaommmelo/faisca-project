# Faísca

Web app para crianças praticarem somas, subtrações, tabuadas e divisões com o Faísca, um cão castanho. React + TypeScript + Vite, sem backend: o progresso fica no `localStorage` do dispositivo. Instalável como app (PWA) e funciona sem rede.

As regras do motor, as decisões de produto e as convenções de código estão em [`CLAUDE.md`](CLAUDE.md).

## Correr

Requer Node 20.19+ (testado com Node 24).

```bash
npm install
npm run dev        # http://localhost:5173
```

Para experimentar num tablet ou telemóvel na mesma rede: `npm run dev -- --host`. O service worker só existe no build de produção; para o experimentar, `npm run build` e depois `npm run preview`.

## Testar

```bash
npm test           # Vitest, uma vez
npm run test:watch # Vitest em modo watch
npm run lint       # oxlint
npm run build      # verifica os tipos (tsc) e gera docs/
```

Os testes cobrem o motor (`src/utils/`): geradores por operação, competências, perguntas, distratores, sessão, níveis, moedas, desbloqueio, rede de segurança, ajudas, conta na vertical, perfis, armazenamento e a migração da v1.

## Deploy

O build é feito localmente e vai para a pasta `docs/`, com caminhos relativos, por isso funciona tanto na raiz de um domínio como num subcaminho.

**GitHub Pages**

1. `npm run build`
2. Commit e push da pasta `docs/` (com o resto das alterações).
3. Uma vez só: *Settings → Pages → Build and deployment → Source: Deploy from a branch*, escolher a branch e a pasta `/docs`.

O Pages publica `docs/` tal como está, por isso cada alteração à app precisa de um novo `npm run build` e de um commit de `docs/`. Num repositório privado, o Pages exige GitHub Pro.

**Netlify:** ligar o repositório com *Build command* `npm run build` e *Publish directory* `docs`.

## Instalar a app

A app tem de estar publicada em HTTPS (o GitHub Pages já o é).

- **iPhone e iPad (Safari):** abrir o site, tocar em *Partilhar* e depois em *Adicionar ao ecrã principal*. No iOS, os dados de um site aberto só no Safari são apagados ao fim de 7 dias sem uso; instalada no ecrã principal, a app guarda-os.
- **Android (Chrome):** abrir o site e tocar em *Instalar app* (ou, no menu ⋮, *Adicionar ao ecrã principal*).
- **Computador (Chrome ou Edge):** ícone de instalar na barra de endereço.

Depois da primeira visita a app abre sem rede. Quando há uma versão nova, aparece na abertura seguinte com ligação.

## Dados

- Guardados no `localStorage` do browser, na chave `faisca:data`, por perfil. Sem contas, sem servidor e sem exportação.
- Os dados da v1 são migrados automaticamente na primeira abertura da v2, sem perder progresso.
- Se o browser não deixar guardar (por exemplo, com os dados de sites bloqueados), a app funciona na mesma e avisa no ecrã inicial que o progresso não fica guardado.
