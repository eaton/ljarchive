import test from 'ava';
import { CutResults } from '../src/markup/lj-cut.js';
import { parseCutTag } from '../src/markup/lj-cut.js';

type CutTest = { description: string, markup: string, results: CutResults };

const testData: CutTest[] = [
  {
    description: 'No pre-cut text',
    markup: `<lj-cut>\n\n\nPost-cut text`,
    results: {
      postCut: 'Post-cut text',
    }
  }, {
    description: 'Simple cut',
    markup: `Pre-cut text\n\n<lj-cut>\n\n\nPost-cut text`,
    results: {
      preCut: 'Pre-cut text',
      postCut: 'Post-cut text',
    }
  }, {
    description: 'Custom cut text',
    markup: `Pre-cut text\n\n<lj-cut text="Cut text">\n\n\nPost-cut text`,
    results: {
      preCut: 'Pre-cut text',
      cutText: 'Cut text',
      postCut: 'Post-cut text',
    }
  }, {
    description: 'Inline hidden text',
    markup: `Pre-cut text\n\n<lj-cut>\nHidden text\n</lj-cut>\n\n\nPost-cut text`,
    results: {
      preCut: 'Pre-cut text',
      hiddenText: 'Hidden text',
      postCut: 'Post-cut text',
    }
  }, {
    description: 'Hidden text and cut text',
    markup: `Pre-cut text\n\n<lj-cut text="Cut text">\nHidden text\n</lj-cut>\n\n\nPost-cut text`,
    results: {
      preCut: 'Pre-cut text',
      cutText: 'Cut text',
      hiddenText: 'Hidden text',
      postCut: 'Post-cut text',
    }
  },
]

for (const cut of testData) {
  test(cut.description, t => {
    const results = parseCutTag(cut.markup, true);
    t.deepEqual(results, cut.results);
  });
}