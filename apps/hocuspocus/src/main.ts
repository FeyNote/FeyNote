import './instrument.ts';
import { hocuspocusServer } from './server';
import { globalServerConfig } from '@feynote/config';
import { setupMinimalMetricsServer } from '@feynote/api-services';

hocuspocusServer.listen();

setupMinimalMetricsServer({
  port: globalServerConfig.hocuspocus.restPort,
});
