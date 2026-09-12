import express from 'express';
import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';
import { env } from './lib/env.js';
import { UPLOADS_DIR } from './lib/uploads.js';
import { attachAdmin, attachUser } from './middleware/auth.js';
import { authRouter } from './routes/auth.js';
import { booksRouter } from './routes/books.js';
import { bidsRouter } from './routes/bids.js';
import { adminRouter } from './routes/admin.js';
import { wishlistRouter } from './routes/wishlist.js';
import { registerSockets } from './sockets/index.js';

const app = express();
if (env.isProduction) {
  // Render (and most PaaS hosts) sit behind a reverse proxy — without this,
  // express-rate-limit sees the proxy's IP for every request and either
  // lumps all users into one shared rate-limit bucket or throws a
  // validation error reading X-Forwarded-For.
  app.set('trust proxy', 1);
}
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: env.clientOrigin, credentials: true },
});
app.set('io', io);

app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(attachUser);
app.use(attachAdmin);
app.use('/uploads', express.static(UPLOADS_DIR));

// Generous and IP-keyed: this is a backstop against runaway/scripted abuse,
// not per-user throttling (bids are limited per-user separately, see
// bids.ts) — many attendees at a live event can share one venue WiFi NAT,
// so a tight IP-keyed limit here would collide unrelated users together.
const apiLimiter = rateLimit({ windowMs: 60_000, limit: 1200, standardHeaders: true, legacyHeaders: false });
app.use('/api', apiLimiter);

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRouter);
app.use('/api/books', booksRouter);
app.use('/api/books', bidsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/wishlist', wishlistRouter);

// In production, the client is built into ../client/dist and served from
// this same origin — this avoids CORS and cross-site cookie complications
// for a stack that must Just Work during a short, high-traffic live event.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
if (env.isProduction && fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/socket.io')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

registerSockets(io);

server.listen(env.port, () => {
  console.log(`XacReBook server listening on port ${env.port} (${env.nodeEnv})`);
});
