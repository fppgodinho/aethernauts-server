var EventEmitter    = require( "events" ).EventEmitter;
var Crypto          = require('crypto');

var Response            = require(process.src + 'net/darkhounds/core/server/response.js');
var errorsCfg           = require(process.src + 'net/darkhounds/aethernauts/server/config/confErrors.js');
var ModelWorlds         = require(process.src + "net/darkhounds/aethernauts/server/models/modelWorlds.js");
var ModelContinents     = require(process.src + "net/darkhounds/aethernauts/server/models/modelContinents.js");
var ModelRegions        = require(process.src + "net/darkhounds/aethernauts/server/models/modelRegions.js");
var ModelAreas          = require(process.src + "net/darkhounds/aethernauts/server/models/modelAreas.js");
var ModelRooms          = require(process.src + "net/darkhounds/aethernauts/server/models/modelRooms.js");
var ModelSessions       = require(process.src + 'net/darkhounds/aethernauts/server/models/modelSessions.js');

var Module = function ()                                                        {
    var _module         = new EventEmitter();
    
    _module.isAdmin             = function (token, callback)                    {
        ModelSessions.findOne({token: token}, function(err, session)            {
            if (!err)                                                           {
                if (session)                                                    {
                    if (session.user)                                           {
                        if (session.user.roles && session.user.roles.indexOf("admin") >= 0) callback(null);
                        else callback(errorsCfg.UserNotAdmin);
                    } else callback(errorsCfg.InvalidSession);
                } else if (callback) callback(errorsCfg.NotLogedin);
            } else if (callback) callback(err);
        }).populate("user");
    };
    _module.getWorld            = function(name, callback)                      {
        var world               = null;
        var counter             = 0;
        var incrementCounter    = function()                                    {
            counter++;
        };
        
        var checkCounter        = function (err)                                {
            --counter;
            if (!err && counter <= 0 && callback) callback(null, world);
            else if (err) callback(err);
        };
        
        ModelWorlds.findOne({name: name}, function(err, record)                 {
            if (!err)                                                           {
                if (record)                                                     {
                    world               = record.toObject();
                    world.continents    = [];
                    ModelContinents.find({world: record}, function(err, records) {
                        if (!err)                                               {
                            for (var i in records)                              {
                                var record      =  records[i].toObject();
                                record.regions  = [];
                                world.continents.push(record);
                                _injectRegions(record, incrementCounter, checkCounter);
                            }
                        } else if (callback) callback(errorsCfg.WorldNotCreated);
                    });
                } else if (callback) callback(errorsCfg.WorldNotCreated);
            } else if (callback) callback(err);
        });
    };
    
    function _injectRegions(continent, incrementCounter, callback)              {
        incrementCounter();
        ModelRegions.find({continent: continent}, function(err, records)        {
            if (!err)                                                           {
                continent.regions   = [];
                for (var i in records)                                          {
                    var record = records[i].toObject();
                    continent.regions.push(record);
                    _injectAreas(record, incrementCounter, callback);
                }
                callback();
            } else if (callback) callback(err);
        });
    }

    function _injectAreas(region, incrementCounter, callback)                   {
        incrementCounter();
        ModelAreas.find({region: region}, function(err, records)                {
            if (!err)                                                           {
                region.areas        = [];
                for (var i in records)                                          {
                    var record = records[i].toObject();
                    region.areas.push(record);
                    _injectRooms(record, incrementCounter, callback);
                }
                callback();
            } else if (callback) callback(err);
        });
    }

    function _injectRooms(area, incrementCounter, callback)                     {
        incrementCounter();
        ModelRooms.find({area: area}, function(err, records)                    {
            if (!err)                                                           {
                area.rooms        = [];
                for (var i in records)                                          {
                    var record = records[i].toObject();
                    area.rooms.push(record);
                }
                callback();
            } else if (callback) callback(err);
        }).populate("connections");
    }
    
    return _module;
};
module.exports = new Module();




