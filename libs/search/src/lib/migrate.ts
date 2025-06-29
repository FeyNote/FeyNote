import { searchProvider } from './search';
import { logger } from '@feynote/api-services';

(async () => {
  await searchProvider.migrate();

  logger.info('Migration completed.');

  process.exit(0);
})();
