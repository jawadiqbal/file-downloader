const debug = require('debug')('file-downloader:*');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

const {
  DOWNLOAD_PATH
} = process.env;

function download(req, res) {
  debug('requesting to /api/v1/download | POST | params: ', req.body);

  const {
    url
  } = req.body;

  const args = url.split('/');
  const fileName = args[args.length - 1];

  fs.mkdir(path.join(DOWNLOAD_PATH), error => {
    debug(error);
  });

  const destination = path.join(DOWNLOAD_PATH, fileName);

  const file = fs.createWriteStream(destination);

  axios({
    method: 'get',
    url,
    responseType: 'stream'
  }).then(response => {
    const fileSizeInHost = response.headers['content-length'];
    debug('File size in host: ', fileSizeInHost);

    response.data.pipe(file);
    file.on('finish', () => {
      file.close(() => {
        const downloadedFileSizeInBytes = fs.statSync(destination).size;
        debug('Downloaded file size: ', downloadedFileSizeInBytes);

        if (downloadedFileSizeInBytes != fileSizeInHost) {
          debug(downloadedFileSizeInBytes, ' vs ', fileSizeInHost);
          fs.unlink(destination, () => {
            // return res.status(500).send({
            //   message: 'Download incomplete! removing file from disk.'
            // });
            debug('Operation failed: incomplete download');
          })
        };

        // return res.status(200).send({
        //   message: 'Operation Successful!'
        // });
        debug('Operation successful: file saved to ', destination);
      });
    });
  }).catch(
    error => {
      fs.unlink(destination, () => {
        file.close();
      });
      debug(error);
      // return res.status(400).send({
      //   message: 'Cannot download file from target host!'
      // });
      debug('Operation failed: host/network error');
    }
  );

  return res.status(200).send({
    message: 'Request accepted successfully!'
  });
}

module.exports = {
  download
};
