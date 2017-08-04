jest.mock('request');

import Parser from '../src/parser';

Object.keys(Parser.getCatalogs()).forEach(function(catalogName) {
  describe('parser for ' + catalogName, function() {
    var manga;
    describe('getPopularMangaList', function() {
      let response;
      it('expect response to be an object with keys', function(done) {
        Parser.getPopularMangaList(catalogName)
          .then(function(resp) {
            response = resp;
            expect(response).toEqual(
              expect.objectContaining({
                mangas: expect.any(Array),
                hasNext: expect.any(Boolean),
                nextUrl: expect.any(String),
                nextPage: expect.any(Number)
              })
            );
            manga = response.mangas[0];
            done();
          })
          .catch(function(error) {
            console.log(error);
            expect(error).toBe(null);
            done();
          });
      });
    });

    describe('getMangaDetail', function() {
      let response;
      it('expect manga to be an object with keys', function(done) {
        Parser.getMangaDetail(catalogName, manga)
          .then(function(resp) {
            response = resp;
            expect(response).toEqual(
              expect.objectContaining({
                url: expect.any(String),
                inLibrary: expect.any(Boolean),
                id: expect.any(String),
                catalog: expect.any(String),
                thumbnailUrl: expect.any(String)
              })
            );
            manga = response;
            done();
          })
          .catch(function(error) {
            console.log(error);
            expect(error).toBe(null);
            done();
          });
      });
    });

    var chapter;
    describe('getChapterList', function() {
      it('expect chapters to be an array', function(done) {
        Parser.getChapterList(catalogName, manga)
          .then(function(chapters) {
            manga.chapters = chapters;
            expect(chapters).toEqual(expect.any(Array));
            expect(chapters.length).toBeGreaterThanOrEqual(1);
            if (chapters.length) {
              expect(chapters[0].id).toEqual(expect.any(String));
              expect(chapters[0].url).toEqual(expect.any(String));
              expect(chapters[0].title).toEqual(expect.any(String));
              expect(chapters[0].read).toEqual(expect.any(Boolean));
              expect(chapters[0].number).toEqual(expect.any(Number));
              expect(chapters[0].publishedAt).toEqual(expect.any(Date));
              expect(manga.getChapterUnreadCount()).toBeGreaterThanOrEqual(1);
            }
            chapter = chapters[0];
            done();
          })
          .catch(function(error) {
            console.log(error);
            expect(error).toBe(null);
            done();
          });
      });
    });

    var page;
    describe('getPageList', function() {
      it('expect pages to be an array', function(done) {
        Parser.getPageList(catalogName, chapter)
          .then(function(pages) {
            expect(pages).toEqual(expect.any(Array));
            expect(pages.length).toBeGreaterThanOrEqual(1);
            page = pages[0];
            done();
          })
          .catch(function(error) {
            console.log(error);
            expect(error).toBe(null);
            done();
          });
      });
    });

    describe('getImageURL', function() {
      it('expect url to be a string', function(done) {
        Parser.getImageURL(catalogName, page)
          .then(function(imageURL) {
            expect(imageURL).toEqual(expect.any(String));
            done();
          })
          .catch(function(error) {
            console.log(error);
            expect(error).toBe(null);
            done();
          });
      });
    });

    describe('searchManga', function() {
      let response;
      it('expect response to be an object with keys', function(done) {
        Parser.searchManga(catalogName, 'naruto')
          .then(function(resp) {
            response = resp;
            expect(response).toEqual(
              expect.objectContaining({
                mangas: expect.any(Array),
                hasNext: false,
                nextUrl: null,
                nextPage: null
              })
            );
            expect(response.mangas.length).toBeGreaterThanOrEqual(5);
            done();
          })
          .catch(function(error) {
            console.log(error);
            expect(error).toBe(null);
            done();
          });
      });
    });

    describe('getLatestUpdatesList', function() {
      it('expect response to be an object with keys', function(done) {
        Parser.getLatestUpdatesList(catalogName)
          .then(function(paginator) {
            expect(paginator).toEqual(
              expect.objectContaining({
                mangas: expect.any(Array),
                hasNext: expect.any(Boolean),
                nextUrl: expect.any(String),
                nextPage: expect.any(Number)
              })
            );
            expect(paginator.mangas.length).toBeGreaterThanOrEqual(5);
            done();
          })
          .catch(function(error) {
            console.log(error);
            expect(error).toBe(null);
            done();
          });
      });
    });
  });
});
