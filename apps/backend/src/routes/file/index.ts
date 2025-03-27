import express from 'express';
import { goToFileUrlByIdHandler } from './goToFileUrlByIdHandler';

const fileRouter = express.Router();

fileRouter.get('/:id/redirect', ...goToFileUrlByIdHandler);

export { fileRouter };
