var nedb        = require('nedb');
var model       = null;

exports.connect = function (file)                                               {
    model       = new nedb({ filename: file, autoload: true });
    return model;
};

exports.get     = function(filter, handleResult)                                {
    if (model) model.findOne(filter, handleResult);
};

exports.save    = function(type, username, password, firstName, lastName, emails, phones, addresses) {
    if (!model) return;
    var response                        = { onSuccess: null, onError: null, error:null, user:null};
    //
    model.findOne({ "credentials.username": username }, function (err, user)  {
        if (!err)                                                               {
            response.user               = update(user, type, username, password, firstName, lastName, emails, phones, addresses);
            model.update({ "credentials.username": username}, response.user, {upsert: true},
                function (err, affectedUsers, newUser)                          {
                    response.error      = err || null;
                    response.user       = newUser || response.user;
                    if (response.error && response.onError) response.onError(response.error);
                    else if (!response.error && response.onSuccess) response.onSuccess(response.user);
                }
            );
        } else {
            response.error              = err;
            if (response.onError) response.onError(err);
        }
    });
    //
    return response; 
};

function update(user, type, username, password, firstName, lastName, emails, phones, addresses) {
    var now         = new Date();
    var user        = user || { created: now };
    user.type       = type;
    user.modified   = now;
    user.credentials = {
        username:       username,
        password:       password
    };
    user.identity    = {
        name:           { first:  firstName, last:   lastName },
        emails:         emails || [],
        phones:         phones || [],
        addresses:      addresses || []
    };
    return user;
}