import { z } from 'zod';

const options = z.object({
  defaultUserPic: z.string().url().optional(),
  userName: z.string(),
  fullName: z.string(),
});

const mood = z.object({
  id: z.number(),
  name: z.string(),
  parentId: z.number().optional(),
});

const user = z.object({
  id: z.number().default(0),
  name: z.string(),
});

const event = z.object({
  id: z.number(),
  date: z.coerce.date(),
  security: z.string().optional(),
  audience: z.number().optional(),
  subject: z.string().optional(),
  body: z.string().optional(),
  mood: z.string().optional(),
  moodId: z.number().optional(),
  music: z.string().optional(),
  isPreformatted: z.boolean().optional(),
  noComments: z.boolean().optional(),
  userPicKeyword: z.string().optional(),
  isBackdated: z.boolean().optional(),
  noEmail: z.boolean().optional(),
  revision: z.number().optional(),
  commentAlter: z.number().optional(),
  syndicationId: z.string().optional(),
  syndicationUrl: z.string().optional(),
  lastModified: z.coerce.date().optional(),
});

const comment = z.object({
  id: z.number(),
  userId: z.number().default(0),
  userName: z.string().optional(),
  eventId: z.number(),
  parentId: z.number().optional(),
  body: z.string().optional(),
  subject: z.string().optional(),
  date: z.coerce.date(),
});

export const schema = z.object({
  options,
  moods: z.array(mood.optional().catch(() => undefined)).transform(i => i.filter(i => i !== undefined)),
  users: z.array(user.optional().catch(() => undefined)).transform(m => m.filter(i => i !== undefined)),
  events: z.array(event.optional().catch(() => undefined)).transform(m => m.filter(i => i !== undefined)),
  comments: z.array(comment.optional().catch(() => undefined)).transform(m => m.filter(i => i !== undefined)),
})

export type LjArchiveFile = z.infer<typeof schema>;
export type LjArchiveMood = z.infer<typeof mood>
export type LjArchiveUser = z.infer<typeof user>
export type LjArchiveEvent = z.infer<typeof event>
export type LjArchiveComment = z.infer<typeof comment>
