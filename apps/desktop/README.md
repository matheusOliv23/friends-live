# Nexus Stream Desktop (Windows)

Cliente Windows do Nexus Stream. Abre o estúdio `/stream` para transmitir e também `/watch` para assistir, na mesma janela do app.

## Requisitos

- Node 22+
- Backend web rodando (local ou Vercel) com as mesmas env vars
- `HOST_COOKIE_SECRET` **igual** ao do backend (para injetar o cookie do host)

## Env

O build embute `apps/desktop/.env` (ou o `.env` da raiz) no processo main do Electron.
Para apontar à Vercel no `.exe` (dois cliques):

```env
NEXUS_SITE_URL=https://friends-live.vercel.app
HOST_COOKIE_SECRET=igual-ao-da-vercel
```

Depois: `npm run build`. Em dev local sem `.env`, ainda dá para sobrescrever no shell.

## Dev

```bash
# na raiz do monorepo (web em :3000) e em outro terminal:
npm run desktop:dev
```

## Build Windows

```bash
npm run desktop:build
```

Artefatos em `apps/desktop/release/` (instalador NSIS + portable).

## Auto-update (GitHub Releases)

O app usa `electron-updater` com o **Setup NSIS** (Portable não atualiza sozinho).

1. Crie um [Personal Access Token](https://github.com/settings/tokens) com `repo` (ou `contents:write` + releases).
2. Publique a versão:

```bash
# PowerShell
$env:GH_TOKEN="seu_token"
# suba a versão em apps/desktop/package.json (ex.: 0.1.1 → 0.1.2)
npm run desktop:release
```

Isso gera o Setup/Portable e cria/atualiza um **GitHub Release** em `matheusOliv23/friends-live` com `latest.yml`.

3. Amigos instalam o **Setup** uma vez. Nas próximas aberturas o app checa update, baixa e pede para reiniciar.

Releases: https://github.com/matheusOliv23/friends-live/releases

## Fluxos

1. **Criar transmissão** neste app → gera sala na API → abre `/stream/{id}` com cookie de host → amigos usam `/watch` no navegador.
2. **Criar no web** → em `/stream` clique **Abrir no app Windows** (deep link com handoff do hostToken).
3. Deep link: `nexus://stream/{roomId}` ou `nexus://stream/{roomId}?ht={hostToken}`.

## Áudio sem eco no Discord

Padrão: **Áudio só do app** (WASAPI process loopback). Escolha a **janela do jogo** no seletor — o áudio da live vem só daquele processo; Discord fica de fora.

Outros modos: sistema inteiro, só vídeo, ou VB-Cable.

Requer Windows 10 2004+ (build 20348+ para process loopback).
