import { program } from 'commander';
import { reindexArtifacts } from './reindexArtifacts';
import { convertMessagesV4ToV5 } from './convertMessagesV4ToV5';
import { decryptDebugDump } from './decryptDebugDump';
import { searchProvider } from '@feynote/search';
import { cleanupJobs } from './cleanupJobs';

program
  .command('migrateSearchProvider')
  .description('Performs search provider migrations')
  .action(async () => {
    await searchProvider.migrate();
  });

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

program
  .command('migrateVercelV5')
  .option(
    '--page-size <number>',
    'How many messages to migrate per batch',
    '100',
  )
  .option(
    '--cooldown <number>',
    'How long to wait between indexing each artifact in milliseconds',
    '50',
  )
  .description('Migrate all messages from v4 to v5 format')
  .action((options) => {
    const pageSize = parseInt(options.pageSize);
    const cooldown = parseInt(options.cooldown);

    convertMessagesV4ToV5(pageSize, cooldown, true);
  });


program
  .command('cleanupJobs')
  .option(
    '--delete-after-days <number>',
    'How many days past the last updated at to delete the job',
    '30',
  )
  .option(
    '--timeout-after-minutes <number>',
    'How long a job can stay idle before its marked as failed',
    '20',
  )
  .description('Cleans up the jobs')
  .action((options) => {
    const deleteAfterDays = parseInt(options.deleteAfterDays);
    const timeoutAfterMinutes = parseInt(options.timeoutAfterMinutes);

    cleanupJobs({deleteAfterDays, timeoutAfterMinutes});
  });

program
  .command('decryptDebugDump')
  .option(
    '--filename <string>',
    'The path to the encrypted dump file',
    'encrypted-dump.json',
  )
  .option(
    '--outFilename <string>',
    'The path to the encrypted dump file',
    'decrypted-dump.json',
  )
  .description('Decrypt an encrypted debug dump file from Feynote')
  .action((options) => {
    decryptDebugDump({
      filename: options.filename,
      outFilename: options.outFilename,
    });
  });

program.parse(process.argv);
