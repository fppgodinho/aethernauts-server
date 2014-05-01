var errorsCfg       = require('../config/confErrors.js');
var sessionsModel   = require('../models/modelSessions.js');
var usersModel      = require('../models/modelUsers.js');
var charactersModel = require('../models/modelCharacters.js');

exports.handleRequest   = function(token, response, request)                    {
    switch(request.action)                                                      {
        case 'list':    exports.list(token, response, request);     break;
        case 'create':  exports.create(token, response, request);   break;
        case 'deleted': exports.delete(token, response, request);     break;
        default:        break;
    }
};

exports.list            = function(token, response, request)                    {
    sessionsModel.get({token: token}, function (err, session)                   {
        if (err) response.error                 = errorsCfg['DBError'];
        else if (!session) response.error       = errorsCfg['DBNoSession'];
        else if (!session.open) response.error  = errorsCfg['DBInvalidSession'];
        else if (!session.user) response.error  = errorsCfg['DBNotLogedin'];
        else charactersModel.list({userid: session.user._id}, function(err, items){
            if (err) response.error             = errorsCfg['DBError'];
            else response.response              = items;
            //
            if (response.error && response.onError) response.onError(response.error, err);
            else if (response.onResult) response.onResult(response.result);
        });
        //
        if (response.error && response.onError) response.onError(response.error, err);
    });
};

exports.create      = function(token, response, request)                        {
    sessionsModel.get({token: token}, function (err, session)                   {
        if (err) response.error                 = errorsCfg['DBError'];
        else if (!session) response.error       = errorsCfg['DBNoSession'];
        else if (!session.open) response.error  = errorsCfg['DBInvalidSession'];
        else if (!session.user) response.error  = errorsCfg['DBNotLogedin'];
        else                                                                    {
            charactersModel.get({firstname: request.firstname, deleted: false}, function(err, existingCharacter){
                if (err) response.error = errorsCfg['DBError'];
                else if (existingCharacter) response.error = errorsCfg['CharacterNameReserved'];
                else                                                            {
                    var stats  = generateStats();
                    charactersModel.save(session.user._id, request.firstname, request.lastname, stats[0], stats[1], stats[2], stats[3], stats[4], stats[5], 0, null,
                        function(err, character)                                {
                            if (err) response.error = errorsCfg['DBError'];
                            else response.result    = character;
                            //
                            if (response.error && response.onError) response.onError(response.error, err);
                            else if (response.onResult) response.onResult(response.result);
                        }
                    );
                }
                //
                if (response.error && response.onError) response.onError(response.error, err);
            });            
        }
        //
        if (response.error && response.onError) response.onError(response.error, err);
    });
};

exports.delete      = function(token, response, request)                        {
    sessionsModel.get({token: token}, function (err, session)                   {
        if (err) response.error                 = errorsCfg['DBError'];
        else if (!session) response.error       = errorsCfg['DBNoSession'];
        else if (!session.open) response.error  = errorsCfg['DBInvalidSession'];
        else if (!session.user) response.error  = errorsCfg['DBNotLogedin'];
        else charactersModel.get({_id: request._id, userid: session.user._id}, function(err, existingCharacter){
            if (err) response.error = errorsCfg['DBError'];
            else if (!existingCharacter) response.error = errorsCfg['InvalidCharacter'];
            else charactersModel.delete(existingCharacter, function(err)        {
                    if (err) response.error     = errorsCfg['DBError'];
                    else response.result        = true;
                    //
                    if (response.error && response.onError) response.onError(response.error, err);
                    else if (response.onResult) response.onResult(response.result);
                }
            );
            //
            if (response.error && response.onError) response.onError(response.error, err);
        });            
        //
        if (response.error && response.onError) response.onError(response.error, err);
    });
};

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