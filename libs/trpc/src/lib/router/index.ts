import { router, publicProcedure } from '../trpc';
import { userRouter } from './user/userRouter';
import { artifactRouter } from './artifact/artifactRouter';
import { aiRouter } from './ai/aiRouter';
import { fileRouter } from './file/fileRouter';
import { paymentRouter } from './payment/paymentRouter';

export const appRouter = router({
  health: publicProcedure.query(() => {
    return {
      message: 'OK',
    };
  }),
  user: userRouter,
  artifact: artifactRouter,
  ai: aiRouter,
  file: fileRouter,
  payment: paymentRouter,
});

export type AppRouter = typeof appRouter;
