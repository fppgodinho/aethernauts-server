var EventEmitter    = require( "events" ).EventEmitter;
var ws              = require('ws').Server;
var crypto          = require('crypto');
var Response        = require(process.src + 'net/darkhounds/core/server/response.js');
//
var Server          = function()                                                {
    var clients                 = [];
    var server                  = new EventEmitter();
    server.checkClientByToken   = function(token)                               {
        for (var i in clients)                                                  {
            var client  = clients[i];
            if (client.token == token) return client.readyState == client.OPEN;
        }
        return false;
    };
    
    server.connect              = function(config)                              {
        var port        = (config && config.port)?config.port:8080;
        var name        = (config && config.name)?config.name:'aethernauts@localhost';
        var websocket   = new ws({port: port});
        
        websocket.on('connection', function(client)                             {
            client.on('message', function(request)                              {
                request             = JSON.parse(request);
                var response        = new Response();
                response.callbackID = request.callbackID;
                response.type       = 'response';
                response.on(Response.ERROR, function(error)                     {
                    client.send(JSON.stringify({'type': 'response', status: 'error', callbackID: response.callbackID, error:error}));
                });
                response.on(Response.RESOLVED, function(result)                 {
                    client.send(JSON.stringify({'type': 'response', status: 'resolved', callbackID: response.callbackID, result:result}));
                });
                server.emit(Server.CLIENT_MESSAGE, {client: client, request: request, response: response});
            });

            client.on('close', function()                                       {
                clients.splice(clients.indexOf(client), 1);
                server.emit(Server.CLIENT_DISCONNECTED, {client: client});
            });

            client.ip       = client.upgradeReq.connection.remoteAddress;
            client.token    = crypto.createHash('md5').update(client.ip + Math.random()).digest('hex').toUpperCase();
            clients.push(client);
            
            server.emit(Server.CLIENT_CONNECTED, {client: client} );
            client.send(JSON.stringify({type:'session', state:'start', name: name, token: client.token, salt: config.salt}));
        });
        
        server.emit(Server.CONNECTED, websocket);
    };
    return server;
};
//
Server.CONNECTED            = 'connected';
Server.CLIENT_CONNECTED     = 'clientConnected';
Server.CLIENT_MESSAGE       = 'clientMessage';
Server.CLIENT_DISCONNECTED  = 'clientDisconnected';
//
module.exports = Server;
