var EventEmitter        = require( "events" ).EventEmitter;
var Response            = require(process.src + 'net/darkhounds/core/server/response.js');
var serverCfg           = require(process.src + 'net/darkhounds/aethernauts/server/config/confServer.js');
var errorsCfg           = require(process.src + 'net/darkhounds/aethernauts/server/config/confErrors.js');
var ModelWorlds         = require(process.src + "net/darkhounds/aethernauts/server/models/modelWorlds.js");
var ModelContinents     = require(process.src + "net/darkhounds/aethernauts/server/models/modelContinents.js");
var ModelRegions        = require(process.src + "net/darkhounds/aethernauts/server/models/modelRegions.js");
var ModelAreas          = require(process.src + "net/darkhounds/aethernauts/server/models/modelAreas.js");
var ModelRooms          = require(process.src + "net/darkhounds/aethernauts/server/models/modelRooms.js");
var ModelConnections    = require(process.src + "net/darkhounds/aethernauts/server/models/modelConnections.js");
var ModelUsers          = require(process.src + "net/darkhounds/aethernauts/server/models/modelUsers.js");
var ModelSessions       = require(process.src + 'net/darkhounds/aethernauts/server/models/modelSessions.js');

function hashPassword(password)                                                 {
    return crypto.createHash('md5').update(password).digest('hex');
}

module.exports                  = new EventEmitter();

module.exports.handleRequest    = function(token, request, response)            {
    var callback = function (err, data)                                         {
        if (!err) response.emit(Response.RESOLVED, data);
        else response.emit(Response.ERROR, err);
    };
    
    module.exports.isAdmin(token, function(err)                                 {
        if (!err)                                                               {
            switch(request.action)                                              {
                case 'getWorld':    module.exports.getWorld(request.name || "Nod", callback);       break;
                default:            response.emit(Response.ERROR, errorsCfg.UnknownRequestType);    break;
            }
        } else callback(err);
    });
};

module.exports.isAdmin          = function (token, callback)                    {
    ModelSessions.instance.findOne({token: token}, function(err, session)       {
        if (!err)                                                               {
            if (session)                                                        {
                if (session.user)                                               {
                    if (session.user.roles && session.user.roles.indexOf("admin") >= 0) callback(null);
                    else callback(errorsCfg.UserNotAdmin);
                } else callback(errorsCfg.InvalidSession);
            } else if (callback) callback(errorsCfg.NotLogedin);
        } else if (callback) callback(err);
    }).populate("user");
};

module.exports.getWorld         = function(name, callback)                      {
    var world               = null;
    var counter             = 0;
    var incrementCounter    = function()                                        {
        counter++;
    }
    var checkCounter        = function (err)                                    {
        --counter;
        if (!err && counter <= 0 && callback) callback(null, world);
        else if (err) callback(err);
    };
    
    ModelWorlds.instance.findOne({name: name}, function(err, record)            {
        if (!err)                                                               {
            world               = record.toObject();
            world.continents    = [];
            if (record)                                                         {
                ModelContinents.instance.find({world: record}, function(err, records) {
                    if (!err)                                                   {
                        for (var i in records)                                  {
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

function _injectRegions(continent, incrementCounter, callback)                  {
    incrementCounter();
    ModelRegions.instance.find({continent: continent}, function(err, records)   {
        if (!err)                                                               {
            continent.regions   = [];
            for (var i in records)                                              {
                var record = records[i].toObject();
                continent.regions.push(record);
                _injectAreas(record, incrementCounter, callback);
            }
            callback();
        } else if (callback) callback(err);
    });
}

function _injectAreas(region, incrementCounter, callback)                       {
    incrementCounter();
    ModelAreas.instance.find({region: region}, function(err, records)           {
        if (!err)                                                               {
            region.areas        = [];
            for (var i in records)                                              {
                var record = records[i].toObject();
                region.areas.push(record);
                _injectRooms(record, incrementCounter, callback);
            }
            callback();
        } else if (callback) callback(err);
    });
}

function _injectRooms(area, incrementCounter, callback)                         {
    incrementCounter();
    ModelRooms.instance.find({area: area}, function(err, records)               {
        if (!err)                                                               {
            area.rooms        = [];
            for (var i in records)                                              {
                var record = records[i].toObject();
                area.rooms.push(record)
                
            }
            callback();
        } else if (callback) callback(err);
    }).populate("connections");
}
