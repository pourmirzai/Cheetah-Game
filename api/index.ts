import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "../server/routes";
// Avoid importing server/vite at top-level because it uses import.meta
// which prevents bundling to CommonJS. We'll lazy-import it in non-Vercel mode.

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: false }));

// Add caching headers for static assets
app.use('/assets', (req, res, next) => {
  // Cache static assets for 1 hour
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.setHeader('Expires', new Date(Date.now() + 3600000).toUTCString());
  next();
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      // Simple logger here to avoid importing server/vite during bundling
      try { console.log(logLine); } catch (e) { /* ignore */ }
    }
  });

  next();
});

// When running as a Vercel serverless function the platform already
// routes requests under `/api/*` to this file. Registering routes
// with a `/api` prefix in that environment would produce paths like
// `/api/api/game/start` which leads to 404s. Use an empty prefix on
// Vercel and `/api` for local/standalone server mode.
const prefix = process.env.VERCEL ? '' : '/api';
console.log(`[Vercel API] Registering routes with prefix: ${prefix}`);
// Add defensive global handlers so logs capture async failures
process.on('unhandledRejection', (reason) => {
  try { console.error('[Vercel API] unhandledRejection:', reason); } catch (e) { /* ignore */ }
});
process.on('uncaughtException', (err) => {
  try { console.error('[Vercel API] uncaughtException:', err && (err.stack || err.message || err)); } catch (e) { /* ignore */ }
});

let _initialized = false;
async function initOnce() {
  if (_initialized) return;
  await registerRoutes(app, prefix);
  _initialized = true;
}

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
  throw err;
});

// importantly only setup vite in development and after
// setting up all the other routes so the catch-all route
// doesn't interfere with the other routes

// For Vercel serverless functions
if (process.env.VERCEL) {
  serveStatic(app);
}

export default async function handler(req: Request, res: Response) {
  try {
    console.log(`[Vercel API] Incoming request: ${req.method} ${req.url} (path: ${req.path})`);
    try { console.log('[Vercel API] Headers:', JSON.stringify(req.headers)); } catch (e) { console.log('[Vercel API] Could not stringify headers', e); }

    await initOnce();

    try {
      return app(req, res);
    } catch (innerErr) {
      console.error('[Vercel API] Sync error while invoking app:', innerErr && (((innerErr as any).stack) || ((innerErr as any).message) || innerErr));
      try {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end('Internal server error (handler sync): ' + (innerErr && (((innerErr as any).stack) || ((innerErr as any).message) || String(innerErr))));
      } catch (sendErr) {
        console.error('[Vercel API] Failed to send error response', sendErr);
      }
      throw innerErr;
    }
  } catch (e) {
    console.error('[Vercel API] handler outer error', e && (((e as any).stack) || ((e as any).message) || e));
    try { res.status(500).send('Internal server error'); } catch (_) { /* nothing */ }
    throw e;
  }
}

// Local development/production server (not Vercel)
if (!process.env.VERCEL) {
  (async () => {
    const port = parseInt(process.env.PORT || '5000', 10);
    const server = createServer(app);

    // Lazy import server/vite only for local dev so bundling works for production
    try {
      const { setupVite, serveStatic, log: viteLog } = await import('../server/vite');
      if (app.get("env") === "development") {
        await setupVite(app, server);
      } else {
        serveStatic(app);
      }
      try { viteLog(`serving on port ${port}`); } catch { console.log(`serving on port ${port}`); }
    } catch (err) {
      // If dynamic import fails, fall back to static serving
      try { console.warn('Failed to load server/vite, falling back to static serve', err); } catch {}
    }

    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    });
  })();
}
