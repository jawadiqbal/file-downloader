## Getting Started

This is a file downloader application based on Node.js that takes download requests in the form of API calls and saves files to preconfigured location in the disk. Following features are currently implemented:

1. Fully synchronous file download support for HTTP, HTTPS, FTP and SFTP
2. Incomplete downloads auto-removed from disk
3. Check for download size exceeding available disk space for HTTP and HTTPS

This project is built on a modified Express.js boilerplate based on [this](https://github.com/kunalkapadia/express-mongoose-es6-rest-api). Please refer to the generated docs for API documentation. For evaluation/test run purpose, please set the environment to 'dev' or 'local' and start the program in 'debug' mode. You can find detailed log output in the console, while the API immediately responds while queueing the download network call in the Node.js event loop.

To-Do:

1. Implement request hold till download completes, so that we can send a proper download status with the response
2. Make use of ES8 `async` and `await` to eliminate callback chaining
3. Implement download feature for FTPS, both implicit and explicit
4. Allow downloading directories where possible
5. Add public/private key support for `ssh` based protocol(s)
6. Remove necessity for the `protocol` field in API requests
7. Add support for unit testing and network call mocking
8. Ensure good code coverage

_important_
Follow these instructions for evaluation/test runs:

1. Download API path: `http://localhost:4040/api/v1/download`
2. Create `.env` from `.env.example`, set `NODE_ENV='local'` and configure `DOWNLOAD_PATH`
3. Install dependencies with `yarn` and install any missing tools globally with `npm install -g <package>`
4. Generate docs: `yarn predocs`
5. Start doc server: `yarn docs`
6. Start with: `yarn start:debug`

Clone the repo:

```sh
git clone https://github.com/jawadiqbal/file-downloader.git
cd file-downloader
```

Install yarn:

```js
npm install -g yarn
```

Install dependencies:

```sh
yarn
```

Set environment (vars):

```sh
cp .env.example .env
# Set NODE_ENV *important*
# Set to local/dev for test runs with this project
# Allowed values:
#   local
#   dev
#   test
#   live
```

Start server:

```sh
# Start server
yarn start

# Selectively set DEBUG env var to get logs
# Please select this mode for test runs with the project
yarn start:debug
```

Refer [debug](https://www.npmjs.com/package/debug) to know how to selectively turn on logs.

Tests:

```sh
# Run tests written in ES6
yarn test

# Run test along with code coverage
yarn test:coverage

# Run tests on file change
yarn test:watch

# Run tests enforcing code coverage (configured via .istanbul.yml)
yarn test:check-coverage
```

##### Deployment

```sh
# install production dependencies only
1. yarn --production

# compile to ES5
2. yarn build

# Use any process manager to start your services
3. pm2 start dist/index.js --name file-downloader
```

In production you need to make sure your server is always up so you should ideally use any of the process manager recommended [here](http://expressjs.com/en/advanced/pm.html).
We recommend [pm2](http://pm2.keymetrics.io/) as it has several useful features like it can be configured to auto-start your services if system is rebooted.

## Logging

Universal logging library [winston](https://www.npmjs.com/package/winston) is used for logging. It has support for multiple transports. A transport is essentially a storage device for your logs. Each instance of a winston logger can have multiple transports configured at different levels. For example, one may want error logs to be stored in a persistent remote location (like a database), but all logs output to the console or a local file. We just log to the console for simplicity.

[Morgan](https://www.npmjs.com/package/morgan) is also configured for console logging of API hits and for rotating file stream logging for test and live environments. Please put the correct deployment environtment in .env file for desired logging behavior.

#### API logging

Logs detailed info about each api request to console during development.
![Detailed API logging](https://cloud.githubusercontent.com/assets/4172932/12563354/f0a4b558-c3cf-11e5-9d8c-66f7ca323eac.JPG)

#### Error logging

Logs stacktrace of error to console along with other details. You should ideally store all error messages persistently.
![Error logging](https://cloud.githubusercontent.com/assets/4172932/12563361/fb9ef108-c3cf-11e5-9a58-3c5c4936ae3e.JPG)

## Documentation

[apidocs](http://apidocjs.com/) has been configured across the application for detailed documentation and versioning. Please refer to package.json file if you wish to further modify the documentation. The default port for doc server is 4001.

Prepare doc files:

```js
yarn predocs
```

Run doc server:

```js
yarn docs
```

## Code Coverage

Get code coverage summary on executing `yarn test`
![Code Coverage Text Summary](https://cloud.githubusercontent.com/assets/4172932/12827832/a0531e70-cba7-11e5-9b7c-9e7f833d8f9f.JPG)

`yarn test` also generates HTML code coverage report in `coverage/` directory. Open `lcov-report/index.html` to view it.
![Code coverage HTML report](https://cloud.githubusercontent.com/assets/4172932/12625331/571a48fe-c559-11e5-8aa0-f9aacfb8c1cb.jpg)
