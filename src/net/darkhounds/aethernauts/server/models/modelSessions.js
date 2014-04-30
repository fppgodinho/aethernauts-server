var nedb        = require('nedb');
var model       = new nedb({ filename: 'data/aethernauts/sessions.db', autoload: true });

exports.get     = function(filter, handleResult)                                {
    if (model) model.findOne(filter, handleResult);
};

exports.list    = function(filter, handleResult)                                {
    if (model) model.find(filter, handleResult);
};

exports.save = function(token, user, open, handleResult)                        {
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
                    if (response.error)                                         {
                        if (handleResult) handleResult(err, null);
                        if (response.onError) response.onError(response.error);
                    } else if (!response.error)                                 {
                        if (handleResult) handleResult(err, null);
                        if (response.onSuccess) response.onSuccess(response.session);
                    }
                }
            );
        } else {
            response.error      = err;
            if (handleResult) handleResult(err, null);
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
