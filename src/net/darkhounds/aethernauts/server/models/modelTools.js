var util                    = require('util');
var mongoose                = require('mongoose');
var itemModel               = require('./modelItems.js');
var Schema                  = mongoose.Schema;
module.exports              = {};
module.exports.schema       = function(){
    itemModel.schema.apply(this, arguments);
    this.add({
        
    });
    
    var _superInitialize    = this.methods.initialize;
    this.methods.initialize = function ()                                       {
        _superInitialize.apply(this);
        this.addFlag("Tool");
    }
};
util.inherits(module.exports.schema, itemModel.schema);

module.exports.instance                     = mongoose.model("Tools", new module.exports.schema());
