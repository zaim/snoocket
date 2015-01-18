var debug = require('debug')('snoocket:server');
var Reddit = require('remmit');


module.exports = plugin;


/**
 * Use the snoocket plugin on a socket.io namespace.
 *
 * @param {Namespace} io
 * @param {object} config
 * @returns {Namespace} io
 */

function plugin (io, config) {
  var reddit;

  config = config || {};
  config.interval = config.interval || 3000;
  reddit = new Reddit(config);

  io = io.use(__socketHandler);
  io.reddit = reddit;
  return io;

  function __socketHandler (socket, next) {
    debug('connect', socket.id);
    reddit.start();
    socket.__snoocket = reddit;
    socket.on('join', __joinEndpoint);
    socket.on('disconnect', __socketDisconnect);
    next();
  }

  /**
   * @this {Socket}
   */

  function __joinEndpoint (room, callback) {
    var id = this.id;
    var interval = reddit.config.interval || 3000;
    var uri = Reddit.fixPath(room);

    if (reddit.isRegistered(uri)) {
      debug('joining room', uri, id);
      this.join(uri, __join);
    }

    function __join () {
      debug('joined room', uri, id, io.adapter.rooms);
      var isNew = !reddit.isActive(uri);
      var endpoint = reddit.endpoint(uri).valueOnce('data', __onDataValue);
      if (isNew) {
        debug('init endpoint', id);
        endpoint.on('changed', __onChanged);
      }
      if (!endpoint.isPolling()) {
        debug('poll endpoint', id);
        endpoint.poll(interval);
      }
    }

    function __onDataValue (data) {
      debug('emitting initial data', id);
      callback(data);
    }
  }

  /**
   * @this {Socket}
   */

  function __socketDisconnect () {
    var rooms = io.adapter.rooms;
    var endpoints = reddit.getActiveEndpoints();
    debug('disconnect', this.id, rooms);
    Object.keys(endpoints).forEach(function (key) {
      if (!rooms[key] || Object.keys(rooms[key]).length === 0) {
        debug('clearing endpoint', key);
        endpoints[key].stop();
      }
    });
  }

  /**
   * @this {Endpoint}
   */

  function __onChanged (patch) {
    var uri = this.path;
    if (uri) {
      debug('emitting change', uri, io.adapter.rooms);
      io.in(uri).emit('changed', {
        uri: uri,
        patch: patch
      });
    }
  }
}
