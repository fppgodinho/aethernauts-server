var EventEmitter    = require( "events" ).EventEmitter;
var Response        = require(process.src + 'net/darkhounds/core/server/response.js');
var errorsCfg       = require(process.src + 'net/darkhounds/aethernauts/server/config/confErrors.js');
var ModelSessions   = require(process.src + 'net/darkhounds/aethernauts/server/models/modelSessions.js');
var ModelUsers      = require(process.src + 'net/darkhounds/aethernauts/server/models/modelUsers.js');
var ModelCharacters = require(process.src + 'net/darkhounds/aethernauts/server/models/modelCharacters.js');

var Characters      = function()                                                {
    var characters              = new EventEmitter();
    characters.handleRequest    = function(token, request, response)            {
        switch(request.action)                                                  {
            case 'list':        characters.list(token, request, response);                      break;
            case 'create':      characters.create(token, request, response);                    break;
            case 'delete':      characters.deleted(token, response, response);                  break;
            default:            response.emit(Response.ERROR, errorsCfg.UnknownRequestType);    break;
        }
    };
    
    characters.list             = function(token, request, response)            {
        ModelSessions.get({token: token}).on(ModelSessions.RESULT, function(event){
            if (!event.item)            response.error  = errorsCfg.NoSession;
            else if (!event.item.open)  response.error  = errorsCfg.InvalidSession;
            else if (!event.item.user)  response.error  = errorsCfg.NotLogedin;
            else ModelCharacters.list({userid: event.item.user._id}).on(ModelCharacters.RESULT,
                function(event)                                                 {
                    response.emit(Response.RESOLVED, event.items);
                }
            ).on(ModelCharacters.ERROR, function(event) { response.emit(Response.ERROR, event.error); });
        }).on(ModelSessions.ERROR, function(event) { response.emit(Response.ERROR, event.error); });
    };
    
    characters.create           = function(token, request, response)            {
        ModelSessions.get({token: token}).on(ModelSessions.RESULT, function(event){
            var session     = event.item;
            if (!session)               response.error  = errorsCfg.NoSession;
            else if (!session.open)     response.error  = errorsCfg.InvalidSession;
            else if (!session.user)     response.error  = errorsCfg.NotLogedin;
            else ModelCharacters.get({'identity.name.first': request.firstname}).on(ModelCharacters.RESULT,
                function(event)                                                 {
                    if (event.item) response.emit(Response.ERROR, errorsCfg.CharacterNameReserved);
                    else                                                        {
                        var stats  = generateStats();
                        ModelCharacters.save({
                            userid:     session.user._id,
                            identity:   { name:{first:request.firstname, last:request.lastname} },
                            stats:      { int: stats[0], wiz: stats[1], str: stats[2], agi: stats[3], sta: stats[4], luck: stats[5] }
                        }).on(ModelCharacters.RESULT, function(event) { console.log(event); response.emit(Response.RESOLVED, event.item);
                        }).on(ModelCharacters.ERROR, function(event) { response.emit(Response.ERROR, event.error); });
                    }
                }
            ).on(ModelCharacters.ERROR, function(event) { response.emit(Response.ERROR, event.error); });
        }).on(ModelSessions.ERROR, function(event) { response.emit(Response.ERROR, event.error); });
    };
    
    characters.delete           = function(token, request, response)            {
        ModelSessions.get({token: token}).on(ModelSessions.RESULT, function(event){
            if (!event.item)            response.error  = errorsCfg.NoSession;
            else if (!event.item.open)  response.error  = errorsCfg.InvalidSession;
            else if (!event.item.user)  response.error  = errorsCfg.NotLogedin;
            else ModelCharacters.get({'identity.name.first': request.firstname}).on(ModelCharacters.RESULT,
                function(event)                                                 {
                    if (!event.item) response.emit(Response.ERROR, errorsCfg.InvalidCharacter);
                    else ModelCharacters.delete(event.item).on(ModelCharacters.RESULT, function(event) {
                        response.emit(Response.RESOLVED);
                    }).on(ModelCharacters.ERROR, function(event) { response.emit(Response.ERROR, event.error); });
                }
            ).on(ModelCharacters.ERROR, function(event) { response.emit(Response.ERROR, event.error); });
        }).on(ModelSessions.ERROR, function(event) { response.emit(Response.ERROR, event.error); });
    };
    
    return characters;
};
module.exports      = Characters;

function generateStats()                                                        {
    var min     = 2;
    var max     = 10;
    var range   = max-min;
    var stats   = [min, min, min, min, min, min];
    var pool    = stats.length * range;
    for (var i = 0; i < stats.length; i++)                                      {
        var val     = (i < stats.length-1)?Math.round(Math.random() * ((range > pool)?pool:range)):pool;
        stats[i]    += val;
        pool        -= val;
    }
    return stats;
}