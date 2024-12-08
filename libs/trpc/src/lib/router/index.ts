import { router, publicProcedure } from '../trpc';
import { userRouter } from './user/userRouter';
import { artifactRouter } from './artifact/artifactRouter';
import { aiRouter } from './ai/aiRouter';
import { importRouter } from './import/importRouter';
import { artifactShareRouter } from './artifactShare/artifactShareRouter';
import { artifactShareTokenRouter } from './artifactShareToken/artifactShareTokenRouter';

export const appRouter = router({
  health: publicProcedure.query(() => {
    return {
      message: 'OK',
    };
  }),
  user: userRouter,
  artifact: artifactRouter,
  artifactShare: artifactShareRouter,
  artifactShareToken: artifactShareTokenRouter,
  import: importRouter,
  ai: aiRouter,
});

export type AppRouter = typeof appRouter;
