var EventEmitter    = require( "events" ).EventEmitter;
var SocketServer    = require('ws').Server;
var Crypto          = require('crypto');
var Response        = require(process.src + 'net/darkhounds/core/server/response.js');
//
var Module          = function()                                                {
    var _module     = new EventEmitter();
    _module.CONNECTED                = 'connected';
    _module.DISCONNECTED             = 'disconnected';
    _module.CLIENT_CONNECTED         = 'clientConnected';
    _module.CLIENT_MESSAGE           = 'clientMessage';
    _module.CLIENT_DISCONNECTED      = 'clientDisconnected';
    //
    var _clients    = [];
    var _port       = 0;
    var _name       = '';
    var _salt       = '';
    var _socketServer;
    
    _module.connect = function(config)                                          {
        _port           = (config && config.port)?config.port:8080;
        _name           = (config && config.name)?config.name:'aethernauts@localhost';
        _salt           = (config && config.salt)?config.salt:'';
        _socketServer   = new SocketServer({port: _port}, function()            {
            _socketServerConnected();
        });
        _socketServer._server.once('close', _socketServerDisconnected);
        //
        return _module;
    };
    
    _module.disconnect           = function()                                   {
        if (_socketServer)                                                      {
            _socketServer.close();
        }
        if (_clients)   _clients.length = 0;
        _port           = 0;
        _name           = '';
        _salt           = '';
        _socketServer   = null;
        //
        return _module;
    };
    
    function _socketServerConnected()                                           {
        _socketServer.on('connection', function(client)                         {
            _clientConnected(client);
        });
        //
        
        setTimeout(function(){_module.emit(_module.CONNECTED, _socketServer)}, 0);
    }
    
    function _socketServerDisconnected()                                        {
        setTimeout(function(){_module.emit(_module.DISCONNECTED)}, 0);
    }
    
    function _clientConnected(client)                                           {
        _clients.push(client);
        //
        client.ip           = client.upgradeReq.connection.remoteAddress;
        client.token        = Crypto.createHash('md5').update(client.ip + Math.random()).digest('hex').toUpperCase();
        client.onmessage    = function(event)                                   {
            _clientMessage(client, event.data);
        };
        client.onclose      = function(event)                                   {
            _clientDisconnected(client);
        };
        client.send(JSON.stringify({type:'session', state:'start', name: _name, token: client.token, salt: _salt}));
        //
        setTimeout(function(){_module.emit(_module.CLIENT_CONNECTED, {client: client} )}, 0);
    }
    
    function _clientMessage(client, request)                                    {
        request             = JSON.parse(request);
        var response        = new Response();
        response.callbackID = request.callbackID;
        response.on(Response.ERROR, function(error)                     {
            client.send(JSON.stringify({'type': 'response', status: 'error', callbackID: response.callbackID, error:error}));
        });
        response.on(Response.RESOLVED, function(result)                 {
            client.send(JSON.stringify({'type': 'response', status: 'resolved', callbackID: response.callbackID, result:result}));
        });
        setTimeout(function(){_module.emit(_module.CLIENT_MESSAGE, {client: client, request: request, response: response})}, 0);
    }
    
    function _clientDisconnected(client)                                        {
        _clients.splice(_clients.indexOf(client), 1);
        setTimeout(function(){_module.emit(_module.CLIENT_DISCONNECTED, {client: client})}, 0);
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
module.exports                  = new Module();
