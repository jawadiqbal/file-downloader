const debug = require('debug')('file-downloader:common');
const fs = require('fs');
const path = require('path');
const checkDiskSpace = require('check-disk-space');

const {
  constants
} = require('../../config/constants');

function getDestination(args) {
  const fileName = args[args.length - 1];

  fs.mkdir(path.join(constants.DOWNLOAD_PATH), error => {
    debug(error);
  });

  return path.join(constants.DOWNLOAD_PATH, fileName);
}

function getFilePath(args) {
  let filePath = args[3];
  for (let i = 4; i < args.length; i += 1) {
    filePath += `/${args[i]}`;
  }
  return filePath;
}

function getFileSize(destination) {
  const downloadedFileSizeInBytes = fs.statSync(destination).size;
  return downloadedFileSizeInBytes;
}

function ifDownloadExceedsCapacity(fileSize) {
  checkDiskSpace(constants.DOWNLOAD_PATH).then((diskSpace) => {
    debug('Disk size:          ', diskSpace.size);
    debug('Free space in disk: ', diskSpace.free);

    return fileSize > diskSpace.free;
  });
};

module.exports = {
  getDestination,
  getFilePath,
  getFileSize,
  ifDownloadExceedsCapacity
};
