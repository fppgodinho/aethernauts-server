var Mongoose                = require("mongoose");

var Module = function () {
    var _name       = "Worlds";
    var _schema     = new Mongoose.Schema({
        name:   String
    });

    return Mongoose.connection.models[_name] || Mongoose.model(_name, _schema);
};

module.exports = Module();