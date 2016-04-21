/**
 * Created by satyajeet on 16/12/15.
 */
// Load required packages
var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

var TicketAssignedLogSchema = new mongoose.Schema({
    ticket: {
        type: ObjectId,
        ref: 'Ticket',
        required: true
    },
    assignedTo: {
        type: ObjectId,
        ref:'User',
        require:true
    },
    assignedBy: {
        type: ObjectId,
        ref:'User',
        required:true
    },
    statusLog: {
        type: ObjectId,
        ref:'StatusLog',
        required:true
    },
    logIndex: {
        type: Number,
        required:true
    },
    assignedOn: {
        type: Date, default:Date.now
    }
}).index({ticket:1,logIndex:1},{unique:true});

module.exports = mongoose.model('TicketAssignedLog', TicketAssignedLogSchema);


