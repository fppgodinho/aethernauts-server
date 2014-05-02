var EventEmitter        = require( "events" ).EventEmitter;
var errorsCfg           = require(process.src + 'net/darkhounds/aethernauts/server/config/confErrors.js');
var nedb                = require('nedb');
var model               = new nedb({ filename: 'data/aethernauts/sessions.db', autoload: true });
//
var ModelSessions       = {};
ModelSessions.ERROR     = 'modelError';
ModelSessions.RESULT    = 'modelResult';
ModelSessions.get       = function(filter)                                      {
    var response            = new EventEmitter();
    if (!model) response.emit(ModelSessions.ERROR, {error: errorsCfg.DBError});
    else model.findOne(filter, function(error, item)                            {
        if (error) response.emit(ModelSessions.ERROR, {error: errorsCfg.DBError});
        else response.emit(ModelSessions.RESULT, {item: item});
    });
    return response;
};
ModelSessions.list      = function(filter)                                      {
    var response            = new EventEmitter();
    if (!model) response.emit(ModelSessions.ERROR, {error: errorsCfg.DBError});
    else model.find(filter, function(error, items)                              {
        if (error) response.emit(ModelSessions.ERROR, {error: errorsCfg.DBError});
        else response.emit(ModelSessions.RESULT, {items: items});
    });
    return response;
};
ModelSessions.save      = function(data)                                        {
    var response            = new EventEmitter();
    if (!model) response.emit(ModelSessions.ERROR, {error: errorsCfg.DBError});
    else model.findOne({ token: data.token, open: true }, function (error, item){
        if (error) response.emit(ModelSessions.ERROR, {error: errorsCfg.DBError});
        else                                                                    {
            var now         = new Date();
            data            = update(item, data);
            if (item) data.log.push({message:data.open?'update':'close', date:now, user:data.user});
            model.update({ token: data.token, open: true }, data, {upsert: true},
                function (error, affectedItems, newItem)                        {
                    if (error) response.emit(ModelSessions.ERROR, {error: errorsCfg.DBError});
                    else response.emit(ModelSessions.RESULT, {item: newItem});
                }
            );
        }
    });
    return response;
};
module.exports      = ModelSessions;
//
function update(item, data)                                                     {
    data            = data || {};
    item            = item || { token:data.token, created: new Date(), log: [{message: 'opened', date:new Date()}], open: true };
    item.modified   = new Date();
    item.user       = data.user;
    item.open       = data.open;
    return item;
}
