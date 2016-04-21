/**
 * Created by satyajeet on 11/12/15.
 */
var Category = require('../models/category');
var express = require('express');
var router = express.Router();
var oauth2 = require('../oauth/oauth2');
var categoryService = require('../service/categoryService');
var userService = require('../service/userService');
var utilService = require('../service/utilService');
var async = require('async');


/* Get All Categories. */
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
        categoryService.all(utilService.generalSyncCallback, context);
    }];

    async.series(actionArray);
});
module.exports = router;
