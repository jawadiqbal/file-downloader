const debug = require('debug')('file-downloader:sftpDownloader');
const Sftp = require('ssh2-sftp-client');
const fs = require('fs');
const checkDiskSpace = require('check-disk-space');

const common = require('./common');
const {
  constants
} = require('../../config/constants');

function download(args, destination, config) {
  const filePath = common.getFilePath(args);
  const fileName = args[args.length - 1];
  const fileDirectory = common.getFileDirectory(args);

  debug('File path: ', filePath)

  const c = new Sftp();

  c.connect({
    ...config
  }, 'once').then(() => {
    return c.list(fileDirectory);
  }).then((data) => {
    // eslint-disable-next-line eqeqeq
    return data.find(a => a.name == fileName).size;
  }).then(fileSize => {
    checkDiskSpace(constants.DOWNLOAD_PATH).then((diskSpace) => {
      debug('Disk size:          ', diskSpace.size);
      debug('Free space on disk: ', diskSpace.free);
      debug('File size:          ', fileSize);
      if (fileSize > diskSpace.free) {
        debug('Operation failed: not enough space on disk');
      } else {
        c.fastGet(String(filePath), String(destination), {}).then(() => {
          const downloadedFileSizeInBytes = common.getFileSize(destination);

          // eslint-disable-next-line eqeqeq
          if (downloadedFileSizeInBytes != fileSize) {
            debug(downloadedFileSizeInBytes, ' vs ', fileSize);
            fs.unlink(destination, () => {
              debug('Operation failed: incomplete download');
            })
          } else {
            debug('Operation successful: file saved to ', destination);
          }
        }).catch(err => {
          debug(err);
        })
      }
    })
  })
}

module.exports = {
  download
};
