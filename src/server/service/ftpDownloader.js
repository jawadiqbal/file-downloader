const debug = require('debug')('file-downloader:ftpDownloader');
const fs = require('fs');
const Ftp = require('ftp');

const common = require('./common');

function download(args, destination, config) {
  const file = fs.createWriteStream(destination);

  const filePath = common.getFilePath(args);

  debug('File path: ', filePath)

  const c = new Ftp();

  c.on('ready', () => {
    c.get(filePath, (err, stream) => {
      if (err) throw err;
      stream.once('close', () => {
        c.end();
      });
      stream.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          debug('Operation successful: file saved to ', destination);
        });
      });
    });
  });

  c.connect({
    ...config
  });
}

module.exports = {
  download
};
