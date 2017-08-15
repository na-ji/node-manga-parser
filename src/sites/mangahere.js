// @flow
import moment from 'moment';

import { resetDateTime, trimSpaces, toString } from '../utils';
import AbstractCatalog, { LANGUAGE_EN } from '../abstract-catalog';
import ChapterRecognition from '../chapter-recognition';
import {
  Chapter,
  Manga,
  STATUS_ONGOING,
  STATUS_COMPLETED,
  STATUS_UNKNOWN
} from '../models';

type CheerioObject = any;

class Mangahere extends AbstractCatalog {
  constructor() {
    super();
    this.name = 'Mangahere';
    this.catalogName = 'mangahere';
    this.baseUrl = 'http://www.mangahere.co';
    this.lang = LANGUAGE_EN;
  }

  /**
   * @param {number} page
   * @returns {string}
   */
  popularMangaRequest(page: ?number): string {
    let pageStr = page ? `${toString(page)}.htm` : '';
    return `${this.baseUrl}/directory/${pageStr}?views.za`;
  }

  /**
   * @param $
   * @returns {Array.<Manga>}
   */
  popularMangaList($: CheerioObject): Array<Manga> {
    let mangas: Array<Manga> = [];
    let provider = this;

    $('div.directory_list > ul > li').each((i: number, elem: CheerioObject) => {
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
    let pagination: CheerioObject = $('div.next-page > a.next');
    let nextPage = null;

    if (pagination.length) {
      nextPage = pagination.attr('href').match(/(\d+).htm/);
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
    let pageStr = page ? `${toString(page)}.htm` : '';
    return `${this.baseUrl}/directory/${pageStr}?last_chapter_time.za`;
  }

  /**
   * @param $
   * @returns {Array.<Manga>}
   */
  latestUpdatesList($: CheerioObject): Array<Manga> {
    let mangas: Array<Manga> = [];

    $('div.directory_list > ul > li').each((i: number, elem: CheerioObject) => {
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
    let container: CheerioObject = $('.manga_detail_top').first();
    let infos: CheerioObject = container.find('.detail_topText').first();

    manga.author = trimSpaces(
      infos.find('a[href^="http://www.mangahere.co/author/"]').first().text()
    );
    manga.artist = trimSpaces(
      infos.find('a[href^="http://www.mangahere.co/artist/"]').first().text()
    );
    manga.genre = trimSpaces(infos.find('li').eq(3).contents()[1].data);
    manga.description = trimSpaces(infos.find('#show').contents()[0].data);
    manga.status = this.parseStatus(trimSpaces(infos.find('li').eq(6).text()));
    manga.thumbnailUrl = trimSpaces(
      container.find('img.img').first().attr('src')
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
   * @param manga
   * @returns {Array}
   */
  chapterList($: CheerioObject, manga: Manga): Array<Chapter> {
    let chapters: Array<Chapter> = [];

    $('.detail_list > ul:not([class]) > li').each((i, elem) => {
      let chapter = new Chapter();

      chapter.url = trimSpaces($(elem).find('a').first().attr('href'));
      chapter.title = trimSpaces($(elem).find('a').first().text());
      chapter.publishedAt = resetDateTime(
        this.parseChapterDate(
          trimSpaces($(elem).find('span.right').first().text())
        )
      );

      chapter.generateId();

      ChapterRecognition.parseChapterNumber(chapter, manga);

      chapters.push(chapter);
    });

    return chapters;
  }

  /**
   * @private
   * @param date
   * @returns {Date}
   */
  parseChapterDate(date: string): Date {
    if (date.indexOf('Today') > -1) {
      return new Date();
    } else if (date.indexOf('Yesterday') > -1) {
      return moment().subtract(1, 'days').toDate();
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
    let licensed = $('.mangaread_error > .mt10').first();
    if (licensed.length) {
      throw new Error(licensed.text());
    }

    let pages: Array<string> = [];
    let options = $('select.wid60').first().find('option');

    options.each((i, elem) => {
      let page = $(elem).attr('value');

      pages.push(page);
    });

    return pages;
  }

  /**
   * @param $
   * @returns {string}
   */
  imageUrl($: CheerioObject): string {
    return $('#image').first().attr('src');
  }

  /**
   * @param query
   * @param page
   * @returns {string}
   */
  searchOptions(query: string, page: ?number): string {
    return `${this
      .baseUrl}/search.php?name_method=cw&author_method=cw&artist_method=cw&advopts=1&name=${query}&page=${toString(
      page
    )}`;
  }

  /**
   * @param $
   * @returns {Array}
   */
  search($: CheerioObject): Array<Manga> {
    let mangas: Array<Manga> = [];

    $('div.result_search > dl:has(dt)').each((i, elem) => {
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
    let pagination: CheerioObject = $('div.next-page > a.next');
    let nextPage = null;
    let nextUrl = null;

    if (pagination.length) {
      nextUrl = pagination.attr('href');
      nextPage = pagination.attr('href').match(/page=(\d+)/);
      if (nextPage && nextPage.length) {
        nextPage = parseInt(nextPage[1]);
      }
    }

    return {
      hasNext: Boolean(pagination.length),
      nextUrl: nextUrl,
      nextPage: nextPage
    };
  }

  /**
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

    // for popular and latest mangas
    let link: CheerioObject = $(elem).find('div.title > a');
    if (!link.length && $(elem).find('a.manga_info').length) {
      // for search
      link = $(elem).find('a.manga_info');
    }

    manga.url = trimSpaces(link.attr('href'));
    manga.title = trimSpaces(
      link.attr('title')
        ? link.attr('title')
        : link.attr('rel') ? link.attr('rel') : link.text()
    );
    if ($(elem).find('img').length) {
      manga.thumbnailUrl = trimSpaces($(elem).find('img').first().attr('src'));
    }
    manga.catalogId = catalogId;
    manga.catalog = this.catalogName;
    manga.generateId();

    return manga;
  }
}

export default new Mangahere();
