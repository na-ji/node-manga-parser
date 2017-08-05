import fs from 'fs';
import path from 'path';
import http from 'http';

const request = (options, callback) => {
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
      let file = fs.createWriteStream(filePath);

      return http
        .request(options, res => {
          res.pipe(file);

          file.on('finish', () => {
            file.close();
          });

          res.on('end', () => {
            return callback(err, null, null);
          });
        })
        .on('error', err => {
          fs.unlink(filePath);
          return callback(err, null, null);
        })
        .end();
    } else if (err) {
      return callback(err, null, null);
    }

    return callback(null, { statusCode: 200 }, data);
  });
};

request.defaults = jest.fn(() => {
  return request;
});

module.exports = request;
