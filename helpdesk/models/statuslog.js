/**
 * Created by satyajeet on 15/12/15.
 */
// Load required packages
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

var StatusLogSchema = new mongoose.Schema({
    ticket: {
        type: ObjectId,
        ref: 'Ticket',
        required: true
    },
    status: {
        type: ObjectId,
        ref:'Status',
        require:true
    },
    changedBy: {
        type: ObjectId,
        ref:'User',
        required:true
    },
    logIndex: {
        type: Number,
        required:true
    },
    comment: {
        type: String
    },
    updatedOn: {
        type: Date, default:Date.now
    }
}).index({ticket:1,logIndex:1},{unique:true});

module.exports = mongoose.model('StatusLog', StatusLogSchema);

