import express from 'express';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appRouter, createContext } from '@feynote/trpc';
import message from './routes/message';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.urlencoded());
app.use(bodyParser.json());

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.use('/message', message);

const port = process.env.PORT || 3001;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
