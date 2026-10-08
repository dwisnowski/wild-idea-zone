import { projects, SITE_DOMAIN } from "../src/data/projects.ts";

const CANONICAL_HOST = `www.${SITE_DOMAIN}`;

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.hostname === SITE_DOMAIN) {
      url.hostname = CANONICAL_HOST;
      return Response.redirect(url.toString(), 301);
    }

    if (url.pathname === "/api/health") {
      return Response.json({ ok: true });
    }

    if (url.pathname === "/api/projects") {
      return Response.json(projects);
    }

    if (url.pathname.startsWith("/api/")) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
