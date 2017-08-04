// @flow
import moment from 'moment';
import _ from 'lodash';

/**
 * Parse string '8 months ago' to Date object
 * @param {string} date in the format of '8 months ago'
 * @returns {Date} Date object corresponding
 */
export function parseDateAgo(date: string): Date {
  let dateWords = date.toLowerCase().split(' ');

  if (dateWords.length === 3) {
    if (dateWords[1].substr(dateWords[1].length - 1) !== 's') {
      dateWords[1] = dateWords[1] + 's';
    }

    let date = moment().subtract(parseInt(dateWords[0]), dateWords[1]);
    date.millisecond(0).second(0).minute(0).hour(0);

    return date.toDate();
  }

  return new Date(1970, 0, 1);
}

/**
 * @param {string} str string to trim
 * @returns {string}
 */
export function trimSpaces(str: string): string {
  if (_.isString(str)) {
    return str.trim().replace(/ +(?= )/g, '');
  }
  return str;
}

/**
 * @param str
 * @returns {string}
 */
export function toString(str: ?string | ?number): string {
  return _.toString(str);
}
