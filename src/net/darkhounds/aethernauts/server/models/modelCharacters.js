var EventEmitter        = require( "events" ).EventEmitter;
var errorsCfg           = require(process.src + 'net/darkhounds/aethernauts/server/config/confErrors.js');
var nedb                = require('nedb');
var model               = new nedb({ filename: 'data/aethernauts/characters.db', autoload: true });
//
var ModelCharacters     = {};
ModelCharacters.ERROR   = 'modelError';
ModelCharacters.RESULT  = 'modelResult';
ModelCharacters.get     = function(filter)                                      {
    var response            = new EventEmitter();
    if (!model) response.emit(ModelCharacters.ERROR, {error: errorsCfg.DBError});
    else model.findOne(filter, function(error, item)                            {
        if (error) response.emit(ModelCharacters.ERROR, {error: errorsCfg.DBError});
        else response.emit(ModelCharacters.RESULT, {item: item});
    });
    return response;
};
ModelCharacters.list     = function(filter)                                     {
    var response            = new EventEmitter();
    if (!model) response.emit(ModelCharacters.ERROR, {error: errorsCfg.DBError});
    else model.find(filter, function(error, items)                              {
        if (error) response.emit(ModelCharacters.ERROR, {error: errorsCfg.DBError});
        else response.emit(ModelCharacters.RESULT, {items: items});
    });
    return response;
};
ModelCharacters.save    = function(data)                                        {
    var response            = new EventEmitter();
    if (!model) response.emit(ModelCharacters.ERROR, {error: errorsCfg.DBError});
    else model.findOne({ firstname: data.firstname }, function (error, item)    {
        if (error) response.emit(ModelCharacters.ERROR, {error: errorsCfg.DBError});
        else                                                                    {
            data            = update(item, data);
            model.update({firstname: data.firstname}, data, {upsert: true},
                function(error, affectedItems, newItem)                         {
                    if (error) response.emit(ModelCharacters.ERROR, {error: errorsCfg.DBError});
                    else response.emit(ModelCharacters.RESULT, {item: newItem});
                }
            );
        }
    });
    return response;
};
ModelCharacters.delete  = function(data)                                        {
    var response            = new EventEmitter();
    if (!model) response.emit(ModelCharacters.ERROR, {error: errorsCfg.DBError});
    else model.findOne({ _id: data._id }, function (error, item)          {
        if (error) response.emit(ModelCharacters.ERROR, {error: errorsCfg.DBError});
        else if (!item) response.emit(ModelCharacters.ERROR, {error: errorsCfg.InvalidCharacter});
        else                                                                    {
            item.deleted                = true;
            model.update({_id: data._id}, item, {upsert: true},
                function (error)                                                {
                    if (error) response.emit(ModelCharacters.ERROR, {error: errorsCfg.DBError});
                    else response.emit(ModelCharacters.RESULT, item);
                }
            );
        }
    });
    return response;
};
module.exports          = ModelCharacters;

function update(item, data)                                                     {
    data                = data || { identity:{ name:{}, stats:{} } };
    item                = item || { created:new Date(), deleted:false };
    item.modified       = new Date();
    item.userid         = data.userid;
    item.identity       = { name: {first: data.identity.name.first, last: data.identity.name.last } },
    item.stats          = { int: data.stats.int, wiz: data.stats.wiz, str: data.stats.str, agi: data.stats.agi, sta: data.stats.sta, luck: data.stats.luck, hp: data.stats.hp };
    item.bag            = data.bag;
    //
    return item;
}