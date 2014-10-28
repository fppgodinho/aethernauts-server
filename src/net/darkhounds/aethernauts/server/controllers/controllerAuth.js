var EventEmitter    = require( "events" ).EventEmitter;
var Crypto          = require('crypto');
var Response        = require(process.src + 'net/darkhounds/core/server/response.js');
var ModelUsers      = require(process.src + "net/darkhounds/aethernauts/server/models/modelUsers.js");
var ModelSessions   = require(process.src + 'net/darkhounds/aethernauts/server/models/modelSessions.js');
var serverCfg       = require(process.src + 'net/darkhounds/aethernauts/server/config/confServer.js');
var errorsCfg       = require(process.src + 'net/darkhounds/aethernauts/server/config/confErrors.js');

var Module  = function()                                                        {
    var _module = new EventEmitter();
    
    _module.hashPassword     = function(password)                               {
        return _hashPassword(password + '_' + serverCfg.salt);
    };
    
    _module.register         = function(username, password, firstname, lastname, email, callback) {
        ModelUsers.instance.findOne({"username": username}, function(err, user)     {
            if (!err)                                                               {
                if (!user)                                                          {
                    user = ModelUsers.instance.create(                              {
                        username:   username,
                        password:   _module.hashPassword(password),
                        firstName:  firstname,
                        lastName:   lastname,
                        email:      email
                    });
                    user.save(function(err)                                         {
                        if (!err && callback)                                       {
                            user.password = null;
                            callback(null, user);
                        } else if (callback) callback(err);
                    });
                } else if (callback) callback(errorsCfg.CharacterNameReserved);
            } else if (callback) callback(err);
        });
    };
    
    _module.login            = function(token, username, password, ip, callback) {
        ModelUsers.findOne({"username": username}, function(err, user)     {
            if (!err)                                                               {
                if (user)                                                           {
                    var storedpassword  = _hashPassword(user.password + token);
                    if (storedpassword == password)                                 {
                        ModelSessions.instance.findOne({user: user, closed: false}, function(err, session) {
                            if (!err)                                               {
                                if (session)                                        {
                                    session.updated = Date.now();
                                    session.closed  = true;
                                    session.save({});
                                }
                                ModelSessions.instance.create({
                                    ip:         ip,
                                    token:      token,
                                    user:       user
                                }).save(function(err)                               {
                                    if (!err && callback)                           {
                                        user.password = null;
                                        callback(null, user);
                                    } else if (callback) callback(err);
                                });
                            } else if (callback) callback(err);
                        });
                    } else if (callback) callback(errorsCfg.AuthError);
                } else if (callback) callback(errorsCfg.AuthError);
            } else if (callback) callback(err);
        });
    };
    
    _module.logout           = function(token, callback)                     {
        ModelSessions.instance.findOne({token: token}, function(err, session)       {
            if (!err)                                                               {
                if (session)                                                        {
                    session.updated = Date.now();
                    session.closed  = true;
                    session.save(function(err){
                        if (!err && callback) callback(null);
                        else if (callback) callback(err);
                    });
                } else if (callback) callback(errorsCfg.NotLogedin);
            } else if (callback) callback(err);
        });
    };
    
    function _hashPassword(password)                                            {
        return Crypto.createHash('md5').update(password).digest('hex');
    }
    
    return _module;
};

module.exports                  = new Module(); 


