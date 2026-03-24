type StringKeyOf<T> = Extract<keyof T, string>;
export interface TypedMap<Data> {
  clone(): TypedMap<Data>;

  keys<Key extends StringKeyOf<Data>>(): IterableIterator<Key>;

  values<Key extends StringKeyOf<Data>>(): IterableIterator<Data[Key]>;

  entries<Key extends StringKeyOf<Data>>(): IterableIterator<[Key, Data[Key]]>;

  forEach<Key extends StringKeyOf<Data>>(
    f: (arg0: Data[Key], arg1: Key, arg2: TypedMap<Data>) => void,
  ): void;

  delete<Key extends StringKeyOf<Data>>(key: Key): void;

  set<Key extends StringKeyOf<Data>>(key: Key, value: Data[Key]): Data[Key];

  get<Key extends StringKeyOf<Data>>(key: Key): Data[Key] | undefined;

  has<Key extends StringKeyOf<Data>>(key: Key): boolean;

  [Symbol.iterator]<Key extends StringKeyOf<Data>>(): IterableIterator<
    [Key, Data[Key]]
  >;
}
