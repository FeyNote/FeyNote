import { searchProvider } from './search';

(async () => {
  await searchProvider.migrate();

  console.log('Migration completed.');

  process.exit(0);
})();
