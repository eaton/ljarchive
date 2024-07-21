/**
 * Livejournal and its forked derivatives (most notably dreamwidth)
 * supported a handful of custom tags.
 *
 * In particular, a number of variations on the lj-cut tag are supported;
 * while this interperetation of tag behavior doesn't make a lot of sense
 * according to the HTML spec, it is an attempt to faithfully reproduce
 * the way the `<lj-cut>` tag actually behaved on the service. Such is life.
 *
 * @see {@link https://github.com/apparentlymart/livejournal/blob/master/t/cleaner-ljtags.t | Livejournal's old codebase} for details.
 * 
 * pre <lj-cut> hidden
 * pre <lj-cut text="text"> hidden
 *
 * pre <lj-cut /> hidden
 * pre <lj-cut text="text" /> hidden
 *
 * pre <lj-cut></lj-cut> hidden
 * pre <lj-cut text="text"></lj-cut> hidden
 *
 * pre <lj-cut>hidden</lj-cut> post
 * pre <lj-cut text="text">hidden</lj-cut> post
 */

export type CutResults = {
  /**
   * Event markup appearing before the lj-cut tag. If no cut tag is used, only this value will be populated.
   */
  preCut?: string;

  /**
   * The custom cut text entered by the event's author.
   */
  cutText?: string;

  /**
   * The event content hidden by the `lj-cut` tag. In most cases, this will be  the remainder of the event but there may be additional un-hidden text after the cut.
   */
  hiddenText?: string;

  /**
   * Any event markup appearing after the `<lj-cut>` tag is closed.
   */
  postCut?: string;
};

/**
 * Given a markup string, searches for various permutations of the `<lj-cut>`
 * tag and returns an object with preCut, cutText, hiddenText, and postCut
 * properties. These can be assembled into a fresh markup string (say, wrapping
 * the hidden text in a collapsing box or using an `<a>` tag to link to the
 * full page for a post). 
 */
export function parseCutTag(markup: string, trim = false): CutResults {
  const cutExp = /<lj-cut(?:\s+text=([^>]*))?>/is;
  const closeExp = /<\/lj-cut>/is;

  let cut = cutExp.exec(markup) ?? undefined;
  let close = closeExp.test(markup);

  const output: CutResults = {};

  if (!cut) {
    output.preCut = trim ? markup.trim() : markup
  } else {
    let cutText = cut[1]?.replaceAll(/(^['"]|['"]$)/g, '');
    let [preCut, postCutRaw] = markup.split(cut[0]);

    let hiddenText: string | undefined = undefined;
    let postCut: string | undefined = undefined;
    if (closeExp.test(postCutRaw)) {
      [hiddenText, postCut] = postCutRaw.split(closeExp);
    } else {
      postCut = postCutRaw;
    }
    
    preCut = trim ? preCut?.trim() : preCut;
    cutText = trim ? cutText?.trim() : cutText;
    hiddenText = trim ? hiddenText?.trim() : hiddenText;
    postCut = trim ? postCut?.trim() : postCut;

    if (preCut) output.preCut = preCut;
    if (cutText) output.cutText = cutText;
    if (hiddenText) output.hiddenText = hiddenText;
    if (postCut) output.postCut = postCut;
  }
  return { ...output };
}
