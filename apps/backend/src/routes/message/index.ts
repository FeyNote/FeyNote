import express from 'express';
import { createMessage } from './createMessage';

const messageRouter = express.Router();

messageRouter.post('/', createMessage);

export { messageRouter };
