const debug = require('debug')('file-downloader:sftpDownloader');
const Sftp = require('ssh2-sftp-client');

const common = require('./common');

function download(args, destination, config) {
  const filePath = common.getFilePath(args);

  debug('File path: ', filePath)

  const c = new Sftp();

  c.connect({
    ...config
  }, 'once').then(() => {
    c.fastGet(String(filePath), String(destination), {}).then(() => {
      debug('Operation successful: file saved to ', destination);
    }).catch(err => {
      debug(err);
    })
  });
}

module.exports = {
  download
};
