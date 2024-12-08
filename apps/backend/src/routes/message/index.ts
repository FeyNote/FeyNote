import express from 'express';
import { createMessage } from './createMessage';
import { validateToken } from '@feynote/api-services';

const router = express.Router();

router.post('/', validateToken, createMessage);

export default router;
