// @flow
import _ from 'lodash';
import Promise from 'bluebird';
import cheerio from 'cheerio';
import { encode } from 'node-base64-image';
let request = require('request');

import * as catalogs from './sites';
import type AbstractCatalog from './abstract-catalog';
import type { Chapter, Manga } from './models';

request = request.defaults({
  timeout: 20000,
  gzip: true
});

class Parser {
  catalogs: {};

  constructor() {
    let sources = {};

    _.forEach(catalogs, (catalog: AbstractCatalog) => {
      sources[catalog.catalogName] = catalog;
    });

    this.catalogs = sources;
  }

  /**
   * Fetch the popular mangas on the catalog
   * @param {string} catalogName
   * @param {number} page Page to fetch
   * @returns {Promise<{mangas: Array<Manga>, hasNext: boolean, nextUrl: string, nextPage: number}>}
   */
  getPopularMangaList(
    catalogName: string,
    page: ?number = null
  ): Promise<{ mangas: Array<Manga>, hasNext: boolean, nextUrl: string, nextPage: number }> {
    const catalog: AbstractCatalog = this.getCatalog(catalogName);

    let options = catalog.popularMangaRequest(page);

    return new Promise(function(resolve, reject) {
      request(options, function(error, response, page) {
        if (error) {
          return reject(error);
        }
        let $ = cheerio.load(page);

        let mangas = catalog.popularMangaList($);

        const paginator = catalog.popularMangaPaginator($);

        return resolve({
          mangas,
          ...paginator
        });
      });
    });
  }

  /**
   * Fetch the latest updated manga on the catalog
   * @param {string} catalogName
   * @param {number} page Page to fetch
   * @returns {Promise<{mangas: Array<Manga>, hasNext: boolean, nextUrl: string, nextPage: number}>}
   */
  getLatestUpdatesList(
    catalogName: string,
    page: ?number = null
  ): Promise<{ mangas: Array<Manga>, hasNext: boolean, nextUrl: string, nextPage: number }> {
    const catalog: AbstractCatalog = this.getCatalog(catalogName);

    let options = catalog.latestUpdatesRequest(page);

    return new Promise(function(resolve, reject) {
      request(options, function(error, response, page) {
        if (error) {
          return reject(error);
        }
        let $ = cheerio.load(page);

        let mangas = catalog.latestUpdatesList($);

        const paginator = catalog.latestUpdatesPaginator($);

        return resolve({
          mangas,
          ...paginator
        });
      });
    });
  }

  /**
   * Search for Manga from a catalog
   * @param {string} catalogName
   * @param {string} query
   * @param {?number} page
   * @returns {Promise<{ mangas: Array<Manga>, hasNext: boolean, nextUrl: ?string, nextPage: ?number }>}
   */
  searchManga(
    catalogName: string,
    query: string,
    page: ?number = null
  ): Promise<{ mangas: Array<Manga>, hasNext: boolean, nextUrl: ?string, nextPage: ?number }> {
    const catalog: AbstractCatalog = this.getCatalog(catalogName);
    const options = catalog.searchOptions(query, page);

    return new Promise(function(resolve, reject) {
      request(options, function(error, response, page) {
        if (error) {
          return reject(error);
        }

        let $ = cheerio.load(page);
        let mangas = catalog.search($);

        const paginator = catalog.searchPaginator($);

        return resolve({
          mangas,
          ...paginator
        });
      });
    });
  }

  /**
   * Fetch every information for a Manga
   * @param {string} catalogName
   * @param {Manga} manga
   * @returns {Promise<Manga>}
   */
  getMangaDetail(catalogName: string, manga: Manga): Promise<Manga> {
    const catalog: AbstractCatalog = this.getCatalog(catalogName);

    return new Promise(function(resolve, reject) {
      request(manga.url, function(error, response, page) {
        if (error) {
          return reject(error);
        }

        let $ = cheerio.load(page);
        manga = catalog.mangaDetail($, manga);

        encode(manga.thumbnailUrl, { string: true }, (error, result) => {
          if (!error) {
            manga.thumbnailUrl = `data:;base64,${result}`;
          }

          resolve(manga);
        });
      });
    });
  }

  /**
   * Fetch the list of chapters for Manga
   * @param {string} catalogName
   * @param {Manga} manga
   * @returns {Promise<Array<Chapter>>}
   */
  getChapterList(catalogName: string, manga: Manga): Promise<Array<Chapter>> {
    const catalog: AbstractCatalog = this.getCatalog(catalogName);

    return new Promise(function(resolve, reject) {
      request(manga.url, function(error, response, page) {
        if (error) {
          return reject(error);
        }

        let $ = cheerio.load(page);
        let chapters = catalog.chapterList($, manga);

        chapters = _.orderBy(
          chapters,
          ['number', 'publishedAt'],
          ['asc', 'asc']
        );

        resolve(chapters);
      });
    });
  }

  /**
   * Fetch every pages URL for a manga
   * @param {string} catalogName
   * @param {Chapter} chapter
   * @returns {Promise<Array<string>>}
   */
  getPageList(catalogName: string, chapter: Chapter): Promise<Array<string>> {
    const catalog: AbstractCatalog = this.getCatalog(catalogName);

    return new Promise((resolve, reject) => {
      request(chapter.url, (error, response, page) => {
        if (error) {
          return reject(error);
        }

        let $ = cheerio.load(page);
        let pages = catalog.pageList($);

        resolve(pages);
      });
    });
  }

  /**
   * Fetch the image URL from a page URL
   * @param {string} catalogName
   * @param {string} pageURL
   * @returns {Promise<string>}
   */
  getImageURL(catalogName: string, pageURL: string): Promise<string> {
    const catalog: AbstractCatalog = this.getCatalog(catalogName);

    return new Promise((resolve, reject) => {
      request(pageURL, (error, response, page) => {
        if (error) {
          return reject(error);
        }

        let $ = cheerio.load(page);
        let imageURL = catalog.imageUrl($);

        resolve(imageURL);
      });
    });
  }

  /**
   * Return the list of catalogs
   * @returns {{name:AbstractCatalog}}
   */
  getCatalogs(): {} {
    return this.catalogs;
  }

  /**
   * Return a catalog
   * @param {string} catalogName
   * @returns {AbstractCatalog}
   */
  getCatalog(catalogName: string): AbstractCatalog {
    if (!(catalogName in this.catalogs)) {
      throw new Error('Catalog does not exist');
    }

    return this.catalogs[catalogName];
  }
}

export default new Parser();
