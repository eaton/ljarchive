import dayjs from 'dayjs';
import { X2jOptions, XMLParser } from 'fast-xml-parser';
import { z } from 'zod';
import { oneOrMany } from './one-or-many.js';

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
});

const entry = z.object({
  itemid: z.number(),
  eventtime: pdate,
  subject: z.string().optional(),
  event: z.string(),
  current_music: z.string().optional(),
  current_mood: z.string().optional(),
  allowmask: z.number(),
  comment: oneOrMany(comment).optional(),
});

const xmlFile = z.object({
  livejournal: z.object({
    entry: oneOrMany(entry).optional(),
  }),
});
