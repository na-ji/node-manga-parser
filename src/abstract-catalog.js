// @flow
import { Chapter, Manga } from "./models";

type CheerioObject = any;

export default class AbstractCatalog {
  index: number;
  popularPaginator: {
    hasNext: boolean,
    nextUrl: string
  };
  name: string;
  catalogName: string;
  baseUrl: string;
  lang: string;

  constructor() {
    this.index = 0;
    this.popularPaginator = {
      hasNext: false,
      nextUrl: ""
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
    throw new Error("Not implemented");
  }

  /**
   * @param $
   * @returns {Array.<Manga>}
   */
  popularMangaList($: CheerioObject): Array<Manga> {
    throw new Error("Not implemented");
  }

  /**
   * @param $
   * @returns {{hasNext: boolean, nextUrl: string}}
   */
  popularMangaPaginator(
    $: CheerioObject
  ): { hasNext: boolean, nextUrl: string } {
    throw new Error("Not implemented");
  }

  /**
   * @param $
   * @param manga
   * @returns {Manga}
   */
  mangaDetail($: CheerioObject, manga: Manga): Manga {
    throw new Error("Not implemented");
  }

  /**
   * @param $
   * @param manga
   * @returns {Array}
   */
  chapterList($: CheerioObject, manga: Manga): Array<Chapter> {
    throw new Error("Not implemented");
  }

  /**
   * @param $
   * @returns {Array}
   */
  pageList($: CheerioObject): Array<string> {
    throw new Error("Not implemented");
  }

  /**
   * @param $
   * @returns {string}
   */
  imageUrl($: CheerioObject): string {
    throw new Error("Not implemented");
  }

  /**
   * @param query
   * @returns {{url: string, headers: any, method: string, form: any}}
   */
  searchOptions(
    query: string
  ): { url: string, headers: any, method: string, form: any } {
    throw new Error("Not implemented");
  }

  /**
   * @param $
   * @returns {Array}
   */
  search($: CheerioObject): Array<Manga> {
    throw new Error("Not implemented");
  }
}
