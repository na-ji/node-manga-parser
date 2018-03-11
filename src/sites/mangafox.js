// @flow
import moment from 'moment';
import _ from 'lodash';

import {
  resetDateTime,
  trimSpaces,
  toString,
  sanitizeUrlProtocol
} from '../utils';
import AbstractCatalog, { LANGUAGE_EN } from '../abstract-catalog';
import {
  Chapter,
  Manga,
  STATUS_ONGOING,
  STATUS_COMPLETED,
  STATUS_UNKNOWN
} from '../models';

type CheerioObject = any;

class Mangafox extends AbstractCatalog {
  constructor() {
    super();
    this.name = 'Mangafox';
    this.catalogName = 'mangafox';
    this.baseUrl = 'http://fanfox.net/';
    this.lang = LANGUAGE_EN;
    this.hasVolumeInfos = true;
  }

  /**
   * @param {number} page
   * @returns {string}
   */
  popularMangaRequest(page: ?number): string {
    let pageStr = page !== 1 ? `${toString(page)}.html` : '';
    return `${this.baseUrl}/directory/${pageStr}`;
  }

  /**
   * @param $
   * @returns {Array.<Manga>}
   */
  popularMangaList($: CheerioObject): Array<Manga> {
    let mangas: Array<Manga> = [];
    let provider = this;

    $('div#mangalist > ul.list > li').each((i: number, elem: CheerioObject) => {
      let manga: Manga = this.extractMangaSummary(
        $,
        elem,
        provider.getNextIndex()
      );

      mangas.push(manga);
    });

    return mangas;
  }

  /**
   * @param $
   * @returns {{hasNext: boolean, nextUrl: string, nextPage: ?number}}
   */
  popularMangaPaginator(
    $: CheerioObject
  ): { hasNext: boolean, nextUrl: string, nextPage: ?number } {
    let pagination: CheerioObject = $('a:has(span.next)');
    let nextPage = null;

    if (pagination.length) {
      nextPage = pagination.attr('href').match(/(\d+)\.htm/);
      if (nextPage && nextPage.length) {
        nextPage = parseInt(nextPage[1]);
      }
    }

    return {
      hasNext: Boolean(pagination.length),
      nextUrl: pagination.attr('href'),
      nextPage: nextPage
    };
  }

  /**
   * @param {number} page
   * @returns {string}
   */
  latestUpdatesRequest(page: ?number): string {
    let pageStr = page !== 1 ? `${toString(page)}.html` : '';
    return `${this.baseUrl}/directory/${pageStr}?latest`;
  }

  /**
   * @param $
   * @returns {Array.<Manga>}
   */
  latestUpdatesList($: CheerioObject): Array<Manga> {
    let mangas: Array<Manga> = [];

    $('div#mangalist > ul.list > li').each((i: number, elem: CheerioObject) => {
      let manga: Manga = this.extractMangaSummary($, elem, Infinity);

      mangas.push(manga);
    });

    return mangas;
  }

  /**
   * @param $
   * @returns {{hasNext: boolean, nextUrl: string, nextPage: ?number}}
   */
  latestUpdatesPaginator(
    $: CheerioObject
  ): { hasNext: boolean, nextUrl: string, nextPage: ?number } {
    return this.popularMangaPaginator($);
  }

  /**
   * @param $
   * @param manga
   * @returns {Manga}
   */
  mangaDetail($: CheerioObject, manga: Manga): Manga {
    let container: CheerioObject = $('div#title').first();
    let detailsContainer: CheerioObject = container
      .find('table > tbody > tr')
      .eq(1)
      .first();
    let sideContainer: CheerioObject = $('#series_info').first();

    manga.author = trimSpaces(
      detailsContainer
        .find('td')
        .eq(1)
        .text()
    );
    manga.artist = trimSpaces(
      detailsContainer
        .find('td')
        .eq(2)
        .text()
    );
    manga.genre = trimSpaces(
      detailsContainer
        .find('td')
        .eq(3)
        .text()
    );
    manga.description = trimSpaces(
      container
        .find('p.summary')
        .first()
        .text()
    );
    manga.status = this.parseStatus(
      trimSpaces(
        sideContainer
          .find('.data')
          .first()
          .text()
      )
    );
    manga.setThumbnailUrl(
      sideContainer
        .find('div.cover > img')
        .first()
        .attr('src')
    );
    manga.detailsFetched = true;

    return manga;
  }

  /**
   * @private
   * @param {string} status
   * @returns {string}
   */
  parseStatus(status: string): string {
    if (status.indexOf('Ongoing') > -1) {
      return STATUS_ONGOING;
    } else if (status.indexOf('Completed') > -1) {
      return STATUS_COMPLETED;
    }
    return STATUS_UNKNOWN;
  }

  /**
   * @param $
   * @returns {Array}
   */
  chapterList($: CheerioObject): Array<Chapter> {
    let chapters: Array<Chapter> = [];

    $('h3.volume').each((i, elem) => {
      let volumeNumber = $(elem)
        .text()
        .match(/Volume ([\d|TBD]+)/)[1];

      if (!isNaN(parseInt(volumeNumber))) {
        volumeNumber = parseInt(volumeNumber);
      }

      $(elem)
        .parent()
        .next('ul.chlist')
        .find('li div')
        .each((i, elem) => {
          let chapter = new Chapter();
          let url = $(elem)
            .find('a.tips')
            .first();

          chapter.url = trimSpaces(url.attr('href'));
          chapter.title = trimSpaces(url.text());
          chapter.publishedAt = resetDateTime(
            this.parseChapterDate(
              trimSpaces(
                $(elem)
                  .find('span.date')
                  .first()
                  .text()
              )
            )
          );
          chapter.volume = volumeNumber;

          chapter.generateId();

          chapters.push(chapter);
        });
    });

    return chapters;
  }

  /**
   * @param $
   * @returns {{}}
   */
  chapterListByVolume($: CheerioObject): {} {
    let chapters = this.chapterList($);

    return _.groupBy(chapters, 'volume');
  }

  /**
   * @private
   * @param date
   * @returns {Date}
   */
  parseChapterDate(date: string): Date {
    if (date.indexOf('Today') > -1 || date.indexOf(' ago') > -1) {
      return new Date();
    } else if (date.indexOf('Yesterday') > -1) {
      return moment()
        .subtract(1, 'days')
        .toDate();
    }

    let momentDate = moment(date, 'MMM D, YYYY');
    if (momentDate.isValid()) {
      return momentDate.toDate();
    }

    return new Date(1970, 0, 1);
  }

  /**
   * @param $
   * @returns {Array}
   */
  pageList($: CheerioObject): Array<string> {
    let pages: Array<string> = [];
    let url: string = $('a#comments').attr('href');
    let options = $('select.m')
      .first()
      .find('option:not([value=0])');

    options.each((i, elem) => {
      let page = $(elem).attr('value');

      pages.push(`${url}${page}.html`);
    });

    return pages;
  }

  /**
   * @param $
   * @returns {string}
   */
  imageUrl($: CheerioObject): string {
    return $('#image')
      .first()
      .attr('src');
  }

  /**
   * @param query
   * @param page
   * @returns {{url: string, headers: any, method: string, form: any}}
   */
  searchOptions(query: string, page: ?number): string {
    // prettier-ignore
    return `${this.baseUrl}/search.php?name_method=cw&author_method=cw&artist_method=cw&advopts=1&name=${query}&page=${toString(page)}`;
  }

  /**
   * @param $
   * @returns {Array}
   */
  search($: CheerioObject): Array<Manga> {
    let mangas: Array<Manga> = [];

    $('div#mangalist > ul.list > li').each((i, elem) => {
      let manga = this.extractMangaSummary($, elem, Infinity);

      mangas.push(manga);
    });

    return mangas;
  }

  /**
   * @param $
   * @returns {{ hasNext: boolean, nextUrl: ?string, nextPage: ?number }}
   */
  searchPaginator(
    $: CheerioObject
  ): { hasNext: boolean, nextUrl: ?string, nextPage: ?number } {
    let pagination: CheerioObject = $('a:has(span.next)');
    let nextPage = null;

    if (pagination.length) {
      nextPage = pagination.attr('href').match(/page=(\d+)/);
      if (nextPage && nextPage.length) {
        nextPage = parseInt(nextPage[1]);
      }
    }

    return {
      hasNext: Boolean(pagination.length),
      nextUrl: pagination.length ? pagination.attr('href') : null,
      nextPage: nextPage
    };
  }

  /**
   * @private
   * @param $
   * @param elem
   * @param catalogId
   * @returns {Manga}
   */
  extractMangaSummary(
    $: CheerioObject,
    elem: CheerioObject,
    catalogId: ?number
  ): Manga {
    let manga: Manga = new Manga();
    let link: CheerioObject = $(elem).find('a.title');

    manga.setUrl(link.attr('href'));
    manga.title = trimSpaces(link.text());
    manga.setThumbnailUrl(
      $(elem)
        .find('img')
        .attr('src')
    );
    manga.catalogId = catalogId;
    manga.catalog = this.catalogName;
    manga.generateId();

    return manga;
  }
}

export default new Mangafox();
