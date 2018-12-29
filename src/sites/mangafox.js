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
    this.baseUrl = 'http://fanfox.net';
    this.lang = LANGUAGE_EN;
    this.hasVolumeInfos = true;
  }

  /**
   * @param {number} page
   * @returns {string}
   */
  popularMangaRequest(page: ?number): string {
    if (page === null) {
      page = 1;
    }
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

    $('div.manga-list-1 > ul.manga-list-1-list > li').each(
      (i: number, elem: CheerioObject) => {
        let manga: Manga = this.extractMangaSummary(
          $,
          elem,
          provider.getNextIndex()
        );

        mangas.push(manga);
      }
    );

    return mangas;
  }

  /**
   * @param $
   * @returns {{hasNext: boolean, nextUrl: string, nextPage: ?number}}
   */
  popularMangaPaginator(
    $: CheerioObject
  ): { hasNext: boolean, nextUrl: string, nextPage: ?number } {
    let pagination: CheerioObject = $('.pager-list a:contains(">")');
    let nextPage = null;

    if (
      pagination.length &&
      pagination.attr('href').indexOf('javascript') === -1
    ) {
      nextPage = pagination.attr('href').match(/(\d+)\.htm/);
      if (nextPage && nextPage.length) {
        nextPage = parseInt(nextPage[1]);
      }
    }

    return {
      hasNext: Boolean(pagination.length),
      nextUrl: this.baseUrl + pagination.attr('href'),
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
    let container: CheerioObject = $('div.detail-info').first();

    manga.author = trimSpaces(
      container.find('.detail-info-right-say a').text()
    );
    manga.genre = trimSpaces(
      container.find('.detail-info-right-tag-list').text()
    );
    manga.description = trimSpaces(
      $('.fullcontent')
        .first()
        .text()
    );
    manga.status = this.parseStatus(
      trimSpaces(
        container
          .find('.detail-info-right-title-tip')
          .first()
          .text()
      )
    );
    manga.setThumbnailUrl(
      container
        .find('.detail-info-cover-img')
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

    $('.detail-main-list li').each((i, elem) => {
      const volumeNumberMatches = $(elem)
        .text()
        .match(/Vol.([\d|TBD]+)/);
      let volumeNumber;

      if (volumeNumberMatches.length > 1) {
        volumeNumber = volumeNumberMatches[1];
      }

      if (!isNaN(parseInt(volumeNumber))) {
        volumeNumber = parseInt(volumeNumber);
      }

      let chapter = new Chapter();
      let url = $(elem)
        .find('a')
        .first();

      chapter.setUrl(this.baseUrl + url.attr('href'));
      chapter.title = trimSpaces(
        $(elem)
          .find('.title3')
          .text()
      );
      chapter.publishedAt = resetDateTime(
        this.parseChapterDate(
          trimSpaces(
            $(elem)
              .find('.title2')
              .first()
              .text()
          )
        )
      );
      chapter.volume = volumeNumber;

      chapter.generateId();

      chapters.push(chapter);
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
    const pages: Array<string> = [];
    const pager = $('.pager-list-left > span');
    const currentPage = $('meta[name="og:url"]').attr('content');

    if (pager.length === 0) {
      pages.push(currentPage);

      return pages;
    }

    const lastPage = parseInt(
      pager
        .first()
        .find('a:not(:contains(">"))')
        .last()
        .text()
    );

    for (let page = 1; page <= lastPage; page++) {
      pages.push(sanitizeUrlProtocol(`${currentPage}${page}.html`));
    }

    return pages;
  }

  /**
   * @param $
   * @returns {string}
   */
  imageUrl($: CheerioObject): string {
    return $('.reader-main-img')
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
    let link: CheerioObject = $(elem).find('a');

    manga.setUrl(this.baseUrl + link.attr('href'));
    manga.title = trimSpaces(link.attr('title'));
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
