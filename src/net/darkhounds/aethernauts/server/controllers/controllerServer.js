var ws          = require('ws').Server;
var crypto      = require('crypto');

exports.connect = function (config, handleClientConnect, handleClientMessage, handleClientDisconnect) {
    var port    = (config && config.port)?config.port:8080;
    var name    = (config && config.name)?config.name:'aethernauts@localhost';
    var clients = [];
    var server  = new ws({port: port});
    
    server.on('connection', function(client)                                    {
        client.on('message', function(message)                                  {
            message             = JSON.parse(message);
            var reponse         = handleClientMessage?(handleClientMessage(client, message) || {}):{};
            reponse.callbackID  = message.callbackID;
            reponse.type        = 'response';
            if (reponse.error || reponse.result) client.send(JSON.stringify(reponse));
            else reponse.onResult = reponse.onError = function ()               {
                if (client.readyState == client.OPEN) client.send(JSON.stringify(reponse));
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
