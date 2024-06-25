import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter, createContext } from '@feynote/trpc';
import cors from 'cors';

const app = express();

const defaultCorsAllowlist = [
  'https://feynote.com',
  'https://beta.feynote.com',
  'https://staging.feynote.com',
];

const hostMatch = (pattern: string, origin: string) => {
  if (pattern.endsWith('*')) {
    return origin.startsWith(pattern.substring(0, pattern.length - 1));
  }

  return origin === pattern;
};

const corsOptions = {
  origin: (origin, callback) => {
    const allowCors =
      origin &&
      defaultCorsAllowlist.some((pattern) => hostMatch(pattern, origin));
    callback(null, allowCors);
  },
} satisfies cors.CorsOptions;

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

const port = process.env.PORT || 8080;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
