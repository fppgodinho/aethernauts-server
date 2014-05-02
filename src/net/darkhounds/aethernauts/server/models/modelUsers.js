var EventEmitter    = require( "events" ).EventEmitter;
var errorsCfg       = require(process.src + 'net/darkhounds/aethernauts/server/config/confErrors.js');
var nedb            = require('nedb');
var model           = new nedb({ filename: 'data/aethernauts/users.db', autoload: true });
//
var ModelUsers      = {};
ModelUsers.ERROR    = 'modelError';
ModelUsers.RESULT   = 'modelResult';
ModelUsers.get      = function(filter)                                      {
    var response            = new EventEmitter();
    if (!model) response.emit(ModelUsers.ERROR, {error: errorsCfg.DBError});
    else model.findOne(filter, function(error, item)                            {
        if (error) response.emit(ModelUsers.ERROR, {error: errorsCfg.DBError});
        else response.emit(ModelUsers.RESULT, {item: item});
    });
    return response;
};
ModelUsers.list     = function(filter)                                          {
    var response            = new EventEmitter();
    if (!model) response.emit(ModelUsers.ERROR, {error: errorsCfg.DBError});
    else model.find(filter, function(error, items)                              {
        if (error) response.emit(ModelUsers.ERROR, {error: errorsCfg.DBError});
        else response.emit(ModelUsers.RESULT, {items: items});
    });
    return response;
};
ModelUsers.save     = function(data)                                            {
    var response        = new EventEmitter();
    if (!model) response.emit(ModelUsers.ERROR, {error: errorsCfg.DBError});
    else model.findOne({ "credentials.username": data.username }, function (error, item) {
        if (error) response.emit(ModelUsers.ERROR, {error: errorsCfg.DBError});
        else                                                                    {
            data            = update(item, data);
            model.update({ "credentials.username": data.username}, data, {upsert: true},
                function (error, affectedItems, newItem)                        {
                    if (error) response.emit(ModelUsers.ERROR, {error: errorsCfg.DBError});
                    else response.emit(ModelUsers.RESULT, {item: newItem});
                }
            );
        }
    });
    return response;
};
module.exports      = ModelUsers;
//
function update(item, data)                                                     {
    data                = data || { credentials:{}, identity:{ name:{} } };
    item                = item || { created:new Date() };
    item.modified       = new Date();
    item.type           = data.type;
    item.credentials    = {
        username:       data.credentials.username,
        password:       data.credentials.password
    };
    item.identity       = {
        name:           { first:  data.identity.name.first, last:   data.identity.name.last },
        emails:         data.identity.emails || [],
        phones:         data.identity.phones || [],
        addresses:      data.identity.addresses || []
    };
    return item;
}
