import { createContext } from 'react';
import { EventManager } from './EventManager';

export const EventContext = createContext({
  eventManager: new EventManager(),
});
