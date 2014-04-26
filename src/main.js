var net = require('net');

var clients = [];

var server = net.createServer(function(socket) {
    console.log('server connected', socket.remoteAddress);
    socket.on('end', function() {
        console.log('server disconnected');
    });
    socket.write('hello\r\n');
    socket.pipe(socket);
    socket.end();
    
    clients.push(socket);
    
});

server.listen(4000, function() {
  console.log('server bound');
});