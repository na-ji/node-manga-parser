import fs from "fs";
import path from "path";

const request = (options, callback) => {
  // console.log(options);
  let file;
  if (typeof options === "object") {
    file = encodeURIComponent(options.url.trim());
  } else if (typeof options === "string") {
    file = encodeURIComponent(options.trim());
  } else {
    throw new Error("Unhandled options");
  }
  // console.log(file);
  const filePath = path.resolve(__dirname, `../__mockData__/${file}`);

  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return callback(err, null, null);
    }

    return callback(null, null, data);
  });
};

request.defaults = jest.fn(() => {
  return request;
});

module.exports = request;
