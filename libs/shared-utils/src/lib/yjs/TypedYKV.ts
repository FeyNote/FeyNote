import type { TypedArray } from "yjs-types";

type StringKeyOf<T> = Extract<keyof T, string>;
export interface TypedYKV<Data> {
  delete<Key extends StringKeyOf<Data>>(key: Key): void;

  set<Key extends StringKeyOf<Data>>(key: Key, value: Data[Key]): Data[Key];

  get<Key extends StringKeyOf<Data>>(key: Key): Data[Key] | undefined;

  has<Key extends StringKeyOf<Data>>(key: Key): boolean;

  yarray: TypedArray<{
    key: string,
    val: Data
  }>;
}

