/**
 * Created by satyajeet on 12/12/15.
 */
// Load required packages
var mongoose = require('mongoose');

var StatusSchema = new mongoose.Schema({
    statusId: {
        type: Number,
        unique:true,
        require:true
    },
    name: {
        type: String,
        unique: true,
        required: true
    },
    description: {
        type: String
    }
});

module.exports = mongoose.model('Status', StatusSchema);
