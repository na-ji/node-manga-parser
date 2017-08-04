# Manga Parser

[![npm](https://img.shields.io/npm/v/manga-parser.svg?style=flat-square)](https://www.npmjs.com/package/manga-parser) [![Travis](https://img.shields.io/travis/na-ji/node-manga-parser.svg?style=flat-square)](https://travis-ci.org/na-ji/node-manga-parser) [![Codecov](https://img.shields.io/codecov/c/github/na-ji/node-manga-parser.svg?style=flat-square)](https://codecov.io/gh/na-ji/node-manga-parser) [![Gemnasium](https://img.shields.io/gemnasium/na-ji/node-manga-parser.svg?style=flat-square)](https://gemnasium.com/github.com/na-ji/node-manga-parser) [![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Manga Parser is a parser for online manga sources. It provides a simple API to extract data about manga hosted and their chapters. More sources are going to be added

## Supported sources

-   [ReadMangaToday](http://www.readmanga.today/)

## Contributing

All contributions are welcome. If you do not know how to code, but still want to see another source to be added, just open an issue.

## Documentation

To use the `Parser`, just import it in your project

```javascript
// ES6 syntax
import { Parser } from 'manga-parser';
// CommonJS syntax
const Parser = require('manga-parser').Parser;
```

Most of the `Parser` methods require the `catalogName`, you can found this name on each [catalog class](https://github.com/na-ji/node-manga-parser/tree/master/src/sites).

### Usage Examples

```javascript
import { Parser } from 'manga-parser';

Parser.getPopularMangaList('readmangatoday').then(paginator => {
  console.log(paginator);
  let manga = paginator.mangas[0];
  return Parser.getMangaDetail('readmangatoday', manga);
}).then(manga => {
  console.log(manga);
  
  return Parser.getChapterList('readmangatoday', manga);
}).then(chapters => {
  console.log(chapters);
  let chapter = chapters[0];
  
  return Parser.getPageList('readmangatoday', chapter);
}).then(pages => {
  console.log(pages);
  let page = pages[0];
  
  return Parser.getImageURL('readmangatoday', page);
}).then(imageURL => {
  console.log(imageURL);
});
```

```javascript
import { Parser } from 'manga-parser';

Parser.searchManga('readmangatoday', 'naruto').then(paginator => {
  console.log(paginator);
});
```

### Parser Class

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

#### getPopularMangaList

Fetch the popular manga on the catalog

**Parameters**

-   `catalogName` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `fetchNextPage` **[boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** After being called once and if there is another page, will fetch the next page (optional, default `false`)

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;{mangas: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;Manga>, hasNext: [boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean), nextUrl: [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)}>** 

#### getMangaDetail

Fetch every information for a Manga

**Parameters**

-   `catalogName` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `manga` **Manga** 

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;Manga>** 

#### getChapterList

Fetch the list of chapters for Manga

**Parameters**

-   `catalogName` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `manga` **Manga** 

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;Chapter>>** 

#### getPageList

Fetch every pages URL for a manga

**Parameters**

-   `catalogName` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `chapter` **Chapter** 

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>>** 

#### getImageURL

Fetch the image URL from a page URL

**Parameters**

-   `catalogName` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `pageURL` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)>** 

#### searchManga

Search for Manga from a catalog

**Parameters**

-   `catalogName` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `query` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 

Returns **[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)&lt;{mangas: [Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)&lt;Manga>, hasNext: [boolean](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean), nextUrl: [string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)}>** 

#### getCatalogs

Return the list of catalogs

Returns **{name: AbstractCatalog}** 

#### getCatalog

Return a catalog

**Parameters**

-   `catalogName` **[string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String)** 

Returns **AbstractCatalog** 
