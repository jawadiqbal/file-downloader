const debug = require('debug')('file-downloader:*');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const checkDiskSpace = require('check-disk-space');
const Ftp = require('ftp');
const Sftp = require('ssh2-sftp-client')

const {
  DOWNLOAD_PATH
} = process.env;

/**
 * @api {post} /download Download target file
 * @apiName Download
 * @apiGroup Public APIs
 * @apiVersion 1.0.0
 * @apiDescription This is an api for downloading a file from a url with optional config.
 *
 * @apiParam {String} protocol Protocol
 * @apiParam {String} url File URL
 * @apiParam {Object} config Optional configuration for authenticated servers
 *
 * @apiParamExample {json} Request-Example HTTPS:
 *    {
 *      "protocol": "https",
 *      "url": "https://web.whatsapp.com/desktop/windows/release/x64/WhatsAppSetup.exe"
 *    }
 * 
 * @apiParamExample {json} Request-Example FTP Authenticated:
 *    {
 *	    "protocol": "ftp",
 *	    "url": "ftp://demo.wftpserver.com/download/manual_en.pdf",
 *	    "config": {
 *        "host": "demo.wftpserver.com",
 *		    "port": 21,
 *	      "user": "demo-user",
 *	      "password": "demo-user"
 *      }
 *    }
 * 
 * @apiParamExample {json} Request-Example FTP Public:
 *    {
 *      "protocol": "ftp",
 *      "url": "ftp://speedtest.tele2.net/5MB.zip",
 *      "config": {}
 *    }
 *
 * @apiParamExample {json} Request-Example SFTP:
 *    {
 *      "protocol": "sftp",
 *	    "url": "sftp://192.168.0.105/testdata/testfile.txt",
 *	    "config": {
 *		    "host": "192.168.0.105",
 *		    "port": 22,
 *		    "username": "tester",
 *		    "password": "password"
 *	    }
 *    }
 * 
 * @apiSuccessExample {json} Success-Response:
 *    HTTP/1.1 200 OK
 *    {
 *      "message": "Request accepted successfully!"
 *    }
 * 
 * @apiErrorExample {json} Error-Response:
 *    HTTP/1.1 400 Bad Request
 *    {
 *      "message": "Protocol not supported!"
 *    }
 */

// eslint-disable-next-line no-unused-vars
function download(req, res, _next) {
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

  if (protocol === 'sftp') {
    const {
      config
    } = req.body;

    if (!('host' in config)) {
      config.host = args[2];
    }

    let filePath = args[3];
    for (let i = 4; i < args.length; i += 1) {
      filePath += `//${args[i]}`;
    }

    debug('File path: ', filePath)

    const c = new Sftp();

    c.connect({
      ...config
    }, 'once').then(() => {
      c.fastGet(String(filePath), String(destination), {}).then(() => {
        debug('file download successful');
      }).catch(err => {
        debug(err);
      })
    });

  } else if (protocol === 'ftp') {
    const {
      config
    } = req.body;

    if (!('host' in config)) {
      config.host = args[2];
    }

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
            debug('Operation successful: file saved to ', destination);
          });
        });
      });
    });

    c.connect({
      ...config
    });
  } else if (protocol === 'http' || protocol === 'https') {
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
  } else {
    return res.status(400).send({
      message: 'Protocol not supported!'
    });
  }

  return res.status(200).send({
    message: 'Request accepted successfully!'
  });
}

module.exports = {
  download
};
