import { router, publicProcedure } from '../trpc';
import { router as userRouter } from './user/router';
import { router as artifactRouter } from './artifact/router';

export const appRouter = router({
  health: publicProcedure.query(() => {
    return {
      message: 'OK',
    };
  }),
  user: userRouter,
  artifact: artifactRouter,
});

export type AppRouter = typeof appRouter;
