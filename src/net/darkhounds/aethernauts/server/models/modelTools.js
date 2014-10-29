var Mongoose                = require("mongoose");
var ModelItems              = require('./modelItems.js');

var Module = function () {
    var _name       = "Tools";
    var _schema     = new Mongoose.Schema({
        name:       String,
        flags:      { type: Array, "default": ["Item", "Tool"] },
        material:   Mongoose.Schema.Types.ObjectId,
        size:       Number,
        weight:     Number
    });

    return Mongoose.connection.models[_name] || Mongoose.model(_name, _schema);
};

module.exports = Module();
