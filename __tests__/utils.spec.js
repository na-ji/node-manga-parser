import { parseDateAgo, trimSpaces } from "../src/utils";

describe("date parsers", function() {
  describe("date ago", function() {
    let dateParseFailed = new Date(1970, 0, 1);
    let types = ["minute", "hour", "day", "week", "month", "year"];
    types.forEach(function(type) {
      [type, type + "s"].forEach(function(t) {
        it("expect to parse " + t, function() {
          let parsed = parseDateAgo("8 " + t + " ago");
          expect(parsed).not.toEqual(dateParseFailed);
        });
      });
    });

    it("expect Date when parse failed", function() {
      let parsed = parseDateAgo("yolo");
      expect(parsed).toEqual(dateParseFailed);
    });
  });
});

describe("str parsers", function() {
  describe("trimSpaces", function() {
    it("expect spaces trimed before and after", function() {
      let str = trimSpaces("  caca   ");
      expect(str).toBe("caca");
    });

    it("expect spaces trimed inside", function() {
      let str = trimSpaces("  caca   pipi  ");
      expect(str).toBe("caca pipi");
    });
  });
});
