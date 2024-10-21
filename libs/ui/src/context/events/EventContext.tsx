import { createContext } from 'react';
import { eventManager } from './EventManager';

export const EventContext = createContext({
  eventManager,
});
