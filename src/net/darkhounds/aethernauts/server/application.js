var EventEmitter        = require( "events" ).EventEmitter;
var ControllerDB        = require(process.src + 'net/darkhounds/aethernauts/server/controllers/controllerDB.js');
var ControllerServer    = require(process.src + 'net/darkhounds/aethernauts/server/controllers/controllerServer.js');
var ControllerAuth      = require(process.src + 'net/darkhounds/aethernauts/server/controllers/controllerAuth.js');
var ControllerAdmin     = require(process.src + 'net/darkhounds/aethernauts/server/controllers/controllerAdmin.js');
var Response            = require(process.src + 'net/darkhounds/core/server/response.js');
var errorsCfg           = require(process.src + 'net/darkhounds/aethernauts/server/config/confErrors.js');
//
var Module          = function()                                                {
    var _module     = new EventEmitter();
    _module.APPLICATION_ERROR       = "applicationError";
    _module.CREATED                 = "created";
    _module.DESTROYED               = "destroyed";
    _module.DB_CONNECTED            = "databaseConnected";
    _module.DB_DISCONNECTED         = "databaseDisconnected";
    _module.SERVER_CONNECTED        = "serverConnected";
    _module.SERVER_DISCONNECTED     = "serverDisconnected";
    _module.CLIENT_CONNECTED        = "clientConnected";
    _module.CLIENT_MESSAGED         = "clientMessaged";
    _module.CLIENT_DISCONNECTED     = "clientDisconnected";
    //
    var _config;
    var _created        = false;
    var _locked         = false;
    //
    _module.isCreated   = function()                                            {
        return _created;
    };
    //
    _module.create      = function(config)                                      {
        if (_locked || _created) return; _locked = true;
        _config     = config;
        ControllerServer.on(ControllerServer.CONNECTED, _serverConnected);
        ControllerServer.on(ControllerServer.DISCONNECTED, _serverDisconnected);
        ControllerServer.on(ControllerServer.CLIENT_CONNECTED, _clientConnected);
        ControllerServer.on(ControllerServer.CLIENT_MESSAGE, _clientMessaged);
        ControllerServer.on(ControllerServer.CLIENT_DISCONNECTED, _clientDisconnected);
        ControllerServer.connect(_config);
        //
        ControllerDB.on(ControllerDB.CONNECTED, _dbConnected);
        ControllerDB.on(ControllerDB.DISCONNECTED, _dbDisconnected);
        ControllerDB.connect(_config);
    };
    
    function _dbConnected()                                                     {
        _checkApplicationStatus();
        //
        setTimeout(function(){_module.emit(_module.DB_CONNECTED)}, 0);
    }
    
    function _serverConnected()                                                 {
        _checkApplicationStatus();
        //
        setTimeout(function(){_module.emit(_module.SERVER_CONNECTED)}, 0);
    }
    
    _module.destroy     = function()                                            {
        if (_locked || !_created) return; _locked = true;
        ControllerServer.disconnect();
        _config = null;
    };
    
    function _serverDisconnected()                                              {
        ControllerServer.removeListener(ControllerServer.CONNECTED, _serverConnected);
        ControllerServer.removeListener(ControllerServer.DISCONNECTED, _serverDisconnected);
        ControllerServer.removeListener(ControllerServer.CLIENT_CONNECTED, _clientConnected);
        ControllerServer.removeListener(ControllerServer.CLIENT_MESSAGE, _clientMessaged);
        ControllerServer.removeListener(ControllerServer.CLIENT_DISCONNECTED, _clientDisconnected);
        ControllerDB.disconnect();
        _checkApplicationStatus();
        //
        setTimeout(function(){_module.emit(_module.SERVER_DISCONNECTED)}, 0);
    }
    
    function _dbDisconnected()                                                  {
        ControllerDB.removeListener(ControllerDB.CONNECTED, _dbConnected);
        ControllerDB.removeListener(ControllerDB.DISCONNECTED, _dbDisconnected);
        _checkApplicationStatus();
        //
        setTimeout(function(){_module.emit(_module.DB_DISCONNECTED)}, 0);
    }
    
    function _checkApplicationStatus()                                          {
        if (!_created && ControllerDB.isConnected() && ControllerServer.isConnected()) {
            _locked     = false;
            _created    = true;
            _module.emit(_module.CREATED);
        }
        //
        if (_created && !ControllerDB.isConnected() && !ControllerServer.isConnected()) {
            _locked     = false;
            _created    = false;
            _module.emit(_module.DESTROYED);
        }
    }
    
    function _clientConnected(data)                                             {
        setTimeout(function(){ _module.emit(_module.CLIENT_CONNECTED, data) }, 0);
    }
    
    function _clientMessaged(data)                                              {
        if (data.request) switch(data.request.type)                             {
            case 'auth':        _resolveMessageAuth(data);                              break;
            case 'admin':       _resolveMessageAdmin(data);                             break;
            case 'characters':  _parseMessageCharacters(data);                          break;
            default:            data.response.setError(errorsCfg.UnknownRequestType);   break;
        } else data.response.setError(errorsCfg.UnknownProtocol);
        //
        setTimeout(function(){ _module.emit(_module.CLIENT_MESSAGED, data) }, 0);
    }
    
    function _resolveMessageAuth(data)                                          {
        var token       = data.client.token;
        var request     = data.request;
        var response    = data.response;
        
        var callback = function (err, data)                                     {
            if (!err) response.emit(Response.RESOLVED, data);
            else response.emit(Response.ERROR, err);
        };
        
        switch(request.action)                                                  {
            case 'register':
                ControllerAuth.register(request.username, request.password, request.firstname, request.lastname, request.email, callback);
                break;
            case 'login':
                ControllerAuth.login(token, request.username, request.password, request.ip, callback);
                break;
            case 'logout':
                ControllerAuth.logout(token, callback);
                break;
            default:            response.emit(Response.ERROR, errorsCfg.UnknownRequestType);    break;
        }
    }
    
    function _resolveMessageAdmin(data)                                         {
        var token       = data.client.token;
        var request     = data.request;
        var response    = data.response;
        
        var callback = function (err, data)                                     {
            if (!err) response.emit(Response.RESOLVED, data);
            else response.emit(Response.ERROR, err);
        };
        
        ControllerAdmin.isAdmin(token, function(err)                            {
            if (err) response.emit(Response.ERROR, err);
            else switch(request.action)                                         {
                case 'getWorld':
                    ControllerAdmin.getWorld(request.name || "Nod", callback);
                    break;
                default:        response.emit(Response.ERROR, errorsCfg.UnknownRequestType);    break;
            }
        });
        
        ControllerAdmin.handleRequest(token, request, response);
    }

    function _resolveMessageCharacters(data)                                    {
        // charactersCtrl.handleRequest(data.client.token, data.request, data.response)
    }
    
    function _clientDisconnected(data)                                          {
        if (!data.client.token) return;
        //
        ControllerAuth.logout(data.client.token);
        //
        setTimeout(function(){ _module.emit(_module.CLIENT_DISCONNECTED, data) }, 0);
    }
    
    return _module;
};
//
module.exports          = new Module();