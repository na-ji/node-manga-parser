// @flow
import crypto from 'crypto';

export const STATUS_ONGOING: string = 'ongoing';
export const STATUS_COMPLETED: string = 'completed';
export const STATUS_UNKNOWN: string = 'unknown';

export class Manga {
  id: string;
  title: string;
  catalog: string;
  catalogId: ?number;
  inLibrary: ?boolean;
  detailsFetched: ?boolean;
  url: string;
  thumbnailUrl: ?string;
  author: ?string;
  artist: ?string;
  genre: ?string;
  description: ?string;
  status: ?string;

  constructor() {
    this.inLibrary = false;
  }

  generateId() {
    this.id = this.url
      ? crypto.createHash('md5').update(this.url).digest('hex')
      : this.id;
  }
}

export class Chapter {
  id: string;
  title: string;
  url: string;
  number: number;
  publishedAt: ?Date;

  generateId() {
    this.id = this.url
      ? crypto.createHash('md5').update(this.url).digest('hex')
      : this.id;
  }
}
