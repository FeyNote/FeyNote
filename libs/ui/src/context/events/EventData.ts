import {
  WebsocketMessageEvent,
  WebsocketMessageJSON,
} from '@feynote/global-types';
import { EventName } from './EventName';

export type EventData = {
  [EventName.ArtifactUpdated]: WebsocketMessageJSON[WebsocketMessageEvent.ArtifactUpdated];
  [EventName.ThreadUpdated]: WebsocketMessageJSON[WebsocketMessageEvent.ThreadUpdated];
  [EventName.WebsocketError]: void;
  [EventName.WebsocketReconnect]: void;
};
