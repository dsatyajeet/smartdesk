var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var RoleSchema =new Schema({
    name: {
        type: String,
        unique: true
    },
    description: {
        type: String
    }
});

module.exports = mongoose.model('Role', RoleSchema);