import { Parser } from '../binary-parser.js';
import { bool, timestamp, optStr, varStr, entityIdField, recordCount } from './field-types.js';

const sectionStart = Parser.start().seek(9);
//  .uint8("Marker", { assert: 16 })
//  .uint32le("RecordNumber")
//  .uint32le("FieldCount")

const fileHeader = Parser.start()
  // 0x00010000 00FFFFFF FF010000 00000000 000C0200 00
  .seek(22)
  // EF.ljArchive.Engine, Version=0.9.4.3, Culture=neutral, PublicKeyToken=nul
  .nest('assembly', { type: varStr })
  // EF.ljArchive.Engine.Journal
  .seek(5).nest('class', { type: varStr })
  .uint32le('tableCount')
  .array('tableNames', { type: varStr, length: 'tableCount' })
  .seek('tableCount')
  .array('tableTypes', { type: varStr, length: 'tableCount' })
  .seek(4)
  .array('tableSpacer', { type: optStr, length: 'tableCount' })
  .nest('optionCount', { type: recordCount })
  .nest('moodCount', { type: recordCount })
  .nest('userPicCount', { type: recordCount })
  .nest('userCount', { type: recordCount })
  .nest('entryCount', { type: recordCount })
  .nest('commentCount', { type: recordCount });
  
const options = Parser.start()
  .nest({ type: sectionStart })
  .nest('server', { type: optStr })
  .nest('defaultUserPic', { type: optStr })
  .nest('fullName', { type: optStr })
  .nest('userName', { type: optStr })
  .nest('passwordHash', { type: optStr })
  .nest('lastSynced', { type: timestamp })
  .nest('unknown', { type: bool })

const mood = Parser.start()
  .nest({ type: sectionStart })
  .nest('id', { type: entityIdField })
  .nest('name', { type: optStr })
  .nest('parent', { type: entityIdField })

const userPic = Parser.start()
  .nest({ type: sectionStart })
  .nest('keyword', { type: optStr })
  .nest('url', { type: optStr })

const user = Parser.start()
  .nest({ type: sectionStart })
  .nest('id', { type: entityIdField })
  .nest('name', { type: optStr })

const event = Parser.start().nest({
  type: Parser.start()
    .nest({ type: sectionStart })
    .nest('id', { type: entityIdField })
    .nest('date', { type: timestamp })
    .nest('security', { type: optStr })
    .nest('audience', { type: entityIdField })
    .nest('subject', { type: optStr })
    .nest('body', { type: optStr })
    .nest('unknown1', { type: optStr })
    .nest('mood', { type: optStr })
    .nest('moodId', { type: entityIdField })
    .nest('music', { type: optStr })
    .nest('isPreformatted', { type: bool })
    .nest('noComments', { type: bool })
    .nest('userPicKeyword', { type: optStr })
    .nest('unknown2', { type: bool })
    .nest('isBackdated', { type: bool })
    .nest('noEmail', { type: bool })
    .nest('unknown2', { type: bool })
    .nest('revision', { type: entityIdField })
    .nest('commentAlter', { type: entityIdField })
    .nest('syndicationId', { type: optStr })
    .nest('syndicationUrl', { type: optStr })
    .nest('lastModified', { type: timestamp })
});

const comments = Parser.start().useContextVars().nest({
  type: Parser.start()
    .nest({ type: sectionStart })
    .nest('id', { type: entityIdField })
    .nest('userId', { type: entityIdField })
    .nest('userName', { type: optStr })
    .nest('entryId', { type: entityIdField })
    .nest('parentId', { type: entityIdField })
    .nest('body', { type: optStr })
    .nest('subject', { type: optStr })
    .nest('date', { type: timestamp })
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

  const output = journal.parse(input)
  console.log(output);
  return output;
}
