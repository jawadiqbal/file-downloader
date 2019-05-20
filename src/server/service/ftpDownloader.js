const debug = require('debug')('file-downloader:ftpDownloader');
const fs = require('fs');
const Ftp = require('ftp');
const checkDiskSpace = require('check-disk-space');

const common = require('./common');

const { DOWNLOAD_PATH } = process.env;

function download(args, destination, config) {
  const file = fs.createWriteStream(destination);
  const filePath = common.getFilePath(args);
  const fileName = args[args.length - 1];
  const fileDirectory = common.getFileDirectory(args);

  debug('File path: ', filePath);

  const c = new Ftp();

  c.on('ready', () => {
    c.list(fileDirectory, (errorList, list) => {
      if (errorList) throw errorList;

      // eslint-disable-next-line eqeqeq
      const fileSize = list.find(a => a.name == fileName).size;
      checkDiskSpace(DOWNLOAD_PATH).then(diskSpace => {
        debug('Disk size:          ', diskSpace.size);
        debug('Free space on disk: ', diskSpace.free);
        debug('File size:          ', fileSize);
        if (fileSize > diskSpace.free) {
          debug('Operation failed: not enough space on disk');
        } else {
          c.get(filePath, (errorGet, stream) => {
            if (errorGet) throw errorGet;
            stream.once('close', () => {
              c.end();
            });
            stream.pipe(file);
            file.on('finish', () => {
              file.close(() => {
                const downloadedFileSizeInBytes = common.getFileSize(destination);

                // eslint-disable-next-line eqeqeq
                if (downloadedFileSizeInBytes != fileSize) {
                  debug(downloadedFileSizeInBytes, ' vs ', fileSize);
                  fs.unlink(destination, () => {
                    debug('Operation failed: incomplete download');
                  });
                }
                debug('Operation successful: file saved to ', destination);
              });
            });
          });
        }
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
