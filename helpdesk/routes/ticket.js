/**
 * Created by satyajeet on 11/12/15.
 */
var Ticket = require('../models/ticket');
var express = require('express');
var router = express.Router();
var oauth2 = require('../oauth/oauth2');
var userService = require('../service/userService');
var ticketService = require('../service/ticketService');
var statusService=require('../service/statusService');
var utilService = require('../service/utilService');
var logService=require('../service/logService');

var async = require('async');


/* Get All Tickets. */
router.route('/list').get(oauth2.isLoggedIn, function (req, res, next) {
    console.log('in add API..');
    var context = utilService.getContext(req, res, null, null);
    var actionArray = [function setUser(syncCallback) {
        context.callback = syncCallback;
        userService.getUserByToken(req.header('Authorization').split(' ')[1], utilService.setUserSyncCallback, context);
    }, function validation(syncCallback) {
        context.callback = syncCallback;
        userService.validatUserByRoles2(context.thisUser._id, ['Admin', 'Customer'],
            utilService.generalSyncCallback, context);
    }, function getAllTickets(syncCallback) {
        context.callback = syncCallback;
        ticketService.getAll(utilService.generalSyncCallback, context);
    }];

    async.series(actionArray);
});

/* Add Ticket. */
router.route('/add').post(oauth2.isLoggedIn, function (req, res, next) {
    console.log('in add API..');
    var context = utilService.getContext(req, res, null, null);
    var actionArray = [
        function setUser(syncCallback) {
            context.callback = syncCallback;
            userService.getUserByToken(req.header('Authorization').split(' ')[1], utilService.setUserSyncCallback, context);
        }, function validation(syncCallback) {
            context.callback = syncCallback;
            console.log('ticket userid: '+context.thisUser._id);
            userService.validatUserByRoles2(context.thisUser._id, ['Admin', 'Customer'],
                utilService.generalSyncCallback, context);
        }, function addTicket(syncCallback) {
            context.callback = syncCallback;
            ticketService.addTicket(utilService.generalSyncCallback, context,context.thisUser._id, req.body.typeId, req.body.subject,req.body.content);
        }];

    async.series(actionArray);
});


/* Update Ticket. */
router.route('/update').post(oauth2.isLoggedIn, function (req, res, next) {
    console.log('in add API..');
    var context = utilService.getContext(req, res, null, null);
    var actionArray = [
        function setUser(syncCallback) {
            context.callback = syncCallback;
            userService.getUserByToken(req.header('Authorization').split(' ')[1], utilService.setUserSyncCallback, context);
        }, function validation(syncCallback) {
            context.callback = syncCallback;
            console.log('ticket userid: '+context.thisUser._id);
            userService.validatUserByRoles2(context.thisUser._id, ['Admin', 'Customer'],
                utilService.generalSyncCallback, context);
        }, function updateTicket(syncCallback) {
            context.callback = syncCallback;
            ticketService.updateTicket(utilService.generalSyncCallback, context, req.body.ticketId,req.body.typeId, req.body.subject,req.body.content);
        }];

    async.series(actionArray);
});

/**
 * Assign Me.
 */
router.route('/assignMe').put(oauth2.isLoggedIn, function (req, res, next) {
    var context = utilService.getContext(req, res, null, null);
    var actionArray = [
        function setUser(syncCallback) {
            context.callback = syncCallback;
            userService.getUserByToken(req.header('Authorization').split(' ')[1], utilService.setUserSyncCallback, context);
        }, function validation(syncCallback) {
            context.callback = syncCallback;
            console.log('ticket userid: '+context.thisUser._id);
            userService.validatUserByRoles2(context.thisUser._id, ['Customer'],
                utilService.generalSyncCallback, context);
        }, function Ticket(syncCallback) {
            context.callback = syncCallback;
            ticketService.assignedTo(utilService.generalSyncCallback, context, req.body.ticketId, context.thisUser._id);
        }];

    async.series(actionArray);
});



/**
 * Assign Ticket.
 */
router.route('/assign').put(oauth2.isLoggedIn, function (req, res, next) {
    var context = utilService.getContext(req, res, null, null);
    var actionArray = [
        function setUser(syncCallback) {
            context.callback = syncCallback;
            userService.getUserByToken(req.header('Authorization').split(' ')[1], utilService.setUserSyncCallback, context);
        }, function validation(syncCallback) {
            context.callback = syncCallback;
            console.log('ticket userid: '+context.thisUser._id);
            userService.validatUserByRoles2(context.thisUser._id, ['Admin','Support'],
                utilService.generalSyncCallback, context);
        }, function ticketAPI(syncCallback) {
            context.callback = syncCallback;
            ticketService.assignedTo2(utilService.generalSyncCallback, context,
                req.body.ticketId, req.body.assignedToId, context.thisUser._id);
        }];

    async.series(actionArray);
});


/**
 * Change status.
 */
router.route('/changeStatus').put(oauth2.isLoggedIn, function (req, res, next) {
    var context = utilService.getContext(req, res, null, null);
    var actionArray = [
        function setUser(syncCallback) {
            context.callback = syncCallback;
            userService.getUserByToken(req.header('Authorization').split(' ')[1], utilService.setUserSyncCallback, context);
        }, function validation(syncCallback) {
            context.callback = syncCallback;
            console.log('ticket userid: '+context.thisUser._id);
            userService.validatUserByRoles2(context.thisUser._id, ['Admin','Support','Customer'],
                utilService.generalSyncCallback, context);
        }, function ticketAPI(syncCallback) {
            context.callback = syncCallback;
            ticketService.changeTicketStatus(utilService.generalSyncCallback, context,
                req.body.ticketId, req.body.fromStatusId, context.thisUser._id,req.body.mode,req.body.comment);
        }];

    async.series(actionArray);
});

/*
 Returns ticket group members..
 */
router.get('/groupMembers/:categoryId', function (req, res, next) {
    var context = utilService.getContext(req, res, null, null);
    var actionArray = [function setUser(syncCallback) {
        context.callback = syncCallback;
        userService.getUserByToken(req.header('Authorization').split(' ')[1], utilService.setUserSyncCallback, context);
    }, function validation(syncCallBack) {
        userService.validatUserByRoles2(context.thisUser._id, ['Support','Customer','Admin'],
            utilService.generalSyncCallback, context);
    }, function fetch(syncCallback) {
        console.log('$$$');
        context.callback = syncCallback;
        userService.getUsersByCategoryId(utilService.generalSyncCallback, context,req.param('categoryId'));
    }];
    async.series(actionArray);
});




router.route('/:ticketId').get(oauth2.isLoggedIn, function (req, res, next) {
    console.log('in view ticket..');
    ticketService.getById(utilService.generalSyncCallback, utilService.getContext(req, res),req.param('ticketId'));
});

router.route('/list/my').get(oauth2.isLoggedIn, function (req, res, next) {
    var context = utilService.getContext(req, res, null, null);
    var actionArray = [
        function setUser(syncCallback) {
            context.callback = syncCallback;
            userService.getUserByToken(req.header('Authorization').split(' ')[1], utilService.setUserSyncCallback, context);
        }, function validation(syncCallback) {
            context.callback = syncCallback;
            console.log('ticket userid: '+context.thisUser._id);
            userService.validatUserByRoles2(context.thisUser._id, ['Support'],
                utilService.generalSyncCallback, context);
        }, function getAssignedTickets(syncCallback) {
            context.callback = syncCallback;
            ticketService.getAssignedTicketsTo(utilService.generalSyncCallback, context, context.thisUser._id);
        }];

    async.series(actionArray);
});

router.route('/list/myRaised').get(oauth2.isLoggedIn, function (req, res, next) {
    var context = utilService.getContext(req, res, null, null);
    var actionArray = [
        function setUser(syncCallback) {
            context.callback = syncCallback;
            userService.getUserByToken(req.header('Authorization').split(' ')[1], utilService.setUserSyncCallback, context);
        }, function validation(syncCallback) {
            context.callback = syncCallback;
            console.log('ticket userid: '+context.thisUser._id);
            userService.validatUserByRoles2(context.thisUser._id, ['Customer'],
                utilService.generalSyncCallback, context);
        }, function getRaisedTickets(syncCallback) {
            context.callback = syncCallback;
            ticketService.getTicketsRaisedBy(utilService.generalSyncCallback, context, context.thisUser._id);
        }];

    async.series(actionArray);
});


router.route('/status/all').get(oauth2.isLoggedIn, function (req, res, next) {
    var context = utilService.getContext(req, res, null, null);
    var actionArray = [
        function setUser(syncCallback) {
            context.callback = syncCallback;
            userService.getUserByToken(req.header('Authorization').split(' ')[1], utilService.setUserSyncCallback, context);
        }, function validation(syncCallback) {
            context.callback = syncCallback;
            console.log('ticket userid: '+context.thisUser._id);
            userService.validatUserByRoles2(context.thisUser._id, ['Customer','Admin','Support'],
                utilService.generalSyncCallback, context);
        }, function getSortedList(syncCallback) {
            context.callback = syncCallback;
            statusService.sortedAll(utilService.generalSyncCallback, context);
        }];

    async.series(actionArray);
});


router.route('/list/applicable').get(oauth2.isLoggedIn, function (req, res, next) {
    var context = utilService.getContext(req, res, null, null);
    var actionArray = [
        function setUser(syncCallback) {
            context.callback = syncCallback;
            userService.getUserByToken(req.header('Authorization').split(' ')[1], utilService.setUserSyncCallback, context);
        }, function validation(syncCallback) {
            context.callback = syncCallback;
            console.log('ticket userid: '+context.thisUser._id);
            userService.validatUserByRoles2(context.thisUser._id, ['Support'],
                utilService.generalSyncCallback, context);
        }, function getAssignedTickets(syncCallback) {
            context.callback = syncCallback;
            ticketService.getCategorisedTickets(utilService.generalSyncCallback, context, context.thisUser.supportType.categoryId);
        }];

    async.series(actionArray);
});



router.route('/logs/:ticketId').get(oauth2.isLoggedIn, function (req, res, next) {
    var context = utilService.getContext(req, res, null, null);
    var actionArray = [
        function setUser(syncCallback) {
            context.callback = syncCallback;
            userService.getUserByToken(req.header('Authorization').split(' ')[1], utilService.setUserSyncCallback, context);
        }, function validation(syncCallback) {
            context.callback = syncCallback;
            console.log('ticket userid: '+context.thisUser._id);
            userService.validatUserByRoles2(context.thisUser._id, ['Admin','Customer','Support'],
                utilService.generalSyncCallback, context);
        }, function getLogs(syncCallback) {
            context.callback = syncCallback;
            logService.getLogs(utilService.generalSyncCallback, context, req.param('ticketId'));
        }];

    async.series(actionArray);
});



module.exports = router;