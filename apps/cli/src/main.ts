import { program } from 'commander';
import { reindexArtifacts } from './reindexArtifacts';

program
  .command('reindex')
  .option('--user-id <userId | all>', 'User ID to reindex or "all"', 'all')
  .option(
    '--page-size <number>',
    'How many artifacts to reindex per batch',
    '100',
  )
  .option(
    '--cooldown <number>',
    'How long to wait between indexing each artifact in milliseconds',
    '50',
  )
  .description('Reindex all artifacts, or for a specific user ID')
  .action((options) => {
    const userId = options.userId === 'all' ? undefined : options.userId;
    const pageSize = parseInt(options.pageSize);
    const cooldown = parseInt(options.cooldown);

    reindexArtifacts(userId, false, pageSize, cooldown);
  });

program.parse(process.argv);
