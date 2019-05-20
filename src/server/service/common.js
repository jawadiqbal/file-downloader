const debug = require('debug')('file-downloader:common');
const fs = require('fs');
const path = require('path');
// const checkDiskSpace = require('check-disk-space');

const { DOWNLOAD_PATH } = process.env;

function getDestination(args) {
  const fileName = args[args.length - 1];

  fs.mkdir(path.join(DOWNLOAD_PATH), error => {
    debug(error);
  });

  return path.join(DOWNLOAD_PATH, fileName);
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

// // To Do
// function ifDownloadExceedsCapacity(fileSize) {
// };

function getFileDirectory(args) {
  let filePath = args[3];
  for (let i = 4; i < args.length - 1; i += 1) {
    filePath += `/${args[i]}`;
  }
  return filePath;
}

function getProtocol(args) {
  return args[0].slice(0, args[0].length - 1);
}

module.exports = {
  getDestination,
  getFilePath,
  getFileSize,
  // ifDownloadExceedsCapacity,
  getFileDirectory,
  getProtocol
};
