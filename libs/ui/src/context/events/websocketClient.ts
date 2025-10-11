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
  eventManager.broadcast(EventName.WebsocketStatusChanged);
});

socket.on('reconnect', () => {
  console.log('Reconnected to websocket server');

  eventManager.broadcast(EventName.WebsocketReconnect);
  eventManager.broadcast(EventName.WebsocketStatusChanged);
});

socket.on('connect', () => {
  console.log('Connected to websocket server');

  eventManager.broadcast(EventName.WebsocketStatusChanged);
});

socket.on('connect_error', () => {
  console.log('Error connecting to websocket server');

  eventManager.broadcast(EventName.WebsocketStatusChanged);
});

socket.on('connect_timeout', () => {
  console.log('Error connecting to websocket server');

  eventManager.broadcast(EventName.WebsocketStatusChanged);
});

socket.on('reconnect_error', () => {
  console.log('Error connecting to websocket server');

  eventManager.broadcast(EventName.WebsocketStatusChanged);
});

socket.on(EventName.ArtifactUpdated, (data) => {
  eventManager.broadcast(EventName.ArtifactUpdated, data);
});

socket.on(EventName.ThreadUpdated, (data) => {
  eventManager.broadcast(EventName.ThreadUpdated, data);
});

export const websocketClient = socket;
