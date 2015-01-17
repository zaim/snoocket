/* global describe, it, beforeEach, afterEach */

var expect = require('expect.js');
var socketClient = require('socket.io-client');
var testServer = require('./_server');
var clientPlugin = require('../client');

//var debug = require('debug')('snoocket:test:server');
var ticker = require('./_util').ticker;

var NAMESPACE = testServer.namespace;
var PORT = testServer.port;


function createClient () {
  return socketClient('http://localhost:' + PORT + '/' + NAMESPACE, {
    forceNew: true,
    reconnection: false
  });
}


describe('snoocket', function () {

  var server;

  beforeEach(function (done) {
    server = testServer.createServer();
    server.http.listen(PORT, done);
  });

  afterEach(function (done) {
    server.close(done);
  });


  describe('server', function () {

    describe('on connection', function () {

      it('should initialize reddit (get access tokens)', function (done) {
        var scope = testServer.createAccessTokenScope();

        var client = createClient();

        client.on('connect', function __connected () {
          if (scope.isDone()) {
            client.close();
            done();
          } else {
            setTimeout(__connected, 30);
          }
        });
      });

    });


    describe('on join', function () {

      it('should create the endpoint and send initial data', function (done) {
        var scopes = testServer.createScopes();
        var client = createClient();

        client.on('connect', function () {
          client.emit('join', '/comments/test.json', function (data) {
            expect(data.post).to.be.an('object');
            expect(data.comments).to.be.an('array');
            scopes.done();
            client.close();
            done();
          });
        });
      });


      it('should resend data if endpoint already created', function (done) {
        var scopes = testServer.createScopes();
        var client = createClient();

        client.on('connect', function () {
          client.emit('join', '/comments/test.json', function (data) {
            expect(data.post).to.be.an('object');
            expect(data.comments).to.be.an('array');

            var client2 = createClient();

            client2.on('connect', function () {
              client2.emit('join', '/comments/test.json', function (data2) {
                expect(data2).to.eql(data);
                scopes.done();
                client.close();
                client2.close();
                done();
              });
            });
          });
        });
      });


      it('should emit "changed" events', function (done) {
        server.io.reddit.config.interval = 100;

        var scopes = testServer.createScopes();
        var range = [1, 2, 3];

        range.forEach(function (i) {
          var mutated = JSON.parse(scopes.endpoint.fixtureString);
          mutated[0].data.children[0].data.ups += (5 * i);
          mutated[0].data.children[0].data.score += (5 * i);
          mutated[1].data.children[0].data.score += (5 * i);
          scopes
            .endpoint
            .get('/comments/test.json')
            .reply(200, mutated);
        });

        var client = createClient();
        var tick = ticker(range.length, function () {
          scopes.done();
          client.close();
          done();
        });

        client.on('connect', function () {
          client.emit('join', '/comments/test.json', function (data) {
            client.on('changed', function (change) {
              expect(change.uri).to.be('/comments/test.json');
              expect(change.patch.length).to.be.above(0);
              tick();
            });
          });
        });
      });

    });

  });


  describe('client', function () {

    it('should have join method', function () {
      var client = clientPlugin(createClient());
      expect(client.join).to.be.a('function');
      client.close();
    });

    it('should join a room', function (done) {
      var scopes = testServer.createScopes();
      var client = clientPlugin(createClient());
      client.on('connect', function () {
        client.join('/comments/test', function (data) {
          scopes.done();
          client.close();
          done();
        });
      });
    });

  });

});
