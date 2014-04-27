
var clients = [];

var ws      = require('ws').Server;
var server  = new ws({port: 81});
server.on('connection', function(socket, a, b, c)                                        {
    socket.on('message', function(message)                                      {
        console.log('Received: ', message);
    });
    clients.push(socket);
    
    console.log(socket.upgradeReq.connection.remoteAddress + ' has connected!');
});
