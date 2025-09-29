import express from 'express';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createServer as createViteServer } from 'vite';

const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 3000;

async function createServer() {
  const app = express();

  let vite: ReturnType<typeof createViteServer> | undefined;
  if (!isProduction) {
    // In dev mode, use Vite middleware
    vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve static files
    app.use(express.static('dist/client'));
  }

  // Catch-all handler for SPA routing
  app.use(async (req, res, next) => {
    // Skip static files and API routes
    if (req.path.startsWith('/_next') || req.path.startsWith('/api') || req.path.includes('.')) {
      return next();
    }
    try {
      const url = req.originalUrl;

      let template: string;
      let render: (
        url: string,
      ) => Promise<{ html: string; headTags: string; dehydratedState: unknown }>;

      if (!isProduction && vite) {
        // In dev mode, load the SSR module
        const rootTemplate = await readFile(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, rootTemplate);
        render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render;
      } else {
        // In production, load the built server bundle
        const entryUrl = pathToFileURL(path.resolve(process.cwd(), 'dist/server/server.js')).href;
        const serverModule = await import(entryUrl);
        template = await readFile(path.resolve(process.cwd(), 'dist/client/index.html'), 'utf-8');
        render = serverModule.render;
      }

      const { html, headTags, dehydratedState } = await render(url);

      // Inject the rendered HTML and dehydrated state
      const finalHtml = template
        .replace('<!--app-html-->', html)
        .replace('<!--head-tags-->', headTags)
        .replace('<!--dehydrated-state-->', JSON.stringify(dehydratedState));

      res.status(200).set({ 'Content-Type': 'text/html' }).end(finalHtml);
    } catch (e: unknown) {
      if (!isProduction && vite && e instanceof Error) {
        vite.ssrFixStacktrace(e);
      }
      const errorMessage = e instanceof Error ? e.stack : String(e);
      console.log(errorMessage);
      res.status(500).end(errorMessage);
    }
  });

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}

createServer();
