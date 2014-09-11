var path            = require('path');
process.src         = __dirname + "/";

var fs      = require('fs');
var xml2js  = require('xml2js');

var ControllerAuth      = require(process.src + 'net/darkhounds/aethernauts/server/controllers/controllerAuth.js');
var ModelUsers          = require(process.src + "net/darkhounds/aethernauts/server/models/modelUsers.js");
var ModelWorlds         = require(process.src + "net/darkhounds/aethernauts/server/models/modelWorlds.js");
var ModelContinents     = require(process.src + "net/darkhounds/aethernauts/server/models/modelContinents.js");
var ModelRegions        = require(process.src + "net/darkhounds/aethernauts/server/models/modelRegions.js");
var ModelAreas          = require(process.src + "net/darkhounds/aethernauts/server/models/modelAreas.js");
var ModelRooms          = require(process.src + "net/darkhounds/aethernauts/server/models/modelRooms.js");
var ModelConnections    = require(process.src + "net/darkhounds/aethernauts/server/models/modelConnections.js");
var ModelTools          = require(process.src + "net/darkhounds/aethernauts/server/models/modelTools.js");
var ModelSessions       = require(process.src + 'net/darkhounds/aethernauts/server/models/modelSessions.js');

// *****************************************************************************
// { region: USER
function _createUsers()                                                         {
    var admin   = save(ModelUsers.instance.create({
        username:   "admin",
        password:   ControllerAuth.hashPassword("test"),
        firstName:  "Server",
        lastName:   "Admin",
        email:      "cainvampyr@gmail.com"
    }));
    var jhonDoe = save(ModelUsers.instance.create({
        username:   "jhondoe",
        password:   ControllerAuth.hashPassword("test"),
        firstName:  "Jhon",
        lastName:   "Doe",
        email:      "jhondoe@gmail.com"
    }));
}
// } endregion
// *****************************************************************************

// *****************************************************************************
// { region: World
function _createWorld()                                                         {
    addEvent();
    var parser = new xml2js.Parser();
    fs.readFile(process.src + 'data/install/world.xml', function(err, data)     {
        parser.parseString(data, function (err, result)                         {
            removeEvent();
            
            var worldInstance   = ModelWorlds.instance.create({
                name:       result.world.name
            });
            
            for (var i in result.world.continent)                               {
                _createContinent(worldInstance, result.world.continent[i]);
                continue;
            }
            
            save(worldInstance);
        });
    });

}
function _createContinent(worldInstance, continentXML)                          {
    var continentInstance   = ModelContinents.instance.create({
        name:       continentXML.name,
        world:      worldInstance
    });
    for (var i in continentXML.region)  _createRegion(continentInstance, continentXML.region[i]);
    return save(continentInstance);
}
function _createRegion(continentInstance, regionXML)                            {
    var regionInstance      = ModelRegions.instance.create({
        name:       regionXML.name,
        continent:  continentInstance
    });
    for (var i in regionXML.area)  _createArea(regionInstance, regionXML.area[i]);
    return save(regionInstance);
}
function _createArea(regionInstance, areaXML)                                   {
    var areaInstance      = ModelAreas.instance.create({
        name:       areaXML.name,
        region:     regionInstance
    });
    for (var i in areaXML.room)  _createRoom(areaInstance, areaXML.room[i]);
    return save(areaInstance);
}
function _createRoom(areaInstance, roomXML)                                     {
    var roomInstance      = ModelRooms.instance.create({
        name:       roomXML.name,
        x:          roomXML.$.x,
        y:          roomXML.$.y,
        z:          roomXML.$.z,
        area:       areaInstance
    })
    for (var i in roomXML.connection)
        roomInstance.connections.push(_createConnection(roomInstance, roomXML.connection[i]));

    return save(roomInstance);
}
function _createConnection(roomInstance, connectionXML)                         {
    var connectionInstance      = ModelConnections.instance.create({
        dir:        connectionXML.$.dir,
        x:          connectionXML.$.x,
        y:          connectionXML.$.y,
        z:          connectionXML.$.z,
        source:     roomInstance
    });
    return save(connectionInstance);
}
function _connectRooms()                                                        {
    _roomsConnected     = true;
    addEvent();
    ModelConnections.instance.find({}, function(err, connections)               {
        for (var i in connections) _connectRoom(connections[i]);
        removeEvent();
    }).populate("source");
}
function _connectRoom(connection)                                           {
    addEvent();
    ModelRooms.instance.findOne({x:connection.x, y:connection.y, z:connection.z}, function(err, room){
        connection.target = room;
        save(connection);
        removeEvent(); 
    }).populate("source");
}

// } endregion
// *****************************************************************************

// *****************************************************************************
// { region: USER
function _createRodOfGod()                                                      {
//    ModelTools.instance.collection.drop();
    var rodOfGod = save(ModelTools.instance.create({
        name:       "Rod of God",
        size:       1,
        weight:     1
    }));
}
// } endregion
// *****************************************************************************

// *****************************************************************************
// { region: EventManager
var _events         = 0;
var _roomsConnected = false;
function save(item, callback)                                                   {
    addEvent();
    item.save(function(err, data)                                               {
        if (callback) callback.apply(item, [err, data]);
        removeEvent();
    });
    return item;
}

function addEvent()                                                             {
    _events++;
}
function removeEvent()                                                          {
    if (--_events <= 0 && !_roomsConnected) _connectRooms();
    else if (_events <= 0)                                                      {
//        ModelRooms.instance.findOne({name: "Town Square"}, function(err, room)  {
//            console.log(room);
//            ControllerDB.close();
//        }).populate("area connections");
        console.log("All Done!");
        ControllerDB.close();
    }
}
// } endregion
// *****************************************************************************

// *****************************************************************************
// { region: Connection
var ControllerDB    = require(process.src + 'net/darkhounds/aethernauts/server/controllers/controllerDB.js');
ControllerDB.on('error', console.error.bind(console, 'connection error:'));
ControllerDB.once('open', function callback ()                                  {
    ControllerDB.db.dropDatabase();
    _createUsers();
    _createWorld();
    _createRodOfGod();
});
// } endregion
// *****************************************************************************





