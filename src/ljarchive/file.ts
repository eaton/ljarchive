import { Parser } from '../binary-parser.js';
import { optStr, varStr, bool, timestamp, entityIdField, recordCount, recordHeader, bitmask } from './fields.js';

/**
 * This header block is mostly chaff, but contains useful metadata about how many of each record type are contained in the file.
 */
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
  .array('tableTypes', { type: varStr, length: 'tableCount', formatter: () => undefined  })
  .seek(4)
  .array('tableSpacer', { type: optStr, length: 'tableCount', formatter: () => undefined })
  .nest('optionsRows', { type: recordCount })
  .nest('moodsRows', { type: recordCount })
  .nest('userpicsRows', { type: recordCount })
  .nest('usersRows', { type: recordCount })
  .nest('eventsRows', { type: recordCount })
  .nest('commentsRows', { type: recordCount });

/**
 * No important data, but a useful checksum to ensure we didn't drift off course somewhere along the line.
 */
const fileFooter = Parser.start()
  .seek(5) // 0x04 CB170000
  .nest('serializer', { type: varStr })
  .seek(4) // 0x03000000
  .nest('data', { type: varStr })
  .nest('unity', { type: varStr })
  .nest('assembly', { type: varStr })
  .seek(4) // 0x01000108 0A020000 0009922C 00000B

/**
 * Account login and syncing information.
 */
const options = Parser.start()
  .nest({ type: recordHeader })
  .nest('server', { type: optStr })
  .nest('defaultUserPic', { type: optStr })
  .nest('fullName', { type: optStr })
  .nest('userName', { type: optStr })
  .nest('passwordHash', { type: optStr })
  .nest('lastSynced', { type: timestamp })
  .nest('unknown', { type: bool })


/**
 * A list of Livejournal's standard moods; interestingly, there's a hierarchy.
 */
const mood = Parser.start()
  .nest({ type: recordHeader })
  .nest('id', { type: entityIdField })
  .nest('name', { type: optStr })
  .nest('parentId', { type: entityIdField })

  
/**
 * A curiously incomplete list of user pictures associated with the account.
 */
const userPic = Parser.start()
  .nest({ type: recordHeader })
  .nest('keyword', { type: optStr })
  .nest('url', { type: optStr })

  
/**
 * A list of all the users who've commented on this account's posts.
 */
const user = Parser.start()
  .nest({ type: recordHeader })
  .nest('id', { type: entityIdField })
  .nest('name', { type: optStr })


/**
 * The meat: An array of Events, aka journal entries.
 */
const event = Parser.start().nest({
  type: Parser.start()
    .nest({ type: recordHeader })
    .nest('id', { type: entityIdField })
    .nest('date', { type: timestamp })
    .nest('security', { type: optStr })
    .nest('audience', { type: bitmask })
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

/**
 * A flat list of comments with the IDs of the entries they correspond to, and the parent comments they are (optionally) replying to.
 */
const comment = Parser.start().useContextVars().nest({
  type: Parser.start()
    .nest({ type: recordHeader })
    .nest('id', { type: entityIdField })
    .nest('userId', { type: entityIdField })
    .nest('userName', { type: optStr })
    .nest('eventId', { type: entityIdField })
    .nest('parentId', { type: entityIdField })
    .nest('body', { type: optStr })
    .nest('subject', { type: optStr })
    .nest('date', { type: timestamp })
});

export const file = Parser.start()
  .endianess('little')
  .nest('header', { type: fileHeader })
  .nest('options', { type: options })
  .array('moods', {
    type: mood, length: function () {
      // @ts-ignore
      return (this as { header: { moodsRows: number } }).header.moodsRows;
    }
  })
  .array('userPics', {
    type: userPic, length: function () {
      // @ts-ignore
      return (this as { header: { userpicsRows: number } }).header.userpicsRows;
    }
  })
  .array('users', {
    type: user, length: function () {
      // @ts-ignore
      return (this as { header: { usersRows: number } }).header.usersRows;
    }
  })
  .array('events', {
    type: event, length: function () {
      // @ts-ignore
      return (this as { header: { eventsRows: number } }).header.eventsRows;
    }
  })
  .array('comments', {
    type: comment, length: function () {
      // @ts-ignore
      return (this as { header: { commentsRows: number } }).header.commentsRows;
    }
  })
  .nest('footer', { type: fileFooter });