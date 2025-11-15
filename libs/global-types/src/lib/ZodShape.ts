import type { ZodOptional, ZodType } from 'zod';

/**
 * From https://github.com/colinhacks/zod/issues/372#issuecomment-830713601
 */
export type ZodShape<T> = {
  // Require all the keys from T
  [key in keyof T]-?: undefined extends T[key]
    ? // When optional, require the type to be optional in zod
      ZodOptional<ZodType<T[key]>>
    : ZodType<T[key]>;
};
