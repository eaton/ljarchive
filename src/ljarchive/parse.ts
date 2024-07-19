import { Parser } from '../binary-parser.js';
import { shortStr, timestamp, nullable, optVarStr, cBody, entityIdField } from './field-types.js';

const fileHeader = new Parser()
  .skip(22).nest('Meta', { type: shortStr })
  .seek(5).nest('Signature', { type: shortStr })
  .uint32le('tableCount')
  .array('tables', { type: shortStr, length: 'tableCount' })
  .array('spacer', { type: Parser.start().uint8(''), length: 'tableCount' })
  .array('def', { type: shortStr, length: 'tableCount' })
  .saveOffset("offset")
  .seek(function (...args) {
    // @ts-ignore
    const offset = 29165 - (this as any).offset;
    return offset;
  });

const options = new Parser()
  .nest('Server', { type: nullable })
  .nest('DefaultPicURL', { type: nullable })
  .nest('FullName', { type: nullable })
  .nest('UserName', { type: nullable })
  .nest('Password', { type: nullable })
  .nest('LastSynced', { type: timestamp })
  .skip(18);

const mood = Parser.start()
  .uint16('Check', { assert: 2056 })
  .nest('MoodID', { type: entityIdField })
  .nest('Name', { type: nullable })
  .seek(15)

const userPic = Parser.start()
  .nest('Keyword', { type: nullable })
  .nest('URL', { type: nullable })
  .seek(9);

const user = Parser.start()
  .uint16('Check', { assert: 2056 })
  .nest('UserID', { type: entityIdField })
  .nest('Name', { type: nullable })
  .seek(9);

const event = Parser.start().useContextVars().nest({
  type: Parser.start()
    .uint16('Check', { assert: 2056 })
    .nest('EntryID', { type: entityIdField })
    .nest('LastMod', { type: timestamp })
    .seek(6)
    .nest('Security', { type: nullable })
    .seek(6)
    .nest('Subject', { type: nullable })
    .nest('Body', { type: optVarStr })
    .nest('Unknown1', { type: nullable })
    .nest('CustomMood', { type: nullable })
    .seek(2)
    .nest('MoodID', { type: entityIdField })
    .nest('Music', { type: nullable })
    .nest('Preformatted', { type: nullable })
    .nest('NoComments', { type: nullable })
    .nest('UserPic', { type: nullable })
    .nest('Unknown2', { type: nullable })
    .nest('Backdated', { type: nullable })
    .nest('NoEmail', { type: nullable })
    .nest('Unknown2', { type: nullable })
    .seek(2)
    .seek(5)
    .seek(5)
    .nest('SI', { type: nullable })
    .nest('SU', { type: nullable })
    .nest('LastMod', { type: timestamp })
    .seek(15),
});

const comments = Parser.start().useContextVars().nest({
  type: Parser.start()
    .uint16('Check', { assert: 2056 })
    .nest('CommentID', { type: entityIdField })
    .seek(2)
    .nest('UserID', { type: entityIdField })
    .nest('UserName', { type: nullable })
    .seek(2)
    .nest('EntryID', { type: entityIdField })
    .seek(2)
    .nest('ParentID', { type: entityIdField })
    .nest('Body', { type: cBody })
    .nest('Subject', { type: nullable })
    .nest('Date', { type: timestamp })
    .seek(15),
});

export function parseLjArchive(input: Buffer) {
  const journal = Parser.start()
    .nest('header', { type: fileHeader })
    .nest('options', { type: options })
    .array('moods', {
      type: mood, length: 132,
      formatter: (items) => {
        return [...new Map<number, string>(items.map((i: Record<string, string | number>) => [i.MoodID, i.Name]))];
      }
    })
    .array('userPics', { type: userPic, length: 3 })
    .array('users', { type: user, length: 196,
      formatter: items => {
        return [...new Map<number, string>(items.map((i: Record<string, string | number>) => [i.UserID ?? 0, i.Name])).entries()];
      }
    })
    .array('events', { type: event, length: 1223 }) // 1223
    .array('comments', { type: comments, length: 4188 }); // 4188

  const parsed = journal.parse(input);

  const agg = new Set<string>([...parsed.events.map((e: any) => e.Music || 'default' )]);
  
  console.log([...agg]);

  return parsed;
}
