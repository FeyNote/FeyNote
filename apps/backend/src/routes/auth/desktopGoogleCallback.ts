import crypto from 'node:crypto';
import { z } from 'zod';
import { OAuth2Client } from 'google-auth-library';
import {
  AuthenticationEnforcement,
  defineExpressHandler,
} from '@feynote/api-services';
import { globalServerConfig } from '@feynote/config';

const schema = {
  query: z.object({
    code: z.string(),
    state: z.string(),
  }),
};

export const desktopGoogleCallbackHandler = defineExpressHandler(
  {
    schema,
    authentication: AuthenticationEnforcement.None,
  },
  async function _desktopGoogleCallback(req, res) {
    const { clientId, clientSecret } = globalServerConfig.google;
    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth is not configured');
    }

    const { code, state } = req.query;

    const parts = state.split('.');
    if (parts.length !== 2) {
      res.status(400).send('Invalid state parameter');
      return;
    }
    const [timestamp, hmac] = parts;
    if (!/^[0-9a-f]{64}$/.test(hmac)) {
      res.status(400).send('Invalid state parameter');
      return;
    }
    const expectedHmac = crypto
      .createHmac('sha256', clientSecret)
      .update(timestamp)
      .digest('hex');
    if (
      !crypto.timingSafeEqual(
        Buffer.from(hmac, 'hex'),
        Buffer.from(expectedHmac, 'hex'),
      )
    ) {
      res.status(400).send('Invalid state signature');
      return;
    }
    const age = Date.now() - parseInt(timestamp, 10);
    if (age > 10 * 60 * 1000) {
      res.status(400).send('State expired');
      return;
    }

    const redirectUri = `${globalServerConfig.api.publicUrl}/auth/desktop-google/callback`;
    const client = new OAuth2Client(clientId, clientSecret, redirectUri);

    let idToken: string;
    try {
      const { tokens } = await client.getToken(code);
      if (!tokens.id_token) {
        res.status(400).send('No ID token received from Google');
        return;
      }
      idToken = tokens.id_token;
    } catch {
      res.status(400).send('Failed to exchange authorization code');
      return;
    }

    const ticket = await client.verifyIdToken({
      idToken,
      audience: clientId,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      res.status(400).send('No email in token payload');
      return;
    }

    const authCodePayload = Buffer.from(
      JSON.stringify({
        email: payload.email,
        name: payload.name || payload.email,
        exp: Date.now() + 60_000,
      }),
    ).toString('base64url');
    const authCodeHmac = crypto
      .createHmac('sha256', clientSecret)
      .update(authCodePayload)
      .digest('hex');
    const authCode = `${authCodePayload}.${authCodeHmac}`;

    const protocolUrl = new URL('feynote://auth');
    protocolUrl.searchParams.set('code', authCode);

    const html = `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>FeyNote</title></head>
<body style="font-family:system-ui,sans-serif;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;color:#333;">
<p>Redirecting to FeyNote Desktop... You can close this tab.</p>
<script>window.location.href=${JSON.stringify(protocolUrl.toString())};</script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(html);
  },
);
