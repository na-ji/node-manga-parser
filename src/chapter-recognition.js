var ChapterRecognition = {};
var _ = require("lodash");

/**
 * All cases with Ch.xx
 * Mokushiroku Alice Vol.1 Ch.4: Misrepresentation -R> 4
 */
var basic = /ch\.([0-9]+)(\.[0-9]+)?(\.?[a-z]+)?/;

/**
 * Regex used when only one number occurrence
 * Example: Bleach 567: Down With Snowwhite -R> 567
 */
var occurrence = /([0-9]+)(\.[0-9]+)?(\.?[a-z]+)?/g;

/**
 * Regex used when manga title removed
 * Example: Solanin 028 Vol. 2 -> 028 Vol.2 -> 028Vol.2 -R> 028
 */
var withoutManga = /^([0-9]+)(\.[0-9]+)?(\.?[a-z]+)?/;

/**
 * Regex used to remove unwanted tags
 * Example Prison School 12 v.1 vol004 version1243 volume64 -R> Prison School 12
 */
var unwanted = /(?:(v|ver|vol|version|volume|season).?[0-9]+)/g;

/**
 * Regex used to remove unwanted whitespace
 * Example One Piece 12 special -R> One Piece 12special
 */
var unwantedWhiteSpace = /(\s)(extra|special|omake)/g;

ChapterRecognition.parseChapterNumber = function(chapter, manga) {
  if (chapter.number === -2 || chapter.number > -1) {
    return chapter;
  }

  // Get chapter title with lower case
  let title = chapter.title.toLowerCase();
  let matches;

  // Remove comma's from chapter.
  title = title.replace(",", ".");

  // Remove unwanted white spaces.
  title = title.replace(unwantedWhiteSpace, "$2");

  // Remove unwanted tags.
  title = title.replace(unwanted, "");

  // Check base case ch.xx
  matches = basic.exec(title);
  if (matches) {
    return updateChapter(matches, chapter);
  }

  // Check one number occurrence.
  matches = [];
  let m;
  do {
    m = occurrence.exec(title);
    if (m) {
      matches.push(m);
    }
  } while (m);

  if (matches.length === 1) {
    return updateChapter(matches[0], chapter);
  }

  if (manga && manga.title) {
    // Remove manga title from chapter title.
    let titleWithoutManga = title.replace(manga.title.toLowerCase(), "").trim();

    // Check if first value is number after title remove.
    matches = withoutManga.exec(titleWithoutManga);
    if (matches) {
      return updateChapter(matches, chapter);
    }

    // Take the first number encountered.
    matches = occurrence.exec(titleWithoutManga);
    if (matches) {
      return updateChapter(matches, chapter);
    }
  }

  chapter.number = -2;

  return chapter;
};

/**
 * Check if volume is found and update chapter
 * @param matches result of regex
 * @param chapter chapter object
 * @return true if volume is found
 */
function updateChapter(matches, chapter) {
  let initial = parseFloat(matches[1]);
  let subChapterDecimal = matches[2];
  let subChapterAlpha = matches[3];
  let addition = checkForDecimal(subChapterDecimal, subChapterAlpha);
  chapter.number = initial + addition;

  return chapter;
}

/**
 * Check for decimal in received strings
 * @param decimal decimal value of regex
 * @param alpha alpha value of regex
 * @return decimal/alpha float value
 */
function checkForDecimal(decimal, alpha) {
  if (!_.isUndefined(decimal) && !_.isNull(decimal)) {
    return parseFloat(decimal);
  }

  if (!_.isUndefined(alpha) && !_.isNull(alpha)) {
    if (alpha.includes("extra")) {
      return 0.99;
    }

    if (alpha.includes("omake")) {
      return 0.98;
    }

    if (alpha.includes("special")) {
      return 0.97;
    }

    if (alpha[0] === ".") {
      // Take value after (.)
      return parseAlphaPostFix(alpha[1]);
    } else {
      return parseAlphaPostFix(alpha[0]);
    }
  }

  return 0.0;
}

/**
 * x.a -> x.1, x.b -> x.2, etc
 */
function parseAlphaPostFix(alpha) {
  return parseFloat("0." + (alpha.charCodeAt(0) - 96));
}

module.exports = ChapterRecognition;
