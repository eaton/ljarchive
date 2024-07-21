import dayjs from 'dayjs';
import { X2jOptions, XMLParser } from 'fast-xml-parser';
import { z } from 'zod';

export function oneOrMany<T extends z.ZodTypeAny>(schema: T) {
  return schema
    .or(z.array(schema))
    .transform(i => (i !== undefined && Array.isArray(i) ? i : [i]));
}

export function parseLJArchiveXml(input: string, options: X2jOptions = {}) {
  const parser = new XMLParser(options);
  const obj = parser.parse(input);
  const parsed = xmlFile.parse(obj);
  return parsed.livejournal.entry;
}

const pdate = z.string().transform(d => dayjs(d).toDate());

const author = z.object({
  name: z.string(),
  email: z.string(),
});

const comment = z.object({
  itemid: z.number(),
  eventtime: pdate,
  event: z.string(),
  author,
}).transform(e => ({
  
}));

const entry = z.object({
  itemid: z.number(),
  eventtime: pdate,
  subject: z.string().optional(),
  event: z.string(),
  current_music: z.string().optional(),
  current_mood: z.string().optional(),
  allowmask: z.number(),
  comment: oneOrMany(comment).optional(),
}).transform(e => ({

}));

const xmlFile = z.object({
  livejournal: z.object({
    entry: oneOrMany(entry).optional(),
  }),
});
