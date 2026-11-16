# Nexus Stream Desktop (Windows)

Cliente **só anfitrião** para Windows. Usa a mesma API/LiveKit/Neon do site e abre o mesmo estúdio `/stream` (layout idêntico). Espectadores continuam no navegador em `/watch`.

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

## Fluxos

1. **Criar transmissão** neste app → gera sala na API → abre `/stream/{id}` com cookie de host → amigos usam `/watch` no navegador.
2. **Criar no web** → em `/stream` clique **Abrir no app Windows** (deep link com handoff do hostToken).
3. Deep link: `nexus://stream/{roomId}` ou `nexus://stream/{roomId}?ht={hostToken}`.

## Áudio sem eco no Discord

Padrão: **Áudio só do app** (WASAPI process loopback). Escolha a **janela do jogo** no seletor — o áudio da live vem só daquele processo; Discord fica de fora.

Outros modos: sistema inteiro, só vídeo, ou VB-Cable.

Requer Windows 10 2004+ (build 20348+ para process loopback).
