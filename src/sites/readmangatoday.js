// @flow
import { parseDateAgo, trimSpaces, toString } from '../utils';
import AbstractCatalog, { LANGUAGE_EN } from '../abstract-catalog';
import {
  Chapter,
  Manga,
  STATUS_ONGOING,
  STATUS_COMPLETED,
  STATUS_UNKNOWN
} from '../models';

type CheerioObject = any;

class ReadMangaToday extends AbstractCatalog {
  constructor() {
    super();
    this.name = 'ReadMangaToday';
    this.catalogName = 'readmangatoday';
    this.baseUrl = 'http://www.readmanga.today';
    this.lang = LANGUAGE_EN;
  }

  /**
   * @param {number} page
   * @returns {string}
   */
  popularMangaRequest(page: ?number): string {
    return `${this.baseUrl}/hot-manga/${toString(page)}`;
  }

  /**
   * @param $
   * @returns {Array.<Manga>}
   */
  popularMangaList($: CheerioObject): Array<Manga> {
    let mangas: Array<Manga> = [];
    let provider = this;

    $('div.hot-manga > div.style-list > div.box').each(
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
    let pagination: CheerioObject = $(
      'div.hot-manga > ul.pagination > li > a:contains(»)'
    );
    let nextPage = null;

    if (pagination.length) {
      nextPage = pagination.attr('href').match(/hot-manga\/(\d+)/);
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
    return `${this.baseUrl}/latest-releases/${toString(page)}`;
  }

  /**
   * @param $
   * @returns {Array.<Manga>}
   */
  latestUpdatesList($: CheerioObject): Array<Manga> {
    let mangas: Array<Manga> = [];

    $('div.hot-manga > div.style-grid > div.box').each(
      (i: number, elem: CheerioObject) => {
        let manga: Manga = this.extractMangaSummary($, elem, Infinity);

        mangas.push(manga);
      }
    );

    return mangas;
  }

  /**
   * @param $
   * @returns {{hasNext: boolean, nextUrl: string, nextPage: ?number}}
   */
  latestUpdatesPaginator(
    $: CheerioObject
  ): { hasNext: boolean, nextUrl: string, nextPage: ?number } {
    let pagination: CheerioObject = $(
      'div.hot-manga > ul.pagination > li > a:contains(»)'
    );
    let nextPage = null;

    if (pagination.length) {
      nextPage = pagination.attr('href').match(/latest-releases\/(\d+)/);
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
   * @param $
   * @param manga
   * @returns {Manga}
   */
  mangaDetail($: CheerioObject, manga: Manga): Manga {
    let container: CheerioObject = $('div.content-list').first();

    manga.author = trimSpaces(
      container.find('ul.cast-list li.director > ul a').text()
    );
    manga.artist = trimSpaces(
      container.find('ul.cast-list li:not(.director) > ul a').text()
    );
    manga.genre = trimSpaces(
      container
        .find('dl.dl-horizontal > dd')
        .eq(2)
        .text()
    );
    manga.description = trimSpaces(container.find('li.movie-detail').text());
    manga.status = this.parseStatus(
      trimSpaces(
        container
          .find('dl.dl-horizontal > dd')
          .eq(1)
          .text()
      )
    );
    manga.setThumbnailUrl(container.find('img.img-responsive').attr('src'));
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

    $('ul.chp_lst > li').each((i, elem) => {
      let chapter = new Chapter();

      chapter.url = trimSpaces(
        $(elem)
          .find('a')
          .first()
          .attr('href')
      );
      chapter.title = trimSpaces(
        $(elem)
          .find('a')
          .first()
          .find('span.val')
          .text()
      );
      chapter.publishedAt = parseDateAgo(
        trimSpaces(
          $(elem)
            .find('span.dte')
            .first()
            .text()
        )
      );

      chapter.generateId();

      chapters.push(chapter);
    });

    return chapters;
  }

  /**
   * @param $
   * @returns {Array}
   */
  pageList($: CheerioObject): Array<string> {
    let pages: Array<string> = [];
    let options = $('ul.list-switcher-2 > li > select.jump-menu')
      .first()
      .find('option');

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
    return $('img.img-responsive-2')
      .first()
      .attr('src');
  }

  /**
   * @param query
   * @param page
   * @returns {{url: string, headers: any, method: string, form: any}}
   */
  searchOptions(
    query: string,
    page: ?number
  ): { url: string, headers: any, method: string, form: any } {
    return {
      url: `${this.baseUrl}/service/advanced_search`,
      headers: {
        'X-Requested-With': 'XMLHttpRequest'
      },
      method: 'POST',
      form: {
        type: 'all',
        status: 'both',
        'manga-name': query
      }
    };
  }

  /**
   * @param $
   * @returns {Array}
   */
  search($: CheerioObject): Array<Manga> {
    let mangas: Array<Manga> = [];

    $('div.style-list > div.box').each((i, elem) => {
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
    return {
      hasNext: false,
      nextUrl: null,
      nextPage: null
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
    let link: CheerioObject = $(elem).find('div.title > h2 > a');

    manga.setUrl(link.attr('href'));
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

export default new ReadMangaToday();
