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

/**
 * The account's own icons. Only the ones LJArchive happened to record — an
 * archive typically references far more keywords from its entries than appear
 * here, so treat this as a partial index rather than the full set. Both fields
 * are optional so a row missing one is still reported rather than discarded.
 */
const userPic = z.object({
  keyword: z.string().optional(),
  url: z.string().optional(),
});

const event = z.object({
  id: z.number(),
  date: z.coerce.date(),
  security: z.string().optional(),
  audience: z.string().optional(),
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
  /** Resolve the author's name through `users`, which is keyed by this id. */
  userId: z.number().default(0),
  /**
   * LiveJournal's comment state: `A`ctive, `D`eleted, `S`creened. Left as a
   * plain string rather than an enum — an unrecognized value would fail
   * validation, and the array-level `.catch()` would then drop the whole
   * comment rather than the one field.
   */
  commentStatus: z.string().optional(),
  eventId: z.number(),
  parentId: z.number().optional(),
  body: z.string().optional(),
  subject: z.string().optional(),
  /**
   * Optional because a deleted comment has none. LJArchive keeps those as
   * tombstones — id, author, and a `D` status, with no date, body, or subject
   * — and requiring a date drops every one of them, silently, via the
   * array-level `.catch()`. The record that a comment existed and was removed
   * is worth keeping.
   */
  date: z.coerce.date().optional(),
});

export const schema = z.object({
  options,
  moods: z.array(mood.optional().catch(() => undefined)).transform(i => i.filter(i => i !== undefined)),
  userPics: z.array(userPic.optional().catch(() => undefined)).transform(m => m.filter(i => i !== undefined)),
  users: z.array(user.optional().catch(() => undefined)).transform(m => m.filter(i => i !== undefined)),
  events: z.array(event.optional().catch(() => undefined)).transform(m => m.filter(i => i !== undefined)),
  comments: z.array(comment.optional().catch(() => undefined)).transform(m => m.filter(i => i !== undefined)),
})

export type LjArchiveFile = z.infer<typeof schema>;
export type LjArchiveMood = z.infer<typeof mood>
export type LjArchiveUser = z.infer<typeof user>
export type LjArchiveUserPic = z.infer<typeof userPic>
export type LjArchiveEvent = z.infer<typeof event>
export type LjArchiveComment = z.infer<typeof comment>
