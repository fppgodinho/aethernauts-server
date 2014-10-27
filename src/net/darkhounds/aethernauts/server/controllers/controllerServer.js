var EventEmitter    = require( "events" ).EventEmitter;
var socketserver    = require('ws').Server;
var crypto          = require('crypto');
var Response        = require(process.src + 'net/darkhounds/core/server/response.js');
//
var Server          = function()                                                {
    var _module     = new EventEmitter();
    var _clients    = [];
    var _port       = 0;
    var _name       = '';
    var _salt       = '';
    var _socketServer;
    
    _module.connect = function(config)                                          {
        _port           = (config && config.port)?config.port:8080;
        _name           = (config && config.name)?config.name:'aethernauts@localhost';
        _salt           = (config && config.salt)?config.salt:'';
        _socketServer   = new socketserver({port: _port}, function(a, b, c)     {
            _socketServerConnected();
        });
        //
        return _module;
    };
    
    _module.disconnect           = function()                                   {
        if (_clients)   _clients.length = 0;
        if (_socketServer) _socketServer.close();
        _port           = 0;
        _name           = '';
        _salt           = '';
        _socketServer   = null;
        //
        setTimeout(function(){_module.emit(Server.DISCONNECTED)}, 0);
        return _module;
    };
    
    function _socketServerConnected() {
        _socketServer.on('connection', function(client)                         {
            _clientConnected(client);
        });
        //
        setTimeout(function(){_module.emit(Server.CONNECTED, _socketServer)}, 0);
    }
    
    function _clientConnected(client)                                           {
        _clients.push(client);
        //
        client.ip           = client.upgradeReq.connection.remoteAddress;
        client.token        = crypto.createHash('md5').update(client.ip + Math.random()).digest('hex').toUpperCase();
        client.onmessage    = function(event)                                   {
            _clientMessage(client, event.data);
        };
        client.onclose      = function(event)                                   {
            _clientDisconnected(client);
        };
        client.send(JSON.stringify({type:'session', state:'start', name: _name, token: client.token, salt: _salt}));
        //
        setTimeout(function(){_module.emit(Server.CLIENT_CONNECTED, {client: client} )}, 0);
    }
    
    function _clientMessage(client, request)                                    {
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
        setTimeout(function(){_module.emit(Server.CLIENT_MESSAGE, {client: client, request: request, response: response})}, 0);
    }
    
    function _clientDisconnected(client)                                        {
        _clients.splice(_clients.indexOf(client), 1);
        setTimeout(function(){_module.emit(Server.CLIENT_DISCONNECTED, {client: client})}, 0);
    }
    
    _module.getName          = function()                                       {
        return _name;
    };

    _module.getPort          = function()                                       {
        return _port;
    };

    _module.getSalt          = function()                                       {
        return _salt;
    };

    _module.getClientCount      = function()                                    {
        return _clients?_clients.length:0;
    };
    
    _module.isConnected          = function()                                   {
        return _socketServer?true:false;
    };
    
    _module.checkClientByToken   = function(token)                              {
        for (var i in _clients)                                                 {
            var client  = _clients[i];
            if (client.token == token) return client.readyState == client.OPEN;
        }
        return false;
    };
    
    return _module;
};
//
Server.CONNECTED                = 'connected';
Server.DISCONNECTED             = 'disconnected';
Server.ERROR                    = 'error';
Server.CLIENT_CONNECTED         = 'clientConnected';
Server.CLIENT_MESSAGE           = 'clientMessage';
Server.CLIENT_DISCONNECTED      = 'clientDisconnected';
//
module.exports                  = Server;
