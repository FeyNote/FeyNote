import express from 'express';
import { desktopGoogleInitiateHandler } from './desktopGoogleInitiate';
import { desktopGoogleCallbackHandler } from './desktopGoogleCallback';

const authRouter = express.Router();

authRouter.get('/desktop-google', ...desktopGoogleInitiateHandler);
authRouter.get('/desktop-google/callback', ...desktopGoogleCallbackHandler);

export { authRouter };
