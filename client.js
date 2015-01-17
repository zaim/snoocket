var debug = require('debug')('snoocket:client');


module.exports = plugin;


/**
 * Attach a helper method `join` to given client Socket.
 *
 * @param {Socket} socket
 * @returns {Socket} socket
 */

function plugin (socket) {
  socket.join = joinRoom.bind(socket);
  return socket;
}


/**
 * Join a room.
 *
 * @alias Socket.join
 * @param {string} uri
 * @param {function} callback
 * @returns {Socket} self
 */

function joinRoom (uri, callback) {
  debug('joining', uri);
  this.emit('join', uri, function (data) {
    debug('joined', uri);
    debug('initial data', data);
    callback.call(this, data);
  });
  return this;
}
