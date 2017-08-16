// @flow
import _ from 'lodash';
import Promise from 'bluebird';
import cheerio from 'cheerio';
let request = require('request');

import * as catalogs from './sites';
import ChapterRecognition from './chapter-recognition';
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
  ): Promise<{
    mangas: Array<Manga>,
    hasNext: boolean,
    nextUrl: string,
    nextPage: number
  }> {
    const catalog: AbstractCatalog = this.getCatalog(catalogName);

    let options = catalog.popularMangaRequest(page);

    return new Promise(function(resolve, reject) {
      request(options, function(error, response, page) {
        if (error) {
          return reject(error);
        }

        let $ = cheerio.load(page);
        let mangas;
        let paginator;

        try {
          mangas = catalog.popularMangaList($);
        } catch (error) {
          return reject(error);
        }

        try {
          paginator = catalog.popularMangaPaginator($);
        } catch (error) {
          return reject(error);
        }

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
  ): Promise<{
    mangas: Array<Manga>,
    hasNext: boolean,
    nextUrl: string,
    nextPage: number
  }> {
    const catalog: AbstractCatalog = this.getCatalog(catalogName);

    let options = catalog.latestUpdatesRequest(page);

    return new Promise(function(resolve, reject) {
      request(options, function(error, response, page) {
        if (error) {
          return reject(error);
        }

        let $ = cheerio.load(page);
        let mangas;
        let paginator;

        try {
          mangas = catalog.latestUpdatesList($);
        } catch (error) {
          return reject(error);
        }

        try {
          paginator = catalog.latestUpdatesPaginator($);
        } catch (error) {
          return reject(error);
        }

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
  ): Promise<{
    mangas: Array<Manga>,
    hasNext: boolean,
    nextUrl: ?string,
    nextPage: ?number
  }> {
    const catalog: AbstractCatalog = this.getCatalog(catalogName);
    const options = catalog.searchOptions(query, page);

    return new Promise(function(resolve, reject) {
      request(options, function(error, response, page) {
        if (error) {
          return reject(error);
        }

        let $ = cheerio.load(page);
        let mangas;
        let paginator;

        try {
          mangas = catalog.search($);
        } catch (error) {
          return reject(error);
        }

        try {
          paginator = catalog.searchPaginator($);
        } catch (error) {
          return reject(error);
        }

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
        try {
          manga = catalog.mangaDetail($, manga);
        } catch (error) {
          return reject(error);
        }

        resolve(manga);
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
        let chapters;
        try {
          chapters = catalog.chapterList($);
        } catch (error) {
          return reject(error);
        }

        _.forEach(chapters, (chapter, index) => {
          chapters[index] = ChapterRecognition.parseChapterNumber(
            chapter,
            manga
          );
        });

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
   * Fetch the list of chapters for a Manga sorted by volumes
   * @param {string} catalogName
   * @param {Manga} manga
   * @returns {Promise<{}>}
   */
  getChapterListByVolumes(catalogName: string, manga: Manga): Promise<{}> {
    const catalog: AbstractCatalog = this.getCatalog(catalogName);

    if (!catalog.hasVolumeInfos) {
      return Promise.reject(`${catalogName} does not have volume infos`);
    }

    return new Promise(function(resolve, reject) {
      request(manga.url, function(error, response, page) {
        if (error) {
          return reject(error);
        }

        let $ = cheerio.load(page);
        let volumes;

        try {
          volumes = catalog.chapterListByVolume($);
        } catch (error) {
          return reject(error);
        }

        _.forEach(volumes, (chapters, volume) => {
          _.forEach(chapters, (chapter, index) => {
            chapters[index] = ChapterRecognition.parseChapterNumber(
              chapter,
              manga
            );
          });

          volumes[volume] = _.orderBy(
            chapters,
            ['number', 'publishedAt'],
            ['asc', 'asc']
          );
        });

        resolve(volumes);
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
        let pages;
        try {
          pages = catalog.pageList($);
        } catch (error) {
          return reject(error);
        }

        return resolve(pages);
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
        let imageURL;
        try {
          imageURL = catalog.imageUrl($);
        } catch (error) {
          return reject(error);
        }

        return resolve(imageURL);
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
