const axios = require('axios');
const debug = require('debug')('file-downloader:httpDownloader');

function httpDownloader() {
  axios({
    method: 'get',
    url,
    responseType: 'stream'
  }).then(response => {
    const fileSizeInHost = response.headers['content-length'];
    debug('File size in host: ', fileSizeInHost);

    checkDiskSpace(DOWNLOAD_PATH).then((diskSpace) => {
      debug('Disk size:          ', diskSpace.size);
      debug('Free space in disk: ', diskSpace.free);
      if (diskSpace.free < fileSizeInHost) {
        debug('Operation failed: not enough space in disk');
      } else {
        response.data.pipe(file);
        file.on('finish', () => {
          file.close(() => {
            const downloadedFileSizeInBytes = fs.statSync(destination).size;
            debug('Downloaded file size: ', downloadedFileSizeInBytes);

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
      }
    });
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

module.exports({
  httpDownloader
});
