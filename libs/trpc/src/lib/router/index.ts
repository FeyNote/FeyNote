import { router, publicProcedure } from '../trpc';
import { userRouter } from './user/userRouter';
import { artifactRouter } from './artifact/artifactRouter';
import { aiRouter } from './ai/aiRouter';
import { artifactShareRouter } from './artifactShare/artifactShareRouter';
import { artifactShareTokenRouter } from './artifactShareToken/artifactShareTokenRouter';
import { fileRouter } from './file/fileRouter';
import { paymentRouter } from './payment/paymentRouter';
import { artifactCollectionRouter } from './artifactCollection/artifactCollectionRouter';

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
  artifactCollection: artifactCollectionRouter,
  ai: aiRouter,
  file: fileRouter,
  payment: paymentRouter,
});

export type AppRouter = typeof appRouter;
