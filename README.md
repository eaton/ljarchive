# Livejournal parsing tools

A grab bag of helper functions for loading, parsing, and processing assorted forms of Livejournal backups. Generally speaking, each importer offers two functions:

- `file.parse(input: Buffer)` takes a loaded buffer containing the backup file to be parsed and returns a JS object that matches the internal structure of that file.
- `schema.parse(input: unknown)` takes the outputs of the corresponding file and returns a validated and cleaned-up representation of the journal data.

Supported file formats are [Semagic](https://semagic.sourceforge.net) single-post save files (.slj), [LjArchive](https://sourceforge.net/projects/ljarchive/) backups (.lja), and LjArchive-sourced XML exports.

Two other helper functions also assist in processing some of the tanglier LJ-specific markup. Information about the potential variations in the markup came from [LiveJournal's old source code](https://github.com/apparentlymart/livejournal).

- `parseCutTag(input: string)` finds various permutations of `<lj-cut>` tags in entry bodies and returns an object with four separate keys: `preCut`, `postCut`, `cutText`, and `hiddenText`. The cutText and hiddenText, critically, are only populated if custom link text exists in the entry or a fully closed cut tag is used to wrap some text while leaving the remainder of the post visible. Knock yourselves out.
- `parseUserTags(input: string)` Takes post bodies and returns a keyed dictionary of found-markup and corresponding LJ usernames. This can be used to quickly replace `<lj-user name="foo">` style tags with whatever else you'd like.

If you're particularly weird and use the Mac hex editor HexFiend, TCL language templates for .lja and .slj files are also available in the `/hex/` directory. Do as you will.

## Usage

`npm install eaton/ljarchive`

```javascript
import { lja, parseCutTag } from '@eatonfyi/ljarchive';
import { readFile } from 'fs/promises';

const b = await readFile('archive.lja');
const rawData = lja.file.parse(b);
const journal = lja.schema.parse(rawData);

for (const e of journal.events) {
  const entryText = parseCutTag(e.body);
  const linkedUsers = parseUserTags(e.body);

  // do stuff, and things
}
```

## Future stuff

Probably not a lot, as this is just a ridiculously over-engineered way to restore like, a dozen lost blog posts from twenty years ago that are 90% cringe anyways. That said…

- [ ] There's still some normalizing to do with the output data, like swapping mood IDs for mood names and so on in the binary lja parser output.
- [x] The types generated by the zod schema are hash because of some safety-checking and I need to get them ironed out.
- [ ] There's a whole-ass copy of the otherwise excellent `binary-parser` project copied into this source tree, because I banged it together on a weekend and didn't want to troubleshoot some of the ESM/TS hiccups that make that version un-importable with the build env I've got right now. Might fix later.
- [ ] See if anybody else has LJArchive backups or semagic files to test against; the file format has almost certainly morphed and the serialized data structures are bound to be difference since the versions i exported with. YMMV.
