import crypto from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';
import {
  AuthenticationEnforcement,
  defineExpressHandler,
} from '@feynote/api-services';
import { globalServerConfig } from '@feynote/config';

export const desktopGoogleInitiateHandler = defineExpressHandler(
  {
    schema: {},
    authentication: AuthenticationEnforcement.None,
  },
  async function _desktopGoogleInitiate(req, res) {
    const { clientId, clientSecret } = globalServerConfig.google;
    if (!clientId || !clientSecret) {
      throw new Error('Google OAuth is not configured');
    }

    const redirectUri = `${globalServerConfig.api.publicUrl}/auth/desktop-google/callback`;
    const client = new OAuth2Client(clientId, clientSecret, redirectUri);

    const timestamp = Date.now().toString();
    const hmac = crypto
      .createHmac('sha256', clientSecret)
      .update(timestamp)
      .digest('hex');
    const state = `${timestamp}.${hmac}`;

    const authUrl = client.generateAuthUrl({
      scope: ['email', 'profile', 'openid'],
      state,
      access_type: 'online',
    });

    res.redirect(authUrl);
  },
);
