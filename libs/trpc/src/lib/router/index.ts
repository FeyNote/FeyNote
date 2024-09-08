import { router, publicProcedure } from '../trpc';
import { userRouter } from './user/userRouter';
import { artifactRouter } from './artifact/artifactRouter';
import { aiRouter } from './ai/aiRouter';
import { artifactPinRouter } from './artifactPin/artifactPinRouter';
import { artifactShareRouter } from './artifactShare/artifactShareRouter';

export const appRouter = router({
  health: publicProcedure.query(() => {
    return {
      message: 'OK',
    };
  }),
  user: userRouter,
  artifact: artifactRouter,
  artifactPin: artifactPinRouter,
  artifactShare: artifactShareRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
