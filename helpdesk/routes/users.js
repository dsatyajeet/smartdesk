var express = require('express');
var router = express.Router();
var userService = require('../service/userService');
var utilService = require('../service/utilService');
var oauth2 = require('../oauth/oauth2');
var async = require('async');

var User = require('../models/oauth/user');
var oauth2 = require('../oauth/oauth2');

/* GET users listing. */
/*router.get('/', function (req, res, next) {
 res.send('respond with a resource');
 });*/

router.get('/userx/:username', function (req, res, next) {
    userService.get(req.param('username'), utilService.generalSyncCallback, utilService.getContext(req, res));
});

router.get('/user/:userId', function (req, res, next) {
    console.log('userId>>>>>:'+req.param('userId'));
    userService.getById(req.param('userId'), utilService.generalSyncCallback, utilService.getContext(req, res));
});

/*My profile*/
router.get('/myProfile', function (req, res, next) {
    var context = utilService.getContext(req, res, null, null);
    var actionArray = [function setUser(syncCallback) {
        context.callback = syncCallback;
        userService.getUserByToken(req.header('Authorization').split(' ')[1], utilService.setUserSyncCallback, context);
    }, function profile(syncCallback) {
        res.json(context.thisUser);
        syncCallback(null);
    }];

    async.series(actionArray);


});

/*
 Returns all users.
 */
router.get('/list', function (req, res, next) {
    var context = utilService.getContext(req, res, null, null);
    var actionArray = [function setUser(syncCallback) {
        context.callback = syncCallback;
        userService.getUserByToken(req.header('Authorization').split(' ')[1], utilService.setUserSyncCallback, context);
    }, function validation(syncCallBack) {
        userService.validatUserByRoles2(context.thisUser._id, ['Admin', 'Customer'],
            utilService.generalSyncCallback, context);
    }, function profile(syncCallback) {
        userService.getAll(utilService.generalSyncCallback,context);
        syncCallback(null);
    }];
    async.series(actionArray);
});


/*
 Returns USER group members..
 */
router.get('/groupMembers', function (req, res, next) {
    var context = utilService.getContext(req, res, null, null);
    var actionArray = [function setUser(syncCallback) {
        context.callback = syncCallback;
        userService.getUserByToken(req.header('Authorization').split(' ')[1], utilService.setUserSyncCallback, context);
    }, function validation(syncCallBack) {
        userService.validatUserByRoles2(context.thisUser._id, ['Support'],
            utilService.generalSyncCallback, context);
    }, function fetch(syncCallback) {
        console.log('$$$');
        context.callback = syncCallback;
        userService.getGroupMembers(utilService.generalSyncCallback, context,context.thisUser.supportType);
    }];
    async.series(actionArray);
});


/* Add User. */
router.route('/add').post(oauth2.isLoggedIn, function (req, res, next) {
    console.log('in add API..');
    var actionArray = [
        function validation(syncCallBack) {
            var context = utilService.getContext(req, res, syncCallBack);
            console.log('context is: ' + context);
            userService.validatUserByRoles(req.header('Authorization').split(' ')[1], ['Admin', 'Customer'],
                utilService.generalSyncCallback, context);
        },
        function executeAPI(syncCallBack) {
            var roleArray = req.body.roles.split(',');
            var context = utilService.getContext(req, res, syncCallBack);
            console.log('.. add user lastname: ' + req.body.lastname + '    mobile:' + req.body.mobile);
            userService.add2( utilService.generalSyncCallback, context, req.body.username, req.body.password, req.body.email,
                req.body.firstname, req.body.lastname, req.body.mobile, roleArray,req.body.supportTypeId);
        }
    ];


    async.series(actionArray);
});


/* Register User. */
router.route('/register').post( function (req, res, next) {
    console.log('in add API..');
    var actionArray = [

        function executeAPI(syncCallBack) {
            var context = utilService.getContext(req, res, syncCallBack);
            userService.register( utilService.generalSyncCallback, context,  req.body.password, req.body.email,
                req.body.firstname, req.body.lastname, req.body.mobile, req.body.confirmPassword);
        }
    ];


    async.series(actionArray);
});


/* Add User. */
router.route('/update').post(oauth2.isLoggedIn, function (req, res, next) {
    console.log('in add API..');
    var actionArray = [
        function validation(syncCallBack) {
            var context = utilService.getContext(req, res, syncCallBack);
            console.log('context is: ' + context);
            userService.validatUserByRoles(req.header('Authorization').split(' ')[1], ['Admin', 'Customer'],
                utilService.generalSyncCallback, context);
        },
        function executeAPI(syncCallBack) {
            console.log('test advance..');
            var roleArray = req.body.roles.split(',');
            var context = utilService.getContext(req, res, syncCallBack);
            console.log('XXpath support type...'+req.body.supportTypeId);
            userService.update2(utilService.generalSyncCallback, context,req.body.userId, req.body.username, req.body.email,
                req.body.firstname, req.body.lastname, req.body.mobile, roleArray,req.body.supportTypeId);
        }
    ];


    async.series(actionArray);
});


router.route('/oauth/token')
    .post(oauth2.isAuthenticated, oauth2.token2);


module.exports = router;
