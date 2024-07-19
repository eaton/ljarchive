import { z } from 'zod';

export function oneOrMany<T extends z.ZodTypeAny>(schema: T) {
  return schema
    .or(z.array(schema))
    .transform(i => (i !== undefined && Array.isArray(i) ? i : [i]));
}
