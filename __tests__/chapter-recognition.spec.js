import ChapterRecognition from "../src/chapter-recognition";

const specs = [
  {
    it: "expect to recognise Ch.{number}",
    title: "Mokushiroku Alice Vol.1 Ch.4: Misrepresentation",
    result: 4
  },
  {
    it: "expect to recognise Ch.{number.decimal}",
    title: "Mokushiroku Alice Vol.1 Ch.4.1: Misrepresentation",
    result: 4.1
  },
  {
    it: "expect to recognise Ch.{number.decimal}",
    title: "Mokushiroku Alice Vol.1 Ch.4.4: Misrepresentation",
    result: 4.4
  },
  {
    it: "expect to recognise Ch.{number.letter}",
    title: "Mokushiroku Alice Vol.1 Ch.4.a: Misrepresentation",
    result: 4.1
  },
  {
    it: "expect to recognise Ch.{number.letter}",
    title: "Mokushiroku Alice Vol.1 Ch.4.b: Misrepresentation",
    result: 4.2
  },
  {
    it: "expect to recognise Ch.{number.extra}",
    title: "Mokushiroku Alice Vol.1 Ch.4.extra: Misrepresentation",
    result: 4.99
  },
  {
    it: "expect to recognise Ch.{number.omake}",
    title: "Mokushiroku Alice Vol.1 Ch.4.omake: Misrepresentation",
    result: 4.98
  },
  {
    it: "expect to recognise Ch.{number.special}",
    title: "Mokushiroku Alice Vol.1 Ch.4.special: Misrepresentation",
    result: 4.97
  },
  {
    it: "expect to recognise {number}",
    title: "Bleach 567: Down With Snowwhite",
    result: 567
  },
  {
    it: "expect to recognise {number.decimal}",
    title: "Bleach 567.1: Down With Snowwhite",
    result: 567.1
  },
  {
    it: "expect to recognise {number.decimal}",
    title: "Bleach 567.4: Down With Snowwhite",
    result: 567.4
  },
  {
    it: "expect to recognise {number.letter}",
    title: "Bleach 567.a: Down With Snowwhite",
    result: 567.1
  },
  {
    it: "expect to recognise {number.letter}",
    title: "Bleach 567.b: Down With Snowwhite",
    result: 567.2
  },
  {
    it: "expect to recognise {number.extra}",
    title: "Bleach 567.extra: Down With Snowwhite",
    result: 567.99
  },
  {
    it: "expect to recognise multiple {number}",
    title: "Solanin 028 Vol. 2",
    mangaTitle: "Solanin",
    result: 28
  },
  {
    it: "expect to recognise multiple {number.decimal}",
    title: "Solanin 028.1 Vol. 2",
    mangaTitle: "Solanin",
    result: 28.1
  },
  {
    it: "expect to recognise multiple {number.letter}",
    title: "Solanin 028.b Vol. 2",
    mangaTitle: "Solanin",
    result: 28.2
  },
  {
    it: "expect to recognise multiple {number} in wrong order",
    title: "Onepunch-Man Punch Ver002 028",
    mangaTitle: "Onepunch-Man",
    result: 28
  }
];

describe("chapter recognition", function() {
  specs.forEach(function(spec) {
    it(spec.it, function() {
      let result = ChapterRecognition.parseChapterNumber(
        { title: spec.title },
        { title: spec.mangaTitle }
      );
      let expectedMatch = {
        title: spec.title,
        number: spec.result
      };
      expect(result).toMatchObject(expectedMatch);
    });
  });
});
