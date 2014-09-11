var path            = require('path');
process.src         = __dirname + "/";

var ControllerAuth  = require(process.src + 'net/darkhounds/aethernauts/server/controllers/controllerAuth.js');
var ModelUsers      = require(process.src + "net/darkhounds/aethernauts/server/models/modelUsers.js");
var ModelWorlds     = require(process.src + "net/darkhounds/aethernauts/server/models/modelWorlds.js");
var ModelContinents = require(process.src + "net/darkhounds/aethernauts/server/models/modelContinents.js");
var ModelRegions    = require(process.src + "net/darkhounds/aethernauts/server/models/modelRegions.js");
var ModelAreas      = require(process.src + "net/darkhounds/aethernauts/server/models/modelAreas.js");
var ModelRooms      = require(process.src + "net/darkhounds/aethernauts/server/models/modelRooms.js");
var ModelTools      = require(process.src + "net/darkhounds/aethernauts/server/models/modelTools.js");
var ModelSessions   = require(process.src + 'net/darkhounds/aethernauts/server/models/modelSessions.js');

// *****************************************************************************
// { region: USER
function _createUsers()                                                         {
    ModelUsers.instance.collection.drop();
    
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
// { region: Sessions
function _createSessions()                                                      {
    ModelSessions.instance.collection.drop();
}
// } endregion
// *****************************************************************************

// *****************************************************************************
// { region: World
function _createWorld()                                                         {
    ModelWorlds.instance.collection.drop();
    ModelContinents.instance.collection.drop();
    ModelRegions.instance.collection.drop();
    ModelAreas.instance.collection.drop();
    ModelRooms.instance.collection.drop();
    //
    var nod             = save(ModelWorlds.instance.create({
        name:       "Nod"
    }));

    var iceania         = save(ModelContinents.instance.create({
        name:       "Iceania",
        world:      nod
    }));
    
    var whiteBoulders   = save(ModelRegions.instance.create({
        name:       "White Boulders",
        continent:  iceania
    }));
    
    var whiteNest       = save(ModelAreas.instance.create({
        name:       "White Nest",
        region:     whiteBoulders
    }));

    var townSquare      = save(ModelRooms.instance.create({
        name:       "White Nest",
        area:       whiteNest
    }));
    
    var etherness       = save(ModelContinents.instance.create({
        name:       "Etherness",
        world:      nod
    }));
    
}
// } endregion
// *****************************************************************************

// *****************************************************************************
// { region: USER
function _createRodOfGod()                                                      {
    ModelTools.instance.collection.drop();
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
var _events = 0;
function save(item, callback)                                                   {
    _events++;
    item.save(function(err, data)                                               {
        if (callback) callback.apply(item, err, data);
        if (--_events <= 0) ControllerDB.close(); 
    });
    return item;
}
// } endregion
// *****************************************************************************

// *****************************************************************************
// { region: Connection
var ControllerDB    = require(process.src + 'net/darkhounds/aethernauts/server/controllers/controllerDB.js');
ControllerDB.on('error', console.error.bind(console, 'connection error:'));
ControllerDB.once('open', function callback ()                                  {
    _createUsers();
    _createSessions();
    _createWorld();
    _createRodOfGod();
});
// } endregion
// *****************************************************************************





