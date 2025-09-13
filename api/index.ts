import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { registerRoutes } from "../server/routes";
import { setupVite, serveStatic, log } from "../server/vite";

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

      log(logLine);
    }
  });

  next();
});

const prefix = process.env.VERCEL ? '' : '/api';
registerRoutes(app, prefix);

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

export default function handler(req: Request, res: Response) {
  return app(req, res);
}

// Local development/production server (not Vercel)
if (!process.env.VERCEL) {
  (async () => {
    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '5000', 10);
    const server = createServer(app);
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`serving on port ${port}`);
    });
  })();
}
