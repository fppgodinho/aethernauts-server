var EventEmitter    = require("events").EventEmitter;
var Mongoose        = require("mongoose");
//

var _defaultIP      = "localhost";
var _defaultPort    = 27017;
var _defaultName    = "aethernauts";
var Module          = function()                                                {
    var _module     = new EventEmitter();
    var _config;
    
    _module.connect = function (config)                                         {
        if (Mongoose.connection.connecting || Mongoose.connection.connected)    {
            setTimeout(function(){ _module.emit(Module.CONNECTION_ERROR) }, 0);
            return;
        }
        
        _config         = config || {dbIP:_defaultIP, dbPort: _defaultPort, dbName: _defaultName};
        _config.dbIP    = config.dbIP || _defaultIP;
        _config.dbPort  = config.dbPort || _defaultPort;
        _config.dbName  = config.dbName || _defaultName;
        //
        Mongoose.connect('mongodb://' + _config.dbIP + ':' + _config.dbPort + '/' + _config.dbName);
        Mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
        Mongoose.connection.once('open', function(){
            setTimeout(function(){ _module.emit(Module.CONNECTED) }, 0);
        });
    };
    
    _module.disconnect = function (config)                                      {
        if (Mongoose.connection.disconnecting || Mongoose.connection.disconnected) return;
        //
        Mongoose.connection.close();
        _config         = null;
    };
    
    return _module;
};
//
Module.getInstance          = function()                                        {
    return Mongoose.connection;
}
Module.CONNECTION_ERROR     = "connectionError";
Module.CONNECTED            = "connected";
//
module.exports                  = Module;