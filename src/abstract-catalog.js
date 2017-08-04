// @flow
import { Chapter, Manga } from './models';

export const LANGUAGE_EN = 'en';

type CheerioObject = any;
type paginator = {
  hasNext: boolean,
  nextUrl: string
};

export default class AbstractCatalog {
  index: number;
  popularPaginator: paginator;
  latestPaginator: paginator;
  name: string;
  catalogName: string;
  baseUrl: string;
  lang: string;

  constructor() {
    this.index = 0;
    this.popularPaginator = {
      hasNext: false,
      nextUrl: ''
    };
    this.latestPaginator = {
      hasNext: false,
      nextUrl: ''
    };
  }

  /**
   * @returns {number}
   */
  getNextIndex(): number {
    return this.index++;
  }

  /**
   * @returns {string}
   */
  popularMangaUrl(): string {
    throw new Error('Not implemented');
  }

  /**
   * @param $
   * @param {boolean} injectIndex Should an index injected
   * @returns {Array.<Manga>}
   */
  popularMangaList(
    $: CheerioObject,
    injectIndex: boolean = true
  ): Array<Manga> {
    throw new Error('Not implemented');
  }

  /**
   * @param $
   * @returns {{hasNext: boolean, nextUrl: string}}
   */
  popularMangaPaginator(
    $: CheerioObject
  ): { hasNext: boolean, nextUrl: string } {
    throw new Error('Not implemented');
  }

  /**
   * @returns {string}
   */
  latestUpdatesUrl(): string {
    throw new Error('Not implemented');
  }

  /**
   * @param $
   * @returns {Array.<Manga>}
   */
  latestUpdatesList($: CheerioObject): Array<Manga> {
    throw new Error('Not implemented');
  }

  /**
   * @param $
   * @returns {{hasNext: boolean, nextUrl: string}}
   */
  latestUpdatesPaginator(
    $: CheerioObject
  ): { hasNext: boolean, nextUrl: string } {
    throw new Error('Not implemented');
  }

  /**
   * @param $
   * @param manga
   * @returns {Manga}
   */
  mangaDetail($: CheerioObject, manga: Manga): Manga {
    throw new Error('Not implemented');
  }

  /**
   * @param $
   * @param manga
   * @returns {Array}
   */
  chapterList($: CheerioObject, manga: Manga): Array<Chapter> {
    throw new Error('Not implemented');
  }

  /**
   * @param $
   * @returns {Array}
   */
  pageList($: CheerioObject): Array<string> {
    throw new Error('Not implemented');
  }

  /**
   * @param $
   * @returns {string}
   */
  imageUrl($: CheerioObject): string {
    throw new Error('Not implemented');
  }

  /**
   * @param query
   * @returns {{url: string, headers: any, method: string, form: any}}
   */
  searchOptions(
    query: string
  ): { url: string, headers: any, method: string, form: any } {
    throw new Error('Not implemented');
  }

  /**
   * @param $
   * @returns {Array}
   */
  search($: CheerioObject): Array<Manga> {
    throw new Error('Not implemented');
  }
}
