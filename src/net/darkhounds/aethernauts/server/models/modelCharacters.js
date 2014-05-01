var nedb        = require('nedb');
var model       = new nedb({ filename: 'data/aethernauts/characters.db', autoload: true });

exports.get     = function(filter, handleResult)                                {
    if (model) model.findOne(filter, handleResult);
};

exports.list    = function(filter, handleResult)                                {
    if (model) model.find(filter, handleResult);
};

exports.save    = function(userid, firstname, lastname, int, wiz, str, agi, sta, luck, hp, bag, handleResult) {
    if (!model) return;
    var response                        = { onSuccess: null, onError: null, error:null, user:null};
    //
    model.findOne({ firstname: firstname }, function (err, item)                {
        if (!err)                                                               {
            response.character          = update(item, userid, firstname, lastname, int, wiz, str, agi, sta, luck, hp, bag);
            model.update({firstname: firstname}, response.character, {upsert: true},
                function (err, affectedItems, newItem)                          {
                    if (err)                                                    {
                        response.error      = err;
                        if (handleResult) handleResult(err, null);
                        if (response.onError) response.onError(response.error);
                    } else                                                      {
                        response.character  = newItem;
                        if (handleResult) handleResult(null, newItem);
                        if (response.onSuccess) response.onSuccess(response.character);
                    }
                }
            );
        } else {
            response.error              = err;
            if (handleResult) handleResult(err, null);
            if (response.onError) response.onError(err);
        }
    });
    //
    return response; 
};

exports.delete  = function(character, handleResult)                             {
    if (!model) return;
    var response                        = { onSuccess: null, onError: null, error:null, user:null};
    //
    model.findOne({_id: character._id}, function (err, item)                    {
        if (!err)                                                               {
            item.deleted                = true;
            model.update({_id: character._id}, item, {upsert: true},
                function (err, affectedItems)                                   {
                    if (err)                                                    {
                        response.error = err;
                        if (handleResult) handleResult(err, null);
                        if (response.onError) response.onError(response.error);
                    } else if (!response.error)                                 {
                        if (handleResult) handleResult(null, affectedItems);
                        if (response.onSuccess) response.onSuccess();
                    }
                }
            );
        } else {
            response.error              = err;
            if (handleResult) handleResult(err, null);
            if (response.onError) response.onError(err);
        }
    });
    //
    return response; 
};

function update(character, userid, firstname, lastname, int, wiz, str, agi, sta, luck, hp, bag) {
    var now             = new Date();
    var character       = character || { created: now, deleted: false };
    //
    character.modified  = now;
    character.userid    = userid;
    character.firstname = firstname;
    character.lastname  = lastname;
    character.stats     = { int: int, wiz: wiz, str: str, agi: agi, sta: sta, luck: luck, hp: hp};
    character.bag       = bag;
    //
    return character;
}