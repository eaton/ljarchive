import dayjs from 'dayjs';
import { X2jOptions, XMLParser } from 'fast-xml-parser';
import { z } from 'zod';

export const file = {
  parse: function (input: string | Buffer, options: X2jOptions = {}) {
    const parser = new XMLParser(options);
    return parser.parse(input.toString());
  }
}

function oneOrMany<T extends z.ZodTypeAny>(schema: T) {
  return schema
    .or(z.array(schema))
    .transform(i => (i !== undefined && Array.isArray(i) ? i : [i]));
}

const pdate = z.string().transform(d => dayjs(d).toDate());

const comment = z.object({
  itemid: z.number(),
  parentId: z.number().optional(),
  event: z.string().optional(),
  eventtime: pdate,
  author: z.object({
    name: z.string(),
    email: z.string().optional()
  })
});

const event = z.object({
  itemid: z.number(),
  eventtime: pdate,
  subject: z.string().optional(),
  event: z.string().optional(),
  current_mood: z.string().optional(),
  current_music: z.string().optional(),
  comment: oneOrMany(comment).optional()
});

export const schema = z.object({
  livejournal: z.object({
    entry: oneOrMany(event)
  })
});

