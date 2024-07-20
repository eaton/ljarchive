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

const patterns = {
  cutWrapper: /<lj-cut\s+text=['"]?([^'">]*)['"]?>(.+)<\/lj-cut>/gi, // <lj-cut text="cut text">Hidden content</lj-cut>
  cutWrapperNoText: /<lj-cut[^>]*>(.+)<\/lj-cut>/gi, // <lj-cut>Hidden content</lj-cut>
  cutClosed: /<lj-cut\s+text=['"]?([^'">]*)['"]?[^>]*><\/lj-cut>/gi, // <lj-cut text="cut text"></lj-cut>
  cutClosedNoText: /<lj-cut[^>]*><\/lj-cut>/gi, // <lj-cut></lj-cut>
  cutSelfClosing: /<lj-cut\s+text=['"]?([^'">]*)['"]?[^>]*>/gi, // <lj-cut text="cut text">
  cutSelfClosingNoText: /<lj-cut[^>]*>/gi, // <lj-cut>
};

type CutResults = {
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
 * Generate an event teaser from an entry with lj-cut tags.
 *
 * There are a couple of permutations that make handling cut tags in an output-agnostic manner difficult;
 */
function cutTeaser(markup: string) {
  const wrapperReplacement = '<span class="lj-cut">$1</span>';
  const wrapperNoTextReplacement = '<span class="lj-cut" />';
  const placeholder = '\ufeff';

  return markup
    .replace(patterns.cutWrapper, 'wrapperReplacement') // Replace wrapper with text
    .replace(patterns.cutWrapperNoText, wrapperNoTextReplacement + placeholder) // Replace wrapper with text
    .replace(patterns.cutSelfClosing, wrapperReplacement + placeholder) // Replace breaker with placeholder
    .replace(patterns.cutClosedNoText, wrapperNoTextReplacement + placeholder) // Replace annotated breaker with text & placeholder
    .replace(patterns.cutClosed, wrapperReplacement + placeholder) // Replace annotated breaker with text & placeholder
    .replace(patterns.cutSelfClosingNoText, wrapperNoTextReplacement + placeholder) // Replace breaker with placeholder
    .split(placeholder)[0]; // Discard post-placeholder text
}

/**
 * Generate a full post body from an entry with lj-cut tags.
 */
function cutBody(markup: string) {
  const wrapperReplacement = '<span class="lj-cut expanded">$1</span>';
  const wrapperNoTextReplacement = '<span class="lj-cut expanded" />';

  return markup
    .replace(patterns.cutWrapperNoText, wrapperReplacement) // Remove cut wrapper
    .replace(patterns.cutClosedNoText, wrapperNoTextReplacement) // Remove cut breaker
    .replace(patterns.cutSelfClosingNoText, wrapperNoTextReplacement); // Remove cut breaker
}
