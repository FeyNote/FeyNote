import express from 'express';
import { goToFileUrlByIdHandler } from './goToFileUrlByIdHandler';
import { createFileHandler } from './createFile';

const fileRouter = express.Router();

fileRouter.post('/', ...createFileHandler);
fileRouter.get('/:id/redirect', ...goToFileUrlByIdHandler);

export { fileRouter };
