import { router, publicHocuspocusTrpcProcedure } from '../hocuspocusTrpc';
import { docRouter } from './doc/docRouter';

export const hocuspocusTrpcAppRouter = router({
  health: publicHocuspocusTrpcProcedure.query(() => {
    return {
      message: 'OK',
    };
  }),
  doc: docRouter,
});

export type HocuspocusTrpcAppRouter = typeof hocuspocusTrpcAppRouter;
