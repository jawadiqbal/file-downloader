const debug = require('debug')('file-downloader:*');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const checkDiskSpace = require('check-disk-space');
const Ftp = require('ftp');

const {
  DOWNLOAD_PATH
} = process.env;

function download(req, res) {
  debug('requesting to /api/v1/download | POST | params: ', req.body);

  const {
    protocol,
    url
  } = req.body;

  const args = url.split('/');
  const fileName = args[args.length - 1];

  fs.mkdir(path.join(DOWNLOAD_PATH), error => {
    debug(error);
  });

  const destination = path.join(DOWNLOAD_PATH, fileName);

  const file = fs.createWriteStream(destination);

  if (protocol === 'ftp') {
    const {
      config
    } = req.body;
    // let securityConfig = {}

    if (!('host' in config)) {
      config.host = args[2];
    }

    // if (protocol === 'ftps') {
    //   securityConfig = {
    //     secure: true,
    //     secureOptions: {
    //       rejectUnauthorized: false
    //     }
    //   }
    // }

    let filePath = args[3];
    for (let i = 4; i < args.length; i += 1) {
      filePath += `//${args[i]}`;
    }

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
            // const downloadedFileSizeInBytes = fs.statSync(destination).size;
            // debug('Downloaded file size: ', downloadedFileSizeInBytes);

            // // eslint-disable-next-line eqeqeq
            // if (downloadedFileSizeInBytes != fileSizeInHost) {
            //   debug(downloadedFileSizeInBytes, ' vs ', fileSizeInHost);
            //   fs.unlink(destination, () => {
            //     // return res.status(500).send({
            //     //   message: 'Download incomplete! removing file from disk.'
            //     // });
            //     debug('Operation failed: incomplete download');
            //   })
            // };
            debug('Operation successful: file saved to ', destination);
          });
        });
      });
    });

    c.connect({
      ...config
      // ...securityConfig
    });
  }

  if (protocol === 'http' || protocol === 'https') {
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

  return res.status(200).send({
    message: 'Request accepted successfully!'
  });
}

module.exports = {
  download
};
