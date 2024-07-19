import { Parser } from '../binary-parser.js';
import { shortStr, timestamp, nullable, optVarStr, entityIdField } from './field-types.js';

const bookendRecord = Parser.start()
  .uint8("Marker", { assert: 16 })
  .uint32le("Unknown")
  .uint32le("Unknown")

const fileHeader = Parser.start()
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

const options = Parser.start()
  .nest('Server', { type: optVarStr })
  .nest('DefaultPicURL', { type: optVarStr })
  .nest('FullName', { type: optVarStr })
  .nest('UserName', { type: optVarStr })
  .nest('Password', { type: optVarStr })
  .nest('LastSynced', { type: timestamp })
  .nest('Unknown', { type: nullable })
  .skip(9);

const mood = Parser.start()
  .nest('MoodID', { type: entityIdField })
  .nest('Name', { type: optVarStr })
  .nest('ParentID', { type: entityIdField })
  .seek(9)

const userPic = Parser.start()
  .nest('Keyword', { type: optVarStr })
  .nest('URL', { type: optVarStr })
  .seek(9);

const user = Parser.start()
  .nest('UserID', { type: entityIdField })
  .nest('Name', { type: optVarStr })
  .seek(9);

const event = Parser.start().nest({
  type: Parser.start()
    .nest('EntryID', { type: entityIdField })
    .nest('Date', { type: timestamp })
    .nest('Security', { type: nullable })
    .nest('Audience', { type: entityIdField })
    .nest('Subject', { type: optVarStr })
    .nest('Body', { type: optVarStr })
    .nest('Unknown', { type: optVarStr })
    .nest('CustomMood', { type: optVarStr })
    .nest('MoodID', { type: entityIdField })
    .nest('Music', { type: optVarStr })
    .nest('Preformatted', { type: nullable })
    .nest('NoComments', { type: nullable })
    .nest('UserPic', { type: optVarStr })
    .nest('Unknown2', { type: nullable })
    .nest('Backdated', { type: nullable })
    .nest('NoEmail', { type: nullable })
    .nest('Unknown2', { type: nullable })
    .nest('Revision', { type: entityIdField })
    .nest('CommentAlter', { type: entityIdField })
    .nest('SyndicationID', { type: nullable })
    .nest('SyndicationURL', { type: nullable })
    .nest('LastMod', { type: timestamp })
    .nest('Close', { type: bookendRecord })
});

const comments = Parser.start().useContextVars().nest({
  type: Parser.start()
    .nest('CommentID', { type: entityIdField })
    .nest('UserID', { type: entityIdField })
    .nest('UserName', { type: nullable })
    .nest('EntryID', { type: entityIdField })
    .nest('ParentID', { type: entityIdField })
    .nest('Body', { type: optVarStr })
    .nest('Subject', { type: optVarStr })
    .nest('Date', { type: timestamp })
    .seek(9),
});

export function parseLjArchive(input: Buffer) {
  const journal = Parser.start()
    .nest('header', { type: fileHeader })
    .nest('options', { type: options })
    .array('moods', { type: mood, length: 132 })
    .array('userPics', { type: userPic, length: 3 })
    .array('users', { type: user, length: 196 })
    .array('events', { type: event, length: 1223 }) // 1223
    .array('comments', { type: comments, length: 4188 }); // 4188

  return journal.parse(input);
}
