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
  timeout: 10000
});

// TODO : Manage manga status

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
   * Fetch the popular manga on the catalog
   * @param {string} catalogName
   * @param {boolean} fetchNextPage After being called once and if there is another page, will fetch the next page
   * @returns {Promise<{mangas: Array<Manga>, hasNext: boolean, nextUrl: string}>}
   */
  getPopularMangaList(
    catalogName: string,
    fetchNextPage: boolean = false
  ): Promise<{ mangas: Array<Manga>, hasNext: boolean, nextUrl: string }> {
    const catalog: AbstractCatalog = this.getCatalog(catalogName);

    let url = catalog.popularMangaUrl();
    if (fetchNextPage && catalog.popularPaginator.hasNext) {
      url = catalog.popularPaginator.nextUrl;
    } else if (fetchNextPage) {
      return Promise.resolve({ mangas: [], hasNext: false, nextUrl: null });
    }

    return new Promise(function(resolve, reject) {
      request(url, function(error, response, page) {
        if (error) {
          return reject(error);
        }
        let $ = cheerio.load(page);

        let mangas = catalog.popularMangaList($);

        catalog.popularMangaPaginator($);

        return resolve({
          mangas,
          ...catalog.popularPaginator
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
            manga.thumbnailUrl = result;
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
   * Search for Manga from a catalog
   * @param {string} catalogName
   * @param {string} query
   * @returns {Promise<{mangas: Array<Manga>, hasNext: boolean, nextUrl: string}>}
   */
  searchManga(
    catalogName: string,
    query: string
  ): Promise<{ mangas: Array<Manga>, hasNext: boolean, nextUrl: string }> {
    const catalog: AbstractCatalog = this.getCatalog(catalogName);
    const options = catalog.searchOptions(query);

    return new Promise(function(resolve, reject) {
      request(options, function(error, response, page) {
        if (error) {
          return reject(error);
        }

        let $ = cheerio.load(page);
        let mangas = catalog.search($);

        return resolve({
          mangas,
          hasNext: false,
          nextUrl: null
        });
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
