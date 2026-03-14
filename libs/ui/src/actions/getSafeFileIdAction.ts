import { trpc } from '../utils/trpc';

export async function getSafeFileIdAction(): Promise<{ id: string }> {
  try {
    return await trpc.file.getSafeFileId.query();
  } catch {
    return { id: crypto.randomUUID() };
  }
}
