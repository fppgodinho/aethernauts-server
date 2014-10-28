var Mongoose                = require("mongoose");

var Module = function () {
    var _name       = "Users";
    var _schema     = new Mongoose.Schema({
        username:   String,
        password:   String,
        firstName:  String,
        lastName:   String,
        email:      String,
        roles:      [String]
    });
    
    return Mongoose.connection.models[_name] || Mongoose.model(_name, _schema);
};

module.exports = Module();
