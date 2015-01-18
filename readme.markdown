# snoocket
> Live reddit threads served via socket.io

**NOTE: This library is experimental and under heavy development.**

## Install

This library is not yet available on NPM. For now, you may clone it.

```
$ git clone https://github.com/zaim/snoocket
```

Or use the git:// URL to install into your packeg.json:

```
$ npm install --save git://github.com/zaim/snoocket
```

## Test Server

If you've cloned the repo, a test server is available:

```
$ npm run test:server

> snoocket@0.0.1 test:server /Users/zaim/Projects/reddit/snoocket
> node test/_server.js

SocketIO namespace is snoocket.test
Server listening at port 8888
Server PID is 4342
```

A socket.io server is now available at `http://localhost:8888/snoocket.test`.

Options can be passed to the `node run test:server` command:

`--test_namespace=namespace` - The namespace to use (default: `snoocket.test`)

`--test_port=port` - The port to use (default: `8888`)

`--test_mock=true|false` - If true, all requests to Reddit is mocked / faked.

See the [test/_server.js](./test/_server.js) file to see an example of how
a server can be implemented.

A demo / test client is not available yet.

## License

`snoocket` is [MIT-licensed](./LICENSE).
