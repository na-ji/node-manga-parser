// @flow
import _ from "lodash";
import Promise from "bluebird";
import cheerio from "cheerio";
import { encode } from "node-base64-image";
let request = require("request");

import * as catalogs from "./sites";
import type AbstractCatalog from "./abstract-catalog";
import type { Chapter, Manga } from "./models";

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
   * @param {string} catalogName
   * @param {boolean} fetchNextPage
   * @returns {Promise}
   */
  getPopularMangaList(
    catalogName: string,
    fetchNextPage: boolean = false
  ): Promise {
    const catalog: AbstractCatalog = this.getCatalog(catalogName);

    let url = catalog.popularMangaUrl();
    if (fetchNextPage && catalog.popularPaginator.hasNext) {
      url = catalog.popularPaginator.nextUrl;
    } else if (fetchNextPage) {
      // TODO : Manage the case when we reach the end of the list
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
   * @param {string} catalogName
   * @param {Manga} manga
   * @returns {Promise}
   */
  getMangaDetail(catalogName: string, manga: Manga): Promise {
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
   * @param {string} catalogName
   * @param {Manga} manga
   * @returns {Promise}
   */
  getChapterList(catalogName: string, manga: Manga): Promise {
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
          ["number", "publishedAt"],
          ["asc", "asc"]
        );

        resolve(chapters);
      });
    });
  }

  /**
   * @param {string} catalogName
   * @param {Chapter} chapter
   * @returns {Promise}
   */
  getPageList(catalogName: string, chapter: Chapter): Promise {
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
   * @param {string} catalogName
   * @param {string} pageURL
   * @returns {Promise}
   */
  getImageURL(catalogName: string, pageURL: string): Promise {
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
   * @param {string} catalogName
   * @param {string} query
   */
  searchManga(catalogName: string, query: string): Promise {
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
   * @returns {{}}
   */
  getCatalogs(): {} {
    return this.catalogs;
  }

  /**
   * @param {string} catalogName
   * @returns {AbstractCatalog}
   */
  getCatalog(catalogName: string): AbstractCatalog {
    if (!(catalogName in this.catalogs)) {
      throw new Error("Catalog does not exist");
    }

    return this.catalogs[catalogName];
  }
}

export default new Parser();
