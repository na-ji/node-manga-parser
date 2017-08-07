// @flow
import { Chapter, Manga } from './models';

export const LANGUAGE_EN = 'en';

type CheerioObject = any;

export default class AbstractCatalog {
  index: number;
  name: string;
  catalogName: string;
  baseUrl: string;
  lang: string;

  constructor() {
    this.index = 0;
  }

  /**
   * @returns {number}
   */
  getNextIndex(): number {
    return this.index++;
  }

  /**
   * Return request option object or an URL
   * @param {number} page
   * @returns {string|{url: string}}
   */
  popularMangaRequest(page: ?number): string | { url: string } {
    throw new Error('Not implemented');
  }

  /**
   * @param $
   * @returns {Array.<Manga>}
   */
  popularMangaList($: CheerioObject): Array<Manga> {
    throw new Error('Not implemented');
  }

  /**
   * @param $
   * @returns {{hasNext: boolean, nextUrl: string, nextPage: ?number}}
   */
  popularMangaPaginator(
    $: CheerioObject
  ): { hasNext: boolean, nextUrl: string, nextPage: ?number } {
    throw new Error('Not implemented');
  }

  /**
   * Return request option object or an URL
   * @param {number} page
   * @returns {string|{url: string}}
   */
  latestUpdatesRequest(page: ?number): string | { url: string } {
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
   * @returns {{hasNext: boolean, nextUrl: string, nextPage: ?number}}
   */
  latestUpdatesPaginator(
    $: CheerioObject
  ): { hasNext: boolean, nextUrl: string, nextPage: ?number } {
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
   * @param page
   * @returns {{url: string, headers: any, method: string, form: any}}
   */
  searchOptions(
    query: string,
    page: ?number
  ): { url: string, headers: any, method: string, form: any } | string {
    throw new Error('Not implemented');
  }

  /**
   * @param $
   * @returns {Array}
   */
  search($: CheerioObject): Array<Manga> {
    throw new Error('Not implemented');
  }

  /**
   * @param $
   * @returns {{ hasNext: boolean, nextUrl: ?string, nextPage: ?number }}
   */
  searchPaginator(
    $: CheerioObject
  ): { hasNext: boolean, nextUrl: ?string, nextPage: ?number } {
    throw new Error('Not implemented');
  }
}
