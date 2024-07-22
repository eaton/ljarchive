import { z } from 'zod';

export const schema = z.object({
  id: z.number(),
  date: z.date(),
  userName: z.string().optional(),
  fullName: z.string().optional(),
  subject: z.string().optional(),
  body: z.string().optional(),
  mood: z.string().optional(),
  music: z.string().optional(),
  userPic: z.string().optional(),
});

export type SemagicFile = z.infer<typeof schema>;