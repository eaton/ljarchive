import { Parser } from '../binary-parser.js';
import { shortStr, timestamp, optStr, anyField, varString } from './field-types.js';

const tables = new Parser()
  .uint32le('tableCount')
  .array('tables', { type: shortStr, length: 'tableCount' });

const fileHeader = new Parser()
  .skip(22).nest('Meta', { type: shortStr })
  .seek(5).nest('Signature', { type: shortStr })
  .seek(73)
  .seek(28962);

const options = new Parser()
  .nest('Server', { type: optStr })
  .nest('DefaultPicURL', { type: optStr })
  .nest('FullName', { type: optStr })
  .nest('UserName', { type: optStr })
  .nest('Password', { type: optStr })
  .nest('LastSynced', { type: timestamp })
  .skip(18);

const mood = Parser.start()
  .uint16('Check', { assert: 2056 })
  .uint32le('ID')
  .nest('Name', { type: optStr })
  .seek(15)

const userPic = Parser.start()
  .nest('Keyword', { type: optStr })
  .nest('URL', { type: optStr })
  .seek(9);

const user = Parser.start()
  .uint16('Check', { assert: 2056 })
  .uint32le('ID')
  .nest('Name', { type: optStr })
  .seek(9);

const event = Parser.start().useContextVars().nest({
  type: Parser.start()
    .uint16('Check', { assert: 2056 })
    .uint32le('ID')
    .nest('LastMod', { type: timestamp })
    .seek(6)
    .nest('UseMask', { type: optStr })
    .seek(6)
    .nest('Subject', { type: optStr })
    .nest('Body', { type: varString })
    .nest('Unknown1', { type: optStr })
    .nest('CustomMood', { type: optStr })
    .seek(2)
    .uint32le('Mood')
    .nest('Music', { type: optStr })
    .nest('Preformatted', { type: anyField })
    .nest('NoComments', { type: anyField })
    .nest('UserPic', { type: optStr })
    .nest('Unknown2', { type: anyField })
    .nest('Backdated', { type: anyField })
    .nest('NoEmail', { type: anyField })
    .nest('Unknown2', { type: anyField })
    .seek(2)
    .seek(5)
    .seek(5)
    .nest('SI', { type: optStr })
    .nest('SU', { type: optStr })
    .nest('LastMod', { type: timestamp })
    .seek(15),
  formatter: function (data) {
    return data;
  }
});

const comments = Parser.start().useContextVars().nest({
  type: Parser.start()
    .uint16('Check', { assert: 2056 })
    .uint32le('CommentID')
    .seek(2)
    .uint32le('UserID')
    .nest('UserName', { type: optStr })
    .uint32le('EntryID')
    .seek(3)
    .uint32le('ParentID')
    .nest('Body', { type: varString })
    .nest('Subject', { type: optStr })
    .nest('Date', { type: timestamp })
    .seek(15),
  formatter: function (data) {
    return data;
  }
});

export function parseLjArchive(input: Buffer) {
  const journal = Parser.start()
    .nest('header', { type: fileHeader })
    .nest('options', { type: options })
    .array('moods', { type: mood, length: 132 })
    .array('userPics', { type: userPic, length: 3 })
    .array('users', { type: user, length: 196 })
    .array('events', { type: event, length: 1223 }); // 1223

  const parsed = journal.parse(input);

  console.log(parsed.events.pop());

  return parsed;
}
