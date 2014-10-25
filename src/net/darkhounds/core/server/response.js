var EventEmitter    = require( "events" ).EventEmitter;

var Response = function()                                                       {
    var response        = new EventEmitter();
    response.setError   = function(error)                                       {
        response.error  = error;
        setTimeout(function(){response.emit(Response.ERROR, error);}, 0);
        return response;
    };
    response.setValue   = function(value)                                       {
        response.value  = value;
        setTimeout(function(){response.emit(Response.RESOLVED, value);}, 0);
        return response;
    };
    
    return response;
};
Response.ERROR      = 'responseError';
Response.RESOLVED   = 'responseResolved';


module.exports      = Response;
