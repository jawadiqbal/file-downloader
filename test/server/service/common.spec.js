require('dotenv').config();

const assert = require('assert');
const path = require('path');

const common = require('../../../src/server/service/common');

const { DOWNLOAD_PATH } = process.env;

describe('common', () => {
  describe('getDestination', () => {
    it('should return correct download path from url arguments', () => {
      const filePath = common.getDestination(['http:', '', 'example.com', 'directory', 'file.txt']);
      assert.equal(filePath, path.join(DOWNLOAD_PATH, 'file.txt'));
    });
  });

  describe('getFilePath', () => {
    it('should return correct file path from ftp url arguments', () => {
      const filePath = common.getFilePath([
        'ftp:',
        '',
        'example.com',
        'directory',
        'subdirectory',
        'file.txt'
      ]);
      assert.equal(filePath, 'directory/subdirectory/file.txt');
    });
  });

  // implement test for getFileSize

  describe('getFileDirectory', () => {
    it('should return correct file directory from ftp url arguments', () => {
      const fileDirectoryPath = common.getFileDirectory([
        'ftp:',
        '',
        'example.com',
        'directory',
        'subdirectory',
        'file.txt'
      ]);
      assert.equal(fileDirectoryPath, 'directory/subdirectory');
    });
  });

  describe('getProtocol', () => {
    it('should return correct protocol from url arguments', () => {
      const protocol = common.getProtocol(['http:', '', 'example.com', 'directory', 'file.txt']);
      assert.equal(protocol, 'http');
    });
  });
});
