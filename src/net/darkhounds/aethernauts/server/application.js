var EventEmitter        = require( "events" ).EventEmitter;
var errorsCfg           = require(process.src + 'net/darkhounds/aethernauts/server/config/confErrors.js');
var ControllerDB        = require(process.src + 'net/darkhounds/aethernauts/server/controllers/controllerDB.js');
var ControllerServer    = require(process.src + 'net/darkhounds/aethernauts/server/controllers/controllerServer.js');
var ControllerAuth      = require(process.src + 'net/darkhounds/aethernauts/server/controllers/controllerAuth.js');
//
var Module          = function()                                                {
    var _module     = new EventEmitter();
    var _config;
    var _db;
    var _server;
    //
    _module.create  = function(config)                                          {
        _config     = config;
        _db         = new ControllerDB();
        _db.on(ControllerDB.CONNECTED, _dbConnected);
        _db.connect(_config);
    };
    
    _module.destroy = function()                                                {
        if (_db)        _db.disconnect();
        if (_server)    _server.disconnect();
        _db     = null;
        _server = null;
        _config = null;
    };
    
    function _dbConnected()                                                     {
        _server         = new ControllerServer();
        _server.on(ControllerServer.CONNECTED, _serverConnected);
        _server.on(ControllerServer.CLIENT_CONNECTED, _clientConnected);
        _server.on(ControllerServer.CLIENT_MESSAGE, _clientMessage);
        _server.on(ControllerServer.CLIENT_DISCONNECTED, _clientDisconnected);
        _server.connect(_config);
        //
        // TODO: Do we really needed a reference to be stored in the process?  
        process.server  = _server;
        //
        setTimeout(function(){_module.emit(Module.DB_CONNECTED)}, 0)
    }

    function _serverConnected()                                                 {
        setTimeout(function(){_module.emit(Module.SERVER_CONNECTED)}, 0)
    }

    function _clientConnected(data)                                             {
        setTimeout(function(){ _module.emit(Module.CLIENT_CONNECTED, data) }, 0);
    }

    function _clientMessage(data)                                               {
        if (data.request) switch(data.request.type)                             {
            case 'auth':        ControllerAuth.handleRequest(data.client.token, data.request, data.response);    break;
            case 'admin':       ControllerAdmin.handleRequest(data.client.token, data.request, data.response);   break;
//            case 'characters':  charactersCtrl.handleRequest(data.client.token, data.request, data.response);    break;
            default:            data.response.setError(errorsCfg.UnknownRequestType);                              break;
        } else data.response.setError(errorsCfg.UnknownProtocol);
        //
        setTimeout(function(){ _module.emit(Module.CLIENT_MESSAGED, data) }, 0);
    }

    function _clientDisconnected(data)                                          {
        if (!data.client.token) return;
        //
        ControllerAuth.logout(data.client.token);
        //
        setTimeout(function(){ _module.emit(Module.CLIENT_DISCONNECTED, data) }, 0);
    }
    
    
    return _module;
};
//
Module.APPLICATION_ERROR    = "applicationError";
Module.DB_CONNECTED         = "databaseConnected";
Module.SERVER_CONNECTED     = "serverConnected";
Module.CLIENT_CONNECTED     = "clientConnected";
Module.CLIENT_MESSAGED      = "clientMessaged";
Module.CLIENT_DISCONNECTED  = "clientDisconnected";
//
module.exports                  = Module;