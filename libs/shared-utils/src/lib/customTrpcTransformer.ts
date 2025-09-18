/* eslint-disable @typescript-eslint/no-explicit-any */

import * as Sentry from '@sentry/browser';
import { uint8ArrayToBase64, base64ToUint8Array } from 'uint8array-extras';

const dateFields = new Set([
  'createdAt',
  'updatedAt',
  'deletedAt',
  'extendableUntil',
  'expiresAt',
  'artifactDeletedAt',
]);

const binFields = new Set(['yBin', 'treeYBin']);

function hydratePojo<T>(payload: Record<string, any>): T {
  for (const key in payload) {
    const value = payload[key];
    if (!value) continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'object') {
          hydratePojo(item);
        }
      }
    } else if (typeof value === 'object') {
      hydratePojo(value);
    }

    if (!key.startsWith('$')) continue;
    const replacedKey = key.substring(1);

    if (dateFields.has(replacedKey)) {
      payload[replacedKey] = new Date(value);
      delete payload[key];
    } else if (binFields.has(replacedKey)) {
      payload[replacedKey] = base64ToUint8Array(value);
      delete payload[key];
    }
  }
  return payload as T;
}

function dehydratePojo<T>(payload: Record<string, any>): T {
  for (const key in payload) {
    const value = payload[key];
    if (!value) continue;

    const replacementKey = `$${key}`;
    if (dateFields.has(key)) {
      if (value instanceof Date) {
        payload[replacementKey] = value.toISOString();
        delete payload[key];
      } else if (typeof value === 'string') {
        payload[replacementKey] = value;
        delete payload[key];
      } else if (typeof value === 'number') {
        // We don't transform number dates since we use this for snapshotting a lot.
        // You should not encounter this, but if you do I recommend using a string or a real date.
      } else {
        const e = new Error(
          `Expected a Date or string for key "${key}", but got ${typeof value} with value "${value}"`,
        );
        Sentry.captureException(e);
        console.error(e);
        throw e;
      }
    } else if (binFields.has(key)) {
      payload[replacementKey] = uint8ArrayToBase64(value);
      delete payload[key];
    } else if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'object') {
          dehydratePojo(item);
        }
      }
    } else if (typeof value === 'object') {
      dehydratePojo(value);
    }
  }
  return payload as T;
}

export const customTrpcTransformer = {
  // This function transforms data from complex to simple (network compatible) before sending
  serialize: (data: any) => dehydratePojo(data),
  // This function transforms data from simple (network compatible) to complex when it comes in
  deserialize: (data: any) => hydratePojo(data),
};
