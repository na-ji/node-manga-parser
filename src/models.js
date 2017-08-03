// @flow
import crypto from "crypto";
import _ from "lodash";

export class Manga {
  id: string;
  title: string;
  catalog: string;
  catalogId: ?number;
  inLibrary: ?boolean;
  detailsFetched: ?boolean;
  url: string;
  chapters: ?Array<Chapter>;
  thumbnailUrl: ?string;
  author: ?string;
  artist: ?string;
  genre: ?string;
  description: ?string;
  status: ?string;
  updatedAt: ?Date;

  constructor() {
    this.inLibrary = false;
  }

  generateId() {
    this.id = this.url
      ? crypto.createHash("md5").update(this.url).digest("hex")
      : this.id;
  }

  /**
   * @returns {int}
   */
  getChapterUnreadCount(): number {
    return _.sumBy(this.chapters, { read: false });
  }
}

export class Chapter {
  id: string;
  title: string;
  url: string;
  number: number;
  publishedAt: ?Date;
  read: ?boolean;

  constructor() {
    this.read = false;
  }

  generateId() {
    this.id = this.url
      ? crypto.createHash("md5").update(this.url).digest("hex")
      : this.id;
  }
}
