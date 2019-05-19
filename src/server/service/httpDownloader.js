const axios = require('axios');
const debug = require('debug')('file-downloader:httpDownloader');
const fs = require('fs');

const common = require('./common');

function download(url, destination) {
  const file = fs.createWriteStream(destination);

  axios({
    method: 'get',
    url,
    responseType: 'stream'
  }).then(response => {
    const fileSizeInHost = response.headers['content-length'];
    debug('File size in host: ', fileSizeInHost);

    if (common.ifDownloadExceedsCapacity(fileSizeInHost)) {
      debug('Operation failed: not enough space in disk');
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
