import fs from 'fs';
import path from 'path';
let request = require.requireActual('request');

const requestMock = (options, callback) => {
  // console.log(options);
  let file;
  if (typeof options === 'object') {
    file = encodeURIComponent(options.url.trim());
  } else if (typeof options === 'string') {
    file = encodeURIComponent(options.trim());
  } else {
    throw new Error('Unhandled options: ' + options);
  }
  // console.log(file);
  const filePath = path.resolve(__dirname, `./__mockData__/${file}`);

  fs.readFile(filePath, 'utf8', (err, data) => {
    if (err && 'errno' in err && err.errno === -2) {
      request = request.defaults({
        gzip: true
      });
      let file = fs.createWriteStream(filePath);

      return request(options).pipe(file);
    } else if (err) {
      return callback(err, null, null);
    }

    return callback(null, { statusCode: 200 }, data);
  });
};

requestMock.defaults = jest.fn(() => {
  return requestMock;
});

module.exports = requestMock;
