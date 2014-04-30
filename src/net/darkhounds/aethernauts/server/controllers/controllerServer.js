var ws          = require('ws').Server;
var crypto      = require('crypto');
var clients     = [];

exports.checkClientByToken = function (token)                                   {
    for (var i in clients)                                                      {
        var client = clients[i];
        if (client.token == token) return client.readyState == client.OPEN;
    }
    return false;
};

exports.connect = function (config, handleClientConnect, handleClientMessage, handleClientDisconnect) {
    var port    = (config && config.port)?config.port:8080;
    var name    = (config && config.name)?config.name:'aethernauts@localhost';
    var server  = new ws({port: port});
    
    server.on('connection', function(client)                                    {
        client.on('message', function(message)                                  {
            message             = JSON.parse(message);
            var response        = handleClientMessage?(handleClientMessage(client, message) || {}):{};
            response.callbackID = message.callbackID;
            response.type       = 'response';
            if (response.error || response.result) client.send(JSON.stringify(response));
            else response.onResult = response.onError = function ()             {
                if (client.readyState == client.OPEN) client.send(JSON.stringify(response));
            };
        });

        client.on('close', function()                                           {
            clients.splice(clients.indexOf(client), 1);
            if (handleClientDisconnect) handleClientDisconnect(client);
        });

        client.ip       = client.upgradeReq.connection.remoteAddress;
        client.token    = crypto.createHash('md5').update(client.ip + Math.random()).digest('hex').toUpperCase();
        clients.push(client);
        
        if (handleClientConnect) handleClientConnect(client);
        
        client.send(JSON.stringify({type:'session', state:'start', name: name, token: client.token, salt: config.salt}));
    });
    
    return server;
};
