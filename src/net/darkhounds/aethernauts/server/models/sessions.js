var nedb        = require('nedb');
var model       = null;

exports.connect = function (file)                                               {
    model       = new nedb({ filename: file, autoload: true });
    return model;
}

exports.save = function(token, user, open)                                      {
    var response    = { onSuccess: null, onError: null, error:null, session:null};
    //
    model.findOne({ token: token, open: true }, function (err, session)         {
        if (!err)                                                               {
            var now                     = new Date();
            response.session            = update(session, token, user, open);
            if (session) response.session.log.push({message:open?'update':'close', date:now, user:user});
            //
            model.update({ token: token, open: true }, response.session, {upsert: true},
                function (err, affectedSessions, newSession)                    {
                    response.error      = err || null;
                    response.session    = newSession || response.session;
                    if (response.error && response.onError) response.onError(response.error);
                    else if (!response.error && response.onSuccess) response.onSuccess(response.session);
                }
            );
        } else {
            response.error      = err;
            if (response.onError) response.onError(err);
        }
    });
    //
    return response; 
};

function update(session, token, user, open)                              {
    var now         = new Date();
    var session     = session || { token:token, created: now, log: [{message: 'opened', date:now}], open: true };
    session.user    = user;
    session.open    = open;
    return session;
}
