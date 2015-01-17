var fs = require('fs');
var http = require('http');
var SocketIO = require('socket.io');
var nock = require('nock');
var snoocket = require('../');


var namespace = process.env.TEST_NAMESPACE || 'snoocket.test';
var port = process.env.TEST_PORT || 8888;
var clientID = process.env.TEST_CLIENT_ID || 'testclientid';
var clientSecret = process.env.TEST_CLIENT_SECRET || 'testclientsecret';
var mockRequests = process.env.TEST_MOCK_REQUESTS;


module.exports = {
  createServer: createServer,
  createAccessTokenScope: createAccessTokenScope,
  createEndpointScope: createEndpointScope,
  createScopes: createScopes,
  namespace: namespace,
  port: port,
  clientID: clientID,
  clientSecret: clientSecret,
  mockRequests: mockRequests
};


function createServer () {
  var server = http.createServer();
  var io = (new SocketIO(server)).of(namespace);

  io = snoocket(io, {
    clientID: clientID,
    clientSecret: clientSecret
  });

  return {
    io: io,
    http: server,
    listen: server.listen.bind(server),
    close: function destroy (done) {
      io.reddit.stop();
      if (io.reddit.tokens) {
        io.reddit.tokens.clear();
      }
      server.close(done);
    }
  };
}


function createAccessTokenScope (persist) {
  var scope = nock('https://www.reddit.com');
  if (persist) {
    scope = scope.persist();
  }
  return scope
    .post('/api/v1/access_token')
    .reply(200, {
      /* jshint camelcase: false */
      access_token: 'testtokens',
      token_type: 'bearer',
      expires_in: 3600,
      scope: '*'
    });
}


function createEndpointScope (persist) {
  var fixture = __dirname + '/fixtures/post1.json';
  var fixtureString = fs.readFileSync(fixture);
  var scope = nock('https://oauth.reddit.com');
  if (persist) {
    scope = scope.persist();
  }
  scope = scope.get('/comments/test.json').replyWithFile(200, fixture);
  scope.fixtureString = fixtureString;
  scope.fixtureObject = JSON.parse(fixtureString);
  return scope;
}


function createScopes (persist) {
  return {
    token: createAccessTokenScope(persist),
    endpoint: createEndpointScope(persist),
    done: function scopesDone () {
      this.token.done();
      this.endpoint.done();
    }
  };
}


function startServer () {
  if (mockRequests) {
    console.log('Mocking all Reddit API requests');
    createScopes(true);
  }
  createServer().listen(port, function () {
    console.log('Server listening at port ' + port);
    console.log('Server PID is ' + process.pid);
  });
}


if (require.main === module) {
  startServer();
}
