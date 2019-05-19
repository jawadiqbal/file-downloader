const debug = require('debug')('file-downloader:download');

const httpDownloader = require('../service/httpDownloader');
const ftpDownloader = require('../service/ftpDownloader')
const common = require('../service/common');
const sftpDownloader = require('../service/sftpDownloader');

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
    url,
    config
  } = req.body;
  const args = url.split('/');

  const destination = common.getDestination(args);

  if (protocol === 'sftp') {
    if (!('host' in config)) {
      config.host = args[2];
    }
    sftpDownloader.download(args, destination, config);
  } else if (protocol === 'ftp') {
    if (!('host' in config)) {
      config.host = args[2];
    }
    ftpDownloader.download(args, destination, config);
  } else if (protocol === 'http' || protocol === 'https') {
    httpDownloader.download(url, destination);
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
