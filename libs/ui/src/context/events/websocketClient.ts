import { io } from 'socket.io-client';
import { appIdbStorageManager } from '../../utils/localDb/AppIdbStorageManager';
import { eventManager } from './EventManager';
import { EventName } from './EventName';
import { getApiUrls } from '../../utils/getApiUrls';

const url = new URL(getApiUrls().websocket);

const socket = io(url.origin, {
  reconnectionDelayMax: 10000,
  transports: ['websocket'],
  path: url.pathname,
  auth: async (cb) => {
    const session = await appIdbStorageManager.getSession();

    if (!session) {
      return cb({
        token: null,
      });
    }

    return cb({
      token: session.token,
    });
  },
});

socket.on('error', () => {
  console.log('Websocket connection error');

  eventManager.broadcast(EventName.WebsocketError);
});

socket.on('reconnect', () => {
  console.log('Reconnected to websocket server');

  eventManager.broadcast(EventName.WebsocketReconnect);
});

socket.on(EventName.ArtifactUpdated, (data) => {
  eventManager.broadcast(EventName.ArtifactUpdated, data);
});

socket.on(EventName.ThreadUpdated, (data) => {
  eventManager.broadcast(EventName.ThreadUpdated, data);
});

export const websocketClient = socket;
