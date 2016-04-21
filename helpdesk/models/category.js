/**
 * Created by satyajeet on 12/12/15.
 */
// Load required packages
var mongoose = require('mongoose');

var CategorySchema = new mongoose.Schema({
    categoryId: {
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

module.exports = mongoose.model('Category', CategorySchema);