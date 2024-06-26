import express from 'express';
import { createMessage } from './createMessage';

const router = express.Router();

router.post('/', createMessage);

export default router;
