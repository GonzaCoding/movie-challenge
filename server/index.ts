import express from 'express';
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
    app.use(vite.ssrLoadModule);
  } else {
    // In production, serve static files
    app.use(express.static('dist/client'));
  }

  app.get('*', async (req, res) => {
    try {
      const url = req.originalUrl;

      let template: string;
      let render: (
        url: string,
      ) => Promise<{ html: string; headTags: string; dehydratedState: unknown }>;

      if (!isProduction && vite) {
        // In dev mode, load the SSR module
        template = await vite.transformIndexHtml(url, await vite.readFile('index.html', 'utf-8'));
        render = (await vite.ssrLoadModule('/src/entry-server.tsx')).render;
      } else {
        // In production, load the built server bundle
        const serverModule = await import('dist/server/entry-server.js');
        template = await import('index.html');
        render = serverModule.render;
      }

      const { html, headTags, dehydratedState } = await render(url);

      // Inject the rendered HTML and dehydrated state
      const finalHtml = template
        .replace('<!--app-html-->', html)
        .replace('<!--head-tags-->', headTags)
        .replace(
          '<script>',
          `<script>window.__DEHYDRATED_STATE__ = ${JSON.stringify(dehydratedState)};`,
        );

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
