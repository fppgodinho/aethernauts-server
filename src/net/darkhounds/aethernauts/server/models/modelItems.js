var Mongoose                = require("mongoose");

var Module = function () {
    var _name       = "Items";
    var _schema     = new Mongoose.Schema({
        name:       String,
        flags:      { type: Array, "default": ["Item"] },
        material:   Mongoose.Schema.Types.ObjectId,
        size:       Number,
        weight:     Number
    });
    
    return Mongoose.connection.models[_name] || Mongoose.model(_name, _schema);
};

module.exports = Module();
