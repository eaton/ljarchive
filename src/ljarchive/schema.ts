import { z } from "zod";

export function oneOrMany<T extends z.ZodTypeAny>(schema: T) {
  return schema
    .or(z.array(schema))
    .transform(i => (i !== undefined && Array.isArray(i) ? i : [i]));
}

export const ljArchiveSchema = z.object({
  options: z.object({}),
  moods: z.array(z.unknown()),
  users: z.array(z.unknown()),
  entries: z.array(z.unknown()),
  comments: z.array(z.unknown()),
})