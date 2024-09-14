import { reindexAllArtifacts } from './reindexAllArtifacts';

if (process.argv[1] === '--reindexAllArtifacts') {
  reindexAllArtifacts(false);
} else {
  console.error('Unknown command');
}
