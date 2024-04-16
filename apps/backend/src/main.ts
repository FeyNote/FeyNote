import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter, createContext } from '@feynote/trpc';

const app = express();

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

const port = process.env.PORT || 3001;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
