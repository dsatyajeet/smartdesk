/**
 * Created by satyajeet on 11/12/15.
 */
var User = require('../models/oauth/user');
var Role = require('../models/oauth/role');
var Ticket = require('../models/ticket');
var UserService = require('../service/userService');
var CategoryService = require('../service/categoryService');
var StatusService = require('../service/statusService');
var StatusLog = require('../models/statuslog');
var TicketAssignedLog = require('../models/ticketassignlog');
var async = require('async');

exports.addTicket = function (callback, context, userId, typeId, subject, content) {
    var ticketContext = {};
    ticketContext.parentCallback = callback;
    ticketContext.context = context;
    ticketContext.objectMap = [];
    var actionArray = [
        function findUser(cb) {
            ticketContext.cb = cb;
            ticketContext.keyName = 'ticket_owner';
            UserService.getById(userId, ticketServiceMapCallback, ticketContext);
        },
        function findStatus(cb) {
            ticketContext.cb = cb;
            ticketContext.keyName = 'ticket_status';
            StatusService.getById(ticketServiceMapCallback, ticketContext, -1);//Status should be 'Not initiated' for new ticket.
        },
        function findCategory(cb) {
            ticketContext.cb = cb;
            ticketContext.keyName = 'ticket_type';
            CategoryService.getById(ticketServiceMapCallback, ticketContext, typeId);
        },
        function addTicket(cb) {
            ticketContext.cb = cb;
            ticketContext.keyName = 'new_ticket';
            addUsersTicketWithStatusLogs_local(ticketServiceMapCallback, ticketContext,
                ticketContext.objectMap.ticket_owner,ticketContext.objectMap.ticket_type,subject, content  );

        },
        function returnFinalCallback(cb) {
            return ticketContext.parentCallback(ticketContext.context, null, ticketContext.objectMap.new_ticket);
        }];
    async.series(actionArray);
}

exports.updateTicket = function (callback, context, ticketId, typeId, subject, content) {
    var ticketContext = {};
    ticketContext.parentCallback = callback;
    ticketContext.context = context;
    ticketContext.objectMap = [];
    var actionArray = [
        function findCategory(cb) {
            ticketContext.cb = cb;
            ticketContext.keyName = 'ticket_type';
            CategoryService.getById(ticketServiceMapCallback, ticketContext, typeId);
        },
        function updateTicket(cb) {
            ticketContext.cb = cb;
            ticketContext.keyName = 'updated_ticket';
            updateUsersTicket_local(ticketServiceMapCallback, ticketContext, ticketId, ticketContext.objectMap.ticket_type, subject, content);
        },
        function returnFinalCallback(cb) {
            // cb(null);
            ticketContext.cb = cb;
            return ticketContext.parentCallback(ticketContext.context, null, ticketContext.objectMap.updated_ticket);
        }];
    async.series(actionArray);
}

exports.getAll = function (callback, context) {

    Ticket.find({}).populate('user').populate('type').populate('assignedTo').populate('status').exec(function (err, ticketList) {
        if (err) {
            return callback(context, err)
        }
        return callback(context, err, ticketList);
    });

}

exports.getById = function (callback, context, id) {
    getTicketById_local(callback, context, id);
};

exports.assignedTo = function (callback, context, ticketId, userId) {
    var ticketContext = {};
    ticketContext.parentCallback = callback;
    ticketContext.context = context;
    ticketContext.objectMap = [];
    var actionArray = [
        function findUser(cb) {
            ticketContext.cb = cb;
            ticketContext.keyName = 'assigned_to';
            console.log('finding user..');
            UserService.getById(userId, ticketServiceMapCallback, ticketContext);
        },
        function findCategory(cb) {
            ticketContext.cb = cb;
            var v;
            ticketContext.keyName = v;
            validateSupportTypesForUserRoles_local(ticketServiceMapCallback, ticketContext, ticketContext.objectMap.assigned_to.roles)
        },
        function assign(cb) {
            ticketContext.cb = cb;
            ticketContext.keyName = 'ticket';
            assignTicket_local(ticketServiceMapCallback, ticketContext, ticketId, ticketContext.objectMap.assigned_to);
        },
        function returnFinalCallback(cb) {
            return ticketContext.parentCallback(ticketContext.context, null, ticketContext.objectMap.ticket);
        }];
    async.series(actionArray);
}

exports.getAssignedTicketsTo = function (callback, context, userId) {
    var user = new User();
    user._id = userId;
    Ticket.find({'assignedTo': user}).populate('type').populate('status').populate('user').populate('assignedTo').exec(  function (err, list) {
        if (err) {
            return callback(context, err);
        }
        console.log('TKT assign list: ' + list.length);
        return callback(context, null, list);
    });
}
exports.getTicketsRaisedBy = function (callback, context, userId) {
    var user = new User();
    user._id = userId;
    Ticket.find({'user': user}).populate('type').populate('status').populate('user').populate('assignedTo').exec( function (err, list) {
        if (err) {
            return callback(context, err);
        }
        console.log('TKT raised list: ' + list.length);
        return callback(context, null, list);
    });
}
exports.getTicketsByOwner = function (callback, context, email) {
    Ticket.find({'user.email': email}, function (err, list) {
        if (err) {
            return callback(context, err);
        }
        console.log('TKT vy owner list: ' + list.length);
        return callback(context, null, list);
    });
}

exports.getTicketsByOwnerId = function (callback, context, id) {
    Ticket.find({'user._id': id}, function (err, list) {
        if (err) {
            return callback(context, err);
        }
        console.log('TKT vy owner list: ' + list.length);
        return callback(context, null, list);
    });
}

exports.getCategorisedTickets = function (callback, context, typeId) {
    var ticketContext = {};
    ticketContext.parentCallback = callback;
    ticketContext.context = context;
    ticketContext.objectMap = [];
    var actionArray = [
        function findCategory(cb) {
            ticketContext.cb = cb;
            ticketContext.keyName = 'ticket_type';
            CategoryService.getById(ticketServiceMapCallback, ticketContext, typeId);
        },
        function find(cb) {
            ticketContext.cb = cb;
            ticketContext.keyName = 'applicable_tickets';
            getCategoryTickets_local(ticketServiceMapCallback, ticketContext, ticketContext.objectMap.ticket_type);
        },
        function finalCallback(cb) {
            return ticketContext.parentCallback(ticketContext.context, null, ticketContext.objectMap.applicable_tickets);
        }];
    async.series(actionArray);
}


/*
 exports.getCategorisedTickets=function(callback,context,id){
 Ticket.find({'type.categoryId':id},function(err,list){
 if(err)
 {
 return callback(context,err);
 }
 console.log('TKT ctg list: '+list.length);
 return callback(context,null,list);
 });
 }


 */

function getCategoryTickets_local(callback, context, type) {
    Ticket.find({type: type}).populate('user').populate('type').populate('assignedTo').populate('status').exec(function (err, list) {
        if (err) return callback(context, err);
        console.log('cat tkt llist: ' + list.length);
        return callback(context, null, list);
    });
}

function addUsersTicket_local(callback, context, user, type, status, subject, content) {
    var ticket = new Ticket({
        user: user,
        type: type,
        status: status,
        subject: subject,
        content: content
    });
    ticket.save(function (err) {
        if (err) {
            return callback(context, err);
        }
        else {
            //console.log('ticket created..##' + ticket);
            return callback(context, null, ticket);
        }
    });
}

function addUsersTicketWithStatusLogs_local(callback, context, user, type, subject, content) {
    var ticketContext = {};
    ticketContext.parentCallback = callback;
    ticketContext.context = context;
    ticketContext.objectMap = [];
    var actionArray = [
        function findStatus(cb) {
            ticketContext.cb = cb;
            ticketContext.keyName = 'initial_status';
            StatusService.getById(ticketServiceMapCallback, ticketContext, -1);
        },
    function addTicket(cb){
        ticketContext.cb = cb;
        ticketContext.keyName = 'new_ticket';
        var ticket = new Ticket({
            user: user,
            type: type,
            status: ticketContext.objectMap.initial_status,
            subject: subject,
            content: content
        });
        ticket.save(function (err) {
            if (err) {
                return ticketServiceMapCallback(ticketContext, err);
            }
            else {
                return ticketServiceMapCallback(ticketContext, null, ticket);
            }
        });
    },
    function addLog(cb){
        ticketContext.cb = cb;
        ticketContext.keyName = 'new_status_log';
        addStatusLog_local(ticketServiceMapCallback, ticketContext, ticketContext.objectMap.new_ticket,
            ticketContext.objectMap.new_ticket.user, 'Auto comment: Initiated by helpdesk');
    },
        function returnFinalCallback(cb) {
            var new_ticket_and_log = {};
            new_ticket_and_log.ticket = ticketContext.objectMap.new_ticket;
            new_ticket_and_log.status_log = ticketContext.objectMap.new_status_log;
            return ticketContext.parentCallback(ticketContext.context, null, ticketContext.objectMap.new_ticket);
        }];
    async.series(actionArray);
}

function updateUsersTicket_local(callback, context, id, type, subject, content) {
    console.log('ticket find update: ' + type);
    Ticket.findByIdAndUpdate(id,
        {subject: subject, type: type, content: content, updateDate: new Date()},
        function (err) {
            if (err) {
                return callback(context, err);
            }

            Ticket.findById(id).populate('user').populate('type').populate('assignedTo').populate('status').exec(function (err, updatedTicket) {
                if (err) {
                    return callback(context, err);
                }
                console.log('updated ticket##: ' + updatedTicket);
                return callback(context, null, updatedTicket);
            });
        });
}

function ticketServiceCallback(ticketContext, err, resObj) {
    if (err) {
        ticketContext.cb(err);
        return ticketContext.parentCallback(ticketContext.context, err, null);
    }
    ticketContext.resObj = resObj;
    ticketContext.cb(null);
    //return ticketContext.parentCallback(ticketContext.context,null,ticketContext.resObj);
}

function ticketServiceMapCallback(ticketContext, err, resObj) {
    if (err) {
        ticketContext.cb(err);
        return ticketContext.parentCallback(ticketContext.context, err, null);
    }
    console.log('key name:' + ticketContext.keyName);
    ticketContext.objectMap[ticketContext.keyName] = resObj;

    ticketContext.cb(null);
    //return ticketContext.parentCallback(ticketContext.context,null,ticketContext.resObj);
}

function validateSupportTypesForUserRoles_local(callback, context, roles) {
    console.log('valid roles##' + roles);
    if (roles) {
        for (var i = 0; i < roles.length; i++) {
            if (roles[i].name == 'Support')
                return callback(context, null, null);
        }
    }
    return callback(context, new Error('Roles not supported to assign support category.'));
}

function assignTicket_local(callback, context, id, user) {
    Ticket.findByIdAndUpdate(id,
        {assignedTo: user},
        function (err, found) {
            console.log('assign tkt found: ' + found);
            if (!found) {
                return callback(context, new Error('Ticket not found.'));
            }
            if (err) {
                return callback(context, err);
            }

            Ticket.findById(id).populate('user').populate('type').populate('assignedTo').populate('status').exec(function (err, updatedTicket) {
                if (err) {
                    return callback(context, err);
                }
                console.log('updated ticket##: ' + updatedTicket);
                return callback(context, null, updatedTicket);
            });
        });
}
//addTicketAssignLog_local
/*
function assignTicketWithStatusLog_local(callback, context, id, user) {
    var ticketContext = {};
    ticketContext.parentCallback = callback;
    ticketContext.context = context;
    ticketContext.objectMap = [];
    var actionArray = [ function assign(cb){

        Ticket.findByIdAndUpdate(id,
            {assignedTo: user},
            function (err, found) {
                console.log('assign tkt found: ' + found);
                if (!found) {
                    return callback(context, new Error('Ticket not found.'));
                }
                if (err) {
                    return callback(context, err);
                }

                Ticket.findById(id).populate('user').populate('type').populate('assignedTo').populate('status').exec(function (err, updatedTicket) {
                    if (err) {
                        return callback(context, err);
                    }
                    console.log('updated ticket##: ' + updatedTicket);
                    return callback(context, null, updatedTicket);
                });
            });
    },
    function (cb){
        var ticketContext = {};
        ticketContext.parentCallback = callback;
        ticketContext.context = context;
        ticketContext.objectMap = [];

    }
    ]

}
*/
function getTicketById_local(callback, context, id) {
    Ticket.findById(id).populate('user').populate('type').populate('assignedTo').populate('status').exec(function (err, found) {
        if (err) {
            return callback(context, err);
        }
        else {
            if (!found) {

                return callback(context, new Error('Ticket not found'));
            }
            return callback(context, null, found);
        }
    });
}


exports.changeTicketStatus = function (callback, context, ticketId,fromStatusId, userId, mode, comment) {
    var ticketContext = {};
    ticketContext.parentCallback = callback;
    ticketContext.context = context;
    ticketContext.objectMap = [];
    var actionArray = [
        function findTicket(cb) {
            ticketContext.cb = cb;
            ticketContext.keyName = 'ticket';
            getTicketById_local(ticketServiceMapCallback, ticketContext, ticketId);
        },
        function validateForNextStatus(cb) {
            ticketContext.cb = cb;
            ticketContext.keyName = 'next_statusId';
            validateForNextStatus_local(ticketServiceMapCallback, ticketContext, ticketContext.objectMap.ticket,fromStatusId, userId, mode);
        },
        function findUser(cb) {
            ticketContext.cb = cb;
            ticketContext.keyName = 'action_user';
            UserService.getById(userId, ticketServiceMapCallback, ticketContext);
        },
        function changeTicketStatus(cb) {
            ticketContext.cb = cb;
            ticketContext.keyName = 'ticket_plus_status_log';
            changeTicketStatus_local(ticketServiceMapCallback, ticketContext, ticketId,
                ticketContext.objectMap.action_user, ticketContext.objectMap.next_statusId, comment);
        },
        function returnFinalCallback(cb) {
            return ticketContext.parentCallback(ticketContext.context, null, ticketContext.objectMap.ticket_plus_status_log);
        }];
    async.series(actionArray);
}

/*text#
 function addStatusLog_local(callback, context, ticket) {
 var statusLog = new StatusLog();
 statusLog.changedBy = ticket.user;
 statusLog.ticket = ticket;
 statusLog.status = ticket.status;
 statusLog.logIndex = 2;
 statusLog.save(function (err) {
 if (err) {
 return callback(context, err);
 }
 return callback(context, null, statusLog);
 });
 }*/




function validateForNextStatus_local(callback, context, ticket,fromStatusId, userId, mode) {
    /**
     *-1 not initiate
     * 0 start
     * 1 in-progress
     * 2 complete
     * 3 verified
     * 4 close
     * @type {*|StatusSchema.statusId|{type, unique, require}}
     */
    var currentStatusId = ticket.status.statusId;
    if(fromStatusId!=currentStatusId){
        return callback(context, new Error('status affected by another request.'));
    }
    var backStatusId = (currentStatusId - 1);
    var forwardStatusId = (currentStatusId + 1);
    if (ticket.assignedTo && ticket.assignedTo._id && ticket.assignedTo._id.equals(userId)) {
        //assigned-to user going to change ticket-status
        var intermediateState = (currentStatusId > -1 && currentStatusId < 2);
        var borderState = ((currentStatusId == -1 && mode > 0) )//|| (currentStatusId == 2 && mode < 0)
        var closeState = (currentStatusId == 3 && mode > 0);//assignee would only close the ticket.
        if ((intermediateState || closeState || borderState)) {
            if (mode > 0) {
                return callback(context, null, forwardStatusId);
            }
            return callback(context, null, backStatusId);
        }
        else {
            return callback(context, new Error('Invalid current status:(' + currentStatusId + ')' + '  to change ticket-status by assignee.'));
        }
    }
    else {
        if (ticket.user._id.equals(userId)) {//ticket owner going to change the status
            var toVerifyState = (currentStatusId == 2);
            if (toVerifyState) {
                if (mode > 0) {
                    return callback(context, null, forwardStatusId);
                }
                return callback(context, null, backStatusId);
            }
            return callback(context, new Error('Invalid current status:(' + currentStatusId + ')' + '  to change ticket-status by ticket owner.'));
        }
        else {
            return callback(context, new Error('Ticket status could not changed by other user.'));
        }
    }

}

function changeTicketStatus_local(callback, context, ticketId, user, nextStatusId, comment) {
    var ticketContext = {};
    ticketContext.parentCallback = callback;
    ticketContext.context = context;
    ticketContext.objectMap = [];
    var actionArray = [
        function findStatus(cb) {
            ticketContext.cb = cb;
            ticketContext.keyName = 'next_status';
            StatusService.getById(ticketServiceMapCallback, ticketContext, nextStatusId);
        },
        function setStatus(cb) {
            ticketContext.cb = cb;
            ticketContext.keyName = 'changed_status_ticket';
            Ticket.findByIdAndUpdate(ticketId, {status: ticketContext.objectMap.next_status}, function (err) {
                if (err) {
                    console.log('Change status: error on updating ');
                    return ticketServiceMapCallback(ticketContext, err);
                }
                else {
                    Ticket.findById(ticketId).populate('status').populate('assignedTo').populate('user').exec(function (err, updatedTicket) {
                        if (err) {
                            console.log('Change status: error on finding updated ticket ');
                            return ticketServiceMapCallback(ticketContext, err);
                        }
                        else {
                            return ticketServiceMapCallback(ticketContext, null, updatedTicket);
                        }

                    })
                }
            });
        },
        function addLogs(cb) {
            ticketContext.cb = cb;
            ticketContext.keyName = 'status_log';
            addStatusLog_local(ticketServiceMapCallback, ticketContext, ticketContext.objectMap.changed_status_ticket, user, comment);
        },
        function returnFinalCallback(cb) {
            var ticket_and_log = {};
            ticket_and_log.changedStatusTicket = ticketContext.objectMap.changed_status_ticket;
            ticket_and_log.status_log = ticketContext.objectMap.status_log;
            console.log('dd###############');
            return ticketContext.parentCallback(ticketContext.context, null, ticketContext.objectMap.changed_status_ticket);
        }];
    async.series(actionArray);
}


function assignTicketWithStatus_local(callback, context, ticketId, assignedToUser, assignedByUser) {
    var ticketContext = {};
    ticketContext.parentCallback = callback;
    ticketContext.context = context;
    ticketContext.objectMap = [];
    var actionArray = [
        function assign(cb) {
            ticketContext.cb = cb;
            ticketContext.keyName = 'assigned_ticket';
            Ticket.findByIdAndUpdate(ticketId, {assignedTo: assignedToUser}, function (err) {
                if (err) {
                    console.log('Assign ticket: error on assigning');
                    return ticketServiceMapCallback(ticketContext, err);
                }
                else {
                    Ticket.findById(ticketId, function (err, updatedTicket) {
                        if (err) {
                            console.log('Assign status: error on finding assigned ticket ');
                            return ticketServiceMapCallback(ticketContext, err);
                        }
                        else {
                            return ticketServiceMapCallback(ticketContext, null, updatedTicket);
                        }

                    })
                }
            });
        },
        function addLogs(cb) {
            ticketContext.cb = cb;
            ticketContext.keyName = 'assigned_log';
            addTicketAssignLog_local(ticketServiceMapCallback, ticketContext,
                ticketContext.objectMap.assigned_ticket, assignedToUser, assignedByUser);
        },
        function returnFinalCallback(cb) {
            var ticket_and_log = {};
            ticket_and_log.assignedTicket = ticketContext.objectMap.assigned_ticket;
            ticket_and_log.assignedLog = ticketContext.objectMap.assigned_log;
            return ticketContext.parentCallback(ticketContext.context, null, ticket_and_log);
        }];
    async.series(actionArray);
}


function addTicketStatusLog_local(callback, context, ticket, user, comment) {
    var ticketContext = {};
    ticketContext.parentCallback = callback;
    ticketContext.context = context;
    ticketContext.objectMap = [];
    var actionArray = [
        function findStatusLog(cb) {
            ticketContext.cb = cb;
            ticketContext.keyName = 'prv_ticket_status_log';
            findMaxTicketStatusLog_local(ticketServiceMapCallback, ticketContext, ticket);
        },
        function addLog(cb) {
            ticketContext.cb = cb;
            ticketContext.keyName = 'status_log';
            var statusLog = new StatusLog();
            if(ticketContext.objectMap.prv_ticket_status_log.length<1){
                statusLog.logIndex=1;
            }
            else{
                statusLog.logIndex = (ticketContext.objectMap.prv_ticket_status_log.logIndex+1);
            }

            statusLog.ticket = ticket;
            statusLog.changedBy = user;
            statusLog.comment = comment;
            statusLog.save(function (err) {
                if (err) {
                    console.log('Statuslog: error on adding' + err);
                    return ticketServiceMapCallback(ticketContext, err);
                }
                return ticketServiceMapCallback(ticketContext, null, statusLog);
            });

        },
        function returnFinalCallback(cb) {
            return ticketContext.parentCallback(ticketContext.context, null, ticketContext.objectMap.status_log);
        }];
    async.series(actionArray);
}


function addStatusLog_local(callback, context, ticket, changedByUser, comment) {
    var ticketContext = {};
    ticketContext.parentCallback = callback;
    ticketContext.context = context;
    ticketContext.objectMap = [];
    var actionArray = [
        function findStatusLog(cb) {
            ticketContext.cb = cb;
            ticketContext.keyName = 'prv_ticket_status_log';
            findMaxTicketStatusLog_local(ticketServiceMapCallback, ticketContext, ticket);
        },
        function addLog(cb) {
            ticketContext.cb = cb;
            ticketContext.keyName = 'status_log';
            var statusLog = new StatusLog();
            if(ticketContext.objectMap.prv_ticket_status_log.length<1){
                statusLog.logIndex=1;
            }
            else{
                statusLog.logIndex = (ticketContext.objectMap.prv_ticket_status_log[0].logIndex+1);
            }

            statusLog.ticket = ticket;
            statusLog.status = ticket.status;
            statusLog.changedBy = changedByUser;
            statusLog.comment = comment;
            statusLog.save(function (err) {
                if (err) {
                    console.log('Statuslog: error on adding' + err);
                    return ticketServiceMapCallback(ticketContext, err);
                }
                return ticketServiceMapCallback(ticketContext, null, statusLog);
            });

        },
        function returnFinalCallback(cb) {
            return ticketContext.parentCallback(ticketContext.context, null, ticketContext.objectMap.status_log);
        }];
    async.series(actionArray);
}


function addTicketAssignLog_local(callback, context, ticket, assignedToUser, assignedByUser) {
    var ticketContext = {};
    ticketContext.parentCallback = callback;
    ticketContext.context = context;
    ticketContext.objectMap = [];
    var actionArray = [
        function findMaxStatusLog(cb) {
            ticketContext.cb = cb;
            ticketContext.keyName = 'max_status_log';
            findMaxTicketStatusLog_local(ticketServiceMapCallback, ticketContext, ticket);
        },
        function findMaxTicketAssignLog(cb) {
            ticketContext.cb = cb;
            ticketContext.keyName = 'max_assign_log';
            findMaxTicketAssignedLog_local(ticketServiceMapCallback, ticketContext, ticket);
        },
        function addLog(cb) {
            ticketContext.cb = cb;
            ticketContext.keyName = 'assign_log';
            var assignLog = new TicketAssignedLog();
            if(ticketContext.objectMap.max_assign_log.length<1){
                assignLog.logIndex=1;
            }
            else{
                assignLog.logIndex = (ticketContext.objectMap.max_assign_log[0].logIndex+1);
            }

            assignLog.ticket = ticket;
            assignLog.assignedTo = assignedToUser;
            assignLog.assignedBy = assignedByUser;
            assignLog.statusLog=ticketContext.objectMap.max_status_log[0];
            assignLog.save(function (err) {
                if (err) {
                    console.log('Ticket assign log: error on adding' + err);
                    return ticketServiceMapCallback(ticketContext, err);
                }
                return ticketServiceMapCallback(ticketContext, null, assignLog);
            });

        },
        function returnFinalCallback(cb) {
            return ticketContext.parentCallback(ticketContext.context, null, ticketContext.objectMap.assign_log);
        }];
    async.series(actionArray);
}


function findMaxTicketStatusLog_local(callback, context, ticket) {
    console.log('Max tkt find: '+ticket);
    StatusLog.find({ticket: ticket}).sort({"logIndex": -1}).limit(1).exec(function (err, obj) {
        if (err) {
            return callback(context, err);
        }
        else {

                return callback(context, null,obj);

        }
    });
}


function findMaxTicketAssignedLog_local(callback, context, ticket) {
    console.log('Max tkt find: '+ticket);
    TicketAssignedLog.find({ticket: ticket}).sort({"logIndex": -1}).limit(1).exec(function (err, obj) {
        if (err) {
            return callback(context, err);
        }
        return callback(context, null, obj);
    });
}




///////////////////////////

exports.assignedTo2 = function (callback, context, ticketId,assignedToId, assignedById) {
    var ticketContext = {};
    ticketContext.parentCallback = callback;
    ticketContext.context = context;
    ticketContext.objectMap = [];
    var actionArray = [
        function findTicket(cb) {
            ticketContext.cb = cb;
            ticketContext.keyName = 'ticket';
            getTicketById_local(ticketServiceMapCallback, ticketContext, ticketId);
        },
        function findAssignedToUser(cb) {
            ticketContext.cb = cb;
            ticketContext.keyName = 'assigned_to';
            console.log('finding user..');
            UserService.getById(assignedToId, ticketServiceMapCallback, ticketContext);
        },
        function validateAssignedToUser(cb) {
            ticketContext.cb = cb;
            var v;
            ticketContext.keyName = v;
            var prvAssignedToId=v;
            if(ticketContext.objectMap.ticket.assignedTo){
                prvAssignedToId=ticketContext.objectMap.ticket.assignedTo._id;
                console.log('####PRVASSIGN: '+prvAssignedToId+'    ###CURRENT:'+ticketContext.objectMap.assigned_to._id);

                console.log('RSH'+(prvAssignedToId===ticketContext.objectMap.assigned_to._id));
            }
            validateAssignedToSupportUserByRoleAndCategory_local(ticketServiceMapCallback, ticketContext,
                ticketContext.objectMap.assigned_to,prvAssignedToId,ticketContext.objectMap.ticket.type.name);
        },
        function findAssignedByUser(cb) {
            ticketContext.cb = cb;
            ticketContext.keyName = 'assigned_by';
            console.log('finding user..');
            UserService.getById(assignedById, ticketServiceMapCallback, ticketContext);
        },
        function validateAssignedByUser(cb) {
            ticketContext.cb = cb;
            var v;
            ticketContext.keyName = v;
            validateAssignedByUser_local(ticketServiceMapCallback, ticketContext,
                ticketContext.objectMap.assigned_by,ticketContext.objectMap.ticket.type.name);
        },
        function assign(cb) {
            ticketContext.cb = cb;
            ticketContext.keyName = 'assigned_ticket_plus_log';
            assignTicketWithStatus_local(ticketServiceMapCallback, ticketContext, ticketId,
                ticketContext.objectMap.assigned_to, ticketContext.objectMap.assigned_by);
        },
        function returnFinalCallback(cb) {
            return ticketContext.parentCallback(ticketContext.context, null, ticketContext.objectMap.assigned_ticket_plus_log);
        }];
    async.series(actionArray);
}


function validateAssignedToSupportUserByRoleAndCategory_local(callback, context, assignedToUser,prvAssignedToId,categoryName) {
    if(assignedToUser._id.equals(prvAssignedToId)){
        return callback(context,new Error('Ticket is already assigned to same user.'));
    }
    var roles=assignedToUser.roles;
    console.log('valid roles##' + roles);
    if (roles) {
        for (var i = 0; i < roles.length; i++) {
            if (roles[i].name == 'Support'){
                if(assignedToUser.supportType.name==categoryName){
                    return callback(context, null, null);
                }
                console.log('category name: '+categoryName+'b4 category.. user.supportType:'+assignedToUser.supportType);
                return callback(context, new Error('Category not supported to assign this ticket. Require('+categoryName+") found ("+assignedToUser.supportType.name+")"));
            }
                //return callback(context, null, null);
        }
    }
    return callback(context, new Error('User role not supported to assign this ticket.'));
}

function validateAssignedByUser_local(callback, context,assignedByUser,categoryName) {
var roles=assignedByUser.roles;
    console.log('valid roles##' + roles);
    if (roles) {
        for (var i = 0; i < roles.length; i++) {

            if (roles[i].name == 'Admin'){
                return callback(context, null, null);
            }

            if (roles[i].name == 'Support'){

                if(assignedByUser.supportType.name==categoryName){
                    return callback(context, null, null);
                }
                return callback(context, new Error('Category of assigned by user not supported to perform this action.'));
            }

//                return callback(context, null, null);
        }
    }
    return callback(context, new Error('Role of assigned by user not supported to perform this action.'));
}







