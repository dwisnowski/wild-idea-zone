# wild-idea-zone

Main website for [www.wildideazone.com](https://www.wildideazone.com): a showcase of tech-focused DIY projects that links out to each project's own subdomain.

Single-page React app (Vite, Material UI, React Router) served by one Cloudflare Worker with static assets.

## Setup

```sh
source ~/.nvm/nvm.sh   # Node LTS is installed via nvm
npm install
```

## Develop

```sh
npm run dev            # http://localhost:5173 (runs the Worker locally via the Cloudflare Vite plugin)
npm run lint
npm run build          # typecheck + production build into dist/
```

## Deploy

```sh
npx wrangler login     # once
npm run deploy         # build + wrangler deploy
```

`npx wrangler deploy` on its own also works, but it deploys whatever is in `dist/`, so run `npm run build` first.

The Worker is attached to `www.wildideazone.com` and `wildideazone.com` as custom domains (see `wrangler.jsonc`). Wrangler creates the DNS records and certificates automatically; delete any existing DNS records for those two hostnames first. Requests to the bare domain are redirected to `www`.

## Adding a project

Edit [`src/data/projects.ts`](src/data/projects.ts) and add an entry to `projects`. Set `subdomain` to link to `https://<subdomain>.wildideazone.com`, and `featured: true` to show it on the home page.

## Layout

| Path | Purpose |
| --- | --- |
| `worker/index.ts` | Apex-to-www redirect, `/api/health`, `/api/projects`, then static assets |
| `src/data/` | Project list and status labels |
| `src/theme/` | MUI theme (light and dark color schemes) and the React Router link adapter |
| `src/components/` | Layout, theme toggle, project card, status chip |
| `src/pages/` | Home, Projects, ProjectDetail, About, NotFound |
