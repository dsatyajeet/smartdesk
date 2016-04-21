/**
 * Created by satyajeet on 11/12/15.
 */
var mongoose = require('mongoose');
//mongoose.set('debug', true);
mongoose.connect('mongodb://localhost:27017/helpdesk');
var StatusLog =require('../models/statuslog');
var TicketService = require('../service/ticketService');
var LogService=require('../service/logService');
var async=require('async');

//add status log
function addStatusLog(ticketId) {
    var context = {errMessage: 'error in adding status log..', message: 'status log added successfully'};
    TicketService.addStausLog(testCallBack,context,ticketId);
}

function findMaxLog_local(callback,context,ticket){
    StatusLog.find({ticket:ticket}).sort({"logIndex":-1}).limit(1).exec(function(err,obj){
        if(err){
            console.error('Failed....');
            console.error(err);
        }
        else {
            console.log('yeah...');
            console.log(obj.length);
        }
    });
}

function addTicket(userId,typeId,subject,content) {
    var context = {errMessage: 'error in adding ticket..', message: 'Ticket added successfully'};
    var actionArray = [function addTestTicket(cb) {
        context.cb=cb;
        console.log('in add tkt');
        TicketService.addTicket( testCallBack,context, userId,typeId, subject, content);
    },function show(cb){
        cb(null);
    }];
    async.series(actionArray);
}

function getCategorisedTickets(id) {
    var context = {errMessage: 'error in findin ticket..', message: 'Ticket found successfully'};
    var actionArray = [function addTestTicket(cb) {
        context.cb=cb;
        console.log('in add tkt');
        TicketService.getCategorisedTickets( testCallBack,context, id);
    },function show(cb){
        cb(null);
    }];
    async.series(actionArray);
}



function assignTicket(ticketId,userId) {
    var context = {errMessage: 'error in assigning ticket..', message: 'Ticket assigned successfully'};
    var actionArray = [function addTestTicket(cb) {
        context.cb=cb;
        TicketService.assignedTo( testCallBack,context, ticketId,userId);
    },function show(cb){
        cb(null);
    }];
    async.series(actionArray);
}

function getTicketsAssignedTo(userId) {
    var context = {errMessage: 'error in finding assigned ticket..', message: 'Ticket list successfully'};
    var actionArray = [function addTestTicket(cb) {
        context.cb=cb;
        TicketService.getAssignedTicketsTo( testCallBack,context,userId);
    },function show(cb){

        cb(null);
    }];
    async.series(actionArray);
}

function getTicketByOwner(email) {
    var context = {errMessage: 'error in finding category ticket..', message: 'Ticket category list found successfully'};
    var actionArray = [function addTestTicket(cb) {
        context.cb=cb;
        TicketService.getTicketsByOwner( testCallBack,context,email);
    },function show(cb){

        cb(null);
    }];
    async.series(actionArray);
}

function getTicketByOwnerId(id) {
    var context = {errMessage: 'error in finding category ticket..', message: 'Ticket category list found successfully'};
    var actionArray = [function addTestTicket(cb) {
        context.cb=cb;
        TicketService.getTicketsByOwnerId( testCallBack,context,id);
    },function show(cb){

        cb(null);
    }];
    async.series(actionArray);
}

function updateTicket(ticketId,typeId) {
    var context = {errMessage: 'error in finding ticket..', message: 'Ticket updated successfully'};
    var actionArray = [function updateTestTicket(cb) {
        context.cb=cb;
        TicketService.updateTicket( testCallBack,context, ticketId,typeId, 'my subject', 'my content2');
    },function show(cb){
        cb(null);
    }];
    async.series(actionArray);
}

function findTicket(ticketId) {
    var context = {errMessage: 'error in finding ticket..', message: 'Ticket founded successfully'};
    var actionArray = [function findTestTicket(cb) {
        context.cb=cb;
        TicketService.getById( testCallBack,context, ticketId);
    },function show(cb){
        cb(null);
    }];
    async.series(actionArray);
}

function testCallBack(context, err, resObject) {
    console.log('in test callback..');
    if (err) {
        console.error('Error on adding ticket:' + err);
       if(context.cb)
        context.cb(err);
    }
    else {
        console.log(context.message+'  ticket is>>:'+resObject);
        context.resObj = resObject;
        if(context.cb)
        context.cb(null);
    }
}

//566b07ea7e11c4f4620ae483
//addTicket('566eb2b8f45de41114a71885',1,'Chair wheel got loosed','Getting noise..xx');
//updateTicket('566c2a52a913cd949088bf03',1);
//findTicket('566c2e027107c04591a65694');

//assignTicket('566c2e027107c04591a65694','566cf782164b2a39b7de6759');
//assignTicket('566d5dd7212e692ad4d0eaf6','566d1b5fe21bd0a6c1e318de');
//getTicketsAssignedTo('566d3c9c7635fe0cc2ed2b58');
//getCategorisedTickets(1);
//getTicketByOwner('nd@gmail.com');
//getTicketByOwnerId('566cf782164b2a39b7de6759');
//getTicketsAssignedTo('566d3c9c7635fe0cc2ed2b58');
//findTicket('566d73909e4ddd13db63e870');
//assignTicket('566d73909e4ddd13db63e870','566d3c9c7635fe0cc2ed2b58');

//addStatusLog('566d73909e4ddd13db63e870');

function changeTicketStatus(ticketId, actionUserId, mode, comment) {
    var context = {errMessage: 'error in changing status log..', message: 'status changed successfully'};
    //callback, context, ticketId, userId, mode, comment
    TicketService.changeTicketStatus(myCallBack, context, ticketId, actionUserId, mode, comment);

    function myCallBack(context, err, resObject) {
        console.log('in my callback..');
        if (err) {
            console.error('Error on changing ticket:' + err);
            if(context.cb)
                context.cb(err);
        }
        else {
            console.log(context.message);
           // console.log('>>ticket>'+resObject);
            console.log(' *** ticket status:>>:'+resObject.status.name+'('+resObject.status.statusId+')**');
            console.log('  assignedTo>>:'+resObject.assignedTo.email+'**** owner:>'+resObject.user.email);
            context.resObj = resObject;
            if(context.cb)
                context.cb(null);
        }
    }

}

function assign2() {
    var context = {errMessage: 'error in changing status log..', message: 'status changed successfully'};
    // ticketId,assignedToId, assignedById
    TicketService.assignedTo2(testCallBack, context, '567158dff9aef4265dd92fba','566cf782164b2a39b7de6759', '566eb2b8f45de41114a71885');
//    TicketService.changeTicketStatus(testCallBack, context, '567158dff9aef4265dd92fba', '566eb2b8f45de41114a71885', 1, 'Hello..')
}

function getLogs(){
    var context = {errMessage: 'error in getting status log..', message: 'status-log fetched successfully'};
    var actionArray=[function getTicketlogs(cb){
        context.cb=cb;
        LogService.getLogs(testCallBack,context,'567be4d89a875977a7a106bb');
    },function viewLogs(cb){
        var result=context.resObj;
        for(var i=0;i<result.length;i++){
            console.log('index obj: '+i+"  >> "+result[i].type+'  length:'+result[i].data.length);
        }
       // console.log('Result is: '+result);
        cb(null);
    }];
async.series(actionArray);
}

getLogs();
//ticket(software):567158dff9aef4265dd92fba
//vasu-owner:566eb2b8f45de41114a71885
//nishant-assignee:566cf782164b2a39b7de6759

//assign2();

//changeTicketStatus('567158dff9aef4265dd92fba', '566cf782164b2a39b7de6759', -1, 'not resolved..');