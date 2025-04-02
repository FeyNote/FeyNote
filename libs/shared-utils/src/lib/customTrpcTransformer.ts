/* eslint-disable @typescript-eslint/no-explicit-any */

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

    if (dateFields.has(key)) {
      payload[key] = new Date(value);
    } else if (binFields.has(key)) {
      payload[key] = base64ToUint8Array(value);
    } else if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === 'object') {
          hydratePojo(item);
        }
      }
    } else if (typeof value === 'object') {
      hydratePojo(value);
    }
  }
  return payload as T;
}

function dehydratePojo<T>(payload: Record<string, any>): T {
  for (const key in payload) {
    const value = payload[key];
    if (!value) continue;

    if (dateFields.has(key)) {
      payload[key] = value.toISOString();
    } else if (binFields.has(key)) {
      payload[key] = uint8ArrayToBase64(value);
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
