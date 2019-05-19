const axios = require('axios');
const debug = require('debug')('file-downloader:httpDownloader');
const fs = require('fs');
const checkDiskSpace = require('check-disk-space');

const common = require('./common');
const {
  constants
} = require('../../config/constants');

function download(url, destination) {
  const file = fs.createWriteStream(destination);

  axios({
    method: 'get',
    url,
    responseType: 'stream'
  }).then(response => {
    const fileSizeInHost = response.headers['content-length'];
    checkDiskSpace(constants.DOWNLOAD_PATH).then((diskSpace) => {
      debug('Disk size:          ', diskSpace.size);
      debug('Free space on disk: ', diskSpace.free);
      debug('File size:          ', fileSizeInHost);

      if (fileSizeInHost > diskSpace.free) {
        debug('Operation failed: not enough space on disk');
      } else {
        response.data.pipe(file);
        file.on('finish', () => {
          file.close(() => {
            const downloadedFileSizeInBytes = common.getFileSize(destination);

            // eslint-disable-next-line eqeqeq
            if (downloadedFileSizeInBytes != fileSizeInHost) {
              debug(downloadedFileSizeInBytes, ' vs ', fileSizeInHost);
              fs.unlink(destination, () => {
                debug('Operation failed: incomplete download');
              })
            };
            debug('Operation successful: file saved to ', destination);
          });
        });
      };
    })
  }).catch(
    error => {
      fs.unlink(destination, () => {
        file.close();
      });
      debug(error);
      debug('Operation failed: host/network error');
    }
  );
}

module.exports = {
  download
};
