var EventEmitter    = require("events").EventEmitter;
var Mongoose        = require("mongoose");
//

var _defaultIP      = "localhost";
var _defaultPort    = 27017;
var _defaultName    = "aethernauts";
var Module          = function()                                                {
    var _module     = new EventEmitter();
    _module.CONNECTION_ERROR    = "connectionError";
    _module.CONNECTED           = "connected";
    _module.DISCONNECTED        = "disconnected";
    var _config;
    
    var _connStatus = 'disconnected';
    Mongoose.connection.on("disconnecting", function() { _connStatus = "disconnecting"; });
    Mongoose.connection.on("disconnected", function() { _connStatus = "disconnected"; });
    Mongoose.connection.on("connecting", function() { _connStatus = "connecting"; });
    Mongoose.connection.on("connected", function() { _connStatus = "connected"; });
    
    _module.connect = function (config)                                         {
        if (_connStatus == "connecting" || _connStatus == "connected")          {
            setTimeout(function(){ _module.emit(_module.CONNECTION_ERROR) }, 0);
            return _module;
        }
        
        _config         = config || {dbIP:_defaultIP, dbPort: _defaultPort, dbName: _defaultName};
        _config.dbIP    = config.dbIP || _defaultIP;
        _config.dbPort  = config.dbPort || _defaultPort;
        _config.dbName  = config.dbName || _defaultName;
        //
        Mongoose.connect('mongodb://' + _config.dbIP + ':' + _config.dbPort + '/' + _config.dbName);
        Mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
        Mongoose.connection.once('open', function(){
            setTimeout(function(){ _module.emit(_module.CONNECTED) }, 0);
        });
        //
        return _module;
    };
    
    _module.disconnect = function (config)                                      {
        if (_connStatus == "disconnecting" || _connStatus == "disconnected") return _module;
        Mongoose.connection.once('disconnected', function () {
            setTimeout(function(){ _module.emit(_module.DISCONNECTED) }, 0);
        });
        Mongoose.connection.close();
        _config         = null;
        //
        return _module;
    };

    _module.isConnected = function ()                                           {
        return _connStatus == "connected";
    };
    
    return _module;
};
//
module.exports                  = new Module();