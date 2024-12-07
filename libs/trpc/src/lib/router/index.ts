import { router, publicProcedure } from '../trpc';
import { userRouter } from './user/userRouter';
import { artifactRouter } from './artifact/artifactRouter';
import { aiRouter } from './ai/aiRouter';
import { artifactShareRouter } from './artifactShare/artifactShareRouter';
import { artifactShareTokenRouter } from './artifactShareToken/artifactShareTokenRouter';
import { fileRouter } from './file/fileRouter';

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
  ai: aiRouter,
  file: fileRouter,
});

export type AppRouter = typeof appRouter;
